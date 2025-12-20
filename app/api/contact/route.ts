import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

interface ContactFormData {
  fullName: string
  email: string
  subject: string
  turnstileToken: string
}

interface ValidationErrors {
  [key: string]: string
}

// Validation function
function validateContactForm(data: ContactFormData): ValidationErrors {
  const errors: ValidationErrors = {}

  // Validate fullName
  if (!data.fullName || typeof data.fullName !== "string") {
    errors.fullName = "A név megadása kötelező."
  } else {
    const trimmedName = data.fullName.trim()

    if (trimmedName.length < 3) {
      errors.fullName = "A névnek legalább 3 karakter hosszúnak kell lennie."
    } else if (trimmedName.length > 128) {
      errors.fullName = "A név maximum 128 karakter lehet."
    } else if (!trimmedName.includes(" ")) {
      errors.fullName = "Kérjük, adja meg a teljes nevét (vezetéknév és keresztnév)."
    } else if (/\d/.test(trimmedName)) {
      errors.fullName = "A név nem tartalmazhat számokat."
    } else if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/.test(trimmedName)) {
      errors.fullName = "A név csak betűket és szóközöket tartalmazhat."
    }
  }

  // Validate email
  if (!data.email || typeof data.email !== "string") {
    errors.email = "Az email cím megadása kötelező."
  } else {
    const trimmedEmail = data.email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(trimmedEmail)) {
      errors.email = "Érvénytelen email cím formátum."
    }
  }

  // Validate subject
  if (!data.subject || typeof data.subject !== "string") {
    errors.subject = "Az üzenet megadása kötelező."
  } else {
    const trimmedSubject = data.subject.trim()

    if (trimmedSubject.length < 3) {
      errors.subject = "Az üzenetnek legalább 3 karakter hosszúnak kell lennie."
    } else if (trimmedSubject.length > 3000) {
      errors.subject = "Az üzenet maximum 3000 karakter lehet."
    } else {
      // Check for malicious content
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i, // event handlers like onclick=
        /<iframe/i,
        /eval\(/i,
        /expression\(/i,
      ]

      if (dangerousPatterns.some((pattern) => pattern.test(trimmedSubject))) {
        errors.subject = "Az üzenet nem megengedett tartalmat tartalmaz."
      }
    }
  }

  // Validate turnstileToken
  if (!data.turnstileToken || typeof data.turnstileToken !== "string") {
    errors.turnstileToken = "A captcha token hiányzik."
  }

  return errors
}

// Verify Cloudflare Turnstile token
async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.error("[v0] TURNSTILE_SECRET_KEY is not configured")
    return false
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })

    const data = await response.json()
    console.log("[v0] Turnstile verify response:", data)
    return data.success === true
  } catch (error) {
    console.error("[v0] Turnstile verification error:", error)
    return false
  }
}

// Sanitize text for HTML email
function sanitizeForHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>")
}

// Send email via Zoho SMTP
async function sendEmail(data: ContactFormData): Promise<void> {
  const { fullName, email, subject } = data

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST,
    port: Number.parseInt(process.env.ZOHO_SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.ZOHO_SMTP_USER,
      pass: process.env.ZOHO_SMTP_PASS,
    },
  })

  const submissionDate = new Date()
  const isoDate = submissionDate.toISOString()
  const localDate = submissionDate.toLocaleString("hu-HU", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  // Create HTML email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #f4f4f4;
          padding: 12px;
          text-align: left;
          border: 1px solid #ddd;
        }
        td {
          padding: 12px;
          border: 1px solid #ddd;
        }
        .header {
          background-color: #4A453F;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .message-content {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Új üzenet érkezett a weboldalról</h1>
        </div>
        <table>
          <tr>
            <th>Név</th>
            <td>${sanitizeForHtml(fullName.trim())}</td>
          </tr>
          <tr>
            <th>Email cím</th>
            <td><a href="mailto:${email.trim()}">${sanitizeForHtml(email.trim())}</a></td>
          </tr>
          <tr>
            <th>Beküldés dátuma</th>
            <td>${sanitizeForHtml(localDate)}<br></td>
          </tr>
        </table>
        <h3>Üzenet:</h3>
        <div class="message-content">
          ${sanitizeForHtml(subject.trim())}
        </div>
      </div>
    </body>
    </html>
  `

  // Send email
  await transporter.sendMail({
    from: process.env.ZOHO_FROM_EMAIL,
    to: "tucsi@woollydesign.hu",
    subject: `Új kapcsolatfelvétel - ${fullName.trim()}`,
    html: htmlContent,
    replyTo: email.trim(),
  })
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ContactFormData = await request.json()

    // Validate form data
    const validationErrors = validateContactForm(body)

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors: validationErrors,
        },
        { status: 400, headers: corsHeaders },
      )
    }

    // Verify Turnstile CAPTCHA
    const isCaptchaValid = await verifyTurnstile(body.turnstileToken)

    if (!isCaptchaValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Captcha ellenőrzés sikertelen.",
        },
        { status: 403, headers: corsHeaders },
      )
    }

    // Send email
    await sendEmail(body)

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Üzenet sikeresen elküldve.",
      },
      { status: 200, headers: corsHeaders },
    )
  } catch (error) {
    console.error("[v0] Contact form error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Szerver hiba történt.",
      },
      { status: 500, headers: corsHeaders },
    )
  }
}

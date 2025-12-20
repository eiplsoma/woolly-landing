"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ChevronDown, Hand, Leaf, Sparkles, X, MapPin, Users, Award, Package, Mail, Facebook } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import dynamic from 'next/dynamic'

const GallerySection = dynamic(() => import('@/components/gallery-section'), {
  ssr: false,
  loading: () => <div className="py-16">Loading gallery…</div>,
})
import Image from "next/image"

import { getTurnstileSiteKey } from "./actions/get-turnstile-key"

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [parallaxOffset, setParallaxOffset] = useState(0)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    privacy: false,
  })

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    message: "",
    privacy: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const [turnstileToken, setTurnstileToken] = useState<string>("")
  const [turnstileError, setTurnstileError] = useState<string>("")
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string>("")
  const [turnstileShouldLoad, setTurnstileShouldLoad] = useState(false)
  const turnstileWidgetId = useRef<string | null>(null)

  const validateField = (name: string, value: string | boolean): string => {
    if (name === "name") {
      const nameValue = value as string
      if (!nameValue.trim()) return "A név megadása kötelező"
      if (nameValue.length < 3) return "A név legalább 3 karakter hosszú legyen"
      if (nameValue.length > 128) return "A név maximum 128 karakter lehet"
      if (!/\s/.test(nameValue)) return "A névnek tartalmaznia kell legalább egy szóközt"
      if (/\d/.test(nameValue)) return "A név nem tartalmazhat számokat"
      if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/.test(nameValue)) return "A név csak betűket és szóközöket tartalmazhat"
      return ""
    }

    if (name === "email") {
      const emailValue = value as string
      if (!emailValue.trim()) return "Az e-mail cím megadása kötelező"
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) return "Érvénytelen e-mail formátum"
      return ""
    }

    if (name === "message") {
      const messageValue = value as string
      if (!messageValue.trim()) return "Az üzenet megadása kötelező"
      if (messageValue.length < 3) return "Az üzenet legalább 3 karakter hosszú legyen"
      if (messageValue.length > 3000) return "Az üzenet maximum 3000 karakter lehet"
      return ""
    }

    if (name === "privacy") {
      if (!value) return "Az adatvédelmi nyilatkozat elfogadása kötelező"
      return ""
    }

    return ""
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    isValidEmail(formData.email) &&
    formData.privacy &&
    turnstileToken !== ""

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Clear field error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    // Clear global error
    if (submitError) {
      setSubmitError("")
    }
  }

  useEffect(() => {
    // Always fetch the site key early (it's lightweight), but don't load the external script
    getTurnstileSiteKey().then((key) => {
      setTurnstileSiteKey(key)
    })

    // Observe the contact section and load Turnstile when it's near viewport
    if (typeof window !== 'undefined') {
      const contactEl = document.getElementById('contact')
      if (contactEl) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setTurnstileShouldLoad(true)
              observer.disconnect()
            }
          },
          { rootMargin: '300px' },
        )
        observer.observe(contactEl)
      }
    }
  }, [])

  useEffect(() => {
    // Only load the external Turnstile script when we decided to (visible or user interaction)
    if (!turnstileSiteKey || !turnstileShouldLoad) return

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (window.turnstile && document.getElementById('turnstile-widget')) {
        turnstileWidgetId.current = window.turnstile.render('#turnstile-widget', {
          sitekey: turnstileSiteKey,
          callback: (token: string) => {
            setTurnstileToken(token)
            setTurnstileError('')
          },
          'error-callback': () => {
            setTurnstileError('A CAPTCHA ellenőrzése sikertelen. Kérlek, próbáld újra.')
            setTurnstileToken('')
          },
          'expired-callback': () => {
            setTurnstileToken('')
          },
        })
      }
    }

    return () => {
      script.remove()
      if (window.turnstile && turnstileWidgetId.current) {
        window.turnstile.remove(turnstileWidgetId.current)
      }
    }
  }, [turnstileSiteKey, turnstileShouldLoad])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!turnstileToken) {
      setTurnstileError("Kérlek, igazold, hogy nem vagy robot.")
      return
    }

    // Validate all fields
    const errors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      message: validateField("message", formData.message),
      privacy: validateField("privacy", formData.privacy),
    }

    setFieldErrors(errors)

    // Check if there are any errors
    if (Object.values(errors).some((error) => error !== "")) {
      return
    }

    setIsSubmitting(true)
    setSubmitError("")
    setSubmitSuccess(false)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          subject: formData.message,
          turnstileToken: turnstileToken, // Use real token
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitSuccess(true)
        setFormData({
          name: "",
          email: "",
          message: "",
          privacy: false,
        })
        setFieldErrors({
          name: "",
          email: "",
          message: "",
          privacy: "",
        })
        setTurnstileToken("")
        setTurnstileError("")
        if (window.turnstile && turnstileWidgetId.current) {
          window.turnstile.reset(turnstileWidgetId.current)
        }
      } else {
        if (window.turnstile && turnstileWidgetId.current) {
          window.turnstile.reset(turnstileWidgetId.current)
        }
        setTurnstileToken("")

        // Handle validation errors from backend
        if (data.errors) {
          const backendErrors = {
            name: data.errors.fullName || "",
            email: data.errors.email || "",
            message: data.errors.subject || "",
            privacy: "",
          }
          setFieldErrors(backendErrors)
        } else {
          setSubmitError(data.error || "Hiba történt az üzenet küldése során. Kérlek, próbáld újra később.")
        }
      }
    } catch (error) {
      if (window.turnstile && turnstileWidgetId.current) {
        window.turnstile.reset(turnstileWidgetId.current)
      }
      setTurnstileToken("")
      setSubmitError("Hiba történt az üzenet küldése során. Kérlek, próbáld újra később.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Utility: scroll to an element by id
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Utility: scroll down by one viewport height
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    })
  }

  return (
    <>
      {/* Hero Section */}
      <div className="pb-16 md:pb-12 lg:pb-0 bg-[#F6F3EF] flex items-center relative overflow-hidden px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto relative max-w-7xl">
          <div className="mb-12 md:mb-16 lg:mb-20">
            <Image
              src="/images/logo.png"
              alt="Woolly Design logo"
              width={200}
              height={60}
              priority
              className="w-40 md:w-48 lg:w-56 mt-10 h-auto max-w-full"
            />
          </div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 md:gap-12 lg:gap-16 items-center lg:items-start">
            {/* Left Content */}
            <div className="space-y-8 md:space-y-10 text-center lg:text-left">
              <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-[#6B655E] leading-tight text-balance max-w-full">
                Gyapjúból született történetek
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-[#4A453F] leading-relaxed max-w-2xl mx-auto lg:mx-0 text-pretty">
                Kézzel készített angyalkák, tündérek és egyedi babák, amelyek meleget, érzelmet és egy csipet
                varázslatot visznek az otthonodba.
              </p>

              <div className="pt-4 sm:pt-6 md:pt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="cursor-pointer rounded-full px-6 sm:px-10 py-4 sm:py-7 bg-[#D4C2A1] hover:bg-[#C1AE8F] text-[#4A453F] shadow-sm hover:shadow-md"
                  onClick={() => scrollToSection("featured-products")}
                >
                  Munkáim megtekintése
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer rounded-full px-6 sm:px-10 py-4 sm:py-7 border border-[#D4C2A1]/30 hover:border-[#D4C2A1] text-[#4A453F] bg-transparent"
                  onClick={() => scrollToSection("workshop")}
                >
                  Workshopok érdekelnek
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative order-first lg:order-last max-w-full">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-16 md:mb-24 max-w-md mx-auto lg:mx-0">
                <Image
                  src="/images/woolly-angels.png"
                  alt="Kézzel készített gyapjú angyalkák"
                  width={500}
                  height={500}
                  priority
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 40vw"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="hidden sm:block absolute -bottom-6 -right-6 w-32 h-32 bg-[#D4C2A1]/20 rounded-full blur-3xl -z-10" />
              <div className="hidden sm:block absolute -top-6 -left-6 w-40 h-40 bg-[#C1AE8F]/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-4 md:bottom-3 lg:bottom-2 left-1/2 -translate-x-1/2 z-20 text-[#6B655E] animate-bounce cursor-pointer hover:text-[#4A453F] transition-colors"
          aria-label="Scroll down"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </div>

      <AboutSection />
      <GallerySection />
      <FeaturedProductsSection />
      <WorkshopSection />
      <FAQSection />

      {/* Section 7 – Large CTA with background image */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden bg-center bg-cover bg-no-repeat">
        {/* Use next/image for the CTA background so it can be prioritized and optimized */}
        <Image
          src="/images/CTA.jpg"
          alt="CTA background"
          fill
          priority
          className="absolute inset-0 -z-10 object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/[0.58] z-10 pointer-events-none backdrop-blur-xs" />

        {/* Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-10">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight text-balance">
            Készen állsz arra,
            <br />
            hogy megszülessen
            <br />a{" "}
            <span className="cursor-pointer lg:blur-sm hover:blur-none inline-block bg-gradient-to-r from-[#D4C2A1] to-[#EFE8DE] text-[#111] font-black px-2 sm:px-3 py-1 rounded-lg rotate-[-2deg]">
              <span className="bg-gradient-to-r from-[#000] via-[#111] to-[#444] inline-block text-transparent bg-clip-text">
                {" "}
                saját
              </span>
            </span>{" "}
            alkotásod?
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto px-2">
            Egyedi alkotás vagy közös élmény, a döntés a tiéd.
          </p>

          <div className="pt-4 sm:pt-6">
            <button
              className="inline-flex items-center cursor-pointer justify-center rounded-full bg-[#D4C2A1] px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-semibold text-[#4A453F] transition-all duration-300 hover:bg-[#C1AE8F] hover:scale-105 hover:shadow-xl w-full sm:w-auto max-w-sm"
              onClick={() => scrollToSection("contact")}
            >
              Vágjunk bele!
            </button>
          </div>
        </div>
      </section>

      {/* Section 8 – Contact */}
      <section id="contact" className="bg-[#F6F3EF] py-16 md:py-20 lg:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          {/* Section title and intro */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#6B655E] mb-4 md:mb-6">
              Lépj velem kapcsolatba!
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#4A453F] max-w-2xl mx-auto px-2">
              Ha kérdésed van, egyedi elképzelésed, vagy workshop iránt érdeklődsz, írj bátran. Szívesen válaszolok.
            </p>
          </div>

          {/* Two-column layout */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {/* Right side – Contact form */}
            <div className="order-2 md:order-1">
              {submitSuccess && (
                <div
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm sm:text-base"
                  role="alert"
                  aria-live="polite"
                >
                  Köszönöm! Az üzeneted sikeresen elküldésre került.
                </div>
              )}

              <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Neved"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => setTurnstileShouldLoad(true)}
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border rounded-xl text-[#4A453F] placeholder:text-[#6B655E]/60 focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                      fieldErrors.name
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-[#D4C2A1]/30 focus:border-[#D4C2A1] focus:ring-[#D4C2A1]/20"
                    }`}
                    disabled={submitSuccess}
                  />
                  {fieldErrors.name && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="E-mail címed"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setTurnstileShouldLoad(true)}
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border rounded-xl text-[#4A453F] placeholder:text-[#6B655E]/60 focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                      fieldErrors.email
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-[#D4C2A1]/30 focus:border-[#D4C2A1] focus:ring-[#D4C2A1]/20"
                    }`}
                    disabled={submitSuccess}
                  />
                  {fieldErrors.email && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <textarea
                    name="message"
                    placeholder="Írd le röviden, miben segíthetek"
                    value={formData.message}
                    onChange={handleInputChange}
                    onFocus={() => setTurnstileShouldLoad(true)}
                    rows={5}
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border rounded-xl text-[#4A453F] placeholder:text-[#6B655E]/60 focus:outline-none focus:ring-2 transition-all resize-none text-sm sm:text-base ${
                      fieldErrors.message
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-[#D4C2A1]/30 focus:border-[#D4C2A1] focus:ring-[#D4C2A1]/20"
                    }`}
                    disabled={submitSuccess}
                  />
                  {fieldErrors.message && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                <div>
                  <div id="turnstile-widget" className="flex justify-center" />
                  {turnstileError && (
                    <p className="mt-2 text-sm text-red-600 text-center" role="alert">
                      {turnstileError}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      name="privacy"
                      checked={formData.privacy}
                      onChange={handleInputChange}
                      className="mt-1 rounded border-[#D4C2A1]/50 text-[#D4C2A1] focus:ring-[#D4C2A1]/20 cursor-pointer w-4 h-4 flex-shrink-0"
                      disabled={submitSuccess}
                    />
                    <label htmlFor="privacy" className="text-xs sm:text-sm text-[#6B655E] select-none">
                      Elfogadom az{" "}
                      <a
                        href="/adatvedelmi-nyilatkozat"
                        className="underline hover:text-[#A67C52] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        adatvédelmi nyilatkozatot
                      </a>
                    </label>
                  </div>
                  {fieldErrors.privacy && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {fieldErrors.privacy}
                    </p>
                  )}
                </div>

                {submitError && (
                  <div
                    className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm sm:text-base"
                    role="alert"
                    aria-live="assertive"
                  >
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isFormValid || submitSuccess}
                  className={`w-full px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-full transition-all duration-300 text-sm sm:text-base ${
                    isFormValid && !submitSuccess
                      ? "bg-[#D4C2A1] text-[#4A453F] hover:bg-[#C1AE8F] hover:shadow-lg cursor-pointer"
                      : "bg-[#D4C2A1]/40 text-[#4A453F]/50 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "Küldés folyamatban..." : "Üzenet küldése"}
                </button>
              </form>
            </div>

            {/* Left side – Alternative contact options */}
            <div className="space-y-4 sm:space-y-6 order-1 md:order-2">
              <h3 className="font-display text-lg sm:text-xl font-semibold text-[#4A453F] mb-4 sm:mb-6">
                Vagy írj közvetlenül:
              </h3>

              <a
                href="mailto:tucsi@woollydesign.hu"
                className="block p-4 sm:p-6 bg-white rounded-2xl border border-[#D4C2A1]/30 hover:border-[#D4C2A1] hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-[#F6F3EF] rounded-full group-hover:bg-[#D4C2A1]/20 transition-colors flex-shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B655E]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[#4A453F] mb-1 text-sm sm:text-base">E-mail</div>
                    <div className="text-[#6B655E] text-xs sm:text-sm break-all">tucsi@woollydesign.hu</div>
                  </div>
                </div>
              </a>

              <a
                href="https://www.facebook.com/WoollyDesignByTucsi"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 sm:p-6 bg-white rounded-2xl border border-[#D4C2A1]/30 hover:border-[#D4C2A1] hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-[#F6F3EF] rounded-full group-hover:bg-[#D4C2A1]/20 transition-colors flex-shrink-0">
                    <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B655E]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#4A453F] mb-1 text-sm sm:text-base">Facebook</div>
                    <div className="text-[#6B655E] text-xs sm:text-sm">Woolly Design</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9 – Footer */}
      <footer className="bg-[#EFE8DE] py-10 md:py-12 lg:py-16 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Brand line */}
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="font-display text-xl sm:text-2xl md:text-4xl text-[#4A453F] mb-2 py-0 font-black">
              Woolly Design
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-[#6B655E]">
              Kézzel készült gyapjú alkotások Tücsi műhelyéből
            </p>
          </div>

          {/* Navigation and social */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
            <a
              href="/impresszum"
              className="text-[#4A453F] hover:text-[#6B655E] transition-colors text-xs sm:text-sm md:text-base"
            >
              Impresszum
            </a>

            <a
              href="/adatvedelmi-nyilatkozat"
              className="text-[#4A453F] hover:text-[#6B655E] transition-colors text-xs sm:text-sm md:text-base"
            >
              Adatvédelmi nyilatkozat
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs md:text-sm text-[#6B655E]">© Woolly Design 2025 – minden jog fenntartva</p>
          </div>
        </div>
      </footer>
    </>
  )
}

function AboutSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="bg-[#EFE8DE] py-16 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-12 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
          {/* Left: Visual Content */}
          <div
            className={`space-y-4 sm:space-y-6 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/winter-gnome.png"
                  alt="Gyapjú tündér rózsaszín árnyalatokban"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/pink-angel.png"
                  alt="Téli gyapjú manó kék-fehér ruhában"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right: Text Content */}
          <div
            className={`space-y-4 sm:space-y-6 transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#6B655E] text-balance">
              Egy kis varázslat minden darabban
            </h2>

            <p className="text-lg sm:text-xl md:text-2xl text-[#6B655E] font-medium leading-relaxed text-pretty">
              Itt a fantázia puha formát ölt.
            </p>

            <p className="text-sm sm:text-base md:text-lg text-[#4A453F] leading-relaxed text-pretty">
              Tücsi vagyok, a Woolly Design megálmodója, ahol a gyapjúból készült figurák történeteket és érzéseket
              hordoznak. Angyalkákat, tündéreket és egyedi hasonmás babákat készítek, minden darabot kézzel, nagy
              gondossággal formálva. Hiszem, hogy ezek az alkotások nem csupán dekorációk, hanem szeretettel teli
              emlékek, amelyek otthonra találnak.
            </p>

            {/* Icons */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8">
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6B655E]/10 flex items-center justify-center">
                  <Hand className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B655E]" />
                </div>
                <p className="text-xs sm:text-sm text-[#4A453F] font-medium">Kézzel készítve</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6B655E]/10 flex items-center justify-center">
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B655E]" />
                </div>
                <p className="text-xs sm:text-sm text-[#4A453F] font-medium">Természetes anyagok</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6B655E]/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B655E]" />
                </div>
                <p className="text-xs sm:text-sm text-[#4A453F] font-medium">Egyedi alkotások</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// GallerySection is lazy-loaded from `components/gallery-section.tsx` to reduce initial JS on mobile.

function FeaturedProductsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  const products = [
    {
      id: 1,
      cardImage: "/images/top1.jpg",
      modalImage: "/images/top1-modal.jpg",
      cardTitle: "Óarany selyem angyal és díszgömb szett",
      name: "Óarany selyem angyal és díszgömb szett",
      description: "Mindkettő függeszthető.",
      sizes: ["Angyalka magassága: 16 cm", "Gömb átmérője: 7 cm", "Teljes hossz szalagokkal: 25 cm"],
      materials: "Gyapjú, drót, hernyóselyem, szalagok, zsinórok, üveggyöngy, polisztirol, poliészter gömb",
      price: "15 000 Ft",
      note: "Dekoráció, nem gyerekjáték.",
    },
    {
      id: 2,
      cardImage: "/images/top2.jpg",
      modalImage: "/images/top2.jpg",
      cardTitle: "Csillagon lépdelő fehér-türkíz angyal",
      name: "Csillagon lépdelő fehér-türkíz angyal",
      description: "Függeszthető, de a talpán is stabilan megáll.",
      sizes: ["14 cm magas"],
      materials: "Gyapjú, drót, fém csengő, fa talp",
      price: "5 500 Ft",
      note: "Dekoráció, nem gyerekjáték.",
    },
    {
      id: 3,
      cardImage: "/images/top3.jpg",
      modalImage: "/images/top3-modal.jpg",
      cardTitle: "Ragyogást hozó óarany selyem angyal",
      name: "Ragyogást hozó óarany selyem angyal",
      description: "Fa talpazaton, díszdobozban.",
      sizes: ["Angyalka magassága: 15,5 cm", "Doboz magassága: 26 cm", "Doboz átmérője: 13 cm"],
      materials: "Gyapjú, drót, hernyóselyem, fém csillag, zsinór, üveggyöngy, termés, glitter, fa, papírdoboz",
      price: "14 000 Ft",
      note: "Dekoráció, nem gyerekjáték.",
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="featured-products"
      className="bg-[#EFE8DE] py-16 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-12 overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#6B655E] text-balance px-2">
            A legkedveltebb alkotásaim
          </h2>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onClick={() => setSelectedProduct(index)}
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src={product.cardImage || "/placeholder.svg"}
                  alt={product.name}
                  width={300}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 transition-opacity duration-300" />

                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                  <h3 className="font-display text-lg md:text-xl font-medium text-white text-balance leading-snug">
                    {product.cardTitle}
                  </h3>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProduct(index)
                    }}
                    className="text-sm cursor-pointer text-white/90 hover:text-white underline underline-offset-2 font-medium transition-colors"
                  >
                    Továbbiak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center p-6 md:p-4 overflow-y-auto"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative bg-[#F6F3EF] rounded-2xl md:rounded-3xl
             max-w-3xl w-full
             max-h-[calc(100vh-3rem)] md:max-h-none
             overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 md:top-4 md:right-4 z-10 w-10 h-10 md:w-10 md:h-10 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-all shadow-lg"
              onClick={() => setSelectedProduct(null)}
              aria-label="Bezárás"
            >
              <X className="w-5 h-5 md:w-5 md:h-5 text-[#4A453F]" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Left: Image */}
              <div className="relative aspect-square md:aspect-auto">
                <Image
                  src={products[selectedProduct].modalImage || "/placeholder.svg"}
                  alt={products[selectedProduct].name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right: Content */}
              <div className="p-6 md:p-10 space-y-4 md:space-y-6 max-h-[50vh] md:max-h-[600px] overflow-y-auto">
                <h3 className="font-display text-xl md:text-3xl font-semibold text-[#6B653E] leading-tight text-balance pr-8">
                  {products[selectedProduct].name}
                </h3>

                <p className="text-sm md:text-base text-[#4A453F] leading-relaxed">
                  {products[selectedProduct].description}
                </p>

                <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-[#6B653F]/20">
                  <div>
                    <h4 className="font-semibold text-[#6B653F] mb-2 text-sm md:text-base">Méretek:</h4>
                    <ul className="space-y-1">
                      {products[selectedProduct].sizes.map((size, idx) => (
                        <li key={idx} className="text-xs md:text-sm text-[#4A453F]">
                          {size}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#6B653F] mb-2 text-sm md:text-base">Anyagok:</h4>
                    <p className="text-xs md:text-sm text-[#4A453F]">{products[selectedProduct].materials}</p>
                  </div>

                  {products[selectedProduct].note && (
                    <div>
                      <h4 className="font-semibold text-[#6B653F] mb-2 text-sm md:text-base">Megjegyzés:</h4>
                      <p className="text-xs md:text-sm text-[#4A453F]">{products[selectedProduct].note}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <h4 className="font-semibold text-[#6B653F] mb-2 text-sm md:text-base">Ár:</h4>
                    <p className="text-xl md:text-2xl font-display font-bold text-[#6B653F]">
                      {products[selectedProduct].price}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function WorkshopSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <section
      ref={sectionRef}
      id="workshop"
      className="bg-[#F6F3EF] py-16 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-12 overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
          {/* Left: Text Content */}
          <div
            className={`space-y-4 sm:space-y-6 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#6B655E] text-balance">
              Alkossunk együtt!
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-[#4A453F] leading-relaxed text-pretty">
              {
                "Workshopjaimon kis csoportban dolgozunk, így mindenkire jut idő és figyelem. Megmutatom a száraz nemezelés alapjait, és végigkísérlek a saját figurád megszületésének folyamatán. Nem szükséges előzetes tapasztalat, csak nyitottság és alkotókedv. A foglalkozások feltöltődést, kikapcsolódást és valódi kézzel készült élményt adnak."
              }
            </p>

            <p className="text-sm sm:text-base md:text-lg text-[#4A453F] leading-relaxed text-pretty">
              A workshop ideális program lehet:
            </p>

            <ul className="list-disc ml-5">
              <li>munkahelyi csapatépítő tréningekhez,</li>
              <li>szabadidős kikapcsolódáshoz,</li>
              <li>anya-lánya programokhoz,</li>
              <li>bárkinek, aki szeretné megismerni a különböző művészeti ágakat és nyitott az újdonságokra.</li>
            </ul>

            <div className="flex items-center gap-2 text-[#6B653F]">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base font-medium">Helyszín: Budapest</span>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-3 sm:pt-4">
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6B653F]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B653F]" />
                </div>
                <p className="text-xs sm:text-sm text-[#4A453F]">Kis létszámú csoportok</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6B653F]/10 flex items-center justify-center">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B653F]" />
                </div>
                <p className="text-xs sm:text-sm text-[#4A453F]">Minden szint</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6B653F]/10 flex items-center justify-center">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B653F]" />
                </div>
                <p className="text-xs sm:text-sm text-[#4A453F]">Minden anyag biztosítva</p>
              </div>
            </div>

            <div className="pt-3 sm:pt-4">
              <Button
                size="lg"
                className="bg-[#D4C2A1] hover:bg-[#C1AE8F] text-[#4A453F] cursor-pointer rounded-full px-6 sm:px-10 py-4 sm:py-7 text-sm sm:text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
                onClick={() => scrollToSection("contact")}
              >
                Érdekel a workshop
              </Button>
            </div>
          </div>

          {/* Right: Image */}
          <div
            className={`relative order-first lg:order-last transition-all duration-1000 delay-200 max-w-full ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/workshop.jpg"
                alt="Workshop - Gyapjúnemezelés"
                width={500}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>

            <div className="hidden sm:block absolute -bottom-6 -left-6 w-32 h-32 bg-[#D4C2A1]/20 rounded-full blur-3xl -z-10" />
            <div className="hidden sm:block absolute -top-6 -right-6 w-40 h-40 bg-[#C1AE8F]/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const faqs = [
    {
      question: "Mennyi idő alatt készül el egy egyedi alkotás?",
      answer:
        "Az elkészítési idő az aktuális megrendelések számától és az alkotás összetettségétől függ, általában 1–3 hét.",
    },
    {
      question: "Lehet egyedi elképzelés alapján rendelni?",
      answer: "Igen, szívesen készítek egyedi figurákat is. A részleteket mindig előzetesen egyeztetjük.",
    },
    {
      question: "Gyerekeknek is alkalmasak az alkotások?",
      answer: "A figurák dekorációs célra készülnek, nem minősülnek gyerekjátéknak.",
    },
    {
      question: "Workshopokon szükséges előzetes tapasztalat?",
      answer: "Nem, a foglalkozások kezdők számára is ideálisak, minden lépést együtt végigcsinálunk.",
    },
    {
      question: "Minden alapanyagot biztosítasz a workshopokon?",
      answer: "Igen, a részvételi díj tartalmazza az összes szükséges eszközt és alapanyagot.",
    },
  ]

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section ref={sectionRef} className="bg-[#EFE8DE] py-16 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-12 overflow-hidden">
      <div className="container mx-auto max-w-4xl">
        {/* Section Title */}
        <div
          className={`text-center mb-10 sm:mb-12 lg:mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#6B655E] text-balance px-2">
            Gyakran Ismételt Kérdések
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`transition-all duration-700 delay-${index * 100} ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div
                className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "bg-white shadow-lg" : "bg-white/50 hover:bg-white/70 shadow-sm hover:shadow-md"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className="font-display text-sm sm:text-base md:text-lg font-semibold text-[#4A453F] pr-3 sm:pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 md:w-6 md:h-6 text-[#6B653F] transition-transform duration-300 flex-shrink-0 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-5 md:pb-6">
                    <p className="text-xs sm:text-sm md:text-base text-[#4A453F] leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Closing text */}
        <div
          className={`mt-10 sm:mt-12 text-center transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <p className="text-sm sm:text-base text-[#6B655E] px-2">
            Ha egyéb kérdésed merülne fel, ne habozz{" "}
            <a className="underline cursor-pointer" onClick={() => scrollToSection("contact")}>
              kapcsolatba lépni
            </a>
            . Szívesen válaszolok.
          </p>
        </div>
      </div>
    </section>
  )
}

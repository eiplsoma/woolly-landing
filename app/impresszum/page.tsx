export const metadata = {
  title: "Impresszum | Woolly Design",
}

export default function ImpresszumPage() {
  return (
    <main className="bg-[#F6F3EF] min-h-screen px-4 sm:px-6 py-20 md:py-28">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#6B655E] mb-14">
          Impresszum
        </h1>

        <div className="space-y-10 text-[#4A453F] text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="font-semibold text-base sm:text-lg mb-3">
              A honlap fenntartója
            </h2>
            <p>Eipl Soma EV</p>
            <p>
              Székhely: 2060 Bicske, Kisfaludy utca 21.<br />
              3. lépcsőház, 2. emelet, 32. ajtó
            </p>
            <p>Adószám: 55490968-1-27</p>
          </section>

          <section>
            <h2 className="font-semibold text-base sm:text-lg mb-3">
              Elérhetőség
            </h2>
            <p>
              Email:{" "}
              <a
                href="mailto:soma.eipl@gmail.com"
                className="underline hover:text-[#A67C52] transition-colors"
              >
                soma.eipl@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

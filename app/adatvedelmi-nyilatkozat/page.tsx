export const metadata = {
  title: "Adatvédelmi tájékoztató | Woolly Design",
}

export default function AdatvedelmiNyilatkozatPage() {
  return (
    <main className="bg-[#F6F3EF] min-h-screen px-4 sm:px-6 py-20 md:py-28">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#6B655E] mb-14 text-center">
          Adatvédelmi tájékoztató
        </h1>

        <div className="space-y-10 text-[#4A453F] text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="font-semibold mb-3">1. Az adatkezelő adatai</h2>
            <p>Az Ön által megadott személyes adatokat kezeli:</p>
            <p>Név: Eipl Soma EV</p>
            <p>Adószám: 55490968-1-27</p>
            <p>
              Székhely:<br />
              MAGYARORSZÁG, 2060 Bicske, Kisfaludy utca 21.<br />
              3. lépcsőház, 2. emelet, 32. ajtó
            </p>
            <p>A továbbiakban: Adatkezelő.</p>
            <p>
              Az Adatkezelő elkötelezett a weboldalt felkereső személyek személyes
              adatainak védelme iránt, és biztosítja, hogy az adatkezelés minden
              esetben megfeleljen az Európai Parlament és a Tanács (EU) 2016/679
              rendeletének (GDPR), valamint a vonatkozó magyar jogszabályoknak.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-3">2. A tájékoztató hatálya</h2>
            <p>
              Jelen adatvédelmi tájékoztató az Adatkezelő által üzemeltetett
              weboldal látogatóira, valamint az oldalon keresztül kapcsolatba
              lépő természetes személyekre vonatkozik.
            </p>
            <p>
              A Tájékoztató célja, hogy közérthető módon bemutassa, milyen
              személyes adatokat kezel az Adatkezelő, milyen célból, milyen
              jogalapon, mennyi ideig, továbbá milyen jogok illetik meg az
              érintetteket.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-3">3. A kezelt személyes adatok köre</h2>
            <p>Az Adatkezelő kizárólag az alábbi személyes adatokat kezeli:</p>
            <ul className="list-disc ml-5">
              <li>teljes név</li>
              <li>e-mail cím</li>
              <li>megkeresés tárgya, üzenet tartalma</li>
            </ul>
            <p>Az Adatkezelő nem kezel különleges személyes adatokat.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-3">
              4. Az adatkezelés célja és jogalapja
            </h2>
            <p>Az adatkezelés célja:</p>
            <ul className="list-disc ml-5">
              <li>kapcsolatfelvétel biztosítása</li>
              <li>beérkező megkeresések megválaszolása</li>
              <li>üzleti kommunikáció lebonyolítása</li>
            </ul>
            <p>Az adatkezelés jogalapja:</p>
            <ul className="list-disc ml-5">
              <li>
                az érintett önkéntes hozzájárulása (GDPR 6. cikk (1) bekezdés a)
                pont)
              </li>
            </ul>
            <p>
              A hozzájárulás az adatok megadásával és az üzenet elküldésével
              történik.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-3">5. Az adatkezelés időtartama</h2>
            <p>
              Az Adatkezelő a személyes adatokat kizárólag addig kezeli, amíg az
              a megkeresés megválaszolásához szükséges, illetve legfeljebb a
              kapcsolat lezárását követő 12 hónapig, kivéve, ha jogszabály ennél
              hosszabb megőrzési időt ír elő.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-3">
              6. Adatfeldolgozók és adattárolás
            </h2>

            <p className="font-medium mt-2">
              6.1. Tárhelyszolgáltató (adatfeldolgozó)
            </p>
            <p>Cégnév: Vercel Inc.</p>
            <p>Székhely: 440 N Barranca Ave #4133, Covina, CA 49723, United States</p>
            <p>Weboldal: https://vercel.com</p>
            <p>E-mail: privacy@vercel.com</p>
            <p>Szerep: adatfeldolgozó</p>

            <p className="font-medium mt-4">6.2. Adattárolás helye</p>
            <p>Cégnév: Zoho Corporation</p>
            <p>Székhely: 4141 Haccienda Drive, Pleasanton, CA 94588, United States</p>
            <p>Weboldal: https://www.zoho.com</p>
            <p>E-mail: privacy@zohocorp.com</p>

            <p>
              Az Adatkezelő biztosítja, hogy az adatfeldolgozók megfelelő
              adatvédelmi garanciákat alkalmazzanak.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-3">7. Adattovábbítás</h2>
            <p>
              Az Adatkezelő személyes adatokat harmadik fél részére nem továbbít,
              kivéve jogszabályon alapuló kötelezettség esetén, hatósági
              megkeresésre.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-3">8. Sütik (cookie-k) kezelése</h2>
            <p>
              Az Adatkezelő weboldala kizárólag a weboldal biztonságos és megfelelő
              működéséhez szükséges, technikai jellegű sütiket használ.
            </p>
            <p>
              A weboldal üzemeltetése során a tárhelyszolgáltató és hálózati
              védelmi szolgáltató, a Cloudflare Inc., technikai jellegű sütiket
              helyezhet el a látogatók eszközén.
            </p>
            <p>
              Ezek a sütik nem marketing célúak, nem szolgálnak statisztikai vagy
              analitikai adatgyűjtést, és nem alkalmasak a látogatók személy
              szerinti azonosítására.
            </p>

            <p className="font-medium mt-4">
              8.1. Cloudflare által használt szükséges sütik
            </p>
            <ul className="list-disc ml-5">
              <li>
                <strong>__cf_bm</strong> – botvédelem és automatizált visszaélések
                felismerése
              </li>
              <li>
                <strong>_cfuvid</strong> – munkamenetek megkülönböztetése
                biztonsági célból
              </li>
              <li>
                <strong>CF_VERIFIED_DEVICE_ID</strong> – eszközazonosítás
                biztonsági és csalásmegelőzési célból
              </li>
            </ul>
            <p>
              A Cloudflare sütikről további információ:
              <br />
              https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/
            </p>

            <p className="font-medium mt-4">
              8.2. Cookie-kezelési döntések tárolása
            </p>
            <p>
              A weboldal a látogatók sütihozzájárulással kapcsolatos döntéseit a
              böngésző localStorage tárhelyén tárolja, nem hagyományos sütik
              formájában.
            </p>

            <p className="font-medium mt-4">8.3. Nem alkalmazott sütik</p>
            <ul className="list-disc ml-5">
              <li>marketing célú sütik</li>
              <li>statisztikai vagy analitikai sütik</li>
              <li>hirdetési vagy remarketing sütik</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold mb-3">9. Az érintettek jogai</h2>
            <ul className="list-disc ml-5">
              <li>tájékoztatáshoz való jog</li>
              <li>hozzáféréshez való jog</li>
              <li>helyesbítéshez való jog</li>
              <li>törléshez való jog</li>
              <li>adatkezelés korlátozásához való jog</li>
              <li>adathordozhatósághoz való jog</li>
              <li>hozzájárulás visszavonásának joga</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold mb-3">10. Jogorvoslati lehetőségek</h2>
            <p>
              Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)
              <br />
              Székhely: 1125 Budapest, Szilágyi Erzsébet fasor 22/c
              <br />
              Telefon: 06-1-391-1400
              <br />
              E-mail: ugyfelszolgalat@naih.hu
              <br />
              Weboldal: https://www.naih.hu
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-3">11. Záró rendelkezések</h2>
            <p>
              Az Adatkezelő fenntartja a jogot jelen adatvédelmi tájékoztató
              módosítására. Az aktuális verzió minden esetben a weboldalon kerül
              közzétételre.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

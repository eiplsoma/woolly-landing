'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export default function GallerySection() {
  const [isVisible, setIsVisible] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  const galleryImages = [
    { src: '/images/gallery-1.jpg', alt: 'Angyal arany csillagfüzérrel' },
    { src: '/images/gallery-2.jpg', alt: 'Angyal csillogó karácsonyfán' },
    { src: '/images/gallery-3.jpg', alt: 'Két fehér angyal karácsonyi fényekkel' },
    { src: '/images/gallery-4.jpg', alt: 'Angyalkák virágkoszorúval' },
    { src: '/images/gallery-5.jpg', alt: 'Fehér gyapjú angyal arany díszítéssel' },
    { src: '/images/gallery-6.jpg', alt: 'Téli gyapjú angyal karácsonyfával' },
    { src: '/images/gallery-7.jpg', alt: 'Rózsaszín angyal csengettyűvel' },
    { src: '/images/gallery-8.jpg', alt: 'Vörös hajú angyal arany dísszel' },
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

    if (sectionRef.current) observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [])

  const visibleImages = showAll ? galleryImages : galleryImages.slice(0, 4)

  return (
    <section ref={sectionRef} className="bg-[#F6F3EF] py-16 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-12 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16">
          <h2
            className={`font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#6B655E] text-balance transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            A Woolly világa képekben
          </h2>
          <p
            className={`text-sm sm:text-base md:text-lg text-[#4A453F] transition-all duration-1000 delay-100 px-2 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Válogatás az elmúlt időszakban készült alkotásokból.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {(typeof window !== 'undefined' && window.innerWidth >= 1024 ? galleryImages : visibleImages).map((image, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => setSelectedImage(index)}
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src={image.src || '/placeholder.svg'}
                  alt={image.alt}
                  width={300}
                  height={400}
                  sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>

        {!showAll && (
          <div className="mt-8 sm:mt-12 text-center lg:hidden">
            <Button
              onClick={() => setShowAll(true)}
              className="bg-[#D4C2A1] hover:bg-[#C1AE8F] text-[#4A453F] rounded-full px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              További alkotások
            </Button>
          </div>
        )}
      </div>

      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors cursor-pointer z-50"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="relative max-w-[90vw] max-h-[calc(100vh-6rem)] mx-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={galleryImages[selectedImage].src || '/placeholder.svg'}
              alt={galleryImages[selectedImage].alt}
              width={800}
              height={1200}
              sizes="(max-width: 900px) 90vw, 800px"
              className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </section>
  )
}

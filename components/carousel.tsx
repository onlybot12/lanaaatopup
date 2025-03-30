"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Slide {
  id: string
  title: string
  description: string
  image: string
  link?: string
  active: boolean
}

interface CarouselProps {
  slides?: Slide[]
}

export function Carousel({ slides }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeSlides, setActiveSlides] = useState<Slide[]>([])

  useEffect(() => {
    if (slides && slides.length > 0) {
      setActiveSlides(slides.filter((slide) => slide.active))
    } else {
      setActiveSlides([
        {
          id: "1",
          image: "/placeholder.svg?height=500&width=1200",
          title: "Mobile Legends",
          description: "Top up diamond Mobile Legends dengan harga termurah",
          active: true,
        },
        {
          id: "2",
          image: "/placeholder.svg?height=500&width=1200",
          title: "Honor of Kings",
          description: "Dapatkan token Honor of Kings dengan proses instan",
          active: true,
        },
        {
          id: "3",
          image: "/placeholder.svg?height=500&width=1200",
          title: "Promo Spesial",
          description: "Diskon hingga 20% untuk semua produk game",
          active: true,
        },
      ])
    }
  }, [slides])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))
  }

  useEffect(() => {
    if (activeSlides.length <= 1) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [activeSlides.length, currentSlide])

  if (activeSlides.length === 0) return null

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-lg">
      <div className="absolute inset-0 z-10 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/30 text-white hover:bg-black/50 rounded-full"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/30 text-white hover:bg-black/50 rounded-full"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
        {activeSlides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${currentSlide === index ? "bg-primary" : "bg-white/50"}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {activeSlides.map((slide) => (
          <div key={slide.id} className="min-w-full h-full relative">
            {slide.link ? (
              <Link href={slide.link} className="block w-full h-full">
                <Image
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
                  <p className="text-sm md:text-base">{slide.description}</p>
                </div>
              </Link>
            ) : (
              <>
                <Image
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
                  <p className="text-sm md:text-base">{slide.description}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


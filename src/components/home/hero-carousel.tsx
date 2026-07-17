"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Slide {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bgImg: string;
}

const SLIDES: Slide[] = [
  {
    title: "POLOS",
    subtitle: "REGULAR | OVERSIZED",
    cta: "TAP TO EXPLORE",
    href: "/categories/polos",
    bgImg: "/images/a.png",
  },
  {
    title: "OVERSIZED T-SHIRTS",
    subtitle: "BOLD & COMFORTABLE",
    cta: "SHOP NOW",
    href: "/categories/oversized-t-shirts",
    bgImg: "/images/b.png",
  },
  {
    title: "NEW ARRIVALS",
    subtitle: "FRESH DROPS EVERY WEEK",
    cta: "EXPLORE COLLECTION",
    href: "/products",
    bgImg: "/images/c.png",
  },
  {
    title: "SNEAKERS",
    subtitle: "STREET STYLE ESSENTIALS",
    cta: "SHOP SNEAKERS",
    href: "/categories/sneakers",
    bgImg: "/images/d.png",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 8s of no interaction
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, []);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % SLIDES.length),
    []
  );

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length),
    []
  );

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isAutoPlaying]);

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="Featured promotions"
    >
      {/* Slide track */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <Link
            key={i}
            href={slide.href}
            className="relative flex min-w-full flex-col items-center justify-center bg-cover bg-center px-6 py-28 sm:py-36 md:py-44 lg:py-52"
            style={{ backgroundImage: `url('${slide.bgImg}')` }}
          >
            {/* Subtle grain overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />

            <div className="relative text-center text-white">
              <h2
                className="font-display text-5xl leading-none tracking-wider sm:text-6xl md:text-7xl lg:text-8xl"
                style={{
                  textShadow: "0 4px 10px rgba(0,0,0,0.6)"
                }}
              >
                {slide.title}
              </h2>
              <div
                className="mt-5 inline-block border-2 border-white/80 px-5 py-2 text-xs font-bold tracking-[0.25em] uppercase transition-colors hover:bg-white hover:text-brand-ink"
                style={{
                  textShadow: "0 4px 10px rgba(0,0,0,0.6)",
                }}
              >
                {slide.cta}
              </div>

              <p
                className="mt-4 text-sm tracking-[0.3em] text-white/70"
                style={{
                  textShadow: "0 4px 10px rgba(0,0,0,0.6)",
                }}
              >
                {slide.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => {
          prev();
          goTo((current - 1 + SLIDES.length) % SLIDES.length);
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2.5 backdrop-blur-sm transition-all hover:bg-black/40 sm:left-5"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>
      <button
        onClick={() => {
          next();
          goTo((current + 1) % SLIDES.length);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2.5 backdrop-blur-sm transition-all hover:bg-black/40 sm:right-5"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 text-white" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all duration-300",
              i === current
                ? "w-6 bg-white"
                : "bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current}
          />
        ))}
      </div>
    </section>
  );
}

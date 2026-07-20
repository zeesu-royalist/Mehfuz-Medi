"use client";

import { useEffect, useRef } from "react";
import { RotateCcw, Truck, BadgePercent } from "lucide-react";

const PERKS = [
  {
    icon: BadgePercent,
    title: "10% Cashback",
    subtitle: "on all App orders",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPBS_LvlMQNvo_C-l0rUxoVnS5A9easPy3yj0puMS6r2YRtYpduUXfiDIz&s=10",
  },
  {
    icon: RotateCcw,
    title: "30 days Easy Returns",
    subtitle: "& Exchanges",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwmITrg0gUDXGkjf7VS558_F1BaSW33Labw5O84UB7994Gvek3owXtWYBx&s=10",
  },
  {
    icon: Truck,
    title: "Free &",
    subtitle: "Fast Shipping",
    image:
      "https://img.freepik.com/premium-photo/big-choice-young-guy-modern-store-with-new-clothes-elegant-expensive-wear-men_146671-48496.jpg",
  },
] as const;

const LOOP_PERKS = [...PERKS, ...PERKS];

export function PerksStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const directionRef = useRef<1 | -1>(1);
  const rafRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const speed = 0.6;

    const animate = () => {
      const track = trackRef.current;
      if (track) {
        const singleSetWidth = track.scrollWidth / 2;

        offsetRef.current += speed * directionRef.current;

        if (offsetRef.current >= singleSetWidth) {
          offsetRef.current -= singleSetWidth;
        } else if (offsetRef.current <= 0) {
          offsetRef.current += singleSetWidth;
        }

        track.style.transform = `translateX(${-offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    offsetRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollYRef.current) {
        directionRef.current = -1;
      } else if (currentY < lastScrollYRef.current) {
        directionRef.current = 1;
      }
      lastScrollYRef.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="bg-[#F8FAF8] py-8 md:py-10 overflow-hidden w-full" aria-label="Shopping perks">
      <div className="w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-4 will-change-transform px-4"
          style={{ width: "max-content" }}
        >
          {LOOP_PERKS.map((perk, i) => (
            <div
              key={`${perk.title}-${i}`}
              className="
                group
                relative
                flex items-center gap-4
                overflow-hidden
                rounded-2xl
                border border-white/10
                px-4 py-5
                sm:px-5 sm:py-6
                w-[260px] sm:w-[300px] md:w-[340px]
                shrink-0
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl hover:shadow-black/20
              "
            >
              {/* Background Image - ab pura visible, koi white overlay nahi */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${perk.image})` }}
                aria-hidden="true"
              />

              {/* Dark scrim - sirf itna ki text readable rahe, image clearly dikhe */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10"
                aria-hidden="true"
              />

              {/* Accent Line */}
              <span className="absolute left-0 top-0 z-10 h-full w-1 scale-y-0 rounded-full bg-brand-primary transition-transform duration-300 group-hover:scale-y-100" />

              {/* Icon */}
              <div
                className="
                  relative z-10
                  flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center
                  rounded-xl
                  bg-white/15
                  backdrop-blur-sm
                  text-white
                  transition-all duration-300
                  group-hover:bg-brand-primary
                "
              >
                <perk.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.7} />
              </div>

              {/* Content */}
              <div className="relative z-10 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold tracking-tight text-white drop-shadow-sm">
                  {perk.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm leading-6 text-white/85 drop-shadow-sm">
                  {perk.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
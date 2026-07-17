import { RotateCcw, Truck, BadgePercent } from "lucide-react";

const PERKS = [
  {
    icon: BadgePercent,
    title: "10% Cashback",
    subtitle: "on all App orders",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPBS_LvlMQNvo_C-l0rUxoVnS5A9easPy3yj0puMS6r2YRtYpduUXfiDIz&s=10",
  },
  {
    icon: RotateCcw,
    title: "30 days Easy Returns",
    subtitle: "& Exchanges",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwmITrg0gUDXGkjf7VS558_F1BaSW33Labw5O84UB7994Gvek3owXtWYBx&s=10",
  },
  {
    icon: Truck,
    title: "Free &",
    subtitle: "Fast Shipping",
    image: "https://img.freepik.com/premium-photo/big-choice-young-guy-modern-store-with-new-clothes-elegant-expensive-wear-men_146671-48496.jpg",
  },
] as const;

export function PerksStrip() {
  return (
    <section className="bg-[#F8FAF8] py-8 md:py-10" aria-label="Shopping perks">
      <div className="container">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="
                group
                relative
                flex items-center gap-5
                overflow-hidden
                rounded-2xl
                border border-neutral-200/80
                bg-white
                px-6 py-6
                transition-all duration-300
                hover:-translate-y-1
                hover:border-brand-primary/25
                hover:shadow-xl hover:shadow-black/5
              "
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${perk.image})` }}
                aria-hidden="true"
              />

              {/* Gradient overlay so text stays readable, image still clearly visible */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-white from-10% via-white/95 via-5% to-transparent"
                aria-hidden="true"
              />

              {/* Accent Line */}
              <span className="absolute left-0 top-0 z-10 h-full w-1 scale-y-0 rounded-full bg-brand-primary transition-transform duration-300 group-hover:scale-y-100" /> 

              {/* Icon */}
              <div
                className="
                  relative z-10
                  flex h-14 w-14 shrink-0 items-center justify-center
                  rounded-xl
                  bg-brand-primary/8
                  text-brand-primary
                  transition-all duration-300
                  group-hover:bg-brand-primary
                "
              >
                <perk.icon className="h-7 w-7" strokeWidth={1.7} />
              </div>

              {/* Content */}
              <div className="relative z-10 min-w-0">
                <h3 className="text-base font-semibold tracking-tight text-brand-ink">
                  {perk.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
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
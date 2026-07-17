export function ImageTextSection() {
  return (
    <section className="w-full bg-white px-[4vw] py-[6vw] md:py-[3vw]">
      <div
        className="mx-auto flex w-full max-w-7xl items-center"
        style={{ gap: "clamp(12px, 3vw, 40px)" }}
      >
        {/* LEFT: Image Grid (tall + 2 stacked) */}
        <div
          className="grid shrink-0"
          style={{
            width: "clamp(140px, 42%, 420px)",
            aspectRatio: "7 / 6",
            gridTemplateColumns: "1.15fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: "clamp(4px, 1.2vw, 16px)",
          }}
        >
          {/* Tall image - spans both rows */}
          <div
            className="row-span-2 overflow-hidden bg-neutral-200"
            style={{ borderRadius: "clamp(8px, 2vw, 24px)" }}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSejIf3xoHNqSJa1LyGsbPOTpUoUi1fPx_ipFfB7GoBzPVlwnNk_lKsmes&s=10"
              alt="Feature one"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Top-right image */}
          <div
            className="overflow-hidden bg-neutral-200"
            style={{ borderRadius: "clamp(8px, 2vw, 24px)" }}
          >
            <img
              src="https://i.pinimg.com/564x/24/1e/4e/241e4e2df90185e4cc3052ed40d8434c.jpg"
              alt="Feature two"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Bottom-right image */}
          <div
            className="overflow-hidden bg-neutral-200"
            style={{ borderRadius: "clamp(8px, 2vw, 24px)" }}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkQwcpR6zJRvxQ2n2nHe-pLq5-Ut4ysw2IRjgu7_KyFKQwxjmY_Sg28uQk&s=10"
              alt="Feature three"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* RIGHT: Text */}
        <div className="min-w-0 flex-1">
          <h2
            className="font-extrabold leading-tight text-black"
            style={{ fontSize: "clamp(16px, 4vw, 40px)" }}
          >
            Redefine your everyday style with premium essentials
          </h2>

          <p
            className="font-semibold text-black/50"
            style={{
              fontSize: "clamp(9px, 1.4vw, 16px)",
              marginTop: "clamp(8px, 1.5vw, 20px)",
              lineHeight: 1.6,
            }}
          >
            Discover premium fashion crafted for everyday confidence.
          </p>
        </div>
      </div>
    </section>
  );
}
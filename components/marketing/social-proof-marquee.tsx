"use client";

const names = [
  "Northstar Branding",
  "Forge Studio",
  "Vessel Co.",
  "Apex Creative",
  "Lumina Creative",
  "Morrow House",
  "Atlas Bureau",
  "Kanso Office"
];

export function SocialProofMarquee() {
  const doubled = [...names, ...names];

  return (
    <section className="bg-[var(--bg-base)] py-16 overflow-hidden">
      <div className="marquee-container">
        <div className="marquee-track flex gap-16">
          {doubled.map((name, i) => (
            <div className="flex shrink-0 items-center gap-16" key={`${name}-${i}`}>
              <p className="font-display text-[clamp(1.5rem,3vw,2.4rem)] font-normal text-[var(--ink-secondary)] whitespace-nowrap">
                {name}
              </p>
              <span className="h-px w-10 bg-[var(--border-gold-dim)]" />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-14 text-center font-eyebrow text-[var(--ink-tertiary)]">
        TRUSTED BY REFINED STUDIOS, A SAMPLE
      </p>
    </section>
  );
}

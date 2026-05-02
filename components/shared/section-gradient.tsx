export function SectionGradient({ from = "var(--bg-void)", to = "var(--bg-base)" }: { from?: string; to?: string }) {
  return (
    <div
      aria-hidden="true"
      className="h-16"
      style={{
        background: `linear-gradient(180deg, ${from}, ${to})`,
      }}
    />
  );
}

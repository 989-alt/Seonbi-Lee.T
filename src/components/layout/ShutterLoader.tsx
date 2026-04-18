export function ShutterLoader() {
  return (
    <div
      aria-hidden="true"
      className="shutter-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-[#0e0e0f] pointer-events-none"
    >
      <div className="font-[family-name:var(--font-headline)] text-primary text-2xl md:text-4xl tracking-[0.2em] uppercase pulse-text">
        SYSTEM_BOOT
      </div>
    </div>
  );
}

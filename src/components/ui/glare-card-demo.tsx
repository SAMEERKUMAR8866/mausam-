import { GlareCard } from "@/components/ui/glare-card";

export function GlareCardDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10 max-w-7xl mx-auto p-4">
      <GlareCard className="flex flex-col items-center justify-center p-6 text-center">
        <svg
          width="66"
          height="65"
          viewBox="0 0 66 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-14 w-14 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
        >
          <path
            d="M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696"
            stroke="currentColor"
            strokeWidth="12"
            strokeMiterlimit="3.86874"
            strokeLinecap="round"
          />
        </svg>
        <span className="mt-6 text-sm font-semibold tracking-wider text-slate-300 uppercase">
          Holographic Layer
        </span>
      </GlareCard>

      <GlareCard className="flex flex-col items-center justify-center relative overflow-hidden">
        <img
          className="h-full w-full absolute inset-0 object-cover"
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
          alt="Glare portrait"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <span className="absolute bottom-6 left-6 text-white font-bold text-lg drop-shadow-md">
          Cyberpunk Horizon
        </span>
      </GlareCard>

      <GlareCard className="flex flex-col items-start justify-end py-8 px-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950">
        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
          Philosophy
        </div>
        <p className="font-bold text-white text-xl leading-tight">The greatest trick</p>
        <p className="font-normal text-sm text-neutral-300 mt-3 leading-relaxed">
          The greatest trick the devil ever pulled was to convince the world
          that he didn&apos;t exist.
        </p>
      </GlareCard>
    </div>
  );
}

export default GlareCardDemo;

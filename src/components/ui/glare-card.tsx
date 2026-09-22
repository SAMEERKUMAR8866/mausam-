import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const GlareCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const isPointerInside = useRef(false);
  const refElement = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const state = useRef({
    glare: {
      x: 50,
      y: 50,
    },
    background: {
      x: 50,
      y: 50,
    },
    rotate: {
      x: 0,
      y: 0,
    },
  });

  const updateStyles = () => {
    if (refElement.current) {
      const { background, rotate, glare } = state.current;
      refElement.current.style.setProperty("--m-x", `${glare.x}%`);
      refElement.current.style.setProperty("--m-y", `${glare.y}%`);
      refElement.current.style.setProperty("--r-x", `${rotate.x}deg`);
      refElement.current.style.setProperty("--r-y", `${rotate.y}deg`);
      refElement.current.style.setProperty("--bg-x", `${background.x}%`);
      refElement.current.style.setProperty("--bg-y", `${background.y}%`);
    }
  };

  const backgroundStyle: React.CSSProperties = {
    ["--step" as string]: "5%",
    ["--foil-svg" as string]: `url("data:image/svg+xml,%3Csvg width='26' height='26' viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.99994 3.419C2.99994 3.419 21.6142 7.43646 22.7921 12.153C23.97 16.8695 3.41838 23.0306 3.41838 23.0306' stroke='white' stroke-width='5' stroke-miterlimit='3.86874' stroke-linecap='round' style='mix-blend-mode:darken'/%3E%3C/svg%3E")`,
    ["--pattern" as string]: "var(--foil-svg) center/100% no-repeat",
    ["--rainbow" as string]:
      "repeating-linear-gradient( 0deg,rgb(255,119,115) calc(var(--step) * 1),rgba(255,237,95,1) calc(var(--step) * 2),rgba(168,255,95,1) calc(var(--step) * 3),rgba(131,255,247,1) calc(var(--step) * 4),rgba(120,148,255,1) calc(var(--step) * 5),rgb(216,117,255) calc(var(--step) * 6),rgb(255,119,115) calc(var(--step) * 7) ) 0% var(--bg-y, 50%)/200% 700% no-repeat",
    ["--diagonal" as string]:
      "repeating-linear-gradient( 128deg,#0e152e 0%,hsl(180,10%,60%) 3.8%,hsl(180,10%,60%) 4.5%,hsl(180,10%,60%) 5.2%,#0e152e 10%,#0e152e 12% ) var(--bg-x, 50%) var(--bg-y, 50%)/300% no-repeat",
    ["--shade" as string]:
      "radial-gradient( farthest-corner circle at var(--m-x, 50%) var(--m-y, 50%),rgba(255,255,255,0.1) 12%,rgba(255,255,255,0.15) 20%,rgba(255,255,255,0.25) 120% ) var(--bg-x, 50%) var(--bg-y, 50%)/300% no-repeat",
    background: "var(--pattern), var(--rainbow), var(--diagonal), var(--shade)",
    backgroundBlendMode: "hue, hue, hue, overlay",
    opacity: isHovered ? 0.65 : 0,
    transition: "opacity 300ms ease",
    clipPath: "inset(0 0 1px 0 round var(--radius, 48px))",
  } as React.CSSProperties;

  return (
    <div
      ref={refElement}
      style={{
        ["--m-x" as string]: "50%",
        ["--m-y" as string]: "50%",
        ["--r-x" as string]: "0deg",
        ["--r-y" as string]: "0deg",
        ["--bg-x" as string]: "50%",
        ["--bg-y" as string]: "50%",
        ["--duration" as string]: isHovered ? "0s" : "300ms",
        ["--radius" as string]: "48px",
        perspective: "600px",
      }}
      className="relative isolate transition-transform duration-300 ease-out will-change-transform w-[320px] aspect-[17/21] cursor-pointer select-none"
      onPointerMove={(event) => {
        const rotateFactor = 0.5;
        const rect = event.currentTarget.getBoundingClientRect();
        const position = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        const percentage = {
          x: (100 / rect.width) * position.x,
          y: (100 / rect.height) * position.y,
        };
        const delta = {
          x: percentage.x - 50,
          y: percentage.y - 50,
        };

        const { background, rotate, glare } = state.current;
        background.x = 50 + percentage.x / 4 - 12.5;
        background.y = 50 + percentage.y / 3 - 16.67;
        rotate.x = -(delta.x / 3.5) * rotateFactor;
        rotate.y = (delta.y / 2) * rotateFactor;
        glare.x = percentage.x;
        glare.y = percentage.y;

        updateStyles();
      }}
      onPointerEnter={() => {
        isPointerInside.current = true;
        setIsHovered(true);
      }}
      onPointerLeave={() => {
        isPointerInside.current = false;
        setIsHovered(false);
        if (refElement.current) {
          refElement.current.style.setProperty("--r-x", "0deg");
          refElement.current.style.setProperty("--r-y", "0deg");
          refElement.current.style.setProperty("--m-x", "50%");
          refElement.current.style.setProperty("--m-y", "50%");
          refElement.current.style.setProperty("--bg-x", "50%");
          refElement.current.style.setProperty("--bg-y", "50%");
        }
      }}
    >
      <div
        style={{
          transform: "rotateY(var(--r-x, 0deg)) rotateX(var(--r-y, 0deg))",
          transformStyle: "preserve-3d",
          transition: isHovered ? "transform 0.06s ease-out" : "transform 0.4s ease-out",
          borderRadius: "var(--radius, 48px)",
        }}
        className="h-full w-full grid will-change-transform origin-center border border-slate-800/80 overflow-hidden shadow-2xl relative"
      >
        {/* Base Content Layer */}
        <div
          style={{ clipPath: "inset(0 0 0 0 round var(--radius, 48px))" }}
          className="w-full h-full grid [grid-area:1/1] mix-blend-soft-light"
        >
          <div className={cn("h-full w-full bg-slate-950", className)}>
            {children}
          </div>
        </div>

        {/* Glare Spotlight Layer */}
        <div
          style={{
            clipPath: "inset(0 0 1px 0 round var(--radius, 48px))",
            background: "radial-gradient(farthest-corner circle at var(--m-x, 50%) var(--m-y, 50%), rgba(255,255,255,0.85) 10%, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0) 80%)",
            opacity: isHovered ? 0.65 : 0,
            transition: "opacity 300ms ease",
          }}
          className="w-full h-full grid [grid-area:1/1] mix-blend-soft-light pointer-events-none will-change-transform"
        />

        {/* Rainbow Holographic Foil Layer */}
        <div
          style={backgroundStyle}
          className="w-full h-full grid [grid-area:1/1] mix-blend-color-dodge pointer-events-none relative after:content-[''] after:absolute after:inset-0 after:mix-blend-exclusion after:bg-inherit"
        />
      </div>
    </div>
  );
};

export default GlareCard;

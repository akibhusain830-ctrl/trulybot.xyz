"use client"
import { ChevronRight } from "lucide-react";

import { cn } from "./utils";
import AnimatedGradientText from "./animatedgradienttext";

export function AnimatedGradientTextDemo() {
  return (
    <div className="z-10 flex -mt-9 items-center justify-center">
      <AnimatedGradientText>
        <span
          className={cn(
            `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
          )}
        >
          AI powered
        </span>
      </AnimatedGradientText>
    </div>
  );
}
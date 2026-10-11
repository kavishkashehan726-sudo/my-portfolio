"use client";

import { AnimatePresence, motion } from "motion/react";
import { BUG_BODY, BUG_LEGS_A, pixelRuns } from "@/lib/bugSprite";

const SKIN = "#a9734c";
const SKIN_DARK = "#87583a";
const HAIR = "#1c1420";
const HOODIE = "#3d3176";
const HOODIE_DARK = "#2a2158";
const HOODIE_LIGHT = "#4c3f90";
const JEANS = "#2f3b60";
const JEANS_DARK = "#222b47";

const BUG_COLORS: Record<string, string> = {
  S: "var(--accent)",
  H: "color-mix(in srgb, var(--accent) 62%, #1a0a10)",
  K: "#1a0a10",
  E: "#ffffff",
  A: "#8a8799",
  L: "#8a8799",
};
const bugRuns = [...pixelRuns(BUG_BODY, 0), ...pixelRuns(BUG_LEGS_A, 9)];

/** A chunky letter with a solid extruded side, like a block of stone. */
function Block({ ch, x, y, rotate, size = 230 }: { ch: string; x: number; y: number; rotate: number; size?: number }) {
  const text = { fontFamily: "var(--font-sora), sans-serif", fontWeight: 700, fontSize: size } as const;
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      {Array.from({ length: 12 }, (_, i) => (
        <text key={i} x={x + i * 0.9} y={y + i * 0.9} style={{ ...text, fill: "var(--faq-side)" }}>
          {ch}
        </text>
      ))}
      <text x={x} y={y} style={{ ...text, fill: "var(--faq-face)", stroke: "var(--faq-edge)", strokeWidth: 1.5 }}>
        {ch}
      </text>
      {/* Soft sheen across the top of the face */}
      <text x={x} y={y} style={{ ...text, fill: "url(#faq-sheen)" }}>
        {ch}
      </text>
    </g>
  );
}

/**
 * Me, puzzling over a pile of giant FAQ letters with question marks floating overhead and the
 * pixel bug peeking over the Q. Opening a question makes the big red mark spin and land again.
 */
export function FaqIllustration({ open }: { open: number | null }) {
  return (
    <svg viewBox="0 0 480 536" className="faq-art h-auto w-full" role="img" aria-label="Me thinking, hand on chin, beside giant letters spelling FAQ with question marks floating above">
      <defs>
        <radialGradient id="faq-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="faq-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Backdrop glow and ground */}
      <ellipse cx="250" cy="270" rx="230" ry="210" fill="url(#faq-glow)" />
      <ellipse cx="240" cy="482" rx="215" ry="16" style={{ fill: "var(--faq-side)" }} opacity="0.55" />

      {/* Code crumbs drifting about */}
      <g className="faq-float" style={{ animationDelay: "-1s" }}>
        <rect x="18" y="150" width="52" height="26" rx="13" style={{ fill: "var(--bg-2)", stroke: "var(--line)" }} />
        <text x="44" y="168" textAnchor="middle" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fill: "var(--ink-2)" }}>
          {"</>"}
        </text>
      </g>
      <g className="faq-float" style={{ animationDelay: "-3s" }}>
        <rect x="404" y="210" width="46" height="26" rx="13" style={{ fill: "var(--bg-2)", stroke: "var(--line)" }} />
        <text x="427" y="228" textAnchor="middle" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fill: "var(--ink-2)" }}>
          {"{ }"}
        </text>
      </g>
      {[
        [96, 96, 7],
        [438, 150, 5],
        [60, 300, 4],
      ].map(([x, y, r], i) => (
        <path
          key={i}
          className="faq-twinkle"
          style={{ animationDelay: `${-i * 0.8}s`, fill: "var(--accent)" }}
          d={`M${x} ${y - r * 2}Q${x} ${y} ${x + r * 2} ${y}Q${x} ${y} ${x} ${y + r * 2}Q${x} ${y} ${x - r * 2} ${y}Q${x} ${y} ${x} ${y - r * 2}Z`}
        />
      ))}

      {/* The letters */}
      <Block ch="F" x={16} y={462} rotate={-7} size={180} />
      {/* The bug, peeking out from behind the Q */}
      <g transform="translate(384 291) scale(3)">
        <g className="faq-peek">
          {bugRuns.map((p) => (
            <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width={p.w + 0.05} height={1.05} style={{ fill: BUG_COLORS[p.c] }} />
          ))}
        </g>
      </g>
      <Block ch="Q" x={290} y={458} rotate={6} size={190} />
      <Block ch="A" x={112} y={474} rotate={0} size={200} />

      {/* Me */}
      <g transform="translate(262 0)">
        <ellipse cx="0" cy="482" rx="62" ry="8" fill="#000" opacity="0.12" />
        {/* Legs and sneakers */}
        <path d="M-34 330 L-9 330 L-13 466 L-33 466Z" fill={JEANS_DARK} />
        <path d="M-6 330 L22 330 L25 466 L4 466Z" fill={JEANS} />
        <rect x="-46" y="458" width="36" height="17" rx="8.5" fill="#f1eef7" />
        <rect x="0" y="458" width="38" height="17" rx="8.5" fill="#f1eef7" />
        <rect x="-46" y="470" width="36" height="5" rx="2.5" fill="#cfc9df" />
        <rect x="0" y="470" width="38" height="5" rx="2.5" fill="#cfc9df" />

        {/* Hoodie */}
        <path d="M-50 230 Q-48 214 -28 210 L30 210 Q48 214 51 230 L57 342 Q0 356 -57 342Z" fill={HOODIE} />
        <path d="M-32 300 L32 300 L37 332 L-37 332Z" fill={HOODIE_DARK} />
        <ellipse cx="0" cy="212" rx="30" ry="10" fill={HOODIE_DARK} />
        <path d="M-8 216 L-10 262 M8 216 L10 262" stroke="#f1eef7" strokeWidth="2.2" strokeLinecap="round" />

        {/* Arm across the body, holding up the other elbow */}
        <path d="M46 226 Q56 262 42 286 L-22 294" fill="none" stroke={HOODIE_DARK} strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M46 226 Q56 262 42 286 L-22 294" fill="none" stroke={HOODIE} strokeWidth="19" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="-28" cy="296" r="9" fill={SKIN_DARK} />

        {/* Neck, headphones resting on it */}
        <rect x="-9" y="186" width="18" height="28" fill={SKIN_DARK} />
        <path d="M-26 202 Q0 230 26 202" fill="none" stroke="#1d1a26" strokeWidth="5" />
        <rect x="-36" y="192" width="15" height="22" rx="7" style={{ fill: "var(--accent)" }} />
        <rect x="21" y="192" width="15" height="22" rx="7" style={{ fill: "var(--accent)" }} />

        {/* Head */}
        <g className="faq-think">
          <ellipse cx="-29" cy="166" rx="6" ry="9" fill={SKIN_DARK} />
          <ellipse cx="31" cy="166" rx="6" ry="9" fill={SKIN_DARK} />
          <circle cx="1" cy="162" r="30" fill={SKIN} />
          <path d="M-31 160 C-36 118 -2 116 14 124 C30 128 36 142 32 158 C26 146 14 140 2 142 C-10 142 -22 146 -31 160Z" fill={HAIR} />
          {/* Brows: one raised, thinking */}
          <path d="M-17 152 L-6 150" stroke={HAIR} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M8 146 L19 149" stroke={HAIR} strokeWidth="2.6" strokeLinecap="round" />
          {/* Glasses and eyes */}
          <g className="faq-blink">
            <circle cx="-11" cy="163" r="2.4" fill="#16121c" />
            <circle cx="13" cy="163" r="2.4" fill="#16121c" />
          </g>
          <rect x="-21" y="156" width="19" height="14" rx="4" fill="none" stroke="#16121c" strokeWidth="2" />
          <rect x="4" y="156" width="19" height="14" rx="4" fill="none" stroke="#16121c" strokeWidth="2" />
          <path d="M-2 162 L4 162" stroke="#16121c" strokeWidth="2" />
          {/* "Hmm" mouth */}
          <path d="M-3 180 Q3 177 9 181" fill="none" stroke="#5a2f22" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Thinking arm: elbow on the other hand, fingers at the chin */}
        <path d="M-46 228 Q-52 266 -24 290 L-4 200" fill="none" stroke={HOODIE_DARK} strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M-46 228 Q-52 266 -24 290 L-4 200" fill="none" stroke={HOODIE_LIGHT} strokeWidth="19" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="-3" cy="194" rx="9" ry="10" fill={SKIN} />
        <path d="M-2 186 Q5 186 6 192" fill="none" stroke={SKIN_DARK} strokeWidth="2" strokeLinecap="round" />

        {/* Question marks overhead; the big one spins in again whenever a question opens */}
        <g className="faq-float" style={{ animationDelay: "-2s" }}>
          <text x="-58" y="112" style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 700, fontSize: 34, fill: "var(--ink-2)" }} opacity="0.55">
            ?
          </text>
        </g>
        <g className="faq-float" style={{ animationDelay: "-4s" }}>
          <text x="66" y="80" style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 700, fontSize: 40, fill: "var(--ink-2)" }} opacity="0.4">
            ?
          </text>
        </g>
        <g className="faq-float">
          <AnimatePresence mode="wait">
            <motion.text
              key={open ?? "none"}
              x="28"
              y="118"
              style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 700, fontSize: 84, fill: "var(--accent)", transformBox: "fill-box", transformOrigin: "50% 80%" }}
              initial={{ scale: 0.3, rotate: -40, opacity: 0 }}
              animate={{ scale: 1, rotate: 12, opacity: 1 }}
              exit={{ scale: 0.3, rotate: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
            >
              ?
            </motion.text>
          </AnimatePresence>
        </g>
      </g>
    </svg>
  );
}

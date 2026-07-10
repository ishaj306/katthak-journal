import type { Variants, Transition } from "framer-motion";

/**
 * The motion doctrine: STILLNESS FIRST.
 *
 * Things settle, warm, and bloom — they never bounce or float. Long durations,
 * gentle ease-out, no springy overshoot except the single daily seal. Three
 * named presets so motion can never drift from screen to screen.
 */

// A calm ease-out curve — ink settling into paper.
export const EASE_SETTLE: Transition["ease"] = [0.16, 1, 0.3, 1];

/** settle — a folio arriving: fades and drifts up, unhurried. */
export const settle: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_SETTLE },
  },
};

/** reveal — a container whose children dry in one after another like ink. */
export const reveal: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** revealChild — the child of a `reveal` container. */
export const revealChild: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_SETTLE },
  },
};

/** seal — the ONE exception: a stamp pressed into the page, ink blooming. */
export const seal: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 18,
};

/** warm — a card warming on hover (no lift, no scale). Use on `whileHover`. */
export const warm = {
  transition: { duration: 0.35, ease: EASE_SETTLE },
};

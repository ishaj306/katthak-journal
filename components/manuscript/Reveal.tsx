"use client";

import { motion } from "framer-motion";
import { reveal, revealChild } from "@/lib/motion";

/** A container whose children settle in one after another, like ink drying. */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** One child of a <Reveal>. Fades and drifts up gently. */
export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={revealChild} className={className}>
      {children}
    </motion.div>
  );
}

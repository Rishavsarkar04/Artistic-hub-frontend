import React from 'react';
import { motion } from 'motion/react';

type Props = {
  text: string;
  /** Words (matched exactly) to render in the italic accent. */
  emphasis?: string[];
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'p';
};

/** Word-by-word blur-in reveal, after React Bits' BlurText. */
export function BlurText({ text, emphasis = [], className, delay = 0, stagger = 0.08, as = 'h1' }: Props) {
  const Tag = motion[as];
  const words = text.split(' ');
  return (
    <Tag className={className} aria-label={text} initial="hidden" animate="show" transition={{ staggerChildren: stagger, delayChildren: delay }}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <motion.span
            aria-hidden
            className="inline-block will-change-[transform,filter,opacity]"
            variants={{
              hidden: { opacity: 0, y: 40, filter: 'blur(12px)' },
              show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {emphasis.includes(w) ? <em>{w}</em> : w}
          </motion.span>
          {i < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </Tag>
  );
}

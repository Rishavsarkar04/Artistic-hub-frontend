import React from 'react';
import { motion } from 'motion/react';

type Props = React.ComponentProps<typeof motion.section> & { blur?: boolean; y?: number };

/** Fades, lifts and un-blurs a section as it scrolls into view, after React Bits' FadeContent. */
export function FadeContent({ blur = true, y = 48, children, ...rest }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y, filter: blur ? 'blur(10px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.section>
  );
}

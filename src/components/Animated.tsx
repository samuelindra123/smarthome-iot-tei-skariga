// src/components/Animated.tsx
"use client"; // Tambahkan ini

import { motion } from 'framer-motion';

type BaseMotionProps = React.ComponentPropsWithoutRef<typeof motion.div>;

type Props = {
  children?: React.ReactNode;
  className?: string;
} & BaseMotionProps;

// Ekspor sebagai named export
export function MotionSection({ children, className = '', ...props }: Props) {
  return (
    <motion.section {...props} className={className}>
      {children}
    </motion.section>
  );
}

// Ekspor sebagai named export
export function MotionDiv({ children, className = '', ...props }: Props) {
  return (
    <motion.div {...props} className={className}>
      {children}
    </motion.div>
  );
}

// Tidak perlu default export jika sudah ada named export yang jelas
// export default MotionDiv;
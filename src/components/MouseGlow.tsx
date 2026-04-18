import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function MouseGlow() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let lastTime = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle slightly to avoid too many updates, though useMotionValue is very fast
      const now = performance.now();
      if (now - lastTime > 10) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        lastTime = now;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY]);

  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  return (
    <>
      {/* Intense center dot (1:1 precision mapping, no spring delay) */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-50 rounded-full bg-accent-cyan mix-blend-screen"
        style={{
          x: mouseX, 
          y: mouseY,
          width: isHovering ? 24 : 12,
          height: isHovering ? 24 : 12,
          translateX: '-50%',
          translateY: '-50%',
        }}
        transition={{ type: 'spring', damping: 10, stiffness: 200, mass: 0.5 }}
      />
      {/* Outer ambient glow (uses spring for trailing effect) */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-40 rounded-full bg-accent-purple/20 blur-[80px]"
        style={{
          x: smoothX,
          y: smoothY,
          width: 400,
          height: 400,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </>
  );
}

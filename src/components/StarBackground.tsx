import { useEffect, useRef } from 'react';

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      // Reduce overall density to significantly improve rendering performance (max 400 stars)
      const density = Math.floor((canvas.width * canvas.height) / 4000);
      const numStars = Math.min(density, 400); 
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.5 + 0.05,
          opacity: Math.random() * 0.8 + 0.2, // Between 0.2 and 1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear screen completely
      
      // Batch set the fillStyle once. We can use globalAlpha for individual stars
      ctx.fillStyle = '#FFFFFF';

      stars.forEach((star) => {
        ctx.globalAlpha = star.opacity;
        
        // Critical Render Optimization: fillRect is up to 10x faster than beginPath + arc + fill
        ctx.fillRect(star.x, star.y, star.size, star.size);

        // Move star up to simulate space travel
        star.y -= star.speed;

        // Reset star to bottom if it goes off screen
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
      });

      // Reset alpha
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-40"
    />
  );
}

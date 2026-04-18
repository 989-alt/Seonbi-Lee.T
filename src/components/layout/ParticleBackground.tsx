"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive particle field — respects prefers-reduced-motion.
 * Renders nothing when user prefers reduced motion.
 *
 * Mouse listener is attached to window (not canvas), so it still works
 * even when foreground content (z-10) sits above the canvas (z-0).
 */
export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement!;
    let width = 0;
    let height = 0;
    const mouse = { x: null as number | null, y: null as number | null, radius: 140 };

    type P = {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      density: number;
      color: string;
    };

    let particles: P[] = [];

    const init = () => {
      particles = [];
      const count = Math.floor((width * height) / 9000);
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          size: Math.random() * 2 + 0.5,
          density: Math.random() * 20 + 1,
          color: `rgba(143, 245, 255, ${Math.random() * 0.4 + 0.1})`,
        });
      }
    };

    const resize = () => {
      width = canvas.width = parent.offsetWidth;
      height = canvas.height = parent.offsetHeight;
      init();
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Only track when cursor is within the canvas bounding box
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        mouse.x = x;
        mouse.y = y;
      } else {
        mouse.x = null;
        mouse.y = null;
      }
    };
    const onMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 15000) {
            const opacity = 1 - d2 / 15000;
            ctx.strokeStyle = `rgba(143, 245, 255, ${opacity * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    let raf = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.x -= (dx / dist) * force * p.density;
            p.y -= (dy / dist) * force * p.density;
          } else {
            p.x -= (p.x - p.baseX) / 20;
            p.y -= (p.y - p.baseY) / 20;
          }
        } else {
          p.x -= (p.x - p.baseX) / 20;
          p.y -= (p.y - p.baseY) / 20;
        }
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      connect();
      raf = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);
    // Listen on window so events propagate regardless of overlay z-index
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute top-0 left-0 w-full h-[80vh] z-0 overflow-hidden pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        id="particle-canvas"
        className="w-full h-full block"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0e0e0f]/60 to-[#0e0e0f]" />
    </div>
  );
}

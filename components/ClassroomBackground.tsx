import React, { useEffect, useRef, useState, useMemo } from 'react';

const ClassroomBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 8) setTimeOfDay('dawn');
      else if (hour >= 8 && hour < 17) setTimeOfDay('day');
      else if (hour >= 17 && hour < 20) setTimeOfDay('dusk');
      else setTimeOfDay('night');
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const timeConfig = useMemo(() => {
    const configs = {
      dawn: {
        bg: '#0f172a',
        glow: 'rgba(244, 114, 182, 0.05)',
        shaft: 'rgba(244, 114, 182, 0.1)',
        dust: 0.4
      },
      day: {
        bg: '#020617',
        glow: 'rgba(181, 148, 78, 0.05)',
        shaft: 'rgba(181, 148, 78, 0.15)',
        dust: 0.8
      },
      dusk: {
        bg: '#1e1b4b',
        glow: 'rgba(251, 146, 60, 0.05)',
        shaft: 'rgba(251, 146, 60, 0.1)',
        dust: 0.6
      },
      night: {
        bg: '#000000',
        glow: 'rgba(255, 255, 255, 0.02)',
        shaft: 'rgba(255, 255, 255, 0.05)',
        dust: 0.2
      }
    };
    return configs[timeOfDay];
  }, [timeOfDay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5
    }));

    const lightShafts = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      width: 200 + Math.random() * 400,
      opacity: Math.random() * 0.5,
      speed: 0.001 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2
    }));

    let animationFrame: number;
    let time = 0;

    const render = () => {
      time++;
      ctx.fillStyle = timeConfig.bg;
      ctx.fillRect(0, 0, width, height);

      // Background Glow
      const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
      grad.addColorStop(0, timeConfig.glow);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Light Shafts
      lightShafts.forEach(shaft => {
        const sway = Math.sin(time * shaft.speed + shaft.phase) * 50;
        const shaftGrad = ctx.createLinearGradient(shaft.x + sway, 0, shaft.x + sway + 100, height);
        shaftGrad.addColorStop(0, timeConfig.shaft);
        shaftGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = shaftGrad;
        ctx.beginPath();
        ctx.moveTo(shaft.x + sway, 0);
        ctx.lineTo(shaft.x + sway + shaft.width, 0);
        ctx.lineTo(shaft.x + sway + shaft.width - 200, height);
        ctx.lineTo(shaft.x + sway - 200, height);
        ctx.fill();
      });

      // Dust Particles
      ctx.fillStyle = 'white';
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.globalAlpha = p.opacity * timeConfig.dust;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animationFrame = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, [timeConfig]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[-1] pointer-events-none" />;
};

export default ClassroomBackground;

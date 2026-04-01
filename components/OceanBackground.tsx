
import React, { useEffect, useRef, useState, useMemo } from 'react';

const OceanBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sonarPulses = useRef<{x: number, y: number, r: number, o: number}[]>([]);
  const ambientWaves = useRef<{y: number, o: number, s: number}[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const [readinessScore, setReadinessScore] = useState(0);
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
        top: '#2e1065', mid: '#1e1b4b', bottom: '#020617',
        shaft: '244, 114, 182', shaftOp: 0.6, snowOp: 0.7
      },
      day: {
        top: '#1e40af', mid: '#1e3a8a', bottom: '#000000',
        shaft: '181, 148, 78', shaftOp: 1.0, snowOp: 1.0
      },
      dusk: {
        top: '#4c1d95', mid: '#1e1b4b', bottom: '#020617',
        shaft: '251, 146, 60', shaftOp: 0.8, snowOp: 0.8
      },
      night: {
        top: '#020617', mid: '#000000', bottom: '#000000',
        shaft: '255, 255, 255', shaftOp: 0.2, snowOp: 0.4
      }
    };
    return configs[timeOfDay];
  }, [timeOfDay]);

  useEffect(() => {
    const handleReadinessUpdate = (e: any) => {
        setReadinessScore(e.detail.score || 0);
    };
    window.addEventListener('echomasters-readiness-update', handleReadinessUpdate);
    return () => window.removeEventListener('echomasters-readiness-update', handleReadinessUpdate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const lightShafts = Array.from({ length: 12 }, () => ({
      x: Math.random() * width,
      width: 100 + Math.random() * 300,
      opacity: 0.05 + Math.random() * 0.1,
      speed: 0.001 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2
    }));

    const plants = Array.from({ length: 60 }, () => {
      const depth = 0.2 + Math.random() * 0.8;
      const plantHeight = height * (0.15 + Math.random() * 0.35) * (0.5 + depth * 0.5);
      return {
        x: Math.random() * width,
        height: plantHeight,
        segments: 10 + Math.floor(Math.random() * 10),
        swaySpeed: 0.002 + Math.random() * 0.006,
        swayAmount: 25 + Math.random() * 35,
        phase: Math.random() * Math.PI * 2,
        width: (8 + Math.random() * 12) * depth,
        color: Math.random() > 0.6 ? '#10b981' : (Math.random() > 0.3 ? '#059669' : '#047857'),
        depth
      };
    });

    const jellyfish = Array.from({ length: 10 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 15 + Math.random() * 25,
      speed: 0.2 + Math.random() * 0.5,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.02,
      color: `rgba(${180 + Math.random() * 75}, ${200 + Math.random() * 55}, 255, 0.4)`
    }));

    const treasureChests = Array.from({ length: 4 }, () => ({
      x: Math.random() * width,
      y: height - 20 - Math.random() * 40,
      size: 45 + Math.random() * 25,
      glow: Math.random() * 0.6 + 0.3,
      depth: 0.8 + Math.random() * 0.2
    }));

    // Surprises: Ghost Whale
    const whale = {
        x: -2000,
        y: height * 0.5,
        targetY: height * 0.5,
        size: 800,
        speed: 0.8,
        active: false,
        cooldown: 500
    };

    const tropicalColors = ['#B5944E', '#D4AF37', '#0ea5e9', '#38bdf8', '#fbbf24', '#f59e0b', '#ec4899', '#8b5cf6'];
    
    // Improved Schooling Fish
    const schools = Array.from({ length: 5 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        color: tropicalColors[Math.floor(Math.random() * tropicalColors.length)],
        count: 8 + Math.floor(Math.random() * 12),
        size: 5 + Math.random() * 5,
        speed: 1.5 + Math.random() * 1.5
    }));

    const fish = schools.flatMap(school => 
        Array.from({ length: school.count }, () => ({
            x: school.x + (Math.random() - 0.5) * 100,
            y: school.y + (Math.random() - 0.5) * 100,
            vx: school.speed,
            vy: (Math.random() - 0.5) * 0.5,
            size: school.size,
            color: school.color,
            phase: Math.random() * Math.PI * 2,
            swaySpeed: 0.03 + Math.random() * 0.04,
            depth: 0.4 + Math.random() * 0.6,
            schoolId: Math.random()
        }))
    );

    const submarines = Array.from({ length: 4 }, (_, i) => ({
      x: i % 2 === 0 ? -600 : width + 600,
      y: height * (0.2 + i * 0.2),
      speed: 0.4 + Math.random() * 0.3,
      dir: i % 2 === 0 ? 1 : -1,
      phase: Math.random() * Math.PI * 2,
      depth: 0.8 + Math.random() * 0.2,
      id: `EM-UNIT-${i + 1}`
    }));

    const marineSnow = Array.from({ length: 450 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.1,
      vy: Math.random() * 0.3 + 0.1,
      o: Math.random() * 0.5 + 0.1,
      phase: Math.random() * Math.PI * 2,
      depth: Math.random() * 1.2 + 0.5
    }));

    let time = 0;

    const drawCaustics = (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.06 + (Math.sin(time * 0.015) * 0.02);
        
        const patternSize = 400;
        for (let x = -patternSize; x < width + patternSize; x += patternSize) {
            for (let y = -patternSize; y < height + patternSize; y += patternSize) {
                const cx = x + Math.sin(time * 0.01 + y) * 30;
                const cy = y + Math.cos(time * 0.01 + x) * 30;
                
                const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, patternSize/2);
                grad.addColorStop(0, `rgba(${timeConfig.shaft}, 0.4)`);
                grad.addColorStop(1, 'transparent');
                
                ctx.fillStyle = grad;
                ctx.fillRect(x, y, patternSize, patternSize);
            }
        }
        ctx.restore();
    };

    const drawTreasure = (ctx: CanvasRenderingContext2D, t: any) => {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.globalAlpha = t.depth * 0.95;
        
        // Dynamic Glow
        const glow = Math.abs(Math.sin(time * 0.03)) * t.glow;
        const grad = ctx.createRadialGradient(t.size/2, t.size/2, 0, t.size/2, t.size/2, t.size * 2);
        grad.addColorStop(0, `rgba(212, 175, 55, ${glow * 0.5})`);
        grad.addColorStop(0.4, `rgba(212, 175, 55, ${glow * 0.1})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(-t.size, -t.size, t.size * 3, t.size * 3);

        // Box Base
        ctx.fillStyle = '#271207'; 
        ctx.fillRect(0, 0, t.size, t.size * 0.7);
        
        // Curved Lid
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(t.size/2, 0, t.size/2, t.size * 0.35, 0, Math.PI, 0);
        ctx.fill();

        // Decorative Gold Bands
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(t.size * 0.15, -2, t.size * 0.08, t.size * 0.75);
        ctx.fillRect(t.size * 0.77, -2, t.size * 0.08, t.size * 0.75);

        // Lock
        ctx.fillStyle = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#D4AF37';
        ctx.fillRect(t.size * 0.44, t.size * 0.25, t.size * 0.12, t.size * 0.15);

        ctx.restore();
    };

    const drawWhale = (ctx: CanvasRenderingContext2D) => {
        if (!whale.active) {
            whale.cooldown--;
            if (whale.cooldown <= 0) {
                whale.active = true;
                whale.x = -whale.size * 2;
                whale.y = height * (0.3 + Math.random() * 0.4);
            }
            return;
        }

        whale.x += whale.speed;
        whale.y += (Math.sin(time * 0.005) * 0.5);

        ctx.save();
        ctx.translate(whale.x, whale.y);
        ctx.globalAlpha = 0.03 + (Math.sin(time * 0.01) * 0.01);
        ctx.fillStyle = '#fff';
        
        // Silhouette body
        ctx.beginPath();
        ctx.ellipse(0, 0, whale.size, whale.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail flukes
        ctx.beginPath();
        ctx.moveTo(-whale.size * 0.8, 0);
        ctx.lineTo(-whale.size * 1.2, -whale.size * 0.4);
        ctx.lineTo(-whale.size * 1.2, whale.size * 0.4);
        ctx.closePath();
        ctx.fill();

        if (whale.x > width + whale.size) {
            whale.active = false;
            whale.cooldown = 1000 + Math.random() * 1000;
        }
        ctx.restore();
    };

    const drawJellyfish = (ctx: CanvasRenderingContext2D, j: any) => {
        const pulse = Math.sin(time * j.pulseSpeed + j.pulsePhase) * 0.25 + 1;
        ctx.save();
        ctx.translate(j.x, j.y);
        ctx.globalAlpha = 0.3;
        
        // Bioluminescent Tentacles
        ctx.strokeStyle = j.color;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo((i - 2.5) * (j.size * 0.2), 0);
            const tx = (i - 2.5) * (j.size * 0.3) + Math.sin(time * 0.04 + i) * 15;
            ctx.bezierCurveTo(
                (i - 2.5) * (j.size * 0.1), j.size * 1.2 * pulse,
                (i - 2.5) * (j.size * 0.4), j.size * 1.8 * pulse,
                tx, j.size * 2.5 * pulse
            );
            ctx.stroke();
        }

        // Bioluminescent Head
        const headGrad = ctx.createRadialGradient(0, -5, 0, 0, 0, j.size * 1.2);
        headGrad.addColorStop(0, j.color);
        headGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, j.size * pulse, j.size * 0.9 * pulse, 0, Math.PI, 0);
        ctx.fill();

        ctx.restore();
    };

    const drawFish = (ctx: CanvasRenderingContext2D, f: any) => {
      ctx.save();
      const sway = Math.sin(time * f.swaySpeed + f.phase) * 8;
      ctx.translate(f.x, f.y + sway);
      ctx.scale(f.vx > 0 ? 1 : -1, 1);
      ctx.globalAlpha = f.depth * 0.85;
      
      // Fish Body
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, f.size, f.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Tail
      ctx.beginPath();
      ctx.moveTo(-f.size * 0.8, 0);
      ctx.lineTo(-f.size * 1.6, -f.size * 0.6);
      ctx.lineTo(-f.size * 1.6, f.size * 0.6);
      ctx.closePath();
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.ellipse(f.size * 0.2, -f.size * 0.1, f.size * 0.5, f.size * 0.15, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(f.size * 0.5, -f.size * 0.1, f.size * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawSubmarine = (ctx: CanvasRenderingContext2D, s: any) => {
      const sway = Math.sin(time * 0.015 + s.phase) * 15;
      const subX = s.x;
      const subY = s.y + sway;

      ctx.save();
      ctx.translate(subX, subY);
      ctx.scale(s.dir * s.depth, s.depth);
      ctx.globalAlpha = 0.95 * s.depth;

      // Reinforced Hull
      const hullGrad = ctx.createLinearGradient(0, -35, 0, 35);
      hullGrad.addColorStop(0, '#fef9c3'); 
      hullGrad.addColorStop(0.5, '#eab308'); 
      hullGrad.addColorStop(1, '#854d0e'); 
      ctx.fillStyle = hullGrad;
      ctx.beginPath(); 
      ctx.moveTo(-70, 0);
      ctx.bezierCurveTo(-70, -28, -35, -36, 15, -36); 
      ctx.bezierCurveTo(60, -36, 85, -20, 90, 0); 
      ctx.bezierCurveTo(85, 20, 60, 36, 15, 36); 
      ctx.bezierCurveTo(-35, 36, -70, 28, -70, 0); 
      ctx.fill();

      // EchoMasters Elite Branding
      ctx.save();
      ctx.scale(s.dir, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.font = 'black 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 1;
      ctx.shadowColor = 'white';
      ctx.fillText('ECHOMASTERS', 10, 5);
      
      // Small ID tag
      ctx.font = '8px monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillText(s.id, 10, 15);
      ctx.restore();

      // High-Visibility Port Windows
      [-25, 5, 35].forEach(px => {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(px, -4, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3b82f6'; 
        ctx.beginPath(); ctx.arc(px, -4, 7, 0, Math.PI * 2); ctx.fill();
        // Glass sheen
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.arc(px - 3, -7, 2.5, 0, Math.PI * 2); ctx.fill();
      });

      // Rotating High-Torque Propeller
      ctx.save();
      ctx.translate(-70, 0);
      ctx.rotate(time * 0.6);
      ctx.fillStyle = '#475569';
      ctx.beginPath(); ctx.ellipse(0, 0, 6, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.restore();
    };

    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      const clarity = readinessScore / 100;
      const topColor = clarity > 0.4 ? timeConfig.top : '#010816';
      const midColor = clarity > 0.4 ? timeConfig.mid : '#00050d';
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, topColor);
      bgGrad.addColorStop(0.7, midColor);
      bgGrad.addColorStop(1, timeConfig.bottom);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      drawWhale(ctx);
      drawCaustics(ctx);

      lightShafts.forEach(s => {
          const sway = Math.sin(time * s.speed + s.phase) * 60;
          ctx.save();
          const shaftGrad = ctx.createLinearGradient(s.x + sway, 0, s.x + sway + 80, height);
          shaftGrad.addColorStop(0, `rgba(${timeConfig.shaft}, ${s.opacity * timeConfig.shaftOp})`);
          shaftGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = shaftGrad;
          ctx.beginPath();
          ctx.moveTo(s.x + sway, 0);
          ctx.lineTo(s.x + sway + s.width, 0);
          ctx.lineTo(s.x + sway + s.width - 250, height);
          ctx.lineTo(s.x + sway - 250, height);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
      });

      treasureChests.forEach(t => drawTreasure(ctx, t));

      marineSnow.forEach(p => {
          p.y += p.vy * p.depth;
          p.x += Math.sin(time * 0.015 + p.phase) * 0.35;
          if (p.y > height) p.y = -20;
          if (p.x > width) p.x = 0;
          if (p.x < 0) p.x = width;
          ctx.fillStyle = `rgba(255, 255, 255, ${p.o * 0.3 * (1 + clarity) * timeConfig.snowOp})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });

      jellyfish.forEach(j => {
          j.y -= j.speed;
          j.x += Math.sin(time * 0.01 + j.pulsePhase) * 0.4;
          if (j.y < -150) j.y = height + 150;
          drawJellyfish(ctx, j);
      });

      // Ambient Depth Waves
      if (time % 120 === 0 && ambientWaves.current.length < 8) {
          ambientWaves.current.push({ y: -150, o: 0.2, s: 0.7 + Math.random() * 0.5 });
      }
      for (let i = ambientWaves.current.length - 1; i >= 0; i--) {
          const w = ambientWaves.current[i];
          w.y += w.s;
          w.o -= 0.0002;
          if (w.y > height + 250 || w.o <= 0) { ambientWaves.current.splice(i, 1); continue; }
          ctx.strokeStyle = `rgba(181, 148, 78, ${w.o})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-200, w.y);
          ctx.bezierCurveTo(width/3, w.y + 80, width*0.7, w.y - 80, width + 200, w.y);
          ctx.stroke();
      }

      plants.sort((a, b) => a.depth - b.depth).forEach(p => {
          ctx.save();
          ctx.globalAlpha = 0.2 + p.depth * 0.7;
          ctx.beginPath();
          ctx.moveTo(p.x, height);
          const sway = Math.sin(time * p.swaySpeed + p.phase) * p.swayAmount;
          ctx.quadraticCurveTo(p.x, height - p.height/2, p.x + sway, height - p.height);
          ctx.lineWidth = p.width;
          ctx.lineCap = 'round';
          ctx.strokeStyle = p.color;
          ctx.stroke();
          ctx.restore();
      });

      fish.forEach(f => {
        // Schooling attraction logic
        f.x += f.vx;
        f.y += f.vy + Math.sin(time * 0.05 + f.phase) * 0.1;
        if (f.vx > 0 && f.x > width + 200) f.x = -200;
        if (f.vx < 0 && f.x < -200) f.x = width + 200;
        if (f.y > height + 100) f.y = -100;
        if (f.y < -100) f.y = height + 100;
        drawFish(ctx, f);
      });

      submarines.forEach(s => {
        s.x += s.speed * s.dir;
        if (s.dir === 1 && s.x > width + 600) s.x = -600;
        if (s.dir === -1 && s.x < -600) s.x = width + 600;
        drawSubmarine(ctx, s);
      });

      for (let i = sonarPulses.current.length - 1; i >= 0; i--) {
          const p = sonarPulses.current[i];
          p.r += 5; p.o -= 0.02;
          if (p.o <= 0) { sonarPulses.current.splice(i, 1); continue; }
          ctx.strokeStyle = `rgba(181, 148, 78, ${p.o})`;
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.88, 0, Math.PI * 2); ctx.stroke();
      }

      animationFrame = requestAnimationFrame(render);
    };

    let animationFrame = requestAnimationFrame(render);

    const handleMouseMove = (e: MouseEvent) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    const handleMouseDown = (e: MouseEvent) => { sonarPulses.current.push({ x: e.clientX, y: e.clientY, r: 0, o: 1.0 }); };
    const handleResize = () => { 
      width = window.innerWidth; height = window.innerHeight; 
      canvas.width = width; canvas.height = height; 
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('resize', handleResize);
    
    return () => { 
        cancelAnimationFrame(animationFrame);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('resize', handleResize);
    };
  }, [readinessScore]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#010816]">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute bottom-10 left-10 pointer-events-none opacity-30 hidden md:block">
          <div className="space-y-1 border-l-2 border-gold-main/20 pl-4">
              <p className="text-[9px] font-mono text-gold-main uppercase tracking-widest">Tropical Biosphere Unit: Online ({timeOfDay})</p>
              <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest italic">Depth: 2,500m Sub-Acoustic Exploration</p>
          </div>
      </div>
      <div className="absolute top-10 right-10 pointer-events-none opacity-20 hidden md:block">
          <div className="space-y-2 border-r border-gold-main/30 pr-4 text-right">
              <p className="text-[10px] font-mono text-gold-main uppercase tracking-widest">EchoMasters Acoustic Grid</p>
              <p className="text-[10px] font-mono text-gold-main uppercase tracking-widest">Resonance Stability: {readinessScore}%</p>
          </div>
      </div>
    </div>
  );
};

export default OceanBackground;

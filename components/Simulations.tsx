
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Play, Pause, Activity, Waves, Target, Eye, 
  Ruler, BarChart3, Binary, Radar, Wind, 
  Compass, HelpCircle, ArrowRight, Zap, ShieldAlert,
  ZapOff, Repeat, Split, Timer, Maximize2, Minimize2, Layers,
  ChevronUp, ChevronDown, Sliders, Filter, Cpu, 
  Settings2, Fingerprint, Box, Circle, Ghost,
  Stethoscope, Droplets, Grid3X3, Monitor, Thermometer, Gauge
} from 'lucide-react';

interface SimulationProps {
  type: string;
  topicId?: string;
  isSandbox?: boolean;
}

const Simulations: React.FC<SimulationProps> = ({ type, isSandbox }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [param1, setParam1] = useState(50); 
  const [param2, setParam2] = useState(50); 
  const [gain, setGain] = useState(70);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [size, setSize] = useState({ width: 0, height: 320 });

  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const isMobile = window.innerWidth < 768;
        const width = containerRef.current.clientWidth;
        
        let height = isSandbox 
          ? (isMobile ? 320 : 480) 
          : (isMobile ? 220 : 320);
          
        if (isFullscreen) {
            height = window.innerHeight - 250; // Leave space for controls in fullscreen
        }
        
        setSize({ width, height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isSandbox, isFullscreen]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const getLabels = () => {
    switch(type) {
      case 'SpectralDopplerVisual':
        return { p1: "VELOCITY", p2: "ANGLE", icon1: Activity, icon2: Compass, help: "Spectral waveform shows velocity over time. Peak Systolic Velocity (PSV) and End Diastolic Velocity (EDV)." };
      case 'TGCVisual':
        return { p1: "NEAR_GAIN", p2: "FAR_GAIN", icon1: Sliders, icon2: Activity, help: "TGC compensates for attenuation by increasing gain at greater depths." };
      case 'LongitudinalWaveVisual':
        return { p1: "FREQ", p2: "AMP", icon1: Activity, icon2: Waves, help: "Observe particle compression nodes." };
      case 'WaveParametersVisual':
        return { p1: "FREQ", p2: "AMP", icon1: Activity, icon2: Waves, help: "Frequency (Hz) vs Amplitude (dB). Higher frequency = shorter wavelength." };
      case 'DopplerPrincipleVisual':
        return { p1: "VELOCITY", p2: "ANGLE", icon1: Wind, icon2: Compass, help: "Doppler shift is maximum at 0° and zero at 90°." };
      case 'BioeffectMechanismsVisual':
        return { p1: "MODE", p2: "POWER", icon1: Thermometer, icon2: Zap, help: "Thermal (Heat) vs Mechanical (Cavitation) effects." };
      case 'SafetyIndicesVisual':
        return { p1: "TI", p2: "MI", icon1: ShieldAlert, icon2: Gauge, help: "Monitor Thermal Index (TI) and Mechanical Index (MI)." };
      case 'FlowPatternsVisual':
        return { p1: "TYPE", p2: "VELOCITY", icon1: Wind, icon2: Activity, help: "Laminar (Smooth) vs Turbulent (Chaotic) flow patterns." };
      case 'PhysicalPrinciplesVisual':
        return { p1: "STIFFNESS", p2: "DENSITY", icon1: Target, icon2: Layers, help: "Speed of sound increases with stiffness and decreases with density." };
      case 'QaPhantomVisual':
        return { p1: "RES", p2: "SENS", icon1: Target, icon2: Activity, help: "Quality Assurance testing using tissue-equivalent phantoms." };
      case 'KeyParametersVisual':
        return { p1: "FREQ", p2: "POWER", icon1: Activity, icon2: Zap, help: "Optimizing image quality vs bioeffects." };
      case 'NonLinearPropagationVisual':
        return { p1: "INTENSITY", p2: "DEPTH", icon1: Activity, icon2: Ruler, help: "Wave distortion as it travels through tissue." };
      case 'HarmonicImagingVisual':
        return { p1: "FUNDAMENTAL", p2: "HARMONIC", icon1: Activity, icon2: Waves, help: "Filtering out the fundamental to see the harmonic signal." };
      case 'AttenuationVisual':
        return { p1: "FREQUENCY", p2: "DEPTH", icon1: Activity, icon2: Ruler, help: "0.5 dB/cm/MHz rule: Attenuation increases with frequency and depth." };
      case 'ReceiverFunctionsVisual':
        return { p1: "GAIN", p2: "COMPRESS", icon1: Sliders, icon2: Activity, help: "Receiver functions: Gain, TGC, Compression, Demodulation, Rejection." };
      case 'DisplayModesVisual':
        return { p1: "MODE", p2: "BRIGHT", icon1: Monitor, icon2: Activity, help: "A-mode (Amplitude), B-mode (Brightness), M-mode (Motion)." };
      case 'ImageProcessingVisual':
        return { p1: "PRE", p2: "POST", icon1: Cpu, icon2: Settings2, help: "Pre-processing (Write Zoom) vs Post-processing (Read Zoom)." };
      case 'ArtifactsVisual':
        return { p1: "TYPE", p2: "STRENGTH", icon1: Ghost, icon2: Activity, help: "Side Lobes, Grating Lobes, and Comet Tail artifacts." };
      case 'DopplerModesVisual':
        return { p1: "SCALE", p2: "NYQUIST", icon1: ZapOff, icon2: Activity, help: "Aliasing occurs when shift > PRF/2." };
      case 'DigitalLogicVisual':
        return { p1: "BIT_DEPTH", p2: "SAMPLING", icon1: Binary, icon2: Cpu, help: "Shades = 2^bits. Sampling improves fidelity." };
      case 'ContrastMechanicsVisual':
        return { p1: "BUBBLE_SIZE", p2: "ACOUSTIC_P", icon1: Droplets, icon2: Zap, help: "Bubble oscillation becomes non-linear at MI > 0.1." };
      case 'AxialResolutionVisual':
        return { p1: "SPL", p2: "DISTANCE", icon1: Ruler, icon2: Target, help: "Axial Resolution = SPL / 2. Smaller SPL = Better Resolution." };
      case 'LateralResolutionVisual':
        return { p1: "BEAM_WIDTH", p2: "SPACING", icon1: Maximize2, icon2: Target, help: "Lateral Resolution = Beam Width. Narrower beam = Better Resolution." };
      case 'TissueInteractionVisual':
        return { p1: "IMPEDANCE", p2: "ANGLE", icon1: Layers, icon2: Compass, help: "Reflection occurs at impedance boundaries. Refraction (Snell's Law) occurs at oblique angles when speeds differ." };
      case 'ColorDopplerVisual':
        return { p1: "VELOCITY", p2: "SCALE", icon1: Activity, icon2: Gauge, help: "BART: Blue Away, Red Towards. Color maps show mean velocity and direction." };
      case 'TransducerAnatomyVisual':
        return { p1: "THICKNESS", p2: "DAMPING", icon1: Maximize2, icon2: Zap, help: "Thinner crystals = Higher Frequency. More damping = Shorter Pulse." };
      case 'ArrayTypesVisual':
        return { p1: "TYPE", p2: "STEER", icon1: Grid3X3, icon2: Compass, help: "Linear (Rectangular), Phased (Sector), Convex (Blunted Sector)." };
      case 'BeamFocusingVisual':
        return { p1: "FOCUS", p2: "FREQ", icon1: Target, icon2: Activity, help: "Beam is narrowest at the focal point. Best lateral resolution here." };
      case 'PulseEchoPrincipleVisual':
        return { p1: "DEPTH", p2: "SPEED", icon1: Timer, icon2: Gauge, help: "Distance = (Speed x Time) / 2. 13µs per cm in soft tissue." };
      case 'PropagationArtifactsVisual':
        return { p1: "TYPE", p2: "STRENGTH", icon1: Ghost, icon2: Activity, help: "Reverberation, Mirror Image, and Speed Error simulations." };
      case 'AttenuationArtifactsVisual':
        return { p1: "TYPE", p2: "STRENGTH", icon1: Droplets, icon2: Zap, help: "Shadowing (high attenuation) vs Enhancement (low attenuation)." };
      case 'AdvancedTechVisual':
        return { p1: "STIFFNESS", p2: "SHEAR_V", icon1: Target, icon2: Activity, help: "Elastography measures tissue displacement speed." };
      case 'ThyroidVisual':
        return { p1: "DOPPLER", p2: "SWALLOW", icon1: Activity, icon2: Waves, help: "Thyroid is highly vascular. Use swallowing to see posterior borders." };
      case 'ScrotumVisual':
        return { p1: "VALSALVA", p2: "DOPPLER", icon1: Wind, icon2: Activity, help: "Valsalva maneuver helps diagnose varicoceles. Doppler distinguishes torsion from orchitis." };
      case 'MSKVisual':
        return { p1: "ANGLE", p2: "MOVEMENT", icon1: Compass, icon2: Activity, help: "Heel-toe the probe to eliminate anisotropy. Dynamic imaging shows tendon sliding." };
      case 'FASTExamVisual':
        return { p1: "WINDOW", p2: "SWEEP", icon1: Target, icon2: Waves, help: "Check RUQ, LUQ, Pelvis, and Subxiphoid for free fluid (black/anechoic)." };
      default:
        return { p1: "PARAM_1", p2: "PARAM_2", icon1: Zap, icon2: Activity, help: "Acoustic Interaction Engine." };
    }
  };

  const labels = getLabels();

  // Helper for drawing glowing lines
  const drawGlowLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width: number, glowSize: number) => {
    ctx.shadowBlur = glowSize;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    ctx.scale(dpr, dpr);

    let frame = 0;
    const render = () => {
      if (isPlaying) frame++;
      ctx.clearRect(0, 0, size.width, size.height);
      
      const p1 = param1 / 100;
      const p2 = param2 / 100;
      const g = gain / 100;

      // Global CRT/Scanline Effect (Subtle)
      const drawScanlines = () => {
        ctx.save();
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = "#000";
        for (let i = 0; i < size.height; i += 4) {
          ctx.fillRect(0, i, size.width, 2);
        }
        ctx.restore();
      };

      if (type === 'TissueInteractionVisual') {
        const impedanceDiff = p1;
        const incidentAngle = (p2 - 0.5) * Math.PI / 2; 
        const centerX = size.width / 2;
        const centerY = size.height / 2;

        // Background Gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, size.height);
        bgGrad.addColorStop(0, "rgba(10, 15, 30, 1)");
        bgGrad.addColorStop(1, "rgba(5, 10, 20, 1)");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, size.width, size.height);

        // Boundary Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(255,255,255,0.2)";
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(size.width, centerY); ctx.stroke();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = "rgba(181, 148, 78, 0.03)";
        ctx.fillRect(0, centerY, size.width, centerY);
        
        ctx.font = "bold 10px Inter";
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillText("MEDIUM 1 (Z1)", 20, centerY - 15);
        ctx.fillText("MEDIUM 2 (Z2)", 20, centerY + 25);

        // Incident Ray with Glow
        const rayLen = 120;
        const startX = centerX - Math.sin(incidentAngle) * rayLen;
        const startY = centerY - Math.cos(incidentAngle) * rayLen;
        
        drawGlowLine(ctx, startX, startY, centerX, centerY, "#B5944E", 3, 15);
        
        // Reflected Ray
        const reflectIntensity = impedanceDiff;
        const reflectX = centerX + Math.sin(incidentAngle) * rayLen;
        const reflectY = centerY - Math.cos(incidentAngle) * rayLen;
        drawGlowLine(ctx, centerX, centerY, reflectX, reflectY, `rgba(181, 148, 78, ${reflectIntensity})`, 2, 10 * reflectIntensity);
        
        // Refracted Ray
        const speedRatio = 1 + (p1 - 0.5) * 0.6;
        const sinRefract = Math.sin(incidentAngle) * speedRatio;
        if (Math.abs(sinRefract) < 1) {
          const refractAngle = Math.asin(sinRefract);
          const refractX = centerX + Math.sin(refractAngle) * rayLen;
          const refractY = centerY + Math.cos(refractAngle) * rayLen;
          drawGlowLine(ctx, centerX, centerY, refractX, refractY, `rgba(181, 148, 78, ${1 - reflectIntensity})`, 2, 10 * (1 - reflectIntensity));
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.fillText("REFRACTION", refractX - 30, refractY + 20);
        } else {
          // Total Internal Reflection
          ctx.fillStyle = "#ef4444";
          ctx.fillText("TOTAL INTERNAL REFLECTION", centerX - 70, centerY + 30);
        }

        ctx.fillStyle = "white";
        ctx.fillText("INCIDENT", startX - 20, startY - 10);
        if (reflectIntensity > 0.1) ctx.fillText("REFLECTION", reflectX - 20, reflectY - 10);

      } else if (type === 'ColorDopplerVisual') {
        const velocity = (p1 - 0.5) * 200;
        const scale = p2 * 100 + 10;
        const centerX = size.width / 2;
        const centerY = size.height / 2;

        // Vessel Walls
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 2;
        ctx.strokeRect(50, centerY - 40, size.width - 100, 80);

        // Flow Background
        const flowGrad = ctx.createLinearGradient(50, 0, size.width - 50, 0);
        flowGrad.addColorStop(0, "rgba(0,0,0,0.8)");
        flowGrad.addColorStop(0.5, "rgba(20,20,20,0.8)");
        flowGrad.addColorStop(1, "rgba(0,0,0,0.8)");
        ctx.fillStyle = flowGrad;
        ctx.fillRect(50, centerY - 38, size.width - 100, 76);

        // Color Map with Shimmer
        const intensity = Math.min(1, Math.abs(velocity)/scale);
        const baseColor = velocity > 0 ? [239, 68, 68] : [59, 130, 246];
        const color = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${intensity * 0.6})`;
        
        ctx.fillStyle = color;
        ctx.fillRect(50, centerY - 38, size.width - 100, 76);

        // Flow Particles
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
          const pOffset = (frame * (velocity * 0.05) + i * (size.width / particleCount)) % (size.width - 120);
          const px = 60 + pOffset;
          const py = centerY + Math.sin(i + frame * 0.02) * 30;
          
          ctx.fillStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${intensity})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
          
          if (intensity > 0.5) {
            ctx.shadowBlur = 5;
            ctx.shadowColor = color;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        // Scale bar
        const barX = size.width - 40;
        const barY = centerY - 60;
        const grad = ctx.createLinearGradient(0, barY, 0, barY + 120);
        grad.addColorStop(0, "#ef4444");
        grad.addColorStop(0.5, "black");
        grad.addColorStop(1, "#3b82f6");
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, 12, 120);
        
        // Indicator on scale
        const indicatorY = barY + 60 - (velocity / scale) * 60;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(barX - 5, indicatorY); ctx.lineTo(barX + 17, indicatorY); ctx.stroke();

      } else if (type === 'SpectralDopplerVisual') {
        const velocity = p1 * 180;
        const angle = p2 * Math.PI / 2;
        const centerY = size.height / 2 + 40;

        // Background Grid (Scrolling)
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = 1;
        const scrollOffset = (frame * 1) % 40;
        for (let x = 50 - scrollOffset; x < size.width - 50; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 50); ctx.lineTo(x, size.height - 50); ctx.stroke();
        }
        for (let y = 50; y < size.height - 50; y += 30) {
          ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(size.width - 50, y); ctx.stroke();
        }

        // Baseline
        drawGlowLine(ctx, 50, centerY, size.width - 50, centerY, "rgba(255,255,255,0.2)", 1, 0);

        // Waveform with Glow and Trail
        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#B5944E";
        ctx.beginPath();
        
        const points: {x: number, y: number}[] = [];
        for(let x=50; x<size.width - 50; x++) {
          const t = (frame + x) * 0.04;
          const cycle = t % (Math.PI * 2);
          let amp = 0;
          if (cycle < Math.PI / 2) {
            amp = Math.sin(cycle * 2);
          } else if (cycle < Math.PI) {
            amp = 0.5 + Math.sin(cycle * 4) * 0.15;
          } else {
            amp = 0.25 * Math.exp(-(cycle - Math.PI) * 0.8);
          }
          
          const shift = amp * velocity * Math.cos(angle) * g;
          const y = centerY - shift;
          points.push({x, y});
          if(x===50) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Fill under waveform
        const fillGrad = ctx.createLinearGradient(0, centerY - 100, 0, centerY);
        fillGrad.addColorStop(0, "rgba(181, 148, 78, 0.2)");
        fillGrad.addColorStop(1, "rgba(181, 148, 78, 0)");
        ctx.fillStyle = fillGrad;
        ctx.beginPath();
        ctx.moveTo(50, centerY);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(size.width - 50, centerY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "bold 12px Inter";
        ctx.fillText("SPECTRAL DOPPLER", 50, 40);
        ctx.font = "10px JetBrains Mono";
        ctx.fillStyle = "#B5944E";
        ctx.fillText(`V_MAX: ${Math.round(velocity * Math.cos(angle))} cm/s`, 50, size.height - 20);

      } else if (type === 'LongitudinalWaveVisual') {
        const freq = p1 * 0.12 + 0.03;
        const amp = p2 * 40;
        const particleCount = 50;
        const centerY = size.height / 2;

        // Pressure Wave Overlay (Subtle)
        ctx.strokeStyle = "rgba(181, 148, 78, 0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < size.width; x++) {
          const y = centerY + Math.sin(x * freq + frame * 0.1) * amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Particles
        for (let i = 0; i < particleCount; i++) {
          const baseX = (size.width / particleCount) * i;
          const phase = baseX * freq + frame * 0.1;
          const x = baseX + Math.sin(phase) * amp;
          
          // Compression detection (when sin is near peak)
          const isCompressed = Math.sin(phase) > 0.8;
          
          ctx.fillStyle = isCompressed ? "#FFF" : "#B5944E";
          if (isCompressed) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#FFF";
          }
          
          ctx.beginPath();
          ctx.arc(x, centerY, isCompressed ? 4 : 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "10px Inter";
        ctx.fillText("COMPRESSION", size.width / 2 - 30, centerY - 60);
        ctx.fillText("RAREFACTION", size.width / 2 - 30, centerY + 70);

      } else if (type === 'AttenuationVisual') {
        const frequency = p1 * 12 + 2; 
        const depth = p2 * 15; 
        const attenCoeff = 0.5; 
        
        const centerX = size.width / 2;
        const centerY = size.height / 2;

        // Tissue Depth Map
        const tissueGrad = ctx.createLinearGradient(0, 50, 0, size.height - 50);
        tissueGrad.addColorStop(0, "rgba(20, 30, 50, 0.8)");
        tissueGrad.addColorStop(1, "rgba(5, 10, 15, 0.8)");
        ctx.fillStyle = tissueGrad;
        ctx.fillRect(50, 50, size.width - 100, size.height - 100);

        // Heatmap of attenuation
        for (let y = 50; y < size.height - 50; y += 10) {
          const d = ((y - 50) / (size.height - 100)) * 15;
          const atten = Math.min(1, (attenCoeff * d * frequency) / 60);
          ctx.fillStyle = `rgba(181, 148, 78, ${atten * 0.1})`;
          ctx.fillRect(50, y, size.width - 100, 10);
        }

        // Wave with dynamic intensity
        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "#B5944E";
        ctx.beginPath();
        for (let y = 50; y < size.height - 50; y++) {
          const currentDepth = ((y - 50) / (size.height - 100)) * 15;
          const currentAttenuation = attenCoeff * currentDepth * frequency;
          const intensity = Math.pow(10, -currentAttenuation / 10);
          
          const xOffset = Math.sin(y * (0.08 * frequency) + frame * 0.15) * (40 * intensity * g);
          
          if (y === 50) ctx.moveTo(centerX + xOffset, y);
          else ctx.lineTo(centerX + xOffset, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Info Panel
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Inter";
        ctx.fillText(`${frequency.toFixed(1)} MHz`, 60, 40);
        
        const totalAtten = attenCoeff * depth * frequency;
        ctx.font = "10px JetBrains Mono";
        ctx.fillStyle = "#B5944E";
        ctx.fillText(`LOSS: -${totalAtten.toFixed(1)} dB`, size.width - 150, 40);

      } else if (type === 'AxialResolutionVisual') {
        const spl = p1 * 100 + 20;
        const targetDist = p2 * 100 + 10;
        const pulseX = (frame * 4) % (size.width + spl);
        const centerY = size.height / 2;
        const centerX = size.width / 2;

        // Beam Path
        const beamGrad = ctx.createLinearGradient(0, centerY, size.width, centerY);
        beamGrad.addColorStop(0, "rgba(181, 148, 78, 0.1)");
        beamGrad.addColorStop(1, "rgba(181, 148, 78, 0)");
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, centerY - 15, size.width, 30);

        // Targets
        const t1X = centerX - targetDist / 2;
        const t2X = centerX + targetDist / 2;
        
        ctx.fillStyle = "#B5944E";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#B5944E";
        ctx.beginPath(); ctx.arc(t1X, centerY, 6, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(t2X, centerY, 6, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;

        // Pulse
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let i=0; i<spl; i++) {
          const x = pulseX - i;
          const y = centerY + Math.sin(i * 0.7) * 12 * Math.exp(-i/spl * 4);
          if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Echoes
        if (pulseX > t1X) {
          const e1X = t1X - (pulseX - t1X);
          ctx.strokeStyle = "rgba(34, 197, 94, 0.6)";
          ctx.beginPath();
          for(let i=0; i<spl; i++) {
            const x = e1X + i;
            const y = centerY + Math.sin(i * 0.7) * 8 * Math.exp(-i/spl * 4);
            if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        const isResolved = (spl / 2) < targetDist;
        ctx.fillStyle = isResolved ? "#22c55e" : "#ef4444";
        ctx.font = "bold 12px Inter";
        ctx.fillText(isResolved ? "SYSTEM RESOLVED" : "SYSTEM BLURRED", centerX - 60, centerY + 60);

      } else if (type === 'LateralResolutionVisual') {
        const beamWidthAtFocus = p1 * 45 + 5;
        const spacing = p2 * 90 + 10;
        const focusDepth = size.width / 2;
        const centerY = size.height / 2;

        // Hourglass Beam with Glow
        const startWidth = 80;
        const beamGrad = ctx.createRadialGradient(focusDepth, centerY, 0, focusDepth, centerY, size.width/2);
        beamGrad.addColorStop(0, "rgba(181, 148, 78, 0.2)");
        beamGrad.addColorStop(1, "rgba(181, 148, 78, 0)");
        
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(0, centerY - startWidth/2);
        ctx.bezierCurveTo(focusDepth/2, centerY - startWidth/2, focusDepth/2, centerY - beamWidthAtFocus/2, focusDepth, centerY - beamWidthAtFocus/2);
        ctx.bezierCurveTo(focusDepth * 1.5, centerY - beamWidthAtFocus/2, focusDepth * 1.5, centerY - startWidth/2, size.width, centerY - startWidth/2);
        ctx.lineTo(size.width, centerY + startWidth/2);
        ctx.bezierCurveTo(focusDepth * 1.5, centerY + startWidth/2, focusDepth * 1.5, centerY + beamWidthAtFocus/2, focusDepth, centerY + beamWidthAtFocus/2);
        ctx.bezierCurveTo(focusDepth/2, centerY + beamWidthAtFocus/2, focusDepth/2, centerY + startWidth/2, 0, centerY + startWidth/2);
        ctx.fill();

        // Focal Zone Highlight
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(focusDepth - 40, centerY - 50, 80, 100);
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.font = "8px Inter";
        ctx.fillText("FOCAL ZONE", focusDepth - 25, centerY - 60);

        // Targets
        ctx.fillStyle = "#B5944E";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#B5944E";
        ctx.beginPath(); ctx.arc(focusDepth, centerY - spacing/2, 6, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(focusDepth, centerY + spacing/2, 6, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;

        const isResolved = beamWidthAtFocus < spacing;
        ctx.fillStyle = isResolved ? "#22c55e" : "#ef4444";
        ctx.font = "bold 12px Inter";
        ctx.fillText(isResolved ? "LATERAL RESOLUTION OK" : "LATERAL BLURRING", focusDepth - 70, centerY + 80);

      } else if (type === 'QaPhantomVisual') {
        const sensitivity = p1;
        const depth = 0.5 + p2 * 0.5;

        // Draw Phantom Body
        ctx.strokeStyle = '#333';
        ctx.strokeRect(size.width * 0.2, size.height * 0.1, size.width * 0.6, size.height * 0.8);

        // Draw Dead Zone (Near Field)
        const deadZoneHeight = 40 * (1 - sensitivity);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(size.width * 0.2, size.height * 0.1, size.width * 0.6, deadZoneHeight);
        ctx.fillStyle = '#666';
        ctx.font = '10px Inter';
        ctx.fillText('DEAD ZONE', size.width * 0.2 + 5, size.height * 0.1 + 15);

        // Draw Vertical Pins
        for (let i = 0; i < 6; i++) {
          const y = size.height * 0.2 + i * (size.height * 0.6 / 5);
          const alpha = y / size.height > depth ? 0 : sensitivity;
          ctx.fillStyle = `rgba(181, 148, 78, ${alpha})`;
          ctx.beginPath();
          ctx.arc(size.width * 0.5, y, 3, 0, Math.PI * 2);
          ctx.fill();

          if (i === 0) ctx.fillText('VERTICAL PINS (DISTANCE ACCURACY)', size.width * 0.5 + 10, y + 5);
        }

        // Draw Horizontal Pins
        for (let i = 0; i < 3; i++) {
          const x = size.width * 0.3 + i * (size.width * 0.4 / 2);
          const y = size.height * 0.5;
          const alpha = y / size.height > depth ? 0 : sensitivity;
          ctx.fillStyle = `rgba(181, 148, 78, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Cyst (Anechoic)
        ctx.strokeStyle = '#444';
        ctx.beginPath();
        ctx.arc(size.width * 0.7, size.height * 0.7, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillText('CYST (CONTRAST)', size.width * 0.7 - 20, size.height * 0.7 + 35);

        // Draw Penetration Limit
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(size.width * 0.2, size.height * depth);
        ctx.lineTo(size.width * 0.8, size.height * depth);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('PENETRATION LIMIT', size.width * 0.8 + 5, size.height * depth);
      } else if (type === 'DigitalLogicVisual') {
        const bits = Math.floor(1 + p1 * 7); // 1-8 bits
        const pixels = Math.floor(4 + p2 * 28); // 4-32 pixels per side
        const shades = Math.pow(2, bits);
        
        const cellSize = (size.width * 0.6) / pixels;
        const startX = size.width * 0.2;
        const startY = size.height * 0.1;

        for (let i = 0; i < pixels; i++) {
          for (let j = 0; j < pixels; j++) {
            // Create a "pattern" based on i, j
            const val = (Math.sin(i * 0.2) * Math.cos(j * 0.2) + 1) / 2;
            const shadeIdx = Math.floor(val * shades);
            const gray = (shadeIdx / (shades - 1)) * 255;
            
            ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
            ctx.fillRect(startX + i * cellSize, startY + j * cellSize, cellSize, cellSize);
          }
        }
        
        ctx.fillStyle = "#fff";
        ctx.font = "12px Inter";
        ctx.fillText(`${bits} BITS = ${shades} SHADES OF GRAY`, size.width * 0.2, size.height * 0.9 + 10);
        ctx.fillText(`${pixels}x${pixels} PIXELS`, size.width * 0.2, size.height * 0.9 + 25);

      } else if (type === 'PulseEchoPrincipleVisual') {
        const depth = 0.2 + p1 * 0.7;
        const prf = 1 + p2 * 9;
        const speed = 2;
        
        const targetX = size.width * depth;
        const pulsePos = (frame * speed * prf * 0.1) % (targetX * 2);
        
        // Transducer
        ctx.fillStyle = "#333";
        ctx.fillRect(0, size.height * 0.4, 20, size.height * 0.2);
        
        // Target
        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(targetX, size.height * 0.3);
        ctx.lineTo(targetX, size.height * 0.7);
        ctx.stroke();
        
        // Pulse
        if (pulsePos < targetX) {
          // Outgoing
          ctx.strokeStyle = "#3b82f6";
          ctx.beginPath();
          ctx.arc(pulsePos, size.height / 2, 10, -Math.PI / 4, Math.PI / 4);
          ctx.stroke();
          ctx.fillText("TRANSMIT", pulsePos, size.height / 2 - 20);
        } else {
          // Returning
          const returnPos = targetX - (pulsePos - targetX);
          ctx.strokeStyle = "#10b981";
          ctx.beginPath();
          ctx.arc(returnPos, size.height / 2, 10, Math.PI * 0.75, Math.PI * 1.25);
          ctx.stroke();
          ctx.fillText("ECHO", returnPos, size.height / 2 - 20);
        }
        
        const time = (targetX * 2) / speed;
        ctx.fillStyle = "#fff";
        ctx.fillText(`ROUND TRIP TIME: ${time.toFixed(1)} μs`, 30, size.height * 0.9);
      } else if (type === 'PhysicalPrinciplesVisual') {
        const freq = 1 + p1 * 9;
        const amp = p2 * (size.height / 3);
        
        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < size.width; x++) {
          const y = size.height / 2 + Math.sin(x * freq * 0.05 - frame * 0.1) * amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Labels
        const wavelength = (Math.PI * 2) / (freq * 0.05);
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(size.width / 2, size.height / 2 - amp);
        ctx.lineTo(size.width / 2, size.height / 2 + amp);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText("AMPLITUDE", size.width / 2 + 5, size.height / 2);
        
        ctx.beginPath();
        ctx.moveTo(size.width / 2, size.height / 2 + amp + 20);
        ctx.lineTo(size.width / 2 + wavelength, size.height / 2 + amp + 20);
        ctx.stroke();
        ctx.fillText("WAVELENGTH", size.width / 2, size.height / 2 + amp + 35);

      } else if (type === 'PropagationArtifactsVisual') {
        const speedError = (p1 - 0.5) * 500; // -250 to 250 m/s
        const refraction = p2 * 30; // 0-30 degrees
        
        // Target (Real)
        ctx.fillStyle = "rgba(181, 148, 78, 0.3)";
        ctx.beginPath();
        ctx.arc(size.width / 2, size.height / 2, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText("REAL TARGET", size.width / 2 - 30, size.height / 2 - 15);
        
        // Artifact (Displaced)
        const displacement = speedError * 0.1;
        const refX = Math.sin(refraction * Math.PI / 180) * 50;
        
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(size.width / 2 + refX, size.height / 2 + displacement, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText("ARTIFACT", size.width / 2 + refX - 20, size.height / 2 + displacement + 25);
        
        // Beam Path
        ctx.strokeStyle = "rgba(181, 148, 78, 0.5)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, size.height / 2);
        ctx.lineTo(size.width / 2 + refX, size.height / 2 + displacement);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = "#fff";
        ctx.fillText(`SPEED ERROR: ${speedError > 0 ? '+' : ''}${speedError.toFixed(0)} m/s`, 20, 30);
        ctx.fillText(speedError > 0 ? "TARGET PLACED TOO SHALLOW" : "TARGET PLACED TOO DEEP", 20, 45);

      } else if (type === 'AttenuationArtifactsVisual') {
        const attenuation = p1;
        const reflectivity = p2;
        
        // Strong Reflector (e.g., Gallstone)
        const reflectorX = size.width * 0.4;
        const reflectorY = size.height / 2;
        
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(reflectorX, reflectorY, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Shadowing
        const shadowAlpha = attenuation * 0.8;
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
        ctx.fillRect(reflectorX - 20, reflectorY, 40, size.height / 2);
        ctx.fillStyle = "#666";
        ctx.fillText("SHADOWING", reflectorX - 30, reflectorY + 50);
        
        // Weak Reflector (e.g., Cyst)
        const cystX = size.width * 0.7;
        const cystY = size.height / 2;
        
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.arc(cystX, cystY, 20, 0, Math.PI * 2);
        ctx.stroke();
        
        // Enhancement
        const enhancementAlpha = (1 - reflectivity) * 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${enhancementAlpha})`;
        ctx.fillRect(cystX - 20, cystY + 20, 40, size.height / 2);
        ctx.fillStyle = "#fff";
        ctx.fillText("ENHANCEMENT", cystX - 40, cystY + 50);

      } else if (type === 'DopplerPrincipleVisual') {
        const velocity = p1 * 100;
        const angle = (p2 - 0.5) * Math.PI; // -90 to 90 degrees
        
        // Vessel
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 40;
        ctx.beginPath();
        ctx.moveTo(0, size.height / 2);
        ctx.lineTo(size.width, size.height / 2);
        ctx.stroke();
        
        // RBCs
        const rbcCount = 10;
        for (let i = 0; i < rbcCount; i++) {
          const x = (frame * velocity * 0.1 + i * (size.width / rbcCount)) % size.width;
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(x, size.height / 2, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Beam
        const beamX = size.width / 2;
        const beamY = 50;
        ctx.strokeStyle = "rgba(181, 148, 78, 0.5)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(beamX, beamY);
        ctx.lineTo(beamX + Math.sin(angle) * 100, size.height / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        const cosTheta = Math.cos(angle);
        const shift = velocity * cosTheta;
        ctx.fillStyle = "#fff";
        ctx.fillText(`ANGLE: ${(angle * 180 / Math.PI).toFixed(0)}°`, 20, 30);
        ctx.fillText(`COS(θ): ${cosTheta.toFixed(2)}`, 20, 45);
        ctx.fillText(`DOPPLER SHIFT: ${shift.toFixed(1)} kHz`, 20, 60);

      } else if (type === 'NonLinearPropagationVisual') {
        const intensity = p1;
        const depth = p2;
        
        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < size.width; x++) {
          const dist = x / size.width;
          const distortion = dist * intensity * 20;
          const y = size.height / 2 + Math.sin(x * 0.05 - frame * 0.1 + Math.sin(x * 0.05) * distortion * 0.1) * 40;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillText("WAVE DISTORTION (NON-LINEAR)", 20, 30);

      } else if (type === 'HarmonicImagingVisual') {
        const intensity = p1;
        const filter = p2; // 0: Fundamental, 1: Harmonic
        
        ctx.font = "12px Inter";
        ctx.fillStyle = "white";
        ctx.fillText(`NON-LINEAR PROPAGATION (Intensity: ${(intensity * 100).toFixed(0)}%)`, 20, 30);

        // 1. Fundamental Wave (Blue)
        ctx.strokeStyle = `rgba(59, 130, 246, ${1 - filter})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < size.width; x++) {
          const y = size.height * 0.4 + Math.sin(x * 0.05 - frame * 0.1) * 30;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = `rgba(59, 130, 246, ${1 - filter})`;
        ctx.fillText("FUNDAMENTAL (f₀)", 20, size.height * 0.4 - 40);

        // 2. Harmonic Wave (Green) - Generated by non-linear distortion
        ctx.strokeStyle = `rgba(16, 185, 129, ${filter > 0.2 ? filter : 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < size.width; x++) {
          // Double frequency, smaller amplitude, grows with intensity
          const y = size.height * 0.7 + Math.sin(x * 0.1 - frame * 0.2) * (15 * intensity);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = `rgba(16, 185, 129, ${filter > 0.2 ? filter : 0.2})`;
        ctx.fillText("2nd HARMONIC (2f₀)", 20, size.height * 0.7 - 20);

        if (filter > 0.5) {
          ctx.fillStyle = "#10b981";
          ctx.fillText("FILTERING FUNDAMENTAL... HARMONIC IMAGE ONLY", size.width / 2 - 100, size.height - 20);
        }
      } else if (type === 'ArtifactsVisual') {
        const typeIdx = Math.floor(p1 * 5.99); // 0: Reverberation, 1: Mirror, 2: Shadowing, 3: Enhancement, 4: Side Lobes, 5: Grating Lobes
        const centerX = size.width / 2;
        const centerY = size.height / 2;
        const strength = p2;

        if (typeIdx === 0) {
          // Reverberation (Comet Tail)
          const spacing = 10 + (1 - strength) * 20;
          ctx.fillStyle = "white";
          ctx.beginPath(); ctx.arc(centerX, 40, 6, 0, Math.PI * 2); ctx.fill();
          
          for (let i = 0; i < 15; i++) {
            const y = 55 + i * spacing;
            const width = 30 * Math.exp(-i * 0.2); // Tapering effect
            const alpha = (0.8 - i * 0.05) * strength;
            if (alpha <= 0) break;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(centerX - width / 2, y, width, 2);
            
            // Add some "noise" to make it look more like a comet tail
            if (strength > 0.5) {
                ctx.fillRect(centerX - width / 4, y + 2, width / 2, 1);
            }
          }
          ctx.fillStyle = "white";
          ctx.fillText("REVERBERATION / COMET TAIL", centerX - 80, size.height - 20);
        } else if (typeIdx === 1) {
          // Mirror Image
          const mirrorY = centerY + 20;
          ctx.strokeStyle = "rgba(255,255,255,0.8)";
          ctx.lineWidth = 4;
          ctx.beginPath(); 
          ctx.moveTo(0, mirrorY); 
          ctx.bezierCurveTo(size.width * 0.3, mirrorY - 20, size.width * 0.7, mirrorY + 20, size.width, mirrorY);
          ctx.stroke();
          ctx.fillStyle = "white";
          ctx.fillText("STRONG REFLECTOR (DIAPHRAGM)", 10, mirrorY - 25);
          
          const objX = centerX;
          const objY = mirrorY - 50;
          const dist = mirrorY - objY;
          
          // Real Object
          ctx.fillStyle = "#ef4444";
          ctx.beginPath(); ctx.arc(objX, objY, 15, 0, Math.PI * 2); ctx.fill();
          ctx.fillText("REAL OBJECT", objX + 20, objY);
          
          // Mirror Artifact (Equidistant on the other side)
          const artY = mirrorY + dist;
          ctx.globalAlpha = 0.5 * strength;
          ctx.beginPath(); ctx.arc(objX, artY, 15, 0, Math.PI * 2); ctx.fill();
          ctx.fillText("MIRROR ARTIFACT", objX + 20, artY + 5);
          ctx.globalAlpha = 1;
          
          // Beam path
          ctx.strokeStyle = "rgba(181, 148, 78, 0.3)";
          ctx.setLineDash([5, 5]);
          ctx.beginPath(); ctx.moveTo(centerX - 100, 0); ctx.lineTo(objX, objY); ctx.lineTo(objX, mirrorY); ctx.lineTo(objX, artY); ctx.stroke();
          ctx.setLineDash([]);
        } else if (typeIdx === 2) {
          // Shadowing
          ctx.fillStyle = "#475569";
          ctx.beginPath(); ctx.arc(centerX, 60, 30, 0, Math.PI * 2); ctx.fill();
          ctx.fillText("HIGH ATTENUATOR (STONE)", centerX + 40, 65);
          
          const shadowWidth = 60 + (1 - strength) * 20;
          const grad = ctx.createLinearGradient(0, 90, 0, size.height);
          grad.addColorStop(0, `rgba(0,0,0,${0.4 + strength * 0.5})`);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.fillRect(centerX - shadowWidth / 2, 90, shadowWidth, size.height - 90);
          
          // Edge shadowing (refraction)
          ctx.fillStyle = `rgba(0,0,0,${strength * 0.8})`;
          ctx.fillRect(centerX - shadowWidth / 2 - 2, 90, 4, size.height - 90);
          ctx.fillRect(centerX + shadowWidth / 2 - 2, 90, 4, size.height - 90);
          
          ctx.fillStyle = "white";
          ctx.fillText("ACOUSTIC SHADOW", centerX - 50, size.height - 20);
        } else if (typeIdx === 3) {
          // Enhancement
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath(); ctx.arc(centerX, 60, 30, 0, Math.PI * 2); ctx.fill();
          ctx.fillText("LOW ATTENUATOR (CYST)", centerX + 40, 65);
          
          const grad = ctx.createLinearGradient(0, 90, 0, size.height);
          grad.addColorStop(0, `rgba(255,255,255,${0.1 + strength * 0.4})`);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.fillRect(centerX - 30, 90, 60, size.height - 90);
          ctx.fillStyle = "white";
          ctx.fillText("POSTERIOR ENHANCEMENT", centerX - 70, size.height - 20);
        } else if (typeIdx === 4) {
          // Side Lobes
          ctx.fillStyle = "rgba(181, 148, 78, 0.8)";
          ctx.beginPath(); ctx.arc(centerX, centerY, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillText("REAL OBJECT", centerX - 30, centerY - 20);
          
          const lobeAngle = 0.4;
          const lobeDist = 100;
          const artX = centerX + Math.sin(lobeAngle) * lobeDist;
          const artY = centerY;
          
          ctx.fillStyle = `rgba(239, 68, 68, ${0.2 + strength * 0.5})`;
          ctx.beginPath(); ctx.arc(artX, artY, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillText("SIDE LOBE ARTIFACT", artX - 40, artY + 25);
          
          // Main Beam
          ctx.strokeStyle = "rgba(255,255,255,0.1)";
          ctx.setLineDash([5, 5]);
          ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, size.height); ctx.stroke();
          
          // Side Lobe Beam
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.1 + strength * 0.2})`;
          ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(artX, artY); ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Grating Lobes (Array transducers)
          ctx.fillStyle = "rgba(181, 148, 78, 0.8)";
          ctx.beginPath(); ctx.arc(centerX, centerY, 12, 0, Math.PI * 2); ctx.fill();
          
          for (let i = -1; i <= 1; i++) {
            if (i === 0) continue;
            const angle = i * 0.6;
            const dist = 120;
            const artX = centerX + Math.sin(angle) * dist;
            const artY = centerY + 20;
            
            ctx.fillStyle = `rgba(239, 68, 68, ${0.1 + strength * 0.4})`;
            ctx.beginPath(); ctx.arc(artX, artY, 6, 0, Math.PI * 2); ctx.fill();
            
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.05 + strength * 0.1})`;
            ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(artX, artY); ctx.stroke();
          }
          ctx.fillStyle = "white";
          ctx.fillText("GRATING LOBES (ARRAY ARTIFACT)", centerX - 80, size.height - 20);
        }

      } else if (type === 'TransducerAnatomyVisual') {
        const pztThickness = 30 * (1 - p1) + 5;
        const dampingEfficiency = p2;
        const centerX = size.width / 2;
        const centerY = size.height / 2;
        
        // 1. Damping Material (Backing)
        ctx.fillStyle = "#475569";
        ctx.fillRect(centerX - 60, centerY - 80, 120, 60);
        ctx.fillStyle = "white";
        ctx.font = "10px Inter";
        ctx.fillText("DAMPING MATERIAL", centerX - 50, centerY - 50);
        
        // 2. PZT Crystal
        ctx.fillStyle = "#B5944E";
        ctx.fillRect(centerX - 60, centerY - 20, 120, pztThickness);
        ctx.fillStyle = "white";
        ctx.fillText("PZT CRYSTAL", centerX - 40, centerY - 20 + pztThickness / 2 + 5);
        
        // 3. Matching Layer
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(centerX - 60, centerY - 20 + pztThickness, 120, 10);
        ctx.fillStyle = "white";
        ctx.fillText("MATCHING LAYER", centerX - 45, centerY - 20 + pztThickness + 20);
        
        // 4. Acoustic Gel (Simulation)
        ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
        ctx.fillRect(centerX - 80, centerY - 20 + pztThickness + 10, 160, 40);
        ctx.fillStyle = "white";
        ctx.fillText("GEL", centerX - 10, centerY - 20 + pztThickness + 35);

        // Labels
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(centerX + 65, centerY - 50); ctx.lineTo(centerX + 100, centerY - 50); ctx.stroke();
        ctx.fillText("Reduces Ringing", centerX + 105, centerY - 47);
        
        ctx.beginPath(); ctx.moveTo(centerX + 65, centerY - 20 + pztThickness + 5); ctx.lineTo(centerX + 100, centerY - 20 + pztThickness + 5); ctx.stroke();
        ctx.fillText("Reduces Impedance Mismatch", centerX + 105, centerY - 20 + pztThickness + 8);
        ctx.setLineDash([]);
      } else if (type === 'ArrayTypesVisual') {
        const typeIdx = Math.floor(p1 * 3);
        const steer = (p2 - 0.5) * 0.5;
        
        const elements = 20;
        const elWidth = (size.width * 0.6) / elements;
        
        for (let i = 0; i < elements; i++) {
          const x = size.width * 0.2 + i * elWidth;
          const y = size.height * 0.2;
          
          ctx.fillStyle = "#333";
          ctx.fillRect(x, y, elWidth - 2, 20);
          
          // Beam
          ctx.fillStyle = "rgba(181, 148, 78, 0.1)";
          ctx.beginPath();
          ctx.moveTo(x + elWidth / 2, y + 20);
          
          if (typeIdx === 0) {
            // Linear
            ctx.lineTo(x + elWidth / 2, size.height * 0.8);
            ctx.lineTo(x + elWidth / 2 + elWidth, size.height * 0.8);
            ctx.lineTo(x + elWidth / 2 + elWidth, y + 20);
          } else if (typeIdx === 1) {
            // Phased (Sector)
            const angle = steer + (i - elements / 2) * 0.05;
            ctx.lineTo(size.width / 2 + Math.sin(angle) * 200, size.height * 0.8);
          } else {
            // Convex
            const arcAngle = (i - elements / 2) * 0.1;
            ctx.lineTo(size.width / 2 + Math.sin(arcAngle) * 200, size.height * 0.8);
          }
          ctx.fill();
        }
        const names = ["LINEAR SEQUENTIAL", "PHASED ARRAY", "CONVEX CURVILINEAR"];
        ctx.fillStyle = "#fff";
        ctx.fillText(names[typeIdx], size.width * 0.2, size.height * 0.15);

      } else if (type === 'BeamFocusingVisual') {
        const focus = 0.2 + p1 * 0.6;
        const freq = 1 + p2 * 9;
        
        const focalDepth = size.height * focus;
        const nzLength = (size.width * 0.4) / (1 / freq); // simplified
        
        ctx.strokeStyle = "rgba(181, 148, 78, 0.5)";
        ctx.beginPath();
        // Upper boundary
        ctx.moveTo(0, size.height * 0.3);
        ctx.bezierCurveTo(size.width * 0.2, size.height * 0.3, size.width * focus, size.height * 0.45, size.width, size.height * 0.2);
        // Lower boundary
        ctx.moveTo(0, size.height * 0.7);
        ctx.bezierCurveTo(size.width * 0.2, size.height * 0.7, size.width * focus, size.height * 0.55, size.width, size.height * 0.8);
        ctx.stroke();
        
        // Focal Point
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(size.width * focus, size.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText("FOCAL POINT (NARROWEST)", size.width * focus - 60, size.height / 2 - 15);
        
        ctx.fillStyle = "#fff";
        ctx.fillText("NEAR ZONE (FRESNEL)", size.width * focus * 0.3, size.height / 2);
        ctx.fillText("FAR ZONE (FRAUNHOFER)", size.width * focus + 50, size.height / 2);

      } else if (type === 'AliasingVisual') {
        const scale = p1 * 100;
        const prf = p2 * 50 + 10;
        const nyquist = prf;
        
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath(); ctx.moveTo(0, size.height / 2 - nyquist); ctx.lineTo(size.width, size.height / 2 - nyquist); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, size.height / 2 + nyquist); ctx.lineTo(size.width, size.height / 2 + nyquist); ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillText("NYQUIST LIMIT (PRF/2)", 10, size.height / 2 - nyquist - 5);

        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < size.width; x++) {
          let shift = Math.sin(x * 0.05 + frame * 0.1) * scale;
          // Aliasing logic
          if (Math.abs(shift) > nyquist) {
            shift = ((shift + nyquist) % (nyquist * 2)) - nyquist;
          }
          const y = size.height / 2 - shift;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.fillText(scale > nyquist ? "ALIASING DETECTED" : "NORMAL FLOW", 20, 30);

      } else if (type === 'ColorDopplerVisual') {
        const velocity = (p1 - 0.5) * 100;
        const variance = p2;
        
        const boxWidth = size.width * 0.6;
        const boxHeight = size.height * 0.4;
        const startX = size.width * 0.2;
        const startY = size.height * 0.3;
        
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(startX, startY, boxWidth, boxHeight);
        ctx.fillText("COLOR BOX", startX, startY - 10);
        
        for (let i = 0; i < 20; i++) {
          for (let j = 0; j < 10; j++) {
            const x = startX + i * (boxWidth / 20);
            const y = startY + j * (boxHeight / 10);
            
            // Velocity to Color mapping (BART: Blue Away, Red Towards)
            const v = velocity + (Math.random() - 0.5) * velocity * variance;
            const alpha = Math.min(1, Math.abs(v) / 50);
            const color = v > 0 ? `rgba(239, 68, 68, ${alpha})` : `rgba(59, 130, 246, ${alpha})`;
            
            ctx.fillStyle = color;
            ctx.fillRect(x, y, boxWidth / 20 - 1, boxHeight / 10 - 1);
          }
        }
        ctx.fillStyle = "#fff";
        ctx.fillText(velocity > 0 ? "FLOW TOWARDS (RED)" : "FLOW AWAY (BLUE)", startX, startY + boxHeight + 20);

      } else if (type === 'TissueInteractionVisual') {
        // Boundary with reflection and refraction
        const mismatch = p1;
        const angle = (p2 - 0.5) * Math.PI * 0.5; // -45 to 45 degrees
        
        const centerX = size.width / 2;
        const centerY = size.height / 2;
        
        // Draw Boundary
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, size.height); ctx.stroke();
        ctx.setLineDash([]);

        // Incident Beam
        const incLen = 100;
        const incX = centerX - Math.cos(angle) * incLen;
        const incY = centerY - Math.sin(angle) * incLen;
        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(incX, incY); ctx.lineTo(centerX, centerY); ctx.stroke();
        
        // Reflected Beam (Intensity based on mismatch)
        const refX = centerX - Math.cos(-angle) * incLen;
        const refY = centerY - Math.sin(-angle) * incLen;
        ctx.strokeStyle = `rgba(181, 148, 78, ${mismatch})`;
        ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(refX, refY); ctx.stroke();

        // Refracted Beam (Bending based on angle)
        const refractAngle = angle * 1.5; // Exaggerated bend
        const refrX = centerX + Math.cos(refractAngle) * incLen;
        const refrY = centerY + Math.sin(refractAngle) * incLen;
        ctx.strokeStyle = `rgba(181, 148, 78, ${1 - mismatch})`;
        ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(refrX, refrY); ctx.stroke();

        // Labels
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "10px Inter";
        ctx.fillText("MEDIUM 1", 20, 20);
        ctx.fillText("MEDIUM 2", size.width - 70, 20);
      } else if (type === 'TransducerAnatomyVisual') {
        // Transducer layers and pulse generation
        const thickness = (1 - p1) * 40 + 10;
        const damping = p2;
        
        const txWidth = 120;
        const txX = 50;
        const txY = size.height / 2;

        // Backing Material
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(txX, txY - 40, 40, 80);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillText("BACKING", txX + 5, txY - 45);

        // PZT Crystal
        ctx.fillStyle = "#B5944E";
        ctx.fillRect(txX + 40, txY - 40, thickness, 80);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText("PZT", txX + 40, txY - 45);

        // Matching Layer
        ctx.fillStyle = "#475569";
        ctx.fillRect(txX + 40 + thickness, txY - 40, 10, 80);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText("MATCH", txX + 40 + thickness, txY - 45);

        // Pulse
        const pulseStart = txX + 50 + thickness;
        const pulseX = (frame * 3) % (size.width - pulseStart) + pulseStart;
        const cycles = Math.max(1, 5 - damping * 4);
        const wavelength = thickness / 2;

        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let i=0; i<cycles * wavelength; i++) {
          const x = pulseX - i;
          if (x < pulseStart) continue;
          const y = txY + Math.sin(i * (Math.PI * 2 / wavelength)) * 20;
          if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (type === 'ArrayTypesVisual') {
        // Different array footprints and steering
        const arrayType = p1 < 0.33 ? 'linear' : (p1 < 0.66 ? 'phased' : 'convex');
        const steer = (p2 - 0.5) * 0.6;
        
        ctx.fillStyle = "rgba(181, 148, 78, 0.2)";
        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 2;
        
        const startY = 20;
        const centerX = size.width / 2;
        
        if (arrayType === 'linear') {
          // Rectangular footprint
          ctx.strokeRect(centerX - 60, startY, 120, 15);
          // Elements
          for(let i=0; i<12; i++) {
            ctx.strokeRect(centerX - 60 + i * 10, startY, 10, 15);
          }
          ctx.beginPath();
          ctx.moveTo(centerX - 60, startY + 15);
          ctx.lineTo(centerX - 60 + steer * 100, size.height);
          ctx.lineTo(centerX + 60 + steer * 100, size.height);
          ctx.lineTo(centerX + 60, startY + 15);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = "white";
          ctx.fillText("LINEAR ARRAY (RECTANGULAR)", centerX - 80, startY + 35);
        } else if (arrayType === 'phased') {
          // Small sector footprint
          ctx.strokeRect(centerX - 15, startY, 30, 15);
          // Elements
          for(let i=0; i<3; i++) {
            ctx.strokeRect(centerX - 15 + i * 10, startY, 10, 15);
          }
          ctx.beginPath();
          ctx.moveTo(centerX - 15, startY + 15);
          const angle = Math.PI/3;
          ctx.lineTo(centerX + Math.sin(-angle + steer) * 250, startY + Math.cos(-angle + steer) * 250);
          ctx.lineTo(centerX + Math.sin(angle + steer) * 250, startY + Math.cos(angle + steer) * 250);
          ctx.lineTo(centerX + 15, startY + 15);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = "white";
          ctx.fillText("PHASED ARRAY (SECTOR)", centerX - 70, startY + 35);
        } else {
          // Curved footprint
          ctx.beginPath();
          ctx.arc(centerX, startY - 40, 80, 0.3 * Math.PI, 0.7 * Math.PI);
          ctx.stroke();
          // Elements
          for(let i=0; i<8; i++) {
            const a = 0.3 * Math.PI + i * (0.4 * Math.PI / 7);
            ctx.strokeRect(centerX + Math.cos(a) * 80 - 5, startY - 40 + Math.sin(a) * 80, 10, 5);
          }
          ctx.beginPath();
          ctx.moveTo(centerX - 65, startY + 25);
          ctx.lineTo(centerX - 120 + steer * 50, size.height);
          ctx.lineTo(centerX + 120 + steer * 50, size.height);
          ctx.lineTo(centerX + 65, startY + 25);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = "white";
          ctx.fillText("CONVEX ARRAY (BLUNTED SECTOR)", centerX - 90, startY + 50);
        }
      } else if (type === 'BeamFocusingVisual') {
        // Beam narrowing and widening
        const focusDepth = p1 * (size.height - 100) + 50;
        const freq = p2;
        
        const txWidth = 80;
        const centerX = size.width / 2;
        
        // Transducer
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(centerX - txWidth/2, 10, txWidth, 20);
        
        // Beam Shape
        ctx.fillStyle = "rgba(181, 148, 78, 0.2)";
        ctx.strokeStyle = "rgba(181, 148, 78, 0.5)";
        ctx.beginPath();
        ctx.moveTo(centerX - txWidth/2, 30);
        ctx.lineTo(centerX - 2, focusDepth); // Focus point
        ctx.lineTo(centerX - 40 - freq * 40, size.height); // Divergence
        ctx.lineTo(centerX + 40 + freq * 40, size.height);
        ctx.lineTo(centerX + 2, focusDepth);
        ctx.lineTo(centerX + txWidth/2, 30);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        // Focal Marker
        ctx.strokeStyle = "#22c55e";
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(0, focusDepth); ctx.lineTo(size.width, focusDepth); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#22c55e";
        ctx.fillText("FOCUS", 10, focusDepth - 5);
      } else if (type === 'PulseEchoPrincipleVisual') {
        // Range equation and 13us rule
        const depth = p1 * (size.height - 100) + 50;
        const speed = 1450 + p2 * 200; // 1450 to 1650 m/s
        
        const centerX = size.width / 2;
        const txY = 20;
        
        // Target
        ctx.fillStyle = "#B5944E";
        ctx.beginPath(); ctx.arc(centerX, txY + depth, 8, 0, Math.PI*2); ctx.fill();
        
        // Pulse/Echo
        const totalTime = (depth * 2) / (speed / 1000); // arbitrary time units
        const currentTime = (frame * 0.5) % (totalTime + 20);
        
        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 3;
        
        if (currentTime < totalTime / 2) {
          // Pulse going down
          const y = txY + (currentTime / (totalTime / 2)) * depth;
          ctx.beginPath(); ctx.moveTo(centerX - 20, y); ctx.lineTo(centerX + 20, y); ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fillText("TRANSMITTING...", centerX + 30, y);
        } else if (currentTime < totalTime) {
          // Echo coming back
          const y = txY + depth - ((currentTime - totalTime/2) / (totalTime / 2)) * depth;
          ctx.strokeStyle = "rgba(181, 148, 78, 0.6)";
          ctx.beginPath(); ctx.moveTo(centerX - 15, y); ctx.lineTo(centerX + 15, y); ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fillText("RECEIVING...", centerX + 30, y);
        }
        
        // Data Overlay
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(10, size.height - 60, 180, 50);
        ctx.fillStyle = "#B5944E";
        ctx.font = "bold 12px Inter";
        const timeUs = (depth / (speed / 1000000)) * 2 * 0.01; // simplified us calculation
        ctx.fillText(`TIME: ${Math.round(timeUs)} µs`, 20, size.height - 40);
        ctx.fillText(`SPEED: ${Math.round(speed)} m/s`, 20, size.height - 20);
        
        // 13us Rule Reference
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "10px Inter";
        ctx.fillText("Soft Tissue: 13µs/cm", 20, size.height - 70);
      } else if (type === 'PropagationArtifactsVisual') {
        const artType = p1 < 0.33 ? 'reverb' : (p1 < 0.66 ? 'mirror' : 'speed');
        const centerX = size.width / 2;
        
        if (artType === 'reverb') {
          // Equally spaced echoes
          ctx.strokeStyle = "#B5944E";
          for(let i=0; i<5; i++) {
            const y = 50 + i * 40;
            ctx.globalAlpha = 1 / (i + 1);
            ctx.beginPath(); ctx.moveTo(centerX - 40, y); ctx.lineTo(centerX + 40, y); ctx.stroke();
          }
          ctx.globalAlpha = 1;
        } else if (artType === 'mirror') {
          // Duplication across a strong reflector
          ctx.strokeStyle = "white";
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(0, size.height/2); ctx.lineTo(size.width, size.height/2); ctx.stroke();
          
          ctx.fillStyle = "#B5944E";
          ctx.beginPath(); ctx.arc(centerX, size.height/2 - 40, 15, 0, Math.PI*2); ctx.fill();
          ctx.globalAlpha = 0.4;
          ctx.beginPath(); ctx.arc(centerX, size.height/2 + 40, 15, 0, Math.PI*2); ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          // Speed error (step-off)
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.fillRect(centerX, 0, centerX, size.height);
          ctx.strokeStyle = "#B5944E";
          ctx.beginPath(); ctx.moveTo(centerX - 60, size.height/2); ctx.lineTo(centerX, size.height/2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(centerX, size.height/2 + 20); ctx.lineTo(centerX + 60, size.height/2 + 20); ctx.stroke();
        }
      } else if (type === 'AttenuationArtifactsVisual') {
        const isShadow = p1 < 0.5;
        const centerX = size.width / 2;
        
        // Structure
        ctx.fillStyle = isShadow ? "#475569" : "#38bdf8";
        ctx.beginPath(); ctx.arc(centerX, 60, 30, 0, Math.PI*2); ctx.fill();
        
        // Artifact
        const gradient = ctx.createLinearGradient(0, 90, 0, size.height);
        if (isShadow) {
          gradient.addColorStop(0, "rgba(0,0,0,0.6)");
          gradient.addColorStop(1, "transparent");
        } else {
          gradient.addColorStop(0, "rgba(255,255,255,0.3)");
          gradient.addColorStop(1, "transparent");
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - 30, 90, 60, size.height - 90);
      } else if (type === 'WaveParametersVisual') {
        // Simple sine wave with labels for period/wavelength
        const freq = p1 * 5 + 1;
        const amp = p2 * 60 + 10;
        
        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 3;
        ctx.beginPath();
        for(let x=0; x<size.width; x++) {
          const y = size.height/2 + Math.sin(x * (freq * 0.05) + frame * 0.1) * amp;
          if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Wavelength Marker
        const wavelength = (Math.PI * 2) / (freq * 0.05);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath(); ctx.moveTo(50, size.height/2 - amp - 10); ctx.lineTo(50 + wavelength, size.height/2 - amp - 10); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText("WAVELENGTH", 50, size.height/2 - amp - 20);
      } else if (type === 'DopplerPrincipleVisual') {
        // Moving target and shift calculation
        const velocity = p1 * 100;
        const angle = p2 * Math.PI / 2; // 0 to 90 degrees
        
        const centerX = size.width / 2;
        const centerY = size.height / 2;
        
        // Vessel
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(0, centerY - 20, size.width, 40);
        
        // Particles
        ctx.fillStyle = "#ef4444";
        for(let i=0; i<10; i++) {
          const x = (frame * (velocity * 0.1) + i * 50) % size.width;
          ctx.beginPath(); ctx.arc(x, centerY, 3, 0, Math.PI*2); ctx.fill();
        }
        
        // Transducer Beam
        const beamLen = 100;
        const txX = centerX - Math.cos(angle) * beamLen;
        const txY = centerY - 60 - Math.sin(angle) * beamLen;
        ctx.strokeStyle = "rgba(181, 148, 78, 0.5)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(txX, txY); ctx.lineTo(centerX, centerY); ctx.stroke();
        ctx.setLineDash([]);
        
        // Data Overlay
        const shift = Math.cos(angle) * velocity;
        ctx.fillStyle = "#B5944E";
        ctx.font = "bold 14px Inter";
        ctx.fillText(`SHIFT: ${Math.round(shift)} Hz`, 20, 40);
        ctx.font = "10px Inter";
        ctx.fillText(`ANGLE: ${Math.round(angle * 180 / Math.PI)}°`, 20, 60);
      } else if (type === 'BioeffectMechanismsVisual') {
        const isThermal = p1 < 0.5;
        const intensity = p2;
        const centerX = size.width / 2;
        const centerY = size.height / 2;

        if (isThermal) {
          // Thermal Effect: Heating
          const heatRadius = 40 + intensity * 60;
          const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, heatRadius);
          grad.addColorStop(0, `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(centerX, centerY, heatRadius, 0, Math.PI*2); ctx.fill();
          
          // Temperature indicator
          ctx.fillStyle = "white";
          ctx.font = "bold 14px Inter";
          ctx.fillText(`TI: ${(intensity * 3).toFixed(1)}`, centerX - 20, centerY + 5);
          ctx.font = "10px Inter";
          ctx.fillText("THERMAL INDEX (HEATING)", centerX - 60, centerY + 80);
        } else {
          // Mechanical Effect: Cavitation
          const bubbleCount = Math.floor(intensity * 20) + 5;
          ctx.fillStyle = "rgba(56, 189, 248, 0.6)";
          for(let i=0; i<bubbleCount; i++) {
            const angle = (i / bubbleCount) * Math.PI * 2 + frame * 0.05;
            const dist = 30 + Math.sin(frame * 0.1 + i) * 10;
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;
            const r = 2 + Math.sin(frame * 0.2 + i) * 2;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
            
            if (intensity > 0.7 && i % 3 === 0) {
              // Bursting effect
              ctx.strokeStyle = "white";
              ctx.beginPath(); ctx.arc(x, y, r + 5, 0, Math.PI*2); ctx.stroke();
            }
          }
          
          ctx.fillStyle = "white";
          ctx.font = "bold 14px Inter";
          ctx.fillText(`MI: ${(intensity * 1.9).toFixed(1)}`, centerX - 20, centerY + 5);
          ctx.font = "10px Inter";
          ctx.fillText("MECHANICAL INDEX (CAVITATION)", centerX - 80, centerY + 80);
        }
      } else if (type === 'SafetyIndicesVisual') {
        const ti = p1 * 3;
        const mi = p2 * 2;
        const centerX = size.width / 2;
        const centerY = size.height / 2;
        
        // 1. TI Bar & Heating Visualization
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(50, 60, 200, 20);
        const tiColor = ti > 1.5 ? "#ef4444" : (ti > 0.7 ? "#eab308" : "#22c55e");
        ctx.fillStyle = tiColor;
        ctx.fillRect(50, 60, (ti / 3) * 200, 20);
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Inter";
        ctx.fillText(`TI (THERMAL): ${ti.toFixed(1)}`, 50, 50);
        
        // Heating Visualization
        const heatRadius = 20 + (ti / 3) * 40;
        const heatGrad = ctx.createRadialGradient(size.width - 100, 70, 0, size.width - 100, 70, heatRadius);
        heatGrad.addColorStop(0, tiColor + "66");
        heatGrad.addColorStop(1, "transparent");
        ctx.fillStyle = heatGrad;
        ctx.beginPath(); ctx.arc(size.width - 100, 70, heatRadius, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "10px Inter";
        ctx.fillText("TISSUE HEATING", size.width - 140, 130);

        // 2. MI Bar & Cavitation Visualization
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(50, 160, 200, 20);
        const miColor = mi > 1.0 ? "#ef4444" : (mi > 0.4 ? "#eab308" : "#22c55e");
        ctx.fillStyle = miColor;
        ctx.fillRect(50, 160, (mi / 2) * 200, 20);
        ctx.fillStyle = "white";
        ctx.fillText(`MI (MECHANICAL): ${mi.toFixed(1)}`, 50, 150);
        
        // Cavitation Visualization
        const bubbleCount = Math.floor(mi * 10) + 2;
        for(let i=0; i<bubbleCount; i++) {
            const x = size.width - 100 + Math.cos(i + frame * 0.05) * 30;
            const y = 170 + Math.sin(i + frame * 0.05) * 30;
            const r = 2 + Math.sin(frame * 0.1 + i) * 3 * mi;
            ctx.fillStyle = miColor + "99";
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
            if (mi > 1.2 && i % 2 === 0) {
                ctx.strokeStyle = "white";
                ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI*2); ctx.stroke();
            }
        }
        ctx.fillStyle = "white";
        ctx.fillText("CAVITATION RISK", size.width - 140, 220);

        // ALARA Principle
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(50, 240, size.width - 100, 60);
        ctx.fillStyle = "white";
        ctx.font = "italic 11px Inter";
        ctx.fillText("ALARA: As Low As Reasonably Achievable", 60, 260);
        ctx.fillText("Minimize power, maximize gain to protect tissue.", 60, 280);

        if (ti > 1.5 || mi > 1.0) {
          const alpha = 0.5 + Math.sin(frame * 0.2) * 0.5;
          ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
          ctx.font = "bold 14px Inter";
          ctx.fillText("⚠️ EXPOSURE LIMIT EXCEEDED", 60, 320);
        }
      } else if (type === 'FlowPatternsVisual') {
        const isLaminar = p1 < 0.5;
        const velocity = p2 * 10;
        const centerX = size.width / 2;
        const centerY = size.height / 2;
        
        // Vessel Walls
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(20, centerY - 60); ctx.lineTo(size.width - 20, centerY - 60); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(20, centerY + 60); ctx.lineTo(size.width - 20, centerY + 60); ctx.stroke();
        
        // Particles (RBCs)
        ctx.fillStyle = "#ef4444";
        for(let i=0; i<60; i++) {
          const row = (i % 11) - 5; // -5 to 5
          const y = centerY + row * 10;
          
          // Parabolic velocity profile for laminar flow
          const r_ratio = Math.abs(row) / 6;
          const speedMult = isLaminar ? (1 - r_ratio * r_ratio) : 1;
          const x = (frame * velocity * speedMult + (i * 25)) % (size.width - 60) + 30;
          
          if (!isLaminar) {
            // Add chaotic motion for turbulent flow
            const offset = Math.sin(frame * 0.3 + i) * 10 * (p2 + 0.5);
            const eddyX = Math.cos(frame * 0.2 + i) * 8;
            ctx.beginPath(); ctx.arc(x + eddyX, y + offset, 3, 0, Math.PI*2); ctx.fill();
          } else {
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
          }
        }
        
        // Velocity Profile Visualization
        ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let r=-5; r<=5; r++) {
          const y = centerY + r * 10;
          const r_ratio = Math.abs(r) / 6;
          const speedMult = isLaminar ? (1 - r_ratio * r_ratio) : 1;
          const vLen = 40 * speedMult;
          ctx.moveTo(centerX - 80, y);
          ctx.lineTo(centerX - 80 + vLen, y);
        }
        ctx.stroke();
        
        ctx.fillStyle = "white";
        ctx.font = "12px Inter";
        ctx.fillText(isLaminar ? "LAMINAR FLOW (PARABOLIC PROFILE)" : "TURBULENT FLOW (CHAOTIC PROFILE)", 20, 30);
        ctx.font = "10px Inter";
        ctx.fillText("Velocity Profile", centerX - 100, centerY - 75);
      } else if (type === 'PhysicalPrinciplesVisual') {
        const stiffness = p1; // Bulk Modulus
        const density = p2;
        // Speed = sqrt(Stiffness / Density)
        const speed = 1000 + (stiffness * 2000) - (density * 1000);
        const centerX = size.width / 2;
        
        // Medium Representation
        // Higher density = darker/more particles
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(40, 40, size.width - 80, size.height - 80);
        
        ctx.fillStyle = `rgba(181, 148, 78, ${0.1 + density * 0.5})`;
        for(let i=0; i<100 * density; i++) {
          ctx.beginPath(); 
          ctx.arc(40 + Math.random() * (size.width - 80), 40 + Math.random() * (size.height - 80), 1, 0, Math.PI*2); 
          ctx.fill();
        }
        
        // Wave traveling through
        const waveX = (frame * (speed / 50)) % (size.width - 80) + 40;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(waveX, 40); ctx.lineTo(waveX, size.height - 40); ctx.stroke();
        
        // Wavefronts
        for(let i=1; i<4; i++) {
          const prevX = (waveX - i * 40 + (size.width - 80)) % (size.width - 80) + 40;
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.5 / i})`;
          ctx.beginPath(); ctx.moveTo(prevX, 40); ctx.lineTo(prevX, size.height - 40); ctx.stroke();
        }

        // Data Display
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Inter";
        ctx.fillText(`PROPAGATION SPEED: ${Math.round(speed)} m/s`, 50, size.height - 20);
        
        ctx.font = "10px Inter";
        ctx.fillText(`Stiffness (↑ Speed): ${(stiffness * 100).toFixed(0)}%`, 50, 60);
        ctx.fillText(`Density (↓ Speed): ${(density * 100).toFixed(0)}%`, 50, 75);
        
        if (speed > 1540) {
          ctx.fillStyle = "#22c55e";
          ctx.fillText("Faster than Soft Tissue (1540 m/s)", 50, 95);
        } else {
          ctx.fillStyle = "#ef4444";
          ctx.fillText("Slower than Soft Tissue (1540 m/s)", 50, 95);
        }
      } else if (type === 'QaPhantomVisual') {
        const resolution = p1; // Higher p1 = better resolution (smaller pins)
        const sensitivity = p2; // Higher p2 = better visibility (brighter pins)
        const centerX = size.width / 2;
        
        // 1. Phantom Block
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(40, 40, size.width - 80, size.height - 80);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.strokeRect(40, 40, size.width - 80, size.height - 80);
        
        // 2. Axial/Lateral Resolution Pins
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + sensitivity * 0.9})`;
        const pinRadius = 4 - resolution * 3;
        
        // Axial Pins (Vertical row)
        for(let i=0; i<6; i++) {
          const y = 60 + i * 25;
          ctx.beginPath(); ctx.arc(centerX - 40, y, pinRadius, 0, Math.PI*2); ctx.fill();
          // Closely spaced pair to test resolution
          ctx.beginPath(); ctx.arc(centerX - 40, y + (5 - resolution * 4), pinRadius, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillText("AXIAL", centerX - 60, 55);

        // Lateral Pins (Horizontal row)
        for(let i=0; i<6; i++) {
          const x = centerX + i * 20;
          ctx.beginPath(); ctx.arc(x, 150, pinRadius, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillText("LATERAL", centerX, 140);

        // 3. Cystic Mass (Anechoic)
        ctx.fillStyle = "black";
        ctx.beginPath(); ctx.arc(centerX + 60, 80, 20, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.fillText("CYST", centerX + 50, 75);

        // 4. Solid Mass (Hyperechoic)
        ctx.fillStyle = `rgba(255,255,255, ${0.4 + sensitivity * 0.4})`;
        ctx.beginPath(); ctx.arc(centerX + 60, size.height - 80, 15, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "white";
        ctx.fillText("SOLID", centerX + 50, size.height - 85);

        // Labels
        ctx.font = "12px Inter";
        ctx.fillText("QUALITY ASSURANCE PHANTOM", 50, 30);
      } else if (type === 'KeyParametersVisual') {
        const frequency = p1;
        const power = p2;
        const centerX = size.width / 2;
        
        // 1. Frequency vs Wavelength (Detail)
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let x=0; x<size.width - 40; x++) {
          const wavelength = 40 - (frequency * 35);
          const y = 60 + Math.sin(x * (2 * Math.PI / wavelength)) * 20;
          if(x===0) ctx.moveTo(20 + x, y); else ctx.lineTo(20 + x, y);
        }
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Inter";
        ctx.fillText(`FREQUENCY: ${(2 + frequency * 13).toFixed(1)} MHz (Detail vs Depth)`, 20, 30);
        ctx.font = "10px Inter";
        ctx.fillText(frequency > 0.7 ? "High Detail, Low Penetration" : "Low Detail, High Penetration", 20, 95);

        // 2. Power vs Amplitude (Bioeffects)
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2 + power * 4;
        ctx.beginPath();
        for(let x=0; x<size.width - 40; x++) {
          const amplitude = 5 + power * 40;
          const y = 180 + Math.sin(x * 0.1) * amplitude;
          if(x===0) ctx.moveTo(20 + x, y); else ctx.lineTo(20 + x, y);
        }
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Inter";
        ctx.fillText(`OUTPUT POWER: ${(power * 100).toFixed(0)}% (Bioeffect Risk)`, 20, 130);
        
        if (power > 0.8) {
          ctx.fillStyle = "#ef4444";
          ctx.fillText("ALARA WARNING: Reduce Power if possible", 20, 230);
        } else {
          ctx.fillStyle = "#22c55e";
          ctx.fillText("ALARA: Power is within safe optimization range", 20, 230);
        }
      } else if (type === 'NonLinearPropagationVisual') {
        const intensity = p1;
        const depth = p2;
        
        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let x=0; x<size.width; x++) {
          // Non-linear distortion: compressions move faster
          const phase = frame * 0.1;
          const baseWave = Math.sin(x * 0.1 + phase);
          const distortion = intensity * (x / size.width) * Math.sin(x * 0.2 + phase * 2);
          const y = size.height/2 + (baseWave + distortion) * 40;
          if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText("NON-LINEAR DISTORTION", 10, 30);
      } else if (type === 'HarmonicImagingVisual') {
        const fundamental = p1;
        const harmonic = p2;
        
        // Fundamental Wave
        ctx.strokeStyle = `rgba(181, 148, 78, ${fundamental})`;
        ctx.beginPath();
        for(let x=0; x<size.width; x++) {
          const y = size.height/3 + Math.sin(x * 0.05 + frame * 0.1) * 30;
          if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.fillText("FUNDAMENTAL", 10, size.height/3 - 40);
        
        // Harmonic Wave (2x Frequency)
        ctx.strokeStyle = `rgba(34, 197, 94, ${harmonic})`;
        ctx.beginPath();
        for(let x=0; x<size.width; x++) {
          const y = (size.height * 2/3) + Math.sin(x * 0.1 + frame * 0.2) * 15;
          if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = "#22c55e";
        ctx.fillText("2nd HARMONIC", 10, (size.height * 2/3) - 30);
      } else if (type === 'ReceiverFunctionsVisual') {
        const gain = p1;
        const compress = p2;
        
        // Input Wave (Low Amplitude)
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        for(let x=0; x<size.width/2; x++) {
          const y = 50 + Math.sin(x * 0.1) * 5;
          if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.fillText("INPUT", 10, 30);
        
        // Output Wave (Amplified and Compressed)
        ctx.strokeStyle = "#B5944E";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let x=0; x<size.width/2; x++) {
          const rawAmp = Math.sin(x * 0.1) * (5 + gain * 100);
          // Simple compression logic
          const compressedAmp = Math.sign(rawAmp) * Math.pow(Math.abs(rawAmp), 1 - compress * 0.5);
          const y = 150 + compressedAmp;
          if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.fillText("RECEIVER OUTPUT", 10, 130);
      } else if (type === 'DisplayModesVisual') {
        const mode = p1 < 0.33 ? 'A' : (p1 < 0.66 ? 'B' : 'M');
        const intensity = p2;
        const centerX = size.width / 2;
        
        if (mode === 'A') {
          // A-mode: Amplitude spikes
          ctx.strokeStyle = "#B5944E";
          ctx.beginPath(); ctx.moveTo(50, size.height - 50); ctx.lineTo(size.width - 50, size.height - 50); ctx.stroke();
          ctx.beginPath();
          for(let x=50; x<size.width - 50; x++) {
            let y = size.height - 50;
            if (Math.abs(x - centerX) < 10) y -= 80 * intensity;
            if (Math.abs(x - centerX + 60) < 5) y -= 40 * intensity;
            if(x===50) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.fillStyle = "white";
          ctx.fillText("A-MODE (AMPLITUDE)", 50, 40);
        } else if (mode === 'B') {
          // B-mode: Brightness dots
          ctx.fillStyle = `rgba(181, 148, 78, ${intensity})`;
          ctx.beginPath(); ctx.arc(centerX, size.height/2, 20 * intensity, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "white";
          ctx.fillText("B-MODE (BRIGHTNESS)", 50, 40);
        } else {
          // M-mode: Motion over time
          ctx.strokeStyle = "#B5944E";
          ctx.beginPath();
          for(let x=0; x<size.width; x++) {
            const y = size.height/2 + Math.sin(x * 0.05 + frame * 0.1) * 30 * intensity;
            if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.fillStyle = "white";
          ctx.fillText("M-MODE (MOTION)", 50, 40);
        }
      } else if (type === 'ImageProcessingVisual') {
        const pre = p1;
        const post = p2;
        
        // Original Image
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(20, 50, 100, 100);
        ctx.fillStyle = "white";
        ctx.fillText("RAW DATA", 20, 40);
        
        // Pre-processed (Higher resolution)
        ctx.fillStyle = `rgba(181, 148, 78, ${0.2 + pre * 0.8})`;
        ctx.fillRect(140, 50, 100, 100);
        ctx.fillStyle = "white";
        ctx.fillText("PRE-PROC (WRITE ZOOM)", 140, 40);
        
        // Post-processed (Pixelated)
        ctx.fillStyle = `rgba(181, 148, 78, ${0.2 + post * 0.8})`;
        const pixelSize = 10 - post * 8;
        for(let i=0; i<100; i+=pixelSize) {
          for(let j=0; j<100; j+=pixelSize) {
            ctx.fillRect(260 + i, 50 + j, pixelSize - 1, pixelSize - 1);
          }
        }
        ctx.fillStyle = "white";
        ctx.fillText("POST-PROC (READ ZOOM)", 260, 40);
      } else if (type === 'PulseEchoPrincipleVisual') {
        const speed = 1540; // m/s
        const depth = p1 * 0.15; // cm
        const time = (2 * depth) / (speed / 100); // seconds
        
        // Draw Transducer
        ctx.fillStyle = "#B5944E";
        ctx.fillRect(20, size.height/2 - 20, 10, 40);
        
        // Draw Target
        const targetX = 50 + p1 * 3;
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.arc(targetX, size.height/2, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Pulse animation
        const pulsePos = (frame % 100) / 100;
        const x = pulsePos < 0.5 ? 30 + (pulsePos * 2) * (targetX - 30) : targetX - ((pulsePos - 0.5) * 2) * (targetX - 30);
        
        drawGlowLine(ctx, x - 10, size.height/2, x + 10, size.height/2, pulsePos < 0.5 ? "#B5944E" : "#4ade80", 4, 15);
        
        // Data Overlay
        ctx.fillStyle = "white";
        ctx.font = "10px monospace";
        ctx.fillText(`DEPTH: ${depth.toFixed(2)} cm`, 30, 40);
        ctx.fillText(`TIME: ${(time * 1000).toFixed(2)} ms`, 30, 55);
        ctx.fillText(`SPEED: 1540 m/s`, 30, 70);
        
      } else if (type === 'PhysicalPrinciplesVisual') {
        // Reflection / Refraction
        const angle = (p1 - 50) * 0.01;
        const interfaceX = size.width / 2;
        
        // Media
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(interfaceX, 0, size.width/2, size.height);
        ctx.fillStyle = "white";
        ctx.globalAlpha = 0.3;
        ctx.fillText("MEDIUM 1 (SOFT TISSUE)", 20, 30);
        ctx.fillText("MEDIUM 2 (BONE/LUNG)", interfaceX + 20, 30);
        ctx.globalAlpha = 1.0;
        
        // Incident Beam
        const startY = size.height / 2;
        const incidentX = interfaceX - 100;
        const incidentY = startY - Math.tan(angle) * 100;
        
        drawGlowLine(ctx, incidentX, incidentY, interfaceX, startY, "#B5944E", 3, 10);
        
        // Reflected Beam
        const reflectedX = interfaceX - 100;
        const reflectedY = startY + Math.tan(angle) * 100;
        drawGlowLine(ctx, interfaceX, startY, reflectedX, reflectedY, "rgba(181, 148, 78, 0.4)", 2, 5);
        
        // Refracted Beam
        const refractionIndex = p2 / 50; // Speed ratio
        const refractedAngle = angle * (1/refractionIndex);
        const refractedX = interfaceX + 100;
        const refractedY = startY + Math.tan(refractedAngle) * 100;
        drawGlowLine(ctx, interfaceX, startY, refractedX, refractedY, "#4ade80", 3, 10);
        
      } else if (type === 'PropagationArtifactsVisual') {
        // Mirror Image / Reverberation
        const mode = p1 < 50 ? 'REVERB' : 'MIRROR';
        
        if (mode === 'REVERB') {
          const spacing = 20 + p2 * 0.5;
          for (let i = 0; i < 5; i++) {
            const y = 50 + i * spacing;
            const alpha = 1 - i * 0.2;
            drawGlowLine(ctx, 50, y, size.width - 50, y, `rgba(181, 148, 78, ${alpha})`, 2, 10);
          }
          ctx.fillStyle = "white";
          ctx.fillText("REVERBERATION: EQUALLY SPACED ECHOES", 50, 30);
        } else {
          // Mirror
          const diaphragmY = size.height / 2;
          ctx.strokeStyle = "white";
          ctx.setLineDash([5, 5]);
          drawGlowLine(ctx, 0, diaphragmY, size.width, diaphragmY, "white", 1, 0);
          ctx.setLineDash([]);
          
          // Real Object
          ctx.fillStyle = "#B5944E";
          ctx.beginPath();
          ctx.arc(size.width/2, diaphragmY - 40, 20, 0, Math.PI * 2);
          ctx.fill();
          
          // Mirror Object
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(size.width/2, diaphragmY + 40, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
          
          ctx.fillStyle = "white";
          ctx.fillText("MIRROR IMAGE: DUPLICATION ACROSS REFLECTOR", 50, 30);
        }
        
      } else if (type === 'AttenuationArtifactsVisual') {
        // Shadowing / Enhancement
        const mode = p1 < 50 ? 'SHADOW' : 'ENHANCE';
        
        // Structure
        const structX = size.width / 2;
        const structY = 80;
        ctx.fillStyle = mode === 'SHADOW' ? "#B5944E" : "rgba(181, 148, 78, 0.2)";
        ctx.beginPath();
        ctx.arc(structX, structY, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // Beam
        const beamWidth = 60;
        const gradient = ctx.createLinearGradient(0, structY, 0, size.height);
        if (mode === 'SHADOW') {
          gradient.addColorStop(0, "rgba(0,0,0,0.8)");
          gradient.addColorStop(1, "rgba(0,0,0,0.2)");
        } else {
          gradient.addColorStop(0, "rgba(181, 148, 78, 0.4)");
          gradient.addColorStop(1, "rgba(181, 148, 78, 0.1)");
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(structX - beamWidth/2, structY + 30, beamWidth, size.height - structY - 30);
        
        ctx.fillStyle = "white";
        ctx.fillText(mode === 'SHADOW' ? "SHADOWING: HIGH ATTENUATION" : "ENHANCEMENT: LOW ATTENUATION", 50, 30);
        
      } else {
        // Standard Wave with Cinematic Glow
        ctx.beginPath(); 
        ctx.strokeStyle = "#B5944E"; 
        ctx.lineWidth = isFullscreen ? 6 : 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.shadowBlur = isFullscreen ? 30 : 20;
        ctx.shadowColor = "rgba(181, 148, 78, 0.6)";

        for (let x = 0; x < size.width; x++) {
          const y = size.height/2 + Math.sin(x * (p1 * 0.06 + 0.02) + frame * 0.12) * (p2 * size.height * 0.4 * g);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      drawScanlines();
      animationRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, [type, isPlaying, param1, param2, gain, size, isFullscreen]);

  return (
    <div 
      ref={containerRef}
      className={`bg-slate-950/90 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col transition-all duration-500 ${isSandbox ? 'h-full shadow-3xl' : 'h-full'} ${isFullscreen ? 'p-6' : ''}`}
    >
      <div className={`px-4 md:px-8 py-3 md:py-5 bg-white/[0.04] border-b border-white/10 flex justify-between items-center shrink-0 rounded-t-[1.5rem] md:rounded-t-[2.5rem]`}>
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-[1rem] bg-gold-main/10 flex items-center justify-center border border-gold-main/30 shrink-0">
            <Cpu size={18} className="text-gold-main" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-[6px] md:text-[9px] font-black text-gold-main/60 uppercase tracking-[0.2em] font-mono mb-0.5">RIG_V2_UPLINK</p>
            <h4 className="text-[10px] md:text-sm lg:text-base font-serif font-bold text-white uppercase italic truncate leading-none">{type.replace('Visual', '')}</h4>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={toggleFullscreen}
            className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-gold-main active:scale-90"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className={`w-9 h-9 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-2 flex items-center justify-center transition-all active:scale-90 ${isPlaying ? 'bg-gold-main text-slate-950 border-gold-main shadow-gold' : 'bg-slate-900 text-gold-main border-gold-main/30'}`}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
          </button>
        </div>
      </div>

      <div className={`flex-1 relative bg-black/60 crt-overlay overflow-hidden group min-h-[200px] ${isFullscreen ? 'rounded-2xl my-4' : ''}`}>
        <canvas ref={canvasRef} className="block w-full h-full" style={{ height: size.height }} />
        <div className="absolute bottom-4 left-4 md:bottom-8 md:right-8 md:left-auto p-3 bg-slate-950/90 backdrop-blur-2xl rounded-2xl border border-gold-main/20 max-w-[160px] md:max-w-xs pointer-events-none transition-transform duration-700 shadow-3xl">
          <div className="flex items-center gap-2 mb-1.5 opacity-60">
            <HelpCircle size={10} className="text-gold-main" />
            <span className="text-[8px] font-black uppercase text-gold-main/80 tracking-widest">Logic Hint</span>
          </div>
          <p className="text-[9px] md:text-[11px] text-slate-300 font-serif italic leading-snug">{labels.help}</p>
        </div>
      </div>

      <div className={`p-4 md:p-10 bg-slate-950/80 border-t border-white/5 flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-12 items-center shrink-0 ${isFullscreen ? 'rounded-b-[2.5rem]' : ''}`}>
        <div className="w-full md:col-span-4 space-y-2 md:space-y-3">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2.5 text-gold-main">
              <labels.icon1 size={12} className="md:w-3.5 md:h-3.5" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{labels.p1}</span>
            </div>
            <span className="text-[9px] md:text-xs font-mono text-gold-main font-bold">{param1}%</span>
          </div>
          <input type="range" min="0" max="100" value={param1} onChange={e => setParam1(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold-main" />
        </div>

        <div className="w-full md:col-span-4 flex items-center justify-around md:border-x border-white/5 py-1">
          <div className="flex flex-col items-center gap-2 md:gap-3 group/knob">
            <div className="relative">
                <div className="absolute -inset-2 bg-gold-main/5 blur-xl rounded-full opacity-0 group-hover/knob:opacity-100 transition-opacity"></div>
                <div className={`w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-slate-800 bg-slate-900 flex items-center justify-center shadow-2xl transition-all hover:border-gold-main/40 active:scale-95 cursor-pointer relative z-10`}>
                    <Sliders size={16} className="text-gold-main md:w-5 md:h-5" />
                    <input type="range" min="0" max="100" value={gain} onChange={e => setGain(parseInt(e.target.value))} className="absolute inset-0 opacity-0 cursor-row-resize h-full w-full" />
                </div>
            </div>
            <span className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Master Gain</span>
          </div>
        </div>

        <div className="w-full md:col-span-4 space-y-2 md:space-y-3">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2.5 text-gold-main">
              <labels.icon2 size={12} className="md:w-3.5 md:h-3.5" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{labels.p2}</span>
            </div>
            <span className="text-[9px] md:text-xs font-mono text-gold-main font-bold">{param2}%</span>
          </div>
          <input type="range" min="0" max="100" value={param2} onChange={e => setParam2(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold-main" />
        </div>
      </div>
    </div>
  );
};

export default Simulations;

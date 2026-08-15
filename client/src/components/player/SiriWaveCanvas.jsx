import React, { useEffect, useRef } from 'react';

export default function SiriWaveCanvas({
  isPlaying,
  primaryColor = '#ffffff',
  secondaryColor = '#60a5fa',
  accentColor = '#c084fc',
  height = 90
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let phase = 0;

    const curves = [
      { color: primaryColor, attenuation: 1.0, speed: 0.035, width: 3, opacity: 0.95 },
      { color: secondaryColor, attenuation: 0.7, speed: 0.045, width: 2, opacity: 0.75 },
      { color: accentColor, attenuation: 0.5, speed: 0.025, width: 2, opacity: 0.65 },
      { color: '#ffffff', attenuation: 0.3, speed: 0.055, width: 1.5, opacity: 0.85 }
    ];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      phase += isPlaying ? 0.04 : 0.008;

      // Draw horizontal baseline glow
      const baseGrad = ctx.createLinearGradient(0, 0, width, 0);
      baseGrad.addColorStop(0, 'transparent');
      baseGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      baseGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = baseGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Render each intertwined oscillating sine wave curve
      curves.forEach((c, idx) => {
        ctx.beginPath();
        ctx.strokeStyle = c.color;
        ctx.lineWidth = c.width;
        ctx.globalAlpha = c.opacity;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = isPlaying ? 16 : 4;

        const maxAmplitude = isPlaying ? (height / 2) - 10 : 6;

        for (let x = 0; x < width; x += 2) {
          // Bell curve window to taper waves smoothly to 0 at edges
          const normX = (x / width) * 2 - 1; // -1 to 1
          const window = Math.pow(1 - Math.pow(normX, 2), 2); // smooth gaussian bell

          const freq = 0.025 + (idx * 0.008);
          const currentPhase = phase * (1 + idx * 0.3);
          const y = centerY + Math.sin(x * freq + currentPhase) * maxAmplitude * window * c.attenuation;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, primaryColor, secondaryColor, accentColor, height]);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={height}
      className="w-full h-full pointer-events-none"
    />
  );
}

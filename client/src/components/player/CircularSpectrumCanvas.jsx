import React, { useEffect, useRef } from 'react';

export default function CircularSpectrumCanvas({
  isPlaying,
  primaryColor = '#e5a93c',
  secondaryColor = '#f3c66f',
  size = 400
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const barCount = 64;
    const bars = Array.from({ length: barCount }, (_, i) => ({
      height: 4 + Math.random() * 8,
      speed: 0.08 + Math.random() * 0.06,
      phase: (i / barCount) * Math.PI * 2
    }));

    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const innerRadius = (canvas.width / 2) - 44;

      // Slow, smooth wave oscillation
      frame += isPlaying ? 0.02 : 0.008;

      for (let i = 0; i < barCount; i++) {
        const bar = bars[i];
        const angle = (i / barCount) * Math.PI * 2;

        if (isPlaying) {
          const wave = Math.sin(frame * 2.5 + bar.phase * 2) * 0.5 + 0.5;
          const dynamicH = 4 + (wave * 22);
          bar.height += (dynamicH - bar.height) * bar.speed;
        } else {
          bar.height += (3 - bar.height) * 0.05;
        }

        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * (innerRadius + bar.height);
        const y2 = centerY + Math.sin(angle) * (innerRadius + bar.height);

        // Warm golden horizon gradient
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, primaryColor || '#e5a93c');
        grad.addColorStop(0.6, secondaryColor || '#f3c66f');
        grad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.shadowColor = primaryColor || '#e5a93c';
        ctx.shadowBlur = isPlaying ? 10 : 3;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Little golden spark at peak
        if (isPlaying && bar.height > 18) {
          const sparkDist = innerRadius + bar.height + 3;
          const sx = centerX + Math.cos(angle) * sparkDist;
          const sy = centerY + Math.sin(angle) * sparkDist;
          ctx.fillStyle = '#fffdf0';
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, primaryColor, secondaryColor, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="absolute inset-0 pointer-events-none -z-5"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    />
  );
}

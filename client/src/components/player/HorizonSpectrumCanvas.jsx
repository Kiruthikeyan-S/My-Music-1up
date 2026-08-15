import React, { useEffect, useRef } from 'react';

export default function HorizonSpectrumCanvas({
  isPlaying,
  primaryColor = '#e5a93c',
  secondaryColor = '#f3c66f',
  height = 44
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const barCount = 52;
    const bars = Array.from({ length: barCount }, (_, i) => ({
      height: 3 + Math.random() * 6,
      speed: 0.09 + Math.random() * 0.05,
      phase: (i / barCount) * Math.PI
    }));

    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const centerY = canvas.height / 2;
      const barWidth = Math.max(2, (width / barCount) - 3.5);

      // Slow graceful wave movement
      frame += isPlaying ? 0.025 : 0.008;

      for (let i = 0; i < barCount; i++) {
        const bar = bars[i];
        if (isPlaying) {
          const wave1 = Math.sin(frame * 2.8 + bar.phase * 2) * 0.5 + 0.5;
          const wave2 = Math.cos(frame * 3.5 + i * 0.3) * 0.5 + 0.5;
          const dynamicH = 3 + (wave1 * 14) + (wave2 * 7);
          bar.height += (dynamicH - bar.height) * bar.speed;
        } else {
          bar.height += (2 - bar.height) * 0.06;
        }

        const x = i * (barWidth + 3.5);
        const topY = centerY - bar.height;
        const totalH = bar.height * 2;

        // Golden sunset gradient
        const grad = ctx.createLinearGradient(0, topY, 0, centerY + bar.height);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.25, secondaryColor || '#f3c66f');
        grad.addColorStop(0.5, primaryColor || '#e5a93c');
        grad.addColorStop(0.75, secondaryColor || '#f3c66f');
        grad.addColorStop(1, '#ffffff');

        ctx.fillStyle = grad;
        ctx.shadowColor = primaryColor || '#e5a93c';
        ctx.shadowBlur = isPlaying ? 8 : 2;

        ctx.beginPath();
        ctx.roundRect(x, topY, barWidth, totalH, [2]);
        ctx.fill();
      }

      // Center glowing sunset horizon line
      ctx.strokeStyle = 'rgba(229, 169, 60, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, primaryColor, secondaryColor, height]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={height}
      className="w-full h-full pointer-events-none"
    />
  );
}

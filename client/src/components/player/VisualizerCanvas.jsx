import React, { useEffect, useRef } from 'react';

export default function VisualizerCanvas({ isPlaying, barCount = 32, height = 48, color = '#6366f1' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const bars = Array.from({ length: barCount }, (_, i) => ({
      height: 10 + Math.random() * 20,
      targetHeight: 10 + Math.random() * (height - 10),
      speed: 0.1 + Math.random() * 0.15,
      phase: i * 0.2
    }));

    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = Math.max(2, (canvas.width / barCount) - 3);

      for (let i = 0; i < barCount; i++) {
        const bar = bars[i];
        if (isPlaying) {
          frame += 0.01;
          const wave = Math.sin(frame * 4 + bar.phase) * 0.5 + 0.5;
          const dynamicHeight = 6 + wave * (height - 12);
          bar.height += (dynamicHeight - bar.height) * bar.speed;
        } else {
          bar.height += (4 - bar.height) * 0.1;
        }

        const x = i * (barWidth + 3);
        const y = (canvas.height - bar.height) / 2;

        // Gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + bar.height);
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, '#a855f7');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, bar.height, [2]);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, barCount, height, color]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 7}
      height={height}
      className="w-full h-full opacity-80"
    />
  );
}

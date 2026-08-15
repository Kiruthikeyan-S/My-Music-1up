// Extracts dominant and vibrant colors from an image element or URL via HTML Canvas

export function extractColorsFromImage(imageSrc, callback) {
  if (!imageSrc) {
    callback({
      primary: '#6366f1',
      secondary: '#06b6d4',
      glow: 'rgba(99, 102, 241, 0.5)',
      gradient: 'from-indigo-600/40 via-purple-600/30 to-cyan-500/40'
    });
    return;
  }

  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = imageSrc;

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      ctx.drawImage(img, 0, 0, 64, 64);

      const imageData = ctx.getImageData(0, 0, 64, 64).data;
      let r = 0, g = 0, b = 0, count = 0;
      let maxSaturation = 0;
      let vibrantR = 99, vibrantG = 102, vibrantB = 241;

      for (let i = 0; i < imageData.length; i += 16) {
        const red = imageData[i];
        const green = imageData[i + 1];
        const blue = imageData[i + 2];
        const alpha = imageData[i + 3];

        if (alpha < 128) continue;
        // Ignore almost black or almost white pixels
        if ((red < 25 && green < 25 && blue < 25) || (red > 240 && green > 240 && blue > 240)) continue;

        r += red;
        g += green;
        b += blue;
        count++;

        // Calculate saturation for vibrancy
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const sat = max === 0 ? 0 : (max - min) / max;

        if (sat > maxSaturation) {
          maxSaturation = sat;
          vibrantR = red;
          vibrantG = green;
          vibrantB = blue;
        }
      }

      if (count > 0) {
        const avgR = Math.round(r / count);
        const avgG = Math.round(g / count);
        const avgB = Math.round(b / count);

        const primaryHex = rgbToHex(vibrantR, vibrantG, vibrantB);
        const secondaryHex = rgbToHex(avgR, avgG, avgB);
        const glowRgba = `rgba(${vibrantR}, ${vibrantG}, ${vibrantB}, 0.65)`;

        callback({
          primary: primaryHex,
          secondary: secondaryHex,
          glow: glowRgba,
          rgb: `${vibrantR}, ${vibrantG}, ${vibrantB}`
        });
      } else {
        callback({
          primary: '#6366f1',
          secondary: '#06b6d4',
          glow: 'rgba(99, 102, 241, 0.5)',
          rgb: '99, 102, 241'
        });
      }
    } catch (e) {
      callback({
        primary: '#6366f1',
        secondary: '#06b6d4',
        glow: 'rgba(99, 102, 241, 0.5)',
        rgb: '99, 102, 241'
      });
    }
  };

  img.onerror = () => {
    callback({
      primary: '#6366f1',
      secondary: '#06b6d4',
      glow: 'rgba(99, 102, 241, 0.5)',
      rgb: '99, 102, 241'
    });
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

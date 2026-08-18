// Extracts dominant and vibrant colors from an image element or URL via HTML Canvas

export function extractColorsFromImage(imageSrc, callback) {
  if (!imageSrc) {
    callback({
      primary: '#e5a93c',
      secondary: '#f3c66f',
      glow: 'rgba(229, 169, 60, 0.65)',
      rgb: '229, 169, 60'
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
      let vibrantR = 229, vibrantG = 169, vibrantB = 60;

      for (let i = 0; i < imageData.length; i += 16) {
        const red = imageData[i];
        const green = imageData[i + 1];
        const blue = imageData[i + 2];
        const alpha = imageData[i + 3];

        if (alpha < 128) continue;
        // Ignore pitch black and pure white
        if ((red < 20 && green < 20 && blue < 20) || (red > 245 && green > 245 && blue > 245)) continue;

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
        // If the vibrant color is too dark, brighten it so the lyrics background is vivid and rich
        let lum = 0.299 * vibrantR + 0.587 * vibrantG + 0.114 * vibrantB;
        if (lum < 55) {
          const factor = 65 / (lum || 1);
          vibrantR = Math.min(255, Math.round(vibrantR * factor));
          vibrantG = Math.min(255, Math.round(vibrantG * factor));
          vibrantB = Math.min(255, Math.round(vibrantB * factor));
        }

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
          primary: '#e5a93c',
          secondary: '#f3c66f',
          glow: 'rgba(229, 169, 60, 0.65)',
          rgb: '229, 169, 60'
        });
      }
    } catch (e) {
      callback({
        primary: '#e5a93c',
        secondary: '#f3c66f',
        glow: 'rgba(229, 169, 60, 0.65)',
        rgb: '229, 169, 60'
      });
    }
  };

  img.onerror = () => {
    callback({
      primary: '#e5a93c',
      secondary: '#f3c66f',
      glow: 'rgba(229, 169, 60, 0.65)',
      rgb: '229, 169, 60'
    });
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

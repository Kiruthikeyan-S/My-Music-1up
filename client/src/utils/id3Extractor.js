// Client-side pure Javascript ID3v2 tag and embedded album art extractor

export async function parseAudioFileMetadata(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    // Read first 1.5MB to extract ID3 header, title, artist, and embedded cover art
    const slice = file.slice(0, Math.min(file.size, 1.5 * 1024 * 1024));

    reader.onload = function (e) {
      try {
        const buffer = new Uint8Array(e.target.result);
        const result = {
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Local Artist',
          album: 'Local Music Storage',
          coverDataUrl: null
        };

        // Check for 'ID3' header
        if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
          const version = buffer[3];
          let pos = 10;
          const maxPos = buffer.length - 10;

          while (pos < maxPos) {
            // Read 4-character frame ID
            const frameId = String.fromCharCode(buffer[pos], buffer[pos + 1], buffer[pos + 2], buffer[pos + 3]);
            if (!/^[A-Z0-9]{4}$/.test(frameId)) {
              pos++;
              continue;
            }

            // Read frame size
            let frameSize = 0;
            if (version >= 4) {
              frameSize = (buffer[pos + 4] << 21) | (buffer[pos + 5] << 14) | (buffer[pos + 6] << 7) | buffer[pos + 7];
            } else {
              frameSize = (buffer[pos + 4] << 24) | (buffer[pos + 5] << 16) | (buffer[pos + 6] << 8) | buffer[pos + 7];
            }

            if (frameSize <= 0 || pos + 10 + frameSize > buffer.length) {
              pos += 10;
              continue;
            }

            const frameData = buffer.slice(pos + 10, pos + 10 + frameSize);

            // Title (TIT2)
            if (frameId === 'TIT2') {
              result.title = decodeText(frameData);
            }
            // Artist (TPE1)
            else if (frameId === 'TPE1') {
              result.artist = decodeText(frameData);
            }
            // Album (TALB)
            else if (frameId === 'TALB') {
              result.album = decodeText(frameData);
            }
            // Attached Picture (APIC)
            else if (frameId === 'APIC') {
              const coverUrl = extractApicPicture(frameData);
              if (coverUrl) {
                result.coverDataUrl = coverUrl;
              }
            }

            pos += 10 + frameSize;
          }
        }

        // Clean up title if file name had artist - title format
        if (result.title === file.name.replace(/\.[^/.]+$/, '') && result.title.includes(' - ')) {
          const parts = result.title.split(' - ');
          result.artist = parts[0].trim();
          result.title = parts.slice(1).join(' - ').trim();
        }

        resolve(result);
      } catch (err) {
        console.warn('ID3 parse fallback error:', err);
        resolve({
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Local Artist',
          album: 'Local Music Storage',
          coverDataUrl: null
        });
      }
    };

    reader.onerror = () => {
      resolve({
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local Artist',
        album: 'Local Music Storage',
        coverDataUrl: null
      });
    };

    reader.readAsArrayBuffer(slice);
  });
}

function decodeText(bytes) {
  if (bytes.length === 0) return '';
  const encoding = bytes[0];
  const textBytes = bytes.slice(1);
  try {
    if (encoding === 0) {
      // ISO-8859-1 / ASCII
      return new TextDecoder('iso-8859-1').decode(textBytes).replace(/\0/g, '').trim();
    } else if (encoding === 1 || encoding === 2) {
      // UTF-16
      return new TextDecoder('utf-16').decode(textBytes).replace(/\0/g, '').trim();
    } else {
      // UTF-8
      return new TextDecoder('utf-8').decode(textBytes).replace(/\0/g, '').trim();
    }
  } catch (e) {
    return '';
  }
}

function extractApicPicture(bytes) {
  if (bytes.length < 10) return null;
  let offset = 1; // skip encoding byte

  // Read MIME type (null terminated string)
  let mimeType = 'image/jpeg';
  let mimeEnd = offset;
  while (mimeEnd < bytes.length && bytes[mimeEnd] !== 0) {
    mimeEnd++;
  }
  if (mimeEnd > offset) {
    const rawMime = String.fromCharCode(...bytes.slice(offset, mimeEnd)).toLowerCase();
    if (rawMime.includes('png')) mimeType = 'image/png';
    else if (rawMime.includes('jpg') || rawMime.includes('jpeg')) mimeType = 'image/jpeg';
    else if (rawMime.includes('webp')) mimeType = 'image/webp';
  }
  offset = mimeEnd + 1; // skip null terminator

  // Skip picture type byte (1 byte)
  offset += 1;

  // Skip description (null terminated string)
  while (offset < bytes.length && bytes[offset] !== 0) {
    offset++;
  }
  offset++; // skip null terminator

  // Also skip potential extra 0 byte in UTF-16
  if (offset < bytes.length && bytes[offset] === 0) {
    offset++;
  }

  const imageBytes = bytes.slice(offset);
  if (imageBytes.length < 20) return null;

  // Convert image bytes to Base64 Data URL
  let binary = '';
  const len = imageBytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(imageBytes[i]);
  }
  const base64 = btoa(binary);
  return `data:${mimeType};base64,${base64}`;
}

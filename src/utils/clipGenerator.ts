// Generates a short (3-4s) animated video clip for a scene, entirely in the browser.
//
// Why not a text-to-video API: the rest of this app is deliberately keyless (Pollinations
// for stills, free stock providers for footage) and every hosted text-to-video model is
// paid and rate-limited. So instead of one AI video call we fetch a handful of AI stills
// for the same scene prompt (different seeds => visually related but distinct frames),
// then render them onto an offscreen canvas with Ken Burns motion and crossfades and
// capture that with MediaRecorder. The output is a real webm blob backed by an
// HTMLVideoElement, so it drops straight into the existing per-scene `videoElement` path —
// preview playback and the final canvas recording both pick up the motion for free.

export interface SceneClipOptions {
  prompt: string;
  durationSec?: number; // 3 or 4 in practice
  fps?: number;
  frameCount?: number; // how many stills to blend across the clip
  width?: number;
  height?: number;
  onProgress?: (stage: string) => void;
}

export interface SceneClipResult {
  url: string; // blob: URL for the generated webm
  videoElement: HTMLVideoElement;
  posterUrl: string; // first still, useful as a thumbnail
}

function pickMimeType(): string {
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
}

export function isClipGenerationSupported(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof document.createElement('canvas').captureStream === 'function'
  );
}

function loadImage(url: string, timeoutMs = 30000): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => reject(new Error('Image load timed out')), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error('Image failed to load'));
    };
    img.src = url;
  });
}

async function fetchStill(prompt: string, seed: number): Promise<string> {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visualPrompt: prompt, aspectRatio: '16:9', seed }),
  });
  if (!response.ok) throw new Error('Image generation request failed');
  const data = await response.json();
  if (!data.imageUrl) throw new Error('No image URL returned');
  return data.imageUrl as string;
}

// Cover-fit draw with a per-keyframe Ken Burns move. `progress` runs 0 -> 1 across the
// keyframe's own slot, so each still starts wide and slowly pushes in (or drifts) rather
// than every still sharing one identical motion.
function drawKenBurns(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  progress: number,
  variant: number,
  alpha: number
) {
  const zoomStart = 1.06;
  const zoomEnd = 1.18;
  const zoom = zoomStart + (zoomEnd - zoomStart) * progress;

  // Four alternating drift directions so consecutive keyframes don't move identically.
  const drift = 26;
  const dirs = [
    [drift, -drift * 0.5],
    [-drift, drift * 0.5],
    [drift * 0.4, drift],
    [-drift * 0.4, -drift],
  ];
  const [dx, dy] = dirs[variant % dirs.length];
  const panX = dx * progress;
  const panY = dy * progress;

  // Cover fit: scale so the image fills the frame without letterboxing.
  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight) * zoom;
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, (width - drawW) / 2 + panX, (height - drawH) / 2 + panY, drawW, drawH);
  ctx.restore();
}

export async function generateSceneClip(options: SceneClipOptions): Promise<SceneClipResult> {
  const {
    prompt,
    durationSec = 4,
    fps = 30,
    frameCount = 3,
    width = 1280,
    height = 720,
    onProgress,
  } = options;

  if (!isClipGenerationSupported()) {
    throw new Error('This browser cannot record canvas video (MediaRecorder unavailable).');
  }

  // 1. Fetch the stills in parallel. Distinct seeds keep them varied; the shared prompt
  //    keeps them on-subject so the crossfades read as camera movement, not a slideshow.
  onProgress?.('Generating frames...');
  const seeds = Array.from(
    { length: frameCount },
    (_, i) => 100000 + i * 7919 + Math.floor(Math.random() * 5000)
  );
  const urls = await Promise.all(seeds.map((seed) => fetchStill(prompt, seed)));
  const images = await Promise.all(urls.map((url) => loadImage(url)));

  // 2. Render + record.
  onProgress?.('Rendering clip...');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a 2D canvas context');

  const stream = canvas.captureStream(fps);
  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType, videoBitsPerSecond: 4000000 } : undefined
  );
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const blob = await new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => reject(new Error('Recording the clip failed'));
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType || 'video/webm' }));

    const slot = durationSec / images.length; // seconds each still is on screen
    const fade = Math.min(0.6, slot * 0.35); // crossfade tail length
    const start = performance.now();

    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      if (elapsed >= durationSec) {
        recorder.stop();
        return;
      }

      const idx = Math.min(Math.floor(elapsed / slot), images.length - 1);
      const localT = elapsed - idx * slot;
      const progress = Math.min(localT / slot, 1);

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      drawKenBurns(ctx, images[idx], width, height, progress, idx, 1);

      // Crossfade the next still in over the tail of this slot.
      const next = images[idx + 1];
      if (next && localT > slot - fade) {
        const fadeAlpha = (localT - (slot - fade)) / fade;
        drawKenBurns(ctx, next, width, height, 0, idx + 1, Math.min(fadeAlpha, 1));
      }

      // Vignette so the blend of stills reads as footage rather than a slideshow.
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.35,
        width / 2,
        height / 2,
        height * 0.85
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      requestAnimationFrame(tick);
    };

    recorder.start();
    requestAnimationFrame(tick);
  });

  stream.getTracks().forEach((t) => t.stop());

  // 3. Wrap the blob in a looping, muted video element ready for the canvas renderer.
  const url = URL.createObjectURL(blob);
  const videoElement = document.createElement('video');
  videoElement.src = url;
  videoElement.loop = true;
  videoElement.muted = true;
  videoElement.playsInline = true;

  await new Promise<void>((resolve) => {
    videoElement.onloadeddata = () => resolve();
    videoElement.onerror = () => resolve(); // renderer guards on readyState anyway
    // Safety net: never hang the UI on a media event that doesn't fire.
    setTimeout(resolve, 5000);
  });
  videoElement.play().catch(() => {});

  onProgress?.('Done');
  return { url, videoElement, posterUrl: urls[0] };
}

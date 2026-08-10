export interface DrawVideoFrameOptions {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bgImage: HTMLImageElement | null;
  attachedImage: HTMLImageElement | null;
  logoImage: HTMLImageElement | null;
  activeSceneImage?: HTMLImageElement | null;
  activeSceneVideo?: HTMLVideoElement | null;
  title: string;
  currentCaption: string;
  time: number; // in seconds
  logoPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoAnimationStyle?: 'spin' | 'pulse' | 'glitch' | 'capcut_badge';
  channelName?: string;
  isRecording?: boolean;
}

export function drawVideoFrame(options: DrawVideoFrameOptions) {
  const {
    ctx,
    canvas,
    bgImage,
    attachedImage,
    logoImage,
    activeSceneImage,
    activeSceneVideo,
    title,
    currentCaption,
    time,
    logoPosition = 'top-right',
    logoAnimationStyle = 'capcut_badge',
    channelName = 'ACC PK',
  } = options;

  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // 1. Draw Background Video or Image with smooth zoom / pan effect
  ctx.save();
  const zoomFactor = 1 + (Math.sin(time * 0.2) * 0.05 + 0.02);
  const panX = Math.sin(time * 0.15) * 15;
  const panY = Math.cos(time * 0.1) * 10;

  if (activeSceneVideo && activeSceneVideo.readyState >= 2) {
    // Render HTMLVideoElement frame directly
    ctx.drawImage(activeSceneVideo, 0, 0, width, height);
  } else if (activeSceneImage && activeSceneImage.complete && activeSceneImage.naturalWidth > 0) {
    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.scale(zoomFactor, zoomFactor);
    ctx.drawImage(activeSceneImage, -width / 2, -height / 2, width, height);
  } else if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.scale(zoomFactor, zoomFactor);
    ctx.drawImage(bgImage, -width / 2, -height / 2, width, height);
  } else {
    // Dark dramatic gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f1115');
    grad.addColorStop(0.5, '#1a1c23');
    grad.addColorStop(1, '#08090c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw grid effect
    ctx.strokeStyle = 'rgba(255, 51, 51, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 2. Draw Attached Image / Evidence Inset if present
  if (attachedImage && attachedImage.complete && attachedImage.naturalWidth > 0) {
    const insetWidth = 320;
    const insetHeight = 200;
    const insetX = width - insetWidth - 30;
    const insetY = 100;

    ctx.save();
    // Shadow
    ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
    ctx.shadowBlur = 20;

    // Red border box
    ctx.fillStyle = '#0f1117';
    ctx.fillRect(insetX - 4, insetY - 4, insetWidth + 8, insetHeight + 8);
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 2;
    ctx.strokeRect(insetX - 4, insetY - 4, insetWidth + 8, insetHeight + 8);

    ctx.drawImage(attachedImage, insetX, insetY, insetWidth, insetHeight);

    // Badge label
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(insetX, insetY - 24, 140, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('EVIDENCE PHOTO', insetX + 8, insetY - 8);
    ctx.restore();
  }

  // 3. Dark gradient overlays at top and bottom for broadcast look
  const topGrad = ctx.createLinearGradient(0, 0, 0, 140);
  topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, 140);

  const bottomGrad = ctx.createLinearGradient(0, height - 220, 0, height);
  bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bottomGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.85)');
  bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, height - 220, width, 220);

  // 4. Draw Header Ticker / Channel Branding Bar
  ctx.save();
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(30, 30, 160, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 16px sans-serif';
  ctx.fillText('ACC PK EXPOSÉ', 42, 52);

  // Live indicator pulse
  const pulse = (Math.sin(time * 4) + 1) / 2;
  ctx.fillStyle = `rgba(255, 51, 51, ${0.4 + pulse * 0.6})`;
  ctx.beginPath();
  ctx.arc(210, 46, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('SPECIAL INVESTIGATION', 224, 50);
  ctx.restore();

  // 5. Draw Title Banner
  if (title) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 1;
    ctx.fillRect(30, 80, width * 0.65, 45);
    ctx.strokeRect(30, 80, width * 0.65, 45);

    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 18px sans-serif';
    const displayTitle = title.length > 55 ? title.substring(0, 55) + '...' : title;
    ctx.fillText(displayTitle, 45, 108);
    ctx.restore();
  }

  // 6. Draw Animated CapCut Style Logo Watermark
  ctx.save();
  let logoX = width - 120;
  let logoY = 40;

  if (logoPosition === 'top-left') {
    logoX = 40;
    logoY = 40;
  } else if (logoPosition === 'bottom-right') {
    logoX = width - 120;
    logoY = height - 160;
  } else if (logoPosition === 'bottom-left') {
    logoX = 40;
    logoY = height - 160;
  }

  ctx.translate(logoX, logoY);

  if (logoAnimationStyle === 'spin') {
    ctx.rotate(time * 0.5);
  } else if (logoAnimationStyle === 'pulse') {
    const scale = 1 + Math.sin(time * 3) * 0.08;
    ctx.scale(scale, scale);
  } else if (logoAnimationStyle === 'glitch') {
    const glitchOffset = Math.random() > 0.9 ? (Math.random() - 0.5) * 10 : 0;
    ctx.translate(glitchOffset, 0);
  } else {
    // CapCut Badge style: slight continuous breathing animation + red glowing ring
    const scale = 1 + Math.sin(time * 2) * 0.04;
    ctx.scale(scale, scale);
  }

  if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
    // Glowing backing circle
    ctx.beginPath();
    ctx.arc(35, 35, 38, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 51, 51, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.drawImage(logoImage, 0, 0, 70, 70);
  } else {
    // Default ACC PK Official Logo Watermark
    ctx.beginPath();
    ctx.arc(45, 45, 44, 0, Math.PI * 2);
    ctx.fillStyle = '#0d0e12';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#c5a47e';
    ctx.stroke();

    // Red 'A' shape inside canvas watermark
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.moveTo(45, 14);
    ctx.lineTo(62, 58);
    ctx.lineTo(50, 58);
    ctx.lineTo(45, 46);
    ctx.lineTo(40, 46);
    ctx.lineTo(35, 58);
    ctx.lineTo(23, 58);
    ctx.closePath();
    ctx.fill();

    // White inner triangle cutout
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(45, 24);
    ctx.lineTo(50, 40);
    ctx.lineTo(40, 40);
    ctx.closePath();
    ctx.fill();

    // ACC PK Text badge
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ACC PK', 45, 74);
  }
  ctx.restore();

  // 7. Draw Lower-Third News Ticker (CapCut style broadcast ticker)
  ctx.save();
  const tickerY = height - 100;
  ctx.fillStyle = '#cc0000';
  ctx.fillRect(0, tickerY, 180, 40);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 15px sans-serif';
  ctx.fillText('🔥 ACC PK EXPOSÉ', 15, tickerY + 26);

  ctx.fillStyle = '#111319';
  ctx.fillRect(180, tickerY, width - 180, 40);
  ctx.strokeStyle = '#c5a47e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(180, tickerY);
  ctx.lineTo(width, tickerY);
  ctx.stroke();

  // Scrolling ticker text with official business card details
  const tickerText = `ANTI-CORRUPTION CHANNEL PAKISTAN (ACC PK) • DETERMINE TO BRING PROSPERITY • 'EVIDENCE BASED REPORTING' IS OUR MOTTO • C.E.O: RASHID HAMEED • WHATSAPP: +92 315 433 8690 • EMAIL: ANTICORRUPTIONCHANNEL@GMAIL.COM • ADDRESS: 148 D FAISAL TOWN, LAHORE • `;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#ffffff';

  const textWidth = ctx.measureText(tickerText).width;
  const scrollOffset = (time * 80) % textWidth;

  ctx.save();
  ctx.rect(190, tickerY, width - 200, 40);
  ctx.clip();
  ctx.fillText(tickerText, 190 - scrollOffset, tickerY + 25);
  ctx.fillText(tickerText, 190 - scrollOffset + textWidth, tickerY + 25);
  ctx.restore();
  ctx.restore();

  // 8. Draw Subtitles / Current Caption text
  if (currentCaption) {
    ctx.save();
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';

    const textWidth = ctx.measureText(currentCaption).width;
    const padding = 24;
    const capX = width / 2;
    const capY = height - 130;

    // Background pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 2;

    const pillWidth = Math.min(width - 80, textWidth + padding * 2);
    ctx.beginPath();
    ctx.roundRect(capX - pillWidth / 2, capY - 26, pillWidth, 48, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.fillText(currentCaption, capX, capY + 6);
    ctx.restore();
  }
}

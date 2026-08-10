import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Download, Sparkles, Type, Palette } from 'lucide-react';

interface ThumbnailBuilderProps {
  bgImageUrl: string | null;
  attachedImageUrl: string | null;
  thumbnailText: string;
  channelName: string;
}

export const ThumbnailBuilder: React.FC<ThumbnailBuilderProps> = ({
  bgImageUrl,
  attachedImageUrl,
  thumbnailText,
  channelName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [headline, setHeadline] = useState<string>(thumbnailText || 'ACC PK EXPOSED!');
  const [accentColor, setAccentColor] = useState<string>('#ff3333');
  const [badgeText, setBadgeText] = useState<string>('BIG EXPOSÉ!');

  useEffect(() => {
    if (thumbnailText) {
      setHeadline(thumbnailText);
    }
  }, [thumbnailText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    const renderThumbnail = () => {
      // Clear
      ctx.clearRect(0, 0, width, height);

      // Load background image
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';

      const drawElements = () => {
        if (bgImg.complete && bgImg.naturalWidth > 0) {
          ctx.drawImage(bgImg, 0, 0, width, height);
        } else {
          // Fallback dark gradient
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, '#0f1115');
          grad.addColorStop(0.5, '#1a1c23');
          grad.addColorStop(1, '#08090c');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }

        // Draw Attached Evidence Image Inset if available
        if (attachedImageUrl) {
          const attachedImg = new Image();
          attachedImg.crossOrigin = 'anonymous';
          attachedImg.onload = () => {
            const insetW = 420;
            const insetH = 280;
            const insetX = width - insetW - 40;
            const insetY = 80;

            ctx.save();
            ctx.shadowColor = accentColor;
            ctx.shadowBlur = 25;

            ctx.fillStyle = '#000000';
            ctx.fillRect(insetX - 6, insetY - 6, insetW + 12, insetH + 12);
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 4;
            ctx.strokeRect(insetX - 6, insetY - 6, insetW + 12, insetH + 12);

            ctx.drawImage(attachedImg, insetX, insetY, insetW, insetH);

            ctx.fillStyle = accentColor;
            ctx.fillRect(insetX, insetY - 32, 180, 32);
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 16px sans-serif';
            ctx.fillText('EVIDENCE ATTACHED', insetX + 10, insetY - 10);
            ctx.restore();

            drawOverlays();
          };
          attachedImg.src = attachedImageUrl;
        } else {
          drawOverlays();
        }
      };

      const drawOverlays = () => {
        // Dark gradient overlay at bottom
        const bottomGrad = ctx.createLinearGradient(0, height - 320, 0, height);
        bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        bottomGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.85)');
        bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, height - 320, width, 320);

        // Channel Badge at top left
        ctx.save();
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.roundRect(40, 40, 220, 48, 8);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 22px sans-serif';
        ctx.fillText('ACC PK EXPOSÉ', 55, 72);

        // Badge Text (e.g. "BIG EXPOSÉ!")
        if (badgeText) {
          ctx.fillStyle = '#ffff00';
          ctx.beginPath();
          ctx.roundRect(275, 40, 190, 48, 8);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.font = '900 20px sans-serif';
          ctx.fillText(badgeText, 295, 72);
        }

        // Top Right Official Channel Credit
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('ANTI-CORRUPTION CHANNEL PAKISTAN', width - 40, 52);
        ctx.fillStyle = accentColor;
        ctx.font = 'italic 12px serif';
        ctx.fillText('"DETERMINE TO BRING PROSPERITY" • Rashid Hameed (C.E.O)', width - 40, 72);
        ctx.restore();

        // Main Headline text background bar
        ctx.save();
        const headlineY = height - 160;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.roundRect(40, headlineY, width - 80, 120, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 42px sans-serif';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 12;

        const maxTextWidth = width - 120;
        let displayHeadline = headline.toUpperCase();
        if (ctx.measureText(displayHeadline).width > maxTextWidth) {
          displayHeadline = displayHeadline.slice(0, 35) + '...';
        }

        ctx.fillText(displayHeadline, 70, headlineY + 72);
        ctx.restore();
      };

      if (bgImageUrl) {
        bgImg.onload = drawElements;
        bgImg.src = bgImageUrl;
      } else {
        drawElements();
      }
    };

    renderThumbnail();
  }, [bgImageUrl, attachedImageUrl, headline, accentColor, badgeText, channelName]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `ACC_PK_Thumbnail_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="bg-[#0f1015] border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl md:text-2xl font-serif italic text-white flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-[#c5a47e]" />
            <span>YouTube 16:9 Auto-Thumbnail Builder</span>
          </h3>
          <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
            Generates high-CTR 1280x720 thumbnail with high contrast text overlays, issue evidence highlights, and channel badges.
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="bg-[#c5a47e] hover:bg-white text-black font-semibold px-4 py-2.5 text-xs uppercase tracking-[0.15em] border border-[#c5a47e] flex items-center gap-2 shadow-xl transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download 1280x720 HD Thumbnail</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Thumbnail Preview Box */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative aspect-video w-full bg-black overflow-hidden border border-white/10 shadow-xl">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>
          <p className="text-[11px] text-white/40 text-center uppercase tracking-widest">
            16:9 Ultra HD Thumbnail ready for YouTube Creator Studio.
          </p>
        </div>

        {/* Thumbnail Customizer Controls */}
        <div className="lg:col-span-1 bg-[#121318] p-5 border border-white/10 space-y-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#c5a47e] flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            <span>Customize Headline & Banner</span>
          </h4>

          {/* Headline Text Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a47e] font-semibold"
              placeholder="e.g. ACC PK EXPOSED!"
            />
          </div>

          {/* Badge Text Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">Alert Badge</label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#c5a47e] font-semibold"
              placeholder="e.g. BIG EXPOSÉ!"
            />
          </div>

          {/* Accent Color picker */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#c5a47e]" />
              <span>Accent Color</span>
            </label>
            <div className="flex items-center gap-2">
              {['#c5a47e', '#ff3333', '#eab308', '#2563eb', '#10b981'].map((col) => (
                <button
                  key={col}
                  onClick={() => setAccentColor(col)}
                  className={`w-6 h-6 border transition-transform ${
                    accentColor === col ? 'scale-110 border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          <div className="p-3 bg-white/[0.02] border border-white/10 text-xs text-slate-400 space-y-1">
            <p className="font-serif italic text-sm text-[#c5a47e] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a47e]" /> High CTR Formula
            </p>
            <p className="text-[11px] text-white/50 leading-relaxed font-light">
              YouTube research shows thumbnails with bold concise phrases and high contrast borders generate higher engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

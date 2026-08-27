import React, { useEffect, useRef, useState } from 'react';
import { Phone, Download, Shield, Palette } from 'lucide-react';
import accPkLogoUrl from '../assets/acc-pk-logo.png';

interface ContactCardBuilderProps {
  channelName: string;
  contactEmail: string;
}

// Drawn with canvas text, not an AI image prompt — AI image generators can't reliably
// render exact, legible contact details, and this card's whole point is that the address/
// phone/email are correct and readable when posted standalone (not part of a video scene).
export const ContactCardBuilder: React.FC<ContactCardBuilderProps> = ({ channelName, contactEmail }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const [accentColor, setAccentColor] = useState<string>('#c5a47e');
  const [aspect, setAspect] = useState<'square' | 'portrait'>('square');
  const [logoVersion, setLogoVersion] = useState(0);

  // Official logo — same untouched (background-only-transparent) asset used in the video
  // watermark, not a hand-drawn recreation.
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      logoImgRef.current = img;
      setLogoVersion((v) => v + 1);
    };
    img.src = accPkLogoUrl;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = aspect === 'square' ? 1080 : 1350; // 1:1 or 4:5 (Instagram-safe ratios)
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f1115');
    grad.addColorStop(0.5, '#16181f');
    grad.addColorStop(1, '#08090c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid texture
    ctx.strokeStyle = `${accentColor}14`;
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const cx = width / 2;

    // Official logo badge
    const logoY = height * 0.13;
    const logoRadius = 110;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, logoY, logoRadius + 20, 0, Math.PI * 2);
    ctx.fillStyle = '#0d0e12';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = accentColor;
    ctx.stroke();

    const logoImg = logoImgRef.current;
    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      const size = logoRadius * 2;
      ctx.drawImage(logoImg, cx - logoRadius, logoY - logoRadius, size, size);
    }
    ctx.restore();

    // Channel name
    const textTop = logoY + logoRadius + 15;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 54px sans-serif';
    ctx.fillText(channelName.toUpperCase(), cx, textTop + 48);

    ctx.fillStyle = accentColor;
    ctx.font = 'italic 20px serif';
    ctx.fillText('"DETERMINE TO BRING PROSPERITY"', cx, textTop + 85);
    ctx.font = '600 15px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.letterSpacing = '3px';
    ctx.fillText('EVIDENCE BASED REPORTING', cx, textTop + 113);
    ctx.letterSpacing = '0px';
    ctx.restore();

    // "CONTACT US" banner
    const bannerY = textTop + 155;
    ctx.save();
    ctx.fillStyle = accentColor;
    ctx.fillRect(cx - 200, bannerY, 400, 56);
    ctx.fillStyle = '#000000';
    ctx.font = '900 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CONTACT US', cx, bannerY + 37);
    ctx.restore();

    // Contact detail rows
    const rows: [string, string][] = [
      ['Founder & CEO', 'Rashid Hameed'],
      ['Mobile / WhatsApp', '+92 315 433 8690'],
      ['Landline', '+92 42 3522 1515'],
      ['Email', contactEmail || 'anticorruptionchannel@gmail.com'],
      ['Address', '148 D Faisal Town, Lahore, Pakistan'],
    ];

    let rowY = bannerY + 90;
    const rowGap = 68;
    const boxWidth = width - 160;
    const boxX = 80;
    const rowHeight = 54;

    rows.forEach(([label, value]) => {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.fillRect(boxX, rowY, boxWidth, rowHeight);
      ctx.strokeRect(boxX, rowY, boxWidth, rowHeight);

      ctx.textAlign = 'left';
      ctx.fillStyle = accentColor;
      ctx.font = '700 14px sans-serif';
      ctx.fillText(label.toUpperCase(), boxX + 22, rowY + 20);

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 22px sans-serif';
      let displayValue = value;
      while (ctx.measureText(displayValue).width > boxWidth - 44 && displayValue.length > 10) {
        displayValue = displayValue.slice(0, -4) + '...';
      }
      ctx.fillText(displayValue, boxX + 22, rowY + 43);
      ctx.restore();

      rowY += rowGap;
    });

    // Footer hashtags
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '600 18px sans-serif';
    ctx.fillText('#ACCPK  #AntiCorruptionChannel  #CrushCorruption  #Pakistan', cx, height - 50);
    ctx.restore();
  }, [channelName, contactEmail, accentColor, aspect, logoVersion]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `ACC_PK_Contact_Card_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="bg-[#0f1015] border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl md:text-2xl font-serif italic text-white flex items-center gap-3">
            <Phone className="w-5 h-5 text-[#c5a47e]" />
            <span>Branding & Contact-Us Card</span>
          </h3>
          <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
            A standalone branded graphic — logo, channel name, and exact contact details —
            ready to post on Facebook, Instagram, X, TikTok, or LinkedIn.
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="bg-[#c5a47e] hover:bg-white text-black font-semibold px-4 py-2.5 text-xs uppercase tracking-[0.15em] border border-[#c5a47e] flex items-center gap-2 shadow-xl transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download PNG</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="relative w-full max-w-md mx-auto bg-black overflow-hidden border border-white/10 shadow-xl" style={{ aspectRatio: aspect === 'square' ? '1/1' : '4/5' }}>
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>
          <p className="text-[11px] text-white/40 text-center uppercase tracking-widest">
            {aspect === 'square' ? '1080x1080 — Facebook / Instagram / X square post' : '1080x1350 — Instagram portrait post'}
          </p>
        </div>

        <div className="lg:col-span-1 bg-[#121318] p-5 border border-white/10 space-y-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#c5a47e] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Format & Accent</span>
          </h4>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAspect('square')}
                className={`text-[11px] uppercase tracking-wider py-2 border cursor-pointer transition-colors ${aspect === 'square' ? 'bg-[#c5a47e] text-black border-[#c5a47e]' : 'bg-white/5 text-white/70 border-white/15 hover:text-white'}`}
              >
                Square 1:1
              </button>
              <button
                onClick={() => setAspect('portrait')}
                className={`text-[11px] uppercase tracking-wider py-2 border cursor-pointer transition-colors ${aspect === 'portrait' ? 'bg-[#c5a47e] text-black border-[#c5a47e]' : 'bg-white/5 text-white/70 border-white/15 hover:text-white'}`}
              >
                Portrait 4:5
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">Accent Color</label>
            <div className="flex items-center gap-2">
              {['#c5a47e', '#ff3333', '#eab308', '#2563eb', '#10b981'].map((col) => (
                <button
                  key={col}
                  onClick={() => setAccentColor(col)}
                  className={`w-6 h-6 border transition-transform ${accentColor === col ? 'scale-110 border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          <div className="p-3 bg-white/[0.02] border border-white/10 text-xs text-slate-400 space-y-1">
            <p className="font-serif italic text-sm text-[#c5a47e] flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#c5a47e]" /> Why not AI-generated?
            </p>
            <p className="text-[11px] text-white/50 leading-relaxed font-light">
              AI image models can't reliably render exact phone numbers or addresses —
              this card draws the text directly so every detail is always accurate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Settings, Upload, Mail, BellRing, Sparkles, Shield, Image as ImageIcon } from 'lucide-react';
import { LanguageOption } from '../types';

interface SidebarProps {
  channelName: string;
  setChannelName: (val: string) => void;
  contactEmail: string;
  setContactEmail: (val: string) => void;
  endingCTA: string;
  setEndingCTA: (val: string) => void;
  defaultLanguage: LanguageOption;
  setDefaultLanguage: (val: LanguageOption) => void;
  logoUrl: string | null;
  setLogoUrl: (val: string | null) => void;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  setLogoPosition: (val: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left') => void;
  logoAnimationStyle: 'spin' | 'pulse' | 'glitch' | 'capcut_badge';
  setLogoAnimationStyle: (val: 'spin' | 'pulse' | 'glitch' | 'capcut_badge') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  channelName,
  setChannelName,
  contactEmail,
  setContactEmail,
  endingCTA,
  setEndingCTA,
  defaultLanguage,
  setDefaultLanguage,
  logoUrl,
  setLogoUrl,
  logoPosition,
  setLogoPosition,
  logoAnimationStyle,
  setLogoAnimationStyle,
}) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="bg-[#0f1015]/90 border-r border-white/10 p-6 space-y-6 w-full lg:w-80 shrink-0">
      <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-[#c5a47e] font-serif italic text-base tracking-wide">
        <Settings className="w-4 h-4 text-[#c5a47e]" />
        <span>Channel Branding & Settings</span>
      </div>

      {/* Channel Name */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">
          Channel Name
        </label>
        <input
          type="text"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          className="w-full bg-[#121318] border border-white/10 rounded-none px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c5a47e] transition-colors font-medium"
          placeholder="e.g. ACC PK"
        />
      </div>

      {/* Channel Logo Upload */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#c5a47e]" />
          <span>CapCut Watermark Logo</span>
        </label>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 border border-white/15 bg-[#121318] flex items-center justify-center overflow-hidden shrink-0 relative">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center text-[#c5a47e] text-[9px] font-serif font-bold">
                <Shield className="w-5 h-5 text-[#c5a47e]" />
                <span>ACC PK</span>
              </div>
            )}
          </div>

          <label className="flex-1 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] uppercase tracking-wider text-slate-200 px-3 py-2.5 flex items-center justify-center gap-2 transition-all">
            <Upload className="w-3.5 h-3.5 text-[#c5a47e]" />
            <span>{logoUrl ? 'Change PNG' : 'Upload PNG'}</span>
            <input type="file" accept="image/png,image/jpeg" onChange={handleLogoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Watermark position & style */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase tracking-[0.2em] text-white/40">Position</label>
          <select
            value={logoPosition}
            onChange={(e: any) => setLogoPosition(e.target.value)}
            className="w-full bg-[#121318] border border-white/10 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#c5a47e]"
          >
            <option value="top-right">Top Right</option>
            <option value="top-left">Top Left</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] uppercase tracking-[0.2em] text-white/40">Animation</label>
          <select
            value={logoAnimationStyle}
            onChange={(e: any) => setLogoAnimationStyle(e.target.value)}
            className="w-full bg-[#121318] border border-white/10 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#c5a47e]"
          >
            <option value="capcut_badge">CapCut Shield</option>
            <option value="pulse">Glow Pulse</option>
            <option value="spin">Continuous Spin</option>
            <option value="glitch">Glitch Cyber</option>
          </select>
        </div>
      </div>

      {/* Whistleblower Contact Email */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-[#c5a47e]" />
          <span>Official Channel Email</span>
        </label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="w-full bg-[#121318] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a47e] transition-colors font-mono"
          placeholder="anticorruptionchannel@gmail.com"
        />
      </div>

      {/* Official Card Details Box */}
      <div className="p-4 bg-[#121318] border border-white/10 text-xs text-white/70 space-y-2 font-light">
        <p className="font-serif italic text-sm text-[#c5a47e] flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#c5a47e]" /> Official ACC PK Card
        </p>
        <div className="text-[11px] space-y-1 leading-relaxed">
          <p><strong className="text-white">Founder & CEO:</strong> Rashid Hameed</p>
          <p><strong className="text-white">Address:</strong> 148 D Faisal Town, Lahore, Pakistan</p>
          <p><strong className="text-white">Mobile/WhatsApp:</strong> +92 315 433 8690</p>
          <p><strong className="text-white">Landline:</strong> +92 42 3522 1515</p>
          <p className="italic text-[#c5a47e] pt-1">"DETERMINE TO BRING PROSPERITY"</p>
        </div>
      </div>

      {/* Subscription CTA Hook */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium flex items-center gap-1.5">
          <BellRing className="w-3.5 h-3.5 text-[#c5a47e]" />
          <span>Subscribe CTA Ending Hook</span>
        </label>
        <textarea
          value={endingCTA}
          onChange={(e) => setEndingCTA(e.target.value)}
          rows={3}
          className="w-full bg-[#121318] border border-white/10 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#c5a47e] transition-colors leading-relaxed"
        />
      </div>

      {/* Default Narration Language */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">
          Default Narration Language
        </label>
        <select
          value={defaultLanguage}
          onChange={(e: any) => setDefaultLanguage(e.target.value)}
          className="w-full bg-[#121318] border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#c5a47e]"
        >
          <option value="urdu">🇵🇰 Urdu (اردو)</option>
          <option value="roman_urdu">💬 Roman Urdu</option>
          <option value="punjabi">🌾 Punjabi (پنجابی / ਪੰਜਾਬੀ)</option>
          <option value="english">🇬🇧 English</option>
        </select>
      </div>

      <div className="p-4 bg-white/[0.02] border border-white/10 text-xs text-slate-300 space-y-1.5">
        <p className="font-serif italic text-sm text-[#c5a47e] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#c5a47e]" /> Brand Guarantee
        </p>
        <p className="text-[11px] text-white/60 leading-normal font-light">
          All generated video files, thumbnails, and descriptions automatically include these branding configurations and compliance checks.
        </p>
      </div>
    </aside>
  );
};

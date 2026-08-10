import React from 'react';
import { ShieldAlert, Youtube, Globe, CheckCircle2, Phone, User } from 'lucide-react';
import { AccPkLogo } from './AccPkLogo';

interface HeaderProps {
  channelName: string;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({ channelName }) => {
  return (
    <header className="bg-[#0a0a0c]/95 border-b border-white/10 sticky top-0 z-40 backdrop-blur-md px-6 lg:px-12 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand identity with official Logo */}
        <div className="flex items-center gap-4">
          <AccPkLogo size="sm" showSubtitle={true} className="shrink-0" />
          
          <div className="hidden sm:block border-l border-white/10 pl-4 py-0.5">
            <h1 className="text-lg font-serif italic text-white tracking-wide flex items-center gap-2">
              {channelName || 'ACC PK'}
              <span className="text-[9px] font-sans font-medium tracking-[0.2em] uppercase px-2 py-0.5 bg-white/5 text-[#c5a47e] border border-[#c5a47e]/30">
                Official Studio
              </span>
            </h1>
            <p className="text-[11px] uppercase tracking-[0.15em] text-white/50 flex items-center gap-1.5 mt-0.5 font-light">
              <ShieldAlert className="w-3 h-3 text-red-500" />
              Determine To Bring Prosperity • Evidence Based Reporting
            </p>
          </div>
        </div>

        {/* CEO & Contact Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[0.15em] font-medium text-white/60">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-white/[0.02]">
            <User className="w-3 h-3 text-[#c5a47e]" />
            <span>CEO: <strong className="text-white font-semibold">Rashid Hameed</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-white/[0.02]">
            <Phone className="w-3 h-3 text-[#c5a47e]" />
            <span>WhatsApp / Cell: <strong className="text-white font-semibold">+92 315 433 8690</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-red-900/40 bg-red-950/20 text-red-300">
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>ACC PK Official</span>
          </div>
        </div>
      </div>
    </header>
  );
};


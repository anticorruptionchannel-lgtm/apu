import React, { useRef } from 'react';
import { Sparkles, RefreshCw, Upload, Image as ImageIcon, X, Languages, Film, Layers, AlertCircle } from 'lucide-react';
import { LanguageOption, VideoStyle, PresetIssue } from '../types';
import { PRESET_ISSUES } from '../data/presetIssues';

interface PromptSectionProps {
  userPrompt: string;
  setUserPrompt: (val: string) => void;
  attachedImage: string | null;
  setAttachedImage: (val: string | null) => void;
  selectedLanguage: LanguageOption;
  setSelectedLanguage: (val: LanguageOption) => void;
  selectedStyle: VideoStyle;
  setSelectedStyle: (val: VideoStyle) => void;
  onGenerate: (isRefresh?: boolean) => void;
  isGenerating: boolean;
}

export const PromptSection: React.FC<PromptSectionProps> = ({
  userPrompt,
  setUserPrompt,
  attachedImage,
  setAttachedImage,
  selectedLanguage,
  setSelectedLanguage,
  selectedStyle,
  setSelectedStyle,
  onGenerate,
  isGenerating,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: PresetIssue) => {
    setUserPrompt(preset.prompt);
    setSelectedStyle(preset.suggestedStyle);
  };

  return (
    <div className="bg-[#0f1015] border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl md:text-2xl font-serif italic text-white flex items-center gap-3">
            <span>Investigative News & Issue Prompt</span>
            <span className="text-[9px] font-sans font-medium tracking-[0.2em] uppercase bg-white/5 text-[#c5a47e] border border-[#c5a47e]/30 px-2.5 py-0.5">
              Multi-Lingual + AI Analysis
            </span>
          </h2>
          <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
            Describe any corrupt activity, public issue, bribery case, or attach evidence photos/documents.
          </p>
        </div>

        {/* Preset selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-white/40 whitespace-nowrap flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#c5a47e]" /> Quick Presets:
          </span>
          {PRESET_ISSUES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="text-[10px] uppercase tracking-wider px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 whitespace-nowrap transition-colors cursor-pointer"
            >
              {preset.category}
            </button>
          ))}
        </div>
      </div>

      {/* Main text prompt & attached picture container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Text prompt area */}
        <div className="lg:col-span-3 space-y-2">
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={4}
            className="w-full bg-[#121318] border border-white/10 p-4 text-xs md:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#c5a47e] transition-colors resize-none leading-relaxed font-normal"
            placeholder="Type your news prompt or issue details here (e.g. 'Unlawful diversion of public hospital equipment funds in Lahore', 'Illegal housing scheme encroaching green belts', 'Bribery demands at customs clearance')..."
          />
        </div>

        {/* Issue Picture / Attachment Dropzone */}
        <div className="lg:col-span-1 flex flex-col justify-between bg-[#121318] border border-white/10 p-3.5 relative group">
          <div className="text-[10px] uppercase tracking-[0.15em] font-medium text-white/60 flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#c5a47e]" />
              <span>Evidence Photo</span>
            </span>
            {attachedImage && (
              <button
                onClick={() => setAttachedImage(null)}
                className="text-white/40 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {attachedImage ? (
            <div className="relative w-full h-28 overflow-hidden border border-[#c5a47e]/30">
              <img src={attachedImage} alt="Attached Issue Evidence" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-[9px] uppercase tracking-wider text-[#c5a47e] bg-black/80 px-2 py-0.5 border border-[#c5a47e]/40">
                  Evidence Loaded
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-28 border border-dashed border-white/15 hover:border-[#c5a47e]/60 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors bg-white/[0.01] hover:bg-white/[0.03]"
            >
              <Upload className="w-4 h-4 text-[#c5a47e] mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium text-slate-300">Attach Evidence Photo</span>
              <span className="text-[9px] text-white/40 mt-0.5 uppercase tracking-widest">JPG, PNG, Documents</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Language & Atmosphere Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {/* Voiceover Language Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/60 flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-[#c5a47e]" />
            <span>Voiceover Language</span>
          </label>
          <select
            value={selectedLanguage}
            onChange={(e: any) => setSelectedLanguage(e.target.value)}
            className="w-full bg-[#121318] border border-white/10 px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#c5a47e] font-medium"
          >
            <option value="urdu">🇵🇰 Urdu Narration (اردو)</option>
            <option value="roman_urdu">💬 Roman Urdu (Easy Reading)</option>
            <option value="punjabi">🌾 Punjabi Narration (پنجابی / ਪੰਜਾਬੀ)</option>
            <option value="english">🇬🇧 English Narration</option>
          </select>
        </div>

        {/* Video Style Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/60 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-[#c5a47e]" />
            <span>Atmosphere & Editing Style</span>
          </label>
          <select
            value={selectedStyle}
            onChange={(e: any) => setSelectedStyle(e.target.value)}
            className="w-full bg-[#121318] border border-white/10 px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#c5a47e] font-medium"
          >
            <option value="dramatic">🔥 Dramatic & Serious Exposé</option>
            <option value="breaking_news">🚨 Breaking News Live Broadcast</option>
            <option value="investigative">🔍 Deep Forensic Audit</option>
            <option value="corporate_expose">🏢 Corporate / Govt Transparency</option>
            <option value="short_reel">📱 High-Impact YouTube Short (Vertical)</option>
          </select>
        </div>

        {/* Policy check notice */}
        <div className="sm:col-span-2 lg:col-span-1 flex items-center gap-2.5 bg-white/[0.02] border border-white/10 p-3 text-xs text-slate-300">
          <AlertCircle className="w-4 h-4 text-[#c5a47e] shrink-0" />
          <span className="leading-tight text-[11px] text-white/50 font-light">
            Auto-Polishing checks text against YouTube Guidelines to prevent unverified libel while preserving strong investigative tone.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
        <button
          onClick={() => onGenerate(false)}
          disabled={isGenerating}
          className="w-full bg-[#c5a47e] hover:bg-white text-black font-semibold py-3.5 px-6 border border-[#c5a47e] flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xl"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Compiling ACC PK AI Engine...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-black" />
              <span>Generate Full Video Assets</span>
            </>
          )}
        </button>

        <button
          onClick={() => onGenerate(true)}
          disabled={isGenerating}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium py-3.5 px-6 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-[#c5a47e] ${isGenerating ? 'animate-spin' : ''}`} />
          <span>Refresh Creative Angle</span>
        </button>
      </div>
    </div>
  );
};


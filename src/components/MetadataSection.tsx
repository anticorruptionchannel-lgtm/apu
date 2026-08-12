import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, AlertTriangle, FileText, Hash, Youtube, Mail, BellRing, Share2, Sparkles, Building2, User, Phone } from 'lucide-react';
import { GeneratedMetadata } from '../types';
import { buildOfficialContactBlock, buildSocialMediaPost } from '../utils/brand';
import { AccPkLogo } from './AccPkLogo';

interface MetadataSectionProps {
  metadata: GeneratedMetadata;
  contactEmail: string;
  endingCTA: string;
  channelName: string;
}

export const MetadataSection: React.FC<MetadataSectionProps> = ({
  metadata,
  contactEmail,
  endingCTA,
  channelName,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formattedHashtags = Array.isArray(metadata.hashtags)
    ? metadata.hashtags.join(' ')
    : metadata.hashtags;

  const ALWAYS_SAME_MISSION = `Kickbacks, bribes and nepotism at the expense of public is a common practice in the developing countries. Pakistan can not be excluded. Anti corruption channel (ACC PK) is committed to provide you inside facts above corrupt mafias. 'Evidence based reporting' is our motto. The purpose of establishing this channel is to deal with the wrongdoers, expose their evil designs and stop them from their wrongdoings at all levels. Subscribe the Anti corruption channel and receive all the updates and be part of the team fighting for a corruption free Pakistan.`;

  const ALWAYS_SAME_HASHTAGS = `#ACCPK #AntiCorruptionChannel #RashidHameed #EvidenceBasedReporting #CrushCorruption #DetermineToBringProsperity #Pakistan #StopCorruption #ExposeWrongdoers`;

  const realizedMission = metadata.officialMission || ALWAYS_SAME_MISSION;
  const realizedContactBlock = metadata.officialContact || buildOfficialContactBlock({ channelName, contactEmail, endingCTA });
  const fullSocialMediaPost = buildSocialMediaPost({
    title: metadata.title,
    script: metadata.script,
    hashtags: `${formattedHashtags} ${ALWAYS_SAME_HASHTAGS}`.trim(),
    officialMission: realizedMission,
    officialContact: realizedContactBlock,
    channelName,
    contactEmail,
    endingCTA,
  });

  return (
    <div className="bg-[#0f1015] border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl md:text-2xl font-serif italic text-white flex items-center gap-3">
            <Youtube className="w-5 h-5 text-[#c5a47e]" />
            <span>YouTube & Social Media Metadata Package</span>
          </h3>
          <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
            Optimized description, high-CTR titles, whistleblower contact lines, and official channel statements.
          </p>
        </div>

        {/* Policy Compliance Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 border text-[10px] uppercase tracking-[0.15em] font-medium ${
            metadata.policyStatus?.safe
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-amber-950/40 border-amber-800 text-amber-300'
          }`}
        >
          {metadata.policyStatus?.safe ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>YOUTUBE POLICY SAFE</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>POLICY REVIEW ADVISED</span>
            </>
          )}
        </div>
      </div>

      {/* Official ACC PK Brand Card */}
      <div className="bg-[#121318] p-5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <AccPkLogo size="md" showSubtitle={true} />
        <div className="space-y-1.5 text-xs text-white/70 font-light border-l-0 md:border-l border-white/10 md:pl-6 w-full md:w-auto">
          <p className="text-white font-serif italic text-sm text-[#c5a47e] flex items-center gap-2">
            <User className="w-4 h-4 text-[#c5a47e]" />
            <span>Rashid Hameed (Founder & C.E.O)</span>
          </p>
          <p className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-white/40" />
            <span>148 D Faisal Town, Lahore, Pakistan</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-white/40" />
            <span>+92 315 433 8690 • +92 42 3522 1515</span>
          </p>
          <p className="flex items-center gap-2 text-[#c5a47e] font-mono">
            <Mail className="w-3.5 h-3.5" />
            <span>{contactEmail || 'anticorruptionchannel@gmail.com'}</span>
          </p>
        </div>
      </div>

      {/* Social Media Post Generator (ALWAYS SAME LINES + DYNAMIC SCRIPT) */}
      <div className="bg-[#121318] p-5 border border-[#c5a47e]/30 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#c5a47e] flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#c5a47e]" />
            <span>Ready-to-Post Social Media Package (Facebook / Instagram / WhatsApp / X)</span>
          </label>
          <button
            onClick={() => handleCopy(fullSocialMediaPost, 'socialPost')}
            className="text-[10px] uppercase tracking-wider bg-[#c5a47e] hover:bg-white text-black font-semibold px-4 py-1.5 border border-[#c5a47e] transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg"
          >
            {copiedField === 'socialPost' ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span>Copied Social Post!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-black" />
                <span>Copy Full Social Post</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[11px] text-white/50 leading-relaxed font-light">
          This post automatically includes the dynamic investigative report script, official ACC PK mission statement, CEO contact lines, and standard channel hashtags.
        </p>
        <textarea
          readOnly
          value={fullSocialMediaPost}
          rows={10}
          className="w-full bg-[#0a0a0c] border border-white/10 p-3.5 text-xs text-slate-200 leading-relaxed font-mono resize-none focus:outline-none"
        />
      </div>

      {/* Grid of Copyable Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High-CTR Title & Description Column */}
        <div className="space-y-4">
          {/* Title */}
          <div className="bg-[#121318] p-5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#c5a47e]">
                1. Video Title
              </label>
              <button
                onClick={() => handleCopy(metadata.title, 'title')}
                className="text-[10px] uppercase tracking-wider bg-white/5 hover:bg-white/10 text-slate-200 px-3 py-1 border border-white/10 transition-colors cursor-pointer"
              >
                {copiedField === 'title' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400 inline mr-1" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 inline mr-1 text-[#c5a47e]" />
                    <span>Copy Title</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm font-bold text-white bg-[#0a0a0c] p-3 border border-white/10">
              {metadata.title}
            </p>
          </div>

          {/* Full Description */}
          <div className="bg-[#121318] p-5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#c5a47e] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>2. YouTube Description + Official Mission & Contact</span>
              </label>
              <button
                onClick={() => handleCopy(metadata.description, 'description')}
                className="text-[10px] uppercase tracking-wider bg-white/5 hover:bg-white/10 text-slate-200 px-3 py-1 border border-white/10 transition-colors cursor-pointer"
              >
                {copiedField === 'description' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400 inline mr-1" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 inline mr-1 text-[#c5a47e]" />
                    <span>Copy Description</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={metadata.description}
              rows={9}
              className="w-full bg-[#0a0a0c] border border-white/10 p-3 text-xs text-slate-200 leading-relaxed font-sans resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Script, Hashtags & Policy Compliance Column */}
        <div className="space-y-4">
          {/* SEO Hashtags */}
          <div className="bg-[#121318] p-5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#c5a47e] flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                <span>3. SEO & Official Channel Hashtags</span>
              </label>
              <button
                onClick={() => handleCopy(formattedHashtags, 'hashtags')}
                className="text-[10px] uppercase tracking-wider bg-white/5 hover:bg-white/10 text-slate-200 px-3 py-1 border border-white/10 transition-colors cursor-pointer"
              >
                {copiedField === 'hashtags' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400 inline mr-1" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 inline mr-1 text-[#c5a47e]" />
                    <span>Copy Hashtags</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-[#c5a47e] bg-[#0a0a0c] p-3 border border-white/10 font-mono leading-relaxed">
              {formattedHashtags}
            </p>
          </div>

          {/* Policy Compliance Audit Detail Card */}
          <div className="bg-[#121318] p-5 border border-white/10 space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/60 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Community Guidelines Audit</span>
            </label>
            <div className="bg-[#0a0a0c] p-3 border border-white/10 text-xs text-slate-300 space-y-1.5">
              <p className="leading-relaxed text-white/70 font-light">
                {metadata.policyStatus?.reasoning || 'Passed automated anti-defamation & safety audit.'}
              </p>
              {metadata.policyStatus?.suggestions && (
                <p className="text-amber-300 text-[11px] bg-amber-950/30 p-2 border border-amber-900/40">
                  💡 Suggestion: {metadata.policyStatus.suggestions}
                </p>
              )}
            </div>
          </div>

          {/* Whistleblower & Subscribe Hooks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#121318] p-3 border border-white/10 space-y-1">
              <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-white/40 flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#c5a47e]" /> Contact:
              </span>
              <p className="font-mono text-white text-xs truncate">{contactEmail}</p>
            </div>

            <div className="bg-[#121318] p-3 border border-white/10 space-y-1">
              <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-white/40 flex items-center gap-1">
                <BellRing className="w-3 h-3 text-[#c5a47e]" /> Ending CTA:
              </span>
              <p className="text-white/70 text-[11px] line-clamp-2 font-light">{endingCTA}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

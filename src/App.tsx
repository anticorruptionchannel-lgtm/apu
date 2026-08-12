import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PromptSection } from './components/PromptSection';
import { VideoStudio } from './components/VideoStudio';
import { ThumbnailBuilder } from './components/ThumbnailBuilder';
import { MetadataSection } from './components/MetadataSection';
import { GeneratedMetadata, LanguageOption, VideoStyle } from './types';
import { Shield, Sparkles, Video, Image as ImageIcon, FileText, RefreshCw, AlertCircle, Download } from 'lucide-react';

export default function App() {
  // Channel & Brand Settings
  const [channelName, setChannelName] = useState<string>('ACC PK');
  const [contactEmail, setContactEmail] = useState<string>('anticorruptionchannel@gmail.com');
  const [endingCTA, setEndingCTA] = useState<string>(
    '🔔 Stand up against corruption! Subscribe to ACC PK for daily exposures. Share this video to create a transparent Pakistan!'
  );
  const [defaultLanguage, setDefaultLanguage] = useState<LanguageOption>('urdu');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('top-right');
  const [logoAnimationStyle, setLogoAnimationStyle] = useState<'spin' | 'pulse' | 'glitch' | 'capcut_badge'>('capcut_badge');

  // Input Prompt State
  const [userPrompt, setUserPrompt] = useState<string>(
    'Investigation into unauthorized land acquisition funds and illegal housing scheme encroachments'
  );
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('urdu');
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>('dramatic');

  // Execution & Output State
  const [generationStage, setGenerationStage] = useState<'idle' | 'scripting' | 'image' | 'audio'>('idle');
  const [generationDone, setGenerationDone] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'video' | 'thumbnail' | 'metadata'>('video');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isGenerating = generationStage !== 'idle';

  const [metadata, setMetadata] = useState<GeneratedMetadata | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Core Generation Function
  const handleGenerate = async (isRefresh: boolean = false) => {
    if (!userPrompt.trim() && !attachedImage) {
      setErrorMessage('Please enter a prompt topic or attach an issue photo.');
      return;
    }

    setGenerationStage('scripting');
    setErrorMessage(null);

    try {
      // 1. Request Script, SEO, Scenes & Policy Check
      const contentRes = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt,
          language: selectedLanguage,
          videoStyle: selectedStyle,
          attachedImageBase64: attachedImage,
          channelName,
          contactEmail,
          endingCTA,
          isRefresh,
        }),
      });

      if (!contentRes.ok) {
        const errJson = await contentRes.json();
        throw new Error(errJson.error || 'Failed to generate content script.');
      }

      const contentData: GeneratedMetadata = await contentRes.json();
      setMetadata(contentData);

      // 2. Request AI Background Image Generation
      setGenerationStage('image');
      let bgUrl: string | null = null;
      try {
        const imageRes = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visualPrompt: contentData.visualPrompt || userPrompt,
            aspectRatio: selectedStyle === 'short_reel' ? '1:1' : '16:9',
          }),
        });
        const imageData = await imageRes.json();
        bgUrl = imageData.imageUrl || null;
      } catch (imgErr) {
        console.warn('Image generation error, fallback to default', imgErr);
        bgUrl = `https://picsum.photos/seed/accpk_${Date.now()}/1280/720`;
      }
      setBgImageUrl(bgUrl);

      // 3. Request Speech TTS Audio
      setGenerationStage('audio');
      let speechUrl: string | null = null;
      try {
        const speechRes = await fetch('/api/generate-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: contentData.script,
            voiceName: 'Kore',
          }),
        });
        const speechData = await speechRes.json();
        speechUrl = speechData.audioUrl || null;
      } catch (speechErr) {
        console.warn('Speech generation error, client synthesis fallback enabled', speechErr);
      }
      setAudioUrl(speechUrl);

      setGenerationDone(true);
      setActiveTab('video');
    } catch (err: any) {
      console.error('Error running ACC PK Content Engine:', err);
      setErrorMessage(err.message || 'An error occurred during generation.');
    } finally {
      setGenerationStage('idle');
    }
  };

  const downloadProjectAsZip = async () => {
    if (!metadata) return;
    const zip = new JSZip();

    // Add metadata
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    // Helper to fetch blob
    const fetchBlob = async (url: string) => {
        const response = await fetch(url);
        return await response.blob();
    };

    // Add image
    if (bgImageUrl) {
        const imageBlob = await fetchBlob(bgImageUrl);
        zip.file('thumbnail.png', imageBlob);
    }

    // Add audio
    if (audioUrl) {
        const audioBlob = await fetchBlob(audioUrl);
        zip.file('narration.mp3', audioBlob);
    }

    // Generate zip
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'acc_pk_project.zip');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e5e5e5] flex flex-col font-sans selection:bg-[#c5a47e] selection:text-black">
      {/* Top App Header */}
      <Header channelName={channelName} hasApiKey={true} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 gap-6">
        {/* Left Sidebar for Channel Branding */}
        <Sidebar
          channelName={channelName}
          setChannelName={setChannelName}
          contactEmail={contactEmail}
          setContactEmail={setContactEmail}
          endingCTA={endingCTA}
          setEndingCTA={setEndingCTA}
          defaultLanguage={defaultLanguage}
          setDefaultLanguage={setDefaultLanguage}
          logoUrl={logoUrl}
          setLogoUrl={setLogoUrl}
          logoPosition={logoPosition}
          setLogoPosition={setLogoPosition}
          logoAnimationStyle={logoAnimationStyle}
          setLogoAnimationStyle={setLogoAnimationStyle}
        />

        {/* Right Main Content Workspace */}
        <main className="flex-1 space-y-6 overflow-hidden">
          {/* Prompt Section */}
          <PromptSection
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            attachedImage={attachedImage}
            setAttachedImage={setAttachedImage}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            defaultLanguage={defaultLanguage}
            onGenerate={handleGenerate}
            generationStage={generationStage}
          />

          {/* Error Message Display */}
          {errorMessage && (
            <div className="bg-red-950/40 border border-red-800 text-red-200 p-4 flex items-center gap-3 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Output Navigation Tabs when generation completed */}
          {generationDone && metadata && (
            <div className="space-y-6">
              {/* Tab Selector Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 overflow-x-auto">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('video')}
                        className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all cursor-pointer whitespace-nowrap border ${
                        activeTab === 'video'
                            ? 'bg-[#c5a47e] text-black border-[#c5a47e]'
                            : 'bg-[#0f1015] text-white/60 hover:text-white border-white/10'
                        }`}
                    >
                        <Video className="w-4 h-4" />
                        <span>Video Composition</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('thumbnail')}
                        className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all cursor-pointer whitespace-nowrap border ${
                        activeTab === 'thumbnail'
                            ? 'bg-[#c5a47e] text-black border-[#c5a47e]'
                            : 'bg-[#0f1015] text-white/60 hover:text-white border-white/10'
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        <span>Auto-Thumbnail</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('metadata')}
                        className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all cursor-pointer whitespace-nowrap border ${
                        activeTab === 'metadata'
                            ? 'bg-[#c5a47e] text-black border-[#c5a47e]'
                            : 'bg-[#0f1015] text-white/60 hover:text-white border-white/10'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>SEO & Metadata</span>
                    </button>
                </div>
                <button
                    onClick={downloadProjectAsZip}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] bg-[#c5a47e] text-black border border-[#c5a47e] transition-all cursor-pointer whitespace-nowrap hover:bg-white"
                >
                    <Download className="w-4 h-4" />
                    <span>Download Project ZIP</span>
                </button>
              </div>

              {/* Tab Panels */}
              {activeTab === 'video' && (
                <VideoStudio
                  metadata={metadata}
                  bgImageUrl={bgImageUrl}
                  attachedImageUrl={attachedImage}
                  logoUrl={logoUrl}
                  logoPosition={logoPosition}
                  logoAnimationStyle={logoAnimationStyle}
                  audioUrl={audioUrl}
                  channelName={channelName}
                />
              )}

              {activeTab === 'thumbnail' && (
                <ThumbnailBuilder
                  bgImageUrl={bgImageUrl}
                  attachedImageUrl={attachedImage}
                  thumbnailText={metadata.thumbnailText}
                  channelName={channelName}
                />
              )}

              {activeTab === 'metadata' && (
                <MetadataSection
                  metadata={metadata}
                  contactEmail={contactEmail}
                  endingCTA={endingCTA}
                  channelName={channelName}
                />
              )}
            </div>
          )}

          {/* Initial Placeholder State if not generated yet */}
          {!generationDone && !isGenerating && (
            <div className="bg-[#0f1015] border border-white/10 p-8 text-center space-y-4 max-w-xl mx-auto my-8">
              <div className="w-14 h-14 bg-white/5 border border-[#c5a47e]/30 text-[#c5a47e] flex items-center justify-center mx-auto shadow-2xl">
                <Shield className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif italic text-white">Investigation Studio Ready</h3>
                <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed font-light">
                  Provide an investigation prompt or upload evidence documentation above, select your preferred language, and initialize studio composition.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

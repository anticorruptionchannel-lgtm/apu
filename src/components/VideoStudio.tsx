import React, { useEffect, useRef, useState } from 'react';
import { default as ReactPlayer } from 'react-player';

const ReactPlayerComponent = ReactPlayer as any;
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  Shield,
  Radio,
  Video,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Film,
  Search,
  Copy,
  Check,
  Lightbulb,
  Eye,
  Edit3,
  X,
  HelpCircle,
  Clapperboard,
} from 'lucide-react';
import { GeneratedMetadata } from '../types';
import { drawVideoFrame } from '../utils/canvasRenderer';
import { narrationEngine } from '../utils/audio';
import { FREE_STOCK_PRESETS, searchFreeStockImages, StockMediaItem } from '../utils/stockMedia';

interface VideoStudioProps {
  metadata: GeneratedMetadata;
  bgImageUrl: string | null;
  attachedImageUrl: string | null;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoAnimationStyle: 'spin' | 'pulse' | 'glitch' | 'capcut_badge';
  audioUrl?: string | null;
  channelName: string;
}

interface SceneMedia {
  url: string;
  type: 'image' | 'video';
  prompt: string;
  imageElement?: HTMLImageElement;
  videoElement?: HTMLVideoElement;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  metadata,
  bgImageUrl,
  attachedImageUrl,
  logoPosition,
  logoAnimationStyle,
  audioUrl,
  channelName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [currentCaption, setCurrentCaption] = useState<string>('');
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  // Per-Scene Media Map (sceneIndex -> SceneMedia)
  const [sceneMediaMap, setSceneMediaMap] = useState<Record<number, SceneMedia>>({});
  const [generatingSceneIdx, setGeneratingSceneIdx] = useState<number | null>(null);
  const [editingPromptIdx, setEditingPromptIdx] = useState<number | null>(null);
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);

  // Stock Media Picker Modal State
  const [showStockModalIdx, setShowStockModalIdx] = useState<number | null>(null);
  const [stockQuery, setStockQuery] = useState<string>('');
  const [stockItems, setStockItems] = useState<StockMediaItem[]>(FREE_STOCK_PRESETS);
  const [stockMediaType, setStockMediaType] = useState<'video' | 'image'>('video');

  // Loaded Global Images
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const attachedImgRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Mirrors of the latest props/state for the playback render loop to read each frame
  // without being in its effect's dependency array (see the loop's own comment below).
  const metadataRef = useRef(metadata);
  const sceneMediaMapRef = useRef(sceneMediaMap);
  const logoPositionRef = useRef(logoPosition);
  const logoAnimationStyleRef = useRef(logoAnimationStyle);
  const channelNameRef = useRef(channelName);

  useEffect(() => { metadataRef.current = metadata; }, [metadata]);
  useEffect(() => { sceneMediaMapRef.current = sceneMediaMap; }, [sceneMediaMap]);
  useEffect(() => { logoPositionRef.current = logoPosition; }, [logoPosition]);
  useEffect(() => { logoAnimationStyleRef.current = logoAnimationStyle; }, [logoAnimationStyle]);
  useEffect(() => { channelNameRef.current = channelName; }, [channelName]);

  // Load BG Image
  useEffect(() => {
    if (bgImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        bgImgRef.current = img;
      };
      img.src = bgImageUrl;
    } else {
      bgImgRef.current = null;
    }
  }, [bgImageUrl]);

  // Load Attached Issue Evidence Image
  useEffect(() => {
    if (attachedImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        attachedImgRef.current = img;
      };
      img.src = attachedImageUrl;
    } else {
      attachedImgRef.current = null;
    }
  }, [attachedImageUrl]);

  // No channel-logo upload: the official ACC PK watermark is always drawn by
  // drawVideoFrame's built-in default (passing logoImage: null below), see Sidebar.tsx.

  // Auto-initialize default scene prompts from metadata
  useEffect(() => {
    if (metadata.scenes && metadata.scenes.length > 0) {
      const initialMap: Record<number, SceneMedia> = {};
      metadata.scenes.forEach((scene, idx) => {
        if (!sceneMediaMap[idx]) {
          const defaultPrompt = scene.visualDescription
            ? `${scene.visualDescription}, Pakistani investigative journalism, high contrast, broadcast quality, 8k`
            : metadata.visualPrompt || 'Pakistani corruption investigation report visual, news broadcast';
          initialMap[idx] = {
            url: '',
            type: 'image',
            prompt: defaultPrompt,
          };
        }
      });
      if (Object.keys(initialMap).length > 0) {
        setSceneMediaMap((prev) => ({ ...initialMap, ...prev }));
      }
    }
  }, [metadata]);

  // Canvas playback loop. Deliberately depends ONLY on isPlaying: the loop itself calls
  // setTime/setActiveSceneIndex/setCurrentCaption every frame, and this effect used to
  // also depend on time/activeSceneIndex/sceneMediaMap/metadata/etc — so every frame's
  // state update retriggered the effect, whose cleanup cancelled the just-scheduled
  // requestAnimationFrame before the browser ever got a chance to fire it. Net effect:
  // isPlaying stayed true but drawVideoFrame was never actually called, producing a
  // frozen canvas (and, when recorded, an empty/near-empty video). Everything the loop
  // needs beyond isPlaying is read from the refs above so it never restarts mid-playback.
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localTime = time;

    const renderLoop = () => {
      localTime += 0.033; // ~30fps step
      setTime(localTime);

      const meta = metadataRef.current;

      // Determine active scene based on time (10 seconds per scene)
      let sIndex = 0;
      let caption = meta.script.slice(0, 60);
      if (meta.scenes && meta.scenes.length > 0) {
        const sceneDuration = 10;
        sIndex = Math.min(
          Math.floor(localTime / sceneDuration) % meta.scenes.length,
          meta.scenes.length - 1
        );
        setActiveSceneIndex(sIndex);
        const scene = meta.scenes[sIndex];
        if (scene) {
          caption = scene.suggestedOverlayText || scene.narrationText;
        }
      }
      setCurrentCaption(caption);

      // Check active scene media
      const currentMedia = sceneMediaMapRef.current[sIndex];

      drawVideoFrame({
        canvas,
        ctx,
        bgImage: bgImgRef.current,
        attachedImage: attachedImgRef.current,
        logoImage: null, // official watermark is always the built-in default, see Sidebar.tsx
        activeSceneImage: currentMedia?.imageElement || null,
        activeSceneVideo: currentMedia?.videoElement || null,
        title: meta.title,
        currentCaption: caption,
        time: localTime,
        logoPosition: logoPositionRef.current,
        logoAnimationStyle: logoAnimationStyleRef.current,
        channelName: channelNameRef.current,
      });

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Redraw a single static preview frame whenever paused and any of these change (a new
  // scene image is picked, the logo is updated, metadata refreshes, etc). Separate from
  // the playback loop above on purpose — this one only ever draws once per change, so it
  // can safely depend on everything without risking the runaway-cancel bug.
  useEffect(() => {
    if (isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentMedia = sceneMediaMap[activeSceneIndex];
    drawVideoFrame({
      canvas,
      ctx,
      bgImage: bgImgRef.current,
      attachedImage: attachedImgRef.current,
      logoImage: null, // official watermark is always the built-in default, see Sidebar.tsx
      activeSceneImage: currentMedia?.imageElement || null,
      activeSceneVideo: currentMedia?.videoElement || null,
      title: metadata.title,
      currentCaption: metadata.scenes?.[activeSceneIndex]?.suggestedOverlayText || metadata.script.slice(0, 50),
      time,
      logoPosition,
      logoAnimationStyle,
      channelName,
    });
  }, [isPlaying, bgImageUrl, attachedImageUrl, metadata, logoPosition, logoAnimationStyle, time, sceneMediaMap, activeSceneIndex]);

  // Handle Play/Pause + Audio Sync
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      narrationEngine.stop();
    } else {
      setIsPlaying(true);
      narrationEngine.speak({
        text: metadata.script,
        language: metadata.language,
        audioUrl: audioUrl,
        onBoundary: (charIndex, textLength) => {
          const ratio = charIndex / textLength;
          if (metadata.scenes && metadata.scenes.length > 0) {
            const idx = Math.min(
              Math.floor(ratio * metadata.scenes.length),
              metadata.scenes.length - 1
            );
            setActiveSceneIndex(idx);
            setCurrentCaption(metadata.scenes[idx].suggestedOverlayText);
          }
        },
        onEnd: () => {
          setIsPlaying(false);
        },
      });
    }
  };

  const handleReset = () => {
    narrationEngine.stop();
    setIsPlaying(false);
    setTime(0);
    setActiveSceneIndex(0);
  };

  // Generate AI Image for specific scene
  const handleGenerateSceneImage = async (idx: number) => {
    setGeneratingSceneIdx(idx);
    try {
      const scenePrompt = sceneMediaMap[idx]?.prompt || metadata.scenes?.[idx]?.visualDescription || metadata.visualPrompt;
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visualPrompt: scenePrompt,
          aspectRatio: '16:9'
        }),
      });

      if (!response.ok) throw new Error('Image generation failed');
      const data = await response.json();
      const imageUrl = data.imageUrl;

      if (imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setSceneMediaMap((prev) => ({
            ...prev,
            [idx]: {
              ...(prev[idx] || { prompt: scenePrompt }),
              url: imageUrl,
              type: 'image',
              imageElement: img,
              videoElement: undefined,
            },
          }));
          setGeneratingSceneIdx(null);
        };
        img.src = imageUrl;
      }
    } catch (e) {
      console.error('Error generating scene image:', e);
      setGeneratingSceneIdx(null);
    }
  };

  // Upload custom picture or video file for scene
  const handleFileUploadForScene = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');

    if (isVideo) {
      const videoEl = document.createElement('video');
      videoEl.src = fileUrl;
      videoEl.crossOrigin = 'anonymous';
      videoEl.loop = true;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.play().catch(() => {});

      setSceneMediaMap((prev) => ({
        ...prev,
        [idx]: {
          ...(prev[idx] || { prompt: '' }),
          url: fileUrl,
          type: 'video',
          videoElement: videoEl,
          imageElement: undefined,
        },
      }));
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setSceneMediaMap((prev) => ({
          ...prev,
          [idx]: {
            ...(prev[idx] || { prompt: '' }),
            url: fileUrl,
            type: 'image',
            imageElement: img,
            videoElement: undefined,
          },
        }));
      };
      img.src = fileUrl;
    }
  };

  // Select stock item for scene
  const handleSelectStockMedia = (idx: number, item: StockMediaItem) => {
    if (item.type === 'video') {
      const videoEl = document.createElement('video');
      videoEl.src = item.url;
      videoEl.crossOrigin = 'anonymous';
      videoEl.loop = true;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.play().catch(() => {});

      setSceneMediaMap((prev) => ({
        ...prev,
        [idx]: {
          ...(prev[idx] || { prompt: item.title }),
          url: item.url,
          type: 'video',
          videoElement: videoEl,
          imageElement: undefined,
        },
      }));
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setSceneMediaMap((prev) => ({
          ...prev,
          [idx]: {
            ...(prev[idx] || { prompt: item.title }),
            url: item.url,
            type: 'image',
            imageElement: img,
            videoElement: undefined,
          },
        }));
      };
      img.src = item.url;
    }
    setShowStockModalIdx(null);
  };

  // Copy prompt to clipboard
  const handleCopyPrompt = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptIdx(idx);
    setTimeout(() => setCopiedPromptIdx(null), 2000);
  };

  // Record Canvas Video using MediaRecorder
  const handleRecordVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Start every export from scene 0 so a prior scrubbed preview doesn't
      // skip scenes or end the recording early.
      narrationEngine.stop();
      setTime(0);
      setActiveSceneIndex(0);
      setIsRecording(true);

      // Total time needed to cycle through every scene at least once
      // (matches the 10s-per-scene timing used in the render loop above).
      const sceneCount = metadata.scenes?.length || 1;
      const minSceneCoverageSecs = sceneCount * 10;

      let mediaRecorder: MediaRecorder;

      narrationEngine.speak({
        text: metadata.script,
        language: metadata.language,
        audioUrl: audioUrl,
        onEnd: () => {
          if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
        },
      });

      // Resolve the narration audio track (when it came from server TTS) and attach it
      // onto the canvas's own captureStream() object BEFORE the recorder is created —
      // adding a track to a MediaStream a MediaRecorder is already recording has been
      // observed to silently kill the recording within a fraction of a second in Chrome,
      // and wrapping the tracks in a freshly-constructed MediaStream (instead of mutating
      // the canvas's native one) has been observed to produce an empty recording, so
      // this must both happen before start() and use the canvas's stream object directly.
      // Browser SpeechSynthesis output can't be captured into a MediaStream, so
      // recordings without server TTS audio stay video-only.
      const audioTracks = await narrationEngine.getAudioTracks();
      const canvasStream = canvas.captureStream(30);
      audioTracks.forEach((track) => canvasStream.addTrack(track));

      const mimeType = audioTracks.length > 0 && MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';
      mediaRecorder = new MediaRecorder(canvasStream, { mimeType });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRecording(false);
        setIsPlaying(false);
      };

      mediaRecorder.start();
      setIsPlaying(true);

      // Safety net only — normal recordings end via onEnd above once narration
      // finishes. This just guards against speech synthesis/audio never firing
      // onEnd, so it must comfortably exceed both the script length and the
      // full scene rotation.
      const safetyCapSecs = Math.max(minSceneCoverageSecs, 45) + 15;
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, safetyCapSecs * 1000);
    } catch (e) {
      console.error('Canvas video recording error:', e);
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-[#0f1015] border border-white/10 p-6 md:p-8 space-y-8 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl md:text-2xl font-serif italic text-white flex items-center gap-3">
            <Video className="w-5 h-5 text-[#c5a47e]" />
            <span>AI Scene Video & Visual Generation Studio</span>
          </h3>
          <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
            Generate AI scene pictures, upload custom videos or photos, or choose free stock footage for each scene breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-[#c5a47e]/30 text-[#c5a47e] text-[10px] uppercase tracking-[0.2em] font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#c5a47e]" /> CapCut & Broadcast Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Video Composition Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video w-full bg-black border border-white/10 shadow-2xl group overflow-hidden">
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full object-contain"
            />

            {/* Play Overlay Button if paused */}
            {!isPlaying && !recordedVideoUrl && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 bg-black/50 hover:bg-black/30 flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-[#c5a47e] hover:bg-white text-black flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-white mt-4 bg-black/80 px-4 py-1.5 border border-white/15">
                  Preview Video Composition & Audio Narration
                </span>
              </div>
            )}
          </div>
          
          {recordedVideoUrl && (
            <div className="space-y-2">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#c5a47e]">Exported Video Preview</h4>
                <div className="aspect-video w-full border border-white/10">
                    <ReactPlayerComponent url={recordedVideoUrl} width="100%" height="100%" controls />
                </div>
            </div>
          )}

          {/* Video Player Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121318] p-4 border border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="bg-[#c5a47e] hover:bg-white text-black px-4 py-2 text-xs uppercase tracking-[0.15em] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                <span>{isPlaying ? 'Pause' : 'Play Full Video'}</span>
              </button>

              <button
                onClick={handleReset}
                className="bg-white/5 hover:bg-white/10 text-slate-300 p-2.5 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                title="Reset to 0s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/50 pl-2">
                <Volume2 className="w-4 h-4 text-[#c5a47e]" />
                <span>
                  Voice: <strong className="text-white">{metadata.languageLabel || metadata.language}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRecordVideo}
                disabled={isRecording}
                className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.15em] font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#c5a47e]" />
                <span>{isRecording ? 'Exporting WebM...' : 'Export Recorded Video'}</span>
              </button>

              {recordedVideoUrl && (
                <a
                  href={recordedVideoUrl}
                  download="acc_pk_investigation_video.webm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs uppercase tracking-[0.15em] font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Global Video Info & Voiceover Panel */}
        <div className="lg:col-span-1 space-y-4 flex flex-col justify-between">
          <div className="bg-[#121318] p-4 border border-white/10 space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#c5a47e] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#c5a47e]" />
              <span>Broadcast Standards & Watermark</span>
            </h4>
            <div className="text-xs text-white/70 space-y-2 leading-relaxed font-light">
              <p>• <strong>CapCut Animated Badge:</strong> Positioned in top-right with red glow pulse.</p>
              <p>• <strong>Lower-Third Ticker:</strong> Scrolls official ACC PK C.E.O & Whistleblower lines.</p>
              <p>• <strong>Dynamic Scene Transitions:</strong> Synced to narration time step.</p>
            </div>
          </div>

          <div className="bg-[#121318] p-4 border border-white/10 text-xs space-y-2">
            <div className="flex items-center justify-between text-white/80 font-medium text-[11px] uppercase tracking-wider">
              <span>Full Narration Script</span>
              <span className="text-[9px] bg-white/5 text-[#c5a47e] px-2 py-0.5 border border-[#c5a47e]/30">
                Urdu / English Sync
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans bg-black/40 p-3 border border-white/10 max-h-40 overflow-y-auto dir-auto text-xs">
              {metadata.script}
            </p>
          </div>
        </div>
      </div>

      {/* PER-SCENE MEDIA MANAGER & AI PROMPT GENERATOR SECTION */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-serif italic text-white flex items-center gap-2">
              <Clapperboard className="w-4 h-4 text-[#c5a47e]" />
              <span>Scene-by-Scene Visual Media & Prompt Controls</span>
            </h4>
            <p className="text-xs text-white/50 font-light mt-0.5">
              Customize each scene by generating AI images, uploading photos/videos, or picking free stock footage.
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#c5a47e] bg-white/5 px-3 py-1 border border-[#c5a47e]/30">
            {metadata.scenes?.length || 0} Scenes Generated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metadata.scenes?.map((scene, idx) => {
            const sceneMedia = sceneMediaMap[idx];
            const scenePrompt = sceneMedia?.prompt || scene.visualDescription || metadata.visualPrompt;
            const isGeneratingThis = generatingSceneIdx === idx;
            const isActive = activeSceneIndex === idx;

            return (
              <div
                key={scene.sceneNumber}
                className={`bg-[#121318] border p-4 space-y-3 transition-all ${
                  isActive ? 'border-[#c5a47e] shadow-lg bg-[#151720]' : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Scene Title & Status Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif italic text-[#c5a47e] bg-[#c5a47e]/10 px-2.5 py-0.5 border border-[#c5a47e]/30 font-bold">
                      Scene {scene.sceneNumber}
                    </span>
                    <span className="text-xs text-white font-medium truncate max-w-[200px]">
                      {scene.suggestedOverlayText}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveSceneIndex(idx);
                      setCurrentCaption(scene.suggestedOverlayText);
                    }}
                    className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-semibold transition-colors cursor-pointer ${
                      isActive ? 'bg-[#c5a47e] text-black' : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {isActive ? 'Active on Screen' : 'Set Active'}
                  </button>
                </div>

                {/* Media Preview & Actions Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  {/* Media Thumbnail Box */}
                  <div className="sm:col-span-1 relative aspect-video bg-black border border-white/10 overflow-hidden flex items-center justify-center group">
                    {sceneMedia?.url ? (
                      sceneMedia.type === 'video' ? (
                        <video
                          src={sceneMedia.url}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={sceneMedia.url}
                          alt={`Scene ${scene.sceneNumber}`}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="text-center p-2 space-y-1">
                        <ImageIcon className="w-5 h-5 text-white/30 mx-auto" />
                        <span className="text-[9px] uppercase tracking-wider text-white/40 block">Default Grid</span>
                      </div>
                    )}
                  </div>

                  {/* Scene Action Buttons */}
                  <div className="sm:col-span-2 space-y-2">
                    {/* Generate AI Scene Image Button */}
                    <button
                      onClick={() => handleGenerateSceneImage(idx)}
                      disabled={isGeneratingThis}
                      className="w-full bg-[#c5a47e] hover:bg-white text-black font-semibold text-[11px] uppercase tracking-wider py-1.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>{isGeneratingThis ? 'Generating Image...' : 'Generate AI Image'}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Upload Picture or Video File Button */}
                      <label className="bg-white/5 hover:bg-white/10 text-white/90 border border-white/15 text-[10px] uppercase tracking-wider py-1.5 px-2 font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors text-center">
                        <Upload className="w-3 h-3 text-[#c5a47e]" />
                        <span>Upload Pic/Vid</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => handleFileUploadForScene(idx, e)}
                          className="hidden"
                        />
                      </label>

                      {/* Pick Free Stock Video/Photo Button */}
                      <button
                        onClick={() => setShowStockModalIdx(idx)}
                        className="bg-white/5 hover:bg-white/10 text-white/90 border border-white/15 text-[10px] uppercase tracking-wider py-1.5 px-2 font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Film className="w-3 h-3 text-[#c5a47e]" />
                        <span>Free Stock</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Visual Prompt Box & Prompt Icon Indicator */}
                <div className="bg-[#0a0a0c] p-2.5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#c5a47e] font-medium">
                    <span className="flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-[#c5a47e]" />
                      <span>Visual AI Prompt (What should be generated)</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyPrompt(idx, scenePrompt)}
                        className="hover:text-white text-white/60 flex items-center gap-1 cursor-pointer"
                        title="Copy prompt text"
                      >
                        {copiedPromptIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPromptIdx === idx ? 'Copied' : 'Copy Prompt'}</span>
                      </button>

                      <button
                        onClick={() => setEditingPromptIdx(editingPromptIdx === idx ? null : idx)}
                        className="hover:text-white text-white/60 flex items-center gap-1 cursor-pointer"
                        title="Edit prompt"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{editingPromptIdx === idx ? 'Close' : 'Edit'}</span>
                      </button>
                    </div>
                  </div>

                  {editingPromptIdx === idx ? (
                    <textarea
                      value={scenePrompt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSceneMediaMap((prev) => ({
                          ...prev,
                          [idx]: {
                            ...(prev[idx] || { url: '', type: 'image' }),
                            prompt: val,
                          },
                        }));
                      }}
                      rows={2}
                      className="w-full bg-black/60 border border-[#c5a47e]/50 p-2 text-xs text-slate-200 font-sans focus:outline-none resize-none"
                    />
                  ) : (
                    <p className="text-[11px] text-slate-300 font-mono leading-relaxed line-clamp-2">
                      {scenePrompt}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FREE STOCK VIDEOS & PHOTOS MODAL */}
      {showStockModalIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121318] border border-[#c5a47e]/40 w-full max-w-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-serif italic text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#c5a47e]" />
                  <span>Free Royalty-Free Stock Video & Photo Library</span>
                </h3>
                <p className="text-xs text-white/50 font-light mt-0.5">
                  Select a free stock image or video loop for Scene {(showStockModalIdx ?? 0) + 1}.
                </p>
              </div>

              <button
                onClick={() => setShowStockModalIdx(null)}
                className="text-white/60 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stock Search Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={async () => {
                    setStockMediaType('video');
                    const res = await searchFreeStockImages(stockQuery, 'video');
                    setStockItems(res);
                  }}
                  className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-semibold border ${stockMediaType === 'video' ? 'bg-[#c5a47e] text-black border-[#c5a47e]' : 'bg-transparent text-white/60 border-white/20 hover:text-white'}`}
                >
                  Search Videos (Pexels / Pixabay)
                </button>
                <button
                  onClick={async () => {
                    setStockMediaType('image');
                    const res = await searchFreeStockImages(stockQuery, 'image');
                    setStockItems(res);
                  }}
                  className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-semibold border ${stockMediaType === 'image' ? 'bg-[#c5a47e] text-black border-[#c5a47e]' : 'bg-transparent text-white/60 border-white/20 hover:text-white'}`}
                >
                  Search Images (Unsplash / Pixabay)
                </button>
              </div>
              <div className="flex items-center gap-2 bg-[#0a0a0c] border border-white/15 px-3 py-2">
                <Search className="w-4 h-4 text-[#c5a47e]" />
                <input
                  type="text"
                  value={stockQuery}
                  onChange={(e) => setStockQuery(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const res = await searchFreeStockImages(stockQuery, stockMediaType);
                      setStockItems(res);
                    }
                  }}
                  placeholder={`Search free stock ${stockMediaType}s...`}
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                />
                <button
                  onClick={async () => {
                    const res = await searchFreeStockImages(stockQuery, stockMediaType);
                    setStockItems(res);
                  }}
                  className="bg-[#c5a47e] text-black text-[10px] uppercase font-bold px-3 py-1 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Stock Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
              {stockItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectStockMedia(showStockModalIdx, item)}
                  className="group relative aspect-video bg-black border border-white/10 hover:border-[#c5a47e] cursor-pointer overflow-hidden transition-all"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                    <span className="text-[10px] font-semibold text-white truncate block">{item.title}</span>
                    <span className="text-[8px] uppercase tracking-widest text-[#c5a47e]">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-white/50">
              <span>All images & videos are free for broadcast & YouTube use.</span>
              <button
                onClick={() => setShowStockModalIdx(null)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 uppercase tracking-wider text-[10px] font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

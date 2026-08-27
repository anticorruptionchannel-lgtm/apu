export interface SpeechOptions {
  text: string;
  language: 'urdu' | 'english' | 'punjabi' | 'roman_urdu';
  audioUrl?: string | null;
  onBoundary?: (charIndex: number, textLength: number) => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export class NarrationAudioEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Returns a MediaStream carrying the currently-playing narration audio, so it can be
   * merged into a canvas MediaRecorder stream for export. Only available when playback
   * came from a real <audio> element (server-generated TTS) — browser SpeechSynthesis
   * output cannot be captured into a MediaStream.
   *
   * Chrome hands back a MediaStream with zero tracks if captureStream() is called before
   * the element has decoded any data (readyState HAVE_NOTHING) — it does not attach the
   * track lazily once data arrives — so this waits for playable data first.
   */
  public waitForAudioStream(timeoutMs = 4000): Promise<MediaStream | null> {
    const audio = this.currentAudio as (HTMLAudioElement & {
      captureStream?: () => MediaStream;
      mozCaptureStream?: () => MediaStream;
    }) | null;
    if (!audio) return Promise.resolve(null);

    const capture = (): MediaStream | null => {
      try {
        if (typeof audio.captureStream === 'function') return audio.captureStream();
        if (typeof audio.mozCaptureStream === 'function') return audio.mozCaptureStream();
      } catch (e) {
        console.warn('Unable to capture narration audio stream for recording:', e);
      }
      return null;
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      return Promise.resolve(capture());
    }

    return new Promise((resolve) => {
      const cleanup = () => {
        clearTimeout(timer);
        audio.removeEventListener('loadeddata', onReady);
        audio.removeEventListener('canplay', onReady);
        audio.removeEventListener('error', onFail);
      };
      const onReady = () => {
        cleanup();
        resolve(capture());
      };
      const onFail = () => {
        cleanup();
        resolve(null);
      };
      // Best-effort fallback if the audio never fires loadeddata/canplay in time.
      const timer = setTimeout(onReady, timeoutMs);
      audio.addEventListener('loadeddata', onReady, { once: true });
      audio.addEventListener('canplay', onReady, { once: true });
      audio.addEventListener('error', onFail, { once: true });
    });
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public speak(options: SpeechOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stop();

      const { text, language, audioUrl, onBoundary, onEnd, onError } = options;

      // 1. If audioUrl (base64 audio from Gemini TTS) is provided, play it directly
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;

        audio.onended = () => {
          this.currentAudio = null;
          if (onEnd) onEnd();
          resolve();
        };

        audio.onerror = (e) => {
          console.warn('Base64 audio playback failed, falling back to SpeechSynthesis', e);
          this.fallbackSpeechSynthesis(text, language, onBoundary, onEnd, resolve, reject);
        };

        audio.ontimeupdate = () => {
          if (audio.duration && onBoundary) {
            const progress = audio.currentTime / audio.duration;
            const charIndex = Math.floor(progress * text.length);
            onBoundary(charIndex, text.length);
          }
        };

        audio.play().catch((err) => {
          console.warn('Audio play error, using fallback speech synthesis', err);
          this.fallbackSpeechSynthesis(text, language, onBoundary, onEnd, resolve, reject);
        });
        return;
      }

      // 2. Otherwise use browser SpeechSynthesis API
      this.fallbackSpeechSynthesis(text, language, onBoundary, onEnd, resolve, reject);
    });
  }

  private fallbackSpeechSynthesis(
    text: string,
    language: string,
    onBoundary?: (charIndex: number, textLength: number) => void,
    onEnd?: () => void,
    resolve?: () => void,
    reject?: (reason?: any) => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      if (resolve) resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Pick voice lang
    if (language === 'urdu') {
      utterance.lang = 'ur-PK';
    } else if (language === 'punjabi') {
      utterance.lang = 'pa-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.95;
    utterance.pitch = 0.95;

    utterance.onboundary = (event) => {
      if (onBoundary) {
        onBoundary(event.charIndex, text.length);
      }
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
      if (resolve) resolve();
    };

    utterance.onerror = (err) => {
      console.warn('SpeechSynthesis error:', err);
      this.currentUtterance = null;
      if (onEnd) onEnd();
      if (resolve) resolve();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const narrationEngine = new NarrationAudioEngine();

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
   * Returns the narration audio's tracks (server-generated TTS via a real <audio>
   * element — browser SpeechSynthesis output can't be captured this way) as an array,
   * resolving once they're actually capturable. Must be awaited BEFORE constructing a
   * MediaRecorder: adding a track to a MediaStream a MediaRecorder is already recording
   * is unreliable in Chrome and has been observed to silently kill the recording within
   * a fraction of a second, so the caller should build one combined MediaStream (video +
   * these tracks) upfront and only then create/start the MediaRecorder on it.
   *
   * Chrome hands back a MediaStream with zero audio tracks if captureStream() is called
   * before the element has decoded any data, and how long that takes varies with
   * main-thread load, so this retries on load/playback progress events rather than
   * giving up on a single short deadline — only a generous outer timeoutMs backstops it.
   */
  public getAudioTracks(timeoutMs = 8000): Promise<MediaStreamTrack[]> {
    const audio = this.currentAudio as (HTMLAudioElement & {
      captureStream?: () => MediaStream;
      mozCaptureStream?: () => MediaStream;
    }) | null;
    if (!audio) return Promise.resolve([]);

    const tryCapture = (): MediaStreamTrack[] | null => {
      try {
        const stream = typeof audio.captureStream === 'function'
          ? audio.captureStream()
          : typeof audio.mozCaptureStream === 'function'
            ? audio.mozCaptureStream()
            : null;
        const tracks = stream ? stream.getAudioTracks() : [];
        return tracks.length > 0 ? tracks : null;
      } catch (e) {
        console.warn('Unable to capture narration audio stream for recording:', e);
        return [];
      }
    };

    const immediate = tryCapture();
    if (immediate) return Promise.resolve(immediate);

    return new Promise((resolve) => {
      const progressEvents = ['loadeddata', 'canplay', 'playing', 'timeupdate'];
      const finish = (tracks: MediaStreamTrack[]) => {
        cleanup();
        resolve(tracks);
      };
      const retry = () => {
        const tracks = tryCapture();
        if (tracks) finish(tracks);
      };
      const giveUp = () => finish([]);
      const cleanup = () => {
        clearTimeout(timer);
        progressEvents.forEach((evt) => audio.removeEventListener(evt, retry));
        audio.removeEventListener('ended', giveUp);
        audio.removeEventListener('error', giveUp);
      };
      const timer = setTimeout(giveUp, timeoutMs);
      progressEvents.forEach((evt) => audio.addEventListener(evt, retry));
      audio.addEventListener('ended', giveUp, { once: true });
      audio.addEventListener('error', giveUp, { once: true });
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

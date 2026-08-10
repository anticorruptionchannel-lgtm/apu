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

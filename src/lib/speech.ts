// Speech Recognition API wrapper with multi-language and fallback support

export interface SpeechRecognitionHandlers {
  onTranscriptChange: (transcript: string, isFinal: boolean) => void;
  onError: (errorMsg: string) => void;
  onStateChange: (isRecording: boolean) => void;
}

export class SpeechManager {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentTranscript: string = '';
  private currentLanguage: 'en-US' | 'ur-PK' = 'en-US';

  public isSupported(): boolean {
    return typeof window !== 'undefined' && !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }

  public setLanguage(lang: 'en-US' | 'ur-PK') {
    this.currentLanguage = lang;
    if (this.recognition) {
      try {
        this.recognition.lang = lang;
      } catch (e) {
        // ignore
      }
    }
  }

  public start(handlers: SpeechRecognitionHandlers) {
    if (!this.isSupported()) {
      handlers.onError(
        'Speech recognition is not supported in this browser or iframe. Please type your expense description below or click a sample phrase.'
      );
      return;
    }

    // Stop any existing session first
    this.stop();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage;
    } catch (err: any) {
      handlers.onError('Could not initialize speech recognition: ' + (err?.message || 'Unknown error'));
      return;
    }

    this.currentTranscript = '';

    this.recognition.onstart = () => {
      this.isListening = true;
      handlers.onStateChange(true);
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const full = (this.currentTranscript + ' ' + final + ' ' + interim).trim();
      handlers.onTranscriptChange(full, final.length > 0);
      if (final.length > 0) {
        this.currentTranscript = (this.currentTranscript + ' ' + final).trim();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition event error:', event.error);
      let message = 'Speech recognition error: ' + event.error;
      if (event.error === 'not-allowed') {
        message = 'Microphone permission was not granted or is blocked by your browser/iframe. You can type your expense in Roman Urdu or English below!';
      } else if (event.error === 'no-speech') {
        message = 'No speech was detected. Tap the mic and speak clearly, or type below.';
      } else if (event.error === 'network') {
        message = 'Speech recognition network error. You can still type your expense below.';
      } else if (event.error === 'audio-capture') {
        message = 'No microphone was found on this device. Please connect a microphone or use text input.';
      }
      handlers.onError(message);
      this.isListening = false;
      handlers.onStateChange(false);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      handlers.onStateChange(false);
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      handlers.onError('Could not start microphone: ' + (e?.message || 'Access denied or blocked'));
      this.isListening = false;
      handlers.onStateChange(false);
    }
  }

  public stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
    }
    this.isListening = false;
  }
}

export const speechManager = new SpeechManager();

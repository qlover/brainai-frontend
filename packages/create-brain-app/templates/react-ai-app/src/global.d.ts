import { webkitSpeechRecognition } from '@types/dom-speech-recognition';

interface Window {
  webkitSpeechRecognition?: typeof webkitSpeechRecognition;
}

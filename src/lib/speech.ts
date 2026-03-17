let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string) {
  stop();
  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 0.8;
  currentUtterance = utterance;
  speechSynthesis.speak(utterance);
}

export function stop() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}

// ===== Audio Analysis System =====
import gameState from '../core/GameState.js';

class AudioAnalyzer {
  constructor() {
    console.log('Creating AudioAnalyzer');
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.bassDataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.previousEnergy = 0;
    this.beatHistory = [];
    console.log('AudioAnalyzer created successfully');
  }

  async loadAudio(url) {
    console.log('Loading audio from:', url);
    const audio = new Audio(url);
    audio.crossOrigin = "anonymous";
    
    return new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => {
        console.log('Audio loaded and ready to play');
        try {
          const source = this.audioContext.createMediaElementSource(audio);
          source.connect(this.analyser);
          this.analyser.connect(this.audioContext.destination);
          console.log('Audio connected to analyzer');
          resolve(audio);
        } catch (error) {
          console.error('Error connecting audio:', error);
          reject(error);
        }
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        console.error('Failed to load:', url);
        reject(e);
      });

      audio.load();
    });
  }

  getFrequencyData() {
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getBassEnergy() {
    this.analyser.getByteFrequencyData(this.bassDataArray);
    const bassRange = Math.floor(this.analyser.frequencyBinCount * 0.1);
    let sum = 0;
    for (let i = 0; i < bassRange; i++) {
      sum += this.bassDataArray[i];
    }
    return sum / bassRange / 255;
  }

  detectBeat(threshold = 0.8) {
    const currentEnergy = this.getBassEnergy();
    const now = Date.now();
    
    if (now - gameState.lastBeatTime < 200) {
      this.previousEnergy = currentEnergy;
      return false;
    }

    const isBeat = currentEnergy > threshold && currentEnergy > this.previousEnergy * 1.3;
    
    if (isBeat) {
      gameState.lastBeatTime = now;
      this.beatHistory.push(now);
      this.beatHistory = this.beatHistory.filter(time => now - time < 5000);
    }

    this.previousEnergy = currentEnergy;
    return isBeat;
  }

  getAverageFrequency() {
    const data = this.getFrequencyData();
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length / 255;
  }

  playBeep(frequency) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  playGameOverSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  playVictorySound() {
    // Play a triumphant ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((frequency, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      const startTime = this.audioContext.currentTime + (index * 0.15);
      const duration = 0.3;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }
}

export default AudioAnalyzer;

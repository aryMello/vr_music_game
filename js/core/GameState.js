// ===== Game State Management =====
class GameState {
  constructor() {
    this.playing = false;
    this.mode = null; // 'vr' or 'desktop'
    this.startTime = 0;
    this.score = 0;
    this.combo = 1;
    this.dodgedCount = 0;
    this.difficulty = null;
    this.audio = null;
    this.audioContext = null;
    this.analyser = null;
    this.obstacles = [];
    this.beats = [];
    this.lastBeatTime = 0;
    this.visualEffects = null;
    this.obstacleManager = null;
    this.collisionDetector = null;
    this.playerController = null;
    console.log('GameState initialized');
  }

  reset() {
    console.log('Resetting game state');
    this.playing = false;
    this.score = 0;
    this.combo = 1;
    this.dodgedCount = 0;
    this.obstacles = [];
    this.beats = [];
    this.lastBeatTime = 0;
    
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    
    if (this.collisionDetector) {
      this.collisionDetector.stop();
    }
    
    if (this.obstacleManager) {
      this.obstacleManager.cleanup();
    }
    
    if (this.visualEffects) {
      this.visualEffects.cleanup();
    }
    
    if (this.playerController) {
      this.playerController.stop();
    }
  }
}

// Singleton instance
const gameState = new GameState();

export default gameState;

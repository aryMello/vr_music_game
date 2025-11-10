// ===== Game Flow Management =====
import CONFIG from './config.js';
import gameState from './GameState.js';
import AudioAnalyzer from './AudioAnalyzer.js';
import PlayerController from './PlayerController.js';
import VisualEffects from './VisualEffects.js';
import ObstacleManager from './ObstacleManager.js';
import CollisionDetector from './CollisionDetector.js';
import { hideElement, showElement, updateHUD, showGameOver, showVictory } from './UIManager.js';

export async function selectSong(difficulty) {
  console.log('=== SONG SELECTED ===');
  console.log('Difficulty:', difficulty);
  
  gameState.difficulty = difficulty;
  hideElement('song-select');
  showElement('loading');

  try {
    const config = CONFIG.songs[difficulty];
    console.log('Song config:', config);
    
    const analyzer = new AudioAnalyzer();
    console.log('Loading audio from:', config.path);
    
    const audio = await analyzer.loadAudio(config.path);
    console.log('Audio loaded successfully');
    
    gameState.audio = audio;
    gameState.audioContext = analyzer.audioContext;
    gameState.analyser = analyzer;
    
    // Add event listener for song end
    audio.addEventListener('ended', () => {
      if (gameState.playing) {
        console.log('Song completed - Victory!');
        victoryGame();
      }
    });
    
    hideElement('loading');
    startCountdown();
  } catch (error) {
    console.error('=== ERROR LOADING AUDIO ===');
    console.error('Error details:', error);
    console.error('File path:', CONFIG.songs[difficulty].path);
    hideElement('loading');
    alert('Failed to load music file. Please check:\n1. The file exists at: ' + CONFIG.songs[difficulty].path + '\n2. You are running a local server\n3. The file is a valid MP3\n\nError: ' + error.message);
    location.reload();
  }
}

function startCountdown() {
  console.log('Starting countdown');
  showElement('countdown');
  let count = 3;
  
  const countdownNumber = document.getElementById('countdown-number');
  const countdownText = document.getElementById('countdown-text');
  
  if (!countdownNumber || !countdownText) {
    console.error('Countdown elements not found');
    return;
  }
  
  countdownNumber.textContent = count;
  countdownText.textContent = 'Get Ready! Look around to move';

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownNumber.textContent = count;
      gameState.analyser.playBeep(440);
    } else {
      countdownNumber.textContent = 'VAI!';
      countdownText.textContent = 'Movendo para frente automaticamente!';
      gameState.analyser.playBeep(550);
      
      setTimeout(() => {
        const overlay = document.getElementById('ui-overlay');
        if (overlay) {
          overlay.classList.add('fade-out');
          setTimeout(() => {
            hideElement('countdown');
            hideElement('ui-overlay');
            startGame();
          }, 500);
        }
      }, 800);
      
      clearInterval(interval);
    }
  }, 1000);
}

export function startGame() {
  console.log('=== STARTING GAME ===');
  console.log('Mode:', gameState.mode);
  
  if (gameState.mode === 'desktop') {
    console.log('Desktop Mode: Use Arrow Keys to dodge');
  } else {
    console.log('VR Mode: Use head movement to dodge');
  }
  
  gameState.playing = true;
  gameState.startTime = Date.now();
  showElement('hud');

  const config = CONFIG.songs[gameState.difficulty];
  const scene = document.querySelector('a-scene');
  
  if (!scene) {
    console.error('A-Frame scene not found!');
    return;
  }
  
  console.log('Initializing game systems...');
  
  // Initialize all game systems with the selected mode
  const playerController = new PlayerController(gameState.mode);
  const visualEffects = new VisualEffects(scene);
  const obstacleManager = new ObstacleManager(scene, config);
  const collisionDetector = new CollisionDetector();
  
  // Store references in game state
  gameState.playerController = playerController;
  gameState.visualEffects = visualEffects;
  gameState.obstacleManager = obstacleManager;
  gameState.collisionDetector = collisionDetector;
  
  // Start systems
  playerController.start();
  visualEffects.createStarfield();
  visualEffects.createTunnel();
  
  console.log('Starting audio playback');
  gameState.audio.play().then(() => {
    console.log('Audio playing successfully');
  }).catch(err => {
    console.error('Error playing audio:', err);
  });
  
  obstacleManager.startSpawning();
  obstacleManager.updateObstacles();
  collisionDetector.start();
  
  // Main game loop
  function gameLoop() {
    if (!gameState.playing) return;

    const isBeat = gameState.analyser.detectBeat(config.beatThreshold);
    
    if (isBeat) {
      visualEffects.createBeatPulse();
      gameState.combo = Math.min(gameState.combo + 1, 10);
      updateHUD();
    }

    const frequencyData = gameState.analyser.getFrequencyData();
    const energy = gameState.analyser.getAverageFrequency();
    visualEffects.updateVisualization(frequencyData, energy);
    
    // Update infinite tunnel
    visualEffects.updateTunnel();

    requestAnimationFrame(gameLoop);
  }
  
  gameLoop();
  updateHUD();
  
  console.log('Game started successfully');
}

export function endGame() {
  console.log('=== GAME OVER ===');
  gameState.playing = false;

  // Stop all systems
  if (gameState.collisionDetector) gameState.collisionDetector.stop();
  if (gameState.obstacleManager) gameState.obstacleManager.stopSpawning();
  if (gameState.playerController) gameState.playerController.stop();
  if (gameState.audio) gameState.audio.pause();

  showGameOver();
  
  if (gameState.analyser) {
    gameState.analyser.playGameOverSound();
  }
}

export function victoryGame() {
  console.log('=== VICTORY ===');
  gameState.playing = false;

  // Stop all systems
  if (gameState.collisionDetector) gameState.collisionDetector.stop();
  if (gameState.obstacleManager) gameState.obstacleManager.stopSpawning();
  if (gameState.playerController) gameState.playerController.stop();
  // Don't pause audio - let it finish naturally

  showVictory();
  
  if (gameState.analyser) {
    gameState.analyser.playVictorySound();
  }
}
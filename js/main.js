// ===== Main Entry Point =====
// This file initializes the game and sets up event listeners
import gameState from './core/GameState.js';
import { selectSong } from './game/GameFlow.js';
import { showElement, hideElement } from './ui/UIManager.js';
import scoreIntegration from './integration/ScoreIntegration.js';

console.log('=== VR RHYTHM RUNNER ===');
console.log('Main entry point loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Initializing game');
  
  // Initialize score integration (extract code from URL)
  scoreIntegration.init();
  
  // Mode selection buttons
  const vrModeBtn = document.getElementById('vr-mode-btn');
  // const desktopModeBtn = document.getElementById('desktop-mode-btn');
  
  if (vrModeBtn) {
    vrModeBtn.addEventListener('click', () => {
      console.log('VR Mode selected');
      gameState.mode = 'vr';
      hideElement('mode-select');
      showElement('song-select');
      document.getElementById('mode-indicator').textContent = 'Mode: VR Headset 🥽';
    });
  }
  
  // DESKTOP MODE DISABLED - Only VR Mode is active
  // if (desktopModeBtn) {
  //   desktopModeBtn.addEventListener('click', () => {
  //     console.log('Desktop Mode selected');
  //     gameState.mode = 'desktop';
  //     hideElement('mode-select');
  //     showElement('song-select');
  //     document.getElementById('mode-indicator').textContent = 'Mode: Desktop 🖥️ (Arrow Keys)';
  //   });
  // }
  
  // Song selection buttons
  const songButtons = document.querySelectorAll('.song-btn');
  console.log('Found', songButtons.length, 'song buttons');
  
  songButtons.forEach((btn, index) => {
    console.log(`Setting up button ${index}: ${btn.getAttribute('data-song')}`);
    btn.addEventListener('click', () => {
      const song = btn.getAttribute('data-song');
      console.log('Button clicked! Starting game with difficulty:', song);
      selectSong(song);
    });
  });
  
  // Restart button (Game Over)
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    console.log('Restart button found');
    restartBtn.addEventListener('click', () => {
      console.log('Restart clicked - Reloading page');
      location.reload();
    });
  } else {
    console.error('Restart button not found');
  }
  
  // Victory restart button
  const victoryRestartBtn = document.getElementById('victory-restart-btn');
  if (victoryRestartBtn) {
    console.log('Victory restart button found');
    victoryRestartBtn.addEventListener('click', () => {
      console.log('Victory restart clicked - Reloading page');
      location.reload();
    });
  } else {
    console.error('Victory restart button not found');
  }
  
  console.log('=== Game initialization complete ===');
  console.log('Select a mode to begin!');
  
  // ===== VR MODE DETECTION =====
  const scene = document.querySelector('a-scene');
  
  if (scene) {
    // Listen for VR mode enter
    scene.addEventListener('enter-vr', () => {
      console.log('🥽 Entered VR mode - adjusting UI');
      const overlay = document.getElementById('ui-overlay');
      const hud = document.getElementById('hud');
      
      if (overlay) {
        overlay.style.zIndex = '10000';
        // DON'T disable pointer events on the overlay itself
        // overlay.style.pointerEvents = 'none';
      }
      
      if (hud) {
        hud.style.zIndex = '9999';
      }
      
      // Make sure ALL interactive elements are clickable
      const gameOver = document.getElementById('game-over');
      const victory = document.getElementById('victory-screen');
      const modeSelect = document.getElementById('mode-select');
      const songSelect = document.getElementById('song-select');
      const countdown = document.getElementById('countdown');
      const loading = document.getElementById('loading');
      const restartBtn = document.getElementById('restart-btn');
      const victoryRestartBtn = document.getElementById('victory-restart-btn');
      
      if (gameOver) {
        gameOver.style.pointerEvents = 'auto';
        gameOver.style.zIndex = '10001';
      }
      if (victory) {
        victory.style.pointerEvents = 'auto';
        victory.style.zIndex = '10001';
      }
      if (modeSelect) modeSelect.style.pointerEvents = 'auto';
      if (songSelect) songSelect.style.pointerEvents = 'auto';
      if (countdown) countdown.style.pointerEvents = 'auto';
      if (loading) loading.style.pointerEvents = 'auto';
      if (restartBtn) {
        restartBtn.style.pointerEvents = 'auto';
        restartBtn.style.zIndex = '10002';
      }
      if (victoryRestartBtn) {
        victoryRestartBtn.style.pointerEvents = 'auto';
        victoryRestartBtn.style.zIndex = '10002';
      }
      
      console.log('✅ VR mode UI adjustments complete - buttons should be clickable');
    });
    
    // Listen for VR mode exit
    scene.addEventListener('exit-vr', () => {
      console.log('🖥️ Exited VR mode - resetting UI');
      const overlay = document.getElementById('ui-overlay');
      const hud = document.getElementById('hud');
      
      if (overlay) {
        overlay.style.zIndex = '1000';
        overlay.style.pointerEvents = '';
      }
      
      if (hud) {
        hud.style.zIndex = '999';
      }
      
      // Reset z-index for screens
      const gameOver = document.getElementById('game-over');
      const victory = document.getElementById('victory-screen');
      if (gameOver) gameOver.style.zIndex = '';
      if (victory) victory.style.zIndex = '';
    });
  } else {
    console.error('A-Frame scene not found - VR detection unavailable');
  }
});
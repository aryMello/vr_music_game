// ===== Main Entry Point =====
// This file initializes the game and sets up event listeners
import gameState from './GameState.js';
import { selectSong } from './GameFlow.js';
import { showElement, hideElement } from './UIManager.js';

console.log('=== VR RHYTHM RUNNER ===');
console.log('Main entry point loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Initializing game');
  
  // Mode selection buttons
  const vrModeBtn = document.getElementById('vr-mode-btn');
  const desktopModeBtn = document.getElementById('desktop-mode-btn');
  
  if (vrModeBtn) {
    vrModeBtn.addEventListener('click', () => {
      console.log('VR Mode selected');
      gameState.mode = 'vr';
      hideElement('mode-select');
      showElement('song-select');
      document.getElementById('mode-indicator').textContent = 'Mode: VR Headset 🥽';
    });
  }
  
  if (desktopModeBtn) {
    desktopModeBtn.addEventListener('click', () => {
      console.log('Desktop Mode selected');
      gameState.mode = 'desktop';
      hideElement('mode-select');
      showElement('song-select');
      document.getElementById('mode-indicator').textContent = 'Mode: Desktop 🖥️ (Arrow Keys)';
    });
  }
  
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
});
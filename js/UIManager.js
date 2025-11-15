// ===== UI Management =====
import gameState from './GameState.js';

export function hideElement(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('hidden');
  } else {
    console.error('Element not found:', id);
  }
}

export function showElement(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('hidden');
  } else {
    console.error('Element not found:', id);
  }
}

export function updateHUD() {
  const scoreEl = document.getElementById('hud-score');
  const timeEl = document.getElementById('hud-time');
  const comboEl = document.getElementById('hud-combo');
  
  if (scoreEl) scoreEl.textContent = `Pontuação: ${gameState.score}`;
  if (comboEl) comboEl.textContent = `Combo: x${gameState.combo}`;
  
  if (timeEl && gameState.startTime) {
    const elapsed = ((Date.now() - gameState.startTime) / 1000).toFixed(1);
    timeEl.textContent = `Tempo: ${elapsed}s`;
  }
}

export function showGameOver() {
  const survivalTime = ((Date.now() - gameState.startTime) / 1000).toFixed(2);
  const audioDuration = gameState.audio ? gameState.audio.duration : 120;
  const progress = Math.min(100, (survivalTime / audioDuration * 100)).toFixed(1);
  
  console.log('Game Over Stats:');
  console.log('- Survival time:', survivalTime);
  console.log('- Song progress:', progress);
  console.log('- Final score:', gameState.score);
  console.log('- Obstacles dodged:', gameState.dodgedCount);
  
  document.getElementById('time-stat').textContent = survivalTime + 's';
  document.getElementById('progress-stat').textContent = progress + '%';
  document.getElementById('score-stat').textContent = gameState.score;
  document.getElementById('dodged-stat').textContent = gameState.dodgedCount;
  
  hideElement('hud');
  
  const overlay = document.getElementById('ui-overlay');
  if (overlay) overlay.classList.remove('fade-out');
  
  showElement('ui-overlay');
  showElement('game-over');
}

export function showVictory() {
  const survivalTime = ((Date.now() - gameState.startTime) / 1000).toFixed(2);
  
  console.log('Victory Stats:');
  console.log('- Completion time:', survivalTime);
  console.log('- Final score:', gameState.score);
  console.log('- Obstacles dodged:', gameState.dodgedCount);
  
  // Update victory stats
  document.getElementById('victory-time-stat').textContent = survivalTime + 's';
  document.getElementById('victory-score-stat').textContent = gameState.score;
  document.getElementById('victory-dodged-stat').textContent = gameState.dodgedCount;
  
  hideElement('hud');
  
  const overlay = document.getElementById('ui-overlay');
  if (overlay) overlay.classList.remove('fade-out');
  
  showElement('ui-overlay');
  showElement('victory-screen');
}
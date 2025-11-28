// ===== UI Management =====
import gameState from '../core/GameState.js';

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
  
  if (scoreEl) scoreEl.textContent = `Pontuação: ${Math.round(gameState.score)}`;
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
  document.getElementById('score-stat').textContent = Math.round(gameState.score);
  document.getElementById('dodged-stat').textContent = gameState.dodgedCount;
  
  hideElement('hud');
  
  const overlay = document.getElementById('ui-overlay');
  if (overlay) {
    overlay.classList.remove('fade-out');
    // Ensure overlay is clickable in VR
    overlay.style.pointerEvents = 'auto';
    overlay.style.zIndex = '10000';
  }
  
  const gameOverScreen = document.getElementById('game-over');
  if (gameOverScreen) {
    // Force game over to be visible and clickable
    gameOverScreen.style.display = 'block';
    gameOverScreen.style.pointerEvents = 'auto';
    gameOverScreen.style.zIndex = '10001';
  }
  
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.style.pointerEvents = 'auto';
    restartBtn.style.zIndex = '10002';
  }
  
  showElement('ui-overlay');
  showElement('game-over');
  
  console.log('✅ Game Over screen should now be visible and clickable');
}

export function showVictory() {
  const survivalTime = ((Date.now() - gameState.startTime) / 1000).toFixed(2);
  
  console.log('Victory Stats:');
  console.log('- Completion time:', survivalTime);
  console.log('- Final score:', gameState.score);
  console.log('- Obstacles dodged:', gameState.dodgedCount);
  
  // Update victory stats
  document.getElementById('victory-time-stat').textContent = survivalTime + 's';
  document.getElementById('victory-score-stat').textContent = Math.round(gameState.score);
  document.getElementById('victory-dodged-stat').textContent = gameState.dodgedCount;
  
  hideElement('hud');
  
  const overlay = document.getElementById('ui-overlay');
  if (overlay) {
    overlay.classList.remove('fade-out');
    // Ensure overlay is clickable in VR
    overlay.style.pointerEvents = 'auto';
    overlay.style.zIndex = '10000';
  }
  
  const victoryScreen = document.getElementById('victory-screen');
  if (victoryScreen) {
    // Force victory screen to be visible and clickable
    victoryScreen.style.display = 'block';
    victoryScreen.style.pointerEvents = 'auto';
    victoryScreen.style.zIndex = '10001';
  }
  
  const restartBtn = document.getElementById('victory-restart-btn');
  if (restartBtn) {
    restartBtn.style.pointerEvents = 'auto';
    restartBtn.style.zIndex = '10002';
  }
  
  showElement('ui-overlay');
  showElement('victory-screen');
  
  console.log('✅ Victory screen should now be visible and clickable');
}

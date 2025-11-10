// ===== Collision Detection System =====
import CONFIG from './config.js';
import gameState from './GameState.js';
import { endGame } from './GameFlow.js';

class CollisionDetector {
  constructor() {
    console.log('Creating CollisionDetector');
    this.checkInterval = null;
  }

  start() {
    console.log('Starting collision detection');
    this.checkInterval = setInterval(() => this.check(), 50);
  }

  stop() {
    console.log('Stopping collision detection');
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  check() {
    if (!gameState.playing || !gameState.playerController) return;

    // Get player position from PlayerController
    const playerPos = gameState.playerController.getPlayerPosition();

    // Check obstacle collisions
    for (const obstacle of gameState.obstacles) {
      const pos = obstacle.position;
      const distance = Math.sqrt(
        Math.pow(playerPos.x - pos.x, 2) +
        Math.pow(playerPos.y - pos.y, 2) +
        Math.pow(playerPos.z - pos.z, 2)
      );

      if (distance < CONFIG.collision.distance) {
        console.log('Collision detected at distance:', distance);
        console.log('Player:', playerPos);
        console.log('Obstacle:', pos);
        endGame();
        return;
      }
    }
  }
}

export default CollisionDetector;
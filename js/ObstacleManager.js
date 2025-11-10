// ===== Obstacle Management System =====
import gameState from './GameState.js';
import { updateHUD } from './UIManager.js';

class ObstacleManager {
  constructor(scene, config) {
    console.log('Creating ObstacleManager with config:', config);
    this.scene = scene;
    this.config = config;
    this.container = document.querySelector('#obstacles');
    this.spawnInterval = null;
    
    if (!this.container) {
      console.error('Obstacles container not found!');
    }
  }

  spawnObstacle() {
    const shapes = [
      { primitive: 'box', width: 1, height: 1, depth: 1 },
      { primitive: 'sphere', radius: 0.5 },
      { primitive: 'cylinder', radius: 0.5, height: 1 },
      { primitive: 'cone', radiusBottom: 0.5, radiusTop: 0, height: 1 }
    ];
    
    const shapeConfig = shapes[Math.floor(Math.random() * shapes.length)];
    const obstacle = document.createElement('a-entity');
    
    // Get camera position to spawn ahead of player
    const cameraRig = document.querySelector('#camera-rig');
    const cameraZ = cameraRig ? cameraRig.object3D.position.z : 0;
    
    // Random position within tunnel, spawn ahead of camera
    const x = (Math.random() - 0.5) * 12;
    const y = Math.random() * 4 + 0.5;
    const z = cameraZ - 80; // Spawn 80 units ahead of camera
    
    const scale = Math.random() * 0.6 + 0.5;
    const hue = Math.random() * 360;
    
    // Set geometry
    let geometryStr = `primitive: ${shapeConfig.primitive}`;
    if (shapeConfig.primitive === 'box') {
      geometryStr += `; width: ${scale}; height: ${scale}; depth: ${scale}`;
    } else if (shapeConfig.primitive === 'sphere') {
      geometryStr += `; radius: ${scale * 0.5}`;
    } else if (shapeConfig.primitive === 'cylinder') {
      geometryStr += `; radius: ${scale * 0.5}; height: ${scale}`;
    } else if (shapeConfig.primitive === 'cone') {
      geometryStr += `; radiusBottom: ${scale * 0.5}; radiusTop: 0; height: ${scale}`;
    }
    
    obstacle.setAttribute('geometry', geometryStr);
    obstacle.setAttribute('position', `${x} ${y} ${z}`);
    obstacle.setAttribute('material', `
      color: hsl(${hue}, 80%, 60%);
      metalness: 0.7;
      roughness: 0.2;
      emissive: hsl(${hue}, 80%, 40%);
      emissiveIntensity: 0.5
    `);
    obstacle.setAttribute('class', 'obstacle');
    
    // Add glow effect
    const glow = document.createElement('a-entity');
    let glowGeometry = `primitive: ${shapeConfig.primitive}`;
    if (shapeConfig.primitive === 'box') {
      glowGeometry += `; width: ${scale * 1.3}; height: ${scale * 1.3}; depth: ${scale * 1.3}`;
    } else if (shapeConfig.primitive === 'sphere') {
      glowGeometry += `; radius: ${scale * 0.65}`;
    } else if (shapeConfig.primitive === 'cylinder') {
      glowGeometry += `; radius: ${scale * 0.65}; height: ${scale * 1.3}`;
    } else if (shapeConfig.primitive === 'cone') {
      glowGeometry += `; radiusBottom: ${scale * 0.65}; radiusTop: 0; height: ${scale * 1.3}`;
    }
    
    glow.setAttribute('geometry', glowGeometry);
    glow.setAttribute('material', `
      color: hsl(${hue}, 100%, 70%);
      transparent: true;
      opacity: 0.3;
      shader: flat
    `);
    obstacle.appendChild(glow);
    
    this.container.appendChild(obstacle);
    gameState.obstacles.push({
      element: obstacle,
      position: { x, y, z },
      size: scale
    });
  }

  updateObstacles() {
    if (!gameState.playing) return;

    const speed = this.config.speed;
    
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
      const obstacle = gameState.obstacles[i];
      obstacle.position.z += speed;
      
      obstacle.element.setAttribute('position', 
        `${obstacle.position.x} ${obstacle.position.y} ${obstacle.position.z}`
      );
      
      const currentRotation = obstacle.element.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
      obstacle.element.setAttribute('rotation', 
        `${currentRotation.x + 2} ${currentRotation.y + 1} ${currentRotation.z + 1}`
      );
      
      // Get camera position to check if obstacle passed player
      const cameraRig = document.querySelector('#camera-rig');
      const cameraZ = cameraRig ? cameraRig.object3D.position.z : 0;
      
      // Remove obstacles that passed the player (relative to camera)
      if (obstacle.position.z > cameraZ + 5) {
        obstacle.element.remove();
        gameState.obstacles.splice(i, 1);
        gameState.score += 10 * gameState.combo;
        gameState.dodgedCount++;
        updateHUD();
      }
    }

    requestAnimationFrame(() => this.updateObstacles());
  }

  startSpawning() {
    console.log('Starting obstacle spawning');
    this.spawnInterval = setInterval(() => {
      if (gameState.playing) {
        for (let i = 0; i < this.config.obstacleCount; i++) {
          this.spawnObstacle();
        }
      }
    }, this.config.spawnRate);
  }

  stopSpawning() {
    console.log('Stopping obstacle spawning');
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
  }

  cleanup() {
    console.log('Cleaning up obstacles');
    this.stopSpawning();
    gameState.obstacles.forEach(obs => obs.element.remove());
    gameState.obstacles = [];
  }
}

export default ObstacleManager;
// ===== Obstacle Management System (Enhanced with Anti-Exploit) =====
import gameState from './GameState.js';
import CONFIG from './config.js';
import { updateHUD } from './UIManager.js';

class ObstacleManager {
  constructor(scene, config) {
    console.log('Creating ObstacleManager with config:', config);
    this.scene = scene;
    this.config = config;
    this.container = document.querySelector('#obstacles');
    this.spawnInterval = null;
    this.tunnelRadius = config.tunnelRadius || CONFIG.player.tunnelRadius;
    this.patternCounter = 0;
    this.lastDodgeTime = Date.now();
    
    if (!this.container) {
      console.error('Obstacles container not found!');
    }
  }

  spawnObstacle(targetPosition = null) {
    const shapes = [
      { primitive: 'box', width: 1, height: 1, depth: 1 },
      { primitive: 'sphere', radius: 0.5 },
      { primitive: 'cylinder', radius: 0.5, height: 1 },
      { primitive: 'cone', radiusBottom: 0.5, radiusTop: 0, height: 1 }
    ];
    
    const shapeConfig = shapes[Math.floor(Math.random() * shapes.length)];
    const obstacle = document.createElement('a-entity');
    
    const cameraRig = document.querySelector('#camera-rig');
    const cameraZ = cameraRig ? cameraRig.object3D.position.z : 0;
    
    let x, y;
    
    if (targetPosition) {
      // Targeted spawn at player position (camping penalty)
      x = targetPosition.x + (Math.random() - 0.5) * 2;
      y = targetPosition.y + (Math.random() - 0.5) * 2;
    } else {
      // Normal circular distribution - covers entire tunnel
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.tunnelRadius * 0.9; // Stay within 90% of tunnel
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius + CONFIG.player.tunnelCenterY;
    }
    
    const z = cameraZ - 80; // Spawn 80 units ahead
    
    const scale = Math.random() * 0.6 + 0.5;
    const hue = targetPosition ? 0 : Math.random() * 360; // Red for camping penalty
    
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
      emissiveIntensity: ${targetPosition ? 1.5 : 0.5}
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
      opacity: ${targetPosition ? 0.6 : 0.3};
      shader: flat
    `);
    obstacle.appendChild(glow);
    
    this.container.appendChild(obstacle);
    gameState.obstacles.push({
      element: obstacle,
      position: { x, y, z },
      size: scale,
      isCampingPenalty: !!targetPosition
    });
  }

  spawnPattern() {
    // Spawn obstacle patterns that cover common camping spots
    const cameraRig = document.querySelector('#camera-rig');
    const cameraZ = cameraRig ? cameraRig.object3D.position.z : 0;
    
    this.patternCounter++;
    
    // Every 5th spawn cycle, create a circular pattern
    if (this.patternCounter % 5 === 0) {
      console.log('Spawning circular pattern');
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = this.tunnelRadius * 0.7;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius + CONFIG.player.tunnelCenterY;
        
        const obstacle = document.createElement('a-entity');
        obstacle.setAttribute('geometry', 'primitive: sphere; radius: 0.4');
        obstacle.setAttribute('position', `${x} ${y} ${cameraZ - 80}`);
        obstacle.setAttribute('material', `
          color: #ff00ff;
          metalness: 0.8;
          roughness: 0.1;
          emissive: #ff00ff;
          emissiveIntensity: 0.8
        `);
        obstacle.setAttribute('class', 'obstacle');
        
        this.container.appendChild(obstacle);
        gameState.obstacles.push({
          element: obstacle,
          position: { x, y, z: cameraZ - 80 },
          size: 0.4,
          isPattern: true
        });
      }
    }
  }

  updateObstacles() {
    if (!gameState.playing) return;

    const speed = this.config.speed;
    const now = Date.now();
    
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
      
      const cameraRig = document.querySelector('#camera-rig');
      const cameraZ = cameraRig ? cameraRig.object3D.position.z : 0;
      
      // Remove obstacles that passed the player
      if (obstacle.position.z > cameraZ + 5) {
        obstacle.element.remove();
        gameState.obstacles.splice(i, 1);
        
        // Award points and update combo
        gameState.score += 10 * gameState.combo;
        gameState.dodgedCount++;
        this.lastDodgeTime = now;
        
        // Increase combo (max 10x)
        if (gameState.combo < 10) {
          gameState.combo++;
        }
        
        updateHUD();
      }
    }

    // Combo timeout: Reset combo if no dodge for 3 seconds
    if (now - this.lastDodgeTime > 3000 && gameState.combo > 1) {
      console.log('Combo reset due to inactivity');
      gameState.combo = 1;
      updateHUD();
    }

    requestAnimationFrame(() => this.updateObstacles());
  }

  startSpawning() {
    console.log('Starting obstacle spawning with anti-exploit features');
    this.lastDodgeTime = Date.now(); // Initialize dodge timer
    
    this.spawnInterval = setInterval(() => {
      if (gameState.playing) {
        // Spawn regular obstacles
        for (let i = 0; i < this.config.obstacleCount; i++) {
          this.spawnObstacle();
        }
        // Spawn patterns
        this.spawnPattern();
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
    this.patternCounter = 0;
  }
}

export default ObstacleManager;
// ===== VR Player Controller =====
// Handles automatic forward movement and head-based positioning
import CONFIG from './config.js';
import gameState from './GameState.js';

class PlayerController {
  constructor(mode = 'vr') {
    console.log('Creating PlayerController in', mode, 'mode');
    this.mode = mode;
    this.cameraRig = document.querySelector('#camera-rig');
    this.camera = document.querySelector('#player');
    this.updateInterval = null;
    this.forwardSpeed = CONFIG.player.forwardSpeed;
    this.tunnelRadius = CONFIG.player.tunnelRadius;
    this.tunnelCenterY = CONFIG.player.tunnelCenterY;
    
    // Desktop mode controls
    this.desktopPosition = { x: 0, y: 0 };
    
    if (this.mode === 'desktop') {
      this.setupDesktopControls();
    }
  }

  setupDesktopControls() {
    console.log('Setting up desktop arrow key controls');
    
    // Use keydown for continuous movement
    this.activeKeys = new Set();
    
    document.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        this.activeKeys.add(e.key);
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        this.activeKeys.delete(e.key);
      }
    });
    
    console.log('✅ Desktop controls enabled: Use Arrow Keys to move');
  }

  updateDesktopMovement() {
    const moveSpeed = 0.08;
    
    if (this.activeKeys.has('ArrowLeft')) {
      this.desktopPosition.x -= moveSpeed;
    }
    if (this.activeKeys.has('ArrowRight')) {
      this.desktopPosition.x += moveSpeed;
    }
    if (this.activeKeys.has('ArrowUp')) {
      this.desktopPosition.y += moveSpeed;
    }
    if (this.activeKeys.has('ArrowDown')) {
      this.desktopPosition.y -= moveSpeed;
    }
  }

  start() {
    console.log('Starting player controller - Mode:', this.mode);
    
    // Disable WASD controls
    if (this.camera) {
      this.camera.setAttribute('wasd-controls', 'enabled: false');
    }
    
    // In desktop mode, also reduce mouse look sensitivity or disable it
    if (this.mode === 'desktop' && this.camera) {
      this.camera.setAttribute('look-controls', 'enabled: false');
      console.log('Mouse look disabled for desktop mode');
    }
    
    this.updateInterval = setInterval(() => this.update(), 16); // ~60fps
  }

  stop() {
    console.log('Stopping player controller');
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  update() {
    if (!gameState.playing || !this.cameraRig || !this.camera) return;

    const rigPos = this.cameraRig.object3D.position;
    const camPos = this.camera.object3D.position;
    
    // Automatic forward movement
    rigPos.z -= this.forwardSpeed;
    
    // Update desktop movement if in desktop mode
    if (this.mode === 'desktop') {
      this.updateDesktopMovement();
    }
    
    // Get player position based on mode
    let playerX, playerY;
    
    if (this.mode === 'desktop') {
      // Desktop mode: use arrow key position
      playerX = rigPos.x + this.desktopPosition.x;
      playerY = rigPos.y + this.desktopPosition.y;
    } else {
      // VR mode: use camera head tracking
      playerX = rigPos.x + camPos.x;
      playerY = rigPos.y + camPos.y;
    }
    
    // Constrain player to tunnel boundaries
    const distanceFromCenter = Math.sqrt(
      Math.pow(playerX, 2) + 
      Math.pow(playerY - this.tunnelCenterY, 2)
    );
    
    if (distanceFromCenter > this.tunnelRadius) {
      // Push player back inside tunnel smoothly
      const angle = Math.atan2(playerY - this.tunnelCenterY, playerX);
      const targetX = Math.cos(angle) * this.tunnelRadius;
      const targetY = Math.sin(angle) * this.tunnelRadius + this.tunnelCenterY;
      
      // Smooth transition back to tunnel boundary
      playerX = playerX * 0.9 + targetX * 0.1;
      playerY = playerY * 0.9 + targetY * 0.1;
      
      // Update position based on mode
      if (this.mode === 'desktop') {
        this.desktopPosition.x = playerX - rigPos.x;
        this.desktopPosition.y = playerY - rigPos.y;
      } else {
        rigPos.x = playerX - camPos.x;
        rigPos.y = playerY - camPos.y;
      }
    } else {
      // Update rig position in desktop mode
      if (this.mode === 'desktop') {
        rigPos.x = this.desktopPosition.x;
        rigPos.y = this.desktopPosition.y;
      }
    }
    
    // Apply updated position
    this.cameraRig.object3D.position.copy(rigPos);
  }

  getPlayerPosition() {
    if (!this.cameraRig || !this.camera) {
      return { x: 0, y: this.tunnelCenterY, z: 0 };
    }
    
    const rigPos = this.cameraRig.object3D.position;
    const camPos = this.camera.object3D.position;
    
    if (this.mode === 'desktop') {
      return {
        x: rigPos.x + this.desktopPosition.x,
        y: rigPos.y + this.desktopPosition.y,
        z: rigPos.z + camPos.z
      };
    } else {
      return {
        x: rigPos.x + camPos.x,
        y: rigPos.y + camPos.y,
        z: rigPos.z + camPos.z
      };
    }
  }

  reset() {
    console.log('Resetting player position');
    this.desktopPosition = { x: 0, y: 0 };
    if (this.activeKeys) {
      this.activeKeys.clear();
    }
    if (this.cameraRig) {
      this.cameraRig.setAttribute('position', `0 ${this.tunnelCenterY} 0`);
    }
    if (this.camera) {
      this.camera.object3D.position.set(0, 0, 0);
    }
  }
}

export default PlayerController;
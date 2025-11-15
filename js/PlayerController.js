// ===== VR Player Controller (Enhanced with Anti-Camping) =====
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

  checkCamping() {
    const currentPos = this.getPlayerPosition();
    const now = Date.now();
    
    // Calculate distance from last recorded position
    const distance = Math.sqrt(
      Math.pow(currentPos.x - gameState.lastPosition.x, 2) +
      Math.pow(currentPos.y - gameState.lastPosition.y, 2)
    );
    
    // If player hasn't moved much
    if (distance < CONFIG.player.campingDistanceThreshold) {
      // Check if they've been camping for too long
      if (now - gameState.lastPosition.time > CONFIG.player.campingTimeThreshold) {
        if (!gameState.isCamping) {
          console.log('⚠️ Camping detected! Spawning penalty obstacles');
          gameState.isCamping = true;
          this.showCampingWarning();
          
          // Spawn obstacles at player position ONCE
          if (gameState.obstacleManager && CONFIG.songs[gameState.difficulty].campingPenalty) {
            for (let i = 0; i < 3; i++) {
              setTimeout(() => {
                if (gameState.playing) {
                  gameState.obstacleManager.spawnObstacle(currentPos);
                }
              }, i * 200);
            }
          }
        }
        // Keep warning visible while camping
        else {
          // Warning already shown, don't respawn obstacles
        }
      }
    } else {
      // Player moved significantly, reset camping detection
      gameState.lastPosition = { x: currentPos.x, y: currentPos.y, time: now };
      gameState.isCamping = false;
      this.hideCampingWarning();
    }
  }

  showCampingWarning() {
    const warning = document.getElementById('warning-indicator');
    if (warning && !gameState.campingWarningShown) {
      warning.classList.remove('hidden');
      gameState.campingWarningShown = true;
      // Warning sound removed for better immersion
    }
  }

  hideCampingWarning() {
    const warning = document.getElementById('warning-indicator');
    if (warning) {
      warning.classList.add('hidden');
      gameState.campingWarningShown = false;
    }
  }

  start() {
    console.log('Starting player controller - Mode:', this.mode);
    
    // Disable WASD controls
    if (this.camera) {
      this.camera.setAttribute('wasd-controls', 'enabled: false');
    }
    
    // In desktop mode, disable mouse look
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
    this.hideCampingWarning();
  }

  update() {
    if (!gameState.playing || !this.cameraRig || !this.camera) return;

    const rigPos = this.cameraRig.object3D.position;
    const camPos = this.camera.object3D.position;
    const camRot = this.camera.object3D.rotation;
    
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
      // VR mode: Convert head rotation to position
      const sensitivity = 4.0;
      
      // Horizontal movement based on yaw (looking left/right)
      const yaw = camRot.y;
      const targetX = -Math.sin(yaw) * sensitivity;
      
      // Vertical movement based on pitch (looking up/down)
      const pitch = camRot.x;
      const targetY = Math.sin(pitch) * sensitivity;
      
      // Smooth interpolation
      rigPos.x += (targetX - rigPos.x) * 0.1;
      rigPos.y += (targetY - rigPos.y) * 0.1;
      
      playerX = rigPos.x;
      playerY = rigPos.y + this.tunnelCenterY;
    }
    
    // Constrain player to tunnel boundaries with tighter limit (85%)
    const safeRadius = this.tunnelRadius * 0.85;
    const distanceFromCenter = Math.sqrt(
      Math.pow(playerX, 2) + 
      Math.pow(playerY - this.tunnelCenterY, 2)
    );
    
    if (distanceFromCenter > safeRadius) {
      // Push player back inside tunnel smoothly
      const angle = Math.atan2(playerY - this.tunnelCenterY, playerX);
      const targetX = Math.cos(angle) * safeRadius;
      const targetY = Math.sin(angle) * safeRadius + this.tunnelCenterY;
      
      // Smooth transition back to tunnel boundary
      if (this.mode === 'desktop') {
        this.desktopPosition.x = targetX * 0.9 + this.desktopPosition.x * 0.1;
        this.desktopPosition.y = (targetY - this.tunnelCenterY) * 0.9 + this.desktopPosition.y * 0.1;
        rigPos.x = this.desktopPosition.x;
        rigPos.y = this.desktopPosition.y;
      } else {
        rigPos.x = targetX * 0.9 + rigPos.x * 0.1;
        rigPos.y = (targetY - this.tunnelCenterY) * 0.9 + rigPos.y * 0.1;
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
    
    // Check for camping behavior
    this.checkCamping();
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
        x: rigPos.x,
        y: rigPos.y + this.tunnelCenterY,
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
    this.hideCampingWarning();
  }
}

export default PlayerController;
// ===== Visual Effects System =====
import CONFIG from './config.js';
import gameState from './GameState.js';

class VisualEffects {
  constructor(scene) {
    console.log('Creating VisualEffects');
    this.scene = scene;
    this.stars = [];
    this.particles = [];
    this.tunnelRings = [];
    this.gridLines = [];
    this.tunnelSegmentLength = 5; // Distance between rings
    this.tunnelRadius = 8;
  }

  createStarfield() {
    console.log('Creating starfield with', CONFIG.visualizer.starCount, 'stars');
    const starContainer = document.querySelector('#particles');
    
    if (!starContainer) {
      console.error('Particles container not found!');
      return;
    }
    
    for (let i = 0; i < CONFIG.visualizer.starCount; i++) {
      const star = document.createElement('a-sphere');
      const size = Math.random() * 0.08 + 0.02;
      const hue = Math.random() * 60 + 180;
      
      star.setAttribute('radius', size);
      star.setAttribute('color', `hsl(${hue}, 100%, ${Math.random() * 30 + 60}%)`);
      star.setAttribute('material', 'shader: flat; opacity: 0.9');
      star.setAttribute('position', {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 50 + 10,
        z: -Math.random() * 150 - 50
      });
      
      star.setAttribute('animation', `
        property: components.material.material.opacity;
        from: 0.9;
        to: 0.3;
        dur: ${Math.random() * 2000 + 1000};
        dir: alternate;
        loop: true;
        easing: easeInOutQuad
      `);
      
      starContainer.appendChild(star);
      this.stars.push(star);
    }
    console.log('Starfield created successfully');
  }

  createTunnel() {
    console.log('Creating initial tunnel segments');
    
    // Create initial tunnel rings ahead of the player (more rings for longer coverage)
    for (let i = 0; i < 100; i++) {
      this.createTunnelRing(i);
    }
    
    console.log('Tunnel created with', this.tunnelRings.length, 'rings');
  }

  createTunnelRing(index) {
    const z = -10 - (index * this.tunnelSegmentLength);
    const ring = document.createElement('a-torus');
    
    ring.setAttribute('radius', this.tunnelRadius);
    ring.setAttribute('radius-tubular', 0.1);
    ring.setAttribute('segments-tubular', 32);
    ring.setAttribute('position', `0 1.6 ${z}`);
    ring.setAttribute('rotation', '0 0 0');
    
    const hue = (index * 10) % 360;
    ring.setAttribute('material', `
      color: hsl(${hue}, 70%, 50%);
      emissive: hsl(${hue}, 70%, 30%);
      emissiveIntensity: 0.5;
      metalness: 0.8;
      roughness: 0.2;
      transparent: true;
      opacity: 0.6
    `);
    
    ring.setAttribute('animation', `
      property: scale;
      from: 1 1 1;
      to: 1.1 1.1 1.1;
      dur: ${1000 + Math.random() * 1000};
      dir: alternate;
      loop: true;
      easing: easeInOutQuad
    `);
    
    this.scene.appendChild(ring);
    this.tunnelRings.push({ element: ring, z: z, index: index });
    
    // Create grid lines for this ring
    this.createGridLinesForRing(index, z);
  }

  createGridLinesForRing(index, z) {
    // Vertical lines (only create them periodically to avoid too many)
    if (index % 3 === 0) {
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * this.tunnelRadius;
        const y = Math.sin(angle) * this.tunnelRadius + 1.6;
        
        const line = document.createElement('a-entity');
        line.setAttribute('line', `
          start: ${x} ${y} ${z};
          end: ${x} ${y} ${z - this.tunnelSegmentLength * 3};
          color: #00ffff;
          opacity: 0.3
        `);
        this.scene.appendChild(line);
        this.gridLines.push({ element: line, z: z });
      }
    }
    
    // Horizontal ring segments
    for (let j = 0; j < 12; j++) {
      const angle1 = (j / 12) * Math.PI * 2;
      const angle2 = ((j + 1) / 12) * Math.PI * 2;
      
      const x1 = Math.cos(angle1) * this.tunnelRadius;
      const y1 = Math.sin(angle1) * this.tunnelRadius + 1.6;
      const x2 = Math.cos(angle2) * this.tunnelRadius;
      const y2 = Math.sin(angle2) * this.tunnelRadius + 1.6;
      
      const line = document.createElement('a-entity');
      line.setAttribute('line', `
        start: ${x1} ${y1} ${z};
        end: ${x2} ${y2} ${z};
        color: #ff00ff;
        opacity: 0.25
      `);
      this.scene.appendChild(line);
      this.gridLines.push({ element: line, z: z });
    }
  }

  updateTunnel() {
    if (!gameState.playing || !gameState.playerController) return;

    const playerPos = gameState.playerController.getPlayerPosition();
    const cameraZ = playerPos.z;
    
    // Remove rings that are behind the camera
    this.tunnelRings = this.tunnelRings.filter(ring => {
      if (ring.z > cameraZ + 10) {
        ring.element.remove();
        return false;
      }
      return true;
    });
    
    // Remove grid lines that are behind the camera
    this.gridLines = this.gridLines.filter(line => {
      if (line.z > cameraZ + 10) {
        line.element.remove();
        return false;
      }
      return true;
    });
    
    // Add new rings ahead if needed
    if (this.tunnelRings.length > 0) {
      const lastRing = this.tunnelRings[this.tunnelRings.length - 1];
      let furthestZ = lastRing.z;
      
      // Keep spawning rings to maintain at least 300 units ahead of camera
      // Add safety limit to prevent infinite loops
      let ringsCreated = 0;
      const maxRingsPerFrame = 10;
      
      while (furthestZ > cameraZ - 300 && ringsCreated < maxRingsPerFrame && gameState.playing) {
        const newIndex = this.tunnelRings[this.tunnelRings.length - 1].index + 1;
        this.createTunnelRing(newIndex);
        furthestZ = this.tunnelRings[this.tunnelRings.length - 1].z;
        ringsCreated++;
      }
    }
  }

  createBeatPulse() {
    const pulse = document.createElement('a-sphere');
    pulse.setAttribute('radius', 0.1);
    pulse.setAttribute('position', '0 1.6 -3');
    pulse.setAttribute('material', 'color: #ff00ff; shader: flat; transparent: true; opacity: 0.8');
    pulse.setAttribute('animation', `
      property: scale;
      from: 0.1 0.1 0.1;
      to: 5 5 5;
      dur: 500;
      easing: easeOutQuad
    `);
    pulse.setAttribute('animation__fade', `
      property: components.material.material.opacity;
      from: 0.8;
      to: 0;
      dur: 500;
      easing: easeOutQuad
    `);
    
    this.scene.appendChild(pulse);
    setTimeout(() => pulse.remove(), 500);
  }

  updateVisualization(frequencyData, energy) {
    const sky = document.querySelector('#sky');
    if (sky) {
      const intensity = Math.floor(energy * 100);
      sky.setAttribute('color', `hsl(${220 + intensity * 0.5}, 80%, ${10 + intensity * 0.3}%)`);
    }
    
    // Animate tunnel rings based on audio
    this.tunnelRings.forEach((ringObj, index) => {
      const ring = ringObj.element;
      const frequency = frequencyData[index % frequencyData.length] / 255;
      const targetScale = 1 + (frequency * 0.3);
      ring.setAttribute('scale', `${targetScale} ${targetScale} ${targetScale}`);
      
      // Update emissive intensity based on audio
      const hue = (ringObj.index * 10) % 360;
      const emissiveIntensity = 0.3 + frequency * 0.5;
      ring.setAttribute('material', {
        color: `hsl(${hue}, 70%, 50%)`,
        emissive: `hsl(${hue}, 70%, 30%)`,
        emissiveIntensity: emissiveIntensity,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6
      });
    });
  }

  cleanup() {
    console.log('Cleaning up visual effects');
    this.stars.forEach(star => star.remove());
    this.particles.forEach(particle => particle.remove());
    this.tunnelRings.forEach(ring => ring.element.remove());
    this.gridLines.forEach(line => line.element.remove());
    this.stars = [];
    this.particles = [];
    this.tunnelRings = [];
    this.gridLines = [];
  }
}

export default VisualEffects;
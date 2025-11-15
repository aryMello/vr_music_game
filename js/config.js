// ===== Game Configuration =====
const CONFIG = {
  songs: {
    easy: {
      path: './assets/songs/chill-vibes.mp3',
      speed: 0.04,
      spawnRate: 2500,
      obstacleCount: 1,
      beatThreshold: 0.85,
      tunnelRadius: 7,
      campingPenalty: true
    },
    medium: {
      path: './assets/songs/rock-energy.mp3',
      speed: 0.07,
      spawnRate: 1800,
      obstacleCount: 2,
      beatThreshold: 0.80,
      tunnelRadius: 7,
      campingPenalty: true
    },
    hard: {
      path: './assets/songs/electronic-storm.mp3',
      speed: 0.11,
      spawnRate: 1200,
      obstacleCount: 3,
      beatThreshold: 0.75,
      tunnelRadius: 7,
      campingPenalty: true
    }
  },
  player: {
    forwardSpeed: 0.05,
    tunnelRadius: 7,
    tunnelCenterY: 1.6,
    campingTimeThreshold: 3000, // 3 seconds before camping penalty
    campingDistanceThreshold: 2 // units - if player stays within this radius
  },
  collision: {
    distance: 1.2
  },
  visualizer: {
    particleCount: 50,
    starCount: 300
  }
};

console.log('Config loaded:', CONFIG);
export default CONFIG;
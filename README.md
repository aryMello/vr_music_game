# VR Music Rhythm Runner

An immersive VR rhythm game that synchronizes obstacles with your music using real-time beat detection. Dodge obstacles that spawn to the beat of your favorite songs!

## Features

- **Real-time Beat Detection**: Obstacles spawn synchronized with the actual beats of your music using Web Audio API
- **Audio-Reactive Visuals**: Environment responds to music frequency and energy levels
- **3 Difficulty Levels**: Easy, Medium, and Hard with different speeds and obstacle counts
- **VR Support**: Full A-Frame VR compatibility with head tracking
- **Combo System**: Build combos by surviving longer
- **Immersive Environment**: 300+ stars, dynamic lighting, and grid floor
- **Score Tracking**: Time survived, song progress %, score, and obstacles dodged

## How It Works

### Beat Synchronization
The game uses **Web Audio API** to analyze your MP3 files in real-time:

1. **Bass Energy Detection**: Analyzes low frequencies (20-250 Hz) to detect drum beats
2. **Energy Threshold**: Compares current energy to previous values to identify beat peaks
3. **Beat History**: Prevents multiple detections and ensures proper timing
4. **Adaptive Spawning**: Obstacles spawn on detected beats, not on a fixed timer

This means the game truly syncs with YOUR music, not a pre-programmed pattern!

### 3. Run the Game
You need a local web server (browsers block audio file loading from `file://`):

**Using VS Code:**
Install "Live Server" extension and click "Go Live"

Then open: `http://localhost:8000`

## Gameplay

1. **Select Song**: Choose your difficulty level
2. **Loading**: Game analyzes the music for beat detection
3. **Countdown**: 3... 2... 1... GO!
4. **Dodge**: Move with WASD and look around to avoid obstacles
5. **Survive**: Last as long as possible, build combos!

### Controls
- **Look Around**: Mouse or VR headset
- **Move**: WASD keys or VR controller
- **Restart**: Click "Play Again" after game over

## Visual Features

- **Starfield**: 300 animated stars with twinkling effects
- **Grid Floor**: Cyberpunk-style floor grid
- **Beat Pulses**: Visual pulse effects on every detected beat
- **Dynamic Sky**: Sky color changes based on music energy
- **Glowing Obstacles**: Metallic obstacles with emissive glow effects
- **HUD**: Real-time score, time, and combo display

## Learning Resources

This project demonstrates:
- Web Audio API for real-time audio analysis
- A-Frame for WebVR development
- Beat detection algorithms
- 3D graphics with Three.js
- Game state management
- Collision detection
- Animation and visual effects

## License

Free to use for personal and educational projects!

## Credits

Created with:
- A-Frame VR Framework
- Web Audio API
- Pure JavaScript ES6+
- CSS3 Animations

---

**Enjoy your VR music journey!**
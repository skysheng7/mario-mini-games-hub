# 🍄 Mario Mini-Games Hub

A collection of fun Mario-themed mini-games built with HTML5 Canvas and JavaScript. Perfect for hosting on GitHub Pages!

## 🎮 Games Included

### 1. Super Platformer
- Classic Mario-style side-scrolling platformer
- Jump on enemies and collect coins
- Multiple platforms and challenging obstacles
- Lives system with respawning

### 2. Coin Rush
- Fast-paced coin collection game
- Avoid falling obstacles while collecting coins
- Power-ups: Shield, Magnet, and Slow-time
- Increasing difficulty levels

### 3. Block Puzzle
- Tetris-inspired puzzle game
- Drop and rotate colorful blocks
- Clear lines to score points
- Ghost piece preview and hard drop

## 🚀 Features

- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Mobile Controls**: Touch-friendly control buttons for mobile gameplay
- **High Score System**: Local storage saves your best scores
- **Modern UI**: Clean, pixel-art inspired design with smooth animations
- **Particle Effects**: Visual feedback for actions and achievements
- **Progressive Difficulty**: Games get harder as you play

## 🛠️ How to Deploy on GitHub Pages

1. **Create a new repository** on GitHub
2. **Upload all files** to the repository
3. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click Save
4. **Access your game** at `https://yourusername.github.io/repository-name`

## 🎯 Controls

### Desktop
- **Arrow Keys**: Move/Navigate
- **Spacebar**: Jump (Platformer) / Hard Drop (Puzzle)
- **Up Arrow**: Rotate (Puzzle)

### Mobile
- **Touch Controls**: On-screen buttons for movement and actions
- **Tap**: Click/Touch gameplay for Coin Rush

## 📁 File Structure

```
mario-games/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styling
├── js/
│   ├── main.js            # Main application logic
│   ├── gameEngine.js      # Core game engine
│   └── games/
│       ├── platformer.js  # Super Platformer game
│       ├── collector.js   # Coin Rush game
│       └── puzzle.js      # Block Puzzle game
└── README.md              # This file
```

## 🏆 Scoring System

- **Platformer**: Coins (50pts), Enemies (100pts), Completion bonus
- **Coin Rush**: Regular coins (50pts), Bonus coins (100pts)  
- **Block Puzzle**: Lines cleared (100-800pts per clear), Hard drop bonus

## 🌟 Technical Features

- **Modern JavaScript**: ES6+ classes and features
- **Canvas Rendering**: Hardware-accelerated 2D graphics
- **Collision Detection**: Precise AABB collision system
- **Particle System**: Dynamic visual effects
- **Local Storage**: Persistent high scores
- **Mobile Optimization**: Touch events and responsive design

## 🎨 Customization

The game is built with modularity in mind. You can easily:
- Add new games by extending the `BaseGame` class
- Modify colors in the CSS file
- Adjust difficulty by changing game parameters
- Add new power-ups or game mechanics

## 🐛 Browser Compatibility

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers with HTML5 Canvas support

## 📝 License

This project is open source and available under the MIT License.

---

Enjoy playing! 🎮 If you create your own version, feel free to share it!
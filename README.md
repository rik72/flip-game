# Flipgame

A minimalistic mobile puzzle game built with HTML5 Canvas and touch gestures.

## 🎮 Game Overview

Flipgame is a level-based puzzle game designed exclusively for mobile devices. Players navigate a circle through various board layouts by dragging it along permitted paths, with the goal of reaching the end point of each level.

### Key Features

- **Mobile-First Design**: Optimized for touch interactions and mobile screens
- **Level-Based Progression**: Solve puzzles to unlock new levels
- **Board Manipulation**: Flip and rotate game boards for new perspectives
- **Touch Gestures**: Intuitive drag and tap controls
- **No Text UI**: Clean, visual-only interface with level numbers displayed graphically
- **Progress Saving**: Automatic save/load of game progress

## 🏗️ Architecture

The project follows a modular architecture with clear separation of concerns:

```
CONSTANTS → Utils → ModalManager → HtmlBuilder → DisplayManager → 
StorageManager → BackupManager → GameManager → App
```

### Core Components

- **GameManager**: Handles game logic, level management, and touch interactions
- **StorageManager**: Manages game progress and settings persistence
- **DisplayManager**: Renders game UI and manages display states
- **HtmlBuilder**: Generates HTML components for the game interface
- **Utils**: Provides utility functions for validation and calculations

## 🚀 Getting Started

### Prerequisites

- Modern web browser with HTML5 Canvas support
- Touch-enabled device (recommended) or mouse for desktop testing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd flipgame
```

2. Open `index.html` in a web browser or serve locally:
```bash
# Using Python
python3 -m http.server 8099

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8099
```

3. Access the game at `http://localhost:8099`

### Development

The project uses vanilla JavaScript with no build process required. Key files:

- `index.html` - Main HTML structure
- `app.js` - Main application controller
- `managers/game-manager.js` - Game logic and mechanics
- `styles.css` - Game styling and mobile optimizations
- `constants-*.js` - Game configuration and messages

## 🎯 Game Mechanics

### Core Gameplay

1. **Level Loading**: Each level presents a unique board layout
2. **Player Movement**: Drag the white circle to move along permitted paths
3. **Goal Achievement**: Reach the green end point to complete the level
4. **Board Manipulation**: Use rotation and flip mechanics to find new solutions
5. **Progression**: Complete levels to unlock new challenges

### Board Types

- **Square Lattice**: Traditional grid-based layouts with 90° rotation
- **Triangular Lattice**: Hexagonal-based layouts with 60° rotation

### Cell Types

- **Empty**: Free movement space
- **Path**: Permitted movement corridors
- **Wall**: Blocked areas
- **Teleport**: Instant movement between points
- **Switch**: Interactive elements that change board state
- **Collectible**: Optional items that enhance gameplay

## 📱 Mobile Optimization

### Touch Handling

- **Touch Events**: Optimized for mobile touch interactions
- **Gesture Recognition**: Support for drag, tap, and multi-touch
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Performance**: 60fps target for smooth gameplay

### Accessibility

- **Touch Targets**: Minimum 44px for all interactive elements
- **Visual Feedback**: Clear visual indicators for all game states
- **Reduced Motion**: Respects user preferences for motion sensitivity

## 🎨 Customization

### Adding New Levels

Levels are defined in the `GameManager` with the following structure:

```javascript
{
    board: {
        width: 800,
        height: 600,
        cells: [
            { type: 'path', x: 100, y: 100, width: 50, height: 50 },
            // ... more cells
        ]
    },
    start: { x: 100, y: 100 },
    end: { x: 700, y: 500 },
    obstacles: [],
    powerUps: [],
    timeLimit: null
}
```

### Styling

The game uses CSS custom properties for easy theming:

```css
:root {
    --background-color: #000000;
    --player-color: #ffffff;
    --goal-color: #00ff00;
    --path-color: #666666;
}
```

## 🔧 Development Guidelines

### Code Standards

- **Zero Duplication**: No code or message duplication allowed
- **Constants First**: All text and configuration in constants files
- **Modular Architecture**: Clear separation of concerns
- **Mobile Performance**: Optimize for 60fps on target devices

### File Structure

```
flipgame/
├── index.html              # Main HTML file
├── app.js                  # Main application controller
├── app-bridge.js           # Global bridge functions
├── styles.css              # Game styling
├── constants-en.js         # English constants

├── utils.js                # Utility functions
├── modal-manager.js        # Modal management
├── html-builder.js         # HTML component generation
├── display-manager.js      # Display state management
├── managers/
│   ├── storage-manager.js  # Data persistence
│   ├── backup-manager.js   # Import/export functionality
│   └── game-manager.js     # Game logic and mechanics
└── levels/                 # Level definitions (future)
```

## 🐛 Troubleshooting

### Common Issues

1. **Canvas not rendering**: Check browser compatibility and JavaScript console
2. **Touch not working**: Ensure device supports touch events
3. **Performance issues**: Check for background processes affecting frame rate
4. **Progress not saving**: Verify localStorage is enabled in browser

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem('flipgame_debug', 'true');
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards and architecture guidelines
4. Test on mobile devices
5. Submit a pull request

## 🎯 Roadmap

- [ ] Additional level types and mechanics
- [ ] Sound effects and background music
- [ ] Particle effects and animations
- [ ] Level editor for custom puzzles
- [ ] Multiplayer features
- [ ] Progressive Web App (PWA) support
- [ ] Social sharing and leaderboards

## 📞 Support

For questions or issues, please check the documentation or create an issue in the repository. 
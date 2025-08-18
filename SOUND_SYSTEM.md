# Sound System Documentation

## Overview

The Flipgame sound system provides comprehensive audio feedback for all game interactions, including sound effects, background music, and user interface sounds. The system is designed to be robust with fallback mechanisms and user-configurable settings.

## Features

### Sound Effects
- **Ball Interactions**: Pickup, drop, movement, and snapping sounds
- **Board Interactions**: Flip and rotation sounds
- **Game State**: Level start, completion, and game completion sounds
- **UI Interactions**: Button clicks, modal open/close, and form interactions
- **Feedback**: Success, error, and warning sounds

### Background Music
- Looping background music for ambient gameplay
- Separate volume control from sound effects
- Automatic start/stop based on user preferences

### Settings
- Individual toggles for sound effects and background music
- Volume sliders for both sound effects and music
- Persistent settings saved to localStorage
- Real-time volume adjustment

## Implementation

### Global Configuration

The sound system respects the global `AUDIO_CONFIG.ENABLED` setting in `constants.js`:

```javascript
AUDIO_CONFIG: {
    ENABLED: false,  // Set to false to completely disable all audio
    VOLUME: 0.7,     // Default volume level
    SOUNDS: {
        MOVE: 'move.mp3',
        COLLECT: 'collect.mp3',
        COMPLETE: 'complete.mp3',
        ERROR: 'error.mp3'
    }
}
```

When `AUDIO_CONFIG.ENABLED` is `false`:
- No sound effects will play
- No background music will start
- No generated sounds will be created
- All audio methods return early

### Core Components

#### SoundManager (`managers/sound-manager.js`)
The main audio controller that handles:
- Loading and managing audio files
- Playing sound effects and background music
- Managing volume levels and settings
- Providing fallback generated sounds
- Respecting global audio configuration

#### SoundGenerator (`generate-sounds.js`)
A fallback system that generates basic sounds using the Web Audio API when audio files are unavailable.

### Audio Files

The system expects the following audio files in `assets/sounds/`:

```
assets/sounds/
├── ball-pickup.mp3
├── ball-drop.mp3
├── ball-move.mp3
├── ball-snap.mp3
├── board-flip.mp3
├── board-rotate.mp3
├── level-complete.mp3
├── game-complete.mp3
├── level-start.mp3
├── button-click.mp3
├── button-hover.mp3
├── modal-open.mp3
├── modal-close.mp3
├── error.mp3
├── success.mp3
├── warning.mp3
└── background-music.mp3
```

### Integration Points

#### Game Events
- **Ball Pickup**: `soundManager.playSound('ballPickup')`
- **Ball Drop**: `soundManager.playSound('ballDrop')`
- **Ball Movement**: `soundManager.playSound('ballMove', 0.3)`
- **Ball Snap**: `soundManager.playSound('ballSnap')`
- **Board Flip**: `soundManager.playSound('boardFlip')`
- **Level Complete**: `soundManager.playSound('levelComplete')`
- **Game Complete**: `soundManager.playSound('gameComplete')`

#### UI Events
- **Button Click**: `soundManager.playSound('buttonClick')`
- **Modal Open**: `soundManager.playSound('modalOpen')`
- **Modal Close**: `soundManager.playSound('modalClose')`
- **Success**: `soundManager.playSound('success')`
- **Error**: `soundManager.playSound('error')`
- **Warning**: `soundManager.playSound('warning')`

### Settings Interface

The settings modal includes:
- Sound Effects toggle
- Background Music toggle
- Sound Volume slider (0-100%)
- Music Volume slider (0-100%)
- Real-time volume preview

### Fallback System

When audio files are missing or fail to load, the system automatically falls back to generated sounds using the Web Audio API. This ensures the game always has audio feedback available.

## Usage

### Enabling/Disabling Audio

#### Global Disable (Recommended)
To completely disable all audio, set in `constants.js`:
```javascript
AUDIO_CONFIG: {
    ENABLED: false  // This disables ALL audio functionality
}
```

#### Runtime Control
To control audio at runtime:
```javascript
// Disable sound effects
app.soundManager.setSoundEnabled(false);

// Disable background music
app.soundManager.setMusicEnabled(false);

// Set volume levels
app.soundManager.setVolume(0.5);
app.soundManager.setMusicVolume(0.3);
```

### Basic Sound Playback
```javascript
// Play a sound effect
app.soundManager.playSound('ballPickup');

// Play with custom volume
app.soundManager.playSound('ballMove', 0.3);

// Play background music
app.soundManager.playBackgroundMusic();

// Stop background music
app.soundManager.stopBackgroundMusic();
```

### Settings Management
```javascript
// Enable/disable sound effects
app.soundManager.setSoundEnabled(true);

// Enable/disable background music
app.soundManager.setMusicEnabled(false);

// Set volume levels
app.soundManager.setVolume(0.7);        // 70% sound effects
app.soundManager.setMusicVolume(0.5);   // 50% background music

// Get current settings
const settings = app.soundManager.getSettings();
```

### Generated Sounds (Fallback)
```javascript
// Generate a custom beep
window.soundGenerator.generateBeep(440, 0.1, 0.3); // frequency, duration, volume

// Generate specific sound effects
window.soundGenerator.generateBallPickup();
window.soundGenerator.generateLevelComplete();
window.soundGenerator.generateSuccess();
```

## Browser Compatibility

The sound system supports:
- **Modern Browsers**: Full audio file support with fallback
- **Older Browsers**: Generated sounds via Web Audio API
- **Mobile Devices**: Touch-optimized audio with vibration support
- **Progressive Web Apps**: Audio works in standalone mode

### Autoplay Policy

Modern browsers require user interaction before playing audio. The system handles this by:
- Not auto-starting background music on page load
- Starting music on first user interaction (ball touch)
- Gracefully handling autoplay policy errors
- Providing fallback generated sounds when audio files are missing

## Performance Considerations

- Audio files are preloaded for instant playback
- Generated sounds use minimal CPU resources
- Volume changes are applied in real-time
- Background music is paused when not needed

## Future Enhancements

Potential improvements:
- Audio file compression and optimization
- Multiple background music tracks
- Dynamic sound mixing based on game state
- 3D positional audio for immersive experience
- Audio visualization effects
- Custom sound pack support

## Troubleshooting

### Common Issues

1. **No Sound**: Check browser audio permissions and settings
2. **Missing Audio Files**: System falls back to generated sounds
3. **Volume Issues**: Verify settings in the settings modal
4. **Mobile Audio**: Ensure device is not in silent mode

### Debug Information

Enable console logging to see audio system status:
```javascript
// Check if sound manager is initialized
console.log(app.soundManager);

// Check current settings
console.log(app.soundManager.getSettings());

// Test sound generation
window.soundGenerator.generateBeep();
``` 
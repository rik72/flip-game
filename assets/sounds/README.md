# Audio Files for Flipgame

This directory contains audio files for the Flipgame sound system.

## Required Audio Files

The following audio files are expected by the sound system:

### Ball Interaction Sounds
- `ball-pickup.mp3` - Sound when picking up a ball
- `ball-drop.mp3` - Sound when dropping a ball
- `ball-move.mp3` - Sound during ball movement
- `ball-snap.mp3` - Sound when ball snaps to a node

### Board Interaction Sounds
- `board-flip.mp3` - Sound when flipping the board
- `board-rotate.mp3` - Sound when rotating the board

### Game State Sounds
- `level-start.mp3` - Sound when starting a level
- `level-complete.mp3` - Sound when completing a level
- `game-complete.mp3` - Sound when completing the entire game

### UI Interaction Sounds
- `button-click.mp3` - Sound for button clicks
- `button-hover.mp3` - Sound for button hover
- `modal-open.mp3` - Sound when opening modals
- `modal-close.mp3` - Sound when closing modals

### Feedback Sounds
- `success.mp3` - Success feedback sound
- `error.mp3` - Error feedback sound
- `warning.mp3` - Warning feedback sound

### Background Music
- `background-music.mp3` - Looping background music

## Audio File Requirements

- **Format**: MP3 (recommended for web compatibility)
- **Quality**: 44.1kHz, 128-192kbps
- **Duration**: 
  - Sound effects: 0.1-0.5 seconds
  - Background music: 1-3 minutes (will loop)
- **Volume**: Normalized to prevent clipping

## Fallback System

If audio files are missing or fail to load, the system automatically falls back to generated sounds using the Web Audio API. This ensures the game always has audio feedback available.

## Adding Custom Audio

1. Replace the placeholder files with your own audio
2. Ensure files are properly named and formatted
3. Test the audio in different browsers
4. Consider file size for web performance

## Browser Compatibility

- **Modern Browsers**: Full audio file support
- **Older Browsers**: Generated sound fallback
- **Mobile Devices**: Touch-optimized audio
- **Progressive Web Apps**: Audio works in standalone mode 
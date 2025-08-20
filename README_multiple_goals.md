# Multiple End Positions Feature

This document describes the implementation of multiple end positions for balls in Flipgame.

## Overview

The game now supports multiple end positions per ball. For a ball to complete its goal, it must be at ONE of its end positions AND ALL OTHER end positions must have tail discs from that ball.

## Implementation Details

### Game Manager Changes (`managers/game-manager.js`)

1. **Ball Initialization**: Modified `initializeBalls()` to handle both legacy single end positions and new multiple end positions format.

2. **Win Condition**: Updated `checkWinCondition()` and added `isBallAtGoal()` method to check:
   - Ball is at one of its end positions
   - All other end positions have tail discs from that ball

3. **Rendering**: Updated `renderEndGoals()` to display all end positions for each ball.

4. **Explosions**: Modified `createExplosionAnimations()` to create explosions at all end positions.

### Editor Changes (`editor.html`)

1. **Ball Creation**: New balls are created with end positions as arrays: `end: [[x, y]]`

2. **UI Updates**: 
   - Ball list shows number of goals or coordinates
   - Added "Remove end position" button
   - End position indicators show numbers when multiple goals exist

3. **Positioning**: Clicking "Set end position" now adds a new end position instead of replacing

4. **Level Loading**: Automatically converts legacy single end positions to array format

### Data Format

#### Legacy Format (still supported)
```json
{
  "balls": [
    {
      "start": [1, 2],
      "end": [4, 2],
      "color": "red"
    }
  ]
}
```

#### New Format (multiple end positions)
```json
{
  "balls": [
    {
      "start": [1, 2],
      "end": [[4, 2], [4, 4]],
      "color": "red"
    }
  ]
}
```

## Testing

Use `test_multiple_goals.html` to test the functionality:

1. Open the test page
2. The red ball has 2 goal positions: (3,1) and (3,3)
3. Move the ball to create a tail
4. Place the ball at one goal position
5. The other goal position must have a tail disc for the level to complete

## Win Condition Logic

For each ball:
1. Check if ball is at any of its end positions
2. For all other end positions, verify they have tail discs from that ball
3. Only when both conditions are met does the ball satisfy its win condition
4. All balls must satisfy their win conditions for the level to complete

## Backward Compatibility

- Legacy levels with single end positions continue to work
- Editor automatically converts legacy format to new format when loading
- Game manager handles both formats seamlessly 
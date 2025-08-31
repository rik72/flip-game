# Development Cache Busting Solution

## Problem
When modifying existing levels or inserting new ones during development, level files were frequently cached by the browser, making it very difficult to test changes.

## Root Cause
The `LEVEL_HASH_SEED` in `constants.js` was set to `'ym0spa'` instead of being empty (`''`). This caused the game to use hashed filenames even in development mode, leading to aggressive browser caching.

## Solution

### 1. Fixed Development Mode Configuration
- **File**: `constants.js`
- **Change**: Set `LEVEL_HASH_SEED: ''` (empty string) for development mode
- **Result**: Game now uses original filenames (`level_1.json`, `level_2.json`, etc.) in development

### 2. Added Cache Busting in Development
- **File**: `managers/storage-manager.js`
- **Change**: Added timestamp parameter (`?t=timestamp`) to level URLs in development mode
- **Result**: Each level load gets a unique URL, preventing browser caching

### 3. Created Development Helper Script
- **File**: `scripts/dev-cache-buster.js`
- **Purpose**: Provides utilities for development and testing

## Usage

### Basic Development Workflow
1. **Check development mode**:
   ```bash
   node scripts/dev-cache-buster.js check
   ```

2. **List all levels**:
   ```bash
   node scripts/dev-cache-buster.js list
   ```

3. **Validate a specific level**:
   ```bash
   node scripts/dev-cache-buster.js validate 5
   ```

4. **Generate cache-busting test URL**:
   ```bash
   node scripts/dev-cache-buster.js test 3
   ```

### Testing Specific Levels
- Use URL parameter: `http://localhost:8080/?level=5`
- Add timestamp for cache busting: `http://localhost:8080/?level=5&t=1234567890`

### Browser Cache Management
- **Hard refresh**: `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- **Dev Tools**: Open Dev Tools → Network tab → Check "Disable cache"
- **Private/Incognito mode**: Use for testing to avoid cache issues

## How It Works

### Development Mode (LEVEL_HASH_SEED = '')
```javascript
// Uses original filenames
filename = `level_${levelNumber}.json`;

// Adds timestamp for cache busting
url = `levels/${filename}?t=${Date.now()}`;
```

### Production Mode (LEVEL_HASH_SEED = 'hash')
```javascript
// Uses hashed filenames
filename = `level_${levelNumber}_${hash}.json`;

// No timestamp (rely on filename changes for cache busting)
url = `levels/${filename}`;
```

## Benefits

1. **No More Caching Issues**: Level files are always fresh in development
2. **Easy Testing**: Use URL parameters to test specific levels
3. **Validation Tools**: Built-in level validation and testing utilities
4. **Production Ready**: Production builds still use hashed filenames for security
5. **Developer Friendly**: Clear separation between development and production modes

## Troubleshooting

### Still seeing cached levels?
1. Check that `LEVEL_HASH_SEED` is empty in `constants.js`
2. Use hard refresh (`Ctrl+F5` / `Cmd+Shift+R`)
3. Clear browser cache completely
4. Use private/incognito mode for testing

### Level not loading?
1. Validate the level file: `node scripts/dev-cache-buster.js validate <level>`
2. Check browser console for errors
3. Verify the level file exists in the `levels/` directory

### Development mode not working?
1. Run: `node scripts/dev-cache-buster.js check`
2. Ensure `DEVEL: true` in `constants.js`
3. Restart your development server 
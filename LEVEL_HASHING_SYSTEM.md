# Level Hashing System

This system prevents level files from being cached by browsers and makes them harder to guess by generating unique, hashed filenames.

## How It Works

### Development Mode
- Uses original filenames: `level_1.json`, `level_2.json`, etc.
- No hashing applied
- Fast development workflow

### Production Mode
- Generates hashed filenames: `level_1_abc123.json`, `level_2_def456.json`, etc.
- Hash seed is generated from all level file contents + build timestamp
- Hash seed is embedded in the built JavaScript bundle
- Client generates filenames on-the-fly using the hash seed

## File Structure

```
flipgame/
├── levels/                    # Source level files (original names)
│   ├── level_1.json
│   ├── level_2.json
│   └── ...
├── dist/                      # Production build (hashed names)
│   ├── levels/
│   │   ├── level_1_abc123.json
│   │   ├── level_2_def456.json
│   │   └── ...
│   └── ...
└── scripts/
    ├── level-hasher.js        # Core hashing functionality
    └── test-level-hashing.js  # Test script
```

## Usage

### Development
```bash
npm run dev          # Uses original filenames
npm run build:dev    # Uses original filenames
```

### Production
```bash
npm run build        # Generates hashed filenames
npm run rebuild      # Clean build with hashed filenames
```

### Testing
```bash
npm run test:hashing # Test the hashing system
```

## Technical Details

### Hash Algorithm
- Simple, fast hash function
- 6-character alphanumeric output: `[a-z0-9]{6}`
- Deterministic for same input
- Different for different content

### Hash Seed Generation
1. Cleans the dist/levels directory (removes old files)
2. Reads all level files in sorted order
3. Combines all content
4. Adds build timestamp and random entropy
5. Generates 6-character hash

### Filename Generation
```javascript
// Client-side generation
function generateLevelFilename(levelNumber, hashSeed) {
    const content = `${levelNumber}_${hashSeed}`;
    const hash = simpleHash(content);
    return `level_${levelNumber}_${hash}.json`;
}
```

### Cache Busting
- New hash seed = new filenames = no browser cache
- Updates when any level file changes
- Updates when build timestamp changes

## Configuration

The hash seed is stored in `constants.js`:
```javascript
GAME_CONFIG: {
    LEVEL_HASH_SEED: '', // Empty = development mode
    // ... other config
}
```

In production builds, this gets updated to:
```javascript
GAME_CONFIG: {
    LEVEL_HASH_SEED: 'abc123', // Generated hash seed
    // ... other config
}
```

## Benefits

1. **No Browser Caching**: New filenames force fresh downloads
2. **Harder to Guess**: Filenames are not predictable
3. **Scalable**: Works with 1000+ levels
4. **Development Friendly**: No hashing in dev mode
5. **Automatic**: Integrated into build process

## Security Notes

- This is not cryptographic security
- Purpose is cache busting and obfuscation
- Level content is still accessible if filenames are known
- For true security, consider server-side level serving 
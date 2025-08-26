# 📦 Bundling System Guide

## 🚀 **Overview**

Your Flipgame project now has an automated bundling system that:
- Combines all JavaScript files into optimized bundles
- Minifies and uglifies code for production
- Provides hot reload for development
- Automatically updates when you change source files

## 🔧 **How It Works**

### 1. **Concatenation Script**
- Location: `scripts/build-concatenated.js`
- Combines individual JS files in the correct order
- Creates `src/game-concatenated.js` and `src/editor-concatenated.js`
- Automatically runs before webpack builds

### 2. **File Order (Game Bundle)**
```
constants.js
utils.js
html-builder.js  
display-manager.js
managers/storage-manager.js
managers/sound-manager.js
managers/game-manager.js
app.js
app-bridge.js
```

### 3. **File Order (Editor Bundle)**
```
constants.js + utils.js + html-builder.js + display-manager.js
+ managers/* + src/editor.js
```

## 📝 **Available Commands**

### **Development:**
```bash
npm run dev          # Start dev server with hot reload
npm run concat       # Manually rebuild concatenated files
npm run watch        # Watch mode (builds to dist/)
```

### **Production:**
```bash
npm run build        # Production build (minified)
npm run build:dev    # Development build (unminified)
npm run rebuild      # Clean + concat + build
```

### **Pre-hooks:**
- `predev` → runs `npm run concat` automatically
- `prebuild` → runs `npm run concat` automatically
- `prebuild:dev` → runs `npm run concat` automatically

## ✨ **Workflow**

### **Daily Development:**
1. Edit your source files (`app.js`, `constants.js`, etc.)
2. Run `npm run dev`
3. Concatenation happens automatically
4. Dev server starts with hot reload
5. Your changes are immediately available

### **When You Make Changes:**
The concatenation script **automatically runs** before:
- `npm run dev`
- `npm run build`  
- `npm run build:dev`

### **Manual Concatenation:**
If you want to manually rebuild the concatenated files:
```bash
npm run concat
```

### **Production Deployment:**
```bash
npm run build        # Creates optimized dist/ folder
cd dist && upload to S3
```

## 📊 **File Sizes**

- **Original files:** ~292KB total
- **Development bundle:** ~440KB (with webpack overhead)
- **Production bundle:** Much smaller (minified/uglified)

## 🎯 **Benefits**

✅ **Always up-to-date:** Changes to source files automatically included  
✅ **Single bundle:** One `bundle.js` instead of 9+ individual files  
✅ **Optimized:** Minification and uglification for production  
✅ **Fast development:** Hot reload and live updates  
✅ **Source maps:** Debug original code even in bundled version  

## 📁 **Generated Files**

**These are auto-generated (don't edit directly):**
- `src/game-concatenated.js`
- `src/editor-concatenated.js`
- `dist/bundle.js`
- `dist/editor.js`
- `dist/index.html`
- `dist/editor.html`

**Edit these source files instead:**
- `app.js`, `constants.js`, `utils.js`, etc.
- `src/editor.js`
- `src/index.template.html`
- `src/editor.template.html`

## 🔧 **Adding New Files**

To add a new JavaScript file to the bundle:

1. Edit `scripts/build-concatenated.js`
2. Add your file to the `GAME_FILES` or `EDITOR_FILES` array
3. Place it in the correct order
4. Run `npm run concat` to test

## 🚨 **Important Notes**

- Always run development through `npm run dev` (not direct file access)
- The bundled version is served at http://localhost:8080
- Changes to source files require the concatenation script to run
- Pre-hooks handle this automatically for build commands 

## 🔨 Build Information System

The bundling system now automatically includes build information that appears in the bottom-left corner of both the game and editor:

### 📋 **Build Info Display**
- **Position**: Bottom-left corner (very small, subtle text)
- **Content**: Version | Build Type | Timestamp and Build ID
- **Example**: `v1.0.0 | dev | 2025-08-26 10:28`<br/>`4e6bfe1-mesel5pn`

### 🔧 **How it Works**
1. **Generation**: `scripts/generate-build-info.js` creates build metadata
2. **Injection**: Webpack automatically injects the info into HTML templates
3. **Styling**: Minimal, non-intrusive styling with monospace font
4. **Git Integration**: Includes commit hash and branch information

### 📦 **Build ID Components**
- **Version**: From `package.json`
- **Build Type**: `dev` or `prod` based on webpack mode
- **Timestamp**: Human-readable build time
- **Git Hash**: Short commit hash (if available)
- **Unique ID**: Timestamp-based unique identifier

### 🎯 **Generated Files** (auto-excluded from git)
- `src/build-info.json` - Raw build metadata
- `src/build-info.js` - ES6 module export

This build info helps identify deployed versions and troubleshoot issues by providing exact build context. 
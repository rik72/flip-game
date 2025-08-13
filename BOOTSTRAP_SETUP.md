# Local Bootstrap Dependencies Setup

This project now uses locally hosted Bootstrap dependencies instead of CDN links for better offline functionality and reliability.

## File Structure

```
assets/
├── css/
│   ├── bootstrap.min.css          # Bootstrap CSS framework
│   └── bootstrap-icons.css        # Bootstrap Icons CSS
├── js/
│   └── bootstrap.bundle.min.js    # Bootstrap JavaScript bundle
└── fonts/
    └── fonts/
        ├── bootstrap-icons.woff   # Bootstrap Icons font (WOFF)
        └── bootstrap-icons.woff2  # Bootstrap Icons font (WOFF2)
```

## Dependencies

The following npm packages are installed locally:
- `bootstrap@^5.3.7` - Bootstrap CSS framework
- `bootstrap-icons@^1.13.1` - Bootstrap Icons library

## Benefits

1. **Offline Functionality**: The application works without internet connection
2. **Faster Loading**: No external network requests for Bootstrap files
3. **Version Control**: Fixed versions prevent unexpected breaking changes
4. **Reliability**: No dependency on external CDN availability

## Installation

To install the dependencies:
```bash
npm install
```

The Bootstrap files are automatically copied to the `assets/` directory during development.

## Maintenance

To update Bootstrap versions:
1. Update the package versions in `package.json`
2. Run `npm install`
3. Copy the new files to the `assets/` directory
4. Update font paths if necessary in `assets/css/bootstrap-icons.css` 
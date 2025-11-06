# Splash Screen Images

This folder contains images used for the splash screen.

## Required Image

Place your splash screen image with the exact filename: `splash-screen.png`

## Image Requirements

- Format: PNG
- Recommended resolution: At least 1920x1080 for good quality across devices
- The image will be displayed as a background covering the entire screen
- The image will be automatically resized to fit different screen sizes

## Usage

The splash screen will automatically display this image for 2 seconds when the app starts.

## File Structure

```
src/
├── assets/
│   └── images/
│       └── splash/
│           ├── splash-screen.png  <- Place your image here
│           └── README.md
├── screens/
│   └── Splash/
│       ├── SplashScreen.jsx
│       └── index.js
└── components/
    └── Splash/
```

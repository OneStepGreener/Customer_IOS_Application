# Simulator Location Setup Guide

## Problem
iOS and Android simulators return default/fake location data:
- **iOS Simulator**: Returns Cupertino, California (Apple's headquarters)
- **Android Emulator**: Returns Mountain View, California (Google's headquarters)

This is why you're seeing California coordinates instead of your actual location in India.

## Solution: Set Custom Location in Simulator

### For iOS Simulator:

1. **Open iOS Simulator** (while your app is running or not)

2. **Set Custom Location:**
   - Go to: **Features** → **Location** → **Custom Location...**
   - Enter coordinates for a location in India:
     - **Latitude**: `28.6139` (Delhi coordinates)
     - **Longitude**: `77.2090`
   - Click **OK**

3. **Alternative Locations in India:**
   - **Mumbai**: `19.0760, 72.8777`
   - **Bangalore**: `12.9716, 77.5946`
   - **Kolkata**: `22.5726, 88.3639`
   - **Chennai**: `13.0827, 80.2707`

4. **Test Location:**
   - Run your app
   - Click "Use current location" button
   - It should now fetch the custom location you set

### For Android Emulator:

1. **Open Android Emulator** (while your app is running or not)

2. **Open Extended Controls:**
   - Click the **three dots** (⋮) button on the emulator toolbar
   - Or press `Ctrl + Shift + P` (Windows/Linux) or `Cmd + Shift + P` (Mac)

3. **Set Custom Location:**
   - Go to: **Location** tab
   - Enter coordinates for a location in India:
     - **Latitude**: `28.6139`
     - **Longitude**: `77.2090`
   - Click **Send**

4. **Test Location:**
   - Run your app
   - Click "Use current location" button
   - It should now fetch the custom location you set

## Alternative Solution: Add Test Location Feature

You can also add a development feature to manually enter coordinates for testing. This would be useful for testing without changing simulator settings.

## Notes:

- **Physical Devices**: Will use actual GPS location (no need to set custom location)
- **Simulators**: Always use the set custom location until you change it
- **Multiple Locations**: You can test different locations by changing the coordinates in the simulator

## Quick Test:

After setting the custom location, check the console logs in your app. You should see coordinates matching the location you set in the simulator, not California coordinates.


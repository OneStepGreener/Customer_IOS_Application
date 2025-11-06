# Gurgaon Location Fix Guide

## Why You're Seeing New Delhi Instead of Gurgaon

### The Issue:
Google Maps Geocoding API sometimes returns the **nearest major city** instead of the exact location. Since Gurgaon is very close to New Delhi (about 30km), Google might return "New Delhi" as the address even if your coordinates are in Gurgaon.

### Solution: Use Precise Gurgaon Coordinates

**Gurgaon, Haryana Coordinates:**
- **Latitude**: `28.4089`
- **Longitude**: `77.0378`

**Other Gurgaon Locations:**
- **Sector 29**: `28.4649, 77.0908`
- **Sector 18**: `28.4699, 77.0956`
- **Cyber City**: `28.4999, 77.0936`
- **DLF Cyber Hub**: `28.4999, 77.0936`

## How to Set Gurgaon Location in Simulator

### iOS Simulator:
1. Open iOS Simulator
2. Go to: **Features** → **Location** → **Custom Location...**
3. Enter:
   - **Latitude**: `28.4089`
   - **Longitude**: `77.0378`
4. Click **OK**

### Android Emulator:
1. Open Android Emulator
2. Click the **three dots** (⋮) button
3. Go to: **Location** tab
4. Enter:
   - **Latitude**: `28.4089`
   - **Longitude**: `77.0378`
5. Click **Send**

## Why Google Shows New Delhi

Google Maps API returns addresses based on administrative boundaries. Sometimes:
- **Gurgaon** might be returned as part of **"New Delhi"** in the formatted address
- The **address components** will still show **"Gurgaon"** or **"Haryana"** in the parsed data

### Check These Fields:
- **City**: Should show "Gurgaon" or "Gurugram"
- **State**: Should show "Haryana"
- **Formatted Address**: Might show "New Delhi" if Google groups it that way

## Testing

After setting Gurgaon coordinates:
1. Run your app
2. Click "Use current location"
3. Check console logs - you should see coordinates around `28.4089, 77.0378`
4. The address might show "New Delhi" but the **city field** should show "Gurgaon" or "Gurugram"
5. Check the **state field** - it should show "Haryana"

## Note

If you're testing on a **physical device** in Gurgaon:
- It should automatically get your exact location
- The coordinates will be accurate
- Google might still group it under "New Delhi" in the formatted address, but the parsed components should show Gurgaon/Haryana

## Alternative: Use More Specific Location

If you need a specific area in Gurgaon, use these coordinates:
- **Sector 29**: `28.4649, 77.0908`
- **DLF Cyber City**: `28.4999, 77.0936`
- **Sector 18**: `28.4699, 77.0956`

These will help Google Maps identify the location more accurately.


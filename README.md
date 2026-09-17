# RaceMarket — Horse Model 3.1 Anatomy & Jockey Refinement

This release starts from the working Horse Model 3.0 build and leaves the race simulation, pricing, orders, settlement, camera controls, projected labels, weather, and track presentation unchanged. It focuses on the visible horse-and-rider model.

The simulation remains the source of truth. Model and animation changes are presentation-only.

## What changed in 3.1

### Jockey and reins

- Corrected the arm-chain orientation that placed the jockey's hands behind the saddle
- Added two-bone inverse kinematics so both hands stay compactly positioned above the withers
- Replaced the two rigid cylindrical “stick” reins with thin, curved, dynamically moving rein lines
- Added a separate pelvis, waist, chest, neck, face, helmet brim, and restrained goggle band
- Changed the forearms to long racing-silk sleeves; only the hands use skin material
- Added clearer elbows, knees, boots, feet, and small stirrup irons
- Improved crouch, head balance, knee absorption, and saddle-following motion
- Kept individual rider motion variation without allowing the rider to disconnect from the horse

### Thoroughbred anatomy

- Leaner barrel and belly profile
- Longer legs and a higher thoroughbred stance
- More tapered cannon bones and smaller hooves
- Separate upper-leg muscle, knee/hock, fetlock, and hoof forms
- Smoother shoulder, withers, chest, croup, and hindquarter proportions
- Longer, lower racing neck with a smaller head and muzzle
- Smaller ears, subtler blaze, and high-detail eyes and nostrils
- Increased High-quality mesh resolution while retaining the existing Eco meshes

### Gallop refinement

- Lead-side variation between runners
- Revised transverse four-beat sequence
- Distinct push-off, fold, recovery, forward pass, reach, and touchdown portions
- Shorter high-speed stance and a clearer suspension phase
- Better hoof locking during contact
- More natural neck extension for racing speed and running style
- Finished runners still stop individually; unfinished runners continue through the line

## Compatibility

The renderer remains dependency-free and uses the existing WebGL 1 GPU-skinning path. If skeletal rendering is unavailable, RaceMarket retains its compatible procedural fallback.

## Existing features retained

- WebGL and Classic render modes
- Auto, Wide, Leader, Runner, Finish, Top Down, and Free cameras
- Free-camera orbit and zoom controls
- Stable projected runner labels
- Broadcast captions and opt-in sound
- Dirt/turf and weather effects
- Dynamic order book and paper trading
- High, Eco, and Auto quality
- Offline PWA caching

## Files

- `horse3d-rig.js` — horse/jockey geometry, skeletons, gait, IK, and pose generation
- `race3d.js` — WebGL rendering, curved reins, cameras, particles, and labels
- `app.js` — race simulation, trading, and broadcast state
- `index.html` — application markup and loading order
- `styles.css` — application and Classic-renderer styling
- `sw.js` — offline asset cache
- `manifest.json` — PWA metadata
- `icon.svg` — application icon

## Run locally

```bash
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080/
```

A hard refresh may be needed once after replacing an installed PWA build so the new service-worker cache becomes active.

## Free camera controls

- Drag to orbit
- Scroll to zoom
- W/A/S/D or arrow keys to rotate
- `+` and `-` to zoom
- `R` to reset

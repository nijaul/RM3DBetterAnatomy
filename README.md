# RaceMarket — Horse Model 3.0 Rigged Thoroughbred

This build keeps the existing RaceMarket simulation, trading system, broadcast controls, labels, weather, camera modes, and WebGL racecourse. It replaces the Horse Model 2 drawing path with a reusable GPU-skinned horse and jockey rig.

The race simulation remains the source of truth for speed, distance, position, finish order, pricing, orders, and settlement. The rig only changes presentation.

## Horse Model 3.0

### Skinned thoroughbred

- One reusable weighted horse mesh
- 22-bone skeletal rig
- Separate pelvis, chest, lower neck, upper neck, head, jaw, three tail bones, and three bones per leg
- Smooth weighted deformation around the barrel, shoulders, hindquarters, neck, and joints
- Distinct coat, highlight, mane/tail, muzzle, hoof, marking, saddlecloth, and saddle materials
- High and Eco mesh variants selected automatically according to quality and camera distance

### Rigged jockey

- Separate reusable weighted jockey mesh
- 11-bone rig
- Spine, head, paired arms, paired forearms, thighs, and lower legs
- Speed-dependent racing crouch
- Moving hands connected to the horse's bridle by live reins
- Post-color silks and helmet, plus varied pants and boots

### Gallop system

- Four-beat racing-gallop sequencing
- Separate foreleg and hind-leg inverse-kinematics solutions
- Planted hoof stance phase
- Recovery, fold, reach, and suspension phases
- Speed-sensitive stride length and cadence
- Pelvis/chest counter-rotation
- Spine extension and compression
- Neck and head counter-motion
- Tail follow-through
- Individual stride, bounce, neck, tail, and jockey motion biases
- Energy and running-style posture adjustments
- Finished horses stop individually; unfinished runners continue galloping after the winner crosses

### Surface interaction

- Hoof-contact events are generated when each foot enters stance
- Dirt impact bursts and turf-clod particles are emitted at the actual contact moments
- The existing continuous speed wake remains in place
- Wetness and track condition continue to control spray and particle appearance

### Compatibility

If GPU skinning cannot initialize on a device, the renderer automatically falls back to the previous compatible procedural horse instead of interrupting the race.

## Existing features retained

- WebGL and Classic render modes
- Auto, Wide, Leader, Runner, Finish, Top Down, and Free cameras
- Drag/orbit and zoom controls in Free mode
- Stable projected runner labels
- Broadcast event captions and sound
- Dirt and turf courses
- Weather, rain, fog, and wet-track treatments
- Dynamic order book and paper trading
- Automatic High/Eco rendering quality
- Offline PWA cache

This release does not add replay or photo-finish functionality.

## Files

- `horse3d-rig.js` — skeletal definitions, weighted mesh generation, gait sampling, inverse kinematics, and horse/jockey pose generation
- `race3d.js` — WebGL renderer and integration with the rig
- `app.js` — race simulation, trading, broadcast controls, and renderer state
- `index.html` — application markup and script loading
- `styles.css` — interface and Classic-renderer styling
- `sw.js` — offline asset cache
- `manifest.json` — PWA metadata
- `icon.svg` — application icon

## Run locally

A service worker requires an HTTP origin. From this directory:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

No build step, package manager, CDN, or external model download is required.

## Controls

### Rendering

- **3D** — WebGL racecourse with the rigged horse and jockey
- **Classic** — CSS/DOM fallback presentation
- **Quality** — cycles through Auto, High, and Eco

### Camera

- **Auto** — directed broadcast shots
- **Wide** — whole field
- **Leader** — front runner
- **Runner** — selected runner
- **Finish** — finish line
- **Top** — elevated top-down view
- **Free** — manual orbit camera

In Free mode:

- Drag to orbit
- Scroll to zoom
- Use W/A/S/D or the arrow keys to rotate
- Use `+` and `-` to zoom
- Press `R` to reset the camera

## Architecture

`horse3d-rig.js` generates the shared horse and jockey meshes once. Each horse receives its own pose matrices every render frame. The WebGL vertex shader applies up to four bone influences per vertex, while the race engine continues to control all competitive outcomes.

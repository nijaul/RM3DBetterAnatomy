# RaceMarket — Full WebGL 3D Upgrade

This release builds on the Broadcast and Trading upgrades and replaces the racecourse presentation with a real, dependency-free WebGL scene. The existing race simulation remains the source of truth for distance, position, speed, finish order, pricing, orders, and settlement.

## What is new

- Actual perspective-projected 3D racecourse geometry
- Procedural low-poly 3D horses and jockeys
- Articulated gallop cycles driven by each runner's live speed
- Dynamic directional lighting, atmospheric fog, and weather palettes
- 3D dirt/turf materials, lane markings, rails, support posts, gates, and finish line
- Venue-specific grandstands, trees, palms, mountains, and Churchill-style spires
- Ground-contact shadows plus leader, selected-runner, and ability highlights
- Dirt kickback, turf clods, wet-track treatment, and WebGL rain
- Broadcast camera modes synchronized with Auto, Wide, Leader, Runner, Finish, Top Down, and Free Camera controls
- 3D-to-screen runner labels with position and live contract price
- Click/tap runner selection and keyboard runner navigation
- Auto, High, and Eco rendering-quality settings
- ANGLE instanced rendering to batch repeated scene geometry when supported
- Automatic quality reduction on software or persistently slow renderers
- Automatic fallback to the existing classic 3D presentation when WebGL is unavailable
- Updated offline/PWA cache for the new renderer

This release deliberately does **not** include slow-motion replay or a photo-finish feature.

## Files

- `index.html` — application markup, WebGL canvases, and render controls
- `app.js` — simulation, broadcast, trading, and renderer integration
- `race3d.js` — self-contained WebGL 1 renderer
- `styles.css` — complete application styling and WebGL/classic mode presentation
- `sw.js` — offline asset cache
- `manifest.json` — PWA metadata
- `icon.svg` — application icon

## Run locally

The service worker requires an HTTP origin. From this directory, run:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

A static hosting service also works. No build step, package manager, CDN, external model, or third-party rendering library is required.

## Controls

### Rendering

- **3D** — enables the WebGL racecourse
- **Classic** — restores the prior CSS/DOM perspective scene
- **Quality** — cycles through Auto, High, and Eco

Auto selects High on capable desktop devices and Eco on smaller or lower-memory devices.

### Camera

- **Auto** — directs shots according to race state
- **Wide** — shows the whole field
- **Leader** — follows the front runner
- **Runner** — follows the selected horse
- **Finish** — frames the finish line

### Runner interaction

- Click or tap a 3D horse to select it
- Double-click a horse to select and follow it
- Focus the race canvas and use the arrow keys to cycle runners
- Press Enter or Space to follow the selected runner

## Compatibility

The renderer uses WebGL 1 for broad mobile and desktop support. If WebGL creation fails or the graphics context is interrupted, RaceMarket switches to the classic view without affecting the race or market. The selected render mode and quality preference are stored locally.

## Architecture

`race3d.js` receives read-only access to the application's current presentation state on each animation frame. It maintains its own visual interpolation, camera, particle system, geometry buffers, and projected labels. It does not write simulation, pricing, order, portfolio, or settlement values.


## Targeted fixes in this build

- Unfinished runners continue their gallop after the first horse wins; the global `finished` race phase no longer freezes the remaining field.
- Only the individually finished runner stops its articulated animation.
- WebGL broadcast runner labels are reduced to compact name/position callouts to avoid oversized rounded boxes.


## Horse Model 2.0 — Enhanced Procedural Animation

This update keeps the existing dependency-free WebGL renderer and improves only the horse presentation layer.

- More natural body, shoulder, chest, and hindquarter proportions
- Four-beat gallop approximation with offset fore/hind leg timing
- Speed-sensitive stride cadence and extension
- Suspension, body bounce, and forward lean
- Counter-motion in neck and head
- Jockey crouch and suspension movement
- More dynamic mane and tail inertia
- Small individual stride/cadence variations so the field does not look synchronized
- Existing post colors, special abilities, dirt/turf effects, camera system, and race/trading logic are unchanged

The renderer still falls back to the existing classic presentation when WebGL is unavailable.


## V2.0.1 — Horse visibility fix

Fixed an initialization bug introduced by Horse Model 2.0: the renderer reset each horse's visual record with only position and phase, while the new model immediately expected per-horse animation DNA (cadence, stride, bounce, neck/tail/jockey motion, and fore bias). Those undefined values propagated into transforms as NaN when the race went live, making the WebGL horses disappear. The reset path now initializes the complete animation record, with a defensive backfill for older visual records.


## Horse Model 2.0 Enhanced Anatomy

This build adds a second procedural horse pass focused on silhouette and motion:
- longer racing proportions and stronger shoulder/hindquarter mass
- three-segment neck/head treatment and more detailed muzzle/face
- four-beat procedural gallop with speed-sensitive stride and suspension
- two-bone procedural leg IK with distinct fore/hind bend behavior
- fetlock/hoof geometry, mane and tail inertia, and rider posture changes
- deterministic per-horse cadence/body-roll variation
- individually finished runners settle into a still pose while remaining runners continue galloping

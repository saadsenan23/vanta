# VANTA X1 vehicle scene

`src/components/three/VehicleScene.tsx` is the lazy-loadable canvas entry point. It accepts `color`, `wheel` (`aero` or `sport`), `interior`, `accent`, `view` (`front`, `side`, `rear`, `cabin`, `wheels`), `autoScroll`, `className`, and `onReady`. Give its parent a real height. All product controls and copy belong in the surrounding semantic HTML.

The original procedural concept is an automotive visualization, not a production-ready engineering model or a licensed vehicle asset. Its body is a sampled continuous loft with open wheel arches. The smoky canopy, cabin, brake calipers, wheel faces, lamps, mirrors, panel seams and sill details are independent material surfaces. Color, upholstery, caliper/ambient accent, and wheel style update without reloading external assets. No remote HDR map or GLB is required.

## Replacing the concept model

`VehicleModel.tsx` is the model adapter. Replace its internals with a licensed optimized GLB while retaining its `VehicleFinish` interface and outer coordinate convention: metres, +Y up, −X nose, +Z driver side. The approximate envelope is 4.66 × 1.7 × 2.15 m; the axles are X −1.46/+1.47 m, with wheel centers at Y 0.485 m. Keep paint, glass, upholstery, accents and wheel materials addressable. Clone shared loaded materials before customization, and dispose only resources owned by the instance. Do not bake camera-facing transforms into the asset.

## Rendering and motion

- React Three Fiber owns the renderer and a demand-driven loop. Camera transitions invalidate only while easing; OrbitControls invalidates while the user is interacting or its damping is settling. No constant automatic spin runs.
- Desktop DPR is capped at 1.5; compact layouts use DPR 1. The procedural environment is captured once at 256 px. Contact shadows render once at 512 px. There is no postprocessing, transmission render pass, external texture download, or permanent animation loop.
- Camera presets target the same model group. Framing expands for narrow containers, and reduced motion snaps presets directly. A user drag stops the current preset transition. Optional scroll motion is a small view adjustment and ceases after the user takes control. Cabin view lowers the glazing opacity to make upholstery changes clear.
- Horizontal touch gestures orbit the model; the canvas restores `touch-action: pan-y` after controls connect to preserve native vertical scrolling on a phone.
- An IntersectionObserver stops rendering and disables OrbitControls when the canvas is sufficiently outside the viewport. Event listeners, scheduled animation callbacks, observers and custom BufferGeometry resources are cleaned up on unmount.
- WebGL creation failure, render errors and context loss reveal `/images/vanta-hero.webp`. The parent interface remains usable. Context loss uses a stable photographic fallback rather than repeatedly recreating a failing renderer.

## Known limits

The model is a stylistic product concept. It intentionally uses simple interior upholstery and wheel tread, and transparent glazing rather than physically traced refraction. On an integrated GPU, lighting and transparency should be judged visually on the target browser; a successful TypeScript build does not establish device performance. The parent is responsible for equivalent accessible HTML camera and finish controls.

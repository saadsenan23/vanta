# VANTA X1 design and engineering brief

Purpose: a recruiter-facing portfolio project that feels like a premium automotive campaign. The supplied user brief is the source of truth and explicitly delegates all design choices and implementation without approval stops.

## Art direction
Graphite architectural studio, warm off-white typography, sage accents. A cinematic original silver EV is the hero. Asymmetric editorial layout, thin rules, small monospaced technical labels, generous spacing, no card grids or artificial social proof. Manrope variable display/body with Space Mono labels. A strong oversized X1 typographic backdrop anchors the vehicle composition.

## Narrative and interaction
Fixed minimal navigation; hero campaign; editorial design with selected details; aerodynamic airflow study; pinned acceleration/power/range story; immersive cockpit; technology modes; interactive 3D explorer; finish/wheel/interior/accent configurator; final campaign reveal and compact legal footer. Navigation anchors are real links. Mobile navigation and saved-configuration dialog use native modal semantics and keyboard focus restoration.

## Architecture
React 19 + TypeScript + Vite 8 retained from starter. Tailwind 4 plus shared CSS tokens. Motion for reveal/parallax and scroll progress. Data module supplies vehicle specifications and configuration choices. Focused section components own their state. R3F and Three.js are lazy-loaded only for the interactive showroom. Original procedural body surfaces demonstrate a replaceable model adapter; generated campaign imagery supplies rich fallback and editorial art. No backend or fake reservation flow.

## Budgets and fallbacks
Hero responsive WebP loaded eagerly; other imagery lazy. No external runtime fonts or textures. Single lazy showroom canvas with demand rendering, limited DPR, reduced mobile shadows and motion. WebGL/context/model error retains a useful image and accessible HTML controls. Motion reduction preserves every section. Conceptual specifications clearly labeled; VANTA is a fictional portfolio brand.

## Verification
Typecheck/build/lint; functional browser tests of configuration, save/restore, modal and mobile navigation, explorer details, reduced motion, WebGL failure, asset errors; axe accessibility; no-overflow checks at 360/390/480/768/1024/1280/1440; separate visual inspection desktop/mobile. No fabricated performance measurements.

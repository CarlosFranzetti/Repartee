# re:parteé paint kit (`window.RP.PK`)

`src/core/paint.js` is the room-painting toolbox. It is a classic script (no modules). Load it after `src/core/util.js`:

```html
<script src="src/core/util.js"></script>
<script src="src/core/paint.js"></script>
```

Everything lives on `RP.PK`. Rooms are painted **once** onto a 640x256 canvas context and cached. The kit is verified in
`tools/paint-gallery.html` (12 sample scenes; `node tools/shot.mjs tools/paint-gallery.html out.png 1400 4200 800`).

## Contract (read this first)

* **Signature.** Every helper is `PK.name(c, ...args)`; `c` is a `CanvasRenderingContext2D`. Position args are `x, y` = **top-left**
  of the object unless the table says otherwise (exceptions: `streetlamp` = pole base centre, `discoBall`/`glow` = centre,
  `lightCone` = apex centre-top, `manhole` steam rises above y, `window` sill/bars overhang 4 px, `stoop` railing rises 28 px above y).
  The last argument is an options object `o` (always optional). `undefined` options use the defaults listed below.
* **Integer pixels only.** All drawing is integer `fillRect` (alpha is used only for soft shadows / glows, always on whole pixels).
  Fractional input coordinates are rounded. No anti-aliasing, no paths (other than integer clip rects).
* **Deterministic.** Randomness comes from `RP.u.mulberry`. `o.seed` (number or string) picks the variation; if omitted the seed is
  derived from `x, y`, so the same call at the same position always paints the same pixels. Give two neighbouring props different
  `seed`s if you want them to differ.
* **Light from the upper left.** Shading uses `RP.u.ramp` (5-step hue-shifted ramp: deep shadow, shadow, base, light, highlight).
  Paint objects in their **lit, daytime-neutral colours**; the engine multiplies a light map afterwards.
* **Emissive return values.** Helpers that make light (neon, screens, lit windows, lamps, glows, LED walls...) **return an array of
  integer rects `[[x,y,w,h], ...]`** of pixels that must stay bright at night. The engine should re-draw those rects from the
  un-lit canvas after applying the light map. Glow halos are included in the arrays (they are dithered pixels). Helpers that are
  never emissive return `undefined`. Large flat screens (ledWall, departuresBoard) return one rect for the whole screen.
  `PK.truss()` also sets `.lights = [{x, y, color}]` on the returned array (fixture lens positions, to aim `lightCone`).
* **Layer by painting order** (back to front). Floors/walls first, then furniture, then emissive extras. Props that stand on the
  floor draw a small ground contact shadow; paint them in back-to-front order.
* **Surface helpers** (`plaster`, `brick`, `planks`, ...) paint exactly the rect you give them (`w`/`h` default to the right/bottom
  screen edge if omitted).
* **Performance.** Each helper is a few ms (the whole 12-scene gallery paints in well under a second). No `getImageData` is used.
* Colours are `"#rrggbb"` strings (6 hex digits; `RP.u.mix` does not parse short hex).

## Shared palettes and sizes

| Export | What |
|---|---|
| `PK.paletteNight` | Moody NYC-at-night colours: `wall, wallLight, wallDark, ceiling, trim, plaster, brick, brickDark, mortar, floor, wood, woodLight, woodDark, metal, metalLight, metalDark, chrome, concrete, asphalt, sidewalk, curb, tile, tileDark, carpet, leather, fabric, sky` (array of 6 gradient stops), `glass, ink, paper, white, neonPink #ff3fa4, neonCyan #39d0ff, neonViolet, neonGreen, neonAmber, neonRed, neonYellow, neonBlue, sodium #ff9a3a, sodiumLight, lamp, screen, ledGreen, ledAmber, ledRed, skin` (5 tones), `accent` (6 colours). |
| `PK.paletteDay` | Same keys, believable daylight values (lighter walls, blue `sky` stops, warmer wood). |
| `PK.ramp(hex)` | Alias of `RP.u.ramp`: `[deepShadow, shadow, base, light, highlight]`. |
| `PK.sizes` | Default footprints `{name: [w, h]}` of the solid artwork when the helper is called with default args (`plant1/2/3`, `cdj1/2/3`, `mixer2/4`, `lampFloor`, `turntableBudget` are variants). Use it to stand props on a floor line: `PK.hydrant(c, x, floorY - PK.sizes.hydrant[1])`. |
| `PK.version` | `"1.0"` |
| `PK.util` | Internal building blocks (advanced): `rng, ri, pk, thr, sh, li, hue, lum, inkFor, AR, AP, clip, rr, outline, bev, paintFn, dshade, dmix, noise2, gradient, cylV, cylH, ball, blob, ring, groundShadow, haloPts, fitScale, HL, VL`. |

---

## 1. Gradients, speckle, shadows

| Call | Defaults | Returns | Description |
|---|---|---|---|
| `gradV(c,x,y,w,h,colors,{dither})` | `dither=1` | - | Vertical multi-stop gradient with Bayer-dithered band edges. `colors` = array of hex (equally spaced bands) or `[[t,hex],...]` stops with `t` 0..1. `dither` 0 = hard bands, 1 = fully dithered ramp, in between = narrower dither zone. |
| `gradH(c,x,y,w,h,colors,{dither})` | same | - | Horizontal version. |
| `speckle(c,x,y,w,h,colors,density,seed)` | `density=0.05` | - | Random single-pixel noise (`colors` = hex or array, `density` = fraction of pixels). |
| `contactShadow(c,x,y,w,h,{alpha})` | `alpha=0.55` | - | Soft dithered elliptical floor shadow filling the given box. |

## 2. Surfaces

All take `(c,x,y,w,h,o)`. `w,h` default to the screen edge.

| Call | Options (default) | Returns | Description |
|---|---|---|---|
| `plaster` | `base "#8c7590"`, `seed`, `stains 2` (water drips), `cracks 2`, `patches 3` (repair patches) | - | Old painted wall: mottled dither, grain, pits, ceiling darkening, stains, cracks, patches. |
| `brick` | `base "#8a4a3e"`, `mortar "#a09090"`, `bw 14`, `bh 6`, `worn 0.25`, `seed` | - | NYC running-bond brick: per-brick colour variation, lit top / shaded bottom edges, chips, soot, efflorescence. |
| `planks` | `base "#8a5a3e"`, `seam` (deep shade), `horizonY` (default `y - 0.9h`), `plankH` (bottom row height), `seed` | - | Wood floor in perspective: rows grow toward the viewer, butt joints, grain, knots, nails, far-end darkening. |
| `tiles` | `a "#c8c4d4"`, `b`, `grout`, `size 36` (tile width at the bottom edge), `checker` (default true if `b` given), `horizonY`, `vx` (vanishing x, default centre), `persp 1` (0 = no column convergence), `squash 0.34`, `seed` | - | Perspective floor tiles, checker or plain, glossy edge highlights. |
| `wallTiles` | `base "#d9d5df"`, `grout`, `size 12` (tile width; height = size/2), `band` (`true` or `{y,h:9,a,b,style:"key"|"check"|"stripe"}`; `y` relative to the top), `seed` | - | Glossy subway-style tiles in running bond, diagonal glaze sheen, grime, optional mosaic band. |
| `concrete` | `base "#7a768a"`, `panelH 36`, `seed` | - | Poured concrete: mottling, formwork seams, tie holes, stains, cracks. |
| `asphalt` | `base "#363244"`, `lines` (`"double"`, `"dashed"`, `"dashedY"`, `"edge"` or an array), `crosswalk` (`true` or `{x,w}`), `seed` | - | Street asphalt: gravel, repair patches, tar cracks, optional road markings. |
| `sidewalk` | `base "#8c88a0"`, `curbY` (default `y+h-12`; slabs above, curb below), `gum` (count, default `w/40`), `seed` | - | NYC sidewalk slabs with seams, cracks, mica sparkle, stains, gum, and a granite curb. |
| `carpet` | `pattern "club"|"hotel"|"stripes"|"argyle"|"stars"|"plain"` (`"club"`), `base`, `accent`, `colors` (club confetti), `stripe`, `seed` | - | Fibre carpet with 90s club confetti, hotel lattice, etc. |

## 3. Sky, city, windows, street

| Call | Options (default) | Returns | Description |
|---|---|---|---|
| `sky(c,x,y,w,h,o)` | `time "night"|"dusk"|"day"|"dawn"` (`"night"`), `stars` (`true` or count; default by time), `moon` (default true at night; `{x,y,r}` to place), `sun` (`true`/`{x,y,r}`), `clouds` (default true except night; number = count), `colors` (custom gradient stops), `seed` | - | Dithered sky gradient with stars, moon with halo, optional sun, shaded clouds. |
| `skyline(c,x,y,w,h,o)` | `night false`, `layers 2` (far to near, haze on far ones), `spire false` (+ `spireX`, `spireColor`), `seed` | emissive (lit windows, aircraft lights, spire floodlight) | Buildings stand on the bottom edge `y+h`: water towers, antennas, setbacks, windows, atmospheric haze. |
| `bridge(c,x,y,w,o)` | `night false`, `h` (tower height above the deck, default `0.3*w`), `color`, `seed` | emissive (deck, cable, tower lights) | Williamsburg-style suspension bridge. `x,y` = left end of the deck line; towers rise above, truss below. |
| `window(c,x,y,w,h,o)` | `view "city"|"brick"|"airshaft"|"interior"|"none"` (`"city"`), `time "night"` (`"night"|"dusk"|"day"|"dawn"`), `blinds` (`true` or 0..1 fraction lowered), `bars false`, `open false` (lower sash raised), `frame "#d8d0e6"`, `frameW 4`, `sill "#e4dcef"`, `bridge` (city view, default true when `w>=80`), `lit true` + `curtain` (interior view = what you see into a lit/dark flat from the street), `seed` | emissive (lit windows / lit interior) | Double-hung window with frame, depth shadow, glass sheen. Default size 100x90. Sill overhangs 4 px at the sides and bottom. |
| `fireEscape(c,x,y,w,h,{color,floors,ladder,ladderSide})` | `w 90`, `h 112`, `floors` auto (about one per 34 px), `ladder true`, `ladderSide "right"` | - | Iron decks with railings, zig-zag stairs, drop ladder, cast shadow on the wall. |
| `streetlamp(c,x,y,{on,h,arm,flip,color})` | `on true`, `h 116`, `arm 24`, `flip false` | emissive (lens + big halo) | Cobra-head sodium lamp. **`x` = pole centre, `y` = ground** (draws upward). |
| `hydrant(c,x,y,{color})` | `"#c8322c"` | - | Fire hydrant, 20x20. |
| `trashBags(c,x,y,{colors,seed})` | 4 colours | - | Pile of tied bags with shine, junk and a rip, ~43x28. |
| `manhole(c,x,y,{w,h,steam})` | `w 36`, `h 10`, `steam` (`true` = 70 px, or a height) | - | Perspective cast-iron cover; steam rises above `y`. |
| `stoop(c,x,y,w,h,{steps,flip,stone,under})` | `w 120`, `h 80`, `steps 8`, `flip false`, `stone "#7a4a44"`, `under true` | - | Brownstone stoop in side view: stone-block steps, landing top-left at `(x,y)` (stairs descend right; `flip` mirrors), iron railing (rises ~28 px above `y`), areaway door underneath. |
| `awning(c,x,y,w,{colors,text,h,stripe,textColor})` | `w 120`, `h 26`, `colors ["#c0302c","#efe8d8"]`, `stripe 9` | - | Striped shop awning with scalloped valance and a lettering plate. |
| `scaffold(c,x,y,w,h,{levels,bay,net,shed})` | `w 160`, `h 120`, `shed true` (green sidewalk-shed roof), `bay 52`, `net false` | - | Pipe scaffold with planks and braces. |
| `subwayStairs(c,x,y)` | - | emissive (green globes) | Subway entrance with railings; 64x52 plus globe glow. |
| `mailbox(c,x,y,{color})` | `"#2f5ab0"` | - | USPS box, ~20x32. |
| `newspaperBox(c,x,y,{color})` | yellow | - | Newspaper vending box, 16x28. |
| `bike(c,x,y,{color})` | red | - | Parked bicycle with lock, ~48x31. |

## 4. Doors, shelves, retail, furniture

| Call | Options (default) | Returns | Description |
|---|---|---|---|
| `door(c,x,y,w,h,o)` | `w 48`, `h 118`, `color "#6a4a5e"`, `frame`, `panels 4` (0, 2, 4 or 6), `knob true`, `hingeRight false`, `peephole true`, `number` (string, brass plate; none by default), `sign` (string, paper plate, e.g. `"EXIT"`; none by default; `signY`), `metal false` (+`window false`), `open false` (+`inside`) | `[]` | Apartment door with raised panels, hinges, brass knob and lock; metal variant with push bar; ajar variant with dark room behind. |
| `shelf(c,x,y,w,h,{wood,items,rowH,seed})` | `w 100`, `h 80`, `items "boxes"`, one of `"records"|"bottles"|"boxes"|"books"|"cans"` | - | Wooden shelving unit filled with the chosen goods. |
| `recordBins(c,x,y,w,h,{seed,wood})` | `w 132`, `h 60` (one crate per ~44 px) | - | Record crates on a stand: receding sleeve tops, divider tabs with letters, leaning covers, price stickers. |
| `recordWall(c,x,y,w,h,{seed,cell,palette,header})` | `w 160`, `h 90`, `cell 22`; `palette` = array of 4-colour arrays | - | Face-out album covers (suns, portraits, rings, checkers, type...) on display ledges. |
| `counter(c,x,y,w,h,{top,front,panelW,rail})` | `w 120`, `h 34`, `top "#c8b090"`, `front "#7a4a32"`, `panelW 26`, `rail false` (brass foot rail) | - | Shop counter with overhanging top and panelled front. Top overhangs 2 px per side. |
| `cashRegister(c,x,y)` | - | emissive (display) | Beige register with key deck and drawer, 31x29. |
| `cooler(c,x,y,w,h,{lit,sign,frame})` | `w 72`, `h 98`, `lit true`, `sign "COLD DRINKS"` | emissive (header + glass) | Bodega fridge with glowing glass doors full of drinks (one door per ~34 px). |
| `bar(c,x,y,w,h,{stools,top,wood})` | `w 260`, `h 110`, `stools` (`true` = 3, or a count) | emissive (shelf LED strips) | Back bar with mirror and bottle shelves, wooden bar front, brass rail, optional stools. |
| `table(c,x,y,w,h,{color,top,round})` | `w 64`, `h 36`, `round false` | - | Four-leg table (or pedestal round table). |
| `chair(c,x,y,{kind,color,flip})` | `kind "wood"|"office"|"stool"`, 22x42, `flip` mirrors the facing | - | Chair. |
| `couch(c,x,y,w,{color,h,pillow,pillowColor})` | `w 110`, `h 0.42*w`, `pillow true` | - | Tufted three-cushion couch. |
| `bed(c,x,y,w,{color,h,sheet,frame,flip})` | `w 176`, `h 62`, `frame "metal"` (or `"wood"`), headboard on the left (`flip` = right) | - | Side-view bed with blanket, pillow and under-bed shadow. Pass `h:92` for a tall metal frame like the original bedroom. |
| `desk(c,x,y,w,h,{wood,top})` | `w 108`, `h 50` | - | Desk with drawer pedestal. |
| `lamp(c,x,y,{on,kind,color})` | `on true`, `kind "table"` (18x35), `"floor"` (20x74), `"desk"` (articulated), `color` = shade | emissive (shade + halo) | Lamp; when `on` lights its shade and halo. |
| `plant(c,x,y,{size,dead,pot,color})` | `size 2` (1: 30x28, 2: 50x47, 3: 75x69), `dead false` | - | Potted plant with shaded leaves (or dead drooping brown). |
| `tv(c,x,y,{on,content,ears,w,h,color})` | `on false`, `content "static"|"bars"|"news"|"blue"`, 44x34 | emissive (screen + halo) when `on` | CRT TV; `ears:true` adds rabbit ears (they rise above `y`). |
| `laptop(c,x,y,{on,w,h,color,screen})` | `on false`, 30x22 | emissive when `on` | Laptop with sticker and keyboard. |
| `poster(c,x,y,w,h,{seed,title,titleLines,lines,palette,border,tape})` | `w 40`, `h 56`, `lines ["SAT 10PM","DJ ???"]`, `palette` = `"neon"|"paper"|"mono"|"sunset"` or `[bg,a,b,c]` | - | Gig poster/flyer: motif (orb, sun bars, stripes, skyline, rings), auto-fit 3x5 pixel-font title (`titleLines` forces line breaks), small print, tape, creases. |
| `frame(c,x,y,w,h,{color,thick,mirror,kind,palette})` | `w 26`, `h 32`, `kind "landscape"|"portrait"|"abstract"`, `mirror false` | - | Picture frame with mat and tiny artwork, or a mirror. |
| `clock(c,x,y,{d,hour,min,color})` | `d 18`, `hour 10`, `min 10` | - | Round wall clock. |
| `radiator(c,x,y,w,h,{color})` | `w 80`, `h 34` | - | Cast-iron radiator with valve. |
| `pipe(c,x,y,len,{dir,r,color,joint,brackets})` | `len 60`, `dir "v"` (or `"h"`), `r 4` (thickness), `joint 44` | - | Shaded pipe with flanges, rust drips and brackets. |
| `vent(c,x,y,w,h,{color})` | `w 26`, `h 16` | - | Wall grille. |
| `sink(c,x,y,{w,color})` | `w 28` (28x39) | - | Pedestal sink with taps. |
| `toilet(c,x,y,{color,flip})` | 30x36, faces right | - | Side-view toilet with tank. |

## 5. Office

| Call | Options (default) | Returns | Description |
|---|---|---|---|
| `officeCubicle(c,x,y,w,h,{color})` | `w 132`, `h 88` (footprint 136x88 incl. the 12 px side panel) | emissive (monitor) | Fabric cubicle with CRT, keyboard, phone, mug, pinned notes. |
| `copier(c,x,y)` | 56x46 | emissive (panel) | Office copier. |
| `waterCooler(c,x,y)` | 18x46 | - | Water cooler with blue jug. |
| `vendingMachine(c,x,y,{w,h,color,sign})` | `w 40`, `h 66`, `sign "SNACKS"`, red | emissive (header, glass, display) | Glowing snack machine. |
| `microwave(c,x,y,{on,color})` | `on false`, 26x15 | emissive (display; window when `on`) | Microwave. |

## 6. DJ gear and studio

| Call | Options (default) | Returns | Description |
|---|---|---|---|
| `turntable(c,x,y,{model,platterColor,record,label,mat})` | `model "technics"` (silver, 70x31) or `"budget"` (62x28); `record true`; `label "#e0368f"` | emissive (target LED) | Direct-drive deck with platter, record, tonearm, pitch fader. |
| `cdj(c,x,y,{tier,screenOn})` | `tier 2` (1: 46x28 LCD only, 2: 52x30 small screen, 3: 58x32 waveform screen + LED jog ring), `screenOn true` | emissive (screen, jog LEDs, buttons) | CDJ-style media player. |
| `mixer(c,x,y,{channels,rotary,xf})` | `channels 2` (width `13*channels+14`, 30 high), `rotary false`, `xf` = crossfader offset in px | emissive (VU LEDs) | DJ mixer with EQ knobs, VU meters, faders or rotaries. |
| `djBooth(c,x,y,w,{gear,mixer,lights,logo,frontH,tier,model})` | `w 230`, `gear "cdj"|"turntable"` (`"cdj"`), `mixer "2ch"|"4ch"|"rotary"` (`"2ch"`), `lights true` (neon strip), `logo "RE:PARTEE"` (`false` = none), `frontH 36` | emissive | Complete booth: 2 decks + mixer on a table with scrim-cloth front panel. Gear top at `y`; total height 74 (32 gear + 6 slab + 36 front). Spare table space gets a laptop and headphones. |
| `speakerStack(c,x,y,w,h,{color})` | `w 44`, `h 92` | - | PA stack: sub + top cab with perforated grille and cones. |
| `monitors(c,x,y,{krk,pair,gap,w,h})` | `krk false` (true = yellow woven cone), 26x44; `pair true` draws a second one `gap` (120) px to the right | - | Studio monitor speaker(s). |
| `studioDesk(c,x,y,w,h)` | `w 250`, `h 90` (`y` = top of the monitors) | emissive (pad LEDs, screens, rack LEDs) | Desk with two KRK monitors, 61-key synth, MPC-style pads, laptop, rack, sub. |

## 7. Nightclub and stage

| Call | Options (default) | Returns | Description |
|---|---|---|---|
| `neon(c,text,x,y,color,{scale,tube,glow,strength,glowR,spacing,off})` | `scale 2` (pixel size of the 3x5 font cell), `tube` (tube thickness, default = `scale`), `glow true`, `strength 1`, `glowR` (halo radius), `off` = array of letter indexes that are burnt out | emissive (tubes + dithered halo) | Neon tube lettering: bright core, saturated body, dark backing, dithered glow. Diagonal font joints are bridged so letters read as one tube. |
| `neonLine(c,pts,x,y,color,{tube,closed,glow,strength,glowR})` | `tube 2` | emissive | Neon tube along a polyline (`pts` relative to `x,y`, e.g. lightning bolts, arrows, outlines). |
| `glow(c,x,y,r,color,{strength,ry})` | `strength 1` | emissive (halo pixels) | Dithered radial halo centred on `x,y` (`ry` for ellipses). |
| `lightCone(c,x,y,topW,botW,h,color,{alpha,core,lens})` | `alpha 0.5`, `core 0`, `lens true` | emissive | Dithered, alpha-blended beam. `x` = centre of the apex at the top, `y` = top. |
| `discoBall(c,x,y,r,{string,colors})` | `r 14`, `string 14` (hanging line length) | emissive (sparkling facets, glints) | Mirror ball. `x,y` = centre. |
| `truss(c,x,y,w,h,{lights,color})` | `w 200`, `h 12`, `lights` = `false` (none), `true` (1 per 36 px), a count, or an array of colours | emissive (lenses + halos); **`.lights`** = `[{x,y,color}]` | Box truss with clamps and optional hanging par cans. Aim beams: `t.lights.forEach(l => PK.lightCone(c,l.x,l.y,6,140,140,l.color))`. |
| `stage(c,x,y,w,h,{deck,steps,trim,wedges})` | `w 420`, `h 64`, `steps false`, `trim true` (cyan LED lip), `wedges true` | - | Stage: scuffed deck with gaffer-tape marks, lip, pleated skirt, monitor wedges, cables. 40 % deck, 60 % front. |
| `ledWall(c,x,y,w,h,{pattern,palette,panel,seed})` | `w 200`, `h 100`, `pattern "waves"|"grid"|"equalizer"|"sunburst"|"plasma"|"rain"|"stripes"|"rings"` (random by seed), `palette` 4 colours, `panel 32` | `[[x,y,w,h]]` | LED video wall of 2x2 px cells with cabinet gaps and bezel. |
| `crowdSilhouettes(c,x,y,w,h,{seed,colors,density,rim,rows})` | `w 300`, `h 70`, `colors` 3 shades back to front, `density 0.88`, `rim ["#ff3fa4","#39d0ff"]`, `rows` auto | emissive (phones, glow sticks) | Static background crowd: heads, hair, caps, raised arms, rim-lit by the stage. Fills down to `y+h`. |
| `barricade(c,x,y,w,{panel,color,sign,text})` | `w 120`, height 24 (+5 feet), `panel 40`, `sign true`, `text "STAGE"` | - | Interlocking steel crowd-barrier panels. |

## 8. Travel

| Call | Options (default) | Returns | Description |
|---|---|---|---|
| `departuresBoard(c,x,y,w,h,{rows,title})` | `w 200`, `h 74`, `title "DEPARTURES"` | `[[x,y,w,h]]` (screen) | Amber flight board with column headers and coloured status text, scanlines. |
| `airportSeats(c,x,y,w,{color})` | `w 120` (one seat per ~30 px), 40 high | - | Connected terminal seats on a chrome beam. |
| `planeWindow(c,x,y,{view,shade,w,h,panel})` | `view "sky"|"night"|"wing"|"runway"|"clouds"` (`"sky"`), `shade` 0..1 (lowered shade fraction), 28x38 | emissive (the view area) | Oval cabin window. |
| `luggageCarousel(c,x,y,w,{bags,label})` | `w 220`, `bags` default `w/55`, `label "CAROUSEL 3"` | emissive (sign) | Baggage belt with suitcases; bags stand up to 17 px above `y`. |
| `hotelBed(c,x,y,w,{h,linen,runner,headboard})` | `w 150`, `h 78` | - | Front-view bed: tufted headboard, pillows, duvet, runner, bed skirt. |
| `suitcase(c,x,y,{color,w,h,handle,tag})` | `w 22`, `h 1.4*w`, `handle true` (+5 px above), `tag true` | - | Hard-shell rolling case. |

## 9. Transit

| Call | Options (default) | Returns | Description |
|---|---|---|---|
| `subwayPlatform(c,x,y,w,h,{name,tile,stripe,floor,seed})` | `w 640`, `h 256`, `name "BEDFORD AV"` | emissive (ceiling lights, tunnel signals) | The whole room backdrop seen from the near platform. Layout (fractions of `h`): tiled far wall + columns + name plaques + tunnel mouths down to 0.46; far platform lip with yellow line; track pit with ties, rails, third-rail cover; **near platform edge (yellow tactile strip) at `y+round(0.66h)`**; walkable concrete floor below it. |
| `subwayCar(c,x,y,w,{doorsOpen,lit,h,line,stripe,color})` | `w 280`, `h 92` (wheels reach `y+h+4`), `doorsOpen false`, `lit true`, `line "L"` (bullet), `stripe "#2f7ad8"` | emissive (lit windows / open doors, destination sign) | Stainless steel car side with windows full of straphangers. Park it in the pit so that `y+h` is about 3 px above the platform edge strip. |
| `turnstile(c,x,y)` | 38x38 | emissive (status lights) | MTA-style turnstile. |
| `bench(c,x,y,w,{back,wood})` | `w 90`, `back true` (34 high, else 22) | - | Wooden slat bench on metal legs. |

## 10. Small extras

| Call | Options (default) | Returns | Description |
|---|---|---|---|
| `baseboard(c,x,y,w,{h,color})` | `w 640`, `h 9`, `"#5a4058"` | - | Moulded wall-floor trim with scuffs, nails and floor shadow. |
| `rug(c,x,y,w,h,{colors,shape})` | `w 120`, `h 30`, `colors [base,border,accent]`, `shape "oval"` (or `"rect"` as a trapezoid with fringe) | - | Floor rug in perspective. |
| `bulb(c,x,y,{len,on,glowR})` | `len 22`, `on true`, `glowR 34` | emissive | Hanging bare bulb on a cord from `x,y` (ceiling). |
| `fluorescent(c,x,y,w,{on})` | `w 80`, `on true` | emissive | Ceiling tube light with cool glow. |
| `exitSign(c,x,y)` | 25x11 | emissive | Green EXIT sign. |
| `crate(c,x,y,{color,w,h,records})` | `"#2f62b8"`, 36x40 with records | - | Milk crate full of records. |
| `trashCan(c,x,y,{color,full,w,h})` | 20x28, `full false` | - | Steel street trash can, optionally overflowing. |
| `pizzaBox(c,x,y,{w})` | 42x14 | - | Flat pizza box. |
| `cardboardBox(c,x,y,w,h,{color})` | `w 26`, `h 20` | - | Taped moving box. |

---

## Recipes

```js
const PK = RP.PK, em = [];                       // collect emissive rects for the engine
PK.plaster(c, 0, 0, 640, 166, { base: PK.paletteNight.wall, seed: 7 });
PK.baseboard(c, 0, 163, 640);
PK.planks(c, 0, 172, 640, 84, { base: PK.paletteNight.wood });
em.push(...PK.window(c, 216, 30, 120, 94, { time: "night" }));
PK.bed(c, 12, 118, 182, { h: 92 });
em.push(...PK.lamp(c, 98, 138, { kind: "desk" }));

// club: aim beams from the truss fixtures
const t = PK.truss(c, 40, 8, 560, 12, { lights: 8 }); em.push(...t);
t.lights.forEach(l => em.push(...PK.lightCone(c, l.x, l.y, 6, 140, 140, l.color)));
```

Engine side (what the gallery does): snapshot the canvas, multiply a tint, then `drawImage` each emissive rect back from the
snapshot (`ctx.drawImage(snap, x,y,w,h, x,y,w,h)`).

Gotchas:

* `RP.u.txt` etc. need integer positions; the kit rounds for you, but your own calls to `txt` should pass integers.
* Alpha is used for halos and shadows, so do not paint helpers onto a canvas whose `globalAlpha` you rely on being 1 afterwards
  (the kit restores it, but `fillStyle` is left changed, as with any drawing call).
* `window()` footprints: frame `x..x+w`, `y..y+h`; sill extends 4 px past both sides and 4 px below `y+h`.
* `subwayPlatform` and `stage` are big; call them once per room.

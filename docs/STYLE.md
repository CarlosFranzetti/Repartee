# re:parteé — Art & writing style

## Look

Early-90s VGA point-and-click (The Secret of Monkey Island, Monkey Island 2, Maniac Mansion,
Zak McKracken), redrawn at 640×256 logical pixels. Everything is drawn in code.

- **Pixels only.** Integer `fillRect`s via `RP.u` (R, P, ell, line, poly, txt) and the paint kit
  `RP.PK` (see docs/PAINTKIT.md). No anti-aliasing, no CSS gradients in scenes, no blur.
- **Ramps, not single colors.** For any surface use `RP.u.ramp(base)` → [deep, shadow, base,
  light, highlight]. Shadows lean violet, highlights lean warm. Top edges catch light (1px light),
  bottom edges sit in shadow (1px deep), objects cast a dithered shadow on the floor/wall.
- **Bayer dithering** (`RP.u.bayer(x, y)`, 0–15) for gradients, sky, glows, fog, worn paint.
- **Texture everything a little:** speckle walls, grain on wood, cracks, stains, posters, flyers,
  stickers, tags. NYC is layered: graffiti, gum, pipes, fire escapes, scaffolding, trash bags.
- **Composition:** a back wall (y 0–165), floor (165–256) with perspective rows, mid-ground props
  that the kid can walk in front of (depth-sorted `sprites` by their base y), and occasional
  foreground elements (`drawFront`). Leave a clear walkable band (y≈205–252). Put the important
  hotspots where they're easy to click.
- **Light is the mood.** Every room defines `light`: an ambient color (night = deep violet/blue,
  day = warm grey) plus light pools (lamps, neon, windows, screens), `halos` for bulbs/neon, and
  `rims` for colored club light. Characters pick it up automatically (Monkey Island-style shading,
  rim light, cast shadows). Return emissive rects from `paint()` for screens/neon/windows so they
  stay bright.
- **Motion:** blinking neon (`fx: blink`), dust in light beams, steam from manholes, haze and
  sweeping beams in clubs, rain outside, flickering TV, passing headlights. Respect reduced motion
  (engine handles strobes/beams).
- **Palette anchors:** neon pink `#ff3fa4`, cyan `#39d0ff`, amber `#ffc44d`, lime `#9be15d`, night
  violets `#140c34 → #6e2a6e`, sodium street orange `#ffb04a`, brick `#8a3a2a`.
- **Text in the scene** uses the 3×5 pixel font (`RP.u.txt`, `txtC`, scale 1–3). Signs should name
  fictional places (Nowhere, Deep Cuts, Sal's, Synergex, Halcyon Room, Halle Neun, Harbor Lights).
  Record sleeves/posters may show real artist/label names.

## Characters

Defined with `RP.chars.define` (see ENGINE_API.md). Pick distinct silhouettes: build, hair,
hats, accessories, a signature color. NYC is diverse; vary skin tones, ages, body types and
styles. Give every speaking character a `voice` color. Use `expr` ("angry", "happy", "sad",
"surprised", "worried") on actors for comedic beats: `RP.actor("dante").expr = "worried"`.

## Writing

- Short lines (≤ 110 characters per speech line; split long thoughts into several lines).
- The kid is dry, self-deprecating and observant. Jokes land on the kid, the city, the industry
  and the fictional characters — never on real people.
- Each hotspot: a specific, funny Look line; custom lines for at least the plausible wrong verbs.
- Running gags: Dante's "next week", Marcus's "plus three", Kosmo getting your name wrong, Eddie's
  "two-time deal", Lou and 1993, Mr. Whiskers, Gerald the plant.
- Real facts are delivered casually and correctly ("Trax Records, Chicago, 1987."). If a fact isn't in
  the data, don't state it.
- Use American English, NYC flavor, no slurs, no real-person gossip.

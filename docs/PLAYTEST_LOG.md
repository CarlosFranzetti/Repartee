# Playtest log

Open findings from blind playtests (fresh agents playing a level page with no knowledge of the solutions,
through `tools/blindplay.mjs`). Nothing here has been fixed yet; fixed findings are listed at the bottom.
"Run" names the take the finding came from.

## Level 1: Bedroom DJ

| # | Where | Finding | Kind | Run |
|---|---|---|---|---|
| 1-1 | Bedroom | You can't leave until you've called Dante, and you can't call until Lou is dealt with. Neither block is signposted, so it reads as being stuck. | clarity | L1 take 2 |
| 1-2 | Bedroom / phone | Nothing teaches that "Pick up" on furniture (bed, bins, under the bed) can retrieve things. | clarity | L1 take 2 |
| 1-3 | Phone | The battery shows 41% after charging and never changes. | polish | L1 take 3 |
| 1-4 | Subway platform | Paying the busker a dollar for a request gives a vague, useless reward. | design | L1 take 2 |
| 1-5 | Hallway / USB | The lost-cat "Biscuit" poster and the ex's cat-photo USB have no payoff inside Level 1. They do come back in Level 2, but on its own Level 1 they read as dangling gags. | design | L1 take 2 |
| 1-6 | Stoop / bodega | Smitty and Ali give the same can-bag tip. | polish | L1 take 2 |
| 1-7 | Story | "Rent's due Friday" never resolves in Level 1 (Dante pays "next week"). | design | L1 take 2 |
| 1-8 | Phone | Marcus's guest-list text never pays off in Level 1. | design | L1 take 2 |
| 1-9 | Phone | Dante's "ask Ray for a closer" text only arrives after the Synergex shift, and the "vinyl hour" rule is only explained on the call. Both are easy to miss. | clarity | L1 take 1 |
| 1-10 | Synergex | The fire-alarm strobe is look-only, which is misleading (the real trigger is the microwave). The Form 27-B tray and the evacuation plan are dead ends. | design | L1 take 3 |
| 1-11 | go.Digging | The goal asks for "a closer", but a record's role tag only shows after LISTEN. You can pay for a non-closer without knowing. | clarity | L1 take 1 |
| 1-12 | crowd.Read | The round-2 hint "warm, not weird, not yet" seems to contradict the role tags (WARMUP/BUILDER/PEAK/CLOSER). In round 4 only one record is left, so there's no choice. | design | L1 take 3 |
| 1-13 | go.Digging | A run failed at 0/100 with nothing kept after buying two house records under 8 dollars ("I Like To Move It", "Show Me Love"), both tagged peak. It's never clear what counts as a closer; the real ones were dollar-bin records. ASK RAY first says "try the dollar bin", later "filed under house". Hard to solve fairly. | clarity | L1 audio take |
| 1-14 | go.Digging | Ray's fallback list prices "Finally" at 2 dollars; in the bin it was 1 dollar with deep scratches. | text | L1 audio take |
| 1-15 | go.Digging | The mini-game's cash is capped at 10 dollars while the wallet held 21.90. | design | L1 audio take |
| 1-16 | crowd.Read | "Missing" (126 BPM) is labelled "tempo fits" although the crowd's stated window is 108-124. | text | L1 audio take |
| 1-17 | Synergex | Brenda says "Nobody stays on my floor", but staying in the supply closet during the alarm has no consequence. | design | L1 audio take |
| 1-18 | Phone | Staffright's "wear a collared shirt" text and Mom's "Did you eat" text are never used; you never actually work the temp shift. | design | L1 audio take |
| 1-19 | Phone | "Subway map" only appears in the phone menu after you've left home. Probably intended; noted because the tester looked for it. | clarity | L1 audio take |

## Level 2: Underground Hustler

| # | Where | Finding | Kind | Run |
|---|---|---|---|---|
| 2-1 | Hallway | The landlord notice ("office hours Tuesday 2:00-2:15 PM") and Kowalski look like a puzzle but lead nowhere. Time only moves on story beats, and the rent due Friday is never resolved. | design | L2 take 2 |
| 2-2 | sound.Check | Skye's hint about the dead channel is ambiguous: cleaning CH1 doesn't fix it, re-patching to CH3 with PHONO does. The first try scored 15/100. | clarity | L2 take 2 |
| 2-3 | after.Party | Lou's boombox gives 0/30 sound. The only warning is Lou's "batteries are original" line, and it then triggers "the speaker is dying". | design | L2 take 2 |
| 2-4 | after.Party | Scoring is opaque: any plan under 30 guests caps at 55 ("FINE"), and nothing on screen says so. | clarity | L2 take 1 |
| 2-5 | Loft | Moxie promises 60 dollars and hands over 40. The text jokes about it; check that this is intended. | text | L2 take 2 |
| 2-6 | buy.Gear | In this run every test on Eddie's turntables came back clean, so haggling was the only decision. | design | L2 take 2 |
| 2-7 | LifeDrop | The wall calendar shows "OCT 1". | polish | L2 take 2 |
| 2-8 | Phone | Dani's text about pierogi isn't in Messages until later. | polish | L2 take 1 |

## Harness notes (not game bugs)

- `click` picks the first of two buttons with the same text (sound.Check's per-deck PHONO / CH3); use `clickxy`.
- A dollar sign inside a double-quoted shell argument gets expanded by the shell, so captions like "$28.90" come out mangled. Testers are told not to type it.

## Fixed (for reference)

- Dialogue and phone-menu choices clipped their top rows (the list was centred in a scrolling box).
- "@speaker" tags printed into dialogue; the evacuation plan was unclickable; flattened "Acid Tracks" still said WARPED.
- Room fades dissolved through a dot pattern.
- Level pages lost the names of items carried over from Act 1; Dani unlocked Saturday's loft on Tuesday.
- Jess in after.Party forgot that you returned her USB.
- The H shortcut swallowed the letter H in the DJ-name box.
- Clock, slice, record-count and step-count text slips; the can machine counted a pizza-box five you hadn't found.

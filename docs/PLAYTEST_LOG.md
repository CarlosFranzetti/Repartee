# Playtest log

Findings from blind playtests (fresh agents playing a level page with no knowledge of the solutions, through
`tools/blindplay.mjs`) and from code-reading audits and automated sweeps. Levels 1 and 2: two video takes each plus one
audio take. Levels 3 to 5: one blind take each (`--unlock`, recorded on the build from before the Level 3-5 fixes, so
some of their findings were already fixed when they reported), a story/continuity audit, a room-by-room verb sweep and a
mini-game sweep. "Run" names where a finding came from.

## Open

| # | Where | Finding | Kind | Run |
|---|---|---|---|---|
| 2-19 | Money | Every subway trip costs 3 dollars and the ATM fee is 10, with no warning before a wasted trip. | design | L2 audio take |

**Levels 3-5, still open after the blind-take fixes**
- 4-8 (part): Katja's hint to play something unknown in Berlin has no pay-off, because the white label isn't in the
  Level 4 crowd.Read crate.
- 3-11 (part): "It's Dj lowpass." wasn't found in the Level 3 source; if it shows again, note where.

## Intended, not changed

| # | Where | Finding | Why it stays |
|---|---|---|---|
| 1-5 | Hallway / USB | The lost-cat "Biscuit" poster and the cat-photo USB don't pay off inside Level 1. | Both pay off in Level 2: Jess and the USB, and Biscuit in Vic's pitch notes. |
| 1-8 | Phone | Marcus's guest-list text doesn't pay off in Level 1. | It sets up Marcus's party door in Level 2. |
| 1-18 | Phone | Staffright's "collared shirt" text and Mom's "Did you eat" text are never used. | Flavour. |
| 1-19 | Phone | "Subway map" only appears in the phone menu once you've left home. | The map has nowhere to go before then. |
| 2-5 | Loft | Moxie promises 60 dollars and hands over 40. | The text jokes about it ("I'm not above a rounding error"). |
| 2-6 | buy.Gear | In Level 2 the AT-LP120 is always clean, so haggling is the only decision for it. | The hunt is the other two listings: one has honest wear, one is the wobble lemon. |
| 2-13 | after.Party | Twinkie's referrals change between attempts. | Randomized on purpose. |

## Fixed

**Level 1**
- 1-1: the bedroom door and the phone name the actual blocker at each stage (dead phone, untested decks, channel 2, Lou on the pipe).
- 1-2: Look texts nudge toward "Pick up" (under the bed, the mattress, the cans, the curb bags).
- 1-3: the phone battery refills overnight.
- 1-4: the busker's request pays off with a real tip.
- 1-6: Smitty has his own tip instead of repeating Ali's.
- 1-7: rent is settled at the end of Level 2.
- 1-9: Dante's vinyl-hour text (four records, a closer, Ray at Deep Cuts) arrives right after the booking.
- 1-10, 1-17: the Synergex strobe hints that it needs smoke; Brenda's head count gets a nod in the closet.
- go.Digging:
  - 1-11, 1-13: the WANT line defines a closer, and a ROLE row fills in once you LISTEN. Paying for a record that doesn't fit asks first. Ray's three hints agree.
  - 1-14: Ray's fallback copies are labelled as clean copies at guide price.
  - 1-15: the budget says "BUDGET $10 of your $21.90 (rest is fare home)".
- crowd.Read:
  - 1-12: round hints use the tag words, and the forced last pick is labelled "LAST ONE IN THE CRATE".
  - 1-16: "Missing" reads "a touch fast" against the 108-124 window.

**Level 2**
- 2-1, 2-9: once the plasma and the shower are done, the kid says the day's done and Marcus texts "crash on the couch". The landlord notice and Nurse Bev no longer read as puzzles. A closing beat pays the rent and returns the 4C key.
- 2-7: the LifeDrop calendar follows the weekday.
- 2-8: Dani's replies land in Messages straight away.
- 2-18: the ID comes out of the wallet on screen.
- 2-17: Eddie's 215 tag and 180 deal agree with the buy.Gear listing ("ASKING · PAIR $215").
- 2-16: buy.Gear's lemon line says whether you steered clear or bought it.
- sound.Check:
  - 2-2: Skye says the channel strip is dead, not just crackly.
  - 2-10: a WHAT YOU HEAR box describes every fault in words. The meters and feedback work with the game's sound off.
- after.Party:
  - 2-3, 2-11, 2-12: options show quality, capacity and mismatches before you pick. A replaced sound says so and can be borrowed back.
  - 2-4: the guest target and the FINE cap are on screen, and the breakdown gives a tip per category.
  - 2-14: every event choice shows its cost.
  - 2-15: the loft is three floors everywhere.

**Levels 3-5 (story audit, room sweep and mini-game sweep, fixed on 2026-10-26)**
- Story: Level 3's first night is a routine Thursday of a six-month residency (Basement Tapes is how Odessa found you);
  Level 3 ends with Ingrid Falk's first email and Level 4 opens with her follow-up; the flight is a real daytime trip;
  you wake in Room 12; Berlin's FEX goes to Hauptbahnhof; Pfand is 8 cents; the Halcyon is a Thursday residency; the
  MK7s are bought once (Level 4); poster "second-biggest letters"; Mercè everywhere; Lou is sixty-some; Gerald grew all
  summer; Jess quotes your real followers; the bar tab is a fixed 200 dollars; the record fair waves you in.
- Off-screen speakers (Odessa, Brandon, Marcus, Kosmo, Priya, Axl) show their names.
- Renames so each name is one person: Bernadette (JFK baggage), Nugget (K9 beagle), Margo Quist (manager), Roz Kessler
  (stage manager), Preston "Whit" Whitlock.
- Rooms: your misspelled name reads naturally in Levels 4 and 5 (no "DJ DJ"/"DJY"); Sven's quiz can be left and resumed;
  the caterer, stage techs and the platform sleeper answer; the main-stage LED wall no longer errors.
- Mini-games: set.Time's Level 5 overrun is a real 36-minute slot and every fail names its reason; guest.List is fair
  ("we're full" is a correct answer, VIP spots shown) and the Level 5 gate shows Harbor Lights; crate.Digging tells
  Level 3's story and asks before ending with records left; the Core 47s are never the broken pair; crowd.Read goal
  rounding; phone layout in mak.Tracks, get.Followers, buy.Gear and set.Time; playlist.Order's LOCK IT IN is on screen.

**Levels 3-5 blind takes (fixed on 2026-10-26)**
- Level 3 (3-1 to 3-11): BUY/SURE? confirms; the clock only moves forward and matches the story; the last train's
  intro, start time, stations (Delancey St to Halsey St) and line come from the scene; Odessa's stale lines, the snack,
  the USB and the white label set-up; the opener names Odessa as promoter; record.Hunt needs two clues; get.Followers
  events don't repeat and the goal is reachable (+450); assorted slips.
- Level 4 (4-1 to 4-11): the cover photo works with Use phone on the hole (engine) and from the hole itself; last.Train
  has its own Berlin intro; an oversold business cabin explains seat 23A; Ingrid's and Lou's lines show the right
  speaker; promoter.Talk calls Ingrid "she"; the release keeps the mak.Tracks title; Ben Klock at 128; the follower goal
  is +800; studio labels don't overlap and hover text stays clear of the cash.
- Level 5 (5-1 to 5-10): the stage-left stairs exit works; clocks, cue lights and room text follow the real time; the
  guest list's verdicts, press and VIP lines are consistent; club.Drama uses the 11:45 slot and Harbor Lights; Ray's
  white label and a closer are in the crates; sound.Check's FOH is Mo; the Taula test shows the cut band and has knobs,
  not faders; the wallet label tracks your cash; Eddie's water is an item; text slips.
- Engine: the wallet and header always agree; speaker labels never double; Use phone on a target runs the target first.
- Harness, not game: doubled tags ("PA: PA:") and run-together ones ("AIRRAY") came from `tools/blindplay.mjs`.
- Room speed re-measured on an idle machine: 49 rooms, 0 over 8 ms per frame.

**Found while fixing**
- Level 3: Eddie's CDJ-900 pair was out of reach of the budget the act gives you, and the game handed you the 900s whatever you bought. The 900s are now a scripted listing (tag 280, floor 190), and the story follows the decks you actually buy.

**Earlier rounds**
- Dialogue and phone-menu choices clipped their top rows; `@speaker` tags printed into dialogue; the evacuation plan was unclickable; flattened "Acid Tracks" still said WARPED.
- Room fades dissolved through a dot pattern; disabled buttons faded to unreadable.
- Level pages lost the names of items carried over from Act 1; Dani unlocked Saturday's loft on Tuesday.
- The H shortcut swallowed the letter H in the DJ-name box; assorted clock, slice and count text slips.

## Harness notes (not game bugs)

- `click` picks the first of two buttons with the same text (sound.Check's per-deck PHONO / CH3); use `clickxy`.
- A dollar sign inside a double-quoted shell argument gets expanded by the shell, so testers are told not to type it.

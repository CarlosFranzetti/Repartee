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

**Levels 3-5, from the blind takes (to fix next; check each still happens, since the takes ran on the older build)**

Level 3
- 3-1 Buying from Eddie: BUY / SURE? flips back and forth for ~6 clicks; only Enter completes it (buy.Gear).
- 3-2 Cash in the header disagrees with the wallet in several places; the header went negative at the end.
- 3-3 The clock stalls (MON 1:20 PM through a posting week); story times ("3 PM", "11:40 PM", hunt at "10 AM") don't match it.
- 3-4 Last train: story times, train line and phone battery contradict the mini-game; Delancey St is placed at Jackson Hts.
- 3-5 "Lou's 1993" is never set up; the USB "for the second hour" is never used.
- 3-6 Doubled speaker tags ("CLERK: CLERK:", "PTA LADY: PTA LADY:").
- 3-7 Odessa asks for Gus's snack after it's given, says "late zero times" when you're late, texts "saw your socials" before you post.
- 3-8 The opener set.Time text calls the promoter "Dante"/"his phone"; the "11 PM rush" fires at 10:45; THE ROOM WANTS lags; PACE always "mix earlier"; TIMING 60% unexplained.
- 3-9 record.Hunt: all three clues point to the same spot; "under a doily" vs the platter.
- 3-10 get.Followers: events repeat word for word; the "sketchy offer" never appears.
- 3-11 Small slips: "It's Dj lowpass."; the bed mentions the record bag after you take it; "everything has a check mark" with one unchecked; the bar-cam clip stays in inventory after you give it; the napkin's "Phone. Fingers." but posting is on the laptop; a money sum that doesn't add up.

Level 4
- 4-1 **Blocker:** photographing the hole for the cover: Use phone on the hole opens the phone menu; only Give phone to hole works.
- 4-2 last.Train's intro is Level 3's ("the gig is over, two crates"), with the wrong start time and cash.
- 4-3 Business class negotiated, then seat 23A and an overweight fee.
- 4-4 Ingrid's "eight hundred people" line and Lou's knock are shown as the player's; "PA: PA:", "PILOT: CAPTAIN:"; promoter.Talk calls Ingrid "he" and starts a reply lowercase.
- 4-5 Stale lines: passport "somewhere" after booking; "try the sampler" after the track is done; the track's title asked twice.
- 4-6 Lou: "won't say where it came from" right after the story; "doesn't own a phone" but texts; bass vs hi-hat complaint.
- 4-7 get.Followers: costs differ from labels; "LOVES studio setups" vs "STUDIO POSTS -30%"; advice backfires; 5,500 looked out of reach.
- 4-8 crowd.Read asks for a CLOSER no record has; Katja's white-label hint has no pay-off.
- 4-9 Ben Klock 126.9 BPM in beat.Match vs 128 in the crate; "135 bpm" text at 130; "half the room" at 22/22.
- 4-10 Layout: hover text over the cash in Berlin; studio labels overlap; the "NEW SOUND" toast covers the mak.Tracks title; the rug clickable but unlisted.
- 4-11 Small slips: "Got no reply? Fine."; pizza box "gone" but visible; Delgado named before he's introduced; "don't lose the bag" attributed backwards; "1 flights".

Level 5
- 5-1 **Stuck:** stage left after soundcheck, the stairs-down exit does nothing (only the far-left floor works).
- 5-2 Stage left: room text says 11:52 PM and red cue lights while the clock says 5:20 PM; Roz repeats her pre-soundcheck line; you draw behind the calling desk.
- 5-3 Guest list: "LEAKY" with 0 crashers; Marcus "still sulking" after his +1 gets in; 31 vs 30 people; press listed by outlet can't match an ID; "two Ns" for a name without them; VIPs including Lou say "It's in the jet."
- 5-4 club.Drama: "10 PM slot" vs 11:45; "Reggie" and "Kosmo Delacroix" not introduced; Axl says "Axl's rider".
- 5-5 The playlist brief leads you to drop the CLOSER, then crowd.Read asks for one; Ray's white label isn't in the playlist or overrun crates.
- 5-6 Clocks: gear "arrives" with the clock frozen; Dana's "ten o'clock" at 8:40 AM; pier at SUN 1:40 AM vs "6 AM"; the stage clock reads 3:58 at 5:20 PM.
- 5-7 sound.Check: FOH is Mo in dialogue but "NADIA" in the game; "WALL B" vs "DISTRO 2"; monitor tests labelled "SPIN".
- 5-8 The Taula "which band did I cut?" test is sound-only and shows a "SLIDE FADERS" button on a mixer with no faders.
- 5-9 Wallet item stuck at $12,997 through two purchases; Eddie's $9 water gives no item.
- 5-10 Text: Roz's board vs her "typo" line; Kosmo's finale line answers nothing; Whit's line rendered "DJ NIGHTJAR: Whit: '…'" and "the sunrise slot" at 11:45 PM; tags "AIRRAY", "AIRMARCUS", "PRIYAT" (check whether game or harness); "tonight's tracks" on Thursday; Lou's repeated option; "Four decks of faults"; the end card's "knew every word" about an unreleased record.

Also open: on a room's first frame the animation time can be negative, so colour lookups in `act3/30_halcyon.js`,
`act3/31_booth.js` and `act4/10_studio.js` can come out undefined for one frame; beat.Match deck subtitles are cut off;
re-measure room speed on an idle machine (the sweep measured while videos were recording).

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

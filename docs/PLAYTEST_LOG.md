# Playtest log

Findings from blind playtests: fresh agents playing a level page with no knowledge of the solutions, through
`tools/blindplay.mjs`. Levels 1 and 2 have been played (two video takes each, plus one audio take). Levels 3 to 5 are
next (see `TODO.md`). "Run" names the take a finding came from.

## Open

| # | Where | Finding | Kind | Run |
|---|---|---|---|---|
| 2-19 | Money | Every subway trip costs 3 dollars and the ATM fee is 10, with no warning before a wasted trip. | design | L2 audio take |

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

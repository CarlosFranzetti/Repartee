# Game analysis: re:parteé against Maniac Mansion and Zak McKracken

Written 2026-11-03 from a read-through of every level's code, a log of every spoken line along each level's
walkthrough, and the blind-playtest reports in `PLAYTEST_LOG.md`. The goal the owner set: the whole game should make
sense, and feel and run like Maniac Mansion (1987) and Zak McKracken and the Alien Mindbenders (1988).

## What the reference games do (from memory; confidence noted)

- Verb-and-inventory play: most progress comes from using, giving and combining items, with jokes for wrong verbs.
  (High confidence.)
- Puzzle chains cross the map: an item from one place solves a problem somewhere else, often several steps later.
  Several goals are open at once, so a stuck player can work on something else. (High.)
- Zak's globe-trotting runs on plane tickets and a cash card with a limited balance, so money is a real constraint.
  (High.)
- Both have several playable characters (Maniac Mansion picks 3 of 6 kids; Zak switches between 4). (High.)
- Size and length: Maniac Mansion has roughly 50 screens and a first play of a few hours; Zak has more locations
  across several continents and a longer first play, perhaps 8 hours or more. (Low to medium confidence; check before
  quoting.)

## The game as it stands

| Level | Rooms | Required actions | Real inventory puzzles | Mini-games | Choice scenes | Goals open at once | First play (est.) |
|---|---|---|---|---|---|---|---|
| 1 Bedroom DJ | 11 | ~28 | ~10 (about 60% of the level) | 3 | 1 | 2-3 on Tuesday, then a corridor | 45-60 min |
| 2 Underground Hustler | 9 | ~22 | 7 | 4 | 1 | 2-3 early, a rail from Friday | 60-80 min |
| 3 Club DJ | 9 | ~30 | 5 | 3 | ~9 | 1, then 4 in the week, then 1 | 35-50 min |
| 4 Touring DJ | 10 | ~30 | 5 | 4 | 1 | 2-3 in the studio, then 1 | 45-60 min |
| 5 Superstar DJ | 10 | ~28 | 4 | 5 | 5 | 1-3 on Saturday | 60-75 min |

Estimates are the reviewers' judgement; blind testers took about 38 minutes on Level 1 and 55 on Level 2.

**Length is about right.** The five levels add up to roughly 4 to 5.5 hours for a first play, which is in the range of
Maniac Mansion. The game doesn't need more rooms; it needs denser, better-connected puzzles in the rooms it has.

**The feel drifts away from the references as the game goes on.** Level 1 is the closest: a real verb game with combos
(the vodka swab), in-world clues (the Synergex break room) and every result feeding the finale. From Level 2 on, more
of each level is talk, walk, mini-games and menu choices, and by Level 5 only about a quarter is inventory puzzling.

## Game-wide problems

1. **Corridors.** After an open opening, most levels run one goal at a time. The references always let you work on
   something else.
2. **Choice scenes as puzzles.** The scenes that replaced retired mini-games are menu-picking where wrong answers just
   replay a line (Level 3's promo, estate sort, Brandon and turnstile; Level 5's guest list, Axl, overrun).
3. **Money never matters.** Level 4 starts with $600 against $83 of costs; Level 5 tops your advance up to $10,000.
4. **Dead items and dead props:** Level 4's claim tag, boarding pass and wristband; Level 5's tickets; Level 3's office
   safe, cabinet and vent.
5. **Hints spoon-feed.** Level 2 states each requirement four times and the hint line names the next step.
6. **Threads that drop or appear from nowhere:**
   - Dani, "the bartender who danced" in Level 2, isn't in Level 1 (the dancing bartenders there are Mia and Rafa).
   - Level 1's stolen-USB chain pays off only in narration; the laptop's set choice changes nothing.
   - Jess's amp is never returned; the Staffright shift never resolves; the rent date and Vic's crowd size disagree.
   - Brandon steals your USB in Level 3 with no setup, and Twinkie's warning can't be acted on.
   - Level 3's platform says you have no cash right after a $200 payday.
   - Ingrid's email has no setup; nothing shows you wanting to leave for Berlin; Level 4 never mentions the grail.
   - Katja's "play something unknown" hint in Berlin has no payoff (the white label isn't in the crate).
   - Axl being in Berlin, and Kosmo on your flight, go unexplained.
   - Kosmo is absent from Level 5 until the set, so his reveal comes from nowhere.
   - The radio's "Axl who?" answer has no consequence, and the interview never shows a bad result.
   - Biscuit, the lost cat from Level 1, is never found.
   - The Level 5 pier ending is a talk-to-everyone checklist.

## What already works (keep it)

The napkin to-do list in Level 3; Gus and his snacks; the bartenders' lemon feud; the two-key camera gag; the JFK
sign-off hunt (Form 7B, Bernadette, Delgado, Nugget, the bag on Kosmo's seat); Axl's postcard turning into the "MY ALEX"
banner; Dante pinned on air and finally paying; Lou's "NYC 93" from the pipe hole to the main stage; Gerald the plant;
the dry humour throughout.

## Plan

**Phase 1: make it make sense (small fixes, every level).** Close every thread in the list above that a line, a seed
or a payoff can fix: Dani in Level 1, the USB set choice mattering, Jess's amp, Staffright, rent and crowd numbers,
Brandon seeded, Level 3's cash, Ingrid seeded, a reason to leave, the grail and white label in Level 4, the dead items,
Kosmo seen before his reveal, the radio consequence, Biscuit found, a tighter ending. Hints become less explicit.

**Phase 2: make it play like Maniac Mansion and Zak (medium changes).** Turn thin scenes into real puzzles and open the
corridors:
- Level 2: an open Tuesday-to-Thursday with two or three optional goals (Toby's bathroom, the fire escape back into
  4C, Kowalski's office hour) instead of "sleep to Friday".
- Level 3: the USB swap becomes a puzzle you can foil on Twinkie's tip; the estate becomes a puzzle with Bernard the
  parakeet and Priya's rival bid.
- Level 4: a second thread running alongside the bag hunt; money that constrains.
- Level 5: Saturday in any order (the pass, the smoothie, Axl), with a clue chain to the pass; money that constrains.

**Phase 3: check it.** A fresh blind playtest of each level, and the length per level measured again.

**Open questions for the owner:** whether money may run short enough to force a detour (never a dead end), and
whether to add a second playable character anywhere (both references have several; this game has one).

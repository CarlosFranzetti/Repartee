# re:parteé — Story bible

**Tagline:** From broke-ass bedroom DJ to festival headliner. One bad decision at a time.

A humorous, sometimes gritty point-and-click adventure in the style of Maniac Mansion, Zak
McKracken and The Secret of Monkey Island. You play a broke, party-loving bedroom DJ in New York
City (the player picks a DJ name, `S.name`) who wants to become a world-famous superstar DJ.
Tone: funny, gritty, irreverent, nostalgic, distinctly NYC. Dark humor about surviving the city,
never mean-spirited toward real people.

## Rules every author follows

1. **Real music, real facts.** Records come from `RP.data.records` (verified real releases). Gear
   comes from `RP.data.gear`. Facts about real labels, venues and DJs come only from
   `RP.data.lore` or a record's `fact`. Never invent a release, a year, a chart position, a quote,
   or a story about a real person.
2. **Real DJs are cameos, not characters.** Only DJs with `cameoOk: true` in `RP.data.lore.djs`
   may appear on screen. Keep them brief, kind and generic ("Nice blend." / a nod / they're
   playing in the booth, digging in a bin, on a festival bill). No invented biography, no
   negative traits, no jokes at their expense, no romantic or drug content involving them, no
   claims about where they "always" go or what they "always" say. Deceased legends (Larry Levan,
   Frankie Knuckles, David Mancuso) are referenced respectfully in dialogue only, using lore facts.
   All the archetypes below (the ego superstar, the promoter who never pays, the shady seller...)
   are FICTIONAL characters.
3. **Venues where gameplay happens are fictional** (Nowhere, Deep Cuts, the Halcyon Room, Harbor
   Lights Festival...). Real historic venues (Paradise Garage, The Loft, Sound Factory, Shelter,
   Body & Soul) may be mentioned in dialogue with lore facts only.
4. **The hustle is comedy.** The survival missions are absurd, not glamorized: the "drug deal" is
   a bag of oregano; the hookup is for a shower and fades to black on a joke; plasma donation is
   played for awkward laughs. No graphic content, nothing involving minors, no slurs.
5. **No dead ends.** The player can never lose an item they still need or get stuck. Every puzzle
   has hints in dialogue. Time advances only on story beats.
6. **Every hotspot answers Look**, and the important ones have custom lines for wrong verbs.
   Wrong-verb humor is half the game.
7. **Puzzles make sense in NYC.** Fare costs money ($3 game fare), bodegas sell everything, the
   landlord never fixes anything, everyone is on their phone, promoters say "next week."

## The kid

Broke bedroom DJ living in apartment 4C in a Bushwick walk-up. Messy brown hair, black tee with a
smiley print, jeans, white sneakers (wardrobe evolves per act: headphones round the neck in act 2,
a jacket in act 3, a tour bomber in act 4, a stage outfit in act 5). Earnest, sarcastic, a little
self-destructive, genuinely loves records.

## Recurring cast (fictional, defined in `src/data/cast.js`)

| id | who | running gag |
|---|---|---|
| `lou` | Lou, the neighbor in 4B. Big, bald, cardigan. Went out "every Saturday, 1993." | Talks through the pipe hole. Gave you the white label "NYC 93" — it's his own unreleased track from 1993. |
| `dante` | Dante, promoter of Nowhere | "I'll pay you next week." Finally pays in act 5 (in a ridiculous currency). |
| `ray` | Ray, owner of Deep Cuts records | The record-store owner who knows everything. Gives you hints disguised as insults. |
| `marcus` | Marcus, your best friend | Always wants to be on the guest list, "plus three." |
| `kosmo` | Kosmo Delacroix, legendary DJ | Never remembers your name (calls you a different wrong name each act, eventually your real one in act 5). |
| `eddie` | Eddie Two-Times, gear seller with a van | Every deal is "a two-time deal." Sells working gear and broken gear side by side. |
| `twinkie` | Twinkie, after-hours regular | Knows everyone, remembers everything, never sleeps. Knows where the afters are. |
| `axl` | Axl Vanta, EDM superstar | Enormous ego. Rival in acts 4–5. |
| `jess` | Jess, your ex | Wants the USB with 4,000 photos of her cat, Mr. Whiskers. |

## Gear progression (real models, ids from `RP.data.gear`)

| act | decks | turntables | mixer | monitors |
|---|---|---|---|---|
| 1 | `pioneer_cdj_350` (entry-level, used) | — | `numark_m101usb` (crappy 2-channel) | `krk_rokit_5_g4` (yellow cones) |
| 2 | same | first pair: `at_lp120_usb` (bought from Eddie) | same | same |
| 3 | `pioneer_cdj_900` (used, from first paycheck) | `technics_sl_1210mk2` (from the estate collection) | `pioneer_djm_350` | `dynaudio_bm5_mkiii` |
| 4 | clubs abroad have `pioneer_cdj_3000` | `technics_sl_1210mk7` | — | — |
| 5 | `pioneer_cdj_3000` (your own) | `technics_sl_1210mk7` | **`can_electric_taula_4_mr`** — the hand-wired Barcelona rotary mixer | `dynaudio_core_47` |

## Level 1 — BEDROOM DJ (act1, owner: act 1 author)

Goal: **play your first gig at Nowhere.** Tuesday night → Wednesday → Saturday.
The bedroom (`bedroom`) is already built (`src/acts/act1/10_bedroom.js`) and covers threads
HOOK, MIXER, NEIGHBOR and the audition (beat.Match) and sleeping on the warped record.

Puzzle chart (canonical):

- **HOOK** A1 charge the dead phone (charger under the bed) → texts: Dante wants you to call and
  play him something; temp agency shift tomorrow at Synergex, Midtown.
- **MONEY** F1 $5 stuck to the pizza + bag of cans → F2 bodega can-deposit machine pays $2.40
  ($7.40 total, not enough) → F3 Smitty on the stoop asks you to drop a bag at Sal's Pizza, "no
  peeking." Peek: it's oregano. Sal pays $20 and a slice. (The "sell drugs" gag.)
- **RECORDS** B1 milk crate (Missing, Acid Tracks (warped), Mom's Winelight) → B2 sleep on Acid
  Tracks to flatten it (Tue → Wed) → B3 go.Digging at Deep Cuts: Ray points you at the dollar
  bins; the closer is CeCe Peniston "Finally" (`cece_peniston_finally`, $2 in the dollar bin) — or
  the player can choose another affordable closer. Ray gives you a Nowhere flyer with your name
  misspelled ("DJ What's-His-Name" or a mangled `S.name`).
- **MIXER** C1 channel 2 crackles → C2 desk drawer: cotton swabs + 100-proof vodka → C3 vodka swab cleans it.
- **NEIGHBOR** D1 Lou bangs on the wall → D2 talk through the pipe hole → D3 give Mom's Winelight;
  Lou gives you the white label "NYC 93".
- **AUDITION** A2 call Dante, beat.Match over the phone → booked: Saturday 10 PM opener; first hour
  vinyl, then tracks on a USB.
- **USB** E1 your only USB holds 4,000 photos of your ex's cat → E2 subway to Midtown (needs fare) →
  E3 Brenda guards the supply closet, wants a requisition form that has never existed → E4 burnt
  popcorn in the break-room microwave (press Popcorn twice) evacuates the floor → take a USB 3-pack.
  (The "swipe USB drives from temp office jobs" mission.)
- **CONVERGENCE** R1 back home, load tracks onto the new USB (laptop) → sleep until Saturday →
  A3 Nowhere door: Tank isn't letting you in (not on the list); show the flyer ("could be anybody"),
  then give Tank the slice → A4 crowd.Read: the vinyl hour with your four records (Missing, Acid
  Tracks, NYC 93, the closer), get the bartenders dancing → Dante: "Great set. I'll pay you next week."
  → `RP.completeAct`.

Rooms to build (ids): `a1_hall` (hallway/stairs, Lou's door 4B), `a1_stoop` (Smitty, street,
bodega entrance, subway stairs), `a1_bodega` (can machine, bodega cat, counter guy), `a1_sals`
(Sal's Pizza), `a1_subway` (platform, fare), `a1_synergex` (temp office: Brenda's desk, supply
closet, break room microwave — can be two rooms), `a1_deepcuts` (record store, Ray, bins),
`a1_nowhere_door` (Tank), `a1_nowhere` (club interior, booth with turntables, bartenders).
Hooks already present in the bedroom file: `RP.act1DoorExit(S)` (return the exit target for the
bedroom door), `RP.act1LaptopUse(S)`, `RP.act1BedUse(S)` (return non-false to override), and
`RP.act1BeforeSleep(S)`. Existing bedroom flags are listed at the top of that file.

## Level 2 — UNDERGROUND HUSTLER (act2)

Two weeks later. Dante still hasn't paid. Rent is due Friday and the landlord changed the lock on
4C ("temporary"). You're crashing on Marcus's couch in Bed-Stuy. Goal: **land a monthly slot at
"Basement Tapes," the warehouse party run by promoter Vic** (fictional), and buy your first pair
of turntables.

Survival missions to include (spec): find somewhere to crash; hook up with someone just to use
their shower (comedy, fade to black on a joke); sell plasma to afford equipment (the plasma center
pays in a prepaid card); sneak into a party; talk your way onto a guest list; convince a promoter;
borrow equipment you can't afford; Jess wants the cat USB back.

Threads (suggested — author refines):
- Crash & shower: Marcus's couch (his roommate hogs the bathroom) → a date with someone from the
  party scene for the shower → fresh enough for meetings.
- Money: plasma center (awkward paperwork comedy, needle-phobic kid, cookie and juice afterward)
  → $ for turntables.
- **buy.Gear**: Eddie Two-Times' van — pick the working pair (Audio-Technica AT-LP120-USB) and
  avoid the broken "bargain"; haggle.
- **guest.List**: Marcus's birthday house party — you're DJing, everyone wants on the list.
- **sound.Check**: the Bushwick loft party where the PA is broken — fix it before your set.
- **promoter.Talk**: convince Vic to give you the monthly without sounding desperate.
- **after.Party**: Twinkie knows a spot; get enough people, a location and a sound system.
- Lou mystery step: Lou admits "NYC 93" is his own track, recorded in 1993, never released.
- Cameo option: a real DJ (cameoOk) heard on the radio or seen on a flyer for a real long-running
  event from `RP.data.lore.events` (only as stated there).
Ends with the first Basement Tapes slot booked and turntables in the room. → act 3.

## Level 3 — CLUB DJ (act3)

Six months later. You have a Thursday residency at **the Halcyon Room** (fictional club in the
Lower East Side). Goal: **turn Thursday into Saturday** — earn the prime-time slot, build a
following, and develop your own sound.

Threads (suggested):
- **set.Time**: opening an empty floor (patience, low energy), then the night you have to follow
  Kosmo Delacroix (he doesn't remember your name).
- **playlist.Order**: build a set for the residency anniversary night.
- **club.Drama**: rival resident "DJ Brandon Shine" (fictional) sabotages your USB / takes your
  slot; a bartender feud; a sound guy who only responds to snacks.
- **record.Hunt**: Ray mentions a grail (pick a `rare` record from the catalog, e.g. Loose Joints
  "Is It All Over My Face" or Dinosaur L "Go Bang!"); track it across NYC via clues (flea market,
  a record fair, a collector).
- **crate.Digging**: buy a dead collector's whole collection from a Queens estate sale, sort the
  junk from the gems; the estate includes a pair of Technics SL-1210MK2s.
- **last.Train**: get home after a gig with your records, no money, and a dying phone.
- **get.Followers**: spend time promoting vs. practicing.
- Gear: CDJ-900s (first paycheck from Eddie), Dynaudio BM5 mkIII monitors, Technics 1210MK2s.
- Cameo option: a real DJ (cameoOk) digging at the record fair or playing a guest set at the club —
  you open for them. Respectful, brief.
Ends with the Saturday slot and an email from a booking agent in Europe. → act 4.

## Level 4 — TOURING DJ (act4)

Goal: **release a track and survive your first European tour.**
- **mak.Tracks**: remix Lou's "NYC 93" with Lou in your bedroom studio (Lou finally hears it on
  speakers again; emotional beat played straight, then undercut with a joke). Release it on your
  own tiny label ("Pipe Hole Records").
- **get.Followers**: the release blows up a little.
- **promoter.Talk** (booking negotiation): fee, flights, hotel, rider — don't get lowballed by
  "exposure."
- JFK airport: lost luggage — your record bag! — recover it before the flight (airport rooms).
- Berlin: a fictional warehouse club ("Halle Neun"); strict door; CDJ-3000s; **beat.Match** at
  higher difficulty; **crowd.Read** with a techno crowd (use techno/minimal records).
- **last.Train** variant: missed connection; get to the gig on time.
- Ego superstar Axl Vanta appears (shares a festival poster / steals your hotel room).
- Cameo option: a real Detroit/techno DJ (cameoOk) in the booth before you, a nod, "Nice record."
Ends with a festival offer: headline the Harbor Lights Festival back in NYC. → act 5.

## Level 5 — SUPERSTAR DJ (act5)

Goal: **headline Harbor Lights Festival** (fictional, on the waterfront).
- Buy the endgame setup: the **Can Electric Taula 4 MR** rotary mixer (hand-wired in Barcelona),
  Technics SL-1210MK7s, Dynaudio Core 47s — via **buy.Gear** at the end-game level.
- Manage your career: manager calls, interviews, guest list chaos (Marcus "plus thirty").
- **club.Drama**: Axl Vanta tries to bump your slot.
- **sound.Check** on the main stage.
- **set.Time**: Axl runs over his set time; handle it.
- The headline set: **playlist.Order** → **crowd.Read** → **beat.Match** finale; Lou comes on stage
  for "NYC 93"; Kosmo finally says your name right; Dante pays you (in drink tickets).
- Real DJ cameos (cameoOk) on the festival bill and backstage nods.
- Ends with `RP.completeAct` (no act 6) → credits (`RP.ending`).

## Tone samples (keep this voice)

- "I don't own turntables. I own records. It's a whole thing."
- Lou: "I KNOW what it's called. I used to go out, kid. Every Saturday, 1993."
- Dante: "No CDs, no laptop, don't be late. I'll pay you next week."
- Ray: "The dollar bins. Where dreams go to get cheaper."

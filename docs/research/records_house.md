# Research notes: house / garage / disco / acid catalog

Data file: `src/data/records_house.js` (54 records).

## How this was verified (read first)

- Artist, title, label and year were checked against Discogs release/master pages and Wikipedia song/album pages, using web search results restricted to `discogs.com` and `wikipedia.org`.
- `WebFetch` could not reach any host in this environment (DNS error), so no page was opened directly. Every claim comes from what the search results reported about those pages. The source URL in each row is the page the search surfaced for that record.
- The shared web-search budget ran out before the whole target list could be checked. The catalog therefore has 54 records, not about 70, and nothing was added unverified to pad the count (see "Not covered" below).
- **BPM:** no BPM site was consulted. Every `bpm` is an estimate from genre and era, and every `bpmEst` is `true`. (Wikipedia's Acid Tracks article says Marshall Jefferson slowed the track from about 130 to 120 bpm, so 120 is consistent with it, but it is still flagged as an estimate.)
- **energy, rarity, price, vibe, pick** are game-design judgments, not claims about real records or real market prices. No record was graded `grail`.
- **city** is the scene or label base. Where a source named it (for example Strictly Rhythm, Nervous and King Street Sounds as New York labels; Trax and Cajual as Chicago; Strafe as Brooklyn; D Train as a New York duo) it comes from the source. Otherwise it is general knowledge, and where I was not sure I used a country (`USA`, `Italy`, `Germany`) instead of a city.
- **format** is `12"` where a search result described a 12-inch pressing. Inferred rather than stated in the retrieved text: Crystal Waters "Gypsy Woman" (12" formats were listed on a Wikipedia-derived page), and the two Mood II Swing King Street Sounds records (catalogue-numbered King Street releases; the 12" format was not stated in the text I saw). The Cheryl Lynn entry is deliberately the `LP` (Columbia, October 1978), because I could not confirm a 12" single of "Got to Be Real".

## Catalog

| id | Artist - Title | Label | Year | Source |
|---|---|---|---|---|
| chic_good_times | Chic - Good Times | Atlantic Records | 1979 | https://en.wikipedia.org/wiki/Good_Times_(Chic_song) |
| sylvester_you_make_me_feel_mighty_real | Sylvester - You Make Me Feel (Mighty Real) | Fantasy Records | 1978 | https://en.wikipedia.org/wiki/You_Make_Me_Feel_(Mighty_Real) |
| loleatta_holloway_love_sensation | Loleatta Holloway - Love Sensation | Gold Mind Records | 1980 | https://en.wikipedia.org/wiki/Love_Sensation (Discogs GG 505 promo listing also seen) |
| gwen_guthrie_padlock | Gwen Guthrie - Padlock (Special Mix By Larry Levan) | Garage Records | 1983 | https://www.discogs.com/release/222708-Gwen-Guthrie-Padlock-Special-Mix-By-Larry-Levan (Discogs master page says Levan played versions at the Paradise Garage) |
| peech_boys_dont_make_me_wait | Peech Boys - Don't Make Me Wait | West End Records | 1982 | https://en.wikipedia.org/wiki/Don't_Make_Me_Wait_(Peech_Boys_song) |
| taana_gardner_heartbeat | Taana Gardner - Heartbeat | West End Records | 1981 | https://en.wikipedia.org/wiki/Heartbeat_(Taana_Gardner_song) |
| loose_joints_is_it_all_over_my_face | Loose Joints - Is It All Over My Face? | West End Records | 1980 | https://www.discogs.com/release/235302-Loose-Joints-Is-It-All-Over-My-Face |
| class_action_weekend | Class Action featuring Chris Wiltshire - Weekend | Sleeping Bag Records | 1983 | https://en.wikipedia.org/wiki/Class_Action_(band) (Discogs listing shows Sleeping Bag SLX-1 with a Levan credit on B1) |
| double_exposure_ten_percent | Double Exposure - Ten Percent | Salsoul Records | 1976 | https://en.wikipedia.org/wiki/Ten_Percent_(song) |
| d_train_youre_the_one_for_me | D Train - You're the One for Me | Prelude Records | 1981 | https://en.wikipedia.org/wiki/You're_the_One_for_Me_(D_Train_song) |
| sharon_redd_can_you_handle_it | Sharon Redd - Can You Handle It | Prelude Records | 1981 | https://www.discogs.com/master/118201-Sharon-Redd-Can-You-Handle-It |
| dinosaur_l_go_bang | Dinosaur L - Go Bang! #5 / Clean On Your Bean #1 | Sleeping Bag Records | 1982 | https://www.discogs.com/release/19135-Dinosaur-L-Go-Bang-5-Clean-On-Your-Bean-1 |
| donna_summer_i_feel_love | Donna Summer - I Feel Love | Casablanca Records | 1977 | https://en.wikipedia.org/wiki/I_Feel_Love |
| strafe_set_it_off | Strafe - Set It Off | Jus-Born Records | 1984 | https://www.discogs.com/release/19828-Strafe-Set-It-Off |
| garys_gang_keep_on_dancin | Gary's Gang - Keep On Dancin' | CBS | 1979 | https://en.wikipedia.org/wiki/Keep_On_Dancin'_(Gary's_Gang_song) |
| cheryl_lynn_cheryl_lynn | Cheryl Lynn - Cheryl Lynn (LP, incl. Got to Be Real) | Columbia | 1978 | https://en.wikipedia.org/wiki/Cheryl_Lynn_(album) |
| masters_at_work_blood_vibes_the_ha_dance | Masters At Work - Blood Vibes / The Ha Dance | Cutting Records | 1991 | https://www.discogs.com/release/24943-Masters-At-Work-Blood-Vibes |
| hardrive_deep_inside | Hardrive - Deep Inside | Strictly Rhythm | 1993 | https://www.discogs.com/release/20174-Hardrive-Deep-Inside |
| bucketheads_the_bomb | Kenny 'Dope' Presents The Bucketheads - The Bomb! (These Sounds Fall Into My Mind) | Henry Street Music | 1995 | https://en.wikipedia.org/wiki/The_Bomb!_(These_Sounds_Fall_into_My_Mind) |
| maw_feat_india_to_be_in_love | MAW feat. India - To Be In Love (MAW 99 Mix) | MAW Records | 1999 | https://www.discogs.com/release/3006-MAW-Feat-India-To-Be-In-Love-1999-Remixes |
| nuyorican_soul_runaway | Nuyorican Soul - Runaway | Talkin' Loud | 1997 | https://www.discogs.com/release/805904-Nuyorican-Soul-Runaway |
| kerri_chandler_atmosphere_ep_vol_1 | Kerri Chandler - Atmosphere E.P. Vol. 1 | Shelter Records | 1993 | https://www.discogs.com/release/7345-Kerri-Chandler-Atmosphere-EP-Vol-1 |
| kerri_chandler_the_mood_ep | Kerri Chandler - The Mood EP (incl. Rain) | Nervous Records | 1998 | https://www.discogs.com/Kerri-Chandler-The-Mood-EP/release/129204 |
| todd_terry_project_weekend | The Todd Terry Project - Weekend / Just Wanna Dance | Sleeping Bag Records | 1988 | https://www.discogs.com/The-Todd-Terry-Project-Weekend-Just-Wanna-Dance/release/50496 |
| royal_house_can_you_party | Royal House - Can You Party | Idlers Records | 1988 | https://www.discogs.com/master/20545-Royal-House-Can-You-Party |
| black_riot_a_day_in_the_life | Black Riot - A Day In The Life | Fourth Floor Records | 1988 | https://www.discogs.com/release/8843-Black-Riot-A-Day-In-The-Life |
| barbara_tucker_beautiful_people | Barbara Tucker - Beautiful People | Strictly Rhythm | 1994 | https://en.wikipedia.org/wiki/Beautiful_People_(Barbara_Tucker_song) |
| reel_2_real_i_like_to_move_it | Reel 2 Real featuring The Mad Stuntman - I Like To Move It | Strictly Rhythm | 1993 | https://www.discogs.com/master/75615-Reel-2-Real-Featuring-The-Mad-Stuntman-I-Like-To-Move-It |
| ultra_nate_free | Ultra Nate - Free | Strictly Rhythm | 1997 | https://www.discogs.com/release/24696-Ultra-Nat%C3%A9-Free |
| roger_sanchez_another_chance | Roger Sanchez - Another Chance | Defected | 2001 | https://en.wikipedia.org/wiki/Another_Chance_(Roger_Sanchez_song) |
| armand_van_helden_you_dont_know_me | Armand Van Helden featuring Duane Harden - You Don't Know Me | ffrr | 1999 | https://discogs.com/Armand-Van-Helden-Featuring-Duane-Harden-You-Dont-Know-Me/release/11697 |
| david_morales_presents_the_face_needin_u | David Morales presents The Face - Needin' U | Manifesto | 1998 | https://en.wikipedia.org/wiki/Needin'_U |
| mood_ii_swing_closer | Mood II Swing featuring Carole Sylvan - Closer | King Street Sounds | 1994 | https://www.discogs.com/release/27325-Mood-II-Swing-Feat-Carol-Sylvan-Closer |
| everything_but_the_girl_missing | Everything But The Girl - Missing (Todd Terry Remix) | Atlantic Records | 1995 | https://en.wikipedia.org/wiki/Missing_(Everything_but_the_Girl_song) |
| francois_k_fk_ep | Francois K - FK-EP | Wave Music | 1995 | https://www.discogs.com/master/35023-Fran%C3%A7ois-K-FK-EP |
| phuture_acid_tracks | Phuture - Acid Tracks | Trax Records | 1987 | https://www.discogs.com/release/1949-Phuture-Acid-Tracks (Wikipedia: https://en.wikipedia.org/wiki/Acid_Tracks) |
| mr_fingers_washing_machine_can_you_feel_it | Mr. Fingers - Washing Machine / Can You Feel It | Trax Records | 1986 | https://www.discogs.com/release/1948-Mr-Fingers-Washing-Machine-Can-You-Feel-It |
| marshall_jefferson_move_your_body | Marshall Jefferson - Move Your Body (The House Music Anthem) | Trax Records | 1986 | https://en.wikipedia.org/wiki/Move_Your_Body_(Marshall_Jefferson_song) |
| adonis_no_way_back | Adonis - No Way Back | Trax Records | 1986 | https://www.discogs.com/master/6738-Adonis-No-Way-Back |
| farley_jackmaster_funk_love_cant_turn_around | Farley 'Jackmaster' Funk & Jesse Saunders featuring Darryl Pandy - Love Can't Turn Around | D.J. International | 1986 | https://en.wikipedia.org/wiki/Love_Can't_Turn_Around |
| steve_silk_hurley_jack_your_body | Steve 'Silk' Hurley - Jack Your Body | Underground | 1986 | https://en.wikipedia.org/wiki/Jack_Your_Body |
| chip_e_like_this | Chip E. - Like This | D.J. International | 1985 | https://www.discogs.com/release/1246592-Chip-E-Like-This |
| cajmere_percolator | Cajmere - Percolator | Cajual Records | 1992 | https://www.discogs.com/release/36634-Cajmere-Percolator |
| frankie_knuckles_your_love | Frankie Knuckles Presents Jamie Principle - Your Love / Baby Wants To Ride | Trax Records | 1987 | https://en.wikipedia.org/wiki/Your_Love_(Jamie_Principle_song) |
| frankie_knuckles_the_whistle_song | Frankie Knuckles - The Whistle Song | Virgin Records | 1991 | https://www.discogs.com/release/35622-Frankie-Knuckles-The-Whistle-Song |
| frankie_knuckles_presents_satoshi_tomiie_tears | Frankie Knuckles Presents Satoshi Tomiie featuring Robert Owens - Tears | FFRR | 1989 | https://www.discogs.com/master/61791-Frankie-Knuckles-Presents-Satoshi-Tomiie-Tears |
| mood_ii_swing_magical_life | Mood II Swing featuring Lauren - Magical Life | King Street Sounds | 2005 | https://www.discogs.com/release/560919-Mood-II-Swing-Feat-Lauren-Magical-Life |
| crystal_waters_gypsy_woman | Crystal Waters - Gypsy Woman (She's Homeless) | Mercury Records | 1991 | https://en.wikipedia.org/wiki/Gypsy_Woman_(Crystal_Waters_song) |
| robin_s_show_me_love | Robin S - Show Me Love (StoneBridge Mix) | Big Beat | 1992 | https://en.wikipedia.org/wiki/Show_Me_Love_(Robin_S._song) |
| cece_peniston_finally | CeCe Peniston - Finally | A&M Records | 1991 | https://en.wikipedia.org/wiki/Finally_(CeCe_Peniston_song) |
| black_box_ride_on_time | Black Box - Ride On Time | Groove Groove Melody | 1989 | https://www.discogs.com/release/107710-Black-Box-Ride-On-Time |
| snap_rhythm_is_a_dancer | Snap! - Rhythm Is A Dancer | Logic Records | 1992 | https://en.wikipedia.org/wiki/Rhythm_Is_a_Dancer |
| cc_music_factory_gonna_make_you_sweat | C+C Music Factory - Gonna Make You Sweat (Everybody Dance Now) | Columbia | 1990 | https://en.wikipedia.org/wiki/Gonna_Make_You_Sweat_(Everybody_Dance_Now) |
| inner_city_good_life | Inner City - Good Life | 10 Records | 1988 | https://en.wikipedia.org/wiki/Good_Life_(Inner_City_song) |

## Required entries

- Phuture "Acid Tracks" (Trax, 1987): `phuture_acid_tracks`
- Crystal Waters "Gypsy Woman (She's Homeless)": `crystal_waters_gypsy_woman`
- Robin S "Show Me Love": `robin_s_show_me_love`
- Masters At Work-related: `masters_at_work_blood_vibes_the_ha_dance`, `maw_feat_india_to_be_in_love`, `nuyorican_soul_runaway` (a project by MAW), `hardrive_deep_inside` (Louie Vega credited as producer), `bucketheads_the_bomb` (Kenny 'Dope' Gonzalez), plus the Gonzalez/Vega mixes on `barbara_tucker_beautiful_people`
- Kerri Chandler: `kerri_chandler_atmosphere_ep_vol_1`, `kerri_chandler_the_mood_ep`
- Larry Levan-associated, each with a source stating the credit: `gwen_guthrie_padlock` (special mix by Levan), `peech_boys_dont_make_me_wait` (produced by Levan), `taana_gardner_heartbeat` (club version mixed by Levan), `loose_joints_is_it_all_over_my_face` (Levan remix), `class_action_weekend` (Levan credit on the Sleeping Bag 12")
- Frankie Knuckles: `frankie_knuckles_your_love`, `frankie_knuckles_the_whistle_song`, `frankie_knuckles_presents_satoshi_tomiie_tears`

## Game picks

- `warped`: phuture_acid_tracks
- `first_record`: everything_but_the_girl_missing (Todd Terry remix, common, warm-up energy 3)
- `dollar_bin_closer`: cece_peniston_finally (A&M, 1991, common, price 2)
- `act1_set` (2): barbara_tucker_beautiful_people (builder, energy 4) and robin_s_show_me_love (peak, energy 5)
- Intended four-record opening set: Missing (warm, 3) -> Beautiful People (build, 4) -> Show Me Love (peak, 5) -> Finally (close, 4). The warped Acid Tracks sits outside that set, since the story has the kid's copy unplayable.

## Discrepancies and judgment calls worth knowing

- **Robin S "Show Me Love" year:** Discogs dates the US Big Beat StoneBridge promo 12" (DMD 1962) to 1992 and a later Big Beat 12" (0-10110) to 1993. Wikipedia dates the StoneBridge remix to 1992 in one place and 1993 in another. I used 1992. The original (Champion Records, UK, 1990) is a different release.
- **The Bucketheads "The Bomb!":** Wikipedia gives February 1995; one Discogs US 12" (Henry Street HS 166) is dated 1994. I used 1995.
- **Kerri Chandler "Atmosphere":** The search results gave Shelter Records (SHL-1004, 1993, with a 1994 repress). One page listing Madhouse releases also named the Atmosphere E.P. Vol. 1 under Madhouse, so the Shelter/Madhouse relationship is not fully settled. I used Shelter, as the Discogs entry does.
- **Kerri Chandler "Rain":** It is on The Mood EP (Nervous NE 20316, listed as 1998), not on Madhouse. A separate "Rain (The New Mixes)" 12" (Nervous NE 20434) is dated 2000.
- **Taana Gardner "Heartbeat":** Discogs release pages and Wikipedia say 1981; one Discogs artist biography says 1980. I used 1981.
- **Class Action "Weekend":** Wikipedia says the 1983 version was remixed by Morales and Munzibai and by Levan; the Discogs notes credit Levan only on B1. The fact line only says a Levan mix is credited. The label is Sleeping Bag, not Sam.
- **Royal House "Can You Party":** Idlers/Warlock label relationship is described inconsistently on Discogs. I used Idlers Records (US WAR 021) and the 1988 date.
- **Black Box "Ride On Time":** One Discogs commenter argues an Out Records pressing is a later bootleg and that Groove Groove Melody is the original. I followed the GGM 8901 listing.
- **Tears:** Every pressing returned was on FFRR, dated 1989. I did not see a Trax pressing in the results. If a different original label exists, it was not surfaced.
- **Ultra Nate "Free":** several 1997 US Strictly Rhythm 12" mix packages exist (for example SR 12513 and SR 12528). The source URL is one Discogs "Free" release page; the specific catalogue number was not tied to that URL in the results.
- **Padlock:** The Garage Records PRO-21 12" is dated 1983 on Discogs; the same Discogs listings also show a 1985 test pressing.
- **Cities and BPM:** see "How this was verified" above.

## Excluded / unverified

Considered and left out because the search showed a conflict or I could not confirm the facts needed:

- First Choice "Let No Man Put Asunder" (Salsoul): the results showed Shep Pettibone, Walter Gibbons and Frankie Knuckles mixes but no Larry Levan remix, so no Levan link was claimed and the record was not added.
- Inner Life "I'm Caught Up (In a One Night Love Affair)": results pointed to Prelude (1979) and an earlier TCT Records issue, but a 12" single was not confirmed.
- Wamdue Project "King of My Castle" (Strictly Rhythm): Wikipedia gives a May 1997 US release, Discogs 12" pressings are dated 1998 or 1999. Not added.
- Blaze "Lovelee Dae": the results showed several labels and years (a 1996 Trans-Jazz EP, a 1997 Classic UK 12", a 1998 True 12", a 2024 Slip 'n' Slide remix EP). No single original was confirmed.
- Todd Terry Project "Bango (To The Batmobile)": label chain disagreed between Fresh and Sleeping Bag listings.
- Nu Groove Records: the label (New York, founded 1988 by Frank and Karen Mendez, acquired by Defected in 2017) was confirmed, and RA/Discogs name Bas Noir "My Love Is Magic", Aphrodisiac "Your Love" and Dynamic Duo "We're Back" as key releases. No release year was verified for any of them, so none were added.
- Emotive Records: a search returned nothing on an Emotive release, so nothing was added.
- Nuyorican Soul "Runaway": Wikipedia lists a 1996 single; Discogs dates the 12" (Talkin' Loud TLX 20) to 1997. I used 1997 for the 12".

Considered but never checked, because the shared web-search budget ran out. No label, year or fact has been written for any of these:

- Lil Louis "French Kiss"; Deee-Lite "Groove Is in the Heart"; Ten City "That's the Way Love Is"; Fast Eddie "Yo Yo Get Funky"; Tyree Cooper "Turn Up the Bass"; Jungle Brothers "I'll House You"; Technotronic "Pump Up the Jam"; Livin' Joy "Dreamer"; M People "Moving On Up"; Haddaway "What Is Love".
- Deep house / modern-classic 2005-2020 (only "Magical Life" made it in): DJ Sprinkles "Midtown 120 Blues", Hercules & Love Affair "Blind", Peggy Gou "It Makes You Forget (Itgehane)", DJ Koze "Pick Up", Dennis Ferrer "Son of Raw", Moodymann.
- Further NYC/NJ and Chicago candidates: Armand Van Helden "Witch Doctor", Armando "151", Ce Ce Rogers "Someday", Ralphi Rosario "You Used To Hold Me", Jocelyn Brown "Somebody Else's Guy".

## Coverage against the brief

| Brief | Wanted | Delivered |
|---|---|---|
| Disco / proto-house / Loft & Garage | ~15 | 16 |
| NYC & NJ house / garage 1987-2005 | ~22 | 19 (Nu Groove, Emotive and Shelter-adjacent depth is thin) |
| Chicago house & acid | ~12 | 11 |
| Deep house / modern 2005-2020 | ~10 | 1 |
| UK / Europe / dollar-bin crossover | ~8 | 7 |

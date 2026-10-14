# Verified records: techno, hip-hop, funk, soul, jazz, leftfield (records_more.js)

Data file: `src/data/records_more.js` (51 records).

## Method and honest limits

- Every record below was checked with WebSearch, restricted to `discogs.com` and `wikipedia.org`. The search results quote or summarise the Discogs and Wikipedia pages listed as the source.
- The pages themselves could not be opened. WebFetch failed with a DNS error (`getaddrinfo ENOTFOUND`) on every host, and direct `curl` to Wikipedia and Discogs was refused by the egress proxy (403). So each source URL is the page the search result pointed to, not a page that was read in full.
- The per-turn WebSearch limit (200 calls, shared across all agents in the turn) ran out partway through. Anything not verified before that point was left out of the data file. The "Not verified" list at the bottom names candidates only, with no label, year or rarity claims.
- `bpm` is an estimate on every record (`bpmEst: true`). No BPM source was checked.
- `rarity` and `price` are game values, not claims about real rarity or market prices.
- `city` is filled only where a source supports it or the label's home is not in doubt. Otherwise it is empty.
- No record is tagged `pick: "grail"` or `pick: "jazz_alt"`. No source in the search results described any record as a grail, and no alternate smooth jazz or quiet storm LP was verified before the search limit hit.

## Verified records

| id | Artist - Title | Label | Year | Format | Source | Notes |
|---|---|---|---|---|---|---|
| grover_washington_jr_winelight | Grover Washington Jr. - Winelight | Elektra | 1980 | LP | https://en.wikipedia.org/wiki/Winelight | Required record (`pick: moms_jazz`). Sources agree on Elektra and 1980. "Just the Two of Us" is on it with Bill Withers singing lead. Discogs lists US catalog 6E-305 and producers Grover Washington Jr. and Ralph MacDonald (https://www.discogs.com/master/59348-Grover-Washington-Jr-Winelight). |
| model_500_no_ufos | Model 500 - No UFO's | Metroplex | 1985 | 12" | https://en.wikipedia.org/wiki/No_UFO's | Released April 1985, cat. M-001. |
| model_500_night_drive_thru_babylon | Model 500 - Night Drive (Thru-Babylon) | Metroplex | 1985 | 12" | https://www.discogs.com/release/8894-Model-500-Night-Drive-Thru-Babylon | Cat. M-002. Wikipedia's Metroplex discography also lists it as M-002 (1985). |
| cybotron_clear | Cybotron - Clear | Fantasy | 1983 | 12" | https://en.wikipedia.org/wiki/Clear_(Cybotron_song) | Third single from the album Enter. US 12" is D-216 on Discogs. |
| cybotron_alleys_of_your_mind | Cybotron - Alleys of Your Mind | Deep Space | 1981 | 7" | https://www.discogs.com/master/129-Cybotron-Alleys-Of-Your-Mind | Original is a 7" backed with "Cosmic Raindance". No 12" original was found; the only 12" is a 2004 Tresor reissue (Tresor 211). |
| rhythim_is_rhythim_strings_of_life | Rhythim Is Rhythim - Strings of Life | Transmat | 1987 | 12" | https://en.wikipedia.org/wiki/Strings_of_Life | Wikipedia infobox and Discogs both say 1987 (Discogs: May 1987, MS 4). The article text says "a year later" than Nude Photo, which is loose. Possible overlap with the house researcher. |
| rhythim_is_rhythim_nude_photo | Rhythim Is Rhythim - Nude Photo | Transmat | 1987 | 12" | https://www.discogs.com/release/4282-Rythim-Is-Rythim-Nude-Photo | Cat. MS-002. Discogs spells the artist "Rythim Is Rythim" on this listing. |
| robert_hood_minimal_nation | Robert Hood - Minimal Nation | Axis | 1994 | LP | https://en.wikipedia.org/wiki/Minimal_Nation | Axis AX-007, double 12". |
| jeff_mills_kat_moda_ep | Jeff Mills - Kat Moda EP | Purpose Maker | 1996 | 12" | https://www.discogs.com/release/1136069-Jeff-Mills-Kat-Moda-EP | "The Bells" opens side A. No standalone 1996 "The Bells" 12" was found, so the EP is listed instead. |
| underground_resistance_riot_ep | Underground Resistance - Riot EP | Underground Resistance | 1991 | 12" | https://www.discogs.com/release/72273-Underground-Resistance-Riot-EP | UR-010. Wikipedia's UR page also lists it among 1991 releases. |
| drexciya_the_quest | Drexciya - The Quest | Submerge | 1997 | LP | https://www.discogs.com/release/1663766-Drexciya-The-Quest | June 1997, SVE-7, double 12" compilation. Wikipedia also lists it as a 1997 Submerge compilation. |
| 69_4_jazz_funk_classics | 69 - 4 Jazz Funk Classics | Planet E | 1991 | 12" | https://en.wikipedia.org/wiki/Planet_E_Communications | PE69-1, first Planet E release (Carl Craig's alias). Discogs date: 15 Nov 1991. |
| octave_one_i_believe | Octave One - I Believe | Transmat | 1990 | 12" | https://www.discogs.com/release/3045-Octave-One-I-Believe | MS-10. Discogs and Wikipedia's discography say 1990; Wikipedia's prose says the group debuted on Transmat in 1989. Year 1990 used. Possible overlap with the house researcher. |
| reese_just_want_another_chance | Reese - Just Want Another Chance | Incognito | 1988 | 12" | https://en.wikipedia.org/wiki/Kevin_Saunderson | Incognito IR 111787 per Discogs. Title is "Just Want Another Chance", not "Just Another Chance". |
| afrika_bambaataa_soulsonic_force_planet_rock | Afrika Bambaataa & Soulsonic Force - Planet Rock | Tommy Boy | 1982 | 12" | https://en.wikipedia.org/wiki/Planet_Rock_(song) | TB 823 per Discogs. Wikipedia gives April or June 1982 depending on the source; 1982 either way. |
| kraftwerk_trans_europe_express | Kraftwerk - Trans-Europe Express | Kling Klang | 1977 | LP | https://en.wikipedia.org/wiki/Trans-Europe_Express_(album) | March 1977. Capitol issued the US pressing (SW-11603 per Discogs). |
| egyptian_lover_egypt_egypt | The Egyptian Lover - Egypt, Egypt | Freak Beat | 1984 | 12" | https://www.discogs.com/master/33704-The-Egyptian-Lover-Egypt-Egypt | First pressing is on Freak Beat (DMSR00661); Egyptian Empire pressings came later. |
| newcleus_jam_on_it | Newcleus - Jam On It | Sunnyview | 1984 | 12" | https://www.discogs.com/master/34089-Newcleus-Jam-On-It | SUN 411 (US). |
| mantronix_bassline | Mantronix - Bassline | Sleeping Bag | 1986 | 12" | https://www.discogs.com/release/128770-Mantronix-Bassline | SLX-18, dated 1986 on Discogs. The track is also on the 1985 album The Album (TLX-6). |
| man_parrish_hip_hop_be_bop | Man Parrish - Hip Hop, Be Bop (Don't Stop) | Importe/12 | 1982 | 12" | https://en.wikipedia.org/wiki/Man_Parrish | MP-321 (US) per Discogs. |
| warp_9_light_years_away | Warp 9 - Light Years Away | Prism | 1983 | 12" | https://en.wikipedia.org/wiki/Light_Years_Away_(Warp_9_song) | PDS 460 per Discogs. |
| sugarhill_gang_rappers_delight | The Sugarhill Gang - Rapper's Delight | Sugar Hill | 1979 | 12" | https://en.wikipedia.org/wiki/Sugar_Hill_Records_(hip-hop_label) | SH-542, September 1979. Chic's "Good Times" link: https://en.wikipedia.org/wiki/Good_Times_(Chic_song). |
| grandmaster_flash_furious_five_the_message | Grandmaster Flash and the Furious Five - The Message | Sugar Hill | 1982 | 12" | https://en.wikipedia.org/wiki/The_Message_(Grandmaster_Flash_and_the_Furious_Five_song) | SH-584, 1 July 1982 on Discogs. Wikipedia: National Recording Registry, 2002. |
| grandmaster_flash_wheels_of_steel | Grandmaster Flash - The Adventures of Grandmaster Flash on the Wheels of Steel | Sugar Hill | 1981 | 12" | https://en.wikipedia.org/wiki/The_Adventures_of_Grandmaster_Flash_on_the_Wheels_of_Steel | Wikipedia lists SH-557. Running times differ across pressings. |
| ll_cool_j_i_need_a_beat | LL Cool J - I Need a Beat | Def Jam | 1984 | 12" | https://www.discogs.com/release/96598-L-L-Cool-J-I-Need-A-Beat | DJ001. Discogs says November 1984; Wikipedia says c. 1984. |
| run_dmc_its_like_that_sucker_mcs | Run-D.M.C. - It's Like That / Sucker M.C.'s | Profile | 1983 | 12" | https://en.wikipedia.org/wiki/Sucker_M.C.'s | PRO-7019 per Discogs, 12 March 1983. |
| eric_b_rakim_eric_b_is_president | Eric B. & Rakim - Eric B. Is President | Zakia | 1986 | 12" | https://www.discogs.com/release/53282-Eric-B-Featuring-Rakim-Eric-B-Is-President- | ZK 014. Credited "Eric B. Featuring Rakim" on the label. |
| incredible_bongo_band_bongo_rock | Incredible Bongo Band - Bongo Rock | Pride | 1973 | LP | https://en.wikipedia.org/wiki/Bongo_Rock_(album) | PRD-0028 per Discogs. Listed as the LP because the 7" found was a "Bongo Rock" single, not "Apache". |
| honey_drippers_impeach_the_president | The Honey Drippers - Impeach the President | Alaga | 1973 | 7" | https://en.wikipedia.org/wiki/Impeach_the_President | AL-1017 per Discogs; Wikipedia gives 1 June 1973. |
| james_brown_funky_drummer | James Brown - Funky Drummer | King | 1970 | 7" | https://en.wikipedia.org/wiki/Funky_Drummer | King 45-6290, March 1970. |
| melvin_bliss_synthetic_substitution | Melvin Bliss - Synthetic Substitution | Sunburst | 1973 | 7" | https://en.wikipedia.org/wiki/Synthetic_Substitution | SU-527, A-side "Reward". Several later reissues and unofficial reissues exist. |
| lyn_collins_think_about_it | Lyn Collins - Think (About It) | People | 1972 | 7" | https://en.wikipedia.org/wiki/Think_(About_It) | PE 608, June 1972. |
| bob_james_two | Bob James - Two | CTI | 1975 | LP | https://en.wikipedia.org/wiki/Two_(Bob_James_album) | "Take Me to the Mardi Gras" is on Two (1975), not One (1974). Tagged jazz-funk; not tagged as a smooth jazz alternate because that classification was not sourced. |
| the_meters_cissy_strut | The Meters - Cissy Strut | Josie | 1969 | 7" | https://www.discogs.com/master/109354-The-Meters-Cissy-Strut-Here-Comes-The-Meter-Man | Josie 45-1005. |
| dennis_coffey_detroit_guitar_band_scorpio | Dennis Coffey and the Detroit Guitar Band - Scorpio | Sussex | 1971 | 7" | https://www.discogs.com/master/185343-Dennis-Coffey-And-The-Detroit-Guitar-Band-Scorpio | SUX 226. Wikipedia: https://en.wikipedia.org/wiki/Scorpio_(instrumental). |
| jeff_mills_waveform_transmission_vol_1 | Jeff Mills - Waveform Transmission Vol. 1 | Tresor | 1992 | LP | https://www.discogs.com/master/5943-Jeff-Mills-Waveform-Transmission-Vol-1 | Tresor 11. Wikipedia says 1992; some Discogs pressings say 1993. 1992 used. |
| x_101_x_101 | X-101 - X-101 | Tresor | 1991 | LP | https://www.discogs.com/master/4836-X-101-X-101 | Licensed from Underground Resistance. Discogs is split on EP versus LP; the catalogue number indicates an LP. |
| ben_klock_one | Ben Klock - One | Ostgut Ton | 2009 | LP | https://www.discogs.com/master/14964-Ben-Klock-One | OSTGUTLP03, 23 February 2009, double LP. |
| marcel_dettmann_dettmann | Marcel Dettmann - Dettmann | Ostgut Ton | 2010 | LP | https://www.discogs.com/master/242379-Dettmann-Dettmann | OSTGUTLP05. Wikipedia also lists it as 2010. There is no 2007 Dettmann album. |
| ricardo_villalobos_alcachofa | Ricardo Villalobos - Alcachofa | Playhouse | 2003 | LP | https://en.wikipedia.org/wiki/Alcachofa_(album) | PLAY083, triple 12". Sept 2003 (18th or 19th depending on source). |
| basic_channel_phylyps_trak | Basic Channel - Phylyps Trak | Basic Channel | 1993 | 12" | https://en.wikipedia.org/wiki/Basic_Channel | BC 02, October 1993. |
| basic_channel_quadrant_dub | Basic Channel - Quadrant Dub | Basic Channel | 1994 | 12" | https://www.discogs.com/master/1394-Basic-Channel-Quadrant-Dub | BC 06, 1 April 1994. |
| plastikman_sheet_one | Plastikman - Sheet One | NovaMute | 1993 | LP | https://en.wikipedia.org/wiki/Sheet_One | Wikipedia says NovaMute, 1993. A Canadian Plus 8 pressing (July 1993) has a different tracklist. |
| joey_beltram_energy_flash | Joey Beltram - Energy Flash | Transmat | 1990 | 12" | https://www.discogs.com/release/2084-Beltram-Energy-Flash | US 12" MS-16, licensed from R&S Records. The original R&S catalogue number was not confirmed. |
| gas_pop | Gas - Pop | Mille Plateaux | 2000 | LP | https://en.wikipedia.org/wiki/Pop_(Gas_album) | March 2000, MPLP 83. It was not a Kompakt original; Kompakt reissued Gas later. |
| aphex_twin_selected_ambient_works_85_92 | Aphex Twin - Selected Ambient Works 85-92 | Apollo | 1992 | LP | https://en.wikipedia.org/wiki/Selected_Ambient_Works_85%E2%80%9392 | AMB LP 3922 (double LP). Wikipedia: 9 Nov 1992; a 2008 essay claims 12 Feb 1992. Either way 1992. |
| klf_chill_out | The KLF - Chill Out | KLF Communications | 1990 | LP | https://en.wikipedia.org/wiki/Chill_Out_(KLF_album) | 5 February 1990. |
| the_orb_adventures_beyond_the_ultraworld | The Orb - The Orb's Adventures Beyond the Ultraworld | Big Life | 1991 | LP | https://en.wikipedia.org/wiki/The_Orb's_Adventures_Beyond_the_Ultraworld | Wikipedia: 2 April 1991; Discogs UK vinyl: 15 April 1991. |
| global_communication_76_14 | Global Communication - 76:14 | Dedicated | 1994 | LP | https://en.wikipedia.org/wiki/76:14 | 1 June 1994 per Wikipedia; CD is DEDCD 014. |
| alexander_robotnick_problemes_d_amour | Alexander Robotnick - Problèmes d'Amour | Fuzz Dance | 1983 | 12" | https://www.discogs.com/release/25573-Alexander-Robotnick-Probl%C3%A8mes-DAmour | Italian 12", ZZ 20 003. No "Il Discotto" label was found for this record. |
| klein_mbo_dirty_talk | Klein + M.B.O. - Dirty Talk | Zanza | 1982 | 12" | https://en.wikipedia.org/wiki/Dirty_Talk_(Klein_+_M.B.O._song) | Wikipedia lists Zanza and 25 West; Discogs shows Zanza (Italy, ZR0107) and 25 West (US, TFW 1002). |

## Excluded / unverified

### Checked and left out or corrected

- The Field - From Here We Go Sublime: the album came out on CD in 2007; Discogs shows the first full-album vinyl as a 2014 Record Store Day issue. Only a 12" single (KOM 154) existed on vinyl in 2007. Left out.
- Marcel Dettmann 2007 album: none exists. The self-titled album is from 2010 (used). The 2007 Ostgut Ton release is Scenario with Ben Klock.
- Justus Koehncke - "Timecode": it is a track on the 2005 album Doppelleben (Kompakt, KOM 112), and the genre is house/downtempo, which falls outside this file's genre list. Left out.
- Brian Eno - Ambient 1: Music for Airports: sources disagree between 1978 (sleeve and label copyright) and 1979 (commonly cited release). Left out rather than guess.
- Reese - "Rock to the Beat": no standalone 1988 12" found; it appears on a Kevin Saunderson compilation. Left out.
- Jeff Mills - "The Bells" as its own 1996 12": not found; it is on the Kat Moda EP (used).
- Cybotron - "Alleys of Your Mind" as a 1981 12": no such original; the original is a 7" (used).
- Chic - "Good Times" appeared in results but belongs to the disco researcher's scope. Not included.

### Not verified (search limit reached; candidate names only, no label/year/rarity claims)

These were planned but not checked. Nothing about them is in the data file.

- Smooth jazz / quiet storm alternates (required, 2-3): George Benson - Breezin'; Anita Baker - Rapture; Sade - Diamond Life; Smokey Robinson - A Quiet Storm; Chuck Mangione - Feels So Good; Spyro Gyra - Morning Dance; Luther Vandross - Never Too Much; Kenny G - Duotones.
- Funk / soul / Latin / boogie: Curtis Mayfield - Superfly; Marvin Gaye - What's Going On; Bill Withers - Just As I Am; Roy Ayers Ubiquity - Everybody Loves the Sunshine; Herbie Hancock - Head Hunters; Donald Byrd - Black Byrd; Eddie Palmieri - Harlem River Drive; Willie Colon - El Malo; Fania All Stars - Live at the Cheetah; D Train - You're the One for Me.
- Hip-hop: De La Soul - 3 Feet High and Rising (Tommy Boy); Marley Marl / Juice Crew - The Symphony (Cold Chillin'); EPMD - Strictly Business; Beastie Boys - Licensed to Ill; Public Enemy - Yo! Bum Rush the Show.
- Balearic: no Balearic record was verified.
- Dollar-bin Eurodance / novelty (about 6 wanted): Vengaboys, 2 Unlimited, Haddaway, Snap!, Scatman John, Rednex, Aqua, Los del Rio, Lou Bega.
- Grails: no record was confirmed as described by a source as rare or sought after. Candidates to check: Rammellzee vs K-Rob - Beat Bop; Sun Ra Saturn label LPs; Aphex Twin Caustic Window test pressing.
- Berlin / Kompakt extras: Michael Mayer - Immer; Superpitcher - Here Comes Love.

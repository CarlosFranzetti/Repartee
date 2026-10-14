# re:parteé - gear and lore research

Research date: 14 October 2026. Outputs: `src/data/gear.js`, `src/data/lore.js`.

## TAULA FINDING (read first)

**"Taula" is real.** Taula is the model name of a rotary DJ mixer line made by **Can Electric Audio**, a small builder in **Barcelona, Spain**.

- Models: **Taula 4 MR** (four channels) and **Taula 2 MR** (two channels). Both are described as 100% analogue rotary mixers, handwired in Barcelona, aimed at DJs and especially suited to turntables.
- Origin: the company's About page says Can Electric Audio began in 2015 when the record store **Discos Paradiso** commissioned a custom mixer (the first Taula 4); demand from other customers led to a small production run.
- Manufacturing: most work is done in-house (PCB assembly, painting, silk screening, wiring, woodworking). The company quotes about 40 working days plus delivery for a Taula 4 MR, and 13 colours.
- Prices on the company site at the time of the search were about EUR 1,650 (Taula 4 MR) and EUR 1,300 (Taula 2 MR Custom). These may be out of date, and the game should not treat them as real market claims.
- Not verified: the exact year the first commercial Taula 4 MR shipped (the company year is 2015, but the product year is not stated in what was retrieved), and any MusicTech review text (a MusicTech product page exists, but its content was not retrieved).

Sources: https://www.canelectricaudio.com/about , https://www.canelectricaudio.com/product/taula-4-mr , https://www.canelectricaudio.com/product/taula-2-mr-custom , https://musictech.com/products/can-electric-taula-4-mixer/ , https://fr.audiofanzine.com/console-dj-4-voies-ou-plus/can-electric/taula-4/news/a.play,n.34664.html , https://reverb.com/item/34337486-can-electric-audio-taula-4-rotary-mixer-dj

The first three searches for "Taula" (with and without "rotary" and "DJ") returned nothing relevant. The brand only surfaced when the query added "audio ... manufacturer handmade". Keep that in mind when searching for it again.

## How this research was done, and its limits (important)

- Only the WebSearch tool worked. WebFetch failed for every host (DNS error), and direct curl to Wikipedia, Discogs, RA and Pioneer DJ was refused by the egress proxy (organization policy). So **no page was read in full**; every fact comes from search-result summaries that cite the URLs below. Years are stated only when a result supported them.
- The search budget for the session ran out partway through the label checks (the last query, covering Def Jam, Defected and Ninja Tune, was refused). Venues, stores and some labels were therefore never searched. They are included as real names but flagged `verified: false` with null dates and `src: null`.
- Because of the above, the owner should treat this as a **first pass**. A second pass with working page fetches should confirm the `verified:false` entries and the single-source items listed below.

### `verified` flag in lore.js
`verified: true` means the stated claims (living or deceased status, known_for, dates) were supported by a retrieved search-result summary. `verified: false` means the name is real but the details are not confirmed; dates are null, descriptions generic. City fields are general knowledge unless the source obviously covers them.

## Gear: verified facts and sources

### Entry-level players and mixers
| Item | Year stated | Evidence | Source |
|---|---|---|---|
| Pioneer CDJ-400 | 2007 | Announced 7 Nov 2007; plays MP3 from CD-R/RW and USB | https://djworx.com/pioneers-cdj-400-yes-its-real/ |
| Pioneer CDJ-350 | 2010 | Unveiled at Musikmesse 2010 (available June 2010); white version announced 21 Dec 2010 | https://www.synthtopia.com/?p=22088 , https://de.ra.co/news/13283 |
| Pioneer DJM-350 | 2010 | Announced at Musikmesse 2010 with the CDJ-350 | https://www.synthtopia.com/?p=22088 , https://ra.co/news.aspx?id=11927 , https://djworx.com/?p=50144 |
| Gemini CDJ-700 | 2011 | Unveiled at NAMM January 2011; touchscreen, CD/USB/SD | https://promobile.org.uk/news/archive/344/Gemini-Launch-New-Tabletop-Player , https://www.bonedo.de/artikel/gemini-cdj-700-3 |
| Numark M101 / M101 USB | 2011 | Press release 13 Jan 2011, NAMM 2011 | https://www.numark.com/news/numark-intros-two-new-2-channel-mixers , https://sonicstate.com/news/2011/01/14/wnamm11-two-new-2-channel-dj-mixers/ |
| Behringer DJX750 | null | Behringer page: 5-channel DJ mixer with BPM counter. A retailer lists 16 Oct 2013 as release date; not confirmed by Behringer, so not used | https://www.behringer.com/en/products/0701-AAW |
| Numark TT1650 | null | Numark page: no longer in production; zZounds customer review dated 8 Jul 2004 shows it existed by then | https://www.numark.com/product/tt1650 , https://www.zzounds.com/item--NUMTT1650 |

### Pioneer CDJ line
| Item | Year | Evidence | Source |
|---|---|---|---|
| CDJ-900 | 2009 | Pioneer press release 17 Sep 2009 launched CDJ-2000 and CDJ-900 together | https://www.mynewsdesk.com/se/pioneer/pressreleases/pioneer-s-cdj-2000-cdj-900-319812 , https://djworx.com/new-species-has-arrived-pioneer-cdj-2000-and-cdj-900/ , https://www.phileweb.com/sp/news/hobby/200909/17/195.html |
| CDJ-2000 | 2009 | Same release; DJ TechTools tag page also gives 2009 | as above, https://djtechtools.com/amp/tag/cdj-2000/ |
| CDJ-900NXS | 2013 | Announced/launched 2013, available from Dec 2013; EUR 1,399 SRP | https://musicradar.com/news/dj/pioneer-unveils-wi-fi-enabled-cdj-900nxs-588389 , https://djworx.com/pioneer-cdj-900nxs-better-screen-workflow-loops-rekordbox/ |
| CDJ-2000NXS (not in catalog) | 2012 | Single source (DJ TechTools tag page); not used | https://djtechtools.com/amp/tag/cdj-2000/ |
| CDJ-2000NXS2 | 2016 | Shown at NAMM Jan 2016; hi-res touchscreen, 96 kHz/24-bit card | https://www.digitaldjtips.com/?p=2335951 , https://blog.bestbuy.ca/musical-instruments/namm-2016-pioneers-latest-cdjs-and-mixer-are-a-cut-above-2 |
| DJM-900NXS2 | 2016 | Unveiled Jan 2016 with CDJ-2000NXS2; first Pioneer 64-bit mixing processor; EUR 2,299 | https://bpm-mag.com/story/pioneer-introduces-the-new-djm-900nxs2 , https://www.bonedo.de/artikel/musikmesse-2016-pioneer-djm-2000nxs2-und-djm-900nxs2/ |
| CDJ-3000 | 2020 | Press release dated 10 Sep 2020 (reproduced by DJWorx); MPU instead of DSP, 9-inch touchscreen, no optical drive, 8 hot cue pads, Key Sync | https://djmag.com/news/pioneer-dj-introduce-their-next-gen-player-cdj-3000 , https://djworx.com/?p=40126 , https://www.digitaldjtips.com/2020/09/pioneer-dj-cdj-3000-media-player-news/ , https://musictech.com/news/pioneer-dj-drops-the-powerful-and-long-awaited-cdj-3000/ |
| CDJ history (context) | n/a | CDJ-500 in 1994; CDJ-1000 in 2001 per most sources (one Wikipedia mirror says 2004; one blog says 1999). Not placed in the catalog | https://digitaldjtips.com/?p=2736308 , https://en.wikipedia.org/wiki/CDJ |

Note on the CDJ-3000 notable feature: DJ Mag calls the touchscreen "not multi-touch" while a retailer calls it multi-touch; the catalog avoids that point and uses the MPU, which all sources agree on.

### Turntables
| Item | Year | Evidence | Source |
|---|---|---|---|
| Audio-Technica AT-LP120-USB | 2009 | Wikipedia: introduced 2009, built-in preamp, USB | https://en.wikipedia.org/wiki/Audio-Technica_AT-LP120 , https://www.ifixit.com/Device/Audio-Technica_AT-LP120-USB |
| AT-LP120XUSB | 2019 | Announced at CES January 2019, improved preamp, VM95E cartridge (a Bluetooth claim in one mirror was not used) | https://en.wikipedia.org/wiki/Audio-Technica_AT-LP120 |
| Technics SL-1200 | 1972 (note only) | Stereonet: introduced Oct 1972; Wikipedia mirror: developed 1971, released 1972 | https://stereonet.com/features/inside-track-the-second-coming-of-the-technics-sl-1200 , https://en.wikipedia.org/wiki/Technics_SL-1200 |
| Technics SL-1200MK2 | 1979 | Wikipedia: released summer 1979 in silver and matte black; one source (Shapers of the 80s) says 1978 | https://en.wikipedia.org/wiki/Technics_SL-1200 , https://shapersofthe80s.com/tag/analogue/ |
| Technics SL-1210MK2 | null | Satin-black version, nearly identical in function; its own year not separately sourced | https://en.wikipedia.org/wiki/Technics_SL-1200 |
| Discontinuation | 2010 | Panasonic announced; date given as 20 Oct (Tokyo Reporter via Shapers of the 80s) or 1 Nov 2010 (Wikipedia mirror); about 3.5 million SL-1200/1210 units sold (Juno) | https://shapersofthe80s.com/tag/analogue/ , https://www.juno.co.uk/reviews/2019/08/29/technics-sl-1210-mk7-turntable-review |
| Technics brand revival | 2014 | Thomann: Technics returned in 2014 | https://www.thomann.co.uk/technics_sl_1210_mk_7_b_stock.htm |
| SL-1200GAE / SL-1200G | 2016 | Return of the line announced at CES 2016 (limited GAE and consumer G); lighter GR followed | https://www.whathifi.com/news/ces-2019-technics-reveals-event-focusing-on-legendary-sl-1200-turntables , https://en.wikipedia.org/wiki/Technics_SL-1200 |
| SL-1210MK7 / SL-1200MK7 | 2019 | Announced CES January 2019; first DJ-focused Technics deck in nine years; matte black only; 899 GBP / 1000 EUR / 1200 USD; made in Malaysia, 9.6 kg versus MK6 11.6 kg | https://cdm.link/2019/01/technics-sl-1200-return-mk7/ , https://www.whathifi.com/news/technics-relaunches-legendary-dj-turntable-with-sl-1200-mk7 , https://www.juno.co.uk/reviews/2019/08/29/technics-sl-1210-mk7-turntable-review |

Conflicts and answers:
- MK3: sources give 1989 (Japan-only, matte black, gold RCAs); M3D 1997; MK5 either 2002 or Nov 2000; MK6 either 2007 or Feb 2008 (Japan). Because they conflict, MK3-MK6 years are **not** in the catalog.
- "Which version would a used buyer find": this could not be sourced. The catalog offers the MK2-era pair (SL-1200MK2 / SL-1210MK2) as the classic used purchase; that is a game-design choice, not a verified market statement.
- The MK7 motor: one source says coreless, another says an iron-core stator. The catalog does not mention it.
- The 2016 revival: sources place the SL-1200GAE/G reveal at CES 2016. A "2016" mention of IFA was not found.
- Budget turntables not placed because the year could not be confirmed: Stanton ST-150 / STR8.150 (a review says around 2005; a 150 Series relaunch was shown at CES 2014/2015, so the year is ambiguous), Reloop RP-2000 USB MK2 (no dated source), Numark TT1650 (only a lower bound of 2004).

### Rotary mixers
| Item | Year | Evidence | Source |
|---|---|---|---|
| Bozak CMA-10-2DL | 1971 | Launched 1971; considered the first rotary DJ mixer; discrete transistors, no ICs. A Rane timeline separately dates Alex Rosner's "Rosie" mixer for the Haven club to 1971 | https://gearnews.com/?p=185190 , https://edmislife.com/popular/the-rotary-reversal-how-discos-original-mixer-became-todays-ultimate-status-symbol/ , https://www.ranecommercial.com/legacy/pdf/djtimeline.pdf |
| UREI 1620 | null | Dates conflict (one account says in production 1971-1993; another calls it a 1980s clone). By 1986 it had replaced the Bozak in Levan's Paradise Garage booth. Soundcraft (Harman) issued the 1620LE in 2005 | https://mixmag.asia/feature/a-trip-through-dj-booths-1976-2016-1 , https://gearnews.com/?p=185190 , https://www.synthtopia.com/content/2005/01/30/namm-urei-dj-gear-resurrected/ , https://en.wikipedia.org/wiki/UREI |
| E&S DJR400 | null | Designed by Jerome Barbe in Paris for DJ Deep; "turn of the century" or "early 2000s"; four channels, volume and two-band EQ each, three-band isolator | https://www.bonedo.de/artikel/electronique-spectacle-es-djr400 , https://thevinylfactory.com/?p=123196 , https://mixdownmag.com.au/reviews/review-es-djr-400-rotary-mixer/ |
| Rane MP2015 | 2015 | Unveiled at NAMM January 2015; dual USB. Price reports conflict (USD 2,199 vs 3,499) | https://www.bonedo.de/artikel/namm-2015-rane-stellt-den-mp2015-rotary-mixer-mit-dual-usb-interface-vor , https://xlr8r.com/news/rane-introduces-new-mp2015-rotary-mixer-and-ttm57mkii-serato-dj-mixer/ , https://djmag.com/content/mp2015-ranes-all-new-rotary-mixer |
| Isonoe FP Mixer | 2014 (announcement) | Announced 6 Nov 2014 with Floating Points; no price or release date; described as highly bespoke and unlikely to be built at scale. Isonoe also makes the ISO420 (a Reddit-sourced mention only; not used) | https://factmag.com/2014/11/06/floating-points-teams-up-with-isonoe-to-build-world-class-dj-mixer , https://www.juno.co.uk/junodaily/?p=104764 , https://ra.co/news.aspx?id=27092 |
| Condesa Carmen | null | Adelaide, Australia; first model, hand-made to order, brushed stainless steel and walnut, 100% discrete analogue path; Lucia is the 2-channel | https://thevinylfactory.com/?p=104881 , https://archive.openjournal.com.au/handmade-rotary-dj-mixers-by-condessa/ |
| MasterSounds Radius 2 | 2016 | First Radius 2 in 2016, Radius 4 followed; early units hand-built by Andy Rigby-Jones (Union Audio) in Cornwall with owner Ryan Shaw; GBP 799 for third generation in 2020. "Stockport" was not supported | https://archive.thevinylfactory.com/?p=118060 , https://xlr8r.com/?p=36319 , https://musictech.com/news/gear/mastersounds-radius-new-generation/ |
| Alpha Recording System Model 9900 | null | Japanese maker in Nakano-ku, Tokyo; hand-built; models 1100, 4100, 6700, 9000, 9100, 9500, 9900; Model 9000 appeared around Dec 2015 (Juno) | https://direct.djmag.com/news/alpha-recording-system-release-new-six-channel-rotary-mixer , https://www.juno.co.uk/junodaily/2015/12/16/alpha-recording-system-model-9000-rotary-tabletop-dj-mixer/ |
| Varia Instruments RDM20 | null | Swiss maker; RDM20 two-channel with 6 inputs, RDM40 four-channel; CHF 2,190 reported. The Bern link comes from a 45rpm.ch headline "A Bernese rotary boutique DJ mixer conquers the world" | https://45rpm.ch/a-bernese-rotary-boutique-dj-mixer-conquers-the-world/ , https://djtechtools.com/2016/06/24/independent-rotary-mixers-botique-dj-tool |
| Can Electric Taula 4 MR | null | See the Taula section | see above |
| Omnitronic TRM-202 MK3 | null | Budget rotary entry point; ALPS knobs, 3-band isolator (dealer text) | https://steinigke.de/en/The-advantages-of-analog-rotary-mixers-for-DJs |
| Ecler WARM2 (not in catalog) | 2022 | Barcelona; first new Ecler DJ product in 13 years; pre-orders Dec 2021, broad availability 2022 (dates conflict) | https://djtechtools.com/2022/07/13/ecler-dj-is-back-launches-warm2-rotary-mixer/ |
| Headliner (not in catalog) | null | Los Angeles brand, R2 and R4 | https://equipboard.com/brands/headliner-brand |

**"Bozak AR-6"**: the search found nothing on this model. Bonedo lists the current Bozak models as AP-2 and AR-4, and Mixmag notes modern Bozak mixers are made by a UK company that bought the name. The AR-6 is **excluded as unverified**.

**"Open To Close"**: attributed by the owner to Louie Vega. It could not be verified. A Resident Advisor event is titled "219: Francois K - open to close", and Louie Vega's long-set shows appear under the name "All Night Long" (e.g. London, 10 April 2026). Check before using that attribution.

### Monitors, headphones, cartridges
| Item | Year | Evidence | Source |
|---|---|---|---|
| KRK Rokit 5 G4 | 2018 | G4 launched at 2018 Winter NAMM; woven Kevlar in yellow; range is Rokit 5, 7, 8 and 10-3 (4 and 6 inch dropped). A listing gives "2019-2021" as the model-year window. Whether the earlier G3 had yellow cones was not established, so no claim is made about it | https://www.mixonline.com/technology/krk-rokit-g4-monitors , https://www.recordingmag.com/resources/featured-reviews/krk-rokit-5-g4/ , https://happymag.tv/?p=392470 |
| Dynaudio BM5 mkIII | 2014 | Dynaudio FAQ table: 2014 to current; a retailer also says 2014 | https://dynaudio.com/faq/studio-monitors-history |
| Dynaudio LYD 5 / 7 / 8 | null | Introduced at Musikmesse Frankfurt; a retailer listing gives 2017 but the Dynaudio table was not seen confirming it | https://www.bonedo.de/marke/dynaudio/ , https://www.prosoundweb.com/tag/dynaudio/ |
| Dynaudio Core 47 | 2019 | FAQ table lists Core 47 as 2019, Core 59 as 2018, Core 7 as 2018, Core 5 as 2024. A retailer says the Core series launched in 2019 for the 30th anniversary, which does not match the 2018 entries, so Core 47 is the less certain line | https://dynaudio.com/faq/studio-monitors-history |
| Sennheiser HD 25 | null | Thomann: market launch 1988; Stereophile/InnerFidelity: 1989 from the original manual. Roman numeral II added 2007; adidas Original edition early 2010 | https://stereophile.com/content/sennheiser-hd-25-1-ii-and-adidas-original-hd-25 , https://thomannmusic.com/sennheiser_hd_25.htm |
| Technics RP-DH1200 | null | One retailer's metadata (Galaxus) gives 24 Jun 2008 for the RP-DH1200E-S; EAH-DJ1200 launched Sept 2019 (Digital DJ Tips) | https://galaxus.at/en/s1/product/technics-rp-dh1200e-s-cable-headphones-214093 , https://www.digitaldjtips.com/2019/09/technics-launches-eah-dj1200-headphones/ |
| Ortofon Concorde family | null (original 1979) | Original Concorde 1979 with integrated SME-type headshell; second-generation MkII DJ range: Mix, DJ, Club, Scratch, Digital; Concorde Music (Red, Blue, Bronze, Black) is the hi-fi branch. "Concorde Pro S" and "Concorde Nightclub" were not found as products | https://ortofon.com/blogs/news/when-a-cartridge-became-a-legend , https://www.hifipig.com/ortofon-concorde-mk-ii-cartridges-launched/ |
| Shure M44-7 | null | Shure statement 1 May 2018: ending phono products. Shure UK said the same day that only the M44-7H was discontinued and the M44-7 remained in production; the word "discontinued" was removed from Shure's site. Retailers later list the M44-7 as discontinued (one gives 20 Jul 2020). No official Shure notice of final M44-7 discontinuation was seen | https://djworx.com/?p=35488 , https://djworx.com/?p=6241 , https://applink.reverb.com/news/shure-to-discontinue-industry-standard-phono-products-this-summer , https://www.thestranger.com/music/rip-shure-dj-cartridges-26128554/ |

## Lore: sources and living/deceased evidence

Status as of 14 October 2026. "Evidence" is what the retrieved results showed; no search result reported any of the cameoOk DJs as deceased.

| DJ | Status | Evidence | Source |
|---|---|---|---|
| Louie Vega | alive | Solo all-night set London 10 Apr 2026; Masters At Work with Kenny Dope | https://djmag.com/news/louie-vega-announces-first-ever-london-all-night-long-show , https://www.theskinny.co.uk/clubs/interviews/louie-vega-a-master-at-work |
| Kenny Dope | alive | Japan tour dates May 2026 | https://ra.co/events/2405130 |
| Danny Tenaglia | alive | 2026 bookings: Miami Music Week 28 Mar, NYC 1 May, Australia/NZ July | https://www.edgenyc.com/de/events/marquee-skydeck-danny-tenaglia/ , https://grammy.com/news/danny-tenaglia-talks-coachella-how-pace-dj-set |
| Francois Kevorkian | alive | Perth 1 Mar 2026; Dekmantel July 2026; Tokyo Liquidroom 23 Oct 2026 (billed as final set there; age 72 per listing) | https://xpressmag.com.au/review-dancing-in-space-10th-birthday-at-freo-social/ , https://www.timeout.jp/tokyo/ja/news/liquidroom-anniversary-francoisk-100526 |
| Joe Claussell | alive | Body & Soul Tokyo 8 Jun 2025; an Apple Music release dated 5 Jun 2026 (artist match unconfirmed) | https://mixmag.asia/read/danny-krivit-joe-claussell-francois-k-body-soul-live-in-japan-2025-local , https://music.apple.com/artist/432256179 |
| Danny Krivit | alive | 718 Sessions birthday 12 Apr 2026 (Musica NYC); Brazil 8 Aug 2026 | https://de.ra.co/events/2397624 , https://ra.co/events/2496383 |
| Tony Humphries | alive | Bandsintown shows past 2026 appearances (Brooklyn, San Francisco, Le Bain, London); Running Back archival releases June 2026 | https://www.bandsintown.com/a/218310-tony-humphries , https://electronicgroove.com/tony-humphries-joins-running-back-with-kiss-fm-zanzibar-years/ |
| Kerri Chandler | alive | Festival bookings in 2026 (FLY Festival Edinburgh 12 Sep 2026) from one listing | https://www.skiddle.com/artists/kerri-chandler-123484614/ |
| Jellybean Benitez | alive | London KOKO 17 Jan 2025; Miami 15 Nov 2025 | https://www.koko.co.uk/events/jellybean-benitez-2 , https://www.livnightclub.com/miami/event/EVE112156200020251115/mph-club-rally-official-afterparty-2025/ |
| Honey Dijon | alive | 2026 festival dates from one Czech aggregator | https://festivaly.eu/interpreti/honey-dijon/18330 |
| The Martinez Brothers | alive | Central Park 13 Jun 2026; other 2026 dates | https://cityparksfoundation.org/?p=17554 , https://www.technoairlines.com/artist/the-martinez-brothers |
| Nicky Siano | alive (last confirmed March 2025) | 70th birthday event 22 Mar 2025; Star Wax interview 2025. A Time Out Tokyo item mentions a Japan gig cancelled earlier for health reasons. No 2026 activity found, so this is the weakest cameoOk entry | https://kaput-mag.com/?p=42700 , https://www.starwaxmag.com/news/nicky-siano |
| Timmy Regisford | alive | 2026 Dance Parade Grand Marshal; New Zealand date 19 Sep 2026 | https://danceparade.org/zh/timmy-regisford/ , https://www.tickettailor.com/events/musicfirst/2333190 |
| DJ Spinna | alive (Sept 2025) | Spinnafest 26-28 Sep 2025 | https://www.bkmag.com/?p=82429 |
| Marshall Jefferson | alive | Bookings Montreal 27 Jun 2026 and Basel 6 Nov 2026; 2026 track | https://www.technoairlines.com/artist/marshall-jefferson |
| Carl Craig | alive | Richmond VA 14-15 Aug 2026; Planet E release 23 Apr 2026 | https://ra.co/events/2459967 |
| Jeff Mills | alive | Dekmantel 2 Aug 2026, Brunch Electronik 7-8 Aug 2026, Brooklyn 5 Sep 2026 (one listing, may be stale) | https://electronicgroove.com/brunch-electronik-festival-expands-2026-lineup-with-kaytranada-and-jeff-mills/ |
| Moodymann | alive | Melbourne Fed Square, Nov 2025 | https://www.broadsheet.com.au/melbourne/event/moodymann-fed-square-nov-2025 |
| Theo Parrish | alive (weak) | Releases in March and May 2025; conflicting 2026 tour listings. verified:false | https://www.qobuz.com/ch-fr/interpreter/theo-parrish/690998 |
| DJ Harvey | alive | Ministry of Sound, London, 22 Aug 2026 | https://en.wikipedia.org/wiki/DJ_Harvey |
| Larry Levan | deceased 8 Nov 1992 | Wikipedia | https://en.wikipedia.org/wiki/Larry_Levan |
| Frankie Knuckles | deceased 31 Mar 2014 | Attack Magazine and others | https://www.attackmagazine.com/news/frankie-knuckles-1955-2014/ |
| David Mancuso | deceased 14 Nov 2016, aged 72 | Fader, DJ Mag, NPR | https://www.thefader.com/2016/11/15/david-mancuso-dies-aged-72 , https://www.npr.org/sections/therecord/2016/11/18/502450994/the-death-of-a-disco-host |
| DJ Funk | deceased March 2025, aged 54 | NPR | https://www.kaxe.org/2025-03-07/chicago-house-music-pioneer-charles-chambers-known-as-dj-funk-has-died-at-54 |
| DJ Deeon | deceased 2023, aged 56 | NPR | https://www.tpr.org/2023-07-18/remembering-house-music-legend-dj-deeon-dead-at-56 |

Recent deaths seen in results but not used: DJ Dan (West Coast house, died 28/29 March 2026, aged 57; https://www.tmz.com/2026/03/30/dj-dan-dead/) and Ron Carroll (Chicago house vocalist and DJ, reported September 2025). Neither was in the requested list.

### Labels (founded)
- Salsoul 1974 (Cayre brothers; defunct 1985, relaunched 1992): https://en.wikipedia.org/wiki/Salsoul_Records , https://jahsonic.com/Salsoul.html
- West End 1976 (Mel Cheren, Ed Kushins): https://en.wikipedia.org/wiki/West_End_Records , https://en.wikipedia.org/wiki/Mel_Cheren
- Sleeping Bag 1981 (Arthur Russell, William Socolov, Juggy Gales; 1981-1992): https://en.wikipedia.org/wiki/Sleeping_Bag_Records , https://djhistory.com/read/sleeping-bag-went-bang/
- Tommy Boy 1981 (Tom Silverman): https://en.wikipedia.org/wiki/Tommy_Boy_Records
- Strictly Rhythm 1989 (1 May 1989 per Wikipedia): https://en.wikipedia.org/wiki/Strictly_Rhythm
- Nervous 1991 (Sam and Mike Weiss): https://en.wikipedia.org/wiki/Nervous_Records_(US) , https://ra.co/labels/2105
- Nu Groove 1988, ceased 1992 (single source, Record Collector): https://recordcollectormag.com/articles/have-i-got-nu-for-you
- King Street Sounds 1993 (Hisanao Ishioka; Armada bought it in June 2023): https://mixmag.net/read/documentary-history-label-king-street-sounds-news , https://armadamusic.com/labels/king-street-sounds
- Trax: Wikipedia infobox 1984, article text says operations began 1983; Mixmag and DJ Mag say 1984; Wikipedia says there is no documentation that Jesse Saunders and Vince Lawrence were co-founders. Larry Sherman died in 2020: https://en.wikipedia.org/wiki/Trax_Records , https://mixmag.net/feature/trax-records-chicago-house-originators-payment-larry-sherman , https://djmag.com/features/history-trax-records-and-fight-chicagos-house-pioneers-royalties
- DJ International 1985 (Rocky Jones): https://en.wikipedia.org/wiki/DJ_International_Records
- Metroplex 1985 (Juan Atkins), Transmat 1986 (Derrick May), KMS 1987 (Kevin Saunderson), Planet E 1991 (Carl Craig): https://musicorigins.org/?p=83 , https://transmatrecords.com/about/ , https://www.electronicbeats.net/20-techno-labels , https://www.vice.com/en/article/carl-craig-took-me-on-a-tour-of-detroits-most-sacred-techno-landmarks/ . These years came from a combined query summary and the source-to-year mapping is approximate, so they are worth re-checking.
- Underground Resistance: the 1989 date was not supported; null in the catalog.

### Venues and events: what was verified
- The Loft: parties started 1970 is inferred from the Gearnews line that the Bozak and UREI mixers "wouldn't come out until 1971, a year after David started his parties". Gearnews also says the Loft's own mixer was custom-built (Harry Muntz, built by Richard Long), so the Bozak association is **not** claimed.
- Paradise Garage: opened 1977 (Mel Cheren article); the closing year was not retrieved, so null.
- The Gallery: closed November 1977 (NYC LGBT Historic Sites); opened 1972 or 1973 (sources differ), so null. Sources: https://www.nyclgbtsites.org/site/the-gallery/ , https://magazine.waxpoetics.com/article/nicky-siano-in-the-gallery
- Studio 54: only Nicky Siano's role is supported (one source says he was fired after about six months). One profile dates his stint to 1976, which looks inconsistent with the club's opening, so no year is stated.
- Body & Soul: begun 1996 at Club Vinyl, Manhattan; Tokyo edition 8 Jun 2025 (Kiranah Garden Toyosu).
- Shelter: founded 1991 after the Paradise Garage closed; 35-years tour in 2026.
- Musica NYC and the 718 Sessions: Resident Advisor listing for 12 Apr 2026 only; this does not prove the venue is open now.

## Unverified / excluded

Excluded entirely (not in the data files):
- "Bozak AR-6" (no evidence found).
- "Louie Vega's Open To Close" attribution (see above).
- Any claim that "Taula" is a person or older brand: it is a 2015-era Barcelona product line.
- CDJ-350 or CDJ-900 street prices as real facts (game economy only).
- CDJ-2000NXS 2012 (single source), DJM-900NXS 2011 (not confirmed), CDJ-1000 as catalog item (year disputed), CDJ-800 (no source found).
- SL-1200 MK3 to MK6 years (conflicting), the MK7 motor description (conflicting), "most common used SL-1210 version" (no source).
- Stanton ST-150/STR8.150, Reloop RP-2000 USB MK2 (years unconfirmed).
- Ortofon "Concorde Pro S" and "Concorde Nightclub" (not found as products).
- Mark Kamins as a Sleeping Bag founder (not supported; Wikipedia lists Arthur Russell, William Socolov, Juggy Gales).
- MasterSounds in Stockport, Varia founding year, Alpha Recording System founding year (not supported).
- Derrick May, Juan Atkins and Kevin Saunderson, Todd Terry, Junior Vasquez: no clear 2025-2026 evidence retrieved, so they are not listed as DJs.
- Ron Hardy, Walter Gibbons, Andrew Weatherall, Erick Morillo and other deceased DJs: not searched.

Included but flagged `verified: false` (real names, details unconfirmed, dates null, src null):
- Labels: Prelude, MAW Records, Underground Resistance (year), Def Jam, Defected, Ninja Tune.
- Venues: Danceteria, The Sound Factory, Twilo, Cielo, Output, Good Room, Nowadays, Elsewhere, Basement.
- Stores (all eight; none was searched): Turntable Lab (web store seen listing 2026 releases; shop status unchecked), Other Music, Rough Trade NYC, Halcyon, Bleecker Bob's, Generation Records, Academy Records, Vinyl Mania. Every status other than Turntable Lab is "unknown".
- Events: WFMU Record Fair.
- DJs: Kerri Chandler, Honey Dijon, Theo Parrish (alive status backed by activity, known_for generic).

Single-source or weakly sourced items that are in the data files:
- Nu Groove 1988 (Record Collector only).
- CDJ-900NXS 2013 (retail/press snippets only).
- Technics RP-DH1200 context (retailer data).
- Rane, Isonoe and MasterSounds years rest on news coverage, not manufacturer pages.
- Transmat, Metroplex, KMS, Planet E years: approximate source mapping (see above).
- Jeff Mills Brooklyn date and Theo Parrish tour dates come from aggregator pages and were not used in the data files.

Recommended follow-up (needs working page fetches or fresh search budget): verify the nine venues, the eight stores, Prelude, MAW Records, Def Jam, Defected, Ninja Tune, Underground Resistance, the Paradise Garage closing year, the Studio 54 opening year, and the LYD and Core Dynaudio years from Dynaudio's own table.

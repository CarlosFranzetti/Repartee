/* Verified gear catalog. Sources in docs/research/gear_and_lore.md
 *
 * Rules used when writing this file:
 *  - "year" is only set when a retrieved source supports it; otherwise null.
 *  - "price" is an in-game dollar value (game economy), NOT a real market claim.
 *    Used gear would be sold cheaper by the shop logic.
 *  - "fact" is a short, neutral, sourced line. Where sources disagree the
 *    conflict is stated in the fact or in RP.data.gearNotes.
 */
(function () {
const RP = window.RP = window.RP || {}; RP.data = RP.data || {};
RP.data.gear = [
  /* ---------------- DECKS: entry-level media players -> CDJ-3000 ---------------- */
  { id: "pioneer_cdj_400", brand: "Pioneer", model: "CDJ-400", slot: "decks", kind: "media_player", year: 2007, tier: 1, price: 250,
    fact: "Announced 7 November 2007 as a budget CD/USB deck for home and aspiring club DJs; plays MP3 files from CD-R/RW and USB devices.",
    src: "https://djworx.com/pioneers-cdj-400-yes-its-real/" },
  { id: "pioneer_cdj_350", brand: "Pioneer", model: "CDJ-350", slot: "decks", kind: "media_player", year: 2010, tier: 1, price: 300,
    fact: "Pioneer's entry-level tabletop player, unveiled at Musikmesse 2010 together with the DJM-350 mixer; a pearl-white version followed in late 2010.",
    src: "https://www.synthtopia.com/?p=22088" },
  { id: "gemini_cdj_700", brand: "Gemini", model: "CDJ-700", slot: "decks", kind: "media_player", year: 2011, tier: 1, price: 200,
    fact: "Unveiled at NAMM in January 2011 as Gemini's flagship tabletop media player; plays CDs, USB and SD cards and has a touchscreen.",
    src: "https://promobile.org.uk/news/archive/344/Gemini-Launch-New-Tabletop-Player" },
  { id: "pioneer_cdj_900", brand: "Pioneer", model: "CDJ-900", slot: "decks", kind: "cdj", year: 2009, tier: 2, price: 650,
    fact: "Launched in 2009 alongside the CDJ-2000 (Pioneer press release of 17 September 2009); plays CD and USB, and Pro DJ Link lets up to four players share one USB device.",
    src: "https://www.mynewsdesk.com/se/pioneer/pressreleases/pioneer-s-cdj-2000-cdj-900-319812" },
  { id: "pioneer_cdj_900nxs", brand: "Pioneer", model: "CDJ-900NXS", slot: "decks", kind: "cdj", year: 2013, tier: 3, price: 1100,
    fact: "Successor to the CDJ-900 with a full-colour LCD, Beat Divide and four-deck beat sync; reported as available from December 2013.",
    src: "https://musicradar.com/news/dj/pioneer-unveils-wi-fi-enabled-cdj-900nxs-588389" },
  { id: "pioneer_cdj_2000", brand: "Pioneer", model: "CDJ-2000", slot: "decks", kind: "cdj", year: 2009, tier: 3, price: 1500,
    fact: "Range-topping player launched in 2009 together with the CDJ-900; later followed by the CDJ-2000NXS and CDJ-2000NXS2.",
    src: "https://www.mynewsdesk.com/se/pioneer/pressreleases/pioneer-s-cdj-2000-cdj-900-319812" },
  { id: "pioneer_cdj_2000nxs2", brand: "Pioneer", model: "CDJ-2000NXS2", slot: "decks", kind: "cdj", year: 2016, tier: 4, price: 2500,
    fact: "Shown at NAMM 2016 with a hi-res touchscreen and a 96 kHz/24-bit sound card; described as a refinement of the NXS models.",
    src: "https://www.digitaldjtips.com/?p=2335951" },
  { id: "pioneer_cdj_3000", brand: "Pioneer DJ", model: "CDJ-3000", slot: "decks", kind: "cdj", year: 2020, tier: 5, price: 3200,
    fact: "Announced September 2020 as the new flagship; first CDJ built around an MPU instead of the DSP architecture of the 2000 range, with a 9-inch touchscreen and no optical CD drive.",
    src: "https://djmag.com/news/pioneer-dj-introduce-their-next-gen-player-cdj-3000" },

  /* ---------------- DECKS: turntables ---------------- */
  { id: "numark_tt1650", brand: "Numark", model: "TT1650", slot: "decks", kind: "turntable", year: null, tier: 1, price: 180,
    fact: "Budget direct-drive turntable; Numark's site now lists it as no longer in production, and a retailer review dated July 2004 shows it was on sale by then.",
    src: "https://www.numark.com/product/tt1650" },
  { id: "at_lp120_usb", brand: "Audio-Technica", model: "AT-LP120-USB", slot: "decks", kind: "turntable", year: 2009, tier: 1, price: 260,
    fact: "Mid-range direct-drive turntable introduced in 2009 with a built-in preamp and USB output; marketed as a successor to the SL-1200 as that line neared its 2010 end.",
    src: "https://en.wikipedia.org/wiki/Audio-Technica_AT-LP120" },
  { id: "at_lp120xusb", brand: "Audio-Technica", model: "AT-LP120XUSB", slot: "decks", kind: "turntable", year: 2019, tier: 2, price: 340,
    fact: "Update announced at CES in January 2019 with an improved internal preamp and the VM95E cartridge.",
    src: "https://en.wikipedia.org/wiki/Audio-Technica_AT-LP120" },
  { id: "technics_sl_1200mk2", brand: "Technics", model: "SL-1200MK2", slot: "decks", kind: "turntable", year: 1979, tier: 2, price: 650,
    fact: "Added quartz-locked servo motor control and a slider pitch control; most sources date it to 1979, one gives 1978. Panasonic ended the SL-1200 line in 2010.",
    src: "https://stereonet.com/features/inside-track-the-second-coming-of-the-technics-sl-1200" },
  { id: "technics_sl_1210mk2", brand: "Technics", model: "SL-1210MK2", slot: "decks", kind: "turntable", year: null, tier: 2, price: 700,
    fact: "The satin-black counterpart of the SL-1200MK2, described as nearly identical in function; the whole 1200/1210 family was discontinued in 2010.",
    src: "https://en.wikipedia.org/wiki/Technics_SL-1200" },
  { id: "technics_sl_1210mk7", brand: "Technics", model: "SL-1210MK7", slot: "decks", kind: "turntable", year: 2019, tier: 4, price: 1100,
    fact: "Announced at CES 2019; the first Technics deck aimed squarely at DJs in nine years, matte black only, launched at 899 GBP / 1000 EUR (the SL-1200MK7 at 1200 USD).",
    src: "https://cdm.link/2019/01/technics-sl-1200-return-mk7/" },

  /* ---------------- MIXERS: 2-channel / 4-channel ---------------- */
  { id: "numark_m101usb", brand: "Numark", model: "M101 USB", slot: "mixer", kind: "mixer_2ch", year: 2011, tier: 1, price: 110,
    fact: "Introduced with the standard M101 in a press release dated 13 January 2011 and shown at the 2011 NAMM Show; a basic two-channel mixer with a USB interface.",
    src: "https://www.numark.com/news/numark-intros-two-new-2-channel-mixers" },
  { id: "pioneer_djm_350", brand: "Pioneer", model: "DJM-350", slot: "mixer", kind: "mixer_2ch", year: 2010, tier: 1, price: 280,
    fact: "Budget two-channel companion to the CDJ-350, announced at Musikmesse 2010 and aimed at repackaging features of the top-end DJM-2000 at a lower price.",
    src: "https://www.synthtopia.com/?p=22088" },
  { id: "behringer_djx750", brand: "Behringer", model: "DJX750", slot: "mixer", kind: "mixer_4ch", year: null, tier: 2, price: 300,
    fact: "Behringer lists it as a 5-channel DJ mixer with advanced digital effects and a BPM counter; no verified launch year.",
    src: "https://www.behringer.com/en/products/0701-AAW" },
  { id: "pioneer_djm_900nxs2", brand: "Pioneer", model: "DJM-900NXS2", slot: "mixer", kind: "mixer_4ch", year: 2016, tier: 4, price: 2300,
    fact: "Unveiled in January 2016 with the CDJ-2000NXS2; the first Pioneer model with a 64-bit mixing processor, plus four phono inputs and a second USB port.",
    src: "https://bpm-mag.com/story/pioneer-introduces-the-new-djm-900nxs2" },

  /* ---------------- MIXERS: rotary (budget -> end-game boutique) ---------------- */
  { id: "omnitronic_trm_202_mk3", brand: "Omnitronic", model: "TRM-202 MK3", slot: "mixer", kind: "rotary", year: null, tier: 3, price: 450,
    fact: "Cited as one of the most affordable entry points into rotary mixing; a dealer listing describes ALPS rotary controls and a built-in 3-band isolator.",
    src: "https://steinigke.de/en/The-advantages-of-analog-rotary-mixers-for-DJs" },
  { id: "bozak_cma_10_2dl", brand: "Bozak", model: "CMA-10-2DL", slot: "mixer", kind: "rotary", year: 1971, tier: 5, price: 6500,
    fact: "Launched in 1971 and generally regarded as the first rotary DJ mixer (knobs instead of faders), built with discrete transistors and no integrated circuits.",
    src: "https://gearnews.com/?p=185190" },
  { id: "urei_1620", brand: "UREI", model: "1620", slot: "mixer", kind: "rotary", year: null, tier: 5, price: 4800,
    fact: "A UREI 1620 had replaced the Bozak mixer in Larry Levan's Paradise Garage booth by 1986; Soundcraft issued a limited-edition 1620LE reissue in 2005. Sources differ on the original production dates.",
    src: "https://mixmag.asia/feature/a-trip-through-dj-booths-1976-2016-1" },
  { id: "es_djr400", brand: "E&S (Electronique Spectacle)", model: "DJR400", slot: "mixer", kind: "rotary", year: null, tier: 5, price: 5200,
    fact: "Four-channel analogue rotary mixer built by Jerome Barbe in Paris as a portable travel mixer to the specification of DJ Deep; reviews place its origin around the turn of the century.",
    src: "https://www.bonedo.de/artikel/electronique-spectacle-es-djr400" },
  { id: "rane_mp2015", brand: "Rane", model: "MP2015", slot: "mixer", kind: "rotary", year: 2015, tier: 5, price: 3500,
    fact: "Rotary mixer with a dual-USB interface unveiled at NAMM in January 2015.",
    src: "https://www.bonedo.de/artikel/namm-2015-rane-stellt-den-mp2015-rotary-mixer-mit-dual-usb-interface-vor" },
  { id: "isonoe_fp_mixer", brand: "Isonoe", model: "FP Mixer", slot: "mixer", kind: "rotary", year: 2014, tier: 5, price: 9000,
    fact: "Two-channel rotary mixer developed with Floating Points (Sam Shepherd), announced November 2014 with no price or release date; described as highly bespoke.",
    src: "https://factmag.com/2014/11/06/floating-points-teams-up-with-isonoe-to-build-world-class-dj-mixer" },
  { id: "condesa_carmen", brand: "Condesa", model: "Carmen", slot: "mixer", kind: "rotary", year: null, tier: 5, price: 4500,
    fact: "Hand-made to order in Adelaide, Australia in brushed stainless steel and walnut, with a fully analogue, discrete audio path.",
    src: "https://thevinylfactory.com/?p=104881" },
  { id: "mastersounds_radius_2", brand: "MasterSounds", model: "Radius 2", slot: "mixer", kind: "rotary", year: 2016, tier: 4, price: 1300,
    fact: "Two-channel rotary mixer first released in 2016; early units were hand-built by Andy Rigby-Jones (Union Audio) in Cornwall, England. The Radius 4 followed shortly after.",
    src: "https://archive.thevinylfactory.com/?p=118060" },
  { id: "alpha_recording_system_model_9900", brand: "Alpha Recording System", model: "Model 9900", slot: "mixer", kind: "rotary", year: null, tier: 5, price: 6000,
    fact: "Six-channel flagship from the Tokyo maker of hand-built rotary mixers, with a three-band isolator on each channel and a master isolator section.",
    src: "https://direct.djmag.com/news/alpha-recording-system-release-new-six-channel-rotary-mixer" },
  { id: "varia_rdm20", brand: "Varia Instruments", model: "RDM20", slot: "mixer", kind: "rotary", year: null, tier: 5, price: 2400,
    fact: "Swiss-built rotary mixer with two permanently active channels and six inputs; the RDM40 is the four-channel sibling.",
    src: "https://45rpm.ch/a-bernese-rotary-boutique-dj-mixer-conquers-the-world/" },
  { id: "can_electric_taula_4_mr", brand: "Can Electric Audio", model: "Taula 4 MR", slot: "mixer", kind: "rotary", year: null, tier: 4, price: 1650,
    fact: "Four-channel 100% analogue rotary mixer handwired in Barcelona; the first Taula was made for the record store Discos Paradiso, and a two-channel Taula 2 MR also exists.",
    src: "https://www.canelectricaudio.com/about" },

  /* ---------------- MONITORS ---------------- */
  { id: "krk_rokit_5_g4", brand: "KRK", model: "Rokit 5 G4", slot: "monitors", kind: "monitor", year: 2018, tier: 1, price: 280,
    fact: "Fourth-generation Rokit with a yellow woven-Kevlar woofer, announced at the 2018 Winter NAMM Show; the G4 range is Rokit 5, 7, 8 and the three-way 10-3.",
    src: "https://www.mixonline.com/technology/krk-rokit-g4-monitors" },
  { id: "dynaudio_bm5_mkiii", brand: "Dynaudio", model: "BM5 mkIII", slot: "monitors", kind: "monitor", year: 2014, tier: 3, price: 1200,
    fact: "Listed in Dynaudio's own studio-monitor history table as in production from 2014.",
    src: "https://dynaudio.com/faq/studio-monitors-history" },
  { id: "dynaudio_lyd_5", brand: "Dynaudio", model: "LYD 5", slot: "monitors", kind: "monitor", year: null, tier: 4, price: 1700,
    fact: "LYD 5, 7 and 8 were introduced at Musikmesse in Frankfurt; a retailer listing gives 2017 but Dynaudio's own table was not seen confirming it.",
    src: "https://www.bonedo.de/marke/dynaudio/" },
  { id: "dynaudio_core_47", brand: "Dynaudio", model: "Core 47", slot: "monitors", kind: "monitor", year: 2019, tier: 5, price: 3500,
    fact: "Dynaudio's history table lists the Core 47 as 2019 (Core 59 as 2018); the Core series is tied to the company's 30th anniversary by one retailer.",
    src: "https://dynaudio.com/faq/studio-monitors-history" },

  /* ---------------- HEADPHONES ---------------- */
  { id: "sennheiser_hd25", brand: "Sennheiser", model: "HD 25", slot: "headphones", kind: "headphones", year: null, tier: 2, price: 120,
    fact: "Long-running DJ and monitoring headphone; Thomann dates the launch to 1988 while Stereophile dates it to 1989 from the original manual, and the 'II' naming came in 2007.",
    src: "https://stereophile.com/content/sennheiser-hd-25-1-ii-and-adidas-original-hd-25" },
  { id: "technics_rp_dh1200", brand: "Technics", model: "RP-DH1200", slot: "headphones", kind: "headphones", year: null, tier: 3, price: 150,
    fact: "Technics DJ headphones from the 2000s (one retailer's data gives June 2008, unconfirmed); Technics launched the successor EAH-DJ1200 in 2019.",
    src: "https://www.digitaldjtips.com/technics-launches-eah-dj1200-headphones/" },

  /* ---------------- CARTRIDGES ---------------- */
  { id: "ortofon_concorde_club", brand: "Ortofon", model: "Concorde Club", slot: "cartridge", kind: "cartridge", year: null, tier: 2, price: 90,
    fact: "Part of Ortofon's second-generation Concorde MkII DJ range (Mix, DJ, Club, Scratch, Digital); the original Concorde dates to 1979 and its integrated headshell fits SME-type arms such as the SL-1200's.",
    src: "https://www.hifipig.com/ortofon-concorde-mk-ii-cartridges-launched/" },
  { id: "shure_m44_7", brand: "Shure", model: "M44-7", slot: "cartridge", kind: "cartridge", year: null, tier: 3, price: 120,
    fact: "Shure announced on 1 May 2018 that it would end its phono line; Shure UK clarified that day that only the headshell-mounted M44-7H was discontinued, and retailers later list the M44-7 as discontinued.",
    src: "https://djworx.com/?p=35488" }
];

RP.data.gearNotes = {
  taula: "Taula is real: the Taula 4 MR (four-channel) and Taula 2 MR (two-channel) are 100% analogue rotary DJ mixers handwired by Can Electric Audio in Barcelona, a company founded in 2015 after the record store Discos Paradiso commissioned a custom mixer (company About page).",
  technics: "SL-1200 first introduced 1972; MK2 1979 (one source says 1978); Panasonic announced the end of the line in 2010 (sources give 20 Oct or 1 Nov 2010) after roughly 3.5 million SL-1200/SL-1210 units; Technics brand revived 2014; SL-1200GAE/G announced at CES 2016; SL-1200MK7 announced at CES 2019. The 1210 is the satin-black version of the 1200. Exact years for MK3-MK6 conflict between sources and are deliberately not stated.",
  cdj: "Pioneer CDJ lineage (sources agree on): CDJ-500 1994, CDJ-1000 about 2001 (one mirror says 2004), CDJ-2000 and CDJ-900 2009, CDJ-2000NXS2 2016, CDJ-3000 announced September 2020.",
  rotaryOpenToClose: "Owner's 'Louie Vega Open To Close' could not be verified; search results show 'open to close' as the title of a Francois K event, and Louie Vega's own long-set format reported as 'All Night Long'."
};
})();

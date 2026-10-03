// Sheet 05: sources and notes. Full working notes, with a confidence tag on
// every figure, are in research/facts.md and research/stations.json.
const GROUPS = [
  ['L', 'Lines, dates and totals', [
    ['MTR Corporation, Annual Report 2004 (25-year timeline)', 'https://www.mtr.com.hk/archive/corporate/en/investor/2004frpt_e/annual%20report%202004(E).pdf'],
    ['MTR Corporation, Business Overview (data as at December 2024)', 'https://www.mtr.com.hk/archive/corporate/en/publications/images/business_overview_e.pdf'],
    ['MTR Corporation, Offering Circular, 3 November 2025', 'https://www.mtr.com.hk/archive/corporate/en/investor/sehk/eCover_Sheet_and_OC_20251103.pdf'],
    ['MTR Corporation, Company Overview, July 2026', 'https://www.mtr.com.hk/archive/corporate/ch/investor/im/202607_MTR_Company_Overview_preblackout.pdf'],
    ['MTR Corporation, company profile (founded 1975)', 'https://www.mtr.com.hk/en/corporate/overview/profile_index.html'],
    ['KCRC, corporate history', 'https://www.kcrc.com/en/about-kcrc/history.html'],
    ['KCRC, Annual Report 2004', 'https://www.kcrc.com/download/en/corporate-and-financial-information/annual-reports/annual-report-2004.pdf'],
    ['Transport and Logistics Bureau, Railway Network, September 2025', 'https://www.tlb.gov.hk/eng/publications/transport/publications/railwaynetworkSep2025.html'],
    ['Legislative Council paper CB(3)753/2026(03), 3 July 2026', 'https://www.legco.gov.hk/yr2026/english/panels/tp/tp_rsc/papers/tp_rsc20260703cb3-754-3-e.pdf'],
    ['Census and Statistics Department, Monthly Digest of Statistics, December 1971 (1971 census)', 'https://www.statistics.gov.hk/pub/hist/1971_1980/B10100021971MM12E0100.pdf'],
  ]],
  ['D', 'Depths and levels', [
    ['MTR station layout drawings, one PDF per station (this one: Admiralty)', 'https://www.mtr.com.hk/archive/en/services/layouts/adm.pdf'],
    ['MTR press release PR108/14: West Island Line stations, 19 November 2014', 'https://www.mtr.com.hk/archive/corporate/en/press_release/PR-14-108-E.pdf'],
    ['MTR, reply on Admiralty’s lowest level (−33.6 mPD), 17 July 2022', 'https://www.facebook.com/mtrhk/posts/10167269710335151'],
    ['MTR press release PR081/22: Admiralty and Exhibition Centre, 29 December 2022', 'https://www.mtr.com.hk/archive/corporate/en/press_release/PR-22-081-E.pdf'],
    ['MTR Fun Facts sheet (HKU exit 91 m above sea level), Hong Kong Science Museum', 'https://hk.science.museum/documents/22775016/27467297/MTR_fun_fact.pdf'],
    ['CEDD, Geoguide 4: Guide to Cavern Engineering', 'https://www.cedd.gov.hk/filemanager/eng/content_112/eg4_20180102.pdf'],
    ['Hong Kong Engineer, March 2015: the West Island Line', 'https://www.hkengineer.org.hk/issue/vol43-mar2015/cover_story'],
    ['Hong Kong Engineer, November 2016: the Kwun Tong Line Extension', 'https://www.hkengineer.org.hk/issue/vol44-nov2016/cover_story'],
    ['The Arup Journal 1/1999: Hong Kong station', 'https://www.arup.com/globalassets/downloads/arup-journal/the-arup-journal-1999-issue-1.pdf'],
    ['Lau & Cook (2020), Island Line underpinning at Admiralty, ITA World Tunnel Congress', 'https://library.ita-aites.org/wtc/1916-design-and-construction-of-the-island-line-underpinning-at-admiralty-station-hong-kong.html'],
  ]],
  ['C', 'Construction and ground', [
    ['Proceedings of the ICE, 1980: papers on the Modified Initial System (stations, tunnels, harbour crossing)', 'https://gbarail.github.io/mtr-papers/'],
    ['Highways Department, Tsing Ma Bridge fact sheet', 'https://www.hyd.gov.hk/en/information_corner/hyd_factsheets/doc/e_Tsing_Ma_Bridge.pdf'],
    ['Highways Department, Kap Shui Mun Bridge fact sheet', 'https://www.hyd.gov.hk/en/information_corner/hyd_factsheets/doc/e_Kap_Shui_Mun_Bridge.pdf'],
    ['Tunnels & Tunnelling, Rock cavern design on the West Island Line, 2012', 'https://www.tunnelsandtunnelling.com/analysis/rock-cavern-design-on-the-west-island-line'],
    ['New Civil Engineer, Challenges of the South Island Line, 2016', 'https://www.newcivilengineer.com/archive/south-east-asia-challenges-of-hong-kongs-south-island-line-03-02-2016'],
    ['Arup, FIRST no. 4: Ho Man Tin station', 'https://www.arup.com.hk/marketing/FIRST_magazine-Foresight_Innovation_Research_Shaing_Training/Issue%204/First-04.pdf'],
    ['Legislative Council, West Rail progress paper, July 2001', 'https://www.legco.gov.hk/yr00-01/english/panels/tp/tp_rdp/papers/a1737e01.pdf'],
    ['Gammon Construction, Kowloon Southern Link', 'https://www.gammonconstruction.com/en/project-details.php?project_id=111'],
    ['MTR, why each tunnel boring machine has a name', 'https://mtrtungchunglineextension.hk/news/tunnel-boring-machine-tbm-trivia-why-name-a-tbm?lang=en'],
    ['Tunnelling Journal, Hong Kong’s immersed tube milestone (Shatin to Central Link)', 'https://tunnellingjournal.com/hong-kongs-immersed-tube-milestone/'],
    ['CEDD, GEO Report 187: geology of the north shore of Hong Kong Island', 'https://www.cedd.gov.hk/filemanager/eng/content_342/er187.pdf'],
    ['ITA Tunnelling Awards 2017 proceedings: Shatin to Central Link (VINCI)', 'https://awards.ita-aites.org/component/cck/?task=download&file=proceeding&id=1833'],
    ['MTR, Historical relics in MTR stations (Sung Wong Toi)', 'https://www.mtr.com.hk/en/customer/community/relics_display_in_station.html'],
  ]],
  ['S', 'Station data', [
    ['MTR open data: lines and stations (station order and names)', 'https://opendata.mtr.com.hk/data/mtr_lines_and_stations.csv'],
    ['English Wikipedia station articles, one per station, linked from each station card (structure type and opening dates, cross-checked against the sources above)', 'https://en.wikipedia.org/wiki/List_of_MTR_stations'],
  ]],
];

export function initSources(root) {
  root.textContent = '';
  const lists = document.createElement('div');
  lists.className = 'src-groups';
  GROUPS.forEach(([prefix, title, items]) => {
    const sec = document.createElement('section');
    sec.innerHTML = `<h3>${title}</h3><ol class="src-list">${items.map(([t, u], i) => {
      const id = `${prefix}${String(i + 1).padStart(2, '0')}`;
      return `<li id="src-${id}"><span class="src-id">${id}</span><a href="${u}" rel="noopener">${t}</a></li>`;
    }).join('')}</ol>`;
    lists.appendChild(sec);
  });
  const link = (html) => html.replace(/\[([A-Z]\d\d)\]/g, '[<a href="#src-$1">$1</a>]');
  const notes = document.createElement('div');
  notes.className = 'notes';
  notes.innerHTML = link(`
    <h3>Notes</h3>
    <p>Source IDs in square brackets elsewhere on the page, such as [D03], point to this list.</p>
    <p><strong>Two kinds of depth.</strong> Some figures are measured down from the street or an entrance, others from Hong Kong’s Principal Datum (mPD), a survey level close to sea level. They answer different questions. Measured from its uphill entrance, HKU is the deepest station, at about 70 m. Measured from sea level, MTR names Admiralty, whose lowest level is at −33.6 mPD. Much of HKU’s depth is the hill above it.</p>
    <p><strong>Excavation depth is not platform depth.</strong> The 17–28 m figures for the first line are how deep the station pits were dug, from the 1980 engineering papers.</p>
    <p><strong>Uncertain points.</strong> Sources disagree on a few dates: whether the Eastern Harbour Crossing service began on 5 or 6 August 1989, how the Tsuen Wan Line’s opening was phased in May 1982, and when Lam Tin reopened after its first-day flood. The page gives the dates the sources agree on. Line colours are the values in common use; MTR does not publish them.</p>
    <p><strong>The 3D model</strong> places stations by their real coordinates [S01, S02] and draws every level relative to sea level (Hong Kong Principal Datum). MTR gives some levels in that datum directly, such as Admiralty\u2019s lowest at \u221233.6 mPD [D03]. Figures published \u201cbelow the street\u201d are converted on the assumption that streets on the flat harbour-front land are about 5 m above datum. Where no level is published, a station is drawn at a typical level for its type: about 18 m below the street underground, 12 m above it on a viaduct. At interchanges, unpublished levels follow the order in MTR\u2019s layout drawings [D01]. All of these are open markers labelled \u201cestimated\u201d. A few rock-cavern stations (HKU, Sai Ying Pun, Lei Tung, Tai Koo) are placed from what is known about the rock above them; each one\u2019s panel explains how. The entrances at HKU [D05] and Ho Man Tin [D08] are drawn at their published heights; Sai Ying Pun\u2019s is approximate, worked out from its 75 m lift shaft [D07], and Lei Tung\u2019s is approximate, from the 38 m of rock above the cavern [D06]. The 1980 harbour tube\u2019s lowest point is from [C01]; the other tube depths and the bridge deck heights [C02] are approximate.</p>
    <p><strong>The map</strong> is a hand-drawn schematic. Stations are in the right order and roughly in the right places, but distances and angles are simplified. Station lists were checked against MTR\u2019s open data, and each station\u2019s structure type and opening date carries a source in the working files.</p>
    <p><strong>Totals.</strong> There are 99 heavy-rail stations, counting West Kowloon. The whole rail network, including Light Rail and the high-speed line, is about 271 km [L08]. MTR\u2019s own headline figure of 245.3 km leaves out the high-speed line [L02]. East Rail dates from 1910 and was run by the KCR until the 2007 merger [L06].</p>
    <p><strong>What is left out:</strong> Light Rail (68 stops), the high-speed line to West Kowloon (2018), and lines under construction, such as Kwu Tung (due 2027) and the Tung Chung Line extension (due 2029) [L09].</p>`);
  root.append(lists, notes);
  if (location.hash.startsWith('#src-')) document.querySelector(location.hash)?.scrollIntoView();
}

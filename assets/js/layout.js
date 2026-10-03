// Hand-placed schematic layout for the network map (viewBox 1300 × 940).
// Positions follow the real geography loosely; lines run straight between
// stations, with waypoints where a line bends between two stops.
// Label codes: r, l, t, b, tr, tl, br, bl, optionally ':dx:dy'.
export const VIEW = [1300, 940];
const OY = 18; // shifts the whole drawing down, clear of the top edge

const RAW = {
  // Island Line
  'kennedy-town': [250, 760, 'b'], hku: [300, 760, 't'], 'sai-ying-pun': [352, 760, 'b'], 'sheung-wan': [406, 760, 't'],
  central: [490, 760, 'b:-6'], admiralty: [560, 760, 'br:6'], 'wan-chai': [625, 760, 't:8'], 'causeway-bay': [680, 760, 'b:6'],
  'tin-hau': [735, 760, 't'], 'fortress-hill': [790, 760, 'b'], 'north-point': [845, 760, 't:-8'], 'quarry-bay': [900, 760, 'b'],
  'tai-koo': [955, 760, 't'], 'sai-wan-ho': [1010, 760, 'b'], 'shau-kei-wan': [1065, 760, 't'],
  'heng-fa-chuen': [1110, 806, 'r'], 'chai-wan': [1110, 854, 'r'],
  // South Island Line
  'ocean-park': [560, 836, 'r'], 'wong-chuk-hang': [515, 880, 'b'], 'lei-tung': [445, 880, 't'], 'south-horizons': [375, 880, 'b'],
  // Tsuen Wan Line
  'tsim-sha-tsui': [560, 640, 'l'], jordan: [560, 580, 'l'], 'yau-ma-tei': [560, 520, 'l'], 'mong-kok': [560, 460, 'l'],
  'prince-edward': [560, 400, 'tr'], 'sham-shui-po': [500, 400, 't'], 'cheung-sha-wan': [440, 400, 'b'], 'lai-chi-kok': [380, 400, 't'],
  'mei-foo': [320, 400, 'br'], 'lai-king': [276, 356, 'r'], 'kwai-fong': [300, 314, 'r'], 'kwai-hing': [300, 272, 'r'],
  'tai-wo-hau': [300, 230, 'r'], 'tsuen-wan': [300, 188, 'r'],
  // Kwun Tong Line
  whampoa: [712, 604, 'r'], 'ho-man-tin': [660, 560, 'tr'], 'shek-kip-mei': [630, 400, 'b'], 'kowloon-tong': [700, 400, 'br'],
  'lok-fu': [770, 400, 't'], 'wong-tai-sin': [840, 400, 'b:8'], 'diamond-hill': [910, 400, 'tr'], 'choi-hung': [980, 400, 'r'],
  'kowloon-bay': [1012, 432, 'r'], 'ngau-tau-kok': [1044, 464, 'r'], 'kwun-tong': [1076, 496, 'r'], 'lam-tin': [1108, 528, 'l'],
  'yau-tong': [1140, 560, 'l:-4'], 'tiu-keng-leng': [1192, 560, 'b:-6'],
  // Tseung Kwan O Line
  'tseung-kwan-o': [1240, 520, 'l'], 'hang-hau': [1240, 476, 'l'], 'po-lam': [1240, 432, 'l'], 'lohas-park': [1240, 600, 'b'],
  // East Rail Line
  'exhibition-centre': [606, 716, 'r'], 'hung-hom': [630, 620, 'r'], 'mong-kok-east': [640, 460, 'r'],
  'tai-wai': [700, 340, 'l'], 'sha-tin': [700, 296, 'l'], 'fo-tan': [700, 254, 'r'], racecourse: [660, 254, 'l'],
  university: [700, 212, 'r'], 'tai-po-market': [700, 172, 'r'], 'tai-wo': [700, 134, 'r'], fanling: [700, 96, 'r'],
  'sheung-shui': [700, 58, 'r'], 'lo-wu': [700, 20, 'r'], 'lok-ma-chau': [656, 20, 'l'],
  // Tuen Ma Line
  'wu-kai-sha': [1040, 30, 'r'], 'ma-on-shan': [1000, 68, 'r'], 'heng-on': [960, 106, 'r'], 'tai-shui-hang': [920, 144, 'r'],
  'shek-mun': [880, 182, 'r'], 'city-one': [840, 220, 'r'], 'sha-tin-wai': [800, 258, 'r'], 'che-kung-temple': [760, 296, 'r'],
  'hin-keng': [780, 350, 'tr'], 'kai-tak': [910, 466, 'r'], 'sung-wong-toi': [862, 514, 'r'], 'to-kwa-wan': [790, 560, 'b'],
  'east-tsim-sha-tsui': [610, 660, 'r'], austin: [490, 610, 'bl:6'], 'nam-cheong': [430, 500, 'tr'],
  'tsuen-wan-west': [220, 300, 'l'], 'kam-sheung-road': [176, 214, 'r'], 'yuen-long': [140, 176, 't'], 'long-ping': [100, 176, 'b'],
  'tin-shui-wai': [60, 176, 't'], 'siu-hong': [30, 214, 'r'], 'tuen-mun': [30, 258, 'r'],
  // Tung Chung Line, Airport Express, Disneyland Resort Line
  'hong-kong': [470, 722, 'l'], kowloon: [430, 630, 'l'], olympic: [430, 566, 'l'],
  'tsing-yi': [180, 356, 't'], 'sunny-bay': [110, 420, 'r'], 'tung-chung': [46, 490, 'b'],
  airport: [30, 426, 'b'], 'asiaworld-expo': [30, 378, 'r'], 'disneyland-resort': [110, 486, 'r'],
};

export const POS = Object.fromEntries(Object.entries(RAW).map(([k, [x, y, l]]) => [k, [x, y + OY, l]]));
const w = (x, y) => [x, y + OY];

// Each line is a list of stops (ids) and waypoints ([x, y]) in order.
// Branches are separate paths. `dash` marks track used only part of the time.
export const PATHS = [
  { line: 'ISL', pts: ['kennedy-town', 'hku', 'sai-ying-pun', 'sheung-wan', 'central', 'admiralty', 'wan-chai', 'causeway-bay', 'tin-hau', 'fortress-hill', 'north-point', 'quarry-bay', 'tai-koo', 'sai-wan-ho', 'shau-kei-wan', 'heng-fa-chuen', 'chai-wan'] },
  { line: 'SIL', pts: ['admiralty', 'ocean-park', 'wong-chuk-hang', 'lei-tung', 'south-horizons'] },
  { line: 'TWL', pts: ['central', 'admiralty', 'tsim-sha-tsui', 'jordan', 'yau-ma-tei', 'mong-kok', 'prince-edward', 'sham-shui-po', 'cheung-sha-wan', 'lai-chi-kok', 'mei-foo', 'lai-king', 'kwai-fong', 'kwai-hing', 'tai-wo-hau', 'tsuen-wan'] },
  { line: 'KTL', pts: ['whampoa', 'ho-man-tin', 'yau-ma-tei', 'mong-kok', 'prince-edward', 'shek-kip-mei', 'kowloon-tong', 'lok-fu', 'wong-tai-sin', 'diamond-hill', 'choi-hung', 'kowloon-bay', 'ngau-tau-kok', 'kwun-tong', 'lam-tin', 'yau-tong', 'tiu-keng-leng'] },
  { line: 'TKL', pts: ['north-point', 'quarry-bay', 'yau-tong', 'tiu-keng-leng', 'tseung-kwan-o', 'hang-hau', 'po-lam'] },
  { line: 'TKL', pts: ['tseung-kwan-o', 'lohas-park'] },
  { line: 'EAL', pts: ['admiralty', 'exhibition-centre', 'hung-hom', w(640, 580), 'mong-kok-east', 'kowloon-tong', 'tai-wai', 'sha-tin', 'fo-tan', 'university', 'tai-po-market', 'tai-wo', 'fanling', 'sheung-shui', 'lo-wu'] },
  { line: 'EAL', pts: ['sheung-shui', 'lok-ma-chau'] },
  { line: 'EAL', pts: ['sha-tin', 'racecourse', 'university'], dash: true },
  { line: 'TML', pts: ['wu-kai-sha', 'ma-on-shan', 'heng-on', 'tai-shui-hang', 'shek-mun', 'city-one', 'sha-tin-wai', 'che-kung-temple', 'tai-wai', 'hin-keng', 'diamond-hill', 'kai-tak', 'sung-wong-toi', 'to-kwa-wan', 'ho-man-tin', 'hung-hom', 'east-tsim-sha-tsui', w(560, 610), 'austin', w(462, 582), w(462, 530), 'nam-cheong', w(320, 500), 'mei-foo', w(220, 400), 'tsuen-wan-west', 'kam-sheung-road', 'yuen-long', 'long-ping', 'tin-shui-wai', 'siu-hong', 'tuen-mun'] },
  { line: 'TCL', pts: ['hong-kong', 'kowloon', 'olympic', 'nam-cheong', w(430, 440), w(290, 440), 'lai-king', 'tsing-yi', 'sunny-bay', 'tung-chung'] },
  { line: 'AEL', pts: ['hong-kong', 'kowloon', w(423, 566), w(423, 447), w(283, 447), w(269, 363), 'tsing-yi', w(106, 426), 'airport', 'asiaworld-expo'] },
  { line: 'DRL', pts: ['sunny-bay', 'disneyland-resort'] },
];

// Victoria Harbour, drawn to fit the schematic (not to scale).
export const HARBOUR_SCHEMATIC = [
  [330, 728], [372, 706], [410, 688], [460, 678], [520, 682], [580, 686], [640, 682], [700, 644], [760, 622],
  [840, 604], [940, 600], [1040, 602], [1100, 614], [1150, 642], [1180, 690],
  [1160, 722], [1090, 738], [1000, 740], [900, 738], [800, 734], [700, 728], [650, 714], [612, 700], [575, 712],
  [530, 716], [490, 716], [445, 716], [400, 722], [356, 730],
].map(([x, y]) => [x, y + OY]);

export const PLACES = [
  [360, 90 + OY, 'New Territories', 'start'],
  [40, 560 + OY, 'Lantau', 'start'],
  [1140, 912 + OY, 'Hong Kong Island', 'end'],
  [780, 690 + OY, 'Victoria Harbour', 'middle'],
];

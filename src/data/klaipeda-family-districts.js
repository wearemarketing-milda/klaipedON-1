/**
 * Klaipėdos gyvenamųjų rajonų zonos — geometrija atitinka zemelapio-fonas.webp (1448×1086).
 * Path koordinatės visada pilname 1448×1086 plote; viewBox crop’ina vaizdą arčiau miesto.
 */
export const MAP_IMAGE_SIZE = { width: 1448, height: 1086 };
export const MAP_VIEWBOX = { x: 400, y: 0, width: 1048, height: 990 };

export const familyDistrictOrder = ["senamiestis", "centras", "pietine", "siaurine", "giruliai"];

export const familyDistrictStyles = {
  accent: "#1d4f91",
  default: {
    strokeColor: "#1d4f91",
    strokeOpacity: 0.25,
    strokeWeight: 1.5,
    fillColor: "#1d4f91",
    fillOpacity: 0,
  },
  active: {
    strokeColor: "#1d4f91",
    strokeOpacity: 0.6,
    strokeWeight: 3,
    fillColor: "#1d4f91",
    fillOpacity: 0.2,
  },
  muted: {
    strokeColor: "#1d4f91",
    strokeOpacity: 0.25,
    strokeWeight: 1.5,
    fillColor: "#1d4f91",
    fillOpacity: 0,
  },
};

const districtGeometry = [
  {
    id: "giruliai",
    name: "Giruliai ir Melnragė",
    labelX: 640,
    labelY: 150,
    svgD:
      "M573,0 L573,30 L580,60 L586,90 L593,120 L598,150 L601,180 L603,210 L605,240 L609,270 L612,300 L662,318 L724,300 L721,270 L717,240 L715,210 L713,180 L710,150 L705,120 L698,90 L692,60 L685,30 L685,0 Z",
  },
  {
    id: "siaurine",
    name: "Šiaurinė miesto dalis",
    labelX: 880,
    labelY: 180,
    svgD:
      "M693,0 L693,30 L700,60 L706,90 L713,120 L718,150 L721,180 L723,210 L725,240 L729,270 L732,300 L672,344 L662,392 L702,424 L790,410 L876,392 L958,364 L1032,352 L1046,150 L1028,0 Z",
  },
  {
    id: "centras",
    name: "Centras",
    labelX: 920,
    labelY: 500,
    svgD:
      "M746,422 L834,406 L942,372 L1032,368 L1074,470 L1052,586 L972,642 L866,654 L788,630 L800,540 L818,470 Z",
  },
  {
    id: "senamiestis",
    name: "Senamiestis",
    labelX: 790,
    labelY: 480,
    svgD:
      "M720,424 L749,454 L766,484 L767,514 L780,544 L783,548 L818,542 L828,468 L798,430 L746,422 Z",
  },
  {
    id: "pietine",
    name: "Pietinė miesto dalis",
    labelX: 920,
    labelY: 800,
    svgD:
      "M811,604 L820,634 L827,664 L834,694 L841,724 L849,754 L868,784 L815,814 L848,844 L853,874 L860,904 L865,934 L882,964 L898,994 L907,1024 L913,1040 L900,1058 L1012,976 L1076,850 L1088,712 L1050,600 L970,648 L866,658 L790,632 Z",
  },
];

/** @type {Map<string, typeof districtGeometry[0]>} */
const geometryById = new Map(districtGeometry.map((d) => [d.id, d]));

export const familyDistricts = familyDistrictOrder.map((id) => {
  const geo = geometryById.get(id);

  return {
    id,
    name: geo.name,
    svgD: geo.svgD,
    labelX: geo.labelX,
    labelY: geo.labelY,
    paths: [],
  };
});

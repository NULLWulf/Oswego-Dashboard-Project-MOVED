mapboxgl.accessToken = // new style url
  "pk.eyJ1IjoibmR3b2xmMTk5MSIsImEiOiJjbDA4aGppczcwM2kzM2pxdHZydmdsYm5yIn0.ZPuI0T1FxHGAJu_wklsSXg"; // public token, not able to make changes to map itself with it
// only access style layer etc.
const _bounds = 0.5;
const flyToZoom = 18; // maximum zoom level after FlyToZoom is initialized when interacting with building icons
const defaultStyle = "mapbox://styles/ndwolf1991/cl1f5gcur004t15mf6m1dt47j";
const satelliteStyle = "mapbox://styles/mapbox/satellite-v9";

let currentStyle = 0;

const map = new mapboxgl.Map({
  // creates Mapbox object
  container: "map", // container ID
  style: defaultStyle, // new style url
  center: [-76.543134, 43.453054], // starting position [lng, lat]
  zoom: 15.65, // initial zoom start
  bearing: -37.25, // slightly off north to show majority of campus
  pitch: 0, // directly overhead
  // maxBounds: _mapPanBound,
});

function bondFeatures(bound, map, event) {
  // if (map.loaded()) {
  const bbox = [
    // based off of pixel width to determine bounds
    [event.point.x - bound, event.point.y - bound],
    [event.point.x + bound, event.point.y + bound],
  ];
  return map.queryRenderedFeatures(bbox, { layers: ["buildings"] }); // returns Objecct that corresponds with data values under point
  // bounds are passed in so you can tweak the click radius of the element corresponding with each building.
  // function to get data features underneath point when an event is passed through
  // }
}
map.on("click", (event) => {
  const features = bondFeatures(_bounds, map, event); // attempts to get features within a certain radial point, tweak _Bounds to make radius more liberal/conservative
  // ensureClose("right"); // ensures right sidebar collapses

  if (features.length == 1) {
    // // will trigger if any features exist under point and open side bar.
    // // TODO Consideration:  Make this similar to the left side bar where the html is static on the index.html
    // // Populates building data as html
    // const popupHtml = `
    // <div><img src="images/building-images/${features[0].properties.buildingNo}.jpg" alt="Image of ${features[0].properties.name}"></img></div>
    // <div><strong>Building No: </strong>${features[0].properties.buildingNo}</div>
    // <div><strong>Ft<sup>2</sup>: </strong>${features[0].properties.squareFt}</div>
    // <div><a href="https://aim.sucf.suny.edu/fmax/screen/MASTER_ASSET_VIEW?assetTag=${features[0].properties.assetID}" target="_blank"><strong>AIM Asset View</strong></a></div>
    // `;
    // document.getElementById("right-sidebar-body-inserter").innerHTML =
    //   popupHtml; // inserts into sidebar
    // sets buildings name in top content area
    // toggleSidebar("right"); // toggles sidebar should close and reopen as new building if mousedowning new building
    document.getElementById("building-header").innerHTML =
      features[0].properties.name;
    document.getElementsByClassName("fs-logo-building")[0].src = `
    images/building-images/${features[0].properties.buildingNo}.jpg
    `;
    console.log(features[0].properties);
  } else {
    document.getElementById("building-header").innerHTML = "Select a Building";
    document.getElementsByClassName("fs-logo-building")[0].src =
      "./images/branding/inverted_fs.png";
  }
});

map.on("click", "buildings", (e) => {
  const constraintZoom = map.getZoom() > flyToZoom ? map.getZoom() : flyToZoom; // if zoom is less than fly too zoom constraint, uses current zoom level
  // notes higher zoom level means more magnifation
  map.flyTo({
    center: e.features[0].geometry.coordinates, // centers map based on exact point in geoJson array
    zoom: constraintZoom, // new constrainted zoom, since this is an object data value, variable needs to be declares up top
    speed: 0.3,
  });
});

map.on("mouseenter", "buildings", () => {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "buildings", () => {
  map.getCanvas().style.cursor = "";
});

map.on("mousemove", (event) => {
  // tracks live map data based on position of map, zoom, bearing, pitch etc. Mostly used for testing
  const features = bondFeatures(_bounds, map, event);

  document.getElementById("building").innerHTML = features.length
    ? JSON.stringify(features[0].properties.name)
    : "N/a";
  document.getElementById("coords").innerHTML = JSON.stringify(event.point);
  document.getElementById("mlat").innerHTML = JSON.stringify(event.lngLat.lat);
  document.getElementById("mlng").innerHTML = JSON.stringify(event.lngLat.lng);
  document.getElementById("clat").innerHTML = map.getCenter().lat;
  document.getElementById("clng").innerHTML = map.getCenter().lng;
  document.getElementById("currentZoom").innerHTML = map.getZoom();
  document.getElementById("bearing").innerHTML = map.getBearing();
  document.getElementById("pitch").innerHTML = map.getPitch();
});

function flyToId(id) {
  map.flyTo({
    center: regions[id].center,
    zoom: regions[id].zoom,
    speed: 0.6,
    bearing: regions[id].bearing,
  });
}

function toggleSidebar(id) {
  let elem = document.getElementById(id);
  let classes = elem.className.split(" ");
  let padding = {};

  if (elem.classList.contains("collapsed")) {
    // Remove the 'collapsed' class from the class list of the element, this sets it back to the expanded state.
    classes.splice(classes.indexOf("collapsed"), 1);
  } else {
    padding[id] = 0;
    // Add the 'collapsed' class to the class list of the element
    classes.push("collapsed");
  }

  // Update the class list on the element
  elem.className = classes.join(" ");
}

function ensureClose(id) {
  let elem = document.getElementById(id);
  if (!elem.classList.contains("collapsed")) {
    let classes = elem.className.split(" ");
    let padding = {};
    padding[id] = 0;
    classes.push("collapsed");
    elem.className = classes.join(" ");
  }
}

function toggleMapStyle() {
  if (currentStyle == 0) {
    map.setLayoutProperty("mapbox-satellite", "visibility", "visible");
    document.getElementById("style-toggle").innerHTML = "Default View";
    currentStyle = 1;
  } else {
    map.setLayoutProperty("mapbox-satellite", "visibility", "none");
    document.getElementById("style-toggle").innerHTML = "Satellite View";
    currentStyle = 0;
  }
}

const regions = [
  {
    region: "central",
    center: [-76.54294334759209, 43.45347920082102],
    zoom: 16.875459902527414,
    bearing: -32,
  },
  {
    region: "lakeside",
    center: [-76.54021035103943, 43.45724401433708],
    zoom: 17.11144729,
    bearing: -37,
  },
  {
    region: "east",
    center: [-76.53636691718475, 43.45522585648385],
    zoom: 16.9951515,
    bearing: 0,
  },
  {
    region: "west",
    center: [-76.54866150274084, 43.45050187154001],
    zoom: 17.73465424,
    bearing: -50,
  },
  {
    region: "athletic",
    center: [-76.53619107389581, 43.4476488569735],
    zoom: 16.55784477,
    bearing: -32,
  },
  {
    region: "village",
    center: [-76.54833021875518, 43.44783233942783],
    zoom: 17.88606643,
    bearing: -42,
  },
  {
    region: "rice",
    center: [-76.54966430787358, 43.429976388125624],
    zoom: 17.75221243425645,
    bearing: -32,
  },
  {
    region: "fallbrook",
    center: [-76.53989823543341, 43.42480854657407],
    zoom: 17.250656149181214,
    bearing: -32,
  },
  {
    region: "downtown",
    center: [-76.5071990728699, 43.45745286540054],
    zoom: 18.37727826852788,
    bearing: -20,
  },
  {
    region: "syracuse",
    center: [-76.15364909821363, 43.05075196784364],
    zoom: 18.631023835047465,
    bearing: -19.686627218935314,
  },
];

const nav = new mapboxgl.NavigationControl({
  compass: true,
});
map.addControl(nav, "bottom-left");

const buildings = {
  features: [
    {
      type: "Feature",
      properties: {
        buildingNo: "5",
        name: "Shady Shore",
        buildAbr: "SHADY SHORE-5",
        address: "6 Rudolph Rd,Oswego,NY,13126",
        lat: 43.45803543,
        long: -76.53677207,
        squareFt: "8754",
        assetID: "1741",
      },
      geometry: {
        coordinates: [-76.536772, 43.458035],
        type: "Point",
      },
      id: "02cf4cc0c882a3ef85818d2a593ce6bb",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0037B",
        name: "TOWNHOUSE B",
        buildAbr: "TWNHSB",
        address: "90 Iroquois Trail,Oswego NY,NY,13126",
        lat: 43.44736208,
        long: -76.54894263,
        squareFt: "8082",
        assetID: "1774",
      },
      geometry: {
        coordinates: [-76.548942, 43.447362],
        type: "Point",
      },
      id: "052ab8003d10de3fdc8f92b21e4f2508",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "11",
        name: "Commissary Bldg",
        buildAbr: "COMMISSARY-11",
        address: "78 Mollison St,Oswego,NY,13126",
        lat: 43.44741743,
        long: -76.53790826,
        squareFt: "30836",
        assetID: "1748",
      },
      geometry: {
        coordinates: [-76.537908, 43.447417],
        type: "Point",
      },
      id: "0fbeeab9fe4110164b0891db1f5a2473",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0037J",
        name: "TOWNHOUSE J",
        buildAbr: "TWNHSJ",
        address: "80 Iroquois Trail,Oswego NY,NY,13126",
        lat: 43.44733316,
        long: -76.54788408,
        squareFt: "12599",
        assetID: "1782",
      },
      geometry: {
        coordinates: [-76.547884, 43.447333],
        type: "Point",
      },
      id: "13fa6643f404161a1d447189cba3708a",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "10",
        name: "Mary Walker Infirmary",
        buildAbr: "WALKER-10",
        address: "40 Rudolph Rd,Oswego,NY,13126",
        lat: 43.45572567,
        long: -76.54274845,
        squareFt: "33260",
        assetID: "1747",
      },
      geometry: {
        coordinates: [-76.542748, 43.455725],
        type: "Point",
      },
      id: "159a11e32783a072e019a78c9a82723d",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "4",
        name: "Lee Hall",
        buildAbr: "LEE-4",
        address: "38 Centennial Drive,Oswego,NY,13126",
        lat: 43.45614809,
        long: -76.5378917,
        squareFt: "65000",
        assetID: "1740",
      },
      geometry: {
        coordinates: [-76.537891, 43.456148],
        type: "Point",
      },
      id: "1bf100a725003971d0b5492472af8e71",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "85",
        name: "Business Resource Center",
        buildAbr: "BUS RES CEN-85",
        address: "121 East First St,Oswego,NY,13126",
        lat: 43.457462,
        long: -76.507556,
        squareFt: "2739",
        assetID: "",
      },
      geometry: {
        coordinates: [-76.507556, 43.457462],
        type: "Point",
      },
      id: "1c266a8c81c5777655da9ee13cc5f1c2",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0005A",
        name: "Shady Shore Garage",
        buildAbr: "SHADY SHORE GAR-5A",
        address: "6 Rudolph Rd,Oswego,NY,13126",
        lat: 43.43015216,
        long: -76.507488,
        squareFt: "576",
        assetID: "1742",
      },
      geometry: {
        coordinates: [-76.536543, 43.458068],
        type: "Point",
      },
      id: "1d04783cee1c32ae905c1de0019fc04b",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "003A",
        name: "Poucher Hall",
        buildAbr: "POUCHER-3A",
        address: "25 Centennial Dr,Oswego,NY,13126",
        lat: 43.45484225,
        long: -76.53966603,
        squareFt: "40080",
        assetID: "1785",
      },
      geometry: {
        coordinates: [-76.539686, 43.454815],
        type: "Point",
      },
      id: "1f5cf995feea11e03b4ee398f27abc32",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "104",
        name: "Campus Police Parking Office",
        buildAbr: "PARKING-104",
        address: "7044 State Rt 104,Oswego NY,NY,13126",
        lat: 43.44775726,
        long: -76.54036105,
        squareFt: "2297",
        assetID: "1808",
      },
      geometry: {
        coordinates: [-76.540361, 43.447757],
        type: "Point",
      },
      id: "21068e8a31ac2236246be1bec3f059c4",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "53",
        name: "Syracuse Branch Campus",
        buildAbr: "SYRACUSE-53",
        address: "2 S Clinton St,Syracuse,NY,13202",
        lat: 43.050786,
        long: -76.153645,
        squareFt: "14526",
        assetID: "1799",
      },
      geometry: {
        coordinates: [-76.153645, 43.050786],
        type: "Point",
      },
      id: "213150775d2d334ad0b7677e94e1914e",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "015B",
        name: "Lonis Hall",
        buildAbr: "LONIS-15B",
        address: "49 Sheldon Ave,Oswego,NY,13126",
        lat: 43.4551238,
        long: -76.53426254,
        squareFt: "32285",
        assetID: "1815",
      },
      geometry: {
        coordinates: [-76.534233, 43.455133],
        type: "Point",
      },
      id: "243fc71a298095487079ebbca87a34b5",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "003C",
        name: "Campus Center Storge Bldg",
        buildAbr: "CAMP CTR STOR-3C",
        address: "6 Rudolph Rd,Oswego,NY,13126",
        lat: 43.4575571,
        long: -76.5071273,
        squareFt: "",
        assetID: "",
      },
      geometry: {
        coordinates: [-76.542743, 43.454501],
        type: "Point",
      },
      id: "2611095258e3f14c39241f02a00612f3",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "9",
        name: "Wilber Hall",
        buildAbr: "WILBER-9",
        address: "24 Takamine St,Oswego,NY,13126",
        lat: 43.4498761,
        long: -76.53482627,
        squareFt: "108933",
        assetID: "5373",
      },
      geometry: {
        coordinates: [-76.537905, 43.455177],
        type: "Point",
      },
      id: "2bb4df48f79543248380ef719c9524f8",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "32",
        name: "Seneca Hall",
        buildAbr: "SENECA-32",
        address: "47 Cayuga Circle,Oswego,NY,13126",
        lat: 43.45127648,
        long: -76.54738351,
        squareFt: "152548",
        assetID: "1768",
      },
      geometry: {
        coordinates: [-76.54739, 43.451339],
        type: "Point",
      },
      id: "2e0e549b3a06ccebd84ff8d999ac668b",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "26",
        name: "Culkin Hall",
        buildAbr: "CULKIN-26",
        address: "72 Sweet Rd,Oswego,NY,13126",
        lat: 43.45139873,
        long: -76.54424969,
        squareFt: "63591",
        assetID: "1764",
      },
      geometry: {
        coordinates: [-76.544182, 43.451383],
        type: "Point",
      },
      id: "2e5b911b0ad2270a8af2068b61f01768",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "003B",
        name: "Convocation Center",
        buildAbr: "CONVOCATION CTR-3B",
        address: "55 Rudolph Rd,Oswego,NY,13126",
        lat: 43.45379116,
        long: -76.54217106,
        squareFt: "",
        assetID: "",
      },
      geometry: {
        coordinates: [-76.54216, 43.453962],
        type: "Point",
      },
      id: "38ea2f4892076aa53998e7c10738e85c",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0037C",
        name: "TOWNHOUSE C",
        buildAbr: "TWNHSC",
        address: "90 Iroquois Trail,Oswego NY,NY,13126",
        lat: 43.44793911,
        long: -76.54883103,
        squareFt: "12599",
        assetID: "1775",
      },
      geometry: {
        coordinates: [-76.548831, 43.447939],
        type: "Point",
      },
      id: "3901868239f4e223e21f1bb00529ca40",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "23",
        name: "Rice Creek Field Station",
        buildAbr: "RICE-23",
        address: "193 Thompson Rd,Oswego,NY,13126",
        lat: 43.43000643,
        long: -76.55011063,
        squareFt: "",
        assetID: "",
      },
      geometry: {
        coordinates: [-76.55011, 43.430006],
        type: "Point",
      },
      id: "3c32fcb684a78029ba87fdea95d363bf",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "31",
        name: "Pathfinder Dining Hall",
        buildAbr: "PATHFINDER-31",
        address: "30 Cayuga Cir,Oswego,NY,13126",
        lat: 43.45067306,
        long: -76.5479133,
        squareFt: "33827",
        assetID: "1767",
      },
      geometry: {
        coordinates: [-76.547794, 43.450678],
        type: "Point",
      },
      id: "3c53ea6e3a70345f25530dc543b36e99",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "3",
        name: "Marano Campus Center",
        buildAbr: "MARANO CC-3",
        address: "315 George Washington Blvd,Oswego,NY,13126",
        lat: 43.45419096,
        long: -76.54081195,
        squareFt: "185524",
        assetID: "1737",
      },
      geometry: {
        coordinates: [-76.540769, 43.454212],
        type: "Point",
      },
      id: "3d1aec101a222ab3036514243f8113d5",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "2",
        name: "Park Hall",
        buildAbr: "PARK-2",
        address: "22 Takamine St,Oswego,NY,13126",
        lat: 43.4552485,
        long: -76.53680568,
        squareFt: "66979",
        assetID: "1736",
      },
      geometry: {
        coordinates: [-76.536931, 43.455248],
        type: "Point",
      },
      id: "3e44043b8d49f1c93133fcd1f608c8cc",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "FALL",
        name: "Fallbrook Recreation Center",
        buildAbr: "FALL",
        address: "103 Thopson Rd,Oswego,NY,13126",
        lat: 43.42898941,
        long: -76.54239655,
        squareFt: "",
        assetID: "",
      },
      geometry: {
        coordinates: [-76.539694, 43.424324],
        type: "Point",
      },
      id: "454480469a5a95945c219c3cebcecfe6",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "6",
        name: "Lanigan Hall",
        buildAbr: "LANIGAN-6",
        address: "67 Rudolph Rd,Oswego,NY,13126",
        lat: 43.4536961,
        long: -76.54489509,
        squareFt: "88200",
        assetID: "1743",
      },
      geometry: {
        coordinates: [-76.544895, 43.453696],
        type: "Point",
      },
      id: "45e3e6eda61676533901be579c728afe",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "47",
        name: "Cooper Dining Hall",
        buildAbr: "COOPER-47",
        address: "19 Union RD,Oswego,NY,13126",
        lat: 43.45253369,
        long: -76.54221547,
        squareFt: "33546",
        assetID: "1792",
      },
      geometry: {
        coordinates: [-76.54222, 43.452495],
        type: "Point",
      },
      id: "46b34300b9db411265186346aced7006",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "83",
        name: "Rice Creek Pavilion",
        buildAbr: "RICE PAV-83",
        address: "193 Thompson Rd,Oswego,NY,13126",
        lat: 43.430151,
        long: -76.55000144,
        squareFt: "893",
        assetID: "1807",
      },
      geometry: {
        coordinates: [-76.550001, 43.430151],
        type: "Point",
      },
      id: "477efcbab9556e217158b0fbf1782a5e",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "004A",
        name: "Lee Hall Central Heating Plant",
        buildAbr: "CHP-4A",
        address: "38 Centennial Drive,Oswego,NY,13126",
        lat: 43.45613191,
        long: -76.53857341,
        squareFt: "21980",
        assetID: "1795",
      },
      geometry: {
        coordinates: [-76.538573, 43.456131],
        type: "Point",
      },
      id: "4c34c4f2c13a754593710e5504cd3b56",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "20",
        name: "Service Bldg. 20",
        buildAbr: "SERVICE BLDG-20",
        address: "25 Sheldon Ae,Oswego,NY,13126",
        lat: 43.45558323,
        long: -76.53429067,
        squareFt: "14850",
        assetID: "1757",
      },
      geometry: {
        coordinates: [-76.53429, 43.455583],
        type: "Point",
      },
      id: "53efb0ddc07acb5401191eac0c134297",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "22",
        name: "King Hall",
        buildAbr: "KING-22",
        address: "294 George Washington Blvd,Oswego,NY,13126",
        lat: 43.4533472,
        long: -76.53645154,
        squareFt: "7200",
        assetID: "1759",
      },
      geometry: {
        coordinates: [-76.536451, 43.453347],
        type: "Point",
      },
      id: "573caec9d7f5ae1f8ee1ba26279aafd1",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0037I",
        name: "TOWNHOUSE I",
        buildAbr: "TWNHSI",
        address: "80 Iroquois Trail,Oswego NY,NY,13126",
        lat: 43.44750169,
        long: -76.54808949,
        squareFt: "12599",
        assetID: "1781",
      },
      geometry: {
        coordinates: [-76.548089, 43.447501],
        type: "Point",
      },
      id: "592f1c7446577fa14f091c34bf67427e",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "45",
        name: "Scales Hall",
        buildAbr: "SCALES-45",
        address: "34 Rudolph Rd,Oswego,NY,13126",
        lat: 43.45612546,
        long: -76.54177132,
        squareFt: "57464",
        assetID: "1790",
      },
      geometry: {
        coordinates: [-76.541771, 43.456125],
        type: "Point",
      },
      id: "59ce29097ce1f86d5b687f75dc17a261",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0037G",
        name: "TOWNHOUSE G",
        buildAbr: "TWNHSG",
        address: "80 Iroquois Trail,Oswego NY,NY,13126",
        lat: 43.44714524,
        long: -76.54818168,
        squareFt: "8082",
        assetID: "1779",
      },
      geometry: {
        coordinates: [-76.548601, 43.447163],
        type: "Point",
      },
      id: "5a2c80cd881225c36cd5f4e1b96e0208",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0037K",
        name: "TOWNHOUSE K",
        buildAbr: "TWNHSK",
        address: "80 Iroquois Trail,Oswego NY,NY,13126",
        lat: 43.44786379,
        long: -76.54749766,
        squareFt: "16729",
        assetID: "1783",
      },
      geometry: {
        coordinates: [-76.547497, 43.447863],
        type: "Point",
      },
      id: "5eb3baf9b66c0333ad901902097e3ebb",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "81",
        name: "Rice Creek Observatory",
        buildAbr: "RICE OBSER-81",
        address: "193 Thompson Rd,Oswego,NY,13126",
        lat: 43.43001758,
        long: -76.55012031,
        squareFt: "550",
        assetID: "1805",
      },
      geometry: {
        coordinates: [-76.55012, 43.430017],
        type: "Point",
      },
      id: "6168bd0e1d3f39a0e07edc77fdc981b1",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0028A",
        name: "Sewage Pump Station-Seneca",
        buildAbr: "PUMP STAT-28A",
        address: "47 Cayuga Cir,Oswego,NY,13126",
        lat: 43.4579954,
        long: -76.5367407,
        squareFt: "211",
        assetID: "5374",
      },
      geometry: {
        coordinates: [-76.547328, 43.45156],
        type: "Point",
      },
      id: "63ca0bebb497cb70265efb4b01a80314",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "41",
        name: "Johnson Hall",
        buildAbr: "JOHNSON-41",
        address: "20 Rudolph Rd,Oswego,NY,13126",
        lat: 43.45789035,
        long: -76.53786876,
        squareFt: "79097",
        assetID: "1786",
      },
      geometry: {
        coordinates: [-76.537868, 43.45789],
        type: "Point",
      },
      id: "71be48ec3d900a162fe24e423510c058",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "33",
        name: "Cayuga Hall",
        buildAbr: "CAYUGA-33",
        address: "20 Cayuga Circle,Oswego,NY,13126",
        lat: 43.45099735,
        long: -76.54855115,
        squareFt: "105072",
        assetID: "1769",
      },
      geometry: {
        coordinates: [-76.548582, 43.451019],
        type: "Point",
      },
      id: "73fcc6fce3c24d5047c2f8f418db23c3",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "12",
        name: "Maintenance Bldg 12",
        buildAbr: "MAINTENANCE-12",
        address: "82 Mollison St,Oswego,NY,13126",
        lat: 43.44757367,
        long: -76.53719091,
        squareFt: "20664",
        assetID: "1749",
      },
      geometry: {
        coordinates: [-76.53719, 43.447573],
        type: "Point",
      },
      id: "745f7b4844fcf8e3859dd1963d20aee9",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "43",
        name: "Riggs Hall",
        buildAbr: "RIGGS-43",
        address: "28 Rudolph Rd,Oswego,NY,13126",
        lat: 43.4572598,
        long: -76.53933666,
        squareFt: "58201",
        assetID: "1788",
      },
      geometry: {
        coordinates: [-76.539462, 43.457241],
        type: "Point",
      },
      id: "825336f6af076f3aa786979a8c0330b6",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "7",
        name: "Tyler Hall",
        buildAbr: "TYLER-7",
        address: "71 Sweet Rd,Oswego,NY,13126",
        lat: 43.45181789,
        long: -76.54537784,
        squareFt: "115430",
        assetID: "5372",
      },
      geometry: {
        coordinates: [-76.54533, 43.451794],
        type: "Point",
      },
      id: "84125657a04bacbf1edb0d7ecbbe4932",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0037l",
        name: "TOWNHOUSE L",
        buildAbr: "TWNHSL",
        address: "80 Iroquois Trail,Oswego NY,NY,13126",
        lat: 43.44771799,
        long: -76.54727027,
        squareFt: "12567",
        assetID: "1784",
      },
      geometry: {
        coordinates: [-76.54727, 43.447717],
        type: "Point",
      },
      id: "8849364996e95df2f45cc60b0991646c",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "14",
        name: "Rich Hall",
        buildAbr: "RICH-14",
        address: "32 Sheldon Ave,Oswego,NY,13126",
        lat: 43.45560315,
        long: -76.53522645,
        squareFt: "53742",
        assetID: "1751",
      },
      geometry: {
        coordinates: [-76.535295, 43.455547],
        type: "Point",
      },
      id: "88c8c0cbad81eb137ebf72e7a27f4faf",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "44",
        name: "Waterbury Hall",
        buildAbr: "WATERBURY-44",
        address: "30 Rudolph Rd,Oswego,NY,13126",
        lat: 43.45668646,
        long: -76.54052769,
        squareFt: "57464",
        assetID: "1789",
      },
      geometry: {
        coordinates: [-76.540637, 43.456611],
        type: "Point",
      },
      id: "89173b7fd3f4ff8389d47ea8d8826c8a",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "82",
        name: "Press Box",
        buildAbr: "PRESS BOX-82",
        address: "21 Barnes Dr,Oswego,NY,13126",
        lat: 43.4477548,
        long: -76.53371142,
        squareFt: "495",
        assetID: "1806",
      },
      geometry: {
        coordinates: [-76.533711, 43.447754],
        type: "Point",
      },
      id: "89335c8f0f45909eca0407dae5d090ec",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "107",
        name: "One Room School House",
        buildAbr: "SCHOOL HOUSE-107",
        address: "7061 Rte 104,Oswego,NY,13126",
        lat: 43.44986994,
        long: -76.53481839,
        squareFt: "550",
        assetID: "1810",
      },
      geometry: {
        coordinates: [-76.534855, 43.449855],
        type: "Point",
      },
      id: "8b2524dc6812459377a03286ca53d438",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "1",
        name: "Sheldon Hall",
        buildAbr: "SHELDON-1",
        address: "303 George Washington Blvd,Oswego,NY,13125",
        lat: 43.45432985,
        long: -76.53601713,
        squareFt: "119211",
        assetID: "1735",
      },
      geometry: {
        coordinates: [-76.536017, 43.454329],
        type: "Point",
      },
      id: "8d74ce38610b377a0f2391037f184dc9",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "35",
        name: "Littlepage Dining Hall",
        buildAbr: "LITTLEPAGE-35",
        address: "16 Onondaga Cir,Oswego,NY,13126",
        lat: 43.44997596,
        long: -76.54878234,
        squareFt: "33827",
        assetID: "1771",
      },
      geometry: {
        coordinates: [-76.548892, 43.449992],
        type: "Point",
      },
      id: "8e802a889cc85f34496b88d3cd625790",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0037A",
        name: "TOWNHOUSE A",
        buildAbr: "TWNHSA",
        address: "90 Iroquois Trail,Oswego NY,NY,13126",
        lat: 43.44744367,
        long: -76.54920555,
        squareFt: "10260",
        assetID: "1773",
      },
      geometry: {
        coordinates: [-76.549205, 43.447443],
        type: "Point",
      },
      id: "a2ba04e3bd1d754238a7a7c701d6ec2c",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "13",
        name: "Mahar Hall",
        buildAbr: "MAHAR-13",
        address: "71 Rudolph Rd,Oswego,NY,13126",
        lat: 43.45296805,
        long: -76.54565137,
        squareFt: "91530",
        assetID: "1750",
      },
      geometry: {
        coordinates: [-76.545651, 43.452968],
        type: "Point",
      },
      id: "a8f4dbbd0d025bbd5a895ca3c35b596e",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "28",
        name: "Sewage Main Lift Station",
        buildAbr: "LIFT STAT MAIN-28",
        address: "42 Rudolph Road,Oswego,NY,13126",
        lat: 43.4480404,
        long: -76.53686257,
        squareFt: "1881",
        assetID: "1765",
      },
      geometry: {
        coordinates: [-76.536862, 43.44804],
        type: "Point",
      },
      id: "a95c2f4e8e1c63625d1ba7934dafdd43",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "015A",
        name: "Moreland Hall",
        buildAbr: "MORELAND-15A",
        address: "57 Sheldon Ave,Oswego,NY,13126",
        lat: 43.45419471,
        long: -76.53452976,
        squareFt: "29400",
        assetID: "1814",
      },
      geometry: {
        coordinates: [-76.534529, 43.454153],
        type: "Point",
      },
      id: "b344ff766db43544b428e6c721439074",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "24",
        name: "Rice Creek Garage",
        buildAbr: "RICE GAR-24",
        address: "193 Thompson Rd,Oswego,NY,13126",
        lat: 43.43044426,
        long: -76.54930654,
        squareFt: "",
        assetID: "",
      },
      geometry: {
        coordinates: [-76.549306, 43.430444],
        type: "Point",
      },
      id: "c5f1657b88bd2270c08ddeccff61c303",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0037H",
        name: "TOWNHOUSE H",
        buildAbr: "TWNHSH",
        address: "80 Iroquois Trail,Oswego NY,NY,13126",
        lat: 43.44699903,
        long: -76.54843718,
        squareFt: "10260",
        assetID: "1780",
      },
      geometry: {
        coordinates: [-76.548437, 43.446999],
        type: "Point",
      },
      id: "c82499ddc693cf78e07c1a388ffbf679",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "29",
        name: "Hewitt Hall",
        buildAbr: "HEWITT-29",
        address: "5 Union Rd,Oswego,NY,13126",
        lat: 43.45245495,
        long: -76.54409919,
        squareFt: "135010",
        assetID: "1766",
      },
      geometry: {
        coordinates: [-76.544099, 43.452454],
        type: "Point",
      },
      id: "c9e5da27e7bc7823d07d96c9fa7bc642",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0037D",
        name: "TOWNHOUSE D",
        buildAbr: "TWNHSD",
        address: "90 Iroquois Trail,Oswego NY,NY,13126",
        lat: 43.44783919,
        long: -76.54856651,
        squareFt: "12599",
        assetID: "1776",
      },
      geometry: {
        coordinates: [-76.54854, 43.447808],
        type: "Point",
      },
      id: "cce698635be9d6d99b9b702f584cce8c",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0028B",
        name: "Sewage Pump Station-Bldg 12",
        buildAbr: "PUMP STAT-28B",
        address: "82 Mollison St,Oswego,NY,13126",
        lat: 43.44806132,
        long: -76.53686279,
        squareFt: "224",
        assetID: "5375",
      },
      geometry: {
        coordinates: [-76.536862, 43.448061],
        type: "Point",
      },
      id: "cdbf1f639385ca905569822e78472040",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0037E",
        name: "TOWNHOUSE E",
        buildAbr: "TWNHSE",
        address: "90 Iroquois Trail,Oswego NY,NY,13126",
        lat: 43.44844545,
        long: -76.54843342,
        squareFt: "15880",
        assetID: "1777",
      },
      geometry: {
        coordinates: [-76.548433, 43.448445],
        type: "Point",
      },
      id: "d0ca8178e29f9bca6c4ab8966f6f8baa",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "84",
        name: "Office of Business and Community Relations",
        buildAbr: "BUS & COMM REL-84",
        address: "34 East Bridge St,Oswego,NY,13126",
        lat: 43.4575622,
        long: -76.50706049,
        squareFt: "1917",
        assetID: "",
      },
      geometry: {
        coordinates: [-76.50706, 43.457562],
        type: "Point",
      },
      id: "d17c159300204b2d0643a2c31f4f3935",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "48",
        name: "Funnelle Hall",
        buildAbr: "FUNNELLE-48",
        address: "25 Union Rd,Oswego,NY,13126",
        lat: 43.45249294,
        long: -76.54170429,
        squareFt: "114365",
        assetID: "1793",
      },
      geometry: {
        coordinates: [-76.541668, 43.452529],
        type: "Point",
      },
      id: "d2ad0afc7cf52bc1b0e2b99c8cecfd16",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "19",
        name: "Laker Hall",
        buildAbr: "LAKER-19",
        address: "30 Barnes Rd,Oswego,NY,13126",
        lat: 43.44628716,
        long: -76.535475,
        squareFt: "196608",
        assetID: "1756",
      },
      geometry: {
        coordinates: [-76.535531, 43.446178],
        type: "Point",
      },
      id: "d71156e0d3c91292c9365bd6df1b3f1d",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "42",
        name: "Lakeside Dining Hall",
        buildAbr: "LAKESIDE-42",
        address: "24 Rudolph Rd,Oswego,NY,13126",
        lat: 43.45690536,
        long: -76.53929901,
        squareFt: "27870",
        assetID: "1787",
      },
      geometry: {
        coordinates: [-76.538611, 43.457494],
        type: "Point",
      },
      id: "d9c4bb075212d056d8a12c2fa2453d3b",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "17",
        name: "Penfield Library",
        buildAbr: "PENFIELD-17",
        address: "59 Rudolph Rd,Oswego,NY,13126",
        lat: 43.45376408,
        long: -76.54398593,
        squareFt: "192298",
        assetID: "1754",
      },
      geometry: {
        coordinates: [-76.543985, 43.453764],
        type: "Point",
      },
      id: "dd5d68e0f18e417e8f6d2ecce1c5a4af",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "46",
        name: "Hart Hall",
        buildAbr: "HART-46",
        address: "15 Union Rd,Oswego,NY,13126",
        lat: 43.45247644,
        long: -76.54274965,
        squareFt: "114365",
        assetID: "1791",
      },
      geometry: {
        coordinates: [-76.542795, 43.452457],
        type: "Point",
      },
      id: "de4871a3ce6c6a3211de6a1498d37684",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "15",
        name: "Mackin Hall",
        buildAbr: "MACKIN-15",
        address: "53 Sheldon Ave,Oswego,NY,13126",
        lat: 43.45478688,
        long: -76.53428363,
        squareFt: "41984",
        assetID: "1752",
      },
      geometry: {
        coordinates: [-76.53429, 43.454745],
        type: "Point",
      },
      id: "e1a44eb03cc628b56dcb76c6bc526566",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "0037F",
        name: "TOWNHOUSE F",
        buildAbr: "TWNHSF",
        address: "90 Iroquois Trail,Oswego NY,NY,13126",
        lat: 43.44832695,
        long: -76.54818168,
        squareFt: "18295",
        assetID: "1778",
      },
      geometry: {
        coordinates: [-76.548181, 43.448326],
        type: "Point",
      },
      id: "e384dd3c03effa1b9ceb226b9054fd3f",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "8",
        name: "Shineman Center",
        buildAbr: "SHINEMAN-8",
        address: "30 Centennial Dr,Oswego,NY,13126",
        lat: 43.45479711,
        long: -76.53838687,
        squareFt: "235860",
        assetID: "1745",
      },
      geometry: {
        coordinates: [-76.538443, 43.454937],
        type: "Point",
      },
      id: "f4229088a1aba1e3087cf5594e6007f1",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "34",
        name: "Onondaga Hall",
        buildAbr: "ONONDAGA-34",
        address: "20 Onondaga Cir,Oswego,NY,13126",
        lat: 43.45052896,
        long: -76.54949581,
        squareFt: "152548",
        assetID: "1770",
      },
      geometry: {
        coordinates: [-76.549495, 43.450528],
        type: "Point",
      },
      id: "f6e286e2d82677e851900c3be3e357d7",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "36",
        name: "Oneida Hall",
        buildAbr: "ONEIDA-36",
        address: "10 Onondaga Cir,Oswego,NY,13126",
        lat: 43.44944169,
        long: -76.55001178,
        squareFt: "105000",
        assetID: "1772",
      },
      geometry: {
        coordinates: [-76.549734, 43.449492],
        type: "Point",
      },
      id: "f7f215e200b46883e852312397ceee00",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "71",
        name: "Pole Barn",
        buildAbr: "POLE BARN-71",
        address: "76 Mollison St,Oswego,NY,13126",
        lat: 43.457291,
        long: -76.507488,
        squareFt: "6925",
        assetID: "1803",
      },
      geometry: {
        coordinates: [-76.537028, 43.446985],
        type: "Point",
      },
      id: "f903b3de298cb092c5071bb344f7dae2",
    },
    {
      type: "Feature",
      properties: {
        buildingNo: "21",
        name: "Romney Field House",
        buildAbr: "ROMNEY-21",
        address: "28 Barnes Rd,Oswego,NY,",
        lat: 43.44781308,
        long: -76.53471071,
        squareFt: "55000",
        assetID: "1758",
      },
      geometry: {
        coordinates: [-76.53471, 43.447813],
        type: "Point",
      },
      id: "fa7791c4bedcb03e8b283466629bbeb7",
    },
  ],
  type: "FeatureCollection",
};

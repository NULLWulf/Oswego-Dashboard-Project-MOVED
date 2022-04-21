mapboxgl.accessToken = // new style url
  "pk.eyJ1IjoibmR3b2xmMTk5MSIsImEiOiJjbDA4aGppczcwM2kzM2pxdHZydmdsYm5yIn0.ZPuI0T1FxHGAJu_wklsSXg"; // public token, not able to make changes to map itself with it
// only access style layer etc.
const _bounds = 0.5;
const flyToZoom = 18; // maximum zoom level after FlyToZoom is initialized when interacting with building icons
const defaultStyle = "mapbox://styles/ndwolf1991/cl1f5gcur004t15mf6m1dt47j";
const satelliteStyle = "mapbox://styles/mapbox/satellite-v9";
let style = "default";

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
  // function to get data features underneath point when an event is passed through
  const bbox = [
    // based off of pixel width to determine bounds
    [event.point.x - bound, event.point.y - bound],
    [event.point.x + bound, event.point.y + bound],
  ];

  return map.queryRenderedFeatures(bbox, { layers: ["buildings"] }); // returns Objecct that corresponds with data values under point
  // bounds are passed in so you can tweak the click radius of the element corresponding with each building.
}

map.on("click", (event) => {
  const features = bondFeatures(_bounds, map, event); // attempts to get features within a certain radial point, tweak _Bounds to make radius more liberal/conservative
  // ensureClose("right"); // ensures right sidebar collapses

  if (features.length !== -1) {
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
    console.log("Inside Features");
    console.log(features[0].properties);
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

function flyToId(id) {
  console.log("test");
  let regionIndex = NaN;
  switch (id) {
    case "central":
      regionIndex = 0;
      break;
    case "lakeside":
      regionIndex = 1;
      break;
    case "east":
      regionIndex = 2;
      break;
    case "west":
      regionIndex = 3;
      break;
    case "athletic":
      regionIndex = 4;
      break;
    case "village":
      regionIndex = 5;
      break;
    case "rice":
      regionIndex = 6;
      break;
    case "fallbrook":
      regionIndex = 7;
      break;
    case "downtown":
      regionIndex = 8;
      break;
    case "syracuse":
      regionIndex = 9;
      break;
  }
  map.flyTo({
    center: regions[regionIndex].center,
    zoom: regions[regionIndex].zoom,
    speed: 0.6,
    bearing: regions[regionIndex].bearing,
  });
}

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
  console.log("testing toggle");
  if (style == "default") {
    map.setStyle(satelliteStyle);
    document.getElementById("style-toggle").innerHTML = "Default View";
    style = "satellite";
  } else {
    map.setStyle(defaultStyle);
    document.getElementById("style-toggle").innerHTML = "Satellite View";
    style = "default";
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

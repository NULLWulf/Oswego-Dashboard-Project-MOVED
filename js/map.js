mapboxgl.accessToken =
  "pk.eyJ1IjoibmR3b2xmMTk5MSIsImEiOiJjbDA4aGppczcwM2kzM2pxdHZydmdsYm5yIn0.ZPuI0T1FxHGAJu_wklsSXg"; // public token, not able to make changes to map itself with it
// only access style layer etc.


const _bounds = 0.5;

const map = new mapboxgl.Map({
  // creates Mapbox object
  container: "map", // container ID
  style: "mapbox://styles/ndwolf1991/cl0ikst93000j15p45jdekxmf", // style URL
  center: [-76.543134, 43.453054], // starting position [lng, lat]
  zoom: 16.02, // initial zoom start
  bearing: -37.25, // slightly off north to show majority of campus
  pitch: 0, // directly overhead
})

function bondFeatures(bound, map, event) {
  // function to get data features underneath point when an event is passed through
  const bbox = [
    // based off of pixel width to determine bounds
    [event.point.x - bound, event.point.y - bound],
    [event.point.x + bound, event.point.y + bound],
  ];

  return map.queryRenderedFeatures(bbox, { layers: ["buildings"] }); // returns Objecct that corresponds with data values under point
  // bounds are passed in so you can tweak the clickable radius of elements (in this case using as a stock incon for a target, unsure
  // of methods that allow of interacting with stock map elemtns )
}

map.on("load", () => {
  // On initial map load performs these functions
  map.addControl(new mapboxgl.NavigationControl()); // adds basioc control structure to document, can be further modified

  console.log("Map Loaded");
});

map.on("mousemove", (event) => {
  // tracks geoloc respective of map, coordinations repsective of where map is framed and building name if applicable.
  // currently does not reset upon moving off of a building
  const features = bondFeatures(_bounds, map, event);

  if (features.length) {
    document.getElementById("building").innerHTML = JSON.stringify(
      features[0].properties.name
    );
    document.getElementById("coords").innerHTML = JSON.stringify(event.point);
    document.getElementById("geoloc").innerHTML = JSON.stringify(
      event.lngLat.wrap()
    );
  } else {
    document.getElementById("building").innerHTML = "N/a";
    document.getElementById("coords").innerHTML = JSON.stringify(event.point);
    document.getElementById("geoloc").innerHTML = JSON.stringify(
      event.lngLat.wrap()
    );
  }
});

map.on("click", "buildings", (event) => {
  // Copy coordinates array.
  const coordinates = event.features[0].geometry.coordinates.slice();
  const features = bondFeatures(_bounds, map, event);

  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  const popupHtml = `
  <div id="popup" class="popup">
    <h2>${features[0].properties.name}</h2>
    <img src="images/building-images/${features[0].properties.buildingNo}.jpg" alt="Image of ${features[0].properties.name}"></img>
    </br>
    <strong>Building No: </strong>${features[0].properties.buildingNo}
    </br>
    <strong>Ft<sup>2</sup>: </strong>${features[0].properties.squareFt}
    </br>
    <a href="https://aim.sucf.suny.edu/fmax/screen/MASTER_ASSET_VIEW?assetTag=${features[0].properties.assetID}" target="_blank">AIM Asset View</a>
  </div> `;

  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(popupHtml)
    .addClassName("popups")
    .setMaxWidth("none")
    .addTo(map);
});

map.on("mouseenter", "buildings", () => {
  map.getCanvas().style.cursor = "pointer";
});

// Change it back to a pointer when it leaves.
map.on("mouseleave", "buildings", () => {
  map.getCanvas().style.cursor = "";
});

map.addControl(
  new mapboxgl.FullscreenControl(),
);

map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true,
  })
);

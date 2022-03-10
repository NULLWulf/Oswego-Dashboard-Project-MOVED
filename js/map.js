mapboxgl.accessToken =
  "pk.eyJ1IjoibmR3b2xmMTk5MSIsImEiOiJjbDA4aGppczcwM2kzM2pxdHZydmdsYm5yIn0.ZPuI0T1FxHGAJu_wklsSXg"; // public token, not able to make changes to map itself with it
// only access style layer etc.

const map = new mapboxgl.Map({
  // creates Mapbox object
  container: "map", // container ID
  style: "mapbox://styles/ndwolf1991/cl0ikst93000j15p45jdekxmf", // style URL
  center: [-76.543134, 43.453054], // starting position [lng, lat]
  zoom: 16.02, // initial zoom start
  bearing: -37.25, // slightly off north to show majority of campus
  pitch: 0, // directly overhead
});

function bondFeatures(bound, map, event) {
  // function to get data features underneath point when an event is passed through
  const bbox = [
    // based off of pixel width to determine bounds for
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
});

map.on("click", (event) => {
  // more click events to come buttrently grabs features under point
  const features = bondFeatures(3, map, event);

  console.log(features[0].properties);
  window.alert(features[0].properties.Name); // displays DOM pop up of prperty name, will be eventually set to that click through do things like redirects, open panels etc
});

map.on("mousemove", (event) => {
  // tracks geoloc respective of map, coordinations repsective of where map is framed and building name if applicable.
  // currently does not reset upon moving off of a building
  const features = bondFeatures(3, map, event);

  document.getElementById("building").innerHTML = JSON.stringify(
    features[0].properties.Name
  );
  document.getElementById("coords").innerHTML = JSON.stringify(event.point);
  document.getElementById("geoloc").innerHTML = JSON.stringify(
    event.lngLat.wrap()
  );
});

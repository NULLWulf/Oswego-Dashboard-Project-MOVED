mapboxgl.accessToken = "pk.eyJ1IjoibmR3b2xmMTk5MSIsImEiOiJjbDA4aGppczcwM2kzM2pxdHZydmdsYm5yIn0.ZPuI0T1FxHGAJu_wklsSXg";

const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/ndwolf1991/cl0ikst93000j15p45jdekxmf", // style URL
  center: [-76.543134, 43.453054], // starting position [lng, lat]
  zoom: 16.02, // starting zoom
  bearing: -37.25,
  pitch: 0,
});

map.on("load", () => {
  map.addControl(new mapboxgl.NavigationControl());
});

map.on("click", (event) => {
  const point = event.point;

  const features = map.queryRenderedFeatures([point.x, point.y], {
    layers: ["buildings"],
  });

  console.log(features[0].properties);
  window.alert(features[0].properties.Name);
});

map.on("mousemove", (e) => {
  const point = e.point;
  const features = map.queryRenderedFeatures([point.x, point.y], {
    layers: ["buildings"],
  });

  document.getElementById("info").innerHTML =
    // `e.point` is the x, y coordinates of the `mousemove` event
    // relative to the top-left corner of the map.
    JSON.stringify(e.point) +
    "<br />" +
    // `e.lngLat` is the longitude, latitude geographical position of the event.
    JSON.stringify(e.lngLat.wrap()) +
    "<br />" +
    JSON.stringify(features[0].properties.Name);
});

// map.on("click", (event) => {
//   // more click events to come buttrently grabs features under point
//   const features = bondFeatures(_bounds, map, event);

//   if (features.length) {
//     // if features exists executes the following (implemented to prevent undefined errors otherwise)
//     console.log(features[0].properties);
//     window.open(
//       `https://aim.sucf.suny.edu/fmax/screen/MASTER_ASSET_VIEW?assetTag=${features[0].properties.assetID}`
//     );
//   }
// });

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

  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(
      '<div id="popup" class="popup">' +
        "<h2>" +
        features[0].properties.name +
        "</h2>" +
        '<img src="images/building-images/' +
        features[0].properties.buildingNo +
        '.jpg" alt="Image of ' +
        features[0].properties.name +
        '"</img>' +
        "<br>" +
        "<strong>Building No: </strong>" +
        features[0].properties.buildingNo +
        "</br>" +
        "<strong>Ft<sup>2</sup>: </strong>" +
        features[0].properties.squareFt +
        "</br>" +
        '<a href="https://aim.sucf.suny.edu/fmax/screen/MASTER_ASSET_VIEW?assetTag=' +
        features[0].properties.assetID + // pipes asset id through url redirect, pay mind to quotes for proper html parsing
        '"target="_blank">AIM Asset View</a>' + // first " closes href link
        "</div>"
    )
    .addClassName("popups")
    .setMaxWidth("none")
    .addTo(map);
});

map.on("load", () => {
  // On initial map load performs these functions
  map.addControl(new mapboxgl.NavigationControl()); // adds basioc control structure to document, can be further modified
  map.addControl(new mapboxgl.FullscreenControl());
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
  console.log("Map Loaded");
});

// Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoicnVsZXNvZnRodW1iIiwiYSI6ImNqeTBnYzZqdTAydnQzbnF4dmllams1dzcifQ.XAU_Q1gU7pu8aZtYh-16lQ";
// Add in the map
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/rulesofthumb/ck0gyb3703c0f1dphly4weyik",
  center: [-73.123565, 40.914606],
  zoom: 16,
});
// Mapbox navigation controls
map.addControl(new mapboxgl.NavigationControl());

// Create an empty GeoJSON that will be populated in addPoints()
var points = {
  type: "FeatureCollection",
  features: [],
};
// Wait for the map to load to start importing data
map.on("load", function () {
  // Bring in the data from Google Sheets
  Papa.parse(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR--OKdR81iuEFmjaNJzKyneHj0fyDpGUelZ4SQYbdYHYouUoiYj-kVutT4T0hA6d33E78GaXJE6t_Q/pub?output=csv",
    {
      download: true,
      header: true,
      complete: function (results) {
        addPoints(results.data);
      },
    }
  );
  // Fill in the GeoJSON and add it to the map
  function addPoints(data) {
    // Fill in GeoJSON
    for (var row in data) {
      points.features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [data[row].long, data[row].lat],
        },
        properties: {
          location: data[row].location,
          eui: parseInt(data[row].eui.replace(/,/g, "")),
          usage: parseInt(data[row].usage.replace(/,/g, "")),
          cost: data[row].cost,
          year: data[row].year,
          sqft: data[row].sqft,
          type: data[row].type,
        },
      });
    }
    // Sort the points based on either EUI or Usage
    sortPoints();
    // Set max and min values
    setMaxMin();
    // Add in the layers
    addLayers();
    // Set up range sliders
    setSliders();
    // Set up both building lists
    setBuildingLists();
    // Activate mousemove function for the map
    mouseMove();
    // Active mouseclick function for the map
    mouseClick();
    // Tableau
    initializeViz();
  }
});

// Store value type that is used in map (EUI or Usage - EUI by default)
var switchValue = "eui";
// Sort the points based on EUI or Usage
function sortPoints() {
  points.features.sort(function (a, b) {
    // Usage
    if (switchValue == "usage") {
      if (a.properties.usage < b.properties.usage) {
        return 1;
      }
      if (a.properties.usage > b.properties.usage) {
        return -1;
      }
      return 0;
      // EUI
    } else {
      if (a.properties.eui < b.properties.eui) {
        return 1;
      }
      if (a.properties.eui > b.properties.eui) {
        return -1;
      }
      return 0;
    }
  });
}

// Store max and min values
var max = 0;
var min = 0;
// Set the max and min values of either EUI or Usage
function setMaxMin() {
  // Usage
  if (switchValue == "usage") {
    max = points.features[0].properties.usage;
    min = points.features[points.features.length - 1].properties.usage;
    // EUI
  } else {
    max = points.features[0].properties.eui;
    min = points.features[points.features.length - 1].properties.eui;
  }
}

// Add the GeoJSON source and layers to the map
function addLayers() {
  // Add a satellite view source and layer that will be hidden until the user switches to satellite view
  map.addSource("mapbox-satellite", {
    type: "raster",
    url: "mapbox://mapbox.satellite",
  });
  map.addLayer({
    id: "satellite-map",
    type: "raster",
    source: "mapbox-satellite",
  });
  map.setLayoutProperty("satellite-map", "visibility", "none");
  // Add GeoJSON source to the map
  map.addSource("points", {
    type: "geojson",
    data: points,
  });
  // Add layers to the map
  points.features.forEach(function (feature) {
    var layerDot = "dot-" + feature.properties.type;
    var layerBubble = "bubble-" + feature.properties.type;
    var layerText = "text-" + feature.properties.type;
    // Check if the initial layer of a building type has not been added yet
    if (!map.getLayer(layerBubble)) {
      // Bubble layer
      map.addLayer({
        id: layerBubble,
        type: "circle",
        source: "points",
        paint: {
          "circle-color": [
            "match",
            ["get", "type"],
            "classroom",
            "#AF0B0B",
            "lab",
            "#5B0000",
            "office",
            "#186A3B",
            "residence",
            "#512E5F",
            "healthcare",
            "#22A5E6",
            "other",
            "#E67E22",
            /* default */ "#F7F8F9",
          ],
          "circle-radius": [
            "interpolate",
            ["exponential", 2],
            ["zoom"],
            0,
            0,
            20,
            ["/", ["to-number", ["get", "eui"]], 0.25],
          ],
          "circle-opacity": 0.2,
        },
        layout: {
          visibility: "visible",
        },
        filter: ["==", "type", feature.properties.type],
      });
      // Dot layer
      map.addLayer({
        id: layerDot,
        type: "circle",
        source: "points",
        paint: {
          "circle-color": [
            "match",
            ["get", "type"],
            "classroom",
            "#AF0B0B",
            "lab",
            "#5B0000",
            "office",
            "#186A3B",
            "residence",
            "#512E5F",
            "healthcare",
            "#22A5E6",
            "other",
            "#E67E22",
            /* default */ "#F7F8F9",
          ],
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 1.5,
        },
        layout: {
          visibility: "visible",
        },
        filter: ["==", "type", feature.properties.type],
      });
      // Text layer
      map.addLayer({
        id: layerText,
        type: "symbol",
        source: "points",
        layout: {
          visibility: "visible",
          "text-field": "{location}",
          "text-size": 11,
          "text-radial-offset": -1.5,
          "text-anchor": "bottom",
          "text-max-width": 20,
        },
        paint: {
          "text-halo-color": "#fff",
          "text-halo-width": 1,
        },
        filter: ["==", "type", feature.properties.type],
      });
    }
  });
}

// Set up the noUiSlider sliders
function setSliders() {
  var sliders = document.getElementsByClassName("sidebar-filter-slider");
  for (var i = 0; i < 2; i++) {
    // Create the sliders
    noUiSlider.create(sliders[i], {
      start: [min, max],
      connect: true,
      step: 1,
      tooltips: [true, true],
      format: {
        to: function (value) {
          return value.toLocaleString();
        },
        from: function (value) {
          return value.toLocaleString();
        },
      },
      range: {
        min: min,
        max: max,
      },
    });
    // Set up the filter for sliders
    sliders[i].noUiSlider.on("update", function (a, b, values) {
      setSliderFilter(values[0], values[1]);
    });
    // Color the sliders (EUI by default)
    var sliderClass = document.getElementsByClassName("noUi-connect")[i];
    sliderClass.classList.add("eui");
  }
}

// Set up both building lists
function setBuildingLists() {
  // Check if the building lists have already been initialized to recreate them
  var buildingListCount = document.querySelectorAll(
    ".building-list-row:not(.header)"
  );
  if (buildingListCount.length) {
    for (var i = 0; i < buildingListCount.length; i++) {
      buildingListCount[i].parentNode.removeChild(buildingListCount[i]);
    }
  }
  // Get the displayed building types
  var displayedBuildingTypes = document.querySelectorAll(
    ".button:not(.active)"
  );
  var displayedBuildingValues = [];
  for (var i = 0; i < displayedBuildingTypes.length; i++) {
    displayedBuildingValues.push(displayedBuildingTypes[i].value);
  }
  // Get the displayed slider's max and min values
  if (
    document.getElementById("full-building-list-sidebar").style.left == "0px"
  ) {
    var slider = document.getElementsByClassName("sidebar-filter-slider")[1];
  } else {
    var slider = document.getElementsByClassName("sidebar-filter-slider")[0];
  }
  var sliderValues = [
    parseInt(slider.noUiSlider.get()[0].replace(/,/g, ""), 10),
    parseInt(slider.noUiSlider.get()[1].replace(/,/g, ""), 10),
  ];
  // Filter the points based on the displayed building types & slider max and min values
  var filteredPoints = points.features.filter(function (feature) {
    if (switchValue == "eui") {
      return (
        displayedBuildingValues.indexOf(feature.properties.type) > -1 &&
        feature.properties.eui >= sliderValues[0] &&
        feature.properties.eui <= sliderValues[1]
      );
    } else {
      return (
        displayedBuildingValues.indexOf(feature.properties.type) > -1 &&
        feature.properties.usage >= sliderValues[0] &&
        feature.properties.usage <= sliderValues[1]
      );
    }
  });
  var listCount, buildingListType, buildingListAbbreviation;
  // Create both building lists
  for (var i = 0; i < 2; i++) {
    if (!i) {
      listCount = filteredPoints.length < 3 ? filteredPoints.length : 3;
      buildingListType = document.getElementById("mini-building-list-group");
      buildingListAbbreviation = "mini-";
    } else {
      listCount = filteredPoints.length;
      buildingListType = document.getElementById("full-building-list-group");
      buildingListAbbreviation = "full-";
    }
    for (var j = 0; j < listCount; j++) {
      // Add a row
      var listRow = buildingListType.appendChild(document.createElement("div"));
      listRow.id =
        buildingListAbbreviation + filteredPoints[j].properties.location;
      listRow.className = "building-list-row item";
      // Add building name to row
      var listRowName = listRow.appendChild(document.createElement("div"));
      listRowName.className = "building-list-column1 item";
      listRowName.innerHTML =
        "<div class='item-truncate'>" +
        filteredPoints[j].properties.location +
        "</div>";
      // Add value to row
      var listRowValue = listRow.appendChild(document.createElement("div"));
      listRowValue.className = "building-list-column2 item";
      var itemValue = listRowValue.appendChild(document.createElement("div"));
      itemValue.className = "building-list-column2-value";
      itemValue.innerText =
        switchValue == "eui"
          ? filteredPoints[j].properties.eui.toLocaleString()
          : filteredPoints[j].properties.usage.toLocaleString();
      // Add rectangle svg to row
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("style", "margin: 5px 0 0;");
      svg.setAttribute(
        "width",
        100 *
          (switchValue == "eui"
            ? filteredPoints[j].properties.eui / max
            : filteredPoints[j].properties.usage / max)
      );
      svg.setAttribute("height", "4");
      svg.setAttribute("class", filteredPoints[j].properties.type);
      listRow.appendChild(svg);
    }
    // Have each row on both building lists open the building description sidebar when clicked
    points.features.forEach(function (feature) {
      var row = document.getElementById(
        buildingListAbbreviation + feature.properties.location
      );
      // Check if the requested row exists when going through the list of points
      if (row != undefined) {
        row.addEventListener("click", function () {
          // Have the map center and zoom on the building selected
          map.flyTo({
            center: feature.geometry.coordinates,
            zoom: 17,
          });
          // Open the building description sidebar
          openBuildingDescription(feature.properties);
        });
      }
    });
  }
}

// Toggle the visibility of a building type's layers through the filter buttons
function setLayerFilter(value) {
  var layerDot = "dot-" + value;
  var layerBubble = "bubble-" + value;
  var layerText = "text-" + value;
  var buttons = document.getElementsByClassName("button " + value);
  var visibility = map.getLayoutProperty(layerDot, "visibility");
  // Check if the initial layer for a building type is visible
  if (visibility === "visible") {
    map.setLayoutProperty(layerDot, "visibility", "none");
    map.setLayoutProperty(layerBubble, "visibility", "none");
    map.setLayoutProperty(layerText, "visibility", "none");
  } else {
    map.setLayoutProperty(layerDot, "visibility", "visible");
    map.setLayoutProperty(layerBubble, "visibility", "visible");
    map.setLayoutProperty(layerText, "visibility", "visible");
  }
  for (var i = 0; i < 2; i++) {
    buttons[i].classList.toggle("active");
  }
  // Update both building lists
  setBuildingLists();
}

// Types of buildings
var buildingTypes = [
  "classroom",
  "lab",
  "office",
  "residence",
  "healthcare",
  "other",
];
// Filter the points on the map by the range of the slider
function setSliderFilter(sliderMin, sliderMax) {
  for (var i in buildingTypes) {
    map.setFilter("dot-" + buildingTypes[i], [
      "all",
      ["==", "type", buildingTypes[i]],
      ["<=", switchValue, sliderMax],
      [">=", switchValue, sliderMin],
    ]);
    map.setFilter("bubble-" + buildingTypes[i], [
      "all",
      ["==", "type", buildingTypes[i]],
      ["<=", switchValue, sliderMax],
      [">=", switchValue, sliderMin],
    ]);
    map.setFilter("text-" + buildingTypes[i], [
      "all",
      ["==", "type", buildingTypes[i]],
      ["<=", switchValue, sliderMax],
      [">=", switchValue, sliderMin],
    ]);
  }
  // Update both building lists
  setBuildingLists();
}

// Switch between EUI and Usage through the toggle switch
function switchBetween() {
  var switchFilters = document.getElementsByClassName(
    "sidebar-filter-switch-checkbox"
  );
  // Change switchValue
  if (switchValue == "eui") {
    switchValue = "usage";
    for (var i = 0; i < 2; i++) {
      switchFilters[i].checked = 0;
    }
  } else {
    switchValue = "eui";
    for (var i = 0; i < 2; i++) {
      switchFilters[i].checked = 1;
    }
  }
  // Update the bubble layers on the map
  for (var i = 0; i < buildingTypes.length; i++) {
    map.setPaintProperty("bubble-" + buildingTypes[i], "circle-radius", [
      "interpolate",
      ["exponential", 2],
      ["zoom"],
      0,
      0,
      20,
      [
        "match",
        switchValue,
        "eui",
        ["/", ["to-number", ["get", "eui"]], 0.25],
        "usage",
        ["/", ["to-number", ["get", "usage"]], 50000],
        /* default */ 0,
      ],
    ]);
  }
  // Sort the points
  sortPoints();
  // Grab the max and min of the newly sorted points
  setMaxMin();
  // Reset the sliders
  resetSliders();
  // Reset the slider filter
  setSliderFilter(min, max);
  // Reset both building lists
  resetBuildingLists();
}

// Reset the sliders based on a change from the toggle switch
function resetSliders() {
  // Preset the new slider header
  var newSliderHeader =
    switchValue == "eui"
      ? "Energy Use Intensity (EUI):"
      : "Total Energy Use (kBtu/yr):";
  // Update slider header & slider
  var sliderHeaders = document.getElementsByClassName(
    "sidebar-filter-slider-header"
  );
  var sliders = document.getElementsByClassName("sidebar-filter-slider");
  for (var i = 0; i < 2; i++) {
    sliderHeaders[i].innerText = newSliderHeader;
    sliders[i].noUiSlider.updateOptions({
      range: {
        min: min,
        max: max,
      },
    });
    sliders[i].noUiSlider.set([min, max]);
    // Update the slider color
    var sliderClass = document.getElementsByClassName("noUi-connect")[i];
    if (switchValue == "eui") {
      sliderClass.classList.remove("usage");
      sliderClass.classList.add("eui");
    } else {
      sliderClass.classList.remove("eui");
      sliderClass.classList.add("usage");
    }
  }
}

// Reset the building lists based on a change from the toggle switch
function resetBuildingLists() {
  // Preset the inner HTML for the 2nd column of the building list
  var buildingListInnerHTML =
    switchValue == "eui"
      ? "Energy Use Intensity <span>(kBtu/ft<sup>2</sup>)</span>"
      : "Total Energy Use <span>(kBtu/yr)</span>";
  // Update both building list headers
  var miniBuildingListHeader = document.getElementById(
    "mini-building-list-column2-header"
  );
  miniBuildingListHeader.innerHTML = buildingListInnerHTML;
  var fullBuildingListHeader = document.getElementById(
    "full-building-list-column2-header"
  );
  fullBuildingListHeader.innerHTML = buildingListInnerHTML;
  // Update both building lists
  setBuildingLists();
}

// Open up the full building list sidebar
function openFullBuildingList() {
  // Set the slider on the full building list sidebar to be the same range
  sliders = document.getElementsByClassName("sidebar-filter-slider");
  var sliderValues = [
    parseInt(sliders[0].noUiSlider.get()[0].replace(/,/g, ""), 10),
    parseInt(sliders[0].noUiSlider.get()[1].replace(/,/g, ""), 10),
  ];
  sliders[1].noUiSlider.set([sliderValues[0], sliderValues[1]]);
  // Move the full building list sidebar to be on top of the main sidebar
  document.getElementById("full-building-list-sidebar").style.left = "0px";
}

// Layers that are clickable on the map
var clickableLayers = [
  // Dot layers
  "dot-classroom",
  "dot-lab",
  "dot-office",
  "dot-residence",
  "dot-healthcare",
  "dot-other",
  // Text layers
  "text-classroom",
  "text-lab",
  "text-office",
  "text-residence",
  "text-healthcare",
  "text-other",
];
// Get pointer cursor when mouse is over markers
function mouseMove() {
  map.on("mousemove", function (e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: clickableLayers,
    });
    map.getCanvas().style.cursor = features.length ? "pointer" : "";
  });
}
// Have the building description sidebar open up when the user clicks a marker
function mouseClick() {
  for (var i = 0; i < clickableLayers.length; i++) {
    map.on("click", clickableLayers[i], function (e) {
      // Have the map center and zoom on the building selected
      map.flyTo({
        center: e.features[0].geometry.coordinates,
        zoom: 17,
      });
      // Open the building description sidebar
      openBuildingDescription(e.features[0].properties);
    });
  }
}

// Store the currently's selected building's properties that will be used in switchView()
var switchViewProperties;
// Building type icons (in the same order as the buildingTypes array)
var buildingTypeIcons = [
  "fas fa-book",
  "fas fa-flask",
  "fas fa-address-card",
  "fas fa-home",
  "fas fa-hospital",
  "fas fa-user-friends",
];
// Building type colors (in the same order as the buildingTypes array)
var buildingTypeColors = [
  "#AF0B0B",
  "#5B0000",
  "#186A3B",
  "#512E5F",
  "#22A5E6",
  "#E67E22",
];
// Building type descriptions
var buildingTypeDescriptions = [
  // Classroom
  "Classroom buildings vary in energy use based on the number of classes in session and equipment in each room. There can be hundreds of lights and dozens of computers or projectors on at a time. HVAC heating and cooling system schedules should match class schedules and operate within an acceptable temperature range when the building is occupied." +
    "<br><br>" +
    "<b>Tips to help reduce energy:</b> Turn lights off when a room is not occupied, turn computers, smartboards, and projectors off when leaving a room.",
  // Lab
  "Buildings with laboratory or research space are typically the most energy intense buildings on campus. Most laboratories require a continuous stream of fresh outside air for safety. Conditioning, circulating, and then exhausting the conditioned air requires a tremendous amount of energy." +
    "<br><br>" +
    "<b>Tips to help reduce energy:</b> Keep fume hood sashes closed, raise the temperature on lab freezers, turn off lights when the room is not occupied and turn computers off at the end of the day.",
  // Office
  "SBU faculty and staff are located in office space throughout the campus. The energy consumed in offices are typically from heating and cooling the space, lighting the building, computers, and other office equipment that run during normal business hours." +
    "<br><br>" +
    "<b>Tips to help reduce energy:</b> Turn lights off when a room is not occupied, turn computers, smartboards, and projectors off when leaving a room. If the space is uncomfortable, let the HVAC staff know before plugging in an electric space heater.",
  // Residence
  "Stony Brook students reside in housing across the campus. High energy use is typically seen in the morning when students are showering and preparing for class and at night when students return from class and begin adjusting their thermostats and plugging in devices. The energy use drops off significantly once students start heading out to class." +
    "<br><br>" +
    "<b>Tips to help reduce energy:</b> Turn lights off, turn air conditioners to a higher temperature in summer and heating equipment to a lower temperature in winter when rooms are not occupied, unplug devices when done charging and unplug refrigerators (and leave the door open) when not needed or the room is not occupied. If the space is uncomfortable, put a fixit ticket in before plugging in an electric space heater." +
    "<br><br>" +
    "<a href='https://www.stonybrook.edu/fixit/' target='_blank'>https://www.stonybrook.edu/fixit/</a>",
  // Healthcare
  "Healthcare facilities are typically very energy-intensive due to a wide range of services and high hours of occupancy. Energy consumption in healthcare facilities is driven by complex heating, ventilation and air conditioning (HVAC) systems designed to keep services running at an optimal level. These services include medical and clinical laboratory work, office systems, food services and housekeeping. Healthcare facilities tend to consume more energy per square foot than other buildings due to these factors.",
  // Other
  "Community or other types of buildings are buildings that don't fall into the categories listed. Energy use varies from building to building in this category but general energy conservation efforts should be applied.",
];
// Intialize Highcharts chart for later
var chart = Highcharts.chart("chart", {
  chart: {
    type: "bar",
    style: {
      fontFamily: "Montserrat, Roboto, sans-serif",
    },
  },
  credits: {
    enabled: false,
  },
  title: {
    text: "",
  },
  tooltip: {
    enabled: false,
  },
});
// Open up the building description sidebar
function openBuildingDescription(properties) {
  // Save current building's properties for switchView()
  switchViewProperties = properties;
  // Move the building description sidebar to be above any other sidebar
  document.getElementById("building-description-sidebar").style.left = "0px";
  document.getElementById("chart-tooltip-div").style.left = "379px";
  // Fill in the header
  document.getElementById("building-description-sidebar-header").innerHTML =
    // Building type icon
    "<span class='" +
    buildingTypeIcons[buildingTypes.indexOf(properties.type)] +
    " left'></span>" +
    // Building name
    "<div class='building-description-sidebar-header-truncate'>" +
    properties.location +
    "</div>" +
    // Close button
    '<span class=\'fas fa-times-circle right\' onclick=\'getElementById("building-description-sidebar").style.left = "-410px"; getElementById("chart-tooltip-div").style.left = "0px";\'></span>';
  // Color the header based on the building type
  document.getElementById(
    "building-description-sidebar-header"
  ).style.background =
    buildingTypeColors[buildingTypes.indexOf(properties.type)];
  // Fill in the value at the top of the sidebar content area
  if (switchValue == "eui") {
    document.getElementById(
      "building-description-sidebar-value1-header"
    ).innerHTML =
      "Energy Use Intensity (EUI):<div class='building-description-sidebar-info'>" +
      properties.eui.toLocaleString() +
      " <span>kBtu/ft<sup>2</sup></span></div>";
    document.getElementById(
      "building-description-sidebar-value2-header"
    ).innerHTML =
      "Total Energy Use:<div class='building-description-sidebar-info'>" +
      properties.usage.toLocaleString() +
      " <span>kBtu/yr</span></div>";
  } else {
    document.getElementById(
      "building-description-sidebar-value1-header"
    ).innerHTML =
      "Total Energy Use:<div class='building-description-sidebar-info'>" +
      properties.usage.toLocaleString() +
      " <span>kBtu/yr</span></div>";
    document.getElementById(
      "building-description-sidebar-value2-header"
    ).innerHTML =
      "Energy Use Intensity (EUI):<div class='building-description-sidebar-info'>" +
      properties.eui.toLocaleString() +
      " <span>kBtu/ft<sup>2</sup></span></div>";
  }
  document.getElementById(
    "building-description-sidebar-switch-view"
  ).innerText =
    switchValue == "eui" ? "Switch to Usage View" : "Switch to EUI View";
  // Store the building names, values, and respective building type colors
  var xAxisNames = [];
  var chartValues = [];
  var chartColors = [];
  // Store current building name, value, and color
  xAxisNames.push(properties.location);
  chartValues.push(switchValue == "eui" ? properties.eui : properties.usage);
  chartColors.push(buildingTypeColors[buildingTypes.indexOf(properties.type)]);
  // Have a separate points array that's filtered by the same building type as the current building
  var pointsChart = points.features.filter(function (feature) {
    return feature.properties.type == properties.type;
  });
  // Variables to pinpoint the buildings adjacent to the current building on the building list
  var pointIndex = 0;
  var adjacentValue = 1;
  // Store the average EUI or Usage for the current building type
  var chartAverage = 0;
  for (var i = 0; i < pointsChart.length; i++) {
    // Find the index of the current building in pointsChart
    if (pointsChart[i].properties.location == properties.location) {
      pointIndex = i;
    }
    // Calculate the average
    chartAverage +=
      switchValue == "eui"
        ? pointsChart[i].properties.eui
        : pointsChart[i].properties.usage;
    if (i == pointsChart.length - 1) {
      chartAverage = (chartAverage / pointsChart.length).toFixed(0);
    }
  }
  do {
    // Check if the previous array element is undefined
    if (pointsChart[pointIndex - adjacentValue] != undefined) {
      xAxisNames.unshift(
        pointsChart[pointIndex - adjacentValue].properties.location
      );
      chartValues.unshift(
        switchValue == "eui"
          ? pointsChart[pointIndex - adjacentValue].properties.eui
          : pointsChart[pointIndex - adjacentValue].properties.usage
      );
      chartColors.unshift("#BEBEBE");
    }
    // Check if the next array element is undefined
    if (pointsChart[pointIndex + adjacentValue] != undefined) {
      xAxisNames.push(
        pointsChart[pointIndex + adjacentValue].properties.location
      );
      chartValues.push(
        switchValue == "eui"
          ? pointsChart[pointIndex + adjacentValue].properties.eui
          : pointsChart[pointIndex + adjacentValue].properties.usage
      );
      chartColors.push("#BEBEBE");
    }
    adjacentValue++;
  } while (xAxisNames.length != 5);
  // Update the initialized chart
  Highcharts.charts[0].update(
    {
      xAxis: {
        categories: xAxisNames,
        labels: {
          padding: 1,
        },
      },
      yAxis: {
        title: "",
        plotLines: [
          {
            color: buildingTypeColors[buildingTypes.indexOf(properties.type)],
            value: chartAverage,
            width: 1,
            zIndex: 2,
          },
        ],
        tickAmount: 4,
      },
      colors: chartColors,
      series: [
        {
          data: chartValues,
          colorByPoint: true,
          showInLegend: false,
          states: {
            hover: {
              enabled: false,
            },
          },
        },
      ],
    },
    true,
    true,
    false
  );
  // Enter in tooltip text
  var valueHTML =
    switchValue == "eui"
      ? "<span>kBtu/ft<sup>2</sup></span>"
      : "<span>kBtu/yr</span>";
  var valueValue = switchValue == "eui" ? properties.eui : properties.usage;
  var valuePercentage = (
    ((valueValue - chartAverage) / chartAverage) *
    100
  ).toFixed(0);
  document.getElementById("chart-tooltip-content-div").innerHTML =
    // Current building's value
    "<div class='content-header'>" +
    properties.location +
    ":</div><div class='content-info'>" +
    valueValue.toLocaleString() +
    " " +
    valueHTML +
    "</div>" +
    // Building type average
    "<div class='content-header'>" +
    properties.type.charAt(0).toUpperCase() +
    properties.type.slice(1) +
    " Average:</div><div class='content-info'><span class='em-dash' style='color: " +
    buildingTypeColors[buildingTypes.indexOf(properties.type)] +
    "'>—</span> " +
    parseInt(chartAverage).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    }) +
    " " +
    valueHTML +
    "</div>" +
    // Percentage difference
    "<div class='content-info-percentage' style='color:" +
    (valuePercentage > 0 ? "red" : "green") +
    "'>" +
    valuePercentage.replace(/-/g, "") +
    "% " +
    (valuePercentage > 0 ? "above" : "below") +
    " average</div>";
  // Have average plot line thicken when hovering over the chart
  document.getElementById("chart").addEventListener("mouseenter", function () {
    Highcharts.charts[0].yAxis[0].userOptions.plotLines[0].width = 2;
    Highcharts.charts[0].yAxis[0].update();
    // Show tooltip
    document.getElementById("chart-tooltip-div").style.opacity = 1;
  });
  // Have average plot line narrow down when no longer hovering over the chart
  document.getElementById("chart").addEventListener("mouseleave", function () {
    Highcharts.charts[0].yAxis[0].userOptions.plotLines[0].width = 1;
    Highcharts.charts[0].yAxis[0].update();
    // Hide tooltip
    document.getElementById("chart-tooltip-div").style.opacity = 0;
  });
  // Fill in the building description
  document.getElementById("building-description-sidebar-year").innerText =
    properties.year;
  document.getElementById("building-description-sidebar-sqft").innerHTML =
    properties.sqft + " <span>ft<sup>2</sup></span>";
  document.getElementById("building-description-sidebar-cost").innerText =
    properties.cost;
  document.getElementById("building-description-sidebar-type").innerText =
    properties.type.charAt(0).toUpperCase() + properties.type.slice(1) == "Lab"
      ? "Laboratory"
      : properties.type.charAt(0).toUpperCase() + properties.type.slice(1);
  document.getElementById(
    "building-description-sidebar-space-description"
  ).innerHTML =
    buildingTypeDescriptions[buildingTypes.indexOf(properties.type)];
  // Reformat energy data button
  document.getElementById(
    "building-description-sidebar-energy-button"
  ).className = "button " + properties.type;
  document.getElementById("building-description-sidebar-energy-button").value =
    properties.location;
  // Fill in building info to Tableau dashboard header
  document.getElementById("energy-data-dashboard-header").className =
    properties.type + " energy-data-dashboard-header";
  document.getElementById("energy-data-dashboard-header-title").innerText =
    properties.location;
  document.getElementById("energy-data-dashboard-subheader-type").innerText =
    properties.type.charAt(0).toUpperCase() + properties.type.slice(1) == "Lab"
      ? "Laboratory"
      : properties.type.charAt(0).toUpperCase() + properties.type.slice(1);
  document.getElementById("energy-data-dashboard-subheader-eui").innerHTML =
    properties.eui.toLocaleString() + " <span>kBtu/ft<sup>2</sup></span>";
  document.getElementById("energy-data-dashboard-subheader-usage").innerHTML =
    properties.usage.toLocaleString() + " <span>kBtu/yr</span>";
  // Change filter in Tableau dashboard
  workbook.activateSheetAsync("Energy Consumption");
  workbook
    .getActiveSheet()
    .getWorksheets()[0]
    .applyFilterAsync(
      "Building List Adjusted",
      properties.location,
      tableauSoftware.FilterUpdateType.REPLACE
    );
}

// Switch between EUI or Usage based on the button in the building description bar
function switchView() {
  // Switch the other sidebars and map to display EUI or Usage
  switchBetween();
  // Adjust the button text
  document.getElementById(
    "building-description-sidebar-switch-view"
  ).innerText =
    switchValue == "eui" ? "Switch to Usage View" : "Switch to EUI View";
  // Reset the building description sidebar
  openBuildingDescription(switchViewProperties);
}

// Show search results
function searchResults() {
  if (!document.getElementsByClassName("search-result").length) {
    // Have a separate points array that's sorted alphabetically
    var pointsAlphabetical = JSON.parse(JSON.stringify(points));
    pointsAlphabetical.features.sort(function (a, b) {
      return a.properties.location.localeCompare(b.properties.location);
    });
    // Fill in the search results list with the building list
    var results = document.getElementById("search-bar-results");
    for (var i = 0; i < pointsAlphabetical.features.length; i++) {
      var result = results.appendChild(document.createElement("div"));
      result.id =
        "search-" + pointsAlphabetical.features[i].properties.location;
      result.className =
        "search-result " + pointsAlphabetical.features[i].properties.type;
      result.innerHTML =
        "<span class='" +
        buildingTypeIcons[
          buildingTypes.indexOf(pointsAlphabetical.features[i].properties.type)
        ] +
        "'></span>" +
        pointsAlphabetical.features[i].properties.location;
    }
    // Zoom the map to the building location when a building in the search results list is clicked
    pointsAlphabetical.features.forEach(function (feature) {
      var item = document.getElementById(
        "search-" + feature.properties.location
      );
      // Check if the requested result energy-data-dashboard-header-titlet of results
      if (item != undefined) {
        item.addEventListener("click", function () {
          // Have the map center and zoom on the building selected
          map.flyTo({
            center: feature.geometry.coordinates,
            zoom: 17,
          });
          // Open the building description sidebar
          openBuildingDescription(feature.properties);
          // Clear the search results
          document.getElementById("search-bar-input").value = "";
          searchResults();
        });
      }
    });
  }
  // Take the input from the search bar and filter the search results by the input
  var input, filter, result, text;
  input = document.getElementById("search-bar-input");
  filter = input.value.toUpperCase();
  var results = document.getElementsByClassName("search-result");
  for (var i = 0; i < results.length; i++) {
    result = results[i];
    text = result.textContent || result.innerText;
    // Check if the input matches any of the search results, if not then hide the result
    if (text.toUpperCase().indexOf(filter) > -1 && filter != "") {
      results[i].style.display = "";
    } else {
      results[i].style.display = "none";
    }
  }
}

// Add in a 2nd map that will be used as a switch to satellite view button
var mapSatelliteView = new mapboxgl.Map({
  container: "map-layer",
  style: "mapbox://styles/mapbox/satellite-v9",
  center: [-73.123565, 40.913606],
  zoom: 11.5,
  interactive: false,
});
// Switch from map view to satellite and vice versa
function satelliteView() {
  if (mapSatelliteView.getStyle().name == "Mapbox Satellite") {
    map.setLayoutProperty("satellite-map", "visibility", "visible");
    mapSatelliteView.setStyle(
      "mapbox://styles/rulesofthumb/ck0gyb3703c0f1dphly4weyik",
      { diff: false }
    );
    document.getElementById("map-layer-label").innerText = "Map";
    document.getElementById("map-layer-label").style.color = "#000000";
  } else {
    map.setLayoutProperty("satellite-map", "visibility", "none");
    mapSatelliteView.setStyle("mapbox://styles/mapbox/satellite-v9", {
      diff: false,
    });
    document.getElementById("map-layer-label").innerText = "Satellite";
    document.getElementById("map-layer-label").style.color = "#FFFFFF";
  }
}

// Create Tableau dashboard
function initializeViz() {
  var placeholderDiv = document.getElementById("tableau-dashboard");
  var url =
    "https://tableau.stonybrook.edu/t/FinanceandAdministration/views/SBUEnergyDashboardV2/EnergyConsumption";
  var options = {
    width: "1400px",
    height: "850px",
    hideTabs: true,
    hideToolbar: true,
    onFirstInteractive: function () {
      workbook = viz.getWorkbook();
    },
  };
  viz = new tableau.Viz(placeholderDiv, url, options);
  viz.addEventListener(
    tableau.TableauEventName.FILTER_CHANGE,
    adjustDashboardHeader
  );
}

// Tableau thing
function adjustDashboardHeader(e) {
  if (
    window.getComputedStyle(
      document.getElementById("energy-data-dashboard-div")
    ).zIndex != "-1"
  ) {
    var duplicatedPoints = JSON.parse(JSON.stringify(points));
    duplicatedPoints.features.sort(function (a, b) {
      return a.properties.location.localeCompare(b.properties.location);
    });
    e.getFilterAsync().then(function (filter) {
      var tableauFilterValue = filter.getAppliedValues()[0].value;
      for (var i = 0; i < duplicatedPoints.features.length; i++) {
        if (
          tableauFilterValue == duplicatedPoints.features[i].properties.location
        ) {
          document.getElementById("energy-data-dashboard-header").className =
            duplicatedPoints.features[i].properties.type +
            " energy-data-dashboard-header";
          document.getElementById(
            "energy-data-dashboard-header-title"
          ).innerText = duplicatedPoints.features[i].properties.location;
          document.getElementById(
            "energy-data-dashboard-subheader-type"
          ).innerText =
            duplicatedPoints.features[i].properties.type
              .charAt(0)
              .toUpperCase() +
              duplicatedPoints.features[i].properties.type.slice(1) ==
            "Lab"
              ? "Laboratory"
              : properties.type.charAt(0).toUpperCase() +
                duplicatedPoints.features[i].properties.type.slice(1);
          document.getElementById(
            "energy-data-dashboard-subheader-eui"
          ).innerHTML =
            duplicatedPoints.features[i].properties.eui.toLocaleString() +
            " <span>kBtu/ft<sup>2</sup></span>";
          document.getElementById(
            "energy-data-dashboard-subheader-usage"
          ).innerHTML =
            duplicatedPoints.features[i].properties.usage.toLocaleString() +
            " <span>kBtu/yr</span>";
        }
      }
    });
  }
}

// Toggle Tableau energy data dashboard visibility
function showTableauDashboard() {
  document.getElementById("energy-data-dashboard-div").style.zIndex = "5";
  map.flyTo({
    center: [-73.123565, 40.914606],
    zoom: 16,
  });
  document.getElementById("building-description-sidebar").style.left = "-410px";
  document.getElementById("chart-tooltip-div").style.left = "0px";
  // Change filter in Tableau dashboard
  workbook.activateSheetAsync("Energy Consumption");
  workbook
    .getActiveSheet()
    .getWorksheets()[0]
    .applyFilterAsync(
      "Building List Adjusted",
      document.getElementById("energy-data-dashboard-header-title").innerText,
      tableauSoftware.FilterUpdateType.REPLACE
    );
}
function hideTableauDashboard() {
  document.getElementById("energy-data-dashboard-div").style.zIndex = "-1";
}

// Zoom into location
function zoomIntoLocation(campus) {
  if (campus === "west") {
    map.flyTo({
      center: [-73.126099, 40.914917],
      zoom: 15,
    });
  } else if (campus === "east") {
    map.flyTo({
      center: [-73.114673, 40.907996],
      zoom: 16,
    });
  } else if (campus === "south") {
    map.flyTo({
      center: [-73.119648, 40.904239],
      zoom: 16.5,
    });
  } else if (campus === "r&d") {
    map.flyTo({
      center: [-73.137148, 40.899632],
      zoom: 15.5,
    });
  } else if (campus === "southampton") {
    map.flyTo({
      center: [-72.444848, 40.887581],
      zoom: 16,
    });
  }
}

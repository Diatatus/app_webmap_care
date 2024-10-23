$(document).ready(function () {
  setTimeout(function () {
    $("#loading").fadeOut(); // Masquer le div de chargement après 3 secondes
  }, 2000); // Délai de 3000 millisecondes (3 secondes)
});

// Get elements

const customproj = ol.proj.get("EPSG:4326");

// The Map
var mapView = new ol.View({
  center: ol.proj.fromLonLat([12.2, 7.5]),
  zoom: 6.2,
  minZoom: 6.2, // Prevent zooming out below this zoom level
  rotation: 0, // Disable initial rotation
  constrainRotation: true, // Prevent accidental rotation
});

// Create a list of interactions without rotation interactions
var interactions = [
  new ol.interaction.DragPan(), // Allows panning of the map
  new ol.interaction.PinchZoom(), // Allows pinch zooming (for touch devices)
  new ol.interaction.MouseWheelZoom(), // Allows zooming with the mouse wheel
  new ol.interaction.DragZoom(), // Allows zooming by selecting a region
];

// Initialize the map with the defined interactions
var map = new ol.Map({
  target: "map", // Target the 'map' div element
  view: mapView,
  interactions: new ol.Collection(interactions), // Use customized interactions
  controls: [], // Customize or keep default controls as desired
});

// Attribution control

// Assume 'map' is your OpenLayers map instance
// Enregistrer la vue initiale
var initialCenter = [12.2, 7.5]; // Remplacez par les coordonnées initiales de votre carte
var initialZoom = 6.2; // Remplacez par le zoom initial de votre carte
document.getElementById("zoom-in").addEventListener("click", function () {
  var view = map.getView();
  var zoom = view.getZoom();
  view.animate({
    zoom: zoom + 1,
    duration: 250, // Duration in milliseconds
  });
});

document.getElementById("zoom-out").addEventListener("click", function () {
  var view = map.getView();
  var zoom = view.getZoom();
  view.animate({
    zoom: zoom - 1,
    duration: 250, // Duration in milliseconds
  });
});
document.getElementById("zoom-initial").addEventListener("click", function () {
  var view = map.getView();
  view.animate({
    center: ol.proj.fromLonLat(initialCenter),
    zoom: initialZoom,
    duration: 250, // Duration in milliseconds
  });
});

function switchLayer(layerName) {
  var layers = map.getLayers().getArray();
  layers.forEach(function (layer) {
    // Vérifie si la couche est une couche de base (fond de carte)
    if (layer.get("isBaseLayer")) {
      if (layer.get("name") === layerName) {
        layer.setVisible(true);
      } else {
        layer.setVisible(false);
      }
    }
  });
}

//Bing map Tile

var bingMapsAerial = new ol.layer.Tile({
  title: "Aerial",
  visible: false,
  baseLayer: true,
  type: "base",
  isBaseLayer: true,
  preload: Infinity,
  source: new ol.source.BingMaps({
    key: "AuOKP0N2ww907dY398Ci9ZKg38AqF2jc7q1QchUixWw30TpwdCt4T36ip-OyE49R",
    imagerySet: "AerialWithLabelsOnDemand",
  }),
  name: "Aerial",
});

var osm = new ol.layer.Tile({
  title: "OSM",
  baseLayer: true,
  isBaseLayer: true,
  source: new ol.source.OSM(),
  visible: true,
  name: "OSM",
});

map.addLayer(osm);
map.addLayer(bingMapsAerial);

// Initially, set only one layer visible
osm.setVisible(true);
bingMapsAerial.setVisible(false);

// Créez la couche "Régions" avec les styles définis
var regionLayer = new ol.layer.Vector({
  name: "Régions",
  source: new ol.source.Vector({
    url: "/api/regions_villes", // URL de l'endpoint Node.js pour récupérer les données GeoJSON
    format: new ol.format.GeoJSON(),
  }),
  style: function (f) {
    return new ol.style.Style({
      image: new ol.style.RegularShape({
        radius: 5,
        radius2: 0,
        points: 4,
        stroke: new ol.style.Stroke({ color: "#000", width: 1 }),
      }),
      stroke: new ol.style.Stroke({
        width: 1,
        color: [255, 128, 0],
      }),
      fill: new ol.style.Fill({
        color: [255, 128, 0, 0.2],
      }),
    });
  },
});

map.addLayer(regionLayer);

// Variable pour savoir si la couche est actuellement visible ou non
var regionLayerVisible = true;

// Gestion du clic sur le bouton pour afficher/masquer la couche
document.getElementById("toggleRegions").addEventListener("click", function () {
  if (!regionLayerVisible) {
    // Si la couche n'est pas visible, l'ajouter à la carte
    map.addLayer(regionLayer);
    regionLayerVisible = true;
  } else {
    // Si la couche est visible, la retirer de la carte
    map.removeLayer(regionLayer);
    regionLayerVisible = false;
  }
});

// Select  interaction
var select = new ol.interaction.Select({
  hitTolerance: 5,
  multi: false,
  condition: ol.events.condition.singleClick,
});
map.addInteraction(select);

// Global variables to store chart instances
var demographyChart, familyChart;

function createCharts(feature) {
  // Destroy existing charts if they exist
  if (demographyChart) demographyChart.destroy();

  if (familyChart) familyChart.destroy();

  // Demography data
  var demographyData = {
    labels: [
      "Hommes", // Icon for Male
      "Femmes", // Icon for Female
    ],
    datasets: [
      {
        label: "Population",
        data: [
          feature.get("popsexmasc"), // Male Population
          feature.get("popsexfem"), // Female Population
        ],
        backgroundColor: ["#36A2EB", "#FF6384"], // Blue for Male, Pink for Female
      },
    ],
  };
  // Set the total population and population density values under the icons
  document.getElementById("total-population-info").textContent =
    feature.get("total_pop").toLocaleString() + " habitants";
  document.getElementById("population-density-info").textContent =
    feature.get("denspopreg") + " hab/km²";

  // Assuming 'feature' contains the data for the selected region
  document.getElementById("access-sanity").textContent = feature.get("asa"); // Access to improved water
  document.getElementById("access-water").textContent = feature.get("aea"); // Access to improved water
  document.getElementById("handwashing").textContent = feature.get("ill"); // Handwashing facilities

  // HIV Prevalence
  document.getElementById("hiv-males").textContent = feature.get("pvihhom"); // HIV Prevalence (Males)
  document.getElementById("hiv-females").textContent = feature.get("pvihfem"); // HIV Prevalence (Females)

  // Assuming 'feature' contains the data for the selected region
  document.getElementById("poverty-rate").textContent = feature.get("tauxpvrt");
  document.getElementById("unemployment-rate").textContent =
    feature.get("chom");
  document.getElementById("financial-inclusion").textContent =
    feature.get("ife");

  // Assuming 'feature' contains the data for the selected region
  document.getElementById("unmet-need").textContent = feature.get("pf"); // Family planning unmet need
  document.getElementById("contraceptive-use").textContent =
    feature.get("fcpm"); // Women using contraceptives

  // Family Planning data
  var familyData = {
    labels: ["Hommes", "Femmes"],
    datasets: [
      {
        data: [feature.get("vch"), feature.get("vcf")], // Men and Women who justify domestic violence
        backgroundColor: ["#36A2EB", "#FF6384"], // Blue for Men, Red for Women
      },
    ],
  };
  // Create Demography chart
  demographyChart = new Chart(document.getElementById("demography-chart"), {
    type: "pie", // Change chart type to pie
    data: demographyData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });

  // Create Family Planning chart
  familyChart = new Chart(
    document.getElementById("domestic-violence-pie-chart"),
    {
      type: "pie",
      data: familyData,
    }
  );
}

map.on("click", function (evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  if (feature) {
    // Show popup with feature data
    showPopup(feature);
  }
});

// Function to open the popup with a smooth transition and insert the zone name
function showPopup(feature) {
  const popupContainer = document.getElementById("popup-container");

  // Get the zone name (assuming the feature has a 'zoneName' property)
  const zoneName = feature.get("nom");

  // Insert the zone name in the left span element
  document.getElementById(
    "zone-name"
  ).innerHTML = `<strong>${zoneName}</strong>`;

  popupContainer.style.display = "block"; // Make the container visible

  setTimeout(() => {
    popupContainer.style.opacity = 1; // Fade-in effect
  }, 10); // Short delay for smooth transition

  // Call the function to create charts, passing the feature data
  createCharts(feature);
}

// Function to close the popup
function closePopup() {
  const popupContainer = document.getElementById("popup-container");
  popupContainer.style.opacity = 0; // Fade-out effect

  setTimeout(() => {
    popupContainer.style.display = "none"; // Hide after fade-out
  }, 500); // Matches the fade-out transition duration
}

// Re-bind the close button event listener
document
  .getElementById("popup-close-btn")
  .addEventListener("click", closePopup);

// Event listener for clicking on the map to show the popup
map.on("click", function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  if (feature) {
    showPopup(feature); // Display the popup when a feature is clicked
  }
});

function toggleLayer(eve) {
  var lyrname = eve.target.value;
  var checkedStatus = eve.target.checked;
  var lyrList = map.getLayers();

  lyrList.forEach(function (element) {
    if (lyrname == element.get("title")) {
      element.setVisible(checkedStatus);
    }
  });
}

// Récupérer les éléments
// Get the toggle button and the story div
const toggleButton = document.getElementById("toggleBases");
const storyDiv = document.getElementById("story");

// Function to toggle the display of the story div
function toggleStoryDiv() {
  if (storyDiv.style.display === "none" || storyDiv.style.display === "") {
    storyDiv.style.display = "block"; // Show the story div
  } else {
    storyDiv.style.display = "none"; // Hide the story div
  }
}

// Add click event listener to the toggle button
toggleButton.addEventListener("click", toggleStoryDiv);

// Add placemark
var placemark = new ol.Overlay.Placemark();
map.addOverlay(placemark);

// The storymap
var story = new ol.control.Storymap({
  html: document.getElementById("story"),
  //target: document.getElementById("story"),
  minibar: true,
  //className: 'scrollBox'
});

// Show image fullscreen on click
var fullscreen = new ol.control.Overlay({
  hideOnClick: true,
  className: "zoom",
});
map.addControl(fullscreen);
story.on("clickimage", function (e) {
  console.log(e);
  fullscreen.showImage(e.img.src, e);
});

// Fly to the chapter on the map
story.on("scrollto", function (e) {
  if (e.name === "start") {
    placemark.hide();
  } else {
    placemark.show(e.coordinate);
  }
});

function setClassName(c) {
  console.log(c);
  story.element.classList.remove("scrollLine");
  story.element.classList.remove("scrollBox");
  if (c) story.element.classList.add(c);
  window.dispatchEvent(new Event("resize"));
}

map.addControl(story);

$(document).ready(function () {
  setTimeout(function () {
    $("#loading").fadeOut(); // Masquer le div de chargement après 3 secondes
  }, 2000); // Délai de 3000 millisecondes (3 secondes)
});

// Get elements

const mapContainer = document.getElementById("map-container");

const customproj = ol.proj.get("EPSG:4326");
// The Map
var mapView = new ol.View({
  center: ol.proj.fromLonLat([12.2, 7.5]),
  zoom: 6.2,
  rotation: 0, // Désactiver la rotation initiale
  constrainRotation: true, // Empêcher la rotation accidentelle
});

// Créer une liste d'interactions sans les interactions de rotation
var interactions = [
  new ol.interaction.DragPan(), // Permet de faire glisser la carte
  new ol.interaction.PinchZoom(), // Permet de zoomer avec les gestes tactiles
  new ol.interaction.MouseWheelZoom(), // Permet de zoomer avec la molette de la souris
  new ol.interaction.DragZoom(), // Permet de zoomer en sélectionnant une zone avec la souris
];

// Initialiser la carte avec les interactions définies
var map = new ol.Map({
  target: "map", // Ciblez l'élément div avec l'ID "map"
  view: mapView,
  interactions: new ol.Collection(interactions), // Utilisation des interactions personnalisées
  controls: [], // Garde les contrôles par défaut si vous le souhaitez
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
    imagerySet: "Aerial",
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
      text: new ol.style.Text({
        text: f.get("id").toString(),
        font: "bold 11px sans-serif",
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
  multi: true,
  condition: ol.events.condition.singleClick,
});
map.addInteraction(select);

// Global variables to store chart instances
var demographyChart, healthChart, economyChart, familyChart;

function createCharts(feature) {
  // Destroy existing charts if they exist
  if (demographyChart) demographyChart.destroy();
  if (healthChart) healthChart.destroy();
  if (economyChart) economyChart.destroy();
  if (familyChart) familyChart.destroy();

  // Demography data
  var demographyData = {
    labels: [
      "Total Population",
      "Male Population",
      "Female Population",
      "Population Density",
    ],
    datasets: [
      {
        label: "Demography",
        data: [
          feature.get("total_pop"),
          feature.get("popsexmasc"),
          feature.get("popsexfem"),
          feature.get("denspopreg"),
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  // Health data
  var healthData = {
    labels: [
      "HIV Prevalence (Males 15-49)",
      "HIV Prevalence (Females 15-49)",
      "Handwashing Facilities",
      "Access to Improved Water",
    ],
    datasets: [
      {
        label: "Health",
        data: [
          feature.get("pvihhom"),
          feature.get("pvihfem"),
          feature.get("ill"),
          feature.get("aea"),
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  // Economy data
  var economyData = {
    labels: [
      "Poverty Rate",
      "Unemployment Rate",
      "Financial Inclusion (EMF Access)",
    ],
    datasets: [
      {
        label: "Economy & Employment",
        data: [
          feature.get("tauxpvrt"),
          feature.get("chom"),
          feature.get("ife"),
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  // Family Planning data
  var familyData = {
    labels: [
      "Unmet Need for Family Planning",
      "Women Using Modern Contraceptives",
      "Men Justifying Domestic Violence",
      "Women Justifying Domestic Violence",
    ],
    datasets: [
      {
        label: "Family & Planning",
        data: [
          feature.get("pf"),
          feature.get("fcpm"),
          feature.get("vch"),
          feature.get("vcf"),
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  // Create Demography chart
  demographyChart = new Chart(document.getElementById("demography-chart"), {
    type: "bar",
    data: demographyData,
  });

  // Create Health chart
  healthChart = new Chart(document.getElementById("health-chart"), {
    type: "bar",
    data: healthData,
  });

  // Create Economy chart
  economyChart = new Chart(document.getElementById("economy-chart"), {
    type: "bar",
    data: economyData,
  });

  // Create Family Planning chart
  familyChart = new Chart(document.getElementById("family-chart"), {
    type: "bar",
    data: familyData,
  });
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

// Function to open the popup with smooth transition
function showPopup(feature) {
  const popup = document.getElementById("popup-info");
  popup.style.display = "block";
  setTimeout(() => {
    popup.style.opacity = 1; // Fade in effect
  }, 10); // Small delay for smooth effect

  // Pass feature data to create charts (assuming createCharts is a function that renders charts based on feature data)
  createCharts(feature);
}

// Function to close the popup
function closePopup() {
  const popup = document.getElementById("popup-info");
  popup.style.opacity = 0; // Start fading out
  setTimeout(() => {
    popup.style.display = "none"; // Hide after fading out
  }, 500); // Match with transition duration (0.5s)
}

// Add event listener to the close button
document
  .getElementById("popup-close-btn")
  .addEventListener("click", closePopup);

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
const toggleButton = document.getElementById("toggleBases");
const closeButton = document.getElementById("closeButton");
const storyDiv = document.getElementById("story");

// Masquer la div à l'accueil
storyDiv.style.display = "none";

// Fonction pour afficher la div au clic sur le bouton "Bases"
toggleButton.addEventListener("click", function () {
  storyDiv.style.display = "block"; // Afficher la div
});

// Fonction pour masquer la div au clic sur le bouton "Fermer"
closeButton.addEventListener("click", function () {
  storyDiv.style.display = "none"; // Masquer la div
});

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

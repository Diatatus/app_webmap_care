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
});

var map = new ol.Map({
  target: "map",
  view: mapView,
  controls: [],
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
    url: "/api/regions", // URL de l'endpoint Node.js pour récupérer les données GeoJSON
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

// Select control
var popup = new ol.Overlay.PopupFeature({
  popupClass: "default anim",
  select: select,
  canFix: true,
  /** /
  template: function(f) {
    return {
      title: function(f) { return f.get('nom')+' ('+f.get('id')+')' },
      attributes: { 
        region: { title: 'Région' }, 
        arrond: 'arrond', 
        cantons: 'cantons', 
        communes: 'communes', 
        pop: 'pop' 
      }
    }
  },
  /**/

  closeBox: true,
  template: {
    title:
      // 'nom',   // only display the name
      function (f) {
        return f.get("nom") + " (" + f.get("id_pays") + ")";
      },
    // [ 'region', 'arrond', 'cantons', 'communes', 'pop' ]
    attributes: {
      nom: { title: "Région" },
      nombre_departements: { title: "Départements" },
      nombre_communes: { title: "Communes" },
      communes_arrondissement: { title: "Communauté Urbaine" },
      nombre_population: { title: "Population" },
      superficie: { title: "Superficie" },
      // with prefix and suffix
      pop: {
        title: "Population", // attribute's title
        before: "", // something to add before
        format: ol.Overlay.PopupFeature.localString(), // format as local string
        after: " hab.", // something to add after
      },
      // calculated attribute
      pop2: {
        title: "Population (kHab.)", // attribute's title
        format: function (val, f) {
          return (
            Math.round(parseInt(f.get("pop")) / 100).toLocaleString() + " kHab."
          );
        },
      },
      /* Using localString with a date * /
        'date': { 
          title: 'Date', 
          format: ol.Overlay.PopupFeature.localString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) 
        }
        /**/
    },
  },
});

map.addOverlay(popup);

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

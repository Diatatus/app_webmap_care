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
  zoom: 6,
  minZoom: 6, // Prevent zooming out below this zoom level
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
var initialZoom = 6; // Remplacez par le zoom initial de votre carte
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
var CamerounLayer = new ol.layer.Vector({
  name: "Cameroun",
  source: new ol.source.Vector({
    url: "/api/cameroun", // URL de l'endpoint Node.js pour récupérer les données GeoJSON
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
        width: 0.1,
        color: [255, 128, 0],
      }),
      fill: new ol.style.Fill({
        color: [255, 128, 0, 0],
      }),
    });
  },
});

map.addLayer(CamerounLayer);

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

// Créez la couche "Régions" avec les styles définis
var worldMapLayer = new ol.layer.Vector({
  name: "WorldMap",
  source: new ol.source.Vector({
    url: "/api/world_map", // URL de l'endpoint Node.js pour récupérer les données GeoJSON
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
        width: 0.1,
        color: [255, 128, 0],
      }),
      fill: new ol.style.Fill({
        color: [50, 50, 50, 0.8],
      }),
    });
  },
});

map.addLayer(worldMapLayer);

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

// Select interaction
var select = new ol.interaction.Select({
  hitTolerance: 5,
  multi: false,
  condition: ol.events.condition.singleClick,
  // Filtrer les couches sélectionnables (exclure partnerLayer)
  filter: function (feature, layer) {
    // Retourner vrai uniquement si ce n'est pas la couche partnerLayer
    return layer !== partnerLayer;
  },
});

// Ajouter l'interaction à la carte
map.addInteraction(select);

// Charger les données GeoJSON des partenaires
// Charger les données GeoJSON des partenaires avec style par défaut
var partnerLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: "/api/care_partner",
    format: new ol.format.GeoJSON(),
  }),
  style: function (feature) {
    return createDefaultStyle(feature);
  },
});

// Ajouter la couche des partenaires à la carte
map.addLayer(partnerLayer);

// Fonction pour créer le style par défaut
function createDefaultStyle(feature) {
  return new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: "./resources/images/partner_location.svg",
      scale: 0.15,
    }),
    text: new ol.style.Text({
      text: feature.get("sigle"),
      font: "bold 12px Arial",
      fill: new ol.style.Fill({ color: "#ffffff" }),
      stroke: new ol.style.Stroke({ color: "#000000", width: 3 }),
      offsetY: -15, // Place l'étiquette au-dessus de l'icône
    }),
  });
}

// Fonction de style pour la sélection et le survol
function createHighlightStyle(feature) {
  return new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: "./resources/images/partner_location_y.svg",
      scale: 0.2,
    }),
    text: new ol.style.Text({
      text: feature.get("sigle"),
      font: "bold 12px Arial",
      fill: new ol.style.Fill({ color: "#0000FF" }),
      stroke: new ol.style.Stroke({ color: "#ffffff", width: 4 }),
      offsetY: -15, // Assure une position constante de l'étiquette
    }),
  });
}

// Gestion du survol de la couche partnerLayer
let currentHoveredFeature = null;
map.on("pointermove", function (evt) {
  if (currentHoveredFeature) {
    currentHoveredFeature.setStyle(createDefaultStyle(currentHoveredFeature));
    currentHoveredFeature = null;
  }

  // Applique le style de survol uniquement aux entités de partnerLayer
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if (layer === partnerLayer) {
      feature.setStyle(createHighlightStyle(feature));
      currentHoveredFeature = feature;
      return true;
    }
  });
});

// Interaction de sélection pour la couche des partenaires
var selectPartner = new ol.interaction.Select({
  layers: [partnerLayer],
  style: function (feature) {
    return createHighlightStyle(feature);
  },
});
map.addInteraction(selectPartner);

var partnerLayerVisible = true;

// Gestion du clic sur le bouton pour afficher/masquer la couche
document
  .getElementById("togglePartenaires")
  .addEventListener("click", function () {
    if (!partnerLayerVisible) {
      // Si la couche n'est pas visible, l'ajouter à la carte
      map.addLayer(partnerLayer);
      partnerLayerVisible = true;
    } else {
      // Si la couche est visible, la retirer de la carte
      map.removeLayer(partnerLayer);
      partnerLayerVisible = false;
    }
  });

// Définir la source des clusters
var clusterSource = new ol.source.Cluster({
  distance: 25, // La distance entre les points pour être regroupés en clusters
  source: new ol.source.Vector({
    url: "/api/care_partner", // Votre endpoint GeoJSON
    format: new ol.format.GeoJSON(),
  }),
});

// Style des clusters
var clusterStyle = function (feature) {
  var size = feature.get("features").length; // Obtenir la taille du cluster
  if (size > 1) {
    // Si c'est un cluster
    // Style pour les clusters (plusieurs points regroupés)
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 10 + Math.min(size, 20),
        fill: new ol.style.Fill({
          color: "rgba(255, 69, 0, 0.6)",
        }),
        stroke: new ol.style.Stroke({
          color: "#fff",
          width: 2,
        }),
      }),
      text: new ol.style.Text({
        text: size.toString(),
        fill: new ol.style.Fill({
          color: "#fff",
        }),
        stroke: new ol.style.Stroke({
          color: "#000",
          width: 2,
        }),
      }),
    });
  }
};

// Définir la couche des clusters avec le style
var clusterLayer = new ol.layer.Vector({
  source: clusterSource,
  style: clusterStyle, // Appliquer le style aux clusters
});

// Ajout des deux couches mais on alterne en fonction du zoom

// Seuil de zoom pour basculer entre les couches
var zoomThreshold = 12;

// Fonction pour ajuster l'opacité des couches en fonction du zoom actuel
function adjustLayerOpacity() {
  var zoom = map.getView().getZoom();

  if (zoom > zoomThreshold) {
    // Afficher les projets individuels, masquer les clusters
    clusterLayer.setOpacity(0);
    partnerLayer.setOpacity(1);
  } else {
    // Afficher les clusters, masquer les projets individuels
    clusterLayer.setOpacity(1);
    partnerLayer.setOpacity(0);
  }
}

// Appeler la fonction au changement de zoom
map.getView().on("change:resolution", function () {
  adjustLayerOpacity(); // Ajuster l'opacité lors du changement de résolution (zoom)
});

// Appeler la fonction lors du chargement initial pour ajuster l'opacité selon le zoom par défaut
adjustLayerOpacity();

// Ajouter les deux couches à la carte
map.addLayer(clusterLayer);

var clusterLayerVisible = true;

// Gestion du clic sur le bouton pour afficher/masquer la couche
document
  .getElementById("togglePartenaires")
  .addEventListener("click", function () {
    if (!clusterLayerVisible) {
      // Si la couche n'est pas visible, l'ajouter à la carte
      map.addLayer(clusterLayer);
      clusterLayerVisible = true;
    } else {
      // Si la couche est visible, la retirer de la carte
      map.removeLayer(clusterLayer);
      clusterLayerVisible = false;
    }
  });

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

// Interaction : afficher un popup uniquement pour la couche regions

// Utilisation de forEachLayerAtPixel pour vérifier les couches
// Interaction : afficher un popup uniquement pour la couche regions
map.on("click", function (evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if (layer === regionLayer || layer === CamerounLayer) {
      // Vérifie si la couche est la couche regions
      return feature;
    }
  });

  if (feature) {
    // Afficher le popup avec les données de la feature sélectionnée
    showPopup(feature); // Fonction pour afficher le popup
  } else {
    // Ne rien afficher si aucune entité de la couche regions n'est cliquée
    return;
  }
});

// Function to show the popup with feature data at the application load
function showInitialPopup() {
  // Vérifier que CamerounLayer a bien été ajoutée à la carte
  CamerounLayer.getSource().once("change", function (e) {
    if (CamerounLayer.getSource().getState() === "ready") {
      // Obtenir la première entité de la couche Cameroun
      const features = CamerounLayer.getSource().getFeatures();
      if (features.length > 0) {
        // Afficher le popup pour la première entité
        showPopup(features[0]);
      }
    }
  });
}

showInitialPopup();

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

// Main search function to handle user input
var txtVal = "";
var inputBox = document.getElementById("inpt_search");
var liveDataDivEle = document.getElementById("liveDataDiv");
var searchTable = document.createElement("table");

inputBox.onkeyup = function () {
  const newVal = this.value.trim();
  if (newVal !== txtVal) {
    txtVal = newVal;
    if (txtVal.length > 2) {
      clearResults();
      createLiveSearchTable();

      const layers = [
        { name: "partenaire", attribute: "nom" },
        { name: "partenaire", attribute: "sigle" },
      ];

      layers.forEach((layer) => {
        $.ajax({
          url: "http://localhost:3000/api/liveSearch", // Node.js server endpoint
          type: "POST",
          data: JSON.stringify({
            request: "liveSearch",
            searchTxt: txtVal,
            searchLayer: layer.name,
            searchAttribute: layer.attribute,
          }),
          contentType: "application/json",
          dataType: "json",
          success: function (response) {
            createRows(response, layer.name);
          },
        });
      });
    } else {
      clearResults();
    }
  }
};

// Function to create the search table
function createLiveSearchTable() {
  searchTable.setAttribute("class", "assetSearchTableClass");
  searchTable.setAttribute("id", "assetSearchTableID");

  const tableHeaderRow = document.createElement("tr");
  const tableHeader1 = document.createElement("th");
  tableHeader1.innerHTML = "Données";
  const tableHeader2 = document.createElement("th");
  tableHeader2.innerHTML = "Résultats";

  tableHeaderRow.appendChild(tableHeader1);
  tableHeaderRow.appendChild(tableHeader2);
  searchTable.appendChild(tableHeaderRow);

  // Append the table to the liveDataDiv
  liveDataDivEle.appendChild(searchTable);
}

// Function to create table rows
function createRows(data, layerName) {
  data.forEach((item) => {
    const tableRow = document.createElement("tr");
    const td1 = document.createElement("td");
    td1.innerHTML = layerName;

    const td2 = document.createElement("td");
    const attribute = Object.keys(item)[0];
    td2.innerHTML = item[attribute];
    td2.addEventListener("click", function () {
      zoomToFeature(td2, layerName, attribute);
      clearResults(); // Hide table after selection
    });

    tableRow.appendChild(td1);
    tableRow.appendChild(td2);
    searchTable.appendChild(tableRow);
  });
}

var queryGeoJSON = null; // Initialize to hold GeoJSON layer if needed

// Clear previous search results
function clearResults() {
  liveDataDivEle.innerHTML = "";
  searchTable.innerHTML = "";
  // Removed line: map.removeLayer(queryGeoJSON);
}

function zoomToFeature(featureElement, layerName, attributeName) {
  const value_txt = featureElement.innerHTML;

  // Désélectionner tous les points avant de sélectionner un nouveau point
  selectPartner.getFeatures().clear();

  // Requête pour récupérer les coordonnées du point dans la base de données
  $.ajax({
    url: "http://localhost:3000/api/zoomFeature",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      layerName: layerName,
      attributeName: attributeName,
      value: value_txt,
    }),
    success: function (response) {
      console.log("Géométrie reçue :", response.geometry);

      if (response.geometry) {
        const geometry = JSON.parse(response.geometry);

        if (geometry.type === "Point") {
          let [x, y] = geometry.coordinates;

          // Transformation des coordonnées de EPSG:4326 à EPSG:3857
          const transformedCoords = ol.proj.transform(
            [x, y],
            "EPSG:4326",
            "EPSG:3857"
          );

          // Zoomer sur la zone d'extension autour du point
          const pointExtent = ol.extent.buffer(
            [...transformedCoords, ...transformedCoords],
            1000
          );
          map.getView().fit(pointExtent, { duration: 1000 });

          // Trouver la feature existante dans partnerLayer
          let foundFeature = null;
          partnerLayer.getSource().forEachFeature(function (feature) {
            if (
              feature.get("sigle") === value_txt ||
              feature.get("nom") === value_txt
            ) {
              foundFeature = feature;
            }
          });

          // Si la feature est trouvée, la sélectionner
          if (foundFeature) {
            selectPartner.getFeatures().push(foundFeature); // Activer la sélection
          } else {
            console.warn("Feature introuvable dans partnerLayer.");
          }
        } else {
          console.warn("Aucune coordonnée disponible pour cette entité.");
        }
      } else {
        console.warn("Aucune donnée de géométrie trouvée pour l'entité.");
      }
    },
    error: function (error) {
      console.error("Erreur lors de la récupération de la géométrie :", error);
    },
  });
}

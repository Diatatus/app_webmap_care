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
var partnerLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: "/api/care_partner", // Ton endpoint pour récupérer les partenaires
    format: new ol.format.GeoJSON(),
  }),
  style: function (feature) {
    return new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: "./resources/images/people-group-solid.svg", // Icône SVG par défaut
        scale: 0.3, // Taille initiale de l'icône
      }),
      text: new ol.style.Text({
        text: feature.get("sigle"),
        font: "bold 12px Arial",
        fill: new ol.style.Fill({
          color: "#ffffff", // Texte en blanc
        }),
        stroke: new ol.style.Stroke({
          color: "#000000", // Halo noir autour du texte
          width: 3,
        }),
        offsetX: 35, // Décalage vertical pour placer le texte au-dessus de l'icône
      }),
    });
  },
});

// Ajouter la couche des partenaires à la carte
map.addLayer(partnerLayer);

// Interaction de sélection pour la couche des partenaires
var selectPartner = new ol.interaction.Select({
  layers: [partnerLayer], // Limiter la sélection à la couche des partenaires
  style: function (feature) {
    return new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: "./resources/images/people-group-solid-y.svg", // Icône jaune lors de la sélection
        scale: 0.4, // Agrandir légèrement l'icône
      }),
      text: new ol.style.Text({
        text: feature.get("sigle"),
        font: "bold 12px Arial",
        fill: new ol.style.Fill({
          color: "#0000FF", // Texte en bleu lors de la sélection
        }),
        stroke: new ol.style.Stroke({
          color: "#ffffff", // Halo blanc autour du texte sélectionné
          width: 4,
        }),
        offsetX: 35, // Positionnement vertical du texte
      }),
    });
  },
});

// Ajouter l'interaction à la carte
map.addInteraction(selectPartner);

// Gestion des événements de sélection
selectPartner.on("select", function (e) {
  e.selected.forEach(function (feature) {
    // Appliquer le style sélectionné
    feature.setStyle(
      new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          src: "./resources/images/people-group-solid-y.svg", // Icône jaune pour la sélection
          scale: 0.4, // Taille plus grande
        }),
        text: new ol.style.Text({
          text: feature.get("sigle"),
          font: "bold 12px Arial",
          fill: new ol.style.Fill({
            color: "#0000FF", // Texte en bleu
          }),
          stroke: new ol.style.Stroke({
            color: "#ffffff", // Halo blanc
            width: 4,
          }),
          offsetX: 35, // Même positionnement vertical
        }),
      })
    );
  });

  e.deselected.forEach(function (feature) {
    // Réinitialiser le style si la sélection est annulée
    feature.setStyle(null); // Revenir au style par défaut
  });
});

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
    if (layer === regionLayer) {
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

function toggleLayer(eve) {
  var lyrname = eve.target.value;
  var checkedStatus = eve.target.checked;
  var lyrList = map.getLayers();
  var geojson;

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
var queryGeoJSON;

inputBox.onkeyup = function () {
  const newVal = this.value.trim();
  if (newVal !== txtVal) {
    txtVal = newVal;
    if (txtVal.length > 2) {
      clearResults();
      createLiveSearchTable();

      const layers = [
        { name: "public.regions_villes", attribute: "nom" },
        { name: "public.partenaire", attribute: "nom" },
        { name: "public.partenaire", attribute: "sigle" },
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

// Create the table structure for displaying search results
function createLiveSearchTable() {
  searchTable.setAttribute("class", "assetSearchTableClass");
  searchTable.setAttribute("id", "assetSearchTableID");

  const tableHeaderRow = document.createElement("tr");
  const tableHeader1 = document.createElement("th");
  tableHeader1.innerHTML = "Layer";
  const tableHeader2 = document.createElement("th");
  tableHeader2.innerHTML = "Object";

  tableHeaderRow.appendChild(tableHeader1);
  tableHeaderRow.appendChild(tableHeader2);
  searchTable.appendChild(tableHeaderRow);
}

// Populate table rows with the response data from each layer
function createRows(data, layerName) {
  data.forEach((item, index) => {
    const tableRow = document.createElement("tr");
    const td1 = document.createElement("td");
    if (index === 0) {
      td1.innerHTML = layerName;
    }

    const td2 = document.createElement("td");
    const attribute = Object.keys(item)[0];
    td2.innerHTML = item[attribute];
    td2.setAttribute(
      "onClick",
      `zoomToFeature(this, '${layerName}', '${attribute}')`
    );

    tableRow.appendChild(td1);
    tableRow.appendChild(td2);
    searchTable.appendChild(tableRow);
  });

  liveDataDivEle.appendChild(searchTable);
  const ibControl = new ol.control.Control({
    element: liveDataDivEle,
  });
  map.addControl(ibControl);
}

// Clear previous search results
function clearResults() {
  liveDataDivEle.innerHTML = "";
  searchTable.innerHTML = "";
  if (queryGeoJSON) {
    map.removeLayer(queryGeoJSON);
  }
}

// Zoom to the feature by constructing the URL with query parameters
function zoomToFeature(featureElement, layerName, attributeName) {
  const value_txt = featureElement.innerHTML;

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
      if (response.geometry) {
        const geometry = JSON.parse(response.geometry);
        const coordinates = geometry.coordinates;

        if (coordinates.length) {
          const extent = ol.extent.boundingExtent(coordinates.flat(2));
          if (!ol.extent.isEmpty(extent)) {
            map.getView().fit(extent, { duration: 1000 });
          } else {
            console.warn("Empty extent for feature.");
          }
        } else {
          console.warn("No coordinates available for feature.");
        }
      } else {
        console.warn("No geometry data found for feature.");
      }
    },
    error: function (xhr, status, error) {
      console.error("Error fetching geometry:", error);
    },
  });
}

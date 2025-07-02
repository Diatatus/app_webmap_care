// Chargement de la page de loading
$(document).ready(function () {
  setTimeout(function () {
    $("#loading").fadeOut(); 
  }, 2000); // Délai de 3000 millisecondes (3 secondes)
});

// Toggle de la barre de recherche
document.getElementById('search-toggle').addEventListener('click', function() {
  const searchContainer = document.querySelector('.search-container');
  searchContainer.classList.toggle('collapsed');
  
  if (!searchContainer.classList.contains('collapsed')) {
    document.getElementById('inpt_search').focus();
  }
});



// Définition du projection et  de la vue sur la carte

const customproj = ol.proj.get("EPSG:4326");

var mapView = new ol.View({
  center: ol.proj.fromLonLat([12.2, 7.5]),
  zoom: 6,
  minZoom: 6, // Zoom  arrière minimal
  rotation: 0, // Désactivation de la rotation
  constrainRotation: true,
});

// Liste d'interaction sans rotation
var interactions = [
  new ol.interaction.DragPan(),
  new ol.interaction.PinchZoom(),
  new ol.interaction.MouseWheelZoom(),
  new ol.interaction.DragZoom(),
];

// Initialisation de la carte avec les interactions définies
var map = new ol.Map({
  target: "map",
  view: mapView,
  interactions: new ol.Collection(interactions),
  controls: [], // Controles par defaut
});

// Vue initiale
var initialCenter = [12.2, 7.5];
var initialZoom = 6;

// Zoom avant, arriere, retour sur la vue initiale
document.getElementById("zoom-in").addEventListener("click", function () {
  var view = map.getView();
  var zoom = view.getZoom();
  view.animate({
    zoom: zoom + 1,
    duration: 250,
  });
});
document.getElementById("zoom-out").addEventListener("click", function () {
  var view = map.getView();
  var zoom = view.getZoom();
  view.animate({
    zoom: zoom - 1,
    duration: 250,
  });
});
document.getElementById("zoom-initial").addEventListener("click", function () {
  var view = map.getView();
  view.animate({
    center: ol.proj.fromLonLat(initialCenter),
    zoom: initialZoom,
    duration: 250,
  });
});




var osm = new ol.layer.Tile({
  title: "OSM",
  baseLayer: true,
  isBaseLayer: true,
  source: new ol.source.OSM(),
  visible: true,
  name: "OSM",
  opacity: 0.6,
});

map.addLayer(osm);
osm.setVisible(true);


// Definition de couche des limites national du cameroun
var CamerounLayer = new ol.layer.Vector({
  name: "Cameroun",
  zIndex: 10,
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



// Définition de la couche des limites des Régions et Villes (Yaounde, Douala uniquement) du cameroun
var regionLayer = new ol.layer.Vector({
  name: "Régions",
  zIndex: 20,
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
      stroke: new ol.style.Stroke({
        width: 1,
        color: [255, 128, 0],
      }),
      fill: new ol.style.Fill({
        color: [255, 128, 0, 0],
      }),
    });
  },
});


var regionLayerVisible = false; // Variable pour savoir si la couche est actuellement visible ou non

// Définition la couche des pays du monde (excepte le Cameroun) avec un style assombri
var worldMapLayer = new ol.layer.Vector({
  name: "WorldMap",
  zIndex: 0,
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
        color: [50, 50, 50, 0.2],
      }),
    });
  },
});

map.addLayer(worldMapLayer);

// Add the Select interaction
var select = new ol.interaction.Select({
  hitTolerance: 5,
  multi: false, // Allow only one feature to be selected
  condition: ol.events.condition.singleClick,
  filter: function (feature, layer) {
    return layer === regionLayer; // Only enable selection for the regionLayer
  },
});

// Add the interaction to the map
map.addInteraction(select);

// Event listener for when a feature is selected
select.on("select", function (evt) {
  const selectedFeature = evt.selected[0]; // Get the first selected feature
  if (selectedFeature) {
    // Get the geometry of the selected feature
    const geometry = selectedFeature.getGeometry();
    const extent = geometry.getExtent();

    // Zoom the map to the extent of the selected feature
    map.getView().fit(extent, {
      size: map.getSize(),
      maxZoom: 10, // Optional: Limit maximum zoom level
      duration: 1000, // Optional: Add a smooth transition
    });
  }
});

// Définition de la couche des bureaux de base
var basesLayer = new ol.layer.Vector({
  zIndex: 50,
  source: new ol.source.Vector({
    url: "/api/bureaux_base",
    format: new ol.format.GeoJSON(),
  }),
  style: function (feature) {
    return createBasesStyle(feature);
  },
});

map.addLayer(basesLayer);

function createBasesStyle(feature) {
  return new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: "./resources/images/bases.svg",
      scale: 0.08,
    }),
    text: new ol.style.Text({
      text: feature.get("nom_base"),
      font: "bold 12px Arial",
      fill: new ol.style.Fill({ color: "#FF0000" }),
      stroke: new ol.style.Stroke({ color: "#ffffff", width: 4 }),
      offsetY: 10,
    }),
  });
}

function createHighlightBasesStyle(feature) {
  return new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: "./resources/images/bases_y.svg",
      scale: 0.1,
    }),
    text: new ol.style.Text({
      text: feature.get("nom_base"),
      font: "bold 12px Arial",
      fill: new ol.style.Fill({ color: "#0000ff" }),
      stroke: new ol.style.Stroke({ color: "#ffffff", width: 4 }),
      offsetY: 10,
    }),
  });
}

// Variable to store the currently clicked feature
let currentlyClickedFeature = null;

// Add a click event listener to the map
map.on("click", function (evt) {
  // Clear the style of the previously clicked feature
  if (currentlyClickedFeature) {
    currentlyClickedFeature.setStyle(createBasesStyle(currentlyClickedFeature));
    currentlyClickedFeature = null;
  }

  // Highlight the clicked feature
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if (layer === basesLayer) {
      feature.setStyle(createHighlightBasesStyle(feature));
      currentlyClickedFeature = feature; // Save the current clicked feature
      return true; // Stop further processing
    }
  });
});

// Add a pointermove event to temporarily highlight features
map.on("pointermove", function (evt) {
  let hoveredFeature = null;

  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if (layer === basesLayer) {
      if (currentlyClickedFeature !== feature) {
        // Temporarily highlight features on hover
        feature.setStyle(createHighlightBasesStyle(feature));
        hoveredFeature = feature;
      }
      return true;
    }
  });

  // Restore style for features not hovered or clicked
  basesLayer.getSource().getFeatures().forEach((feature) => {
    if (feature !== currentlyClickedFeature && feature !== hoveredFeature) {
      feature.setStyle(createBasesStyle(feature));
    }
  });
});



// Définition de la couche des partenaires
var partnerLayer = new ol.layer.Vector({
  zIndex: 40,
  source: new ol.source.Vector({
    url: "/api/care_partner",
    format: new ol.format.GeoJSON(),
  }),
  style: function (feature) {
    return createDefaultStyle(feature);
  },
});



function createDefaultStyle(feature) {
  const statut = feature.get("statut_prest");

  
  let iconSrc = "./resources/images/partner_location.svg"; 

  if (statut === "SSR/Clinique juridiques/DIC") {
    iconSrc = "./resources/images/partner_location_clinique.svg"; 
  }

  return new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: iconSrc,
      scale: 0.15,
    }),
    text: new ol.style.Text({
      text: feature.get("sigle"),
      font: "bold 12px Arial",
      fill: new ol.style.Fill({ color: "#ffffff" }),
      stroke: new ol.style.Stroke({ color: "#000000", width: 3 }),
      offsetY: -15,
    }),
  });
}

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
      offsetY: -15,
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

// Garde le popup affiché lorsqu'il est survolé
const popup = document.getElementById("partner-popup");

popup.addEventListener("mouseenter", () => {
  popup.style.display = "block"; // Garde le popup visible
});

popup.addEventListener("mouseleave", () => {
  popup.style.display = "none"; // Cache le popup
});

// Interaction de sélection pour la couche des partenaires
var selectPartner = new ol.interaction.Select({
  layers: [partnerLayer],
  style: function (feature) {
    return createHighlightStyle(feature);
  },
});
map.addInteraction(selectPartner);

// Modifiez la fonction pointermove pour éviter de masquer le popup lorsqu'il est survolé
map.on("pointermove", function (evt) {
  if (popup.matches(":hover")) return; // Don't trigger popup behavior if it's being hovered over

  const minZoomLevel = 12;
  const currentZoom = map.getView().getZoom();

  if (currentZoom >= minZoomLevel) {
    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
      if (layer === partnerLayer) {
        // Update content
        document.getElementById("partner-name").textContent =
          feature.get("nom");
        document.getElementById("partner-type").textContent =
          feature.get("sigle");

        // Manage services offered
        const activityList = document.getElementById("partner-activity-list");
        activityList.innerHTML = ""; // Clear the existing list
        const activities = (
          feature.get("act_srvc_offert") || "Aucune activité spécifiée."
        )
          .split(";")
          .map((item) => item.trim());
        activities.forEach((activity) => {
          const listItem = document.createElement("li");
          listItem.textContent = activity;
          activityList.appendChild(listItem);
        });

        document.getElementById("partner-info").textContent =
          feature.get("info");

        // Handle logo display with default fallback
        const logoElement = document.getElementById("partner-logo");
        const iconElement = document.getElementById("partner-logo-icon");
        const logoUrl = feature.get("img_logo");

        if (logoUrl) {
          const img = new Image();
          img.onload = function () {
            // Ensure proper scaling for the image
            logoElement.src = logoUrl;
            logoElement.style.display = "block";
            logoElement.style.objectFit = "cover"; // Ensures consistent fit
            logoElement.style.width = "100%"; // Resizes image proportionally
            iconElement.style.display = "none";
          };
          img.onerror = function () {
            logoElement.style.display = "none";
            iconElement.style.display = "block";
          };
          img.src = logoUrl;
        } else {
          logoElement.style.display = "none";
          iconElement.style.display = "block";
        }

        // Calculate and adjust popup position
        let popupLeft = evt.pixel[0] + 15;
        let popupTop = evt.pixel[1] - 150;
        const popupRect = popup.getBoundingClientRect();
        const mapRect = map.getTargetElement().getBoundingClientRect();

        if (popupLeft + popupRect.width > mapRect.width)
          popupLeft = mapRect.width - popupRect.width - 10;
        if (popupLeft < 0) popupLeft = 10;
        if (popupTop + popupRect.height > mapRect.height)
          popupTop = mapRect.height - popupRect.height - 10;
        if (popupTop < 0) popupTop = 10;

        popup.style.left = `${popupLeft}px`;
        popup.style.top = `${popupTop}px`;
        popup.style.display = "block";

        return true;
      }
    });
  } else {
    popup.style.display = "none";
  }
});

// Affichage du popup partenaire
map.on("click", function () {
  document.getElementById("partner-popup").style.display = "none";
});


// Définition du cluster sur la visualisation des partenaire
var clusterSource = new ol.source.Cluster({
  distance: 25, // La distance entre les points pour être regroupés en clusters
  source: new ol.source.Vector({
    url: "/api/care_partner", // Endpoint couche partenaires
    format: new ol.format.GeoJSON(),
  }),
});

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

// Définition de la couche des clusters avec le style
var clusterLayer = new ol.layer.Vector({
  source: clusterSource,
  zIndex:35,
  style: clusterStyle, // Appliquer le style aux clusters
});

// Gestion du zoom lors du clic sur un cluster
map.on("click", function (evt) {
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if (layer === clusterLayer) {
      var clusteredFeatures = feature.get("features");

      if (clusteredFeatures.length > 1) {
        // Si plusieurs entités dans le cluster : zoomer sur l'étendue de toutes les entités
        var extent = ol.extent.createEmpty();
        clusteredFeatures.forEach(function (f) {
          ol.extent.extend(extent, f.getGeometry().getExtent());
        });

        // Ajuste la vue pour englober l'étendue du cluster avec une animation
        map.getView().fit(extent, { duration: 1000 });
      } else if (clusteredFeatures.length === 1) {
        // Si une seule entité : zoomer et centrer sur cette entité
        var coordinates = clusteredFeatures[0].getGeometry().getCoordinates();

        map.getView().animate({
          center: coordinates,
          zoom: Math.max(map.getView().getZoom() + 2, 15), // Zoom maximum de 15
          duration: 1000,
        });
      }
    }
  });
});

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



let clusterLayerVisible = false; // Visibility status for clusterLayer
let partnerLayerVisible = false; // Visibility status for partnerLayer

document
  .getElementById("togglePartenairesCheckbox")
  .addEventListener("change", function (event) {
    if (event.target.checked) {
      map.addLayer(partnerLayer);
      map.addLayer(clusterLayer);
      partnerLayerVisible = true;
    } else {
      map.removeLayer(partnerLayer);
      map.removeLayer(clusterLayer);
      partnerLayerVisible = false;
    }
  });


// Fonction de representation des graphes

var demographyChart, familyChart; // Declaration des variables

function createCharts(feature) {
  if (demographyChart) demographyChart.destroy();

  if (familyChart) familyChart.destroy();

  // Demography data
  var demographyData = {
    labels: ["Hommes", "Femmes"],
    datasets: [
      {
        label: "Population",
        data: [feature.get("popsex_masc"), feature.get("popsex_fem")],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  document.getElementById("total-population-info").textContent = // Total population
    feature.get("total_pop").toLocaleString() + " habitants";
  document.getElementById("population-density-info").textContent = // Densite population
    feature.get("denspop_reg") + " hab/km²";

  document.getElementById("access-sanity").textContent =
    feature.get("acces_sanit_amel"); // Acces aux installations sanitaire
  document.getElementById("access-water").textContent =
    feature.get("acces_eau_amel"); // Acces a une source d'eau ameliore
  document.getElementById("handwashing").textContent =
    feature.get("inst_lavmain_lim"); // Installation de lave main

  document.getElementById("hiv-males").textContent =
    feature.get("prev_vih_hom"); // Prevalence VIH (Hommes)
  document.getElementById("hiv-females").textContent =
    feature.get("prev_vih_fem"); // Prevalence VIH (Femmes)

  document.getElementById("poverty-rate").textContent =
    feature.get("taux_pvrt"); // Taux de pauvrete
  document.getElementById("unemployment-rate").textContent =
    feature.get("taux_chom"); // Taux de chomage
  document.getElementById("financial-inclusion").textContent =
    feature.get("incl_fin_emf"); // Taux d'inclusion financiere

  document.getElementById("unmet-need").textContent = feature.get(
    "besoins_nonsatisf_pf"
  ); // Planning familliale
  document.getElementById("contraceptive-use").textContent = feature.get(
    "fem_utilmethcontracep_mod"
  ); // Femmes utilisant des methodes de contraceptions

  var familyData = {
    labels: ["%Hommes", "%Femmes"],
    datasets: [
      {
        data: [
          feature.get("justif_violconj_hom"),
          feature.get("justif_violconj_fem"),
        ], // Hommes et femmes justifiant la violence conjugale
        backgroundColor: ["#36A2EB", "#FF6384"], //
      },
    ],
  };

  // Graphique demographie population Hommes / Femmes
  demographyChart = new Chart(document.getElementById("demography-chart"), {
    type: "pie", // Type camambert
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

  // Graphique taux justification des violences conjugales Hommes / Femmes
  familyChart = new Chart(
    document.getElementById("domestic-violence-pie-chart"),
    {
      type: "pie",
      data: familyData,
    }
  );
}

// Fonction d'affichege du popup d'informations sur les indicateurs socio-economiques
function showPopup(feature) {
  const popupContainer = document.getElementById("popup-container");

  const zoneName = feature.get("nom"); // Nom region ou ville

  document.getElementById(
    "zone-name"
  ).innerHTML = `<strong>${zoneName}</strong>`;

  popupContainer.style.display = "block"; // Popup vible a l'acceuil

  setTimeout(() => {
    popupContainer.style.opacity = 1;
  }, 10);

  // Fonction de creation des graphiques
  createCharts(feature);
}

function hidePopup() {
  const popupContainer = document.getElementById("popup-container");
  popupContainer.style.opacity = 0; // Appliquer une transition pour masquer
  setTimeout(() => {
    popupContainer.style.display = "none"; // Cacher complètement après la transition
  }, 300);
}

// Fonction de fermeture de la fenetre popup
function closePopup() {
  const popupContainer = document.getElementById("popup-container");
  popupContainer.style.opacity = 0;

  setTimeout(() => {
    popupContainer.style.display = "none";
  }, 500);
}

// Re-bind the close button event listener
document
  .getElementById("popup-close-btn")
  .addEventListener("click", closePopup);

// Interaction : afficher un popup uniquement pour la couche regions et territoire national
map.on("click", function (evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if (layer === regionLayer) {
      // Vérifie si la couche est la couche regions et Cameroun
      return feature;
    }
  });

  if (feature) {
    // Afficher le popup avec les données de la feature sélectionnée
    showPopup(feature); // Fonction pour afficher le popup
  } else {
    // Ne rien afficher si aucune entité de la couche regions ou Cameroun n'est cliquée
    return;
  }
});


// Variable pour éviter d'afficher plusieurs fois le popup inutilement
let popupShownForLayer = false;

// Fonction pour afficher le popup dès que la couche est rendue et la source prête
function showPopupWhenLayerReady(layer) {
  popupShownForLayer = false;

  // Fonction interne pour tenter d'afficher le popup
  function tryShowPopup() {
    const source = layer.getSource();
    if (source.getState() === "ready" && !popupShownForLayer) {
      const features = source.getFeatures();
      if (features.length > 0) {
        showPopup(features[0]);
        popupShownForLayer = true;
        // Une fois affiché, on peut retirer l'écouteur 'postrender'
        layer.un("postrender", tryShowPopup);
      }
    }
  }

  // Attendre le rendu effectif de la couche
  layer.on("postrender", tryShowPopup);
}

// Gestion du checkbox toggleRegionsCheckbox
document.getElementById("toggleRegionsCheckbox").addEventListener("change", function (event) {
  if (event.target.checked) {
    if (!map.getLayers().getArray().includes(regionLayer)) {
      map.addLayer(regionLayer);
    }
    regionLayerVisible = true;

    if (!map.getLayers().getArray().includes(CamerounLayer)) {
      map.addLayer(CamerounLayer);
    }
    camerounLayerVisible = true;

    // Appeler la fonction qui attend le rendu et affiche le popup
    showPopupWhenLayerReady(CamerounLayer);
  } else {
    if (map.getLayers().getArray().includes(regionLayer)) {
      map.removeLayer(regionLayer);
    }
    if (map.getLayers().getArray().includes(CamerounLayer)) {
      map.removeLayer(CamerounLayer);
    }
    regionLayerVisible = false;
    camerounLayerVisible = false;
    hidePopup();
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

const toggleButton = document.getElementById("toggleBasesCheckbox");
const storyDiv = document.getElementById("story");

// Variable to track the visibility of the BasesLayer
let basesLayerVisible = true;

// Function to toggle the story div and the BasesLayer visibility
function toggleStoryAndBasesLayer() {
  // Toggle the story div visibility
  if (storyDiv.style.display === "none" || storyDiv.style.display === "") {
    storyDiv.style.display = "block"; // Show the div
  } else {
    storyDiv.style.display = "none"; // Hide the div
  }

  // Toggle the BasesLayer visibility
  if (basesLayerVisible) {
    map.removeLayer(basesLayer); // Hide the layer
    basesLayerVisible = false;
  } else {
    map.addLayer(basesLayer); // Show the layer
    basesLayerVisible = true;
  }
}

// Function to initialize the story div visibility based on screen size
function initializeStoryDiv() {
  const isSmartphone = window.innerWidth <= 600;

  // Always hidden by default on smartphones at load
  storyDiv.style.display = isSmartphone ? "none" : "block";

  // Ensure the BasesLayer visibility matches the default state
  if (isSmartphone) {
    map.removeLayer(basesLayer);
    basesLayerVisible = false;
  } else {
    map.addLayer(basesLayer);
    basesLayerVisible = true;
  }
}

// Attach the toggle function to the button click event
toggleButton.addEventListener("click", toggleStoryAndBasesLayer);

// Initialize the checkboxes' default state
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("toggleBasesCheckbox").checked = basesLayerVisible;
  document.getElementById("togglePartenairesCheckbox").checked =
    partnerLayerVisible;
  document.getElementById("toggleRegionsCheckbox").checked =
    regionLayerVisible;
    document.getElementById("toggleRegionsCheckbox").checked =
    camerounLayerVisible;

});



// La story-map
// Add placemark


var story = new ol.control.Storymap({
  html: document.getElementById("story"),
  //target: document.getElementById("story"),
  minibar: false,
  duration: 200,
  //className: 'scrollBox'
});

// Affichage plein ecran de l'image lors du click
var fullscreen = new ol.control.Overlay({
  hideOnClick: true,
  className: "zoom",
});
map.addControl(fullscreen);
story.on("clickimage", function (e) {
  console.log(e);
  fullscreen.showImage(e.img.src, e);
});




function setClassName(c) {
  console.log(c);
  story.element.classList.remove("scrollLine");
  story.element.classList.remove("scrollBox");
  if (c) story.element.classList.add(c);
  window.dispatchEvent(new Event("resize"));
}

map.addControl(story);


document.addEventListener("DOMContentLoaded", function () {
  const searchBar = document.getElementById("care-search-bar");
  const searchIcon = document.getElementById("search-icon");
  const searchInput = document.getElementById("inpt_search");

  // Toggle the collapsed state when the search icon is clicked
  searchIcon.addEventListener("click", function () {
    if (searchBar.classList.contains("collapsed")) {
      searchBar.classList.remove("collapsed"); // Expand the search bar
      setTimeout(() => searchInput.focus(), 400); // Focus input after animation
    } else {
      searchBar.classList.add("collapsed"); // Collapse the search bar
    }
  });

  // Optional: Close the search bar if the user clicks outside
  document.addEventListener("click", function (event) {
    if (
      !searchBar.contains(event.target) &&
      !searchIcon.contains(event.target) &&
      !searchInput.contains(event.target)
    ) {
      searchBar.classList.add("collapsed");
    }
  });
});



// Fonction principal de la barre de recherche
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

      // Recherche selon les mots cles des couches
      const layers = [
        { name: "partenaires", attribute: "nom" },
        { name: "partenaires", attribute: "sigle" },
        { name: "bureaux_base", attribute: "nom_base" },
        {name: "regions", attribute: "nom" },

      ];

      layers.forEach((layer) => {
        $.ajax({
          url: "http://localhost:3000/api/liveSearch", // Endpoint requete sql du serveur Node.js dans la base de donné
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

// Fonction de creation du tableau de la liste des resulats de la recherche
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

  liveDataDivEle.appendChild(searchTable);
}

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
      clearResults(); // Masquer la table apres la selection d'un resultat
    });

    tableRow.appendChild(td1);
    tableRow.appendChild(td2);
    searchTable.appendChild(tableRow);
  });
}

var queryGeoJSON = null;

// Nettoyage des resultats de la recherche precendente
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
    url: "http://localhost:3000/api/zoomFeature", // Endpoint requete sql du serveur Node.js dans la base de donné
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

const baseProjectsCache = {}; // Cache pour les données chargées
let currentBaseProjects = [];
let currentBaseProjectIndex = 0;


function showBaseProjectsPopup(baseFeature) {
  const baseId = baseFeature.get("id_base");
  const baseName = baseFeature.get("nom_base");

  if (baseProjectsCache[baseId]) {
    currentBaseProjects = baseProjectsCache[baseId].features.map((feature) => feature.properties);
    displayPopup(baseName);
  } else {
    fetch(`/api/bureaux_projets?id_base=${baseId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Erreur lors du chargement des données");
        return response.json();
      })
      .then((data) => {
        baseProjectsCache[baseId] = data;
        currentBaseProjects = data.features.map((feature) => feature.properties);
        displayPopup(baseName);
      })
      .catch((error) => console.error("Erreur de chargement :", error));
  }
}

// Nouveaux états
let filteredProjects = [];
let viewMode = 'list'; // 'list' ou 'detail'

// Récupération des éléments
const statusFilter = document.getElementById('status-filter');
const projectListEl = document.getElementById('project-list');
const listView = document.getElementById('project-list-view');
const detailView = document.getElementById('project-detail-view');
const backBtn = document.getElementById('back-to-list');

// Elements détail
const detailName = document.getElementById('detail-project-name');

const detailSigle = document.getElementById('detail-project-sigle');
const detailStart = document.getElementById('detail-project-start-date');
const detailEnd = document.getElementById('detail-project-end-date');
const detailBudget = document.getElementById('detail-project-budget');
const detailBailleur = document.getElementById('detail-project-bailleur');
const detailObjective = document.getElementById('detail-project-objective');
const detailTarget = document.getElementById('detail-project-target');
const detailSites = document.getElementById('detail-project-sites');
const detailStatus = document.getElementById('detail-project-status');
const detailAchievements = document.getElementById('detail-project-achievements');

// Gestion du filtre
statusFilter.addEventListener('change', () => {
  applyFilter();
  renderProjectList();
});

function applyFilter() {
  const statut = statusFilter.value;
  if (statut === 'all') {
    filteredProjects = [...currentBaseProjects];
  } else {
    filteredProjects = currentBaseProjects.filter(p => p.statut === statut);
  }
}

// Affiche la liste initiale
// Affiche la liste initiale
function renderProjectList() {
    projectListEl.innerHTML = '';
    if (!filteredProjects.length) {
        projectListEl.innerHTML = '<li class="no-projects-found">Aucun projet trouvé pour ce filtre.</li>';
        return;
    }
    filteredProjects.forEach((p, idx) => {
        const li = document.createElement('li');
        // !! IMPORTANT : Ne plus utiliser l'icône ici, le badge gère le statut visuel
        // Si vous avez encore cette ligne, supprimez-la ou mettez-la en commentaire
        // const iconClass = p.statut === 'En cours' ? 'fas fa-circle in-progress' : 'fas fa-circle completed';

        const statusText = p.statut === 'En cours' ? 'En cours' : 'Clôturé'; // <-- IMPORTANT : Texte du badge
        const badgeClass = p.statut === 'En cours' ? 'badge-in-progress' : 'badge-completed';

        li.innerHTML = `
            <div class="project-info">
                <span class="project-title">${p.nom_projet}</span>
            </div>
            <span class="status-badge ${badgeClass}">${statusText}</span>  `;
        
        li.addEventListener('click', () => showProjectDetail(idx));
        projectListEl.appendChild(li);
    });
}

// Variables globales
let sitesHighlightLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  style: function(feature) {
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: [255, 255, 0, 0.4] // Jaune semi-transparent
      }),
      stroke: new ol.style.Stroke({
        color: [255, 165, 0, 1], // Orange
        width: 2
      }),
      text: new ol.style.Text({
        text: feature.get('nom_commune'), // Récupère le nom de la commune
        font: '14px Calibri,sans-serif',
        fill: new ol.style.Fill({
          color: '#000000' // Noir
        }),
        stroke: new ol.style.Stroke({
          color: '#FFFFFF', // Contour blanc
          width: 3
        }),
        offsetY: -15 // Position au-dessus du polygone
      })
    });
  }
});
map.addLayer(sitesHighlightLayer);

// Fonction principale
async function setupZoomCheckbox(projectId) {
  const zoomCheckbox = document.getElementById('zoom-to-sites');
  
  zoomCheckbox.addEventListener('change', async (e) => {
    if (e.target.checked) {
      try {
        // Afficher un indicateur de chargement
        zoomCheckbox.disabled = true;
        document.getElementById('zoom-loading').style.display = 'inline-block';
        
        const response = await fetch('/api/projects/sites_extent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId })
        });

        if (!response.ok) throw new Error(await response.text());
        
        const data = await response.json();
        
        // 1. Zoom sur l'emprise
        const extent = data.bbox.match(/\d+\.?\d*/g).map(Number);
        map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
          callback: () => {
            // 2. Mise en surbrillance après le zoom
            highlightSites(data.communes);
          }
        });
        
      } catch (error) {
        console.error("Erreur:", error);
        zoomCheckbox.checked = false;
        showErrorToast("Erreur lors du chargement des sites");
      } finally {
        zoomCheckbox.disabled = false;
        document.getElementById('zoom-loading').style.display = 'none';
      }
    } else {
      // Réinitialisation
      resetSitesHighlight();
      map.getView().fit(camerounExtent, { duration: 500 });
    }
  });
}

// Fonctions utilitaires
async function highlightSites(communes) {
  try {
    // Récupérer les géométries des communes
    const response = await fetch('/api/communes/geometries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ communes })
    });

    if (!response.ok) throw new Error(await response.text());
    
    const data = await response.json();
    
    // Vérification du format des données
    if (!data || !data.features) {
      throw new Error("Format de données invalide");
    }

    // Conversion en features OpenLayers
    const format = new ol.format.GeoJSON();
    const features = format.readFeatures(data, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });

        // Assignation explicite du nom
    features.forEach(feature => {
      feature.set('nom_commune', feature.getProperties().name || '');
    });

    // Affichage des features
    sitesHighlightLayer.getSource().clear();
    sitesHighlightLayer.getSource().addFeatures(features);
    
  } catch (error) {
    console.error("Erreur de surbrillance:", error);
    alert("Erreur lors de la mise en surbrillance des communes");
  }
}

function resetSitesHighlight() {
  sitesHighlightLayer.getSource().clear();
}

function showErrorToast(message) {
  // Implémentez votre système de notification
  console.error(message);
  alert(message);
}
// Bascule vers la vue détail
function showProjectDetail(index) {
  viewMode = 'detail';
  listView.classList.add('hidden');
  detailView.classList.remove('hidden');

  

  const p = filteredProjects[index];
  initZoomCheckbox(p.id_projet);
  detailName.textContent = p.nom_projet;
  detailSigle.textContent = p.sigle_projet;
  detailStart.textContent = p.date_debut;
  detailEnd.textContent = p.date_fin;
  detailBudget.textContent = p.budget_projet;
  detailBailleur.textContent = p.bailleur;
  detailStatus.textContent = p.statut;

  // fonctions utilitaires pour remplir les UL
  fillList(detailObjective, p.objectif_global);
  fillList(detailTarget, p.cible);
  fillList(detailAchievements, p.realisations);
  fillPhotoGallery(p);

  function fillPhotoGallery(p) {
  const gallery = document.getElementById('project-photo-gallery');
  gallery.innerHTML = '';

  currentPhotos = [p.photo1, p.photo2, p.photo3, p.photo4].filter(url => url && url.trim() !== '');

  if (!currentPhotos.length) {
    gallery.innerHTML = '<em>Aucune photo disponible.</em>';
    return;
  }

  currentPhotos.forEach((url, idx) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Photo ${idx + 1}`;
    img.className = 'project-photo';
    img.addEventListener('click', () => openImageSlider(idx));
    gallery.appendChild(img);
  });
}
  

}

// Nouvelle fonction d'initialisation
async function initZoomCheckbox(projectId) {
  const zoomCheckbox = document.getElementById('zoom-to-sites');
  
  zoomCheckbox.addEventListener('change', async (e) => {
    if (e.target.checked) {
      try {
        // Activation du loader
        document.getElementById('zoom-loading').style.display = 'inline-block';
        zoomCheckbox.disabled = true;
        
        // Appel API avec le bon endpoint
        const response = await fetch(`/api/projects/${projectId}/sites`);
        
        if (!response.ok) throw new Error(await response.text());
        
        const data = await response.json();
        
        // Conversion de la bbox PostGIS en format OpenLayers
        const [minX, minY, maxX, maxY] = data.bbox.match(/\d+\.?\d*/g).map(Number);
        const extent = ol.proj.transformExtent(
          [minX, minY, maxX, maxY],
          'EPSG:4326', 
          'EPSG:3857'
        );
        
        // Zoom sur l'emprise
        map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000
        });
        
        // Surbrillance des communes
        highlightSites(data.communes);
        
      } catch (error) {
        console.error("Erreur:", error);
        zoomCheckbox.checked = false;
        alert("Erreur lors du chargement des sites");
      } finally {
        document.getElementById('zoom-loading').style.display = 'none';
        zoomCheckbox.disabled = false;
      }
    } else {
      resetSitesHighlight();
      map.getView().fit(camerounExtent, { duration: 500 });
    }
  });
}

// Remplit une <ul> à partir d’un texte séparé
function fillList(ulEl, text) {
  ulEl.innerHTML = '';
  if (!text) return;
  text.split(/[;,]\s*/).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ulEl.appendChild(li);
  });
}

// Bouton Retour
backBtn.addEventListener('click', () => {
  viewMode = 'list';
  detailView.classList.add('hidden');
  listView.classList.remove('hidden');
});

// On intègre tout ça dans displayPopup()
// On intègre tout ça dans displayPopup()
function displayPopup(baseName) {
    if (!currentBaseProjects.length) {
        // Optionnel: si pas de projets, vous pourriez vouloir afficher un message spécifique
        document.getElementById("base-name").textContent = baseName;
        const basePopup = document.getElementById("base-projects-popup");
        basePopup.style.display = "block";
        setTimeout(() => (basePopup.style.opacity = 1), 10);
        projectListEl.innerHTML = '<li class="no-projects-found">Aucun projet trouvé pour cette base.</li>'; // Message si la base n'a pas de projets
        listView.classList.remove('hidden'); // Assurez-vous que la vue liste est visible
        detailView.classList.add('hidden');   // Cachez la vue détail
        // Réinitialiser la checkbox de zoom également si elle est visible
        const zoomCheckbox = document.getElementById('zoom-to-sites');
        if (zoomCheckbox) {
            zoomCheckbox.checked = false;
            resetSitesHighlight();
        }
        return;
    }

    document.getElementById("base-name").textContent = baseName;
    currentBaseProjectIndex = 0;

    const basePopup = document.getElementById("base-projects-popup");
    basePopup.style.display = "block";
    setTimeout(() => (basePopup.style.opacity = 1), 10);

    // --- AJOUT IMPORTANT ICI ---
    // S'assurer que la vue liste est affichée et la vue détail masquée
    listView.classList.remove('hidden');
    detailView.classList.add('hidden');

    // Réinitialiser la checkbox de zoom également
    const zoomCheckbox = document.getElementById('zoom-to-sites');
    if (zoomCheckbox) { // Vérifie que la checkbox existe
        zoomCheckbox.checked = false; // Décocher la checkbox
        resetSitesHighlight(); // Supprimer la surbrillance des sites sur la carte
    }
    // --- FIN DE L'AJOUT IMPORTANT ---

    applyFilter();      // initialise filteredProjects
    renderProjectList(); // affiche la liste
}



// Function to format lists with bullet points
function formatList(text) {
  if (!text) return '';
  // Split by comma or semicolon and return as bullet points
  const items = text.split(/[;,]\s*/).map(item => `<li>${item}</li>`).join('');
  return `<ul>${items}</ul>`;
}




// Close popup
// Close popup
// Close popup
document
  .getElementById("base-popup-close-btn")
  .addEventListener("click", () => {
    const basePopup = document.getElementById("base-projects-popup");
    basePopup.style.opacity = 0;
    setTimeout(() => {
      basePopup.style.display = "none";
      // Assurez-vous que la vue liste est visible et que la vue détail est cachée
      listView.classList.remove('hidden');
      detailView.classList.add('hidden');
      
      // --- AJOUTEZ CES LIGNES POUR RÉINITIALISER LA CHECKBOX ET LA COUCHE DE MISE EN SURBRILLANCE ---
      const zoomCheckbox = document.getElementById('zoom-to-sites');
      if (zoomCheckbox) { // Vérifie que la checkbox existe
        zoomCheckbox.checked = false; // Décocher la checkbox
        resetSitesHighlight(); // Supprimer la surbrillance des sites sur la carte
      }
      // --- FIN DE L'AJOUT ---
    }, 300);
  });

// Modal d'image
const imageModal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-img");
const closeModalBtn = document.querySelector(".close-modal");


// Quand on clique sur une image de projet
document.getElementById("project-photo-gallery").addEventListener("click", (e) => {
  if (e.target.tagName === "IMG") {
    modalImg.src = e.target.src;
    imageModal.classList.remove("hidden");
  }
});

// Quand on clique sur le bouton de fermeture
closeModalBtn.addEventListener("click", () => {
  imageModal.classList.add("hidden");
});


let currentSlideIndex = 0;
let currentPhotos = [];
let autoSlideInterval;

function fillPhotoGallery(p) {
  const gallery = document.getElementById('project-photo-gallery');
  gallery.innerHTML = '';

  currentPhotos = [p.photo1, p.photo2, p.photo3, p.photo4].filter(url => url && url.trim() !== '');

  if (!currentPhotos.length) {
    gallery.innerHTML = '<em>Aucune photo disponible.</em>';
    return;
  }

  currentPhotos.forEach((url, idx) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Photo ${idx + 1}`;
    img.className = 'project-photo';
    img.addEventListener('click', () => openImageSlider(idx));
    gallery.appendChild(img);
  });
}

function openImageSlider(index) {
  currentSlideIndex = index;
  updateSliderImage();
  document.getElementById("image-modal").classList.remove("hidden");
  startAutoSlide();
}

function closeImageSlider() {
  document.getElementById("image-modal").classList.add("hidden");
  stopAutoSlide();
}

function updateSliderImage() {
  const modalImg = document.getElementById("modal-img");
  if (currentPhotos.length > 0) {
    modalImg.src = currentPhotos[currentSlideIndex];
  }
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % currentPhotos.length;
  updateSliderImage();
}

function prevSlide() {
  currentSlideIndex = (currentSlideIndex - 1 + currentPhotos.length) % currentPhotos.length;
  updateSliderImage();
}

function startAutoSlide() {
  stopAutoSlide(); // reset timer
  autoSlideInterval = setInterval(nextSlide, 4000); // toutes les 4 secondes
}

function stopAutoSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
}

// Listeners
document.querySelector(".close-modal").addEventListener("click", closeImageSlider);
document.getElementById("next-slide").addEventListener("click", () => {
  nextSlide();
  startAutoSlide(); // reset timer on manual nav
});
document.getElementById("prev-slide").addEventListener("click", () => {
  prevSlide();
  startAutoSlide();
});


// Variable to store the currently clicked feature
let currentlyClickedBase = null;

// Optimize the click event
map.on("click", function (evt) {
  let clickedBaseFeature = null;

  // Restrict the click event strictly to basesLayer
  map.forEachFeatureAtPixel(
    evt.pixel,
    function (feature, layer) {
      if (layer === basesLayer) {
        clickedBaseFeature = feature; // Capture the clicked feature
        return true; // Stop further iteration
      }
    },
    {
      layerFilter: function (layer) {
        return layer === basesLayer; // Apply filtering to basesLayer only
      },
    }
  );

  // If no feature is clicked, reset the currently clicked feature and hide the popup
  if (!clickedBaseFeature) {
    if (currentlyClickedBase) {
      currentlyClickedBase.setStyle(createBasesStyle(currentlyClickedBase));
    }
    currentlyClickedBase = null;
    document.getElementById("base-projects-popup").style.display = "none"; // Hide popup
    return;
  }

  // Handle clicked base feature
  if (clickedBaseFeature !== currentlyClickedBase) {
    // Reset previous feature style
    if (currentlyClickedBase) {
      currentlyClickedBase.setStyle(createBasesStyle(currentlyClickedBase));
    }

    // Highlight the clicked feature
    clickedBaseFeature.setStyle(createHighlightBasesStyle(clickedBaseFeature));
    currentlyClickedBase = clickedBaseFeature;

    // Show the popup for the clicked base
    showBaseProjectsPopup(clickedBaseFeature);
  }
});

// Map click event for basesLayer
map.on("click", function (evt) {
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if (layer === basesLayer) {
      // Show the base projects popup
      showBaseProjectsPopup(feature);

      // Get the name of the base from the feature properties
      const baseName = feature.get("nom_base");

      // Scroll to the corresponding chapter in the storyDiv
      scrollToChapter(baseName);

      return true; // Stop further processing
    }
  });
});

/**
 * Scroll to the corresponding chapter in the storyDiv
 * @param {string} baseName - The name of the base clicked
 */
function scrollToChapter(baseName) {
  const storyDiv = document.getElementById("story");
  const chapters = storyDiv.getElementsByClassName("chapter");

  // Loop through the chapters to find the matching one
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const chapterName = chapter.getAttribute("name");

    if (chapterName === baseName) {
      // Scroll to the matching chapter
      chapter.scrollIntoView({
        behavior: "smooth", // Smooth scrolling
        block: "start", // Scroll to the top of the chapter
      });

      // Optionally, highlight the active chapter
      highlightChapter(chapter);

      break;
    }
  }
}

/**
 * Highlight the active chapter
 * @param {HTMLElement} chapter - The active chapter element
 */
function highlightChapter(chapter) {
  const chapters = document.querySelectorAll(".chapter");

  // Remove the active class from all chapters
  chapters.forEach((chap) => chap.classList.remove("active-chapter"));

  // Add the active class to the clicked chapter
  chapter.classList.add("active-chapter");
}


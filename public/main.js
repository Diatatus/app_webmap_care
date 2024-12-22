// Chargement de la page de loading
$(document).ready(function () {
  setTimeout(function () {
    $("#loading").fadeOut(); // Masquer le div de chargement après 3 secondes
  }, 2000); // Délai de 3000 millisecondes (3 secondes)
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

// Changement des fonds de carte
function switchLayer(layerName) {
  var layers = map.getLayers().getArray();
  layers.forEach(function (layer) {
    // Vérifie si la couche est une coouche de fond de carte
    if (layer.get("isBaseLayer")) {
      if (layer.get("name") === layerName) {
        layer.setVisible(true);
      } else {
        layer.setVisible(false);
      }
    }
  });
}

// Function to initialize the layer switcher
document.querySelectorAll(".layer-option").forEach((option) => {
  option.addEventListener("click", function () {
    // Get the image source of the clicked layer option
    const imgSrc = option.querySelector("img").src;
    // Set this image source as the switcher icon's image
    document.querySelector("#switcher-icon img").src = imgSrc;

    // Optionally, hide the layer options after a selection
    document.querySelector(".layer-switcher").classList.add("collapsed");
  });
});

// Toggle layer options on hover or click
document.querySelector("#switcher-icon").addEventListener("click", function () {
  const layerSwitcher = document.querySelector(".layer-switcher");
  layerSwitcher.classList.toggle("collapsed");
});

//Fonds de carte Bingmapas et OSM
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
osm.setVisible(true);
bingMapsAerial.setVisible(false);

// Definition de couche des limites national du cameroun
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

var camerounLayerVisible = true; // Variable pour savoir si la couche est actuellement visible ou non

// Définition de la couche des limites des Régions et Villes (Yaounde, Douala uniquement) du cameroun
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

var regionLayerVisible = true; // Variable pour savoir si la couche est actuellement visible ou non

// Définition la couche des pays du monde (excepte le Cameroun) avec un style assombri
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
      scale: 0.12,
    }),
    text: new ol.style.Text({
      text: feature.get("nom_base"),
      font: "bold 12px Arial",
      fill: new ol.style.Fill({ color: "#ffffff" }),
      stroke: new ol.style.Stroke({ color: "#000000", width: 3 }),
      offsetY: -3,
    }),
  });
}

// Définition de la couche des partenaires
var partnerLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: "/api/care_partner",
    format: new ol.format.GeoJSON(),
  }),
  style: function (feature) {
    return createDefaultStyle(feature);
  },
});

map.addLayer(partnerLayer);

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
          feature.get("services_o") || "Aucune activité spécifiée."
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

var partnerLayerVisible = true;

// Gestion du clic sur le bouton pour afficher/masquer la couche des partenaires
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

// Ajout de la couche cluster à la carte
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

// Fonction d'affichage du popup lors du chargement de l'application
function showInitialPopup() {
  const isSmartphone = window.innerWidth <= 600; // Vérifier si on est sur un smartphone

  if (!isSmartphone) {
    const source = CamerounLayer.getSource();

    if (source.getState() === "ready") {
      // Si la source est déjà prête, afficher le popup
      const features = source.getFeatures();
      if (features.length > 0) {
        showPopup(features[0]); // Affiche le popup pour la première entité
      }
    } else {
      // Attendre que la source soit prête
      source.once("change", function () {
        if (source.getState() === "ready") {
          const features = source.getFeatures();
          if (features.length > 0) {
            showPopup(features[0]); // Affiche le popup pour la première entité
          }
        }
      });
    }
  }
}

// Ajout d'un écouteur pour détecter les changements de couche via layer-switcher
function attachLayerSwitcherHandler(map) {
  map.getLayers().forEach(function (layer) {
    if (layer instanceof ol.layer.Group) {
      layer.getLayers().forEach(function (subLayer) {
        // Réagir au changement de visibilité de la couche
        subLayer.on("change:visible", function () {
          if (subLayer.getVisible()) {
            // Appeler la fonction après avoir vérifié la visibilité
            const source = subLayer.getSource();
            if (source && source.getState() === "ready") {
              showInitialPopup();
            }
          }
        });
      });
    }
  });
}

// Initialiser la carte et ajouter la couche CamerounLayer
function initializeMap() {
  const map = new ol.Map({
    target: "map",
    layers: [osm], // Ajouter la couche de base
    view: new ol.View({
      center: ol.proj.fromLonLat([12.4922, 5.748]),
      zoom: 6,
    }),
  });

  // Ajouter la couche CamerounLayer
  map.addLayer(CamerounLayer);

  // Attacher l'écouteur pour gérer le layer-switcher
  attachLayerSwitcherHandler(map);

  // Afficher le popup initial après que la carte soit prête
  map.once("rendercomplete", function () {
    showInitialPopup(); // Afficher le popup initial
  });
}

// Appeler la fonction d'initialisation lors du chargement du DOM
document.addEventListener("DOMContentLoaded", initializeMap);

// Gestion de l'affichage/masquage des couches et du popup
document.getElementById("toggleRegions").addEventListener("click", function () {
  if (!regionLayerVisible) {
    // Ajouter la couche région et afficher le popup
    map.addLayer(regionLayer);
    regionLayerVisible = true;

    // Forcer le réaffichage du popup
    const source = CamerounLayer.getSource();
    if (source.getState() === "ready") {
      const features = source.getFeatures();
      if (features.length > 0) {
        showPopup(features[0]); // Réafficher le popup
      }
    }
  } else {
    // Retirer la couche région et masquer le popup
    map.removeLayer(regionLayer);
    regionLayerVisible = false;
    hidePopup(); // Appeler la fonction pour masquer
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

const toggleButton = document.getElementById("toggleBases");
const storyDiv = document.getElementById("story");

// Fonction d'affichage et masquage de la story-map
function toggleStoryDiv() {
  // Si la div est masquée, afficher
  if (storyDiv.style.display === "none" || storyDiv.style.display === "") {
    storyDiv.style.display = "block"; // Afficher la div
  } else {
    storyDiv.style.display = "none"; // Masquer la div
  }
}

// Initialiser l'état de la div story-map en fonction de la taille de l'écran
function initializeStoryDiv() {
  const isSmartphone = window.innerWidth <= 600;

  // Toujours masqué par défaut sur smartphone lors du chargement
  storyDiv.style.display = isSmartphone ? "none" : "block";
}

// Ajouter un listener au bouton pour afficher/masquer la div
toggleButton.addEventListener("click", toggleStoryDiv);

// Assurez-vous que la story-map démarre dans le bon état lors du chargement
document.addEventListener("DOMContentLoaded", initializeStoryDiv);

// Ajout d'une icone de localisation
var placemark = new ol.Overlay.Placemark();
map.addOverlay(placemark);

// La story-map
var story = new ol.control.Storymap({
  html: document.getElementById("story"),
  //target: document.getElementById("story"),
  minibar: true,
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

// Survol sur la carte lors du scroll sur la story-map
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

function setClassName(c) {
  console.log(c);
  story.element.classList.remove("scrollLine");
  story.element.classList.remove("scrollBox");
  if (c) story.element.classList.add(c);
  window.dispatchEvent(new Event("resize"));
}

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
        { name: "partenaire", attribute: "nom" },
        { name: "partenaire", attribute: "sigle" },
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

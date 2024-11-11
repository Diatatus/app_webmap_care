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

// Définition de la couche des limites des Régions et Villes (Yaounde, Douala uniquement) du cameroun
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

// Afficher/masquer la couche regions et villes du Cameroun
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

// Interaction de selection des couches
var select = new ol.interaction.Select({
  hitTolerance: 5,
  multi: false,
  condition: ol.events.condition.singleClick,
  filter: function (feature, layer) {
    // Retourner vrai uniquement si ce n'est pas la couche partnerLayer et worldMap
    return (
      layer !== partnerLayer &&
      layer !== worldMapLayer &&
      layer !== CamerounLayer
    );
  },
});

map.addInteraction(select);

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

// Interaction de sélection pour la couche des partenaires
var selectPartner = new ol.interaction.Select({
  layers: [partnerLayer],
  style: function (feature) {
    return createHighlightStyle(feature);
  },
});
map.addInteraction(selectPartner);

map.on("pointermove", function (evt) {
  const minZoomLevel = 12;
  const currentZoom = map.getView().getZoom();

  if (currentZoom >= minZoomLevel) {
    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
      if (layer === partnerLayer) {
        document.getElementById("partner-name").textContent =
          feature.get("nom");

        document.getElementById("partner-type").textContent =
          feature.get("sigle");

        document.getElementById("partner-activity").textContent =
          feature.get("act_srvc_o");

        document.getElementById("partner-info").textContent =
          feature.get("info");
        document.getElementById("partner-logo").src = feature.get("img_logo");

        const popup = document.getElementById("partner-popup");
        popup.style.left = evt.pixel[0] + 15 + "px";
        popup.style.top = evt.pixel[1] - 100 + "px";
        popup.style.display = "block";

        return true;
      } else {
        document.getElementById("partner-popup").style.display = "none";
      }
    });
  } else {
    document.getElementById("partner-popup").style.display = "none";
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
        data: [feature.get("popsexmasc"), feature.get("popsexfem")],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  document.getElementById("total-population-info").textContent = // Total population
    feature.get("total_pop").toLocaleString() + " habitants";
  document.getElementById("population-density-info").textContent = // Densite population
    feature.get("denspopreg") + " hab/km²";

  document.getElementById("access-sanity").textContent = feature.get("asa"); // Acces aux installations sanitaire
  document.getElementById("access-water").textContent = feature.get("aea"); // Acces a une source d'eau ameliore
  document.getElementById("handwashing").textContent = feature.get("ill"); // Installation de lave main

  document.getElementById("hiv-males").textContent = feature.get("pvihhom"); // Prevalence VIH (Hommes)
  document.getElementById("hiv-females").textContent = feature.get("pvihfem"); // Prevalence VIH (Femmes)

  document.getElementById("poverty-rate").textContent = feature.get("tauxpvrt"); // Taux de pauvrete
  document.getElementById("unemployment-rate").textContent =
    feature.get("chom"); // Taux de chomage
  document.getElementById("financial-inclusion").textContent =
    feature.get("ife"); // Taux d'inclusion financiere

  document.getElementById("unmet-need").textContent = feature.get("pf"); // Planning familliale
  document.getElementById("contraceptive-use").textContent =
    feature.get("fcpm"); // Femmes utilisant des methodes de contraceptions

  var familyData = {
    labels: ["Hommes", "Femmes"],
    datasets: [
      {
        data: [feature.get("vch"), feature.get("vcf")], // Hommes et femmes justifiant la violence conjugale
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
    if (layer === regionLayer || layer === CamerounLayer) {
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

const toggleButton = document.getElementById("toggleBases");
const storyDiv = document.getElementById("story");

// Fonction d'affichage de la story-map
function toggleStoryDiv() {
  if (storyDiv.style.display === "none" || storyDiv.style.display === "") {
    storyDiv.style.display = "block"; // Afficher
  } else {
    storyDiv.style.display = "none"; // Masquer
  }
}

// Ajouter / masquer lors du click sur le button
toggleButton.addEventListener("click", toggleStoryDiv);

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

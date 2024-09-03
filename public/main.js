$(document).ready(function () {
  setTimeout(function () {
    $("#loading").fadeOut(); // Masquer le div de chargement après 3 secondes
  }, 2000); // Délai de 3000 millisecondes (3 secondes)
});

// Get elements
const hamburgerMenu = document.getElementById("hamburger-menu");
const sidebar = document.getElementById("sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");
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
function switchLayer(layerName) {
  var layers = map.getLayers().getArray();
  layers.forEach(function (layer) {
    if (layer.get("name") === layerName) {
      layer.setVisible(true);
    } else {
      layer.setVisible(false);
    }
  });
}

//Bing map Tile

var bingMapsAerial = new ol.layer.Tile({
  title: "Aerial",
  visible: false,
  baseLayer: true,
  type: "base",
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
  source: new ol.source.OSM(),
  visible: true,
  name: "OSM",
});

map.addLayer(osm);
map.addLayer(bingMapsAerial);

// Initially, set only one layer visible
osm.setVisible(true);
bingMapsAerial.setVisible(false);

var regions_cmr = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: "/api/regions", // URL de l'endpoint Node.js pour récupérer les données GeoJSON
    format: new ol.format.GeoJSON(),
  }),
  projection: customproj,
  // Vous pouvez définir un style personnalisé pour les entités
});

map.addLayer(regions_cmr);

var displayProjectType = config.projects;
var projectStatus = config.status;

var selectedFeatures = [];
var selectedFeatureIDs = [];

var ct = 0;
const styleFunction = function (feature) {
  if (
    displayProjectType.includes(feature.get("Program")) &&
    projectStatus.includes(feature.get("Status")) &&
    yearList.includes(feature.get("Year"))
  ) {
    var mapExtent = mapView.calculateExtent(map.getSize());
    if (
      ol.extent.containsCoordinate(
        mapExtent,
        feature.getGeometry().getCoordinates()
      )
    ) {
      if (!selectedFeatureIDs.includes(feature.get("ProjectID"))) {
        selectedFeatures.push(feature);
        selectedFeatureIDs.push(feature.get("ProjectID"));
      }
    }
    return styles[feature.getGeometry().getType()];
  }
};

var reloadFlag = false;
map.on("movestart", (e) => {
  if (reloadFlag) {
    selectedFeatures = [];
    selectedFeatureIDs = [];
  }
  reloadFlag = true;
});

var cyanSelectionFeatureStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: "rgba(0,0,0,1)",
  }),
  stroke: new ol.style.Stroke({
    color: "#40E0D0",
    width: 3,
  }),
  image: new ol.style.Circle({
    radius: 6,
    fill: new ol.style.Fill({
      color: "#000000",
    }),
  }),
});
var cyanSelectionFeatureOverlay = new ol.layer.Vector({
  source: new ol.source.Vector(),
  map: map,
  style: cyanSelectionFeatureStyle,
});

function refreshTOCandProjectDetails() {
  if (selectedFeatures.length > 0) {
    var totBudget = 0;
    for (i = 0; i < selectedFeatures.length; i++) {
      totBudget = totBudget + Number(selectedFeatures[i].get("Budget"));
    }

    document.getElementById("spanProjectCount").textContent =
      selectedFeatures.length;
    document.getElementById("varBudgetTracking").textContent =
      "Total Budget - $ " + (totBudget / 1000000).toFixed(2) + " M";
    document.getElementById("varBudget").textContent =
      "Average Budget - $ " +
      (totBudget / 1000000 / selectedFeatures.length).toFixed(2) +
      " M";

    var previousNextDiv = document.getElementById("divPrevNext");
    previousNextDiv.innerHTML = "";

    var previousNextContent = document.createElement("div");
    previousNextContent.id = "preNxtContent";

    var previousButton = document.createElement("button");
    previousButton.id = "preBtn";
    previousButton.innerHTML = '<i class="fas fa-arrow-circle-left"></i>';
    previousButton.onclick = function () {
      featureInfoPre();
    };

    var featureCountSpan = document.createElement("span");
    featureCountSpan.id = "featureCountSpan";
    featureCountSpan.innerHTML = "  1 / " + selectedFeatures.length + "  ";

    var nextButton = document.createElement("button");
    nextButton.innerHTML = '<i class="fas fa-arrow-circle-right"></i>';
    nextButton.id = "nxtBtn";
    nextButton.onclick = function () {
      featureInfoNxt();
    };

    previousNextContent.appendChild(previousButton);
    previousNextContent.appendChild(featureCountSpan);
    previousNextContent.appendChild(nextButton);
    previousNextDiv.appendChild(previousNextContent);

    document.getElementById("divPrevNext").style.display = "flex";

    document.getElementById("spanProjectHeading").textContent =
      selectedFeatures[0].get("Sitename");
    document.getElementById("spanProjectID").textContent =
      selectedFeatures[0].get("ProjectID");

    document.getElementById("btnBudgetStatus").textContent = "On Budget";
    if (
      document.getElementById("btnBudgetStatus").classList.contains("btnRed")
    ) {
      document.getElementById("btnBudgetStatus").classList.remove("btnRed");
    }
    if (
      document.getElementById("btnBudgetStatus").classList.contains("btnGreen")
    ) {
      document.getElementById("btnBudgetStatus").classList.remove("btnGreen");
    }
    if (
      document.getElementById("btnBudgetStatus").classList.contains("btnOrange")
    ) {
      document.getElementById("btnBudgetStatus").classList.remove("btnOrange");
    }
    document.getElementById("btnBudgetStatus").classList.add("btnGreen");

    document.getElementById("btnScheduleStatus").textContent =
      "Behind Schedule";
    if (
      document.getElementById("btnScheduleStatus").classList.contains("btnRed")
    ) {
      document.getElementById("btnScheduleStatus").classList.remove("btnRed");
    }
    if (
      document
        .getElementById("btnScheduleStatus")
        .classList.contains("btnGreen")
    ) {
      document.getElementById("btnScheduleStatus").classList.remove("btnGreen");
    }
    if (
      document
        .getElementById("btnScheduleStatus")
        .classList.contains("btnOrange")
    ) {
      document
        .getElementById("btnScheduleStatus")
        .classList.remove("btnOrange");
    }
    document.getElementById("btnScheduleStatus").classList.add("btnRed");

    document.getElementById("spanProjectDescriptionText").textContent =
      selectedFeatures[0].get("Projectdescription");
    document.getElementById("spanProjectBudgetText").textContent =
      "$ " + selectedFeatures[0].get("Budget");

    if (selectedFeatures[0].get("Status") == "Design") {
      document.getElementById("btnPhaseDesign").className = "";
      document.getElementById("btnPhaseConstruction").className = "";
      document.getElementById("btnPhaseCompleted").className = "";

      document.getElementById("btnPhaseDesign").classList.add("btnBlue");
      document.getElementById("btnPhaseConstruction").classList.add("btnGrey");
      document.getElementById("btnPhaseCompleted").classList.add("btnGrey");
    }
    if (selectedFeatures[0].get("Status") == "Under Construction") {
      document.getElementById("btnPhaseDesign").className = "";
      document.getElementById("btnPhaseConstruction").className = "";
      document.getElementById("btnPhaseCompleted").className = "";

      document.getElementById("btnPhaseDesign").classList.add("btnGrey");
      document.getElementById("btnPhaseConstruction").classList.add("btnBlue");
      document.getElementById("btnPhaseCompleted").classList.add("btnGrey");
    }
    if (selectedFeatures[0].get("Status") == "Completed") {
      document.getElementById("btnPhaseDesign").className = "";
      document.getElementById("btnPhaseConstruction").className = "";
      document.getElementById("btnPhaseCompleted").className = "";

      document.getElementById("btnPhaseDesign").classList.add("btnGrey");
      document.getElementById("btnPhaseConstruction").classList.add("btnGrey");
      document.getElementById("btnPhaseCompleted").classList.add("btnBlue");
    }

    document.getElementById("spanProjectManagerText").textContent =
      selectedFeatures[0].get("Projectmanager");
    document.getElementById("spanProjectResponsibleText").textContent =
      selectedFeatures[0].get("ResposibleOfficer");
    document.getElementById("projectDetails").style.display = "inline-block";

    cyanSelectionFeatureOverlay.getSource().clear();
    cyanSelectionFeatureOverlay.getSource().addFeature(selectedFeatures[0]);
  } else {
    document.getElementById("spanProjectCount").textContent = "";
    document.getElementById("varBudget").textContent = "";

    document.getElementById("divPrevNext").style.display = "none";
    document.getElementById("divPrevNext").innerHTML = "";
    document.getElementById("projectDetails").style.display = "none";
    cyanSelectionFeatureOverlay.getSource().clear();
  }
  var divProjectList = document.getElementById("divProjectList");
  divProjectList.innerHTML = "";
  for (i = 0; i < selectedFeatures.length; i++) {
    var feature = selectedFeatures[i];
    var divProjectName = document.createElement("div");
    divProjectName.className = "divProjectName";

    var spanProjectName = document.createElement("span");
    spanProjectName.className = "spanProjectName";
    spanProjectName.setAttribute(
      "onclick",
      "showProjectDetail('" + selectedFeatures[i].get("ProjectID") + "')"
    );
    spanProjectName.innerHTML = selectedFeatures[i].get("Sitename");
    divProjectName.appendChild(spanProjectName);

    var linebreak = document.createElement("br");
    divProjectName.appendChild(linebreak);

    var spanProgramName = document.createElement("span");
    spanProgramName.className = "spanProgramName";
    spanProgramName.innerHTML = selectedFeatures[i].get("Program");
    divProjectName.appendChild(spanProgramName);

    divProjectList.appendChild(divProjectName);
  }
}

map.on("moveend", (e) => {
  selectedFeatures = [];
  selectedFeatureIDs = [];
  projectsLayer.getSource().refresh();
  setTimeout(refreshTOCandProjectDetails, 150);
});

function displayProject(projectType, category) {
  selectedFeatures = [];
  selectedFeatureIDs = [];
  if (category == "project") {
    if (document.getElementById(projectType).checked) {
      displayProjectType.push(projectType);
    } else {
      const index = displayProjectType.indexOf(projectType);
      if (index > -1) {
        // only splice array when item is found
        displayProjectType.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
  }

  if (category == "status") {
    if (document.getElementById(projectType).checked) {
      projectStatus.push(projectType);
    } else {
      const index = projectStatus.indexOf(projectType);
      if (index > -1) {
        // only splice array when item is found
        projectStatus.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
  }
  projectsLayer.getSource().refresh();
  setTimeout(refreshTOCandProjectDetails, 150);
}

function featureInfoNxt() {
  var currentTableNo = document
    .getElementById("featureCountSpan")
    .textContent.split("/")[0]
    .trim();

  if (currentTableNo != selectedFeatures.length) {
    document.getElementById("spanProjectHeading").textContent =
      selectedFeatures[currentTableNo].get("Sitename");
    document.getElementById("spanProjectID").textContent =
      selectedFeatures[currentTableNo].get("ProjectID");

    document.getElementById("btnBudgetStatus").textContent = "On Budget";
    if (
      document.getElementById("btnBudgetStatus").classList.contains("btnRed")
    ) {
      document.getElementById("btnBudgetStatus").classList.remove("btnRed");
    }
    if (
      document.getElementById("btnBudgetStatus").classList.contains("btnGreen")
    ) {
      document.getElementById("btnBudgetStatus").classList.remove("btnGreen");
    }
    if (
      document.getElementById("btnBudgetStatus").classList.contains("btnOrange")
    ) {
      document.getElementById("btnBudgetStatus").classList.remove("btnOrange");
    }
    document.getElementById("btnBudgetStatus").classList.add("btnGreen");

    document.getElementById("btnScheduleStatus").textContent =
      "Behind Schedule";
    if (
      document.getElementById("btnScheduleStatus").classList.contains("btnRed")
    ) {
      document.getElementById("btnScheduleStatus").classList.remove("btnRed");
    }
    if (
      document
        .getElementById("btnScheduleStatus")
        .classList.contains("btnGreen")
    ) {
      document.getElementById("btnScheduleStatus").classList.remove("btnGreen");
    }
    if (
      document
        .getElementById("btnScheduleStatus")
        .classList.contains("btnOrange")
    ) {
      document
        .getElementById("btnScheduleStatus")
        .classList.remove("btnOrange");
    }
    document.getElementById("btnScheduleStatus").classList.add("btnRed");

    document.getElementById("spanProjectDescriptionText").textContent =
      selectedFeatures[currentTableNo].get("Projectdescription");
    document.getElementById("spanProjectBudgetText").textContent =
      "$ " + selectedFeatures[currentTableNo].get("Budget");

    if (selectedFeatures[currentTableNo].get("Status") == "Design") {
      document.getElementById("btnPhaseDesign").className = "";
      document.getElementById("btnPhaseConstruction").className = "";
      document.getElementById("btnPhaseCompleted").className = "";

      document.getElementById("btnPhaseDesign").classList.add("btnBlue");
      document.getElementById("btnPhaseConstruction").classList.add("btnGrey");
      document.getElementById("btnPhaseCompleted").classList.add("btnGrey");
    }
    if (
      selectedFeatures[currentTableNo].get("Status") == "Under Construction"
    ) {
      document.getElementById("btnPhaseDesign").className = "";
      document.getElementById("btnPhaseConstruction").className = "";
      document.getElementById("btnPhaseCompleted").className = "";

      document.getElementById("btnPhaseDesign").classList.add("btnGrey");
      document.getElementById("btnPhaseConstruction").classList.add("btnBlue");
      document.getElementById("btnPhaseCompleted").classList.add("btnGrey");
    }
    if (selectedFeatures[currentTableNo].get("Status") == "Completed") {
      document.getElementById("btnPhaseDesign").className = "";
      document.getElementById("btnPhaseConstruction").className = "";
      document.getElementById("btnPhaseCompleted").className = "";

      document.getElementById("btnPhaseDesign").classList.add("btnGrey");
      document.getElementById("btnPhaseConstruction").classList.add("btnGrey");
      document.getElementById("btnPhaseCompleted").classList.add("btnBlue");
    }

    document.getElementById("spanProjectManagerText").textContent =
      selectedFeatures[currentTableNo].get("Projectmanager");
    document.getElementById("spanProjectResponsibleText").textContent =
      selectedFeatures[currentTableNo].get("ResposibleOfficer");

    document.getElementById("featureCountSpan").textContent =
      "  " +
      (Number(currentTableNo) + 1) +
      " / " +
      selectedFeatures.length +
      "  ";

    cyanSelectionFeatureOverlay.getSource().clear();
    cyanSelectionFeatureOverlay
      .getSource()
      .addFeature(selectedFeatures[currentTableNo]);
  }
}

function featureInfoPre() {
  var currentTableNo = document
    .getElementById("featureCountSpan")
    .textContent.split("/")[0]
    .trim();
  if (currentTableNo != 1) {
    document.getElementById("spanProjectHeading").textContent =
      selectedFeatures[currentTableNo - 2].get("Sitename");
    document.getElementById("spanProjectID").textContent =
      selectedFeatures[currentTableNo - 2].get("ProjectID");

    document.getElementById("btnBudgetStatus").textContent = "On Budget";
    if (
      document.getElementById("btnBudgetStatus").classList.contains("btnRed")
    ) {
      document.getElementById("btnBudgetStatus").classList.remove("btnRed");
    }
    if (
      document.getElementById("btnBudgetStatus").classList.contains("btnGreen")
    ) {
      document.getElementById("btnBudgetStatus").classList.remove("btnGreen");
    }
    if (
      document.getElementById("btnBudgetStatus").classList.contains("btnOrange")
    ) {
      document.getElementById("btnBudgetStatus").classList.remove("btnOrange");
    }
    document.getElementById("btnBudgetStatus").classList.add("btnGreen");

    document.getElementById("btnScheduleStatus").textContent =
      "Behind Schedule";
    if (
      document.getElementById("btnScheduleStatus").classList.contains("btnRed")
    ) {
      document.getElementById("btnScheduleStatus").classList.remove("btnRed");
    }
    if (
      document
        .getElementById("btnScheduleStatus")
        .classList.contains("btnGreen")
    ) {
      document.getElementById("btnScheduleStatus").classList.remove("btnGreen");
    }
    if (
      document
        .getElementById("btnScheduleStatus")
        .classList.contains("btnOrange")
    ) {
      document
        .getElementById("btnScheduleStatus")
        .classList.remove("btnOrange");
    }
    document.getElementById("btnScheduleStatus").classList.add("btnRed");

    document.getElementById("spanProjectDescriptionText").textContent =
      selectedFeatures[currentTableNo - 2].get("Projectdescription");
    document.getElementById("spanProjectBudgetText").textContent =
      "$ " + selectedFeatures[currentTableNo - 2].get("Budget");

    if (selectedFeatures[currentTableNo - 2].get("Status") == "Design") {
      document.getElementById("btnPhaseDesign").className = "";
      document.getElementById("btnPhaseConstruction").className = "";
      document.getElementById("btnPhaseCompleted").className = "";

      document.getElementById("btnPhaseDesign").classList.add("btnBlue");
      document.getElementById("btnPhaseConstruction").classList.add("btnGrey");
      document.getElementById("btnPhaseCompleted").classList.add("btnGrey");
    }
    if (
      selectedFeatures[currentTableNo - 2].get("Status") == "Under Construction"
    ) {
      document.getElementById("btnPhaseDesign").className = "";
      document.getElementById("btnPhaseConstruction").className = "";
      document.getElementById("btnPhaseCompleted").className = "";

      document.getElementById("btnPhaseDesign").classList.add("btnGrey");
      document.getElementById("btnPhaseConstruction").classList.add("btnBlue");
      document.getElementById("btnPhaseCompleted").classList.add("btnGrey");
    }
    if (selectedFeatures[currentTableNo - 2].get("Status") == "Completed") {
      document.getElementById("btnPhaseDesign").className = "";
      document.getElementById("btnPhaseConstruction").className = "";
      document.getElementById("btnPhaseCompleted").className = "";

      document.getElementById("btnPhaseDesign").classList.add("btnGrey");
      document.getElementById("btnPhaseConstruction").classList.add("btnGrey");
      document.getElementById("btnPhaseCompleted").classList.add("btnBlue");
    }

    document.getElementById("spanProjectManagerText").textContent =
      selectedFeatures[currentTableNo - 2].get("Projectmanager");
    document.getElementById("spanProjectResponsibleText").textContent =
      selectedFeatures[currentTableNo - 2].get("ResposibleOfficer");

    document.getElementById("featureCountSpan").textContent =
      "  " +
      (Number(currentTableNo) - 1) +
      " / " +
      selectedFeatures.length +
      "  ";

    cyanSelectionFeatureOverlay.getSource().clear();
    cyanSelectionFeatureOverlay
      .getSource()
      .addFeature(selectedFeatures[currentTableNo - 2]);
  }
}

var yearList = [
  "FYE2019",
  "FYE2020",
  "FYE2021",
  "FYE2022",
  "FYE2023",
  "FYE2024",
];
function toggleYear(year) {
  selectedFeatures = [];
  selectedFeatureIDs = [];
  if (
    document.getElementById("btnYear" + year).classList.contains("btnYearBlue")
  ) {
    document.getElementById("btnYear" + year).classList.remove("btnYearBlue");
    document.getElementById("btnYear" + year).classList.add("btnYearGrey");
    const index = yearList.indexOf("FYE" + year);
    if (index > -1) {
      // only splice array when item is found
      yearList.splice(index, 1); // 2nd parameter means remove one item only
    }
  } else if (
    document.getElementById("btnYear" + year).classList.contains("btnYearGrey")
  ) {
    document.getElementById("btnYear" + year).classList.remove("btnYearGrey");
    document.getElementById("btnYear" + year).classList.add("btnYearBlue");
    yearList.push("FYE" + year);
  }
  projectsLayer.getSource().refresh();
  setTimeout(refreshTOCandProjectDetails, 150);
}

function showProjectDetail(id) {
  var featureIndex;
  for (i = 0; i < selectedFeatures.length; i++) {
    if (selectedFeatures[i].get("ProjectID") == id) {
      featureIndex = i;
      break;
    }
  }

  document.getElementById("spanProjectHeading").textContent =
    selectedFeatures[featureIndex].get("Sitename");
  document.getElementById("spanProjectID").textContent =
    selectedFeatures[featureIndex].get("ProjectID");

  document.getElementById("btnBudgetStatus").textContent = "On Budget";
  if (document.getElementById("btnBudgetStatus").classList.contains("btnRed")) {
    document.getElementById("btnBudgetStatus").classList.remove("btnRed");
  }
  if (
    document.getElementById("btnBudgetStatus").classList.contains("btnGreen")
  ) {
    document.getElementById("btnBudgetStatus").classList.remove("btnGreen");
  }
  if (
    document.getElementById("btnBudgetStatus").classList.contains("btnOrange")
  ) {
    document.getElementById("btnBudgetStatus").classList.remove("btnOrange");
  }
  document.getElementById("btnBudgetStatus").classList.add("btnGreen");

  document.getElementById("btnScheduleStatus").textContent = "Behind Schedule";
  if (
    document.getElementById("btnScheduleStatus").classList.contains("btnRed")
  ) {
    document.getElementById("btnScheduleStatus").classList.remove("btnRed");
  }
  if (
    document.getElementById("btnScheduleStatus").classList.contains("btnGreen")
  ) {
    document.getElementById("btnScheduleStatus").classList.remove("btnGreen");
  }
  if (
    document.getElementById("btnScheduleStatus").classList.contains("btnOrange")
  ) {
    document.getElementById("btnScheduleStatus").classList.remove("btnOrange");
  }
  document.getElementById("btnScheduleStatus").classList.add("btnRed");

  document.getElementById("spanProjectDescriptionText").textContent =
    selectedFeatures[featureIndex].get("Projectdescription");
  document.getElementById("spanProjectBudgetText").textContent =
    "$ " + selectedFeatures[featureIndex].get("Budget");

  if (selectedFeatures[featureIndex].get("Status") == "Design") {
    document.getElementById("btnPhaseDesign").className = "";
    document.getElementById("btnPhaseConstruction").className = "";
    document.getElementById("btnPhaseCompleted").className = "";

    document.getElementById("btnPhaseDesign").classList.add("btnBlue");
    document.getElementById("btnPhaseConstruction").classList.add("btnGrey");
    document.getElementById("btnPhaseCompleted").classList.add("btnGrey");
  }
  if (selectedFeatures[featureIndex].get("Status") == "Under Construction") {
    document.getElementById("btnPhaseDesign").className = "";
    document.getElementById("btnPhaseConstruction").className = "";
    document.getElementById("btnPhaseCompleted").className = "";

    document.getElementById("btnPhaseDesign").classList.add("btnGrey");
    document.getElementById("btnPhaseConstruction").classList.add("btnBlue");
    document.getElementById("btnPhaseCompleted").classList.add("btnGrey");
  }
  if (selectedFeatures[featureIndex].get("Status") == "Completed") {
    document.getElementById("btnPhaseDesign").className = "";
    document.getElementById("btnPhaseConstruction").className = "";
    document.getElementById("btnPhaseCompleted").className = "";

    document.getElementById("btnPhaseDesign").classList.add("btnGrey");
    document.getElementById("btnPhaseConstruction").classList.add("btnGrey");
    document.getElementById("btnPhaseCompleted").classList.add("btnBlue");
  }

  document.getElementById("spanProjectManagerText").textContent =
    selectedFeatures[featureIndex].get("Projectmanager");
  document.getElementById("spanProjectResponsibleText").textContent =
    selectedFeatures[featureIndex].get("ResposibleOfficer");

  document.getElementById("featureCountSpan").textContent =
    "  " + (Number(featureIndex) + 1) + " / " + selectedFeatures.length + "  ";

  cyanSelectionFeatureOverlay.getSource().clear();
  cyanSelectionFeatureOverlay
    .getSource()
    .addFeature(selectedFeatures[featureIndex]);
}

const select = new ol.interaction.Select({ style: cyanSelectionFeatureStyle });
map.addInteraction(select);

select.on("select", function (e) {
  showProjectDetail(e.target.getFeatures().item(0).get("ProjectID"));
  select.getFeatures().remove(select.getFeatures().item(0));
});

// start normal style definition
const image = new ol.style.Circle({
  radius: 4,
  fill: new ol.style.Fill({
    color: "rgba(255, 0, 0, 1)",
  }),
  stroke: new ol.style.Stroke({ color: "red", width: 1 }),
});

const styles = {
  Point: new ol.style.Style({
    image: image,
  }),
  LineString: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "green",
      width: 1,
    }),
  }),
  MultiLineString: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "green",
      width: 1,
    }),
  }),
  MultiPoint: new ol.style.Style({
    image: image,
  }),
  MultiPolygon: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "yellow",
      width: 1,
    }),
    fill: new ol.style.Fill({
      color: "rgba(255, 255, 0, 1)",
    }),
  }),
  Polygon: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "blue",
      lineDash: [4],
      width: 3,
    }),
    fill: new ol.style.Fill({
      color: "rgba(0, 0, 255, 0.1)",
    }),
  }),
  GeometryCollection: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "magenta",
      width: 2,
    }),
    fill: new ol.style.Fill({
      color: "magenta",
    }),
    image: new ol.style.Circle({
      radius: 10,
      fill: null,
      stroke: new ol.style.Stroke({
        color: "magenta",
      }),
    }),
  }),
  Circle: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "red",
      width: 2,
    }),
    fill: new ol.style.Fill({
      color: "rgba(255,0,0,1)",
    }),
  }),
};

// end style definition

// start : onload functions
// $(function () {

// })
// end : onload functions

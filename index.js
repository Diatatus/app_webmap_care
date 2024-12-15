const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const pool = require("./db.js"); // Importation du module de connexion à la base de données
require("dotenv").config();

//Port d'acces
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques dans le répertoire 'public'
app.use(express.static(path.join(__dirname, "public")));

// Configurer le dossier 'node_modules' pour être accessible publiquement
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

// Search endpoint
app.post("/api/liveSearch", async (req, res) => {
  const { request, searchTxt, searchLayer, searchAttribute } = req.body;

  if (request === "liveSearch") {
    try {
      // Construct the query dynamically based on search layer and attribute
      const query = `SELECT * FROM ${searchLayer} WHERE LOWER(${searchAttribute}) LIKE LOWER($1) ORDER BY ${searchAttribute} ASC LIMIT 10`;
      const values = [`%${searchTxt}%`]; // Use parameterized query to avoid SQL injection

      const result = await pool.query(query, values);

      // Format response to match PHP script output
      const response = result.rows.map((row) => ({
        [searchAttribute]: row[searchAttribute],
      }));

      res.json(response);
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err.stack);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des données" });
    }
  } else {
    res.status(400).json({ error: "Invalid request" });
  }
});

// Endpoint pour le zoom sur les données
app.post("/api/zoomFeature", async (req, res) => {
  const { layerName, attributeName, value } = req.body;

  try {
    const query = `
      SELECT ST_AsGeoJSON(geom) as geometry 
      FROM ${layerName} 
      WHERE ${attributeName} = $1
      LIMIT 1;
    `;
    const result = await pool.query(query, [value]);

    if (result.rows.length > 0 && result.rows[0].geometry) {
      res.json({ geometry: result.rows[0].geometry });
    } else {
      res.status(404).json({ error: "No geometry available for this feature" });
    }
  } catch (error) {
    console.error("Error in zoomFeature query:", error);
    res.status(500).json({ error: "Failed to fetch feature geometry" });
  }
});

// Endpoint pour les regions et villes du cameroun
app.get("/api/regions", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT jsonb_build_object('type', 'FeatureCollection', 'features', jsonb_agg(feature)) " +
        "FROM (SELECT jsonb_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(geom)::jsonb, " +
        "'properties', to_jsonb(row) - 'geom') AS feature FROM (SELECT * FROM regions) row) features;"
    );
    res.json(result.rows[0].jsonb_build_object);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des données GeoJSON",
      err.stack
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des données GeoJSON" });
  }
});

//Endpoint pour le cameroun
app.get("/api/cameroun", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT jsonb_build_object('type', 'FeatureCollection', 'features', jsonb_agg(feature)) " +
        "FROM (SELECT jsonb_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(geom)::jsonb, " +
        "'properties', to_jsonb(row) - 'geom') AS feature FROM (SELECT * FROM cameroun) row) features;"
    );
    res.json(result.rows[0].jsonb_build_object);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des données GeoJSON",
      err.stack
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des données GeoJSON" });
  }
});

//Endpoint pour la carte du monde assombri
app.get("/api/world_map", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT jsonb_build_object('type', 'FeatureCollection', 'features', jsonb_agg(feature)) " +
        "FROM (SELECT jsonb_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(geom)::jsonb, " +
        "'properties', to_jsonb(row) - 'geom') AS feature FROM (SELECT * FROM world_map) row) features;"
    );
    res.json(result.rows[0].jsonb_build_object);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des données GeoJSON",
      err.stack
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des données GeoJSON" });
  }
});

//Endpoint pour la couche des partenaires
app.get("/api/care_partner", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT jsonb_build_object('type', 'FeatureCollection', 'features', jsonb_agg(feature)) " +
        "FROM (SELECT jsonb_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(geom)::jsonb, " +
        "'properties', to_jsonb(row) - 'geom') AS feature FROM (SELECT * FROM partenaire) row) features;"
    );
    res.json(result.rows[0].jsonb_build_object);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des données GeoJSON",
      err.stack
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des données GeoJSON" });
  }
});

//Ouverture sur la page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

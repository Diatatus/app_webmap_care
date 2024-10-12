const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const pool = require("./db.js"); // Importation du module de connexion à la base de données
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques dans le répertoire 'public'
app.use(express.static(path.join(__dirname, "public")));

// Configurer le dossier 'node_modules' pour être accessible publiquement
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

// Endpoint pour récupérer les données GeoJSON de PostGIS
app.get("/api/regions_villes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT jsonb_build_object('type', 'FeatureCollection', 'features', jsonb_agg(feature)) " +
        "FROM (SELECT jsonb_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(geom)::jsonb, " +
        "'properties', to_jsonb(row) - 'geom') AS feature FROM (SELECT * FROM regions_villes) row) features;"
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

// Serve loading.html as the default page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

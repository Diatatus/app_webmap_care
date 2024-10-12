const { Pool } = require("pg");

// Configuration de la connexion
const pool = new Pool({
  user: "postgres", // Remplacez par votre nom d'utilisateur PostgreSQL
  host: "localhost", // Remplacez par l'hôte de votre base de données
  database: "bd_care_app", // Remplacez par le nom de votre base de données
  password: "geopass", // Remplacez par votre mot de passe PostgreSQL
  port: 5432, // Port par défaut pour PostgreSQL
});

// Connexion à la base de données
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Erreur de connexion à la base de données", err.stack);
  }
  console.log("Connexion réussie à la base de données");

  // Exemple de requête simple pour vérifier la connexion
  client.query("SELECT NOW()", (err, result) => {
    release();
    if (err) {
      return console.error(
        "Erreur lors de l'exécution de la requête",
        err.stack
      );
    }
    console.log("Heure actuelle de la base de données:", result.rows[0]);
  });
});

module.exports = pool;

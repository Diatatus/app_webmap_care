const express = require("express");
const router = express.Router();
const pool = require("../db.js");

// Middleware d'authentification
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ error: "Accès refusé" });
}

// Route publique : Connexion
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Remplacez cette logique par une authentification basée sur votre base de données
  if (username === "admin" && password === "careadmin2025") {
    req.session.user = { username };  // Stockage de l'utilisateur dans la session
    return res.json({ success: true, message: "Connexion réussie" });
  }

  res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
});

// Route publique : Déconnexion
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la déconnexion" });
    }
    res.json({ success: true, message: "Déconnexion réussie" });
  });
});

// Appliquer le middleware aux routes protégées
router.use(isAuthenticated);

/**
 * Route protégée : Création d'une nouvelle région
 */
router.post("/regions/add", async (req, res) => {
  try {
    const {
      nom,
      popsex_masc,
      popsex_fem,
      denspop_reg,
      taux_pvrt,
      prev_vih_hom,
      acces_eau_amel,
      inst_lavmain_lim,
      incl_fin_emf,
      taux_chom,
      acces_sanit_amel,
      besoins_nonsatisf_pf,
      fem_utilmethcontracep_mod,
      justif_violconj_hom,
      justif_violconj_fem,
      geom,
      total_pop,
      prev_vih_fem,
    } = req.body;

    const query = `
      INSERT INTO regions 
      (nom, popsex_masc, popsex_fem, denspop_reg, taux_pvrt, prev_vih_hom, acces_eau_amel, inst_lavmain_lim, incl_fin_emf, taux_chom, acces_sanit_amel, besoins_nonsatisf_pf, fem_utilmethcontracep_mod, justif_violconj_hom, justif_violconj_fem, geom, total_pop, prev_vih_fem)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, ST_GeomFromGeoJSON($16), $17, $18)
      RETURNING *
    `;
    const values = [
      nom,
      popsex_masc,
      popsex_fem,
      denspop_reg,
      taux_pvrt,
      prev_vih_hom,
      acces_eau_amel,
      inst_lavmain_lim,
      incl_fin_emf,
      taux_chom,
      acces_sanit_amel,
      besoins_nonsatisf_pf,
      fem_utilmethcontracep_mod,
      justif_violconj_hom,
      justif_violconj_fem,
      geom,
      total_pop,
      prev_vih_fem,
    ];

    const result = await pool.query(query, values);
    res.json({ success: true, region: result.rows[0] });
  } catch (err) {
    console.error("Erreur lors de l'ajout de la région", err.stack);
    res.status(500).json({ error: "Erreur lors de l'ajout de la région" });
  }
});

// Autres routes protégées
router.get("/regions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM regions");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des régions", err.stack);
    res.status(500).json({ error: "Erreur lors de la récupération des régions" });
  }
});

router.get("/regions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM regions WHERE id_region = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Région non trouvée" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de la récupération de la région", err.stack);
    res.status(500).json({ error: "Erreur lors de la récupération de la région" });
  }
});

router.put("/regions/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom,
      popsex_masc,
      popsex_fem,
      denspop_reg,
      taux_pvrt,
      prev_vih_hom,
      acces_eau_amel,
      inst_lavmain_lim,
      incl_fin_emf,
      taux_chom,
      acces_sanit_amel,
      besoins_nonsatisf_pf,
      fem_utilmethcontracep_mod,
      justif_violconj_hom,
      justif_violconj_fem,
      geom,
      total_pop,
      prev_vih_fem,
    } = req.body;

    const query = `
      UPDATE regions 
      SET 
        nom = $1, 
        popsex_masc = $2, 
        popsex_fem = $3, 
        denspop_reg = $4, 
        taux_pvrt = $5, 
        prev_vih_hom = $6, 
        acces_eau_amel = $7, 
        inst_lavmain_lim = $8, 
        incl_fin_emf = $9, 
        taux_chom = $10, 
        acces_sanit_amel = $11, 
        besoins_nonsatisf_pf = $12, 
        fem_utilmethcontracep_mod = $13, 
        justif_violconj_hom = $14, 
        justif_violconj_fem = $15, 
        geom = ST_GeomFromGeoJSON($16), 
        total_pop = $17, 
        prev_vih_fem = $18
      WHERE id_region = $19
      RETURNING *
    `;
    const values = [
      nom,
      popsex_masc,
      popsex_fem,
      denspop_reg,
      taux_pvrt,
      prev_vih_hom,
      acces_eau_amel,
      inst_lavmain_lim,
      incl_fin_emf,
      taux_chom,
      acces_sanit_amel,
      besoins_nonsatisf_pf,
      fem_utilmethcontracep_mod,
      justif_violconj_hom,
      justif_violconj_fem,
      geom,
      total_pop,
      prev_vih_fem,
      id,
    ];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Région non trouvée" });
    }
    res.json({ success: true, region: result.rows[0] });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la région", err.stack);
    res.status(500).json({ error: "Erreur lors de la mise à jour de la région" });
  }
});

module.exports = router;

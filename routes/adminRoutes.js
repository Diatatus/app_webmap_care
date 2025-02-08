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

/**
 * Route protégée : Création d'un noouveau partenaire
 */
router.post("/care_partner/add", async (req, res) => {
  try {
    const {
      nom,
      sigle,
      act_srvc_offert,
      statut_prest,
      img_logo,
      info,
      geom,

    } = req.body;

    const query = `
      INSERT INTO regions 
      (nom, sigle, act_srvc_offert, statut_prest, img_logo, info, geom)
      VALUES 
      ($1, $2, $3, $4, $5, $6, ST_GeomFromGeoJSON($7))
      RETURNING *
    `;
    const values = [
      nom,
      sigle,
      act_srvc_offert,
      statut_prest,
      img_logo,
      info,
      geom,
    ];

    const result = await pool.query(query, values);
    res.json({ success: true, region: result.rows[0] });
  } catch (err) {
    console.error("Erreur lors de l'ajout du partenaire", err.stack);
    res.status(500).json({ error: "Erreur lors de l'ajout de la région" });
  }
});

// Autres routes protégées
router.get("/care_partner", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM partenaires");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération  des partenaires", err.stack);
    res.status(500).json({ error: "Erreur lors de la récupération des partenaires" });
  }
});

router.get("/care_partner/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM partenaires WHERE id_partenaire = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Partenaire non trouvée" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de la récupération du partenaire", err.stack);
    res.status(500).json({ error: "Erreur lors de la récupération du partenaire" });
  }
});

router.put("/care_partner/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom,
      sigle,
      act_srvc_offert,
      statut_prest,
      img_logo,
      info,
      geom,
    } = req.body;

    const query = `
      UPDATE regions 
      SET 
        nom = $1, 
        sigle = $2, 
        act_srvc_offert = $3, 
        statut_prest = $4, 
        img_logo = $5, 
        info = $6, 
        geom = $7, 
      WHERE id_partenaire = $8
      RETURNING *
    `;
    const values = [
      nom,
      sigle,
      act_srvc_offert,
      statut_prest,
      img_logo,
      info,
      geom,
      id_partenaire,
    ];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Partenaire non trouvée" });
    }
    res.json({ success: true, region: result.rows[0] });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du partenaire", err.stack);
    res.status(500).json({ error: "Erreur lors de la mise à jour du partenaire" });
  }
});

module.exports = router;

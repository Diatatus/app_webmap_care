const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const multer = require("multer");
const path = require("path");

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
        total_pop = $16, 
        prev_vih_fem = $17
      WHERE id_region = $18
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



/**
 * Route : Ajouter un nouveau partenaire
 */
// Configuration du stockage des images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/resources/images/partner"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

router.post("/care_partner/add", upload.single("img_logo"), async (req, res) => {
  try {
    const {
      id_partenaire,
      nom,
      sigle,
      act_srvc_offert,
      statut_prest,
      info,
      longitude,
      latitude
    } = req.body;

    const img_logo = req.file ? req.file.filename : null;

    const geom = longitude && latitude 
  ? `{"type":"Point","coordinates":[${longitude},${latitude}]}`
  : null;

const values = [nom, sigle, act_srvc_offert, statut_prest, img_logo, info];

if (geom) values.push(geom); // Ajoute `geom` uniquement s'il existe

const query = `
    INSERT INTO partenaires (nom, sigle, act_srvc_offert, statut_prest, img_logo, info, geom)
    VALUES ($1, $2, $3, $4, $5, $6, ST_GeomFromGeoJSON($7))
    ON CONFLICT (nom, sigle) 
    DO UPDATE SET act_srvc_offert = EXCLUDED.act_srvc_offert, statut_prest = EXCLUDED.statut_prest
    RETURNING *;
`;
const result = await pool.query(query, values);

    res.json({ success: true, partner: result.rows[0] });
  } catch (err) {
    console.error("Erreur lors de l'ajout du partenaire", err.stack);
    res.status(500).json({ error: "Erreur lors de l'ajout du partenaire" });
  }
});

/**
 * Route : Récupérer la liste de tous les partenaires
 */
router.get("/care_partner", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_partenaire, 
        nom, 
        sigle, 
        act_srvc_offert, 
        statut_prest, 
        img_logo, 
        info, 
        ST_AsGeoJSON(geom) AS geom 
      FROM partenaires
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des partenaires", err.stack);
    res.status(500).json({ error: "Erreur lors de la récupération des partenaires" });
  }
});


/**
 * Route : Récupérer un partenaire par son ID
 */
router.get("/care_partner/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM partenaires WHERE id_partenaire = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Partenaire non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de la récupération du partenaire", err.stack);
    res.status(500).json({ error: "Erreur lors de la récupération du partenaire" });
  }
});

/**
 * Route : Mettre à jour un partenaire
 */
router.put("/care_partner/update/:id",upload.single("img_logo"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom,
      sigle,
      act_srvc_offert,
      statut_prest,
      info,
      longitude,
    } = req.body;

    const img_logo = req.file ? req.file.filename : null;

    const geom = longitude && latitude ? `{"type":"Point","coordinates":[${longitude},${latitude}]}` : null;

    const query = `
      UPDATE partenaires 
      SET 
        nom = $1,
        sigle = $2,
        act_srvc_offert = $3,
        statut_prest = $4,
        img_logo = $5,
        info = $6,
        geom = ST_GeomFromGeoJSON($7)
      WHERE id_partenaire = $8
      RETURNING *;
    `;
    const values = [nom, sigle, act_srvc_offert, statut_prest, img_logo, info, geom, id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Partenaire non trouvé" });
    }

    res.json({ success: true, partner: result.rows[0] });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du partenaire", err.stack);
    res.status(500).json({ error: "Erreur lors de la mise à jour du partenaire" });
  }
});

/**
 * Route : Supprimer un partenaire
 */
router.delete("/care_partner/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM partenaires WHERE id_partenaire = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Partenaire non trouvé" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur lors de la suppression du partenaire", err.stack);
    res.status(500).json({ error: "Erreur lors de la suppression du partenaire" });
  }
});

module.exports = router;
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

router.post("/care_partner/add", upload.fields([{ name: "img_logo", maxCount: 1 }]), async (req, res) => {
  try {
    console.log("Valeurs reçues :", JSON.stringify(req.body, null, 2));

    let { id_partenaire, nom, sigle, act_srvc_offert, statut_prest, info, longitude, latitude } = req.body;

    id_partenaire = parseInt(id_partenaire, 10);
    if (isNaN(id_partenaire)) {
      return res.status(400).json({ error: "L'ID du partenaire doit être un nombre valide !" });
    }

    // Construction du chemin relatif pour img_logo
    const img_logo = req.files["img_logo"] ? `./resources/images/partner/${req.files["img_logo"][0].filename}` : null;

    const longitudeNum = parseFloat(longitude);
    const latitudeNum = parseFloat(latitude);

    const geom = longitudeNum && latitudeNum
      ? `{"type":"Point","coordinates":[${longitudeNum},${latitudeNum}]}` 
      : null;

    const values = [id_partenaire, nom, sigle, act_srvc_offert, statut_prest, img_logo, info, geom];

    const query = `
        INSERT INTO partenaires (id_partenaire, nom, sigle, act_srvc_offert, statut_prest, img_logo, info, geom)
        VALUES ($1, $2, $3, $4, $5, $6, $7, ST_GeomFromGeoJSON($8))
        ON CONFLICT (id_partenaire) 
        DO UPDATE SET 
            nom = EXCLUDED.nom, 
            sigle = EXCLUDED.sigle, 
            act_srvc_offert = EXCLUDED.act_srvc_offert, 
            statut_prest = EXCLUDED.statut_prest, 
            img_logo = EXCLUDED.img_logo, 
            info = EXCLUDED.info, 
            geom = EXCLUDED.geom
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
        ST_AsGeoJSON(geom) As geom 
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

    const query = `
      SELECT 
        id_partenaire, 
        nom, 
        sigle, 
        act_srvc_offert, 
        statut_prest, 
        img_logo, 
        info, 
        ST_X(geom) AS longitude, 
        ST_Y(geom) AS latitude
      FROM partenaires
      WHERE id_partenaire = $1;
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Partenaire non trouvé" });
    }

    res.json(rows[0]); // Retourne un seul partenaire
  } catch (err) {
    console.error("Erreur lors de la récupération du partenaire", err);
    res.status(500).json({ error: "Erreur serveur" });
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
      latitude
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
        geom = ST_AsGeoJSON($7)
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


/**
 * Route : Récupérer la liste de tous les bureaux de base
 */
router.get("/bureaux_base", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_base, 
        id_region, 
        nom_base, 
        date_crea,  
        ST_AsGeoJSON(geom) As geom 
      FROM bureaux_base
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des bureaux de base", err.stack);
    res.status(500).json({ error: "Erreur lors de la récupération des bureaux de base" });
  }
});


/**
 * Route : Récupérer un bureau de base par son ID
 */
router.get("/bureaux_base/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id_base, 
        id_region, 
        nom_base, 
        date_crea,  
        ST_X(geom) AS longitude, 
        ST_Y(geom) AS latitude
      FROM bureaux_base
      WHERE id_base = $1;
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Bureau de base non trouvé" });
    }

    res.json(rows[0]); // Retourne un seul partenaire
  } catch (err) {
    console.error("Erreur lors de la récupération du bureau de base", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


/**
 * Route : Mettre à jour un bureaux de base
 */
router.put("/bureaux_base/update/:id",upload.single("img_logo"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_base,
      id_region, 
      nom_base, 
      date_crea,
      longitude,
      latitude
    } = req.body;

    const img_logo = req.file ? req.file.filename : null;

    const geom = longitude && latitude ? `{"type":"Point","coordinates":[${longitude},${latitude}]}` : null;

    const query = `
      UPDATE partenaires 
      SET 
        id_region = $1,
        nom_base = $2,
        date_crea = $3,
        geom = ST_AsGeoJSON($4)
      WHERE id_base = $5
      RETURNING *;
    `;
    const values = [ id_region, nom_base, date_crea, geom,id_base];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: " Bureau de base non trouvé" });
    }

    res.json({ success: true, partner: result.rows[0] });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du bureau de base", err.stack);
    res.status(500).json({ error: "Erreur lors de la mise à jour du bureau de base" });
  }
});

/**
 * Route : Supprimer un bureau de base
 */
router.delete("/bureaux_base/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM bureaux_base WHERE id_base = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Bureau de base non trouvé" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur lors de la suppression du bureau de base", err.stack);
    res.status(500).json({ error: "Erreur lors de la suppression du bureau de base" });
  }
});


// Configuration du stockage
const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/resources/images/project"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  }
});

const upload1 = multer({ storage: storage1 });

router.post(
  "/projets/add",
  upload1.fields([
    { name: "photo1", maxCount: 1 },
    { name: "photo2", maxCount: 1 },
    { name: "photo3", maxCount: 1 },
    { name: "photo4", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log("Valeurs reçues :", JSON.stringify(req.body, null, 2));

      let {
        id_projet,
        nom_projet,
        sigle_projet,
        date_debut,
        date_fin,
        budget_projet,
        bailleur,
        objectif_global,
        site_intervention,
        statut,
        realisations,
        cible,
      
      } = req.body;

      // Convertir les communes sélectionnées en string
      const communesSelectionnees = Array.isArray(site_intervention) 
        ? site_intervention.join(', ') 
        : site_intervention;


      const photo1 = req.files["photo1"]
        ? `/resources/images/project/${req.files["photo1"][0].filename}`
        : null;
      const photo2 = req.files["photo2"]
        ? `/resources/images/project/${req.files["photo2"][0].filename}`
        : null;
      const photo3 = req.files["photo3"]
        ? `/resources/images/project/${req.files["photo3"][0].filename}`
        : null;
      const photo4 = req.files["photo4"]
        ? `/resources/images/project/${req.files["photo4"][0].filename}`
        : null;



      const values = [
        id_projet,
        nom_projet,
        sigle_projet,
        date_debut,
        date_fin,
        budget_projet,
        bailleur,
        objectif_global,
        communesSelectionnees,,
        statut,
        realisations,
        cible,
        photo1,
        photo2,
        photo3,
        photo4,
      ];

      const query = `
        INSERT INTO projets (
          id_projet,
          nom_projet,
          sigle_projet,
          date_debut,
          date_fin,
          budget_projet,
          bailleur,
          objectif_global,
          site_intervention,
          statut,
          realisations,
          cible,
          photo1,
          photo2,
          photo3,
          photo4,
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16
        )
        ON CONFLICT (id_projet)
        DO UPDATE SET
          nom_projet = EXCLUDED.nom_projet,
          sigle_projet = EXCLUDED.sigle_projet,
          date_debut = EXCLUDED.date_debut,
          date_fin = EXCLUDED.date_fin,
          budget_projet = EXCLUDED.budget_projet,
          bailleur = EXCLUDED.bailleur,
          objectif_global = EXCLUDED.objectif_global,
          site_intervention = EXCLUDED.site_intervention,
          statut = EXCLUDED.statut,
          realisations = EXCLUDED.realisations,
          cible = EXCLUDED.cible,
          photo1 = EXCLUDED.photo1,
          photo2 = EXCLUDED.photo2,
          photo3 = EXCLUDED.photo3,
          photo4 = EXCLUDED.photo4
        RETURNING *;
      `;

      const result = await pool.query(query, values);
      res.json({ success: true, projets: result.rows[0] });
    } catch (err) {
      console.error("Erreur lors de l'ajout du projet", err.stack);
      res.status(500).json({ error: "Erreur lors de l'ajout du projet" });
    }
  }
);



/**
 * Route : Récupérer la liste de tous les projets
 */
router.get("/projets", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_projet,
        nom_projet,
        sigle_projet,
        date_debut,
        date_fin,
        budget_projet,
        bailleur,
        objectif_global,
        site_intervention, 
        statut, 
        realisations, 
        cible,
        photo1,
        photo2,
        photo3,
        photo4  
      FROM projets
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des projets", err.stack);
    res.status(500).json({ error: "Erreur lors de la récupération des projets" });
  }
});


/**
 * Route : Récupérer un projet par son ID
 */
router.get("/projets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id_projet,
        nom_projet,
        sigle_projet,
        date_debut,
        date_fin,
        budget_projet,
        bailleur,
        objectif_global,
        site_intervention, 
        statut, 
        realisations, 
        cible,
        photo1,
        photo2,
        photo3,
        photo4 
      FROM projets
      WHERE id_projet = $1;
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

     const projet = rows[0];
    if (projet.site_intervention) {
      projet.communesSelectionnees = projet.site_intervention.split(', ').filter(Boolean);
    } else {
      projet.communesSelectionnees = [];
    }

    res.json(rows[0]); // Retourne un seul partenaire
  } catch (err) {
    console.error("Erreur lors de la récupération du projet", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


/**
 * Route : Mettre à jour un projet
 */
router.put("/projets/update/:id", upload1.fields([
  { name: "photo1", maxCount: 1 },
  { name: "photo2", maxCount: 1 },
  { name: "photo3", maxCount: 1 },
  { name: "photo4", maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom_projet,
      sigle_projet,
      date_debut,
      date_fin,
      budget_projet,
      bailleur,
      objectif_global,
      site_intervention, 
      statut, 
      realisations, 
      cible
    } = req.body;

    const communesSelectionnees = Array.isArray(site_intervention) 
      ? site_intervention.join(', ') 
      : site_intervention;

    const photo1 = req.files["photo1"]
  ? `/resources/images/project/${req.files["photo1"][0].filename}`
  : undefined;
const photo2 = req.files["photo2"]
  ? `/resources/images/project/${req.files["photo2"][0].filename}`
  : undefined;
const photo3 = req.files["photo3"]
  ? `/resources/images/project/${req.files["photo3"][0].filename}`
  : undefined;
const photo4 = req.files["photo4"]
  ? `/resources/images/project/${req.files["photo4"][0].filename}`
  : undefined;


    const files = req.files;
    
    
    
    // Construction dynamique de la requête SQL
    const fields = [
      { name: "nom_projet", value: nom_projet },
      { name: "sigle_projet", value: sigle_projet },
      { name: "date_debut", value: date_debut },
      { name: "date_fin", value: date_fin },
      { name: "budget_projet", value: budget_projet },
      { name: "bailleur", value: bailleur },
      { name: "objectif_global", value: objectif_global },
      { name: "site_intervention", value: site_intervention },
      { name: "statut", value: statut },
      { name: "realisations", value: realisations },
      { name: "cible", value: cible },
      { name: "photo1", value: photo1 },
      { name: "photo2", value: photo2 },
      { name: "photo3", value: photo3 },
      { name: "photo4", value: photo4 },
    ].filter(field => field.value !== undefined && field.value !== null && field.value !== "");

    const setClauses = fields.map((field, idx) => `${field.name} = $${idx + 1}`);
    const values = fields.map(field => field.value);

    if (fields.length === 0) {
      return res.status(400).json({ error: "Aucune donnée à mettre à jour." });
    }

    const query = `
      UPDATE projets 
      SET ${setClauses.join(", ")}
      WHERE id_projet = $${fields.length + 1}
      RETURNING *;
    `;

    values.push(id); // ID du projet en dernière position

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Projet non trouvé." });
    }

    res.json({ success: true, projet: result.rows[0] });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du projet :", err.stack);
    res.status(500).json({ error: "Erreur lors de la mise à jour du projet." });
  }
});

/**
 * Route : Supprimer un projet
 */
router.delete("/projets/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM projets WHERE id_projet = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur lors de la suppression du projet", err.stack);
    res.status(500).json({ error: "Erreur lors de la suppression du projet" });
  }
});


/**
 * Route : Récupérer la liste de toutes les communes
 */
router.get("/communes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_commune, nom_commune, code_commune 
      FROM communes
      ORDER BY nom_commune
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des communes", err.stack);
    res.status(500).json({ error: "Erreur lors de la récupération des communes" });
  }
});




module.exports = router;
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginSection = document.getElementById("loginSection");
  const adminInterface = document.getElementById("adminInterface");
  const contentArea = document.getElementById("contentArea");
  const btnListRegions = document.getElementById("btnListRegions");
  const btnLogout = document.getElementById("btnLogout");

  // Gestion de la connexion
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/admin/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      loginSection.classList.add("hidden");
      adminInterface.classList.remove("hidden");
      loadRegions(); // Afficher la liste des régions par défaut
    } else {
      alert("Échec de la connexion. Vérifiez vos identifiants.");
    }
  });

  // Bouton pour afficher la liste des régions
  btnListRegions.addEventListener("click", loadRegions);
  const btnListPartners = document.getElementById("btnListPartners");
  const btnListOffices = document.getElementById("btnListOffices");
  const btnListProjects = document.getElementById("btnListProjects");
  const btnListOfficesProjects = document.getElementById("btnListOfficesProjects");

  async function loadRegions() {
    try {
      const response = await fetch("/admin/api/regions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include"
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          window.location.href = '/admin.html?session=expired';
          return;
        }
        throw new Error(error.message || "Erreur serveur");
      }

      const geojsonData = await response.json();

      // Traitez les données GeoJSON ici
      console.log(geojsonData);
      displayRegions(geojsonData);

    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement des régions");
    }
  }

  function displayRegions(regions) {
    let html = `<h2>Régions (Indicateurs socio-économiques)</h2>
    <div class="table-wrapper">
     <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Population Homme</th>
                    <th>Population Femme</th>
                    <th>Densité Population</th>
                    <th>Total Population</th>
                    <th>Taux de pauvreté</th>
                    <th>Prevalence VIH Homme</th>
                    <th>Prevalence VIH Femme</th>
                    <th>Accès à une source améliorée d'eau de boisson </th>
                    <th>Installation de lavage des mains dans les ménages </th>
                    <th>Taux de chômage</th>
                    <th>Inclusion financière</th>
                    <th>Accès aux installations sanitaires améliorées</th>
                    <th>Besoins non satisfaits en matière des femmes de planification familiale</th>
                    <th>Femmes de 15-49 ans utilisant des contraceptifs modernes</th>
                    <th>Homme justifiant la violence conjugale</th>
                    <th>Femme justifiant la violence conjugale</th>

                    <th class="fixed-column">Actions</th>
                  </tr>
                </thead>
                <tbody>`;
    regions.forEach((region) => {
      html += `<tr>
                <td>${region.id_region}</td>
                <td>${region.nom}</td>
                <td>${region.popsex_masc}</td>
                <td>${region.popsex_fem}</td>
                <td>${region.denspop_reg}</td>
                <td>${region.total_pop || ""}</td>
                <td>${region.taux_pvrt}</td>
                <td>${region.prev_vih_hom}</td>
                <td>${region.prev_vih_fem}</td>
                <td>${region.acces_eau_amel}</td>
                <td>${region.inst_lavmain_lim}</td>
                <td>${region.taux_chom}</td>
                <td>${region.incl_fin_emf}</td>
                <td>${region.acces_sanit_amel}</td>
                <td>${region.besoins_nonsatisf_pf}</td>
                <td>${region.fem_utilmethcontracep_mod}</td>
                <td>${region.justif_violconj_hom}</td>
                <td>${region.justif_violconj_fem}</td>

           <td class="fixed-column">
            <button class="editBtn fixed-btn" data-id="${region.id_region
        }"><i class="fas fa-pen-to-square"></i></button>
          </td>
              </tr>`;
    });
    html += `</tbody></table></div>`;
    contentArea.innerHTML = html;

    // Ajout des événements pour les boutons de modification et de suppression
    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", deleteRegion);
    });
    document.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        loadRegionForEdit(id);
      });
    });
  }

  async function deleteRegion(e) {
    const id = e.target.getAttribute("data-id");
    if (confirm("Êtes-vous sûr de vouloir supprimer cette région ?")) {
      const response = await fetch(`/admin/api/regions/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("Région supprimée.");
        loadRegions();
      } else {
        alert("Erreur lors de la suppression de la région.");
      }
    }
  }



  async function loadRegionForEdit(id) {
    const response = await fetch(`/admin/api/regions/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const region = await response.json();
      displayEditRegionForm(region);
    } else {
      alert("Erreur lors du chargement de la région.");
    }
  }

  function displayEditRegionForm(region) {
    let html = `<h2>Modifier la Région</h2>
      <form id="editRegionForm">
        <input type="hidden" name="id_region" value="${region.id_region}">
        <div class="form-group">
          <label for="nom">Nom :</label>
          <input type="text" id="nom" name="nom" value="${region.nom}" required>
        </div>
        <div class="form-group">
          <label for="popsex_masc">Population Homme :</label>
          <input type="number" id="popsex_masc" name="popsex_masc" value="${region.popsex_masc
      }" required>
        </div>
        <div class="form-group">
          <label for="popsex_fem">Population Femme :</label>
          <input type="number" id="popsex_fem" name="popsex_fem" value="${region.popsex_fem
      }" required>
        </div>
        <div class="form-group">
          <label for="denspop_reg">Densité Population :</label>
          <input type="number" id="denspop_reg" name="denspop_reg" value="${region.denspop_reg
      }" required>
        </div>
        <div class="form-group">
          <label for="total_pop">Total Population :</label>
          <input type="number" id="total_pop" name="total_pop" value="${region.total_pop || ""
      }">
        </div>
        <div class="form-group">
          <label for="taux_pvrt">Taux de pauvreté :</label>
          <input type="number" id="taux_pvrt" name="taux_pvrt" value="${region.taux_pvrt
      }" required>
        </div>
        <div class="form-group">
          <label for="prev_vih_hom">Prevalence VIH Homme :</label>
          <input type="number" id="prev_vih_hom" name="prev_vih_hom" value="${region.prev_vih_hom
      }" required>
        </div>
        <div class="form-group">
          <label for="prev_vih_fem">Prevalence VIH Femme :</label>
          <input type="number" id="prev_vih_fem" name="prev_vih_fem" value="${region.prev_vih_fem
      }" required>
        </div>
        <div class="form-group">
          <label for="acces_eau_amel">Accès à une source améliorée d'eau de boisson :</label>
          <input type="number" id="acces_eau_amel" name="acces_eau_amel" value="${region.acces_eau_amel
      }" required>
        </div>
        <div class="form-group">
          <label for="inst_lavmain_lim">Installation de lavage des mains dans les ménages :</label>
          <input type="number" id="inst_lavmain_lim" name="inst_lavmain_lim" value="${region.inst_lavmain_lim
      }" required>
        </div>
        <div class="form-group">
          <label for="taux_chom">Taux de chômage :</label>
          <input type="number" id="taux_chom" name="taux_chom" value="${region.taux_chom
      }" required>
        </div>
        <div class="form-group">
          <label for="incl_fin_emf">Inclusion financière :</label>
          <input type="number" id="incl_fin_emf" name="incl_fin_emf" value="${region.incl_fin_emf
      }" required>
        </div>
         <div class="form-group">
          <label for="acces_sanit_amel">Accès aux installations sanitaires améliorées :</label>
          <input type="number" id="acces_sanit_amel" name="acces_sanit_amel" value="${region.acces_sanit_amel
      }" required>
        </div>
         <div class="form-group">
          <label for="besoins_nonsatisf_pf">Besoins non satisfaits en matière des femmes de planification familiale :</label>
          <input type="number" id="besoins_nonsatisf_pf" name="besoins_nonsatisf_pf" value="${region.besoins_nonsatisf_pf
      }" required>
        </div>
         <div class="form-group">
          <label for="fem_utilmethcontracep_mod">Femmes de 15-49 ans utilisant des contraceptifs modernes :</label>
          <input type="number" id="fem_utilmethcontracep_mod" name="fem_utilmethcontracep_mod" value="${region.fem_utilmethcontracep_mod
      }" required>
        </div>
         <div class="form-group">
          <label for="justif_violconj_hom">Homme justifiant la violence conjugale :</label>
          <input type="number" id="justif_violconj_hom" name="justif_violconj_hom" value="${region.justif_violconj_hom
      }" required>
        </div>
         <div class="form-group">
          <label for="justif_violconj_fem">Femme justifiant la violence conjugale :</label>
          <input type="number" id="justif_violconj_fem" name="justif_violconj_fem" value="${region.justif_violconj_fem
      }" required>
        </div>

        
        <!-- Ajoutez ici d'autres champs à modifier -->
        <button type="submit">Enregistrer les modifications</button>
      </form>`;
    contentArea.innerHTML = html;

    const editRegionForm = document.getElementById("editRegionForm");
    editRegionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(editRegionForm);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      const regionId = data.id_region;

      const response = await fetch(`/admin/api/regions/update/${regionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        alert("Région mise à jour avec succès.");
        loadRegions();
      } else {
        alert("Erreur lors de la mise à jour de la région.");
      }
    });
  }

  btnListPartners.addEventListener("click", loadPartners);


  async function loadPartners() {
    const response = await fetch("/admin/api/care_partner", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const partners = await response.json();
      displayPartners(partners);
    } else {
      alert("Erreur lors du chargement des partenaires.");
    }
  }

  function displayPartners(partners) {
    let html = `
      <h2>Partenaires 
        <button id="btnAddPartner" class="add-btn">
          <i class="fas fa-plus"></i> Ajouter
        </button>
      </h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Sigle</th>
              <th>Activités et services offerts</th>
              <th>Statut de la prestation</th>
              <th>Image logo</th>
              <th>Informations</th>
              <th>Coordonnées (Longitude, Latitude)</th>
              <th class="fixed-column">Actions</th>
            </tr>
          </thead>
          <tbody>`;

    partners.forEach((partner) => {
      html += `<tr>
                <td>${partner.id_partenaire}</td>
                <td>${partner.nom}</td>
                <td>${partner.sigle}</td>
                <td>${partner.act_srvc_offert}</td>
                <td>${partner.statut_prest}</td>
                <td>${partner.img_logo || ""}</td>
                <td>${partner.info}</td>
                <td>${partner.geom
          ? JSON.parse(partner.geom).coordinates.join(", ")
          : "-"
        }</td>
                <td class="fixed-column">
                  <button class="editBtn" data-id="${partner.id_partenaire
        }"><i class="fas fa-pen-to-square"></i></button>
                  <button class="deleteBtn" data-id="${partner.id_partenaire
        }"><i class="fas fa-trash"></i></button>
                </td>
              </tr>`;
    });

    html += `</tbody></table></div>`;
    contentArea.innerHTML = html;

    // Ajouter l'événement après l'injection HTML
    const btnAddPartner = document.getElementById("btnAddPartner");
    if (btnAddPartner) {
      btnAddPartner.addEventListener("click", displayAddPartnerForm);
    }

    document
      .querySelectorAll(".deleteBtn")
      .forEach((btn) => btn.addEventListener("click", deletePartners));
    document.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        loadPartnerForEdit(id);
      });
    });
  }

  async function deletePartners(e) {
    const id = e.target.getAttribute("data-id");
    if (confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      const response = await fetch(`/admin/api/care_partner/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("Partenaire supprimé.");
        loadPartners();
      } else {
        alert("Erreur lors de la suppression du partenaire.");
      }
    }
  }

  function displayAddPartnerForm() {
    let html = `
      <h2>Ajouter un partenaire</h2>
      <form id="addPartnerForm" enctype="multipart/form-data">
      <div class="form-group">
          <label for="id_partenaire">ID_partenaire :</label>
          <input type="number" id="id_partenaire" name="id_partenaire" required>
        </div>
        <div class="form-group">
          <label for="nom">Nom :</label>
          <input type="text" id="nom" name="nom" required>
        </div>
        <div class="form-group">
          <label for="sigle">Sigle :</label>
          <input type="text" id="sigle" name="sigle">
        </div>
        <div class="form-group">
          <label for="act_srvc_offert">Activités et services offerts :</label>
          <textarea type="text" id="act_srvc_offert" name="act_srvc_offert" rows="6"></textarea>
        </div>
        <div class="form-group">
  <label for="is_ssr">Est-ce un SSR/Clinique juridiques/DIC ?</label>
  <select id="is_ssr" name="is_ssr">
    <option value="non" selected>Non</option>
    <option value="oui">Oui</option>
  </select>
</div>

        <div class="form-group">
          <label for="statut_prest">Statut de la prestation :</label>
          <input type="text" id="statut_prest" name="statut_prest">
        </div>
        <div class="form-group">
          <label for="img_logo">Image logo :</label>
          <input type="file" id="img_logo" name="img_logo" accept="image/png, image/jpeg, image/jpg, image/webp">
        </div>
        <div class="form-group">
          <label for="longitude">Longitude :</label>
          <input type="number" id="longitude" name="longitude" step="any">
        </div>
        <div class="form-group">
          <label for="latitude">Latitude :</label>
          <input type="number" id="latitude" name="latitude" step="any">
        </div>
        <div class="form-group">
          <label for="info">Info :</label>
          <input type="text" id="info" name="info">
        </div>
        <button type="submit">Ajouter</button>
      </form>`;

    contentArea.innerHTML = html;

    document.getElementById("is_ssr").addEventListener("change", function () {
      const statutInput = document.getElementById("statut_prest");
      if (this.value === "oui") {
        statutInput.value = "SSR/Clinique juridiques/DIC";
        statutInput.disabled = true;
      } else {
        statutInput.value = "";
        statutInput.disabled = false;
      }
    });


    const addPartnerForm = document.getElementById("addPartnerForm");
    addPartnerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(addPartnerForm);

      const response = await fetch("/admin/api/care_partner/add", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Partenaire ajouté avec succès.");
        loadPartners();
      } else {
        alert("Erreur lors de l'ajout du partenaire.");
      }
    });
  }

  async function loadPartnerForEdit(id) {
    const response = await fetch(`/admin/api/care_partner/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const partner = await response.json();
      displayEditPartnerForm(partner);
    } else {
      alert("Erreur lors du chargement du partenaire.");
    }
  }

  function displayEditPartnerForm(partner) {
    const longitude = partner.longitude || ""; // Gérer les valeurs null/undefined
    const latitude = partner.latitude || "";

    let html = `<h2>Modifier le partenaire</h2>
      <form id="editPartnerForm" enctype="multipart/form-data">
        <input type="hidden" name="id_partenaire" value="${partner.id_partenaire}">

        <div class="form-group">
          <label for="nom">Nom :</label>
          <input type="text" id="nom" name="nom" value="${partner.nom}" required>
        </div>

        <div class="form-group">
          <label for="sigle">Sigle :</label>
          <input type="text" id="sigle" name="sigle" value="${partner.sigle}" required>
        </div>

        <div class="form-group">
          <label for="act_srvc_offert">Activité et services offerts :</label>
          <textarea id="act_srvc_offert" name="act_srvc_offert" rows="6" required>${partner.act_srvc_offert}</textarea>
        </div>
        <div class="form-group">
  <label for="is_ssr">Est-ce un SSR/Clinique juridiques/DIC ?</label>
  <select id="is_ssr" name="is_ssr">
    <option value="non">Non</option>
    <option value="oui">Oui</option>
  </select>
</div>


        <div class="form-group">
          <label for="statut_prest">Statut de la prestation :</label>
          <input type="text" id="statut_prest" name="statut_prest" value="${partner.statut_prest}" required>
        </div>

        <div class="form-group">
          <label for="img_logo">Image logo :</label>
          <input type="file" id="img_logo" name="img_logo" accept="image/png, image/jpeg, image/jpg, image/webp">
        </div>

        <div class="form-group">
          <label for="info">Info :</label>
          <input type="text" id="info" name="info" value="${partner.info}" required>
        </div>

        <div class="form-group">
          <label for="longitude">Longitude :</label>
          <input type="number" id="longitude" name="longitude" value="${longitude}" step="any" required>
        </div>

        <div class="form-group">
          <label for="latitude">Latitude :</label>
          <input type="number" id="latitude" name="latitude" value="${latitude}" step="any" required>
        </div>

        <button type="submit">Enregistrer les modifications</button>
      </form>`;

    contentArea.innerHTML = html;

    const isSSRSelect = document.getElementById("is_ssr");
    const statutInput = document.getElementById("statut_prest");

    if (partner.statut_prest === "SSR/Clinique juridiques/DIC") {
      isSSRSelect.value = "oui";
      statutInput.disabled = true;
    } else {
      isSSRSelect.value = "non";
    }

    isSSRSelect.addEventListener("change", function () {
      if (this.value === "oui") {
        statutInput.value = "SSR/Clinique juridiques/DIC";
        statutInput.disabled = true;
      } else {
        statutInput.value = "";
        statutInput.disabled = false;
      }
    });


    const editPartnerForm = document.getElementById("editPartnerForm");
    editPartnerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(editPartnerForm);
      const partnerId = formData.get("id_partenaire");

      const response = await fetch(`/admin/api/care_partner/update/${partnerId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        alert("Partenaire mis à jour avec succès.");
        loadPartners();
      } else {
        alert("Erreur lors de la mise à jour du partenaire.");
      }
    });
  }


  btnListOffices.addEventListener("click", loadOffices);


  async function loadOffices() {
    const response = await fetch("/admin/api/bureaux_base", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const offices = await response.json();
      displayOffices(offices);
    } else {
      alert("Erreur lors du chargement des bureaux de base.");
    }
  }


  function displayOffices(offices) {
    let html = `
      <h2>Bureaux de base 
        <button id="btnAddOffice" class="add-btn">
          <i class="fas fa-plus"></i> Ajouter
        </button>
      </h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Id_base</th>
              <th>Id_region</th>
              <th>Nom Base</th>
              <th>Date de création</th>
              <th>Coordonnées (Longitude, Latitude)</th>
              <th class="fixed-column">Actions</th>
            </tr>
          </thead>
          <tbody>`;

    offices.forEach((office) => {
      html += `<tr>
                <td>${office.id_base}</td>
                <td>${office.id_region}</td>
                <td>${office.nom_base}</td>
                <td>${office.date_crea}</td>     
                <td>${office.geom
          ? JSON.parse(office.geom).coordinates.join(", ")
          : "-"
        }</td>
                <td class="fixed-column">
                  <button class="editBtn" data-id="${office.id_base
        }"><i class="fas fa-pen-to-square"></i></button>
                  <button class="deleteBtn" data-id="${office.id_base
        }"><i class="fas fa-trash"></i></button>
                </td>
              </tr>`;
    });

    html += `</tbody></table></div>`;
    contentArea.innerHTML = html;

    // Ajouter l'événement après l'injection HTML
    const btnAddOffice = document.getElementById("btnAddOffice");
    if (btnAddOffice) {
      btnAddOffice.addEventListener("click", displayAddOfficeForm);
    }

    document
      .querySelectorAll(".deleteBtn")
      .forEach((btn) => btn.addEventListener("click", deleteOffices));
    document.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        loadOfficeForEdit(id);
      });
    });
  }

  async function deleteOffices(e) {
    const id = e.target.getAttribute("data-id");
    if (confirm("Êtes-vous sûr de vouloir supprimer ce bureaux de base ?")) {
      const response = await fetch(`/admin/api/bureaux_base/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("Bureaux de base supprimé.");
        loadPartners();
      } else {
        alert("Erreur lors de la suppression du bureaux de base.");
      }
    }
  }

  function displayAddOfficeForm() {
    let html = `
      <h2>Ajouter un bureaux de base</h2>
      <form id="addOfficeForm" enctype="multipart/form-data">
      <div class="form-group">
          <label for="id_base">ID_bureau :</label>
          <input type="number" id="id_base" name="id_base" required>
        </div>
        <div class="form-group">
          <label for="id_region">ID_region :</label>
          <input type="text" id="id_region" name="id_region" required>
        </div>
        <div class="form-group">
          <label for="nom_base">Nom base :</label>
          <input type="text" id="nom_base" name="nom_base">
        </div>
        <div class="form-group">
          <label for="date_crea">Date de creation :</label>
          <input type="text" id="date_crea" name="date_crea">
        </div>
        <div class="form-group">
          <label for="longitude">Longitude :</label>
          <input type="number" id="longitude" name="longitude" step="any">
        </div>
        <div class="form-group">
          <label for="latitude">Latitude :</label>
          <input type="number" id="latitude" name="latitude" step="any">
        </div>
        <button type="submit">Ajouter</button>
      </form>`;

    contentArea.innerHTML = html;

    const addOfficeForm = document.getElementById("addOfficeForm");
    addOfficeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(addOfficeForm);

      const response = await fetch("/admin/api/bureaux_base/add", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Bureau de base ajouté avec succès.");
        loadPartners();
      } else {
        alert("Erreur lors de l'ajout du bureau de base.");
      }
    });
  }

  async function loadOfficeForEdit(id) {
    const response = await fetch(`/admin/api/bureaux_base/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const offices = await response.json();
      displayEditOfficeForm(offices);
    } else {
      alert("Erreur lors du chargement du bureau de base.");
    }
  }

  function displayEditOfficeForm(office) {
    const longitude = office.longitude || ""; // Gérer les valeurs null/undefined
    const latitude = office.latitude || "";

    let html = `<h2>Modifier le bureau de base</h2>
      <form id="editPartnerForm" enctype="multipart/form-data">
        <input type="hidden" name="id_base" value="${office.id_base}">

        <div class="form-group">
          <label for="id_region">ID_region :</label>
          <input type="text" id="id_region" name="id_region" value="${office.id_region}" required>
        </div>

        <div class="form-group">
          <label for="nom_base">Nom base :</label>
          <input type="text" id="nom_base" name="nom_base" value="${office.nom_base}" required>
        </div>

        <div class="form-group">
          <label for="date_crea">Date de création :</label>
          <input type="text" id="date_crea" name="date_crea" required>${office.date_crea}</input>
        </div>


        <div class="form-group">
          <label for="longitude">Longitude :</label>
          <input type="number" id="longitude" name="longitude" value="${longitude}" step="any" required>
        </div>

        <div class="form-group">
          <label for="latitude">Latitude :</label>
          <input type="number" id="latitude" name="latitude" value="${latitude}" step="any" required>
        </div>

        <button type="submit">Enregistrer les modifications</button>
      </form>`;

    contentArea.innerHTML = html;

    const editOfficeForm = document.getElementById("editOfficeForm");
    editOfficeForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(editOfficeForm);
      const officeId = formData.get("id_base");

      const response = await fetch(`/admin/api/bureaux_base/update/${officeId}`, {
        method: "PUT",
        body: formData,  // Envoi correct du fichier et des autres données
      });

      if (response.ok) {
        alert("Partenaire mis à jour avec succès.");
        loadPartners();
      } else {
        alert("Erreur lors de la mise à jour du partenaire.");
      }
    });
  }


  btnListProjects.addEventListener("click", loadProjects);


  async function loadProjects() {
    const response = await fetch("/admin/api/projets", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const projects = await response.json();
      displayProjects(projects);
    } else {
      alert("Erreur lors du chargement des projets.");
    }
  }

  async function loadCommunes() {
    const response = await fetch("/admin/api/communes", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Erreur lors du chargement des communes.");
      return [];
    }
  }


function displayProjects(projects) {
    console.log("Data received by displayProjects:", projects); // <-- Add this line
    let html = `
      <h2>Projets
        <button id="btnAddProject" class="add-btn">
          <i class="fas fa-plus"></i> Ajouter
        </button>
      </h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Id_projet</th>
              <th>Nom projet</th>
              <th>Sigle projet</th>
              <th>Date debut</th>
              <th>Date fin</th>
              <th>Budget projet</th>
              <th>Bailleur</th>
              <th>Objectif global</th>
              <th>Site d'intervention</th>
              <th>Statut</th>
              <th>Réalisations</th>
              <th>Cible</th>
              <th>Photo1</th>
              <th>Photo2</th>
              <th>Photo3</th>
              <th>Photo4</th>
              <th class="fixed-row">Actions</th>
            </tr>
          </thead>
          <tbody>`;

    projects.forEach((project) => {
      html += `<tr>
              <td>${project.id_projet}</td>
              <td>${project.nom_projet}</td>
              <td>${project.sigle_projet}</td>
              <td>${project.date_debut}</td>
              <td>${project.date_fin}</td>
              <td>${project.budget_projet}</td>
              <td>${project.bailleur}</td>
              <td>${project.objectif_global}</td>
              <td>${project.site_intervention_noms ? project.site_intervention_noms.join(', ') : ''}</td>
              <td>${project.statut}</td>
              <td>${project.realisations}</td>
              <td>${project.cible}</td>
              <td>${project.photo1 || ''}</td>
              <td>${project.photo2 || ''}</td>
              <td>${project.photo3 || ''}</td>
              <td>${project.photo4 || ''}</td>
              <td class="fixed-column">
                <button class="editBtn" data-id="${project.id_projet
        }"><i class="fas fa-pen-to-square"></i></button>
                <button class="deleteBtn" data-id="${project.id_projet
        }"><i class="fas fa-trash"></i></button>
              </td>
            </tr>`;
    });
    html += `</tbody></table></div>`;
    contentArea.innerHTML = html;
    // Ajouter l'événement après l'injection HTML
    const btnAddProject = document.getElementById("btnAddProject");
    if (btnAddProject) {
      btnAddProject.addEventListener("click", displayAddProjectForm);
    }

    document
      .querySelectorAll(".deleteBtn")
      .forEach((btn) => btn.addEventListener("click", deleteProjects));
    document.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        loadProjectForEdit(id);
      });
    });
  }

  async function deleteProjects(e) {
    const id = e.target.getAttribute("data-id");
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      const response = await fetch(`/admin/api/projets/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("Projet supprimé.");
        loadPartners();
      } else {
        alert("Erreur lors de la suppression du projet.");
      }
    }
  }

  async function displayAddProjectForm() {

    // Charger les communes
    const communes = await loadCommunes();
    let html = `
      <h2>Ajouter un projet</h2>
      <form id="addProjectForm" enctype="multipart/form-data">
      <div class="form-group">
          <label for="id_projet">ID_projet :</label>
          <input type="number" id="id_projet" name="id_projet" required>
        </div>
        <div class="form-group">
          <label for="nom_projet">Nom projet :</label>
          <textarea  id="nom_projet" name="nom_projet" rows="3"  required></textarea>
        </div>
        <div class="form-group">
          <label for="sigle_projet">Sigle projet :</label>
          <input type="text" id="sigle_projet" name="sigle_projet">
        </div>
        <div class="form-group">
          <label for="date_debut">Date de debut :</label>
          <input type="text" id="date_debut" name="date_debut">
        </div>
        <div class="form-group">
          <label for="date_fin">Date de fin :</label>
          <input type="text" id="date_fin" name="date_fin" step="any">
        </div>
        <div class="form-group">
          <label for="budget_projet">Budget :</label>
          <input type="text" id="budget_projet" name="budget_projet" step="any">
        </div>
        <div class="form-group">
          <label for="bailleur">Bailleur :</label>
          <input type="text" id="bailleur" name="bailleur" step="any">
        </div>
        <div class="form-group">
          <label for="objectif_global">Objectif global :</label>
          <textarea  id="objectif_global" name="objectif_global" rows="5"  required></textarea>
        </div>
<div class="form-group" style="height: 200px;">
        <label for="site_intervention">Site d'intervention :</label>
        <select id="site_intervention" name="site_intervention" multiple required>
          ${communes.map(commune =>
      `<option value="${commune.id_commune}">${commune.nom_commune}</option>` // Use id_commune as value
    ).join('')}
        </select>

      </div>
<div class="form-group">
    <label for="statut">Statut du projet:</label>
    <select id="statut" name="statut" required>
        <option value="En cours">En cours</option>
        <option value="Cloturé">Clôturé</option>
    </select>
</div>
        <div class="form-group">
          <label for="realisations">Realisation :</label>
          <textarea id="realisations" name="realisations" rows="6"  required></textarea>
        </div>
        <div class="form-group">
          <label for="cible">Cible :</label>
          <textarea id="cible" name="cible" rows="3"  required></textarea>
        </div>
        <div class="form-group">
          <label for="photo1">Photo 1 :</label>
          <input type="file" id="photo1" name="photo1" accept="image/png, image/jpeg, image/jpg, image/webp">
        </div>
        <div class="form-group">
          <label for="photo2">Photo 2 :</label>
          <input type="file" id="photo2" name="photo2" accept="image/png, image/jpeg, image/jpg, image/webp">
        </div>
        <div class="form-group">
          <label for="photo3">Photo 3 :</label>
          <input type="file" id="photo3" name="photo3" accept="image/png, image/jpeg, image/jpg, image/webp">
        </div>
        <div class="form-group">
          <label for="photo4">Photo 4 :</label>
          <input type="file" id="photo4" name="photo4" accept="image/png, image/jpeg, image/jpg, image/webp">
        </div>
        <button type="submit">Ajouter</button>
      </form>`;

    contentArea.innerHTML = html;

    // Initialiser le select multiple avec un plugin si nécessaire (ex: Select2)
    $('#site_intervention').select2({
      placeholder: "Sélectionnez une ou plusieurs communes",
      allowClear: true
    });

    const addProjectForm = document.getElementById("addProjectForm");
    addProjectForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(addProjectForm);

      // Get selected commune IDs from the select2 input
      const selectedCommuneIds = $('#site_intervention').val();
      if (selectedCommuneIds) {
        // Append the array of IDs to formData
        selectedCommuneIds.forEach(id => formData.append('site_intervention', id));
      } else {
        // Ensure site_intervention is present even if empty
        formData.append('site_intervention', '');
      }

      const response = await fetch("/admin/api/projets/add", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Projet ajouté avec succès.");
        loadProjects();
      } else {
        alert("Erreur lors de l'ajout du projet.");
      }
    });
  }

  async function loadProjectForEdit(id) {
    const response = await fetch(`/admin/api/projets/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const projects = await response.json();
      displayEditProjectForm(projects);
    } else {
      alert("Erreur lors du chargement du projet.");
    }
  }

  async function displayEditProjectForm(project) {

    const communes = await loadCommunes();

    // Convertir les sites d'intervention existants en tableau
    const selectedSiteIds = project.site_intervention_ids || [];


    let html = `<h2>Modifier le projet</h2>
      <form id="editProjectForm" enctype="multipart/form-data">
        <input type="hidden" name="id_projet" value="${project.id_projet}">

        <div class="form-group">
          <label for="nom_projet">Nom projet :</label>
          <textarea id="nom_projet" name="nom_projet" rows="3" required>${project.nom_projet}</textarea>
        </div>

        <div class="form-group">
          <label for="sigle_projet">Sigle :</label>
          <input type="text" id="sigle_projet" name="sigle_projet" value="${project.sigle_projet}" required>
        </div>

        <div class="form-group">
          <label for="date_debut">Date de début :</label>
          <input type="text" id="date_debut" name="date_debut" value="${project.date_debut}"/>
        </div>

        <div class="form-group">
          <label for="date_fin">Date de fin :</label>
          <input type="text" id="date_fin" name="date_fin" value="${project.date_fin}"/>
        </div>
        <div class="form-group">
          <label for="budget_projet">Budget :</label>
          <input type="text" id="budget_projet" name="budget_projet" value="${project.budget_projet}"/>
        </div>
        <div class="form-group">
          <label for="bailleur">Bailleur :</label>
          <input type="text" id="bailleur" name="bailleur" value="${project.bailleur}"/>
        </div>
        <div class="form-group">
          <label for="objectif_global">Objectif global :</label>
          <textarea id="objectif_global" name="objectif_global"  rows="4" required>${project.objectif_global}</textarea>
        </div>
      <div class="form-group">
        <label for="site_intervention">Site d'intervention :</label>
        <select id="site_intervention" name="site_intervention" multiple required>
          ${communes.map(commune =>
      `<option value="${commune.id_commune}"
             ${selectedSiteIds.includes(commune.id_commune) ? 'selected' : ''}>
             ${commune.nom_commune}
            </option>`
    ).join('')}
        </select>
      </div>
      <div class="form-group">
            <label for="statut">Statut :</label>
            <select id="statut" name="statut" required>
                <option value="En cours" ${project.statut === 'En cours' ? 'selected' : ''}>En cours</option>
                <option value="Cloturé" ${project.statut === 'Cloturé' ? 'selected' : ''}>Clôturé</option>
            </select>
        </div>
        <div class="form-group">
          <label for="realisations">Réalisations :</label>
          <textarea id="realisations" name="realisations" rows="6" >${project.realisations}</textarea>
        </div>
        <div class="form-group">
          <label for="cible">Cible :</label>
          <textarea id="cible" name="cible" rows="4" >${project.cible}</textarea>
        </div>
        <div class="form-group">
          <label for="photo1">Photo 1 :</label>
          <input type="file" id="photo1" name="photo1" accept="image/png, image/jpeg, image/jpg, image/webp"/>
            ${project.photo1 ? `<p>Current: <a href="${project.photo1}" target="_blank">View Photo 1</a></p><input type="hidden" name="photo1" value="${project.photo1}"/>` : ''}
        </div>
        <div class="form-group">
          <label for="photo2">Photo 2 :</label>
          <input type="file" id="photo2" name="photo2" accept="image/png, image/jpeg, image/jpg, image/webp"/>
            ${project.photo2 ? `<p>Current: <a href="${project.photo2}" target="_blank">View Photo 2</a></p><input type="hidden" name="photo2" value="${project.photo2}"/>` : ''}
        </div>
        <div class="form-group">
          <label for="photo3">Photo 3 :</label>
          <input type="file" id="photo3" name="photo3" accept="image/png, image/jpeg, image/jpg, image/webp"/>
            ${project.photo3 ? `<p>Current: <a href="${project.photo3}" target="_blank">View Photo 3</a></p><input type="hidden" name="photo3" value="${project.photo3}"/>` : ''}
        </div>
        <div class="form-group">
          <label for="photo4">Photo 4 :</label>
          <input type="file" id="photo4" name="photo4" accept="image/png, image/jpeg, image/jpg, image/webp"/>
            ${project.photo4 ? `<p>Current: <a href="${project.photo4}" target="_blank">View Photo 4</a></p><input type="hidden" name="photo4" value="${project.photo4}"/>` : ''}
        </div>

        <button type="submit">Enregistrer les modifications</button>
      </form>`;

    contentArea.innerHTML = html;

    // Initialize select2 with pre-selected values
    $(document).ready(function () {
      $('#site_intervention').select2({
        placeholder: "Sélectionnez une ou plusieurs communes",
        allowClear: true
      }).val(selectedSiteIds).trigger('change'); // Set selected values and trigger change
    });

    // Modifiez la partie submit handler :
    editProjectForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(editProjectForm);

      // Get selected commune IDs from the select2 input
      const selectedCommuneIds = $('#site_intervention').val();
      // Remove any existing 'site_intervention' entries from formData to avoid duplicates if select2 adds them
      formData.delete('site_intervention');
      if (selectedCommuneIds) {
          // Append each selected ID as a separate entry to formData
          selectedCommuneIds.forEach(id => formData.append('site_intervention', id));
      } else {
          // Ensure site_intervention is present even if empty, to signal deselecting all
          formData.append('site_intervention', '');
      }

      // Important: Add current photo paths as hidden inputs if no new file is uploaded
      // (This is already done in the HTML above by conditionally adding hidden inputs)
      // Check if file input is empty, and if so, send the existing path from the 'value' attribute
      // The backend needs to handle this as well (which it does with `req.body.photoX`)

      try {
        const response = await fetch(`/admin/api/projets/update/${formData.get("id_projet")}`, {
          method: "PUT",
          body: formData,
          headers: {
            // No 'Content-Type' header when sending FormData, as browser sets it correctly
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Si vous utilisez JWT
          }
        });

        if (response.ok) {
          const result = await response.json();
          alert("Projet mis à jour avec succès.");
          loadProjects();
        } else if (response.status === 401) {
          // Redirection vers le login si non autorisé
          window.location.href = '/admin.html';
        } else {
          const error = await response.json();
          alert(`Erreur: ${error.error || "Une erreur est survenue"}`);
        }
      } catch (err) {
        console.error("Erreur:", err);
        alert("Erreur réseau ou serveur");
      }
    });
  }


  // Gestion de la déconnexion
  btnLogout.addEventListener("click", async () => {
    const response = await fetch("/admin/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      location.reload();
    } else {
      alert("Erreur lors de la déconnexion.");
    }
  });
});

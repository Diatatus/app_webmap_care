document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginSection = document.getElementById("loginSection");
  const adminInterface = document.getElementById("adminInterface");
  const contentArea = document.getElementById("contentArea");
  const btnListRegions = document.getElementById("btnListRegions");
  const btnAddRegion = document.getElementById("btnAddRegion");
  const btnLogout = document.getElementById("btnLogout");

  // Gestion de la connexion
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/admin/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
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

  async function loadRegions() {
    const response = await fetch("/admin/api/regions", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (response.ok) {
      const regions = await response.json();
      displayRegions(regions);
    } else {
      alert("Erreur lors du chargement des régions.");
    }
  }

  function displayRegions(regions) {
    let html = `<h2>Régions</h2>
    <div class="table-wrapper">
     <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Population Homme</th>
                    <th>PopuLation Femme</th>
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

                    <th class="fixed-row">Actions</th>
                  </tr>
                </thead>
                <tbody>`;
    regions.forEach(region => {
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
            <button class="editBtn" data-id="${region.id_region}"><i class="fas fa-pen-to-square"></i></button>
            <button class="deleteBtn" data-id="${region.id_region}"><i class="fas fa-trash"></i></button>
          </td>
              </tr>`;
    });
    html += `</tbody></table></div>`;
    contentArea.innerHTML = html;

    // Ajout des événements pour les boutons de modification et de suppression
    document.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", deleteRegion);
    });
    document.querySelectorAll(".editBtn").forEach(btn => {
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
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        alert("Région supprimée.");
        loadRegions();
      } else {
        alert("Erreur lors de la suppression de la région.");
      }
    }
  }

  // Bouton pour afficher le formulaire d'ajout de région
  btnAddRegion.addEventListener("click", displayAddRegionForm);
  btnListPartners.addEventListener("click", loadPartners);
  btnListOffices.addEventListener("click", loadOffices);
  btnListProjects.addEventListener("click", loadProjects);

  function displayAddRegionForm() {
    let html = `<h2>Ajouter une Région</h2>
      <form id="addRegionForm">
        <div class="form-group">
          <label for="nom">Nom :</label>
          <input type="text" id="nom" name="nom" required>
        </div>
        <div class="form-group">
          <label for="total_pop">Total Population :</label>
          <input type="number" id="total_pop" name="total_pop">
        </div>
        <!-- Ajoutez ici d'autres champs nécessaires -->
        <button type="submit">Ajouter</button>
      </form>`;
    contentArea.innerHTML = html;

    const addRegionForm = document.getElementById("addRegionForm");
    addRegionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(addRegionForm);
      const data = {};
      formData.forEach((value, key) => { data[key] = value; });

      const response = await fetch("/admin/api/regions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        alert("Région ajoutée avec succès.");
        loadRegions();
      } else {
        alert("Erreur lors de l'ajout de la région.");
      }
    });
  }

  async function loadRegionForEdit(id) {
    const response = await fetch(`/admin/api/regions/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
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
          <input type="number" id="popsex_masc" name="popsex_masc" value="${region.popsex_masc}" required>
        </div>
        <div class="form-group">
          <label for="popsex_fem">Population Femme :</label>
          <input type="number" id="popsex_fem" name="popsex_fem" value="${region.popsex_fem}" required>
        </div>
        <div class="form-group">
          <label for="denspop_reg">Densité Population :</label>
          <input type="number" id="denspop_reg" name="denspop_reg" value="${region.denspop_reg}" required>
        </div>
        <div class="form-group">
          <label for="total_pop">Total Population :</label>
          <input type="number" id="total_pop" name="total_pop" value="${region.total_pop || ''}">
        </div>
        <div class="form-group">
          <label for="taux_pvrt">Taux de pauvreté :</label>
          <input type="number" id="taux_pvrt" name="taux_pvrt" value="${region.taux_pvrt}" required>
        </div>
        <div class="form-group">
          <label for="prev_vih_hom">Prevalence VIH Homme :</label>
          <input type="number" id="prev_vih_hom" name="prev_vih_hom" value="${region.prev_vih_hom}" required>
        </div>
        <div class="form-group">
          <label for="prev_vih_fem">Prevalence VIH Femme :</label>
          <input type="number" id="prev_vih_fem" name="prev_vih_fem" value="${region.prev_vih_fem}" required>
        </div>
        <div class="form-group">
          <label for="acces_eau_amel">Accès à une source améliorée d'eau de boisson :</label>
          <input type="number" id="acces_eau_amel" name="acces_eau_amel" value="${region.acces_eau_amel}" required>
        </div>
        <div class="form-group">
          <label for="inst_lavmain_lim">Installation de lavage des mains dans les ménages :</label>
          <input type="number" id="inst_lavmain_lim" name="inst_lavmain_lim" value="${region.inst_lavmain_lim}" required>
        </div>
        <div class="form-group">
          <label for="taux_chom">Taux de chômage :</label>
          <input type="number" id="taux_chom" name="taux_chom" value="${region.taux_chom}" required>
        </div>
        <div class="form-group">
          <label for="incl_fin_emf">Inclusion financière :</label>
          <input type="number" id="incl_fin_emf" name="incl_fin_emf" value="${region.incl_fin_emf}" required>
        </div>
         <div class="form-group">
          <label for="acces_sanit_amel">Accès aux installations sanitaires améliorées :</label>
          <input type="number" id="acces_sanit_amel" name="acces_sanit_amel" value="${region.acces_sanit_amel}" required>
        </div>
         <div class="form-group">
          <label for="besoins_nonsatisf_pf">Besoins non satisfaits en matière des femmes de planification familiale :</label>
          <input type="number" id="besoins_nonsatisf_pf" name="besoins_nonsatisf_pf" value="${region.besoins_nonsatisf_pf}" required>
        </div>
         <div class="form-group">
          <label for="fem_utilmethcontracep_mod">Femmes de 15-49 ans utilisant des contraceptifs modernes :</label>
          <input type="number" id="fem_utilmethcontracep_mod" name="fem_utilmethcontracep_mod" value="${region.fem_utilmethcontracep_mod}" required>
        </div>
         <div class="form-group">
          <label for="justif_violconj_hom">Homme justifiant la violence conjugale :</label>
          <input type="number" id="justif_violconj_hom" name="justif_violconj_hom" value="${region.justif_violconj_hom}" required>
        </div>
         <div class="form-group">
          <label for="justif_violconj_fem">Femme justifiant la violence conjugale :</label>
          <input type="number" id="justif_violconj_fem" name="justif_violconj_fem" value="${region.justif_violconj_fem}" required>
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
      formData.forEach((value, key) => { data[key] = value; });
      const regionId = data.id_region;

      const response = await fetch(`/admin/api/regions/update/${regionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        alert("Région mise à jour avec succès.");
        loadRegions();
      } else {
        alert("Erreur lors de la mise à jour de la région.");
      }
    });
  }

  // Gestion de la déconnexion
  btnLogout.addEventListener("click", async () => {
    const response = await fetch("/admin/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (response.ok) {
      location.reload();
    } else {
      alert("Erreur lors de la déconnexion.");
    }
  });
});

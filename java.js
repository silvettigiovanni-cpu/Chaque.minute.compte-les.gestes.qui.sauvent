// java.js

// On attend que tout le HTML soit chargé avant d’exécuter le script
document.addEventListener("DOMContentLoaded", () => {

  // =========================================================
  // OUTIL GÉNÉRIQUE : CRÉER ET OUVRIR UNE POPUP
  // =========================================================
  function openPopup(html, extraClass = "") {

    // Création du conteneur principal (fond sombre)
    const popup = document.createElement("div");

    // On lui applique la classe "popup" + éventuellement une classe supplémentaire
    popup.className = `popup ${extraClass}`.trim();

    // On insère le contenu HTML de la popup
    popup.innerHTML = `
      <div class="popup-contenu">
        <button class="fermer" type="button" aria-label="Fermer">&times;</button>
        ${html}
      </div>
    `;

    // On ajoute la popup dans le body (elle devient visible)
    document.body.appendChild(popup);

    // -------------------------
    // Fonction pour fermer
    // -------------------------
    const close = () => {
      // Sécurité : on vérifie que la popup existe encore
      if (popup && popup.parentNode) {
        popup.parentNode.removeChild(popup); // Supprime la popup du DOM
      }

      // On retire l’écoute de la touche clavier
      document.removeEventListener("keydown", onKey);
    };

    // Fermeture si on appuie sur Échap
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };

    // Bouton X (fermer)
    const btnClose = popup.querySelector(".fermer");
    if (btnClose) btnClose.addEventListener("click", close);

    // Fermeture si clic en dehors du contenu (sur le fond sombre)
    popup.addEventListener("click", (e) => {
      if (e.target === popup) close();
    });

    // Activation écoute clavier
    document.addEventListener("keydown", onKey);

    return popup; // On retourne la popup (utile pour manipuler son contenu)
  }


  // =========================================================
  // 1) OUVRIR LES ÉTAPES (CARTES AVEC data-detail)
  // =========================================================

  // On sélectionne toutes les cartes ayant l’attribut data-detail
  document.querySelectorAll(".etape[data-detail]").forEach((etape) => {

    etape.style.cursor = "pointer"; // Curseur main

    etape.addEventListener("click", (e) => {
      e.preventDefault(); // Empêche comportement par défaut

      const tplId = etape.getAttribute("data-detail"); // ID du template associé
      const tpl = document.getElementById(tplId);      // On récupère le template HTML caché

      if (!tpl) {
        console.warn("Template introuvable :", tplId);
        return;
      }

      // Récupération du numéro de l’étape (si présent)
      const num = etape.querySelector(".numero-etape")?.textContent?.trim() || "";

      // Récupération du titre
      const titre =
        etape.querySelector("h4")?.textContent?.trim() ||
        etape.querySelector("h3")?.textContent?.trim() ||
        etape.textContent.trim();

      // Construction du contenu popup
      const html = `
        <div class="etape-detail-header">
          ${num ? `<div class="numero-etape-large">${num}</div>` : ""}
          <h2>${titre}</h2>
        </div>
        ${tpl.innerHTML}
      `;

      // Ouverture popup
      openPopup(html, "sous-popup popup-etape");
    });
  });


  // =========================================================
  // 2) CARTES DE L’ACCUEIL
  // =========================================================

  const cartes = document.querySelectorAll(".grille-cartes a.carte");

  cartes.forEach((carte) => {

    carte.addEventListener("click", (e) => {

      const titreEl = carte.querySelector("h2, h3");
      const titre = titreEl ? titreEl.textContent.trim() : "";
      if (!titre) return;

      // On laisse navigation normale pour cette carte spécifique
      if (titre === "Les 4 étapes pour porter secours") return;

      const contenu = getContenuCarte(titre);

      // Si pas de contenu ou en cours de rédaction → navigation normale
      if (!contenu || contenu.includes("en cours de rédaction")) return;

      e.preventDefault(); // Bloque navigation

      openPopup(`
        <h2 style="text-align:center; margin-bottom:14px;">${titre}</h2>
        ${contenu}
      `);
    });
  });


  // =========================
// 3) SMARTPHONE SOS (TOUTES PAGES) + DRAG
// =========================
const btnEmergency = document.getElementById("open-emergency");

if (btnEmergency) {

  // --- A) On force une position en left/top (sinon top:50% + transform gêne le drag) ---
  const applySavedOrCurrentPos = () => {
    const saved = localStorage.getItem("sosPos");

    // Si on a déjà une position sauvegardée, on l'applique
    if (saved) {
      const { left, top } = JSON.parse(saved);
      btnEmergency.style.left = left;
      btnEmergency.style.top = top;
      btnEmergency.style.right = "auto";
      btnEmergency.style.transform = "none";
      return;
    }

    // Sinon on convertit la position actuelle (calculée à l'écran) en left/top
    const r = btnEmergency.getBoundingClientRect();
    btnEmergency.style.left = `${r.left}px`;
    btnEmergency.style.top = `${r.top}px`;
    btnEmergency.style.right = "auto";
    btnEmergency.style.transform = "none";
  };

  applySavedOrCurrentPos();

  // --- B) Variables drag ---
  let dragging = false;
  let moved = false;

  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  const THRESHOLD = 5; // seuil : éviter d’ouvrir la popup si micro-mouvement

  // --- C) Début drag ---
  btnEmergency.addEventListener("pointerdown", (e) => {
    dragging = true;
    moved = false;

    // capture : on continue de recevoir les events même si le doigt sort du bouton
    btnEmergency.setPointerCapture(e.pointerId);

    // positions de départ
    startX = e.clientX;
    startY = e.clientY;

    const r = btnEmergency.getBoundingClientRect();
    startLeft = r.left;
    startTop = r.top;
  });

  // --- D) Mouvement drag ---
  btnEmergency.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // dès qu'on dépasse le seuil, c'est un vrai déplacement
    if (!moved && (Math.abs(dx) > THRESHOLD || Math.abs(dy) > THRESHOLD)) {
      moved = true;
    }

    // tant qu'on n'a pas dépassé le seuil, on ne déplace pas
    if (!moved) return;

    // IMPORTANT : empêcher le scroll sur mobile pendant le drag
    e.preventDefault();

    let newLeft = startLeft + dx;
    let newTop = startTop + dy;

    // limites écran
    const maxLeft = window.innerWidth - btnEmergency.offsetWidth;
    const maxTop = window.innerHeight - btnEmergency.offsetHeight;

    newLeft = Math.max(0, Math.min(maxLeft, newLeft));
    newTop = Math.max(0, Math.min(maxTop, newTop));

    btnEmergency.style.left = `${newLeft}px`;
    btnEmergency.style.top = `${newTop}px`;
    btnEmergency.style.right = "auto";
    btnEmergency.style.transform = "none";
  }, { passive: false }); // ✅ clé : autorise preventDefault sur certains navigateurs

  // --- E) Fin drag ---
  const stop = () => {
    if (!dragging) return;
    dragging = false;

    // si on a bougé, on sauvegarde la position
    if (moved) {
      localStorage.setItem("sosPos", JSON.stringify({
        left: btnEmergency.style.left,
        top: btnEmergency.style.top
      }));
    }
  };

  btnEmergency.addEventListener("pointerup", stop);
  btnEmergency.addEventListener("pointercancel", stop);

  // --- F) Click (popup) : seulement si on n'a PAS déplacé ---
  btnEmergency.addEventListener("click", (e) => {
    if (moved) {
      // évite l'ouverture après un drag
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const html = `
      <div class="smartphone" role="dialog" aria-label="Numéros d'urgence">
        <div class="notch" aria-hidden="true"></div>

        <div class="screen">
          <div class="status-bar">
            <span class="time">${now}</span>
            <span aria-hidden="true">📶 🔋</span>
          </div>

          <h2 style="text-align:center; margin: 6px 0 10px;">Urgences</h2>
          <p style="text-align:center; opacity:0.85; margin-bottom:12px;">
            Touchez un numéro pour appeler
          </p>

          <div class="emergency-grid">
            <a class="emergency-tile" href="tel:15" aria-label="Appeler le 15, SAMU">
              <div class="num">15</div>
              <div class="label">SAMU</div>
            </a>

            <a class="emergency-tile" href="tel:18" aria-label="Appeler le 18, Pompiers">
              <div class="num">18</div>
              <div class="label">Pompiers</div>
            </a>

            <a class="emergency-tile" href="tel:112" aria-label="Appeler le 112, Urgences européennes">
              <div class="num">112</div>
              <div class="label">Urgences<br>Europe</div>
            </a>

            <a class="emergency-tile" href="tel:114" aria-label="Appeler le 114, urgence SMS sourds/malentendants">
              <div class="num">114</div>
              <div class="label">SMS<br>(sourds)</div>
            </a>
          </div>

          <div class="home-indicator" aria-hidden="true"></div>
        </div>
      </div>
    `;

    openPopup(html);
  });
}


  // =========================================================
  // 4) FORMULAIRE CONTACT
  // =========================================================

  const btnContact = document.getElementById("open-contact");

  if (btnContact) {

    btnContact.addEventListener("click", () => {

      const html = `
        <div class="detail-content">
          <h3>Une question, un commentaire ?</h3>
          <p style="text-align:center; margin-bottom:12px;">
            Remplissez ce formulaire, je vous répondrai par email.
          </p>

          <form class="form-contact"
                action="https://formspree.io/f/xvzbrekb"
                method="POST">

            <div class="row-2">
              <div>
                <label for="nom">Nom</label>
                <input id="nom" name="nom" type="text" required>
              </div>

              <div>
                <label for="prenom">Prénom</label>
                <input id="prenom" name="prenom" type="text" required>
              </div>
            </div>

            <div>
              <label for="email">Adresse mail</label>
              <input id="email" name="email" type="email" required>
            </div>

            <div>
              <label for="message">Votre message</label>
              <textarea id="message" name="message" maxlength="5000" required></textarea>
              <div class="hint">
                <span>5000 caractères maximum</span>
                <span id="count-msg">0 / 5000</span>
              </div>
            </div>

            <input type="text" name="_gotcha" style="display:none">
            <button class="btn-submit" type="submit">Envoyer</button>

          </form>
        </div>
      `;

      const popup = openPopup(html);

      // Compteur caractères dynamique
      const textarea = popup.querySelector("#message");
      const counter = popup.querySelector("#count-msg");

      const updateCount = () => {
        counter.textContent = `${textarea.value.length} / 5000`;
      };

      textarea.addEventListener("input", updateCount);
      updateCount();
    });
  }

});


// =========================================================
// CONTENU POPUP ACCUEIL
// =========================================================

function getContenuCarte(titre) {

  const contenus = {

    "Les 4 étapes pour porter secours": `
      <div class="etapes-intervention">
        <p style="text-align:center; margin-bottom:12px;">
          💡 Cliquez sur une étape pour plus de détails
        </p>

        <div class="grille-etapes">

          <div class="etape" data-detail="detail-4-etapes-1">
            <div class="numero-etape">1</div>
            <h4>🔒 Sécuriser</h4>
          </div>

          <div class="etape" data-detail="detail-4-etapes-2">
            <div class="numero-etape">2</div>
            <h4>👁️ Apprécier</h4>
          </div>

          <div class="etape" data-detail="detail-4-etapes-3">
            <div class="numero-etape">3</div>
            <h4>📞 Alerter</h4>
          </div>

          <div class="etape" data-detail="detail-4-etapes-4">
            <div class="numero-etape">4</div>
            <h4>⛑️ Secourir</h4>
          </div>

        </div>
      </div>
    `,
  };

  return contenus[titre] || `<p>Contenu en cours de rédaction...</p>`;
}

// =========================
// POPUP (GLOBAL)
// =========================
function openPopup(html, extraClass = "") {
  const popup = document.createElement("div");
  popup.className = `popup ${extraClass}`.trim();

  popup.innerHTML = `
    <div class="popup-contenu">
      <button class="fermer" type="button" aria-label="Fermer">&times;</button>
      ${html}
    </div>
  `;

  document.body.appendChild(popup);

  const close = () => {
    if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    document.removeEventListener("keydown", onKey);
  };

  const onKey = (e) => {
    if (e.key === "Escape") close();
  };

  popup.querySelector(".fermer")?.addEventListener("click", close);
  popup.addEventListener("click", (e) => { if (e.target === popup) close(); });
  document.addEventListener("keydown", onKey);

  return popup;
}

// =========================
// CONTENU POPUP (Accueil)
// =========================
function getContenuCarte(titre) {
  const contenus = {
    "Les 4 étapes pour porter secours": `
      <div class="etapes-intervention">
        <p style="text-align:center; margin-bottom:12px;">💡 Cliquez sur une étape pour plus de détails</p>
        <div class="grille-etapes">
          <div class="etape" data-detail="detail-4-etapes-1" tabindex="0">
            <div class="numero-etape">1</div><h4>🔒 Sécuriser</h4>
          </div>
          <div class="etape" data-detail="detail-4-etapes-2" tabindex="0">
            <div class="numero-etape">2</div><h4>👁️ Apprécier</h4>
          </div>
          <div class="etape" data-detail="detail-4-etapes-3" tabindex="0">
            <div class="numero-etape">3</div><h4>📞 Alerter</h4>
          </div>
          <div class="etape" data-detail="detail-4-etapes-4" tabindex="0">
            <div class="numero-etape">4</div><h4>⛑️ Secourir</h4>
          </div>
        </div>
      </div>
    `,
  };

  return contenus[titre] || `<p>Contenu en cours de rédaction...</p>`;
}

document.addEventListener("DOMContentLoaded", () => {

  // =========================================================
  // 1) ETAPES (DELEGATION) => marche même dans les popups
  // =========================================================
  document.addEventListener("click", (e) => {
    const etape = e.target.closest(".etape[data-detail]");
    if (!etape) return;

    // Si déjà un détail inline (hover), on évite la popup
    if (etape.querySelector(".etape-detail")) return;

    // si clic sur un élément interactif interne, on laisse faire
    if (e.target.closest("a, button, input, textarea, select, label")) return;

    e.preventDefault();

    const tplId = etape.getAttribute("data-detail");
    const tpl = document.getElementById(tplId);

    if (!tpl) {
      console.warn("Template introuvable :", tplId);
      return;
    }

    const num = etape.querySelector(".numero-etape")?.textContent?.trim() || "";
    const titre =
      etape.querySelector("h4")?.textContent?.trim() ||
      etape.querySelector("h3")?.textContent?.trim() ||
      etape.textContent.trim();

    const html = `
      <div class="etape-detail-header">
        ${num ? `<div class="numero-etape-large">${num}</div>` : ""}
        <h2>${titre}</h2>
      </div>
      ${tpl.innerHTML}
    `;

    openPopup(html, "sous-popup popup-etape");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const etape = document.activeElement?.closest?.(".etape[data-detail]");
    if (!etape) return;
    e.preventDefault();
    etape.click();
  });

  // =========================================================
  // 2) CARTES ACCUEIL (popup)
  // =========================================================
  document.querySelectorAll(".grille-cartes a.carte").forEach((carte) => {
    carte.addEventListener("click", (e) => {
      const titreEl = carte.querySelector("h2, h3");
      const titre = titreEl ? titreEl.textContent.trim() : "";
      if (!titre) return;

      // Si tu veux navigation normale pour celle-ci => ne pas empêcher
      if (titre === "Les 4 étapes pour porter secours") {
        e.preventDefault();
        const contenu = getContenuCarte(titre);
        openPopup(`<h2 style="text-align:center; margin-bottom:14px;">${titre}</h2>${contenu}`);
        return;
      }

      const contenu = getContenuCarte(titre);
      if (!contenu || contenu.includes("en cours de rédaction")) return;

      e.preventDefault();
      openPopup(`<h2 style="text-align:center; margin-bottom:14px;">${titre}</h2>${contenu}`);
    });
  });

  // =========================================================
  // 3) CONTACT / QUESTIONNAIRE (popup)
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

          <form class="form-contact" action="https://formspree.io/f/xvzbrekb" method="POST">
            <div class="row-2">
              <div>
                <label for="nom">Nom</label>
                <input id="nom" name="nom" type="text" required autocomplete="family-name">
              </div>

              <div>
                <label for="prenom">Prénom</label>
                <input id="prenom" name="prenom" type="text" required autocomplete="given-name">
              </div>
            </div>

            <div>
              <label for="email">Adresse mail</label>
              <input id="email" name="email" type="email" required autocomplete="email">
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

      const textarea = popup.querySelector("#message");
      const counter = popup.querySelector("#count-msg");
      if (textarea && counter) {
        const updateCount = () => { counter.textContent = `${textarea.value.length} / 5000`; };
        textarea.addEventListener("input", updateCount);
        updateCount();
      }
    });
  }
});

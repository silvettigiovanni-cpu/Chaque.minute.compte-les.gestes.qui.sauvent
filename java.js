// java.js

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // OUTILS POPUP
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

    const btnClose = popup.querySelector(".fermer");
    if (btnClose) btnClose.addEventListener("click", close);

    popup.addEventListener("click", (e) => {
      if (e.target === popup) close();
    });

    document.addEventListener("keydown", onKey);

    return popup;
  }

  // =========================
  // 1) OUVRIR LES ETAPES (PARTOUT)
  // =========================
  document.querySelectorAll(".etape[data-detail]").forEach((etape) => {
    etape.style.cursor = "pointer";

    etape.addEventListener("click", (e) => {
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
  });

  // =========================
  // 2) CARTES DE L’ACCUEIL
  // - popup si contenu prévu
  // - navigation normale sinon
  // =========================
  const cartes = document.querySelectorAll(".grille-cartes a.carte");

  cartes.forEach((carte) => {
    carte.addEventListener("click", (e) => {
      const titreEl = carte.querySelector("h2, h3");
      const titre = titreEl ? titreEl.textContent.trim() : "";
      if (!titre) return;

      // ✅ on laisse la navigation normale pour cette carte (si tu veux)
      if (titre === "Les 4 étapes pour porter secours") return;

      const contenu = getContenuCarte(titre);

      // si pas de contenu => on laisse la navigation normale
      if (!contenu || contenu.includes("en cours de rédaction")) return;

      e.preventDefault();
      openPopup(`<h2 style="text-align:center; margin-bottom:14px;">${titre}</h2>${contenu}`);
    });
  });

  // =========================
  // 3) SMARTPHONE SOS (TOUTES PAGES)
  // =========================
  const btnEmergency = document.getElementById("open-emergency");

  if (btnEmergency) {
    btnEmergency.addEventListener("click", () => {
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

  // =========================
  // 4) CONTACT (bouton avant footer)
  // =========================
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

      // Compteur caractères
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

// =========================
// CONTENU POPUP (accueil)
// =========================
function getContenuCarte(titre) {
  const contenus = {
    "Les 4 étapes pour porter secours": `
      <div class="etapes-intervention">
        <p style="text-align:center; margin-bottom:12px;">💡 Cliquez sur une étape pour plus de détails</p>
        <div class="grille-etapes">
          <div class="etape" data-detail="detail-4-etapes-1">
            <div class="numero-etape">1</div><h4>🔒 Sécuriser</h4>
          </div>
          <div class="etape" data-detail="detail-4-etapes-2">
            <div class="numero-etape">2</div><h4>👁️ Apprécier</h4>
          </div>
          <div class="etape" data-detail="detail-4-etapes-3">
            <div class="numero-etape">3</div><h4>📞 Alerter</h4>
          </div>
          <div class="etape" data-detail="detail-4-etapes-4">
            <div class="numero-etape">4</div><h4>⛑️ Secourir</h4>
          </div>
        </div>
      </div>
    `,
  };

  return contenus[titre] || `<p>Contenu en cours de rédaction...</p>`;
}

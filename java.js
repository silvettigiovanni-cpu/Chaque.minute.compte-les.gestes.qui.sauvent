// =========================================================
// POPUP (GLOBAL) — accessible + réutilisable
// =========================================================
function openPopup(html, extraClass = "") {
  const popup = document.createElement("div");
  popup.className = `popup ${extraClass}`.trim();
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");

  popup.innerHTML = `
    <div class="popup-contenu" role="document">
      <button class="fermer" type="button" aria-label="Fermer">&times;</button>
      ${html}
    </div>
  `;

  document.body.appendChild(popup);

  // Focus management (simple)
  const closeBtn = popup.querySelector(".fermer");
  const focusables = () =>
    Array.from(
      popup.querySelectorAll(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled"));

  const previousActive = document.activeElement;

  const close = () => {
    document.removeEventListener("keydown", onKey);
    if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    if (previousActive && typeof previousActive.focus === "function") previousActive.focus();
  };

  const onKey = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    // Trap focus (Tab)
    if (e.key === "Tab") {
      const els = focusables();
      if (els.length === 0) return;

      const first = els[0];
      const last = els[els.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  closeBtn?.addEventListener("click", close);
  popup.addEventListener("click", (e) => {
    if (e.target === popup) close();
  });
  document.addEventListener("keydown", onKey);

  // focus sur fermer
  closeBtn?.focus();

  return popup;
}

// =========================================================
// CONTENU POPUP (Accueil)
// =========================================================
function getContenuCarte(titre) {
  const contenus = {
    "Les 4 étapes pour porter secours": `
      <div class="etapes-intervention">
        <p style="text-align:center; margin-bottom:12px;">💡 Cliquez sur une étape pour plus de détails</p>
        <div class="grille-etapes">
          <div class="etape" data-detail="detail-4-etapes-1" tabindex="0" role="button" aria-label="Étape 1 : Sécuriser">
            <div class="numero-etape">1</div><h4>🔒 Sécuriser</h4>
          </div>
          <div class="etape" data-detail="detail-4-etapes-2" tabindex="0" role="button" aria-label="Étape 2 : Apprécier">
            <div class="numero-etape">2</div><h4>👁️ Apprécier</h4>
          </div>
          <div class="etape" data-detail="detail-4-etapes-3" tabindex="0" role="button" aria-label="Étape 3 : Alerter">
            <div class="numero-etape">3</div><h4>📞 Alerter</h4>
          </div>
          <div class="etape" data-detail="detail-4-etapes-4" tabindex="0" role="button" aria-label="Étape 4 : Secourir">
            <div class="numero-etape">4</div><h4>⛑️ Secourir</h4>
          </div>
        </div>
      </div>
    `,
  };

  return contenus[titre] || `<p>Contenu en cours de rédaction...</p>`;
}

// =========================================================
// Helpers “pages”
function isHoverOnlyPage() {
  // Sur ces pages, les détails sont inline au survol (CSS),
  // donc on NE DOIT PAS ouvrir de popup au clic.
  return document.body.classList.contains("etouffement")
    || document.body.classList.contains("page-hemorragie")
    || document.body.classList.contains("brulure");
}

// Popups étapes autorisées UNIQUEMENT sur :
function isClickPopupEtapesPage() {
  // Tu peux sécuriser en ajoutant des classes body sur tes pages :
  // - class="page-4-etapes"
  // - class="arret-cardiaque"
  // - class="inconscience"
  // Si tu ne les as pas, on garde un fallback : présence de templates detail-*
  return document.body.classList.contains("page-4-etapes")
    || document.body.classList.contains("arret-cardiaque")
    || document.body.classList.contains("inconscience")
    || !!document.querySelector('template[id^="detail-"]');
}

// =========================================================
// DOM READY
// =========================================================
document.addEventListener("DOMContentLoaded", () => {

  // =========================================================
  // 1) ETAPES (DELEGATION) — Popup au CLIC seulement sur certaines pages
  // =========================================================
  document.addEventListener("click", (e) => {
    const etape = e.target.closest(".etape[data-detail]");
    if (!etape) return;

    // Sur pages hover-only : pas de popup
    if (isHoverOnlyPage()) return;

    // Si pas une page “popup clic”, on ne fait rien
    if (!isClickPopupEtapesPage()) return;

    // Si déjà un détail inline présent => pas de popup
    if (etape.querySelector(".etape-detail")) return;

    // Si clic sur un élément interactif interne => laisser faire
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

  // Accessibilité clavier : Enter/Espace sur une .etape[data-detail]
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;

    const active = document.activeElement;
    const etape = active?.closest?.(".etape[data-detail]");
    if (!etape) return;

    // hover-only => rien
    if (isHoverOnlyPage()) return;

    // popup-only pages => on déclenche
    if (!isClickPopupEtapesPage()) return;

    e.preventDefault();
    etape.click();
  });

// =========================================================
// 2) CARTES ACCUEIL : navigation normale (pas de popup)
// =========================================================
document.querySelectorAll(".grille-cartes a.carte").forEach((carte) => {
carte.addEventListener("click", (e) => { 
const titreEl = carte.querySelector("h2, h3"); const titre = titreEl ? titreEl.textContent.trim() : "";
if (!titre) return;

      // Popup spécifique sur accueil
      if (titre === "Les 4 étapes pour porter secours") {
        e.preventDefault();
        const contenu = getContenuCarte(titre);
        openPopup(
          `<h2 style="text-align:center; margin-bottom:14px;">${titre}</h2>${contenu}`,
          "popup-carte"
        );
        return;
      }

      const contenu = getContenuCarte(titre);
      if (!contenu || contenu.includes("en cours de rédaction")) return;

      e.preventDefault();
      openPopup(
        `<h2 style="text-align:center; margin-bottom:14px;">${titre}</h2>${contenu}`,
        "popup-carte"
      );
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

      const popup = openPopup(html, "popup-contact");

      const textarea = popup.querySelector("#message");
      const counter = popup.querySelector("#count-msg");
      if (textarea && counter) {
        const updateCount = () => {
          counter.textContent = `${textarea.value.length} / 5000`;
        };
        textarea.addEventListener("input", updateCount);
        updateCount();
      }
    });
  }

  // =========================================================
  // 4) SOS — bouton flottant => “smartphone” + 15/18/112/114
  // =========================================================
  const btnSOS = document.getElementById("open-emergency");
  if (btnSOS) {
    btnSOS.addEventListener("click", () => {
      const html = `
        <div class="detail-content">
          <h3 style="text-align:center; margin-bottom:8px;">📱 Numéros d’urgence</h3>
          <p style="text-align:center; margin-bottom:12px; color: var(--muted);">
            Appuyez sur un bouton pour appeler.
          </p>

          <div class="phone-shell" aria-label="Smartphone d'urgence">
            <div class="phone-screen">
              <div class="phone-title">Urgences</div>

              <div class="emergency-buttons" role="group" aria-label="Numéros d’urgence">
                <a href="tel:15" class="emergency-btn samu" aria-label="Appeler le SAMU, numéro 15">📞 15 – SAMU</a>
                <a href="tel:18" class="emergency-btn pompiers" aria-label="Appeler les pompiers, numéro 18">🚒 18 – Pompiers</a>
                <a href="tel:112" class="emergency-btn urgence" aria-label="Appeler le numéro d'urgence européen 112">🆘 112 – Urgences</a>
                <a href="tel:114" class="emergency-btn sourd" aria-label="Appeler le numéro d'urgence 114 pour personnes sourdes ou malentendantes">🆘 114 – Sourd / Malentendants</a>
              </div>

              <div class="phone-sub">En cas de doute, privilégiez le 112.</div>
            </div>
          </div>
        </div>
      `;

      openPopup(html, "popup-sos");
    });
  }

});

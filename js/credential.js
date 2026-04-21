/* ======================================================================
   Credential — populate card from localStorage, tier highlight,
   print, and reset flow.
   ====================================================================== */

(function () {
  "use strict";

  var owner = window.OWNED && window.OWNED.getOwner();
  if (!owner) return; // ensureIntake() already redirected

  // Name
  var nameEl = document.getElementById("cred-name");
  if (nameEl) nameEl.textContent = owner.name.toUpperCase();

  // Tier
  var tierEl = document.getElementById("cred-tier");
  if (tierEl) tierEl.textContent = owner.tier;

  // Accession
  var accEl = document.getElementById("cred-accession");
  if (accEl) accEl.textContent = "Acc. № " + owner.accession;

  // Photo (replace silhouette SVG if we have a dataURL)
  var photoSlot = document.getElementById("cred-photo");
  if (photoSlot && owner.photo) {
    photoSlot.innerHTML = "";
    var img = document.createElement("img");
    img.src = owner.photo;
    img.alt = owner.name + " — owner of record";
    photoSlot.appendChild(img);
  }

  // Highlight current tier — matches tier by exact name
  var TIER_ORDER = [
    "Curator-in-Training",
    "Apprentice Archivist",
    "Collector of Record",
    "Senior Curator",
    "Archivist of the Holdings",
    "Keeper of the Holdings"
  ];
  var currentIdx = TIER_ORDER.indexOf(owner.tier);
  if (currentIdx === -1) currentIdx = 0;

  var tierNodes = document.querySelectorAll(".tier");
  if (tierNodes[currentIdx]) tierNodes[currentIdx].classList.add("is-current");

  // Print
  var printBtn = document.getElementById("cred-print");
  if (printBtn) {
    printBtn.addEventListener("click", function () { window.print(); });
  }

  // Reset flow
  var resetLink = document.getElementById("reset-link");
  var confirmPanel = document.getElementById("reset-confirm");
  var confirmYes = document.getElementById("reset-yes");
  var confirmNo = document.getElementById("reset-no");

  function openConfirm(e) {
    if (e) e.preventDefault();
    confirmPanel.classList.add("is-open");
    confirmPanel.setAttribute("aria-hidden", "false");
  }
  function closeConfirm() {
    confirmPanel.classList.remove("is-open");
    confirmPanel.setAttribute("aria-hidden", "true");
  }

  if (resetLink) resetLink.addEventListener("click", openConfirm);
  if (confirmNo) confirmNo.addEventListener("click", closeConfirm);
  if (confirmPanel) confirmPanel.addEventListener("click", function (e) {
    if (e.target === confirmPanel) closeConfirm();
  });
  if (confirmYes) confirmYes.addEventListener("click", function () {
    window.OWNED.resetOwner();
    location.href = "index.html";
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && confirmPanel.classList.contains("is-open")) closeConfirm();
  });
})();

/* ======================================================================
   Vault Hub — populate greeting + accession from localStorage
   ====================================================================== */

(function () {
  "use strict";

  var owner = window.OWNED && window.OWNED.getOwner();
  if (!owner) return;

  var nameSlot = document.getElementById("owner-name-slot");
  if (nameSlot) nameSlot.textContent = owner.name;

  var footerAcc = document.getElementById("footer-accession");
  if (footerAcc) footerAcc.textContent = "Acc. № " + owner.accession;
})();

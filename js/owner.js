/* ======================================================================
   OWNED — Owner of record helpers
   Single source of truth for localStorage reads/writes.
   ====================================================================== */

(function (global) {
  "use strict";

  var KEYS = {
    NAME: "holdings_owner",
    PHOTO: "holdings_photo",
    ACCESSION: "holdings_accession",
    TIER: "holdings_tier"
  };

  var DEFAULT_TIER = "Curator-in-Training";

  function safeGet(key) {
    try { return localStorage.getItem(key); }
    catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); }
    catch (e) { /* storage unavailable */ }
  }

  function safeRemove(key) {
    try { localStorage.removeItem(key); }
    catch (e) { /* storage unavailable */ }
  }

  function getOwner() {
    var name = safeGet(KEYS.NAME);
    if (!name) return null;
    return {
      name: name,
      photo: safeGet(KEYS.PHOTO) || null,
      accession: safeGet(KEYS.ACCESSION) || generateAccession(),
      tier: safeGet(KEYS.TIER) || DEFAULT_TIER
    };
  }

  function setOwner(fields) {
    if (!fields || typeof fields !== "object") return;
    if (typeof fields.name === "string") safeSet(KEYS.NAME, fields.name);
    if (fields.photo === null) safeRemove(KEYS.PHOTO);
    else if (typeof fields.photo === "string") safeSet(KEYS.PHOTO, fields.photo);
    if (typeof fields.accession === "string") safeSet(KEYS.ACCESSION, fields.accession);
    if (typeof fields.tier === "string") safeSet(KEYS.TIER, fields.tier);
  }

  function generateAccession() {
    var n = Math.floor(1000 + Math.random() * 9000);
    return "2026." + n;
  }

  function ensureIntake() {
    if (!safeGet(KEYS.NAME)) {
      location.replace("index.html");
    }
  }

  function redirectIfEnrolled() {
    if (safeGet(KEYS.NAME)) {
      location.replace("vault.html");
    }
  }

  function resetOwner() {
    safeRemove(KEYS.NAME);
    safeRemove(KEYS.PHOTO);
    safeRemove(KEYS.ACCESSION);
    safeRemove(KEYS.TIER);
  }

  global.OWNED = global.OWNED || {};
  global.OWNED.KEYS = KEYS;
  global.OWNED.DEFAULT_TIER = DEFAULT_TIER;
  global.OWNED.getOwner = getOwner;
  global.OWNED.setOwner = setOwner;
  global.OWNED.generateAccession = generateAccession;
  global.OWNED.ensureIntake = ensureIntake;
  global.OWNED.redirectIfEnrolled = redirectIfEnrolled;
  global.OWNED.resetOwner = resetOwner;
})(window);

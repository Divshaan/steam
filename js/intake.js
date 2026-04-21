/* ======================================================================
   Intake — name entry, camera capture, fake scan, fallback path
   ====================================================================== */

(function () {
  "use strict";

  var form = document.getElementById("intake-form");
  var nameInput = document.getElementById("owner-name");
  var stageName = document.querySelector(".intake__stage--name");
  var stageScan = document.querySelector(".intake__stage--scan");
  var scanPanel = document.getElementById("scan-panel");
  var video = document.getElementById("scan-video");
  var scanLine = document.getElementById("scan-line");
  var microcopy = document.getElementById("scan-microcopy");
  var skipBtn = document.getElementById("scan-skip");
  var statusLine = document.getElementById("scan-status");
  var vaultDoor = document.getElementById("vault-door");

  var CAMERA_LINES = [
    "Identity scan in progress",
    "Cross-referencing holdings",
    "Credential issued"
  ];

  var FALLBACK_LINES = [
    "Proceeding without visual record",
    "Cross-referencing holdings",
    "Credential issued — unphotographed"
  ];

  var stream = null;
  var aborted = false;

  /* ---------- Stage swapping ---------- */

  function showStage(which) {
    stageName.classList.toggle("is-active", which === "name");
    stageScan.classList.toggle("is-active", which === "scan");
  }

  /* ---------- Name submit → begin scan ---------- */

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = (nameInput.value || "").trim();
    if (!name) { nameInput.focus(); return; }

    // Provisional save; photo set later
    window.OWNED.setOwner({
      name: name,
      accession: window.OWNED.generateAccession(),
      tier: window.OWNED.DEFAULT_TIER
    });

    showStage("scan");
    // Show skip button as soon as we start asking for camera
    setTimeout(function () { skipBtn.classList.add("is-visible"); }, 200);

    requestCamera();
  });

  /* ---------- Camera request ---------- */

  function requestCamera() {
    statusLine.textContent = "Requesting visual record.";

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return startFallback();
    }

    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      .then(function (s) {
        if (aborted) { stopStream(s); return; }
        stream = s;
        video.srcObject = s;
        scanPanel.classList.add("is-camera");
        statusLine.textContent = "Visual record acquired.";
        startScan(true);
      })
      .catch(function () {
        if (aborted) return;
        startFallback();
      });
  }

  function stopStream(s) {
    var source = s || stream;
    if (!source) return;
    source.getTracks().forEach(function (t) { t.stop(); });
    stream = null;
  }

  /* ---------- Skip button ---------- */

  skipBtn.addEventListener("click", function () {
    aborted = true;
    stopStream();
    startFallback();
  });

  /* ---------- Fallback path ---------- */

  function startFallback() {
    scanPanel.classList.remove("is-camera");
    statusLine.textContent = "No visual record. Proceeding.";
    startScan(false);
  }

  /* ---------- Scan run ---------- */

  function startScan(withCamera) {
    scanPanel.classList.add("is-scanning");
    skipBtn.classList.remove("is-visible"); // no bail-out mid-scan

    var lines = withCamera ? CAMERA_LINES : FALLBACK_LINES;
    var nodes = microcopy.querySelectorAll(".scan-microcopy__line");

    // Reveal lines in sequence
    lines.forEach(function (text, i) {
      if (nodes[i]) {
        setTimeout(function () {
          nodes[i].textContent = text;
          nodes[i].classList.add("is-visible");
        }, 700 + i * 900);
      }
    });

    // Complete scan ~4.2s total
    setTimeout(function () {
      finishScan(withCamera);
    }, 4200);
  }

  /* ---------- Finish: capture frame, save, transition ---------- */

  function finishScan(withCamera) {
    if (withCamera && stream && video.videoWidth) {
      try {
        var canvas = document.createElement("canvas");
        var w = video.videoWidth;
        var h = video.videoHeight;
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        // Mirror to match on-screen preview
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, w, h);
        var dataURL = canvas.toDataURL("image/jpeg", 0.82);
        window.OWNED.setOwner({ photo: dataURL });
      } catch (err) {
        window.OWNED.setOwner({ photo: null });
      }
    } else {
      window.OWNED.setOwner({ photo: null });
    }

    stopStream();
    scanPanel.classList.remove("is-scanning");

    // Close vault doors
    vaultDoor.classList.add("is-closing");
    setTimeout(function () {
      location.href = "vault.html";
    }, 1100);
  }
})();

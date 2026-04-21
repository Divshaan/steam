/* ======================================================================
   Library — tile click → detail overlay
   ====================================================================== */

(function () {
  "use strict";

  var owner = window.OWNED && window.OWNED.getOwner();
  if (owner) {
    var footerAcc = document.getElementById("footer-accession");
    if (footerAcc) footerAcc.textContent = "Acc. № " + owner.accession;
  }

  var DATA = {
    kratos: {
      acc: "Acc. № 001",
      title: "God of War",
      tier: "Saga · Complete Holding",
      copy: [
        "Acquired from the Sony first-party roster and admitted to the Holdings on the date of your credential. Title held in perpetuity.",
        "Elsewhere, this saga is administered on a subscription roster — present this week, withdrawn the next, reshuffled between tiers at quarterly intervals. In the Holdings, it is fixed.",
        "The Keeper affirms: the axe does not leave the shelf."
      ]
    },
    aloy: {
      acc: "Acc. № 002",
      title: "Horizon Zero Dawn",
      tier: "Saga · Complete Holding",
      copy: [
        "Acquired on entry. Full build preserved. No downloadable content withheld behind a monthly fee, no cosmetics rented by the season.",
        "Where others rotate the catalog, the Holdings does not rotate. Her bow remains where she left it, as does the world she crosses with it.",
        "Returned to you on request. Indefinitely."
      ]
    },
    joel: {
      acc: "Acc. № 003",
      title: "The Last of Us",
      tier: "Saga · Complete Holding",
      copy: [
        "Acquired and accessioned. Files stored on your device, not held ransom by a remote server. A cable cut at the sea floor cannot remove this title from your record.",
        "This matters more than it used to. Somewhere else, a server has gone dark this quarter. Somewhere else, a library card has expired.",
        "Yours has not."
      ]
    },
    jin: {
      acc: "Acc. № 004",
      title: "Ghost of Tsushima",
      tier: "Saga · Complete Holding",
      copy: [
        "Acquired from Sony's first-party archive and admitted to the Holdings. Base game and director's cut materials preserved as a single record.",
        "The island is yours. Its skies are yours. The honour of its last stand is yours. None of this is rented, none of this expires, none of this requires renewal.",
        "The Keeper has sealed the record."
      ]
    },
    drake: {
      acc: "Acc. № 005",
      title: "Uncharted 4: A Thief's End",
      tier: "Saga · Complete Holding",
      copy: [
        "Acquired and preserved. The last entry in a four-volume saga, catalogued alongside its predecessors in your Holdings with no gap and no condition.",
        "A title of this weight should not be administered month by month. It should be held, the way a book is held on a shelf — present when you want it, silent when you do not.",
        "The last treasure does not expire."
      ]
    }
  };

  var detail = document.getElementById("detail");
  var detailAcc = document.getElementById("detail-acc");
  var detailTitle = document.getElementById("detail-title");
  var detailTier = document.getElementById("detail-tier");
  var detailCopy = document.getElementById("detail-copy");
  var detailPortrait = document.getElementById("detail-portrait");
  var detailClose = document.getElementById("detail-close");

  document.querySelectorAll(".holdings-card").forEach(function (card) {
    card.addEventListener("click", function () {
      open(card.dataset.id, card);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(card.dataset.id, card); }
    });
    card.tabIndex = 0;
  });

  function open(id, card) {
    var d = DATA[id];
    if (!d) return;
    detailAcc.textContent = d.acc;
    detailTitle.textContent = d.title;
    detailTier.textContent = d.tier;

    detailCopy.innerHTML = "";
    d.copy.forEach(function (p) {
      var el = document.createElement("p");
      el.textContent = p;
      detailCopy.appendChild(el);
    });

    // Clone the card's portrait SVG
    var portrait = card.querySelector(".holdings-card__portrait svg");
    detailPortrait.innerHTML = "";
    if (portrait) detailPortrait.appendChild(portrait.cloneNode(true));

    detail.classList.add("is-open");
    detail.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    detail.classList.remove("is-open");
    detail.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  detailClose.addEventListener("click", close);
  detail.addEventListener("click", function (e) {
    if (e.target === detail) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && detail.classList.contains("is-open")) close();
  });
})();

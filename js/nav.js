/* ======================================================================
   OWNED — Site navigation
   Active-link highlighting + mobile hamburger toggle.
   ====================================================================== */

(function () {
  "use strict";

  function init() {
    var nav = document.querySelector(".site-nav");
    if (!nav) return;

    var toggle = nav.querySelector(".site-nav__toggle");
    var links = nav.querySelectorAll(".site-nav__links a");

    // Active link
    var path = location.pathname.split("/").pop() || "vault.html";
    links.forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path) a.classList.add("is-active");
    });

    // Mobile toggle
    if (toggle) {
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        nav.classList.toggle("is-open");
      });

      document.addEventListener("click", function (e) {
        if (!nav.contains(e.target) && nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
        }
      });

      links.forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

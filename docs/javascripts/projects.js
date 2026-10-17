(function () {
  function bindCatalog(catalog) {
    if (catalog.dataset.bound === "true") {
      return;
    }
    catalog.dataset.bound = "true";

    const searchInput = catalog.querySelector("[data-repo-search]");
    const filters = catalog.querySelector("[data-repo-filters]");
    const rows = Array.from(catalog.querySelectorAll(".repo-row"));
    const empty = catalog.querySelector("[data-repo-empty]");
    let activeFilter = "all";

    function apply() {
      const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
      let visible = 0;

      rows.forEach(function (row) {
        const categories = (row.getAttribute("data-categories") || "").split(/\s+/);
        const haystack = (row.textContent + " " + (row.getAttribute("data-search") || "")).toLowerCase();
        const matchesFilter = activeFilter === "all" || categories.indexOf(activeFilter) !== -1;
        const matchesQuery = query === "" || haystack.indexOf(query) !== -1;
        const show = matchesFilter && matchesQuery;
        row.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    function setFilter(value) {
      activeFilter = value || "all";
      catalog.querySelectorAll("[data-filter]").forEach(function (button) {
        const isChip = button.classList.contains("repo-chip");
        if (isChip) {
          button.classList.toggle("is-active", button.getAttribute("data-filter") === activeFilter);
        }
      });
      apply();
    }

    if (filters) {
      filters.addEventListener("click", function (event) {
        const button = event.target.closest("[data-filter]");
        if (!button || !filters.contains(button)) {
          return;
        }
        setFilter(button.getAttribute("data-filter"));
      });
    }

    catalog.addEventListener("click", function (event) {
      const tag = event.target.closest(".repo-tag[data-filter]");
      if (!tag || !catalog.contains(tag)) {
        return;
      }
      setFilter(tag.getAttribute("data-filter"));
    });

    if (searchInput) {
      searchInput.addEventListener("input", apply);
    }

    apply();
  }

  function init() {
    document.querySelectorAll("[data-repo-catalog]").forEach(bindCatalog);
  }

  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(init);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

(() => {
  "use strict";

  document.documentElement.classList.add("js-enhanced");

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    const setMenu = (open, restoreFocus = false) => {
      navLinks.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      if (open) {
        navLinks.querySelector("a")?.focus();
      } else if (restoreFocus) {
        navToggle.focus();
      }
    };

    navToggle.addEventListener("click", () => {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });

    navLinks.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) setMenu(false);
    });

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Node)) return;
      if (!navToggle.contains(event.target) && !navLinks.contains(event.target)) setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false, true);
      }
    });

    matchMedia("(min-width: 981px)").addEventListener("change", (event) => {
      if (event.matches) setMenu(false);
    });
  }

  const revealNodes = [...document.querySelectorAll(".reveal")];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: "0px 0px -5% 0px" });
    revealNodes.forEach((node) => observer.observe(node));
  }

  document.querySelectorAll('a[href^="http"]').forEach((link) => {
    if (!link.rel) link.rel = "noopener noreferrer";
  });

  const projectButtons = [...document.querySelectorAll(".project-filter-bar [data-filter]")];
  const projectCards = [...document.querySelectorAll("[data-project]:not([data-proof-item])")];
  if (projectButtons.length && projectCards.length) {
    const params = new URLSearchParams(location.search);
    const requested = params.get("category") || "all";
    const valid = projectButtons.some((button) => button.dataset.filter === requested) ? requested : "all";

    const applyProjectFilter = (filter, updateUrl = true) => {
      projectButtons.forEach((button) => {
        const active = button.dataset.filter === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      projectCards.forEach((card) => {
        const values = (card.dataset.project || "").split(/\s+/);
        card.hidden = filter !== "all" && !values.includes(filter);
      });
      if (updateUrl) {
        const next = new URL(location.href);
        if (filter === "all") next.searchParams.delete("category");
        else next.searchParams.set("category", filter);
        history.replaceState({}, "", next);
      }
    };

    projectButtons.forEach((button) => {
      button.addEventListener("click", () => applyProjectFilter(button.dataset.filter || "all"));
    });
    applyProjectFilter(valid, false);
  }

  const proofItems = [...document.querySelectorAll("[data-proof-item]")];
  const proofSearch = document.querySelector("[data-proof-search]");
  const proofProject = document.querySelector("[data-proof-project]");
  const proofClass = document.querySelector("[data-proof-classification]");
  const proofType = document.querySelector("[data-proof-type]");
  const proofReset = document.querySelector("[data-proof-reset]");
  const proofStatus = document.querySelector("[data-proof-status]");
  const proofEmpty = document.querySelector("[data-proof-empty]");

  if (proofItems.length && proofSearch && proofProject && proofClass && proofType) {
    const controls = [proofSearch, proofProject, proofClass, proofType];
    const params = new URLSearchParams(location.search);
    proofSearch.value = params.get("q") || "";
    proofProject.value = params.get("project") || "all";
    proofClass.value = params.get("classification") || "all";
    proofType.value = params.get("type") || "all";

    const matches = (item, attribute, selected) => selected === "all" || (item.getAttribute(attribute) || "").split(" ").includes(selected);
    const applyProofFilters = () => {
      const query = proofSearch.value.trim().toLowerCase();
      let visible = 0;
      proofItems.forEach((item) => {
        const show = (!query || item.textContent.toLowerCase().includes(query))
          && matches(item, "data-project", proofProject.value)
          && matches(item, "data-classification", proofClass.value)
          && matches(item, "data-artifact-type", proofType.value);
        item.hidden = !show;
        if (show) visible += 1;
      });
      if (proofStatus) proofStatus.textContent = `${visible} of ${proofItems.length} evidence records shown`;
      if (proofEmpty) proofEmpty.hidden = visible !== 0;

      const next = new URL(location.href);
      const values = { q: proofSearch.value.trim(), project: proofProject.value, classification: proofClass.value, type: proofType.value };
      Object.entries(values).forEach(([key, value]) => {
        if (!value || value === "all") next.searchParams.delete(key);
        else next.searchParams.set(key, value);
      });
      history.replaceState({}, "", next);
    };

    controls.forEach((control) => control.addEventListener(control === proofSearch ? "input" : "change", applyProofFilters));
    proofReset?.addEventListener("click", () => {
      proofSearch.value = "";
      proofProject.value = "all";
      proofClass.value = "all";
      proofType.value = "all";
      applyProofFilters();
      proofSearch.focus();
    });
    applyProofFilters();
  }

  const dashboardRoot = document.querySelector("[data-dashboard-source]");
  if (dashboardRoot) {
    fetch(dashboardRoot.getAttribute("data-dashboard-source"))
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Dashboard data unavailable")))
      .then((data) => {
        document.querySelectorAll("[data-metric-key]").forEach((node) => {
          const value = node.getAttribute("data-metric-key").split(".").reduce((current, key) => current?.[key], data);
          if (typeof value === "number" || typeof value === "string") node.textContent = String(value);
        });
        document.querySelectorAll("[data-bar-key]").forEach((node) => {
          const value = node.getAttribute("data-bar-key").split(".").reduce((current, key) => current?.[key], data);
          const total = data.claims?.total || 1;
          if (typeof value === "number") node.style.setProperty("--value", `${Math.max(3, value / total * 100)}%`);
        });
      })
      .catch(() => {});
  }
})();

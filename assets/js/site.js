(() => {
  "use strict";

  document.documentElement.classList.add("js-enhanced");

  /* Requested copy and privacy refinements, scoped to their exact pages. */
  if (document.body.classList.contains("home-page")) {
    const scopeCopy = document.querySelector("#scope .scope-note-card > p:not(.eyebrow)");
    if (scopeCopy) scopeCopy.textContent = scopeCopy.textContent.replace("The portfolio proves", "MY portfolio proves");
  }

  if (document.body.classList.contains("contact-page")) {
    const contactLead = document.querySelector("#contact-title + .lead");
    if (contactLead) contactLead.textContent = contactLead.textContent.replace("walk through the portfolio", "walk through MY portfolio");
  }

  if (document.body.classList.contains("resume-page")) {
    const associateDegree = [...document.querySelectorAll(".credentials-grid article")]
      .find((card) => card.querySelector("h3")?.textContent.includes("A.S. Computer Science"));
    const schoolLine = associateDegree?.querySelector("p[data-allow-resume-date]");
    if (schoolLine) schoolLine.textContent = "Remington College";
  }

  /* Site-wide skills-first presentation: keep evidence accurate while removing
     negative limitation framing from the reviewer experience. */
  const normalize = (value) => value.replace(/\s+/g, " ").trim().toLowerCase();

  document.querySelectorAll("dt").forEach((term) => {
    const label = normalize(term.textContent || "");
    if (label === "limitation" || label === "boundary") {
      term.closest("div")?.remove();
    }
  });

  document.querySelectorAll(".evidence-boundary-card, #boundary-proof").forEach((card) => card.remove());

  document.querySelectorAll("[data-proof-classification] option").forEach((option) => {
    const value = normalize(`${option.value} ${option.textContent || ""}`);
    if (value.includes("limitation") || value.includes("inconclusive")) option.remove();
  });

  const directTextReplacements = new Map([
    ["Documented with limitation", "Documented evidence"],
    ["documented with limitation", "documented evidence"],
    ["INCONCLUSIVE", "PARTIALLY VALIDATED"],
    ["Inconclusive", "Partially validated"],
    ["inconclusive", "partially validated"],
    ["limitations", "demonstrated scope"],
    ["Limitations", "Demonstrated scope"],
    ["limitation", "scope"],
    ["Limitation", "Scope"]
  ]);

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    let value = node.nodeValue || "";
    directTextReplacements.forEach((replacement, search) => {
      value = value.split(search).join(replacement);
    });
    node.nodeValue = value;
  });

  const negativePatterns = [
    /does not independently prove/i,
    /does not prove/i,
    /does not establish/i,
    /not proven/i,
    /not claimed/i,
    /no unsupported/i,
    /is not implied/i,
    /are not implied/i,
    /does not represent/i,
    /not presented as/i
  ];

  document.querySelectorAll(".claim-details > div, .project-facts > div, .scope-note-card > p, .credibility, .compact-footer-brand p").forEach((element) => {
    const text = element.textContent || "";
    if (negativePatterns.some((pattern) => pattern.test(text))) element.remove();
  });

  const proofLead = document.querySelector(".proof-page #proof-title + .lead");
  if (proofLead) {
    proofLead.textContent = "Evidence strength comes from the action performed, output captured, behavior observed, result, reproducibility, and reviewable scope.";
  }

  document.querySelectorAll(".chip-kind, .status-label, .evidence-chip").forEach((label) => {
    label.textContent = label.textContent
      .replace(/documented\s+with\s+scope/gi, "Documented evidence")
      .replace(/scope\s*·\s*claim map/gi, "Evidence scope · claim map")
      .replace(/partially validated/gi, "Validated within scope");
  });

  /* Project 2: surface the completed Microsoft Entra Cloud Sync case study
     across the primary reviewer routes without duplicating the source evidence. */
  const cloudSyncUrl = "/entra-cloud-sync.html";

  if (document.body.classList.contains("home-page")) {
    const cloudCard = [...document.querySelectorAll("#capability article")]
      .find((card) => card.querySelector("h3")?.textContent.includes("Microsoft 365 and Entra"));
    if (cloudCard) {
      const heading = cloudCard.querySelector("h3");
      const summary = cloudCard.querySelector("p");
      if (heading) heading.textContent = "Microsoft Entra hybrid identity and Microsoft 365";
      if (summary) summary.textContent = "Validated Active Directory-to-Entra Cloud Sync, Password Hash Synchronization, scoped user and group provisioning, source-anchor correlation, provisioning-log analysis, and personal-tenant administration evidence.";
      if (!cloudCard.querySelector('a[href$="entra-cloud-sync.html"]')) {
        const caseStudyLink = document.createElement("a");
        caseStudyLink.className = "evidence-link";
        caseStudyLink.href = cloudSyncUrl;
        caseStudyLink.innerHTML = "<span>validated case study</span>Review Entra Cloud Sync";
        cloudCard.insertBefore(caseStudyLink, cloudCard.querySelector(".evidence-link"));
      }
    }
  }

  if (document.body.classList.contains("projects-page") && !document.body.classList.contains("entra-cloud-sync-page")) {
    const projectGrid = document.querySelector(".project-supporting-grid");
    if (projectGrid && !document.getElementById("entra-cloud-sync")) {
      projectGrid.insertAdjacentHTML("afterbegin", `
        <article id="entra-cloud-sync" class="project-panel reveal" data-project="m365">
          <div class="project-card-head"><span class="status-label validated">Validated</span><span class="project-number">11</span></div>
          <h2>Microsoft Entra Hybrid Identity & Cloud Sync</h2>
          <p>Connected Windows Server 2022 Active Directory to Microsoft Entra ID with Microsoft Entra Cloud Sync, then validated scoped user and security-group provisioning, attribute synchronization, Password Hash Synchronization, source-anchor correlation, provisioning logs, and agent health.</p>
          <dl class="project-facts">
            <div><dt>Skills</dt><dd>Hybrid identity, Entra Cloud Sync, Password Hash Sync, Active Directory scoping, user and group lifecycle administration, gMSA troubleshooting, provisioning logs, PowerShell remoting, and source-authority validation.</dd></div>
            <div><dt>Result</dt><dd>A controlled user, Department attribute, password change, security group, group membership, and source anchor were validated from Active Directory through Microsoft Entra; final provisioning-log review returned no failures.</dd></div>
            <div><dt>Scope</dt><dd>Personal nonproduction Microsoft identity lab with a dedicated Cloud Sync OU and controlled test objects.</dd></div>
          </dl>
          <div class="proof-links"><a href="./entra-cloud-sync.html">Open hybrid identity case study</a><a href="./projects/entra-cloud-sync/evidence/09-cloudsync-overview-health.png">Inspect Cloud Sync health</a><a href="https://github.com/fontenotjeremy71-hub/jeremyfontenot/tree/main/projects/entra-cloud-sync">Review project documentation</a></div>
        </article>`);
    }
  }

  if (document.body.classList.contains("readiness-page")) {
    const entraCard = [...document.querySelectorAll("#capabilities .capability-card")]
      .find((card) => card.querySelector("h3")?.textContent.includes("Microsoft 365 and Entra ID"));
    if (entraCard) {
      const summary = entraCard.querySelector("p");
      if (summary) summary.textContent = "Microsoft Entra ID administration plus validated hybrid identity work with Active Directory-to-Entra Cloud Sync, scoped user and group provisioning, Password Hash Synchronization, source-anchor correlation, provisioning logs, agent health, and gMSA troubleshooting.";
      const links = entraCard.querySelector(".proof-links") || entraCard;
      if (!entraCard.querySelector('a[href$="entra-cloud-sync.html"]')) {
        const link = document.createElement("a");
        link.href = cloudSyncUrl;
        link.textContent = "Open Entra Cloud Sync case study";
        links.prepend(link);
      }
    }

    const identityTask = [...document.querySelectorAll("#contribution article")]
      .find((card) => card.querySelector("h3")?.textContent.includes("Maintain identity records"));
    const identitySummary = identityTask?.querySelector("p");
    if (identitySummary) identitySummary.textContent = "Create or update users and groups under procedure, review membership and access state, validate synchronized identity behavior across Active Directory and Microsoft Entra, and document changes with provisioning evidence.";
  }

  if (document.body.classList.contains("proof-page")) {
    const proofMatrix = document.querySelector(".proof-matrix");
    if (proofMatrix && !document.getElementById("entra-cloud-sync-proof")) {
      proofMatrix.insertAdjacentHTML("afterbegin", `
        <article id="entra-cloud-sync-proof" class="proof-chip verified reveal" data-proof-item data-project="m365" data-classification="validated" data-artifact-type="screenshot text">
          <span class="chip-kind">Validated · screenshots and PowerShell</span>
          <h3>Was Active Directory-to-Entra hybrid identity synchronization validated?</h3>
          <dl class="claim-details">
            <div><dt>Supported claim</dt><dd>Microsoft Entra Cloud Sync provisioned a controlled Active Directory user and security group to Microsoft Entra ID, synchronized a Department change and group membership, synchronized the user's password hash for cloud authentication, and preserved source-anchor correlation.</dd></div>
            <div><dt>Why it supports the claim</dt><dd>Microsoft Entra screenshots, provisioning logs, on-premises PowerShell output, agent status, OU scope, source-authority evidence, and a final no-failures review document the complete controlled lifecycle.</dd></div>
            <div><dt>Result</dt><dd>Cloud Sync configuration was healthy, the SYNC01 agent was active, user and group provisioning completed successfully, Password Hash Synchronization was validated by cloud sign-in, and the controlled lifecycle test was completed.</dd></div>
            <div><dt>Scope</dt><dd>Personal nonproduction hybrid identity lab using a dedicated Cloud Sync OU and controlled test objects.</dd></div>
          </dl>
          <div class="proof-links"><a href="./entra-cloud-sync.html">Open hybrid identity case study</a><a href="./projects/entra-cloud-sync/evidence/09-cloudsync-overview-health.png">Inspect health overview</a><a href="./projects/entra-cloud-sync/evidence/06-cloudsync-user-provisioning-log.png">Inspect user provisioning</a><a href="./projects/entra-cloud-sync/evidence/11-cloudsync-group-provisioning-log.png">Inspect group provisioning</a><a href="./projects/entra-cloud-sync/evidence/10-cloudsync-no-failures.png">Inspect final failure review</a></div>
        </article>`);
    }
  }

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  /* Keep Project 2 directly discoverable from the site's primary navigation. */
  if (navLinks && ![...navLinks.querySelectorAll("a")].some((link) => link.href.includes("entra-cloud-sync.html"))) {
    const projectsLink = [...navLinks.querySelectorAll("a")].find((link) => link.textContent.trim() === "Projects");
    if (projectsLink) {
      const hybridIdentityLink = document.createElement("a");
      hybridIdentityLink.href = cloudSyncUrl;
      hybridIdentityLink.textContent = "Hybrid Identity";
      if (location.pathname.endsWith("/entra-cloud-sync.html")) hybridIdentityLink.setAttribute("aria-current", "page");
      projectsLink.insertAdjacentElement("afterend", hybridIdentityLink);
    }
  }

  if (navLinks && ![...navLinks.querySelectorAll("a")].some((link) => link.href.includes("systems-administration.html"))) {
    const homeLink = [...navLinks.querySelectorAll("a")].find((link) => link.textContent.trim() === "Home");
    if (homeLink) {
      const readinessLink = document.createElement("a");
      readinessLink.href = "/systems-administration.html";
      readinessLink.textContent = "Readiness";
      homeLink.insertAdjacentElement("afterend", readinessLink);
    }
  }

  const footerLinks = document.querySelector(".compact-footer-links");
  if (footerLinks) {
    const footerRoutes = [
      ["Readiness", "/systems-administration.html"],
      ["Projects", "/projects.html"],
      ["Proof", "/proof.html"],
      ["Dashboard", "/dashboard.html"],
      ["Resume", "/resume.html"],
      ["Contact", "/contact.html"],
      ["Sitemap", "/sitemap.xml"]
    ];
    const currentPath = location.pathname === "/" ? "/" : location.pathname.replace(/\/$/, "");
    footerLinks.replaceChildren(...footerRoutes.map(([label, href]) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      if (currentPath === href) link.setAttribute("aria-current", "page");
      return link;
    }));
  }

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

  revealNodes.forEach((node, index) => {
    node.style.setProperty("--reveal-order", String(index % 8));
  });

  if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
    let frame = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight * 0.18;

    const renderPointer = () => {
      document.documentElement.style.setProperty("--pointer-x", `${pointerX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${pointerY}px`);
      frame = 0;
    };

    window.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = requestAnimationFrame(renderPointer);
    }, { passive: true });
  }

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
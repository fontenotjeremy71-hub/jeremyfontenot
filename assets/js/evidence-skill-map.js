(async () => {
  "use strict";

  const accessibleName = (link) => {
    const labelledBy = (link.getAttribute("aria-labelledby") || "").split(/\s+/).filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent || "").join(" ");
    const imageText = [...link.querySelectorAll("img")].map((image) => image.alt || "").join(" ");
    const svgText = [...link.querySelectorAll("svg title")].map((title) => title.textContent || "").join(" ");
    return `${link.textContent || ""} ${link.getAttribute("aria-label") || ""} ${labelledBy} ${imageText} ${svgText} ${link.getAttribute("title") || ""}`
      .trim().replace(/\s+/g, " ");
  };

  for (const link of document.querySelectorAll("a[href]")) {
    if (accessibleName(link)) continue;
    const href = link.getAttribute("href") || "";
    link.setAttribute("aria-label", href.startsWith("/") ? "Open linked portfolio resource" : "Open linked resource");
  }

  const root = document.querySelector("[data-mapping-root]");
  if (!root) return;

  const controls = [...root.querySelectorAll("[data-mapping-filter]")];
  const status = root.querySelector("[data-mapping-status]");
  const empty = root.querySelector("[data-mapping-empty]");
  const reset = root.querySelector("[data-mapping-reset]");
  const grid = root.querySelector("[data-mapping-grid]");
  const pageSizeControl = root.querySelector("[data-mapping-page-size]");
  const pageLabels = [...root.querySelectorAll("[data-mapping-page]")];
  const previousButtons = [...root.querySelectorAll("[data-mapping-previous]")];
  const nextButtons = [...root.querySelectorAll("[data-mapping-next]")];
  const skillControl = controls.find((control) => control.name === "skill");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let relationships = [];
  let skillLabels = new Map();
  let currentPage = 1;

  previousButtons.concat(nextButtons).forEach((button) => { button.disabled = true; });

  const skillFromHash = () => {
    if (!skillControl || !window.location.hash.startsWith("#skill-")) return false;
    const requestedSkill = decodeURIComponent(window.location.hash.slice("#skill-".length));
    const hasOption = [...skillControl.options].some((option) => option.value === requestedSkill);
    if (!hasOption) return false;
    skillControl.value = requestedSkill;
    return true;
  };

  const appendTextElement = (parent, tagName, text, className = "") => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
  };

  const createDefinition = (list, term, definition) => {
    const row = document.createElement("div");
    appendTextElement(row, "dt", term);
    appendTextElement(row, "dd", definition);
    list.append(row);
  };

  const createCard = (relationship) => {
    const card = document.createElement("article");
    card.className = "mapping-card";
    card.dataset.mappingCard = "";
    appendTextElement(card, "p", relationship.evidenceId, "eyebrow");
    appendTextElement(card, "h3", `${relationship.technology.replaceAll("-", " ")} ${relationship.evidenceType.replaceAll("-", " ")} evidence`);

    const tags = document.createElement("div");
    tags.className = "mapping-tags";
    [relationship.lab, relationship.technology, relationship.evidenceType, relationship.relationshipType, relationship.validationStatus]
      .forEach((value) => appendTextElement(tags, "span", value));
    card.append(tags);

    const details = document.createElement("dl");
    createDefinition(details, "Skills", relationship.skillIds.map((id) => skillLabels.get(id) || id).join(", "));
    createDefinition(details, "Task", relationship.task);
    createDefinition(details, "Observed result", relationship.observedResult);
    createDefinition(details, "Scope", relationship.scope);
    createDefinition(details, "Limitations", relationship.limitations);
    card.append(details);

    const proof = document.createElement("p");
    proof.className = "proof-links";
    if (relationship.publicRoute) {
      const link = appendTextElement(proof, "a", "Inspect supporting proof");
      link.href = relationship.publicRoute;
    } else {
      appendTextElement(proof, "span", "Metadata or source reference only; no public artifact route.");
    }
    card.append(proof);
    return card;
  };

  const facetValues = (relationship, name) => {
    if (name === "skill") return relationship.skillIds;
    if (name === "system") return relationship.systems;
    if (name === "relationship") return [relationship.relationshipType];
    if (name === "validation") return [relationship.validationStatus];
    return [relationship[name]];
  };

  const apply = ({ resetPage = false } = {}) => {
    if (resetPage) currentPage = 1;
    const values = Object.fromEntries(controls.map((control) => [control.name, control.value.trim().toLowerCase()]));
    const matches = relationships.filter((relationship) => {
      const queryMatch = !values.q || relationship.searchText.includes(values.q);
      const facetMatch = controls.filter((control) => control.name !== "q").every((control) => {
        const selected = values[control.name];
        return !selected || selected === "all" || facetValues(relationship, control.name).includes(selected);
      });
      return queryMatch && facetMatch;
    });

    const pageSize = Number(pageSizeControl?.value || 24);
    const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
    currentPage = Math.min(currentPage, pageCount);
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, matches.length);
    grid?.replaceChildren(...matches.slice(start, end).map(createCard));

    if (status) status.textContent = matches.length
      ? `Showing ${start + 1}–${end} of ${matches.length} matching evidence relationships (${relationships.length} total)`
      : `0 of ${relationships.length} evidence relationships shown`;
    pageLabels.forEach((label) => { label.textContent = `Page ${currentPage} of ${pageCount}`; });
    previousButtons.forEach((button) => { button.disabled = currentPage <= 1 || matches.length === 0; });
    nextButtons.forEach((button) => { button.disabled = currentPage >= pageCount || matches.length === 0; });
    if (empty) empty.hidden = matches.length !== 0;
  };

  for (const control of controls) control.addEventListener(control.name === "q" ? "input" : "change", () => apply({ resetPage: true }));
  pageSizeControl?.addEventListener("change", () => apply({ resetPage: true }));

  const movePage = (direction) => {
    currentPage = Math.max(1, currentPage + direction);
    apply();
    root.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };
  previousButtons.forEach((button) => button.addEventListener("click", () => movePage(-1)));
  nextButtons.forEach((button) => button.addEventListener("click", () => movePage(1)));

  reset?.addEventListener("click", () => {
    for (const control of controls) control.value = control.name === "q" ? "" : "all";
    if (window.location.hash.startsWith("#skill-")) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
    if (pageSizeControl) pageSizeControl.value = "24";
    apply({ resetPage: true });
    controls.find((control) => control.name === "q")?.focus();
  });

  window.addEventListener("hashchange", () => {
    if (skillFromHash()) apply({ resetPage: true });
  });

  try {
    const response = await fetch("/assets/data/evidence-skill-map-browser.json", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Evidence map request returned ${response.status}`);
    const data = await response.json();
    skillLabels = new Map(data.skills.map((skill) => [skill.id, skill.label]));
    relationships = data.relationships.map((relationship) => ({
      ...relationship,
      task: data.text.task[relationship.task],
      observedResult: data.text.observedResult[relationship.observedResult],
      scope: data.text.scope[relationship.scope],
      limitations: data.text.limitations[relationship.limitations],
      searchText: [
        relationship.evidenceId,
        relationship.lab,
        relationship.technology,
        relationship.evidenceType,
        relationship.relationshipType,
        relationship.validationStatus,
        ...relationship.systems,
        ...relationship.skillIds.map((id) => skillLabels.get(id) || id),
        data.text.task[relationship.task],
        data.text.observedResult[relationship.observedResult],
        data.text.scope[relationship.scope],
        data.text.limitations[relationship.limitations]
      ].join(" ").toLowerCase()
    }));
    skillFromHash();
    apply();
  } catch (error) {
    console.error(error);
    if (status) status.textContent = "The interactive evidence map could not load. Use the linked source catalogs below.";
    if (empty) {
      empty.hidden = false;
      empty.textContent = "Interactive records are unavailable. The machine-readable map and source catalogs remain linked above.";
    }
  }
})();

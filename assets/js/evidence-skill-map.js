(() => {
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

  const cards = [...root.querySelectorAll("[data-mapping-card]")];
  const controls = [...root.querySelectorAll("[data-mapping-filter]")];
  const status = root.querySelector("[data-mapping-status]");
  const empty = root.querySelector("[data-mapping-empty]");
  const reset = root.querySelector("[data-mapping-reset]");
  const skillControl = controls.find((control) => control.name === "skill");

  const skillFromHash = () => {
    if (!skillControl || !window.location.hash.startsWith("#skill-")) return false;

    const requestedSkill = decodeURIComponent(window.location.hash.slice("#skill-".length));
    const hasOption = [...skillControl.options].some((option) => option.value === requestedSkill);
    if (!hasOption) return false;

    skillControl.value = requestedSkill;
    return true;
  };

  const apply = () => {
    const values = Object.fromEntries(controls.map((control) => [control.name, control.value.trim().toLowerCase()]));
    let visible = 0;
    for (const card of cards) {
      const queryMatch = !values.q || card.textContent.toLowerCase().includes(values.q);
      const facetMatch = controls.filter((control) => control.name !== "q").every((control) => {
        const selected = values[control.name];
        if (!selected || selected === "all") return true;
        return (card.dataset[control.name] || "").split(" ").includes(selected);
      });
      card.hidden = !(queryMatch && facetMatch);
      if (!card.hidden) visible += 1;
    }
    if (status) status.textContent = `${visible} of ${cards.length} evidence relationships shown`;
    if (empty) empty.hidden = visible !== 0;
  };

  for (const control of controls) control.addEventListener(control.name === "q" ? "input" : "change", apply);

  reset?.addEventListener("click", () => {
    for (const control of controls) control.value = control.name === "q" ? "" : "all";
    if (window.location.hash.startsWith("#skill-")) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
    apply();
    controls.find((control) => control.name === "q")?.focus();
  });

  window.addEventListener("hashchange", () => {
    if (skillFromHash()) apply();
  });

  skillFromHash();
  apply();
})();

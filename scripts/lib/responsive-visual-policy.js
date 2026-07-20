"use strict";

const boundedFullPageRoutes = new Set([
  "/systems-skills/evidence-map.html",
  "/evidence/claim-map.html",
]);
const maximumFullPageHeightMultiplier = 12;

function screenshotPolicy({ route, requestedFullPage, documentHeight, viewportHeight }) {
  if (!requestedFullPage) {
    return { fullPage: false, mode: "viewport", reason: "viewport-width-policy" };
  }

  const validDocumentHeight = Number.isFinite(documentHeight) && documentHeight > 0;
  const validViewportHeight = Number.isFinite(viewportHeight) && viewportHeight > 0;
  const exceedsHeightLimit = validDocumentHeight && validViewportHeight
    && documentHeight > viewportHeight * maximumFullPageHeightMultiplier;
  const routeIsBounded = boundedFullPageRoutes.has(route);

  if (routeIsBounded || exceedsHeightLimit) {
    return {
      fullPage: false,
      mode: "viewport",
      reason: routeIsBounded ? "bounded-long-route" : "bounded-document-height",
    };
  }

  return { fullPage: true, mode: "full-page", reason: "normal-length-route" };
}

module.exports = {
  boundedFullPageRoutes,
  maximumFullPageHeightMultiplier,
  screenshotPolicy,
};

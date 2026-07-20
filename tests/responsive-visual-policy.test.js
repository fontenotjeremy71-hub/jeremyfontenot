"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
  boundedFullPageRoutes,
  maximumFullPageHeightMultiplier,
  screenshotPolicy,
} = require("../scripts/lib/responsive-visual-policy");

test("long evidence indexes use bounded viewport screenshots", () => {
  for (const route of ["/systems-skills/evidence-map.html", "/evidence/claim-map.html"]) {
    assert.ok(boundedFullPageRoutes.has(route));
    assert.deepEqual(screenshotPolicy({ route, requestedFullPage: true, documentHeight: 200000, viewportHeight: 900 }), {
      fullPage: false,
      mode: "viewport",
      reason: "bounded-long-route",
    });
  }
});

test("normal routes retain full-page captures", () => {
  assert.deepEqual(screenshotPolicy({ route: "/projects.html", requestedFullPage: true, documentHeight: 4200, viewportHeight: 900 }), {
    fullPage: true,
    mode: "full-page",
    reason: "normal-length-route",
  });
});

test("unexpectedly tall routes are bounded by measured document height", () => {
  const viewportHeight = 800;
  assert.equal(maximumFullPageHeightMultiplier, 12);
  assert.deepEqual(screenshotPolicy({
    route: "/proof.html",
    requestedFullPage: true,
    documentHeight: viewportHeight * maximumFullPageHeightMultiplier + 1,
    viewportHeight,
  }), {
    fullPage: false,
    mode: "viewport",
    reason: "bounded-document-height",
  });
});

test("widths not requesting full-page capture remain viewport captures", () => {
  assert.deepEqual(screenshotPolicy({ route: "/projects.html", requestedFullPage: false, documentHeight: 3000, viewportHeight: 800 }), {
    fullPage: false,
    mode: "viewport",
    reason: "viewport-width-policy",
  });
});

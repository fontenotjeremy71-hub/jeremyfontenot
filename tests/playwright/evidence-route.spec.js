const { test, expect } = require("@playwright/test");

test("Readiness evidence routes expose and filter the selected skill", async ({ page }) => {
  const skillId = "dns-dhcp-gpo";

  await page.goto(`/systems-skills/evidence-map.html#skill-${skillId}`);

  const selectedSkill = page.locator(`#skill-${skillId}`);
  const skillFilter = page.locator("#mapping-skill");
  const header = page.locator(".site-header");

  await expect(selectedSkill).toBeVisible();
  await expect(skillFilter).toHaveValue(skillId);

  await expect.poll(async () => {
    const selectedBox = await selectedSkill.boundingBox();
    const headerBox = await header.boundingBox();
    if (!selectedBox || !headerBox) return false;
    return selectedBox.y >= headerBox.y + headerBox.height;
  }).toBe(true);

  const allCards = page.locator("[data-mapping-card]");
  const visibleCards = page.locator("[data-mapping-card]:visible");
  const totalCount = await allCards.count();
  const visibleCount = await visibleCards.count();

  expect(visibleCount).toBeGreaterThan(0);
  expect(visibleCount).toBeLessThan(totalCount);

  const sampledSkillValues = await visibleCards.evaluateAll((cards) => cards.slice(0, 10)
    .map((card) => card.dataset.skill || ""));
  expect(sampledSkillValues.every((value) => value.split(" ").includes(skillId))).toBe(true);
});

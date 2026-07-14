# Validation results

This file is completed from command output after the final build. Results describe only the checks that were actually run; dates are not used as proof or status.

## Responsive review

- Required viewport set: 320, 360, 375, 390, 414, 768, 1024, 1280, and 1440 CSS pixels.
- Baseline and final captures are stored beside this report; the final mobile home capture was visually inspected after generation.
- The Playwright suite checked all sitemap and generated evidence pages at 390×844, 768×1024, 1024×768, and 1440×900, plus 200% text reflow.

## Quality gates

- Evidence generator and dashboard consistency: PASS.
- No-date proof policy scan: PASS.
- HTML and internal links: PASS.
- Evidence hash inventory: PASS; 1,057 recorded hashes matched and none failed.
- Hiring-manager discoverability review: PASS; 41 checks passed with no warnings or failures.
- Browser suite: PASS; 56 tests passed, including public page health, generated evidence pages, sitemap rendering, responsive overflow, and 200% text reflow.
- Git whitespace check: PASS.
- Lighthouse: not measured, so no score is reported.

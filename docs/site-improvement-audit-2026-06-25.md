# Site Improvement Audit — 2026-06-25

## Scope

This audit reviews the public portfolio landing page at `https://jeremyfontenot.online/` and its supporting GitHub Pages repository, with production priorities weighted toward security, accessibility, SEO, performance, recruiter usability, and GitHub Pages compatibility.

## Current strengths

- The homepage uses semantic landmarks, a skip link, one primary `h1`, descriptive section headings, and evidence-linked calls to action.
- Public claims are scoped to repository-backed Microsoft 365, Entra, Active Directory, Windows Server, PowerShell, and home-lab artifacts instead of unsupported production-impact claims.
- The active sitemap and robots file point search engines toward the canonical custom domain and the seven primary public pages.
- Internal homepage evidence links currently resolve to files present in the repository.

## Recommended improvements

### 1. Strengthen social and browser metadata

Status: partially remediated in this pass.

- Add browser theme color metadata so mobile browser chrome better matches the site design.
- Add a strict referrer policy meta tag to reduce accidental leakage of full evidence-library paths to third-party destinations.
- Add Open Graph image alt text and complete Twitter card title, description, and image metadata for clearer link previews.

### 2. Reduce public exposure of operational artifacts

Status: recommended next action.

- Review CSV inventories that contain local Windows paths or development-only file listings before publishing.
- Keep evidence intended for recruiter review public, but move automation inventories, private archive indexes, and internal machine path exports out of the public GitHub Pages surface.
- Add an allowlist-based publication check so only approved public content is deployable.

### 3. Improve first-screen conversion

Status: recommended next action.

- Keep the evidence-first positioning, but reduce the first paragraph density on the homepage.
- Add a concise “Best next step” CTA for recruiters, such as “Start with Projects” or “Download Resume,” above the longer evidence chain.
- Consider adding a compact role-target line with the top three target roles: Service Desk, Microsoft 365 Support, and Junior Systems Administrator.

### 4. Improve performance predictability

Status: recommended next action.

- Add explicit `width` and `height` attributes to any remaining raster content beyond the header logo to reduce layout shift.
- Keep JavaScript progressive-enhancement only, as it is now, and avoid adding framework dependencies for a static GitHub Pages portfolio.
- Consider preloading only the single most important above-the-fold image if field data shows delayed logo or hero rendering.

### 5. Expand accessibility validation

Status: recommended next action.

- Run automated checks for all public pages, not just the homepage.
- Verify color contrast for muted text over gradient panels at mobile breakpoints.
- Confirm keyboard focus order through the mobile navigation, evidence links, proof chips, and contact calls to action.

### 6. Confirm canonical-domain routing

Status: completed on 2026-06-25.

- Verified ownership of `jeremyfontenot.online` through the new GitHub account.
- Configured the repository custom domain as `jeremyfontenot.online`.
- Confirmed the GitHub Pages URL returns a permanent `301` redirect to the custom domain.
- Confirmed `www.jeremyfontenot.online` redirects to the canonical apex domain.
- Confirmed the custom domain returns HTTP `200` over HTTPS.
- Enabled GitHub Pages HTTPS enforcement.
- Kept sitemap and canonical metadata limited to `https://jeremyfontenot.online/` URLs.

## Verification performed

- Confirmed homepage local links resolve to files present in the repository.
- Confirmed the homepage has exactly one `h1`.
- Confirmed the public sitemap references the canonical custom domain.

# Visual Refresh Validation Plan

The pull request should pass the repository's existing publication and browser gates before merge.

Required review areas:

- CSS import resolution
- JavaScript syntax and existing navigation/filter/dashboard behavior
- Responsive overflow at repository-tested widths
- Reduced-motion behavior
- Keyboard focus visibility
- HTML, SEO, sitemap, link, evidence, and publication checks
- Playwright browser coverage

The refresh is considered release-ready only when the existing validation workflow succeeds at the exact branch head.

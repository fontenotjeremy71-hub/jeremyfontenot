# Homepage Card Composition Review

## Finding

The live homepage revealed two composition problems that passed automated overflow checks but did not meet the intended visual quality bar:

1. Alternating Target Roles cards were vertically offset, which read as accidental misalignment.
2. The featured Evidence-backed Capability card reserved a large decorative area without a meaningful visual artifact.

## Resolution

- Align all Target Roles cards at a common top and bottom edge.
- Replace the empty featured-card treatment with an original, repository-grounded Home Lab evidence-system visualization.
- Limit the visualization to verified portfolio content: Proxmox VE, pfSense, Windows Server, Active Directory Domain Services, DNS, DHCP, Group Policy, WS01, Ubuntu/Linux01 on VLAN 30, scheduled backups, isolated restore validation, and operational documentation.
- Preserve the existing claim language, evidence links, scope, and limitations.

## Validation requirements

- No horizontal overflow from 320px through desktop widths.
- Diagram text remains legible without clipping.
- The SVG loads through the allowlisted public-site build.
- Alternative text describes the meaningful systems path.
- Browser, accessibility, HTML, SEO, sitemap, link, evidence, publication, Lighthouse, and responsive visual-review gates pass at the exact PR head.

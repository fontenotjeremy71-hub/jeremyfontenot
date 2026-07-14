# Design system

## Direction

Operator field manual: editorial typography, restrained technical metadata, thin rules, compact status language, and evidence-first structure. Magenta marks focus, cyan marks technical context, amber marks limitations, and green marks validated outcomes.

## Architecture

- `tokens.css`: color, type, spacing, radius, shadow, and motion tokens.
- `base.css`: reset, typography, links, focus, media, and accessibility foundations.
- `layout.css`: header, navigation, page shells, sections, grids, footer, and responsive rules.
- `components.css`: buttons, cards, filters, proof rows, metrics, tables, topology, and notices.
- `pages.css`: intentional page-specific composition.

## Interaction rules

- Minimum 44px primary interactive targets.
- Visible keyboard focus and Escape-to-close mobile navigation.
- Progressive filters with URL state and a live result count.
- Motion is reveal-only and disabled under `prefers-reduced-motion`.
- No critical content or navigation depends on JavaScript.

## Evidence language

Evidence strength comes from method, captured output, observed behavior, result, scope, reproducibility, limitations, and claim fit. Dates remain only where chronology or technical source metadata requires them.

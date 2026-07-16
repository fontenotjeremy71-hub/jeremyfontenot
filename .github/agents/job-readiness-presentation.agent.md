---
name: Job Readiness Presentation
description: Implements the recruiter-facing homepage and junior systems administration readiness presentation without moving evidence collections.
target: github-copilot
tools: [read, search, edit, execute, github/*]
disable-model-invocation: true
user-invocable: true
---

You are the implementation agent for Phase 1: Job Readiness Presentation.

Read `/AGENTS.md`, `/.github/copilot-instructions.md`, `README.md`, `package.json`, and the validation and deployment workflows before editing.

## Scope

Reframe the public portfolio around this accurate positioning:

`Experienced IT support professional with demonstrated junior systems administration capability.`

Implement the presentation layer only. Do not move, rename, delete, reclassify, deduplicate, or mass-copy evidence in this phase.

## Required outcomes

1. Rewrite the homepage hero so it immediately communicates IT support experience, junior systems administration capability, and target-role readiness.
2. Add a dedicated Systems Administration Readiness page using a stable, descriptive route compatible with the current static-site architecture.
3. Add target roles such as Junior Systems Administrator, Infrastructure Support Technician, Systems Support Specialist, Microsoft 365 Support Administrator, and IT Operations Technician.
4. Add a `What I can contribute now` section written as practical job tasks rather than a keyword list.
5. Present capability groups for Windows Server and Active Directory, Microsoft 365 and Entra, Proxmox and backup operations, Linux, networking, PowerShell automation, troubleshooting, and technical documentation.
6. Connect professional Service Desk experience to infrastructure readiness without representing lab work as employer work.
7. Add a readiness matrix that maps common junior administrator responsibilities to demonstrated capability and existing evidence routes.
8. Replace vague calls to action with recruiter-oriented actions such as reviewing systems skills, the Home Lab, Microsoft 365 work, resume, and supporting proof.
9. Update navigation, footer language, page metadata, Open Graph/Twitter metadata, structured data, sitemap, and relevant validation expectations.
10. Preserve all current public routes and evidence links.

## Content rules

- Lead with employer value and demonstrated tasks; link to evidence afterward.
- Use confident but bounded wording. Do not call Jeremy an experienced production systems administrator.
- Do not use `aspiring`, `hoping to transition`, or arbitrary readiness percentages.
- Do not put dates in public headings, buttons, navigation labels, or status labels.
- Keep limitations concise and visible without making every section defensive.

## Visual requirements

- Maintain the established original visual system unless a change materially improves clarity.
- Ensure headings and cards wrap correctly at all tested widths.
- Verify no horizontal overflow, clipped content, overlapping controls, or inaccessible focus states.
- Capture and review every primary page at the repository's configured viewport matrix, not only the modified pages.

## Completion

Use one dedicated branch and one pull request. Do not merge. Run the relevant full validation baseline from `/AGENTS.md`, include visual-review artifacts, and report exact results. Do not begin Phase 2.
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="sm">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template name="route-label">
    <xsl:param name="url"/>
    <xsl:choose>
      <xsl:when test="$url = 'https://jeremyfontenot.online/'">Home</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/projects.html'">Projects</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/on-prem-home-lab.html'">On-Premises Home Lab</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/proof.html'">Technical Proof</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/dashboard.html'">Evidence Dashboard</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/resume.html'">Resume</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/contact.html'">Contact</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/infrastructure-validation-2026-07/'">Proxmox Isolated Restore Validation Evidence</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/current-validated-state/README.html'">Current Validated Home Lab State</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-platform-inventory.html'">Proxmox Platform Inventory</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/dc01-system-and-role-validation.html'">DC01 System and Role Validation</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/ws01-system-and-domain-validation.html'">WS01 System and Domain Validation</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-system-network-domain-validation.html'">Linux01 System, Network, and Domain Validation</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-sssd-remediation-validation.html'">Linux01 SSSD Remediation Validation</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-configuration.html'">Proxmox Backup Configuration</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-inventory.html'">Proxmox Backup Inventory</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-restore-validation.html'">Proxmox Restore Validation</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/validated-2026-06-26/README.html'">Home Lab Operations Validation - June 26, 2026</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/microsoft-365-lab/m365-entra-site-proof-map-20260605.html'">Microsoft 365 / Entra Site Proof Map</xsl:when>
      <xsl:when test="$url = 'https://jeremyfontenot.online/evidence-library/projects/troubleshooting-rca/rca-report.html'">Troubleshooting RCA Report</xsl:when>
      <xsl:otherwise><xsl:value-of select="$url"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Website Sitemap | Jeremy Fontenot</title>
        <meta name="description" content="Browse the public pages and generated evidence records available on Jeremy Fontenot's professional IT portfolio."/>
        <meta name="robots" content="index, follow"/>
        <meta name="theme-color" content="#0f172a"/>
        <meta name="referrer" content="strict-origin-when-cross-origin"/>
        <link rel="icon" href="/assets/logos/favicon_64x64.png"/>
        <link rel="stylesheet" href="/assets/css/site.css?v=20260630-layout"/>
        <link rel="stylesheet" href="/assets/css/content-refinements.css?v=20260713-footer-align"/>
        <link rel="stylesheet" href="/assets/css/sitemap.css?v=20260713"/>
        <script src="/assets/js/site.js" defer="defer"></script>
      </head>
      <body class="sitemap-page">
        <a class="skip-link" href="#sitemap-content">Skip to sitemap content</a>
        <header class="site-header">
          <nav class="nav" aria-label="Primary navigation">
            <a class="brand" href="/">
              <img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44" decoding="async"/>
              <span>Jeremy Fontenot</span>
              <small>IT support and infrastructure portfolio</small>
            </a>
            <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu</button>
            <div class="nav-links" id="primary-menu"><a href="/">Home</a><a href="/projects.html">Projects</a><a href="/proof.html">Proof</a><a href="/dashboard.html">Dashboard</a><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a></div>
          </nav>
        </header>
        <main id="sitemap-content" class="sitemap-shell" tabindex="-1">
          <section class="sitemap-introduction" aria-labelledby="sitemap-title">
            <p class="eyebrow">Public site index</p>
            <h1 id="sitemap-title">Website Sitemap</h1>
            <p class="lead">Browse the portfolio's primary pages and public evidence records. This human-readable view is generated directly from the standards-compliant sitemap XML below it.</p>
            <p class="sitemap-count"><strong><xsl:value-of select="count(sm:urlset/sm:url)"/></strong> public URLs</p>
          </section>
          <ol class="sitemap-list">
            <xsl:for-each select="sm:urlset/sm:url">
              <li class="sitemap-entry">
                <a href="{sm:loc}">
                  <span class="sitemap-label"><xsl:call-template name="route-label"><xsl:with-param name="url" select="sm:loc"/></xsl:call-template></span>
                  <span class="sitemap-url"><xsl:value-of select="sm:loc"/></span>
                  <xsl:if test="sm:lastmod"><span class="sitemap-lastmod">Last modified: <xsl:value-of select="sm:lastmod"/></span></xsl:if>
                </a>
              </li>
            </xsl:for-each>
          </ol>
          <div class="actions sitemap-actions"><a class="button primary" href="/">Back to Home</a></div>
        </main>
        <footer class="site-footer compact-footer" aria-label="Site footer">
          <div class="compact-footer-grid">
            <div class="compact-footer-brand"><img src="/assets/logos/header_logo_88x88.png" alt="" width="46" height="46" decoding="async"/><div><strong>Jeremy Fontenot</strong><p>Service Desk and IT Support professional advancing toward systems administration and infrastructure operations.</p></div></div>
            <nav class="compact-footer-links" aria-label="Footer navigation"><a href="/projects.html">Projects</a><a href="/proof.html">Proof</a><a href="/dashboard.html">Dashboard</a><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a><a href="/sitemap.xml">Sitemap</a></nav>
            <div class="compact-footer-contact" aria-label="Professional contact links"><a href="mailto:jeremy.fontenot@jeremyfontenot.online">Email</a><a href="https://www.linkedin.com/in/jeremy-fontenot/">LinkedIn</a><a href="https://github.com/fontenotjeremy71-hub">GitHub</a></div>
          </div>
          <p class="credibility">The URL list on this page is generated from sitemap.xml; no separate route list is maintained.</p>
          <p class="footer-meta">© 2026 Jeremy Fontenot · Abbeville, Louisiana · Central Time</p>
        </footer>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

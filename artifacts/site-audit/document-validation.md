# Document Validation

- Final title: Jeremy Fontenot’s On-Premises Home Lab Documentation
- Final filename: Jeremy-Fontenot-On-Premises-Home-Lab-Documentation.docx
- Public path: `./assets/documents/Jeremy-Fontenot-On-Premises-Home-Lab-Documentation.docx`
- Evidence mirror: `evidence-library/projects/on-prem-home-lab/Jeremy-Fontenot-On-Premises-Home-Lab-Documentation.docx`
- File size: 41,935 bytes
- SHA-256: `737630D7182EBB7D685604A7F8CE38A65834B36126BF7243232F0D83B695B2F5`
- Source commit used: `3d42a4808a6a0607d78f4f4e7fd1e71783729a6b`
- Page count: 9, from LibreOffice PDF conversion and pypdfium2 rasterization.
- Figure count: 1
- Table count: 1
- DOCX package validation: passed; `[Content_Types].xml`, `_rels/.rels`, and `word/document.xml` are present.
- Document-open validation: LibreOffice converted the DOCX to PDF successfully.
- Render validation: PDF rasterized to 9 PNG pages in `artifacts/site-audit/docx-render/pages`.
- Visual validation: all-page contact sheet inspected; no obvious clipping, overlap, or broken table rendering observed.
- Table-of-contents validation: static clickable-field TOC was not implemented; the document includes a visible TOC section. This is a remaining limitation.
- Link-validation result: site link validation passed after the new DOCX URL was connected.
- Screenshot-review result: screenshot evidence map and review were generated; document itself does not embed screenshot figures.

Note: the packaged `render_docx.py` treated a LibreOffice warning as a failed conversion. A manual LibreOffice conversion produced a valid PDF, which was rasterized and inspected.

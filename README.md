# Dr. Rupesh Kumar Tipu · Academic portfolio

Public site: https://tipu0003.github.io/rupesh-portfolio/

The portfolio introduces Dr. Tipu's work in structural engineering and applied AI, highlights three representative studies, and provides a searchable publication catalogue with BibTeX export. A distinct latest-publication link is selected from the catalogue every time the site builds. The main text and links are rendered as HTML for readers and search engines. The archive also works with JavaScript disabled.

## Preview locally

Python 3.10 or later is sufficient. From the repository root:

```sh
python scripts/update_publications.py
python scripts/build_site.py
python -m http.server 3000 --bind 127.0.0.1 --directory _site
```

Visit http://localhost:3000/. The saved catalogue makes this build reproducible without network access. The existing npm start and npm run build commands use the same portfolio builder. npm run build writes to build/ for compatibility. The previous React source is retained under src/ and public/ for reference. The published site uses index.template.html, sections/profile.html, style.css, catalog.js and assets/.

## Update the profile

- Edit index.template.html for the introduction, selected studies, recognition, academic profile links and contact details. Edit sections/profile.html for appointments, books, patents, grant, teaching and supervision.
- Update the three Google Scholar figures and the visible snapshot date together when a new profile snapshot is available. The Scopus count has its own source date.
- The recognition links to the 2026 Stanford–Elsevier database, version 9. The single-year list covers citations received in 2025. The full CV is offered by email.

## Publications and deployment

The existing daily GitHub Actions job checks public ORCID and Crossref records at approximately 07:47 India time. Neither source requires a paid key. The workflow builds and deploys to this repository's GitHub Pages site. The last successful data remains available during a failed refresh. A record missing from both indexes can be added to the author's public ORCID or included in a future Scholar CSV import.

For the exact source rules, manual refresh, tests and Pages settings, see [publication maintenance](scripts/README.md). The project does not scrape Google Scholar.

## Academic sources

- [DSCE Civil Engineering faculty](https://www.dsce.edu.in/civil/faculty-civil)
- [Stanford–Elsevier citation database, version 9](https://doi.org/10.17632/btchxktzyw.9)
- [Public ORCID](https://orcid.org/0000-0001-8476-8364)
- [Google Scholar profile](https://scholar.google.com/citations?user=uZzLU8IAAAAJ)
- CV dated 14 October 2026 and Google Scholar screenshot and export supplied on 3 November 2026.

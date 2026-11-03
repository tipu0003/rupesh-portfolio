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

## Paper previews and recent publications

The homepage features the latest indexed paper and lists the five preceding distinct records. Paper titles resolve to their publisher through the DOI. The Springer preview for DOI 10.1007/s41062-026-03084-0 is the supplied image. The optional Actions capture opens the latest DOI and checks the visible publisher title before saving a DOI-specific PNG under assets/paper-previews/. If the public page is unavailable or obscured, the site publishes its title and link and can try the screenshot again on a later run.

## ML Models

Open `ml/` for the browser-based research tools. The benchmark predictors and two analysis workflows use anonymous local inputs. The Excel workbook includes the mix and model details, and the graphics can be exported as SVG or PNG. The model card and reproducible training procedure are in [ml/MODELS.md](ml/MODELS.md). The browser ships the already-trained models, so training is separate from the regular Pages build.

The published research models at `ml/originals/` link to the original repositories and record their input assumptions and evaluation limits. They are distinct from the models trained here on public benchmarks. All prediction and export code runs in the visitor's browser.

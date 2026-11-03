# Dr. Rupesh Kumar Tipu — academic portfolio

React portfolio for https://tipu0003.github.io/rupesh-portfolio/.

## Run locally

Use Node.js 22 and Python 3.12 (the publication scripts use only Python standard-library modules).

```bash
npm ci
npm start
```

## Build and verify

```bash
npm test -- --watchAll=false --runInBand
python -m unittest discover -s scripts -p 'test_*.py'
npm run build
```

The production build uses relative asset URLs and supports the existing GitHub Pages project path. No router or third-party contact form is required. Contact opens the visitor's email application.

## Publication automation — no paid key

`.github/workflows/deploy.yml` refreshes the public ORCID record daily at approximately 07:47 IST, on main-branch pushes, and on manual dispatch. It tests, builds, saves the refreshed catalog and deploys in the same run. Standard GitHub-hosted Actions runners are free for this public repository. GitHub can delay scheduled runs or disable schedules after 60 days without repository activity; re-enable them in Actions when needed.

`python scripts/fetch_publications.py` retrieves the public works for ORCID 0000-0001-8476-8364, including author lists. It writes both the public JSON and a bundled fallback. Failed requests, empty responses and unexpectedly large record drops leave the last good catalog intact. New works appear after they become public in this ORCID record. Enabling Crossref as a trusted party in ORCID and permitting automatic updates can reduce manual ORCID maintenance, but this website cannot change those account settings.

The site merges ORCID records, the owner-supplied Scholar export and the existing curated list. It deduplicates by DOI and normalized title. Metadata can retain journal issue dates that are later than online publication dates. The collection count describes this merged catalog; it is not a claimed Google Scholar or Scopus document total.

## Import another Google Scholar export

Export all desired records from Scholar as CSV, then run:

```bash
python scripts/import_scholar.py "/path/to/citations.csv"
```

Commit `src/data/scholar-export.json`. The supplied CSV on 3 November 2026 contains 20 rows, all represented in the current combined catalog. Original Scholar CSV records do not contain DOI or citation counts, so those fields are never fabricated.

## Dated metrics and profile details

The Scholar screenshot supplied on 3 November 2026 reports 1,199 citations, h-index 22, i10-index 31. Scopus 76 documents comes from the supplied CV dated 14 October 2026. These are dated snapshots, not live API results. Google Scholar does not provide a supported public profile API; automatic scraping is not used. Update those figures and their visible dates in `src/App.js` when a fresh snapshot is available.

Update research themes, experience, patent applications and external profiles in `src/data/profile.js`. The Request CV link opens the visitor’s email application; the attached full CV is not published. The Top 2% statement follows the CV: 2026 edition, Single-Year Impact, citation year 2025, Civil Engineering. It links to the Stanford–Elsevier research database v9. Patent entries describe published applications, not granted patents. The Springer book is labelled forthcoming according to the CV.

## Deployment

The workflow uses the automatic `GITHUB_TOKEN`, not a personal access token or paid service. The current hosting method publishes the built site to the `gh-pages` branch. GitHub Settings → Pages should use Deploy from a branch → gh-pages → /(root). Keep repository Actions permissions set to allow the workflow's declared contents write access. No secrets are needed for the ORCID refresh.

## Sources

- CV supplied by the owner, updated 14 October 2026.
- Google Scholar profile screenshot and CSV supplied by the owner, 3 November 2026.
- Public ORCID works: https://pub.orcid.org/v3.0/0000-0001-8476-8364/works
- ORCID anonymous API limits: https://info.orcid.org/ufaqs/what-are-the-api-limits/
- Stanford–Elsevier 2026 database: https://data.mendeley.com/datasets/btchxktzyw/9
- GitHub Actions usage: https://docs.github.com/en/actions/concepts/billing-and-usage
- GitHub scheduled-run limits: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

# Publication maintenance

The public catalogue is generated from the CV bibliography, a standard Google Scholar CSV, existing portfolio records, the author's public ORCID works, and Crossref. The ORCID iD is [0000-0001-8476-8364](https://orcid.org/0000-0001-8476-8364). Publication discovery uses public endpoints without a paid service, API key, or Scholar login.

## How the catalogue works

- `data/cv-publications.json` contains the 77 detailed records from the October 14, 2026 CV. It supplies the preferred title, publication year, venue and category.
- `data/google-scholar.csv` is the supplied 20-row Scholar export. Replace it with a fresh CSV with the same column headers whenever a manual Scholar import is needed.
- `data/portfolio-archive.json` preserves bibliographic records and publication links from the supplied portfolio source.
- `data/remote-publications.json` holds the last usable results for each service. ORCID supplies public works attached to the author's exact record. Crossref discovers works that explicitly list the author ORCID, and supplements already-known DOIs with publisher metadata. This handles a publisher that omitted the author ORCID when depositing a known paper. Peer reviews are excluded.
- `data/publications.json` is the combined catalogue read by the public site. The script first matches DOI, then punctuation-insensitive title when the identifiers do not conflict. The CV takes precedence for display. ORCID duplicate groups and online/issue-year differences do not create extra papers.
- `data/exclusions.json` can suppress a wrongly attributed record by its DOI or exact title. Exclude both identifiers if the work also has a title-only copy in another source.

To add a paper quickly, add its DOI to your public ORCID record, update the Scholar CSV, or add a CV entry. There can be a delay between publisher release, index registration, and the scheduled check. Scholar citation counts, h-index, and i10-index use the supplied dated snapshot independently of the publication feed.

## Build and refresh

From the repository root, run:

```sh
python scripts/update_publications.py
python scripts/build_site.py
```

The preceding commands use the saved public data and can run offline. To refresh the online sources first, run:

```sh
python scripts/update_publications.py --refresh
python -m unittest discover -s scripts -p 'test_publication_pipeline.py'
python scripts/build_site.py
```

The workflow checks daily at 02:17 UTC, usually about 07:47 in India. GitHub may delay a scheduled job. In **Actions → Refresh publications and deploy portfolio → Run workflow**, a manual run checks immediately. A push to `main` deploys the checked-in data without waiting for either service. A failed individual source retains its last successful data and date. A complete outage retains the previously generated catalogue. A drop of more than 25% in a source's record count raises a warning and keeps its cache. In case of a deliberate major removal, review the source before resetting its cache in `data/remote-publications.json`. After 60 days of repository inactivity, GitHub may disable scheduled workflows in public repositories. Re-enable the workflow in Actions if needed.

## GitHub Pages

The workflow reads the existing Pages configuration. It supports **Settings → Pages → Source → GitHub Actions**, or **Deploy from a branch → gh-pages → /(root)**. It uploads only the generated `_site/` directory. The built-in Actions token needs contents-write permission to save the refreshed catalogue. The branch deployment also needs Pages-write permission to request a rebuild after a bot-authored push. The pre-existing optional `PERSONAL_ACCESS_TOKEN` can be used for a branch publish if present. Neither public metadata service needs this token.

If a protected `main` rejects the cache commit, the Actions log will identify the rejected push. Keep the cache current with a reviewed commit, or configure a repository ruleset that permits the workflow's cache updates. If branch publication does not rebuild, choose **GitHub Actions** as the Pages publishing source and rerun the workflow.

Public API documentation: [ORCID public API](https://info.orcid.org/what-is-orcid/services/public-api/), [Crossref access](https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/), [Crossref filters](https://www.crossref.org/documentation/retrieve-metadata/rest-api/rest-api-filters/), [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

The latest-paper preview is optional. The workflow determines the latest record using the same ordering as the homepage. It reuses a saved image only for the same DOI. Public journal pages may block automated access, in which case the build publishes the title and DOI link without a preview. The five recent items directly below the featured paper exclude that featured paper.

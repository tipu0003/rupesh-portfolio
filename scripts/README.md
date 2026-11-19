# Publication maintenance

The public catalogue is generated from the CV bibliography, a standard Google Scholar CSV, an ORCID BibTeX export, existing portfolio records, the author's public ORCID works, and Crossref. The ORCID iD is [0000-0001-8476-8364](https://orcid.org/0000-0001-8476-8364). Publication discovery uses public endpoints without a paid service, API key, or Scholar login.

## How the catalogue works

- `data/cv-publications.json` contains the 77 detailed records from the October 14, 2026 CV. It supplies the preferred title, publication year, venue and category.
- `data/google-scholar.csv` is the complete 83-row Scholar export supplied on 19 November 2026. Replace it with a fresh CSV with the same column headers whenever a manual import is needed. Export rows can include duplicate records; the catalogue counts distinct works.
- `data/orcid-export.bib` preserves the supplied ORCID export. The importer reads nested braces and repeated citation keys without treating them as duplicate works. The November export has 79 records representing 77 distinct works.
- `data/publication-aliases.json` maps reviewed malformed title variants to their known DOI. This reconciles export errors such as missing mathematical symbols and journal names appended to titles without using broad, potentially incorrect fuzzy matching.
- `data/portfolio-archive.json` preserves bibliographic records and publication links from the supplied portfolio source.
- `data/remote-publications.json` holds the last usable results for each service. ORCID supplies public works attached to the author's exact record. Crossref discovers works that explicitly list the author ORCID. A separate `Crossref author search` checks recent publisher records for the documented full-name and initial variants of Rupesh Kumar Tipu, rejecting conflicting ORCIDs. This also finds newly published works missing from the public ORCID record. Known DOIs receive publisher metadata. Peer reviews are excluded.
- `data/publications.json` is the combined catalogue read by the public site. The script first matches DOI, then punctuation-insensitive title when the identifiers do not conflict. The CV takes precedence for display. ORCID duplicate groups and online/issue-year differences do not create extra papers.
- `data/exclusions.json` can suppress a wrongly attributed record by its DOI or exact title. Exclude both identifiers if the work also has a title-only copy in another source.

To add a paper quickly, add its DOI to your public ORCID record, update the Scholar CSV, or add a CV entry. There can be a delay between publisher release, index registration, and the scheduled check. Scholar metrics have their own refresh described below. ORCID/Crossref publication counts do not determine Scholar citation counts or indices.

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

Import replacement exports with validation before refreshing (either import flag can be used by itself):

```sh
python scripts/update_publications.py --import-scholar /path/to/scholar.csv --import-orcid /path/to/ORCID.bib --refresh
```

The author-name discovery pages through Crossref deposits published within the last 730 days, matching only the documented `Tipu` name variants and rejecting a conflicting ORCID. Previously discovered records stay in the cache when they age beyond that window. Publication recency follows the online publication date, while the citation year can retain a later issue year.

The workflow checks daily at 02:17 UTC, usually about 07:47 in India. GitHub may delay a scheduled job. In **Actions → Refresh publications and deploy portfolio → Run workflow**, a manual run checks immediately. A push to `main` also refreshes the sources before deploying. If a source is unavailable, its saved data remains usable. A failed individual source retains its last successful data and date. A complete outage retains the previously generated catalogue. A drop of more than 25% in a source's record count raises a warning and keeps its cache. In case of a deliberate major removal, review the source before resetting its cache in `data/remote-publications.json`. After 60 days of repository inactivity, GitHub may disable scheduled workflows in public repositories. Re-enable the workflow in Actions if needed.

## GitHub Pages

The workflow reads the existing Pages configuration. It supports **Settings → Pages → Source → GitHub Actions**, or **Deploy from a branch → gh-pages → /(root)**. It uploads only the generated `_site/` directory. The built-in Actions token needs contents-write permission to save the refreshed catalogue. The branch deployment also needs Pages-write permission to request a rebuild after a bot-authored push. The pre-existing optional `PERSONAL_ACCESS_TOKEN` can be used for a branch publish if present. Neither public metadata service needs this token.

If a protected `main` rejects the cache commit, the Actions log and summary identify the failed save. The already-built page can still deploy. Keep the cache current with a reviewed commit, or configure a repository ruleset that permits the workflow's cache updates. If branch publication does not rebuild, choose **GitHub Actions** as the Pages publishing source and rerun the workflow.

Public API documentation: [ORCID public API](https://info.orcid.org/what-is-orcid/services/public-api/), [Crossref access](https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/), [Crossref filters](https://www.crossref.org/documentation/retrieve-metadata/rest-api/rest-api-filters/), [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

The latest-paper preview is optional. The workflow determines the latest record using the same ordering as the homepage. It reuses a saved image only for the same DOI. Public journal pages may block automated access, in which case the build publishes the title and DOI link without a preview. The five recent items directly below the featured paper exclude that featured paper.


## Scholar metrics

`data/metrics.json` stores the all-time citation count, h-index, i10-index, verified date and source separately from the bibliography. The site renders these values during its build; editing the homepage HTML is unnecessary. The Scopus document count has a separate CV source/date and is not inferred from the bibliography.

Each scheduled, manual or main-push build attempts one ordinary public Scholar profile request after checking robots permissions. A successful response must identify the correct profile and contain complete, consistent metric rows. Access blocks, HTTP 429/403, a changed table or a network failure preserve the last verified figures and their date. The site and Actions summary disclose unavailable checks. No paid API, credentials, proxy rotation or CAPTCHA workaround is used. Future Scholar access is not guaranteed. The supplied CSV has no citation-count column and cannot update these metrics by itself.

To update from a fresh screenshot without editing code:

1. Open **Actions → Refresh publications and deploy portfolio → Run workflow**.
2. Fill all four optional fields: all-time citations, h-index, i10-index and the screenshot date in `YYYY-MM-DD` format.
3. Run the workflow on `main`. It saves the verified snapshot and republishes the existing website. Leave all four fields blank for an ordinary automatic check.

The equivalent local command is:

```sh
python scripts/update_metrics.py --set --citations 1218 --h-index 23 --i10-index 31 --date 2026-11-19
python scripts/build_site.py
```

For an automatic attempt locally, use `python scripts/update_metrics.py --refresh`. Without arguments it validates the saved metrics offline. A manual three-value update clears the older recent-period numbers because it does not verify those values.

## Source status

`data/publications.json` exposes `sourceStatus` separately for ORCID, Crossref ORCID discovery and Crossref author-name discovery. `lastSuccess` means a usable source response; `updated` means the merged bibliography actually changed. The homepage shows these dates separately, including saved-data warnings during failures. The workflow summary also reports each source, catalogue size and the Scholar snapshot date. A successful deployment does not imply that every external source was available.

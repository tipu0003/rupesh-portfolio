/* The archive is buildless. A local copy of the published data also works offline. */
(() => {
  'use strict';

  const archive = document.getElementById('publication-archive');
  if (!archive) return;

  const PAGE_SIZE = 5;
  const SCHOLAR = 'https://scholar.google.com/citations?user=uZzLU8IAAAAJ';
  const collate = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const button = (className, label, onClick) => {
    const node = el('button', className, label);
    node.type = 'button';
    node.addEventListener('click', onClick);
    return node;
  };
  const clean = value => typeof value === 'string' ? value.trim() : '';
  const normalized = value => String(value).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
  const exactSearch = title => 'https://scholar.google.com/scholar?q=' + encodeURIComponent('"' + title + '"');
  const safeUrl = value => {
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && !u.username && !u.password ? u : null;
    } catch {
      return null;
    }
  };

  function recordLink(paper) {
    if (/^10\.\d{4,9}\/[^\s]+$/i.test(clean(paper.doi))) {
      const doi = paper.doi.split('/').map(encodeURIComponent).join('/');
      return { href: 'https://doi.org/' + doi, label: 'View publication' };
    }
    const url = safeUrl(paper.url);
    if (url?.hostname === 'scholar.google.com') {
      if (url.pathname === '/citations' && url.searchParams.has('citation_for_view')) {
        return { href: url.href, label: 'Scholar record' };
      }
      return { href: exactSearch(paper.title), label: 'Search title' };
    }
    if (url && !url.pathname.includes('/search') && !url.searchParams.has('q')) {
      return { href: url.href, label: 'View record' };
    }
    return { href: exactSearch(paper.title), label: 'Search title' };
  }

  // Escape user-supplied text one character at a time; never change escapes a second time.
  const texReplacements = {
    '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', '&': '\\&', '%': '\\%',
    '$': '\\$', '#': '\\#', '_': '\\_', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}'
  };
  const tex = value => String(value).replace(/[\\{}&%$#_~^]/g, ch => texReplacements[ch]);
  function citationKey(paper) {
    let hash = 2166136261;
    for (const ch of paper.title) hash = Math.imul(hash ^ ch.codePointAt(0), 16777619);
    return 'work' + (paper.year || 'nd') + '-' + (hash >>> 0).toString(36);
  }
  function bibtex(paper) {
    const entry = {
      'Journal article': 'article', 'Conference paper': 'inproceedings',
      'Book chapter': 'incollection', 'Book': 'book'
    }[paper.type] || 'misc';
    const venueField = { article: 'journal', inproceedings: 'booktitle', incollection: 'booktitle' }[entry];
    const fields = [];
    const add = (name, value) => { if (value) fields.push('  ' + name + ' = {' + tex(value) + '}'); };
    if (paper.authorList?.length) add('author', paper.authorList.join(' and '));
    else if (paper.authors) add('note', 'Authors as listed in the source: ' + paper.authors);
    // An extra brace pair preserves scientific capitalization in bibliography styles.
    fields.push('  title = {{' + tex(paper.title) + '}}');
    if (venueField) add(venueField, paper.venue);
    add('year', paper.year);
    add('volume', paper.volume);
    add('number', paper.issue || paper.number);
    add('pages', paper.pages);
    add('eid', paper.articleNumber);
    add('publisher', paper.publisher);
    add('issn', paper.issn);
    add('isbn', paper.isbn);
    const link = recordLink(paper);
    // URI fields are verbatim in BibTeX processors. Encode delimiters without inserting TeX macros.
    const addUri = (name, value) => fields.push('  ' + name + ' = {'
      + value.replace(/[{}\\]/g, ch => '%' + ch.charCodeAt(0).toString(16).toUpperCase()) + '}');
    if (link.href.startsWith('https://doi.org/')) addUri('doi', paper.doi);
    if (link.label !== 'Search title') addUri('url', link.href);
    return '@' + entry + '{' + citationKey(paper) + ',\n' + fields.join(',\n') + '\n}';
  }
  function download(filename, contents) {
    const url = URL.createObjectURL(new Blob([contents + '\n'], { type: 'application/x-bibtex;charset=utf-8' }));
    const link = el('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function externalLink(href, label, className) {
    const a = el('a', className, label);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }

  function citationDialog() {
    const dialog = el('dialog', 'citation-dialog');
    dialog.setAttribute('aria-labelledby', 'citation-heading');
    const title = el('h3', '', 'Cite this publication');
    title.id = 'citation-heading';
    const paperTitle = el('p', 'citation-title');
    const provenance = el('p', 'citation-source');
    const code = el('pre', 'citation-code');
    code.tabIndex = 0;
    const status = el('p', 'citation-status');
    status.setAttribute('role', 'status');
    const actions = el('div', 'citation-actions');
    let selected;
    let trigger;
    function close() {
      if (typeof dialog.close === 'function') dialog.close();
      else { dialog.removeAttribute('open'); trigger?.focus(); }
    }
    actions.append(
      button('cite-copy', 'Copy BibTeX', async () => {
        try {
          await navigator.clipboard.writeText(code.textContent);
          status.textContent = 'Citation copied.';
        } catch {
          const range = document.createRange();
          range.selectNodeContents(code);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
          status.textContent = 'Citation selected. Use your copy shortcut or download the file.';
        }
      }),
      button('cite-download', 'Download .bib', () => download(citationKey(selected) + '.bib', code.textContent)),
      button('cite-close', 'Close', close)
    );
    dialog.append(title, paperTitle, code, actions, status, provenance);
    dialog.addEventListener('close', () => trigger?.focus());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
    });
    document.body.append(dialog);
    return (paper, source) => {
      trigger = source;
      selected = paper;
      paperTitle.textContent = paper.title;
      provenance.textContent = paper.sources?.length ? 'Record sources · ' + paper.sources.join(', ') : '';
      code.textContent = bibtex(paper);
      status.textContent = '';
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else { dialog.setAttribute('open', ''); code.focus(); }
    };
  }
  function labeled(text, control, className) {
    const label = el('label', className);
    label.append(el('span', 'control-label', text), control);
    return label;
  }
  function select(id, choices) {
    const select = el('select');
    select.id = id;
    for (const [value, label] of choices) {
      const option = el('option', '', label);
      option.value = value;
      select.append(option);
    }
    return select;
  }
  async function readData() {
    const valid = data => data && Array.isArray(data.publications);
    const embedded = document.getElementById('publication-data');
    if (embedded) {
      try {
        const data = JSON.parse(embedded.textContent);
        if (valid(data)) return data;
      } catch { /* An invalid embedded payload can still recover from the JSON file. */ }
    }
    const response = await fetch('./data/publications.json');
    if (!response.ok) throw new Error('Archive unavailable');
    const data = await response.json();
    if (!valid(data)) throw new Error('Invalid archive');
    return data;
  }

  function mount(data) {
    const records = data.publications.filter(p => p && clean(p.title)).map(p => {
      const authorList = (Array.isArray(p.authorList) ? p.authorList : Array.isArray(p.authors) ? p.authors : [])
        .map(clean).filter(Boolean);
      const year = /^\d{4}$/.test(String(p.year)) ? Number(p.year) : null;
      const paper = { ...p, title: clean(p.title), type: clean(p.type) || 'Other', venue: clean(p.venue),
        authors: clean(p.authors) || authorList.join(', '), authorList, year };
      paper.searchText = normalized([paper.title, paper.authors, paper.venue, paper.year, paper.type, paper.doi].join(' '));
      return paper;
    });
    document.querySelectorAll('[data-catalog-count]').forEach(node => { node.textContent = String(records.length); });
    const stamps = [data.lastCrossrefSync, data.lastOrcidSync, data.lastORCIDSync, data.updated]
      .filter(value => /^\d{4}-\d{2}-\d{2}/.test(clean(value))).sort();
    if (stamps.length) document.querySelectorAll('[data-catalog-updated]').forEach(node => {
      const date = new Date(stamps.at(-1).slice(0, 10) + 'T00:00:00Z');
      if (!Number.isNaN(date.getTime())) node.textContent = date.toLocaleDateString('en-GB',
        { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    });

    const openCite = citationDialog();
    const toolbar = el('div', 'archive-toolbar');
    const search = el('input');
    search.id = 'archive-query';
    search.type = 'search';
    search.placeholder = 'Search titles, authors, venues or DOI';
    const years = [...new Set(records.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);
    const types = [...new Set(records.map(p => p.type))].sort(collate.compare);
    const year = select('archive-year', [['', 'All years'], ...years.map(y => [String(y), String(y)])]);
    const type = select('archive-type', [['', 'All types'], ...types.map(t => [t, t])]);
    const sort = select('archive-sort', [['new', 'Newest first'], ['old', 'Oldest first'], ['az', 'Title A–Z']]);
    toolbar.append(labeled('Search publications', search, 'archive-search'), labeled('Year', year, 'archive-select'),
      labeled('Type', type, 'archive-select'), labeled('Sort', sort, 'archive-select'));
    const meta = el('div', 'archive-meta');
    const summary = el('span', 'archive-summary');
    summary.setAttribute('role', 'status');
    const clear = button('archive-clear', 'Clear filters', () => {
      search.value = year.value = type.value = '';
      page = 1;
      render();
      search.focus();
    });
    const exportBtn = button('archive-export', 'Export BibTeX', () => {
      if (filtered.length) download('rupesh-kumar-tipu-publications.bib', filtered.map(bibtex).join('\n\n'));
    });
    exportBtn.title = 'Download BibTeX for all matching publications';
    meta.append(summary, clear, exportBtn);
    const list = el('div', 'publication-list');
    const pagination = el('nav', 'archive-pagination');
    pagination.setAttribute('aria-label', 'Publication pages');
    const pageLabel = el('span', 'archive-page');
    const navigate = step => {
      page += step;
      render();
      // Keep keyboard focus and the start of the new page together.
      const heading = list.querySelector('.pub-title');
      if (heading) heading.focus();
    };
    const prev = button('archive-prev', '← Previous', () => navigate(-1));
    const next = button('archive-next', 'Next →', () => navigate(1));
    pagination.append(prev, pageLabel, next);
    let page = 1;
    let filtered = [];

    const publicationRow = paper => {
      const row = el('article', 'publication-row');
      const yearLabel = el('span', 'pub-year', String(paper.year || '—'));
      const body = el('div', 'pub-body');
      const tag = el('span', 'pub-type', paper.type);
      const title = el('h3', 'pub-title', paper.title);
      title.tabIndex = -1;
      body.append(tag, title);
      if (paper.authors) body.append(el('p', 'pub-authors', paper.authors));
      if (paper.venue) body.append(el('p', 'pub-venue', paper.venue));
      const actions = el('div', 'pub-actions');
      const target = recordLink(paper);
      const link = externalLink(target.href, target.label, 'pub-link');
      link.setAttribute('aria-label', target.label + ' for ' + paper.title + ' (opens in a new tab)');
      const cite = button('pub-cite', 'Cite', () => openCite(paper, cite));
      cite.setAttribute('aria-label', 'Cite ' + paper.title);
      cite.setAttribute('aria-haspopup', 'dialog');
      actions.append(link, cite);
      row.append(yearLabel, body, actions);
      return row;
    };
    function render() {
      const words = normalized(search.value.trim()).split(/\s+/).filter(Boolean);
      filtered = records.filter(p => (!year.value || String(p.year) === year.value)
        && (!type.value || p.type === type.value) && words.every(word => p.searchText.includes(word)));
      const sortDate = p => p.year ? (String(p.date || p.publication_date || p.year).slice(0, 10)) : '';
      filtered.sort((a, b) => {
        if (sort.value !== 'az') {
          if (a.year && !b.year) return -1;
          if (!a.year && b.year) return 1;
          const diff = collate.compare(sortDate(a), sortDate(b));
          if (diff) return sort.value === 'new' ? -diff : diff;
        }
        return collate.compare(a.title, b.title);
      });
      const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      page = Math.min(pages, Math.max(1, page));
      const start = (page - 1) * PAGE_SIZE;
      const shown = filtered.slice(start, start + PAGE_SIZE);
      const active = Boolean(words.length || year.value || type.value);
      summary.textContent = filtered.length ? 'Showing ' + (start + 1) + '–' + (start + shown.length) + ' of '
        + filtered.length + (active ? ' matching' : '') + (filtered.length === 1 ? ' publication' : ' publications')
        : '0 publications';
      clear.hidden = !active;
      exportBtn.disabled = !filtered.length;
      if (shown.length) list.replaceChildren(...shown.map(publicationRow));
      else list.replaceChildren(el('p', 'archive-empty', active ? 'No publications match these filters. Try another term or clear the filters.'
        : 'The publication archive is currently empty.'));
      pageLabel.textContent = 'Page ' + page + ' of ' + pages;
      prev.disabled = page <= 1;
      next.disabled = page >= pages;
      pagination.hidden = pages === 1;
    }
    search.addEventListener('input', () => { page = 1; render(); });
    [year, type, sort].forEach(node => node.addEventListener('change', () => { page = 1; render(); }));
    archive.replaceChildren(toolbar, meta, list, pagination);
    render();
  }
  readData().then(mount).catch(() => {
    const message = el('p', 'archive-error');
    message.append('The searchable archive could not load. ', externalLink(SCHOLAR, 'Open the Google Scholar profile', 'pub-link'), '.');
    archive.append(message);
  });
})();

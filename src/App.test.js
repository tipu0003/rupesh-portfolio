import { mergePublications, filterPublications, toBibtex, safeUrl } from './lib/publications';
import cache from './data/publications-cache.json';
import exported from './data/scholar-export.json';
import { publicationsFlat } from './data/publications';

test('merges equivalent DOI URLs and fills missing metadata from the supplied export',()=>{
  const papers=mergePublications([{title:'Concrete & AI',doi:'https://doi.org/10.1234/ABC',type:'journal-article'}],[{title:'Concrete & AI',doi:'10.1234/abc',authors:['Tipu, R. K.'],pages:'1-9'},{title:'Patent application',type:'Patent'}]);
  expect(papers).toHaveLength(1);expect(papers[0].doi).toBe('10.1234/abc');expect(papers[0].authors).toEqual(['Tipu, R. K.']);expect(papers[0].pages).toBe('1-9');
});
test('supports combined keyword, author, type and year filters and chronological sorting',()=>{
  const papers=mergePublications([{title:'Concrete strength',authors:['Tipu'],year:2025,type:'journal-article'},{title:'Concrete strength conference',authors:['Other'],year:2024,doi:'10.1234/other',type:'conference-paper'},{title:'Low-carbon concrete',authors:['Tipu'],year:2026,type:'journal-article'}]);
  expect(filterPublications(papers,{query:'concrete tipu',year:'2026',type:'Journal article'})[0].title).toBe('Low-carbon concrete');
  expect(filterPublications(papers,{sort:'oldest'})[0].year).toBe(2024);
  expect(filterPublications(papers,{query:'missing-term'})).toEqual([]);
});
test('all supplied Scholar titles survive the combined catalog without duplicate DOI values',()=>{
  const all=mergePublications(cache.publications,[...exported,...publicationsFlat]);
  const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
  exported.forEach(p=>expect(all.some(a=>normalize(a.title)===normalize(p.title))).toBe(true));
  const dois=all.map(p=>p.doi).filter(Boolean);expect(new Set(dois).size).toBe(dois.length);
});
test('exports BibTeX with protected titles and safe URLs',()=>{
  const [p]=mergePublications([{title:'AI & Concrete_1',authors:['Tipu, R. K.'],year:2026,type:'conference-paper',doi:'10.1234/test'}]);
  const bib=toBibtex(p);expect(bib).toContain('@inproceedings');expect(bib).toContain('AI \\& Concrete\\_1');expect(bib).toContain('author = {Tipu, R. K.}');
  expect(safeUrl('javascript:alert(1)')).toBe('https://orcid.org/0000-0001-8476-8364');
});

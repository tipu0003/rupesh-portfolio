const types={'journal-article':'Journal article','Article':'Journal article','conference-paper':'Conference paper','conference-abstract':'Conference paper','conference-proceedings':'Conference paper','Conference paper':'Conference paper','book-chapter':'Book chapter','Book chapter':'Book chapter','book':'Book','review':'Review'};
const titleKey=value=>String(value||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');
export const normalizeDoi=value=>String(value||'').replace(/^https?:\/\/(?:dx\.)?doi\.org\//i,'').trim().toLowerCase();
export function safeUrl(value){try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:'https://orcid.org/0000-0001-8476-8364';}catch{return 'https://orcid.org/0000-0001-8476-8364';}}
export function mergePublications(remote=[],curated=[]){
  const result=[],dois=new Map(),titles=new Map();
  [...remote,...curated].forEach(raw=>{
    if(!raw.title||['Patent','patent'].includes(raw.type))return;
    const doi=normalizeDoi(raw.doi),key=titleKey(raw.title);
    const duplicate=(doi&&dois.get(doi))||titles.get(key);
    if(duplicate){
      if(!duplicate.doi&&doi){duplicate.doi=doi;duplicate.url=`https://doi.org/${doi}`;dois.set(doi,duplicate);}
      if(!duplicate.authors.length&&raw.authors)duplicate.authors=Array.isArray(raw.authors)?raw.authors:String(raw.authors).split(/;| and /).filter(Boolean);
      for(const field of ['volume','issue','pages','publisher'])if(!duplicate[field]&&raw[field])duplicate[field]=raw[field];
      return;
    }
    const authors=Array.isArray(raw.authors)?raw.authors:String(raw.authors||'').split(/;| and /).filter(Boolean);
    const oldDate=String(raw.date||'').match(/^(\d{2})-(\d{2})-(\d{4})$/);
    const date=raw.publication_date||(oldDate?`${oldDate[3]}-${oldDate[2]}-${oldDate[1]}`:raw.date)||`${raw.year||0}-01-01`;
    const paper={...raw,id:doi||key,doi,authors,year:Number(raw.year)||null,type:types[raw.type]||raw.type||'Other',venue:raw.venue||raw.journal||raw.conference||raw.book||'',date,url:doi?`https://doi.org/${doi}`:safeUrl(raw.url),source:raw.source||'Curated'};
    result.push(paper);titles.set(key,paper);if(doi)dois.set(doi,paper);
  });return result;
}
export function filterPublications(papers,{query='',type='All',year='All',sort='newest'}={}){
  const words=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered=papers.filter(p=>(type==='All'||p.type===type)&&(year==='All'||String(p.year)===String(year))&&words.every(w=>`${p.title} ${p.authors.join(' ')} ${p.venue} ${p.doi}`.toLowerCase().includes(w)));
  return filtered.sort((a,b)=>sort==='title'?a.title.localeCompare(b.title):((sort==='oldest'?1:-1)*(String(a.date).localeCompare(String(b.date))||(a.year||0)-(b.year||0)))||a.title.localeCompare(b.title));
}
const escapeBib=value=>String(value||'').replace(/\\/g,'\\textbackslash ').replace(/[{}]/g,'').replace(/([%&#_$])/g,'\\$1').replace(/[\r\n]+/g,' ');
export function toBibtex(p){
  const kind=p.type==='Book'?'book':p.type==='Conference paper'?'inproceedings':p.type==='Book chapter'?'incollection':'article';
  const key=`Tipu${p.year||'ND'}_${titleKey(p.doi||p.title).slice(-18)}`;
  const fields=[['title',`{${escapeBib(p.title)}}`],...(p.authors.length?[['author',p.authors.map(escapeBib).join(' and ')]]:[]),...(p.year?[['year',p.year]]:[]),...(p.venue&&kind!=='book'?[[kind==='article'?'journal':'booktitle',escapeBib(p.venue)]]:[]),...['volume','issue','pages','publisher'].filter(k=>p[k]).map(k=>[k==='issue'?'number':k,escapeBib(p[k])]),...(p.doi?[['doi',p.doi]]:[]),['url',escapeBib(p.url)]];
  return `@${kind}{${key},\n${fields.map(([k,v])=>`  ${k} = {${v}}`).join(',\n')}\n}`;
}

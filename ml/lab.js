(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const E = window.LabEngine;
  const nf = (v, d=2) => Number.isFinite(v) ? v.toLocaleString('en', {maximumFractionDigits:d}) : '—';
  const node = (tag, text, className) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  };
  const options = (el, list) => el.replaceChildren(...list.map(([value,label]) => new Option(label, value)));
  const cfg = {
    strength:{model:'strength',name:'Compressive strength',help:'Enter seven ingredients in kg/m³ and a curing age in days.', result:'Predicted compressive strength'},
    slump:{model:'slump',name:'Concrete slump',help:'Estimate the vertical slump of fresh concrete from the seven ingredient quantities.',result:'Predicted slump'},
    flow:{model:'flow',name:'Concrete spread',help:'Estimate the spread of fresh concrete in the UCI slump test, in centimetres.',result:'Predicted spread'},
    strength28:{model:'strength28',name:'28-day strength of slump-test mixtures',help:'Use the smaller slump-test dataset to estimate the 28-day strength of its mixture family.',result:'Predicted 28-day strength'},
    early28:{model:'early28',name:'28-day strength from a 7-day test',help:'Enter the mixture and a measured 7-day compressive strength. The model uses specimens with paired 7- and 28-day results.',result:'Predicted 28-day strength'},
    age:{model:'strength',name:'Strength development',help:'Keep the composition fixed and choose an age to highlight. The plot shows how the strength model responds across ages.', result:'Estimated strength at the selected age'},
    inverse:{model:'strength',name:'Target-strength mix search',help:'Rank reference recipes recorded at the selected age by distance from your target. Optionally limit total binder mass.', result:'Closest reference mixture'},
  };
  let models, task, model, result, pinned, plot, plotConfig, dirty=false;
  const colors = {blue:'#225daf',purple:'#7957aa',accent:'#a54f34'};
  function selectTask(key) {
    task = Object.hasOwn(cfg,key) ? key : 'strength';
    model = models[cfg[task].model];
    pinned=null;result=null;
    $('task').value = task;
    $('task-help').textContent = cfg[task].help;
    const exploratory = task === 'slump' || task === 'flow';
    $('accuracy').hidden = !exploratory;
    $('accuracy').textContent = exploratory ? 'Exploratory · limited predictive accuracy. Held-out R² '+nf(model.metrics.r2,2)+' and mean absolute error '+nf(model.metrics.mae,1)+' '+model.unit+' on '+model.metrics.nTest+' unseen records.' : '';
    $('inputs-title').textContent = task === 'inverse' ? 'Search constraints' : 'Mix quantities';
    $('result-title').textContent = cfg[task].name;
    $('run-tool').firstChild.textContent = task === 'inverse' ? 'Find mixtures ' : task === 'age' ? 'Run age study ' : 'Run prediction ';
    $('input-fields').replaceChildren();
    if (task === 'inverse') {
      addField('target','Target strength','MPa',{min:0.01,default:35},false);
      const ages = [...new Set(model.referenceMixes.map(r=>r[model.features.findIndex(f=>f.key==='age')]))].sort((a,b)=>a-b);
      const select = node('select');options(select,ages.map(v=>[String(v),v+' days']));
      select.value = String(ages.includes(28) ? 28 : ages[0]);
      addField('fixed-age','Reference age','days',{},false,select);
      addField('binder','Maximum binder','kg/m³',{min:0.01},true);
    } else {
      model.features.forEach(f=>addField(f.key,f.label,f.unit,f,false));
    }
    const views = [[task==='inverse'?'rank':task==='age'?'age':'response',
      task==='inverse'?'Closest reference mixes':task==='age'?'Strength versus age':'Ingredient response'],['validation','Observed versus predicted']];
    options($('chart-view'),views);
    options($('feature'),model.features.map((f,i)=>[String(i),f.label]));
    const waterIndex=model.features.findIndex(f=>f.key==='water');
    $('feature').value=String(waterIndex < 0 ? 0 : waterIndex);
    $('comparison').hidden=task==='inverse';
    evidence();
    run();
  }
  function addField(key,label,unit,f,optional,custom) {
    const holder = node('div',undefined,'field');
    const caption = node('label',label);
    const control = custom || node('input');
    const id='field-'+key;caption.htmlFor=id;caption.append(node('span',unit));
    control.id=id;control.name=key;
    if (!custom) {
      control.type='number';control.required=!optional;control.step=key==='age'?'1':'any';
      if (Number.isFinite(f.min)) control.min=String(f.min);
      if (Number.isFinite(f.max)) control.max=String(f.max);
      if (f.default!=null) control.value=String(f.default);
      if(optional)control.placeholder='Optional';
    }
    holder.append(caption,control);
    if (Number.isFinite(f.min) && Number.isFinite(f.max)) {
      const range=node('span',nf(f.min,3)+'–'+nf(f.max,3),'range');
      range.id='limits-'+key;control.setAttribute('aria-describedby',range.id);holder.append(range);
    }
    $('input-fields').append(holder);
  }
  function getInputs() { return model.features.map(f=>$('field-'+f.key).valueAsNumber); }
  function showError(message) {
    $('input-error').textContent=message;$('input-error').hidden=!message;
  }
  function markDirty(changed) {
    dirty=changed;$('dirty').hidden=!changed;$('export-status').textContent='';
    for (const id of ['xlsx','svg','png']) $(id).disabled=changed || !result;
    $('pin').disabled=changed || !result || !(result.value>=0);
  }
  function run() {
    showError('');
    if (!$('mix-form').checkValidity()) { $('mix-form').reportValidity();markDirty(true);return; }
    if (task === 'inverse') {
      const age=Number($('field-fixed-age').value), target=$('field-target').valueAsNumber;
      const binder=$('field-binder').value===''?null:$('field-binder').valueAsNumber;
      const matches=E.rankRecipes(model,age,target,binder);
      result={age,target,binder,matches,inputs:matches[0]?.inputs || null};
    } else {
      const inputs=getInputs(), invalid=E.check(model,inputs);
      if(invalid){showError(invalid);markDirty(true);return;}
      result={inputs,value:E.predict(model,inputs)};
      if(task==='age'){
        const ageIndex=model.features.findIndex(f=>f.key==='age');
        const day=inputs[ageIndex];
        result.age=day;
        const days=[...new Set([1,3,7,14,28,56,90,180,270,365,day])].sort((a,b)=>a-b);
        result.points=E.ageCurve(model,inputs,days);
      }
    }
    markDirty(false);renderResult();renderComparison();renderPlot();$('export-status').textContent='';
  }
  function renderComparison() {
    $('clear-pin').hidden=!pinned;
    $('pin').textContent=pinned?'Replace pinned mix':'Pin this mix';
    if(!pinned) {
      $('comparison-note').textContent='Pin a result, change the inputs, and run again to compare the two mixtures.';
      return;
    }
    if(result.value < 0) {
      $('comparison-note').textContent='Current mix has no physically usable estimate; the pinned case is retained.';
      return;
    }
    const diff=result.value-pinned.value;
    $('comparison-note').textContent='Pinned estimate '+nf(pinned.value)+' '+model.unit+' · current minus pinned '+(diff>0?'+':'')+nf(diff)+' '+model.unit+'.';
  }
  function stat(title,value) {
    const box=node('div',undefined,'stat');box.append(node('span',title),node('strong',value));return box;
  }
  function resultValue(label,value,unit,detail) {
    const el=$('result-value');el.replaceChildren(node('small',label));
    const main=node('strong',value+' ');if(unit)main.append(node('span',unit));el.append(main,node('p',detail));
  }
  function renderResult() {
    const detail=$('result-detail');detail.replaceChildren();
    if(task==='inverse'){
      if (!result.matches.length) {
        resultValue('Reference search','No match','','No reference recipe satisfies these constraints.');
        $('result-note').textContent='Try another recorded age or increase the maximum binder mass. An empty search is preserved in your workbook.';return;
      }
      const best=result.matches[0];
      resultValue(cfg[task].result,nf(best.value,2),model.unit,nf(result.target)+' MPa target · '+nf(result.age)+' days');
      const estimates=result.matches.map(row=>row.value);
      const lowest=Math.min(...estimates), highest=Math.max(...estimates);
      const outside=result.target<lowest || result.target>highest;
      $('result-note').textContent=(outside ? 'The target falls outside the eligible prediction range ('+nf(lowest,1)+'–'+nf(highest,1)+' MPa). ' : '')+
        'Recipes are ranked by absolute gap from target. The workbook includes each ingredient quantity.';
      const table=node('table',undefined,'rank-table');
      const header=table.createTHead().insertRow();['Rank','Estimate (MPa)','Binder (kg/m³)','Gap (MPa)'].forEach(h=>header.append(node('th',h)));
      const tbody=table.createTBody();result.matches.slice(0,5).forEach((r,i)=>{
        const tr=tbody.insertRow();[i+1,nf(r.value),nf(r.binder,1),nf(r.difference)].forEach(x=>tr.insertCell().textContent=String(x));
      });
      detail.append(table,node('p',result.matches.length+' eligible reference '+(result.matches.length===1?'mixture':'mixtures')+' at this age.','rank-note'));
      const recipe=node('details');recipe.append(node('summary','Closest recipe · ingredient quantities'));
      const line=node('p',model.features.slice(0,7).map((f,i)=>f.label+' '+nf(best.inputs[i],2)).join(' · ')+' kg/m³.','rank-note');recipe.append(line);detail.append(recipe);return;
    }
    const q=E.quantities(model,result.inputs);
    const ageIndex=model.features.findIndex(f=>f.key==='age');
    const label=ageIndex>=0?nf(result.inputs[ageIndex])+' days · '+model.algorithm:model.algorithm;
    if (result.value < 0) {
      resultValue('Outside the physical range','No usable estimate','',label);
    } else {
      resultValue(cfg[task].result,nf(result.value,task==='slump'||task==='flow'?1:2),model.unit,label);
    }
    $('result-note').textContent=result.value<0?'The raw model response was negative. The workbook identifies it as physically invalid.': 
      'Held-out mean absolute error: '+nf(model.metrics.mae,2)+' '+model.unit+'. This average describes the test mixes; it is not an error bound for this result.';
    const facts=node('div',undefined,'stats');facts.append(stat('Water / binder',nf(q.waterBinder,3)), stat('Binder mass',nf(q.binder,1)+' kg/m³'),
      stat('Total ingredient mass',nf(q.total,1)+' kg/m³'),stat('Training records',String(model.metrics.nTrain)));detail.append(facts);
  }
  function evidence() {
    const el=$('evidence');el.replaceChildren();
    const data=model.dataset, metrics=model.metrics;
    const intro=node('p',undefined,'evidence-copy');intro.append(document.createTextNode(model.algorithm+' trained for this portfolio on '));
    const source=node('a',data.name);source.href='https://doi.org/'+encodeURI(data.doi);
    intro.append(source,document.createTextNode(' ('+data.creator+', '+data.year+'). Data are available under '));
    const license=node('a',data.license);license.href=data.licenseUrl;intro.append(license,document.createTextNode('.'));el.append(intro);
    const stats=node('div',undefined,'stats');stats.append(stat('Held-out R²',nf(metrics.r2,3)),stat('Held-out MAE',nf(metrics.mae,2)+' '+model.unit),stat('Held-out RMSE',nf(metrics.rmse,2)+' '+model.unit),stat('Train / test rows',metrics.nTrain+' / '+metrics.nTest));el.append(stats);
    el.append(node('p','The holdout separates mixture groups by ingredient quantities. Training used '+metrics.nTrainGroups+' groups and testing used '+metrics.nTestGroups+' unseen groups. These figures describe this split of the benchmark, not performance on your site or materials.','evidence-copy'));
    if(metrics.r2 < .5)el.append(node('p','This model explains less than half the measured variation in the holdout. Treat individual estimates with particular caution.','notice'));
    el.append(node('p','Input bounds reflect the training records. Permitted individual values do not guarantee that a combination was tested. Confirm unusual compositions with experiments.','evidence-copy'));
  }
  function renderPlot() {
    const view=$('chart-view').value, holdout=view==='validation';
    $('feature-control').hidden=view!=='response';
    const series=[];
    let title,xLabel,yLabel,note,domain;
    if(holdout){
      title='Measurements versus predictions';
      xLabel='Measured ('+model.unit+')';yLabel='Predicted ('+model.unit+')';
      const points=model.metrics.holdout.map(([x,y])=>({x,y}));
      let lo=Infinity,hi=-Infinity;for (const p of points){lo=Math.min(lo,p.x,p.y);hi=Math.max(hi,p.x,p.y);}
      const margin=(hi-lo)*.05||1;lo-=margin;hi+=margin;domain=[lo,hi];
      series.push({label:'Perfect agreement',color:'#7d91aa',points:[{x:lo,y:lo},{x:hi,y:hi}],markers:false,dash:'6 4',inspectable:false},
        {label:'Unseen test records',color:colors.blue,points,type:'scatter'});
      note='Each dot is a held-out record. Points above the agreement line indicate overprediction.';
    } else if(view==='rank'){
      title='Nearest reference mixtures';xLabel='Candidate rank';yLabel='Predicted strength (MPa)';
      const top=result.matches.slice(0,10);
      if(top.length){
        const extent=top.length===1?[.5,1.5]:[1,top.length];
        series.push({label:'Target',color:colors.accent,points:extent.map(x=>({x,y:result.target})),markers:false,dash:'5 4',inspectable:false},
          {label:'Predicted strength',color:colors.blue,type:'scatter',points:top.map((r,i)=>({x:i+1,y:r.value,label:'Rank '+(i+1)}))});
      }
      note='Up to ten recorded recipes are shown. Rank reflects closeness to the requested strength; a ranked recipe carries no engineering approval.';
    } else if(view==='age'){
      title='Strength development at fixed composition';xLabel='Curing age (days)';yLabel='Predicted strength (MPa)';
      series.push({label:'Model estimate',color:colors.blue,points:result.points},{label:'Selected age',color:colors.accent,type:'scatter',points:[{x:result.age,y:result.value}]});
      if(pinned)series.push({label:'Pinned composition',color:colors.purple,dash:'5 4',points:E.ageCurve(model,pinned.inputs,result.points.map(p=>p.x))});
      note='The curve connects sampled ages at a fixed composition. Points are model estimates, not measurements.';
    } else {
      const i=Number($('feature').value), f=model.features[i];
      title='One-input response';xLabel=f.label+' ('+f.unit+')';yLabel=cfg[task].name+' ('+model.unit+')';
      series.push({label:'Model estimate',color:colors.blue,points:E.response(model,result.inputs,i),markers:false},
        {label:'Entered mix',color:colors.accent,type:'scatter',points:[{x:result.inputs[i],y:result.value}]});
      if(pinned)series.push({label:'Pinned composition',color:colors.purple,markers:false,dash:'5 4',points:E.response(model,pinned.inputs,i)});
      note='Only '+f.label.toLowerCase()+' changes along this curve. The other inputs are fixed. These hypothetical mixtures illustrate model sensitivity, not a causal effect.';
    }
    plotConfig={title,xLabel,yLabel,series,subtitle:cfg[task].name+' · '+model.dataset.name,caption:''};
    if (domain){plotConfig.xDomain=domain;plotConfig.yDomain=domain;}
    $('chart-note').textContent=note;
    if (!series.some(s=>s.points.length)) {
      $('chart').replaceChildren(node('p','No reference mixtures to plot. Try a different search.','notice'));plot=null;
    } else {plot=LabPlot.draw($('chart'),plotConfig);}
    for(const id of ['svg','png'])$(id).disabled=!plot||dirty;
  }
  function exportWorkbook() {
    if (!result || dirty)return;
    const m=model.metrics, src=model.dataset;
    const overview=[['Task',cfg[task].name],['Model',model.name],['Method',model.algorithm],['Units',model.unit],
      ['Data',src.name],['Source DOI',src.doi],['Creator',src.creator],['Dataset licence',src.license],['Research use','Experimental estimates; confirm with project-specific tests.']];
    const sheets=[{name:'Run',rows:overview}];
    if(task==='inverse'){
      overview.push(['Requested age (days)',result.age],['Target strength (MPa)',result.target],['Maximum binder (kg/m³)',result.binder],['Eligible reference mixtures',result.matches.length]);
      sheets.push({name:'Ranked recipes',rows:[['Rank','Estimate (MPa)','Signed gap (MPa)','Binder (kg/m³)','Water/binder',...model.features.map(f=>f.label+' ('+f.unit+')')],...result.matches.map((r,i)=>[i+1,r.value,r.difference,r.binder,r.waterBinder,...r.inputs])]});
    }else{
      overview.push([result.value < 0 ? 'Raw prediction (physically invalid)' : 'Prediction',result.value]);
      sheets.push({name:'Inputs',rows:[['Input','Value','Unit','Training min','Training max'],...model.features.map((f,i)=>[f.label,result.inputs[i],f.unit,f.min,f.max])]});
      if(pinned)sheets.push({name:'Pinned comparison',rows:[
        ['Quantity','Pinned','Current','Unit'],...model.features.map((f,i)=>[f.label,pinned.inputs[i],result.inputs[i],f.unit]),
        ['Model response',pinned.value,result.value,model.unit],['Difference from pinned',0,result.value-pinned.value,model.unit],
        ['Current estimate physical?',true,result.value>=0,'']]});
      if(task==='age')sheets.push({name:'Age curve',rows:[['Age (days)','Strength (MPa)'],...result.points.map(p=>[p.x,p.y])]});
    }
    sheets.push({name:'Validation',rows:[['Statistic','Value'],['Held-out R²',m.r2],['MAE ('+model.unit+')',m.mae],['RMSE ('+model.unit+')',m.rmse],['Training records',m.nTrain],['Test records',m.nTest],['Training mix groups',m.nTrainGroups],['Test mix groups',m.nTestGroups],[],['Measured ('+model.unit+')','Predicted ('+model.unit+')'],...m.holdout]});
    sheets.push({name:'Chart points',rows:[['Plot',plotConfig.title],['Series',plotConfig.xLabel,plotConfig.yLabel],...plotConfig.series.flatMap(s=>s.points.map(p=>[s.label,p.x,p.y]))]});
    LabExport.xlsx(sheets,'concrete-'+task+'.xlsx');$('export-status').textContent='Excel workbook prepared.';
  }
  function activate() {
    $('task').addEventListener('change',()=>{
      const selected=$('task').value;
      const originals={'original-brick':'./originals/brick/','original-rca':'./originals/rca/'};
      if(Object.hasOwn(originals,selected)){
        $('task').value=task;
        location.assign(originals[selected]);
        return;
      }
      selectTask(selected);
    });
    $('mix-form').addEventListener('submit',ev=>{ev.preventDefault();run();});
    $('mix-form').addEventListener('input',()=>{showError('');markDirty(true);});
    $('example').addEventListener('click',()=>selectTask(task));
    $('pin').addEventListener('click',()=>{if(dirty || !(result?.value>=0))return;pinned={inputs:result.inputs.slice(),value:result.value};renderComparison();renderPlot();});
    $('clear-pin').addEventListener('click',()=>{pinned=null;renderComparison();renderPlot();});
    $('chart-view').addEventListener('change',renderPlot);$('feature').addEventListener('change',renderPlot);
    $('xlsx').addEventListener('click',exportWorkbook);
    $('svg').addEventListener('click',()=>{if(plot&&!dirty){LabExport.svg(plot,'concrete-'+task+'-'+$('chart-view').value+'.svg');$('export-status').textContent='SVG download prepared.';}});
    $('png').addEventListener('click',async()=>{if(!plot||dirty)return;try{await LabExport.png(plot,'concrete-'+task+'-'+$('chart-view').value+'.png');$('export-status').textContent='PNG download prepared.';}catch(err){$('export-status').textContent='PNG export failed. Use the SVG download or refresh and try again.';}});
    const key=new URLSearchParams(location.search).get('tool');
    selectTask(Object.hasOwn(cfg,key)?key:'strength');
    $('load-state').hidden=true;$('workspace').hidden=false;
  }
  async function start() {
    try {
      const res=await fetch('./data/models.json');
      if(!res.ok)throw Error(String(res.status));
      const data=await res.json();
      if(data.version!==1 || !Object.values(cfg).every(c=>data.models?.[c.model]?.features?.length))throw Error('Model data mismatch');
      models=data.models;activate();
    }catch(err) {
      $('workspace').hidden=true;$('load-state').hidden=false;
      $('load-state').textContent='The model workspace could not load. Refresh this page to try again.';
      console.error('Concrete model lab failed to start',err);
    }
  }
  start();
})();

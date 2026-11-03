(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const labels = ['Cement', 'FA (source label)', 'Recycled coarse aggregate', 'Natural coarse aggregate', 'Water/cement ratio', 'Superplasticizer (SP)', 'Curing age'];
  const units = ['kg/m³', 'kg/m³', '%', '%', 'ratio', '%', 'days'];
  const example = [350, 700, 25, 75, .55, .75, 28];
  const fields = [];
  let model, predict, inputs, value, svg, curve, changed;
  const source = 'https://github.com/tipu0003/RCA_Concrete_Prediction/tree/b8c6508c46f2996dcd02bfe62e779c69ac648c67';
  function markChanged(yes) {
    changed = yes;
    $('dirty').hidden = !yes;
    for (const id of ['svg','excel','png','axis']) $(id).disabled = yes;
    $('status').textContent = '';
    $('error').hidden = true;
  }
  function field(i) {
    const group = document.createElement('div');
    group.className = 'field';
    const label = document.createElement('label');
    label.htmlFor = 'x' + i;
    label.textContent = labels[i];
    const unit = document.createElement('span');
    unit.textContent = units[i];
    label.append(unit);
    const input = document.createElement('input');
    input.id = label.htmlFor;
    input.type = 'number';
    input.step = i === 6 ? '1' : 'any';
    input.min = model.min[i];
    input.max = model.max[i];
    input.required = true;
    input.readOnly = i === 3;
    input.value = example[i];
    const range = document.createElement('small');
    range.id = 'range-' + i;
    range.className = 'range';
    range.textContent = i === 3 ? 'Calculated as 100 − recycled share.' : model.min[i] + '–' + model.max[i] + ' ' + units[i];
    input.setAttribute('aria-describedby',range.id);
    group.append(label,input,range);
    fields.push(input);
    return group;
  }
  function draw() {
    const i = Number($('axis').value);
    const min = model.min[i], max = model.max[i];
    const xValues = new Set([inputs[i], min, max]);
    const n = i === 6 ? max - min : 65;
    for (let j = 0; j <= n; j++) xValues.add(min + (max - min) * j / n);
    curve = [...xValues].sort((a,b) => a-b).map(x => {
      const v = inputs.slice();
      v[i] = x;
      if (i === 2) v[3] = 100 - x;
      return {x, y:predict(v)};
    });
    const note = i === 2 ? 'Changing the recycled share changes the natural share by the same amount in the opposite direction. Other inputs stay fixed.' : 'Only '+labels[i].toLowerCase()+' changes. The other inputs stay fixed.';
    $('chart-note').textContent = note+' The line connects model estimates; it represents a sensitivity study.';
    svg = LabPlot.draw($('chart'), {
      title:'Strength response to '+labels[i].toLowerCase(),
      subtitle:'Recycled-aggregate concrete · original XGBoost model',
      xLabel:labels[i]+' ('+units[i]+')', yLabel:'Predicted strength (MPa)',
      series:[{label:'Model response',points:curve,markers:false}, {label:'Entered mix',type:'scatter',points:[{x:inputs[i],y:value}]}]
    });
  }
  function run() {
    if (!$('form').reportValidity()) return;
    try {
      const next = fields.map(f => f.valueAsNumber);
      const result = predict(next);
      inputs = next;
      value = result;
      $('estimate').textContent = value.toFixed(2);
      $('summary').textContent = inputs[6]+' curing days · '+inputs[2]+'% recycled coarse aggregate · w/c '+inputs[4];
      markChanged(false);
      draw();
    } catch (error) {
      markChanged(true);
      $('error').textContent = error.message;
      $('error').hidden = false;
    }
  }
  function excel() {
    if (changed) return;
    const i = Number($('axis').value);
    LabExport.xlsx([
      {name:'Prediction',rows:[['Task','Recycled-aggregate concrete compressive strength'],['Estimate (MPa)',value],['Research paper','10.1007/s41062-025-02290-6'],['Model source',source],['R² (source reported)',model.metrics.R2],['RMSE (MPa, source reported)',model.metrics.RMSE],['MAE (MPa, source reported)',model.metrics.MAE]]},
      {name:'Inputs',rows:[['Input','Value','Unit','Training minimum','Training maximum'],...fields.map((_,j)=>[labels[j],inputs[j],units[j],model.min[j],model.max[j]])]},
      {name:'Chart data',rows:[[labels[i]+' ('+units[i]+')','Predicted strength (MPa)'],...curve.map(p=>[p.x,p.y])]}
    ],'recycled-concrete-results.xlsx');
    $('status').textContent = 'Excel workbook prepared.';
  }
  async function init() {
    try {
      const response = await fetch('model.json');
      if (!response.ok) throw new Error('Unable to load the saved model.');
      model = await response.json();
      predict = RecycledConcrete.load(model);
      for (let i=0;i<labels.length;i++) $('fields').append(field(i));
      fields[2].addEventListener('input', () => {
        const x=fields[2].valueAsNumber;
        fields[3].value=Number.isFinite(x) && x>=0 && x<=100 ? Number((100-x).toFixed(10)) : '';
      });
      $('form').addEventListener('input',()=>markChanged(true));
      $('form').addEventListener('submit',event=>{event.preventDefault();run();});
      $('reset').addEventListener('click',()=>{fields.forEach((f,i)=>{f.value=example[i];});run();});
      $('axis').addEventListener('change',draw);
      $('excel').addEventListener('click',excel);
      $('svg').addEventListener('click',()=>{if(!changed){LabExport.svg(svg,'recycled-concrete-response.svg');$('status').textContent='SVG download prepared.';}});
      $('png').addEventListener('click',async()=>{
        if (changed) return;
        try {await LabExport.png(svg,'recycled-concrete-response.png');$('status').textContent='PNG download prepared.';}
        catch { $('status').textContent='PNG export failed. Try SVG instead.'; }
      });
      $('load-state').hidden=true;
      $('workspace').hidden=false;
      run();
    } catch (error) {
      $('load-state').hidden=false;
      $('load-state').textContent='The model could not load. Reload this page and try again.';
    }
  }
  init();
})();

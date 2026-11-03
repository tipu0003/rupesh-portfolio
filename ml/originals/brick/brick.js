(() => {
  'use strict';
  const get = id => document.getElementById(id);
  function predict(model, replacement) {
    const batch = [replacement, 40, 40 - 0.4 * replacement, 0.4 * replacement, 20];
    const inputs = batch.map((value, i) => Math.fround(value * model.scale[i] + model.offset[i]));
    let sum = Math.fround(model.base);
    for (const tree of model.forest) {
      let node = tree[0];
      while (node.length > 1) node = tree[inputs[node[0]] < Math.fround(node[1]) ? node[2] : node[3]];
      sum = Math.fround(sum + Math.fround(node[0]));
    }
    return sum;
  }

  async function load() {
    const response = await fetch('./brick-model.json');
    if (!response.ok) throw Error('Could not load brick model');
    const model = await response.json();
    if (model.forest?.length !== 1325 || model.nativeFixture.x.some((x, i) =>
      Math.abs(predict(model, x) - model.nativeFixture.native[i]) > 0.00005)) throw Error('Model verification failed');

    const curve = Array.from({length:101}, (_, x) => ({x, y:predict(model,x)}));
    let chart;
    const slider = get('replacement');
    function update() {
      const x = Number(slider.value);
      get('ratio').textContent = x + '%';
      get('sand').textContent = (40 - 0.4*x).toFixed(1) + ' kg';
      get('ceramic').textContent = (0.4*x).toFixed(1) + ' kg';
      get('prediction').textContent = curve[x].y.toFixed(2);
      chart = LabPlot.draw(get('chart'), {
        title:'Ceramic substitution and brick strength', subtitle:'Fixed batch · 40 kg fly ash, 20 kg cement and 40 kg combined sand and ceramic',
        xLabel:'Sand replaced by ceramic (%)', yLabel:'Predicted strength (MPa)', xDomain:[0,100],
        series:[{label:'XGBoost model', points:curve, markers:false}, {label:'Selected batch',points:[curve[x]],type:'scatter',color:'#a04b37'}],
        caption:'Predicted values along the fixed 100 kg batch path. These values describe the fitted model response.'
      });
    }
    get('samples').textContent = model.testCount + ' / ' + model.rowCount;
    get('rmse').textContent = model.scores.rmse.toFixed(2) + ' MPa';
    get('mae').textContent = model.scores.mae.toFixed(2) + ' MPa';
    get('rsq').textContent = model.scores.r2.toFixed(3);
    slider.addEventListener('input', update);
    get('xls').addEventListener('click', () => {
      const x = Number(slider.value);
      const sheets = [
        {name:'Selected batch',rows:[['Quantity','Value','Unit'],['Sand replaced',x,'%'],['Fly ash',40,'kg'],['Cement',20,'kg'],['Sand',40 - 0.4*x,'kg'],['Ceramic',0.4*x,'kg'],['Predicted strength',curve[x].y,'MPa']]},
        {name:'Response curve',rows:[['Ceramic replacement (%)','Predicted strength (MPa)'],...curve.map(p=>[p.x,p.y])]},
        {name:'Model evidence',rows:[['Property','Value'],['Repository','https://github.com/tipu0003/Brick-compressive-strength-prediction'],['Source commit',model.commit],['Checkpoint SHA256',model.sha256],['Test rows',model.testCount],['Data rows',model.rowCount],['Final fold R²',model.scores.r2],['Final fold MAE (MPa)',model.scores.mae],['Final fold RMSE (MPa)',model.scores.rmse],['Scope','Shuffled source fold with repeated labels; no independent validation or calibrated interval.']]}
      ];
      LabExport.xlsx(sheets,'ceramic-brick-strength'); get('export-state').textContent = 'Excel workbook exported.';
    });
    get('svg').addEventListener('click', () => { LabExport.svg(chart,'ceramic-brick-strength'); get('export-state').textContent='SVG exported.'; });
    get('png').addEventListener('click', async () => {
      try { await LabExport.png(chart,'ceramic-brick-strength'); get('export-state').textContent='PNG exported.'; }
      catch { get('export-state').textContent='PNG export unavailable. Use Save SVG instead.'; }
    });
    get('workspace').hidden=false;
    get('loading').hidden=true;
    update();
  }
  load().catch(() => { get('loading').textContent='The model could not load or pass its reference check. Reload this page to try again.'; });
})();

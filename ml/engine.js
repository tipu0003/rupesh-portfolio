/* Portable regression and study calculations for the curated, locally shipped models. */
(function (scope) {
  'use strict';
  function predict(model, inputs) {
    if (inputs.length !== model.features.length || inputs.some(v => !Number.isFinite(v))) {
      throw new Error('Each feature needs a valid number.');
    }
    let result = model.base;
    if (model.linearWeights) {
      model.linearWeights.forEach((weight, index) => { result += weight * inputs[index]; });
    }
    for (const tree of model.trees) {
      let node = tree[0];
      while (node.length > 1) node = tree[inputs[node[0]] <= node[1] ? node[2] : node[3]];
      result += node[0];
    }
    return result;
  }
  function quantities(model, inputs) {
    const byKey = Object.fromEntries(model.features.map((f, i) => [f.key, inputs[i]]));
    const binder = byKey.cement + byKey.slag + byKey.flyAsh;
    const total = binder + byKey.water + byKey.superplasticizer + byKey.coarseAggregate + byKey.fineAggregate;
    return {binder, total, waterBinder: byKey.water / binder};
  }
  function check(model, inputs) {
    if (model.features.length !== inputs.length) return 'Some inputs are missing.';
    for (const [i, field] of model.features.entries()) {
      const v = inputs[i];
      if (!Number.isFinite(v) || v < field.min - 1e-8 || v > field.max + 1e-8) {
        return field.label + ' must be between ' + field.min + ' and ' + field.max + ' ' + field.unit + '.';
      }
      if (field.key === 'age' && !Number.isInteger(v)) return 'Age must be entered in whole days.';
    }
    const quantitiesForMix = quantities(model, inputs);
    const bounds = model.domain || {};
    for (const [key, value, message] of [
      ['waterBinder', quantitiesForMix.waterBinder, 'The water-to-binder mass ratio'],
      ['totalMass', quantitiesForMix.total, 'The total ingredient mass per cubic metre']
    ]) {
      const [lo, hi] = bounds[key] || [];
      if (Number.isFinite(lo) && Number.isFinite(hi) && (value < lo - 1e-8 || value > hi + 1e-8)) {
        return message + ' falls outside the measured data range (' + lo.toFixed(3) + '–' + hi.toFixed(3) + ').';
      }
    }
    return '';
  }
  function response(model, inputs, featureIndex) {
    const f = model.features[featureIndex];
    const xValues = new Set([f.min, inputs[featureIndex], f.max]);
    for (let i=0; i<=60; i++) {
      const v = f.min + (f.max - f.min) * i/60;
      xValues.add(f.key === 'age' ? Math.round(v) : v);
    }
    return [...xValues].sort((a,b)=>a-b).flatMap(x=>{
      const candidate = inputs.slice();
      candidate[featureIndex] = x;
      return check(model, candidate) ? [] : [{x, y:predict(model,candidate)}];
    });
  }
  function ageCurve(model, inputs, days) {
    const index = model.features.findIndex(f => f.key === 'age');
    return days.flatMap(x => {
      const candidate = inputs.slice();
      candidate[index] = x;
      return check(model,candidate) ? [] : [{x, y:predict(model,candidate)}];
    });
  }
  function rankRecipes(model, age, target, maxBinder) {
    const ageIndex = model.features.findIndex(f => f.key === 'age');
    const recipes = (model.referenceMixes || []).filter(row => row[ageIndex] === age);
    const set = new Set();
    const result = [];
    for (const row of recipes) {
      if (check(model,row) || set.has(row.join(','))) continue;
      set.add(row.join(','));
      const q = quantities(model,row);
      if (maxBinder !== null && q.binder > maxBinder) continue;
      const y = predict(model,row);
      result.push({inputs:row, value:y, binder:q.binder, waterBinder:q.waterBinder, difference:y-target});
    }
    return result.sort((a,b)=>Math.abs(a.difference)-Math.abs(b.difference) || a.binder-b.binder);
  }
  const api = {predict, check, quantities, response, ageCurve, rankRecipes};
  scope.LabEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);

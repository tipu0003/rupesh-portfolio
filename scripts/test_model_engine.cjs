/* Exercise the browser predictor and its domain checks with the shipped model data. */
const assert = require('node:assert/strict');
const engine = require('../ml/engine.js');
const {models} = require('../ml/data/models.json');
const rca = require('../ml/originals/rca/inference.js').load(require('../ml/originals/rca/model.json'));

const reference = {
  strength: 28.385605,
  slump: 22.573058,
  flow: 62.124720,
  strength28: 34.233541,
  early28: 33.434801,
};
for (const [key, expected] of Object.entries(reference)) {
  const model = models[key];
  const values = model.features.map(f => f.default);
  assert.equal(engine.check(model, values), '');
  assert.ok(Math.abs(engine.predict(model, values) - expected) < 1e-5, key);
}
const strength = models.strength;
const tooHeavy = strength.features.map(f =>
  ['coarseAggregate', 'fineAggregate'].includes(f.key) ? f.max : f.default
);
assert.match(engine.check(strength, tooHeavy), /total ingredient mass/i);
const ranked = engine.rankRecipes(strength, 28, 35, 360);
assert.ok(ranked.length > 0);
ranked.forEach((mix, i) => {
  assert.ok(mix.binder <= 360);
  if (i) assert.ok(Math.abs(mix.difference) >= Math.abs(ranked[i-1].difference));
});
assert.equal(rca([350, 700, 25, 75, 0.55, 0.75, 28]), 43.072566986083984);
assert.throws(() => rca([350, 700, 25, 74, 0.55, 0.75, 28]), /shares/);
console.log('Passed portable model, mass bounds, mix ranking and original RCA checks.');

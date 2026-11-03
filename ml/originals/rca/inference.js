/* Native XGBoost numeric split semantics. Each packed node has 7 little-endian bytes:
   feature (int8), left-child index (int16), threshold or leaf value (float32).
   The right child is left + 1. Child indices are local to their tree. */
(function (scope) {
  'use strict';
  function load(model) {
    if (model.format !== 1 || model.features.length !== 7) throw new Error('Unknown RCA model.');
    const bytes = Uint8Array.from(atob(model.nodes), char => char.charCodeAt(0));
    const nodes = new DataView(bytes.buffer);
    const roots = [];
    let count = 0;
    for (const size of model.treeSizes) {
      roots.push(count);
      count += size;
    }
    if (count * 7 !== bytes.byteLength) throw new Error('The RCA model file is incomplete.');
    function predict(values) {
      if (values.length !== model.features.length || values.some((x, i) =>
        !Number.isFinite(x) || x < model.min[i] || x > model.max[i])) {
        throw new Error('Each input must be within its displayed training range.');
      }
      if (Math.abs(values[2] + values[3] - 100) > 0.0001) {
        throw new Error('The natural and recycled shares must add to 100%.');
      }
      if (!Number.isInteger(values[6])) throw new Error('Use a whole number of curing days.');
      const scaled = values.map((x, i) => Math.fround(x * model.scale[i] + model.offset[i]));
      let total = Math.fround(model.base);
      for (const root of roots) {
        let pointer = root * 7;
        while (true) {
          const feature = nodes.getInt8(pointer);
          const threshold = nodes.getFloat32(pointer + 3, true);
          if (feature < 0) {
            total = Math.fround(total + threshold);
            break;
          }
          const left = nodes.getInt16(pointer + 1, true);
          pointer = 7 * (root + left + (scaled[feature] < threshold ? 0 : 1));
        }
      }
      return total;
    }
    return predict;
  }
  scope.RecycledConcrete = { load };
  if (typeof module !== 'undefined' && module.exports) module.exports = { load };
})(globalThis);

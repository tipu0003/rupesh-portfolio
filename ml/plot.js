/* Self-contained vector plots. Every visible axis, label and band is included in downloads. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const colors = ['#215dc2', '#087568', '#98486e', '#825e1f', '#5c4aab'];
  const ink = '#162e50', muted = '#485d76', grid = '#dce5f2';
  const observers = new WeakMap();
  let nextChart = 0;
  const num = value => {
    const a = Math.abs(value);
    if (a && (a < 0.001 || a >= 1000000)) return value.toExponential(1);
    return new Intl.NumberFormat('en', { maximumFractionDigits: a && a < 0.1 ? 3 : 2 }).format(value);
  };
  function element(tag, attrs = {}, text) {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) node.setAttribute(key, String(value));
    }
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function label(x, y, text, attrs = {}) {
    return element('text', { x, y, fill: ink, 'font-size': 13, ...attrs }, String(text));
  }
  function wrap(value, maxChars) {
    const words = String(value || '').trim().split(/\s+/);
    const lines = [];
    for (const word of words) {
      if (!word) continue;
      const line = lines.length - 1;
      if (line >= 0 && lines[line].length + word.length + 1 <= maxChars) lines[line] += ' ' + word;
      else lines.push(word);
    }
    return lines;
  }
  function axis(values, limit, forced) {
    const predefined = Array.isArray(forced) && Number.isFinite(forced[0]) && Number.isFinite(forced[1]) && forced[1] > forced[0];
    let min = predefined ? forced[0] : Infinity, max = predefined ? forced[1] : -Infinity;
    if (!predefined) for (const value of values) {
      if (value < min) min = value;
      if (value > max) max = value;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) { min = 0; max = 1; }
    if (min === max) { const pad = Math.max(0.5, Math.abs(min) * 0.05); min -= pad; max += pad; }
    const rough = (max - min) / (limit - 1);
    const base = 10 ** Math.floor(Math.log10(rough));
    const step = ([1, 2, 2.5, 5, 10].find(v => v * base >= rough) || 10) * base;
    if (!predefined) { min = Math.floor(min / step) * step; max = Math.ceil(max / step) * step; }
    const ticks = [];
    const start = Math.ceil(min / step - 1e-10);
    for (let i = start; i * step <= max + step * 1e-9 && ticks.length < 25; i++) ticks.push(Number((i * step).toPrecision(12)));
    return { min, max, ticks };
  }
  function path(points, sx, sy, key = 'y') {
    return points.map((p, i) => (i ? 'L' : 'M') + sx(p.x).toFixed(2) + ',' + sy(p[key]).toFixed(2)).join(' ');
  }
  function draw(host, config) {
    if (!host || !Array.isArray(config.series)) throw new Error('A plot requires a container and a list of series.');
    observers.get(host)?.disconnect();
    const id = 'ml-chart-' + ++nextChart;
    const svg = element('svg', {
      role: 'img', tabindex: '0', 'aria-labelledby': id + '-title', 'aria-describedby': id + '-desc',
      'font-family': 'Arial, Helvetica, sans-serif', 'font-size': 13, style: 'display:block;width:100%;height:auto'
    });
    const status = document.createElement('span');
    status.setAttribute('aria-live', 'polite');
    status.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
    host.replaceChildren(svg, status);
    const series = config.series.map((s, i) => ({
      ...s, label: s.label || ('Series ' + (i + 1)), color: s.color || colors[i % colors.length],
      points: (s.points || []).filter(p => p && Number.isFinite(p.x) && Number.isFinite(p.y))
    }));
    const formatX = typeof config.xFormat === 'function' ? config.xFormat : num;
    const formatY = typeof config.yFormat === 'function' ? config.yFormat : num;
    let state = null;
    let width = 0, selected = -1;
    function render() {
      const measured = Math.round(host.clientWidth || 800);
      const w = Math.max(280, Math.min(1024, measured));
      if (w === width) return;
      width = w;
      selected = -1;
      const compact = w < 540;
      const margin = compact ? 11 : 22;
      const titleSize = compact ? 16 : 21;
      const titleLines = wrap(config.title, Math.max(24, Math.floor((w - 2 * margin) / (titleSize * 0.55))));
      const textLimit = Math.floor((w - 2 * margin) / 6.2);
      const subtitleLines = wrap(config.subtitle, textLimit);
      const captionLines = wrap(config.caption, textLimit);
      const all = series.flatMap(s => s.points);
      const xAxis = axis(all.map(p => p.x), compact ? 4 : 7, config.xDomain);
      const yValues = all.flatMap(p => [p.y, p.lo, p.hi].filter(Number.isFinite));
      const yAxis = axis(yValues, 6, config.yDomain);
      const left = Math.max(53, 31 + Math.max(...yAxis.ticks.map(value => String(formatY(value)).length), 0) * 6.6);
      const right = w - (compact ? 18 : 25);
      let baseline = margin + titleSize;
      const content = [];
      for (const line of titleLines) {
        content.push(label(margin, baseline, line, { 'font-size': titleSize, 'font-weight': 650 }));
        baseline += titleSize + 3;
      }
      for (const line of subtitleLines) {
        content.push(label(margin, baseline, line, { fill: muted, 'font-size': 12 }));
        baseline += 15;
      }
      baseline += 8;
      let legendX = margin;
      const legendFont = compact ? 10.5 : 12;
      for (const entry of series) {
        const textWidth = Math.min(w - 55, entry.label.length * legendFont * .56);
        if (legendX + textWidth + 38 > w && legendX > margin) { legendX = margin; baseline += 18; }
        if (entry.type === 'scatter' || entry.line === false) {
          content.push(element('circle', { cx: legendX + 8, cy: baseline - 4, r: 3, fill: entry.color }));
        } else {
          content.push(element('line', { x1: legendX, x2: legendX + 17, y1: baseline - 4, y2: baseline - 4,
            stroke: entry.color, 'stroke-width': 2.5, 'stroke-dasharray': entry.dash }));
        }
        const legendLabel = entry.label.length * legendFont * .56 > textWidth + 1 ?
          entry.label.slice(0, Math.max(4, Math.floor(textWidth / (legendFont * .56)) - 1)) + '…' : entry.label;
        content.push(label(legendX + 23, baseline, legendLabel, { fill: muted, 'font-size': legendFont }));
        legendX += textWidth + 37;
      }
      const top = baseline + 20, bottom = top + (compact ? 188 : Math.max(205, Math.min(295, w * .35)));
      const h = bottom + 59 + captionLines.length * 15 + margin;
      const sx = x => left + (x - xAxis.min) / (xAxis.max - xAxis.min) * (right - left);
      const sy = y => bottom - (y - yAxis.min) / (yAxis.max - yAxis.min) * (bottom - top);
      const defs = element('defs');
      const clip = element('clipPath', { id: id + '-clip' });
      clip.append(element('rect', { x: left - 1, y: top - 1, width: right - left + 2, height: bottom - top + 2 }));
      defs.append(clip);
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.replaceChildren(element('title', { id: id + '-title' }, config.title || 'Model chart'),
        element('desc', { id: id + '-desc' }, [config.subtitle, config.caption,
          'Use the arrow keys to inspect data. ' + (config.xLabel || 'X') + ' on the horizontal axis, ' +
          (config.yLabel || 'Y') + ' on the vertical axis.'].filter(Boolean).join(' ')),
        defs, element('rect', { width: w, height: h, rx: 0, fill: '#ffffff' }), ...content);
      svg.append(element('rect', { x: left, y: top, width: right - left, height: bottom - top, fill: '#f8faff' }));
      for (const v of yAxis.ticks) {
        const y = sy(v);
        svg.append(element('line', { x1: left, y1: y, x2: right, y2: y, stroke: grid }),
          label(left - 7, y + 3.5, formatY(v), { 'text-anchor': 'end', 'font-size': 10.7, fill: muted }));
      }
      for (const v of xAxis.ticks) {
        const x = sx(v);
        svg.append(element('line', { x1: x, y1: top, x2: x, y2: bottom, stroke: grid, 'stroke-dasharray': '2 4' }),
          label(x, bottom + 17, formatX(v), { 'text-anchor': 'middle', 'font-size': 10.7, fill: muted }));
      }
      svg.append(element('path', { d: 'M' + left + ',' + top + 'V' + bottom + 'H' + right, fill: 'none', stroke: '#899bb2' }),
        label((left + right) / 2, bottom + 38, config.xLabel || '', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': '600' }),
        label(0, 0, config.yLabel || '', { transform: 'translate(14,' + ((top + bottom) / 2) + ') rotate(-90)',
          'text-anchor': 'middle', 'font-size': 12, 'font-weight': '600' }));
      for (const [index, line] of captionLines.entries()) svg.append(label(margin, bottom + 61 + index * 15, line, { fill: muted, 'font-size': 11.5 }));
      const layer = element('g', { 'clip-path': 'url(#' + id + '-clip)' });
      const hits = [];
      for (const s of series) {
        const scatter = s.line === false || s.type === 'scatter';
        const points = scatter ? s.points : [...s.points].sort((a, b) => a.x - b.x);
        // Build a separate band for each contiguous set of valid bounds.
        const band = [];
        const flush = () => {
          if (band.length > 1) {
            const outline = path(band, sx, sy, 'hi') + path([...band].reverse(), sx, sy, 'lo').replace(/^M/, 'L') + 'Z';
            layer.append(element('path', { d: outline, fill: s.color, 'fill-opacity': .13, stroke: 'none' }));
          }
          band.length = 0;
        };
        for (const p of points) {
          if (Number.isFinite(p.lo) && Number.isFinite(p.hi) && p.hi >= p.lo) band.push(p);
          else flush();
        }
        flush();
        if (!scatter) layer.append(element('path', { d: path(points, sx, sy), fill: 'none', stroke: s.color,
          'stroke-width': 2.6, 'stroke-dasharray': s.dash, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
        const showMarkers = s.markers === true || (s.markers !== false && (scatter || points.length < 15));
        for (const p of points) {
          const x = sx(p.x), y = sy(p.y);
          if (showMarkers) layer.append(element('circle', { cx: x, cy: y, r: scatter ? 3.8 : 3,
            fill: s.color, 'fill-opacity': scatter ? .77 : 1, stroke: '#ffffff', 'stroke-width': .9 }));
          if (x >= left - .1 && x <= right + .1 && y >= top - .1 && y <= bottom + .1 && s.inspectable !== false) {
            hits.push({ x, y, p, s });
          }
        }
      }
      const tooltip = element('g', { 'data-interactive': '', 'pointer-events': 'none', display: 'none' });
      svg.append(layer, tooltip);
      hits.sort((a, b) => a.p.x - b.p.x || a.p.y - b.p.y);
      state = { hits, tooltip, left, right, top, bottom, w, h };
    }
    function show(index, announce) {
      if (!state || !state.hits[index]) return;
      const { hits, tooltip, left, right, top, bottom, w } = state;
      const hit = hits[index];
      selected = index;
      const title = hit.p.label || hit.s.label;
      const rows = [String(title), (config.xLabel || 'X') + ' · ' + formatX(hit.p.x), (config.yLabel || 'Y') + ' · ' + formatY(hit.p.y)];
      if (Number.isFinite(hit.p.lo) && Number.isFinite(hit.p.hi)) rows.push('Band · ' + formatY(hit.p.lo) + ' to ' + formatY(hit.p.hi));
      const tipW = Math.min(w - 15, Math.max(95, ...rows.map(t => t.length * 6.4 + 16)));
      const displayRows = rows.flatMap(text => wrap(text, Math.floor((tipW - 14) / 6.2)));
      const tipH = displayRows.length * 15 + 9;
      const tx = Math.max(4, Math.min(w - tipW - 4, hit.x < w / 2 ? hit.x + 9 : hit.x - tipW - 9));
      const ty = Math.min(bottom - tipH, Math.max(top, hit.y - tipH - 9));
      tooltip.replaceChildren(
        element('path', { d: 'M' + left + ',' + hit.y + 'H' + right + 'M' + hit.x + ',' + top + 'V' + bottom,
          stroke: '#718ba8', 'stroke-width': .9, 'stroke-dasharray': '3 3', fill: 'none' }),
        element('circle', { cx: hit.x, cy: hit.y, r: 5, fill: hit.s.color, stroke: '#fff', 'stroke-width': 2 }),
        element('rect', { x: tx, y: ty, width: tipW, height: tipH, rx: 4, fill: '#173354' }),
        ...displayRows.map((text, i) => label(tx + 7, ty + 14 + i * 15, text, { fill: '#ffffff', 'font-size': 10.9, 'font-weight': i === 0 ? 650 : 400 })));
      tooltip.removeAttribute('display');
      if (announce) status.textContent = rows.join('. ');
    }
    function hide() {
      state?.tooltip.setAttribute('display', 'none');
      selected = -1;
    }
    svg.addEventListener('pointermove', event => {
      if (!state || !state.hits.length) return;
      const bounds = svg.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = (event.clientX - bounds.left) / bounds.width * state.w;
      const y = (event.clientY - bounds.top) / bounds.height * state.h;
      if (x < state.left || x > state.right || y < state.top || y > state.bottom) { hide(); return; }
      let nearest = 0, distance = Infinity;
      state.hits.forEach((h, i) => {
        const delta = (h.x - x) ** 2 + (h.y - y) ** 2;
        if (delta < distance) { nearest = i; distance = delta; }
      });
      show(nearest, false);
    });
    svg.addEventListener('pointerleave', hide);
    svg.addEventListener('blur', hide);
    svg.addEventListener('keydown', event => {
      if (!state || !state.hits.length || !['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape'].includes(event.key)) return;
      event.preventDefault();
      const last = state.hits.length - 1;
      if (event.key === 'Escape') { hide(); return; }
      show(event.key === 'Home' ? 0 : event.key === 'End' ? last :
        Math.min(last, Math.max(0, selected + (event.key === 'ArrowLeft' ? -1 : 1))), true);
    });
    render();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(render);
      observer.observe(host);
      observers.set(host, observer);
    }
    return svg;
  }
  window.LabPlot = Object.freeze({ draw });
})();

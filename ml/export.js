/* Native browser downloads for the concrete lab. All data stays on the visitor's device. */
(() => {
  'use strict';
  const xml = value => String(value).replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const declaration = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const spreadsheetNS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const documentNS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const relationshipsNS = 'http://schemas.openxmlformats.org/package/2006/relationships';

  function save(blob, filename, extension) {
    const base = String(filename || 'concrete-lab').replace(/[\\/:*?"<>|\x00-\x1f]/g, '-');
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = base.toLowerCase().endsWith('.' + extension) ? base : base + '.' + extension;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
    return value >>> 0;
  });
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  // ZIP method 0 stores bytes uncompressed. Excel/LibreOffice read these files without a plug-in.
  function zip(files) {
    const encoder = new TextEncoder();
    const parts = [], directory = [];
    let offset = 0, directorySize = 0;
    for (const [filename, contents] of files) {
      const name = encoder.encode(filename), bytes = encoder.encode(contents), crc = crc32(bytes);
      const local = new Uint8Array(30 + name.length);
      const lh = new DataView(local.buffer);
      lh.setUint32(0, 0x04034b50, true);
      lh.setUint16(4, 20, true);
      lh.setUint16(6, 0x0800, true);
      lh.setUint16(12, 0x0021, true);
      lh.setUint32(14, crc, true);
      lh.setUint32(18, bytes.length, true);
      lh.setUint32(22, bytes.length, true);
      lh.setUint16(26, name.length, true);
      local.set(name, 30);
      const central = new Uint8Array(46 + name.length);
      const ch = new DataView(central.buffer);
      ch.setUint32(0, 0x02014b50, true);
      ch.setUint16(4, 20, true);
      ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true);
      ch.setUint16(14, 0x0021, true);
      ch.setUint32(16, crc, true);
      ch.setUint32(20, bytes.length, true);
      ch.setUint32(24, bytes.length, true);
      ch.setUint16(28, name.length, true);
      ch.setUint32(42, offset, true);
      central.set(name, 46);
      parts.push(local, bytes);
      directory.push(central);
      offset += local.length + bytes.length;
      directorySize += central.length;
    }
    const end = new Uint8Array(22);
    const eh = new DataView(end.buffer);
    eh.setUint32(0, 0x06054b50, true);
    eh.setUint16(8, directory.length, true);
    eh.setUint16(10, directory.length, true);
    eh.setUint32(12, directorySize, true);
    eh.setUint32(16, offset, true);
    return new Blob([...parts, ...directory, end], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  function columnName(index) {
    let name = '';
    for (let i = index + 1; i > 0; i = Math.floor((i - 1) / 26)) name = String.fromCharCode(65 + (i - 1) % 26) + name;
    return name;
  }

  function worksheet(rows) {
    if (!Array.isArray(rows) || rows.length > 1048576) throw new Error('Unsupported worksheet row count.');
    const widths = [];
    const table = rows.map((row, i) => {
      if (!Array.isArray(row) || row.length > 16384) throw new Error('Invalid worksheet row.');
      const cells = row.map((value, j) => {
        if (value === undefined || value === null) return '';
        const address = columnName(j) + (i + 1);
        widths[j] = Math.min(65, Math.max(widths[j] || 11, String(value).split('\n').reduce((max, s) => Math.max(max, s.length), 0) + 2));
        if (typeof value === 'number' && Number.isFinite(value)) return '<c r="' + address + '" t="n"><v>' + value + '</v></c>';
        if (typeof value === 'boolean') return '<c r="' + address + '" t="b"><v>' + Number(value) + '</v></c>';
        // Inline strings are literal text, including values starting with equals.
        return '<c r="' + address + '" s="' + (i === 0 ? 1 : 2) + '" t="inlineStr"><is><t xml:space="preserve">' +
          xml(String(value).slice(0, 32767)) + '</t></is></c>';
      }).join('');
      return '<row r="' + (i + 1) + '">' + cells + '</row>';
    }).join('');
    const cols = widths.map((w, j) => '<col min="' + (j + 1) + '" max="' + (j + 1) + '" width="' + w + '" customWidth="1"/>').join('');
    return declaration + '<worksheet xmlns="' + spreadsheetNS + '"><sheetViews><sheetView workbookViewId="0">' +
      '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
      '<sheetFormatPr defaultRowHeight="16"/>' + (cols ? '<cols>' + cols + '</cols>' : '') + '<sheetData>' + table + '</sheetData></worksheet>';
  }

  const styles = declaration + '<styleSheet xmlns="' + spreadsheetNS + '">' +
    '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts>' +
    '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FF193F74"/><bgColor indexed="64"/></patternFill></fill></fills>' +
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

  function workbook(sheets) {
    if (!Array.isArray(sheets) || !sheets.length) throw new Error('The workbook needs at least one sheet.');
    const used = new Set();
    const meta = sheets.map((sheet, i) => {
      const stem = String(sheet.name || ('Sheet ' + (i + 1))).replace(/[\\\/?*\[\]:]/g, '-').replace(/^'+|'+$/g, '').trim().slice(0, 31) || 'Sheet';
      let name = stem, suffix = 2;
      while (used.has(name.toLowerCase())) {
        const extra = ' ' + suffix++;
        name = stem.slice(0, 31 - extra.length) + extra;
      }
      used.add(name.toLowerCase());
      return { name, path: 'worksheets/sheet' + (i + 1) + '.xml', id: 's' + (i + 1), rows: sheet.rows };
    });
    const files = [
      ['[Content_Types].xml', declaration + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        meta.map(s => '<Override PartName="/xl/' + s.path + '" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('') + '</Types>'],
      ['_rels/.rels', declaration + '<Relationships xmlns="' + relationshipsNS + '"><Relationship Id="r1" Type="' + documentNS + '/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ['xl/workbook.xml', declaration + '<workbook xmlns="' + spreadsheetNS + '" xmlns:r="' + documentNS + '"><sheets>' +
        meta.map((s, i) => '<sheet name="' + xml(s.name) + '" sheetId="' + (i + 1) + '" r:id="' + s.id + '"/>').join('') + '</sheets></workbook>'],
      ['xl/_rels/workbook.xml.rels', declaration + '<Relationships xmlns="' + relationshipsNS + '">' +
        meta.map(s => '<Relationship Id="' + s.id + '" Type="' + documentNS + '/worksheet" Target="' + s.path + '"/>').join('') +
        '<Relationship Id="styles" Type="' + documentNS + '/styles" Target="styles.xml"/></Relationships>'],
      ['xl/styles.xml', styles],
      ...meta.map(s => ['xl/' + s.path, worksheet(s.rows)])
    ];
    return zip(files);
  }

  function chartImage(svg) {
    if (!svg || svg.localName !== 'svg') throw new Error('Generate a plot first.');
    const clone = svg.cloneNode(true);
    clone.querySelectorAll('[data-interactive]').forEach(node => node.remove());
    clone.removeAttribute('style');
    clone.removeAttribute('tabindex');
    clone.removeAttribute('aria-describedby');
    const box = svg.viewBox.baseVal;
    clone.setAttribute('width', String(box.width));
    clone.setAttribute('height', String(box.height));
    const data = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([declaration, data], { type: 'image/svg+xml;charset=utf-8' });
    return { blob, width: box.width, height: box.height };
  }
  async function png(svg, filename) {
    const chart = chartImage(svg);
    const url = URL.createObjectURL(chart.blob);
    try {
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = () => reject(new Error('Could not render the plot.')); img.src = url; });
      const canvas = document.createElement('canvas');
      canvas.width = 2400;
      canvas.height = Math.round(canvas.width * chart.height / chart.width);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('PNG export is unavailable in this browser.');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG export failed. Try SVG instead.');
      save(blob, filename, 'png');
    } finally { URL.revokeObjectURL(url); }
  }

  window.LabExport = Object.freeze({
    xlsx: (sheets, name) => save(workbook(sheets), name, 'xlsx'),
    svg: (chart, name) => save(chartImage(chart).blob, name, 'svg'),
    png
  });
})();

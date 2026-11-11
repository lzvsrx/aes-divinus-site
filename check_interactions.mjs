import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
class Element {
  constructor(dataset = {}) { this.dataset = dataset; this.events = {}; this.attributes = {}; this.textContent = ''; }
  addEventListener(name, callback) { this.events[name] = callback; }
  setAttribute(name, value) { this.attributes[name] = value; }
  focus() { this.focused = true; }
  showModal() { this.opened = true; }
  close() { this.opened = false; }
  click() { this.events.click?.({ target: this }); }
}
const tabs = ['amparo', 'lucidez', 'decisao'].map(oath => new Element({ oath }));
const outcomes = ['kept', 'broken'].map(outcome => new Element({ outcome }));
const lightbox = new Element({ lightbox: 'assets/battle.png', caption: 'Combate tático' });
const elements = new Map();
const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
const document = { getElementById: get, querySelectorAll: selector => ({ '[data-oath]': tabs, '[data-outcome]': outcomes, '[data-lightbox]': [lightbox], '[data-version]': [get('version')] })[selector] ?? [] };
const release = { version: '0.9.0', sha256: 'a'.repeat(64), bytes: 40000000, download_url: 'https://github.com/lzvsrx/aes-divinus-site/releases/download/v0.9.0/AesDivinus_Windows_0.9.zip' };
runInNewContext(readFileSync(new URL('public/app.js', import.meta.url), 'utf8'), { document, URL, fetch: async () => ({ ok: true, json: async () => release }) });
tabs[1].click();
assert.match(get('oath-title').textContent, /duas vozes/);
assert.equal(tabs[1].attributes['aria-selected'], 'true');
outcomes[1].click();
assert.match(get('oath-consequence').textContent, /Confiança −6/);
assert.match(get('oath-witness').textContent, /ALBERT/);
let prevented = false;
tabs[1].events.keydown({ key: 'ArrowRight', preventDefault() { prevented = true; } });
assert.ok(prevented && tabs[2].focused);
assert.match(get('oath-title').textContent, /quarta rodada/);
lightbox.click();
assert.ok(get('image-dialog').opened);
assert.equal(get('dialog-image').src, 'assets/battle.png');
get('close-dialog').click();
assert.equal(get('image-dialog').opened, false);
await new Promise(resolve => setImmediate(resolve));
assert.equal(get('download-link').href, release.download_url);
assert.equal(get('checksum-value').textContent, release.sha256);
console.log('Website interaction checks passed: tabs, keyboard, outcomes, gallery and release metadata.');

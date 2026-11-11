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
// Lazy demo lifecycle: no game download before an explicit click, one frame,
// and a real stop that unloads the engine rather than merely hiding it.
const demoElements = new Map();
const demoGet = id => { if (!demoElements.has(id)) demoElements.set(id, new Element()); return demoElements.get(id); };
let created = 0;
let removed = 0;
demoGet('demo-stage').appendChild = frame => { demoGet('demo-stage').frame = frame; };
runInNewContext(readFileSync(new URL('public/demo-page.js', import.meta.url), 'utf8'), {
  document: { getElementById: demoGet, createElement: () => { created++; const frame = new Element(); frame.remove = () => { removed++; }; return frame; } }
});
assert.equal(created, 0);
demoGet('start-demo').click();
assert.equal(created, 1);
assert.equal(demoGet('demo-stage').frame.src, 'demo/game.html');
assert.equal(demoGet('demo-cover').hidden, true);
demoGet('start-demo').click();
assert.equal(created, 1);
demoGet('stop-demo').click();
assert.equal(removed, 1);
assert.equal(demoGet('demo-cover').hidden, false);
demoGet('start-demo').click();
assert.equal(created, 2);
const config = JSON.parse(readFileSync(new URL('public/demo/config.json', import.meta.url), 'utf8'));
const loaderCode = readFileSync(new URL('public/demo/loader.js', import.meta.url), 'utf8');
async function testLoader(missing) {
  const nodes = new Map(['canvas', 'status', 'progress', 'loading'].map(id => [id, new Element()]));
  let started = false;
  class MockEngine {
    static getMissingFeatures(options) { assert.equal(options.threads, false); return missing; }
    constructor(options) { assert.equal(options.persistentPaths.length, 0); assert.equal(options.ensureCrossOriginIsolationHeaders, false); }
    async startGame(options) { started = true; options.onProgress(50, 100); }
  }
  runInNewContext(loaderCode, { document: { getElementById: id => nodes.get(id) }, Engine: MockEngine,
    fetch: async () => ({ ok: true, json: async () => config }), console: { error() {} } });
  await new Promise(resolve => setImmediate(resolve));
  if (missing.length) { assert.equal(started, false); assert.equal(nodes.get('progress').hidden, true); assert.match(nodes.get('status').textContent, /WebGL 2/); }
  else { assert.equal(started, true); assert.equal(nodes.get('loading').hidden, true); assert.equal(nodes.get('canvas').focused, true); }
}
await testLoader([]);
await testLoader(['WebGL2']);
await WebAssembly.compile(readFileSync(new URL('public/demo/game.wasm', import.meta.url)));
console.log('Website interactions passed: tabs, keyboard, outcomes, gallery, release metadata and lazy demo start/stop/restart.');
console.log('Web loader success/unsupported paths and WebAssembly compilation passed.');

// Community publishes only through an explicit GitHub confirmation; fetched
// user content stays text, and administrative writes never use browser tokens.
class CommunityElement extends Element {
  constructor() { super(); this.children = []; this.value = ''; }
  appendChild(node) { this.children.push(node); }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren() { this.children = []; }
}
const communityCode = readFileSync(new URL('public/community.js', import.meta.url), 'utf8');
function communityContext(withForm, response, fail = false) {
  const nodes = new Map();
  const get = id => {
    if (id === 'feedback-form' && !withForm) return null;
    if (!nodes.has(id)) nodes.set(id, new CommunityElement());
    return nodes.get(id);
  };
  let navigated = '';
  let requests = 0;
  get('topic-state').value = 'open';
  if (withForm) {
    get('feedback-form').reportValidity = () => true;
    get('feedback-title').value = 'Uma ideia para Gradon';
    get('feedback-body').value = 'Mais interações entre companheiros durante as missões.';
    get('feedback-area').value = 'História e personagens';
    get('feedback-kind').value = 'enhancement';
  }
  runInNewContext(communityCode, {
    document: { getElementById: get, createElement: () => new CommunityElement() },
    window: { location: { assign(url) { navigated = url; } } }, URL, AbortController, setTimeout, clearTimeout,
    fetch: async (url, options) => {
      requests++;
      assert.match(url, /^https:\/\/api.github.com\/repos\/lzvsrx\/aes-divinus-site\/issues\?/);
      assert.equal(options.credentials, 'omit');
      assert.equal(options.headers.Authorization, undefined);
      assert.equal(options.method, undefined);
      if (fail) throw new Error('offline');
      return response;
    }
  });
  return { get, requests: () => requests, navigated: () => navigated };
}
const payload = [{ number: 7, title: '<img src=x onerror=alert(1)>', body: '<script>bad()</script>', html_url: 'javascript:bad()', state: 'open', comments: 2, user: { login: 'player' } }, { number: 8, pull_request: {}, title: 'Not feedback' }, null];
const community = communityContext(true, { ok: true, json: async () => payload });
assert.equal(community.requests(), 0);
community.get('feedback-form').events.submit({ preventDefault() {} });
const draft = new URL(community.navigated());
assert.equal(draft.origin, 'https://github.com');
assert.equal(draft.pathname, '/lzvsrx/aes-divinus-site/issues/new');
assert.equal(draft.searchParams.get('template'), 'contribuicao.md');
assert.match(draft.searchParams.get('body'), /interações/);
community.get('feedback-title').value = 'x';
community.get('feedback-form').events.submit({ preventDefault() {} });
assert.match(community.get('feedback-status').textContent, /Revise/);
community.get('feedback-title').value = 'Long contribution';
community.get('feedback-body').value = '界'.repeat(3000);
community.get('feedback-form').events.submit({ preventDefault() {} });
assert.match(community.get('feedback-status').textContent, /longo/);
community.get('load-topics').click();
await new Promise(resolve => setImmediate(resolve));
assert.equal(community.get('topics-list').children.length, 1);
const card = community.get('topics-list').children[0];
assert.equal(card.children[0].children[0].textContent, '#7 · <img src=x onerror=alert(1)>');
assert.equal(card.children[0].children[0].href, 'https://github.com/lzvsrx/aes-divinus-site/issues/7');
assert.equal(card.children[2].textContent, '<script>bad()</script>');
assert.equal(card.children[2].innerHTML, undefined);
for (const [response, fail, expected] of [
  [{ ok: true, json: async () => [] }, false, /Nenhum tópico/],
  [{ ok: false, status: 403 }, false, /limitou/],
  [{ ok: true }, true, /Não foi possível/]
]) {
  const admin = communityContext(false, response, fail);
  assert.equal(admin.requests(), 0);
  admin.get('load-topics').click();
  await new Promise(resolve => setImmediate(resolve));
  assert.match(admin.get('topics-status').textContent, expected);
  assert.equal(admin.get('load-topics').disabled, false);
}
console.log('Community checks passed: draft validation, URL encoding/length, lazy public reads, safe text rendering, PR exclusion, empty/rate-limit/offline states and admin read-only shell.');

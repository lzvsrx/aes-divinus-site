"""Buildless-site checks: local assets, anchors, accessible images and release data."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import sys
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent / 'public'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.references, self.failures = set(), [], []
        self.headings = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids: self.failures.append('duplicate id: ' + attrs['id'])
            self.ids.add(attrs['id'])
        if tag == 'h1': self.headings += 1
        if tag == 'img' and not attrs.get('alt'): self.failures.append('image missing alt')
        for name in ('href', 'src', 'data-lightbox'):
            if attrs.get(name): self.references.append(attrs[name])
        if any(name.startswith('on') for name in attrs): self.failures.append('inline event handler')

def check():
    failures = []
    pages = {}
    for filename in ROOT.rglob('*.html'):
        page = Page()
        page.feed(filename.read_text(encoding='utf-8'))
        pages[filename.resolve()] = page
        failures.extend(page.failures)
        if page.headings != 1: failures.append(f'{filename.name}: expected exactly one h1')
    references = 0
    for filename, page in pages.items():
        for ref in page.references:
            references += 1
            url = urlsplit(ref)
            if url.scheme:
                if url.scheme != 'https': failures.append('non-HTTPS external reference: ' + ref)
                continue
            path = (filename.parent / url.path).resolve() if url.path else filename
            if not path.is_relative_to(ROOT.resolve()) or not path.is_file():
                failures.append('missing or unsafe asset: ' + ref)
            elif url.fragment and (path not in pages or url.fragment not in pages[path].ids):
                failures.append('missing anchor: ' + ref)
    demo = ROOT / 'demo'
    config = json.loads((demo / 'config.json').read_text(encoding='utf-8'))
    if config.get('gdextensionLibs') or config.get('ensureCrossOriginIsolationHeaders'):
        failures.append('demo must not require extensions or cross-origin isolation')
    for name in ['game.wasm', 'game.pck']:
        if (demo / name).stat().st_size != config['fileSizes'][name]:
            failures.append('demo size mismatch: ' + name)
    if (demo / 'game.wasm').read_bytes()[:4] != b'\x00asm': failures.append('invalid WASM header')
    release = json.loads((ROOT / 'release.json').read_text(encoding='utf-8'))
    if not re.fullmatch(r'\d+\.\d+\.\d+', release['version']): failures.append('invalid version')
    if not re.fullmatch(r'[a-f0-9]{64}', release['sha256']): failures.append('invalid checksum')
    if not release['download_url'].startswith('https://github.com/lzvsrx/aes-divinus-site/releases/download/'): failures.append('unexpected release host')
    if not isinstance(release['bytes'], int) or release['bytes'] < 1000000: failures.append('invalid release size')
    print(json.dumps({'pages_checked': len(pages), 'references_checked': references, 'failures': failures}, indent=2))
    return not failures

if __name__ == '__main__': sys.exit(0 if check() else 1)

"""Generate content hashes for the service worker's complete app release."""
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def manifest():
    release = (ROOT / 'js/release.js').read_text(encoding='utf-8')
    version = re.search(r"const version = '([^']+)'", release)[1]
    build = re.search(r"const build = '([^']+)'", release)[1]
    core = re.search(r'const CORE = \[(.*?)\];', (ROOT / 'sw.js').read_text(encoding='utf-8'), re.S)[1]
    paths = re.findall(r"['\"]([^'\"]+)['\"]", core)
    binary = ('.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.woff', '.woff2')
    crlf = [path for path in paths if not path.endswith(binary)
            and b'\r\n' in (ROOT / ('index.html' if path == './' else path)).read_bytes()]
    if crlf:
        raise ValueError('Convert app-shell text assets to LF before hashing: ' + ', '.join(crlf))
    assets = {path: hashlib.sha256((ROOT / ('index.html' if path == './' else path)).read_bytes()).hexdigest() for path in paths}
    return {'version': version, 'build': build, 'assets': assets}


if __name__ == '__main__':
    target = ROOT / 'release-manifest.json'
    target.write_text(json.dumps(manifest(), indent=2) + '\n', encoding='utf-8', newline='\n')
    print('Verified release manifest written:', target)

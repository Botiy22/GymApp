"""The verified updater compares every cached file with its published hash, so a file must be byte-identical after git checks it in."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
BINARY = ('.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.woff', '.woff2')

class ReleaseFiles(unittest.TestCase):
    def test_text_assets_use_lf_line_endings(self):
        # .gitattributes normalises text to LF; a CRLF file would publish different bytes and make every update fail its hash check.
        assets = json.loads((ROOT / 'release-manifest.json').read_text())['assets']
        crlf = [p for p in assets if not p.endswith(BINARY) and b'\r\n' in (ROOT / ('index.html' if p == './' else p)).read_bytes()]
        self.assertEqual(crlf, [])

if __name__ == '__main__':
    unittest.main()

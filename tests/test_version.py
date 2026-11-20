"""The panel and the card are cached by their version: the number must follow every release."""
import importlib.util
import json
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
BRICK = ROOT / "custom_components" / "hestia_heating"


class VersionFollowsManifest(unittest.TestCase):
    def test_the_cached_files_carry_the_released_version(self):
        manifest = json.loads((BRICK / "manifest.json").read_text())["version"]
        spec = importlib.util.spec_from_file_location("hestia_heating_const", BRICK / "const.py")
        const = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(const)
        self.assertEqual(const.VERSION, manifest)
        for package in ("card", "frontend"):
            self.assertEqual(json.loads((ROOT / package / "package.json").read_text())["version"], manifest)
        # The tab's « À propos » says it too.
        self.assertEqual(re.search(r"const VERSION='([^']+)'", (ROOT / "frontend" / "panel.ts").read_text()).group(1), manifest)


if __name__ == "__main__":
    unittest.main()

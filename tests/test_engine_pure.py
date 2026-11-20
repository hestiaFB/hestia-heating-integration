"""The engine is plain Python: it never imports Home Assistant, so it is tested alone with a made-up house."""
import ast
from pathlib import Path
import unittest

ENGINE = Path(__file__).resolve().parents[1] / "custom_components" / "hestia_heating" / "engine"


class EnginePure(unittest.TestCase):
    def test_no_module_of_the_engine_imports_home_assistant(self):
        for path in ENGINE.rglob("*.py"):
            for node in ast.walk(ast.parse(path.read_text(encoding="utf-8"))):
                names = [a.name for a in node.names] if isinstance(node, ast.Import) else [node.module or ""] if isinstance(node, ast.ImportFrom) else []
                for name in names:
                    self.assertFalse(name.split(".")[0] in ("homeassistant", "voluptuous", "aiohttp"), f"{path.name} imports {name}")


if __name__ == "__main__":
    unittest.main()

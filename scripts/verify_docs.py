from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
INDEX = DOCS / "index.html"


def assert_exists(path: Path) -> None:
    if not path.exists():
        raise SystemExit(f"Missing required file: {path}")


def main() -> None:
    assert_exists(INDEX)
    assert_exists(DOCS / "assets" / "styles.css")
    assert_exists(DOCS / "assets" / "app.js")
    assert_exists(DOCS / "assets" / "microgpt.py")
    assert_exists(DOCS / "assets" / "architecture.svg")

    html = INDEX.read_text(encoding="utf-8")
    required_ids = [
        'id="context"',
        'id="concepts"',
        'id="core-code"',
        'id="code-map"',
        'id="implementation"',
        'id="visuals"',
        'id="support"',
        'id="lossChart"',
        'id="attnHeatmap"',
        'id="pipelineAnim"',
        'id="coreCode"',
        'id="mapCode"',
        'id="codeStats"',
        'id="copyToast"',
        'class="line-index"',
        'class="card-jump"',
        'class="copy-anchor"',
    ]

    missing = [item for item in required_ids if item not in html]
    if missing:
        raise SystemExit(f"Missing required markup markers: {', '.join(missing)}")

    print("Docs integrity check passed.")


if __name__ == "__main__":
    main()

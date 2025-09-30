import subprocess
from pathlib import Path
import zipfile
import shutil
import tempfile


def convert_to_html(book_path: Path, outdir: Path):
    """Convert MOBI/PRC -> HTML via ebook-convert + unzip HTMLZ."""
    htmlz_path = outdir / (book_path.stem + ".htmlz")

    # 1. Convert to .htmlz
    cmd = ["ebook-convert", str(book_path), str(htmlz_path)]
    print("Running:", " ".join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Conversion failed for {book_path.name}:\n{res.stderr}")
        return None

    # 2. Unzip .htmlz
    unzip_htmlz(htmlz_path, outdir, book_path.stem)
    print(f"Converted {book_path.name} to {outdir / book_path.stem}")


def unzip_htmlz(htmlz_path: Path, outdir: Path, stem: str = "index"):
    """Unzip .htmlz to outdir."""
    tmpdir = Path(tempfile.mkdtemp())
    try:
        with zipfile.ZipFile(htmlz_path, "r") as zf:
            zf.extractall(tmpdir)
        # Pick main HTML (usually index.html)
        html_candidates = list(tmpdir.glob("*.html"))
        if not html_candidates:
            raise FileNotFoundError(f"No HTML file found in {htmlz_path}")
        main_html = html_candidates[0]

        final_html = outdir / f"{stem}.html"
        shutil.copy(main_html, final_html)
    except Exception as e:
        print(f"Failed to unzip {htmlz_path}: {e}")
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)
        htmlz_path.unlink(missing_ok=True)




def mobi_to_html(book_path: Path, outdir: Path):
   
    outdir.mkdir(parents=True, exist_ok=True)
    book_path = book_path.resolve()
    htmlz_path = outdir / f"{book_path.stem}.htmlz"
    final_html = outdir / f"{book_path.stem}.html"

    cmd = ["ebook-convert", str(book_path), str(htmlz_path)]
    print("Running:", " ".join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("❌ Conversion failed")
        print("STDERR:", res.stderr)
        return None

    with zipfile.ZipFile(htmlz_path, "r") as zf:
        names = zf.namelist()
        index = [n for n in names if n.endswith("index.html")]
        if not index:
            raise FileNotFoundError("Không tìm thấy index.html trong htmlz")
        content = zf.read(index[0])
        final_html.write_bytes(content)

    htmlz_path.unlink(missing_ok=True)

    print(f"✅ Converted {book_path} -> {final_html}")
    return final_html


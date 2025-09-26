from bs4 import BeautifulSoup, NavigableString
from pathlib import Path
import pandas as pd
import re
from typing import Literal

"""
    vi: Vietnamese
    ko: Korean
    ge: German
"""
LanguageCode = Literal["vi", "ko", "ge"]


def read_html(path: Path) -> BeautifulSoup:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return BeautifulSoup(f, "html.parser")


def clean_text(s: str) -> str:
    s = (s or "").replace("\xa0", " ")
    s = s.replace("&gt;", ">").replace("&lt;", "<").replace("&amp;", "&")
    s = re.sub(r"\s+", " ", s).strip()
    # Remove "--", ".-", "=-"
    s = re.sub(r"^(?:[.\-!=\)]*\-+)\s*", "", s)
    return s


# --- new helper: sanitize meaning ---
_BRACKET_PAT = re.compile(r"\{.*?\}|\(.*?\)|\[.*?\]")


def sanitize_meaning(text: str) -> str:
    """Remove content inside {}, (), [] and clean extra chars."""
    s = clean_text(text)
    s = _BRACKET_PAT.sub("", s)
    s = re.sub(r"\s+", " ", s).strip(" -—–:;,.。！!？?")
    return s.strip()


def get_word_meaning(h2_tag) -> str:
    node = h2_tag.next_sibling
    while node is not None:
        if isinstance(node, NavigableString):
            if node.strip():
                return str(node)
        else:
            if node.name == "h2":
                return ""  # no meaning line after h2
            txt = node.get_text(separator=" ", strip=True)
            if txt:
                return txt
        node = node.next_sibling
    return ""


def check_lang_source():
    re_ko = re.compile(r"[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\u4e00-\u9fff]")
    re_vi = re.compile(r"[ĂÂĐÊÔƠƯăâđêôơưÀ-ỹ]")
    re_ge = re.compile(r"[äöüÄÖÜß]")

    def is_lang(text: str, lang: str) -> bool:
        t = str(text or "")
        if lang == "ko":
            return bool(re_ko.search(t))
        if lang == "vi":
            return bool(re_vi.search(t))
        if lang == "ge":
            return (not bool(re_vi.search(t))) and bool(
                re_ge.search(t) or re.search(r"[A-Za-z]", t)
            )
        return False

    return is_lang


def _pos_patterns_for(lang: str):
    if lang == "ko":
        pos_list = [
            "명사",
            "동사",
            "형용사",
            "부사",
            "감탄사",
            "대명사",
            "조사",
            "전치사",
            "접속사",
        ]
        pat = re.compile(
            "|".join(map(re.escape, sorted(set(pos_list), key=len, reverse=True)))
        )

        def norm(m):
            return m

        return pat, norm
    if lang == "vi":
        pos_list = [
            "danh từ",
            "động từ",
            "tính từ",
            "phó từ",
            "thán từ",
            "đại từ",
            "giới từ",
            "liên từ",
        ]
        pat = re.compile(
            "|".join(map(re.escape, sorted(set(pos_list), key=len, reverse=True))),
            re.IGNORECASE,
        )

        def norm(m):
            return m.lower()

        return pat, norm
    if lang == "ge":
        pos_list = [
            "Substantiv",
            "Verb",
            "Adjektiv",
            "Adverb",
            "Pronomen",
            "Präposition",
            "Konjunktion",
            "Interjektion",
            "Artikel",
        ]
        pat = re.compile(
            "|".join(map(re.escape, sorted(set(pos_list), key=len, reverse=True))),
            re.IGNORECASE,
        )

        def norm(m):
            return m

        return pat, norm
    pat = re.compile("$^")

    def norm(m):
        return ""

    return pat, norm


def get_h2_pairs_from_framesets(soup: BeautifulSoup):
    framesets = soup.find_all("frameset")
    roots = framesets if framesets else [soup]
    for root in roots:
        for h2 in root.find_all("h2"):
            source = clean_text(h2.get_text(separator=" "))
            if not source:
                continue
            target_line = clean_text(get_word_meaning(h2))
            if not target_line:
                continue
            yield (source, target_line)


STAR_SPLIT = re.compile(r"^\*\s*([^\s\-—–]+(?:\s+[^\s\-—–]+)*)\s*[-—–]\s*(.+)$")


def parse_type_and_meaning(def_line: str):
    s = clean_text(def_line)
    m = STAR_SPLIT.match(s)
    if m:
        ttype = m.group(1).strip()
        meaning = sanitize_meaning(m.group(2).strip())
        return ttype, meaning
    return None, sanitize_meaning(s)


def get_word_type(def_text: str, type_lang: str) -> str:
    pat, norm = _pos_patterns_for(type_lang)
    m = pat.search(def_text or "")
    return norm(m.group(0)) if m else ""


def finalize_output(
    rows: list,
    html_path: str | Path,
    out_folder: str | Path,
    source_lang: LanguageCode,
    target_lang: LanguageCode,
):
    df = pd.DataFrame(rows)
    if not df.empty:
        df = df.drop_duplicates(subset=["Source"], keep="first").reset_index(drop=True)

    out_xlsx = Path(out_folder) / f"{Path(html_path).stem}.xlsx"
    Path(out_xlsx).parent.mkdir(parents=True, exist_ok=True)
    with pd.ExcelWriter(out_xlsx, engine="openpyxl") as w:
        df.to_excel(
            w, index=False, sheet_name=f"{source_lang.upper()}->{target_lang.upper()}"
        )

    return df


def convert_html_to_xlsx(
    html_path: str | Path,
    out_folder: str | Path,
    source_lang: LanguageCode,
    target_lang: LanguageCode,
):
    soup = read_html(Path(html_path))
    pairs = list(get_h2_pairs_from_framesets(soup))
    is_lang = check_lang_source()

    rows = []
    for src, line in pairs:
        if not is_lang(src, source_lang):
            continue

        ttype, meaning = parse_type_and_meaning(line)
        if ttype is None:
            ttype = get_word_type(meaning, source_lang)

        if meaning:
            rows.append(
                {
                    "Source": src,
                    "Type": ttype or "",
                    "Pronunciation": "",
                    "Target": meaning,
                }
            )

    return finalize_output(rows, html_path, out_folder, source_lang, target_lang)

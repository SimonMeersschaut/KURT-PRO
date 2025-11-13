import json
from typing import List

def to_js_concatenation(s: str) -> str:
    """
    Convert an input Python string into a JavaScript concatenation expression.
    Each piece is a valid JS string literal (double-quoted) produced by json.dumps,
    and pieces are joined using ' + '.

    Example:
        >>> to_js_concatenation(r'She said, "It\\'s a beautiful day!"')
        '"She said, " + "\\""+ "It\\\\\'s a beautiful day!" + "\\""'
    """
    if s == "":
        return json.dumps("")  # '""'

    specials = {'"', "'", '\\', '\n', '\r', '\t'}
    parts: List[str] = []
    buf = []

    def flush_buf():
        if buf:
            chunk = ''.join(buf)
            parts.append(json.dumps(chunk))  # safely escape chunk for JS
            buf.clear()

    for ch in s:
        if ch in specials:
            flush_buf()
            # make the special char its own JSON / JS string literal
            parts.append(json.dumps(ch))
        else:
            buf.append(ch)

    flush_buf()
    return ' + '.join(parts)

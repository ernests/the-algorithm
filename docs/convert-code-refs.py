#!/usr/bin/env python3
"""
Convert plain code references to clickable GitHub links.

Usage:
    python3 convert-code-refs.py <html-file>
"""

import re
import sys
from pathlib import Path

GITHUB_BASE = "https://github.com/twitter/the-algorithm/blob/main/"
GITHUB_SEARCH = "https://github.com/twitter/the-algorithm/search?q="


def extract_filename(path):
    """Extract just the filename from a full path."""
    return Path(path).name


def convert_line_numbers(lines):
    """Convert line number format to GitHub fragment."""
    if not lines:
        return ""
    if "-" in lines:
        start, end = lines.split("-")
        return f"#L{start}-L{end}"
    return f"#L{lines}"


def create_github_link(path, lines=None):
    """Create a GitHub URL for the given path and optional line numbers."""
    # Check if it's just a constant/variable name (no slashes or extension)
    if "/" not in path and "." not in path:
        # It's a constant like "favScoreHalfLife100Days"
        return GITHUB_SEARCH + path

    # Normal file path
    url = GITHUB_BASE + path
    if lines:
        url += convert_line_numbers(lines)
    return url


def convert_code_ref(match):
    """Convert a single code-ref match to a linked version."""
    full_match = match.group(0)

    # Extract the structure
    # Pattern: <p class="code-ref"><strong>Label</strong>: <code>path/to/file.scala:123-456</code></p>
    # or: <p class="code-ref"><strong>Code</strong>: <code>path</code></p>

    # Check if it already has a link
    if '<a href=' in full_match:
        return full_match  # Already converted

    # Find the code content
    code_pattern = r'<code>([^<]+)</code>'
    code_match = re.search(code_pattern, full_match)

    if not code_match:
        return full_match  # No code block found

    code_content = code_match.group(1).strip()

    # Parse the code content
    # Could be: "path/to/file.scala:123-456" or "path/to/file.scala" or "constantName"
    if ":" in code_content:
        path, lines = code_content.rsplit(":", 1)
    else:
        path = code_content
        lines = None

    # Create GitHub link
    github_url = create_github_link(path, lines)

    # Extract just the filename for display
    if "/" in path:
        display_name = extract_filename(path)
        if lines:
            display_name += f":{lines}"
    else:
        # It's a constant or short name, keep as is
        display_name = code_content

    # Build the replacement
    # Find the position of <code> tag
    code_start = full_match.find('<code>')
    code_end = full_match.find('</code>') + len('</code>')

    before = full_match[:code_start]
    after = full_match[code_end:]

    linked_code = f'<a href="{github_url}" target="_blank" rel="noopener"><code>{display_name}</code></a>'

    return before + linked_code + after


def process_file(filepath):
    """Process a single HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match code-ref blocks
    # Match from <p class="code-ref" to </p>
    pattern = r'<p class="code-ref"[^>]*>.*?</p>'

    # Count matches before
    matches_before = len(re.findall(pattern, content))

    # Convert all code-refs
    new_content = re.sub(pattern, convert_code_ref, content, flags=re.DOTALL)

    # Count links after
    matches_after = len(re.findall(r'<p class="code-ref"[^>]*>.*?<a href=', new_content))

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return matches_before, matches_after


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 convert-code-refs.py <html-file> [<html-file2> ...]")
        sys.exit(1)

    total_before = 0
    total_after = 0

    for filepath in sys.argv[1:]:
        print(f"Processing {filepath}...")
        before, after = process_file(filepath)
        total_before += before
        total_after += after
        print(f"  ✓ Converted {after}/{before} code references")

    print(f"\nTotal: {total_after}/{total_before} code references converted")


if __name__ == "__main__":
    main()

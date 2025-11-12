# Design Standards for Twitter Algorithm Documentation

## Navigation Structure

### Current State
We have files in:
- `index.html` (landing page)
- `parts/01-introduction.html`
- `parts/07-appendix.html`
- `interactive/` (6 interactive tools)

### Standard Navigation

**For index.html:**
```html
<nav>
  <div class="nav-container">
    <h1><a href="index.html">How Twitter's Algorithm Really Works</a></h1>
    <ul>
      <li><a href="parts/01-introduction.html">Introduction</a></li>
      <li><a href="parts/07-appendix.html">Appendix</a></li>
      <li><a href="#interactives">Interactives ↓</a></li>
    </ul>
  </div>
</nav>
```

**For parts/*.html:**
```html
<nav>
  <div class="nav-container">
    <h1><a href="../index.html">How Twitter's Algorithm Really Works</a></h1>
    <ul>
      <li><a href="01-introduction.html">Introduction</a></li>
      <li><a href="07-appendix.html">Appendix</a></li>
      <li><a href="../index.html#interactives">Interactives</a></li>
    </ul>
  </div>
</nav>
```

**For interactive/*.html:**
```html
<nav>
  <div class="nav-container">
    <h1><a href="../index.html">How Twitter's Algorithm Really Works</a></h1>
    <ul>
      <li><a href="../parts/01-introduction.html">Introduction</a></li>
      <li><a href="../parts/07-appendix.html">Appendix</a></li>
      <li><a href="../index.html#interactives">All Interactives</a></li>
    </ul>
  </div>
</nav>
```

**Rationale:** Only show what actually exists. Keep it simple.

---

## Code Reference Standard

### Format

All code references should be **clickable GitHub links** to the actual source code.

**Base URL:** `https://github.com/twitter/the-algorithm/blob/main/`

### HTML Pattern

```html
<p class="code-ref">
  <strong>Code</strong>:
  <a href="https://github.com/twitter/the-algorithm/blob/main/home-mixer/server/src/main/scala/com/twitter/home_mixer/param/HomeGlobalParams.scala#L788-L930" target="_blank" rel="noopener">
    <code>home-mixer/server/src/main/scala/com/twitter/home_mixer/param/HomeGlobalParams.scala:788-930</code>
  </a>
</p>
```

### Line Number Formats

- **Single line**: `file.scala:123` → GitHub URL ends with `#L123`
- **Range**: `file.scala:123-456` → GitHub URL ends with `#L123-L456`
- **Multiple lines**: `file.scala:123,145,167` → Link to first line `#L123` (GitHub doesn't support non-contiguous)

### Helper Function (JavaScript)

```javascript
/**
 * Convert file path with line numbers to GitHub URL
 * @param {string} path - e.g., "home-mixer/server/.../file.scala:123-456"
 * @returns {string} GitHub URL
 */
function codeRefToGitHubUrl(path) {
  const baseUrl = 'https://github.com/twitter/the-algorithm/blob/main/';

  // Handle root-level files (no slashes before colon)
  if (path.includes(':')) {
    const [file, lines] = path.split(':');
    const lineFragment = lines.includes('-')
      ? `#L${lines.replace('-', '-L')}`
      : `#L${lines}`;
    return baseUrl + file + lineFragment;
  }

  // No line numbers, just file
  return baseUrl + path;
}

// Example usage:
// codeRefToGitHubUrl("home-mixer/server/src/main/scala/.../HomeGlobalParams.scala:788-930")
// Returns: "https://github.com/twitter/the-algorithm/blob/main/home-mixer/server/src/main/scala/.../HomeGlobalParams.scala#L788-L930"
```

### CSS Styling

```css
/* Code reference links */
.code-ref a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.code-ref a:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.code-ref a::after {
  content: "→";
  font-size: 0.875em;
  opacity: 0.6;
}

.code-ref code {
  background-color: var(--code-bg);
  border: 1px solid var(--code-border);
  border-radius: 3px;
  padding: 0.2em 0.4em;
  font-size: 0.8em;
}
```

### Examples

**Before (plain text):**
```html
<p class="code-ref">
  <strong>Code</strong>: <code>home-mixer/server/src/main/scala/com/twitter/home_mixer/param/HomeGlobalParams.scala:788-930</code>
</p>
```

**After (clickable link):**
```html
<p class="code-ref">
  <strong>Code</strong>:
  <a href="https://github.com/twitter/the-algorithm/blob/main/home-mixer/server/src/main/scala/com/twitter/home_mixer/param/HomeGlobalParams.scala#L788-L930" target="_blank" rel="noopener">
    <code>home-mixer/server/src/main/scala/com/twitter/home_mixer/param/HomeGlobalParams.scala:788-930</code>
  </a>
</p>
```

**Special Cases:**

1. **Root-level files** (like RETREIVAL_SIGNALS.md):
```html
<a href="https://github.com/twitter/the-algorithm/blob/main/RETREIVAL_SIGNALS.md" target="_blank" rel="noopener">
  <code>RETREIVAL_SIGNALS.md</code>
</a>
```

2. **External repo** (algorithm-ml):
```html
<a href="https://github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md" target="_blank" rel="noopener">
  <code>the-algorithm-ml/projects/home/recap/README.md</code>
</a>
```

---

## File Organization

```
docs/
├── index.html              # Landing page with overview
├── DESIGN_STANDARDS.md     # This file (design guidelines)
├── README.md               # How to view/deploy
├── CLAUDE.md               # AI assistant guidelines
│
├── parts/                  # Main content sections
│   ├── 01-introduction.html
│   └── 07-appendix.html
│
├── interactive/            # Interactive visualizations
│   ├── cluster-explorer.html
│   ├── engagement-calculator.html
│   ├── invisible-filter.html
│   ├── journey-simulator.html
│   ├── pipeline-explorer.html
│   └── reinforcement-loop.html
│
├── js/                     # JavaScript for interactives
│   ├── cluster-explorer.js
│   ├── engagement-calculator.js
│   ├── invisible-filter.js
│   ├── journey-simulator.js
│   ├── pipeline-explorer.js
│   └── reinforcement-loop.js
│
├── css/
│   └── style.css           # Global styles
│
└── assets/                 # Static assets (if needed)
    └── data/               # JSON data files
```

---

## Migration Plan

### Step 1: Update Navigation (All Files)
- Remove links to non-existent parts (02-06)
- Update navigation HTML in:
  - `index.html`
  - `parts/01-introduction.html`
  - `parts/07-appendix.html`
  - All `interactive/*.html` files

### Step 2: Add Code Reference Styling
- Add CSS to `css/style.css`

### Step 3: Convert Code References
- Find all `.code-ref` instances across all HTML files
- Convert plain text paths to clickable GitHub links
- Use the standard format above

### Step 4: Test
- Open each page and verify:
  - Navigation links work
  - Code reference links go to correct GitHub locations
  - No broken links

---

## Checklist for New Pages

When creating a new page, ensure:

- [ ] Navigation uses the standard format (only existing pages)
- [ ] All code references are clickable GitHub links
- [ ] Footer includes page navigation (Previous/Next if applicable)
- [ ] Page uses `css/style.css`
- [ ] Title follows pattern: "Page Title - How Twitter's Algorithm Really Works"
- [ ] Meta description included
- [ ] Links to related interactives where relevant

---

## Notes

- **Why GitHub links?** Users can verify claims by reading the actual code
- **Why simplified nav?** Don't promise what doesn't exist yet
- **target="_blank"** and **rel="noopener"**: Security best practice for external links
- **Line number format**: GitHub uses `#L123` for single line, `#L123-L456` for ranges

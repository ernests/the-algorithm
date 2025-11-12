# CLAUDE.md - Interactive Documentation Guide

This file provides guidance to Claude Code when working on the interactive documentation in `/docs`.

## Purpose

The `docs/` directory contains **public-facing interactive documentation** that translates our technical research findings (from `notes/`) into accessible, engaging explanations for a broad audience.

**Goals**:
- Make complex algorithmic behavior understandable to non-technical readers
- Provide concrete examples with real calculations
- Use interactive visualizations to demonstrate dynamic effects
- Maintain objectivity and verifiability (all claims backed by code references)
- Create an engaging reading experience

**Audience**: Users, creators, researchers, policy makers, and anyone curious about how algorithmic systems shape discourse.

## Quick Reference: Content Structure

**Every algorithmic concept must follow this three-part structure:**

1. **Intuition** - Plain language explanation answering "What is this?" and "Why does it matter?"
2. **Feel** - Interactive visualization or calculator to experience the dynamics
3. **Proof** - Mathematical formulas, concrete calculations, and code references for verification

This ensures content is accessible (intuition), engaging (feel), and verifiable (proof).

See [Writing Principles](#writing-principles) for detailed guidance.

## Content Structure

The investigation is structured as a multi-part series:

1. **Introduction** (`parts/01-introduction.html`) - Why this matters, approach, questions
2. **Tweet Journey** (`parts/02-tweet-journey.html`) - Following a tweet through all 5 algorithmic stages
3. **User Journey** (`parts/03-user-journey.html`) - How user experience evolves over 6 months
4. **Discourse Levers** (`parts/04-discourse-levers.html`) - 6 mechanisms shaping platform discourse
5. **What This Means** (`parts/05-what-this-means.html`) - Objective analysis of designed vs emergent effects
6. **Conclusions** (`parts/06-conclusions.html`) - Perspective and implications (subjective analysis)
7. **Appendix** (`parts/07-appendix.html`) - Methodology, file index, verification guide

**Landing page** (`index.html`) - Overview with key findings and navigation

## Writing Principles

### Content Structure: Intuition → Feel → Proof

Every algorithmic concept should be presented in three layers to serve different learning styles:

**1. General Description (Intuition)**
- Plain language explanation of what this mechanism does and why it exists
- Build intuition: help readers understand the "shape" of the behavior
- Answer: "What is this?" and "Why does it matter?"
- Example: "Twitter prevents any single author from dominating your feed by applying an exponential penalty..."

**2. Visualization/Interactive Element (Feel)**
- Let readers experience the dynamic, not just read about it
- Interactive calculators, charts, simulations, or animated diagrams
- Answer: "How does this feel?" and "What happens if I change X?"
- Example: Slider to adjust tweet count and see penalty compound in real-time

**3. Math & Code (Proof)**
- Concrete formulas with actual parameters from the code
- Step-by-step calculations with real numbers
- Code references with file paths and line numbers for verification
- Answer: "How exactly does this work?" and "Can I verify this?"
- Example: Formula with decay factor 0.5, floor 0.25, plus code reference

This three-part structure ensures content is:
- **Accessible**: Non-technical readers get the intuition
- **Engaging**: Visual learners can explore interactively
- **Verifiable**: Technical readers can check the implementation

### Objectivity Until Conclusions

- **Parts 1-5**: Present facts, mechanics, and observable effects without judgment
- **Part 6**: Bring perspective, interpretation, and implications
- Use phrases like "the algorithm optimizes for" not "the algorithm wants to"
- Describe effects objectively: "this increases polarization" not "this is bad"

### Show the Math

Every algorithmic effect should include **concrete calculations**:

```html
<h3>Author Diversity Penalty</h3>
<p>When an author posts multiple tweets, each subsequent tweet receives a penalty:</p>

<pre><code>Formula: multiplier = (1 - floor) × decayFactor^position + floor

Where:
- decayFactor = 0.5
- floor = 0.25 (minimum multiplier)
- position = tweet number from this author (0-indexed)

Example - Author posts 3 tweets with base score 100:

Tweet 1: 100 × 1.0 = 100
Tweet 2: 100 × 0.625 = 62.5
Tweet 3: 100 × 0.4375 = 43.75

Total reach: 206.25 (not 300!)
Effective penalty: 31% loss vs posting separately</code></pre>

<p class="code-ref"><strong>Code</strong>:
<code>home-mixer/server/src/main/scala/com/twitter/home_mixer/product/scored_tweets/scorer/AuthorBasedListwiseRescoringProvider.scala:54</code></p>
```

### Code References Are Mandatory

Every claim must include verifiable code references:

**Good**:
```html
<p>Out-of-network tweets receive a 0.75x multiplier (25% penalty).</p>
<p class="code-ref"><strong>Code</strong>:
<code>home-mixer/.../RescoringFactorProvider.scala:45-57</code></p>
```

**Bad**:
```html
<p>Out-of-network tweets are penalized.</p>
<!-- No code reference! Reader can't verify -->
```

### Accessible Language

Translate technical concepts into plain language while maintaining accuracy:

**Technical** (for `notes/`):
> "The MaskNet architecture predicts 15 engagement probability distributions using parallel task-specific towers with shared representation layers."

**Accessible** (for `docs/`):
> "The ranking model predicts 15 different ways you might engage with a tweet (like, reply, retweet, etc.) all at once. Each prediction gets a weight, and the weighted sum becomes the tweet's score."

## HTML Structure and Patterns

### Standard Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Part Title - How Twitter's Algorithm Really Works</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <nav>
    <div class="nav-container">
      <h1><a href="../index.html">How Twitter's Algorithm Really Works</a></h1>
      <ul>
        <li><a href="01-introduction.html">Introduction</a></li>
        <li><a href="02-tweet-journey.html">Tweet Journey</a></li>
        <li><a href="03-user-journey.html">User Journey</a></li>
        <li><a href="04-discourse-levers.html">Levers</a></li>
        <li><a href="05-what-this-means.html">Analysis</a></li>
        <li><a href="06-conclusions.html">Conclusions</a></li>
        <li><a href="07-appendix.html">Appendix</a></li>
      </ul>
    </div>
  </nav>

  <main>
    <!-- Content here -->
  </main>

  <footer>
    <div class="nav-buttons">
      <a href="01-previous.html" class="nav-button">← Previous: Title</a>
      <a href="03-next.html" class="nav-button">Next: Title →</a>
    </div>
    <p>Questions or corrections? Open an issue on GitHub.</p>
  </footer>

  <script src="../js/filename.js"></script> <!-- If needed -->
</body>
</html>
```

### Common HTML Patterns

**Code reference block**:
```html
<p class="code-ref"><strong>Code</strong>:
<code>path/to/file.scala:line-numbers</code></p>
```

**Callout for important insights**:
```html
<div class="callout">
  <p><strong>Key Insight</strong>: This is a critical finding that deserves emphasis.</p>
</div>
```

**Finding cards** (for index page):
```html
<div class="finding-card">
  <h3>Finding Title</h3>
  <p>Brief description of the finding and its implications.</p>
  <p class="code-ref"><strong>Code</strong>: <code>file.scala:123</code></p>
</div>
```

**Calculations and formulas**:
```html
<pre><code>Formula or calculation here
With multiple lines
Showing step-by-step math</code></pre>
```

## Interactive Visualizations

Use interactive elements to help readers **experience** algorithmic dynamics, not just read about them.

### Types of Visualizations

**1. Decay Functions** - Show how effects change over time
- Author diversity decay (exponential)
- Feedback fatigue decay (linear over 140 days)
- Temporal decay for tweet age

**2. Multiplicative Effects** - Demonstrate compound behaviors
- Gravitational pull (interest drift from 60/40 to 76/24)
- Cluster reinforcement
- Follower advantage compounding

**3. Interactive Calculators** - Let readers adjust parameters
- Tweet score calculator (adjust engagement weights)
- Author diversity penalty (adjust number of tweets)
- In-network vs out-of-network comparison

**4. Flow Diagrams** - Show pipelines and stages
- Tweet journey through 5 stages
- Candidate funnel (1B → 1,400 → 50-100)
- Signal usage across components

**5. Comparison Charts** - Relative values and impacts
- Engagement weights bar chart (Reply: 75.0 vs Favorite: 0.5)
- Filter penalties comparison
- Signal importance across systems

### Implementation Guidelines

**Technology**:
- Vanilla JavaScript (no frameworks, keep it lightweight)
- For charts: Chart.js or D3.js (include via CDN)
- For animations: CSS transitions or Canvas API
- Store data in separate JSON files in `assets/` if needed

**Accessibility**:
- All visualizations should have text fallbacks
- Describe what the visualization shows before showing it
- Provide static examples alongside interactive ones
- Ensure keyboard navigation works

**Example: Interactive Author Diversity Calculator**

```html
<h3>Interactive: Author Diversity Penalty</h3>
<p>Adjust the number of tweets to see how the penalty compounds:</p>

<div id="author-diversity-calculator">
  <label>
    Number of tweets: <span id="tweet-count-display">3</span>
    <input type="range" id="tweet-count" min="1" max="10" value="3">
  </label>

  <div id="results">
    <!-- JavaScript will populate this -->
  </div>

  <canvas id="decay-chart" width="600" height="300"></canvas>
</div>

<script src="../js/author-diversity-calculator.js"></script>
```

### When to Use Interactive vs Static

**Use interactive visualizations when**:
- The concept involves change over time (decay curves, drift)
- Readers benefit from experimenting with parameters
- Multiple scenarios need comparison
- The dynamic is hard to grasp from numbers alone

**Use static examples when**:
- A single concrete example is sufficient
- The calculation is straightforward
- Interaction would add complexity without insight
- Page performance is a concern

## Content Tone and Style

### Voice

- **Clear and direct**: Short sentences, active voice
- **Conversational but precise**: Explain like you're talking to a smart friend
- **Objective in facts, thoughtful in implications**: Present mechanics objectively, analyze effects thoughtfully
- **No hyperbole**: Let the findings speak for themselves

### Framing Effects

Be careful with word choice that implies intent:

**Avoid** (implies intent):
- "The algorithm wants you to..."
- "Twitter designed this to manipulate..."
- "This is meant to exploit..."

**Prefer** (describes mechanism):
- "The algorithm optimizes for..."
- "This design choice results in..."
- "This creates an incentive to..."

### Example Transformations

**From technical finding** (`notes/`):
> "The Heavy Ranker applies a -74.0 weight to the predicted probability of negative feedback, while favorites receive only a 0.5 weight. This creates a 148:1 ratio favoring avoidance of negative signals over accumulation of positive ones."

**To accessible explanation** (`docs/`):
> "When scoring a tweet, the algorithm severely penalizes content that might trigger 'not interested' clicks (-74.0 weight) while barely rewarding favorites (0.5 weight). This means one 'not interested' click has the same negative impact as 148 likes have positive impact. The algorithm is designed to avoid showing you things you'll reject, not to show you things you'll like."

## Visual Design

The site uses a dark theme (`css/style.css`) inspired by Twitter/X's interface.

**Design principles**:
- High contrast for readability (light text on dark background)
- Generous whitespace and line height
- Code blocks with syntax highlighting colors
- Responsive layout (works on mobile)
- Consistent spacing and typography

**Color usage**:
- Background: `#15202b` (dark blue-gray)
- Text: `#e7e9ea` (light gray)
- Links: `#1d9bf0` (Twitter blue)
- Code blocks: `#192734` background, `#50fa7b` for highlights
- Callouts: Subtle border and background variation

## File Organization

```
docs/
├── index.html              # Landing page
├── CLAUDE.md              # This file (documentation guidance)
├── README.md              # Deployment and viewing instructions
│
├── parts/                 # Main content sections
│   ├── 01-introduction.html
│   ├── 02-tweet-journey.html
│   ├── 03-user-journey.html
│   ├── 04-discourse-levers.html
│   ├── 05-what-this-means.html
│   ├── 06-conclusions.html
│   └── 07-appendix.html
│
├── css/
│   └── style.css          # Dark theme styling
│
├── js/                    # Interactive widgets
│   ├── author-diversity-calculator.js
│   ├── engagement-weight-chart.js
│   ├── gravitational-pull-simulator.js
│   └── tweet-journey-flow.js
│
└── assets/                # Data files, images
    └── data/
        └── engagement-weights.json
```

## Common Tasks

### Adding a New Interactive Visualization

1. **Research the mechanism** in the codebase (see root `/CLAUDE.md`)
2. **Create concrete examples** with real numbers in `notes/`
3. **Design the interaction**: What should users be able to adjust? What do they see?
4. **Write the HTML structure** in the appropriate `parts/*.html` file
5. **Create the JavaScript** in `js/` with clear comments
6. **Test interactivity**: Does it help understanding? Is it intuitive?
7. **Add text explanation**: Describe what the visualization shows
8. **Include code reference**: Point to the actual implementation

### Writing a New Section

Follow the **Intuition → Feel → Proof** structure:

**Step 1: Research & Prepare**
1. Review related notes in `notes/` for detailed findings
2. Locate the relevant code implementation
3. Extract exact formulas, parameters, and thresholds
4. Calculate concrete examples with real numbers

**Step 2: Write Part 1 (Intuition)**
1. Start with plain language: "What is this mechanism?"
2. Explain why it exists: "What problem does it solve?"
3. Describe the shape: "How does it behave?" (exponential? linear? threshold-based?)
4. Make it relatable: Connect to user experience
5. Draft as if explaining to a non-technical friend

**Step 3: Create Part 2 (Feel)**
1. Choose visualization type: calculator? graph? simulation? comparison chart?
2. Identify which parameters users should control
3. Decide what should be displayed: results? charts? comparisons?
4. Sketch the HTML structure with proper IDs and classes
5. Create the JavaScript (or note for separate task)
6. Add text description: "Use this to explore..."
7. Ensure it teaches, not just decorates

**Step 4: Write Part 3 (Proof)**
1. Show the actual formula with exact parameters from code
2. Explain each variable: "Where decayFactor = 0.5..."
3. Walk through step-by-step calculation
4. Provide concrete example: "If an author posts 4 tweets..."
5. Show the consequences: "Effective loss: 40%..."
6. Add code reference: file path and line numbers
7. Cross-check accuracy against source code

**Step 5: Review & Refine**
1. Check tone: Objective (Parts 1-5) or analytical (Part 6)?
2. Verify all code references are accurate
3. Test calculations manually
4. Run quality checklist
5. Test locally: Open in browser, check rendering
6. Verify links work correctly

### Verifying Technical Accuracy

Before publishing any claim:
1. **Check the source code** in the main repository
2. **Verify file paths and line numbers** are current
3. **Test calculations** with real numbers
4. **Cross-reference** with `notes/comprehensive-summary.md`
5. **Look for edge cases**: Are there exceptions or conditions?

## Quality Checklist

Before considering a section complete:

**Content Structure (Intuition → Feel → Proof)**:
- [ ] **Part 1 (Intuition)**: Plain language explanation of what and why
- [ ] **Part 1 (Intuition)**: Describes the "shape" of the behavior
- [ ] **Part 2 (Feel)**: Interactive or visual element present
- [ ] **Part 2 (Feel)**: Visualization enhances understanding (not decorative)
- [ ] **Part 3 (Proof)**: Concrete formulas with actual parameters
- [ ] **Part 3 (Proof)**: Step-by-step calculations with real numbers
- [ ] **Part 3 (Proof)**: Code reference with file path and line numbers

**Technical Accuracy**:
- [ ] Every claim has a code reference with file path and line numbers
- [ ] Formulas match the actual implementation in code
- [ ] Calculations are correct and use realistic examples
- [ ] Technical accuracy verified against source code
- [ ] Edge cases or conditions are mentioned if relevant

**Accessibility & Style**:
- [ ] Language is accessible to non-technical readers
- [ ] Tone is objective (or appropriately analytical for Part 6)
- [ ] No jargon without explanation
- [ ] Active voice and short sentences

**Technical Implementation**:
- [ ] Links to other sections work correctly
- [ ] Renders correctly on mobile and desktop
- [ ] No broken internal or external links
- [ ] Follows the established HTML/CSS patterns
- [ ] Interactive elements are keyboard accessible
- [ ] Text fallbacks exist for visualizations

## Resources

**For technical details**: See root `/CLAUDE.md` and `notes/comprehensive-summary.md`

**For deployment**: See `docs/README.md`

**For visual design**: See `docs/css/style.css`

**Reference material**:
- Twitter's open-source repo: https://github.com/twitter/the-algorithm
- Engineering blog: https://blog.x.com/engineering/en_us/topics/open-source/2023/twitter-recommendation-algorithm

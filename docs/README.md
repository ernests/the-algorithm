# How Twitter's Algorithm Really Works

A code-based investigation of X's (Twitter's) open-source recommendation algorithm.

**Live Site**: [View the investigation →](https://ernests.github.io/the-algorithm/)

---

## What This Is

In March 2023, X (formerly Twitter) open-sourced their recommendation algorithm. We analyzed the implementation—reading thousands of lines of Scala, examining ML model weights, and tracing data flows through the pipeline.

This site presents our findings through:
- **Verified claims** backed by specific code references (file paths + line numbers)
- **Interactive explorations** to experience algorithmic mechanics hands-on
- **Concrete examples** with real calculations showing how the system works

---

## Top Findings

### 🤯 The Favorites Paradox
Likes have the **lowest** positive weight (0.5) while replies have 27x more value (13.5). Reply with author engagement: 75.0 weight (150x more valuable than a like).

### 🔥 Conflict is Emergent, Not Intentional
The algorithm cannot distinguish agreement from disagreement—all replies get the same weight regardless of sentiment. Conflict amplification is a design limitation, not malicious intent.

### 📊 Multiplicative Scoring = Mathematical Echo Chambers
Tweet scores use multiplication (`score = baseScore × clusterInterest`), not addition. Any imbalance compounds over time through reinforcement loops.

### 👑 Verified Accounts Get 100x Multiplier
Verification provides a massive algorithmic advantage. Combined with other structural benefits, large verified accounts have a **348:1 reach advantage** over small accounts posting identical content.

### ☢️ "Not Interested" is Nuclear
One click triggers 0.2x multiplier (80% penalty) with 140-day linear recovery. Removes an author from your feed for ~5 months.

**[See all findings →](https://ernests.github.io/the-algorithm/#findings)**

---

## Interactive Explorations

Experience how the algorithm works through 9 interactive demos:

### Understanding The Pipeline
- **Pipeline Explorer** - Follow a tweet through all 5 algorithmic stages
- **Engagement Calculator** - Calculate tweet scores with real weights

### Understanding Your Algorithmic Identity
- **Cluster Explorer** - Discover which of ~145,000 communities you belong to
- **Algorithmic Identity Builder** - See your dual profiles (consumer vs creator)

### Understanding Filter Bubbles & Echo Chambers
- **Journey Simulator** - Model how interests drift over time
- **Invisible Filter Demo** - See how personalization creates different realities
- **Reinforcement Loop Visualizer** - Watch feedback loops compound week by week

### Understanding Structural Advantages
- **Algorithmic Aristocracy** - Explore how follower count creates different rules

### Understanding Next-Generation Systems
- **Phoenix: Behavioral Prediction** - X's transformer-based system (likely in active A/B testing) that models 522 of your recent actions to predict what you'll do next

**[Explore all interactive demos →](https://ernests.github.io/the-algorithm/#interactives)**

---

## Our Approach

**Objective Evidence**: Every claim backed by:
- File path (exact location in codebase)
- Line numbers (specific implementation)
- Code snippets (what it actually does)
- Explanation (how the mechanism works)
- Consequences (what it means for users and creators)

**Verifiable**: The algorithm is [open source](https://github.com/twitter/the-algorithm). You can check our work.

**Interactive**: We built simulators and calculators so you can experience the mechanics hands-on, not just read about them.

---

## Who This Is For

- **Users** wondering why their feed looks the way it does
- **Creators** optimizing for reach and engagement
- **Researchers** studying recommendation algorithms and their societal effects
- **Policy makers** understanding algorithmic amplification
- **Anyone curious** about how algorithmic systems shape online discourse

---

## Technology

- **Plain HTML/CSS/JavaScript** - No build step, no dependencies, fast loading
- **Interactive visualizations** - Chart.js for graphs, vanilla JS for simulators
- **Responsive design** - Works on desktop and mobile
- **Accessible** - Semantic HTML, keyboard navigation, text alternatives

---

## About This Investigation

This analysis was conducted by reading X's open-source algorithm code (released March 2023). All findings are based on the actual implementation, not speculation or reverse engineering.

**Repository**: [github.com/twitter/the-algorithm](https://github.com/twitter/the-algorithm)

**Methodology**: We read thousands of lines of Scala, traced data flows through pipelines, examined ML model configurations, and documented every mechanism with file paths and line numbers.

**Last Updated**: November 2025

---

## Structure

```
docs/
├── index.html              # Landing page with key findings
├── interactive/            # 9 interactive explorations
│   ├── pipeline-explorer.html
│   ├── engagement-calculator.html
│   ├── cluster-explorer.html
│   ├── algorithmic-identity.html
│   ├── journey-simulator.html
│   ├── invisible-filter.html
│   ├── reinforcement-loop.html
│   ├── algorithmic-aristocracy.html
│   └── phoenix-sequence-prediction.html
├── parts/
│   └── reference.html      # Code reference documentation
├── css/
│   └── style.css          # Clean, readable styling
├── js/                    # Interactive widget scripts
└── assets/                # Images and data files
```

---

## Contributing

Found an error or have a correction? [Open an issue](https://github.com/twitter/the-algorithm/issues) or submit a pull request.

All claims should be backed by specific code references with file paths and line numbers.

---

## License

This documentation is provided for educational and research purposes. The analyzed algorithm code is owned by X Corp.

---

## Questions?

Open an issue on [GitHub](https://github.com/twitter/the-algorithm/issues) or explore the interactive demos to understand how the algorithm works.

**Key Insight**: The algorithm is not neutral. It is designed for engagement, not for truth, diversity, or societal health. Understanding how it works is the first step to using it consciously rather than being shaped by it.

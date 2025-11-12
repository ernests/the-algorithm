/**
 * The Full Pipeline Explorer
 *
 * Shows complete tweet journey through all 5 algorithmic stages:
 * 1. Candidate Generation
 * 2. Feature Hydration
 * 3. Heavy Ranker (ML Scoring)
 * 4. Filters & Penalties
 * 5. Mixing & Serving
 *
 * Based on Twitter's complete recommendation pipeline.
 */

// Engagement weights from HomeGlobalParams.scala:786-1028
const WEIGHTS = {
  'Reply with Author Engagement': 75.0,
  'Reply': 13.5,
  'Good Profile Click': 12.0,
  'Video Playback 50%': 8.0,
  'Retweet': 1.0,
  'Favorite': 0.5,
  'Negative Feedback': -74.0,
  'Report': -369.0
};

// Tweet scenarios
const SCENARIOS = {
  'viral-thread': {
    name: '🔥 Viral Educational Thread',
    network: 'in-network',
    cluster: 'primary', // User's main interest
    clusterScore: 0.85,
    authorPosition: 1, // First tweet from this author
    probabilities: {
      'Reply with Author Engagement': 0.03,
      'Reply': 0.08,
      'Good Profile Click': 0.28,
      'Video Playback 50%': 0.0,
      'Retweet': 0.03,
      'Favorite': 0.25,
      'Negative Feedback': 0.01,
      'Report': 0.001
    }
  },
  'out-of-network': {
    name: '🌐 Out-of-Network Quality',
    network: 'out-of-network',
    cluster: 'secondary', // User's minority interest
    clusterScore: 0.35,
    authorPosition: 1,
    probabilities: {
      'Reply with Author Engagement': 0.02,
      'Reply': 0.05,
      'Good Profile Click': 0.22,
      'Video Playback 50%': 0.0,
      'Retweet': 0.02,
      'Favorite': 0.18,
      'Negative Feedback': 0.015,
      'Report': 0.002
    }
  },
  'controversial': {
    name: '⚡ Controversial Take',
    network: 'in-network',
    cluster: 'primary',
    clusterScore: 0.85,
    authorPosition: 1,
    probabilities: {
      'Reply with Author Engagement': 0.01,
      'Reply': 0.12,
      'Good Profile Click': 0.15,
      'Video Playback 50%': 0.0,
      'Retweet': 0.015,
      'Favorite': 0.08,
      'Negative Feedback': 0.04,
      'Report': 0.005
    }
  },
  'repeat-author': {
    name: '📝 3rd Tweet from Same Author',
    network: 'in-network',
    cluster: 'primary',
    clusterScore: 0.85,
    authorPosition: 3, // Third tweet from this author
    probabilities: {
      'Reply with Author Engagement': 0.02,
      'Reply': 0.06,
      'Good Profile Click': 0.25,
      'Video Playback 50%': 0.0,
      'Retweet': 0.025,
      'Favorite': 0.20,
      'Negative Feedback': 0.01,
      'Report': 0.001
    }
  }
};

// State
let currentScenario = null;
let currentStage = 0;
let scoreHistory = [];

// DOM elements
const pipelineContainer = document.getElementById('pipeline-container');
const scenarioNameDisplay = document.getElementById('scenario-name');
const stageDetailContainer = document.getElementById('stage-detail-container');
const scoreBreakdown = document.getElementById('score-breakdown');
const prevStageBtn = document.getElementById('prev-stage-btn');
const nextStageBtn = document.getElementById('next-stage-btn');
const finalSummary = document.getElementById('final-summary');

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  attachScenarioListeners();
});

/**
 * Attach scenario card listeners
 */
function attachScenarioListeners() {
  const scenarioCards = document.querySelectorAll('.pipeline-scenario-card');
  scenarioCards.forEach(card => {
    card.addEventListener('click', () => {
      const scenarioKey = card.dataset.scenario;
      startPipeline(scenarioKey);
    });
  });
}

/**
 * Start pipeline with selected scenario
 */
function startPipeline(scenarioKey) {
  currentScenario = SCENARIOS[scenarioKey];
  currentStage = 1;
  scoreHistory = [];

  // Show container
  pipelineContainer.style.display = 'block';
  pipelineContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Update display
  scenarioNameDisplay.textContent = currentScenario.name;

  // Render first stage
  renderStage();
  updateNavigation();
  updateFunnelHighlight();
}

/**
 * Navigate to previous stage
 */
function previousStage() {
  if (currentStage > 1) {
    currentStage--;
    renderStage();
    updateNavigation();
    updateFunnelHighlight();
    finalSummary.style.display = 'none';
  }
}

/**
 * Navigate to next stage
 */
function nextStage() {
  if (currentStage < 5) {
    currentStage++;
    renderStage();
    updateNavigation();
    updateFunnelHighlight();
  } else {
    // Show final summary
    showFinalSummary();
  }
}

/**
 * Update navigation buttons
 */
function updateNavigation() {
  prevStageBtn.disabled = currentStage === 1;
  nextStageBtn.textContent = currentStage === 5 ? 'Show Final Summary →' : 'Next Stage →';

  prevStageBtn.onclick = previousStage;
  nextStageBtn.onclick = nextStage;
}

/**
 * Update funnel stage highlight
 */
function updateFunnelHighlight() {
  const funnelStages = document.querySelectorAll('.funnel-stage[data-stage]');
  funnelStages.forEach(stage => {
    const stageNum = parseInt(stage.dataset.stage);
    if (stageNum === currentStage) {
      stage.classList.add('active');
    } else if (stageNum < currentStage) {
      stage.classList.add('completed');
      stage.classList.remove('active');
    } else {
      stage.classList.remove('active', 'completed');
    }
  });
}

/**
 * Calculate base score from Heavy Ranker
 */
function calculateBaseScore() {
  let score = 0;
  const breakdown = [];

  for (const [engType, weight] of Object.entries(WEIGHTS)) {
    const prob = currentScenario.probabilities[engType] || 0;
    const contribution = prob * weight;
    score += contribution;

    if (prob > 0) {
      breakdown.push({
        type: engType,
        probability: prob,
        weight: weight,
        contribution: contribution
      });
    }
  }

  return { score, breakdown };
}

/**
 * Render current stage
 */
function renderStage() {
  let html = '';

  switch (currentStage) {
    case 1:
      html = renderCandidateGeneration();
      break;
    case 2:
      html = renderFeatureHydration();
      break;
    case 3:
      html = renderMLScoring();
      break;
    case 4:
      html = renderFiltersAndPenalties();
      break;
    case 5:
      html = renderMixingAndServing();
      break;
  }

  stageDetailContainer.innerHTML = html;
  updateScoreTracker();
}

/**
 * Stage 1: Candidate Generation
 */
function renderCandidateGeneration() {
  const source = currentScenario.network === 'in-network' ? 'Earlybird (In-Network)' : 'SimClusters ANN';

  return `
    <div class="stage-detail">
      <h3>Stage 1: Candidate Generation</h3>
      <p>Your tweet enters the pipeline as one of ~1,400 candidates selected based on your profile.</p>

      <div class="stage-content">
        <div class="detail-card">
          <h4>Selection Source</h4>
          <div class="detail-value">${source}</div>
          <p class="detail-explanation">
            ${currentScenario.network === 'in-network'
              ? 'Retrieved from Earlybird search index because you follow this author. ~50% of candidates come from in-network.'
              : 'Retrieved via SimClusters ANN based on your interest clusters. ~20% of candidates come from similar content clusters.'}
          </p>
        </div>

        <div class="detail-card">
          <h4>Initial Pool</h4>
          <div class="detail-value">~1,400 candidates</div>
          <p class="detail-explanation">
            From ~1 billion tweets posted, only 1,400 make it to your candidate pool. That's a 99.9998% rejection rate before any scoring!
          </p>
        </div>

        <div class="detail-card">
          <h4>Network Status</h4>
          <div class="detail-value ${currentScenario.network}">${currentScenario.network === 'in-network' ? 'In-Network ✓' : 'Out-of-Network'}</div>
          <p class="detail-explanation">
            ${currentScenario.network === 'in-network'
              ? 'You follow this author, so this tweet has in-network status and will avoid the 25% out-of-network penalty.'
              : 'You don\'t follow this author. Will receive a 0.75x multiplier (25% penalty) later in the pipeline.'}
          </p>
        </div>
      </div>

      <div class="stage-note">
        <strong>Key Insight</strong>: Most tweets never even enter your candidate pool. The algorithm pre-filters based on your follow graph and interest clusters.
      </div>
    </div>
  `;
}

/**
 * Stage 2: Feature Hydration
 */
function renderFeatureHydration() {
  return `
    <div class="stage-detail">
      <h3>Stage 2: Feature Hydration</h3>
      <p>The algorithm attaches ~6,000 features to this tweet for the ML model to evaluate.</p>

      <div class="stage-content">
        <div class="detail-card">
          <h4>Author Features</h4>
          <ul class="feature-list">
            <li>Follower count & verified status</li>
            <li>Reputation score (TweetCred)</li>
            <li>Historical engagement rates</li>
            <li>Account age & activity level</li>
          </ul>
        </div>

        <div class="detail-card">
          <h4>Tweet Features</h4>
          <ul class="feature-list">
            <li>Media type (text, image, video, link)</li>
            <li>Length & linguistic features</li>
            <li>Recency (time since posting)</li>
            <li>Topic & entity recognition</li>
          </ul>
        </div>

        <div class="detail-card">
          <h4>User-Tweet Features</h4>
          <ul class="feature-list">
            <li><strong>Cluster similarity: ${(currentScenario.clusterScore * 100).toFixed(0)}%</strong></li>
            <li>Real graph connection strength</li>
            <li>Past engagement with author</li>
            <li>Similar tweets you engaged with</li>
          </ul>
        </div>

        <div class="detail-card">
          <h4>Engagement Predictions</h4>
          <div class="detail-value">15 probability predictions</div>
          <p class="detail-explanation">
            The Heavy Ranker will predict probabilities for 15 different engagement types. These feed into the weighted scoring formula.
          </p>
        </div>
      </div>

      <div class="stage-note">
        <strong>Key Insight</strong>: The cluster similarity (${(currentScenario.clusterScore * 100).toFixed(0)}%) will multiply the final score, creating personalization and filter bubbles.
      </div>
    </div>
  `;
}

/**
 * Stage 3: ML Scoring
 */
function renderMLScoring() {
  const { score, breakdown } = calculateBaseScore();

  // Store base score
  if (scoreHistory.length === 0) {
    scoreHistory.push({ stage: 'Base Score (Heavy Ranker)', score });
  }

  // Sort breakdown by contribution (absolute value)
  breakdown.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return `
    <div class="stage-detail">
      <h3>Stage 3: Heavy Ranker (ML Scoring)</h3>
      <p>MaskNet model predicts engagement probabilities and calculates weighted score:</p>

      <div class="scoring-formula">
        <code>score = Σ (probability<sub>i</sub> × weight<sub>i</sub>)</code>
      </div>

      <div class="stage-content">
        <div class="score-breakdown-table">
          <div class="breakdown-header">
            <span>Engagement Type</span>
            <span>Probability</span>
            <span>Weight</span>
            <span>Contribution</span>
          </div>
          ${breakdown.map(item => `
            <div class="breakdown-row ${item.contribution < 0 ? 'negative' : ''}">
              <span class="breakdown-type">${item.type}</span>
              <span class="breakdown-prob">${(item.probability * 100).toFixed(1)}%</span>
              <span class="breakdown-weight">${item.weight.toFixed(1)}</span>
              <span class="breakdown-contribution ${item.contribution >= 0 ? 'positive' : 'negative'}">
                ${item.contribution >= 0 ? '+' : ''}${item.contribution.toFixed(2)}
              </span>
            </div>
          `).join('')}
          <div class="breakdown-total">
            <span>Total Base Score</span>
            <span></span>
            <span></span>
            <span class="total-score">${score.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="stage-note">
        <strong>Key Insight</strong>: Notice how favorites (0.5 weight) contribute far less than replies (13.5 weight). The algorithm optimizes for engagement depth, not breadth.
      </div>
    </div>
  `;
}

/**
 * Stage 4: Filters & Penalties
 */
function renderFiltersAndPenalties() {
  const { score: baseScore } = calculateBaseScore();
  let currentScore = baseScore;
  const modifications = [];

  // Out-of-network penalty
  if (currentScenario.network === 'out-of-network') {
    const penalty = 0.75;
    const newScore = currentScore * penalty;
    modifications.push({
      name: 'Out-of-Network Penalty',
      multiplier: `×${penalty}`,
      before: currentScore,
      after: newScore,
      description: 'You don\'t follow this author, so score reduced by 25%'
    });
    currentScore = newScore;
  }

  // Cluster scoring (personalization)
  const clusterMultiplier = currentScenario.clusterScore;
  const afterCluster = currentScore * clusterMultiplier;
  modifications.push({
    name: 'Cluster Scoring',
    multiplier: `×${clusterMultiplier.toFixed(2)}`,
    before: currentScore,
    after: afterCluster,
    description: `Multiplied by your ${currentScenario.cluster === 'primary' ? 'primary' : 'secondary'} interest cluster score. This creates filter bubbles!`
  });
  currentScore = afterCluster;

  // Author diversity penalty
  if (currentScenario.authorPosition > 1) {
    const position = currentScenario.authorPosition - 1; // 0-indexed
    const floor = 0.25;
    const decayFactor = 0.5;
    const multiplier = (1 - floor) * Math.pow(decayFactor, position) + floor;
    const afterDiversity = currentScore * multiplier;

    modifications.push({
      name: 'Author Diversity Penalty',
      multiplier: `×${multiplier.toFixed(3)}`,
      before: currentScore,
      after: afterDiversity,
      description: `This is the ${currentScenario.authorPosition}${currentScenario.authorPosition === 3 ? 'rd' : 'th'} tweet from this author in your feed. Exponential penalty applied.`
    });
    currentScore = afterDiversity;
  }

  // Store final score
  scoreHistory.push({ stage: 'After Filters & Penalties', score: currentScore });

  return `
    <div class="stage-detail">
      <h3>Stage 4: Filters & Penalties</h3>
      <p>Multiple filters reshape the ranking by applying multipliers and penalties:</p>

      <div class="stage-content">
        <div class="modifications-list">
          ${modifications.map((mod, index) => `
            <div class="modification-card">
              <div class="modification-header">
                <h4>${mod.name}</h4>
                <span class="modification-multiplier">${mod.multiplier}</span>
              </div>
              <div class="modification-scores">
                <span class="score-before">${mod.before.toFixed(3)}</span>
                <span class="score-arrow">→</span>
                <span class="score-after">${mod.after.toFixed(3)}</span>
              </div>
              <p class="modification-description">${mod.description}</p>
            </div>
          `).join('')}
        </div>

        <div class="final-score-card">
          <h4>Final Score After Filters</h4>
          <div class="final-score-value">${currentScore.toFixed(3)}</div>
          <p>
            ${baseScore > currentScore
              ? `Score reduced by ${(((baseScore - currentScore) / baseScore) * 100).toFixed(1)}% through filters`
              : 'Score maintained through filters'}
          </p>
        </div>
      </div>

      <div class="stage-note">
        <strong>Key Insight</strong>: Filters can dramatically change rankings. ${currentScenario.network === 'out-of-network' ? 'Out-of-network tweets need 33% higher base scores to compete with in-network content.' : 'In-network tweets avoid the 25% out-of-network penalty.'}
      </div>
    </div>
  `;
}

/**
 * Stage 5: Mixing & Serving
 */
function renderMixingAndServing() {
  const finalScore = scoreHistory[scoreHistory.length - 1].score;
  const baseScore = scoreHistory[0].score;
  const totalChange = ((finalScore - baseScore) / baseScore) * 100;

  return `
    <div class="stage-detail">
      <h3>Stage 5: Mixing & Serving</h3>
      <p>The final stage inserts ads, promoted tweets, and modules before serving your timeline.</p>

      <div class="stage-content">
        <div class="detail-card">
          <h4>Final Ranking</h4>
          <div class="detail-value">Rank #${estimateRank(finalScore)}</div>
          <p class="detail-explanation">
            Based on the final score of ${finalScore.toFixed(3)}, this tweet would rank approximately #${estimateRank(finalScore)} in your timeline of ~100-200 tweets.
          </p>
        </div>

        <div class="detail-card">
          <h4>Survival Rate</h4>
          <div class="detail-value">${estimateRank(finalScore) <= 100 ? '✓ Survived' : '✗ Filtered Out'}</div>
          <p class="detail-explanation">
            Only ~50-100 tweets make it to your final timeline. ${estimateRank(finalScore) <= 100 ? 'This tweet made it!' : 'This tweet was filtered out in the final ranking.'}
          </p>
        </div>

        <div class="detail-card">
          <h4>Score Evolution</h4>
          <div class="score-evolution">
            <div class="evolution-row">
              <span>Base Score:</span>
              <span class="evolution-score">${baseScore.toFixed(3)}</span>
            </div>
            <div class="evolution-arrow">↓</div>
            <div class="evolution-row">
              <span>Final Score:</span>
              <span class="evolution-score ${totalChange >= 0 ? 'positive' : 'negative'}">
                ${finalScore.toFixed(3)}
                <span class="evolution-change">(${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(1)}%)</span>
              </span>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <h4>Mixing & Ads</h4>
          <p class="detail-explanation">
            Twitter inserts ads (~10% of timeline), promoted tweets, "Who to Follow" modules, and topic suggestions. Your organic timeline is interspersed with monetization elements.
          </p>
        </div>
      </div>

      <div class="stage-note">
        <strong>Key Insight</strong>: ${totalChange < -20 ? 'This tweet lost significant score through filters.' : totalChange > 0 ? 'This tweet maintained its strong score.' : 'This tweet survived with moderate scoring.'}
      </div>
    </div>
  `;
}

/**
 * Estimate rank based on score (rough heuristic)
 */
function estimateRank(score) {
  if (score > 5) return Math.floor(Math.random() * 10) + 1;
  if (score > 3) return Math.floor(Math.random() * 30) + 10;
  if (score > 2) return Math.floor(Math.random() * 50) + 30;
  if (score > 1) return Math.floor(Math.random() * 70) + 80;
  return Math.floor(Math.random() * 100) + 150;
}

/**
 * Update score tracker
 */
function updateScoreTracker() {
  if (scoreHistory.length === 0) return;

  scoreBreakdown.innerHTML = scoreHistory.map((entry, index) => `
    <div class="score-stage ${index === scoreHistory.length - 1 ? 'current' : ''}">
      <span class="score-stage-name">${entry.stage}</span>
      <span class="score-stage-value">${entry.score.toFixed(3)}</span>
    </div>
  `).join('<div class="score-arrow">↓</div>');
}

/**
 * Show final summary
 */
function showFinalSummary() {
  const finalScore = scoreHistory[scoreHistory.length - 1].score;
  const rank = estimateRank(finalScore);
  const survived = rank <= 100;

  const summaryText = `
    <strong>${currentScenario.name}</strong> completed the pipeline with a final score of <strong>${finalScore.toFixed(3)}</strong>,
    ranking approximately <strong>#${rank}</strong> in your timeline.
    <br><br>
    ${survived
      ? '✓ This tweet <strong>survived the 96% rejection rate</strong> and would appear in your timeline.'
      : '✗ This tweet was <strong>filtered out</strong> in the final ranking and would not appear in your timeline.'}
    <br><br>
    ${currentScenario.network === 'out-of-network' && !survived
      ? 'The 25% out-of-network penalty significantly reduced its competitiveness.'
      : currentScenario.authorPosition > 1 && !survived
      ? 'The author diversity penalty reduced its ranking below the visibility threshold.'
      : survived && currentScenario.network === 'in-network'
      ? 'In-network status and strong engagement predictions helped it survive.'
      : 'Try exploring different scenarios to see how network status and engagement affect outcomes.'}
  `;

  document.getElementById('summary-text').innerHTML = summaryText;
  finalSummary.style.display = 'block';
  finalSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });

  nextStageBtn.style.display = 'none';
}

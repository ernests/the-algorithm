/**
 * The Reinforcement Loop Machine
 *
 * Shows step-by-step how the feedback loop creates drift:
 * Profile → Candidates → Scoring → Feed → Engagement → Profile Update → repeat
 *
 * Based on:
 * - Multiplicative scoring (ApproximateCosineSimilarity.scala:84-94)
 * - Weekly InterestedIn updates (InterestedInFromKnownFor.scala:59)
 * - L2 normalization (SimClustersEmbedding.scala:59-72)
 */

// State
let currentWeek = 0;
let currentStage = 0;
let profile = { ai: 0.60, cooking: 0.40 };
let history = [];

// Configuration
const DRIFT_RATE = 0.015; // Medium engagement
const STAGES = ['profile', 'candidates', 'scoring', 'feed', 'engagement', 'update'];

// DOM elements
const loopAiSlider = document.getElementById('loop-ai');
const loopCookingSlider = document.getElementById('loop-cooking');
const startLoopBtn = document.getElementById('start-loop-btn');
const loopContainer = document.getElementById('loop-container');
const stageContainer = document.getElementById('stage-container');
const nextStageBtn = document.getElementById('next-stage-btn');
const restartBtn = document.getElementById('restart-btn');
const currentWeekDisplay = document.getElementById('current-week');
const historyContainer = document.getElementById('history-container');

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  initializeSliders();
  attachEventListeners();
});

/**
 * Initialize sliders with normalization
 */
function initializeSliders() {
  updateLoopDisplays();

  [loopAiSlider, loopCookingSlider].forEach(slider => {
    slider.addEventListener('input', () => {
      normalizeLoopProfile();
      updateLoopDisplays();
    });
  });
}

/**
 * Normalize loop profile to 100%
 */
function normalizeLoopProfile() {
  const ai = parseInt(loopAiSlider.value);
  const cooking = parseInt(loopCookingSlider.value);
  const total = ai + cooking;

  if (total !== 100) {
    const normAi = Math.round((ai / total) * 100);
    const normCooking = 100 - normAi;

    loopAiSlider.value = normAi;
    loopCookingSlider.value = normCooking;

    profile = { ai: normAi / 100, cooking: normCooking / 100 };
  } else {
    profile = { ai: ai / 100, cooking: cooking / 100 };
  }
}

/**
 * Update loop displays
 */
function updateLoopDisplays() {
  const aiPercent = Math.round(profile.ai * 100);
  const cookingPercent = Math.round(profile.cooking * 100);

  document.getElementById('loop-ai-display').textContent = `${aiPercent}%`;
  document.getElementById('loop-cooking-display').textContent = `${cookingPercent}%`;
  document.getElementById('loop-total').textContent = `${aiPercent + cookingPercent}%`;
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  startLoopBtn.addEventListener('click', startLoop);
  nextStageBtn.addEventListener('click', nextStage);
  restartBtn.addEventListener('click', restart);
}

/**
 * Start the loop
 */
function startLoop() {
  // Reset state
  currentWeek = 0;
  currentStage = 0;
  history = [{ week: 0, ai: profile.ai, cooking: profile.cooking }];

  // Show loop container
  loopContainer.style.display = 'block';
  loopContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Render first stage
  renderStage();
  updateProgress();
}

/**
 * Advance to next stage
 */
function nextStage() {
  currentStage++;

  if (currentStage >= STAGES.length) {
    // Completed first loop, show 4-week projection
    showProjection();
  } else {
    renderStage();
    updateProgress();
  }
}

/**
 * Calculate drift for one week
 */
function calculateWeeklyDrift(currentProfile) {
  const advantage = currentProfile.ai / currentProfile.cooking;
  const imbalance = Math.abs(currentProfile.ai - currentProfile.cooking);
  const slowdown = 1 - (imbalance * 0.5);
  const drift = DRIFT_RATE * advantage * slowdown;

  const newAi = Math.min(0.95, currentProfile.ai + drift);
  const newCooking = 1 - newAi; // L2 normalization

  return { ai: newAi, cooking: newCooking };
}

/**
 * Show 4-week projection after completing one loop
 */
function showProjection() {
  nextStageBtn.textContent = 'Show 6-Month Projection →';
  nextStageBtn.onclick = extendToSixMonths;

  // Calculate 4 weeks of drift
  const projection = [history[0]]; // Week 0
  let currentProfile = { ai: profile.ai, cooking: profile.cooking };

  for (let week = 1; week <= 4; week++) {
    currentProfile = calculateWeeklyDrift(currentProfile);
    projection.push({ week, ai: currentProfile.ai, cooking: currentProfile.cooking });
  }

  const initialAi = Math.round(projection[0].ai * 100);
  const week4Ai = Math.round(projection[4].ai * 100);
  const totalDrift = week4Ai - initialAi;

  stageContainer.innerHTML = `
    <div class="stage-card">
      <h3>Loop Complete - 4-Week Projection</h3>
      <p>You've experienced one complete loop. Now let's see how this compounds over 4 weeks:</p>

      <div class="projection-summary">
        <div class="projection-row">
          <span class="projection-label">Week 0 (Starting):</span>
          <span class="projection-value">
            <span style="color: #1DA1F2; font-weight: 700;">${initialAi}% AI</span> /
            <span style="color: #17bf63; font-weight: 700;">${100 - initialAi}% Cooking</span>
          </span>
        </div>
        <div class="projection-arrow">↓</div>
        <div class="projection-row">
          <span class="projection-label">Week 4 (After 4 loops):</span>
          <span class="projection-value">
            <span style="color: #1DA1F2; font-weight: 700;">${week4Ai}% AI</span> /
            <span style="color: #17bf63; font-weight: 700;">${100 - week4Ai}% Cooking</span>
          </span>
        </div>
        <div class="projection-diff">
          Total drift: ${totalDrift > 0 ? '+' : ''}${totalDrift} percentage points in just 4 weeks
        </div>
      </div>

      <h4 style="margin-top: 2rem;">Week-by-Week Breakdown</h4>
      <div class="projection-timeline">
        ${projection.map(entry => {
          const aiPercent = Math.round(entry.ai * 100);
          const cookingPercent = Math.round(entry.cooking * 100);
          return `
            <div class="projection-week">
              <div class="projection-week-label">Week ${entry.week}</div>
              <div class="projection-week-bar">
                <div class="projection-segment" style="width: ${aiPercent}%; background-color: #1DA1F2;">
                  <span>${aiPercent}%</span>
                </div>
                <div class="projection-segment" style="width: ${cookingPercent}%; background-color: #17bf63;">
                  <span>${cookingPercent}%</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="stage-explanation">
        <p><strong>The compounding effect:</strong> Each week, the loop repeats. Your profile updates based on your engagement, which was determined by your feed, which was determined by your profile. The imbalance grows automatically.</p>
        <p><strong>Key insight:</strong> You didn't change your behavior at all! You consistently engaged with what you saw. The algorithm's multiplicative scoring and L2 normalization created this drift.</p>
      </div>
    </div>
  `;

  // Store projection for potential 6-month view
  window.fullProjection = projection;

  // Update history display
  history = projection;
  updateHistory();
}

/**
 * Extend projection to 6 months (24 weeks)
 */
function extendToSixMonths() {
  const projection = [...window.fullProjection];
  let currentProfile = {
    ai: projection[projection.length - 1].ai,
    cooking: projection[projection.length - 1].cooking
  };

  // Calculate weeks 5-24
  for (let week = 5; week <= 24; week++) {
    currentProfile = calculateWeeklyDrift(currentProfile);
    projection.push({ week, ai: currentProfile.ai, cooking: currentProfile.cooking });
  }

  const initialAi = Math.round(projection[0].ai * 100);
  const week24Ai = Math.round(projection[24].ai * 100);
  const totalDrift = week24Ai - initialAi;

  stageContainer.innerHTML = `
    <div class="stage-card">
      <h3>6-Month Projection (24 Weeks)</h3>
      <p>Here's the long-term effect of the reinforcement loop:</p>

      <div class="projection-summary">
        <div class="projection-row">
          <span class="projection-label">Week 0 (Starting):</span>
          <span class="projection-value">
            <span style="color: #1DA1F2; font-weight: 700;">${initialAi}% AI</span> /
            <span style="color: #17bf63; font-weight: 700;">${100 - initialAi}% Cooking</span>
          </span>
        </div>
        <div class="projection-arrow">↓</div>
        <div class="projection-row">
          <span class="projection-label">Week 24 (6 months later):</span>
          <span class="projection-value">
            <span style="color: #1DA1F2; font-weight: 700;">${week24Ai}% AI</span> /
            <span style="color: #17bf63; font-weight: 700;">${100 - week24Ai}% Cooking</span>
          </span>
        </div>
        <div class="projection-diff">
          Total drift: ${totalDrift > 0 ? '+' : ''}${totalDrift} percentage points over 6 months
        </div>
      </div>

      <h4 style="margin-top: 2rem;">Complete Timeline</h4>
      <div class="projection-timeline long">
        ${projection.filter(p => p.week % 4 === 0 || p.week === 1).map(entry => {
          const aiPercent = Math.round(entry.ai * 100);
          const cookingPercent = Math.round(entry.cooking * 100);
          return `
            <div class="projection-week">
              <div class="projection-week-label">Week ${entry.week}</div>
              <div class="projection-week-bar">
                <div class="projection-segment" style="width: ${aiPercent}%; background-color: #1DA1F2;">
                  <span>${aiPercent}%</span>
                </div>
                <div class="projection-segment" style="width: ${cookingPercent}%; background-color: #17bf63;">
                  <span>${cookingPercent}%</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="callout warning" style="margin-top: 2rem;">
        <h4 style="margin-top: 0;">Filter Bubble Lock-In</h4>
        <p>After 6 months, you've drifted from <strong>${initialAi}/${100-initialAi}</strong> to <strong>${week24Ai}/${100-week24Ai}</strong>. ${week24Ai >= 75 ? 'Your feed is now a monoculture - the minority interest has nearly disappeared.' : 'The drift continues accelerating as the imbalance grows.'}</p>
        <p>This isn't because you changed. The algorithm's design makes drift mathematically inevitable for any imbalanced starting point.</p>
      </div>
    </div>
  `;

  nextStageBtn.style.display = 'none';
  restartBtn.style.display = 'block';

  // Update history display
  history = projection;
  updateHistory();
}

/**
 * Restart the loop
 */
function restart() {
  nextStageBtn.style.display = 'block';
  restartBtn.style.display = 'none';
  historyContainer.style.display = 'none';

  loopContainer.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Render current stage
 */
function renderStage() {
  const stage = STAGES[currentStage];
  const aiPercent = Math.round(profile.ai * 100);
  const cookingPercent = Math.round(profile.cooking * 100);

  let html = '';

  switch (stage) {
    case 'profile':
      html = `
        <div class="stage-card">
          <h3>Stage 1: Your Profile</h3>
          <p>This is your current InterestedIn profile - the algorithm's understanding of what you care about:</p>

          <div class="profile-bars">
            <div class="profile-bar">
              <div class="profile-bar-label">
                <span style="color: #1DA1F2;">■ AI/Tech</span>
                <span style="font-weight: 700;">${aiPercent}%</span>
              </div>
              <div class="profile-bar-fill" style="width: ${aiPercent}%; background-color: #1DA1F2;"></div>
            </div>
            <div class="profile-bar">
              <div class="profile-bar-label">
                <span style="color: #17bf63;">■ Cooking</span>
                <span style="font-weight: 700;">${cookingPercent}%</span>
              </div>
              <div class="profile-bar-fill" style="width: ${cookingPercent}%; background-color: #17bf63;"></div>
            </div>
          </div>

          <div class="stage-explanation">
            <p><strong>What this means:</strong> The algorithm will use these weights to score tweets. AI content gets multiplied by ${(profile.ai).toFixed(2)}, Cooking by ${(profile.cooking).toFixed(2)}.</p>
            ${currentWeek > 0 ? `<p><strong>Change from Week ${currentWeek - 1}:</strong> AI ${profile.ai > history[currentWeek - 1].ai ? '↑' : '↓'} ${Math.abs((profile.ai - history[currentWeek - 1].ai) * 100).toFixed(1)}%, Cooking ${profile.cooking > history[currentWeek - 1].cooking ? '↑' : '↓'} ${Math.abs((profile.cooking - history[currentWeek - 1].cooking) * 100).toFixed(1)}%</p>` : ''}
          </div>
        </div>
      `;
      break;

    case 'candidates':
      const aiCandidates = Math.round(profile.ai * 1600);
      const cookingCandidates = Math.round(profile.cooking * 1600);

      html = `
        <div class="stage-card">
          <h3>Stage 2: Fetch Candidates</h3>
          <p>The algorithm fetches ~1,600 candidate tweets from your clusters, proportional to your interests:</p>

          <div class="candidates-display">
            <div class="candidate-row">
              <span style="color: #1DA1F2; font-weight: 600;">■ AI/Tech:</span>
              <span style="font-family: var(--font-mono); font-weight: 700;">${aiCandidates} tweets</span>
            </div>
            <div class="candidate-row">
              <span style="color: #17bf63; font-weight: 600;">■ Cooking:</span>
              <span style="font-family: var(--font-mono); font-weight: 700;">${cookingCandidates} tweets</span>
            </div>
          </div>

          <div class="stage-explanation">
            <p><strong>What this means:</strong> Before any scoring happens, the algorithm already fetched ${aiPercent}% AI content and ${cookingPercent}% Cooking content. Your profile determines what's even in the pool!</p>
          </div>
        </div>
      `;
      break;

    case 'scoring':
      const aiScore = (0.85 * profile.ai).toFixed(3);
      const cookingScore = (0.85 * profile.cooking).toFixed(3);
      const scoreAdvantage = (aiScore / cookingScore).toFixed(2);

      html = `
        <div class="stage-card">
          <h3>Stage 3: Score Tweets</h3>
          <p>Each tweet gets scored by multiplying base quality × your cluster interest:</p>

          <div class="scoring-examples">
            <div class="scoring-example">
              <div class="tweet-preview" style="border-left: 3px solid #1DA1F2;">
                <strong>AI Tweet:</strong> "New breakthrough in transformer architecture..."
              </div>
              <div class="scoring-calc">
                <code>Base Quality: 0.85</code>
                <code>× Your AI Interest: ${profile.ai.toFixed(2)}</code>
                <code style="border-top: 1px solid var(--border-color); padding-top: 0.5rem; margin-top: 0.5rem; font-weight: 700;">= Score: ${aiScore}</code>
              </div>
            </div>

            <div class="scoring-example">
              <div class="tweet-preview" style="border-left: 3px solid #17bf63;">
                <strong>Cooking Tweet:</strong> "Made the perfect sourdough after 3 years..."
              </div>
              <div class="scoring-calc">
                <code>Base Quality: 0.85</code>
                <code>× Your Cooking Interest: ${profile.cooking.toFixed(2)}</code>
                <code style="border-top: 1px solid var(--border-color); padding-top: 0.5rem; margin-top: 0.5rem; font-weight: 700;">= Score: ${cookingScore}</code>
              </div>
            </div>
          </div>

          <div class="stage-explanation">
            <p><strong>What this means:</strong> Despite equal quality (0.85), the AI tweet scores <strong>${scoreAdvantage}x higher</strong> due to your cluster interests. This determines what ranks at the top of your feed.</p>
          </div>
        </div>
      `;
      break;

    case 'feed':
      html = `
        <div class="stage-card">
          <h3>Stage 4: Build Your Feed</h3>
          <p>The algorithm sorts tweets by score and builds your feed. The composition matches your profile:</p>

          <div class="feed-composition">
            <div class="feed-section" style="flex: ${aiPercent}; background-color: rgba(29, 161, 242, 0.2); border: 2px solid #1DA1F2;">
              <div class="feed-section-content">
                <strong style="color: #1DA1F2;">${aiPercent}%</strong>
                <span style="font-size: 0.9rem;">AI/Tech</span>
              </div>
            </div>
            <div class="feed-section" style="flex: ${cookingPercent}; background-color: rgba(23, 191, 99, 0.2); border: 2px solid #17bf63;">
              <div class="feed-section-content">
                <strong style="color: #17bf63;">${cookingPercent}%</strong>
                <span style="font-size: 0.9rem;">Cooking</span>
              </div>
            </div>
          </div>

          <div class="stage-explanation">
            <p><strong>What this means:</strong> Because AI content scored higher, it dominates your feed. You'll see ${aiPercent}% AI tweets and ${cookingPercent}% Cooking tweets. This isn't random - it's a direct result of the multiplicative scoring.</p>
          </div>
        </div>
      `;
      break;

    case 'engagement':
      html = `
        <div class="stage-card">
          <h3>Stage 5: You Engage</h3>
          <p>You engage with what you see. Since ${aiPercent}% of your feed is AI, ${aiPercent}% of your engagements are with AI content:</p>

          <div class="engagement-pattern">
            <div class="engagement-row">
              <span style="color: #1DA1F2; font-weight: 600;">■ AI/Tech:</span>
              <div class="engagement-bar">
                <div class="engagement-fill" style="width: ${aiPercent}%; background-color: #1DA1F2;"></div>
                <span>${aiPercent}% of engagements</span>
              </div>
            </div>
            <div class="engagement-row">
              <span style="color: #17bf63; font-weight: 600;">■ Cooking:</span>
              <div class="engagement-bar">
                <div class="engagement-fill" style="width: ${cookingPercent}%; background-color: #17bf63;"></div>
                <span>${cookingPercent}% of engagements</span>
              </div>
            </div>
          </div>

          <div class="stage-explanation">
            <p><strong>Critical insight:</strong> You didn't change your preferences! You just engaged with what was shown to you. The algorithm controlled what you saw, which determined what you engaged with.</p>
          </div>
        </div>
      `;
      break;

    case 'update':
      const oldAi = currentWeek > 0 ? history[currentWeek - 1].ai : history[0].ai;
      const oldCooking = currentWeek > 0 ? history[currentWeek - 1].cooking : history[0].cooking;
      const advantage = profile.ai / profile.cooking;
      const imbalance = Math.abs(profile.ai - profile.cooking);
      const slowdown = 1 - (imbalance * 0.5);
      const drift = DRIFT_RATE * advantage * slowdown;
      const newAi = Math.min(0.95, profile.ai + drift);
      const newCooking = 1 - newAi;

      html = `
        <div class="stage-card">
          <h3>Stage 6: Update Your Profile</h3>
          <p>Based on your engagement pattern, the algorithm updates your InterestedIn profile. This happens via weekly batch jobs (L2 normalization ensures interests sum to 100%):</p>

          <div class="profile-update">
            <div class="update-row">
              <span class="update-label">Previous Profile:</span>
              <span class="update-value">
                <span style="color: #1DA1F2;">${Math.round(profile.ai * 100)}% AI</span> /
                <span style="color: #17bf63;">${Math.round(profile.cooking * 100)}% Cooking</span>
              </span>
            </div>
            <div class="update-arrow">↓</div>
            <div class="update-row">
              <span class="update-label">New Profile:</span>
              <span class="update-value">
                <span style="color: #1DA1F2; font-weight: 700;">${Math.round(newAi * 100)}% AI</span> /
                <span style="color: #17bf63; font-weight: 700;">${Math.round(newCooking * 100)}% Cooking</span>
              </span>
            </div>
            <div class="update-diff">
              AI: ${newAi > profile.ai ? '+' : ''}${((newAi - profile.ai) * 100).toFixed(1)}%,
              Cooking: ${newCooking > profile.cooking ? '+' : ''}${((newCooking - profile.cooking) * 100).toFixed(1)}%
            </div>
          </div>

          <div class="stage-explanation">
            <p><strong>The feedback loop:</strong> AI increased because you engaged more with AI. Cooking decreased because interests must sum to 100% (zero-sum). This new profile becomes the input for Week ${currentWeek + 1}, and the cycle repeats.</p>
            <p><strong>This is drift!</strong> Small changes compound week after week, pushing you toward monoculture.</p>
          </div>
        </div>
      `;
      break;
  }

  stageContainer.innerHTML = html;
}

/**
 * Update progress tracker
 */
function updateProgress() {
  const progressItems = document.querySelectorAll('.progress-item');

  progressItems.forEach((item, index) => {
    if (index < currentStage) {
      item.classList.add('completed');
      item.classList.remove('active');
    } else if (index === currentStage) {
      item.classList.add('active');
      item.classList.remove('completed');
    } else {
      item.classList.remove('active', 'completed');
    }
  });
}

/**
 * Update history timeline
 */
function updateHistory() {
  if (history.length <= 1) return;

  historyContainer.style.display = 'block';

  const timeline = document.getElementById('history-timeline');
  timeline.innerHTML = history.map((entry, index) => {
    const aiPercent = Math.round(entry.ai * 100);
    const cookingPercent = Math.round(entry.cooking * 100);

    return `
      <div class="history-entry">
        <div class="history-week">Week ${entry.week}</div>
        <div class="history-bar">
          <div class="history-segment" style="width: ${aiPercent}%; background-color: #1DA1F2;">
            ${aiPercent}%
          </div>
          <div class="history-segment" style="width: ${cookingPercent}%; background-color: #17bf63;">
            ${cookingPercent}%
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Analysis
  const initialAi = Math.round(history[0].ai * 100);
  const currentAi = Math.round(history[history.length - 1].ai * 100);
  const drift = currentAi - initialAi;

  document.getElementById('drift-analysis').innerHTML = `
    Your profile drifted from <strong>${initialAi}% AI / ${100 - initialAi}% Cooking</strong>
    to <strong>${currentAi}% AI / ${100 - currentAi}% Cooking</strong> over ${currentWeek} weeks.
    That's a <strong>${drift} percentage point shift</strong> toward AI, happening automatically through the reinforcement loop.
    ${drift > 15 ? 'You\'re entering a filter bubble - the minority interest is fading fast!' : 'The drift is accelerating as the imbalance grows.'}
  `;
}

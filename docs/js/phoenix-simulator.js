// Phoenix Behavioral Sequence Simulator

document.addEventListener('DOMContentLoaded', function() {

// ============================================================================
// State Management
// ============================================================================

let actionSequence = [];
const MAX_SEQUENCE_LENGTH = 8;

// Action metadata
const ACTION_INFO = {
  'LIKE_tech': { emoji: '❤️', label: 'Like Tech', category: 'tech', engagement: 'high', color: '#1DA1F2' },
  'CLICK_tech': { emoji: '👁️', label: 'Click Tech', category: 'tech', engagement: 'medium', color: '#1DA1F2' },
  'REPLY_tech': { emoji: '💬', label: 'Reply Tech', category: 'tech', engagement: 'very high', color: '#1DA1F2' },
  'LIKE_sports': { emoji: '❤️', label: 'Like Sports', category: 'sports', engagement: 'high', color: '#17bf63' },
  'CLICK_sports': { emoji: '👁️', label: 'Click Sports', category: 'sports', engagement: 'medium', color: '#17bf63' },
  'REPLY_sports': { emoji: '💬', label: 'Reply Sports', category: 'sports', engagement: 'very high', color: '#17bf63' },
  'SCROLL_neutral': { emoji: '📜', label: 'Scroll Past', category: 'neutral', engagement: 'none', color: '#8899AA' }
};

// ============================================================================
// Event Handlers
// ============================================================================

// Add action to sequence
document.querySelectorAll('.action-btn').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const category = button.dataset.category;
    const actionKey = `${action}_${category}`;

    if (actionSequence.length >= MAX_SEQUENCE_LENGTH) {
      // Remove oldest action (shift left)
      actionSequence.shift();
    }

    actionSequence.push(actionKey);
    updateSequenceDisplay();
    analyzeBehavior();
  });
});

// Clear sequence
document.getElementById('clear-sequence-btn').addEventListener('click', () => {
  actionSequence = [];
  updateSequenceDisplay();
  document.getElementById('predictions-container').style.display = 'none';
});

// ============================================================================
// Display Functions
// ============================================================================

function updateSequenceDisplay() {
  const container = document.getElementById('action-sequence');

  if (actionSequence.length === 0) {
    container.innerHTML = '<span style="color: var(--text-secondary); font-style: italic;">No actions yet. Click buttons above to build your sequence.</span>';
    return;
  }

  container.innerHTML = '';

  actionSequence.forEach((actionKey, index) => {
    const info = ACTION_INFO[actionKey];
    const badge = document.createElement('div');
    badge.style.cssText = `
      padding: 0.5rem 1rem;
      background-color: ${info.color}22;
      border: 2px solid ${info.color};
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    `;
    badge.innerHTML = `<span style="font-size: 1.2rem;">${info.emoji}</span> ${info.label}`;
    container.appendChild(badge);
  });
}

// ============================================================================
// Behavioral Analysis
// ============================================================================

function analyzeBehavior() {
  if (actionSequence.length === 0) {
    document.getElementById('predictions-container').style.display = 'none';
    return;
  }

  // Analyze sequence
  const analysis = analyzeSequencePattern(actionSequence);

  // Show predictions
  document.getElementById('predictions-container').style.display = 'block';

  // Display behavioral state
  displayBehavioralState(analysis);

  // Display predictions
  displayPredictions(analysis);

  // Display interpretation
  displayInterpretation(analysis);
}

function analyzeSequencePattern(sequence) {
  // Count by category
  const categoryCounts = { tech: 0, sports: 0, neutral: 0 };
  const actionCounts = { LIKE: 0, CLICK: 0, REPLY: 0, SCROLL: 0 };
  const engagementLevels = { 'very high': 0, high: 0, medium: 0, none: 0 };

  sequence.forEach(actionKey => {
    const info = ACTION_INFO[actionKey];
    const [action, category] = actionKey.split('_');

    categoryCounts[category]++;
    actionCounts[action]++;
    engagementLevels[info.engagement]++;
  });

  // Calculate dominant category
  const totalActions = sequence.length;
  const techPercent = (categoryCounts.tech / totalActions) * 100;
  const sportsPercent = (categoryCounts.sports / totalActions) * 100;
  const neutralPercent = (categoryCounts.neutral / totalActions) * 100;

  // Determine behavioral state
  let behavioralState = '';
  let stateColor = '';

  if (neutralPercent >= 60) {
    behavioralState = 'Passive Browsing Mode';
    stateColor = '#8899AA';
  } else if (categoryCounts.REPLY >= 2 || engagementLevels['very high'] >= 2) {
    behavioralState = 'High Engagement Streak';
    stateColor = '#ff6b6b';
  } else if (techPercent >= 75 || sportsPercent >= 75) {
    const dominant = techPercent > sportsPercent ? 'Tech' : 'Sports';
    behavioralState = `Deep Dive: ${dominant} Content`;
    stateColor = techPercent > sportsPercent ? '#1DA1F2' : '#17bf63';
  } else if (techPercent >= 50 && sportsPercent === 0) {
    behavioralState = 'Focused Exploration: Tech';
    stateColor = '#1DA1F2';
  } else if (sportsPercent >= 50 && techPercent === 0) {
    behavioralState = 'Focused Exploration: Sports';
    stateColor = '#17bf63';
  } else {
    behavioralState = 'Context Switching: Mixed Interests';
    stateColor = '#f5a623';
  }

  // Calculate predictions based on behavioral pattern
  const predictions = calculatePredictions({
    techPercent,
    sportsPercent,
    neutralPercent,
    engagementLevels,
    actionCounts,
    sequence
  });

  return {
    behavioralState,
    stateColor,
    categoryCounts,
    techPercent,
    sportsPercent,
    neutralPercent,
    predictions,
    engagementLevels,
    actionCounts
  };
}

function calculatePredictions(analysis) {
  const { techPercent, sportsPercent, neutralPercent, engagementLevels, sequence } = analysis;

  // Base probabilities
  let techEngagement = Math.max(5, techPercent);
  let sportsEngagement = Math.max(5, sportsPercent);

  // Boost based on recent momentum (last 3 actions)
  const recentActions = sequence.slice(-3);
  const recentTech = recentActions.filter(a => a.includes('tech')).length;
  const recentSports = recentActions.filter(a => a.includes('sports')).length;

  techEngagement += recentTech * 15;
  sportsEngagement += recentSports * 15;

  // Boost based on engagement intensity
  if (engagementLevels['very high'] >= 2) {
    // High engagement mode - boost everything
    techEngagement *= 1.3;
    sportsEngagement *= 1.3;
  }

  // Penalty for passive browsing
  if (neutralPercent >= 60) {
    techEngagement *= 0.3;
    sportsEngagement *= 0.3;
  }

  // Normalize to 100%
  const total = techEngagement + sportsEngagement;
  const techProb = (techEngagement / total) * 100;
  const sportsProb = (sportsEngagement / total) * 100;

  return {
    tech: Math.round(techProb),
    sports: Math.round(sportsProb)
  };
}

// ============================================================================
// Display Predictions
// ============================================================================

function displayBehavioralState(analysis) {
  const container = document.getElementById('behavioral-state');
  container.style.borderLeftColor = analysis.stateColor;
  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem;">
      <div style="width: 8px; height: 8px; background-color: ${analysis.stateColor}; border-radius: 50%;"></div>
      <span style="font-weight: 600; font-size: 1.1rem; color: ${analysis.stateColor};">${analysis.behavioralState}</span>
    </div>
    <p style="margin: 0.75rem 0 0 1.5rem; color: var(--text-secondary); font-size: 0.95rem;">
      Phoenix detected this pattern from your last ${actionSequence.length} actions
    </p>
  `;
}

function displayPredictions(analysis) {
  const container = document.getElementById('prediction-bars');

  const predictions = [
    { label: 'Next Tech Tweet', prob: analysis.predictions.tech, color: '#1DA1F2' },
    { label: 'Next Sports Tweet', prob: analysis.predictions.sports, color: '#17bf63' }
  ];

  container.innerHTML = '';

  predictions.forEach(pred => {
    const barContainer = document.createElement('div');
    barContainer.style.marginBottom = '1.5rem';

    barContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-weight: 600;">${pred.label}</span>
        <span style="font-weight: 600; color: ${pred.color}; font-size: 1.1rem;">${pred.prob}%</span>
      </div>
      <div style="background-color: var(--background-alt); height: 32px; border-radius: 4px; overflow: hidden; position: relative;">
        <div style="background-color: ${pred.color}; height: 100%; width: ${pred.prob}%; transition: width 0.5s ease; display: flex; align-items: center; justify-content: flex-end; padding-right: 0.75rem;">
          ${pred.prob > 15 ? `<span style="color: white; font-weight: 600; font-size: 0.9rem;">${pred.prob}%</span>` : ''}
        </div>
      </div>
    `;

    container.appendChild(barContainer);
  });
}

function displayInterpretation(analysis) {
  const container = document.getElementById('prediction-interpretation');

  let interpretation = '';
  const dominant = analysis.predictions.tech > analysis.predictions.sports ? 'Tech' : 'Sports';
  const dominantProb = Math.max(analysis.predictions.tech, analysis.predictions.sports);
  const dominantColor = analysis.predictions.tech > analysis.predictions.sports ? '#1DA1F2' : '#17bf63';

  if (analysis.neutralPercent >= 60) {
    interpretation = `
      <p><strong>Passive Browsing Mode Detected</strong></p>
      <p>Your sequence shows mostly scrolling with minimal engagement. Phoenix predicts:</p>
      <ul style="margin: 0.5rem 0;">
        <li>Low engagement probability for all content (${dominantProb}% max)</li>
        <li>Feed will show <strong>variety</strong> rather than depth</li>
        <li>Algorithm explores different topics to find your interest</li>
      </ul>
      <p style="margin-top: 1rem;"><strong>In Navi (old system)</strong>: You'd get your standard 50/50 mix regardless of browsing mode.<br>
      <strong>In Phoenix</strong>: Algorithm recognizes passive mode and adjusts accordingly.</p>
    `;
  } else if (analysis.engagementLevels['very high'] >= 2) {
    interpretation = `
      <p style="color: ${dominantColor};"><strong>High Engagement Streak Detected!</strong></p>
      <p>You've been actively engaging (replies, likes) with ${dominant.toLowerCase()} content. Phoenix predicts:</p>
      <ul style="margin: 0.5rem 0;">
        <li><strong>${dominantProb}%</strong> engagement probability for next ${dominant.toLowerCase()} tweet</li>
        <li>Feed will <strong>heavily prioritize</strong> ${dominant.toLowerCase()} content</li>
        <li>Momentum reinforces your current interest thread</li>
        <li>You're in "deep dive" mode - algorithm follows your lead</li>
      </ul>
      <p style="margin-top: 1rem;"><strong>In Navi</strong>: Static prediction based on lifetime averages.<br>
      <strong>In Phoenix</strong>: Real-time adaptation to your engagement momentum.</p>
    `;
  } else if (dominantProb >= 70) {
    interpretation = `
      <p><strong>Focused Interest Detected: ${dominant}</strong></p>
      <p>Your recent sequence shows clear focus on ${dominant.toLowerCase()} content (${dominantProb}% probability). Phoenix predicts:</p>
      <ul style="margin: 0.5rem 0;">
        <li>Next few tweets will be <strong>${dominant.toLowerCase()}-heavy</strong></li>
        <li>Algorithm recognizes you're exploring this topic right now</li>
        <li>Feed adapts to your current session interest</li>
      </ul>
      <p style="margin-top: 1rem;"><strong>Key difference</strong>: Phoenix sees you're interested in ${dominant.toLowerCase()} <em>right now</em>, not based on what you liked last month.</p>
    `;
  } else {
    interpretation = `
      <p><strong>Context Switching Detected</strong></p>
      <p>Your sequence shows mixed interests (Tech: ${analysis.predictions.tech}%, Sports: ${analysis.predictions.sports}%). Phoenix predicts:</p>
      <ul style="margin: 0.5rem 0;">
        <li>Balanced feed reflecting your current exploration</li>
        <li>Algorithm recognizes you're sampling different topics</li>
        <li>Will adapt quickly if you focus on one category</li>
      </ul>
      <p style="margin-top: 1rem;"><strong>Phoenix advantage</strong>: Can detect when you switch contexts mid-session and adapt instantly.</p>
    `;
  }

  container.innerHTML = interpretation;
}

// End DOMContentLoaded
});

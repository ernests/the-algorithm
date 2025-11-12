// Algorithmic Identity Interactive JavaScript

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {

// ============================================================================
// InterestedIn Calculator
// ============================================================================

document.getElementById('calculate-btn').addEventListener('click', calculateInterestedIn);

// Also trigger on Enter key
['ai-likes', 'cooking-likes', 'politics-likes'].forEach(id => {
  document.getElementById(id).addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateInterestedIn();
  });
});

function calculateInterestedIn() {
  // Get input values
  const aiLikes = parseInt(document.getElementById('ai-likes').value) || 0;
  const cookingLikes = parseInt(document.getElementById('cooking-likes').value) || 0;
  const politicsLikes = parseInt(document.getElementById('politics-likes').value) || 0;

  // Calculate total
  const total = aiLikes + cookingLikes + politicsLikes;

  if (total === 0) {
    alert('Please enter at least some engagement!');
    return;
  }

  // Calculate percentages (raw scores)
  const aiPercent = (aiLikes / total) * 100;
  const cookingPercent = (cookingLikes / total) * 100;
  const politicsPercent = (politicsLikes / total) * 100;

  // Display results
  displayResults({
    ai: { raw: aiLikes, percent: aiPercent },
    cooking: { raw: cookingLikes, percent: cookingPercent },
    politics: { raw: politicsLikes, percent: politicsPercent },
    total: total
  });
}

function displayResults(data) {
  const container = document.getElementById('results-container');
  const barsContainer = document.getElementById('results-bars');
  const interpretationContainer = document.getElementById('results-interpretation');

  // Show results
  container.style.display = 'block';

  // Create visual bars
  barsContainer.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-weight: 600;"><span style="color: #1DA1F2;">�</span> AI/Tech</span>
        <span style="font-weight: 600; color: #1DA1F2;">${data.ai.percent.toFixed(1)}%</span>
      </div>
      <div style="background-color: var(--background-alt); height: 24px; border-radius: 4px; overflow: hidden;">
        <div style="background-color: #1DA1F2; height: 100%; width: ${data.ai.percent}%; transition: width 0.5s;"></div>
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-weight: 600;"><span style="color: #17bf63;">�</span> Cooking</span>
        <span style="font-weight: 600; color: #17bf63;">${data.cooking.percent.toFixed(1)}%</span>
      </div>
      <div style="background-color: var(--background-alt); height: 24px; border-radius: 4px; overflow: hidden;">
        <div style="background-color: #17bf63; height: 100%; width: ${data.cooking.percent}%; transition: width 0.5s;"></div>
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-weight: 600;"><span style="color: #f5a623;">�</span> Politics</span>
        <span style="font-weight: 600; color: #f5a623;">${data.politics.percent.toFixed(1)}%</span>
      </div>
      <div style="background-color: var(--background-alt); height: 24px; border-radius: 4px; overflow: hidden;">
        <div style="background-color: #f5a623; height: 100%; width: ${data.politics.percent}%; transition: width 0.5s;"></div>
      </div>
    </div>
  `;

  // Determine dominant cluster
  const sorted = [
    { name: 'AI/Tech', percent: data.ai.percent },
    { name: 'Cooking', percent: data.cooking.percent },
    { name: 'Politics', percent: data.politics.percent }
  ].sort((a, b) => b.percent - a.percent);

  const dominant = sorted[0];
  const secondary = sorted[1];

  // Generate interpretation
  let interpretation = '<h4 style="margin-top: 0;">What This Means</h4>';

  if (dominant.percent >= 70) {
    interpretation += `
      <p><strong>Strong consolidation</strong>: Your feed is dominated by ${dominant.name} (${dominant.percent.toFixed(1)}%).
      This means:</p>
      <ul>
        <li>~${Math.round(dominant.percent)}% of your feed will be ${dominant.name} content</li>
        <li>The algorithm will show you more ${dominant.name} content</li>
        <li>This will likely drift even higher (gravitational pull)</li>
        <li>${secondary.name} is at risk of dropping below the visibility threshold</li>
      </ul>
      <p style="color: #ff6b6b;"><strong>Warning</strong>: You're approaching a filter bubble. Consider diversifying your engagement.</p>
    `;
  } else if (dominant.percent >= 50) {
    interpretation += `
      <p><strong>Moderate imbalance</strong>: ${dominant.name} is your dominant interest (${dominant.percent.toFixed(1)}%),
      but you still see meaningful ${secondary.name} content. This will likely drift further toward ${dominant.name} over time.</p>
      <ul>
        <li>Feed composition: ~${Math.round(dominant.percent)}% ${dominant.name}, ~${Math.round(secondary.percent)}% ${secondary.name}</li>
        <li>Multiplicative scoring: ${dominant.name} tweets score ${(dominant.percent / secondary.percent).toFixed(1)}x higher</li>
        <li>Expected drift: ${dominant.name} will strengthen week by week</li>
      </ul>
      <p><strong>Tip</strong>: If you want to maintain balance, actively engage more with ${secondary.name} content.</p>
    `;
  } else {
    interpretation += `
      <p><strong>Relatively balanced</strong>: Your interests are fairly distributed. However, the algorithm will
      naturally drift toward the strongest interest (${dominant.name} at ${dominant.percent.toFixed(1)}%) over time.</p>
      <ul>
        <li>Current state: Diverse feed with multiple topics</li>
        <li>Risk: Multiplicative scoring will amplify ${dominant.name} advantage</li>
        <li>Timeline: Expect consolidation within 3-6 months without intentional diversification</li>
      </ul>
      <p><strong>Tip</strong>: Balanced interests require active maintenancethe algorithm has no rebalancing mechanisms.</p>
    `;
  }

  interpretation += `
    <div style="margin-top: 1rem; padding: 1rem; background-color: rgba(29, 161, 242, 0.1); border-left: 3px solid var(--primary-color);">
      <p style="margin: 0; font-size: 0.95rem;">
        <strong>Next week</strong>: Your InterestedIn will update based on what you engage with this week.
        The cycle repeats every 7 days, creating compounding drift.
      </p>
    </div>
  `;

  interpretationContainer.innerHTML = interpretation;

  // Scroll results into view
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================================================
// Timeline Scrubber
// ============================================================================

const weekSlider = document.getElementById('week-slider');
const weekDisplay = document.getElementById('week-display');
const timelineEvents = document.getElementById('timeline-events');
const timelineState = document.getElementById('timeline-state');

// Timeline data
const timelineData = [
  {
    week: 0,
    aiPercent: 60,
    cookingPercent: 40,
    events: ['You follow 50 accounts: 30 AI, 20 Cooking', 'Initial engagement tracked'],
    knownForUpdate: false,
    interestedInUpdate: false
  },
  {
    week: 1,
    aiPercent: 62,
    cookingPercent: 38,
    events: ['InterestedIn first calculation', 'Feed shifts to 62/38 composition', 'You engage with what you see (62% AI)'],
    knownForUpdate: false,
    interestedInUpdate: true
  },
  {
    week: 2,
    aiPercent: 64,
    cookingPercent: 36,
    events: ['InterestedIn updates (weekly)', 'Compounding begins: AI engagement increases AI score'],
    knownForUpdate: false,
    interestedInUpdate: true
  },
  {
    week: 3,
    aiPercent: 65,
    cookingPercent: 35,
    events: ['KnownFor updates (first time since Week 0)', 'Cluster structure recalculates', 'InterestedIn recalculates with new KnownFor', 'Some accounts may shift clusters'],
    knownForUpdate: true,
    interestedInUpdate: true
  },
  {
    week: 4,
    aiPercent: 66,
    cookingPercent: 34,
    events: ['InterestedIn updates on new KnownFor baseline', 'Compounding accelerates'],
    knownForUpdate: false,
    interestedInUpdate: true
  },
  {
    week: 5,
    aiPercent: 68,
    cookingPercent: 32,
    events: ['InterestedIn updates (weekly)', 'Drift momentum building'],
    knownForUpdate: false,
    interestedInUpdate: true
  },
  {
    week: 6,
    aiPercent: 70,
    cookingPercent: 30,
    events: ['KnownFor updates (second time)', 'InterestedIn updates', 'AI dominance clear: 70/30 split'],
    knownForUpdate: true,
    interestedInUpdate: true
  },
  {
    week: 7,
    aiPercent: 71,
    cookingPercent: 29,
    events: ['InterestedIn updates (weekly)', 'Cooking content becoming rare'],
    knownForUpdate: false,
    interestedInUpdate: true
  },
  {
    week: 8,
    aiPercent: 72,
    cookingPercent: 28,
    events: ['InterestedIn updates (weekly)', 'Feed increasingly homogeneous'],
    knownForUpdate: false,
    interestedInUpdate: true
  },
  {
    week: 9,
    aiPercent: 74,
    cookingPercent: 26,
    events: ['KnownFor updates (third time)', 'InterestedIn updates', 'Cluster structure locked in'],
    knownForUpdate: true,
    interestedInUpdate: true
  },
  {
    week: 10,
    aiPercent: 75,
    cookingPercent: 25,
    events: ['InterestedIn updates (weekly)', 'Approaching threshold danger zone'],
    knownForUpdate: false,
    interestedInUpdate: true
  },
  {
    week: 11,
    aiPercent: 76,
    cookingPercent: 24,
    events: ['InterestedIn updates (weekly)', 'Cooking barely visible'],
    knownForUpdate: false,
    interestedInUpdate: true
  },
  {
    week: 12,
    aiPercent: 76,
    cookingPercent: 24,
    events: ['KnownFor updates (fourth time)', 'InterestedIn updates', 'Consolidation complete: 60/40 � 76/24', '16 percentage point drift in 12 weeks'],
    knownForUpdate: true,
    interestedInUpdate: true
  }
];

// Initialize timeline
updateTimeline(0);

weekSlider.addEventListener('input', (e) => {
  const week = parseInt(e.target.value);
  updateTimeline(week);
});

function updateTimeline(week) {
  weekDisplay.textContent = week;
  const data = timelineData[week];

  // Display events
  let eventsHTML = '<h4 style="margin-top: 0;">This Week's Events:</h4>';
  eventsHTML += '<ul>';

  data.events.forEach(event => {
    eventsHTML += `<li>${event}</li>`;
  });

  eventsHTML += '</ul>';

  // Add update badges
  let badgesHTML = '<div style="margin-top: 1rem; display: flex; gap: 1rem; flex-wrap: wrap;">';

  if (data.knownForUpdate) {
    badgesHTML += '<span style="display: inline-block; padding: 0.5rem 1rem; background-color: rgba(255, 107, 107, 0.2); border: 2px solid #ff6b6b; border-radius: 4px; font-weight: 600; color: #ff6b6b;">= KnownFor Updates</span>';
  }

  if (data.interestedInUpdate) {
    badgesHTML += '<span style="display: inline-block; padding: 0.5rem 1rem; background-color: rgba(29, 161, 242, 0.2); border: 2px solid #1DA1F2; border-radius: 4px; font-weight: 600; color: #1DA1F2;">= InterestedIn Updates</span>';
  }

  badgesHTML += '</div>';

  timelineEvents.innerHTML = eventsHTML + badgesHTML;

  // Display current state
  const aiDrift = data.aiPercent - 60;
  const cookingDrift = data.cookingPercent - 40;

  let stateHTML = `
    <h4 style="margin-top: 0;">Your Current State</h4>

    <div style="margin: 1.5rem 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-weight: 600;"><span style="color: #1DA1F2;">�</span> AI/Tech</span>
        <span style="font-weight: 600; color: #1DA1F2;">${data.aiPercent}%</span>
      </div>
      <div style="background-color: var(--background-alt); height: 24px; border-radius: 4px; overflow: hidden;">
        <div style="background-color: #1DA1F2; height: 100%; width: ${data.aiPercent}%; transition: width 0.3s;"></div>
      </div>
      ${aiDrift > 0 ? `<div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">+${aiDrift} points from Week 0</div>` : ''}
    </div>

    <div style="margin: 1.5rem 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-weight: 600;"><span style="color: #17bf63;">�</span> Cooking</span>
        <span style="font-weight: 600; color: #17bf63;">${data.cookingPercent}%</span>
      </div>
      <div style="background-color: var(--background-alt); height: 24px; border-radius: 4px; overflow: hidden;">
        <div style="background-color: #17bf63; height: 100%; width: ${data.cookingPercent}%; transition: width 0.3s;"></div>
      </div>
      ${cookingDrift < 0 ? `<div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">${cookingDrift} points from Week 0</div>` : ''}
    </div>
  `;

  // Add interpretation
  if (week === 0) {
    stateHTML += `
      <div style="margin-top: 1.5rem; padding: 1rem; background-color: rgba(29, 161, 242, 0.1); border-left: 3px solid var(--primary-color);">
        <p style="margin: 0;"><strong>Starting point</strong>: Slightly unbalanced (60/40). This small imbalance will compound over time.</p>
      </div>
    `;
  } else if (week === 3 || week === 6 || week === 9 || week === 12) {
    stateHTML += `
      <div style="margin-top: 1.5rem; padding: 1rem; background-color: rgba(255, 107, 107, 0.1); border-left: 3px solid #ff6b6b;">
        <p style="margin: 0;"><strong>KnownFor update week</strong>: The underlying cluster structure recalculates. This creates a new baseline for the next 3 weeks of InterestedIn updates.</p>
      </div>
    `;
  } else if (week === 12) {
    stateHTML += `
      <div style="margin-top: 1.5rem; padding: 1rem; background-color: rgba(255, 107, 107, 0.1); border-left: 3px solid #ff6b6b;">
        <p style="margin: 0;"><strong>Result</strong>: Without changing your behavior, your feed drifted from 60/40 to ${data.aiPercent}/${data.cookingPercent}. This will continue toward 80/20, 90/10, eventually 100/0.</p>
      </div>
    `;
  }

  timelineState.innerHTML = stateHTML;
}

// End DOMContentLoaded
});

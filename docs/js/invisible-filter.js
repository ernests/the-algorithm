/**
 * The Invisible Filter - Cluster-based Feed Personalization
 *
 * Shows how the same tweets get ranked completely differently
 * for users with different cluster interests.
 *
 * Based on:
 * - Multiplicative scoring from ApproximateCosineSimilarity.scala:84-94
 * - InterestedIn cluster assignments from InterestedInFromKnownFor.scala
 * - L2 normalization (cluster weights sum to 1.0)
 */

// Tweet dataset with cluster assignments and base quality scores
const TWEETS = [
  {
    id: 1,
    cluster: 'ai',
    content: 'New breakthrough in transformer architecture - 10x faster training with same accuracy [technical thread]',
    author: '@ai_researcher',
    baseQuality: 0.88
  },
  {
    id: 2,
    cluster: 'ai',
    content: 'Just released our open-source ML framework for edge devices. Check it out! [link]',
    author: '@ml_startup',
    baseQuality: 0.75
  },
  {
    id: 3,
    cluster: 'ai',
    content: 'Fascinating paper on LLM reasoning capabilities. Thread on key findings ↓',
    author: '@phd_student',
    baseQuality: 0.82
  },
  {
    id: 4,
    cluster: 'ai',
    content: 'Hot take: Most "AI" products are just wrappers around OpenAI API',
    author: '@tech_critic',
    baseQuality: 0.65
  },
  {
    id: 5,
    cluster: 'ai',
    content: 'Hiring: Senior ML Engineer for our AI safety team. Must have experience with...',
    author: '@ai_company',
    baseQuality: 0.55
  },
  {
    id: 6,
    cluster: 'cooking',
    content: 'Made the perfect sourdough after 3 years of trying. Here\'s what finally worked [detailed guide]',
    author: '@bread_master',
    baseQuality: 0.86
  },
  {
    id: 7,
    cluster: 'cooking',
    content: 'PSA: You\'re probably overcooking your pasta. Al dente means "to the tooth" - here\'s the test...',
    author: '@italian_chef',
    baseQuality: 0.79
  },
  {
    id: 8,
    cluster: 'cooking',
    content: 'Unpopular opinion: Expensive knives are overrated. Here\'s my $30 knife that\'s lasted 10 years',
    author: '@home_cook',
    baseQuality: 0.71
  },
  {
    id: 9,
    cluster: 'cooking',
    content: 'Just meal prepped for the entire week in 2 hours. Here\'s my system: [photos]',
    author: '@meal_prep_pro',
    baseQuality: 0.68
  },
  {
    id: 10,
    cluster: 'cooking',
    content: 'The science of umami - why MSG is unfairly demonized (thread)',
    author: '@food_scientist',
    baseQuality: 0.77
  },
  {
    id: 11,
    cluster: 'politics',
    content: 'BREAKING: Major policy announcement expected this afternoon. Here\'s what we know so far...',
    author: '@political_reporter',
    baseQuality: 0.84
  },
  {
    id: 12,
    cluster: 'politics',
    content: 'Detailed analysis of yesterday\'s debate performance - fact-checking key claims [long thread]',
    author: '@policy_analyst',
    baseQuality: 0.80
  },
  {
    id: 13,
    cluster: 'politics',
    content: 'This is exactly what I\'ve been saying for months. Finally someone in power gets it.',
    author: '@political_commentator',
    baseQuality: 0.62
  },
  {
    id: 14,
    cluster: 'politics',
    content: 'New poll shows surprising shift in voter sentiment. Methodology breakdown in thread ↓',
    author: '@pollster',
    baseQuality: 0.76
  },
  {
    id: 15,
    cluster: 'politics',
    content: 'Both sides are missing the point on this issue. Here\'s the nuanced take no one wants to hear:',
    author: '@centrist_voice',
    baseQuality: 0.70
  }
];

// Friend profile presets
const FRIEND_PROFILES = {
  'politics-focused': { ai: 0.15, cooking: 0.05, politics: 0.80 },
  'cooking-enthusiast': { ai: 0.20, cooking: 0.75, politics: 0.05 },
  'balanced': { ai: 0.33, cooking: 0.33, politics: 0.34 },
  'tech-specialist': { ai: 0.90, cooking: 0.02, politics: 0.08 }
};

// Cluster display names and colors
const CLUSTER_INFO = {
  'ai': { name: 'AI/Tech', color: '#1DA1F2' },
  'cooking': { name: 'Cooking', color: '#17bf63' },
  'politics': { name: 'Politics', color: '#ff9500' }
};

// Current profiles
let userProfile = { ai: 0.60, cooking: 0.25, politics: 0.15 };
let friendProfile = { ai: 0.15, cooking: 0.05, politics: 0.80 };
let selectedFriend = 'politics-focused';

// DOM elements
const userAiSlider = document.getElementById('user-ai');
const userCookingSlider = document.getElementById('user-cooking');
const userPoliticsSlider = document.getElementById('user-politics');
const compareBtn = document.getElementById('compare-btn');
const comparisonContainer = document.getElementById('comparison-container');

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  initializeSliders();
  initializeFriendSelector();
  attachEventListeners();
});

/**
 * Initialize sliders with normalization
 */
function initializeSliders() {
  // Update displays
  updateUserDisplays();

  // Attach input handlers with normalization
  [userAiSlider, userCookingSlider, userPoliticsSlider].forEach(slider => {
    slider.addEventListener('input', () => {
      normalizeUserProfile();
      updateUserDisplays();
    });
  });
}

/**
 * Normalize user profile to sum to 100%
 * When one slider changes, adjust others proportionally
 */
function normalizeUserProfile() {
  const ai = parseInt(userAiSlider.value);
  const cooking = parseInt(userCookingSlider.value);
  const politics = parseInt(userPoliticsSlider.value);
  const total = ai + cooking + politics;

  if (total !== 100) {
    // Normalize to 100%
    const normAi = Math.round((ai / total) * 100);
    const normCooking = Math.round((cooking / total) * 100);
    const normPolitics = 100 - normAi - normCooking; // Ensure exact 100%

    userProfile = {
      ai: normAi / 100,
      cooking: normCooking / 100,
      politics: normPolitics / 100
    };
  } else {
    userProfile = {
      ai: ai / 100,
      cooking: cooking / 100,
      politics: politics / 100
    };
  }
}

/**
 * Update user profile displays
 */
function updateUserDisplays() {
  const aiPercent = Math.round(userProfile.ai * 100);
  const cookingPercent = Math.round(userProfile.cooking * 100);
  const politicsPercent = Math.round(userProfile.politics * 100);
  const total = aiPercent + cookingPercent + politicsPercent;

  document.getElementById('user-ai-display').textContent = `${aiPercent}%`;
  document.getElementById('user-cooking-display').textContent = `${cookingPercent}%`;
  document.getElementById('user-politics-display').textContent = `${politicsPercent}%`;
  document.getElementById('user-total').textContent = `${total}%`;

  // Update slider values
  userAiSlider.value = aiPercent;
  userCookingSlider.value = cookingPercent;
  userPoliticsSlider.value = politicsPercent;
}

/**
 * Initialize friend profile selector
 */
function initializeFriendSelector() {
  updateFriendDisplay();

  const friendBtns = document.querySelectorAll('.friend-btn');
  friendBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      friendBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Load profile
      const profileKey = btn.dataset.profile;
      selectedFriend = profileKey;
      friendProfile = FRIEND_PROFILES[profileKey];
      updateFriendDisplay();
    });
  });
}

/**
 * Update friend profile display
 */
function updateFriendDisplay() {
  const aiPercent = Math.round(friendProfile.ai * 100);
  const cookingPercent = Math.round(friendProfile.cooking * 100);
  const politicsPercent = Math.round(friendProfile.politics * 100);

  document.getElementById('friend-ai-display').textContent = `${aiPercent}%`;
  document.getElementById('friend-cooking-display').textContent = `${cookingPercent}%`;
  document.getElementById('friend-politics-display').textContent = `${politicsPercent}%`;
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  compareBtn.addEventListener('click', () => {
    generateComparison();
    comparisonContainer.style.display = 'block';
    comparisonContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // View toggle
  document.getElementById('view-user').addEventListener('click', () => {
    setActiveView('user');
  });

  document.getElementById('view-friend').addEventListener('click', () => {
    setActiveView('friend');
  });
}

// Current view state
let currentView = 'user';
let scoredData = null;

/**
 * Generate and display feed comparison
 */
function generateComparison() {
  // Score tweets for each user
  const userTweets = scoreTweets(userProfile);
  const friendTweets = scoreTweets(friendProfile);

  // Create rank maps
  const userRanks = {};
  const friendRanks = {};

  userTweets.forEach((tweet, index) => {
    userRanks[tweet.id] = {
      rank: index + 1,
      score: tweet.score
    };
  });

  friendTweets.forEach((tweet, index) => {
    friendRanks[tweet.id] = {
      rank: index + 1,
      score: tweet.score
    };
  });

  // Store for view toggling
  scoredData = {
    userTweets,
    friendTweets,
    userRanks,
    friendRanks
  };

  // Render initial view
  renderFeed();
}

/**
 * Set active view and re-render
 */
function setActiveView(view) {
  currentView = view;

  // Update button states
  document.getElementById('view-user').classList.toggle('active', view === 'user');
  document.getElementById('view-friend').classList.toggle('active', view === 'friend');

  // Re-render
  renderFeed();
}

/**
 * Score tweets based on profile
 * score = base_quality × cluster_interest
 */
function scoreTweets(profile) {
  return TWEETS.map(tweet => {
    const clusterInterest = profile[tweet.cluster];
    const score = tweet.baseQuality * clusterInterest;

    return {
      ...tweet,
      score: score
    };
  }).sort((a, b) => b.score - a.score); // Sort by score descending
}

/**
 * Render the feed based on current view
 */
function renderFeed() {
  if (!scoredData) return;

  const container = document.getElementById('tweet-feed');
  const tweets = currentView === 'user' ? scoredData.userTweets : scoredData.friendTweets;
  const { userRanks, friendRanks } = scoredData;

  container.innerHTML = tweets.map(tweet => {
    const userRank = userRanks[tweet.id].rank;
    const friendRank = friendRanks[tweet.id].rank;
    const userScore = userRanks[tweet.id].score;
    const friendScore = friendRanks[tweet.id].score;

    const rankDiff = Math.abs(userRank - friendRank);
    const clusterInfo = CLUSTER_INFO[tweet.cluster];

    // Highlight big differences
    const isDifferent = rankDiff >= 5;
    const diffClass = isDifferent ? 'rank-different' : '';

    return `
      <div class="tweet-card ${diffClass}">
        <div class="tweet-header">
          <div class="tweet-ranks">
            <div class="rank-badge ${currentView === 'user' ? 'primary' : 'secondary'}">
              <span class="rank-label">👤 You:</span>
              <span class="rank-number">#${userRank}</span>
            </div>
            <div class="rank-badge ${currentView === 'friend' ? 'primary' : 'secondary'}">
              <span class="rank-label">👥 Friend:</span>
              <span class="rank-number">#${friendRank}</span>
            </div>
            ${isDifferent ? `<span class="rank-diff">Δ${rankDiff}</span>` : ''}
          </div>
          <span class="tweet-cluster" style="color: ${clusterInfo.color};">
            ${clusterInfo.name}
          </span>
        </div>
        <div class="tweet-content">
          ${tweet.content}
        </div>
        <div class="tweet-author">${tweet.author}</div>
        <div class="tweet-score">
          <div class="score-breakdown">
            <span>Base Quality:</span>
            <span>${tweet.baseQuality.toFixed(2)}</span>
          </div>
          <div class="score-breakdown">
            <span>× Your ${clusterInfo.name} Interest (${(userProfile[tweet.cluster] * 100).toFixed(0)}%):</span>
            <span>= ${userScore.toFixed(3)}</span>
          </div>
          <div class="score-breakdown">
            <span>× Friend's ${clusterInfo.name} Interest (${(friendProfile[tweet.cluster] * 100).toFixed(0)}%):</span>
            <span>= ${friendScore.toFixed(3)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

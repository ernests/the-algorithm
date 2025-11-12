/**
 * Engagement Weight Calculator - Tweet Scoring Simulator
 *
 * Based on Twitter's algorithm code:
 * - Engagement weights from HomeGlobalParams.scala:788-930
 * - Scoring logic from NaviModelScorer.scala:139-178
 * - Heavy Ranker predictions from MaskNet architecture
 *
 * Code references:
 * - HomeGlobalParams.scala:788-930 (engagement weights)
 * - NaviModelScorer.scala:139-178 (weighted score computation)
 */

// Actual engagement weights from March 2023 code
// Source: home-mixer/server/src/main/scala/com/twitter/home_mixer/param/HomeGlobalParams.scala:788-930
const ENGAGEMENT_WEIGHTS = {
  'Reply with Author Engagement': 75.0,
  'Reply': 13.5,
  'Good Profile Click': 12.0,
  'Good Click': 11.0,
  'Video Playback 50%': 0.005,
  'Retweet': 1.0,
  'Favorite': 0.5,
  'Negative Feedback': -74.0,
  'Report': -369.0
};

// Engagement type keys (for consistent ordering)
const ENGAGEMENT_TYPES = Object.keys(ENGAGEMENT_WEIGHTS);

// Scenario definitions with realistic engagement probabilities
// Probabilities represent: "What % of users who see this tweet will engage this way?"
const SCENARIOS = {
  'educational-thread': {
    name: '📚 Educational Thread',
    description: 'How to build a neural network from scratch (10 tweet thread with code examples)',
    explanation: 'Educational content drives deep engagement. Users who learn something valuable are likely to reply with questions or engage with the author. High "good click" rate as users read the entire thread.',
    probabilities: {
      'Reply with Author Engagement': 3.0,  // People ask questions, author responds
      'Reply': 8.0,                          // High conversation
      'Good Profile Click': 6.0,             // Check out the author
      'Good Click': 28.0,                    // Read the whole thread
      'Video Playback 50%': 0.0,             // No video
      'Retweet': 5.0,                        // Share with followers
      'Favorite': 18.0,                      // Bookmark/like
      'Negative Feedback': 1.0,              // Very low
      'Report': 0.1                          // Minimal
    }
  },
  'breaking-news': {
    name: '📰 Breaking News',
    description: 'BREAKING: Major tech company announces layoffs. Thread with details ↓',
    explanation: 'Breaking news drives extremely high engagement across all types. People want to discuss, share, and learn more. Profile clicks as people check if source is credible.',
    probabilities: {
      'Reply with Author Engagement': 2.0,
      'Reply': 15.0,                         // High discussion
      'Good Profile Click': 10.0,            // Check credibility
      'Good Click': 35.0,                    // Read full thread
      'Video Playback 50%': 0.0,
      'Retweet': 18.0,                       // High shares
      'Favorite': 25.0,                      // Many likes
      'Negative Feedback': 2.0,              // Some don't care
      'Report': 0.2
    }
  },
  'useful-resource': {
    name: '🔧 Useful Resource',
    description: 'I\'ve compiled 100 free resources for learning data science: [link]',
    explanation: 'Resource lists drive clicks (people visit the link), retweets (share with others), and bookmarks (save for later). Lower reply rate because there\'s less to discuss.',
    probabilities: {
      'Reply with Author Engagement': 1.0,
      'Reply': 3.0,                          // Low conversation
      'Good Profile Click': 4.0,
      'Good Click': 32.0,                    // Click the link!
      'Video Playback 50%': 0.0,
      'Retweet': 12.0,                       // Share the resource
      'Favorite': 28.0,                      // Bookmark/like
      'Negative Feedback': 1.5,
      'Report': 0.2
    }
  },
  'wholesome': {
    name: '❤️ Wholesome Content',
    description: 'My daughter just wrote her first line of code. So proud! [cute photo]',
    explanation: 'Wholesome content gets LOTS of likes (feel-good engagement) but very few replies (what is there to say?). This is the "Favorites Paradox" in action - high engagement but low algorithmic value.',
    probabilities: {
      'Reply with Author Engagement': 0.3,
      'Reply': 2.0,                          // "Congrats!" replies
      'Good Profile Click': 1.0,
      'Good Click': 8.0,                     // Look at photo
      'Video Playback 50%': 0.0,
      'Retweet': 3.0,
      'Favorite': 42.0,                      // TONS of likes!
      'Negative Feedback': 0.5,              // Very positive
      'Report': 0.05
    }
  },
  'viral-meme': {
    name: '😂 Viral Meme',
    description: 'me: I\'ll just check Twitter for 5 minutes [4 hours later meme]',
    explanation: 'Viral memes get massive passive engagement (likes, retweets) but relatively low conversation. The algorithm values this less than educational threads despite higher total engagement!',
    probabilities: {
      'Reply with Author Engagement': 0.2,
      'Reply': 4.0,                          // Some funny responses
      'Good Profile Click': 2.0,
      'Good Click': 15.0,                    // View the meme
      'Video Playback 50%': 0.0,
      'Retweet': 15.0,                       // High sharing
      'Favorite': 45.0,                      // VERY high likes
      'Negative Feedback': 1.0,
      'Report': 0.1
    }
  },
  'personal-story': {
    name: '💭 Personal Story',
    description: 'Thread about my journey from bootcamp to senior engineer (authentic, relatable)',
    explanation: 'Authentic stories drive balanced engagement. People relate, engage meaningfully, and sometimes have conversations with the author.',
    probabilities: {
      'Reply with Author Engagement': 2.5,   // Author engages with supporters
      'Reply': 7.0,
      'Good Profile Click': 8.0,             // Check out their profile
      'Good Click': 25.0,                    // Read the story
      'Video Playback 50%': 0.0,
      'Retweet': 6.0,
      'Favorite': 20.0,
      'Negative Feedback': 1.2,
      'Report': 0.1
    }
  },
  'hot-take': {
    name: '🔥 Hot Take',
    description: 'Unpopular opinion: [controversial tech opinion that sparks debate]',
    explanation: 'Controversial takes drive HIGH reply rates (people want to argue) but also significant negative feedback. May score negatively overall despite high engagement!',
    probabilities: {
      'Reply with Author Engagement': 0.8,
      'Reply': 22.0,                         // LOTS of debate
      'Good Profile Click': 3.0,
      'Good Click': 8.0,
      'Video Playback 50%': 0.0,
      'Retweet': 5.0,                        // Some people share
      'Favorite': 8.0,                       // Low agreement
      'Negative Feedback': 14.0,             // Many click "not interested"!
      'Report': 1.5                          // Some reports
    }
  },
  'quote-dunk': {
    name: '💢 Quote Tweet Dunk',
    description: 'lmao imagine actually believing this [quote tweets bad take]',
    explanation: 'Dunking drives engagement but creates negative experiences. High replies (people join the pile-on) but also high negative feedback (many find it toxic).',
    probabilities: {
      'Reply with Author Engagement': 1.0,
      'Reply': 18.0,                         // Pile-on replies
      'Good Profile Click': 4.0,             // See the drama
      'Good Click': 12.0,
      'Video Playback 50%': 0.0,
      'Retweet': 8.0,                        // Share the dunk
      'Favorite': 15.0,                      // Agree with dunk
      'Negative Feedback': 12.0,             // Many hide this
      'Report': 2.0                          // Harassment reports
    }
  },
  'engagement-bait': {
    name: '🎣 Engagement Bait',
    description: 'Drop a 🔥 if you agree! Follow me for more content like this! #engagement',
    explanation: 'Obvious engagement bait gets moderate replies but VERY high negative feedback. Users hate this type of content. Despite replies, usually scores negative!',
    probabilities: {
      'Reply with Author Engagement': 0.3,
      'Reply': 8.0,                          // Some engagement
      'Good Profile Click': 1.0,
      'Good Click': 3.0,
      'Video Playback 50%': 0.0,
      'Retweet': 2.0,
      'Favorite': 5.0,
      'Negative Feedback': 18.0,             // Users HATE this!
      'Report': 3.0                          // Spam reports
    }
  },
  'spam': {
    name: '🚫 Spam/Low Quality',
    description: 'CHECK OUT MY CRYPTO COURSE!!! 🚀💰 LINK IN BIO [generic spam]',
    explanation: 'Spam gets almost no positive engagement and very high negative signals. Heavily suppressed by the algorithm.',
    probabilities: {
      'Reply with Author Engagement': 0.0,
      'Reply': 0.5,                          // Almost nothing
      'Good Profile Click': 0.2,
      'Good Click': 1.0,
      'Video Playback 50%': 0.0,
      'Retweet': 0.1,
      'Favorite': 0.3,
      'Negative Feedback': 25.0,             // VERY high
      'Report': 8.0                          // Lots of reports
    }
  },
  'reply-guy': {
    name: '😬 Reply Guy',
    description: 'Actually, [unsolicited correction on someone\'s casual tweet]',
    explanation: 'Unsolicited corrections get low engagement and moderate negative feedback. People don\'t like being corrected on casual tweets.',
    probabilities: {
      'Reply with Author Engagement': 0.2,
      'Reply': 3.0,                          // Some arguments
      'Good Profile Click': 1.0,
      'Good Click': 2.0,
      'Video Playback 50%': 0.0,
      'Retweet': 0.5,
      'Favorite': 2.0,
      'Negative Feedback': 8.0,              // Annoying
      'Report': 0.8
    }
  },
  'algorithm-hack': {
    name: '🤖 Algorithm Gaming',
    description: 'Agree or disagree? Comment below! ⬇️ [intentionally vague to drive replies]',
    explanation: 'Attempts to game the algorithm with vague engagement prompts. Gets replies but also significant negative feedback from savvy users.',
    probabilities: {
      'Reply with Author Engagement': 0.5,
      'Reply': 12.0,                         // Gets replies
      'Good Profile Click': 1.5,
      'Good Click': 4.0,
      'Video Playback 50%': 0.0,
      'Retweet': 2.0,
      'Favorite': 6.0,
      'Negative Feedback': 10.0,             // Users recognize the tactic
      'Report': 1.5
    }
  }
};

// Chart instances
let weightsChart = null;
let contributionChart = null;

// Currently selected scenario
let selectedScenario = null;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  renderWeightsChart();
  attachScenarioHandlers();
});

/**
 * Attach click handlers to scenario cards
 */
function attachScenarioHandlers() {
  const cards = document.querySelectorAll('.scenario-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const scenarioKey = card.dataset.scenario;
      selectScenario(scenarioKey);
    });
  });
}

/**
 * Select and display a scenario
 */
function selectScenario(scenarioKey) {
  const scenario = SCENARIOS[scenarioKey];
  if (!scenario) return;

  selectedScenario = scenarioKey;

  // Update visual selection
  document.querySelectorAll('.scenario-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.querySelector(`[data-scenario="${scenarioKey}"]`).classList.add('selected');

  // Calculate and display
  calculateScenario(scenario);

  // Scroll to results
  document.getElementById('results-container').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

/**
 * Calculate score for a scenario
 */
function calculateScenario(scenario) {
  let totalScore = 0;
  const contributions = {};

  // Calculate contributions
  ENGAGEMENT_TYPES.forEach(type => {
    const probability = scenario.probabilities[type];
    const weight = ENGAGEMENT_WEIGHTS[type];
    const contribution = (probability / 100) * weight;
    contributions[type] = contribution;
    totalScore += contribution;
  });

  // Display results
  displayResults(totalScore, scenario, contributions);
}

/**
 * Render the engagement weights bar chart
 */
function renderWeightsChart() {
  const ctx = document.getElementById('weights-chart').getContext('2d');

  const labels = Object.keys(ENGAGEMENT_WEIGHTS);
  const data = Object.values(ENGAGEMENT_WEIGHTS);
  const colors = data.map(value => {
    if (value >= 10) return '#17bf63'; // High positive - green
    if (value > 0) return '#1DA1F2'; // Low positive - blue
    if (value > -100) return '#ff9500'; // Moderate negative - orange
    return '#ff6b6b'; // Severe negative - red
  });

  weightsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Engagement Weight',
        data: data,
        backgroundColor: colors,
        borderColor: colors.map(c => c),
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: 'Engagement Type Weights (March 2023)',
          font: {
            size: 16,
            weight: 'bold',
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          color: '#1a1a1a',
          padding: 20
        },
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 14,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          bodyFont: {
            size: 13,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          padding: 12,
          callbacks: {
            label: function(context) {
              const value = context.parsed.x;
              return `Weight: ${value.toFixed(1)}`;
            },
            afterLabel: function(context) {
              const value = context.parsed.x;
              if (value === 75.0) return 'Highest value - conversation!';
              if (value === 0.5) return 'Lowest positive - passive';
              if (value === -369.0) return 'Nuclear penalty!';
              if (value < 0) return 'Negative signal';
              return 'Positive signal';
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Weight',
            font: {
              size: 14,
              weight: 'bold',
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            color: '#1a1a1a'
          },
          ticks: {
            font: {
              size: 12,
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            color: '#6b6b6b'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          ticks: {
            font: {
              size: 12,
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            color: '#6b6b6b'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Display calculation results
 */
function displayResults(totalScore, scenario, contributions) {
  const resultsContainer = document.getElementById('results-container');
  resultsContainer.style.display = 'block';

  // Update total score
  const scoreElement = document.getElementById('total-score');
  scoreElement.textContent = totalScore.toFixed(2);
  scoreElement.style.color = totalScore > 0 ? 'var(--success)' : 'var(--warning)';

  // Score interpretation
  const interpretation = document.getElementById('score-interpretation');
  interpretation.innerHTML = getScoreInterpretation(totalScore, scenario);

  // Render contribution chart
  renderContributionChart(contributions);

  // Render breakdown table
  renderBreakdownTable(scenario.probabilities, contributions, totalScore);
}

/**
 * Get human-readable interpretation of score
 */
function getScoreInterpretation(score, scenario) {
  let statusHTML = '';

  if (score > 5) {
    statusHTML = `<h4 style="margin-top: 0; color: var(--success);">Excellent Score - High Amplification</h4>`;
  } else if (score > 2) {
    statusHTML = `<h4 style="margin-top: 0; color: var(--success);">Good Score - Moderate Amplification</h4>`;
  } else if (score > 0) {
    statusHTML = `<h4 style="margin-top: 0; color: var(--info);">Positive Score - Limited Amplification</h4>`;
  } else if (score > -2) {
    statusHTML = `<h4 style="margin-top: 0; color: var(--warning);">Slightly Negative - Suppressed</h4>`;
  } else {
    statusHTML = `<h4 style="margin-top: 0; color: var(--warning);">Highly Negative - Heavily Suppressed</h4>`;
  }

  return `
    ${statusHTML}
    <p style="font-size: 1.1rem; margin: 1rem 0;"><strong>${scenario.name}</strong></p>
    <p style="font-style: italic; color: var(--text-secondary);">"${scenario.description}"</p>
    <p style="margin-top: 1.5rem;"><strong>Why this score:</strong> ${scenario.explanation}</p>
  `;
}

/**
 * Render contribution breakdown chart
 */
function renderContributionChart(contributions) {
  const ctx = document.getElementById('contribution-chart').getContext('2d');

  // Destroy existing chart
  if (contributionChart) {
    contributionChart.destroy();
  }

  // Prepare data - only show non-zero contributions
  const entries = Object.entries(contributions)
    .filter(([_, value]) => Math.abs(value) > 0.001)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

  const labels = entries.map(([type, _]) => type);
  const data = entries.map(([_, value]) => value);
  const colors = data.map(value => {
    if (value >= 1) return '#17bf63'; // High positive
    if (value > 0) return '#1DA1F2'; // Low positive
    return '#ff6b6b'; // Negative
  });

  contributionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Contribution to Score',
        data: data,
        backgroundColor: colors,
        borderColor: colors.map(c => c),
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: 'Score Contribution by Engagement Type',
          font: {
            size: 16,
            weight: 'bold',
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          color: '#1a1a1a',
          padding: 20
        },
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 14,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          bodyFont: {
            size: 13,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          padding: 12,
          callbacks: {
            label: function(context) {
              const value = context.parsed.x;
              return `Contribution: ${value.toFixed(3)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Contribution to Total Score',
            font: {
              size: 14,
              weight: 'bold',
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            color: '#1a1a1a'
          },
          ticks: {
            font: {
              size: 12,
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            color: '#6b6b6b'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          ticks: {
            font: {
              size: 12,
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            color: '#6b6b6b'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Render breakdown table
 */
function renderBreakdownTable(probabilities, contributions, totalScore) {
  const tbody = document.getElementById('breakdown-tbody');

  tbody.innerHTML = ENGAGEMENT_TYPES
    .map(type => {
      const probability = probabilities[type];
      const weight = ENGAGEMENT_WEIGHTS[type];
      const contribution = contributions[type];

      // Skip if no probability
      if (probability === 0) return '';

      const contributionColor = contribution > 0 ? 'var(--success)' : 'var(--warning)';

      return `
        <tr>
          <td>${type}</td>
          <td>${probability.toFixed(1)}%</td>
          <td>${weight.toFixed(1)}</td>
          <td style="color: ${contributionColor}; font-weight: 600;">
            ${contribution >= 0 ? '+' : ''}${contribution.toFixed(3)}
          </td>
        </tr>
      `;
    })
    .filter(row => row !== '')
    .join('');

  // Update total
  const totalColor = totalScore > 0 ? 'var(--success)' : 'var(--warning)';
  document.getElementById('breakdown-total').innerHTML = `
    <span style="color: ${totalColor}; font-weight: 700; font-size: 1.1em;">
      ${totalScore >= 0 ? '+' : ''}${totalScore.toFixed(3)}
    </span>
  `;
}

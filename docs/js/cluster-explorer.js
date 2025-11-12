/**
 * Cluster Explorer - Calculate Your Algorithmic Communities
 *
 * Based on Twitter's SimClusters algorithm:
 * - InterestedIn = EngagementGraph × KnownFor
 * - Default type: FavBasedUserInterestedIn (engagement-based)
 * - 100-day half-life for engagement decay
 * - L2 normalization (cluster weights sum to 1.0)
 * - Weekly batch updates
 *
 * Code references:
 * - InterestedInFromKnownFor.scala:292 (favScore calculation)
 * - SimClustersEmbeddingId.scala:46 (default type)
 * - SimClustersEmbedding.scala:59-72 (L2 normalization)
 */

// DOM elements
const profileSelect = document.getElementById('profile-select');
const customSelection = document.getElementById('custom-selection');
const producerCheckboxes = document.querySelectorAll('.producer-checkbox');
const aiEngagement = document.getElementById('ai-engagement');
const cookingEngagement = document.getElementById('cooking-engagement');
const politicsEngagement = document.getElementById('politics-engagement');
const aiWeightDisplay = document.getElementById('ai-weight-display');
const cookingWeightDisplay = document.getElementById('cooking-weight-display');
const politicsWeightDisplay = document.getElementById('politics-weight-display');
const calculateBtn = document.getElementById('calculate-btn');
const resultsContainer = document.getElementById('results-container');
const interpretation = document.getElementById('interpretation');
const comparisonBody = document.getElementById('comparison-body');
const warnings = document.getElementById('warnings');

// Chart instance
let clusterChart = null;

// Preset profiles
const PROFILES = {
  balanced: {
    follows: { ai: 4, cooking: 4, politics: 4 },
    engagement: { ai: 50, cooking: 50, politics: 50 }
  },
  tech: {
    follows: { ai: 9, cooking: 2, politics: 1 },
    engagement: { ai: 150, cooking: 30, politics: 20 }
  },
  politics: {
    follows: { ai: 2, cooking: 1, politics: 9 },
    engagement: { ai: 30, cooking: 10, politics: 160 }
  },
  cooking: {
    follows: { ai: 2, cooking: 9, politics: 1 },
    engagement: { ai: 40, cooking: 150, politics: 10 }
  }
};

// Initialize
updateEngagementDisplays();

// Event listeners
profileSelect.addEventListener('change', handleProfileChange);
aiEngagement.addEventListener('input', updateEngagementDisplays);
cookingEngagement.addEventListener('input', updateEngagementDisplays);
politicsEngagement.addEventListener('input', updateEngagementDisplays);
calculateBtn.addEventListener('click', calculateClusters);

/**
 * Handle profile selection
 */
function handleProfileChange() {
  const profile = profileSelect.value;

  if (profile === 'custom') {
    customSelection.style.display = 'block';
    return;
  }

  // Load preset profile
  customSelection.style.display = 'block';
  const preset = PROFILES[profile];

  // Set checkboxes
  producerCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
  });

  // Check appropriate number of boxes per cluster
  let aiChecked = 0, cookingChecked = 0, politicsChecked = 0;
  producerCheckboxes.forEach(checkbox => {
    const cluster = checkbox.dataset.cluster;
    if (cluster === 'ai' && aiChecked < preset.follows.ai) {
      checkbox.checked = true;
      aiChecked++;
    } else if (cluster === 'cooking' && cookingChecked < preset.follows.cooking) {
      checkbox.checked = true;
      cookingChecked++;
    } else if (cluster === 'politics' && politicsChecked < preset.follows.politics) {
      checkbox.checked = true;
      politicsChecked++;
    }
  });

  // Set engagement sliders
  aiEngagement.value = preset.engagement.ai;
  cookingEngagement.value = preset.engagement.cooking;
  politicsEngagement.value = preset.engagement.politics;
  updateEngagementDisplays();
}

/**
 * Update engagement weight displays
 */
function updateEngagementDisplays() {
  aiWeightDisplay.textContent = aiEngagement.value;
  cookingWeightDisplay.textContent = cookingEngagement.value;
  politicsWeightDisplay.textContent = politicsEngagement.value;
}

/**
 * Calculate cluster assignment
 */
function calculateClusters() {
  // Count follows per cluster
  const follows = { ai: 0, cooking: 0, politics: 0 };
  producerCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      follows[checkbox.dataset.cluster]++;
    }
  });

  // Get engagement weights
  const engagement = {
    ai: parseInt(aiEngagement.value),
    cooking: parseInt(cookingEngagement.value),
    politics: parseInt(politicsEngagement.value)
  };

  // Calculate InterestedIn
  const result = calculateInterestedIn(follows, engagement);

  // Display results
  displayResults(result);

  // Scroll to results
  resultsContainer.style.display = 'block';
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Calculate InterestedIn using simplified matrix multiplication
 *
 * InterestedIn = EngagementGraph × KnownFor
 *
 * Simplified model:
 * - Follows contribute base weight (starting point)
 * - Engagement contributes weighted score (dominates over time)
 * - L2 normalize to sum to 1.0
 */
function calculateInterestedIn(follows, engagement) {
  // Step 1: Calculate from follows (base weight)
  const fromFollows = {
    ai: follows.ai * 10,      // Each follow = 10 base weight
    cooking: follows.cooking * 10,
    politics: follows.politics * 10
  };

  // Step 2: Add engagement (with 100-day half-life, current engagement = full weight)
  // Engagement weight is MUCH higher (this is the key!)
  const fromEngagement = {
    ai: engagement.ai * 5,     // Engagement weighted 5x per engagement
    cooking: engagement.cooking * 5,
    politics: engagement.politics * 5
  };

  // Step 3: Combine
  let clusters = {
    ai: fromFollows.ai + fromEngagement.ai,
    cooking: fromFollows.cooking + fromEngagement.cooking,
    politics: fromFollows.politics + fromEngagement.politics
  };

  // Step 4: L2 normalization (sum to 1.0)
  const total = clusters.ai + clusters.cooking + clusters.politics;

  if (total === 0) {
    // No follows or engagement - equal distribution
    clusters = { ai: 0.33, cooking: 0.33, politics: 0.34 };
  } else {
    clusters.ai /= total;
    clusters.cooking /= total;
    clusters.politics /= total;
  }

  return {
    clusters,
    fromFollows,
    fromEngagement
  };
}

/**
 * Display results with Chart.js
 */
function displayResults(result) {
  const { clusters, fromFollows, fromEngagement } = result;

  // Destroy existing chart
  if (clusterChart) {
    clusterChart.destroy();
  }

  // Create bar chart
  const ctx = document.getElementById('cluster-chart').getContext('2d');
  clusterChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['AI/Tech', 'Cooking', 'Politics'],
      datasets: [{
        label: 'Your Cluster Interest (%)',
        data: [
          (clusters.ai * 100).toFixed(1),
          (clusters.cooking * 100).toFixed(1),
          (clusters.politics * 100).toFixed(1)
        ],
        backgroundColor: ['#1DA1F2', '#17bf63', '#ff9500'],
        borderWidth: 2,
        borderColor: '#192734'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.y.toFixed(1) + '%';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });

  // Generate interpretation
  generateInterpretation(clusters);

  // Generate comparison table
  generateComparisonTable(fromFollows, fromEngagement, clusters);

  // Generate warnings
  generateWarnings(clusters, fromFollows, fromEngagement);
}

/**
 * Generate interpretation text
 */
function generateInterpretation(clusters) {
  // Find dominant cluster
  const sorted = Object.entries(clusters)
    .sort((a, b) => b[1] - a[1]);

  const dominant = sorted[0];
  const dominantName = formatClusterName(dominant[0]);
  const dominantPercent = (dominant[1] * 100).toFixed(0);

  const second = sorted[1];
  const secondName = formatClusterName(second[0]);
  const secondPercent = (second[1] * 100).toFixed(0);

  let html = '<div class="callout">';

  if (dominant[1] > 0.7) {
    html += `<p style="font-size: 1.1rem;"><strong>Heavily concentrated</strong>: You're ${dominantPercent}% ${dominantName}. This cluster will dominate your For You feed.</p>`;
    html += `<p style="margin-top: 1rem;">Roughly <strong>${dominantPercent}% of your feed</strong> will be ${dominantName} content. ${secondName} (${secondPercent}%) will be much less visible.</p>`;
  } else if (dominant[1] > 0.5) {
    html += `<p style="font-size: 1.1rem;"><strong>Moderately concentrated</strong>: You're ${dominantPercent}% ${dominantName}, ${secondPercent}% ${secondName}.</p>`;
    html += `<p style="margin-top: 1rem;">Your feed will be roughly <strong>${dominantPercent}% ${dominantName}</strong> and <strong>${secondPercent}% ${secondName}</strong>. The smaller cluster may drop below the threshold over time due to multiplicative scoring.</p>`;
  } else {
    html += `<p style="font-size: 1.1rem;"><strong>Relatively balanced</strong>: Your top cluster is ${dominantPercent}% ${dominantName}.</p>`;
    html += `<p style="margin-top: 1rem;">Your feed will be fairly diverse, but expect drift toward ${dominantName} over time due to multiplicative scoring (gravitational pull effect).</p>`;
  }

  html += '</div>';
  interpretation.innerHTML = html;
}

/**
 * Generate comparison table
 */
function generateComparisonTable(fromFollows, fromEngagement, clusters) {
  // Calculate percentages from follows only
  const totalFollows = fromFollows.ai + fromFollows.cooking + fromFollows.politics;
  const followsPercent = {
    ai: totalFollows > 0 ? (fromFollows.ai / totalFollows * 100).toFixed(0) : 0,
    cooking: totalFollows > 0 ? (fromFollows.cooking / totalFollows * 100).toFixed(0) : 0,
    politics: totalFollows > 0 ? (fromFollows.politics / totalFollows * 100).toFixed(0) : 0
  };

  // Calculate percentages from engagement only
  const totalEngagement = fromEngagement.ai + fromEngagement.cooking + fromEngagement.politics;
  const engagementPercent = {
    ai: totalEngagement > 0 ? (fromEngagement.ai / totalEngagement * 100).toFixed(0) : 0,
    cooking: totalEngagement > 0 ? (fromEngagement.cooking / totalEngagement * 100).toFixed(0) : 0,
    politics: totalEngagement > 0 ? (fromEngagement.politics / totalEngagement * 100).toFixed(0) : 0
  };

  const finalPercent = {
    ai: (clusters.ai * 100).toFixed(0),
    cooking: (clusters.cooking * 100).toFixed(0),
    politics: (clusters.politics * 100).toFixed(0)
  };

  const html = `
    <tr>
      <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);"><span style="color: #1DA1F2;">■</span> AI/Tech</td>
      <td style="padding: 0.75rem; text-align: right; border-bottom: 1px solid var(--border-color);">${followsPercent.ai}%</td>
      <td style="padding: 0.75rem; text-align: right; border-bottom: 1px solid var(--border-color);">${engagementPercent.ai}%</td>
      <td style="padding: 0.75rem; text-align: right; border-bottom: 1px solid var(--border-color); font-weight: 600; color: #1DA1F2;">${finalPercent.ai}%</td>
    </tr>
    <tr>
      <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);"><span style="color: #17bf63;">■</span> Cooking</td>
      <td style="padding: 0.75rem; text-align: right; border-bottom: 1px solid var(--border-color);">${followsPercent.cooking}%</td>
      <td style="padding: 0.75rem; text-align: right; border-bottom: 1px solid var(--border-color);">${engagementPercent.cooking}%</td>
      <td style="padding: 0.75rem; text-align: right; border-bottom: 1px solid var(--border-color); font-weight: 600; color: #17bf63;">${finalPercent.cooking}%</td>
    </tr>
    <tr>
      <td style="padding: 0.75rem;"><span style="color: #ff9500;">■</span> Politics</td>
      <td style="padding: 0.75rem; text-align: right;">${followsPercent.politics}%</td>
      <td style="padding: 0.75rem; text-align: right;">${engagementPercent.politics}%</td>
      <td style="padding: 0.75rem; text-align: right; font-weight: 600; color: #ff9500;">${finalPercent.politics}%</td>
    </tr>
  `;

  comparisonBody.innerHTML = html;
}

/**
 * Generate warnings
 */
function generateWarnings(clusters, fromFollows, fromEngagement) {
  const warningsHtml = [];

  // Check for threshold danger
  const sorted = Object.entries(clusters).sort((a, b) => b[1] - a[1]);
  const weakest = sorted[2];

  if (weakest[1] < 0.1) {
    const weakestName = formatClusterName(weakest[0]);
    const weakestPercent = (weakest[1] * 100).toFixed(1);
    warningsHtml.push(`
      <div class="callout warning">
        <h3 style="margin-top: 0;">⚠️ Threshold Danger</h3>
        <p><strong>${weakestName} (${weakestPercent}%)</strong> is approaching the algorithm's threshold. If it drops below ~7%, it may be filtered out entirely from your feed.</p>
        <p style="margin-top: 1rem;">To maintain diversity, you need to actively engage with ${weakestName} content to keep this cluster above the threshold.</p>
      </div>
    `);
  }

  // Check for engagement vs follows mismatch
  const totalFollows = fromFollows.ai + fromFollows.cooking + fromFollows.politics;
  const totalEngagement = fromEngagement.ai + fromEngagement.cooking + fromEngagement.politics;

  if (totalEngagement > totalFollows * 2) {
    warningsHtml.push(`
      <div class="callout">
        <h3 style="margin-top: 0;">💡 Engagement Dominates</h3>
        <p>Your engagement history is strongly influencing your clusters (${(totalEngagement / (totalFollows + totalEngagement) * 100).toFixed(0)}% of the signal).</p>
        <p style="margin-top: 1rem;">This is normal! Engagement with a 100-day half-life dominates over follows for active users. Your clusters reflect <strong>what you actually engage with</strong>, not just who you follow.</p>
      </div>
    `);
  } else if (totalFollows > totalEngagement * 2) {
    warningsHtml.push(`
      <div class="callout">
        <h3 style="margin-top: 0;">📊 Follows Dominate (For Now)</h3>
        <p>Your follows are the primary signal (${(totalFollows / (totalFollows + totalEngagement) * 100).toFixed(0)}% of the calculation).</p>
        <p style="margin-top: 1rem;">This suggests you're either a new account or a light user. As you engage more, your engagement history will start dominating. Within a few weeks of active use, engagement will override your follow choices.</p>
      </div>
    `);
  }

  warnings.innerHTML = warningsHtml.join('');
}

/**
 * Format cluster name for display
 */
function formatClusterName(cluster) {
  const names = {
    ai: 'AI/Tech',
    cooking: 'Cooking',
    politics: 'Politics'
  };
  return names[cluster] || cluster;
}

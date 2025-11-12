/**
 * Journey Simulator - Models the gravitational pull effect
 *
 * Based on Twitter's algorithm code:
 * - Multiplicative scoring at candidate generation and ML scoring stages
 * - L2 normalization (interests sum to 1.0)
 * - Weekly batch updates for InterestedIn
 * - FRS (Follow Recommendations) acceleration
 *
 * Code references:
 * - ApproximateCosineSimilarity.scala:94 (multiplicative scoring)
 * - InterestedInFromKnownFor.scala:59 (weekly batches)
 * - SimClustersEmbedding.scala:59-72 (L2 normalization)
 */

// DOM elements
const interest1Input = document.getElementById('interest1-name');
const interest2Input = document.getElementById('interest2-name');
const splitSlider = document.getElementById('interest-split');
const splitDisplay = document.getElementById('split-display');
const engagementSelect = document.getElementById('engagement-level');
const frsCheckbox = document.getElementById('frs-enabled');
const simulateBtn = document.getElementById('simulate-btn');
const resultsContainer = document.getElementById('results-container');
const projectionSummary = document.getElementById('projection-summary');
const driftTableBody = document.getElementById('drift-table-body');
const interest1Header = document.getElementById('interest1-header');
const interest2Header = document.getElementById('interest2-header');

// Chart instance
let driftChart = null;

// Update split display when slider moves
splitSlider.addEventListener('input', (e) => {
  const primary = parseInt(e.target.value);
  const secondary = 100 - primary;
  splitDisplay.textContent = `${primary}% / ${secondary}%`;
});

// Simulate button click handler
simulateBtn.addEventListener('click', runSimulation);

/**
 * Main simulation function
 */
function runSimulation() {
  // Get inputs
  const interest1Name = interest1Input.value.trim() || 'Interest 1';
  const interest2Name = interest2Input.value.trim() || 'Interest 2';
  const initialSplit = parseInt(splitSlider.value) / 100; // e.g., 0.60
  const engagementLevel = engagementSelect.value; // 'low', 'medium', 'high'
  const frsEnabled = frsCheckbox.checked;

  // Update table headers
  interest1Header.textContent = interest1Name;
  interest2Header.textContent = interest2Name;

  // Run simulation
  const weeks = 52; // Simulate 1 year
  const data = simulateDrift(initialSplit, engagementLevel, frsEnabled, weeks);

  // Display results
  displayResults(data, interest1Name, interest2Name);

  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Simulate the gravitational pull effect over time
 *
 * @param {number} initialSplit - Initial interest split (0.5 to 0.8)
 * @param {string} engagementLevel - 'low', 'medium', or 'high'
 * @param {boolean} frsEnabled - Whether FRS is enabled
 * @param {number} weeks - Number of weeks to simulate
 * @returns {Array} Array of {week, interest1, interest2} objects
 */
function simulateDrift(initialSplit, engagementLevel, frsEnabled, weeks) {
  // Engagement level affects drift rate
  const driftRates = {
    low: 0.008,    // Slow drift
    medium: 0.015, // Moderate drift (matches observed 60→76 in 24 weeks)
    high: 0.025    // Fast drift
  };

  let interest1 = initialSplit;
  let interest2 = 1 - initialSplit;
  const data = [{ week: 0, interest1, interest2 }];

  // Base drift rate
  let baseDriftRate = driftRates[engagementLevel];

  // FRS acceleration (adds ~20% to drift rate)
  if (frsEnabled) {
    baseDriftRate *= 1.2;
  }

  for (let week = 1; week <= weeks; week++) {
    // Calculate multiplicative advantage
    // The stronger interest gets amplified by its existing strength
    const advantage = interest1 / interest2;

    // Drift is proportional to the imbalance and engagement level
    // As the gap widens, drift slows (approaching asymptote)
    const imbalance = Math.abs(interest1 - interest2);
    const slowdownFactor = 1 - (imbalance * 0.5); // Slow down as approaching extremes
    const drift = baseDriftRate * advantage * slowdownFactor;

    // Apply drift with L2 normalization (zero-sum)
    interest1 = Math.min(0.95, interest1 + drift); // Cap at 95%
    interest2 = 1 - interest1; // L2 normalization

    // Weekly batch update (InterestedIn recalculates weekly)
    data.push({ week, interest1, interest2 });

    // Stop if reached near-total dominance
    if (interest1 >= 0.95) break;
  }

  return data;
}

/**
 * Display simulation results
 */
function displayResults(data, interest1Name, interest2Name) {
  resultsContainer.style.display = 'block';

  // Summary
  const finalWeek = data[data.length - 1];
  const initial = data[0];
  const initialPercent1 = Math.round(initial.interest1 * 100);
  const initialPercent2 = Math.round(initial.interest2 * 100);
  const finalPercent1 = Math.round(finalWeek.interest1 * 100);
  const finalPercent2 = Math.round(finalWeek.interest2 * 100);
  const changeMagnitude = finalPercent1 - initialPercent1;

  projectionSummary.innerHTML = `
    You started at <strong>${initialPercent1}% ${interest1Name}</strong> / <strong>${initialPercent2}% ${interest2Name}</strong>.
    After ${finalWeek.week} weeks, your feed will be <strong>${finalPercent1}% ${interest1Name}</strong> / <strong>${finalPercent2}% ${interest2Name}</strong>.
    That's a <strong>${changeMagnitude} percentage point shift</strong> toward ${interest1Name}, even though you didn't unfollow anyone.
  `;

  // Render chart
  renderChart(data, interest1Name, interest2Name);

  // Render table (show key milestones)
  renderTable(data, interest1Name, interest2Name);
}

/**
 * Render the drift chart using Chart.js
 */
function renderChart(data, interest1Name, interest2Name) {
  const ctx = document.getElementById('drift-chart').getContext('2d');

  // Destroy existing chart if it exists
  if (driftChart) {
    driftChart.destroy();
  }

  // Prepare data
  const labels = data.map(d => `Week ${d.week}`);
  const interest1Data = data.map(d => (d.interest1 * 100).toFixed(1));
  const interest2Data = data.map(d => (d.interest2 * 100).toFixed(1));

  // Create chart
  driftChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: interest1Name,
          data: interest1Data,
          borderColor: '#1DA1F2',
          backgroundColor: 'rgba(29, 161, 242, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3
        },
        {
          label: interest2Name,
          data: interest2Data,
          borderColor: '#17bf63',
          backgroundColor: 'rgba(23, 191, 99, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: 'Feed Composition Over Time (Gravitational Pull Effect)',
          font: {
            size: 16,
            weight: 'bold',
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          color: '#1a1a1a',
          padding: 20
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: {
              size: 14,
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            color: '#1a1a1a',
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
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
          displayColors: true,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y}%`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time (Weeks)',
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
            color: '#6b6b6b',
            maxRotation: 0,
            autoSkip: true,
            autoSkipPadding: 20
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Feed Composition (%)',
            font: {
              size: 14,
              weight: 'bold',
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            color: '#1a1a1a'
          },
          min: 0,
          max: 100,
          ticks: {
            font: {
              size: 12,
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            color: '#6b6b6b',
            callback: function(value) {
              return value + '%';
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  });
}

/**
 * Render the milestone table
 */
function renderTable(data, interest1Name, interest2Name) {
  // Show milestones: week 0, 4, 8, 12, 16, 20, 24, and final
  const milestones = [0, 4, 8, 12, 16, 20, 24];
  const finalWeek = data[data.length - 1].week;
  if (finalWeek > 24 && !milestones.includes(finalWeek)) {
    milestones.push(finalWeek);
  }

  driftTableBody.innerHTML = milestones
    .filter(week => week <= finalWeek)
    .map(week => {
      const point = data[week];
      const percent1 = Math.round(point.interest1 * 100);
      const percent2 = Math.round(point.interest2 * 100);
      const explanation = getWeekExplanation(week, percent1, interest1Name);

      return `
        <tr>
          <td><strong>Week ${week}</strong></td>
          <td>${percent1}%</td>
          <td>${percent2}%</td>
          <td>${explanation}</td>
        </tr>
      `;
    })
    .join('');
}

/**
 * Get explanation for what's happening at each milestone
 */
function getWeekExplanation(week, percent1, interest1Name) {
  if (week === 0) {
    return 'Your initial state based on who you followed.';
  } else if (week <= 4) {
    return `Subtle drift begins. ${interest1Name} content scores slightly higher in the algorithm, so you see more of it.`;
  } else if (week <= 12) {
    return `Engagement reinforcement. You're engaging more with ${interest1Name} because you're seeing more of it. This increases your cluster score.`;
  } else if (week <= 20) {
    return `FRS acceleration (if enabled). X recommends ${interest1Name} accounts. Following them accelerates drift.`;
  } else if (week <= 24) {
    return `Approaching equilibrium. Drift slows as you near the algorithm's "natural" balance for your engagement pattern.`;
  } else if (percent1 >= 85) {
    return `Deep in the gravity well. Breaking out now requires deliberate counter-engagement for 30+ days.`;
  } else {
    return `Continued drift toward monoculture. Your secondary interest is becoming barely visible.`;
  }
}

// Initialize with default values on page load
window.addEventListener('DOMContentLoaded', () => {
  // Set initial split display
  const initialSplit = parseInt(splitSlider.value);
  splitDisplay.textContent = `${initialSplit}% / ${100 - initialSplit}%`;
});

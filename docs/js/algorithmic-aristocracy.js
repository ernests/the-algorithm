// Algorithmic Aristocracy Calculator

document.getElementById('calculate-btn').addEventListener('click', calculateTier);

// Also trigger on Enter key
['followers', 'following', 'avg-engagement'].forEach(id => {
  document.getElementById(id).addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateTier();
  });
});

function calculateTier() {
  // Get input values
  const followers = parseInt(document.getElementById('followers').value) || 0;
  const following = parseInt(document.getElementById('following').value) || 0;
  const avgEngagement = parseInt(document.getElementById('avg-engagement').value) || 0;
  const verified = document.getElementById('verified').checked;

  if (followers === 0) {
    alert('Please enter follower count');
    return;
  }

  // Calculate mechanisms
  const mechanisms = calculateMechanisms(followers, following, avgEngagement, verified);

  // Determine tier
  const tier = determineTier(followers, verified);

  // Calculate effective reach
  const effectiveReach = calculateEffectiveReach(followers, mechanisms);

  // Display results
  displayResults(followers, following, avgEngagement, verified, mechanisms, tier, effectiveReach);
}

function calculateMechanisms(followers, following, avgEngagement, verified) {
  const mechanisms = {
    verification: {
      applies: verified,
      multiplier: verified ? 100 : 1,
      description: verified ? '100x TweepCred multiplier' : 'No multiplier (unverified)'
    },
    twhin: {
      applies: avgEngagement >= 16,
      threshold: 16,
      description: avgEngagement >= 16
        ? `Threshold crossed (${avgEngagement} ≥ 16)`
        : `Threshold NOT crossed (${avgEngagement} < 16)`
    },
    followRatio: calculateFollowRatio(followers, following),
    outOfNetwork: {
      penalty: 0.75,
      description: 'All out-of-network tweets: 0.75x multiplier'
    }
  };

  return mechanisms;
}

function calculateFollowRatio(followers, following) {
  const ratio = (1 + following) / (1 + followers);

  // Check if penalty applies (following > 500 AND ratio > 0.6)
  const penaltyApplies = following > 500 && ratio > 0.6;

  let penaltyMultiplier = 1;
  if (penaltyApplies) {
    // Formula: mass / exp(5.0 * (ratio - 0.6))
    penaltyMultiplier = Math.exp(5.0 * (ratio - 0.6));
  }

  return {
    ratio: ratio,
    applies: penaltyApplies,
    multiplier: penaltyMultiplier,
    description: penaltyApplies
      ? `Ratio ${ratio.toFixed(2)} → ${formatNumber(penaltyMultiplier)}x penalty`
      : `Ratio ${ratio.toFixed(2)} → no penalty (${ratio > 0.6 ? 'following ≤500' : 'ratio ≤0.6'})`
  };
}

function determineTier(followers, verified) {
  if (followers < 1000) return 1;
  if (followers < 10000) return 2;
  if (followers < 100000) return 3;
  if (followers < 1000000) return 4;
  return 5;
}

function calculateEffectiveReach(followers, mechanisms) {
  // Simplified reach calculation
  // In-network base (no penalty)
  let inNetworkReach = followers;

  // Out-of-network potential (simplified model)
  // Small accounts: limited OON reach
  // Large accounts: substantial OON reach
  let oonPotential = followers * 0.2; // Simplified: 20% of followers as OON base

  // Apply verification multiplier to OON potential
  if (mechanisms.verification.applies) {
    oonPotential *= mechanisms.verification.multiplier / 10; // Scaled down for realism
  }

  // Apply follow ratio penalty to OON
  if (mechanisms.followRatio.applies) {
    oonPotential /= mechanisms.followRatio.multiplier;
  }

  // Apply out-of-network penalty
  oonPotential *= mechanisms.outOfNetwork.penalty;

  // Total reach
  const totalReach = inNetworkReach + oonPotential;

  return {
    inNetwork: inNetworkReach,
    outOfNetwork: oonPotential,
    total: totalReach
  };
}

function displayResults(followers, following, avgEngagement, verified, mechanisms, tier, reach) {
  const resultsContainer = document.getElementById('calculator-results');

  // Show results container
  resultsContainer.style.display = 'block';

  // Generate tier description
  const tierDescriptions = {
    1: 'Subject to all penalties, no structural advantages',
    2: 'Some advantages if verified, improving ratio',
    3: 'Often verified (100x), penalties matter less',
    4: 'Verified, minimal penalties, strong reach',
    5: 'Above most rules, maximum algorithmic support'
  };

  // Build results HTML
  let html = `
    <div style="background-color: var(--background-alt); padding: 2rem; border-radius: 8px;">
      <h3 style="margin-top: 0; color: var(--primary-color);">Your Tier: ${tier} of 5</h3>
      <p style="font-size: 1.1rem; margin: 1rem 0;">${tierDescriptions[tier]}</p>

      <div style="margin: 2rem 0;">
        <h4>Estimated Effective Reach</h4>
        <div style="font-size: 2rem; font-weight: 600; color: var(--primary-color);">
          ~${formatNumber(Math.round(reach.total))}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
          <div>
            <div style="font-size: 0.9rem; color: var(--text-secondary);">In-network</div>
            <div style="font-size: 1.3rem; font-weight: 600;">${formatNumber(Math.round(reach.inNetwork))}</div>
          </div>
          <div>
            <div style="font-size: 0.9rem; color: var(--text-secondary);">Out-of-network</div>
            <div style="font-size: 1.3rem; font-weight: 600;">${formatNumber(Math.round(reach.outOfNetwork))}</div>
          </div>
        </div>
      </div>

      <div style="margin: 2rem 0;">
        <h4>Mechanisms Affecting You</h4>

        <div style="margin: 1rem 0; padding: 1rem; background-color: ${mechanisms.verification.applies ? 'rgba(29, 161, 242, 0.1)' : 'rgba(150, 150, 150, 0.1)'}; border-left: 4px solid ${mechanisms.verification.applies ? 'var(--primary-color)' : '#999'}; border-radius: 4px;">
          <div style="font-weight: 600; margin-bottom: 0.5rem;">
            ${mechanisms.verification.applies ? '✓' : '✗'} 1. Verification Multiplier
          </div>
          <div style="font-size: 0.95rem;">
            ${mechanisms.verification.description}
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
            Code: <code>UserMass.scala:41</code>
          </div>
        </div>

        <div style="margin: 1rem 0; padding: 1rem; background-color: ${mechanisms.twhin.applies ? 'rgba(29, 161, 242, 0.1)' : 'rgba(150, 150, 150, 0.1)'}; border-left: 4px solid ${mechanisms.twhin.applies ? 'var(--primary-color)' : '#999'}; border-radius: 4px;">
          <div style="font-weight: 600; margin-bottom: 0.5rem;">
            ${mechanisms.twhin.applies ? '✓' : '✗'} 2. TwHIN Threshold
          </div>
          <div style="font-size: 0.95rem;">
            ${mechanisms.twhin.description}
          </div>
          ${mechanisms.twhin.applies ?
            '<div style="font-size: 0.9rem; margin-top: 0.5rem;">Full TwHIN support: ANN candidate generation + 10+ feature hydrators</div>' :
            '<div style="font-size: 0.9rem; margin-top: 0.5rem; color: #ff6b6b;">No TwHIN support: Zero embeddings, no candidate generation</div>'
          }
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
            Code: <code>TwhinEmbeddingsStore.scala:48</code>
          </div>
        </div>

        <div style="margin: 1rem 0; padding: 1rem; background-color: ${mechanisms.followRatio.applies ? 'rgba(255, 107, 107, 0.1)' : 'rgba(29, 161, 242, 0.1)'}; border-left: 4px solid ${mechanisms.followRatio.applies ? '#ff6b6b' : 'var(--primary-color)'}; border-radius: 4px;">
          <div style="font-weight: 600; margin-bottom: 0.5rem;">
            ${mechanisms.followRatio.applies ? '⚠' : '✓'} 3. Follow Ratio Penalty
          </div>
          <div style="font-size: 0.95rem;">
            ${mechanisms.followRatio.description}
          </div>
          ${mechanisms.followRatio.applies ?
            `<div style="font-size: 0.9rem; margin-top: 0.5rem; color: #ff6b6b;">High penalty: Your TweepCred is divided by ${formatNumber(mechanisms.followRatio.multiplier)}</div>` :
            '<div style="font-size: 0.9rem; margin-top: 0.5rem;">No penalty applied to your account</div>'
          }
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
            Code: <code>UserMass.scala:54-64</code>
          </div>
        </div>

        <div style="margin: 1rem 0; padding: 1rem; background-color: rgba(150, 150, 150, 0.1); border-left: 4px solid #999; border-radius: 4px;">
          <div style="font-weight: 600; margin-bottom: 0.5rem;">
            4. Out-of-Network Penalty (Universal)
          </div>
          <div style="font-size: 0.95rem;">
            ${mechanisms.outOfNetwork.description}
          </div>
          <div style="font-size: 0.9rem; margin-top: 0.5rem;">
            ${followers < 1000 ?
              'High impact: ~99% of your potential reach is out-of-network' :
              followers < 100000 ?
              'Moderate impact: Large in-network base reduces relative effect' :
              'Low relative impact: In-network base is very large'
            }
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
            Code: <code>RescoringFactorProvider.scala:46-57</code>
          </div>
        </div>
      </div>

      ${generateRecommendations(followers, following, verified, mechanisms, tier)}
    </div>
  `;

  resultsContainer.innerHTML = html;

  // Scroll results into view
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function generateRecommendations(followers, following, verified, mechanisms, tier) {
  let recommendations = '<div style="margin-top: 2rem; padding: 1.5rem; background-color: rgba(139, 92, 246, 0.1); border-left: 4px solid #8b5cf6; border-radius: 4px;">';
  recommendations += '<h4 style="margin-top: 0; color: #8b5cf6;">Observations</h4>';
  recommendations += '<ul style="margin: 0; padding-left: 1.5rem;">';

  if (!verified && tier <= 3) {
    recommendations += '<li style="margin: 0.5rem 0;">Verification would provide 100x TweepCred multiplier ($8/month Twitter Blue)</li>';
  }

  if (!mechanisms.twhin.applies) {
    recommendations += '<li style="margin: 0.5rem 0;">Average engagement below TwHIN threshold (16) - most tweets lack embedding support</li>';
  }

  if (mechanisms.followRatio.applies && mechanisms.followRatio.multiplier > 10) {
    recommendations += '<li style="margin: 0.5rem 0;">High follow ratio penalty significantly reduces reach</li>';
  }

  if (tier === 1) {
    recommendations += '<li style="margin: 0.5rem 0;">Tier 1: Limited algorithmic support, primarily in-network reach</li>';
  }

  if (tier >= 4) {
    recommendations += '<li style="margin: 0.5rem 0;">Tier 4-5: Most penalties negligible due to large base</li>';
  }

  recommendations += '</ul>';
  recommendations += '</div>';

  return recommendations;
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num >= 10) {
    return num.toFixed(0);
  } else {
    return num.toFixed(1);
  }
}

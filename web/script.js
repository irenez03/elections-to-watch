(function() {
  const statusEl = document.getElementById('status');
  const statesEl = document.getElementById('states');

  // Add timestamp to prevent caching of JSON file
  fetch(`elections.json?v=${Date.now()}`)
    .then(r => r.json())
    .then(data => {
      statusEl.textContent = `Last updated: ${new Date(data.lastUpdated).toLocaleString()}`;
      const entries = Object.entries(data.electionData).sort((a,b) => a[0].localeCompare(b[0]));
      if (entries.length === 0) {
        statesEl.innerHTML = '<div class="state">No elections found.</div>';
        return;
      }
      statesEl.innerHTML = entries.map(([abbr, s]) => {
        // Check if elections are over
        if (s.electionsOver) {
          const elections = (s.elections || []).map(e => {
            const badgeClass = e.chamberImpact === 'Local' ? 'local' : (
              e.chamberImpact === 'State' ? 'state' : (
              e.chamberImpact === 'House' ? 'house' : 'ref'));
            return `
              <div class="election" style="opacity: 0.7;">
                <div><strong>${e.title}</strong> <span class="badge ${badgeClass}">${e.chamberImpact}</span></div>
                <div><small>${e.type} • ${e.date}</small></div>
                <div>${e.stakes}</div>
              </div>
            `;
          }).join('');
          return `
            <div class="state" style="background: linear-gradient(135deg, rgba(74, 74, 74, 0.1), rgba(74, 74, 74, 0.05)); border-color: #4a4a4a;">
              <h3>${s.stateName} (${abbr}) <span style="color: #4a4a4a; font-size: 0.9rem;">✓ Elections Over</span></h3>
              <div style="background: rgba(74, 74, 74, 0.15); padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 0.5rem;">
                <strong>Elections Are Over</strong><br>
                <small>The elections in ${s.stateName} have concluded. </small>
              </div>
              ${elections}
            </div>
          `;
        }
        
        const elections = (s.elections || []).map(e => {
          const badgeClass = e.chamberImpact === 'Local' ? 'local' : (
            e.chamberImpact === 'State' ? 'state' : (
            e.chamberImpact === 'House' ? 'house' : 'ref'));
          return `
            <div class="election">
              <div><strong>${e.title}</strong> <span class="badge ${badgeClass}">${e.chamberImpact}</span></div>
              <div><small>${e.type} • ${e.date}</small></div>
              <div>${e.stakes}</div>
            </div>
          `;
        }).join('');
        return `
          <div class="state">
            <h3>${s.stateName} (${abbr})</h3>
            <div><small>Register by: ${s.registrationDeadline} — <a href="${s.registrationWebsite}" target="_blank" rel="noopener">Register</a></small></div>
            ${elections}
          </div>
        `;
      }).join('');
    })
    .catch(err => {
      console.error(err);
      statusEl.textContent = 'Failed to load election data.';
    });
})();

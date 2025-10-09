(function() {
  const statusEl = document.getElementById('status');
  const statesEl = document.getElementById('states');

  fetch('elections.json')
    .then(r => r.json())
    .then(data => {
      statusEl.textContent = `Last updated: ${new Date(data.lastUpdated).toLocaleString()}`;
      const entries = Object.entries(data.electionData).sort((a,b) => a[0].localeCompare(b[0]));
      if (entries.length === 0) {
        statesEl.innerHTML = '<div class="state">No elections found.</div>';
        return;
      }
      statesEl.innerHTML = entries.map(([abbr, s]) => {
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

// Interactive US map using jQuery usmap and tooltip/modal
$(function () {
  const tooltip = $('#tooltip');
  const statusEl = $('#status');

  fetch('elections.json')
    .then(r => r.json())
    .then(data => {
      statusEl.text(`Last updated: ${new Date(data.lastUpdated).toLocaleString()}`);
      const electionData = data.electionData || {};

      const stateSpecificStyles = {};
      const stateSpecificHoverStyles = {};
      for (const abbr in electionData) {
        const s = electionData[abbr];
        const hasState = (s.elections || []).some(e => e.chamberImpact === 'State');
        const hasLocal = (s.elections || []).some(e => e.chamberImpact === 'Local');
        const hasHouse = (s.elections || []).some(e => e.chamberImpact === 'House');
        let fill = '#d1d5db';
        if (hasHouse) fill = '#fecaca';
        else if (hasState) fill = '#bfdbfe';
        else if (hasLocal) fill = '#fde68a';
        stateSpecificStyles[abbr] = { fill };
        stateSpecificHoverStyles[abbr] = { fill: '#f59e0b' };
      }

      $('#map').usmap({
        stateStyles: { fill: '#e5e7eb', stroke: '#ffffff', 'stroke-width': 1 },
        stateHoverStyles: { fill: '#cbd5e1' },
        showLabels: true,
        stateSpecificStyles,
        stateSpecificHoverStyles,
        mouseover: function (event, data) {
          const s = electionData[data.name];
          let html = `<strong>${s ? s.stateName : data.name}</strong><br/>`;
          if (s && s.elections && s.elections.length) {
            html += `${s.elections.length} election(s)`;
          } else {
            html += 'No elections listed';
          }
          tooltip.html(html).css({ top: event.pageY - 40, left: event.pageX + 10 }).show();
        },
        mouseout: function () { tooltip.hide(); },
        mousemove: function (event) { tooltip.css({ top: event.pageY - 40, left: event.pageX + 10 }); },
        click: function (event, data) {
          const s = electionData[data.name];
          openModal(s ? s.stateName : data.name, s);
        }
      });

      const modal = $('#info-modal');
      const closeBtn = $('.close-btn');
      function openModal(stateName, stateData) {
        $('#modal-state-name').text(stateName);
        const list = $('#modal-elections-list');
        list.empty();
        if (stateData && stateData.elections && stateData.elections.length) {
          if (stateData.registrationDeadline || stateData.registrationWebsite) {
            list.append(`<div class="election-item"><p><strong>Register by:</strong> ${stateData.registrationDeadline || '—'} — <a href="${stateData.registrationWebsite || '#'}" target="_blank" rel="noopener">Register</a></p></div>`);
          }
          stateData.elections.forEach(e => {
            list.append(`
              <div class="election-item">
                <h4>${e.title}</h4>
                <p><strong>Date:</strong> ${e.date}</p>
                <p><strong>Type:</strong> ${e.type}</p>
                <p><strong>Impact:</strong> ${e.chamberImpact}</p>
                <p>${e.stakes || ''}</p>
              </div>
            `);
          });
        } else {
          list.append('<p>No elections to display for this state.</p>');
        }
        modal.show();
      }
      function closeModal() { modal.hide(); }
      closeBtn.on('click', closeModal);
      $(window).on('click', function (e) { if ($(e.target).is(modal)) closeModal(); });
    })
    .catch(() => statusEl.text('Failed to load election data.'));
});

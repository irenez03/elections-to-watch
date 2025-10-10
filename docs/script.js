// Interactive US map using jQuery usmap and tooltip/modal
$(function () {
  const tooltip = $('#tooltip');

  // Lottery animation function
  function animateNumber(element, finalValue, duration = 1500) {
    const startValue = 0;
    const startTime = Date.now();
    const valueRange = finalValue - startValue;
    
    function update() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + valueRange * easeOut);
      
      element.text(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.text(finalValue); // Ensure final value is exact
      }
    }
    
    update();
  }

  fetch('elections.json')
    .then(r => r.json())
    .then(data => {
      const electionData = data.electionData || {};

      // Summary metrics
      const statesTracked = Object.keys(electionData).length;
      let total = 0, local = 0, state = 0, house = 0, ref = 0;
      Object.values(electionData).forEach(s => {
        (s.elections || []).forEach(e => {
          total += 1;
          if (e.chamberImpact === 'Local') local += 1;
          else if (e.chamberImpact === 'State') state += 1;
          else if (e.chamberImpact === 'House') house += 1;
          else ref += 1;
        });
      });
      
      // Animate the numbers with staggered start times
      setTimeout(() => animateNumber($('#sum-states'), statesTracked, 1200), 0);
      setTimeout(() => animateNumber($('#sum-elections'), total, 1200), 100);
      setTimeout(() => animateNumber($('#sum-local'), local, 1000), 200);
      setTimeout(() => animateNumber($('#sum-state'), state, 1000), 300);
      setTimeout(() => animateNumber($('#sum-house'), house, 1000), 400);
      setTimeout(() => animateNumber($('#sum-ref'), ref, 1000), 500);

      const stateSpecificStyles = {};
      const stateSpecificHoverStyles = {};
      for (const abbr in electionData) {
        const s = electionData[abbr];
        const hasElections = (s.elections || []).length > 0;
        let fill = '#e8f5f7'; // very light blue (almost honeydew) for all states
        if (hasElections) fill = '#1d3557'; // dark blue for states with elections
        stateSpecificStyles[abbr] = { 
          fill,
          'stroke-width': 2,
          'filter': 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
        };
        stateSpecificHoverStyles[abbr] = { 
          fill: '#457b9d',
          'stroke-width': 3,
          'filter': 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
        };
      }

      $('#map').usmap({
        stateStyles: { 
          fill: '#e8f5f7', 
          stroke: '#1d3557', 
          'stroke-width': 2,
          'stroke-linejoin': 'round',
          'filter': 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))'
        },
        stateHoverStyles: { 
          fill: '#457b9d',
          'stroke-width': 3,
          'filter': 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
          'transform': 'scale(1.02)'
        },
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
          // State has elections - show registration info first, then elections
          if (stateData.registrationDeadline || stateData.registrationWebsite) {
            list.append(`<div class="election-item registration-info"><p><strong>Register by:</strong> ${stateData.registrationDeadline || '—'} — <a href="${stateData.registrationWebsite || '#'}" target="_blank" rel="noopener">Register to Vote</a></p></div>`);
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
        } else if (stateData) {
          // No elections but we have state data - show just registration info
          list.append('<p class="no-elections-message">No tracked elections in this state at this time.</p>');
          if (stateData.registrationDeadline || stateData.registrationWebsite) {
            list.append(`
              <div class="election-item registration-info">
                <h4>Voter Registration</h4>
                <p><strong>Registration Deadline:</strong> ${stateData.registrationDeadline || 'Check with your local election office'}</p>
                <p><a href="${stateData.registrationWebsite || '#'}" target="_blank" rel="noopener" class="register-button">Register to Vote →</a></p>
              </div>
            `);
          }
        } else {
          // No state data at all
          list.append('<p class="no-elections-message">No information available for this state.</p>');
        }
        modal.show();
      }
      function closeModal() { modal.hide(); }
      closeBtn.on('click', closeModal);
      $(window).on('click', function (e) { if ($(e.target).is(modal)) closeModal(); });
    })
    .catch(() => console.error('Failed to load election data.'));
});

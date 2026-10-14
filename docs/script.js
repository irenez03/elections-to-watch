/* ========================================
   ELECTION MAP - INTERACTIVE JAVASCRIPT
   ========================================
   This file controls the map colors, tooltips, and modal behavior
   Edit this file to customize map state colors and interactions
*/

// Interactive US map using jQuery usmap and tooltip/modal
$(function () {
  const tooltip = $('#tooltip');

  // ========================================
  // NUMBER ANIMATION FUNCTION
  // ========================================
  // Creates a counting-up animation for summary statistics
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

  // ========================================
  // LOAD ELECTION DATA
  // ========================================
  // races.json is built from data/ by scripts/build_from_csv.py
  // (races, links, registration + absentee deadlines per state)
  // Add timestamp to prevent caching of JSON file
  fetch(`races.json?v=${Date.now()}`)
    .then(r => r.json())
    .then(racesData => {
      const raceStates = racesData.states || {};

      // Map regions without CSV data (shown in the default color)
      const OTHER_NAMES = { DC: 'District of Columbia' };
      const stateName = abbr => raceStates[abbr]?.name || OTHER_NAMES[abbr] || abbr;

      // Race categories, in display order. key matches counts[...] in races.json
      const RACE_TYPES = [
        { key: 'federal_senate', group: 'federal', race: 'senate',   label: 'U.S. Senate',  badge: 'Senate',   badgeStyle: 'background: linear-gradient(135deg, #2b7fc1, #03254c); color: white;' },
        { key: 'federal_house',  group: 'federal', race: 'house',    label: 'U.S. House',   badge: 'House',    badgeStyle: 'background: linear-gradient(135deg, #e63946, #c91c28); color: white;' },
        { key: 'state_governor', group: 'state',   race: 'governor', label: 'Governor',     badge: 'Governor', badgeStyle: 'background: linear-gradient(135deg, #457b9d, #1d3557); color: white;' },
        { key: 'state_court',    group: 'state',   race: 'court',    label: 'Court',        badge: 'Court',    badgeStyle: 'background: linear-gradient(135deg, #6c757d, #495057); color: white;' },
        { key: 'state_house',    group: 'state',   race: 'house',    label: 'State House',  badge: 'House',    badgeStyle: 'background: linear-gradient(135deg, #a8dadc, #457b9d); color: white;' },
        { key: 'state_senate',   group: 'state',   race: 'senate',   label: 'State Senate', badge: 'Senate',   badgeStyle: 'background: linear-gradient(135deg, #7209b7, #5a189a); color: white;' }
      ];
      const GROUPS = [
        { key: 'federal', label: 'Federal' },
        { key: 'state',   label: 'State' }
      ];

      // Escape CSV text before inserting it as HTML
      function esc(text) {
        return String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      }

      // ========================================
      // CALCULATE SUMMARY STATISTICS (from races.json)
      // ========================================
      const totals = Object.fromEntries(RACE_TYPES.map(t => [t.key, 0]));
      let statesTracked = 0;
      Object.values(raceStates).forEach(s => {
        let stateTotal = 0;
        RACE_TYPES.forEach(t => {
          totals[t.key] += s.counts[t.key] || 0;
          stateTotal    += s.counts[t.key] || 0;
        });
        if (stateTotal > 0) statesTracked++;
      });
      const totalElections = Object.values(totals).reduce((a, b) => a + b, 0);

      setTimeout(() => animateNumber($('#sum-states'),    statesTracked,  1200), 0);
      setTimeout(() => animateNumber($('#sum-elections'), totalElections, 1200), 100);
      RACE_TYPES.forEach((t, i) => {
        const el = $(`#sum-${t.key.replace('_', '-')}`);
        setTimeout(() => animateNumber(el, totals[t.key], 1000), 200 + i * 100);
      });

      // Format YYYY-MM-DD → "Mon D, YYYY"
      function fmtDate(d) {
        if (!d) return '—';
        if (d === 'same-day') return 'Same-day registration';
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const [y, m, day] = d.split('-');
        if (!y || !m || !day) return d;
        return `${months[+m - 1]} ${+day}, ${y}`;
      }

      // Registration deadline headline for a state (a date, or a label like "Varies by town")
      function regDeadlineText(abbr) {
        const reg = raceStates[abbr]?.registration;
        if (!reg) return '—';
        return reg.deadline ? fmtDate(reg.deadline) : (reg.label || '—');
      }

      // Key Dates: the registration deadline, shown large, plus registration links
      function buildRegistrationSection(s) {
        const reg = s.registration || {};
        const hasButtons = s.registrationWebsite || s.electionInfoUrl;
        return `
          <div class="registration-info">
            <h4 class="info-heading">Key Dates</h4>
            <span class="info-label">Registration Deadline</span>
            <p class="reg-deadline">${esc(reg.deadline ? fmtDate(reg.deadline) : (reg.label || '—'))}</p>
            ${reg.note ? `<p class="info-note">${esc(reg.note)}</p>` : ''}
            ${hasButtons ? `<div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${s.registrationWebsite ? `<a href="${s.registrationWebsite}" target="_blank" rel="noopener" class="register-button">Register to Vote →</a>` : ''}
              ${s.electionInfoUrl ? `<a href="${s.electionInfoUrl}" target="_blank" rel="noopener" class="register-button" style="background: white; color: var(--cerulean); border: 2px solid var(--cerulean);">More Election Info</a>` : ''}
            </div>` : ''}
          </div>
        `;
      }

      // Absentee ballot request/return deadlines (from vote.org)
      function buildAbsenteeSection(s) {
        const a = s.absentee;
        if (!a) return '';
        return `
          <div class="registration-info absentee-info">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem;">
              <h4 class="info-heading" style="margin: 0;">Absentee Ballots</h4>
              ${a.autoMail ? '<span class="election-badge" style="background: linear-gradient(135deg, #a8dadc, #457b9d); color: white;">Ballots mailed to all voters</span>' : ''}
            </div>
            <div class="absentee-grid">
              <div>
                <span class="info-label">${a.autoMail ? 'Requesting a ballot' : 'Request by'}</span>
                <p class="absentee-text">${esc(a.request)}</p>
              </div>
              <div>
                <span class="info-label">Return by</span>
                <p class="absentee-text">${esc(a.return)}</p>
              </div>
            </div>
            <div class="absentee-links">
              ${a.tracker ? `<a href="${a.tracker}" target="_blank" rel="noopener">Track your ballot →</a>` : ''}
              <a href="https://www.vote.org/absentee-ballot-deadlines/" target="_blank" rel="noopener">All absentee deadlines on Vote.org →</a>
            </div>
          </div>
        `;
      }

      // One card per race type; long lists (e.g. 100+ state house districts) collapse
      function buildRaceCard(type, races) {
        const COLLAPSE_AFTER = 6;
        const items = races.map(r => `
          <li class="race-item">
            ${r.title ? `<span class="race-title">${esc(r.title)}</span>` : ''}
            <span class="race-detail">${esc(r.detail)}</span>
          </li>`).join('');
        const list = races.length > COLLAPSE_AFTER
          ? `<details class="race-details">
               <summary>Show all ${races.length} races</summary>
               <ul class="race-list">${items}</ul>
             </details>`
          : `<ul class="race-list">${items}</ul>`;
        return `
          <div class="election-card">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.75rem; margin-bottom: 0.5rem;">
              <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--berkeley-blue); flex: 1;">
                ${type.label}${races.length > 1 && type.key !== 'state_governor' ? ` <span class="race-count">${races.length} races</span>` : ''}
              </h4>
              <span class="election-badge" style="${type.badgeStyle}">${type.badge}</span>
            </div>
            ${list}
          </div>
        `;
      }

      // Federal / State section: header + one card per race type with races
      function buildRaceGroup(group, s) {
        const types = RACE_TYPES.filter(t => t.group === group.key && s.races[group.key][t.race].length);
        const raceCount = types.reduce((n, t) => n + (s.counts[t.key] || 0), 0);
        const header = `
          <div class="race-group-header">
            <p>${group.label} Elections${raceCount ? ` — ${raceCount} race${raceCount !== 1 ? 's' : ''}` : ''}</p>
          </div>`;
        if (!types.length) {
          return header + `<p class="no-elections-message">No ${group.label.toLowerCase()} races on the ballot in 2026.</p>`;
        }
        return header + types.map(t => buildRaceCard(t, s.races[group.key][t.race])).join('');
      }

      /* ========================================
         STATE COLORS CONFIGURATION
         ========================================
         Blue gradient: 4 tiers based on which major races a state has (races.json)
         1 = U.S. House only | 2 = House + 1 | 3 = House + 2 | 4 = House + U.S. Senate, Governor and Court
      */
      function colorTier(abbr) {
        const c = raceStates[abbr]?.counts || {};
        const majors = ['federal_senate', 'state_governor', 'state_court'].filter(k => c[k] > 0).length;
        return Math.min(4, 1 + majors);
      }
      const gradientColors = {
        1: '#bde0f7', // lightest blue – House only
        2: '#5ba3d4', // light-medium blue – House + 1
        3: '#1a5a8f', // medium-dark blue – House + 2
        4: '#03254c'  // darkest navy – House + all 3
      };

      // Matching hover shades for each tier
      const gradientHoverColors = {
        1: '#90c2e8',
        2: '#2b7fc1',
        3: '#0d3b6e',
        4: '#021829'
      };

      const stateSpecificStyles = {};
      const stateSpecificHoverStyles = {};
      const stateSpecificLabelBackingStyles = {};
      const stateSpecificLabelBackingHoverStyles = {};

      // Build styles for all states (main SVG paths AND northeast label boxes)
      Object.keys(raceStates).forEach(abbr => {
        const tier = colorTier(abbr);
        const fill = gradientColors[tier];
        const hoverFill = gradientHoverColors[tier];

        // Main map state (SVG path)
        stateSpecificStyles[abbr] = {
          fill,
          stroke: '#ffffff',
          'stroke-width': 2,
          'filter': 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
        };
        stateSpecificHoverStyles[abbr] = {
          fill: hoverFill,
          stroke: '#ffffff',
          'stroke-width': 3,
          'filter': 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
        };

        // Northeast label box (rect element — uses separate usmap options)
        stateSpecificLabelBackingStyles[abbr] = {
          fill,
          stroke: '#ffffff',
          'stroke-width': 1,
          cursor: 'pointer'
        };
        stateSpecificLabelBackingHoverStyles[abbr] = {
          fill: hoverFill,
          stroke: '#ffffff',
          'stroke-width': 1,
          cursor: 'pointer'
        };
      });

      /* ========================================
         INITIALIZE THE MAP
         ========================================
         This creates the actual interactive map
      */
      $('#map').usmap({
        // Default styles for ALL states (if not overridden by stateSpecificStyles)
        stateStyles: { 
          fill: '#bde0f7',                // Default state color (lightest blue)
          stroke: '#ffffff',              // Border color (WHITE - hardcoded)
          'stroke-width': 2,              // Border thickness
          'stroke-linejoin': 'round',     // Rounded corners at borders
          'filter': 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))'
        },
        
        // Hover styles for ALL states (if not overridden)
        stateHoverStyles: { 
          fill: '#1a5a8f',
          stroke: '#ffffff',
          'stroke-width': 3,
          'filter': 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
          'transform': 'scale(1.02)'
        },
        
        showLabels: true,                 // Show state abbreviations on map
        
        // Individual state styles (overrides defaults)
        stateSpecificStyles,
        stateSpecificHoverStyles,

        // Label box defaults (northeast small states)
        labelBackingStyles: { fill: '#bde0f7', stroke: '#ffffff', 'stroke-width': 1, cursor: 'pointer' },
        labelBackingHoverStyles: { fill: '#1a5a8f', stroke: '#ffffff', 'stroke-width': 1, cursor: 'pointer' },
        stateSpecificLabelBackingStyles,
        stateSpecificLabelBackingHoverStyles,
        
        /* ========================================
           MOUSE HOVER EVENT
           ========================================
           Shows tooltip when hovering over a state
        */
        mouseover: function (event, data) {
          // Don't show tooltip if modal is open
          if (modal.attr('open') !== undefined) return;
          
          const s = raceStates[data.name];
          let html = `<strong>${stateName(data.name)}</strong><br/>`;

          if (s) {
            const total = RACE_TYPES.reduce((n, t) => n + (s.counts[t.key] || 0), 0);
            html += `<strong>${total} Election${total !== 1 ? 's' : ''}</strong>`;
            GROUPS.forEach(g => {
              const types = RACE_TYPES.filter(t => t.group === g.key && s.counts[t.key] > 0);
              if (types.length) html += `<br/>${g.label}: ${types.map(t => t.badge).join(' · ')}`;
            });
          } else {
            html += 'No tracked elections';
          }
          
          // Position and show tooltip
          tooltip.html(html).css({ top: event.pageY - 40, left: event.pageX + 10 }).show();
        },
        
        // Hide tooltip when mouse leaves state
        mouseout: function () { 
          tooltip.hide(); 
        },
        
        // Move tooltip with mouse
        mousemove: function (event) {
          // Don't move tooltip if modal is open
          if (modal.attr('open') !== undefined) return;
          tooltip.css({ top: event.pageY - 40, left: event.pageX + 10 }); 
        },
        
        /* ========================================
           CLICK EVENT
           ========================================
           Opens modal with full details when clicking a state
        */
        click: function (event, data) {
          openModal(data.name);
        }
      });

      /* ========================================
         MODAL (POPUP) FUNCTIONS
         ========================================
         Handles the detail popup when you click a state
      */
      const modal = $('#info-modal');
      const closeBtn = $('.close-btn');
      
      // Opens the modal and populates it with a state's races and voting info
      function openModal(abbr) {
        // Hide tooltip when modal opens
        tooltip.hide();

        const s = raceStates[abbr];
        $('#modal-state-name').text(stateName(abbr));
        const list = $('#modal-elections-list');
        list.empty();

        if (!s) {
          list.append('<p class="no-elections-message">No information available for this state.</p>');
        } else {
          list.append(buildRegistrationSection(s));
          list.append(buildAbsenteeSection(s));
          GROUPS.forEach(g => list.append(buildRaceGroup(g, s)));
        }

        // Open modal with proper attribute for CSS styling and centering
        modal.attr('open', '');
        list.closest('.modal-body').scrollTop(0);
      }
      
      // Closes the modal
      function closeModal() { 
        modal.removeAttr('open');
      }
      
      // Close button click handler
      closeBtn.on('click', closeModal);
      
      // Click outside modal to close
      $(window).on('click', function (e) { 
        if ($(e.target).is(modal)) closeModal(); 
      });
    })
    .catch(() => console.error('Failed to load election data.'));
});

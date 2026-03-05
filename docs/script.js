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
  // Fetches elections.json and builds the map
  // Add timestamp to prevent caching of JSON file
  fetch(`elections.json?v=${Date.now()}`)
    .then(r => r.json())
    .then(data => {
      const electionData = data.electionData || {};

      // Stats are calculated after csvElectionData is defined (see STATE COLORS section below)
      

      /* ========================================
         STATE COLORS CONFIGURATION
         ========================================
         This section controls the colors of each state on the map
         
         HOW TO CUSTOMIZE STATE COLORS:
         1. Change 'fill' variable to set colors based on your criteria
         2. States are colored based on whether they have elections
         3. You can add more complex logic (e.g., color by election type)
      */
      // General election data per state from CSV
      // senate/gov/court = 1 or 0 | reg = registration deadline | primaryDate | generalDate
      const csvElectionData = {
        AL: { senate:1, gov:1, court:0, reg:'2026-06-01', primaryDate:'2026-05-19', generalDate:'2026-11-03' },
        AK: { senate:1, gov:1, court:0, reg:'2026-07-19', primaryDate:'2026-08-18', generalDate:'2026-11-03' },
        AZ: { senate:0, gov:1, court:0, reg:'2026-06-22', primaryDate:'2026-07-21', generalDate:'2026-11-03' },
        AR: { senate:1, gov:1, court:1, reg:'2026-02-01', primaryDate:'2026-03-03', generalDate:'2026-11-03' },
        CA: { senate:0, gov:1, court:0, reg:'2026-05-18', primaryDate:'2026-06-02', generalDate:'2026-11-03' },
        CO: { senate:1, gov:1, court:0, reg:'2026-06-30', primaryDate:'2026-06-30', generalDate:'2026-11-03' },
        CT: { senate:0, gov:1, court:0, reg:'2026-07-24', primaryDate:'2026-08-11', generalDate:'2026-11-03' },
        DE: { senate:1, gov:0, court:0, reg:'2026-08-22', primaryDate:'2026-09-15', generalDate:'2026-11-03' },
        FL: { senate:1, gov:1, court:0, reg:'2026-07-20', primaryDate:'2026-08-18', generalDate:'2026-11-03' },
        GA: { senate:1, gov:1, court:1, reg:'2026-04-20', primaryDate:'2026-05-19', generalDate:'2026-11-03' },
        HI: { senate:0, gov:1, court:0, reg:'2026-07-30', primaryDate:'2026-08-08', generalDate:'2026-11-03' },
        ID: { senate:1, gov:1, court:1, reg:'2026-04-25', primaryDate:'2026-05-19', generalDate:'2026-11-03' },
        IL: { senate:1, gov:1, court:0, reg:'2026-02-18', primaryDate:'2026-03-17', generalDate:'2026-11-03' },
        IN: { senate:0, gov:0, court:0, reg:'2026-04-06', primaryDate:'2026-05-05', generalDate:'2026-11-03' },
        IA: { senate:1, gov:1, court:0, reg:'2026-05-18', primaryDate:'2026-06-02', generalDate:'2026-11-03' },
        KS: { senate:1, gov:1, court:0, reg:'2026-07-14', primaryDate:'2026-08-04', generalDate:'2026-11-03' },
        KY: { senate:1, gov:0, court:1, reg:'2026-04-20', primaryDate:'2026-05-19', generalDate:'2026-11-03' },
        LA: { senate:1, gov:0, court:0, reg:'2026-04-16', primaryDate:'2026-05-16', generalDate:'2026-11-03' },
        ME: { senate:1, gov:1, court:0, reg:'2026-05-19', primaryDate:'2026-06-09', generalDate:'2026-11-03' },
        MD: { senate:0, gov:1, court:0, reg:'2026-06-02', primaryDate:'2026-06-23', generalDate:'2026-11-03' },
        MA: { senate:1, gov:1, court:0, reg:'2026-08-22', primaryDate:'2026-09-01', generalDate:'2026-11-03' },
        MI: { senate:1, gov:1, court:1, reg:'2026-07-20', primaryDate:'2026-08-04', generalDate:'2026-11-03' },
        MN: { senate:1, gov:1, court:1, reg:'2026-07-21', primaryDate:'2026-08-11', generalDate:'2026-11-03' },
        MS: { senate:1, gov:0, court:1, reg:'2026-02-08', primaryDate:'2026-03-10', generalDate:'2026-11-03' },
        MO: { senate:0, gov:0, court:0, reg:'2026-07-08', primaryDate:'2026-08-04', generalDate:'2026-11-03' },
        MT: { senate:1, gov:0, court:1, reg:'2026-05-03', primaryDate:'2026-06-02', generalDate:'2026-11-03' },
        NE: { senate:1, gov:1, court:0, reg:'2026-04-24', primaryDate:'2026-05-12', generalDate:'2026-11-03' },
        NV: { senate:0, gov:1, court:1, reg:'2026-05-12', primaryDate:'2026-06-09', generalDate:'2026-11-03' },
        NH: { senate:1, gov:1, court:0, reg:'2026-08-26', primaryDate:'2026-09-08', generalDate:'2026-11-03' },
        NJ: { senate:1, gov:0, court:0, reg:'2026-05-12', primaryDate:'2026-06-02', generalDate:'2026-11-03' },
        NM: { senate:1, gov:1, court:0, reg:'2026-05-05', primaryDate:'2026-06-02', generalDate:'2026-11-03' },
        NY: { senate:0, gov:1, court:0, reg:'2026-06-08', primaryDate:'2026-06-23', generalDate:'2026-11-03' },
        NC: { senate:1, gov:0, court:0, reg:'2026-02-08', primaryDate:'2026-03-03', generalDate:'2026-11-03' },
        ND: { senate:0, gov:0, court:1, reg:'same-day',   primaryDate:'2026-06-09', generalDate:'2026-11-03' },
        OH: { senate:1, gov:1, court:0, reg:'2026-04-05', primaryDate:'2026-05-05', generalDate:'2026-11-03' },
        OK: { senate:1, gov:1, court:0, reg:'2026-05-27', primaryDate:'2026-06-16', generalDate:'2026-11-03' },
        OR: { senate:1, gov:1, court:1, reg:'2026-04-28', primaryDate:'2026-05-19', generalDate:'2026-11-03' },
        PA: { senate:0, gov:1, court:0, reg:'2026-05-04', primaryDate:'2026-05-19', generalDate:'2026-11-03' },
        RI: { senate:1, gov:1, court:0, reg:'2026-08-09', primaryDate:'2026-09-08', generalDate:'2026-11-03' },
        SC: { senate:1, gov:1, court:0, reg:'2026-05-10', primaryDate:'2026-06-09', generalDate:'2026-11-03' },
        SD: { senate:1, gov:1, court:0, reg:'2026-05-18', primaryDate:'2026-06-02', generalDate:'2026-11-03' },
        TN: { senate:1, gov:1, court:0, reg:'2026-07-07', primaryDate:'2026-08-06', generalDate:'2026-11-03' },
        TX: { senate:1, gov:1, court:0, reg:'2026-02-02', primaryDate:'2026-03-03', generalDate:'2026-11-03' },
        UT: { senate:0, gov:0, court:0, reg:'2026-06-12', primaryDate:'2026-06-23', generalDate:'2026-11-03' },
        VT: { senate:0, gov:1, court:0, reg:'2026-08-11', primaryDate:'2026-08-11', generalDate:'2026-11-03' },
        VA: { senate:1, gov:0, court:0, reg:'2026-05-25', primaryDate:'2026-08-04', generalDate:'2026-11-03' },
        WA: { senate:0, gov:0, court:1, reg:'2026-07-27', primaryDate:'2026-08-04', generalDate:'2026-11-03' },
        WV: { senate:1, gov:0, court:1, reg:'2026-04-21', primaryDate:'2026-05-12', generalDate:'2026-11-03' },
        WI: { senate:0, gov:1, court:1, reg:'2026-07-20', primaryDate:'2026-08-11', generalDate:'2026-11-03' },
        WY: { senate:1, gov:1, court:0, reg:'2026-08-04', primaryDate:'2026-08-18', generalDate:'2026-11-03' }
      };

      // ========================================
      // CALCULATE SUMMARY STATISTICS (from CSV general election data)
      // ========================================
      let csvStates = 0, csvTotal = 0, csvSenate = 0, csvGov = 0, csvCourt = 0;
      Object.values(csvElectionData).forEach(c => {
        const n = c.senate + c.gov + c.court;
        if (n > 0) csvStates++;
        csvTotal  += n;
        csvSenate += c.senate;
        csvGov    += c.gov;
        csvCourt  += c.court;
      });
      setTimeout(() => animateNumber($('#sum-states'),    csvStates,  1200), 0);
      setTimeout(() => animateNumber($('#sum-elections'), csvTotal,   1200), 100);
      setTimeout(() => animateNumber($('#sum-local'),     csvSenate,  1000), 200);
      setTimeout(() => animateNumber($('#sum-state'),     csvGov,     1000), 300);
      setTimeout(() => animateNumber($('#sum-federal'),   csvCourt,   1000), 400);

      // Format YYYY-MM-DD → "Mon D, YYYY"; handles the same-day special value
      function fmtDate(d) {
        if (!d) return '—';
        if (d === 'same-day') return 'Same-day registration';
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const [y, m, day] = d.split('-');
        if (!y || !m || !day) return d;
        return `${months[+m - 1]} ${+day}, ${y}`;
      }

      // Builds the "Key Dates" registration block shared across modal branches
      function buildDatesSection(stateAbbr, stateData) {
        const csv = csvElectionData[stateAbbr] || {};
        const regDeadline = fmtDate(csv.reg) || stateData?.registrationDeadline || '—';
        const primaryDate  = fmtDate(csv.primaryDate);
        const generalDate  = fmtDate(csv.generalDate);
        const hasButtons   = stateData?.registrationWebsite || stateData?.electionInfoUrl;
        return `
          <div class="registration-info">
            <h4 style="margin: 0 0 0.75rem; font-size: 1rem; color: var(--berkeley-blue);">Key Dates</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; margin-bottom: ${hasButtons ? '0.75rem' : '0'};">
              <div>
                <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.05em;">Reg. Deadline</span>
                <p style="margin: 0.2rem 0 0; font-weight: 700; font-size: 0.95rem; color: var(--berkeley-blue);">${regDeadline}</p>
              </div>
              ${primaryDate ? `
              <div>
                <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.05em;">Primary</span>
                <p style="margin: 0.2rem 0 0; font-weight: 700; font-size: 0.95rem; color: var(--berkeley-blue);">${primaryDate}</p>
              </div>` : ''}
              ${generalDate ? `
              <div>
                <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.05em;">General Election</span>
                <p style="margin: 0.2rem 0 0; font-weight: 700; font-size: 0.95rem; color: var(--berkeley-blue);">${generalDate}</p>
              </div>` : ''}
            </div>
            ${hasButtons ? `<div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${stateData?.registrationWebsite ? `<a href="${stateData.registrationWebsite}" target="_blank" rel="noopener" class="register-button">Register to Vote →</a>` : ''}
              ${stateData?.electionInfoUrl ? `<a href="${stateData.electionInfoUrl}" target="_blank" rel="noopener" class="register-button" style="background: white; color: var(--cerulean); border: 2px solid var(--cerulean);">More Election Info</a>` : ''}
            </div>` : ''}
          </div>
        `;
      }

      // Blue gradient: 0 = gray, 1 = light blue, 2 = medium blue, 3 = dark blue
      const gradientColors = {
        0: '#8a817c', // gray  – no elections
        1: '#90c2e8', // light blue – 1 election
        2: '#2b7fc1', // medium blue – 2 elections
        3: '#03254c'  // dark navy – all 3 elections
      };

      // Matching hover shades for each tier
      const gradientHoverColors = {
        0: '#6b6461',
        1: '#5ba3d4',
        2: '#1a5a8f',
        3: '#021829'
      };

      const stateSpecificStyles = {};
      const stateSpecificHoverStyles = {};
      const stateSpecificLabelBackingStyles = {};
      const stateSpecificLabelBackingHoverStyles = {};

      // Build styles for all states (main SVG paths AND northeast label boxes)
      const allAbbrs = new Set([...Object.keys(electionData), ...Object.keys(csvElectionData)]);
      allAbbrs.forEach(abbr => {
        const csv = csvElectionData[abbr] || { senate: 0, gov: 0, court: 0 };
        const count = csv.senate + csv.gov + csv.court;
        const fill = gradientColors[count];
        const hoverFill = gradientHoverColors[count];

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
          fill: '#8a817c',                // Default state color (dark gray)
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
        labelBackingStyles: { fill: '#8a817c', stroke: '#ffffff', 'stroke-width': 1, cursor: 'pointer' },
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
          
          const s = electionData[data.name];
          let html = `<strong>${s ? s.stateName : data.name}</strong><br/>`;
          
          const csv = csvElectionData[data.name] || { senate: 0, gov: 0, court: 0 };
          const generalTypes = [];
          if (csv.senate) generalTypes.push('Senate');
          if (csv.gov) generalTypes.push('Gubernatorial');
          if (csv.court) generalTypes.push('Court');

          if (generalTypes.length > 0) {
            html += `<strong>${generalTypes.length} General Election${generalTypes.length !== 1 ? 's' : ''}</strong><br/>`;
            html += generalTypes.join(' · ');
          } else {
            html += 'No general elections';
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
          const s = electionData[data.name];
          openModal(s ? s.stateName : data.name, s, data.name);
        }
      });

      /* ========================================
         MODAL (POPUP) FUNCTIONS
         ========================================
         Handles the detail popup when you click a state
      */
      const modal = $('#info-modal');
      const closeBtn = $('.close-btn');
      
      // Builds general election cards from CSV data for a state abbreviation
      function buildGeneralElectionCards(abbr) {
        const csv = csvElectionData[abbr] || { senate: 0, gov: 0, court: 0 };
        const displayDate = fmtDate(csv.generalDate) || 'November 3, 2026';
        const generalElections = [];
        if (csv.senate) generalElections.push({ title: 'U.S. Senate', badge: 'Senate', badgeStyle: 'background: linear-gradient(135deg, #2b7fc1, #03254c); color: white;' });
        if (csv.gov)    generalElections.push({ title: 'Governor', badge: 'Gubernatorial', badgeStyle: 'background: linear-gradient(135deg, #457b9d, #1d3557); color: white;' });
        if (csv.court)  generalElections.push({ title: 'State Supreme Court', badge: 'Court', badgeStyle: 'background: linear-gradient(135deg, #6c757d, #495057); color: white;' });
        if (generalElections.length === 0) return '';

        const cards = generalElections.map(e => `
          <div class="election-card">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.75rem; margin-bottom: 0.5rem;">
              <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--berkeley-blue); flex: 1;">${e.title}</h4>
              <span class="election-badge" style="${e.badgeStyle}">${e.badge}</span>
            </div>
            <div style="display: grid; gap: 0.5rem; margin-top: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1rem;">📅</span>
                <div>
                  <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.05em;">Date</span>
                  <p style="margin: 0; font-weight: 600; color: var(--berkeley-blue); font-size: 0.9rem;">${displayDate}</p>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div>
                  <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.05em;">Type</span>
                  <p style="margin: 0; font-weight: 600; color: var(--berkeley-blue); font-size: 0.9rem;">General Election</p>
                </div>
              </div>
            </div>
          </div>
        `).join('');

        return `
          <div style="padding: 0.75rem 0 0.5rem; border-top: 0;">
            <p style="margin: 0; font-size: 0.875rem; font-weight: 700; color: var(--cerulean); text-transform: uppercase; letter-spacing: 0.05em;">
              ${generalElections.length} General Election${generalElections.length !== 1 ? 's' : ''} — ${displayDate}
            </p>
          </div>
          ${cards}
        `;
      }

      // Opens the modal and populates it with state data
      function openModal(stateName, stateData, stateAbbr) {
        // Hide tooltip when modal opens
        tooltip.hide();
        
        $('#modal-state-name').text(stateName);
        const list = $('#modal-elections-list');
        list.empty();
        
        // Check if elections are over for this state
        if (stateData && stateData.electionsOver) {
          list.append(`
            <div style="background: linear-gradient(135deg, rgba(74, 74, 74, 0.1), rgba(74, 74, 74, 0.05)); 
                        padding: 1.5rem; border-radius: var(--radius-md); 
                        border: 2px solid rgba(74, 74, 74, 0.3);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        text-align: center;">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">✓</div>
              <h3 style="margin: 0 0 0.5rem; color: #4a4a4a; font-size: 1.5rem; font-weight: 800;">
                Elections Are Over
              </h3>
              <p style="margin: 0; color: var(--fg); font-size: 1rem; line-height: 1.6;">
                The elections in ${stateName} have concluded.
              </p>
            </div>
          `);
          
          list.append(buildDatesSection(stateAbbr, stateData));

          // Still show the elections that were held
          if (stateData.elections && stateData.elections.length) {
            list.append(`
              <div style="padding: 0.75rem 0 0.5rem; border-top: 2px dashed rgba(74, 74, 74, 0.3); margin-top: 1rem;">
                <p style="margin: 0; font-size: 0.875rem; font-weight: 700; color: var(--cerulean); text-transform: uppercase; letter-spacing: 0.05em;">
                  ${stateData.elections.length} Completed Election${stateData.elections.length !== 1 ? 's' : ''}
                </p>
              </div>
            `);
            
            // Loop through each election
            stateData.elections.forEach((e, index) => {
              const badgeColors = {
                'Local': 'background: linear-gradient(135deg, #a8dadc, #457b9d); color: white;',
                'State': 'background: linear-gradient(135deg, #457b9d, #1d3557); color: white;',
                'House': 'background: linear-gradient(135deg, #e63946, #c91c28); color: white;',
                'Senate': 'background: linear-gradient(135deg, #7209b7, #5a189a); color: white;'
              };
              const badgeStyle = badgeColors[e.chamberImpact] || 'background: linear-gradient(135deg, #6c757d, #495057); color: white;';
              
              list.append(`
                <div class="election-card" style="opacity: 0.8;">
                  <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.75rem; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--berkeley-blue); flex: 1;">
                      ${e.title}
                    </h4>
                    <span class="election-badge" style="${badgeStyle}">
                      ${e.chamberImpact}
                    </span>
                  </div>
                  
                  <div style="display: grid; gap: 0.5rem; margin-top: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="font-size: 1rem;">📅</span>
                      <div>
                        <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.05em;">Date</span>
                        <p style="margin: 0; font-weight: 600; color: var(--berkeley-blue); font-size: 0.9rem;">${e.date}</p>
                      </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <div>
                        <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.05em;">Type</span>
                        <p style="margin: 0; font-weight: 600; color: var(--berkeley-blue); font-size: 0.9rem;">${e.type}</p>
                      </div>
                    </div>
                    
                    ${e.stakes ? `
                      <div style="display: flex; align-items: start; gap: 0.5rem; margin-top: 0.25rem;">
                        <p style="margin: 0; font-size: 0.875rem; color: var(--fg); line-height: 1.5;">
                          ${e.stakes}
                        </p>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `);
            });
          }
        } else if (stateData && stateData.elections && stateData.elections.length) {
          // State has elections - show key dates first
          list.append(buildDatesSection(stateAbbr, stateData));
          
          // General elections from CSV
          const generalHtml = buildGeneralElectionCards(stateAbbr);
          if (generalHtml) list.append(generalHtml);

          // Header showing primary count
          if (stateData.elections.length > 0) list.append(`
            <div style="padding: 0.75rem 0 0.5rem; border-top: ${generalHtml ? '2px dashed rgba(0,0,0,0.1)' : '0'}; margin-top: ${generalHtml ? '0.5rem' : '0'};">
              <p style="margin: 0; font-size: 0.875rem; font-weight: 700; color: var(--cerulean); text-transform: uppercase; letter-spacing: 0.05em;">
                ${stateData.elections.length} Primary Election${stateData.elections.length !== 1 ? 's' : ''}
              </p>
            </div>
          `);
          
          // Loop through each election and display it with enhanced design
          stateData.elections.forEach((e, index) => {
            // Determine badge color based on type
            const badgeColors = {
              'Local': 'background: linear-gradient(135deg, #a8dadc, #457b9d); color: white;',
              'State': 'background: linear-gradient(135deg, #457b9d, #1d3557); color: white;',
              'House': 'background: linear-gradient(135deg, #e63946, #c91c28); color: white;',
              'Senate': 'background: linear-gradient(135deg, #7209b7, #5a189a); color: white;'
            };
            const badgeStyle = badgeColors[e.chamberImpact] || 'background: linear-gradient(135deg, #6c757d, #495057); color: white;';
            
            list.append(`
              <div class="election-card">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.75rem; margin-bottom: 0.5rem;">
                  <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--berkeley-blue); flex: 1;">
                    ${e.title}
                  </h4>
                  <span class="election-badge" style="${badgeStyle}">
                    ${e.chamberImpact}
                  </span>
                </div>
                
                <div style="display: grid; gap: 0.5rem; margin-top: 0.75rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1rem;">📅</span>
                    <div>
                      <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.05em;">Date</span>
                      <p style="margin: 0; font-weight: 600; color: var(--berkeley-blue); font-size: 0.9rem;">${e.date}</p>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div>
                      <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.05em;">Type</span>
                      <p style="margin: 0; font-weight: 600; color: var(--berkeley-blue); font-size: 0.9rem;">${e.type}</p>
                    </div>
                  </div>
                  
                  ${e.stakes ? `
                    <div style="display: flex; align-items: start; gap: 0.5rem; margin-top: 0.25rem;">
                      <p style="margin: 0; font-size: 0.875rem; color: var(--fg); line-height: 1.5;">
                        ${e.stakes}
                      </p>
                    </div>
                  ` : ''}
                </div>
              </div>
            `);
          });
        } else if (stateData) {
          list.append(buildDatesSection(stateAbbr, stateData));
          const generalHtml = buildGeneralElectionCards(stateAbbr);
          if (generalHtml) {
            list.append(generalHtml);
          } else {
            list.append('<p class="no-elections-message">No tracked general elections in this state at this time.</p>');
          }
        } else {
          // No state data at all
          list.append('<p class="no-elections-message">No information available for this state.</p>');
        }
        
        // Open modal with proper attribute for CSS styling and centering
        modal.attr('open', '');
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

      /* ========================================
         CLICKABLE SUMMARY STATISTICS
         ========================================
         Show filtered list of states when clicking on stat cards
      */
      
      // Function to show states filtered by general election type (from CSV data)
      function showFilteredStates(filterType) {
        const filterLabels = {
          'Senate':   'Senate Elections',
          'Governor': 'Gubernatorial Elections',
          'Court':    'Court Elections'
        };

        $('#modal-state-name').text(filterLabels[filterType] || filterType);
        const list = $('#modal-elections-list');
        list.empty();

        // Build list of matching states from CSV data
        const matchingStates = [];
        for (const [abbr, csv] of Object.entries(csvElectionData)) {
          const hasType = filterType === 'Senate'   ? csv.senate :
                          filterType === 'Governor' ? csv.gov    :
                          filterType === 'Court'    ? csv.court  : 0;
          if (!hasType) continue;

          const stateInfo = electionData[abbr];
          matchingStates.push({
            code: abbr,
            name: stateInfo ? stateInfo.stateName : abbr,
            regDeadline: fmtDate(csv.reg),
            primaryDate: fmtDate(csv.primaryDate),
            generalDate: fmtDate(csv.generalDate),
            registrationWebsite: stateInfo?.registrationWebsite,
            electionInfoUrl:     stateInfo?.electionInfoUrl
          });
        }

        matchingStates.sort((a, b) => a.name.localeCompare(b.name));

        if (matchingStates.length === 0) {
          list.append('<p class="no-elections-message">No states currently have this type of election.</p>');
        } else {
          list.append(`
            <div class="election-item" style="border-top: 0; padding-top: 0;">
              <p style="color: var(--cerulean); font-weight: 700; margin: 0;">
                ${matchingStates.length} state${matchingStates.length !== 1 ? 's' : ''} with ${filterLabels[filterType]}
              </p>
            </div>
          `);

          matchingStates.forEach(state => {
            list.append(`
              <div class="election-item">
                <h4 style="margin: 0 0 0.4rem;">${state.name} <span style="font-weight: 400; color: var(--cerulean);">(${state.code})</span></h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.5rem;">
                  <div>
                    <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.04em;">Reg. Deadline</span>
                    <p style="margin: 0.15rem 0 0; font-size: 0.85rem; font-weight: 600; color: var(--berkeley-blue);">${state.regDeadline}</p>
                  </div>
                  <div>
                    <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.04em;">Primary</span>
                    <p style="margin: 0.15rem 0 0; font-size: 0.85rem; font-weight: 600; color: var(--berkeley-blue);">${state.primaryDate}</p>
                  </div>
                  <div>
                    <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.04em;">General</span>
                    <p style="margin: 0.15rem 0 0; font-size: 0.85rem; font-weight: 600; color: var(--berkeley-blue);">${state.generalDate}</p>
                  </div>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                  ${state.registrationWebsite ? `<a href="${state.registrationWebsite}" target="_blank" rel="noopener" class="register-button" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;">Register →</a>` : ''}
                  ${state.electionInfoUrl ? `<a href="${state.electionInfoUrl}" target="_blank" rel="noopener" class="register-button" style="padding: 0.35rem 0.7rem; font-size: 0.8rem; background: white; color: var(--cerulean); border: 2px solid var(--cerulean);">Election Info</a>` : ''}
                </div>
              </div>
            `);
          });
        }

        modal.attr('open', '');
      }
      
      // Attach click handlers to clickable summary items
      $('.clickable-stat').on('click', function() {
        const filterType = $(this).data('filter');
        showFilteredStates(filterType);
      });
      
      // Keyboard accessibility for summary items
      $('.clickable-stat').on('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const filterType = $(this).data('filter');
          showFilteredStates(filterType);
        }
      });
    })
    .catch(() => console.error('Failed to load election data.'));
});

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

      // ========================================
      // CALCULATE SUMMARY STATISTICS
      // ========================================
      const statesTracked = Object.keys(electionData).length;
      let total = 0, local = 0, state = 0, house = 0, ref = 0;
      
      // Count each type of election
      Object.values(electionData).forEach(s => {
        (s.elections || []).forEach(e => {
          total += 1;
          if (e.chamberImpact === 'Local') local += 1;
          else if (e.chamberImpact === 'State') state += 1;
          else if (e.chamberImpact === 'House') house += 1;
          else ref += 1;
        });
      });
      
      // Animate the numbers with staggered start times (creates wave effect)
      setTimeout(() => animateNumber($('#sum-states'), statesTracked, 1200), 0);
      setTimeout(() => animateNumber($('#sum-elections'), total, 1200), 100);
      setTimeout(() => animateNumber($('#sum-local'), local, 1000), 200);
      setTimeout(() => animateNumber($('#sum-state'), state, 1000), 300);
      setTimeout(() => animateNumber($('#sum-house'), house, 1000), 400);
      setTimeout(() => animateNumber($('#sum-ref'), ref, 1000), 500);

      /* ========================================
         STATE COLORS CONFIGURATION
         ========================================
         This section controls the colors of each state on the map
         
         HOW TO CUSTOMIZE STATE COLORS:
         1. Change 'fill' variable to set colors based on your criteria
         2. States are colored based on whether they have elections
         3. You can add more complex logic (e.g., color by election type)
      */
      const stateSpecificStyles = {};
      const stateSpecificHoverStyles = {};
      
      for (const abbr in electionData) {
        const s = electionData[abbr];
        const hasElections = (s.elections || []).length > 0;
        
        /* DEFAULT STATE COLOR
           Edit this color to change what states WITHOUT elections look like */
        let fill = '#8a817c'; // dark gray
        
        /* STATES WITH ELECTIONS
           Edit this color to change what states WITH elections look like */
        if (hasElections) fill = '#7b2cbf'; // Dark blue
        
        /* ALTERNATIVE: Color by election type (uncomment to use)
           This will color states differently based on type of election:
        
        const hasHouse = (s.elections || []).some(e => e.chamberImpact === 'House');
        const hasState = (s.elections || []).some(e => e.chamberImpact === 'State');
        const hasLocal = (s.elections || []).some(e => e.chamberImpact === 'Local');
        
        let fill = '#e8f5f7'; // Default light blue
        if (hasHouse) fill = '#e63946';      // Red for House elections
        else if (hasState) fill = '#457b9d'; // Medium blue for State elections
        else if (hasLocal) fill = '#a8dadc'; // Light blue for Local elections
        */
        
        /* ALTERNATIVE: Color by number of elections (uncomment to use)
           This will create a gradient based on how many elections:
        
        const numElections = (s.elections || []).length;
        if (numElections === 0) fill = '#e8f5f7';      // Very light blue
        else if (numElections === 1) fill = '#a8dadc'; // Light blue
        else if (numElections === 2) fill = '#457b9d'; // Medium blue
        else fill = '#1d3557';                         // Dark blue (3+ elections)
        */
        
        // Apply the fill color and styling to this state
        stateSpecificStyles[abbr] = { 
          fill,
          stroke: '#ffffff',              // Border color (WHITE - hardcoded)
          'stroke-width': 2,              // Border thickness
          'filter': 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'  // Shadow effect
        };
        
        // Hover style - what color state becomes when you mouse over it
        stateSpecificHoverStyles[abbr] = { 
          fill: '#457b9d',                // Hover color (medium blue)
          stroke: '#ffffff',              // Border color stays white on hover
          'stroke-width': 3,              // Thicker border on hover
          'filter': 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'   // Bigger shadow
        };
      }

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
          fill: '#457b9d',                // Hover color
          stroke: '#ffffff',              // Border color stays white on hover
          'stroke-width': 3,
          'filter': 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
          'transform': 'scale(1.02)'      // Slightly enlarges state on hover
        },
        
        showLabels: true,                 // Show state abbreviations on map
        
        // Individual state styles (overrides defaults)
        stateSpecificStyles,
        stateSpecificHoverStyles,
        
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
          
          if (s && s.elections && s.elections.length) {
            html += `${s.elections.length} election(s)`;
            
            /* OPTIONAL: Show election types in tooltip (uncomment to use)
            const types = s.elections.map(e => e.chamberImpact).join(', ');
            html += `<br/>${types}`;
            */
          } else {
            html += 'No elections listed';
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
          openModal(s ? s.stateName : data.name, s);
        }
      });

      /* ========================================
         MODAL (POPUP) FUNCTIONS
         ========================================
         Handles the detail popup when you click a state
      */
      const modal = $('#info-modal');
      const closeBtn = $('.close-btn');
      
      // Opens the modal and populates it with state data
      function openModal(stateName, stateData) {
        // Hide tooltip when modal opens
        tooltip.hide();
        
        $('#modal-state-name').text(stateName);
        const list = $('#modal-elections-list');
        list.empty();
        
        if (stateData && stateData.elections && stateData.elections.length) {
          // State has elections - show registration info first with enhanced design
          if (stateData.registrationDeadline || stateData.registrationWebsite) {
            list.append(`
              <div class="registration-info">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <span style="font-size: 1.5rem;">🗳️</span>
                  <h4 style="margin: 0; font-size: 1rem; color: var(--berkeley-blue);">Voter Registration</h4>
                </div>
                <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-top: 0.5rem;">
                  <div>
                    <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.05em;">Deadline</span>
                    <p style="margin: 0.25rem 0 0; font-weight: 700; font-size: 1rem; color: var(--berkeley-blue);">
                      ${stateData.registrationDeadline || '—'}
                    </p>
                  </div>
                  ${stateData.registrationWebsite ? `
                    <a href="${stateData.registrationWebsite}" target="_blank" rel="noopener" class="register-button">
                      Register to Vote →
                    </a>
                  ` : ''}
                </div>
              </div>
            `);
          }
          
          // Header showing count
          list.append(`
            <div style="padding: 0.75rem 0 0.5rem; border-top: 0;">
              <p style="margin: 0; font-size: 0.875rem; font-weight: 700; color: var(--cerulean); text-transform: uppercase; letter-spacing: 0.05em;">
                ${stateData.elections.length} Upcoming Election${stateData.elections.length !== 1 ? 's' : ''}
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
            
            // Icon based on type
            const icons = {
              'Local': '🏛️',
              'State': '🏢',
              'House': '🏛️',
              'Senate': '⚖️'
            };
            const icon = icons[e.chamberImpact] || '📋';
            
            list.append(`
              <div class="election-card">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.75rem; margin-bottom: 0.5rem;">
                  <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--berkeley-blue); flex: 1;">
                    ${icon} ${e.title}
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
                    <span style="font-size: 1rem;">🗳️</span>
                    <div>
                      <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--cerulean); letter-spacing: 0.05em;">Type</span>
                      <p style="margin: 0; font-weight: 600; color: var(--berkeley-blue); font-size: 0.9rem;">${e.type}</p>
                    </div>
                  </div>
                  
                  ${e.stakes ? `
                    <div style="display: flex; align-items: start; gap: 0.5rem; margin-top: 0.25rem;">
                      <span style="font-size: 1rem;">ℹ️</span>
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
          // No elections but we have state data - show just registration info
          list.append('<p class="no-elections-message">No tracked elections in this state at this time.</p>');
          if (stateData.registrationDeadline || stateData.registrationWebsite) {
            list.append(`
              <div class="registration-info">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <span style="font-size: 1.5rem;">🗳️</span>
                  <h4 style="margin: 0; font-size: 1rem; color: var(--berkeley-blue);">Voter Registration</h4>
                </div>
                <p style="margin: 0.5rem 0; font-size: 0.9rem;">
                  <strong>Deadline:</strong> ${stateData.registrationDeadline || 'Check with your local election office'}
                </p>
                ${stateData.registrationWebsite ? `
                  <a href="${stateData.registrationWebsite}" target="_blank" rel="noopener" class="register-button">
                    Register to Vote →
                  </a>
                ` : ''}
              </div>
            `);
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
      
      // Function to show states filtered by election type
      function showFilteredStates(filterType) {
        const filterLabels = {
          'Local': 'Local Elections',
          'State': 'State Elections',
          'House': 'U.S. House Elections',
          'Other': 'Referendums'
        };
        
        $('#modal-state-name').text(filterLabels[filterType] || filterType);
        const list = $('#modal-elections-list');
        list.empty();
        
        // Find all states with elections of this type
        const matchingStates = [];
        
        for (const [stateCode, stateData] of Object.entries(electionData)) {
          if (!stateData.elections || stateData.elections.length === 0) continue;
          
          const electionsOfType = stateData.elections.filter(e => {
            if (filterType === 'Other') {
              return e.chamberImpact !== 'Local' && e.chamberImpact !== 'State' && e.chamberImpact !== 'House';
            }
            return e.chamberImpact === filterType;
          });
          
          if (electionsOfType.length > 0) {
            matchingStates.push({
              code: stateCode,
              name: stateData.stateName,
              elections: electionsOfType,
              registrationDeadline: stateData.registrationDeadline,
              registrationWebsite: stateData.registrationWebsite
            });
          }
        }
        
        // Sort states alphabetically
        matchingStates.sort((a, b) => a.name.localeCompare(b.name));
        
        if (matchingStates.length === 0) {
          list.append('<p class="no-elections-message">No states currently have this type of election.</p>');
        } else {
          // Add header with count
          list.append(`
            <div class="election-item" style="border-top: 0; padding-top: 0;">
              <p style="color: var(--cerulean); font-weight: 700; margin: 0;">
                ${matchingStates.length} state${matchingStates.length !== 1 ? 's' : ''} with ${filterLabels[filterType]}
              </p>
            </div>
          `);
          
          // Display each state
          matchingStates.forEach(state => {
            const electionsList = state.elections.map(e => 
              `<li><strong>${e.title}</strong> — ${e.date}</li>`
            ).join('');
            
            list.append(`
              <div class="election-item">
                <h4 style="display: flex; align-items: center; gap: 0.5rem;">
                  ${state.name} (${state.code})
                  <span style="font-size: 0.75rem; font-weight: 600; background: color-mix(in oklab, var(--cerulean), transparent 85%); 
                        color: var(--cerulean); padding: 0.15rem 0.5rem; border-radius: 0.25rem;">
                    ${state.elections.length} election${state.elections.length !== 1 ? 's' : ''}
                  </span>
                </h4>
                <ul style="margin: 0.5rem 0 0 1.25rem; padding: 0; list-style: disc; color: var(--berkeley-blue);">
                  ${electionsList}
                </ul>
                ${state.registrationWebsite ? `
                  <p style="margin: 0.5rem 0 0; font-size: 0.875rem;">
                    <a href="${state.registrationWebsite}" target="_blank" rel="noopener" class="register-button" 
                       style="padding: 0.4rem 0.8rem; font-size: 0.8125rem; margin-top: 0.25rem;">
                      Register in ${state.name} →
                    </a>
                  </p>
                ` : ''}
              </div>
            `);
          });
        }
        
        // Open the modal
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

// Wait for the document to be ready before running jQuery code
$(document).ready(function() {
  const tooltip = $('#tooltip');
  
  // Show loading overlay
  $('#loading-overlay').show();

  fetch('elections.json')
    .then(response => response.json())
    .then(data => {
      const electionData = data.electionData;
      const stateSpecificStyles = {};
      const stateSpecificHoverStyles = {};
      const stateSpecificLabelBackingStyles = {};
      const stateSpecificLabelBackingHoverStyles = {};

      // Populate footer and stats
      const lastUpdated = new Date(data.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      $('#last-updated').text(lastUpdated);
      $('#contact-link').attr('href', `mailto:${data.contactEmail}`);
      
      // Update hero stats
      const totalStates = Object.keys(electionData).length;
      const totalElections = Object.values(electionData).reduce((sum, state) => sum + state.elections.length, 0);
      const competitiveRaces = Object.values(electionData).reduce((sum, state) => 
        sum + state.elections.filter(election => election.competitive).length, 0);
      
      $('#total-states').text(totalStates);
      $('#total-elections').text(totalElections);
      $('#competitive-races').text(competitiveRaces);

      // Prepare state-specific styles for states and their labels
      for (const state in electionData) {
        if (electionData.hasOwnProperty(state)) {
          const stateData = electionData[state];
          const hasSenateRace = stateData.elections.some(e => e.chamberImpact === 'Senate');
          const hasCompetitiveRace = stateData.elections.some(e => e.competitive);
          
          // Color based on race type and competitiveness
          let highlightColor = '#6b7280'; // Default gray
          let hoverColor = '#9ca3af';
          
          if (hasSenateRace && hasCompetitiveRace) {
            highlightColor = '#dc2626'; // Red for competitive Senate
            hoverColor = '#ef4444';
          } else if (hasSenateRace) {
            highlightColor = '#2563eb'; // Blue for Senate
            hoverColor = '#3b82f6';
          } else if (hasCompetitiveRace) {
            highlightColor = '#f59e0b'; // Orange for competitive
            hoverColor = '#fbbf24';
          }
          
          stateSpecificStyles[state] = { fill: highlightColor };
          stateSpecificHoverStyles[state] = { fill: hoverColor };
          stateSpecificLabelBackingStyles[state] = { 
            fill: highlightColor,
            stroke: '#ffffff',
            'stroke-width': 2,
            'fill-opacity': 0.9
          };
          stateSpecificLabelBackingHoverStyles[state] = { 
            fill: hoverColor,
            stroke: '#ffffff',
            'stroke-width': 2,
            'fill-opacity': 0.9
          };
        }
      }

      $('#map').usmap({
        stateStyles: {
          fill: '#d3d3d3',
          "stroke-width": 1,
          'stroke' : '#ffffff'
        },
        stateHoverStyles: {
          fill: '#b0b0b0'
        },
        labelBackingStyles: {
          fill: '#d3d3d3'
        },
        labelBackingHoverStyles: {
          fill: '#b0b0b0'
        },
        
        // Apply all state-specific styles
        stateSpecificStyles: stateSpecificStyles,
        stateSpecificHoverStyles: stateSpecificHoverStyles,
        stateSpecificLabelBackingStyles: stateSpecificLabelBackingStyles,
        stateSpecificLabelBackingHoverStyles: stateSpecificLabelBackingHoverStyles,
        
        showLabels: true,
        labelWidth: 20,
        labelHeight: 15,
        labelGap: 6,
        labelRadius: 3,
        labelTextStyles: {
            fill: "#222",
            'font-size': '10px',
            'font-weight': 'bold',
            'text-anchor': 'middle'
        },
        labelBackingStyles: {
            fill: '#ffffff',
            stroke: '#cccccc',
            'stroke-width': 1,
            'fill-opacity': 0.85
        },
        labelBackingHoverStyles: {
            fill: '#f0f0f0',
            stroke: '#999999',
            'stroke-width': 1
        },

        click: function(event, data) {
          const stateElections = electionData[data.name];
          openModal(data.name, stateElections);
        },
        
        // Hover functionality
        mouseover: function(event, data) {
            const stateElections = electionData[data.name];
            let tooltipText = `<div class="tooltip-content">`;
            tooltipText += `<strong>${stateElections ? stateElections.stateName : data.name}</strong><br>`;
            
            if (stateElections) {
                tooltipText += `<div class="tooltip-section">`;
                tooltipText += `<strong>📅 Registration Deadline:</strong> ${stateElections.registrationDeadline}<br>`;
                tooltipText += `<strong>🔗 Register:</strong> <a href="${stateElections.registrationWebsite}" target="_blank">State Website</a><br>`;
                tooltipText += `</div>`;
                
                tooltipText += `<div class="tooltip-section">`;
                tooltipText += `<strong>🗳️ Elections (${stateElections.elections.length}):</strong><br>`;
                stateElections.elections.forEach(election => {
                    const incumbentText = election.candidates.some(c => c.incumbent) ? " (Incumbent Running)" : "";
                    const competitiveText = election.competitive ? " ⚡" : "";
                    tooltipText += `• ${election.title}${incumbentText}${competitiveText}<br>`;
                });
                tooltipText += `</div>`;
                
                tooltipText += `<div class="tooltip-section">`;
                tooltipText += `<strong>🎯 What's at Stake:</strong><br>`;
                const chamberImpacts = [...new Set(stateElections.elections.map(e => e.chamberImpact))];
                tooltipText += `• ${chamberImpacts.join(', ')} control<br>`;
                tooltipText += `</div>`;
            } else {
                tooltipText += "No upcoming elections tracked";
            }
            tooltipText += `</div>`;
            
            tooltip.html(tooltipText).css({
                top: event.pageY - 120, // Position tooltip above cursor
                left: event.pageX + 10  // Position tooltip to the right of the cursor
            }).show();
        },
        mouseout: function(event, data) {
            tooltip.hide();
        },
        mousemove: function(event, data) {
            tooltip.css({
                top: event.pageY - 40, // Position tooltip above cursor
                left: event.pageX + 10  // Position tooltip to the right of the cursor
            });
        }
      });
      
      // Hide loading overlay after map is loaded
      setTimeout(() => {
        $('#loading-overlay').fadeOut(500);
      }, 1000);
    })
    .catch(error => {
      console.error('Error loading election data:', error);
      $('#loading-overlay').fadeOut(500);
    });

  // Modal functionality
  const modal = $('#info-modal');
  const closeBtn = $('.close-btn');

  function openModal(stateName, stateData) {
    $('#modal-state-name').text(`Upcoming Elections in ${stateData ? stateData.stateName : stateName}`);
    const electionsList = $('#modal-elections-list');
    electionsList.empty();

    if (stateData && stateData.elections.length > 0) {
      // Add registration information at the top
      const registrationInfo = `
        <div class="registration-info">
          <h3>📋 Voter Registration</h3>
          <p><strong>Deadline:</strong> ${stateData.registrationDeadline}</p>
          <p><strong>Register Online:</strong> <a href="${stateData.registrationWebsite}" target="_blank">${stateData.registrationWebsite}</a></p>
        </div>
      `;
      electionsList.append(registrationInfo);

      stateData.elections.forEach(election => {
        const candidatesList = election.candidates.map(candidate => {
          const incumbentBadge = candidate.incumbent ? ' <span class="incumbent-badge">(Incumbent)</span>' : '';
          const partyClass = candidate.party === 'Republican' ? 'republican' : 
                           candidate.party === 'Democratic' ? 'democratic' : 'independent';
          return `<span class="candidate ${partyClass}">${candidate.name} (${candidate.party})${incumbentBadge}</span>`;
        }).join(' vs. ');

        const competitiveBadge = election.competitive ? '<span class="competitive-badge">⚡ Competitive Race</span>' : '';
        const chamberBadge = `<span class="chamber-badge">${election.chamberImpact}</span>`;

        const electionItem = `
          <div class="election-item">
            <div class="election-header">
              <h4>${election.title}</h4>
              <div class="election-badges">
                ${competitiveBadge}
                ${chamberBadge}
              </div>
            </div>
            <p><strong>Date:</strong> ${election.date}</p>
            <p><strong>Type:</strong> ${election.type}</p>
            <p><strong>Candidates:</strong> ${candidatesList}</p>
            <p><strong>What's at Stake:</strong> ${election.stakes}</p>
          </div>
        `;
        electionsList.append(electionItem);
      });
    } else {
      electionsList.append('<p>There are no major upcoming elections to display for this state.</p>');
    }

    modal.show();
  }

  function closeModal() {
    modal.hide();
  }

  closeBtn.on('click', closeModal);
  $(window).on('click', function(event) {
    if ($(event.target).is(modal)) {
      closeModal();
    }
  });

  // Smooth scrolling for navigation links
  $('a[href^="#"]').on('click', function(e) {
    e.preventDefault();
    const target = $(this.getAttribute('href'));
    if (target.length) {
      $('html, body').animate({
        scrollTop: target.offset().top - 80
      }, 800);
    }
  });

  // Add scroll effect to navbar
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.navbar').addClass('scrolled');
    } else {
      $('.navbar').removeClass('scrolled');
    }
  });

  // Animate stats on scroll
  function animateStats() {
    $('.stat-number').each(function() {
      const $this = $(this);
      const countTo = parseInt($this.text());
      
      $({ countNum: 0 }).animate({
        countNum: countTo
      }, {
        duration: 2000,
        easing: 'swing',
        step: function() {
          $this.text(Math.floor(this.countNum));
        },
        complete: function() {
          $this.text(this.countNum);
        }
      });
    });
  }

  // Trigger stats animation when hero section is in view
  $(window).scroll(function() {
    const heroBottom = $('.hero').offset().top + $('.hero').outerHeight();
    const windowTop = $(window).scrollTop() + $(window).height();
    
    if (windowTop > heroBottom && !$('.stat-number').hasClass('animated')) {
      $('.stat-number').addClass('animated');
      animateStats();
    }
  });

  // Add hover effects to feature cards
  $('.feature-card').hover(
    function() {
      $(this).find('.feature-icon').addClass('bounce');
    },
    function() {
      $(this).find('.feature-icon').removeClass('bounce');
    }
  );
});

// --- Side Panel Logic ---

// Store the detailed information for each state
const stateDetails = {
    'CA': {
        title: 'California',
        content: 'California is a western U.S. state, stretching from the Mexican border along the Pacific for nearly 900 miles...'
    },
    'CO': {
        title: 'Colorado',
        content: 'Colorado, a western U.S. state, has a diverse landscape of arid desert, river canyons and snow-covered Rocky Mountains...'
    },
    'FL': {
        title: 'Florida',
        content: 'Florida is the southeasternmost U.S. state, with the Atlantic on one side and the Gulf of Mexico on the other...'
    },
    'NY': {
        title: 'New York',
        content: 'New York is a state in the northeastern U.S., known for New York City and the iconic Statue of Liberty...'
    }
    // ... add details for all other states you want to be interactive
};

function openPanel(stateAbbr) {
    const details = stateDetails[stateAbbr];
    if (details) {
        // Populate the panel with the state's information
        $('#panel-title').text(details.title);
        $('#panel-content').text(details.content);

        // Open the panel using jQuery's .css() method
        $('#side-panel').css('width', '350px');
    }
}

function closePanel() {
    // Close the panel
    $('#side-panel').css('width', '0');
}

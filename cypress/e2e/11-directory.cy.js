describe('Directory System', () => {
  const testData = {
    consultant: {
      id: 'ci-test-consultant',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'Consultant',
      specialization: 'Epic Implementation',
      location: 'Remote',
      phone: '+1-555-0123'
    },
    searchQueries: {
      valid: ['Test', 'Epic', 'consultant', 'Remote'],
      invalid: ['xyz123', '!@#$%', ''],
      partial: ['Te', 'Ep', 'con']
    },
    filters: {
      specializations: ['Epic Implementation', 'Cerner', 'Allscripts'],
      locations: ['Remote', 'On-site', 'Hybrid'],
      availability: ['Available', 'Busy', 'Away']
    }
  };

  beforeEach(() => {
    // Login as admin user for directory access
    cy.login('test@example.com', 'password123');
    
    // Setup API intercepts for directory operations
    cy.intercept('GET', '/api/directory/consultants*', { fixture: 'directory/consultants.json' }).as('getDirectoryConsultants');
    cy.intercept('GET', '/api/consultants/*/profile', { fixture: 'directory/consultant-profile.json' }).as('getConsultantProfile');
    cy.intercept('GET', '/api/consultants/search*', { fixture: 'directory/search-results.json' }).as('searchConsultants');
    cy.intercept('GET', '/api/consultants', { fixture: 'directory/all-consultants.json' }).as('getAllConsultants');
  });

  describe('Directory Page Access and Navigation', () => {
    it('should access directory from main navigation', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="nav-directory"]').should('be.visible').click();
      cy.url().should('include', '/directory');
      cy.get('[data-testid="directory-page"]').should('be.visible');
    });

    it('should have proper page title and breadcrumbs', () => {
      cy.visit('/directory');
      cy.get('[data-testid="page-title"]').should('contain.text', 'Consultant Directory');
      cy.get('[data-testid="breadcrumb"]').should('contain.text', 'Directory');
      cy.title().should('contain', 'Directory');
    });

    it('should display loading state initially', () => {
      cy.intercept('GET', '/api/directory/consultants*', { delay: 1000, fixture: 'directory/consultants.json' }).as('slowDirectoryLoad');
      cy.visit('/directory');
      cy.get('[data-testid="directory-loading"]').should('be.visible');
      cy.get('[data-testid="loading-skeleton"]').should('be.visible');
      cy.wait('@slowDirectoryLoad');
      cy.get('[data-testid="directory-loading"]').should('not.exist');
    });

    it('should handle unauthorized access gracefully', () => {
      cy.clearCookies();
      cy.visit('/directory');
      cy.url().should('include', '/login');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Please log in to access the directory');
    });
  });

  describe('Directory Layout and UI Components', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should display all main directory components', () => {
      cy.get('[data-testid="directory-search-bar"]').should('be.visible');
      cy.get('[data-testid="directory-filters"]').should('be.visible');
      cy.get('[data-testid="directory-results"]').should('be.visible');
      cy.get('[data-testid="directory-pagination"]').should('be.visible');
      cy.get('[data-testid="results-count"]').should('be.visible');
    });

    it('should display consultant cards with all required information', () => {
      cy.get('[data-testid="consultant-card"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="consultant-avatar"]').should('be.visible');
        cy.get('[data-testid="consultant-name"]').should('be.visible').and('not.be.empty');
        cy.get('[data-testid="consultant-specialization"]').should('be.visible');
        cy.get('[data-testid="consultant-location"]').should('be.visible');
        cy.get('[data-testid="consultant-availability"]').should('be.visible');
        cy.get('[data-testid="consultant-rating"]').should('be.visible');
        cy.get('[data-testid="view-profile-button"]').should('be.visible').and('not.be.disabled');
      });
    });

    it('should display view toggle buttons', () => {
      cy.get('[data-testid="view-toggle"]').should('be.visible');
      cy.get('[data-testid="view-grid"]').should('be.visible');
      cy.get('[data-testid="view-list"]').should('be.visible');
      cy.get('[data-testid="view-table"]').should('be.visible');
    });

    it('should display sort options', () => {
      cy.get('[data-testid="sort-dropdown"]').should('be.visible');
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-name"]').should('be.visible');
      cy.get('[data-testid="sort-rating"]').should('be.visible');
      cy.get('[data-testid="sort-experience"]').should('be.visible');
      cy.get('[data-testid="sort-availability"]').should('be.visible');
    });

    it('should handle empty state correctly', () => {
      cy.intercept('GET', '/api/directory/consultants*', { body: { consultants: [], total: 0 } }).as('emptyDirectory');
      cy.reload();
      cy.wait('@emptyDirectory');
      
      cy.get('[data-testid="empty-directory"]').should('be.visible');
      cy.get('[data-testid="empty-directory-message"]').should('contain.text', 'No consultants found');
      cy.get('[data-testid="empty-directory-icon"]').should('be.visible');
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should perform basic search with valid queries', () => {
      testData.searchQueries.valid.forEach(query => {
        cy.get('[data-testid="directory-search-input"]').clear().type(query);
        cy.get('[data-testid="search-button"]').click();
        cy.wait('@searchConsultants');
        
        cy.get('[data-testid="search-results"]').should('be.visible');
        cy.get('[data-testid="search-query-display"]').should('contain.text', query);
        cy.get('[data-testid="clear-search"]').should('be.visible');
      });
    });

    it('should handle search with Enter key', () => {
      cy.get('[data-testid="directory-search-input"]')
        .type('Test Consultant{enter}');
      cy.wait('@searchConsultants');
      cy.get('[data-testid="search-results"]').should('be.visible');
    });

    it('should show search suggestions/autocomplete', () => {
      cy.get('[data-testid="directory-search-input"]').type('Te');
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
      cy.get('[data-testid="suggestion-item"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid="suggestion-item"]').first().click();
      cy.wait('@searchConsultants');
    });

    it('should handle partial search queries', () => {
      testData.searchQueries.partial.forEach(query => {
        cy.get('[data-testid="directory-search-input"]').clear().type(query);
        cy.get('[data-testid="search-button"]').click();
        cy.wait('@searchConsultants');
        
        cy.get('[data-testid="search-results"]').should('be.visible');
      });
    });

    it('should handle empty search results', () => {
      cy.intercept('GET', '/api/consultants/search*', { body: { consultants: [], total: 0 } }).as('emptySearch');
      
      cy.get('[data-testid="directory-search-input"]').type('xyz123nonexistent');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@emptySearch');
      
      cy.get('[data-testid="no-search-results"]').should('be.visible');
      cy.get('[data-testid="no-results-message"]').should('contain.text', 'No consultants found matching your search');
      cy.get('[data-testid="search-suggestions-help"]').should('be.visible');
    });

    it('should clear search results', () => {
      cy.get('[data-testid="directory-search-input"]').type('Test');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@searchConsultants');
      
      cy.get('[data-testid="clear-search"]').click();
      cy.get('[data-testid="directory-search-input"]').should('have.value', '');
      cy.wait('@getDirectoryConsultants');
      cy.get('[data-testid="directory-results"]').should('be.visible');
    });

    it('should preserve search query in URL', () => {
      const searchQuery = 'Epic Implementation';
      cy.get('[data-testid="directory-search-input"]').type(searchQuery);
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@searchConsultants');
      
      cy.url().should('include', `search=${encodeURIComponent(searchQuery)}`);
      
      cy.reload();
      cy.get('[data-testid="directory-search-input"]').should('have.value', searchQuery);
    });

    it('should handle special characters in search', () => {
      const specialChars = ['@', '#', '$', '%', '&', '*'];
      specialChars.forEach(char => {
        cy.get('[data-testid="directory-search-input"]').clear().type(`test${char}`);
        cy.get('[data-testid="search-button"]').click();
        cy.wait('@searchConsultants');
      });
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should display all filter categories', () => {
      cy.get('[data-testid="filter-specialization"]').should('be.visible');
      cy.get('[data-testid="filter-location"]').should('be.visible');
      cy.get('[data-testid="filter-availability"]').should('be.visible');
      cy.get('[data-testid="filter-experience"]').should('be.visible');
      cy.get('[data-testid="filter-rating"]').should('be.visible');
    });

    it('should apply single filter correctly', () => {
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-epic"]').click();
      cy.get('[data-testid="apply-filters"]').click();
      
      cy.wait('@getDirectoryConsultants');
      cy.get('[data-testid="active-filter-tag"]').should('contain.text', 'Epic Implementation');
      cy.get('[data-testid="filtered-results"]').should('be.visible');
    });

    it('should apply multiple filters simultaneously', () => {
      // Apply specialization filter
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-epic"]').click();
      
      // Apply location filter
      cy.get('[data-testid="filter-location"]').click();
      cy.get('[data-testid="location-remote"]').click();
      
      // Apply availability filter
      cy.get('[data-testid="filter-availability"]').click();
      cy.get('[data-testid="availability-available"]').click();
      
      cy.get('[data-testid="apply-filters"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="active-filter-tag"]').should('have.length', 3);
    });

    it('should remove individual filters', () => {
      // Apply multiple filters first
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-epic"]').click();
      cy.get('[data-testid="filter-location"]').click();
      cy.get('[data-testid="location-remote"]').click();
      cy.get('[data-testid="apply-filters"]').click();
      cy.wait('@getDirectoryConsultants');
      
      // Remove one filter
      cy.get('[data-testid="active-filter-tag"]').first().within(() => {
        cy.get('[data-testid="remove-filter"]').click();
      });
      
      cy.wait('@getDirectoryConsultants');
      cy.get('[data-testid="active-filter-tag"]').should('have.length', 1);
    });

    it('should clear all filters', () => {
      // Apply multiple filters
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-epic"]').click();
      cy.get('[data-testid="filter-location"]').click();
      cy.get('[data-testid="location-remote"]').click();
      cy.get('[data-testid="apply-filters"]').click();
      cy.wait('@getDirectoryConsultants');
      
      // Clear all filters
      cy.get('[data-testid="clear-all-filters"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="active-filter-tag"]').should('not.exist');
      cy.get('[data-testid="filter-count"]').should('not.exist');
    });

    it('should show filter counts', () => {
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-option"]').each($el => {
        cy.wrap($el).within(() => {
          cy.get('[data-testid="filter-count"]').should('be.visible').and('contain', '(');
        });
      });
    });

    it('should handle experience level filter', () => {
      cy.get('[data-testid="filter-experience"]').click();
      cy.get('[data-testid="experience-slider"]').should('be.visible');
      
      // Drag slider to set minimum experience
      cy.get('[data-testid="experience-slider"]')
        .invoke('val', 5)
        .trigger('input');
      
      cy.get('[data-testid="experience-value"]').should('contain.text', '5');
      cy.get('[data-testid="apply-filters"]').click();
      cy.wait('@getDirectoryConsultants');
    });

    it('should handle rating filter', () => {
      cy.get('[data-testid="filter-rating"]').click();
      cy.get('[data-testid="rating-4-plus"]').click();
      cy.get('[data-testid="apply-filters"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="active-filter-tag"]').should('contain.text', '4+ Stars');
    });

    it('should preserve filters in URL', () => {
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-epic"]').click();
      cy.get('[data-testid="apply-filters"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.url().should('include', 'specialization=epic');
      
      cy.reload();
      cy.get('[data-testid="active-filter-tag"]').should('be.visible');
    });
  });

  describe('Sorting Functionality', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should sort by name (A-Z)', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-name-asc"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="consultant-name"]').then($names => {
        const names = Array.from($names, el => el.textContent.trim());
        const sortedNames = [...names].sort();
        expect(names).to.deep.equal(sortedNames);
      });
    });

    it('should sort by name (Z-A)', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-name-desc"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="consultant-name"]').then($names => {
        const names = Array.from($names, el => el.textContent.trim());
        const sortedNames = [...names].sort().reverse();
        expect(names).to.deep.equal(sortedNames);
      });
    });

    it('should sort by rating (highest first)', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-rating-desc"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="consultant-rating"]').then($ratings => {
        const ratings = Array.from($ratings, el => parseFloat(el.textContent));
        const sortedRatings = [...ratings].sort((a, b) => b - a);
        expect(ratings).to.deep.equal(sortedRatings);
      });
    });

    it('should sort by experience (most experienced first)', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-experience-desc"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="consultant-experience"]').should('be.visible');
      cy.get('[data-testid="sort-indicator"]').should('contain.text', 'Experience (High to Low)');
    });

    it('should sort by availability status', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-availability"]').click();
      cy.wait('@getDirectoryConsultants');
      
      // Available consultants should appear first
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="consultant-availability"]').should('contain.text', 'Available');
      });
    });

    it('should maintain sort order across pagination', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-name-asc"]').click();
      cy.wait('@getDirectoryConsultants');
      
      // Go to next page
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getDirectoryConsultants');
      
      // Verify sort order is maintained
      cy.get('[data-testid="sort-indicator"]').should('contain.text', 'Name (A-Z)');
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants*', { fixture: 'directory/consultants-paginated.json' }).as('getPaginatedConsultants');
      cy.visit('/directory');
      cy.wait('@getPaginatedConsultants');
    });

    it('should display pagination controls', () => {
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]').should('be.visible');
      cy.get('[data-testid="pagination-prev"]').should('be.visible');
      cy.get('[data-testid="pagination-next"]').should('be.visible');
      cy.get('[data-testid="pagination-pages"]').should('be.visible');
    });

    it('should show correct pagination info', () => {
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1-20 of');
      cy.get('[data-testid="total-results"]').should('be.visible');
    });

    it('should navigate to next page', () => {
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getPaginatedConsultants');
      
      cy.url().should('include', 'page=2');
      cy.get('[data-testid="current-page"]').should('contain.text', '2');
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 21-40 of');
    });

    it('should navigate to previous page', () => {
      // Go to page 2 first
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getPaginatedConsultants');
      
      // Then go back to page 1
      cy.get('[data-testid="pagination-prev"]').click();
      cy.wait('@getPaginatedConsultants');
      
      cy.url().should('include', 'page=1');
      cy.get('[data-testid="current-page"]').should('contain.text', '1');
    });

    it('should navigate to specific page', () => {
      cy.get('[data-testid="page-3"]').click();
      cy.wait('@getPaginatedConsultants');
      
      cy.url().should('include', 'page=3');
      cy.get('[data-testid="current-page"]').should('contain.text', '3');
    });

    it('should disable previous button on first page', () => {
      cy.get('[data-testid="pagination-prev"]').should('be.disabled');
    });

    it('should disable next button on last page', () => {
      // Navigate to last page
      cy.get('[data-testid="last-page"]').click();
      cy.wait('@getPaginatedConsultants');
      
      cy.get('[data-testid="pagination-next"]').should('be.disabled');
    });

    it('should handle page size changes', () => {
      cy.get('[data-testid="page-size-selector"]').select('50');
      cy.wait('@getPaginatedConsultants');
      
      cy.url().should('include', 'limit=50');
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1-50 of');
    });

    it('should reset to first page when applying filters', () => {
      // Go to page 2
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getPaginatedConsultants');
      
      // Apply a filter
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-epic"]').click();
      cy.get('[data-testid="apply-filters"]').click();
      cy.wait('@getPaginatedConsultants');
      
      // Should be back to page 1
      cy.get('[data-testid="current-page"]').should('contain.text', '1');
    });
  });

  describe('View Modes', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should switch to grid view', () => {
      cy.get('[data-testid="view-grid"]').click();
      cy.get('[data-testid="directory-results"]').should('have.class', 'grid-view');
      cy.get('[data-testid="consultant-card"]').should('have.class', 'card-grid');
    });

    it('should switch to list view', () => {
      cy.get('[data-testid="view-list"]').click();
      cy.get('[data-testid="directory-results"]').should('have.class', 'list-view');
      cy.get('[data-testid="consultant-card"]').should('have.class', 'card-list');
    });

    it('should switch to table view', () => {
      cy.get('[data-testid="view-table"]').click();
      cy.get('[data-testid="directory-table"]').should('be.visible');
      cy.get('[data-testid="table-header-name"]').should('be.visible');
      cy.get('[data-testid="table-header-specialization"]').should('be.visible');
      cy.get('[data-testid="table-header-location"]').should('be.visible');
      cy.get('[data-testid="table-header-rating"]').should('be.visible');
      cy.get('[data-testid="table-header-availability"]').should('be.visible');
    });

    it('should preserve view mode in localStorage', () => {
      cy.get('[data-testid="view-list"]').click();
      cy.reload();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="directory-results"]').should('have.class', 'list-view');
      cy.get('[data-testid="view-list"]').should('have.class', 'active');
    });

    it('should display different information in each view mode', () => {
      // Grid view - compact info
      cy.get('[data-testid="view-grid"]').click();
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]').should('be.visible');
        cy.get('[data-testid="consultant-specialization"]').should('be.visible');
        cy.get('[data-testid="consultant-rating"]').should('be.visible');
      });

      // List view - detailed info
      cy.get('[data-testid="view-list"]').click();
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]').should('be.visible');
        cy.get('[data-testid="consultant-specialization"]').should('be.visible');
        cy.get('[data-testid="consultant-location"]').should('be.visible');
        cy.get('[data-testid="consultant-experience"]').should('be.visible');
        cy.get('[data-testid="consultant-bio"]').should('be.visible');
      });

      // Table view - tabular data
      cy.get('[data-testid="view-table"]').click();
      cy.get('[data-testid="table-row"]').first().within(() => {
        cy.get('[data-testid="cell-name"]').should('be.visible');
        cy.get('[data-testid="cell-specialization"]').should('be.visible');
        cy.get('[data-testid="cell-location"]').should('be.visible');
        cy.get('[data-testid="cell-rating"]').should('be.visible');
        cy.get('[data-testid="cell-actions"]').should('be.visible');
      });
    });
  });

  describe('Consultant Profile Access', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should open consultant profile from card', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-button"]').click();
      });
      
      cy.wait('@getConsultantProfile');
      cy.url().should('include', '/consultants/');
      cy.get('[data-testid="consultant-profile-page"]').should('be.visible');
    });

    it('should open profile in new tab when requested', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-button"]').rightclick();
      });
      
      cy.get('[data-testid="context-menu"]').should('be.visible');
      cy.get('[data-testid="open-in-new-tab"]').click();
      
      // Verify new tab would be opened (Cypress limitation - can't test actual new tabs)
      cy.window().its('open').should('have.been.called');
    });

    it('should display profile preview on hover', () => {
      cy.get('[data-testid="consultant-card"]').first().trigger('mouseenter');
      
      cy.get('[data-testid="profile-preview-popup"]').should('be.visible');
      cy.get('[data-testid="preview-name"]').should('be.visible');
      cy.get('[data-testid="preview-specialization"]').should('be.visible');
      cy.get('[data-testid="preview-experience"]').should('be.visible');
      cy.get('[data-testid="preview-recent-projects"]').should('be.visible');
    });

    it('should hide profile preview on mouse leave', () => {
      cy.get('[data-testid="consultant-card"]').first().trigger('mouseenter');
      cy.get('[data-testid="profile-preview-popup"]').should('be.visible');
      
      cy.get('[data-testid="consultant-card"]').first().trigger('mouseleave');
      cy.get('[data-testid="profile-preview-popup"]').should('not.be.visible');
    });

    it('should show contact options for available consultants', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="contact-consultant"]').should('be.visible');
        cy.get('[data-testid="send-message"]').should('be.visible');
        cy.get('[data-testid="schedule-meeting"]').should('be.visible');
      });
    });

    it('should handle unavailable consultant interactions', () => {
      // Mock consultant with unavailable status
      cy.intercept('GET', '/api/directory/consultants*', { 
        fixture: 'directory/consultants-with-unavailable.json' 
      }).as('getConsultantsWithUnavailable');
      
      cy.reload();
      cy.wait('@getConsultantsWithUnavailable');
      
      cy.get('[data-testid="consultant-card"][data-status="unavailable"]').first().within(() => {
        cy.get('[data-testid="contact-consultant"]').should('be.disabled');
        cy.get('[data-testid="unavailable-message"]').should('be.visible');
      });
    });
  });

  describe('Advanced Features', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should bookmark/favorite consultants', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="bookmark-consultant"]').click();
      });
      
      cy.get('[data-testid="bookmark-confirmation"]').should('be.visible');
      cy.get('[data-testid="bookmark-consultant"]').should('have.class', 'bookmarked');
    });

    it('should remove bookmark from consultant', () => {
      // First bookmark a consultant
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="bookmark-consultant"]').click();
      });
      
      // Then remove bookmark
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="bookmark-consultant"]').click();
      });
      
      cy.get('[data-testid="bookmark-consultant"]').should('not.have.class', 'bookmarked');
    });

    it('should filter to show only bookmarked consultants', () => {
      // Bookmark a consultant first
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="bookmark-consultant"]').click();
      });
      
      // Apply bookmarked filter
      cy.get('[data-testid="filter-bookmarked"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="consultant-card"]').each($card => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="bookmark-consultant"]').should('have.class', 'bookmarked');
        });
      });
    });

    it('should export directory results', () => {
      cy.get('[data-testid="export-directory"]').click();
      cy.get('[data-testid="export-dropdown"]').should('be.visible');
      
      cy.get('[data-testid="export-csv"]').click();
      cy.get('[data-testid="export-confirmation"]').should('be.visible');
    });

    it('should share directory search results', () => {
      // Apply some filters and search
      cy.get('[data-testid="directory-search-input"]').type('Epic');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@searchConsultants');
      
      cy.get('[data-testid="share-results"]').click();
      cy.get('[data-testid="share-url"]').should('be.visible');
      cy.get('[data-testid="copy-share-link"]').click();
      
      cy.get('[data-testid="share-confirmation"]').should('contain.text', 'Link copied');
    });

    it('should display consultant comparison feature', () => {
      // Select multiple consultants for comparison
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="compare-checkbox"]').click();
      });
      
      cy.get('[data-testid="consultant-card"]').eq(1).within(() => {
        cy.get('[data-testid="compare-checkbox"]').click();
      });
      
      cy.get('[data-testid="compare-selected"]').should('be.visible');
      cy.get('[data-testid="compare-count"]').should('contain.text', '2');
      
      cy.get('[data-testid="view-comparison"]').click();
      cy.get('[data-testid="comparison-modal"]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should adapt layout for mobile screens', () => {
      cy.viewport('iphone-x');
      
      cy.get('[data-testid="mobile-directory"]').should('be.visible');
      cy.get('[data-testid="mobile-search-toggle"]').should('be.visible');
      cy.get('[data-testid="mobile-filter-toggle"]').should('be.visible');
      
      // Filters should be hidden by default on mobile
      cy.get('[data-testid="directory-filters"]').should('not.be.visible');
      
      // Click to open mobile filters
      cy.get('[data-testid="mobile-filter-toggle"]').click();
      cy.get('[data-testid="mobile-filter-drawer"]').should('be.visible');
    });

    it('should adapt layout for tablet screens', () => {
      cy.viewport('ipad-2');
      
      cy.get('[data-testid="tablet-directory"]').should('be.visible');
      cy.get('[data-testid="directory-filters"]').should('be.visible');
      cy.get('[data-testid="consultant-card"]').should('have.css', 'width').and('not.equal', 'auto');
    });

    it('should maintain functionality on small screens', () => {
      cy.viewport(320, 568); // iPhone 5
      
      // Search should still work
      cy.get('[data-testid="mobile-search-toggle"]').click();
      cy.get('[data-testid="mobile-search-input"]').type('Test');
      cy.get('[data-testid="mobile-search-submit"]').click();
      cy.wait('@searchConsultants');
      
      // View profile should work
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultantProfile');
    });
  });

  describe('Performance and Loading', () => {
    it('should handle slow API responses gracefully', () => {
      cy.intercept('GET', '/api/directory/consultants*', { 
        delay: 3000, 
        fixture: 'directory/consultants.json' 
      }).as('slowDirectoryLoad');
      
      cy.visit('/directory');
      
      // Should show loading state
      cy.get('[data-testid="directory-loading"]').should('be.visible');
      
      // Should show timeout warning after delay
      cy.get('[data-testid="loading-timeout-warning"]', { timeout: 5000 }).should('be.visible');
      
      cy.wait('@slowDirectoryLoad');
      cy.get('[data-testid="directory-results"]').should('be.visible');
    });

    it('should implement infinite scroll for large datasets', () => {
      cy.intercept('GET', '/api/directory/consultants*', { 
        fixture: 'directory/consultants-infinite.json' 
      }).as('getInfiniteConsultants');
      
      cy.visit('/directory?mode=infinite');
      cy.wait('@getInfiniteConsultants');
      
      // Scroll to bottom to trigger load more
      cy.get('[data-testid="directory-results"]').scrollTo('bottom');
      
      cy.get('[data-testid="load-more-trigger"]').should('be.visible');
      cy.wait('@getInfiniteConsultants');
      
      // More consultants should be loaded
      cy.get('[data-testid="consultant-card"]').should('have.length.greaterThan', 20);
    });

    it('should handle concurrent API requests correctly', () => {
      // Trigger multiple actions simultaneously
      cy.get('[data-testid="directory-search-input"]').type('Epic');
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-epic"]').click();
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-rating-desc"]').click();
      
      // All requests should complete successfully
      cy.wait('@searchConsultants');
      cy.get('[data-testid="directory-results"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/directory/consultants*', { 
        statusCode: 500, 
        body: { error: 'Internal Server Error' } 
      }).as('directoryError');
      
      cy.visit('/directory');
      cy.wait('@directoryError');
      
      cy.get('[data-testid="directory-error"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Unable to load consultants');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should retry failed requests', () => {
      cy.intercept('GET', '/api/directory/consultants*', { 
        statusCode: 500 
      }).as('firstRequest');
      
      cy.intercept('GET', '/api/directory/consultants*', { 
        fixture: 'directory/consultants.json' 
      }).as('retryRequest');
      
      cy.visit('/directory');
      cy.wait('@firstRequest');
      
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@retryRequest');
      
      cy.get('[data-testid="directory-results"]').should('be.visible');
    });

    it('should handle network connectivity issues', () => {
      cy.intercept('GET', '/api/directory/consultants*', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/directory');
      cy.wait('@networkError');
      
      cy.get('[data-testid="network-error"]').should('be.visible');
      cy.get('[data-testid="offline-message"]').should('contain.text', 'Check your internet connection');
    });

    it('should handle malformed API responses', () => {
      cy.intercept('GET', '/api/directory/consultants*', { 
        body: 'invalid json response' 
      }).as('malformedResponse');
      
      cy.visit('/directory');
      cy.wait('@malformedResponse');
      
      cy.get('[data-testid="data-error"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Invalid response format');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should be navigable with keyboard', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'skip-to-content');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'directory-search-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'search-button');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="directory-search-input"]')
        .should('have.attr', 'aria-label', 'Search consultants')
        .and('have.attr', 'role', 'searchbox');
      
      cy.get('[data-testid="directory-filters"]')
        .should('have.attr', 'role', 'group')
        .and('have.attr', 'aria-label', 'Filter consultants');
      
      cy.get('[data-testid="directory-results"]')
        .should('have.attr', 'role', 'main')
        .and('have.attr', 'aria-label', 'Consultant directory results');
    });

    it('should announce filter changes to screen readers', () => {
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-epic"]').click();
      cy.get('[data-testid="apply-filters"]').click();
      
      cy.get('[data-testid="screen-reader-announcement"]')
        .should('contain.text', 'Filters applied. Showing filtered results.');
    });

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('contain.text', 'Consultant Directory');
      cy.get('h2').first().should('contain.text', 'Search and Filters');
      cy.get('h3').first().should('contain.text', 'Specialization');
    });

    it('should support high contrast mode', () => {
      cy.get('body').invoke('addClass', 'high-contrast');
      
      cy.get('[data-testid="consultant-card"]').first()
        .should('have.css', 'border')
        .and('match', /2px solid/);
    });
  });
});

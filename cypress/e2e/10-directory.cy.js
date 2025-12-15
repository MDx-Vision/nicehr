describe('Directory Feature', () => {
  const testData = {
    consultant: {
      id: 'ci-test-consultant',
      name: 'CI Test Consultant',
      email: 'consultant@example.com',
      specialties: ['Epic', 'Cerner'],
      location: 'New York, NY',
      status: 'available'
    },
    search: {
      validTerms: ['Epic', 'Cerner', 'New York', 'CI Test'],
      invalidTerms: ['NonExistentSkill', 'XYZ123', '!!!'],
      specialCharacters: ['@#$%', '<script>', 'null', 'undefined']
    },
    filters: {
      specialties: ['Epic', 'Cerner', 'Allscripts', 'Meditech'],
      locations: ['New York, NY', 'California', 'Texas', 'Florida'],
      availability: ['available', 'unavailable', 'busy']
    }
  };

  beforeEach(() => {
    // Login as admin user
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for successful login
    cy.url().should('not.include', '/login');
    
    // Setup API intercepts
    cy.intercept('GET', '/api/directory/consultants*').as('getDirectoryConsultants');
    cy.intercept('GET', '/api/consultants/search*').as('searchConsultants');
    cy.intercept('GET', '/api/consultants/*').as('getConsultant');
    cy.intercept('GET', '/api/consultants/*/profile').as('getConsultantProfile');
    cy.intercept('GET', '/api/consultants/*/ratings').as('getConsultantRatings');
    cy.intercept('POST', '/api/consultants/*/ratings').as('addConsultantRating');
  });

  describe('Directory Page Navigation', () => {
    it('should navigate to directory from main navigation', () => {
      cy.get('[data-testid="nav-directory"]').click();
      cy.url().should('include', '/directory');
      cy.get('[data-testid="page-title"]').should('contain.text', 'Consultant Directory');
    });

    it('should navigate to directory from dashboard', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="directory-link"]').click();
      cy.url().should('include', '/directory');
    });

    it('should handle direct URL access', () => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
      cy.get('[data-testid="directory-container"]').should('be.visible');
    });

    it('should show breadcrumb navigation', () => {
      cy.visit('/directory');
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('[data-testid="breadcrumb-home"]').should('contain.text', 'Home');
      cy.get('[data-testid="breadcrumb-current"]').should('contain.text', 'Directory');
    });
  });

  describe('Directory Page UI Elements', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should display all main UI components', () => {
      cy.get('[data-testid="directory-container"]').should('be.visible');
      cy.get('[data-testid="search-bar"]').should('be.visible');
      cy.get('[data-testid="filter-panel"]').should('be.visible');
      cy.get('[data-testid="consultant-grid"]').should('be.visible');
      cy.get('[data-testid="pagination"]').should('be.visible');
    });

    it('should display search input with proper attributes', () => {
      cy.get('[data-testid="search-input"]')
        .should('be.visible')
        .and('have.attr', 'placeholder', 'Search consultants...')
        .and('have.attr', 'type', 'text')
        .and('not.be.disabled');
      
      cy.get('[data-testid="search-button"]').should('be.visible');
      cy.get('[data-testid="search-clear"]').should('exist');
    });

    it('should display filter options', () => {
      cy.get('[data-testid="filter-specialty"]').should('be.visible');
      cy.get('[data-testid="filter-location"]').should('be.visible');
      cy.get('[data-testid="filter-availability"]').should('be.visible');
      cy.get('[data-testid="filter-reset"]').should('be.visible');
    });

    it('should display view toggle options', () => {
      cy.get('[data-testid="view-grid"]').should('be.visible');
      cy.get('[data-testid="view-list"]').should('be.visible');
    });

    it('should display sort options', () => {
      cy.get('[data-testid="sort-dropdown"]').should('be.visible');
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-name"]').should('be.visible');
      cy.get('[data-testid="sort-rating"]').should('be.visible');
      cy.get('[data-testid="sort-experience"]').should('be.visible');
      cy.get('[data-testid="sort-availability"]').should('be.visible');
    });
  });

  describe('Consultant Grid Display', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should display consultant cards with all required information', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="consultant-avatar"]').should('be.visible');
        cy.get('[data-testid="consultant-name"]').should('be.visible').and('not.be.empty');
        cy.get('[data-testid="consultant-title"]').should('be.visible');
        cy.get('[data-testid="consultant-location"]').should('be.visible');
        cy.get('[data-testid="consultant-specialties"]').should('be.visible');
        cy.get('[data-testid="consultant-rating"]').should('be.visible');
        cy.get('[data-testid="consultant-availability"]').should('be.visible');
      });
    });

    it('should display consultant avatar with fallback', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="consultant-avatar"]').should('be.visible');
        // Test fallback when image fails to load
        cy.get('[data-testid="consultant-avatar"] img').then(($img) => {
          if ($img.length) {
            cy.wrap($img).should('have.attr', 'alt');
          }
        });
      });
    });

    it('should show consultant status indicators', () => {
      cy.get('[data-testid="consultant-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="consultant-availability"]').should('be.visible');
          cy.get('[data-testid="status-indicator"]').should('be.visible');
        });
      });
    });

    it('should display rating stars correctly', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="rating-stars"]').should('be.visible');
        cy.get('[data-testid="rating-value"]').should('be.visible');
        cy.get('[data-testid="rating-count"]').should('be.visible');
      });
    });

    it('should show specialty tags', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="specialty-tag"]').should('have.length.at.least', 1);
        cy.get('[data-testid="specialty-tag"]').each(($tag) => {
          cy.wrap($tag).should('be.visible').and('not.be.empty');
        });
      });
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should perform basic text search', () => {
      const searchTerm = testData.search.validTerms[0];
      
      cy.get('[data-testid="search-input"]').type(searchTerm);
      cy.get('[data-testid="search-button"]').click();
      
      cy.wait('@searchConsultants');
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="results-count"]').should('contain.text', 'results for');
    });

    it('should search on Enter key press', () => {
      const searchTerm = testData.search.validTerms[1];
      
      cy.get('[data-testid="search-input"]').type(`${searchTerm}{enter}`);
      cy.wait('@searchConsultants');
    });

    it('should implement search debouncing', () => {
      cy.get('[data-testid="search-input"]').type('Epic');
      // Should not trigger search immediately
      cy.get('@searchConsultants.all').should('have.length', 0);
      
      // Wait for debounce and continue typing
      cy.wait(300);
      cy.get('[data-testid="search-input"]').type(' Specialist');
      
      // Should eventually trigger search
      cy.wait('@searchConsultants');
    });

    it('should clear search results', () => {
      cy.get('[data-testid="search-input"]').type(testData.search.validTerms[0]);
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@searchConsultants');
      
      cy.get('[data-testid="search-clear"]').click();
      cy.get('[data-testid="search-input"]').should('have.value', '');
      cy.wait('@getDirectoryConsultants');
    });

    it('should handle empty search results', () => {
      cy.get('[data-testid="search-input"]').type(testData.search.invalidTerms[0]);
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@searchConsultants');
      
      cy.get('[data-testid="no-results"]').should('be.visible');
      cy.get('[data-testid="no-results-message"]').should('contain.text', 'No consultants found');
    });

    it('should search by name', () => {
      cy.get('[data-testid="search-input"]').type('John Doe');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@searchConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length.at.least', 0);
    });

    it('should search by specialty', () => {
      testData.search.validTerms.forEach((term) => {
        cy.get('[data-testid="search-input"]').clear().type(term);
        cy.get('[data-testid="search-button"]').click();
        cy.wait('@searchConsultants');
        cy.get('[data-testid="search-input"]').clear();
      });
    });

    it('should search by location', () => {
      cy.get('[data-testid="search-input"]').type('New York');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@searchConsultants');
    });

    it('should handle special characters in search', () => {
      testData.search.specialCharacters.forEach((term) => {
        cy.get('[data-testid="search-input"]').clear().type(term);
        cy.get('[data-testid="search-button"]').click();
        cy.wait('@searchConsultants');
      });
    });

    it('should maintain search state on page refresh', () => {
      const searchTerm = testData.search.validTerms[0];
      cy.get('[data-testid="search-input"]').type(searchTerm);
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@searchConsultants');
      
      cy.reload();
      cy.wait('@searchConsultants');
      cy.get('[data-testid="search-input"]').should('have.value', searchTerm);
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should filter by specialty', () => {
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-Epic"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="active-filter-specialty"]').should('be.visible');
    });

    it('should filter by location', () => {
      cy.get('[data-testid="filter-location"]').click();
      cy.get('[data-testid="location-option"]').first().click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="active-filter-location"]').should('be.visible');
    });

    it('should filter by availability status', () => {
      cy.get('[data-testid="filter-availability"]').click();
      cy.get('[data-testid="availability-available"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="active-filter-availability"]').should('be.visible');
    });

    it('should apply multiple filters simultaneously', () => {
      // Apply specialty filter
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-Epic"]').click();
      
      // Apply location filter
      cy.get('[data-testid="filter-location"]').click();
      cy.get('[data-testid="location-option"]').first().click();
      
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="active-filters"]').within(() => {
        cy.get('[data-testid="active-filter"]').should('have.length', 2);
      });
    });

    it('should remove individual filters', () => {
      // Apply filter
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-Epic"]').click();
      cy.wait('@getDirectoryConsultants');
      
      // Remove filter
      cy.get('[data-testid="remove-filter-specialty"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="active-filter-specialty"]').should('not.exist');
    });

    it('should reset all filters', () => {
      // Apply multiple filters
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-Epic"]').click();
      
      cy.get('[data-testid="filter-location"]').click();
      cy.get('[data-testid="location-option"]').first().click();
      
      cy.wait('@getDirectoryConsultants');
      
      // Reset all filters
      cy.get('[data-testid="filter-reset"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="active-filters"]').should('not.exist');
    });

    it('should show filter count badges', () => {
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-Epic"]').click();
      cy.get('[data-testid="specialty-option-Cerner"]').click();
      
      cy.get('[data-testid="filter-count-specialty"]').should('contain.text', '2');
    });

    it('should persist filters across navigation', () => {
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-Epic"]').click();
      cy.wait('@getDirectoryConsultants');
      
      // Navigate away and back
      cy.visit('/dashboard');
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="active-filter-specialty"]').should('be.visible');
    });
  });

  describe('Sorting Functionality', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should sort by name ascending', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-name-asc"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="consultant-name"]').then(($names) => {
        const names = [...$names].map(el => el.textContent);
        const sortedNames = [...names].sort();
        expect(names).to.deep.equal(sortedNames);
      });
    });

    it('should sort by name descending', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-name-desc"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="consultant-name"]').then(($names) => {
        const names = [...$names].map(el => el.textContent);
        const sortedNames = [...names].sort().reverse();
        expect(names).to.deep.equal(sortedNames);
      });
    });

    it('should sort by rating', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-rating"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="current-sort"]').should('contain.text', 'Rating');
    });

    it('should sort by experience', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-experience"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="current-sort"]').should('contain.text', 'Experience');
    });

    it('should sort by availability', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-availability"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="current-sort"]').should('contain.text', 'Availability');
    });

    it('should maintain sort order with filters', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-name-asc"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-Epic"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="current-sort"]').should('contain.text', 'Name');
    });
  });

  describe('View Modes', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should switch to list view', () => {
      cy.get('[data-testid="view-list"]').click();
      cy.get('[data-testid="consultant-list"]').should('be.visible');
      cy.get('[data-testid="consultant-grid"]').should('not.be.visible');
    });

    it('should switch to grid view', () => {
      cy.get('[data-testid="view-list"]').click();
      cy.get('[data-testid="view-grid"]').click();
      cy.get('[data-testid="consultant-grid"]').should('be.visible');
      cy.get('[data-testid="consultant-list"]').should('not.be.visible');
    });

    it('should maintain view preference', () => {
      cy.get('[data-testid="view-list"]').click();
      cy.reload();
      cy.wait('@getDirectoryConsultants');
      cy.get('[data-testid="consultant-list"]').should('be.visible');
    });

    it('should show different information in list view', () => {
      cy.get('[data-testid="view-list"]').click();
      cy.get('[data-testid="consultant-row"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]').should('be.visible');
        cy.get('[data-testid="consultant-email"]').should('be.visible');
        cy.get('[data-testid="consultant-phone"]').should('be.visible');
        cy.get('[data-testid="consultant-location"]').should('be.visible');
        cy.get('[data-testid="consultant-specialties"]').should('be.visible');
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should display pagination controls', () => {
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-prev"]').should('be.visible');
      cy.get('[data-testid="pagination-next"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]').should('be.visible');
    });

    it('should navigate to next page', () => {
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getDirectoryConsultants');
      cy.get('[data-testid="current-page"]').should('contain.text', '2');
    });

    it('should navigate to previous page', () => {
      // Go to page 2 first
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getDirectoryConsultants');
      
      // Go back to page 1
      cy.get('[data-testid="pagination-prev"]').click();
      cy.wait('@getDirectoryConsultants');
      cy.get('[data-testid="current-page"]').should('contain.text', '1');
    });

    it('should jump to specific page', () => {
      cy.get('[data-testid="page-number-3"]').click();
      cy.wait('@getDirectoryConsultants');
      cy.get('[data-testid="current-page"]').should('contain.text', '3');
    });

    it('should change page size', () => {
      cy.get('[data-testid="page-size-select"]').click();
      cy.get('[data-testid="page-size-25"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length.at.most', 25);
    });

    it('should disable prev button on first page', () => {
      cy.get('[data-testid="pagination-prev"]').should('be.disabled');
    });

    it('should show total results count', () => {
      cy.get('[data-testid="results-total"]').should('be.visible').and('contain.text', 'results');
    });

    it('should maintain pagination state with filters', () => {
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-Epic"]').click();
      cy.wait('@getDirectoryConsultants');
      
      // Should reset to page 1 when filters change
      cy.get('[data-testid="current-page"]').should('contain.text', '1');
    });
  });

  describe('Consultant Profile Modal/Page', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should open consultant profile on card click', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultant');
      cy.wait('@getConsultantProfile');
      
      cy.get('[data-testid="profile-modal"]').should('be.visible');
    });

    it('should display complete consultant profile', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultant');
      cy.wait('@getConsultantProfile');
      
      cy.get('[data-testid="profile-modal"]').within(() => {
        cy.get('[data-testid="profile-avatar"]').should('be.visible');
        cy.get('[data-testid="profile-name"]').should('be.visible');
        cy.get('[data-testid="profile-title"]').should('be.visible');
        cy.get('[data-testid="profile-contact"]').should('be.visible');
        cy.get('[data-testid="profile-bio"]').should('be.visible');
        cy.get('[data-testid="profile-specialties"]').should('be.visible');
        cy.get('[data-testid="profile-experience"]').should('be.visible');
        cy.get('[data-testid="profile-certifications"]').should('be.visible');
        cy.get('[data-testid="profile-availability"]').should('be.visible');
      });
    });

    it('should close profile modal', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultant');
      
      cy.get('[data-testid="profile-close"]').click();
      cy.get('[data-testid="profile-modal"]').should('not.be.visible');
    });

    it('should close profile modal on escape key', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultant');
      
      cy.get('body').type('{esc}');
      cy.get('[data-testid="profile-modal"]').should('not.be.visible');
    });

    it('should close profile modal on backdrop click', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultant');
      
      cy.get('[data-testid="modal-backdrop"]').click({ force: true });
      cy.get('[data-testid="profile-modal"]').should('not.be.visible');
    });

    it('should display consultant ratings and reviews', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultant');
      cy.wait('@getConsultantRatings');
      
      cy.get('[data-testid="profile-ratings"]').should('be.visible');
      cy.get('[data-testid="rating-overview"]').should('be.visible');
      cy.get('[data-testid="rating-breakdown"]').should('be.visible');
      cy.get('[data-testid="recent-reviews"]').should('be.visible');
    });

    it('should show contact buttons', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultant');
      
      cy.get('[data-testid="contact-email"]').should('be.visible');
      cy.get('[data-testid="contact-phone"]').should('be.visible');
      cy.get('[data-testid="contact-message"]').should('be.visible');
    });

    it('should handle consultant not found', () => {
      cy.intercept('GET', '/api/consultants/*', { statusCode: 404 }).as('getConsultantNotFound');
      
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultantNotFound');
      
      cy.get('[data-testid="error-message"]').should('contain.text', 'Consultant not found');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should adapt to mobile viewport', () => {
      cy.viewport(375, 667);
      
      cy.get('[data-testid="mobile-filter-toggle"]').should('be.visible');
      cy.get('[data-testid="filter-panel"]').should('not.be.visible');
      
      cy.get('[data-testid="mobile-filter-toggle"]').click();
      cy.get('[data-testid="filter-panel"]').should('be.visible');
    });

    it('should adapt to tablet viewport', () => {
      cy.viewport(768, 1024);
      
      cy.get('[data-testid="consultant-grid"]').should('be.visible');
      cy.get('[data-testid="consultant-card"]').should('have.css', 'width').and('not.equal', '100%');
    });

    it('should hide/show elements on different screen sizes', () => {
      // Desktop view
      cy.viewport(1200, 800);
      cy.get('[data-testid="filter-panel"]').should('be.visible');
      cy.get('[data-testid="mobile-filter-toggle"]').should('not.be.visible');
      
      // Mobile view
      cy.viewport(375, 667);
      cy.get('[data-testid="filter-panel"]').should('not.be.visible');
      cy.get('[data-testid="mobile-filter-toggle"]').should('be.visible');
    });

    it('should adjust grid columns on different screen sizes', () => {
      // Desktop - 4 columns
      cy.viewport(1200, 800);
      cy.get('[data-testid="consultant-grid"]').should('have.class', 'grid-cols-4');
      
      // Tablet - 2 columns
      cy.viewport(768, 1024);
      cy.get('[data-testid="consultant-grid"]').should('have.class', 'grid-cols-2');
      
      // Mobile - 1 column
      cy.viewport(375, 667);
      cy.get('[data-testid="consultant-grid"]').should('have.class', 'grid-cols-1');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.visit('/directory');
    });

    it('should handle API timeout', () => {
      cy.intercept('GET', '/api/directory/consultants*', { delay: 30000 }).as('slowRequest');
      
      cy.reload();
      cy.get('[data-testid="loading-timeout"]').should('be.visible');
    });

    it('should handle server error', () => {
      cy.intercept('GET', '/api/directory/consultants*', { statusCode: 500 }).as('serverError');
      
      cy.reload();
      cy.wait('@serverError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Something went wrong');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should retry failed requests', () => {
      cy.intercept('GET', '/api/directory/consultants*', { statusCode: 500 }).as('serverError');
      
      cy.reload();
      cy.wait('@serverError');
      
      // Setup successful response for retry
      cy.intercept('GET', '/api/directory/consultants*', { fixture: 'consultants.json' }).as('retrySuccess');
      
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@retrySuccess');
      cy.get('[data-testid="consultant-grid"]').should('be.visible');
    });

    it('should handle network connectivity issues', () => {
      cy.intercept('GET', '/api/directory/consultants*', { forceNetworkError: true }).as('networkError');
      
      cy.reload();
      cy.wait('@networkError');
      cy.get('[data-testid="offline-message"]').should('be.visible');
    });

    it('should handle empty consultant list gracefully', () => {
      cy.intercept('GET', '/api/directory/consultants*', { body: { data: [], total: 0 } }).as('emptyList');
      
      cy.reload();
      cy.wait('@emptyList');
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-message"]').should('contain.text', 'No consultants found');
    });
  });

  describe('Performance and Loading States', () => {
    beforeEach(() => {
      cy.visit('/directory');
    });

    it('should show loading skeleton while fetching data', () => {
      cy.intercept('GET', '/api/directory/consultants*', { delay: 1000 }).as('slowLoad');
      
      cy.reload();
      cy.get('[data-testid="consultant-skeleton"]').should('be.visible');
      cy.wait('@slowLoad');
      cy.get('[data-testid="consultant-skeleton"]').should('not.exist');
    });

    it('should show search loading state', () => {
      cy.intercept('GET', '/api/consultants/search*', { delay: 1000 }).as('slowSearch');
      
      cy.wait('@getDirectoryConsultants');
      cy.get('[data-testid="search-input"]').type('Epic');
      cy.get('[data-testid="search-button"]').click();
      
      cy.get('[data-testid="search-loading"]').should('be.visible');
      cy.wait('@slowSearch');
      cy.get('[data-testid="search-loading"]').should('not.exist');
    });

    it('should show filter loading state', () => {
      cy.intercept('GET', '/api/directory/consultants*', { delay: 1000 }).as('slowFilter');
      
      cy.wait('@getDirectoryConsultants');
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-Epic"]').click();
      
      cy.get('[data-testid="filter-loading"]').should('be.visible');
      cy.wait('@slowFilter');
      cy.get('[data-testid="filter-loading"]').should('not.exist');
    });

    it('should lazy load consultant avatars', () => {
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="consultant-avatar"] img').each(($img) => {
        cy.wrap($img).should('have.attr', 'loading', 'lazy');
      });
    });

    it('should optimize pagination performance', () => {
      cy.wait('@getDirectoryConsultants');
      
      // Measure time for pagination
      const startTime = Date.now();
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getDirectoryConsultants').then(() => {
        const endTime = Date.now();
        expect(endTime - startTime).to.be.lessThan(3000); // Should load within 3 seconds
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('contain.text', 'Consultant Directory');
      cy.get('h2').should('exist');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="search-input"]').should('have.attr', 'aria-label', 'Search consultants');
      cy.get('[data-testid="filter-specialty"]').should('have.attr', 'aria-label', 'Filter by specialty');
      cy.get('[data-testid="sort-dropdown"]').should('have.attr', 'aria-label', 'Sort consultants');
    });

    it('should support keyboard navigation', () => {
      cy.get('[data-testid="search-input"]').focus();
      cy.get('[data-testid="search-input"]').should('be.focused');
      
      cy.tab();
      cy.get('[data-testid="search-button"]').should('be.focused');
      
      cy.tab();
      cy.get('[data-testid="filter-specialty"]').should('be.focused');
    });

    it('should have proper focus indicators', () => {
      cy.get('[data-testid="consultant-card"]').first().focus();
      cy.get('[data-testid="consultant-card"]').first().should('have.class', 'focus:ring-2');
    });

    it('should have screen reader friendly content', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]').should('have.attr', 'aria-describedby');
        cy.get('[data-testid="consultant-rating"]').should('have.attr', 'aria-label').and('include', 'stars');
      });
    });

    it('should handle reduced motion preferences', () => {
      cy.get('[data-testid="consultant-card"]').first().should('have.css', 'transition-duration');
    });

    it('should provide skip links', () => {
      cy.get('[data-testid="skip-to-content"]').should('exist');
      cy.get('[data-testid="skip-to-content"]').click();
      cy.get('[data-testid="main-content"]').should('be.focused');
    });
  });

  describe('Data Integrity', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should display accurate consultant count', () => {
      cy.get('[data-testid="results-total"]').then(($totalText) => {
        const totalCount = parseInt($totalText.text().match(/(\d+)/)[1]);
        cy.get('[data-testid="consultant-card"]').should('have.length.at.most', totalCount);
      });
    });

    it('should maintain filter consistency', () => {
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-Epic"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="consultant-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="specialty-tag"]').should('contain.text', 'Epic');
        });
      });
    });

    it('should validate search result relevance', () => {
      cy.get('[data-testid="search-input"]').type('Epic');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@searchConsultants');
      
      cy.get('[data-testid="consultant-card"]').each(($card) => {
        cy.wrap($card).should('contain.text', 'Epic');
      });
    });

    it('should ensure pagination math is correct', () => {
      cy.get('[data-testid="pagination-info"]').then(($info) => {
        const text = $info.text();
        const matches = text.match(/(\d+)-(\d+) of (\d+)/);
        if (matches) {
          const start = parseInt(matches[1]);
          const end = parseInt(matches[2]);
          const total = parseInt(matches[3]);
          
          expect(start).to.be.at.least(1);
          expect(end).to.be.at.most(total);
          expect(start).to.be.at.most(end);
        }
      });
    });
  });
});

describe('Directory Feature', () => {
  const testData = {
    user: {
      email: 'test@example.com',
      password: 'password123'
    },
    consultant: {
      name: 'Dr. Jane Smith',
      email: 'jane.smith@example.com',
      specialty: 'Cardiology',
      phone: '+1-555-0123',
      location: 'New York, NY'
    },
    searchTerms: {
      valid: ['Jane', 'Smith', 'Cardiology', 'New York'],
      invalid: ['xyz123', 'nonexistent', '!!!'],
      partial: ['Jan', 'Card', 'NY']
    },
    filters: {
      specialty: ['Cardiology', 'Neurology', 'Emergency Medicine'],
      location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL'],
      availability: ['Available', 'Busy', 'Unavailable']
    }
  };

  beforeEach(() => {
    // Setup authentication
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin user
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
  });

  describe('Directory Page Navigation', () => {
    it('should navigate to directory from main navigation', () => {
      cy.get('[data-testid="nav-directory"]').should('be.visible').click();
      cy.url().should('include', '/directory');
      cy.get('[data-testid="directory-page"]').should('be.visible');
    });

    it('should display directory in breadcrumbs', () => {
      cy.visit('/directory');
      cy.get('[data-testid="breadcrumb-directory"]').should('be.visible').and('contain.text', 'Directory');
    });

    it('should have proper page title and meta information', () => {
      cy.visit('/directory');
      cy.title().should('include', 'Directory');
      cy.get('[data-testid="page-title"]').should('contain.text', 'Consultant Directory');
    });
  });

  describe('Directory Page UI Elements', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants*', {
        fixture: 'directory/consultants-list.json'
      }).as('getConsultants');
      
      cy.visit('/directory');
      cy.wait('@getConsultants');
    });

    it('should display all directory interface elements', () => {
      cy.get('[data-testid="directory-search-bar"]').should('be.visible');
      cy.get('[data-testid="directory-filters"]').should('be.visible');
      cy.get('[data-testid="directory-consultant-grid"]').should('be.visible');
      cy.get('[data-testid="directory-results-count"]').should('be.visible');
    });

    it('should display search bar with proper attributes', () => {
      cy.get('[data-testid="directory-search-input"]')
        .should('be.visible')
        .and('have.attr', 'type', 'text')
        .and('have.attr', 'placeholder')
        .and('not.be.disabled');
      
      cy.get('[data-testid="directory-search-button"]').should('be.visible');
      cy.get('[data-testid="directory-clear-search"]').should('exist');
    });

    it('should display filter options', () => {
      cy.get('[data-testid="filter-specialty"]').should('be.visible');
      cy.get('[data-testid="filter-location"]').should('be.visible');
      cy.get('[data-testid="filter-availability"]').should('be.visible');
      cy.get('[data-testid="filter-clear-all"]').should('be.visible');
    });

    it('should display consultant cards with required information', () => {
      cy.get('[data-testid^="consultant-card-"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid^="consultant-card-"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]').should('be.visible');
        cy.get('[data-testid="consultant-specialty"]').should('be.visible');
        cy.get('[data-testid="consultant-location"]').should('be.visible');
        cy.get('[data-testid="consultant-rating"]').should('be.visible');
        cy.get('[data-testid="consultant-view-profile"]').should('be.visible');
      });
    });

    it('should display pagination when needed', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        body: {
          consultants: new Array(25).fill(null).map((_, i) => ({
            id: i + 1,
            name: `Consultant ${i + 1}`,
            specialty: 'Cardiology',
            location: 'New York, NY'
          })),
          total: 100,
          page: 1,
          limit: 25
        }
      }).as('getManyConsultants');
      
      cy.reload();
      cy.wait('@getManyConsultants');
      
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'of 100');
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      cy.visit('/directory');
    });

    it('should perform basic text search', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('searchConsultants');
      
      testData.searchTerms.valid.forEach(term => {
        cy.get('[data-testid="directory-search-input"]').clear().type(term);
        cy.get('[data-testid="directory-search-button"]').click();
        
        cy.wait('@searchConsultants').then(interception => {
          expect(interception.request.url).to.include(`search=${term}`);
        });
        
        cy.get('[data-testid="directory-results-count"]').should('contain.text', 'results for');
        cy.get('[data-testid="search-term-display"]').should('contain.text', term);
      });
    });

    it('should handle search with Enter key', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('searchConsultants');
      
      cy.get('[data-testid="directory-search-input"]').type('cardiology{enter}');
      cy.wait('@searchConsultants');
      
      cy.get('[data-testid="directory-results-count"]').should('be.visible');
    });

    it('should show no results state for invalid searches', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        body: { consultants: [], total: 0, page: 1, limit: 25 }
      }).as('noResults');
      
      cy.get('[data-testid="directory-search-input"]').type('xyznoresults');
      cy.get('[data-testid="directory-search-button"]').click();
      cy.wait('@noResults');
      
      cy.get('[data-testid="no-results-state"]').should('be.visible');
      cy.get('[data-testid="no-results-message"]').should('contain.text', 'No consultants found');
      cy.get('[data-testid="clear-search-suggestion"]').should('be.visible');
    });

    it('should clear search results', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('getConsultants');
      
      cy.get('[data-testid="directory-search-input"]').type('cardiology');
      cy.get('[data-testid="directory-search-button"]').click();
      cy.wait('@getConsultants');
      
      cy.get('[data-testid="directory-clear-search"]').click();
      cy.get('[data-testid="directory-search-input"]').should('have.value', '');
      cy.wait('@getConsultants');
    });

    it('should handle special characters and edge cases in search', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('searchConsultants');
      
      const edgeCases = ['Dr.', 'O\'Connor', 'Smith-Jones', '123', '   spaces   '];
      
      edgeCases.forEach(term => {
        cy.get('[data-testid="directory-search-input"]').clear().type(term);
        cy.get('[data-testid="directory-search-button"]').click();
        cy.wait('@searchConsultants');
        
        // Should not break the interface
        cy.get('[data-testid="directory-page"]').should('be.visible');
      });
    });

    it('should show search suggestions or autocomplete', () => {
      cy.intercept('GET', '/api/consultants/search*', {
        body: {
          suggestions: ['Dr. Jane Smith', 'Dr. John Smith', 'Jane Doe']
        }
      }).as('getSearchSuggestions');
      
      cy.get('[data-testid="directory-search-input"]').type('jane');
      cy.wait('@getSearchSuggestions');
      
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
      cy.get('[data-testid^="suggestion-"]').should('have.length', 3);
      
      cy.get('[data-testid="suggestion-0"]').click();
      cy.get('[data-testid="directory-search-input"]').should('have.value', 'Dr. Jane Smith');
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      cy.visit('/directory');
    });

    it('should filter by specialty', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('filterConsultants');
      
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-cardiology"]').click();
      
      cy.wait('@filterConsultants').then(interception => {
        expect(interception.request.url).to.include('specialty=cardiology');
      });
      
      cy.get('[data-testid="active-filter-specialty"]').should('be.visible');
      cy.get('[data-testid^="consultant-card-"]').each($card => {
        cy.wrap($card).find('[data-testid="consultant-specialty"]')
          .should('contain.text', 'Cardiology');
      });
    });

    it('should filter by location', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('filterConsultants');
      
      cy.get('[data-testid="filter-location"]').click();
      cy.get('[data-testid="location-option-new-york"]').click();
      
      cy.wait('@filterConsultants').then(interception => {
        expect(interception.request.url).to.include('location');
      });
      
      cy.get('[data-testid="active-filter-location"]').should('be.visible');
    });

    it('should filter by availability status', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('filterConsultants');
      
      cy.get('[data-testid="filter-availability"]').click();
      cy.get('[data-testid="availability-option-available"]').click();
      
      cy.wait('@filterConsultants');
      cy.get('[data-testid="active-filter-availability"]').should('be.visible');
    });

    it('should apply multiple filters simultaneously', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('multiFilter');
      
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-cardiology"]').click();
      
      cy.get('[data-testid="filter-location"]').click();
      cy.get('[data-testid="location-option-new-york"]').click();
      
      cy.wait('@multiFilter').then(interception => {
        expect(interception.request.url).to.include('specialty=cardiology');
        expect(interception.request.url).to.include('location');
      });
      
      cy.get('[data-testid="active-filters"]').should('contain', '2 filters applied');
    });

    it('should clear individual filters', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('filterConsultants');
      
      // Apply filter
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-cardiology"]').click();
      cy.wait('@filterConsultants');
      
      // Clear filter
      cy.get('[data-testid="active-filter-specialty"] [data-testid="remove-filter"]').click();
      cy.wait('@filterConsultants');
      
      cy.get('[data-testid="active-filter-specialty"]').should('not.exist');
    });

    it('should clear all filters at once', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('filterConsultants');
      
      // Apply multiple filters
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-cardiology"]').click();
      cy.get('[data-testid="filter-location"]').click();
      cy.get('[data-testid="location-option-new-york"]').click();
      cy.wait('@filterConsultants');
      
      // Clear all
      cy.get('[data-testid="filter-clear-all"]').click();
      cy.wait('@filterConsultants');
      
      cy.get('[data-testid="active-filters"]').should('not.exist');
    });

    it('should show filter count badges', () => {
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-cardiology"]').click();
      cy.get('[data-testid="specialty-option-neurology"]').click();
      
      cy.get('[data-testid="filter-specialty-count"]').should('contain.text', '2');
    });
  });

  describe('Search and Filter Combination', () => {
    beforeEach(() => {
      cy.visit('/directory');
    });

    it('should combine search and filters', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('combinedSearch');
      
      // Apply search
      cy.get('[data-testid="directory-search-input"]').type('smith');
      cy.get('[data-testid="directory-search-button"]').click();
      
      // Apply filter
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-cardiology"]').click();
      
      cy.wait('@combinedSearch').then(interception => {
        expect(interception.request.url).to.include('search=smith');
        expect(interception.request.url).to.include('specialty=cardiology');
      });
      
      cy.get('[data-testid="search-and-filter-summary"]').should('be.visible');
    });

    it('should maintain filters when searching', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('getConsultants');
      
      // Apply filter first
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-cardiology"]').click();
      cy.wait('@getConsultants');
      
      // Then search
      cy.get('[data-testid="directory-search-input"]').type('doctor');
      cy.get('[data-testid="directory-search-button"]').click();
      cy.wait('@getConsultants');
      
      // Filter should still be active
      cy.get('[data-testid="active-filter-specialty"]').should('be.visible');
    });

    it('should clear search while maintaining filters', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('getConsultants');
      
      // Apply both search and filter
      cy.get('[data-testid="directory-search-input"]').type('doctor');
      cy.get('[data-testid="directory-search-button"]').click();
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-cardiology"]').click();
      cy.wait('@getConsultants');
      
      // Clear only search
      cy.get('[data-testid="directory-clear-search"]').click();
      cy.wait('@getConsultants');
      
      cy.get('[data-testid="directory-search-input"]').should('have.value', '');
      cy.get('[data-testid="active-filter-specialty"]').should('be.visible');
    });
  });

  describe('Consultant Profile Cards', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants*', {
        fixture: 'directory/consultants-list.json'
      }).as('getConsultants');
      
      cy.visit('/directory');
      cy.wait('@getConsultants');
    });

    it('should display consultant information correctly', () => {
      cy.get('[data-testid^="consultant-card-"]').first().within(() => {
        cy.get('[data-testid="consultant-avatar"]').should('be.visible');
        cy.get('[data-testid="consultant-name"]').should('be.visible').and('not.be.empty');
        cy.get('[data-testid="consultant-specialty"]').should('be.visible');
        cy.get('[data-testid="consultant-location"]').should('be.visible');
        cy.get('[data-testid="consultant-experience"]').should('be.visible');
        cy.get('[data-testid="consultant-rating"]').should('be.visible');
      });
    });

    it('should show availability status', () => {
      cy.get('[data-testid^="consultant-card-"]').first().within(() => {
        cy.get('[data-testid="consultant-availability"]').should('be.visible')
          .and('have.attr', 'data-status')
          .and('match', /available|busy|unavailable/);
      });
    });

    it('should display rating stars correctly', () => {
      cy.get('[data-testid^="consultant-card-"]').first().within(() => {
        cy.get('[data-testid="consultant-rating"] [data-testid^="star-"]')
          .should('have.length', 5);
        cy.get('[data-testid="rating-average"]').should('be.visible');
        cy.get('[data-testid="rating-count"]').should('be.visible');
      });
    });

    it('should show consultant specializations and skills', () => {
      cy.get('[data-testid^="consultant-card-"]').first().within(() => {
        cy.get('[data-testid="consultant-specializations"]').should('be.visible');
        cy.get('[data-testid^="skill-tag-"]').should('have.length.at.least', 1);
      });
    });

    it('should display contact information appropriately', () => {
      cy.get('[data-testid^="consultant-card-"]').first().within(() => {
        cy.get('[data-testid="consultant-phone"]').should('be.visible');
        cy.get('[data-testid="consultant-email"]').should('be.visible');
      });
    });

    it('should show years of experience', () => {
      cy.get('[data-testid^="consultant-card-"]').first().within(() => {
        cy.get('[data-testid="consultant-experience"]').should('be.visible')
          .and('contain.text', 'years');
      });
    });
  });

  describe('Consultant Profile Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants*', {
        fixture: 'directory/consultants-list.json'
      }).as('getConsultants');
      
      cy.intercept('GET', '/api/consultants/*/profile', {
        fixture: 'directory/consultant-profile.json'
      }).as('getProfile');
      
      cy.visit('/directory');
      cy.wait('@getConsultants');
    });

    it('should navigate to consultant profile on card click', () => {
      cy.get('[data-testid^="consultant-card-"]').first().click();
      
      cy.wait('@getProfile');
      cy.url().should('include', '/consultants/');
      cy.get('[data-testid="consultant-profile-page"]').should('be.visible');
    });

    it('should navigate to profile via view profile button', () => {
      cy.get('[data-testid^="consultant-card-"]').first()
        .find('[data-testid="consultant-view-profile"]').click();
      
      cy.wait('@getProfile');
      cy.url().should('include', '/consultants/');
    });

    it('should open profile in new tab when requested', () => {
      cy.get('[data-testid^="consultant-card-"]').first()
        .find('[data-testid="consultant-view-profile"]')
        .should('have.attr', 'target', '_blank');
    });

    it('should handle profile navigation errors gracefully', () => {
      cy.intercept('GET', '/api/consultants/*/profile', {
        statusCode: 404,
        body: { error: 'Consultant not found' }
      }).as('getProfileError');
      
      cy.get('[data-testid^="consultant-card-"]').first().click();
      cy.wait('@getProfileError');
      
      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain.text', 'Consultant not found');
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants*', {
        body: {
          consultants: new Array(10).fill(null).map((_, i) => ({
            id: i + 1,
            name: `Consultant ${i + 1}`,
            specialty: 'Cardiology',
            location: 'New York, NY'
          })),
          total: 50,
          page: 1,
          limit: 10
        }
      }).as('getPaginatedConsultants');
      
      cy.visit('/directory');
      cy.wait('@getPaginatedConsultants');
    });

    it('should display pagination controls', () => {
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-prev"]').should('be.visible');
      cy.get('[data-testid="pagination-next"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]').should('contain.text', '1-10 of 50');
    });

    it('should navigate to next page', () => {
      cy.intercept('GET', '/api/directory/consultants*page=2*', {
        body: {
          consultants: new Array(10).fill(null).map((_, i) => ({
            id: i + 11,
            name: `Consultant ${i + 11}`,
            specialty: 'Cardiology',
            location: 'New York, NY'
          })),
          total: 50,
          page: 2,
          limit: 10
        }
      }).as('getPage2');
      
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getPage2');
      
      cy.get('[data-testid="pagination-info"]').should('contain.text', '11-20 of 50');
    });

    it('should navigate to previous page', () => {
      // Start on page 2
      cy.intercept('GET', '/api/directory/consultants*page=2*').as('getPage2');
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getPage2');
      
      // Go back to page 1
      cy.intercept('GET', '/api/directory/consultants*page=1*').as('getPage1');
      cy.get('[data-testid="pagination-prev"]').click();
      cy.wait('@getPage1');
      
      cy.get('[data-testid="pagination-info"]').should('contain.text', '1-10 of 50');
    });

    it('should disable pagination buttons appropriately', () => {
      // First page - prev should be disabled
      cy.get('[data-testid="pagination-prev"]').should('be.disabled');
      cy.get('[data-testid="pagination-next"]').should('not.be.disabled');
      
      // Navigate to last page
      cy.intercept('GET', '/api/directory/consultants*page=5*', {
        body: {
          consultants: new Array(10).fill(null).map((_, i) => ({
            id: i + 41,
            name: `Consultant ${i + 41}`,
            specialty: 'Cardiology'
          })),
          total: 50,
          page: 5,
          limit: 10
        }
      }).as('getLastPage');
      
      cy.get('[data-testid="pagination-page-5"]').click();
      cy.wait('@getLastPage');
      
      cy.get('[data-testid="pagination-next"]').should('be.disabled');
      cy.get('[data-testid="pagination-prev"]').should('not.be.disabled');
    });

    it('should handle page size changes', () => {
      cy.intercept('GET', '/api/directory/consultants*limit=25*', {
        body: {
          consultants: new Array(25).fill(null).map((_, i) => ({
            id: i + 1,
            name: `Consultant ${i + 1}`,
            specialty: 'Cardiology'
          })),
          total: 50,
          page: 1,
          limit: 25
        }
      }).as('getPageSize25');
      
      cy.get('[data-testid="page-size-select"]').select('25');
      cy.wait('@getPageSize25');
      
      cy.get('[data-testid="pagination-info"]').should('contain.text', '1-25 of 50');
    });
  });

  describe('Sorting and View Options', () => {
    beforeEach(() => {
      cy.visit('/directory');
    });

    it('should provide sorting options', () => {
      cy.get('[data-testid="sort-dropdown"]').should('be.visible').click();
      
      cy.get('[data-testid="sort-name-asc"]').should('be.visible');
      cy.get('[data-testid="sort-name-desc"]').should('be.visible');
      cy.get('[data-testid="sort-rating-desc"]').should('be.visible');
      cy.get('[data-testid="sort-experience-desc"]').should('be.visible');
    });

    it('should sort consultants by name', () => {
      cy.intercept('GET', '/api/directory/consultants*sort=name&order=asc*').as('sortByName');
      
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-name-asc"]').click();
      
      cy.wait('@sortByName');
      cy.get('[data-testid="sort-indicator"]').should('contain.text', 'Name (A-Z)');
    });

    it('should sort consultants by rating', () => {
      cy.intercept('GET', '/api/directory/consultants*sort=rating&order=desc*').as('sortByRating');
      
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-rating-desc"]').click();
      
      cy.wait('@sortByRating');
      cy.get('[data-testid="sort-indicator"]').should('contain.text', 'Highest Rated');
    });

    it('should toggle between grid and list view', () => {
      cy.get('[data-testid="view-toggle-grid"]').should('be.visible');
      cy.get('[data-testid="view-toggle-list"]').should('be.visible');
      
      // Switch to list view
      cy.get('[data-testid="view-toggle-list"]').click();
      cy.get('[data-testid="directory-consultant-list"]').should('be.visible');
      cy.get('[data-testid="directory-consultant-grid"]').should('not.exist');
      
      // Switch back to grid view
      cy.get('[data-testid="view-toggle-grid"]').click();
      cy.get('[data-testid="directory-consultant-grid"]').should('be.visible');
      cy.get('[data-testid="directory-consultant-list"]').should('not.exist');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants*', {
        fixture: 'directory/consultants-list.json'
      }).as('getConsultants');
      
      cy.visit('/directory');
      cy.wait('@getConsultants');
    });

    it('should adapt to mobile viewport', () => {
      cy.viewport('iphone-x');
      
      // Filters should be collapsible on mobile
      cy.get('[data-testid="mobile-filter-toggle"]').should('be.visible');
      cy.get('[data-testid="directory-filters"]').should('not.be.visible');
      
      cy.get('[data-testid="mobile-filter-toggle"]').click();
      cy.get('[data-testid="directory-filters"]').should('be.visible');
      
      // Consultant cards should stack vertically
      cy.get('[data-testid="directory-consultant-grid"]')
        .should('have.css', 'grid-template-columns')
        .and('match', /1fr|repeat\(1/);
    });

    it('should adapt to tablet viewport', () => {
      cy.viewport('ipad-2');
      
      // Should show 2 columns on tablet
      cy.get('[data-testid="directory-consultant-grid"]')
        .should('have.css', 'grid-template-columns')
        .and('match', /repeat\(2/);
    });

    it('should show proper desktop layout', () => {
      cy.viewport(1200, 800);
      
      // Should show 3+ columns on desktop
      cy.get('[data-testid="directory-consultant-grid"]')
        .should('have.css', 'grid-template-columns')
        .and('match', /repeat\([3-9]|1fr 1fr 1fr/);
      
      // Filters should be always visible
      cy.get('[data-testid="directory-filters"]').should('be.visible');
      cy.get('[data-testid="mobile-filter-toggle"]').should('not.exist');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.visit('/directory');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');
      
      cy.reload();
      cy.wait('@serverError');
      
      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Unable to load consultants');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle network errors', () => {
      cy.intercept('GET', '/api/directory/consultants*', { forceNetworkError: true }).as('networkError');
      
      cy.reload();
      cy.wait('@networkError');
      
      cy.get('[data-testid="network-error"]').should('be.visible');
      cy.get('[data-testid="offline-indicator"]').should('be.visible');
    });

    it('should retry failed requests', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('initialError');
      
      cy.intercept('GET', '/api/directory/consultants*', {
        fixture: 'directory/consultants-list.json'
      }).as('retrySuccess');
      
      cy.reload();
      cy.wait('@initialError');
      
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@retrySuccess');
      
      cy.get('[data-testid="directory-consultant-grid"]').should('be.visible');
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      cy.visit('/directory');
    });

    it('should show loading state during initial load', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        delay: 2000,
        fixture: 'directory/consultants-list.json'
      }).as('slowLoad');
      
      cy.reload();
      
      cy.get('[data-testid="directory-loading"]').should('be.visible');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="loading-skeleton"]').should('be.visible');
      
      cy.wait('@slowLoad');
      
      cy.get('[data-testid="directory-loading"]').should('not.exist');
      cy.get('[data-testid="directory-consultant-grid"]').should('be.visible');
    });

    it('should show loading state during search', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        delay: 1000,
        fixture: 'directory/consultants-list.json'
      }).as('slowSearch');
      
      cy.get('[data-testid="directory-search-input"]').type('doctor');
      cy.get('[data-testid="directory-search-button"]').click();
      
      cy.get('[data-testid="search-loading"]').should('be.visible');
      cy.wait('@slowSearch');
      
      cy.get('[data-testid="search-loading"]').should('not.exist');
    });

    it('should show loading state during filter changes', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        delay: 1000,
        fixture: 'directory/consultants-list.json'
      }).as('slowFilter');
      
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-cardiology"]').click();
      
      cy.get('[data-testid="filter-loading"]').should('be.visible');
      cy.wait('@slowFilter');
      
      cy.get('[data-testid="filter-loading"]').should('not.exist');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants*', {
        fixture: 'directory/consultants-list.json'
      }).as('getConsultants');
      
      cy.visit('/directory');
      cy.wait('@getConsultants');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="directory-search-input"]')
        .should('have.attr', 'aria-label', 'Search consultants');
      
      cy.get('[data-testid="directory-consultant-grid"]')
        .should('have.attr', 'role', 'grid');
      
      cy.get('[data-testid^="consultant-card-"]').first()
        .should('have.attr', 'role', 'gridcell')
        .and('have.attr', 'tabindex', '0');
    });

    it('should support keyboard navigation', () => {
      // Tab through search and filters
      cy.get('[data-testid="directory-search-input"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'directory-search-input');
      
      cy.get('[data-testid="directory-search-input"]').tab();
      cy.focused().should('have.attr', 'data-testid', 'directory-search-button');
      
      // Tab to consultant cards
      cy.get('[data-testid^="consultant-card-"]').first().focus();
      cy.focused().should('have.attr', 'data-testid').and('include', 'consultant-card-');
      
      // Enter should activate card
      cy.focused().type('{enter}');
      cy.url().should('include', '/consultants/');
    });

    it('should announce dynamic content changes', () => {
      cy.get('[data-testid="search-results-announce"]')
        .should('have.attr', 'aria-live', 'polite');
      
      cy.get('[data-testid="directory-search-input"]').type('cardiology');
      cy.get('[data-testid="directory-search-button"]').click();
      
      cy.get('[data-testid="search-results-announce"]')
        .should('contain.text', 'Search results updated');
    });

    it('should have proper focus management', () => {
      // Focus should be maintained during filter changes
      cy.get('[data-testid="filter-specialty"]').focus().click();
      cy.get('[data-testid="specialty-option-cardiology"]').click();
      
      cy.focused().should('have.attr', 'data-testid', 'filter-specialty');
    });

    it('should support screen reader navigation', () => {
      cy.get('[data-testid^="consultant-card-"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]')
          .should('have.attr', 'aria-label')
          .and('include', 'Consultant name');
        
        cy.get('[data-testid="consultant-rating"]')
          .should('have.attr', 'aria-label')
          .and('include', 'rating');
      });
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      cy.visit('/directory');
    });

    it('should implement virtual scrolling for large lists', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        body: {
          consultants: new Array(1000).fill(null).map((_, i) => ({
            id: i + 1,
            name: `Consultant ${i + 1}`,
            specialty: 'Cardiology'
          })),
          total: 1000,
          page: 1,
          limit: 50
        }
      }).as('getLargeList');
      
      cy.reload();
      cy.wait('@getLargeList');
      
      // Should only render visible items
      cy.get('[data-testid^="consultant-card-"]').should('have.length.lessThan', 100);
      
      // Should load more on scroll
      cy.get('[data-testid="directory-consultant-grid"]').scrollTo('bottom');
      cy.get('[data-testid="loading-more"]').should('be.visible');
    });

    it('should debounce search input', () => {
      cy.intercept('GET', '/api/directory/consultants*').as('searchRequest');
      
      // Type multiple characters quickly
      cy.get('[data-testid="directory-search-input"]').type('cardiology', { delay: 50 });
      
      // Should only make one request after debounce
      cy.wait('@searchRequest');
      cy.get('@searchRequest.all').should('have.length', 1);
    });

    it('should cache search results', () => {
      cy.intercept('GET', '/api/directory/consultants*search=cardiology*').as('searchCardiology');
      
      // First search
      cy.get('[data-testid="directory-search-input"]').type('cardiology');
      cy.get('[data-testid="directory-search-button"]').click();
      cy.wait('@searchCardiology');
      
      // Clear and search again
      cy.get('[data-testid="directory-clear-search"]').click();
      cy.get('[data-testid="directory-search-input"]').type('cardiology');
      cy.get('[data-testid="directory-search-button"]').click();
      
      // Should load immediately from cache
      cy.get('[data-testid="directory-consultant-grid"]').should('be.visible');
    });
  });

  describe('Analytics and Tracking', () => {
    beforeEach(() => {
      cy.visit('/directory');
    });

    it('should track search events', () => {
      cy.window().then(win => {
        cy.spy(win, 'gtag').as('gtag');
      });
      
      cy.get('[data-testid="directory-search-input"]').type('cardiology');
      cy.get('[data-testid="directory-search-button"]').click();
      
      cy.get('@gtag').should('have.been.calledWith', 'event', 'directory_search');
    });

    it('should track filter usage', () => {
      cy.window().then(win => {
        cy.spy(win, 'gtag').as('gtag');
      });
      
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-option-cardiology"]').click();
      
      cy.get('@gtag').should('have.been.calledWith', 'event', 'directory_filter');
    });

    it('should track consultant profile views', () => {
      cy.window().then(win => {
        cy.spy(win, 'gtag').as('gtag');
      });
      
      cy.get('[data-testid^="consultant-card-"]').first().click();
      
      cy.get('@gtag').should('have.been.calledWith', 'event', 'consultant_profile_view');
    });
  });
});

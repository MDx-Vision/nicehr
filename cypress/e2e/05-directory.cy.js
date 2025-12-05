describe('Directory Feature', () => {
  const testData = {
    user: {
      email: 'test@example.com',
      id: 'ci-test-user'
    },
    consultant: {
      id: 'ci-test-consultant',
      name: 'Test Consultant',
      specialty: 'Epic Analyst',
      location: 'Remote'
    },
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    project: {
      id: 'ci-test-project',
      name: 'Test Project'
    }
  };

  beforeEach(() => {
    // Clear state and authenticate
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login with test user
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for authentication
    cy.intercept('GET', '/api/auth/user').as('getUser');
    cy.wait('@getUser');
  });

  describe('Directory Navigation and Access', () => {
    it('should navigate to directory from main navigation', () => {
      cy.get('[data-testid="nav-directory"]').should('be.visible').click();
      cy.url().should('include', '/directory');
      cy.get('[data-testid="page-title"]').should('contain.text', 'Directory');
    });

    it('should have proper breadcrumb navigation', () => {
      cy.visit('/directory');
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('[data-testid="breadcrumb-home"]').should('contain.text', 'Home');
      cy.get('[data-testid="breadcrumb-current"]').should('contain.text', 'Directory');
    });

    it('should redirect to login if not authenticated', () => {
      cy.clearCookies();
      cy.visit('/directory');
      cy.url().should('include', '/login');
    });

    it('should show loading state initially', () => {
      cy.intercept('GET', '/api/directory/consultants', { delay: 1000 }).as('getConsultants');
      cy.visit('/directory');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.wait('@getConsultants');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });
  });

  describe('Directory Page Layout and UI', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              specialty: 'Epic Analyst',
              location: 'Remote',
              rating: 4.8,
              availability: 'Available',
              skills: ['Epic', 'Training'],
              profilePhoto: null
            },
            {
              id: 2,
              name: 'Jane Smith',
              email: 'jane@example.com',
              specialty: 'Project Manager',
              location: 'New York',
              rating: 4.9,
              availability: 'Busy',
              skills: ['Leadership', 'Agile'],
              profilePhoto: '/images/jane.jpg'
            }
          ],
          total: 2,
          page: 1,
          limit: 20
        }
      }).as('getConsultants');
      
      cy.visit('/directory');
      cy.wait('@getConsultants');
    });

    it('should display all main UI components', () => {
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('[data-testid="search-bar"]').should('be.visible');
      cy.get('[data-testid="filters-section"]').should('be.visible');
      cy.get('[data-testid="consultants-grid"]').should('be.visible');
      cy.get('[data-testid="pagination"]').should('be.visible');
    });

    it('should display consultant cards with all required information', () => {
      cy.get('[data-testid="consultant-card"]').should('have.length', 2);
      
      // Check first consultant card
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]').should('contain.text', 'John Doe');
        cy.get('[data-testid="consultant-email"]').should('contain.text', 'john@example.com');
        cy.get('[data-testid="consultant-specialty"]').should('contain.text', 'Epic Analyst');
        cy.get('[data-testid="consultant-location"]').should('contain.text', 'Remote');
        cy.get('[data-testid="consultant-rating"]').should('contain.text', '4.8');
        cy.get('[data-testid="consultant-availability"]').should('contain.text', 'Available');
        cy.get('[data-testid="consultant-skills"]').should('be.visible');
      });
    });

    it('should display default avatar when no profile photo', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="consultant-avatar"]').should('be.visible');
        cy.get('[data-testid="default-avatar"]').should('be.visible');
      });
    });

    it('should display profile photo when available', () => {
      cy.get('[data-testid="consultant-card"]').eq(1).within(() => {
        cy.get('[data-testid="consultant-avatar"]').should('be.visible');
        cy.get('[data-testid="profile-photo"]').should('be.visible')
          .and('have.attr', 'src', '/images/jane.jpg');
      });
    });

    it('should have proper responsive grid layout', () => {
      // Desktop view
      cy.viewport(1200, 800);
      cy.get('[data-testid="consultants-grid"]').should('have.class', 'grid-cols-3');
      
      // Tablet view
      cy.viewport(768, 1024);
      cy.get('[data-testid="consultants-grid"]').should('have.class', 'grid-cols-2');
      
      // Mobile view
      cy.viewport(375, 667);
      cy.get('[data-testid="consultants-grid"]').should('have.class', 'grid-cols-1');
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants*', (req) => {
        const searchTerm = req.url.searchParams.get('search') || '';
        const consultants = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            specialty: 'Epic Analyst',
            location: 'Remote',
            skills: ['Epic', 'Training']
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            specialty: 'Project Manager',
            location: 'New York',
            skills: ['Leadership', 'Agile']
          }
        ];
        
        const filtered = searchTerm 
          ? consultants.filter(c => 
              c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
            )
          : consultants;
        
        req.reply({
          statusCode: 200,
          body: {
            data: filtered,
            total: filtered.length,
            page: 1,
            limit: 20
          }
        });
      }).as('searchConsultants');
      
      cy.visit('/directory');
      cy.wait('@searchConsultants');
    });

    it('should have search input with proper attributes', () => {
      cy.get('[data-testid="search-input"]')
        .should('be.visible')
        .and('have.attr', 'placeholder', 'Search consultants...')
        .and('have.attr', 'type', 'text');
    });

    it('should search by consultant name', () => {
      cy.get('[data-testid="search-input"]').type('John');
      cy.wait('@searchConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length', 1);
      cy.get('[data-testid="consultant-name"]').should('contain.text', 'John Doe');
    });

    it('should search by specialty', () => {
      cy.get('[data-testid="search-input"]').type('Epic');
      cy.wait('@searchConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length', 1);
      cy.get('[data-testid="consultant-specialty"]').should('contain.text', 'Epic Analyst');
    });

    it('should search by skills', () => {
      cy.get('[data-testid="search-input"]').type('Leadership');
      cy.wait('@searchConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length', 1);
      cy.get('[data-testid="consultant-name"]').should('contain.text', 'Jane Smith');
    });

    it('should show no results message for empty search', () => {
      cy.get('[data-testid="search-input"]').type('NonExistentConsultant');
      cy.wait('@searchConsultants');
      
      cy.get('[data-testid="no-results"]').should('be.visible')
        .and('contain.text', 'No consultants found');
      cy.get('[data-testid="consultant-card"]').should('not.exist');
    });

    it('should debounce search input', () => {
      cy.get('[data-testid="search-input"]').type('J');
      cy.get('[data-testid="search-input"]').type('o');
      cy.get('[data-testid="search-input"]').type('h');
      cy.get('[data-testid="search-input"]').type('n');
      
      // Should only make one request after debounce delay
      cy.wait(500);
      cy.wait('@searchConsultants');
      cy.get('@searchConsultants.all').should('have.length', 2); // Initial + search
    });

    it('should clear search results', () => {
      cy.get('[data-testid="search-input"]').type('John');
      cy.wait('@searchConsultants');
      cy.get('[data-testid="consultant-card"]').should('have.length', 1);
      
      cy.get('[data-testid="search-clear"]').click();
      cy.get('[data-testid="search-input"]').should('have.value', '');
      cy.wait('@searchConsultants');
      cy.get('[data-testid="consultant-card"]').should('have.length', 2);
    });

    it('should preserve search term in URL', () => {
      cy.get('[data-testid="search-input"]').type('John');
      cy.wait('@searchConsultants');
      cy.url().should('include', 'search=John');
    });

    it('should restore search from URL on page load', () => {
      cy.visit('/directory?search=Jane');
      cy.wait('@searchConsultants');
      cy.get('[data-testid="search-input"]').should('have.value', 'Jane');
      cy.get('[data-testid="consultant-card"]').should('have.length', 1);
    });
  });

  describe('Filtering System', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants*', (req) => {
        const specialty = req.url.searchParams.get('specialty');
        const location = req.url.searchParams.get('location');
        const availability = req.url.searchParams.get('availability');
        const skills = req.url.searchParams.getAll('skills');
        
        let consultants = [
          {
            id: 1,
            name: 'John Doe',
            specialty: 'Epic Analyst',
            location: 'Remote',
            availability: 'Available',
            skills: ['Epic', 'Training']
          },
          {
            id: 2,
            name: 'Jane Smith',
            specialty: 'Project Manager',
            location: 'New York',
            availability: 'Busy',
            skills: ['Leadership', 'Agile']
          },
          {
            id: 3,
            name: 'Bob Johnson',
            specialty: 'Epic Analyst',
            location: 'California',
            availability: 'Available',
            skills: ['Epic', 'Go-Live']
          }
        ];
        
        if (specialty) {
          consultants = consultants.filter(c => c.specialty === specialty);
        }
        if (location) {
          consultants = consultants.filter(c => c.location === location);
        }
        if (availability) {
          consultants = consultants.filter(c => c.availability === availability);
        }
        if (skills.length > 0) {
          consultants = consultants.filter(c => 
            skills.some(skill => c.skills.includes(skill))
          );
        }
        
        req.reply({
          statusCode: 200,
          body: {
            data: consultants,
            total: consultants.length,
            page: 1,
            limit: 20
          }
        });
      }).as('filterConsultants');
      
      cy.visit('/directory');
      cy.wait('@filterConsultants');
    });

    it('should display all filter options', () => {
      cy.get('[data-testid="filter-specialty"]').should('be.visible');
      cy.get('[data-testid="filter-location"]').should('be.visible');
      cy.get('[data-testid="filter-availability"]').should('be.visible');
      cy.get('[data-testid="filter-skills"]').should('be.visible');
    });

    it('should filter by specialty', () => {
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-epic-analyst"]').click();
      cy.wait('@filterConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length', 2);
      cy.get('[data-testid="consultant-specialty"]').each(($el) => {
        cy.wrap($el).should('contain.text', 'Epic Analyst');
      });
    });

    it('should filter by location', () => {
      cy.get('[data-testid="filter-location"]').click();
      cy.get('[data-testid="location-remote"]').click();
      cy.wait('@filterConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length', 1);
      cy.get('[data-testid="consultant-location"]').should('contain.text', 'Remote');
    });

    it('should filter by availability', () => {
      cy.get('[data-testid="filter-availability"]').click();
      cy.get('[data-testid="availability-available"]').click();
      cy.wait('@filterConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length', 2);
      cy.get('[data-testid="consultant-availability"]').each(($el) => {
        cy.wrap($el).should('contain.text', 'Available');
      });
    });

    it('should filter by skills', () => {
      cy.get('[data-testid="filter-skills"]').click();
      cy.get('[data-testid="skill-epic"]').click();
      cy.wait('@filterConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length', 2);
      cy.get('[data-testid="consultant-skills"]').each(($el) => {
        cy.wrap($el).should('contain.text', 'Epic');
      });
    });

    it('should combine multiple filters', () => {
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-epic-analyst"]').click();
      
      cy.get('[data-testid="filter-availability"]').click();
      cy.get('[data-testid="availability-available"]').click();
      
      cy.wait('@filterConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length', 2);
    });

    it('should show active filter count', () => {
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-epic-analyst"]').click();
      
      cy.get('[data-testid="active-filters-count"]').should('contain.text', '1');
      
      cy.get('[data-testid="filter-location"]').click();
      cy.get('[data-testid="location-remote"]').click();
      
      cy.get('[data-testid="active-filters-count"]').should('contain.text', '2');
    });

    it('should clear all filters', () => {
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-epic-analyst"]').click();
      cy.wait('@filterConsultants');
      
      cy.get('[data-testid="clear-all-filters"]').click();
      cy.wait('@filterConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length', 3);
      cy.get('[data-testid="active-filters-count"]').should('not.exist');
    });

    it('should persist filters in URL', () => {
      cy.get('[data-testid="filter-specialty"]').click();
      cy.get('[data-testid="specialty-epic-analyst"]').click();
      cy.wait('@filterConsultants');
      
      cy.url().should('include', 'specialty=Epic+Analyst');
    });

    it('should restore filters from URL', () => {
      cy.visit('/directory?specialty=Epic+Analyst&availability=Available');
      cy.wait('@filterConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length', 2);
      cy.get('[data-testid="active-filters-count"]').should('contain.text', '2');
    });
  });

  describe('Consultant Profile Views', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants', {
        statusCode: 200,
        body: {
          data: [{
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            specialty: 'Epic Analyst',
            location: 'Remote',
            rating: 4.8,
            availability: 'Available'
          }]
        }
      }).as('getConsultants');
      
      cy.intercept('GET', '/api/consultants/1/profile', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1-555-123-4567',
          specialty: 'Epic Analyst',
          location: 'Remote',
          rating: 4.8,
          availability: 'Available',
          bio: 'Experienced Epic Analyst with 5+ years in healthcare IT',
          skills: ['Epic', 'Training', 'Go-Live Support'],
          certifications: ['Epic Certified', 'PMP'],
          experience: '5+ years',
          hourlyRate: '$125',
          profilePhoto: '/images/john.jpg',
          coverPhoto: '/images/cover.jpg'
        }
      }).as('getConsultantProfile');
      
      cy.visit('/directory');
      cy.wait('@getConsultants');
    });

    it('should open consultant profile modal on card click', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultantProfile');
      
      cy.get('[data-testid="profile-modal"]').should('be.visible');
      cy.get('[data-testid="profile-name"]').should('contain.text', 'John Doe');
    });

    it('should display complete profile information', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultantProfile');
      
      cy.get('[data-testid="profile-modal"]').within(() => {
        cy.get('[data-testid="profile-photo"]').should('be.visible');
        cy.get('[data-testid="cover-photo"]').should('be.visible');
        cy.get('[data-testid="profile-name"]').should('contain.text', 'John Doe');
        cy.get('[data-testid="profile-email"]').should('contain.text', 'john@example.com');
        cy.get('[data-testid="profile-phone"]').should('contain.text', '+1-555-123-4567');
        cy.get('[data-testid="profile-specialty"]').should('contain.text', 'Epic Analyst');
        cy.get('[data-testid="profile-location"]').should('contain.text', 'Remote');
        cy.get('[data-testid="profile-rating"]').should('contain.text', '4.8');
        cy.get('[data-testid="profile-availability"]').should('contain.text', 'Available');
        cy.get('[data-testid="profile-bio"]').should('contain.text', 'Experienced Epic Analyst');
        cy.get('[data-testid="profile-hourly-rate"]').should('contain.text', '$125');
      });
    });

    it('should display skills section', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultantProfile');
      
      cy.get('[data-testid="profile-skills"]').should('be.visible');
      cy.get('[data-testid="skill-tag"]').should('have.length', 3);
      cy.get('[data-testid="skill-tag"]').first().should('contain.text', 'Epic');
    });

    it('should display certifications section', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultantProfile');
      
      cy.get('[data-testid="profile-certifications"]').should('be.visible');
      cy.get('[data-testid="certification-item"]').should('have.length', 2);
      cy.get('[data-testid="certification-item"]').first().should('contain.text', 'Epic Certified');
    });

    it('should close modal on close button click', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultantProfile');
      
      cy.get('[data-testid="close-modal"]').click();
      cy.get('[data-testid="profile-modal"]').should('not.exist');
    });

    it('should close modal on escape key', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultantProfile');
      
      cy.get('body').type('{esc}');
      cy.get('[data-testid="profile-modal"]').should('not.exist');
    });

    it('should close modal on backdrop click', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultantProfile');
      
      cy.get('[data-testid="modal-backdrop"]').click({ force: true });
      cy.get('[data-testid="profile-modal"]').should('not.exist');
    });

    it('should navigate to full profile page', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getConsultantProfile');
      
      cy.get('[data-testid="view-full-profile"]').click();
      cy.url().should('include', '/consultants/1');
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants*', (req) => {
        const page = parseInt(req.url.searchParams.get('page') || '1');
        const limit = parseInt(req.url.searchParams.get('limit') || '20');
        const total = 50;
        
        const consultants = Array.from({ length: limit }, (_, i) => ({
          id: (page - 1) * limit + i + 1,
          name: `Consultant ${(page - 1) * limit + i + 1}`,
          email: `consultant${(page - 1) * limit + i + 1}@example.com`,
          specialty: 'Epic Analyst',
          location: 'Remote',
          rating: 4.5,
          availability: 'Available'
        }));
        
        req.reply({
          statusCode: 200,
          body: {
            data: consultants,
            total: total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total / limit)
          }
        });
      }).as('getConsultantsPaginated');
      
      cy.visit('/directory');
      cy.wait('@getConsultantsPaginated');
    });

    it('should display pagination controls', () => {
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-prev"]').should('be.visible');
      cy.get('[data-testid="pagination-next"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1-20 of 50');
    });

    it('should navigate to next page', () => {
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getConsultantsPaginated');
      
      cy.url().should('include', 'page=2');
      cy.get('[data-testid="consultant-name"]').first().should('contain.text', 'Consultant 21');
    });

    it('should navigate to previous page', () => {
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getConsultantsPaginated');
      
      cy.get('[data-testid="pagination-prev"]').click();
      cy.wait('@getConsultantsPaginated');
      
      cy.url().should('include', 'page=1');
      cy.get('[data-testid="consultant-name"]').first().should('contain.text', 'Consultant 1');
    });

    it('should disable prev button on first page', () => {
      cy.get('[data-testid="pagination-prev"]').should('be.disabled');
    });

    it('should disable next button on last page', () => {
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getConsultantsPaginated');
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getConsultantsPaginated');
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getConsultantsPaginated');
      
      cy.get('[data-testid="pagination-next"]').should('be.disabled');
    });

    it('should show page numbers', () => {
      cy.get('[data-testid="page-number-1"]').should('have.class', 'active');
      cy.get('[data-testid="page-number-2"]').should('be.visible').click();
      cy.wait('@getConsultantsPaginated');
      
      cy.get('[data-testid="page-number-2"]').should('have.class', 'active');
      cy.url().should('include', 'page=2');
    });

    it('should change items per page', () => {
      cy.get('[data-testid="items-per-page"]').select('10');
      cy.wait('@getConsultantsPaginated');
      
      cy.get('[data-testid="consultant-card"]').should('have.length', 10);
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1-10 of 50');
    });
  });

  describe('Sort Functionality', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants*', (req) => {
        const sortBy = req.url.searchParams.get('sortBy') || 'name';
        const sortOrder = req.url.searchParams.get('sortOrder') || 'asc';
        
        let consultants = [
          { id: 1, name: 'Alice Johnson', rating: 4.9, specialty: 'Epic Analyst' },
          { id: 2, name: 'Bob Smith', rating: 4.5, specialty: 'Project Manager' },
          { id: 3, name: 'Charlie Brown', rating: 4.8, specialty: 'Epic Analyst' }
        ];
        
        consultants.sort((a, b) => {
          const aVal = a[sortBy];
          const bVal = b[sortBy];
          
          if (sortOrder === 'desc') {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
        
        req.reply({
          statusCode: 200,
          body: { data: consultants, total: 3 }
        });
      }).as('getSortedConsultants');
      
      cy.visit('/directory');
      cy.wait('@getSortedConsultants');
    });

    it('should display sort dropdown', () => {
      cy.get('[data-testid="sort-dropdown"]').should('be.visible');
    });

    it('should sort by name ascending', () => {
      cy.get('[data-testid="sort-dropdown"]').select('name-asc');
      cy.wait('@getSortedConsultants');
      
      cy.get('[data-testid="consultant-name"]').first().should('contain.text', 'Alice Johnson');
    });

    it('should sort by name descending', () => {
      cy.get('[data-testid="sort-dropdown"]').select('name-desc');
      cy.wait('@getSortedConsultants');
      
      cy.get('[data-testid="consultant-name"]').first().should('contain.text', 'Charlie Brown');
    });

    it('should sort by rating descending', () => {
      cy.get('[data-testid="sort-dropdown"]').select('rating-desc');
      cy.wait('@getSortedConsultants');
      
      cy.get('[data-testid="consultant-name"]').first().should('contain.text', 'Alice Johnson');
    });

    it('should persist sort in URL', () => {
      cy.get('[data-testid="sort-dropdown"]').select('rating-desc');
      cy.wait('@getSortedConsultants');
      
      cy.url().should('include', 'sortBy=rating&sortOrder=desc');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/directory/consultants', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getConsultantsError');
      
      cy.visit('/directory');
      cy.wait('@getConsultantsError');
      
      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain.text', 'Failed to load consultants');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should retry loading on error', () => {
      cy.intercept('GET', '/api/directory/consultants', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getConsultantsError');
      
      cy.visit('/directory');
      cy.wait('@getConsultantsError');
      
      cy.intercept('GET', '/api/directory/consultants', {
        statusCode: 200,
        body: { data: [], total: 0 }
      }).as('getConsultantsRetry');
      
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@getConsultantsRetry');
      
      cy.get('[data-testid="error-message"]').should('not.exist');
    });

    it('should handle network errors', () => {
      cy.intercept('GET', '/api/directory/consultants', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/directory');
      cy.wait('@networkError');
      
      cy.get('[data-testid="error-message"]').should('contain.text', 'Network error');
    });

    it('should handle profile loading errors', () => {
      cy.intercept('GET', '/api/directory/consultants', {
        statusCode: 200,
        body: { data: [{ id: 1, name: 'John Doe' }] }
      });
      
      cy.intercept('GET', '/api/consultants/1/profile', {
        statusCode: 404,
        body: { error: 'Consultant not found' }
      }).as('getProfileError');
      
      cy.visit('/directory');
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getProfileError');
      
      cy.get('[data-testid="profile-error"]').should('be.visible')
        .and('contain.text', 'Failed to load consultant profile');
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no consultants exist', () => {
      cy.intercept('GET', '/api/directory/consultants', {
        statusCode: 200,
        body: { data: [], total: 0 }
      }).as('getEmptyConsultants');
      
      cy.visit('/directory');
      cy.wait('@getEmptyConsultants');
      
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-message"]').should('contain.text', 'No consultants found');
      cy.get('[data-testid="empty-description"]').should('contain.text', 'Try adjusting your search');
    });

    it('should show filtered empty state', () => {
      cy.intercept('GET', '/api/directory/consultants*', (req) => {
        const hasFilters = req.url.searchParams.has('specialty') || 
                          req.url.searchParams.has('search');
        
        req.reply({
          statusCode: 200,
          body: { data: [], total: 0 }
        });
      }).as('getFilteredEmpty');
      
      cy.visit('/directory');
      cy.get('[data-testid="search-input"]').type('NonexistentConsultant');
      cy.wait('@getFilteredEmpty');
      
      cy.get('[data-testid="no-results"]').should('be.visible');
      cy.get('[data-testid="clear-filters-button"]').should('be.visible');
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants', {
        statusCode: 200,
        body: {
          data: [
            { id: 1, name: 'John Doe', specialty: 'Epic Analyst' },
            { id: 2, name: 'Jane Smith', specialty: 'Project Manager' }
          ]
        }
      });
      
      cy.visit('/directory');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="search-input"]').should('have.attr', 'aria-label', 'Search consultants');
      cy.get('[data-testid="consultants-grid"]').should('have.attr', 'role', 'grid');
      cy.get('[data-testid="consultant-card"]').should('have.attr', 'role', 'gridcell');
    });

    it('should support keyboard navigation for consultant cards', () => {
      cy.get('[data-testid="consultant-card"]').first().focus();
      cy.get('[data-testid="consultant-card"]').first().should('be.focused');
      
      cy.focused().type('{enter}');
      cy.get('[data-testid="profile-modal"]').should('be.visible');
    });

    it('should have proper focus management in modal', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.get('[data-testid="close-modal"]').should('be.focused');
    });

    it('should trap focus within modal', () => {
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.get('[data-testid="close-modal"]').tab();
      cy.get('[data-testid="view-full-profile"]').should('be.focused');
      cy.get('[data-testid="view-full-profile"]').tab();
      cy.get('[data-testid="close-modal"]').should('be.focused');
    });
  });

  describe('Performance and Optimization', () => {
    it('should implement virtual scrolling for large datasets', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        statusCode: 200,
        body: {
          data: Array.from({ length: 1000 }, (_, i) => ({
            id: i + 1,
            name: `Consultant ${i + 1}`,
            specialty: 'Epic Analyst'
          })),
          total: 1000
        }
      });
      
      cy.visit('/directory');
      
      // Only rendered items should exist in DOM
      cy.get('[data-testid="consultant-card"]').should('have.length.lessThan', 50);
    });

    it('should prefetch next page data', () => {
      cy.intercept('GET', '/api/directory/consultants*page=1*').as('getPage1');
      cy.intercept('GET', '/api/directory/consultants*page=2*').as('getPage2');
      
      cy.visit('/directory');
      cy.wait('@getPage1');
      
      // Should prefetch next page when near end of current page
      cy.scrollTo('bottom');
      cy.wait('@getPage2');
    });

    it('should cache consultant profiles', () => {
      cy.intercept('GET', '/api/consultants/1/profile').as('getProfile');
      
      cy.visit('/directory');
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.wait('@getProfile');
      cy.get('[data-testid="close-modal"]').click();
      
      // Opening again should use cached data
      cy.get('[data-testid="consultant-card"]').first().click();
      cy.get('@getProfile.all').should('have.length', 1);
    });
  });
});

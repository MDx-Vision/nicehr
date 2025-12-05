describe('Directory Feature', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockConsultants = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      specializations: ['Epic', 'Cerner'],
      location: 'New York, NY',
      rating: 4.5,
      status: 'available',
      profilePhoto: null,
      experience: 5,
      certifications: ['Epic Certified'],
      skills: ['EHR Implementation', 'Training']
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      specializations: ['Epic', 'Allscripts'],
      location: 'San Francisco, CA',
      rating: 4.8,
      status: 'busy',
      profilePhoto: '/images/jane-profile.jpg',
      experience: 8,
      certifications: ['Epic Certified', 'PMP'],
      skills: ['Project Management', 'Go-Live Support']
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      specializations: ['Cerner'],
      location: 'Chicago, IL',
      rating: 4.2,
      status: 'unavailable',
      profilePhoto: null,
      experience: 3,
      certifications: ['Cerner Certified'],
      skills: ['System Configuration', 'User Training']
    }
  ];

  const mockConsultantProfile = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    bio: 'Experienced EHR consultant with 5+ years in healthcare IT.',
    specializations: ['Epic', 'Cerner'],
    location: 'New York, NY',
    rating: 4.5,
    totalProjects: 15,
    completionRate: 98,
    profilePhoto: null,
    coverPhoto: null,
    experience: 5,
    certifications: [
      { id: 1, name: 'Epic Certified', issuedDate: '2020-01-15', expiryDate: '2025-01-15' }
    ],
    skills: [
      { id: 1, name: 'EHR Implementation', level: 'Expert' },
      { id: 2, name: 'Training', level: 'Advanced' }
    ],
    availability: [
      { id: 1, startDate: '2024-02-01', endDate: '2024-02-28', status: 'available' }
    ],
    recentProjects: [
      { id: 1, name: 'Hospital A Epic Implementation', status: 'completed', endDate: '2023-12-15' }
    ],
    documents: [
      { id: 1, name: 'Resume.pdf', type: 'resume', status: 'verified', uploadedAt: '2023-01-01' }
    ]
  };

  beforeEach(() => {
    // Setup authentication
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: {
        id: 1,
        email: testUser.email,
        role: 'admin',
        firstName: 'Test',
        lastName: 'User'
      }
    }).as('getUser');

    // Mock directory API calls
    cy.intercept('GET', '/api/directory/consultants*', {
      statusCode: 200,
      body: {
        data: mockConsultants,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1
        }
      }
    }).as('getDirectoryConsultants');

    cy.intercept('GET', '/api/consultants/search*', {
      statusCode: 200,
      body: mockConsultants.filter(c => c.firstName.toLowerCase().includes('john'))
    }).as('searchConsultants');

    cy.intercept('GET', '/api/consultants/*/profile', {
      statusCode: 200,
      body: mockConsultantProfile
    }).as('getConsultantProfile');

    // Login and navigate to directory
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testUser.email);
    cy.get('[data-testid="input-password"]').type(testUser.password);
    cy.get('[data-testid="button-login"]').click();
    cy.wait('@getUser');
  });

  describe('Directory Page Navigation and Layout', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should display directory page header and navigation', () => {
      cy.get('[data-testid="page-title"]').should('contain.text', 'Consultant Directory');
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('[data-testid="breadcrumb-home"]').should('contain.text', 'Home');
      cy.get('[data-testid="breadcrumb-current"]').should('contain.text', 'Directory');
    });

    it('should display search and filter controls', () => {
      cy.get('[data-testid="directory-search"]').should('be.visible');
      cy.get('[data-testid="filter-specialization"]').should('be.visible');
      cy.get('[data-testid="filter-location"]').should('be.visible');
      cy.get('[data-testid="filter-availability"]').should('be.visible');
      cy.get('[data-testid="filter-rating"]').should('be.visible');
      cy.get('[data-testid="sort-options"]').should('be.visible');
    });

    it('should display view toggle options', () => {
      cy.get('[data-testid="view-toggle"]').should('be.visible');
      cy.get('[data-testid="view-grid"]').should('be.visible');
      cy.get('[data-testid="view-list"]').should('be.visible');
      cy.get('[data-testid="view-table"]').should('be.visible');
    });

    it('should show results count and pagination', () => {
      cy.get('[data-testid="results-count"]').should('contain.text', '3 consultants found');
      cy.get('[data-testid="pagination"]').should('be.visible');
    });

    it('should handle empty state when no consultants', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        statusCode: 200,
        body: {
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        }
      }).as('getEmptyDirectory');

      cy.reload();
      cy.wait('@getEmptyDirectory');

      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state-title"]').should('contain.text', 'No consultants found');
      cy.get('[data-testid="empty-state-description"]').should('be.visible');
    });
  });

  describe('Consultant Cards Display', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should display consultant cards with all required information', () => {
      cy.get('[data-testid="consultant-card"]').should('have.length', 3);

      // Check first consultant card
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]').should('contain.text', 'John Doe');
        cy.get('[data-testid="consultant-email"]').should('contain.text', 'john.doe@example.com');
        cy.get('[data-testid="consultant-location"]').should('contain.text', 'New York, NY');
        cy.get('[data-testid="consultant-rating"]').should('contain.text', '4.5');
        cy.get('[data-testid="consultant-status"]').should('contain.text', 'available');
        cy.get('[data-testid="consultant-specializations"]').should('contain.text', 'Epic');
        cy.get('[data-testid="consultant-specializations"]').should('contain.text', 'Cerner');
        cy.get('[data-testid="consultant-experience"]').should('contain.text', '5 years');
      });
    });

    it('should display status indicators correctly', () => {
      cy.get('[data-testid="consultant-card"]').each(($card, index) => {
        const consultant = mockConsultants[index];
        cy.wrap($card).within(() => {
          cy.get('[data-testid="status-indicator"]')
            .should('have.class', `status-${consultant.status}`);
          
          if (consultant.status === 'available') {
            cy.get('[data-testid="status-indicator"]').should('have.class', 'bg-green-500');
          } else if (consultant.status === 'busy') {
            cy.get('[data-testid="status-indicator"]').should('have.class', 'bg-yellow-500');
          } else if (consultant.status === 'unavailable') {
            cy.get('[data-testid="status-indicator"]').should('have.class', 'bg-red-500');
          }
        });
      });
    });

    it('should display profile photos or default avatars', () => {
      cy.get('[data-testid="consultant-card"]').each(($card, index) => {
        const consultant = mockConsultants[index];
        cy.wrap($card).within(() => {
          if (consultant.profilePhoto) {
            cy.get('[data-testid="consultant-photo"]')
              .should('have.attr', 'src', consultant.profilePhoto);
          } else {
            cy.get('[data-testid="consultant-avatar"]').should('be.visible');
            cy.get('[data-testid="consultant-initials"]')
              .should('contain.text', consultant.firstName.charAt(0) + consultant.lastName.charAt(0));
          }
        });
      });
    });

    it('should display rating stars correctly', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="rating-stars"]').should('be.visible');
        cy.get('[data-testid="star-filled"]').should('have.length', 4);
        cy.get('[data-testid="star-half"]').should('have.length', 1);
        cy.get('[data-testid="rating-value"]').should('contain.text', '4.5');
      });
    });

    it('should display specialization tags', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="specialization-tag"]').should('have.length', 2);
        cy.get('[data-testid="specialization-tag"]').first().should('contain.text', 'Epic');
        cy.get('[data-testid="specialization-tag"]').last().should('contain.text', 'Cerner');
      });
    });

    it('should display action buttons', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-btn"]').should('be.visible').and('contain.text', 'View Profile');
        cy.get('[data-testid="contact-btn"]').should('be.visible').and('contain.text', 'Contact');
        cy.get('[data-testid="bookmark-btn"]').should('be.visible');
      });
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should perform basic text search', () => {
      cy.get('[data-testid="directory-search"]').type('John');
      cy.get('[data-testid="search-btn"]').click();
      cy.wait('@searchConsultants');

      cy.get('[data-testid="consultant-card"]').should('have.length', 1);
      cy.get('[data-testid="consultant-name"]').should('contain.text', 'John Doe');
    });

    it('should clear search results', () => {
      cy.get('[data-testid="directory-search"]').type('John');
      cy.get('[data-testid="search-btn"]').click();
      cy.wait('@searchConsultants');

      cy.get('[data-testid="clear-search-btn"]').click();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="consultant-card"]').should('have.length', 3);
      cy.get('[data-testid="directory-search"]').should('have.value', '');
    });

    it('should handle search with no results', () => {
      cy.intercept('GET', '/api/consultants/search*', {
        statusCode: 200,
        body: []
      }).as('searchNoResults');

      cy.get('[data-testid="directory-search"]').type('NonexistentName');
      cy.get('[data-testid="search-btn"]').click();
      cy.wait('@searchNoResults');

      cy.get('[data-testid="no-results"]').should('be.visible');
      cy.get('[data-testid="no-results-message"]').should('contain.text', 'No consultants match your search');
    });

    it('should search on Enter key press', () => {
      cy.get('[data-testid="directory-search"]').type('John{enter}');
      cy.wait('@searchConsultants');

      cy.get('[data-testid="consultant-card"]').should('have.length', 1);
    });

    it('should show search suggestions/autocomplete', () => {
      cy.get('[data-testid="directory-search"]').type('J');
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
      cy.get('[data-testid="suggestion-item"]').should('contain.text', 'John Doe');
      cy.get('[data-testid="suggestion-item"]').should('contain.text', 'Jane Smith');
    });

    it('should handle search API errors gracefully', () => {
      cy.intercept('GET', '/api/consultants/search*', {
        statusCode: 500,
        body: { error: 'Search service unavailable' }
      }).as('searchError');

      cy.get('[data-testid="directory-search"]').type('John');
      cy.get('[data-testid="search-btn"]').click();
      cy.wait('@searchError');

      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Search is temporarily unavailable');
    });
  });

  describe('Filtering and Sorting', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should filter by specialization', () => {
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-option-epic"]').click();

      cy.intercept('GET', '/api/directory/consultants*specialization=epic*', {
        statusCode: 200,
        body: {
          data: mockConsultants.filter(c => c.specializations.includes('Epic')),
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      }).as('filterBySpecialization');

      cy.wait('@filterBySpecialization');
      cy.get('[data-testid="consultant-card"]').should('have.length', 2);
    });

    it('should filter by availability status', () => {
      cy.get('[data-testid="filter-availability"]').click();
      cy.get('[data-testid="availability-available"]').click();

      cy.intercept('GET', '/api/directory/consultants*status=available*', {
        statusCode: 200,
        body: {
          data: mockConsultants.filter(c => c.status === 'available'),
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }).as('filterByAvailability');

      cy.wait('@filterByAvailability');
      cy.get('[data-testid="consultant-card"]').should('have.length', 1);
    });

    it('should filter by rating', () => {
      cy.get('[data-testid="filter-rating"]').click();
      cy.get('[data-testid="rating-4-plus"]').click();

      cy.intercept('GET', '/api/directory/consultants*rating=4*', {
        statusCode: 200,
        body: {
          data: mockConsultants.filter(c => c.rating >= 4),
          pagination: { page: 1, limit: 20, total: 3, totalPages: 1 }
        }
      }).as('filterByRating');

      cy.wait('@filterByRating');
      cy.get('[data-testid="consultant-card"]').should('have.length', 3);
    });

    it('should filter by location', () => {
      cy.get('[data-testid="filter-location"]').type('New York');
      cy.get('[data-testid="apply-location-filter"]').click();

      cy.intercept('GET', '/api/directory/consultants*location=New+York*', {
        statusCode: 200,
        body: {
          data: mockConsultants.filter(c => c.location.includes('New York')),
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }).as('filterByLocation');

      cy.wait('@filterByLocation');
      cy.get('[data-testid="consultant-card"]').should('have.length', 1);
    });

    it('should apply multiple filters simultaneously', () => {
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-option-epic"]').click();
      
      cy.get('[data-testid="filter-availability"]').click();
      cy.get('[data-testid="availability-available"]').click();

      cy.intercept('GET', '/api/directory/consultants*specialization=epic*status=available*', {
        statusCode: 200,
        body: {
          data: mockConsultants.filter(c => 
            c.specializations.includes('Epic') && c.status === 'available'
          ),
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }).as('multipleFilters');

      cy.wait('@multipleFilters');
      cy.get('[data-testid="consultant-card"]').should('have.length', 1);
    });

    it('should clear all filters', () => {
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-option-epic"]').click();
      
      cy.get('[data-testid="clear-filters-btn"]').click();
      cy.wait('@getDirectoryConsultants');

      cy.get('[data-testid="consultant-card"]').should('have.length', 3);
      cy.get('[data-testid="active-filters"]').should('not.exist');
    });

    it('should show active filter indicators', () => {
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-option-epic"]').click();

      cy.get('[data-testid="active-filters"]').should('be.visible');
      cy.get('[data-testid="filter-tag"]').should('contain.text', 'Epic');
      cy.get('[data-testid="remove-filter"]').should('be.visible');
    });

    it('should sort consultants by name', () => {
      cy.get('[data-testid="sort-options"]').select('name');

      cy.intercept('GET', '/api/directory/consultants*sort=name*', {
        statusCode: 200,
        body: {
          data: [...mockConsultants].sort((a, b) => a.firstName.localeCompare(b.firstName)),
          pagination: { page: 1, limit: 20, total: 3, totalPages: 1 }
        }
      }).as('sortByName');

      cy.wait('@sortByName');
      cy.get('[data-testid="consultant-name"]').first().should('contain.text', 'Jane Smith');
    });

    it('should sort consultants by rating', () => {
      cy.get('[data-testid="sort-options"]').select('rating');

      cy.intercept('GET', '/api/directory/consultants*sort=rating*', {
        statusCode: 200,
        body: {
          data: [...mockConsultants].sort((a, b) => b.rating - a.rating),
          pagination: { page: 1, limit: 20, total: 3, totalPages: 1 }
        }
      }).as('sortByRating');

      cy.wait('@sortByRating');
      cy.get('[data-testid="consultant-rating"]').first().should('contain.text', '4.8');
    });

    it('should sort consultants by experience', () => {
      cy.get('[data-testid="sort-options"]').select('experience');

      cy.intercept('GET', '/api/directory/consultants*sort=experience*', {
        statusCode: 200,
        body: {
          data: [...mockConsultants].sort((a, b) => b.experience - a.experience),
          pagination: { page: 1, limit: 20, total: 3, totalPages: 1 }
        }
      }).as('sortByExperience');

      cy.wait('@sortByExperience');
      cy.get('[data-testid="consultant-experience"]').first().should('contain.text', '8 years');
    });
  });

  describe('View Options and Layout', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should switch to list view', () => {
      cy.get('[data-testid="view-list"]').click();
      cy.get('[data-testid="consultants-list"]').should('be.visible');
      cy.get('[data-testid="consultants-grid"]').should('not.exist');
      
      // Verify list view layout
      cy.get('[data-testid="consultant-list-item"]').should('have.length', 3);
      cy.get('[data-testid="consultant-list-item"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]').should('be.visible');
        cy.get('[data-testid="consultant-details"]').should('be.visible');
      });
    });

    it('should switch to table view', () => {
      cy.get('[data-testid="view-table"]').click();
      cy.get('[data-testid="consultants-table"]').should('be.visible');
      
      // Verify table headers
      cy.get('[data-testid="table-header-name"]').should('contain.text', 'Name');
      cy.get('[data-testid="table-header-specialization"]').should('contain.text', 'Specialization');
      cy.get('[data-testid="table-header-location"]').should('contain.text', 'Location');
      cy.get('[data-testid="table-header-rating"]').should('contain.text', 'Rating');
      cy.get('[data-testid="table-header-status"]').should('contain.text', 'Status');
      cy.get('[data-testid="table-header-actions"]').should('contain.text', 'Actions');

      // Verify table rows
      cy.get('[data-testid="consultant-table-row"]').should('have.length', 3);
    });

    it('should switch back to grid view', () => {
      cy.get('[data-testid="view-list"]').click();
      cy.get('[data-testid="view-grid"]').click();
      
      cy.get('[data-testid="consultants-grid"]').should('be.visible');
      cy.get('[data-testid="consultant-card"]').should('have.length', 3);
    });

    it('should remember view preference', () => {
      cy.get('[data-testid="view-list"]').click();
      cy.reload();
      cy.wait('@getDirectoryConsultants');
      
      cy.get('[data-testid="consultants-list"]').should('be.visible');
      cy.get('[data-testid="view-list"]').should('have.class', 'active');
    });

    it('should handle responsive layout on mobile', () => {
      cy.viewport('iphone-x');
      
      cy.get('[data-testid="view-toggle"]').should('be.visible');
      cy.get('[data-testid="consultant-card"]').should('have.class', 'mobile-card');
      
      // Check mobile-specific elements
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
      cy.get('[data-testid="filters-drawer-trigger"]').should('be.visible');
    });
  });

  describe('Pagination', () => {
    const largeMockData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      firstName: `Consultant${i + 1}`,
      lastName: 'Test',
      email: `consultant${i + 1}@test.com`,
      specializations: ['Epic'],
      location: 'Test City',
      rating: 4.0,
      status: 'available'
    }));

    beforeEach(() => {
      cy.intercept('GET', '/api/directory/consultants*', {
        statusCode: 200,
        body: {
          data: largeMockData.slice(0, 20),
          pagination: {
            page: 1,
            limit: 20,
            total: 25,
            totalPages: 2
          }
        }
      }).as('getDirectoryConsultantsPage1');

      cy.visit('/directory');
      cy.wait('@getDirectoryConsultantsPage1');
    });

    it('should display pagination controls', () => {
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1-20 of 25');
      cy.get('[data-testid="pagination-next"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="pagination-prev"]').should('be.disabled');
      cy.get('[data-testid="page-number"]').should('contain.text', '1');
    });

    it('should navigate to next page', () => {
      cy.intercept('GET', '/api/directory/consultants*page=2*', {
        statusCode: 200,
        body: {
          data: largeMockData.slice(20, 25),
          pagination: {
            page: 2,
            limit: 20,
            total: 25,
            totalPages: 2
          }
        }
      }).as('getDirectoryConsultantsPage2');

      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getDirectoryConsultantsPage2');

      cy.get('[data-testid="consultant-card"]').should('have.length', 5);
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 21-25 of 25');
      cy.get('[data-testid="pagination-prev"]').should('not.be.disabled');
      cy.get('[data-testid="pagination-next"]').should('be.disabled');
    });

    it('should navigate to previous page', () => {
      // Go to page 2 first
      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getDirectoryConsultantsPage2');

      // Go back to page 1
      cy.get('[data-testid="pagination-prev"]').click();
      cy.wait('@getDirectoryConsultantsPage1');

      cy.get('[data-testid="consultant-card"]').should('have.length', 20);
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1-20 of 25');
    });

    it('should change page size', () => {
      cy.intercept('GET', '/api/directory/consultants*limit=10*', {
        statusCode: 200,
        body: {
          data: largeMockData.slice(0, 10),
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3
          }
        }
      }).as('getDirectoryConsultantsLimit10');

      cy.get('[data-testid="page-size-select"]').select('10');
      cy.wait('@getDirectoryConsultantsLimit10');

      cy.get('[data-testid="consultant-card"]').should('have.length', 10);
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1-10 of 25');
    });

    it('should handle direct page navigation', () => {
      cy.get('[data-testid="page-input"]').clear().type('2{enter}');
      cy.wait('@getDirectoryConsultantsPage2');

      cy.get('[data-testid="page-number"]').should('contain.text', '2');
    });
  });

  describe('Consultant Profile Modal/Page', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should open consultant profile modal', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-btn"]').click();
      });

      cy.wait('@getConsultantProfile');
      cy.get('[data-testid="profile-modal"]').should('be.visible');
    });

    it('should display complete consultant profile information', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-btn"]').click();
      });
      cy.wait('@getConsultantProfile');

      cy.get('[data-testid="profile-modal"]').within(() => {
        // Header information
        cy.get('[data-testid="profile-name"]').should('contain.text', 'John Doe');
        cy.get('[data-testid="profile-email"]').should('contain.text', 'john.doe@example.com');
        cy.get('[data-testid="profile-phone"]').should('contain.text', '+1-555-0123');
        cy.get('[data-testid="profile-location"]').should('contain.text', 'New York, NY');

        // Bio section
        cy.get('[data-testid="profile-bio"]').should('contain.text', 'Experienced EHR consultant');

        // Stats
        cy.get('[data-testid="profile-rating"]').should('contain.text', '4.5');
        cy.get('[data-testid="profile-projects"]').should('contain.text', '15');
        cy.get('[data-testid="profile-completion-rate"]').should('contain.text', '98%');

        // Specializations
        cy.get('[data-testid="profile-specializations"]').should('be.visible');
        cy.get('[data-testid="specialization-tag"]').should('contain.text', 'Epic');

        // Skills
        cy.get('[data-testid="profile-skills"]').should('be.visible');
        cy.get('[data-testid="skill-item"]').should('contain.text', 'EHR Implementation');

        // Certifications
        cy.get('[data-testid="profile-certifications"]').should('be.visible');
        cy.get('[data-testid="certification-item"]').should('contain.text', 'Epic Certified');
      });
    });

    it('should display availability calendar', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-btn"]').click();
      });
      cy.wait('@getConsultantProfile');

      cy.get('[data-testid="profile-modal"]').within(() => {
        cy.get('[data-testid="availability-section"]').should('be.visible');
        cy.get('[data-testid="availability-calendar"]').should('be.visible');
        cy.get('[data-testid="availability-legend"]').should('be.visible');
      });
    });

    it('should show recent projects', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-btn"]').click();
      });
      cy.wait('@getConsultantProfile');

      cy.get('[data-testid="profile-modal"]').within(() => {
        cy.get('[data-testid="recent-projects"]').should('be.visible');
        cy.get('[data-testid="project-item"]').should('contain.text', 'Hospital A Epic Implementation');
      });
    });

    it('should display documents section for authorized users', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-btn"]').click();
      });
      cy.wait('@getConsultantProfile');

      cy.get('[data-testid="profile-modal"]').within(() => {
        cy.get('[data-testid="documents-section"]').should('be.visible');
        cy.get('[data-testid="document-item"]').should('contain.text', 'Resume.pdf');
        cy.get('[data-testid="document-status"]').should('contain.text', 'verified');
      });
    });

    it('should close profile modal', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-btn"]').click();
      });
      cy.wait('@getConsultantProfile');

      cy.get('[data-testid="close-profile-modal"]').click();
      cy.get('[data-testid="profile-modal"]').should('not.exist');
    });

    it('should close modal on ESC key', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-btn"]').click();
      });
      cy.wait('@getConsultantProfile');

      cy.get('[data-testid="profile-modal"]').type('{esc}');
      cy.get('[data-testid="profile-modal"]').should('not.exist');
    });

    it('should navigate to full profile page', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-btn"]').click();
      });
      cy.wait('@getConsultantProfile');

      cy.get('[data-testid="view-full-profile"]').click();
      cy.url().should('include', '/consultants/1/profile');
    });
  });

  describe('Contact Functionality', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should open contact modal', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="contact-btn"]').click();
      });

      cy.get('[data-testid="contact-modal"]').should('be.visible');
      cy.get('[data-testid="contact-form"]').should('be.visible');
    });

    it('should display contact form with required fields', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="contact-btn"]').click();
      });

      cy.get('[data-testid="contact-modal"]').within(() => {
        cy.get('[data-testid="contact-to"]').should('contain.text', 'John Doe');
        cy.get('[data-testid="contact-subject"]').should('be.visible').and('have.attr', 'required');
        cy.get('[data-testid="contact-message"]').should('be.visible').and('have.attr', 'required');
        cy.get('[data-testid="contact-priority"]').should('be.visible');
        cy.get('[data-testid="send-message-btn"]').should('be.visible');
        cy.get('[data-testid="cancel-contact-btn"]').should('be.visible');
      });
    });

    it('should validate contact form', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="contact-btn"]').click();
      });

      cy.get('[data-testid="send-message-btn"]').click();

      cy.get('[data-testid="subject-error"]').should('contain.text', 'Subject is required');
      cy.get('[data-testid="message-error"]').should('contain.text', 'Message is required');
    });

    it('should send contact message successfully', () => {
      cy.intercept('POST', '/api/messages', {
        statusCode: 201,
        body: { id: 1, status: 'sent' }
      }).as('sendMessage');

      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="contact-btn"]').click();
      });

      cy.get('[data-testid="contact-modal"]').within(() => {
        cy.get('[data-testid="contact-subject"]').type('Project Inquiry');
        cy.get('[data-testid="contact-message"]').type('Hello, I would like to discuss a potential project opportunity.');
        cy.get('[data-testid="contact-priority"]').select('normal');
        cy.get('[data-testid="send-message-btn"]').click();
      });

      cy.wait('@sendMessage');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Message sent successfully');
      cy.get('[data-testid="contact-modal"]').should('not.exist');
    });

    it('should handle contact form errors', () => {
      cy.intercept('POST', '/api/messages', {
        statusCode: 500,
        body: { error: 'Failed to send message' }
      }).as('sendMessageError');

      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="contact-btn"]').click();
      });

      cy.get('[data-testid="contact-modal"]').within(() => {
        cy.get('[data-testid="contact-subject"]').type('Project Inquiry');
        cy.get('[data-testid="contact-message"]').type('Hello, I would like to discuss a potential project opportunity.');
        cy.get('[data-testid="send-message-btn"]').click();
      });

      cy.wait('@sendMessageError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to send message');
    });

    it('should cancel contact form', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="contact-btn"]').click();
      });

      cy.get('[data-testid="cancel-contact-btn"]').click();
      cy.get('[data-testid="contact-modal"]').should('not.exist');
    });
  });

  describe('Bookmark Functionality', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');

      cy.intercept('GET', '/api/bookmarks', {
        statusCode: 200,
        body: []
      }).as('getBookmarks');
    });

    it('should bookmark a consultant', () => {
      cy.intercept('POST', '/api/bookmarks', {
        statusCode: 201,
        body: { id: 1, consultantId: 1, userId: 1 }
      }).as('addBookmark');

      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="bookmark-btn"]').click();
      });

      cy.wait('@addBookmark');
      cy.get('[data-testid="bookmark-btn"]').first().should('have.class', 'bookmarked');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Consultant bookmarked');
    });

    it('should remove bookmark', () => {
      // Set initial bookmarked state
      cy.intercept('GET', '/api/bookmarks', {
        statusCode: 200,
        body: [{ id: 1, consultantId: 1, userId: 1 }]
      }).as('getBookmarksWithData');

      cy.intercept('DELETE', '/api/bookmarks/1', {
        statusCode: 204
      }).as('removeBookmark');

      cy.reload();
      cy.wait('@getBookmarksWithData');

      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="bookmark-btn"]').should('have.class', 'bookmarked');
        cy.get('[data-testid="bookmark-btn"]').click();
      });

      cy.wait('@removeBookmark');
      cy.get('[data-testid="bookmark-btn"]').first().should('not.have.class', 'bookmarked');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Bookmark removed');
    });

    it('should handle bookmark errors', () => {
      cy.intercept('POST', '/api/bookmarks', {
        statusCode: 500,
        body: { error: 'Failed to bookmark consultant' }
      }).as('bookmarkError');

      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="bookmark-btn"]').click();
      });

      cy.wait('@bookmarkError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to bookmark consultant');
    });
  });

  describe('Advanced Search and Filters', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should open advanced search modal', () => {
      cy.get('[data-testid="advanced-search-btn"]').click();
      cy.get('[data-testid="advanced-search-modal"]').should('be.visible');
    });

    it('should perform advanced search with multiple criteria', () => {
      cy.get('[data-testid="advanced-search-btn"]').click();

      cy.get('[data-testid="advanced-search-modal"]').within(() => {
        cy.get('[data-testid="search-name"]').type('John');
        cy.get('[data-testid="search-specialization"]').select('Epic');
        cy.get('[data-testid="search-min-rating"]').type('4');
        cy.get('[data-testid="search-min-experience"]').type('3');
        cy.get('[data-testid="search-availability-start"]').type('2024-02-01');
        cy.get('[data-testid="search-availability-end"]').type('2024-02-28');
        cy.get('[data-testid="apply-advanced-search"]').click();
      });

      cy.intercept('GET', '/api/directory/consultants*name=John*specialization=Epic*rating=4*', {
        statusCode: 200,
        body: {
          data: mockConsultants.filter(c => c.firstName === 'John'),
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }).as('advancedSearch');

      cy.wait('@advancedSearch');
      cy.get('[data-testid="consultant-card"]').should('have.length', 1);
    });

    it('should save search criteria as preset', () => {
      cy.intercept('POST', '/api/search-presets', {
        statusCode: 201,
        body: { id: 1, name: 'Epic Consultants', criteria: {} }
      }).as('saveSearchPreset');

      cy.get('[data-testid="advanced-search-btn"]').click();

      cy.get('[data-testid="advanced-search-modal"]').within(() => {
        cy.get('[data-testid="search-specialization"]').select('Epic');
        cy.get('[data-testid="save-preset-btn"]').click();
      });

      cy.get('[data-testid="preset-name"]').type('Epic Consultants');
      cy.get('[data-testid="confirm-save-preset"]').click();

      cy.wait('@saveSearchPreset');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Search preset saved');
    });

    it('should load saved search preset', () => {
      cy.intercept('GET', '/api/search-presets', {
        statusCode: 200,
        body: [
          { id: 1, name: 'Epic Consultants', criteria: { specialization: 'Epic' } }
        ]
      }).as('getSearchPresets');

      cy.get('[data-testid="search-presets-btn"]').click();
      cy.wait('@getSearchPresets');

      cy.get('[data-testid="preset-item"]').first().click();
      cy.get('[data-testid="filter-specialization"]').should('contain.text', 'Epic');
    });
  });

  describe('Export and Sharing', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should export consultant list to CSV', () => {
      cy.intercept('POST', '/api/export/consultants', {
        statusCode: 200,
        body: { downloadUrl: '/downloads/consultants.csv' }
      }).as('exportConsultants');

      cy.get('[data-testid="export-btn"]').click();
      cy.get('[data-testid="export-csv"]').click();

      cy.wait('@exportConsultants');
      cy.get('[data-testid="download-link"]').should('be.visible');
    });

    it('should export filtered results', () => {
      // Apply filter first
      cy.get('[data-testid="filter-specialization"]').click();
      cy.get('[data-testid="specialization-option-epic"]').click();

      cy.intercept('POST', '/api/export/consultants', {
        statusCode: 200,
        body: { downloadUrl: '/downloads/epic-consultants.csv' }
      }).as('exportFilteredConsultants');

      cy.get('[data-testid="export-btn"]').click();
      cy.get('[data-testid="export-csv"]').click();

      cy.wait('@exportFilteredConsultants');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Export completed');
    });

    it('should share directory link', () => {
      cy.get('[data-testid="share-btn"]').click();
      cy.get('[data-testid="share-modal"]').should('be.visible');

      cy.get('[data-testid="share-link"]').should('contain.value', window.location.origin + '/directory');
      cy.get('[data-testid="copy-link-btn"]').click();

      cy.get('[data-testid="success-message"]').should('contain.text', 'Link copied to clipboard');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/directory');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getDirectoryError');

      cy.wait('@getDirectoryError');

      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Unable to load consultants');
      cy.get('[data-testid="retry-btn"]').should('be.visible');
    });

    it('should retry failed requests', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getDirectoryError');

      cy.wait('@getDirectoryError');

      // Mock successful retry
      cy.intercept('GET', '/api/directory/consultants*', {
        statusCode: 200,
        body: {
          data: mockConsultants,
          pagination: { page: 1, limit: 20, total: 3, totalPages: 1 }
        }
      }).as('getDirectoryRetry');

      cy.get('[data-testid="retry-btn"]').click();
      cy.wait('@getDirectoryRetry');

      cy.get('[data-testid="consultant-card"]').should('have.length', 3);
    });

    it('should handle network timeout', () => {
      cy.intercept('GET', '/api/directory/consultants*', { forceNetworkError: true }).as('networkError');

      cy.wait('@networkError');

      cy.get('[data-testid="network-error"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Network connection error');
    });

    it('should show loading states', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        delay: 2000,
        statusCode: 200,
        body: {
          data: mockConsultants,
          pagination: { page: 1, limit: 20, total: 3, totalPages: 1 }
        }
      }).as('getDirectoryDelayed');

      cy.get('[data-testid="loading-skeleton"]').should('be.visible');
      cy.get('[data-testid="loading-text"]').should('contain.text', 'Loading consultants...');

      cy.wait('@getDirectoryDelayed');
      cy.get('[data-testid="loading-skeleton"]').should('not.exist');
    });

    it('should handle malformed API responses', () => {
      cy.intercept('GET', '/api/directory/consultants*', {
        statusCode: 200,
        body: { invalid: 'response' }
      }).as('getMalformedResponse');

      cy.wait('@getMalformedResponse');

      cy.get('[data-testid="data-error"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Invalid data received');
    });

    it('should handle empty search results gracefully', () => {
      cy.get('[data-testid="directory-search"]').type('NonexistentConsultant');
      
      cy.intercept('GET', '/api/consultants/search*', {
        statusCode: 200,
        body: []
      }).as('emptySearch');

      cy.get('[data-testid="search-btn"]').click();
      cy.wait('@emptySearch');

      cy.get('[data-testid="empty-search-results"]').should('be.visible');
      cy.get('[data-testid="empty-message"]').should('contain.text', 'No consultants found');
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should support keyboard navigation through consultant cards', () => {
      cy.get('[data-testid="consultant-card"]').first().focus();
      cy.focused().should('have.attr', 'data-testid', 'consultant-card');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'view-profile-btn');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'contact-btn');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'bookmark-btn');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="directory-search"]').should('have.attr', 'aria-label', 'Search consultants');
      cy.get('[data-testid="filter-specialization"]').should('have.attr', 'aria-label', 'Filter by specialization');
      cy.get('[data-testid="consultant-card"]').first().should('have.attr', 'role', 'article');
      cy.get('[data-testid="consultant-rating"]').first().should('have.attr', 'aria-label').and('include', 'Rating');
    });

    it('should support screen readers', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="sr-only-description"]').should('exist');
        cy.get('[data-testid="consultant-status"]').should('have.attr', 'aria-live', 'polite');
      });
    });

    it('should handle focus management in modals', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-btn"]').click();
      });
      cy.wait('@getConsultantProfile');

      // Focus should be on modal close button
      cy.focused().should('have.attr', 'data-testid', 'close-profile-modal');

      // Tab through modal elements
      cy.focused().tab();
      cy.focused().should('be.visible');
    });

    it('should trap focus in modals', () => {
      cy.get('[data-testid="consultant-card"]').first().within(() => {
        cy.get('[data-testid="contact-btn"]').click();
      });

      // Focus should stay within modal
      cy.get('[data-testid="contact-modal"]').within(() => {
        cy.get('[data-testid="contact-subject"]').focus();
        cy.focused().tab({ shift: true });
        cy.focused().should('be.within', '[data-testid="contact-modal"]');
      });
    });
  });

  describe('Performance and Optimization', () => {
    beforeEach(() => {
      cy.visit('/directory');
      cy.wait('@getDirectoryConsultants');
    });

    it('should implement virtual scrolling for large lists', () => {
      const largeMockData = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        firstName: `Consultant${i + 1}`,
        lastName: 'Test',
        email: `consultant${i + 1}@test.com`,
        specializations: ['Epic'],
        location: 'Test City',
        rating: 4.0,
        status: 'available'
      }));

      cy.intercept('GET', '/api/directory/consultants*', {
        statusCode: 200,
        body: {
          data: largeMockData.slice(0, 20),
          pagination: { page: 1, limit: 20, total: 1000, totalPages: 50 }
        }
      }).as('getLargeDataset');

      cy.reload();
      cy.wait('@getLargeDataset');

      cy.get('[data-testid="virtual-list"]').should('be.visible');
      cy.get('[data-testid="consultant-card"]').should('have.length', 20);
    });

    it('should lazy load images', () => {
      cy.get('[data-testid="consultant-photo"]').each(($img) => {
        cy.wrap($img).should('have.attr', 'loading', 'lazy');
      });
    });

    it('should debounce search input', () => {
      let searchCallCount = 0;
      cy.intercept('GET', '/api/consultants/search*', () => {
        searchCallCount++;
        return { statusCode: 200, body: [] };
      }).as('debouncedSearch');

      cy.get('[data-testid="directory-search"]').type('John Doe Smith');
      
      // Should only trigger search after typing stops
      cy.wait(1000);
      cy.then(() => {
        expect(searchCallCount).to.be.lessThan(3);
      });
    });

    it('should cache API responses', () => {
      // First load
      cy.reload();
      cy.wait('@getDirectoryConsultants');

      // Navigate away and back
      cy.visit('/dashboard');
      cy.visit('/directory');

      // Should use cached data (no API call)
      cy.get('[data-testid="consultant-card"]').should('have.length', 3);
    });
  });
});

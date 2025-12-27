describe('Travel Management', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin'
  };

  const mockBookings = [
    {
      id: 'b1',
      consultantId: 1,
      projectId: 'p1',
      bookingType: 'flight',
      status: 'confirmed',
      airline: 'United Airlines',
      flightNumber: 'UA1234',
      departureAirport: 'ORD',
      arrivalAirport: 'LAX',
      departureDate: '2024-02-15',
      returnDate: '2024-02-20',
      departureTime: '08:00',
      arrivalTime: '10:30',
      estimatedCost: '450.00',
      notes: 'Business trip',
      consultant: { id: 1, user: { firstName: 'John', lastName: 'Doe' } },
      project: { id: 'p1', name: 'Epic EHR Project' }
    },
    {
      id: 'b2',
      consultantId: 2,
      projectId: 'p1',
      bookingType: 'hotel',
      status: 'pending',
      hotelName: 'Marriott Downtown',
      hotelAddress: '123 Main St, Los Angeles, CA',
      checkInDate: '2024-02-15',
      checkOutDate: '2024-02-20',
      confirmationNumber: 'MAR123456',
      estimatedCost: '750.00',
      notes: 'Near hospital',
      consultant: { id: 2, user: { firstName: 'Jane', lastName: 'Smith' } },
      project: { id: 'p1', name: 'Epic EHR Project' }
    },
    {
      id: 'b3',
      consultantId: 1,
      projectId: 'p2',
      bookingType: 'car',
      status: 'completed',
      rentalCompany: 'Enterprise',
      vehicleType: 'SUV',
      pickupLocation: 'LAX Airport',
      dropoffLocation: 'LAX Airport',
      pickupDate: '2024-01-15',
      returnDate: '2024-01-20',
      confirmationNumber: 'ENT789012',
      estimatedCost: '350.00',
      notes: 'Full coverage insurance',
      consultant: { id: 1, user: { firstName: 'John', lastName: 'Doe' } },
      project: { id: 'p2', name: 'Cerner Training' }
    }
  ];

  const mockItineraries = [
    {
      id: 'i1',
      tripName: 'Epic Implementation Trip',
      consultantId: 1,
      projectId: 'p1',
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      status: 'active',
      notes: 'Full week on-site',
      consultant: { id: 1, user: { firstName: 'John', lastName: 'Doe' } },
      project: { id: 'p1', name: 'Epic EHR Project' },
      bookings: [mockBookings[0], mockBookings[1]]
    }
  ];

  const mockConsultants = [
    { id: 1, user: { firstName: 'John', lastName: 'Doe' } },
    { id: 2, user: { firstName: 'Jane', lastName: 'Smith' } }
  ];

  const mockProjects = [
    { id: 'p1', name: 'Epic EHR Project' },
    { id: 'p2', name: 'Cerner Training' }
  ];

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: testUser
    }).as('getUser');

    cy.intercept('GET', '/api/travel-bookings*', {
      statusCode: 200,
      body: mockBookings
    }).as('getBookings');

    cy.intercept('GET', '/api/travel-itineraries*', {
      statusCode: 200,
      body: mockItineraries
    }).as('getItineraries');

    cy.intercept('GET', '/api/consultants', {
      statusCode: 200,
      body: mockConsultants
    }).as('getConsultants');

    cy.intercept('GET', '/api/projects', {
      statusCode: 200,
      body: mockProjects
    }).as('getProjects');

    cy.visit('/travel-bookings');
    cy.wait('@getUser');
  });

  describe('Travel Page Layout', () => {
    it('should display travel page title', () => {
      cy.get('[data-testid="text-page-title"]').should('contain', 'Travel Bookings');
    });

    it('should display travel tabs', () => {
      cy.get('[data-testid="tabs-travel"]').should('exist');
      cy.get('[data-testid="tab-bookings"]').should('be.visible');
      cy.get('[data-testid="tab-itineraries"]').should('be.visible');
    });

    it('should display booking stats', () => {
      cy.get('[data-testid="stat-pending-bookings"]').should('exist');
      cy.get('[data-testid="stat-confirmed-bookings"]').should('exist');
      cy.get('[data-testid="stat-completed-bookings"]').should('exist');
      cy.get('[data-testid="stat-total-cost"]').should('exist');
    });
  });

  describe('Bookings Tab', () => {
    it('should display new booking button', () => {
      cy.get('[data-testid="button-new-booking"]').should('be.visible');
    });

    it('should display booking type filter', () => {
      cy.get('[data-testid="filter-booking-type-trigger"]').should('exist');
    });

    it('should display booking status filter', () => {
      cy.get('[data-testid="filter-booking-status-trigger"]').should('exist');
    });

    it('should open booking type filter dropdown', () => {
      cy.get('[data-testid="filter-booking-type-trigger"]').click();
      cy.get('[data-testid="filter-type-all"]').should('be.visible');
    });

    it('should open booking status filter dropdown', () => {
      cy.get('[data-testid="filter-booking-status-trigger"]').click();
      cy.get('[data-testid="filter-status-all"]').should('be.visible');
    });

    it('should display booking cards', () => {
      cy.wait('@getBookings');
      cy.get('[data-testid^="booking-card-"]').should('have.length.at.least', 1);
    });
  });

  describe('Create Booking Dialog', () => {
    beforeEach(() => {
      cy.get('[data-testid="button-new-booking"]').click();
    });

    it('should open create booking dialog', () => {
      cy.get('[data-testid="select-booking-type-trigger"]').should('be.visible');
    });

    it('should display booking type selector', () => {
      cy.get('[data-testid="select-booking-type-trigger"]').should('exist');
    });

    it('should display consultant selector', () => {
      cy.get('[data-testid="select-consultant-trigger"]').should('exist');
    });

    it('should display project selector', () => {
      cy.get('[data-testid="select-project-trigger"]').should('exist');
    });

    it('should display estimated cost input', () => {
      cy.get('[data-testid="input-estimated-cost"]').should('exist');
    });

    it('should display notes input', () => {
      cy.get('[data-testid="input-notes"]').should('exist');
    });

    it('should have cancel button', () => {
      cy.get('[data-testid="button-cancel-booking"]').should('exist');
    });

    it('should have create button', () => {
      cy.get('[data-testid="button-create-booking"]').should('exist');
    });

    it('should close dialog on cancel', () => {
      cy.get('[data-testid="button-cancel-booking"]').click();
      cy.get('[data-testid="select-booking-type-trigger"]').should('not.exist');
    });
  });

  describe('Flight Booking Form', () => {
    beforeEach(() => {
      cy.get('[data-testid="button-new-booking"]').click();
      // Select flight type
      cy.get('[data-testid="select-booking-type-trigger"]').click();
      cy.get('[data-testid="option-booking-type-flight"]').click();
    });

    it('should display airline input', () => {
      cy.get('[data-testid="input-airline"]').should('exist');
    });

    it('should display flight number input', () => {
      cy.get('[data-testid="input-flight-number"]').should('exist');
    });

    it('should display departure airport input', () => {
      cy.get('[data-testid="input-departure-airport"]').should('exist');
    });

    it('should display arrival airport input', () => {
      cy.get('[data-testid="input-arrival-airport"]').should('exist');
    });

    it('should display departure date input', () => {
      cy.get('[data-testid="input-departure-date"]').should('exist');
    });

    it('should display return date input', () => {
      cy.get('[data-testid="input-return-date"]').should('exist');
    });

    it('should display departure time input', () => {
      cy.get('[data-testid="input-departure-time"]').should('exist');
    });

    it('should display arrival time input', () => {
      cy.get('[data-testid="input-arrival-time"]').should('exist');
    });
  });

  describe('Hotel Booking Form', () => {
    beforeEach(() => {
      cy.get('[data-testid="button-new-booking"]').click();
      // Select hotel type
      cy.get('[data-testid="select-booking-type-trigger"]').click();
      cy.get('[data-testid="option-booking-type-hotel"]').click();
    });

    it('should display hotel name input', () => {
      cy.get('[data-testid="input-hotel-name"]').should('exist');
    });

    it('should display hotel address input', () => {
      cy.get('[data-testid="input-hotel-address"]').should('exist');
    });

    it('should display check-in date input', () => {
      cy.get('[data-testid="input-check-in-date"]').should('exist');
    });

    it('should display check-out date input', () => {
      cy.get('[data-testid="input-check-out-date"]').should('exist');
    });

    it('should display confirmation number input', () => {
      cy.get('[data-testid="input-hotel-confirmation"]').should('exist');
    });
  });

  describe('Car Rental Booking Form', () => {
    beforeEach(() => {
      cy.get('[data-testid="button-new-booking"]').click();
      // Select rental car type
      cy.get('[data-testid="select-booking-type-trigger"]').click();
      cy.get('[data-testid="option-booking-type-rental_car"]').click();
    });

    it('should display rental company input', () => {
      cy.get('[data-testid="input-rental-company"]').should('exist');
    });

    it('should display vehicle type input', () => {
      cy.get('[data-testid="input-vehicle-type"]').should('exist');
    });

    it('should display pickup location input', () => {
      cy.get('[data-testid="input-pickup-location"]').should('exist');
    });

    it('should display dropoff location input', () => {
      cy.get('[data-testid="input-dropoff-location"]').should('exist');
    });

    it('should display pickup date input', () => {
      cy.get('[data-testid="input-pickup-date"]').should('exist');
    });

    it('should display return date input', () => {
      cy.get('[data-testid="input-rental-return-date"]').should('exist');
    });

    it('should display confirmation number input', () => {
      cy.get('[data-testid="input-rental-confirmation"]').should('exist');
    });
  });

  describe('Itineraries Tab', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-itineraries"]').click();
      cy.wait('@getItineraries');
    });

    it('should switch to itineraries tab', () => {
      cy.get('[data-testid="button-new-itinerary"]').should('be.visible');
    });

    it('should display new itinerary button', () => {
      cy.get('[data-testid="button-new-itinerary"]').should('be.visible');
    });

    it('should display itinerary status filter', () => {
      cy.get('[data-testid="filter-itinerary-status-trigger"]').should('exist');
    });

    it('should display itinerary cards', () => {
      cy.get('[data-testid^="itinerary-card-"]').should('have.length.at.least', 1);
    });

    it('should open itinerary status filter dropdown', () => {
      cy.get('[data-testid="filter-itinerary-status-trigger"]').click();
      cy.get('[data-testid="filter-itinerary-status-all"]').should('be.visible');
    });
  });

  describe('Create Itinerary Dialog', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-itineraries"]').click();
      cy.wait('@getItineraries');
      cy.get('[data-testid="button-new-itinerary"]').click();
    });

    it('should open create itinerary dialog', () => {
      cy.get('[data-testid="input-trip-name"]').should('be.visible');
    });

    it('should display trip name input', () => {
      cy.get('[data-testid="input-trip-name"]').should('exist');
    });

    it('should display consultant selector', () => {
      cy.get('[data-testid="select-itinerary-consultant-trigger"]').should('exist');
    });

    it('should display project selector', () => {
      cy.get('[data-testid="select-itinerary-project-trigger"]').should('exist');
    });

    it('should display start date input', () => {
      cy.get('[data-testid="input-itinerary-start-date"]').should('exist');
    });

    it('should display end date input', () => {
      cy.get('[data-testid="input-itinerary-end-date"]').should('exist');
    });

    it('should display notes input', () => {
      cy.get('[data-testid="input-itinerary-notes"]').should('exist');
    });

    it('should have cancel button', () => {
      cy.get('[data-testid="button-cancel-itinerary"]').should('exist');
    });

    it('should have create button', () => {
      cy.get('[data-testid="button-create-itinerary"]').should('exist');
    });

    it('should close dialog on cancel', () => {
      cy.get('[data-testid="button-cancel-itinerary"]').click();
      cy.get('[data-testid="input-trip-name"]').should('not.exist');
    });

    it('should fill out and submit new itinerary', () => {
      cy.intercept('POST', '/api/travel-itineraries', {
        statusCode: 201,
        body: { id: 'i2', tripName: 'New Trip', status: 'draft' }
      }).as('createItinerary');

      cy.get('[data-testid="input-trip-name"]').type('Business Trip to LA');

      // Select consultant
      cy.get('[data-testid="select-itinerary-consultant-trigger"]').click();
      cy.get('[role="option"]').first().click();

      // Select project
      cy.get('[data-testid="select-itinerary-project-trigger"]').click();
      cy.get('[role="option"]').first().click();

      // Fill dates
      cy.get('[data-testid="input-itinerary-start-date"]').type('2024-03-01');
      cy.get('[data-testid="input-itinerary-end-date"]').type('2024-03-05');

      cy.get('[data-testid="input-itinerary-notes"]').type('Week long on-site implementation');

      cy.get('[data-testid="button-create-itinerary"]').click();
    });
  });

  describe('Booking Detail View', () => {
    beforeEach(() => {
      cy.wait('@getBookings');
    });

    it('should open booking detail on card click', () => {
      cy.get('[data-testid^="booking-card-"]').first().click();
      cy.get('[data-testid="select-update-status-trigger"]').should('be.visible');
    });

    it('should display status update selector', () => {
      cy.get('[data-testid^="booking-card-"]').first().click();
      cy.get('[data-testid="select-update-status-trigger"]').should('exist');
    });

    it('should have close button', () => {
      cy.get('[data-testid^="booking-card-"]').first().click();
      cy.get('[data-testid="button-close-booking-detail"]').should('exist');
    });

    it('should close detail view', () => {
      cy.get('[data-testid^="booking-card-"]').first().click();
      cy.get('[data-testid="button-close-booking-detail"]').click();
      cy.get('[data-testid="select-update-status-trigger"]').should('not.exist');
    });
  });

  // ===========================================================================
  // TODO: Advanced Travel Features (Require Additional Implementation)
  // ===========================================================================

  describe('Travel Calendar', () => {
    it.skip('TODO: Display travel calendar view', () => {});
    it.skip('TODO: Navigate between months', () => {});
    it.skip('TODO: View trip details on calendar', () => {});
  });

  describe('Travel Expenses Integration', () => {
    it.skip('TODO: Link expenses to travel', () => {});
    it.skip('TODO: Track travel expenses', () => {});
  });
});

// ***********************************************
// NICEHR Platform - Travel Management Tests
// ***********************************************

describe('Travel Management', () => {
  beforeEach(() => {
    cy.loginViaApi();
    cy.navigateTo('travel');
    cy.waitForPageLoad();
  });

  describe('Travel Dashboard', () => {
    it('should display travel dashboard', () => {
      cy.get('[data-testid="travel-dashboard"]').should('be.visible');
    });

    it('should show upcoming trips', () => {
      cy.get('[data-testid="upcoming-trips"]').should('be.visible');
    });

    it('should show travel calendar', () => {
      cy.get('[data-testid="travel-calendar"]').should('be.visible');
    });

    it('should show travel spend summary', () => {
      cy.get('[data-testid="travel-spend-summary"]').should('be.visible');
    });
  });

  describe('Travel Bookings', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-bookings"]').click();
      cy.waitForPageLoad();
    });

    describe('Booking List', () => {
      it('should display bookings list', () => {
        cy.get('[data-testid="bookings-list"]').should('be.visible');
      });

      it('should filter by status', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Confirmed');
      });

      it('should filter by consultant', () => {
        cy.selectOption('[data-testid="filter-consultant"]', 'consultant');
      });

      it('should filter by date range', () => {
        cy.get('[data-testid="input-start-date"]').type('2024-01-01');
        cy.get('[data-testid="input-end-date"]').type('2024-03-31');
        cy.get('[data-testid="button-apply-filter"]').click();
      });

      it('should search bookings', () => {
        cy.get('[data-testid="input-search"]').type('flight');
      });
    });

    describe('Create Booking', () => {
      it('should open create booking modal', () => {
        cy.openModal('button-create-booking');
        cy.get('[role="dialog"]').should('contain', 'Booking');
      });

      it('should create flight booking', () => {
        cy.openModal('button-create-booking');
        cy.selectOption('[data-testid="select-booking-type"]', 'Flight');
        cy.selectOption('[data-testid="select-consultant"]', 'consultant');
        cy.selectOption('[data-testid="select-project"]', 'project');
        cy.get('[data-testid="input-departure-city"]').type('Boston');
        cy.get('[data-testid="input-arrival-city"]').type('Chicago');
        cy.get('[data-testid="input-departure-date"]').type('2024-02-15');
        cy.get('[data-testid="input-departure-time"]').type('08:00');
        cy.get('[data-testid="input-return-date"]').type('2024-02-18');
        cy.get('[data-testid="input-return-time"]').type('17:00');
        cy.get('[data-testid="input-airline"]').type('Delta');
        cy.get('[data-testid="input-confirmation"]').type('ABC123');
        cy.get('[data-testid="input-cost"]').type('450');
        
        cy.get('[data-testid="button-submit-booking"]').click();
        
        cy.get('[role="dialog"]').should('not.exist');
      });

      it('should create hotel booking', () => {
        cy.openModal('button-create-booking');
        cy.selectOption('[data-testid="select-booking-type"]', 'Hotel');
        cy.selectOption('[data-testid="select-consultant"]', 'consultant');
        cy.get('[data-testid="input-hotel-name"]').type('Marriott Downtown');
        cy.get('[data-testid="input-hotel-address"]').type('123 Main St, Chicago, IL');
        cy.get('[data-testid="input-check-in"]').type('2024-02-15');
        cy.get('[data-testid="input-check-out"]').type('2024-02-18');
        cy.get('[data-testid="input-confirmation"]').type('HOTEL456');
        cy.get('[data-testid="input-nightly-rate"]').type('189');
        
        cy.get('[data-testid="button-submit-booking"]').click();
      });

      it('should create rental car booking', () => {
        cy.openModal('button-create-booking');
        cy.selectOption('[data-testid="select-booking-type"]', 'Rental Car');
        cy.selectOption('[data-testid="select-consultant"]', 'consultant');
        cy.get('[data-testid="input-rental-company"]').type('Enterprise');
        cy.get('[data-testid="input-pickup-location"]').type('ORD Airport');
        cy.get('[data-testid="input-pickup-date"]').type('2024-02-15');
        cy.get('[data-testid="input-return-date"]').type('2024-02-18');
        cy.get('[data-testid="input-car-type"]').type('Midsize');
        cy.get('[data-testid="input-confirmation"]').type('CAR789');
        
        cy.get('[data-testid="button-submit-booking"]').click();
      });
    });

    describe('Booking Details', () => {
      beforeEach(() => {
        cy.get('[data-testid="booking-item"]').first().click();
        cy.waitForPageLoad();
      });

      it('should display booking details', () => {
        cy.get('[data-testid="booking-details"]').should('be.visible');
      });

      it('should show itinerary', () => {
        cy.get('[data-testid="booking-itinerary"]').should('be.visible');
      });

      it('should edit booking', () => {
        cy.get('[data-testid="button-edit-booking"]').click();
        cy.get('[data-testid="input-confirmation"]').clear().type('UPDATED123');
        cy.get('[data-testid="button-submit-booking"]').click();
      });

      it('should cancel booking', () => {
        cy.get('[data-testid="button-cancel-booking"]').click();
        cy.get('[data-testid="input-cancellation-reason"]').type('Project postponed');
        cy.get('[data-testid="button-confirm-cancel"]').click();
      });
    });
  });

  describe('Consultant Travel Preferences', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-preferences"]').click();
      cy.waitForPageLoad();
    });

    it('should display travel preferences form', () => {
      cy.get('[data-testid="travel-preferences-form"]').should('be.visible');
    });

    it('should set airline preferences', () => {
      cy.selectOption('[data-testid="select-preferred-airline"]', 'Delta');
      cy.get('[data-testid="input-frequent-flyer"]').type('SK12345678');
      cy.selectOption('[data-testid="select-seat-preference"]', 'Aisle');
      cy.get('[data-testid="button-save-preferences"]').click();
    });

    it('should set hotel preferences', () => {
      cy.selectOption('[data-testid="select-preferred-hotel"]', 'Marriott');
      cy.get('[data-testid="input-loyalty-number"]').type('1234567890');
      cy.selectOption('[data-testid="select-room-preference"]', 'Non-Smoking');
      cy.get('[data-testid="button-save-preferences"]').click();
    });

    it('should set dietary restrictions', () => {
      cy.get('[data-testid="input-dietary-restrictions"]').type('Vegetarian');
      cy.get('[data-testid="button-save-preferences"]').click();
    });

    it('should set emergency contact', () => {
      cy.get('[data-testid="input-emergency-name"]').type('John Smith');
      cy.get('[data-testid="input-emergency-phone"]').type('555-123-4567');
      cy.get('[data-testid="input-emergency-relationship"]').type('Spouse');
      cy.get('[data-testid="button-save-preferences"]').click();
    });
  });

  describe('Transportation Coordination', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-transportation"]').click();
      cy.waitForPageLoad();
    });

    describe('Ground Transportation', () => {
      it('should display transportation requests', () => {
        cy.get('[data-testid="transportation-list"]').should('be.visible');
      });

      it('should create transportation request', () => {
        cy.openModal('button-create-transport');
        cy.selectOption('[data-testid="select-transport-type"]', 'Airport Shuttle');
        cy.selectOption('[data-testid="select-consultant"]', 'consultant');
        cy.get('[data-testid="input-pickup-location"]').type('ORD Terminal 2');
        cy.get('[data-testid="input-dropoff-location"]').type('Marriott Downtown');
        cy.get('[data-testid="input-pickup-datetime"]').type('2024-02-15T10:00');
        cy.get('[data-testid="input-passengers"]').type('1');
        
        cy.get('[data-testid="button-submit-transport"]').click();
      });

      it('should schedule recurring transportation', () => {
        cy.openModal('button-create-transport');
        cy.selectOption('[data-testid="select-transport-type"]', 'Daily Shuttle');
        cy.get('[data-testid="checkbox-recurring"]').click();
        cy.get('[data-testid="input-start-date"]').type('2024-02-15');
        cy.get('[data-testid="input-end-date"]').type('2024-02-18');
        cy.get('[data-testid="input-pickup-time"]').type('07:30');
        
        cy.get('[data-testid="button-submit-transport"]').click();
      });
    });
  });

  describe('Travel Itineraries', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-itineraries"]').click();
      cy.waitForPageLoad();
    });

    it('should display itineraries list', () => {
      cy.get('[data-testid="itineraries-list"]').should('be.visible');
    });

    it('should create combined itinerary', () => {
      cy.openModal('button-create-itinerary');
      cy.get('[data-testid="input-itinerary-name"]').type('Chicago Project Trip');
      cy.selectOption('[data-testid="select-consultant"]', 'consultant');
      cy.get('[data-testid="input-trip-start"]').type('2024-02-15');
      cy.get('[data-testid="input-trip-end"]').type('2024-02-18');
      
      // Link existing bookings
      cy.get('[data-testid="button-link-booking"]').click();
      cy.get('[data-testid="booking-checkbox"]').first().click();
      cy.get('[data-testid="button-confirm-link"]').click();
      
      cy.get('[data-testid="button-submit-itinerary"]').click();
    });

    it('should view itinerary details', () => {
      cy.get('[data-testid="itinerary-item"]').first().click();
      cy.get('[data-testid="itinerary-timeline"]').should('be.visible');
    });

    it('should export itinerary to PDF', () => {
      cy.get('[data-testid="itinerary-item"]').first().click();
      cy.get('[data-testid="button-export-pdf"]').click();
    });

    it('should share itinerary via email', () => {
      cy.get('[data-testid="itinerary-item"]').first().click();
      cy.get('[data-testid="button-share-itinerary"]').click();
      cy.get('[data-testid="input-email"]').type('manager@company.com');
      cy.get('[data-testid="button-send"]').click();
    });
  });

  describe('Travel Approval Workflow', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-approvals"]').click();
      cy.waitForPageLoad();
    });

    it('should display pending approvals', () => {
      cy.get('[data-testid="pending-approvals-list"]').should('be.visible');
    });

    it('should approve travel request', () => {
      cy.get('[data-testid="approval-item"]').first()
        .find('[data-testid="button-approve"]').click();
      cy.get('[data-testid="button-confirm"]').click();
    });

    it('should reject travel request', () => {
      cy.get('[data-testid="approval-item"]').first()
        .find('[data-testid="button-reject"]').click();
      cy.get('[data-testid="input-rejection-reason"]').type('Over budget');
      cy.get('[data-testid="button-confirm-reject"]').click();
    });

    it('should request additional information', () => {
      cy.get('[data-testid="approval-item"]').first()
        .find('[data-testid="button-request-info"]').click();
      cy.get('[data-testid="input-info-request"]').type('Please provide business justification');
      cy.get('[data-testid="button-send-request"]').click();
    });
  });

  describe('Travel Reports', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-reports"]').click();
      cy.waitForPageLoad();
    });

    it('should display travel spend by consultant', () => {
      cy.get('[data-testid="spend-by-consultant-chart"]').should('be.visible');
    });

    it('should display travel spend by project', () => {
      cy.get('[data-testid="spend-by-project-chart"]').should('be.visible');
    });

    it('should display travel spend by category', () => {
      cy.get('[data-testid="spend-by-category-chart"]').should('be.visible');
    });

    it('should filter reports by date range', () => {
      cy.get('[data-testid="input-report-start"]').type('2024-01-01');
      cy.get('[data-testid="input-report-end"]').type('2024-03-31');
      cy.get('[data-testid="button-apply-filter"]').click();
    });

    it('should export travel report', () => {
      cy.get('[data-testid="button-export-report"]').click();
      cy.selectOption('[data-testid="select-format"]', 'Excel');
      cy.get('[data-testid="button-download"]').click();
    });
  });
});

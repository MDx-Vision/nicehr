#!/bin/bash

# Script to run Cypress tests for NiceHR
# This script ensures proper environment setup for testing

echo "======================================"
echo "NiceHR Cypress Test Runner"
echo "======================================"
echo ""

# Set test environment variables
export CYPRESS_TEST=true
export NODE_ENV=test

echo "✓ Environment variables set"
echo "  CYPRESS_TEST=true"
echo "  NODE_ENV=test"
echo ""

# Check if server is running
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "✓ Server is running on port 5000"
else
    echo "✗ ERROR: Server is not running on port 5000"
    echo "  Please start the server first with: npm run dev"
    exit 1
fi

echo ""
echo "======================================"
echo "Running Cypress Tests"
echo "======================================"
echo ""

# Run Cypress tests for the specified features
npx cypress run \
  --spec "cypress/e2e/03-users.cy.js,cypress/e2e/03-dashboard.cy.js,cypress/e2e/04-units.cy.js,cypress/e2e/05-modules.cy.js,cypress/e2e/05-directory.cy.js" \
  --headless \
  --config video=false

echo ""
echo "======================================"
echo "Test Run Complete"
echo "======================================"

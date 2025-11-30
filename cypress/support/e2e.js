// Ignore WebSocket errors from Vite HMR
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore WebSocket construction errors from Vite
  if (err.message.includes('Failed to construct') && err.message.includes('WebSocket')) {
    return false;
  }
  // Let other errors fail the test
  return true;
});

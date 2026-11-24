// Test setup file for Vitest
// Configures global test utilities and cleanup logic for React Testing Library

import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

// what it does ? - Cleans up the DOM after each test to prevent test pollution and ensure isolation between tests
afterEach(() => {
  // Cleanup logic after each test if needed
  cleanup();
});

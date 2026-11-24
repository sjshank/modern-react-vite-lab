import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

// Vitest configuration for the project
// Merges the base Vite configuration with Vitest-specific settings for testing. Why mergeConfig? - It allows us to extend the existing Vite configuration with additional Vitest-specific options without duplicating the base configuration.
export default mergeConfig(
  viteConfig,
  defineConfig({
    // Vitest-specific configuration options can be added here if needed
    test: {
      environment: 'jsdom', // Use jsdom to simulate a browser-like environment for testing React components
      globals: false, // Disable global variables like `describe` and `it` for tests. This encourages explicit imports of testing utilities and avoids potential conflicts with other global variables.
      include: ['src/**/*.test.{ts,tsx}'], // Include test files matching the specified patterns
      setupFiles: ['src/test/setup.ts'], // Specify the setup file to configure global test utilities and cleanup logic
      // Coverage configuration for test reporting and analysis. Specifies the provider, reporters, and which files to include or exclude from coverage.
      coverage: {
        provider: 'v8', // Use the V8 JavaScript engine for coverage collection, which is fast and accurate
        reporter: ['text', 'html'], // Print a summary and generate a browsable HTML report
        include: ['src/**/*.{ts,tsx}'], // Include all TypeScript and TSX files in the src directory for coverage analysis
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
        clean: true, // Clean coverage data before collecting new coverage
        cleanOnRerun: true, // Clean coverage data when rerunning tests
        thresholds: {
          // Thresholds for all files
          // functions: 50,
          // branches: 70,
          // perFile: true,
        },
        reportsDirectory: 'test-results/coverage', // Specify the directory for coverage reports
      },
    },
  }),
);

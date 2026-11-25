import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import babel from '@rolldown/plugin-babel';
import { promisify } from 'node:util';
import { brotliCompress, gzip } from 'node:zlib';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
// Import Tailwind CSS plugin for Vite to enable Tailwind CSS processing during the build.
import tailwindcss from '@tailwindcss/vite';

const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff', // Prevent MIME type sniffing to enhance security
  'Referrer-Policy': 'strict-origin-when-cross-origin', // Control the amount of referrer information sent with requests
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()', // Restrict access to sensitive browser features
  'X-Frame-Options': 'DENY', // Prevent the site from being framed to mitigate clickjacking attacks
};

// Content Security Policy (CSP) in report-only mode to enforce security policies without blocking content.
const reportOnlyCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com;", // Allow styles from self and Google Fonts else it will display warning in report-only mode browser console
  "img-src 'self' data: https://picsum.photos https://fastly.picsum.photos",
  "font-src 'self' data: https://fonts.gstatic.com;",
  "connect-src 'self' https://dummyjson.com https://*.ingest.us.sentry.io",
  "worker-src 'self' blob:",
  // Allow style elements from self and Google Fonts. It will override the default style-src directive for style elements specifically.
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
].join('; ');

// Precompression plugin for Vite to generate gzip and Brotli compressed versions of build output files.
const precompress: Plugin = {
  name: 'precompress', // Name of the plugin for identification in Vite's plugin system
  apply: 'build', // Apply this plugin only during the build phase
  enforce: 'post', // Order after normal user plugins; writeBundle supplies the final-file timing.
  async writeBundle(options, bundle) {
    if (!options.dir)
      this.error('Precompression requires a build output directory.');
    const directory = options.dir;
    await Promise.all(
      Object.values(bundle).map(async (file) => {
        if (!/\.(?:html|css|js|mjs|svg)$/.test(file.fileName)) return;
        // Vite finalizes lazy-import references after generateBundle hooks.
        const path = resolve(directory, file.fileName);
        const source = await readFile(path);
        if (source.byteLength <= 1024) return;

        const [gz, br] = await Promise.all([
          gzipAsync(source),
          brotliAsync(source),
        ]);
        for (const [extension, compressed] of [
          ['gz', gz],
          ['br', br],
        ] as const) {
          if (compressed.byteLength < source.byteLength) {
            await writeFile(`${path}.${extension}`, compressed);
          }
        }
      }),
    );
  },
};

// Include React components in the src/components directory for Babel processing with the React compiler preset
const reactCompilerIncludes = [
  /[\\/]src[\\/]components[\\/].*\.[jt]sx?(?:$|\?)/,
];

// Vite configuration for the project
// For client-side code splitting, use dynamic imports in app code. In React,
// load a component with lazy(() => import('./SomeComponent')) and render it
// inside <Suspense>; Vite creates a separate chunk automatically during build.
export default defineConfig({
  // Development server configuration for Vite, including host, port, strict port enforcement, allowed hosts, and security headers.
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    allowedHosts: ['localhost', '127.0.0.1'],
    headers: securityHeaders, // Apply security headers to the development server responses to enhance security by enforcing content type options, frame options, and referrer policy.
  },
  build: {
    manifest: true, // Generate a manifest.json file mapping source files to their output files for easier integration with server-side frameworks and other tools.
    minify: 'esbuild', // Use esbuild for minification to improve build performance and reduce output size
    cssCodeSplit: true, // Enable CSS code splitting to generate separate CSS files for each chunk. It will detect unused CSS and split it accordingly to load only the necessary styles for each chunk.
    cssMinify: 'esbuild', // Enable CSS minification to reduce the size of the generated CSS files
  },

  optimizeDeps: {
    rolldownOptions: {
      treeshake: true, // does it affects development dependency optimization ? - It primarily affects the build process by removing unused code, but it may also influence how dependencies are optimized during development.
    },
  },
  resolve: {
    alias: {
      '@components': resolve(import.meta.dirname, 'src/components'), // Create an alias for the components directory to simplify imports
      '@hooks': resolve(import.meta.dirname, 'src/hooks'), // Create an alias for the hooks directory to simplify imports
      '@contexts': resolve(import.meta.dirname, 'src/contexts'), // Create an alias for the contexts directory to simplify imports
      '@features': resolve(import.meta.dirname, 'src/features'), // Create an alias for the features directory to simplify imports
    },
  },
  preview: {
    host: '127.0.0.1',
    allowedHosts: ['localhost', '127.0.0.1'],
    // Preview-only headers; the production host/CDN must set its own.
    headers: {
      ...securityHeaders,
      'Cache-Control': 'no-cache', // Ensure that the response is not cached by the browser or intermediate caches
      Vary: 'Origin, Accept-Encoding', // Indicate which headers can affect the response caching
      'Content-Security-Policy-Report-Only': reportOnlyCsp, // Apply CSP in report-only mode to enforce security policies without blocking content
    },
    strictPort: true, // Ensure the preview server uses the specified port strictly, failing if the port is already in use.
    port: 4000, // Specify the port for the preview server.
    open: true, // Automatically open the preview server in the default browser when it starts
  },
  // Both transform plugins use enforce: "pre"; preserve their relative array order.
  // See README: Plugins and configuration for lifecycle and Vite 8 bundler notes.
  plugins: [
    react(),
    babel({
      include: reactCompilerIncludes, // Only include React components in the src/components directory for Babel processing
      presets: [
        reactCompilerPreset({
          // Any specific options for the React compiler preset can be added here
          compilationMode: 'annotation', // Use annotation mode for React compiler preset to enable selective compilation based on annotations in the code. It overrides the default compilation behavior and only compiles components with specific annotations.
        }),
      ],
    }), // Babel plugin configured with the React compiler preset to handle React code transformations for the project
    precompress,
    tailwindcss(), // Tailwind CSS plugin for Vite to enable Tailwind CSS processing during the build
  ],
});

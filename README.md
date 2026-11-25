# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Commit messages

The Husky `commit-msg` hook uses Commitlint. Use `type: (PROJECT-123) subject`,
for example `feat: (APP-42) add login`. The project key must start with an
uppercase letter and contain only uppercase letters or digits; the ticket
number must contain digits. Allowed types are `feat`, `fix`, `maintenance`,
`test`, and `revert`. Commitlint's default ignores, such as merge commits, still
apply.

Run `node --test scripts/commitlint.test.mjs` to check the configuration.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Production builds and validation

### Continuous integration

`.github/workflows/ci_workflow.yml` runs on pushes, pull requests, and manual triggers:
`npm ci` -> formatting -> lint -> type-check -> Vitest -> production build.
It then checks production output and runs a required Chromium smoke test against the newly built app.

The workflow uses Node.js 24 and the npm lockfile. `npm run build` optimizes assets before invoking Vite; type-checking is a separate step. CI supplies a public sample environment value because local `.env` files are ignored. `npm test` runs Vitest once; the existing security workflow remains separate.

To try it, push a branch and open a pull request, then select **Actions** on GitHub and open **CI Workflow Demo** to inspect each step's logs. Alternatively, select **Run workflow** in the Actions tab. Steps stop at the first failure unless explicitly configured otherwise. To block merging when CI fails, configure a branch protection rule or ruleset for the target branch and require the `ci` job's status check; the workflow alone does not enforce this.

The current combined production-output step uses `continue-on-error: true`: budget failures remain visible but do not block CI; its chained secret and delivery checks are skipped if the budget fails. The separate browser smoke test remains required. All other gates fail normally without bypassing existing app lint/type errors. Local bundle-report and validation commands still enforce budgets.

### Production browser smoke test

```sh
npm exec playwright -- install chromium
npm run build
npm run test:smoke
```

Playwright starts an isolated Vite **preview** on `127.0.0.1:4173`, serves the existing `dist/` (never the development server), and stops preview afterward. It refuses to reuse an occupied port. Rebuild before testing; smoke tests do not rebuild stale output.

The Chromium test checks only the initial page load: an HTTP 200 response, the visible initial heading, and no uncaught browser exceptions or console errors. It does not click buttons, load deferred demos, or test environment flags. This supplements HTTP delivery tests; it is not a full end-to-end suite or a deployment/subpath routing test.

Only `.github/workflows/ci_workflow.yml` installs Chromium and runs smoke tests after building; the security demo workflow is unchanged. Failures upload HTML reports, screenshots, and traces for seven days. Locally, use `npm exec playwright -- show-report` to inspect failures. Playwright output is ignored by Git.

### Commands

| Command                      | Purpose                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                | Start the development server with hot module replacement.                                                                     |
| `npm run type-check`         | Check application and Vite configuration types using TypeScript project references. Does not emit JavaScript.                 |
| `npm run lint`               | Check the source against the configured ESLint rules.                                                                         |
| `npm run build`              | Optimize assets, then bundle the application for production into `dist/`.                                                     |
| `npm run build:analyze`      | Build, report initial/deferred JavaScript sizes, and enforce bundle budgets.                                                  |
| `npm run bundle:report`      | Analyze the existing build without rebuilding.                                                                                |
| `npm run test:bundle`        | Test dependency accounting and size-budget failure cases.                                                                     |
| `npm run test:delivery`      | Check the existing build's compressed files and preview caching/compression behavior.                                         |
| `npm run assets:optimize`    | Recursively optimize supported assets in `src/assets/` and `public/`, including future files.                                 |
| `npm run test:assets`        | Build and check root/subpath assets in Chromium, plus content-hash invalidation. Requires Playwright Chromium.                |
| `npm run test:smoke`         | Smoke-test the existing production build in Chromium using an isolated preview server.                                        |
| `npm run test:security`      | Check local-only Vite settings and the client-secret scanner.                                                                 |
| `npm run security:check`     | Scan the production build for sensitive env values and common credential patterns.                                            |
| `npm run audit:dependencies` | Run the lockfile-backed npm vulnerability audit.                                                                              |
| `npm run security:ci`        | Run the focused security pipeline used by GitHub Actions.                                                                     |
| `npm run validate`           | Run lint, dependency audit, bundle/security tests, build, secret scan, size budgets, and delivery tests, stopping on failure. |
| `npm run preview`            | Serve the existing `dist/` output locally for inspection. Does not rebuild it.                                                |

Vite transforms TypeScript but does not type-check it. The separate TypeScript step uses `tsc -b` because the root `tsconfig.json` references both `tsconfig.app.json` and `tsconfig.node.json`. Running only `tsc --noEmit` at that root does not check the referenced projects.

### Try the production build

```sh
npm run validate
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Open `http://127.0.0.1:4173`. Check that:

- The page, images, and styles load without browser console or network errors.
- The original counter still increments.
- Click **Load compiler mutation demo**; its list still exhibits the intentional stale-output behavior, while immutable updates and reset work.

The output contains `dist/index.html` and bundled JavaScript, CSS, and imported assets under `dist/assets/`. Public files are copied into `dist/` without content hashing. By default, the build starts from the root `index.html`; the standalone HTML example is not an additional production entry.

`vite build` uses production mode by default. To choose another mode, use `npm run build -- --mode staging`; this selects mode-specific environment files, not a separate deployment. See [Vite build modes](https://vite.dev/guide/env-and-mode.html#modes).

**Preview is for local verification, not production hosting.** Deploy the generated `dist/` output to a suitable static host. These checks verify the build pipeline and basic interactions, not that every runtime behavior is correct; automated tests and deployment configuration are separate production-readiness steps.

## Asset handling

### Imported assets versus public files

Application-owned images are imported in `src/App.tsx`: Vite tracks their dependencies, rewrites deployment URLs, and gives emitted files content-hashed names such as `assets/hero-<hash>.png`. CSS `url()` references are also processed. Small imported assets may instead become data URLs under Vite's default inline threshold; they have no separate filename.

`public/favicon.svg` and `public/icons.svg` need stable names and are copied unchanged to the output root. Refer to them without `/public/` in the URL. They are not content-hashed or optimized by Vite. Neither public files nor imported assets are a place for secrets.

### Optimization

Run `npm run assets:optimize` after adding or editing assets. It recursively discovers files in `src/assets/` and `public/`, including nested directories and uppercase extensions. It is manual, not a build hook; rebuild after running it.

- **SVG:** SVGO conservatively removes metadata/comments and compacts markup without changing path geometry, colors, viewBoxes, or IDs. Keeping sprite IDs matters for external `icons.svg#...` references.
- **PNG/WebP:** Sharp recompresses static 8-bit images in the same format, preserving metadata. PNG uses lossless compression; WebP uses lossless encoding. A smaller result is checked against the original decoded pixels before replacement.
- **Safety:** Every file is written only if smaller. Names, formats, dimensions, and imports remain unchanged. No automatic resizing, lossy conversion, or font subsetting occurs. Animated, higher-bit-depth, mismatched-format, and unsupported files (including JPEG/AVIF/GIF/fonts) are explicitly reported as skipped. Symlinks are not followed. Invalid supported files fail the command.

Review in-place changes before committing. These are development tools, not runtime dependencies or build plugins.

The original hero is already an indexed, transparent PNG (343 x 361 pixels, displayed at 170 x 179 for approximately 2x density). Measured candidates before optimization:

| Encoding         |  Bytes |
| ---------------- | -----: |
| Existing PNG     | 13,057 |
| Recompressed PNG | 14,408 |
| Lossless WebP    | 13,080 |
| WebP quality 90  | 17,504 |
| Lossless AVIF    | 51,169 |

Conservative SVG compaction reduced `react.svg` from 4,126 to 4,121 bytes and `icons.svg` from 5,031 to 4,944 bytes (92 bytes saved overall). The Vite logo and favicon were already compact and remain unchanged.

Keep the original PNG: a newer format is not automatically smaller. Keep its explicit layout dimensions and eager loading because it is above the fold. Use lazy loading for future below-the-fold images, and responsive `srcset`/`sizes` for genuinely large images. Existing logos are reused by URL instead of duplicated in markup.

The stylesheet uses system fonts, so there are no webfont downloads to optimize. If custom fonts are needed later, use licensed/subsetted WOFF2, `font-display: swap`, and preload only critical fonts. Gzip/Brotli sidecars compress text transfers; they do not resize images or subset fonts.

### Asset URLs and deployment paths

Keep Vite's default `/` base for normal deployment. For a subpath:

```sh
npm run build -- --base=/learn-vite/
npm run preview -- --base=/learn-vite/
```

Open `http://127.0.0.1:4000/learn-vite/`. Imported URLs are rewritten automatically. The favicon uses `%BASE_URL%favicon.svg` in HTML; React sprite links use `` `${import.meta.env.BASE_URL}icons.svg#symbol-id` `` rather than root-absolute `/icons.svg` URLs. `BASE_URL` is replaced at build time: rebuild for a different deployment path. Arbitrary URL strings in JavaScript are not automatically rewritten.

`base` controls asset paths, not SPA fallback, client-side routing, or CDN/HTTPS configuration. Deploy HTML and its matching assets together and retain older hashed assets while cached clients may still reference them.

Configure production caching at the host/CDN: content-hashed assets can use `Cache-Control: public, max-age=31536000, immutable`; HTML and stable public filenames should revalidate (for example `no-cache`) or use explicit versioning. Existing preview intentionally uses revalidation, not production immutable caching.

### Asset validation

```sh
npm exec playwright -- install chromium
npm run test:assets
```

The separate asset suite builds into temporary directories, tests `/` and `/learn-vite/` in Chromium, checks image decoding and sprite rendering, verifies public-file bytes and deployment-aware URLs, and confirms that changed image content changes its emitted filename. It cleans up its own builds and servers without replacing `dist/`. The existing initial-load smoke test and security workflow remain unchanged.

## Vitest configuration

`vitest.config.ts` merges the existing Vite configuration so tests use the same React and compiler plugins. It runs tests in `jsdom` and discovers only `src/**/*.test.ts` and `src/**/*.test.tsx`; the existing Node-based tests under `scripts/` remain separate.

`src/test/setup.ts` registers jest-dom matchers and cleans up React Testing Library renders after each test. Vitest globals are disabled; import test functions explicitly from `vitest`. Run `npx vitest run src/test/setup.test.tsx` to verify the setup.

## Environment variables and secrets

The **Environment variables and secrets** section on the page displays the public configuration and Vite's built-in mode flags. All checked-in values are samples, not credentials. The displayed API URLs are examples; no backend is provided or called.

| File                | Loaded when                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `.env`              | Every mode; provides public defaults and a harmless unprefixed marker.                    |
| `.env.development`  | `npm run dev`; overrides defaults with development values.                                |
| `.env.production`   | `npm run build`; overrides defaults with production values.                               |
| `.env.local`        | Every mode; optional machine-local overrides, ignored by the existing `*.local` Git rule. |
| `.env.[mode].local` | The matching mode; optional local overrides, also ignored.                                |

Mode-specific files take precedence over generic files. Variables already set in the shell or CI environment have the highest priority. Restart the dev server after changing env files.

### Compare development and production

1. Run `npm run dev` and click **Load environment variables demo**. The demo shows the development title, `http://localhost:3000/api`, `MODE=development`, `DEV=true`, and `PROD=false`.
2. Stop the dev server, run `npm run validate`, then `npm run preview`. The demo shows the production title, `https://api.example.com`, `MODE=production`, `DEV=false`, and `PROD=true`.
3. In both cases, `SERVER_ONLY_DEMO` is `undefined` in the browser because its name does not start with `VITE_`. Its value is just a harmless marker used to demonstrate non-exposure.

To try a local override, create `.env.development.local`:

```dotenv
VITE_APP_TITLE=My Local Vite Demo
```

Restart `npm run dev` to see the new title. Remove that local file when finished. Do not put credentials in the title or any other `VITE_*` value.

### Important boundaries

- Access client configuration using static properties such as `import.meta.env.VITE_APP_TITLE`. `src/vite-env.d.ts` supplies editor types; the demo also explicitly rejects missing or empty required values at runtime.
- Custom env values are strings: `"false"` is truthy. Convert boolean flags with an explicit comparison such as `import.meta.env.VITE_FEATURE_ENABLED === "true"` when adding them. Vite's built-in `DEV` and `PROD` flags are booleans.
- `VITE_*` values are public, even when supplied through an ignored local file or a CI secret store. They can be read from the served application. Never place passwords, private API keys, or access tokens there.
- Real secrets belong on a backend or server-side secret manager. An unprefixed variable is not automatically exposed by Vite, but prefix filtering is not a general secret-storage solution. Do not expose it manually through `define`, broaden `envPrefix`, or copy env files into `public/`.
- Production values are replaced at build time. Changing the server environment or using another preview mode does not rewrite an existing bundle; rebuild it. Runtime configuration requires a separately designed mechanism.
- Mode and optimization are separate concepts: `npm run build -- --mode staging` selects staging env files but still performs a production build under normal settings. Without staging-specific files, this project uses the generic `.env` values.

See [Vite environment variables and modes](https://vite.dev/guide/env-and-mode.html).

## Bundle optimization

### Load optional features on demand

The compiler and environment learning panels now start behind **Load...** buttons. `App.tsx` declares both components using `lazy(() => import(...))`. `DeferredDemo` only renders them after a click and provides a `Suspense` loading message and an error boundary with an explicit reload option.

For non-component code splitting, **Create count report** dynamically imports [`src/utils/count-report.ts`](./src/utils/count-report.ts) from an async click handler in `App.tsx`. No `React.lazy` or `Suspense` is needed. The utility produces a snapshot of the count at the time of the click; click again to refresh it. Loading disables the button, and failures are logged and displayed with an option to retry. In a production build, Vite emits a separate `count-report-*.js` chunk requested on the first click; subsequent imports reuse the loaded module. This tiny utility illustrates the pattern rather than a meaningful bundle-size saving.

The conditional render is important: putting a lazy component directly on the initial page still requests its chunk immediately. Here, each panel's code is fetched and evaluated only when requested. Loaded panels remain mounted so their state is preserved during other page interactions.

### Inspect the actual production requests

```sh
npm run build:analyze
npm run preview
```

1. Open browser developer tools, select **Network**, disable the browser cache, and reload the preview page.
2. Filter for JavaScript. The entry bundle loads, but neither `CompilerMutationDemo-*.js` nor `EnvironmentDemo-*.js` should be requested yet.
3. Click **Load compiler mutation demo**. Its JavaScript chunk is requested and the panel appears.
4. Click **Load environment variables demo**. Its independent chunk loads too.
5. Test the counters and reset controls to verify behavior after loading.

Use the production preview, not development request counts, to evaluate bundling. Vite development serves individual source modules rather than the optimized production chunks.

### Size reports and enforceable budgets

`build.manifest: true` generates `dist/.vite/manifest.json`. The dependency-free `scripts/bundle-report.mjs` follows every entry's static imports to measure initial JavaScript, and separately reports all emitted JavaScript chunks, including deferred ones.

Current example limits:

| Metric                                            | Limit                |
| ------------------------------------------------- | -------------------- |
| Initial JavaScript, including static dependencies | 72 KiB gzip          |
| All JavaScript, including deferred chunks         | 80 KiB gzip          |
| Any individual JavaScript chunk                   | 240 KiB uncompressed |

These are project-specific learning budgets, not universal targets. Adjust them deliberately based on measured requirements, rather than increasing limits just to hide a regression. The report exits nonzero when a budget is exceeded, and `npm run validate` includes both its tests and the real build's budget checks.

The report uses Node's default gzip compression per file and binary KiB (1024 bytes). It excludes CSS, images, HTTP headers, and request latency; Vite's printed kB/gzip estimates can differ. This is a JavaScript budget, not a complete page-performance measurement.

### Measure before adding chunk rules

The baseline had one 226.63 kB JavaScript bundle. These demo modules are tiny, so deferring them does **not** produce a large initial gzip saving: the lazy-loading and error-handling code has its own cost. Total emitted JavaScript can increase even while optional feature execution is deferred.

An explicit React vendor-chunk rule was measured and removed because it increased initial compressed JavaScript in this app. Vite's automatic chunking is retained. A separate vendor chunk may improve cache reuse in a larger app, but it does not remove React from the initial dependency graph or inherently reduce download size.

Vite's production build already performs tree shaking and minification. Prefer tree-shakeable ESM dependencies and supported targeted imports, avoid pulling large packages into the entry for occasional features, and remeasure with `npm run build:analyze` after dependency changes. Do not disable chunk warnings or force arbitrary chunks as a substitute for inspecting the real dependency graph.

This project explicitly uses `esbuild` for JavaScript and CSS minification. Vite 8 exposes it as an optional peer dependency, so it is listed directly in `devDependencies`. The pnpm build-script allowlist permits only esbuild's installation script; keep both package-manager lockfiles synchronized when changing dependencies.

## Plugins and configuration

### Keep the plugin pipeline minimal

The project uses Vite 8's Rolldown-based build. `vite.config.ts` retains only three top-level plugin entries:

| Entry                                      | Purpose                                                                       | Development                            | Production build                                 |
| ------------------------------------------ | ----------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------ |
| `react()` from `@vitejs/plugin-react`      | React integration and development Fast Refresh                                | React transforms and Fast Refresh      | React transforms, without Fast Refresh           |
| `babel(...)` from `@rolldown/plugin-babel` | Apply `reactCompilerPreset` only to `src/components/`, with annotation opt-in | Compile annotated components on demand | Compile annotated components into bundled output |
| Local `precompress`                        | Emit smaller gzip/Brotli sidecars from final written files                    | Excluded by `apply: "build"`           | Runs in `writeBundle`                            |

`reactCompilerPreset` is a Babel preset, not another top-level Vite plugin. Sharp/SVGO are asset-preparation tools, and Playwright/Vitest are test tools, not extra application build plugins.

### Plugin order versus hook timing

Array order alone is not the whole execution order. Vite first groups plugins using `enforce: "pre"`, normal ordering, and `enforce: "post"`, interleaving its own core/build plugins. User plugins retain array order within the same group. A factory such as `react()` can expand into multiple plugins.

The React and Babel factories both include pre-phase transforms, so keep `react()` before `babel(...)` as configured. Do not add a blanket `enforce` override or reorder them just to match an unrelated example.

The local compression plugin uses `enforce: "post"` to follow normal user plugins. That does **not** mean it runs after every Vite plugin or that every hook waits for disk output. Its `writeBundle` hook is what makes final files available: Vite may still finalize lazy-import references after `generateBundle`. Existing delivery tests verify compressed bytes round-trip to the actual emitted files.

Development transforms requested modules rather than writing a production bundle; output-generation hooks such as `writeBundle` do not run there. `apply: "build"` is based on the command, not the mode name: `vite build --mode development` is still a build. Preview serves an existing build without rerunning React/Babel transforms or compression.

### Configure the installed bundler, not an old example

- Use Vite's normal options first (`base`, `build.manifest`, etc.). Automatic chunking, hashing, tree shaking, and minification already cover this app.
- If a measured requirement needs low-level production customization, use `build.rolldownOptions`, checked against the installed Vite/Rolldown types. No empty or speculative bundler configuration is added here.
- In Vite 8, `build.rollupOptions` is a deprecated compatibility alias, not a way to switch back to Rollup. Older Rollup plugins, hooks, and options are not guaranteed to behave identically; check Rolldown compatibility before adopting them. Do not blindly copy `output.manualChunks` examples.
- Development dependency prebundling (`optimizeDeps.rolldownOptions`) is separate from production bundling (`build.rolldownOptions`). Changing one does not configure the other.

See the [Vite plugin API](https://vite.dev/guide/api-plugin), [build options](https://vite.dev/config/build-options#build-rolldownoptions), and [Vite 8 migration guide](https://vite.dev/guide/migration) alongside the installed TypeScript declarations.

### Maintenance and validation

Keep a plugin only when it supplies needed functionality that Vite does not already provide. Before an update, review Node/Vite peer requirements, release notes, and Rolldown support; use the existing lockfile, weekly Dependabot updates, and `npm run audit:dependencies`. Auditing known vulnerabilities is not proof of maintenance or plugin trustworthiness. No plugin/dependency upgrades are needed merely to explain this configuration.

Use `npm run dev -- --debug` to inspect resolved development configuration (stop with Ctrl+C), and `npm run build -- --debug` for build configuration and output. The build script also runs type-checking, lint, and asset optimization; fix gate failures rather than disabling them. After a successful build, run `npm run test:delivery` and `npm run test:smoke` to verify compression and the initial production page. The smoke-test scope and CI/security workflows are unchanged.

## Caching and compression

### What is configured in Vite

`vite.config.ts` now includes:

- A build-only `precompress` plugin using Node's built-in gzip and Brotli APIs, with no added package dependency.
- `preview.headers: {"Cache-Control": "no-cache"}` so local preview responses revalidate instead of staying fresh indefinitely.
- Preview's `Vary` header includes `Origin` and `Accept-Encoding`, keeping CORS and compression variants separate in shared caches.
- Vite's existing content-hashed filenames for generated assets. These defaults are preserved, not replaced with fixed filenames.

The compression plugin emits `.gz` and `.br` sidecars for generated HTML, CSS, JavaScript, and SVG files **larger than 1024 bytes** when compression makes them smaller. Originals remain available for clients that do not accept compression.

For example:

```text
dist/assets/index-<hash>.js
dist/assets/index-<hash>.js.gz
dist/assets/index-<hash>.js.br
```

Already-compressed formats such as PNG are excluded. Generated HTML at or below 1024 bytes does not receive sidecars; larger HTML is eligible when compression saves space. Public-directory files are copied as-is, rather than processed by this generated-asset hook.

Vite's normal build output and `build.reportCompressedSize` only **report estimated gzip sizes**; they do not themselves create compressed files. The added plugin creates real files. The bundle-budget report still counts each original JavaScript file once, not its compressed copies.

### Browser caching versus Vite's development cache

Vite's `cacheDir` is an on-disk development dependency cache, not a browser/CDN caching policy. Likewise, `server.headers` affects the development server and `preview.headers` affects local preview only. Neither configures the production server after `dist/` is uploaded.

`no-cache` means a stored response must be revalidated before reuse; it does not prohibit storage. An unchanged response can return **304 Not Modified** using an ETag, avoiding retransmission of the body.

The preview setting intentionally revalidates **all** served files. Do not set a global one-year immutable header in Vite preview/server settings: that would also make HTML stale.

### Production host/CDN requirements

Configure these independently on the service that actually serves the build:

| Response                                                    | Recommended policy                                   |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| App HTML, including SPA fallback HTML                       | `Cache-Control: no-cache`                            |
| Existing content-hashed assets                              | `Cache-Control: public, max-age=31536000, immutable` |
| Unhashed public files such as `favicon.svg` and `icons.svg` | Revalidate, or use an intentionally short lifetime   |
| Missing assets and error responses                          | Do not apply immutable success-response caching      |

A content change produces a new asset URL, allowing long-lived caching without overwriting the old content. Keep old hashed assets available for cached pages and open tabs that may request lazy chunks later.

For precompressed delivery, configure the host to negotiate the original URL using `Accept-Encoding` and serve an available `.br` or `.gz` representation, respecting the client's supported encodings. It must send:

- The matching `Content-Encoding: br` or `gzip`.
- The original content type, such as JavaScript or CSS, not a generic archive type.
- `Vary: Accept-Encoding` so shared caches separate representations correctly.
- The appropriate cache policy above.

Fall back to the original file when no compressed representation is suitable. Do not simply rename every request to `.br`, double-compress files, or delete originals. Many managed CDNs already handle compression dynamically; sidecars help only if the host supports serving them.

### Verify locally

```sh
npm run validate
npm run preview
```

In browser developer tools, inspect the entry JavaScript response for `Cache-Control`, `ETag`, `Content-Encoding`, and `Vary`. Leave browser caching enabled when observing conditional requests; a normal reload can revalidate, while a forced reload may bypass that flow.

This Vite preview provides dynamic gzip compression; it does not automatically negotiate the generated Brotli sidecars. Seeing a gzip preview response demonstrates negotiation, **not** that it served a generated sidecar. Production gzip/Brotli sidecar selection still needs host configuration.

`npm run test:delivery` verifies gzip/Brotli files decompress to the final written original bytes, compression saves space for this build's eligible assets, small generated text files and PNGs are skipped, preview sends `no-cache`, ETag revalidation returns 304, and preview negotiates gzip with an appropriate `Vary` header. It starts its own loopback preview server on an ephemeral port and closes it afterward. Run a build first; `npm run security:ci` builds before running the delivery tests.

## Security

### Keep development access local

The Vite `server` and `preview` configs bind to `127.0.0.1`, use strict ports, and allow only `localhost` and `127.0.0.1` hostnames. This prevents accidental exposure during the normal `npm run dev` / `npm run preview` workflow. Do not add `--host 0.0.0.0`, `host: true`, or `allowedHosts: true` for convenience. CLI flags and reverse proxies can intentionally override local settings; only do so on trusted networks with authentication, firewall, and/or VPN controls. Security headers are not a substitute for access control.

### Environment files and client secrets

The existing `.gitignore` excludes `.env` and `.env.*`; `.env.example` is the documented safe-to-commit exception and contains public sample settings only. Start local setup with:

```sh
cp .env.example .env.local
```

Never put credentials in any `VITE_*` value: Vite replaces those values into browser-accessible output. Keep real credentials in a backend or server-side secret manager. A `.gitignore` entry prevents new files being committed; it does not remove a file already tracked or undo a secret already published. If a credential was exposed, revoke and rotate it.

After building, `npm run security:check` scans generated text assets for values from sensitive-looking unprefixed environment variables and high-confidence credential patterns. It also rejects sensitive-looking public variable names such as `VITE_PRIVATE_API_KEY`. Its tests verify both clean output and detected leak cases.

This is a defense-in-depth smoke check, **not a secret detector or a proof that a bundle is safe**. It cannot reliably identify arbitrary secrets with innocuous names, transformed or encoded secrets, credentials split across strings, or secrets introduced by unrelated tools. Review the build environment and output; do not use this scanner as permission to put credentials in frontend configuration.

### Security headers and Content Security Policy

Vite's dev server adds `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options`. Preview adds the same headers and a **report-only** CSP. Report-only mode helps surface policy violations during local testing without blocking the application.

The sample policy allows this app's same-origin scripts, styles, assets, and connections; denies plugins and framing; and restricts forms and base URLs. Check the browser console while testing the page and its optional demos. If the app gains external APIs, fonts, analytics, workers, embedded content, or inline styles/scripts, assess each required source and adjust the policy narrowly. Do not silence violations by broadly adding `unsafe-inline` or `unsafe-eval`.

Vite's `server.headers` and `preview.headers` affect those local servers only. Configure the **enforcing** CSP and security headers at the production static host/CDN or reverse proxy. Start with `Content-Security-Policy-Report-Only` there, gather reports, then switch to an enforced `Content-Security-Policy` once legitimate resources are covered. Also configure HTTPS and redirect HTTP to HTTPS at the edge. Enable HSTS only after HTTPS is reliably enabled for the domain; this local HTTP preview intentionally does not send HSTS.

External links opened in a new tab use `rel="noopener noreferrer"` to prevent the new page from controlling its opener and to avoid sending referrer details.

### Dependency and plugin hygiene

`npm run audit:dependencies` runs `npm audit --audit-level=high` against the npm lockfile. `npm run security:ci` is the focused workflow used by GitHub Actions on pushes, pull requests, and a weekly schedule; Dependabot opens weekly npm and GitHub Actions update PRs. It checks dependency advisories, bundle-report and security tests, builds with Vite, checks the emitted client bundle, and tests delivery and preview headers. Review updates, especially major changes to Vite or plugins, then run `npm ci` and the project checks before merging. Do not apply blind `npm audit fix --force` upgrades.

The broader `npm run validate` also checks every app file, the complete TypeScript build, and the real bundle-size budgets. At the time this security work was implemented, it stopped at existing lint errors in `CountButton.tsx`, `Gallery.tsx`, `UsersTable.tsx`, and `use-state.ts`; a direct build also found existing unused-component type errors in `CountButton.tsx`. Those unrelated app issues were not changed here. The focused security workflow is intentionally separate so these baseline issues do not prevent security checks from running.

Keep the dependency lockfile committed and use `npm ci` in CI. Review plugins before adding them: this project uses `@vitejs/plugin-react`, `@rolldown/plugin-babel`, and `babel-plugin-react-compiler`; each plugin executes code in the build toolchain and should be kept purposeful and updated. npm audit checks published advisories, not malicious intent, code quality, or every supply-chain risk.

## React Compiler

The React Compiler is enabled through `reactCompilerPreset()` in `vite.config.ts`. It analyzes React components and hooks and automatically memoizes eligible code during Vite transforms. The `eslint-plugin-react-hooks` `recommended-latest` rules also report patterns the compiler may not be able to optimize. See the [React Compiler installation guide](https://react.dev/learn/react-compiler/installation) for details.

## Directory-Based Adoption for compilation

The `reactCompilerIncludes` list in `vite.config.ts` limits compilation to JavaScript and TypeScript files under `src/components/`. To adopt the compiler gradually, adjust this regular expression to select the folders or individual files you want to compile. Files outside the list are not processed by the React Compiler.

### Runtime mutation demonstration

Run `npm run dev`, click **Load compiler mutation demo**, and find **React Compiler: mutation pitfall** on the page.

- **Add by mutation (broken)** deliberately mutates state without changing the array reference. The counts update, but the compiled list stays stale.
- **Add immutably (fixed)** creates a new array reference, updating the compiled list with all accumulated items.
- **Reset demo** restores the initial state.

The parent in `src/CompilerMutationDemo.tsx` is outside the compiler include path. The child in `src/components/ItemList.tsx` uses `"use memo"` to opt into the current annotation-mode configuration. Replace it with `"use no memo"` to compare uncompiled behavior. This is a demonstration of invalid state mutation, not a compilation error or a recommended application pattern.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

### i18next fundamentals & React integration

i18next handles translation resources and language resolution.
react-i18next connects those to React components.

i18next is the translation engine. It owns resources, language selection, key lookup, and fallback rules.
react-i18next connects that engine to React. Its useTranslation hook gives components translated text and access to language changes, and it can rerender them when the language changes.

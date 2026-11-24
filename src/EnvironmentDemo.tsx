const appTitle = import.meta.env.VITE_APP_TITLE;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (typeof appTitle !== 'string' || appTitle.trim() === '') {
  throw new Error(
    "Missing VITE_APP_TITLE. Check the project's .env files and restart Vite.",
  );
}

if (typeof apiBaseUrl !== 'string' || apiBaseUrl.trim() === '') {
  throw new Error(
    "Missing VITE_API_BASE_URL. Check the project's .env files and restart Vite.",
  );
}

export default function EnvironmentDemo() {
  const serverOnlyHidden = import.meta.env.SERVER_ONLY_DEMO === undefined;

  return (
    <section id="environment-demo" aria-labelledby="environment-demo-title">
      <h2 id="environment-demo-title">Environment variables and secrets</h2>
      <p>
        These public values are embedded into the client code. The API URL is a
        configuration example only; this demo does not make API requests.
      </p>
      <dl>
        <dt>VITE_APP_TITLE</dt>
        <dd>{appTitle}</dd>
        <dt>VITE_API_BASE_URL</dt>
        <dd>{apiBaseUrl}</dd>
        <dt>MODE</dt>
        <dd>{import.meta.env.MODE}</dd>
        <dt>DEV</dt>
        <dd>{String(import.meta.env.DEV)}</dd>
        <dt>PROD</dt>
        <dd>{String(import.meta.env.PROD)}</dd>
        <dt>SERVER_ONLY_DEMO</dt>
        <dd>
          {serverOnlyHidden
            ? 'Not exposed to the browser (undefined)'
            : 'WARNING: unexpectedly exposed. Check the Vite envPrefix and define options.'}
        </dd>
      </dl>
      <p>
        Never put passwords, private API keys, or tokens in <code>VITE_*</code>
        variables. Keep real secrets on a backend; ignoring an env file in Git
        does not make its client-side values private.
      </p>
      <p>
        Compare <code>npm run dev</code> with <code>npm run build</code>{' '}
        followed by <code>npm run preview</code>. Preview serves the values
        baked into the build, not new runtime environment values.
      </p>
    </section>
  );
}

import { Component, Suspense, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

// DeferredDemo component that handles lazy loading of its children with error boundaries and suspense fallback.
class DemoErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unable to load or render the learning demo.', error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <div role="alert">
          <p>
            The demo could not load. Check your connection, then reload to try
            again.
          </p>
          <p>
            Reloading will reset the page's counters and other in-memory state.
          </p>
          <button
            type="button"
            className="counter"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// DeferredDemo functional component that uses a button to trigger loading of its children with suspense and error boundary.
export default function DeferredDemo({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="deferred-demo">
      {/* This conditional rendering matters: lazy() alone would still request the chunk immediately if the component were rendered immediately. */}
      {loaded ? (
        // Error boundary catches any errors that occur during the rendering of the lazy-loaded component.
        <DemoErrorBoundary>
          {/* suspense helps to show a fallback UI while the lazy-loaded component is being fetched. */}
          <Suspense fallback={<p role="status">Loading {title}...</p>}>
            {children}
          </Suspense>
        </DemoErrorBoundary>
      ) : (
        <button
          type="button"
          className="counter"
          onClick={() => setLoaded(true)}
        >
          Load {title}
        </button>
      )}
    </div>
  );
}

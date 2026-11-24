import { useState } from 'react';
import { Button } from './Button';
import { MetricCard } from './MetricCard';
import { useTheme } from './hooks/useTheme';

export const AnalyticsDashboard = () => {
  const [showValues, setShowValues] = useState<boolean>(true);
  const { theme, toggleTheme } = useTheme();

  return (
    <section
      aria-label="Analytics Dashboard"
      className="p-4 bg-dashboard-background text-left font-dashboard"
      data-dashboard-theme={theme}
    >
      <h2 className="font-semibold mb-4 text-dashboard-text">
        Analytics dashboard
      </h2>

      <div className="flex-column gap-dashboard-gap md:flex-row">
        <nav className="rounded-xl bg-dashboard-sidebar p-4 text-dashboard-on-sidebar md:w-48 md:shrink-0">
          <div className="font-semibold">Dashboard</div>
          <div className="mt-4 flex gap-dashboard-gap md:flex-col md:gap-2">
            <a href="#dashboard-overview" className="hover:underline">
              Overview
            </a>
            <a href="#dashboard-metrics" className="hover:underline">
              Metrics
            </a>
          </div>
        </nav>

        <div
          id="dashboard-overview"
          className="min-w-0 flex-1 rounded-xl bg-dashboard-background p-6 text-dashboard-text"
        >
          <h3 className="text-xl font-semibold">Overview</h3>
          <p className="mt-2 text-sm text-dashboard-muted">
            A snapshot of your activity.
          </p>

          <div className="mt-4 flex flex-row gap-dashboard-gap">
            <Button
              aria-pressed={showValues}
              onClick={() => setShowValues(!showValues)}
            >
              Show metric values
            </Button>
            <Button
              type="button"
              aria-pressed={theme === 'dark'}
              onClick={toggleTheme}
            >
              Dark mode
            </Button>
          </div>

          <div
            id="dashboard-metrics"
            className="mt-6 grid grid-cols-1 gap-dashboard-gap md:grid-cols-3"
          >
            <MetricCard
              title="Total visitors"
              value={showValues ? '1,245' : 'Hidden'}
            />
            <MetricCard
              title="Active users"
              value={showValues ? '520' : 'Hidden'}
            />
            <MetricCard
              title="New signups"
              value={showValues ? '84' : 'Hidden'}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

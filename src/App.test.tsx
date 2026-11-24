import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as countReport from './utils/count-report';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('non-component code splitting demo', () => {
  it('creates a report for the current count only when requested', async () => {
    const createReport = vi.spyOn(countReport, 'createCountReport');
    const user = userEvent.setup();
    render(<App />);

    expect(createReport).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Start the count' }));
    await user.click(
      screen.getByRole('button', { name: 'Create count report' }),
    );

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Current count: 1. Next count: 2.',
    );
    expect(createReport).toHaveBeenCalledWith(1);
  });

  it('reports failures and allows another attempt', async () => {
    const error = new Error('Report unavailable');
    vi.spyOn(countReport, 'createCountReport').mockImplementationOnce(() => {
      throw error;
    });
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', { name: 'Create count report' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to create the count report.',
    );
    expect(logError).toHaveBeenCalledWith(
      'Unable to load or create the count report.',
      error,
    );

    await user.click(
      screen.getByRole('button', { name: 'Create count report' }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Current count: 0. Next count: 1.',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

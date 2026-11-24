import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserDirectory } from './index';
import { fetchUsersApi } from './users.api';

vi.mock('./users.api', () => ({
  fetchUsersApi: vi.fn(),
}));

const fetchUsersMock = vi.mocked(fetchUsersApi);

beforeEach(() => {
  fetchUsersMock.mockReset();
});

describe('UserDirectory', () => {
  it('shows loading while the request is pending', () => {
    fetchUsersMock.mockReturnValue(new Promise(() => {}));

    render(<UserDirectory />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('SOLID Principles Demo')).not.toBeInTheDocument();
  });

  it('displays the fetched users', async () => {
    fetchUsersMock.mockResolvedValue([
      { id: 1, name: 'Jane Doe', email: 'jane@example.com', phone: '123456' },
    ]);

    render(<UserDirectory />);

    expect(await screen.findByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('SOLID Principles Demo')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('shows an error when the request fails', async () => {
    fetchUsersMock.mockRejectedValue(new Error('Request failed'));

    render(<UserDirectory />);

    expect(await screen.findByText('Error loading users')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('aborts the request when unmounted', () => {
    fetchUsersMock.mockReturnValue(new Promise(() => {}));

    const { unmount } = render(<UserDirectory />);
    const signal = fetchUsersMock.mock.calls[0][0];

    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });
});

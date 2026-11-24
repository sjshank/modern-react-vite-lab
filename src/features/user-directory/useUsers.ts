import { useEffect, useState } from 'react';
import type { UserFetchingState } from './types';
import { fetchUsersApi } from './users.api';

export const useFetchUsers = (): UserFetchingState => {
  const [state, setState] = useState<UserFetchingState>({
    status: 'idle',
    data: [],
  });

  useEffect(() => {
    // Create an AbortController to allow cancelling the fetch request if the component unmounts
    // what is advantage of using AbortController? It allows us to cancel the fetch request if the component unmounts, preventing potential memory leaks and unnecessary network requests.
    const controller = new AbortController();
    const fetchUsers = async () => {
      try {
        setState({ status: 'loading', data: [] });
        /* Separation of concerns - means giving each part of your app a clear responsibility */
        // Fetch the users from the API using the AbortController's signal for cancellation.
        const users = await fetchUsersApi(controller.signal);
        setState({ status: 'success', data: users });
      } catch (error) {
        setState({
          status: 'error',
          error: (error as Error).message,
          data: [],
        });
      }
    };

    fetchUsers();

    return () => {
      controller.abort();
    };
  }, []);

  return state;
};

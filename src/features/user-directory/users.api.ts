import type { User } from './types';

// Fetches a list of users from the API with a limit of 50. Supports request cancellation via AbortSignal.
export const fetchUsersApi = async (signal: AbortSignal): Promise<User[]> => {
  try {
    // Initiate the fetch request with the provided AbortSignal.
    // Perform the fetch request to the API endpoint with the signal for cancellation.
    const response = await fetch('https://dummyjson.com/users?limit=50', {
      signal,
    });
    if (!response.ok) {
      // If the response is not OK, throw an error to be caught in the catch block.
      throw new Error('Failed to fetch users');
    }
    const data = await response.json();
    return data.users;
  } catch (error) {
    console.error(error);
    throw new Error('Error occured while fetching users ', error as Error);
  }
};

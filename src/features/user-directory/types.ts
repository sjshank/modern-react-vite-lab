export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

export type UserFetchingState =
  | { status: 'idle'; data: User[] }
  | { status: 'loading'; data: User[] }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: string; data: User[] };

const TOKEN_KEY = 'therapy_center_token';
const USER_KEY = 'therapy_center_user';

export const tokenStorage = {
  get: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  remove: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export const userStorage = {
  get: (): any => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  set: (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  remove: (): void => {
    localStorage.removeItem(USER_KEY);
  },
};

export const clearStorage = (): void => {
  tokenStorage.remove();
  userStorage.remove();
};

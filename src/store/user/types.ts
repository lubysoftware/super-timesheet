export interface User {
  avatar: string;
  name: string;
  email: string;
  token: string;
}

export interface UserStoreTypes {
  user?: User;

  setUser(data: User): void;
  wipeUser(): void;
}

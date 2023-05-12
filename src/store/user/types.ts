export interface User {
  id: string;
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

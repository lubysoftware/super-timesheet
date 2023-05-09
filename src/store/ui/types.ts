import { Theme } from '@mui/material';

export enum Load {
  Login = 'auth-user',
  SignUp = 'auth-create',
  LoadClients = 'load-clients-projects-categories',
  RedirectToLogin = 'redirect-to-login',
  RedirectToSignUp = 'redirect-to-sign-up',
  RedirectToConfigurations = 'redirect-to-configurations',
  RedirectToGithubCommitsLoad = 'redirect-to-github-commits-load',
  RedirectToTimesheetAppointmentCreate = 'redirect-to-timesheet-appointment-create',
  RedirectToSystemOperation = 'redirect-to-system-operation',
}

export interface UiStoreTypes {
  theme: Theme;
  themeMode: Theme['palette']['mode'];
  switchThemeMode(): void;
  loading: Load[];
  enableLoad(load: Load): void;
  disableLoad(load: Load): void;
}

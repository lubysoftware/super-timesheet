export enum Routes {
  Login = `/`,
  SignUp = `/sign-up`,
  Configurations = `/configurations`,
  GithubCommitsLoad = `/github/commits/load`,
  TimesheetAppointmentCreate = `/timesheet/appointment/create`,
  SystemOperation = `/system/operation`,
}

export const routes = {
  login: (): Routes => Routes.Login,
  signUp: (): Routes => Routes.SignUp,
  configurations: (): Routes => Routes.Configurations,
  githubCommitsLoad: (): Routes => Routes.GithubCommitsLoad,
  createAppointment: (): Routes => Routes.TimesheetAppointmentCreate,
  about: (): Routes => Routes.SystemOperation,

  private: [
    Routes.Configurations,
    Routes.GithubCommitsLoad,
    Routes.TimesheetAppointmentCreate,
    Routes.SystemOperation,
  ],
  protected: [Routes.Login, Routes.SignUp],
  public: [] as Routes[],
};

export enum RouteTypes {
  Private = 'private',
  Protected = 'protected',
  Public = 'public',
}

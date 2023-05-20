import { NextApiRequest, NextApiResponse } from 'next';

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

  api: {
    timesheet: {
      loadClients: (): string => '/api/timesheet/load-clients',
      loadCookies: (): string => '/api/timesheet/load-cookies',
      sendAppointments: (): string => '/api/timesheet/send-appointments',
    },
    utils: { encrypt: (): string => '/api/utils/encrypt' },
  },

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

interface Request<Body> extends NextApiRequest {
  body: Body;
}

export type ApiRoute<Response = unknown, Body = unknown> = (
  request: Request<Body>,
  response: NextApiResponse<Response | { message: string }>
) => void | Promise<void>;

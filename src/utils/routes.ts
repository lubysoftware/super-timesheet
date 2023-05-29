import { NextApiRequest, NextApiResponse } from 'next';

export enum Routes {
  Login = `/`,
  SignUp = `/sign-up`,
  Configurations = `/configurations`,
  TimesheetAppointmentCreateWithGithub = `/timesheet/appointment/create/with-github`,
  TimesheetAppointmentCreate = `/timesheet/appointment/create`,
  TimesheetAppointmentRead = `/timesheet/appointment/read`,
  SystemOperation = `/system/operation`,
}

export const routes = {
  login: (): Routes => Routes.Login,
  signUp: (): Routes => Routes.SignUp,
  configurations: (): Routes => Routes.Configurations,
  createAppointmentWithGithub: (): Routes =>
    Routes.TimesheetAppointmentCreateWithGithub,
  createAppointment: (): Routes => Routes.TimesheetAppointmentCreate,
  readAppointments: (): Routes => Routes.TimesheetAppointmentRead,
  about: (): Routes => Routes.SystemOperation,

  api: {
    timesheet: {
      loadClients: (): string => '/api/timesheet/load-clients',
      loadCookies: (): string => '/api/timesheet/load-cookies',
      sendAppointments: (): string => '/api/timesheet/send-appointments',
      loadAppointments: (): string => '/api/timesheet/load-appointments',
    },
    utils: { encrypt: (): string => '/api/utils/encrypt' },
  },

  private: [
    Routes.Configurations,
    Routes.TimesheetAppointmentCreateWithGithub,
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

import { TimesheetProject } from '@/services/timesheet/timesheet-project/types';
import { Endpoints } from '@octokit/types';

export namespace Github {
  export type Repositories = Endpoints['GET /user/repos']['response']['data'];
  export type Repository = Repositories[number];

  export interface SimpleRepository {
    fullName: Repository['full_name'];
    name: Repository['name'];
    ownerLogin: Repository['owner']['login'];
    ownerAvatar: Repository['owner']['avatar_url'];
  }

  export type Branches =
    Endpoints['GET /repos/{owner}/{repo}/branches']['response']['data'];
  export type Branch = Branches[number];

  export interface SimpleBranch {
    name: Branch['name'];
    sha: Branch['commit']['sha'];
  }

  export type Commits =
    Endpoints['GET /repos/{owner}/{repo}/commits']['response']['data'];
  export type Commit = Commits[number];

  export interface SimpleCommit {
    repo: SimpleRepository['fullName'];
    date: string;
    description: Commit['commit']['message'];
    commit: Commit['html_url'];
    project?: TimesheetProject.Row;
  }

  export interface Service {
    verifyTokenIsValid(token: string): Promise<boolean>;
    loadRepositories(): Promise<SimpleRepository[]>;
    loadBranches(
      repository: SimpleRepository['fullName']
    ): Promise<SimpleBranch[]>;
  }
}

import { User } from '@/store/user/types';
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

  export interface Service {
    verifyTokenIsValid(token: string): Promise<boolean>;
    loadRepositories(user: User): Promise<SimpleRepository[]>;
    loadBranches(
      user: User,
      repository: SimpleRepository['fullName']
    ): Promise<SimpleBranch[]>;
  }
}

import { gitCommitReadFormSchema } from '@/services/github/github-commit/schema';
import { Github } from '@/services/github/types';

export namespace GithubCommit {
  export interface DayTime {
    start: string;
    end: string;
  }

  export interface DateFilter {
    since?: string;
    until?: string;
  }

  export interface Input {
    translate?: boolean;
    dayTimes: DayTime[];
    when?: DateFilter;
  }

  export interface GithubCommitOfDayGroup {
    repo: Github.SimpleRepository['fullName'];
    time: Github.SimpleCommit['date'];
    description: Github.Commit['commit']['message'];
    commit: Github.Commit['html_url'];
  }

  export interface GithubCommitDayGroup {
    date: Github.SimpleCommit['date'];
    commits: GithubCommitOfDayGroup[];
  }

  export interface GithubCommitOfDayTimeGroup {
    description: Github.Commit['commit']['message'];
    commit: Github.Commit['html_url'];
  }

  export interface GithubCommitTimeGroupItems {
    repo: Github.SimpleRepository['fullName'];
    commits: GithubCommitOfDayTimeGroup[];
  }

  export interface GithubCommitTimeGroup {
    startTime: Github.SimpleCommit['date'];
    endTime: Github.SimpleCommit['date'];
    items: GithubCommitTimeGroupItems[];
  }

  export interface GithubCommitDayTimeGroup {
    date: Github.SimpleCommit['date'];
    commits: GithubCommitTimeGroup[];
  }

  export interface Service {
    schema: typeof gitCommitReadFormSchema;
    dateNow(dateString: Github.SimpleCommit['date']): string;
    simplifyCommit(repo: string, _: Github.Commit): Github.SimpleCommit;
    removeMerge(commits: Github.SimpleCommit[]): Github.SimpleCommit[];
    joinRepositoryCommits(
      commits: Github.SimpleCommit[][]
    ): Github.SimpleCommit[];
    sortCommitsByDate(commits: Github.SimpleCommit[]): Github.SimpleCommit[];
    load(when?: DateFilter): Promise<Github.SimpleCommit[]>;
    simpleLoad(options: Input): Promise<Github.SimpleCommit[]>;
    groupedLoad(options: Input): Promise<GithubCommitDayTimeGroup[]>;
    groupByDay(commits: Github.SimpleCommit[]): Promise<GithubCommitDayGroup[]>;
    groupByTime(
      commits: GithubCommitDayGroup[],
      dayTimes: DayTime[]
    ): Promise<GithubCommitDayTimeGroup[]>;
    translateConventionalCommits(
      commits: Github.SimpleCommit[]
    ): Github.SimpleCommit[];
    parseLocation(commits: Github.SimpleCommit[]): Github.SimpleCommit[];
    translateMessage(
      commits: Github.SimpleCommit[]
    ): Promise<Github.SimpleCommit[]>;
    translateCommits(
      commits: Github.SimpleCommit[]
    ): Promise<Github.SimpleCommit[]>;
  }
}

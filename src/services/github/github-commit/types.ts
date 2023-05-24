import { gitCommitReadFormSchema } from '@/services/github/github-commit/schema';
import { Github } from '@/services/github/types';
import { TimesheetAppointment } from '@/services/timesheet/timesheet-appointment/types';
import { TimesheetProject } from '@/services/timesheet/timesheet-project/types';

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

  export interface DayGroupItem {
    repo: Github.SimpleRepository['fullName'];
    time: Github.SimpleCommit['date'];
    description: Github.Commit['commit']['message'];
    commit: Github.Commit['html_url'];
    project?: TimesheetProject.Row;
  }

  export interface DayGroup {
    date: Github.SimpleCommit['date'];
    commits: DayGroupItem[];
  }

  export interface DayTimeGroupItem {
    description: Github.Commit['commit']['message'];
    commit: Github.Commit['html_url'];
  }

  export interface TimeGroupItems {
    repo: Github.SimpleRepository['fullName'];
    project?: TimesheetProject.Row;
    commits: DayTimeGroupItem[];
  }

  export interface TimeGroup {
    startTime: Github.SimpleCommit['date'];
    endTime: Github.SimpleCommit['date'];
    items: TimeGroupItems[];
  }

  export interface DayTimeGroup {
    date: Github.SimpleCommit['date'];
    commits: TimeGroup[];
  }

  export interface Service {
    schema: typeof gitCommitReadFormSchema;
    simplifyCommit(
      repo: string,
      _: Github.Commit,
      project?: TimesheetProject.Row
    ): Github.SimpleCommit;
    removeMerge(commits: Github.SimpleCommit[]): Github.SimpleCommit[];
    joinCommitLists(commits: Github.SimpleCommit[][]): Github.SimpleCommit[];
    sortCommitsByDate(commits: Github.SimpleCommit[]): Github.SimpleCommit[];
    load(when?: DateFilter): Promise<Github.SimpleCommit[]>;
    loadAppointments(
      options: Input
    ): Promise<TimesheetAppointment.Schema['appointments']>;
    groupedLoad(options: Input): Promise<DayTimeGroup[]>;
    groupByDayAndProject(commits: Github.SimpleCommit[]): Promise<DayGroup[]>;
    groupByTime(
      commits: DayGroup[],
      dayTimes: DayTime[]
    ): Promise<DayTimeGroup[]>;
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

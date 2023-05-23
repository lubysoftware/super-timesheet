import { gitCommitReadFormSchema } from '@/services/github/github-commit/schema';
import { GithubCommit } from '@/services/github/github-commit/types';
import { githubInfos } from '@/services/github/github-infos/service';
import { githubRepository } from '@/services/github/github-repository/service';
import { Github } from '@/services/github/types';
import { TimesheetAppointment } from '@/services/timesheet/timesheet-appointment/types';
import { getUser } from '@/store/user/store';
import { translate } from '@vitalets/google-translate-api';

import { Octokit } from 'octokit';

export const githubCommit: GithubCommit.Service = {
  schema: gitCommitReadFormSchema,

  dateNow(dateString: string): string {
    const date = new Date(dateString);

    date.setHours(date.getHours() - 3);

    return date.toISOString();
  },

  simplifyCommit(repo: string, _: Github.Commit): Github.SimpleCommit {
    return {
      repo,
      date: this.dateNow(_.commit.committer?.date || ''),
      description: _.commit.message,
      commit: _.html_url,
    };
  },

  removeMerge(commits: Github.SimpleCommit[]): Github.SimpleCommit[] {
    return commits.filter(
      ({ description }) =>
        !description.includes("Merge branch '") &&
        !description.includes('Merge pull request #')
    );
  },

  joinRepositoryCommits(
    commits: Github.SimpleCommit[][]
  ): Github.SimpleCommit[] {
    const items: Github.SimpleCommit[] = [];

    commits.forEach((list) => list.forEach((c) => items.push(c)));

    return items;
  },

  sortCommitsByDate(commits: Github.SimpleCommit[]): Github.SimpleCommit[] {
    return commits.sort((a, b) =>
      a.date < b.date ? -1 : a.date > b.date ? 1 : 0
    );
  },

  async load(when?: GithubCommit.DateFilter): Promise<Github.SimpleCommit[]> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const since =
      when?.since || `${year}-${`0${month}`.slice(-2)}-01T00:00:00Z`;
    const until =
      when?.until || `${year}-${`0${month + 1}`.slice(-2)}-01T00:00:00Z`;

    const user = getUser();

    if (!user) return [];

    const defaultConfig = { author: user.email, per_page: 100, since, until };

    const repositories = await githubRepository.getAll();

    const infos = await githubInfos.get();

    if (!infos) return [];

    const octokit = new Octokit({ auth: infos[0].token });

    const commitsPromise = repositories.map(
      async (repository): Promise<Github.SimpleCommit[]> => {
        const [owner, repo] = repository.fullName.split('/');

        const config = { ...defaultConfig, owner, repo };

        const response = await octokit.request(
          'GET /repos/{owner}/{repo}/commits',
          repository.branch
            ? { ...config, sha: repository.branch?.sha }
            : config
        );

        return this.removeMerge(
          response.data.map((commit) => this.simplifyCommit(repo, commit))
        );
      }
    );

    return this.sortCommitsByDate(
      this.joinRepositoryCommits(await Promise.all(commitsPromise))
    );
  },

  async groupByDay(
    commits: Github.SimpleCommit[]
  ): Promise<GithubCommit.GithubCommitDayGroup[]> {
    const grouped: Record<string, Github.SimpleCommit[]> = {};

    commits.forEach((item) => {
      const day = item.date.split('T')[0];

      if (grouped[day]) {
        grouped[day].push(item);
      } else {
        grouped[day] = [item];
      }
    });

    return Object.entries(grouped).map(
      ([day, commit]): GithubCommit.GithubCommitDayGroup => ({
        date: day,
        commits: commit.map((c) => ({
          repo: c.repo,
          time: c.date.split('T')[1].split('.')[0],
          description: c.description,
          commit: c.commit,
        })),
      })
    );
  },

  async groupByTime(
    commits: GithubCommit.GithubCommitDayGroup[],
    dayTimes: GithubCommit.DayTime[]
  ): Promise<GithubCommit.GithubCommitDayTimeGroup[]> {
    const times: GithubCommit.GithubCommitTimeGroup[] = dayTimes.map(
      (time) => ({
        startTime: time.start,
        endTime: time.end,
        items: [] as GithubCommit.GithubCommitTimeGroupItems[],
      })
    );

    return commits.map((day) => {
      const date = day.date;
      const commits: GithubCommit.GithubCommitTimeGroup[] = [...times];

      day.commits.forEach((commit) =>
        times.forEach((t, tIndex) => {
          if (
            (commit.time >= t.startTime && commit.time <= t.endTime) ||
            (commit.time < t.startTime && tIndex === 0) ||
            (commit.time > t.endTime && tIndex === times.length - 1) ||
            (!!times[tIndex + 1] &&
              commit.time > t.endTime &&
              commit.time < times[tIndex + 1].startTime)
          ) {
            commits[tIndex].items.push({
              repo: commit.repo,
              commits: [
                {
                  description: commit.description,
                  commit: commit.commit,
                },
              ],
            });
          }
        })
      );

      const joinedCommits = commits.map((c) => {
        const grouped: Record<
          GithubCommit.GithubCommitTimeGroupItems['repo'],
          GithubCommit.GithubCommitTimeGroupItems['commits']
        > = {};

        c.items.forEach(({ repo, commits }) =>
          grouped[repo]
            ? (grouped[repo] = grouped[repo].concat(commits))
            : (grouped[repo] = [...commits])
        );

        return {
          ...c,
          items: Object.entries(grouped).map(([repo, commits]) => ({
            repo,
            commits,
          })),
        };
      });

      return { date, commits: joinedCommits };
    });
  },

  translateConventionalCommits(
    commits: Github.SimpleCommit[]
  ): Github.SimpleCommit[] {
    const hashmap = {
      feat: 'Desenvolvimento de feature',
      fix: 'Correção/manutenção de bug',
      docs: 'Documentação',
      style: 'Formatação de estilos',
      refactor: 'Refatoração',
      chore: 'Outras alterações',
      test: 'Testes automatizados',
      merge: 'Review de Pull Request',
    };

    return commits.map((commit) => ({
      ...commit,
      description: commit.description.replace(
        /feat|fix|docs|style|refactor|chore|test|merge/i,
        (key) => hashmap[key as keyof typeof hashmap]
      ),
    }));
  },

  parseLocation(commits: Github.SimpleCommit[]): Github.SimpleCommit[] {
    return commits.map((commit) => ({
      ...commit,
      description: commit.description.replace(
        /\(([\w\-]+)\):/gm,
        (_, location) => ` em "${location}":`
      ),
    }));
  },

  async translateMessage(
    commits: Github.SimpleCommit[]
  ): Promise<Github.SimpleCommit[]> {
    const promise = commits.map(async (commit) => {
      const [head, message] = commit.description.split(':');
      const { text } = await translate(message, { to: 'pt-br' });

      return { ...commit, description: `${head}: ${text}` };
    });

    return Promise.all(promise);
  },

  async translateCommits(
    commits: Github.SimpleCommit[]
  ): Promise<Github.SimpleCommit[]> {
    const conventionalTranslated = this.translateConventionalCommits(commits);
    const locationParsed = this.parseLocation(conventionalTranslated);

    return this.translateMessage(locationParsed);
  },

  async simpleLoad(
    options: GithubCommit.Input
  ): Promise<Github.SimpleCommit[]> {
    const commits = await this.load(options.when);

    return options.translate ? await this.translateCommits(commits) : commits;
  },

  async groupedLoad(
    options: GithubCommit.Input
  ): Promise<GithubCommit.GithubCommitDayTimeGroup[]> {
    let commits = await this.load(options.when);

    if (options.translate) {
      commits = await this.translateCommits(commits);
    }

    const byDay = await this.groupByDay(commits);

    return await this.groupByTime(byDay, options.dayTimes);
  },

  async loadAppointments(
    options: GithubCommit.Input
  ): Promise<TimesheetAppointment.Schema['appointments']> {
    const repositoryProjects = await githubRepository.getAll();
    const commits = await this.groupedLoad(options);
    const aux: TimesheetAppointment.Schema['appointments'] = [];

    const promise = commits.map(async (item) => {
      const promise = item.commits.map(async (commit) => {
        const repos = commit.items.map((i) =>
          repositoryProjects.find((r) => r.fullName.split('/')[1] === i.repo)
        );
        const repo = repos[0]?.project;

        const description = `${commit.items
          .map(
            (item) =>
              `Em "${item.repo}":\n` +
              item.commits
                .map(
                  (subCommits, sci, { length }) =>
                    `- ${subCommits.description} (${subCommits.commit})${
                      length - 1 === sci ? '.' : ';'
                    }`
                )
                .join('\n')
          )
          .join('\n\n')}`;

        aux.push({
          client: repo
            ? { label: repo.clientName, value: String(repo.clientCode) }
            : undefined,
          project: repo
            ? { label: repo.projectName, value: String(repo.projectCode) }
            : undefined,
          category: undefined,
          date: item.date,
          start: commit.startTime,
          end: commit.endTime,
          description,
        });

        return aux;
      });

      return await Promise.all(promise);
    });

    await Promise.all(promise);

    return aux;
  },
};

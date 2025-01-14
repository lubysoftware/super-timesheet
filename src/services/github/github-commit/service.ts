import { gitCommitReadFormSchema } from '@/services/github/github-commit/schema';
import { GithubCommit } from '@/services/github/github-commit/types';
import { githubInfos } from '@/services/github/github-infos/service';
import { githubRepository } from '@/services/github/github-repository/service';
import { Github } from '@/services/github/types';
import { TimesheetAppointment } from '@/services/timesheet/timesheet-appointment/types';
import { TimesheetProject } from '@/services/timesheet/timesheet-project/types';
import { getUser } from '@/store/user/store';
import { translate } from '@vitalets/google-translate-api';

import { formatISO } from 'date-fns';
import { Octokit } from 'octokit';

export const githubCommit: GithubCommit.Service = {
  schema: gitCommitReadFormSchema,

  removeMerge(commits: Github.SimpleCommit[]): Github.SimpleCommit[] {
    return commits.filter(
      ({ description }) =>
        !description.includes("Merge branch '") &&
        !description.includes('Merge pull request #')
    );
  },

  simplifyCommit(
    repo: string,
    _: Github.Commit,
    project?: TimesheetProject.Row
  ): Github.SimpleCommit {
    return {
      repo,
      date: formatISO(new Date(_.commit.committer?.date || '')),
      description: _.commit.message,
      commit: _.html_url,
      project,
    };
  },

  joinCommitLists(commitLists: Github.SimpleCommit[][]): Github.SimpleCommit[] {
    const commits: Github.SimpleCommit[] = [];

    commitLists.forEach((list) =>
      list.forEach((commit) => commits.push(commit))
    );

    return commits;
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
          response.data.map((commit) =>
            this.simplifyCommit(repo, commit, repository.project)
          )
        );
      }
    );

    return this.sortCommitsByDate(
      this.joinCommitLists(await Promise.all(commitsPromise))
    );
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

  async groupByDayAndProject(
    commits: Github.SimpleCommit[]
  ): Promise<GithubCommit.DayGroup[]> {
    const days: Record<string, Github.SimpleCommit[]> = {};

    commits.forEach((item) => {
      const day = item.date.split('T')[0];
      const project = item.project?.projectName;
      const client = item.project?.clientName;

      const title = `${day}-${project}-${client}`;

      if (days[title]) days[title].push(item);
      else days[title] = [item];
    });

    return Object.entries(days).map(
      ([, commit]): GithubCommit.DayGroup => ({
        date: commit[0].date.split('T')[0],
        commits: commit.map((c) => ({
          repo: c.repo,
          time: c.date.split('T')[1].split('.')[0],
          description: c.description,
          commit: c.commit,
          project: c.project,
        })),
      })
    );
  },

  async groupByTime(
    commits: GithubCommit.DayGroup[],
    dayTimes: GithubCommit.DayTime[]
  ): Promise<GithubCommit.DayTimeGroup[]> {
    return commits.map((day) => {
      const date = day.date;
      const commits: GithubCommit.TimeGroup[] = dayTimes.map((time) => ({
        startTime: time.start,
        endTime: time.end,
        items: [] as GithubCommit.TimeGroupItems[],
      }));

      day.commits.forEach((commit) =>
        commits.forEach((t, index) => {
          if (
            // Se o horário for maior que o inicial e menor que o final
            (commit.time >= t.startTime && commit.time <= t.endTime) ||
            // Ou se for o primeiro e o horário for menor que o inicial
            (commit.time < t.startTime && index === 0) ||
            // Ou se for o último e o horário for maior que o final
            (commit.time > t.endTime && index === commits.length - 1) ||
            // Ou se tiver outro item e o horário for entre final do atual e o inicial do próximo
            (!!commits[index + 1] &&
              commit.time > t.endTime &&
              commit.time < commits[index + 1].startTime)
          ) {
            commits[index].items.push({
              repo: commit.repo,
              project: commit.project,
              commits: [
                { description: commit.description, commit: commit.commit },
              ],
            });
          }
        })
      );

      const joinedCommits = commits.map((c) => {
        const grouped: Record<
          GithubCommit.TimeGroupItems['repo'],
          {
            commits: GithubCommit.TimeGroupItems['commits'];
            project: GithubCommit.TimeGroupItems['project'];
          }
        > = {};

        c.items.forEach(({ repo, commits, project }) =>
          grouped[repo]
            ? (grouped[repo].commits = grouped[repo].commits.concat(commits))
            : (grouped[repo] = { commits, project })
        );

        return {
          ...c,
          items: Object.entries(grouped).map(
            ([repo, { commits, project }]) => ({
              repo,
              commits,
              project,
            })
          ),
        };
      });

      return { date, commits: joinedCommits };
    });
  },

  async groupedLoad(
    options: GithubCommit.Input
  ): Promise<GithubCommit.DayTimeGroup[]> {
    let commits = await this.load(options.when);

    if (options.translate) {
      commits = await this.translateCommits(commits);
    }

    const byDay = await this.groupByDayAndProject(commits);

    return await this.groupByTime(byDay, options.dayTimes);
  },

  async loadAppointments(
    options: GithubCommit.Input
  ): Promise<TimesheetAppointment.Schema['appointments']> {
    const commits = await this.groupedLoad(options);
    const aux: TimesheetAppointment.Schema['appointments'] = [];

    commits.forEach((item) =>
      item.commits.forEach((commit) => {
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

        const repo = commit.items[0]?.project;

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
      })
    );

    return aux;
  },
};

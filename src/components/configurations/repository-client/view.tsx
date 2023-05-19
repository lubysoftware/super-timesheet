import {
  FC,
  ReactElement,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-toastify';

import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import {
  Autocomplete,
  Grid,
  IconButton,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';

import { githubBranch } from '@/services/github/github-branch/service';
import { githubRepository } from '@/services/github/github-repository/service';
import { GithubRepository } from '@/services/github/github-repository/types';
import { github } from '@/services/github/service';
import { timesheetClient } from '@/services/timesheet/timesheet-client/service';
import { timesheetProject } from '@/services/timesheet/timesheet-project/service';
import { TimesheetProject } from '@/services/timesheet/timesheet-project/types';
import useTimesheetStore from '@/store/timesheet/store';

const List: FC<{
  repositories: GithubRepository.Row[];
  reload(): void;
}> = ({ repositories, reload }) => {
  const handleDelete = async (fullName: string): Promise<void> => {
    try {
      await githubRepository.delete(fullName);
      await reload();
    } catch (e) {
      toast.error(`Falha ao deleter um repositório: ${e}`);
    }
  };

  return (
    <>
      {repositories.map((repo, idx) => (
        <Grid item xs={12} container spacing={1} key={idx}>
          <Grid item xs={4} title={repo.fullName}>
            <TextField
              label="Repositório"
              size="small"
              value={repo.fullName}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={3} title={repo.branch?.name}>
            <TextField
              label="Branch"
              size="small"
              value={repo.branch?.name}
              fullWidth
              disabled
            />
          </Grid>
          <Grid
            item
            xs={4}
            title={`${repo.project?.clientName} - ${repo.project?.projectName}`}
          >
            <TextField
              label="Projeto"
              size="small"
              value={repo.project?.projectName}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={1} title="Apagar repositório">
            <IconButton
              style={{
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 4,
                paddingTop: 7,
                paddingBottom: 7,
              }}
              aria-label="Apagar repositório"
              onClick={handleDelete.bind(null, repo.fullName)}
            >
              <RemoveIcon color="disabled" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
    </>
  );
};

const ListSkeleton: FC<{ length?: number }> = ({ length }) => (
  <>
    {[...new Array(length || 3)].map((_, i) => (
      <Grid item xs={12} container spacing={1} key={i}>
        <Grid item xs={4}>
          <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
        </Grid>
        <Grid item xs={3}>
          <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
        </Grid>
        <Grid item xs={4}>
          <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
        </Grid>
        <Grid item xs={1}>
          <Skeleton width="42px" height={40} sx={{ transform: 'none' }} />
        </Grid>
      </Grid>
    ))}
  </>
);

const RepositorySelect: FC<{
  setSearch(search: boolean): void;
  repository: string;
  setRepository(repository: string): void;
  setBranch(branch: string): void;
}> = ({ repository, setRepository, setBranch, setSearch }) => {
  const [repositories, setRepositories] = useState<string[]>([]);
  const [loading, setLoading] = useState<number>(0);

  const handleRepositoryChange = async (
    _: SyntheticEvent,
    repository: string
  ): Promise<void> => {
    setLoading((prev): number => prev + 1);
    try {
      setRepository(repository);
      setBranch('');
      setSearch(repositories.includes(repository));
    } catch (e) {
      toast.error(`${e}`);
    } finally {
      setLoading((prev): number => prev - 1);
    }
  };

  useEffect(() => {
    setLoading((prev): number => prev + 1);
    github
      .loadRepositories()
      .then((repos) => setRepositories(repos.map(({ fullName }) => fullName)))
      .finally(() => setLoading((prev): number => prev - 1));
  }, []);

  if (loading > 0)
    return (
      <Grid item xs={4}>
        <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
      </Grid>
    );

  return (
    <Grid item xs={4}>
      <Autocomplete
        color="primary"
        inputValue={repository}
        onInputChange={handleRepositoryChange}
        disablePortal
        options={repositories}
        renderInput={(params): ReactNode => (
          <TextField {...params} label="Repositório" size="small" />
        )}
      />
    </Grid>
  );
};

const BranchSelect: FC<{
  search: boolean;
  repository: string;
  branchName: string;
  setBranch(branch: string): void;
}> = ({ repository, branchName, setBranch, search }) => {
  const [loading, setLoading] = useState(0);
  const [branches, setBranches] = useState<string[]>([]);

  const handleBranchChange = async (
    _: SyntheticEvent,
    newValue: string
  ): Promise<void> => {
    try {
      setBranch(newValue);
    } catch (e) {
      toast.error(`${e}`);
    }
  };

  useEffect(() => {
    if (!search || !repository) return setBranches([]);

    setLoading((prev): number => prev + 1);
    github
      .loadBranches(repository)
      .then((s) => setBranches(s.map(({ name }) => name)))
      .finally(() => setLoading((prev): number => prev - 1));
  }, [repository, search]);

  if (loading > 0)
    return (
      <Grid item xs={3}>
        <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
      </Grid>
    );

  return (
    <Grid item xs={3}>
      <Autocomplete
        color="primary"
        inputValue={branchName}
        onInputChange={handleBranchChange}
        disablePortal
        options={branches}
        renderInput={(params): ReactNode => (
          <TextField {...params} label="Branch" size="small" />
        )}
      />
    </Grid>
  );
};

type ProjectInput = Omit<TimesheetProject.Input, 'repository'>;

const ProjectSelect: FC<{
  project: ProjectInput;
  setProject(project: ProjectInput): void;
}> = ({ project, setProject }) => {
  const { loading, clients } = useTimesheetStore();

  const options: ProjectInput[] = useMemo(() => {
    const aux: ProjectInput[] = [];

    clients.forEach(({ id, title, projects }) =>
      projects.forEach(({ id: code, name }) =>
        aux.push({
          client: { code: +id, name: title },
          project: { code, name },
        })
      )
    );

    return aux;
  }, [clients]);

  const handleProjectChange = async (
    _: SyntheticEvent,
    name: string
  ): Promise<void> => {
    const p = options.find((o) => o.project.name === name);

    if (p) setProject(p);
  };

  useEffect(() => void timesheetClient.getAll(), []);

  if (loading && clients.length === 0)
    return (
      <Grid item xs={4}>
        <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
      </Grid>
    );

  return (
    <Grid item xs={4}>
      <Autocomplete
        color="primary"
        disableClearable
        inputValue={project?.project.name}
        onInputChange={handleProjectChange}
        disablePortal
        options={options}
        groupBy={(option): string => option.client.name}
        getOptionLabel={(option): string => option.project.name}
        isOptionEqualToValue={(option, value): boolean =>
          option.project.name === value.project.name
        }
        renderInput={(params): ReactNode => (
          <TextField {...params} label="Projeto" size="small" />
        )}
        renderGroup={(params): ReactElement => (
          <li key={params.key}>
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                padding: '4px 8px',
                flex: 1,
              }}
            >
              <Typography variant="overline" style={{ lineHeight: 0 }}>
                {params.group}
              </Typography>
            </div>
            <Typography>{params.children}</Typography>
          </li>
        )}
      />
    </Grid>
  );
};

const Form: FC<{ reload(): void }> = ({ reload }) => {
  const [loading, setLoading] = useState(false);
  const [searchBranch, setSearchBranch] = useState(false);
  const [fullName, setFullName] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');
  const [project, setProject] = useState<ProjectInput>({
    client: { code: 0, name: '' },
    project: { code: 0, name: '' },
  });

  const handleCreate = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!project) return;
      await githubRepository.set({ fullName });
      await githubBranch.set({ repository: fullName, name: branchName });
      await timesheetProject.set({ repository: fullName, ...project });

      reload();
      setBranchName('');
      setFullName('');
      setProject({
        client: { code: 0, name: '' },
        project: { code: 0, name: '' },
      });
    } catch (e) {
      toast.error(`Falha ao adicionar repositório: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Grid item xs={12} container spacing={1}>
        <Grid item xs={4}>
          <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
        </Grid>
        <Grid item xs={3}>
          <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
        </Grid>
        <Grid item xs={4}>
          <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
        </Grid>
        <Grid item xs={1}>
          <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
        </Grid>
      </Grid>
    );

  return (
    <Grid item xs={12} container spacing={1}>
      <RepositorySelect
        setSearch={setSearchBranch}
        repository={fullName}
        setRepository={setFullName}
        setBranch={setBranchName}
      />
      <BranchSelect
        search={searchBranch}
        repository={fullName}
        branchName={branchName}
        setBranch={setBranchName}
      />
      <ProjectSelect project={project} setProject={setProject} />
      <Grid item xs={1}>
        <IconButton
          style={{
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 4,
            paddingTop: 7,
            paddingBottom: 7,
          }}
          aria-label="Adicionar repositório"
          onClick={handleCreate}
          disabled={!(fullName && branchName && project.project.code !== 0)}
        >
          <AddIcon color="disabled" />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export const RepositoryConfigurations: FC = () => {
  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState<GithubRepository.Row[]>([]);

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);

    const repos = await githubRepository.getAll();

    setRepositories(repos);

    setLoading(false);
  }, []);

  useEffect(() => void reload(), [reload]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" component="h2">
          Repositórios e Projetos
        </Typography>
      </Grid>
      <Grid item xs={12} container spacing={1} alignItems="center">
        {loading ? (
          <ListSkeleton length={repositories.length} />
        ) : (
          <List repositories={repositories || []} reload={reload} />
        )}
        {repositories.length > 0 && <Grid item xs={12} py={1} />}
        <Form reload={reload} />
      </Grid>
    </Grid>
  );
};

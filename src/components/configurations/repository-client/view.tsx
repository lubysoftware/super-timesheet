import {
  FC,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useEffect,
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
import { User } from '@/store/user/types';

const List: FC<{
  user: User;
  repositories: GithubRepository.Row[];
  reload(): void;
}> = ({ repositories, reload, user }) => {
  const handleDelete = async (fullName: string): Promise<void> => {
    try {
      await githubRepository.delete(user, fullName);
      await reload();
    } catch (e) {
      toast.error(`Falha ao deleter um repositório: ${e}`);
    }
  };

  return (
    <>
      {repositories.map((repo, idx) => (
        <Grid item xs={12} container spacing={1} key={idx}>
          <Grid item xs={7}>
            <TextField
              label="Repositório"
              size="small"
              value={repo.fullName}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Branch"
              size="small"
              value={repo.branch?.name}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={1}>
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
        <Grid item xs={7}>
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
  user: User;
  setSearch(search: boolean): void;
  repository: string;
  setRepository(repository: string): void;
  setBranch(branch: string): void;
}> = ({ user, repository, setRepository, setBranch, setSearch }) => {
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
      .loadRepositories(user)
      .then((repos) => setRepositories(repos.map(({ fullName }) => fullName)))
      .finally(() => setLoading((prev): number => prev - 1));
  }, [user]);

  if (loading > 0)
    return (
      <Grid item xs={7}>
        <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
      </Grid>
    );

  return (
    <Grid item xs={7}>
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
  user: User;
  search: boolean;
  repository: string;
  branchName: string;
  setBranch(branch: string): void;
}> = ({ user, repository, branchName, setBranch, search }) => {
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
      .loadBranches(user, repository)
      .then((s) => setBranches(s.map(({ name }) => name)))
      .finally(() => setLoading((prev): number => prev - 1));
  }, [repository, search, user]);

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

const Form: FC<{ user: User; reload(): void }> = ({ user, reload }) => {
  const [searchBranch, setSearchBranch] = useState(false);
  const [fullName, setFullName] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');

  const handleCreate = async (): Promise<void> => {
    try {
      await githubRepository.set(user, { fullName });
      await githubBranch.set(user, { repository: fullName, name: branchName });

      reload();
      setBranchName('');
      setFullName('');
    } catch (e) {
      toast.error(`Falha ao adicionar repositório: ${e}`);
    }
  };

  return (
    <Grid item xs={12} container spacing={1}>
      <RepositorySelect
        user={user}
        setSearch={setSearchBranch}
        repository={fullName}
        setRepository={setFullName}
        setBranch={setBranchName}
      />
      <BranchSelect
        user={user}
        search={searchBranch}
        repository={fullName}
        branchName={branchName}
        setBranch={setBranchName}
      />
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
          disabled={!(fullName && branchName)}
        >
          <AddIcon color="disabled" />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export const RepositoryConfigurations: FC<{ user: User }> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState<GithubRepository.Row[]>([]);

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);

    const repos = await githubRepository.getAll(user);

    setRepositories(repos);

    setLoading(false);
  }, [user]);

  useEffect(() => void reload(), [reload]);

  return (
    <Grid container spacing={1} px={8} alignItems="center">
      <Grid
        item
        xs={3}
        style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}
        paddingRight={2}
      >
        <Typography variant="h5" component="h2" textAlign="right">
          Repositórios e Projetos
        </Typography>
      </Grid>
      <Grid item xs={9} container spacing={1} alignItems="center">
        {loading ? (
          <ListSkeleton length={repositories.length} />
        ) : (
          <List user={user} repositories={repositories || []} reload={reload} />
        )}
        {repositories.length > 0 && <Grid item xs={12} py={1} />}
        <Form user={user} reload={reload} />
      </Grid>
    </Grid>
  );
};

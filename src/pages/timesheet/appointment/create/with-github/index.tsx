import { useEffect, useState } from 'react';
import * as React from 'react';
import { toast } from 'react-toastify';

import { NextPage } from 'next';

import { ArrowBack } from '@mui/icons-material';
import { Button, Collapse, Grid } from '@mui/material';

import Loading from '@/components/loading';
import { CommitsSearch } from '@/components/timesheet/appointment/create/with-github/commits-search';
import { GroupedList } from '@/components/timesheet/appointment/create/with-github/grouped-list';
import { GroupedListSkeleton } from '@/components/timesheet/appointment/create/with-github/grouped-list.skeleton';
import useAuthVerify from '@/hooks/use-auth-verify';
import { githubCommit } from '@/services/github/github-commit/service';
import { GithubCommit } from '@/services/github/github-commit/types';
import { TimesheetAppointment } from '@/services/timesheet/timesheet-appointment/types';
import useUiStore from '@/store/ui/store';
import { Load } from '@/store/ui/types';
import { RouteTypes } from '@/utils/routes';

const GithubCommitsLoadPage: NextPage = () => {
  const pass = useAuthVerify(RouteTypes.Private);

  const { disableLoad } = useUiStore();

  const [searching, setSearching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [commits, setCommits] = useState<
    TimesheetAppointment.Schema['appointments']
  >([]);

  const reload = async (input: GithubCommit.Input): Promise<void> => {
    setLoading(true);

    const groups = await githubCommit.loadAppointments(input);

    if (groups.length > 0) {
      setSearching(false);
      setCommits(groups);
    } else {
      toast.warn('Não há resultado para essa busca!');
    }

    setLoading(false);
  };

  const handleSearchAgain = (): void => setSearching(true);

  useEffect(() => disableLoad(Load.RedirectToGithubCommitsLoad), [disableLoad]);

  if (!pass) return <Loading />;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Collapse in={searching}>
          <CommitsSearch load={reload} />
        </Collapse>
        <Collapse in={!searching}>
          <Button onClick={handleSearchAgain} startIcon={<ArrowBack />}>
            Pesquisar novamente
          </Button>
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        {loading ? <GroupedListSkeleton /> : <GroupedList result={commits} />}
      </Grid>
    </Grid>
  );
};

export default GithubCommitsLoadPage;

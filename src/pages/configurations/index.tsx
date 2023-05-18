import { useEffect } from 'react';
import * as React from 'react';

import { NextPage } from 'next';

import { Grid, Typography } from '@mui/material';

import { SetGithubTokenView } from '@/components/configurations/github-token/view';
import { RepositoryConfigurations } from '@/components/configurations/repository-client/view';
import { SetTimesheetInfosView } from '@/components/configurations/timesheet-infos/view';
import Loading from '@/components/loading';
import useAuthVerify from '@/hooks/use-auth-verify';
import useUiStore from '@/store/ui/store';
import { Load } from '@/store/ui/types';
import useUserStore from '@/store/user/store';
import { RouteTypes } from '@/utils/routes';

const ConfigurationsPage: NextPage = () => {
  const { user } = useUserStore();
  const pass = useAuthVerify(RouteTypes.Private);

  const { disableLoad } = useUiStore();

  useEffect(() => disableLoad(Load.RedirectToConfigurations), [disableLoad]);

  if (!pass || !user) return <Loading />;

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h3" component="h1" textAlign="center">
          Configurações
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <SetGithubTokenView />
      </Grid>
      <Grid item xs={12}>
        <SetTimesheetInfosView />
      </Grid>
      <Grid item xs={12}>
        <RepositoryConfigurations />
      </Grid>
    </Grid>
  );
};

export default ConfigurationsPage;

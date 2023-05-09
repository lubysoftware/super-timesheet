import { useEffect } from 'react';
import * as React from 'react';

import { NextPage } from 'next';

import { Grid, Typography } from '@mui/material';

import Loading from '@/components/loading';
import useAuthVerify from '@/hooks/use-auth-verify';
import useUiStore from '@/store/ui/store';
import { Load } from '@/store/ui/types';
import { RouteTypes } from '@/utils/routes';

const ConfigurationsPage: NextPage = () => {
  const pass = useAuthVerify(RouteTypes.Private);

  const { disableLoad } = useUiStore();

  useEffect(() => disableLoad(Load.RedirectToConfigurations), [disableLoad]);

  if (!pass) return <Loading />;

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h3" component="h1" textAlign="center">
          Configurações
        </Typography>
      </Grid>
    </Grid>
  );
};

export default ConfigurationsPage;

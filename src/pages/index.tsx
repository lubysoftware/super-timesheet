import { useEffect } from 'react';

import { NextPage } from 'next';

import { GitHub as GitHubIcon } from '@mui/icons-material';
import { Button, Grid, Typography } from '@mui/material';

import Loading from '@/components/loading';
import { supabase } from '@/config/supabase';
import useAuthVerify from '@/hooks/use-auth-verify';
import useUiStore from '@/store/ui/store';
import { Load } from '@/store/ui/types';
import { RouteTypes } from '@/utils/routes';

const Home: NextPage = () => {
  const pass = useAuthVerify(RouteTypes.Protected);

  const { enableLoad, disableLoad } = useUiStore();

  const handleSignIn = async (): Promise<void> => {
    enableLoad(Load.RedirectToConfigurations);

    await supabase.auth.signInWithOAuth({ provider: 'github' });
  };

  useEffect(() => disableLoad(Load.RedirectToLogin), [disableLoad]);

  if (!pass) return <Loading />;

  return (
    <Grid container justifyContent="center" gap={2}>
      <Grid item xs={12}>
        <Typography variant="h4" component="h1" textAlign="center">
          Bem-vindo ao Super Timesheet
        </Typography>
        <br />
        <Typography component="p" textAlign="center">
          Antes de tudo, faça login para continuar:
        </Typography>
        <br />
      </Grid>
      <Grid item xs={4}>
        <Button
          variant="outlined"
          startIcon={<GitHubIcon />}
          onClick={handleSignIn}
          size="large"
          fullWidth
        >
          Login com o GitHub
        </Button>
      </Grid>
    </Grid>
  );
};

export default Home;

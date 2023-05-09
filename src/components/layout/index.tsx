import { FC, PropsWithChildren, useEffect } from 'react';

import { Grid } from '@mui/material';

import LeftBar from '@/components/layout/left-bar';
import TopBar from '@/components/layout/top-bar';
import Loading from '@/components/loading';
import { supabase } from '@/config/supabase';
import useUiStore from '@/store/ui/store';
import useUserStore from '@/store/user/store';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { loading } = useUiStore();
  const { user, setUser, wipeUser } = useUserStore();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser({
          avatar: session.user.user_metadata.avatar_url,
          name: session.user.user_metadata.name,
          email: session.user.user_metadata.email,
          token: session.access_token,
        });
      } else {
        wipeUser();
      }
    });
  }, [setUser, wipeUser]);

  return (
    <>
      <TopBar />
      <Grid
        container
        justifyContent="center"
        alignItems={user ? 'stretch' : 'center'}
        flex={1}
      >
        <LeftBar />
        <Grid item xs={9} p={2}>
          {children}
        </Grid>
      </Grid>
      {loading.length > 0 && <Loading />}
    </>
  );
};

export default Layout;

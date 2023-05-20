import { FC, useEffect, useState } from 'react';
import * as React from 'react';

import { NextPage } from 'next';

import { Box, Grid, Paper, Skeleton } from '@mui/material';

import styled from '@emotion/styled';

import Loading from '@/components/loading';
import { CommitsSearch } from '@/components/timesheet/appointment/create/with-github/commits-search';
import { GroupedList } from '@/components/timesheet/appointment/create/with-github/grouped-list';
import useAuthVerify from '@/hooks/use-auth-verify';
import { githubCommit } from '@/services/github/github-commit/service';
import { GithubCommit } from '@/services/github/github-commit/types';
import useUiStore from '@/store/ui/store';
import { Load } from '@/store/ui/types';
import { RouteTypes } from '@/utils/routes';

const Container = styled(Box)`
  display: flex;
  gap: 1rem;
`;

const GroupedListSkeleton: FC<{ length?: number }> = ({ length }) => (
  <Grid container spacing={1} alignContent="center">
    {[...new Array(length || 3)].map((_, i) => (
      <Grid item xs={12} key={i}>
        <Grid item xs={12} container component={Paper} p={0.5}>
          <Grid item xs={4} p={0.5}>
            <Skeleton height={40} sx={{ transform: 'none' }} />
          </Grid>
          <Grid item xs={4} p={0.5}>
            <Skeleton height={40} sx={{ transform: 'none' }} />
          </Grid>
          <Grid item xs={4} p={0.5}>
            <Skeleton height={40} sx={{ transform: 'none' }} />
          </Grid>
          <Grid item xs={12} p={0.5}>
            <Skeleton height={128} sx={{ transform: 'none' }} />
          </Grid>
        </Grid>
      </Grid>
    ))}
  </Grid>
);

const GithubCommitsLoadPage: NextPage = () => {
  const pass = useAuthVerify(RouteTypes.Private);

  const { disableLoad } = useUiStore();

  const [loading, setLoading] = useState(false);
  const [commits, setCommits] = useState<
    GithubCommit.GithubCommitDayTimeGroup[]
  >([]);

  const reload = async (input: GithubCommit.Input): Promise<void> => {
    setLoading(true);

    const groups = await githubCommit.groupedLoad(input);

    setCommits(groups);
    setLoading(false);
  };

  useEffect(() => disableLoad(Load.RedirectToGithubCommitsLoad), [disableLoad]);

  if (!pass) return <Loading />;

  return (
    <Container>
      <CommitsSearch load={reload} />
      {loading ? <GroupedListSkeleton /> : <GroupedList result={commits} />}
    </Container>
  );
};

export default GithubCommitsLoadPage;

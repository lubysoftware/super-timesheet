import { FC } from 'react';
import * as React from 'react';

import { Grid, Paper, Skeleton } from '@mui/material';

export const GroupedListSkeleton: FC<{ length?: number }> = ({ length }) => (
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

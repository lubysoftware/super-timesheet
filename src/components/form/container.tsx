import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { Grid } from '@mui/material';

import { FormTypes } from '@/components/form/types';

export const Container: FC<FormTypes.Container> = (props) => {
  const { handleSubmit } = useFormContext();

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      flex={1}
      item
      xs={12}
    >
      <Grid item xs={props.xs || 6}>
        <Grid
          container
          component="form"
          justifyContent={props.justifyContent || 'flex-end'}
          spacing={props.spacing || 4}
          onSubmit={handleSubmit(props.onSubmit)}
        >
          {props.children}
        </Grid>
      </Grid>
    </Grid>
  );
};

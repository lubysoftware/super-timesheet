import { FC, ReactElement, ReactNode, useMemo } from 'react';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import {
  Autocomplete,
  FormControlLabel,
  FormGroup,
  Grid,
  Switch,
  TextField,
} from '@mui/material';

import { FormTypes } from '@/components/form/types';

const Element: FC<FormTypes.Input> = (props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = useMemo(() => {
    if (props.name.includes('.')) {
      const [object, index, name] = props.name.split('.');

      if (errors[object]) {
        const eObject = errors[object] as unknown as Record<
          string,
          Record<string, unknown>
        >[];

        if (eObject[+index] && eObject[+index][name]) {
          return eObject[+index][name];
        }
      }

      return undefined;
    } else {
      return errors[props.name];
    }
  }, [errors, props.name]);

  if (props.type === 'select') {
    return (
      <Controller
        name={props.name}
        control={props.control}
        defaultValue={null}
        render={({ field: { onChange, value } }): ReactElement => (
          <Autocomplete
            color="primary"
            options={props.options || []}
            getOptionLabel={(option): string => option.label}
            value={value}
            isOptionEqualToValue={(option, value): boolean =>
              option.value === value.value
            }
            onChange={(event, newValue): void => onChange(newValue)}
            renderInput={(params): ReactNode => (
              <TextField
                {...props}
                {...params}
                fullWidth
                error={!!error}
                helperText={error && `${error?.message}`}
                size="small"
              />
            )}
          />
        )}
      />
    );
  }

  if (props.boolean) {
    return (
      <FormGroup>
        <FormControlLabel
          label={props.label}
          control={<Switch {...register(props.name)} />}
        />
      </FormGroup>
    );
  }

  return (
    <TextField
      {...props}
      fullWidth
      {...register(props.name)}
      error={!!error}
      helperText={error && `${error?.message}`}
    />
  );
};

export const Input: FC<FormTypes.Input> = ({ xs, ...props }) =>
  xs ? (
    <Grid item xs={xs}>
      <Element {...props} />
    </Grid>
  ) : (
    <>
      <Element {...props} />
    </>
  );

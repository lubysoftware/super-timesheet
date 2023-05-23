import { FC, useEffect } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { Remove as RemoveIcon } from '@mui/icons-material';
import { Button, Grid, IconButton, Paper, Typography } from '@mui/material';

import { Form } from '@/components/form';
import { githubCommit } from '@/services/github/github-commit/service';
import { GithubCommit } from '@/services/github/github-commit/types';
import useTimesheetStore from '@/store/timesheet/store';
import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

interface CommitsSearchProps {
  load(input: GithubCommit.Input): Promise<void>;
}

export const CommitsSearch: FC<CommitsSearchProps> = ({ load }) => {
  const { dayTimes, setDayTimes } = useTimesheetStore();

  const gitCommitReadForm = useForm<GithubCommit.Input>({
    resolver: zodResolver(githubCommit.schema),
  });

  const { fields, append, remove } = useFieldArray({
    name: 'dayTimes',
    control: gitCommitReadForm.control,
  });

  const handleAddDayTime = (): void => append({ start: '', end: '' });

  const handleSearch = async (
    data: z.infer<typeof githubCommit.schema>
  ): Promise<void> => {
    try {
      setDayTimes(data.dayTimes);
      await load({
        translate: data.translate,
        when: {
          since: `${data.since}T00:00:00Z`,
          until: `${data.until}T00:00:00Z`,
        },
        dayTimes: data.dayTimes,
      });
    } catch (e) {
      toast.error(`${e}`);
    }
  };

  useEffect(() => {
    remove();
    dayTimes.forEach(({ start, end }) => append({ start, end }));
  }, [append, dayTimes, remove]);

  return (
    <FormProvider {...gitCommitReadForm}>
      <Form.Container spacing={1} xs={12} onSubmit={handleSearch}>
        <Grid item xs={12} mb={2}>
          <Typography variant="h4" component="h1" textAlign="center">
            Carregar Commits
          </Typography>
        </Grid>
        <Grid item xs={6} container spacing={1}>
          <Form.Input
            label="Desde"
            name="since"
            type="date"
            InputLabelProps={{ shrink: true }}
            xs={12}
          />
          <Form.Input
            label="Até"
            name="until"
            type="date"
            InputLabelProps={{ shrink: true }}
            xs={12}
          />
          <Form.Input
            label="Traduzir"
            name="translate"
            boolean
            defaultValue={false}
            xs={12}
          />
        </Grid>
        <Grid item xs={6}>
          <Paper style={{ padding: '1rem' }}>
            <Grid
              container
              spacing={1}
              justifyContent="space-between"
              alignItems="center"
            >
              <Grid item>
                <Typography>Horários</Typography>
              </Grid>
              <Grid item>
                <Button onClick={handleAddDayTime}>Adicionar</Button>
              </Grid>
              {fields.map((field, index) => (
                <Grid item xs={12} container spacing={1} key={field.id}>
                  <Form.Input
                    label="Inicial"
                    name={`dayTimes.${index}.start`}
                    type="time"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    xs={5}
                  />
                  <Form.Input
                    label="Final"
                    name={`dayTimes.${index}.end`}
                    type="time"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    xs={5}
                  />
                  <Grid item xs={2}>
                    <IconButton
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: 4,
                        paddingTop: 7,
                        paddingBottom: 7,
                      }}
                      aria-label="Remover horário"
                      onClick={remove.bind(null, index)}
                    >
                      <RemoveIcon color="disabled" />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Typography variant="caption" color="error">
                  {gitCommitReadForm.formState.errors.dayTimes?.message}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="outlined" fullWidth>
            Carregar
          </Button>
        </Grid>
      </Form.Container>
    </FormProvider>
  );
};

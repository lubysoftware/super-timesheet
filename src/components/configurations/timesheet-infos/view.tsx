import { FC, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { Sync as SyncIcon } from '@mui/icons-material';
import { Grid, IconButton, Skeleton, Typography } from '@mui/material';

import { Form } from '@/components/form';
import { timesheetInfos } from '@/services/timesheet/timesheet-infos/service';
import { TimesheetInfos } from '@/services/timesheet/timesheet-infos/types';
import { User } from '@/store/user/types';
import { zodResolver } from '@hookform/resolvers/zod';

export const SetTimesheetInfosView: FC<{ user: User }> = ({ user }) => {
  const [loading, setLoading] = useState<number>(0);

  const form = useForm<TimesheetInfos.Input>({
    resolver: zodResolver(timesheetInfos.schema),
  });

  const handleSave = async (formData: TimesheetInfos.Input): Promise<void> => {
    setLoading((prev): number => prev + 1);
    try {
      const response = await timesheetInfos.set(user, formData);

      if (response && response.length > 0) {
        toast.success('Autenticação salva com sucesso!');
      }
    } catch (e) {
      toast.error(`Erro ao salvar o autenticação: ${e}`);
    } finally {
      setLoading((prev): number => prev - 1);
    }
  };

  useEffect(() => {
    setLoading((prev): number => prev + 1);
    timesheetInfos
      .get(user)
      .then(
        (data) =>
          data && data.length > 0 && form.setValue('login', data[0].login)
      )
      .finally(() => setLoading((prev): number => prev - 1));
  }, [form, user]);

  return (
    <Grid container spacing={1} px={8}>
      <Grid
        item
        xs={3}
        style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}
        paddingRight={2}
      >
        <Typography variant="h5" component="h2" textAlign="right">
          Timesheet login
        </Typography>
      </Grid>
      <Grid item xs={9} container spacing={1}>
        {loading > 0 ? (
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={7}>
              <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
            </Grid>
            <Grid item xs={4}>
              <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
            </Grid>
            <Grid item xs={1}>
              <Skeleton width={42} height={40} sx={{ transform: 'none' }} />
            </Grid>
          </Grid>
        ) : (
          <FormProvider {...form}>
            <Grid
              container
              item
              xs={12}
              spacing={1}
              component="form"
              onSubmit={form.handleSubmit(handleSave)}
            >
              <Grid item xs={7}>
                <Form.Input
                  label="E-mail"
                  type="email"
                  name="login"
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <Form.Input
                  label="Senha"
                  type="password"
                  name="password"
                  size="small"
                />
              </Grid>
              <Grid item xs={1}>
                <IconButton
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 4,
                    paddingTop: 7,
                    paddingBottom: 7,
                  }}
                  aria-label="Salvar"
                  type="submit"
                >
                  <SyncIcon color="disabled" />
                </IconButton>
              </Grid>
            </Grid>
          </FormProvider>
        )}
      </Grid>
    </Grid>
  );
};

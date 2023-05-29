import * as React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { NextPage } from 'next';

import {
  Button,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import Loading from '@/components/loading';
import useAuthVerify from '@/hooks/use-auth-verify';
import { timesheetAppointment } from '@/services/timesheet/timesheet-appointment/service';
import { TimesheetAppointment } from '@/services/timesheet/timesheet-appointment/types';
import useUiStore from '@/store/ui/store';
import { Load } from '@/store/ui/types';
import { RouteTypes } from '@/utils/routes';

import { format, parseISO } from 'date-fns';

const ReadAppointments: NextPage = () => {
  const pass = useAuthVerify(RouteTypes.Private);

  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<TimesheetAppointment.Row[]>(
    []
  );

  const { disableLoad } = useUiStore();

  const reload = async (): Promise<void> => {
    setLoading(true);

    try {
      const res = await timesheetAppointment.search();

      setAppointments(res);
    } catch (e) {
      toast.error(`${e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => void reload(), []);

  useEffect(
    () => disableLoad(Load.RedirectToTimesheetAppointmentRead),
    [disableLoad]
  );

  if (!pass) return <Loading />;

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h4" component="h1" mb={2}>
          Ver apontamentos
        </Typography>
      </Grid>
      <Grid item xs={10}>
        <TextField
          disabled
          type="month"
          size="small"
          value={format(new Date(), 'yyyy-MM')}
          fullWidth
        />
      </Grid>
      <Grid item xs={2}>
        <Button
          onClick={reload}
          variant="outlined"
          style={{ height: '100%' }}
          fullWidth
        >
          Pesquisar
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      {appointments.map((a, i) => (
        <Grid item xs={12} key={i}>
          <Paper style={{ padding: 1 }}>
            <p>
              <b>Projeto</b>: {a.project} - <b>Categoria</b>: {a.category}
            </p>
            <p>
              <b>Dia</b> {format(parseISO(a.date), 'dd/MM/yyyy')}, <b>das</b>{' '}
              {a.startTime} <b>até</b> {a.endTime}
            </p>
            <p>
              <b>Descrição</b>: {a.description}
            </p>
            {a.notMonetize && (
              <p>
                <b>Não monetizado!</b>
              </p>
            )}
          </Paper>
        </Grid>
      ))}
      {loading && <Loading />}
    </Grid>
  );
};

export default ReadAppointments;

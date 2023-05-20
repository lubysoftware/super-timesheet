import { FC, useMemo, useState } from 'react';
import * as React from 'react';
import { FieldArrayWithId, useFormContext } from 'react-hook-form';

import {
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';

import { Form } from '@/components/form';
import { TimesheetAppointment } from '@/services/timesheet/timesheet-appointment/types';
import useTimesheetStore from '@/store/timesheet/store';

import { transparentize } from 'polished';

interface AppointmentFormProps {
  field: FieldArrayWithId<TimesheetAppointment.Schema, 'appointments'>;
  index: number;
  add(
    position: number,
    value: TimesheetAppointment.Schema['appointments']
  ): void;
  remove(index?: number | number[]): void;
}

export const AppointmentForm: FC<AppointmentFormProps> = ({
  field,
  index,
  add,
  remove,
}) => {
  const { palette } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<TimesheetAppointment.Schema>();

  const { clients } = useTimesheetStore();

  const selectedClient = watch(`appointments.${index}.client`);
  const client = useMemo(() => {
    if (!selectedClient) {
      setValue(`appointments.${index}.project`, undefined);
      setValue(`appointments.${index}.category`, undefined);

      return undefined;
    }

    const the = clients.find(({ title }) => title === selectedClient.label);

    if (!the) return undefined;

    if (!the.projects.find(({ id }) => String(id) === field.project?.value)) {
      setValue(`appointments.${index}.project`, undefined);
    }

    return the;
  }, [clients, field.project?.value, index, selectedClient, setValue]);
  const clientOptions = useMemo(
    () => clients.map(({ id, title }) => ({ value: id, label: title })),
    [clients]
  );

  const selectedProject = watch(`appointments.${index}.project`);
  const project = useMemo(() => {
    if (!selectedProject) {
      setValue(`appointments.${index}.category`, undefined);

      return undefined;
    }

    const the = client?.projects.find(
      ({ name }) => name === selectedProject.label
    );

    if (!the) return undefined;

    if (
      !the.categories.find(({ id }) => String(id) === field.category?.value)
    ) {
      setValue(`appointments.${index}.category`, undefined);
    }

    return the;
  }, [
    client?.projects,
    field.category?.value,
    index,
    selectedProject,
    setValue,
  ]);
  const projectOptions = useMemo(
    () =>
      client?.projects.map(({ id, name }) => ({
        value: String(id),
        label: name,
      })) || [],
    [client?.projects]
  );
  const categoryOptions = useMemo(
    () =>
      project?.categories.map(({ id, name }) => ({
        value: String(id),
        label: name,
      })) || [],
    [project?.categories]
  );

  const handleAdd = (): void => {
    add(index + 1, [
      {
        client: { label: '', value: '' },
        project: { label: '', value: '' },
        category: { label: '', value: '' },
        date: field.date,
        start: '00:00',
        end: '00:01',
        description: '',
      },
    ]);
  };

  const openDialog = (): void => setDialogOpen(true);

  const handleRemove = (): void => {
    remove(index);
    closeDialog();
  };

  const closeDialog = (): void => setDialogOpen(false);

  return (
    <Grid item xs={12} key={field.id}>
      <Card
        style={{
          backgroundColor: transparentize(
            errors.appointments &&
              errors.appointments[index] &&
              errors.appointments[index]?.message
              ? 0.6
              : 1,
            palette.error.dark
          ),
        }}
      >
        <CardContent style={{ paddingBottom: 0 }}>
          <Grid container alignItems="center" spacing={1}>
            <Form.Input
              label="Cliente"
              name={`appointments.${index}.client`}
              type="select"
              options={clientOptions}
              size="small"
              xs={4}
            />
            <Form.Input
              label="Projeto"
              name={`appointments.${index}.project`}
              type="select"
              options={projectOptions}
              size="small"
              xs={4}
            />
            <Form.Input
              label="Categoria"
              name={`appointments.${index}.category`}
              type="select"
              options={categoryOptions}
              size="small"
              xs={4}
            />
            <Form.Input
              label="Data"
              name={`appointments.${index}.date`}
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              xs={4}
            />
            <Form.Input
              label="Horário inicial"
              name={`appointments.${index}.start`}
              type="time"
              size="small"
              InputLabelProps={{ shrink: true }}
              xs={4}
            />
            <Form.Input
              label="Horário final"
              name={`appointments.${index}.end`}
              type="time"
              size="small"
              InputLabelProps={{ shrink: true }}
              xs={4}
            />
            <Form.Input
              label="Descrição"
              name={`appointments.${index}.description`}
              multiline
              rows={6}
              xs={12}
            />
            {errors.appointments && errors.appointments[index] && (
              <Grid item xs={12}>
                <Typography variant="overline">
                  {errors.appointments[index]?.message}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
        <CardActions
          style={{
            justifyContent: 'space-between',
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          <Button color="warning" size="small" onClick={openDialog}>
            Remover esse apontamento
          </Button>
          <Button color="primary" size="small" onClick={handleAdd}>
            Adicionar outro apontamento
          </Button>
        </CardActions>
      </Card>
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Deseja mesmo remover esse apontamento?</DialogTitle>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button onClick={handleRemove} autoFocus>
            Apagar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

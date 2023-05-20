import { useEffect, useState } from 'react';
import * as React from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { NextPage } from 'next';

import { Box, Button, Divider, Grid, Typography } from '@mui/material';

import { Form } from '@/components/form';
import Loading from '@/components/loading';
import { AppointmentForm } from '@/components/timesheet/appointment/create/form';
import useAuthVerify from '@/hooks/use-auth-verify';
import { timesheetAppointment } from '@/services/timesheet/timesheet-appointment/service';
import { TimesheetAppointment } from '@/services/timesheet/timesheet-appointment/types';
import { timesheetClient } from '@/services/timesheet/timesheet-client/service';
import useTimesheetStore from '@/store/timesheet/store';
import useUiStore from '@/store/ui/store';
import { Load } from '@/store/ui/types';
import { RouteTypes } from '@/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';

const TimesheetAppointmentCreatePage: NextPage = () => {
  const pass = useAuthVerify(RouteTypes.Private);

  const [loading, setLoading] = useState(false);

  const { loading: clientsLoading, clients } = useTimesheetStore();
  const { disableLoad } = useUiStore();

  const appointmentForm = useForm<TimesheetAppointment.Schema>({
    resolver: zodResolver(timesheetAppointment.schema),
  });
  const { fields, append, insert, remove } = useFieldArray({
    name: 'appointments',
    control: appointmentForm.control,
  });

  const handleSubmit = async ({
    appointments,
  }: TimesheetAppointment.Schema): Promise<void> => {
    setLoading(true);
    try {
      const data = await timesheetAppointment.send({
        appointments: appointments.map((a) => ({
          client: `${a.client?.value}`,
          project: `${a.project?.value}`,
          category: `${a.category?.value}`,
          date: a.date,
          startTime: a.start,
          endTime: a.end,
          description: a.description,
        })),
      });

      const success: TimesheetAppointment.Output[] = [];
      const failure: TimesheetAppointment.Output[] = [];

      data.forEach((item) =>
        item.success ? success.push(item) : failure.push(item)
      );

      if (success.length > 0)
        toast.success(
          `${success.length} de ${data.length} apontamentos foram realizados com sucesso!`
        );
      if (failure.length > 0) {
        toast.error(
          `${failure.length} de ${data.length} apontamentos falharam ao ser realizados!`
        );

        remove();

        failure.map((item, index) => {
          const client = clients.find(({ id }) => String(id) === item.client);
          const project = client?.projects.find(
            ({ id }) => String(id) === item.project
          );
          const category = project?.categories.find(
            ({ id }) => String(id) === item.category
          );

          appointmentForm.setError(`appointments.${index}`, {
            message: item.errorMessage,
          });

          append({
            client: { label: `${client?.title}`, value: item.client },
            project: { label: `${project?.name}`, value: item.project },
            category: { label: `${category?.name}`, value: item.category },
            date: item.date,
            start: item.startTime,
            end: item.endTime,
            description: item.description,
          });
        });
      }
    } catch (e) {
      toast.error(`Falha realizar apontamentos: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBetween = (position: number): void =>
    insert(position, appointmentForm.getValues('appointments')[position - 1]);

  const handleRemove = (index: number): void =>
    fields.length > 1
      ? remove(index)
      : void toast.error('Você deve realizar pelo menos um apontamento');

  useEffect(() => {
    remove();

    const now = new Date();
    const iso = now.toLocaleDateString('pt-BR');
    const [day, month, year] = iso.split('/');
    const date = `${year}-${month}-${day}`;

    append({
      client: undefined,
      project: undefined,
      category: undefined,
      date,
      start: '00:00',
      end: '00:01',
      description: ``,
    });
  }, [append, remove]);

  useEffect(
    () => disableLoad(Load.RedirectToTimesheetAppointmentCreate),
    [disableLoad]
  );

  useEffect(() => void timesheetClient.getAll(), []);

  if (!pass) return <Loading />;

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={2}>
        Adicionar Apontamento
      </Typography>
      <FormProvider {...appointmentForm}>
        <Form.Container spacing={1} xs={12} onSubmit={handleSubmit}>
          {fields.map((field, index) => (
            <AppointmentForm
              field={field}
              index={index}
              add={handleAddBetween}
              remove={handleRemove}
              key={field.id}
            />
          ))}
          <Grid item xs={12} mt={2}>
            <Divider />
          </Grid>
          {fields.length > 0 && (
            <Grid item xs={12}>
              <Button type="submit" variant="outlined" fullWidth>
                Enviar apontamentos
              </Button>
            </Grid>
          )}
        </Form.Container>
      </FormProvider>
      {loading && (
        <Loading
          texts={[
            'Seus apontamentos estão sendo enviados',
            'Isso pode demorar um pouco',
            'Já já termina, tenha fé',
          ]}
        />
      )}
      {clients.length === 0 && clientsLoading && (
        <Loading
          texts={[
            'Carregando clientes',
            'Carregando projetos',
            'Carregando categorias',
          ]}
        />
      )}
    </Box>
  );
};

export default TimesheetAppointmentCreatePage;

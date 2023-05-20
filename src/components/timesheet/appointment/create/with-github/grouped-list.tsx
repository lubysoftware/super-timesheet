import { FC, useEffect, useState } from 'react';
import * as React from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { Button, Grid } from '@mui/material';

import styled from '@emotion/styled';

import { Form } from '@/components/form';
import Loading from '@/components/loading';
import { AppointmentForm } from '@/components/timesheet/appointment/create/form';
import { GithubCommit } from '@/services/github/github-commit/types';
import { timesheetAppointment } from '@/services/timesheet/timesheet-appointment/service';
import { TimesheetAppointment } from '@/services/timesheet/timesheet-appointment/types';
import useTimesheetStore from '@/store/timesheet/store';
import { zodResolver } from '@hookform/resolvers/zod';

const AppointmentListContainer = styled.div`
  display: flex;
  flex: 2;

  @media (min-width: ${({ theme }): number => theme.breakpoints.values.xl}px) {
    flex: 4;
  }
`;

export const GroupedList: FC<{
  result: GithubCommit.GithubCommitDayTimeGroup[];
}> = ({ result }) => {
  const [loading, setLoading] = useState(false);

  const { clients } = useTimesheetStore();

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

  const handleAddBetween = (
    position: number,
    value: TimesheetAppointment.Schema['appointments']
  ): void => insert(position, value);

  const handleRemove = (index: number): void =>
    fields.length > 1
      ? remove(index)
      : void toast.error('Você deve realizar pelo menos um apontamento');

  useEffect(() => {
    remove();

    result.forEach((item) =>
      item.commits.forEach((commit) =>
        append({
          client: undefined,
          project: undefined,
          category: undefined,
          date: item.date,
          start: commit.startTime,
          end: commit.endTime,
          description: `${commit.items
            .map(
              (item) =>
                `Em "${item.repo}":\n` +
                item.commits
                  .map(
                    (subCommits, sci, { length }) =>
                      `- ${subCommits.description} (${subCommits.commit})${
                        length - 1 === sci ? '.' : ';'
                      }`
                  )
                  .join('\n')
            )
            .join('\n\n')}`,
        })
      )
    );
  }, [append, clients, result, remove]);

  return (
    <>
      <AppointmentListContainer>
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
            {fields.length > 0 && (
              <Grid item xs={12}>
                <Button type="submit" variant="outlined" fullWidth>
                  Enviar apontamentos
                </Button>
              </Grid>
            )}
          </Form.Container>
        </FormProvider>
      </AppointmentListContainer>
      {loading && (
        <Loading
          texts={[
            'Seus apontamentos estão sendo enviados',
            'Isso pode demorar um pouco',
            'Já já termina, tenha fé',
          ]}
        />
      )}
    </>
  );
};

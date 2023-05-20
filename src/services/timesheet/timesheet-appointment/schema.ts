import { z } from 'zod';

const refineObject = (
  data?: { value: string; label: string } | null
): boolean =>
  !(
    data === null ||
    data === undefined ||
    data.value === undefined ||
    data.label === undefined
  );

export const appointmentSchema = z.object({
  appointments: z
    .array(
      z
        .object({
          client: z
            .object({ label: z.string(), value: z.string() })
            .nullable()
            .refine(refineObject, {
              message: 'Um cliente deve ser informado.',
            }),
          project: z
            .object({ label: z.string(), value: z.string() })
            .nullable()
            .refine(refineObject, {
              message: 'Um projeto deve ser informado.',
            }),
          category: z
            .object({ label: z.string(), value: z.string() })
            .nullable()
            .refine(refineObject, {
              message: 'Uma categoria deve ser informada.',
            }),
          date: z.string().nonempty('A data deve ser informada.'),
          start: z.string().nonempty('A horário inicial deve ser informada.'),
          end: z.string().nonempty('A horário final deve ser informada.'),
          description: z.string().nonempty('A descrição deve ser informada.'),
        })
        .refine(
          (data) => {
            const [year, month, day] = data.date.split('-');
            const date = new Date();

            date.setFullYear(Number(year), Number(month) - 1, Number(day));

            return date <= new Date();
          },
          {
            message: 'A data não deve ser maior que a atual.',
            path: ['date'],
          }
        )
        .refine(
          (data) => {
            const [year, month, day] = data.date.split('-');
            const [hours, minutes] = data.start.split(':');
            const date = new Date();

            date.setFullYear(Number(year), Number(month) - 1, Number(day));
            date.setHours(Number(hours), Number(minutes));

            return date < new Date();
          },
          {
            message: 'O horário inicial não deve ser maior ou igual ao atual.',
            path: ['start'],
          }
        )
        .refine(
          (data) => {
            const [year, month, day] = data.date.split('-');
            const [hours, minutes] = data.end.split(':');
            const date = new Date();

            date.setFullYear(Number(year), Number(month) - 1, Number(day));
            date.setHours(Number(hours), Number(minutes));

            return date <= new Date();
          },
          {
            message: 'O horário final não deve ser maior que o atual.',
            path: ['end'],
          }
        )
        .refine(
          (data) => {
            const start = Number(data.start.replace(':', ''));
            const end = Number(data.end.replace(':', ''));

            return start < end;
          },
          {
            message: 'O horário final deve ser maior que o inicial.',
            path: ['end'],
          }
        )
    )
    .min(1, 'Insira pelo menos 1 apontamento')
    .refine(
      (items): boolean => {
        const dates: Record<string, number[]> = {};

        const item = items.find((i, x) => {
          const s = `${i.date}T${i.start}`;

          if (dates[s]) {
            dates[s].push(x);

            return true;
          } else dates[s] = [x];

          const e = `${i.date}T${i.end}`;

          if (dates[e]) {
            dates[e].push(x);

            return true;
          } else dates[e] = [x];

          return false;
        });

        if (item) {
          const s = `${item.date}T${item.start}`;

          if (dates[s] && dates[s].length > 1) return false;

          const e = `${item.date}T${item.end}`;

          if (dates[e] && dates[e].length > 1) return false;
        }

        return true;
      },
      (items) => {
        const dates: Record<string, number[]> = {};

        const item = items.find((i, x) => {
          const s = `${i.date}T${i.start}`;

          if (dates[s]) {
            dates[s].push(x);

            return true;
          } else dates[s] = [x];

          const e = `${i.date}T${i.end}`;

          if (dates[e]) {
            dates[e].push(x);

            return true;
          } else dates[e] = [x];

          return false;
        });

        if (item) {
          const s = `${item.date}T${item.start}`;

          if (dates[s] && dates[s].length > 1) {
            return {
              message: `O horário não pode se repetir`,
              path: [dates[s][dates[s].length - 1] || 0, 'start'],
            };
          }

          const e = `${item.date}T${item.end}`;

          if (dates[e] && dates[e].length > 1) {
            return {
              message: `O horário não pode se repetir`,
              path: [dates[e][dates[e].length - 1] || 0, 'end'],
            };
          }
        }

        return { message: 'Sem repetições', path: [] };
      }
    ),
});

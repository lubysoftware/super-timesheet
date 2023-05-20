import { z } from 'zod';
export const gitCommitReadFormSchema = z
  .object({
    translate: z.boolean(),

    // when
    since: z
      .string()
      .refine(
        (value) =>
          z.string().datetime().safeParse(`${value}T00:00:00Z`).success,
        { message: `Formato de data inválido` }
      )
      .refine(
        (value) => {
          const now = new Date(new Date().toISOString().split('T')[0]);
          const since = new Date(value);

          return now > since;
        },
        { message: `A data não pode ser maior que a atual` }
      ),
    until: z
      .string()
      .refine(
        (value) =>
          z.string().datetime().safeParse(`${value}T00:00:00Z`).success,
        { message: `Formato de data inválido` }
      ),

    dayTimes: z
      .array(
        z.object({
          // Horário inicial do apontamento (no formato HH:MM).
          //   @IsMilitaryTime()
          start: z.string().nonempty('O horário inicial é obrigatório'),
          // Horário final do apontamento (no formato HH:MM).
          //   @IsMilitaryTime()
          end: z.string().nonempty('O horário final é obrigatório'),
        })
      )
      .min(1, 'Insira pelo menos 1 horário')
      .refine((times) => {
        const aux = times.map((time) => JSON.stringify(time));

        return aux.length === new Set(aux).size;
      }, 'Os horários não podem ser repetidos!'),
  })
  .refine(
    ({ since, until }) => {
      const [yearS, monthS, dayS] = since.split('-');
      const dateS = new Date();

      dateS.setFullYear(Number(yearS), Number(monthS) - 1, Number(dayS));

      const [yearU, monthU, dayU] = until.split('-');
      const dateU = new Date();

      dateU.setFullYear(Number(yearU), Number(monthU) - 1, Number(dayU));

      return dateS < dateU;
    },
    { message: 'A data final deve ser maior que a inicial!', path: ['until'] }
  );

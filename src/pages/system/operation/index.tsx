import { useEffect } from 'react';
import * as React from 'react';

import { NextPage } from 'next';

import { GitHub as GithubIcon, MoreTime as AddIcon } from '@mui/icons-material';
import { Badge, Card, CardContent, Grid, Typography } from '@mui/material';

import Loading from '@/components/loading';
import useAuthVerify from '@/hooks/use-auth-verify';
import useUiStore from '@/store/ui/store';
import { Load } from '@/store/ui/types';
import { RouteTypes } from '@/utils/routes';

const items = [
  {
    Icon: AddIcon,
    title: 'Incluir',
    texts: [
      'Essa página serve para realizar apontamentos, seja um só, seja em série. Após preencher seus apontamentos e clicar em enviar, seus apontamentos serão enviados ao timesheet oficial, um por um. Caso algum falhe, irá receber o mesmo de volta, junto com a respectiva mensagem de erro.',
    ],
  },
  {
    Icon: GithubIcon,
    title: 'Incluir com Github',
    texts: [
      'Essa página tem um funcionamento similar a de Incluir, mas antes ela possibilita que seja feita uma busca por commits no Github, assim os formatando e montando seus apontamentos.',
    ],
  },
];

const SystemOperationPage: NextPage = () => {
  const pass = useAuthVerify(RouteTypes.Private);

  const { disableLoad } = useUiStore();

  useEffect(() => disableLoad(Load.RedirectToSystemOperation), [disableLoad]);

  if (!pass) return <Loading />;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" component="h1" textAlign="center">
          Sobre o sistema
        </Typography>
      </Grid>
      {items.map(({ Icon, title, texts }) => (
        <Grid item xs={12} key={title}>
          <Card variant="outlined">
            <CardContent style={{ paddingBottom: 8 }}>
              <Typography variant="subtitle1" paragraph>
                <Badge color="primary" sx={{ marginTop: -0.5, marginRight: 1 }}>
                  <Icon color="inherit" />
                </Badge>
                {title}
              </Typography>
              {texts.map((text) => (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="justify"
                  paragraph
                  key={text}
                >
                  {text}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SystemOperationPage;

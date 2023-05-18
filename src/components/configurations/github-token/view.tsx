import { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  Sync as SyncIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import {
  Grid,
  IconButton,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { InputProps as StandardInputProps } from '@mui/material/Input/Input';

import { githubInfos } from '@/services/github/github-infos/service';

export const SetGithubTokenView: FC = () => {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChangeToken: StandardInputProps['onChange'] = (event) => {
    setToken(event.target.value);
  };

  const handleSave = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await githubInfos.set({ token });

      if (data && data.length > 0) {
        toast.success('O token foi atualizado com sucesso!');
      } else {
        toast.warn('Algo de errado aconteceu ao atualizar o token');
      }
    } catch (e) {
      toast.error(`Falha ao atualizar token: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    githubInfos
      .get()
      .then((data) => data && data.length > 0 && setToken(data[0].token))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Grid container spacing={1} px={8}>
      <Grid
        item
        xs={3}
        style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}
        paddingRight={2}
      >
        <Typography variant="h5" component="h2" textAlign="right">
          <Tooltip title="Insira aqui um 'Personal access tokens (classic)' que pode ser gerado clicando aqui">
            <IconButton
              aria-label="Salvar token"
              style={{ marginRight: 4, marginBottom: 4 }}
              size="small"
              href="https://github.com/settings/tokens/new?scopes=user,repo&description=the-helper"
              target="_blank"
            >
              <InfoIcon color="disabled" fontSize="small" />
            </IconButton>
          </Tooltip>
          Github Token
        </Typography>
      </Grid>
      <Grid item xs={9} container spacing={1}>
        <Grid item xs={12} container spacing={1}>
          <Grid item xs={11}>
            {loading ? (
              <Skeleton width="100%" height={40} sx={{ transform: 'none' }} />
            ) : (
              <TextField
                label="Token"
                size="small"
                onChange={handleChangeToken}
                value={token}
                fullWidth
              />
            )}
          </Grid>
          <Grid item xs={1}>
            <IconButton
              style={{
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 4,
                paddingTop: 7,
                paddingBottom: 7,
              }}
              aria-label="Salvar token"
              onClick={handleSave}
            >
              <SyncIcon color="disabled" />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

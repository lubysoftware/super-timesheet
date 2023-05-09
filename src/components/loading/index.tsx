import { FC, useCallback, useEffect, useState } from 'react';

import { Fade, Typography } from '@mui/material';

import Styles from '@/components/loading/styles';

interface LoadingProps {
  texts: string[];
  timeout?: number;
  transition?: number;
}

const WithText: FC<LoadingProps> = ({ texts, transition, timeout }) => {
  const [fade, setFade] = useState(true);
  const [current, setCurrent] = useState(0);

  const updateMessage = useCallback(
    (): NodeJS.Timeout =>
      setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          setCurrent(() => (current + 1) % texts.length);
          setFade(true);
        }, transition || 200);
      }, timeout || 3000),
    [current, texts.length, timeout, transition]
  );

  useEffect(() => {
    const timeout = updateMessage();

    return () => clearTimeout(timeout);
  }, [updateMessage]);

  return (
    <>
      <Styles.Container>
        <div id="clock" aria-label="Loading">
          <div id="hour-hand" />
          <div id="minute-hand" />
        </div>
        <div id="text">
          <Fade in={fade} unmountOnExit>
            <Typography variant="overline">{texts[current]}</Typography>
          </Fade>
        </div>
      </Styles.Container>
    </>
  );
};

const Loading: FC<LoadingProps> = ({ texts, timeout, transition }) => {
  if (!texts) {
    return (
      <Styles.Container>
        <div id="clock" aria-label="Loading">
          <div id="hour-hand" />
          <div id="minute-hand" />
        </div>
      </Styles.Container>
    );
  }

  return <WithText texts={texts} timeout={timeout} transition={transition} />;
};

export default Loading;

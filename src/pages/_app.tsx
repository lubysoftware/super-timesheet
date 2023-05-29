import { ToastContainer } from 'react-toastify';

import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import Layout from '@/components/layout';
import StyleWrapper from '@/components/style-wrapper';

import 'react-toastify/dist/ReactToastify.css';

const App: NextPage<AppProps> = ({ Component, pageProps }) => (
  <>
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <title>Super Timesheet</title>
      <meta name="description" content="Super Timesheet" />
      <link rel="icon" href="/fav.png" />
    </Head>
    <StyleWrapper>
      <Layout>
        <Component {...pageProps} />
        <ToastContainer />
      </Layout>
    </StyleWrapper>
  </>
);

export default App;

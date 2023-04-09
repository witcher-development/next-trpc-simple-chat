import type { AppType } from 'next/app';
import { MantineProvider } from '@mantine/core';


import { trpc } from '~/utils/trpc';
import './reset.css';


const MyApp: AppType = ({ Component, pageProps }) =>
	<MantineProvider theme={{ colorScheme: 'dark' }}>
		<Component {...pageProps} />
	</MantineProvider>;

export default trpc.withTRPC(MyApp);

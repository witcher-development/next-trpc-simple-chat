import type { AppType } from 'next/app';
import { MantineProvider, AppShell } from '@mantine/core';

import { trpc } from '~/utils/trpc';
import './styles.css';


const MyApp: AppType = ({ Component, pageProps }) =>
	<MantineProvider theme={{ colorScheme: 'dark' }} withNormalizeCSS withGlobalStyles withCSSVariables>
		<AppShell
			styles={(theme) => ({
				main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[9] : theme.colors.gray[0] },
			})}
		>
			<Component {...pageProps} />
		</AppShell>
	</MantineProvider>;

export default trpc.withTRPC(MyApp);

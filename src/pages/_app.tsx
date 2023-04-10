import type { AppType } from 'next/app';
import { MantineProvider, AppShell } from '@mantine/core';

import { trpc } from '~/utils/trpc';
import './reset.css';
import './styles.css';


const MyApp: AppType = ({ Component, pageProps }) =>
	<MantineProvider
		withNormalizeCSS
		withGlobalStyles
		withCSSVariables
		theme={{
			colorScheme: 'dark',
			colors: {
				background: ['#212529', '#2C2E33', '', '', '', '', '', '', '', '']
			},
		}}
	>
		<AppShell
			styles={(theme) => ({
				main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[9] : theme.colors.gray[0] },
			})}
		>
			<Component {...pageProps} />
		</AppShell>
	</MantineProvider>;

export default trpc.withTRPC(MyApp);

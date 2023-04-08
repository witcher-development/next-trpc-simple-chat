import type { AppType } from 'next/app';

import { trpc } from '~/utils/trpc';
import './reset.css';


const MyApp: AppType = ({ Component, pageProps }) => <Component {...pageProps} />;

export default trpc.withTRPC(MyApp);

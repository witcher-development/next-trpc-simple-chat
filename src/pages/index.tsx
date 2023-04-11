import dynamic from 'next/dynamic';

import HomePage from '~/pages/home';


export default dynamic(() => Promise.resolve(HomePage), {
	ssr: false
});

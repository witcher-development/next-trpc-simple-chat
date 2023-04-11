import dynamic from 'next/dynamic';

import HomePage from 'src/components/home';


export default dynamic(() => Promise.resolve(HomePage), {
	ssr: false
});

import * as trpcNext from '@trpc/server/adapters/next';
import { z } from 'zod';

import { publicProcedure, router } from '~/server/trpc';


const messages: string[] = [];

const appRouter = router({
	list: publicProcedure
		.query(() => ({ messages })),
	post: publicProcedure
		.input(z.string())
		.mutation(({ input }) => {
			messages.push(input);
		}),

});

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
	router: appRouter,
	createContext: () => ({}),
});

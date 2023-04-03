import * as trpcNext from '@trpc/server/adapters/next';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

import { publicProcedure, router } from '~/server/trpc';


const prisma = new PrismaClient();

const appRouter = router({
	list: publicProcedure
		.query(() => prisma.message.findMany()),
	post: publicProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			await prisma.message.create({ data: { body: input } });
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

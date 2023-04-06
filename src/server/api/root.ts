import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { router } from '~/server/api/trpc';
import { MessagesRouter } from '~/server/api/routers/messages';


export const appRouter = router({
	messages: MessagesRouter
});

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

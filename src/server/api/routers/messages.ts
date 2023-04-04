import { z } from 'zod';

import { publicProcedure, router } from '~/server/api/trpc';


export const MessagesRouter = router({
	list: publicProcedure
		.query(({ ctx }) => ctx.prisma.message.findMany()),
	post: publicProcedure
		.input(z.string())
		.mutation(async ({ input, ctx }) => {
			await ctx.prisma.message.create({ data: { body: input } });
		}),
});

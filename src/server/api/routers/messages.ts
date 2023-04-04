import { z } from 'zod';

import { publicProcedure, router } from '~/server/api/trpc';
import { messageTextSchema } from '~/common/types';


export const MessagesRouter = router({
	list: publicProcedure
		.query(({ ctx }) => ctx.prisma.message.findMany()),
	post: publicProcedure
		.input(z.discriminatedUnion('type', [
			z.object({ type: z.literal('plain'), text: messageTextSchema }),
			z.object({ type: z.literal('with-image'), text: messageTextSchema, hasImage: z.boolean() })
		]))
		.mutation(async ({ input, ctx }) => {
			await ctx.prisma.message.create({ data: { text: input.text } });
		}),
});

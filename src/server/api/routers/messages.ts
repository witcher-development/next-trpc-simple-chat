import { z } from 'zod';

import { publicProcedure, router } from '~/server/api/trpc';
import { messageTextSchema } from '~/common/types';


const postMessageSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('plain'),
		text: messageTextSchema
	}),
	z.object({
		type: z.literal('with-image'),
		text: z.optional(messageTextSchema),
		id: z.string()
	})
]);

export const MessagesRouter = router({
	list: publicProcedure
		.query(({ ctx }) => ctx.prisma.message.findMany()),
	post: publicProcedure
		.input(postMessageSchema)
		.mutation(async ({ input, ctx }) => {
			switch (input.type) {
				case 'plain': {
					return ctx.prisma.message.create({ data: { text: input.text } });
				}
				case 'with-image': {
					// TODO: gen pre-signed S3 URL
					return ctx.prisma.message.create({ data: { id: input.id, text: input.text } });
				}
				default: {
					throw new Error('should not happen');
				}
			}
		}),
});

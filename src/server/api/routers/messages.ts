import { z } from 'zod';

import { publicProcedure, router } from '~/server/api/trpc';
import { messageTextSchema } from '~/common/types';
import { constructImageUrl, getFileUploadUrl, deleteFile } from '~/server/s3';



const postMessageSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('plain'),
		text: messageTextSchema,
		id: z.string(),
	}),
	z.object({
		type: z.literal('with-image'),
		text: messageTextSchema,
		id: z.string(),
	})
]);
const deleteMessageSchema = z.object({
	id: z.string()
});

export const MessagesRouter = router({
	list: publicProcedure
		.query(({ ctx }) => ctx.prisma.message.findMany()),
	post: publicProcedure
		.input(postMessageSchema)
		.mutation(async ({ input, ctx }) => {
			switch (input.type) {
				case 'plain': {
					await ctx.prisma.message.create({
						data: {
							id: input.id,
							text: input.text,
						}
					});
					return;
				}
				case 'with-image': {
					// TODO: Fix. Other users might use link from Mongo to access image earlier than it is actually uploaded to S3
					await ctx.prisma.message.create({
						data: {
							id: input.id,
							text: input.text,
							image: constructImageUrl(input.id)
						}
					});
					return await getFileUploadUrl(input.id);
				}
				default: {
					throw new Error('should not happen');
				}
			}
		}),
	delete: publicProcedure
		.input(deleteMessageSchema)
		.mutation(async ({ input: { id }, ctx }) => {
			// TODO: handle not-exist error
			const deletedMessage = await ctx.prisma.message.delete({
				where: { id }
			});
			if (deletedMessage.image) {
				deleteFile(id);
			}
		})
});

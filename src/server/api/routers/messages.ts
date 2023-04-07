import { z } from 'zod';

import { publicProcedure, router } from '~/server/api/trpc';
import { messageTextSchema } from '~/common/types';
import { constructImageUrl, getFileUploadUrl, deleteFile } from '~/server/s3';



const postMessageSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('plain'),
		text: messageTextSchema,
	}),
	z.object({
		type: z.literal('with-image'),
		text: messageTextSchema,
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
					const { id } = await ctx.prisma.message.create({
						data: {
							text: input.text,
						}
					});
					return {
						newId: id
					};
				}
				case 'with-image': {
					// TODO: Fix. Other users might use link from Mongo to access image earlier than it is actually uploaded to S3
					const { id } = await ctx.prisma.message.create({
						data: {
							text: input.text,
						}
					});
					ctx.prisma.message.update({
						where: { id },
						data: { image: constructImageUrl(id) }
					}).then();
					return {
						newId: id,
						uploadUrl: await getFileUploadUrl(id)
					};
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

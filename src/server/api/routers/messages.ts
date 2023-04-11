import { z } from 'zod';

import { publicProcedure, router } from '~/server/api/trpc';
import { messageTextSchema } from '~/common/types';
import { constructImageUrl, getFileUploadUrl, deleteFile } from '~/server/s3';


const sortSchema = z.object({
	field: z.enum(['text', 'createdAt']).default('createdAt'),
	order: z.enum(['asc', 'desc']).default('desc'),
});
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

const mapSortFields = (field: z.infer<typeof sortSchema>['field']) => field === 'createdAt' ? 'id' : field;

export const MessagesRouter = router({
	list: publicProcedure
		.input(z.object({
			limit: z.number().default(30),
			cursor: z.string().nullish(), // "cursor" needs to exist, but can be any type
			sort: sortSchema
		}))
		.query(async ({ ctx, input }) => {
			const { cursor, limit, sort } = input;
			const messages = await ctx.prisma.message.findMany({
				take: limit + 1, // get an extra item at the end which we'll use as next cursor
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: {
					[mapSortFields(sort.field)]: sort.order,
				},
			});
			let nextCursor: typeof cursor | undefined = undefined;
			if (messages.length > limit) {
				const nextItem = messages.pop();
				nextCursor = nextItem!.id;
			}
			// to showcase skeleton loader
			await new Promise((res) => setTimeout(res, 200));
			return {
				messages,
				nextCursor,
			};
		}),
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

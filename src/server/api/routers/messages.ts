import { z } from 'zod';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import * as process from 'process';

import { publicProcedure, router } from '~/server/api/trpc';
import { messageTextSchema } from '~/common/types';


const S3 = new S3Client({
	region: 'eu-central-1',
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY as string,
		secretAccessKey: process.env.S3_SECRET_KEY as string,
	},
});
const getUploadUrl = async (filename: string) => {
	const putCommand = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET as string,
		Key: filename,
	});
	return await getSignedUrl(S3, putCommand, { expiresIn: 100 });
};

const postMessageSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('plain'),
		text: messageTextSchema
	}),
	z.object({
		type: z.literal('with-image'),
		text: z.optional(messageTextSchema),
		id: z.string(),
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
					ctx.prisma.message.create({ data: { text: input.text } });
					return;
				}
				case 'with-image': {
					ctx.prisma.message.create({ data: { id: input.id, text: input.text } });
					return await getUploadUrl(input.id);
				}
				default: {
					throw new Error('should not happen');
				}
			}
		}),
});

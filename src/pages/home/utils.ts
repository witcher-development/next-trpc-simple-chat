import { z } from 'zod';


const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const imageSchema = z
	.custom<File>((value) => value instanceof File)
	.superRefine((file, ctx) => {
		if (file.size > MAX_FILE_SIZE) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Max file size is 5MB',
			});
		}
		if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: '.jpg, .jpeg, .png and .webp files are accepted.',
			});
		}
	});

export const renameFile = (file: File, newName: string) => new File([file], newName);

export const uploadImageToS3 = (image: File, url: string) => {
	fetch(url, {
		method: 'PUT',
		body: image,
	});
};

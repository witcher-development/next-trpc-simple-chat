import { z } from 'zod';
import { InfiniteData } from '@tanstack/react-query';
import { format } from 'date-fns';

import { RouterOutputs } from '~/server/api/root';

import { Message } from './model';


const MAX_FILE_SIZE = 500000;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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

type PagesData = InfiniteData<RouterOutputs['messages']['list']>
export const infiniteDataToMessages = (data: PagesData) => data.pages.reduce<Message[]>(
	(messages, currentPage) =>	[...messages, ...currentPage.messages],
	[]
);

export const getMapOfUniqueFormattedDates = (messages: Message[]) => {
	const dates = new Map<Date, string>();

	messages.forEach(({ createdAt }) => {
		const formatted = format(createdAt, 'MMM d');
		if (Array.from(dates.values()).includes(formatted)) return;
		dates.set(createdAt, formatted);
	});

	return {
		includes: (date: Date) => Array.from(dates.keys()).includes(date),
		get: (date: Date) => dates.get(date)
	};
};

export const hoursMinutes = (date: Date) => format(date, 'h:mm a');

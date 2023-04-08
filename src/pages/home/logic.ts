import { produce } from 'immer';

import { trpc } from '~/utils/trpc';
import { getNewMessage } from '~/pages/home/model';

import { renameFile, uploadImageToS3 } from './utils';

import { ChatInputData } from './index';


export const useGetMessages = () => trpc.messages.list.useInfiniteQuery(
	{},
	{
		refetchInterval: 2000,
		getNextPageParam: (lastPage) => lastPage.nextCursor
	}
);

const useOptimisticallyAddMessage = () => {
	const context = trpc.useContext();

	// function to add message
	return async (optimisticMessage: ReturnType<typeof getNewMessage>) => {
		await context.messages.list.cancel();
		context.messages.list.setInfiniteData({}, (existingData) => {
			if (!existingData || !existingData.pages || existingData?.pages.length === 0) return existingData;
			// using immer to immutably change highly nested data
			return produce(existingData, (newData) => {
				newData.pages[0].messages.unshift(optimisticMessage);
			});
		});

		// function to replace message
		return async (newId: string) => {
			await context.messages.list.cancel();
			context.messages.list.setInfiniteData(
				{},
				(existingData) => {
					if (!existingData || !existingData.pages) return existingData;
					// using immer to immutably change highly nested data
					return produce(existingData, (newData) => {
						// using 'for', but not 'forEach' to be able to stop code using 'break' when message found
						// and potentially avoid iterating many more pages
						for (const page of newData.pages) {
							const messageIndex = page.messages.findIndex(({ id }) => id === optimisticMessage.id);
							if (messageIndex !== -1) {
								page.messages[messageIndex].id = newId;
								break;
							}
						}
					});
				}
			);
		};
	};
};
export const usePostMessage = () => {
	// TODO: on error delete optimistic rows
	const { mutateAsync: post } = trpc.messages.post.useMutation();
	const optimisticallyAddMessage = useOptimisticallyAddMessage();

	return async (message: ChatInputData) => {
		if (message.image) {
			const { image, text } = message;

			const optimisticMessage = getNewMessage({
				text,
				image: URL.createObjectURL(image)
			});
			const replaceFakeIdWithReal = await optimisticallyAddMessage(optimisticMessage);

			const { newId, uploadUrl } = await post({ type: 'with-image', text });
			if (uploadUrl) uploadImageToS3(renameFile(image, newId), uploadUrl);
			replaceFakeIdWithReal(newId);
		} else {
			const optimisticMessage = getNewMessage({
				text: message.text,
			});
			const replaceFakeIdWithReal = await optimisticallyAddMessage(optimisticMessage);

			const { newId } = await post({ type: 'plain', text: message.text });
			replaceFakeIdWithReal(newId);
		}
	};
};

export const useDeleteMessage = () => {
	const context = trpc.useContext();
	const { mutate: deleteMessage } = trpc.messages.delete.useMutation({
		onMutate: async ({ id }) => {
			await context.messages.list.cancel();
			context.messages.list.setInfiniteData({}, (existingData) => {
				if (!existingData || !existingData.pages) return existingData;
				// using immer to immutably change highly nested data
				return produce(existingData, (newData) => {
					// using 'for', but not 'forEach' to be able to stop code using 'break' when message found
					// and potentially avoid iterating many more pages
					for (const page of newData.pages) {
						const messageIndex = page.messages.findIndex((message) => message.id === id);
						if (messageIndex !== -1) {
							page.messages.splice(messageIndex, 1);
							break;
						}
					}
				});
			});
		},
		onError: () => {
			context.messages.list.invalidate();
		}
	});
	return deleteMessage;
};

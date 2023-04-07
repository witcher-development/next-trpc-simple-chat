import { trpc } from '~/utils/trpc';
import { getNewMessage } from '~/pages/home/model';

import { renameFile, uploadImageToS3 } from './utils';

import { ChatInputData } from './index';


export const useGetMessages = () => trpc.messages.list.useQuery(undefined, { refetchInterval: 2000 });

const useOptimisticallyAddMessage = () => {
	const context = trpc.useContext();

	// function to add message
	return async (optimisticMessage: ReturnType<typeof getNewMessage>) => {
		await context.messages.list.cancel();
		context.messages.list.setData(undefined, (existingData) => [optimisticMessage, ...(existingData || [])]);

		// function to replace message
		return async (newId: string) => {
			await context.messages.list.cancel();
			context.messages.list.setData(
				undefined,
				(existingData) => existingData?.map((m) => m.id !== optimisticMessage.id ? m : ({
					...m,
					id: newId
				}))
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
			context.messages.list.setData(undefined, (messages) => messages?.filter((m) => m.id !== id));
		},
		onError: () => {
			context.messages.list.invalidate();
		}
	});
	return deleteMessage;
};

import { useState } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, FileInput, Flex, rem, Container, Text, Stack, Box } from '@mantine/core';
import { IconPaperclip, IconSend, IconTrash } from '@tabler/icons-react';
import { z } from 'zod';
import InfiniteScroll from 'react-infinite-scroll-component';

import { messageTextSchema } from '~/common/types';

import { imageSchema } from './utils';
import { Sort } from './model';
import { usePostMessage, useDeleteMessage, useGetMessages } from './logic';


const chatInputSchema = z.object({
	text: messageTextSchema,
	image: imageSchema.optional()
});
export type ChatInputData = z.TypeOf<typeof chatInputSchema>;

export default function HomePage () {
	const { onSubmit, reset, getInputProps } = useForm<ChatInputData>({
		validate: zodResolver(chatInputSchema),
		initialValues: {
			text: '',
		}
	});
	const [sort, setSort] = useState<Sort>({
		field: 'createdAt',
		order: 'desc'
	});

	// TODO: Fix. Refetch happens in background
	const { data, status, fetchNextPage, hasNextPage } = useGetMessages(sort);
	const postMessage = usePostMessage(sort);
	const deleteMessage = useDeleteMessage(sort);

	const sendMessage = onSubmit((data) => {
		postMessage(data);
		reset();
	});

	if (status !== 'success') return <></>;
	return (
		<Container size="sm">
			<Stack spacing="xl">
				<form onSubmit={sendMessage}
					// style={{
					// 	position: 'fixed',
					// 	top: '0',
					// 	background: '#fff'
					// }}
				>
					<Flex>
						<FileInput
							variant="unstyled"
							{...getInputProps('image')}
							icon={<IconPaperclip size={rem(14)} />}
							clearable
							valueComponent={() => <></>}
						/>
						<TextInput sx={{ width: '100%' }} placeholder='text' variant="unstyled" {...getInputProps('text')} />
						<Button type="submit">
							<IconSend size={rem(14)} />
						</Button>
					</Flex>
				</form>
				<InfiniteScroll
					next={fetchNextPage}
					hasMore={hasNextPage || false}
					loader={<h4>Loading...</h4>}
					dataLength={data?.pages.length * 20}
				>
					<Stack>
						{data.pages.map(({ messages }) => messages.map(({ id, text, image }) => (
							<Stack
								key={id}
								sx={(theme) => ({
									minHeight: 40,
									position: 'relative',
									backgroundColor: theme.colors.dark[4]
								})}
								spacing="xs"
							>
								{image && <img src={image} alt="image" width={200} height={100} />}
								{text && <Text>{ text }</Text>}
								<Box sx={{ position: 'absolute', right: 0 }}>
									<Button onClick={() => deleteMessage({ id })}>
										<IconTrash size={rem(14)} />
									</Button>
								</Box>
							</Stack>
						)))}
					</Stack>
				</InfiniteScroll>
			</Stack>
		</Container>
	);
}

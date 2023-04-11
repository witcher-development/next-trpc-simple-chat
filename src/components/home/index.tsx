import React, { useState } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import { Container, Stack, Box, Title } from '@mantine/core';
import { z } from 'zod';

import { messageTextSchema } from '~/common/types';

import {
	Message,
	InfiniteScroll,
	Form,
	DayBadge,
	Sort,
	ChatSkeleton
} from './components';
import { imageSchema, infiniteDataToMessages } from './utils';
import * as model from './model';
import { usePostMessage, useDeleteMessage, useGetMessages } from './logic';


const chatInputSchema = z.object({
	text: messageTextSchema,
	image: imageSchema.nullable()
});
export type ChatInputData = z.TypeOf<typeof chatInputSchema>;

export default function HomePage () {
	const {
		values,
		onSubmit,
		reset,
		getInputProps
	} = useForm<ChatInputData>({
		validate: zodResolver(chatInputSchema),
		initialValues: {
			text: '',
			image: null
		}
	});
	const [sort, setSort] = useState<model.Sort>({
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
	const messages = status === 'success' ? infiniteDataToMessages(data) : [];

	return (
		<Container size="md">
			<Stack spacing={40} pos="relative">
				<Box sx={{ position: 'absolute', top: 54, right: 0 }}>
					<Sort sort={sort} setSort={setSort} />
				</Box>
				<Form
					sendMessage={sendMessage}
					imageSelected={!!values.image}
					getInputPropsHelper={getInputProps}
				/>

				{status === 'success' && !!messages.length && (
					<InfiniteScroll
						dataLength={messages.length}
						hasMore={hasNextPage || false}
						next={fetchNextPage}
					>
						<Stack align="start">
							{messages.map((message) => (
								<React.Fragment key={message.id}>
									<DayBadge messages={messages} currentMessageDate={message.createdAt} />
									<Message
										message={message}
										deleteMessage={() => deleteMessage({ id: message.id })}
									/>
								</React.Fragment>
							))}
						</Stack>
					</InfiniteScroll>
				)}
				{status === 'success' && !messages.length && (
					<Title order={5} align="center" mt={30}>Nothing here yet</Title>
				)}
				{status !== 'success' && <ChatSkeleton />}
			</Stack>
		</Container>
	);
}

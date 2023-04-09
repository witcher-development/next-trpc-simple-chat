import { useState } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, FileInput, Flex } from '@mantine/core';

// import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InfiniteScroll from 'react-infinite-scroll-component';

import { messageTextSchema } from '~/common/types';

import { imageSchema } from './utils';
import { Sort } from './model';
import { usePostMessage, useDeleteMessage, useGetMessages } from './logic';


const styles = {
	width: '100vw',
	height: '100vh',
};


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
		<div style={styles}>
			<h1>Chat</h1>
			<form onSubmit={sendMessage}
				style={{
					position: 'fixed',
					top: '0',
					background: '#fff'
				}}
			>
				<Flex>
					<FileInput {...getInputProps('image')} />
					<TextInput {...getInputProps('text')} />
					<Button type="submit">Post</Button>
				</Flex>
			</form>
			<InfiniteScroll
				next={fetchNextPage}
				hasMore={hasNextPage || false}
				loader={<h4>Loading...</h4>}
				dataLength={data?.pages.length * 20}
			>
				{data.pages.map(({ messages }) => messages.map(({ id, text, image }) => (
					<li key={id} style={{ height: 100 }}>
						{text && <p>{ text }</p>}
						{image && <img src={image} alt="image" width={200} height={100} />}
						<button onClick={() => deleteMessage({ id })}>delete</button>
					</li>
				)))}
			</InfiniteScroll>
		</div>
	);
}

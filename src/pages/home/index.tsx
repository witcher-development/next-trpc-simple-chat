import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
	// image always has a value. It is an empty FileList by default.
	image: imageSchema
});
export type ChatInputData = z.TypeOf<typeof chatInputSchema>;

export default function HomePage () {
	const {
		register,
		reset,
		handleSubmit,
		formState: { errors }
	} = useForm<ChatInputData>({ resolver: zodResolver(chatInputSchema) });
	const [sort, setSort] = useState<Sort>({
		field: 'createdAt',
		order: 'desc'
	});

	// TODO: Fix. Refetch happens in background
	const { data, status, fetchNextPage, hasNextPage } = useGetMessages(sort);
	const postMessage = usePostMessage(sort);
	const deleteMessage = useDeleteMessage(sort);

	const sendMessage = handleSubmit((data) => {
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
				<input type="file" {...register('image')} />
				<input {...register('text')} />
				<input type="submit" value="Post" />
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
						{image && <img src={image} alt="image" width={200} />}
						<button onClick={() => deleteMessage({ id })}>delete</button>
					</li>
				)))}
			</InfiniteScroll>
		</div>
	);
}

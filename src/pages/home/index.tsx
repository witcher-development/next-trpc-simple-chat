import { useState } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import { Textarea, Button, FileInput, Flex, rem, Container, Text, Stack, Box } from '@mantine/core';
import { useEventListener } from '@mantine/hooks';
import { IconCirclePlus, IconSend, IconTrash } from '@tabler/icons-react';
import { z } from 'zod';
import InfiniteScroll from 'react-infinite-scroll-component';

import { messageTextSchema } from '~/common/types';

import { imageSchema } from './utils';
import { Sort } from './model';
import { usePostMessage, useDeleteMessage, useGetMessages } from './logic';


const chatInputSchema = z.object({
	text: messageTextSchema,
	image: imageSchema.nullable()
});
export type ChatInputData = z.TypeOf<typeof chatInputSchema>;

export default function HomePage () {
	const { values, onSubmit, reset, getInputProps } = useForm<ChatInputData>({
		validate: zodResolver(chatInputSchema),
		initialValues: {
			text: '',
			image: null
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
		// setValues({ image: undefined });
	});
	const textAreaRef = useEventListener('keypress', (event) => {
		if (event.key === 'Enter') {
			if (event.shiftKey) return;
			event.preventDefault();
			sendMessage();
		}
	});

	if (status !== 'success') return <></>;
	return (
		<Container size="md">
			<Stack spacing={40}>
				<form
					onSubmit={sendMessage}
					style={{
						position: 'sticky',
						top: '0',
						zIndex: 2,
					}}
				>
					<Box
						sx={(theme) => ({
							backgroundColor: theme.colors.background[1],
							borderRadius: '0.25rem',
							borderTopLeftRadius: 0,
							borderTopRightRadius: 0,
							boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
							minHeight: 48
						})}
					>
						<Flex>
							<FileInput
								size="lg"
								variant="unstyled"
								{...getInputProps('image')}
								icon={<>{!values.image && <IconCirclePlus size={rem(25)} />}</>}
								clearable
								valueComponent={() => <></>}
								sx={(theme) => ({
									display: 'flex',
									position: 'relative',
									'.mantine-FileInput-input': {
										height: '100%',
										paddingLeft: '47px !important',
										paddingRight: 0
									},
									'.mantine-FileInput-error': {
										position: 'absolute',
										top: 'calc(100% + 6px)',
										zIndex: 1,
										width: 400,
										padding: '5px 10px',
										backgroundColor: theme.colors.background[0],
										border: `1px ${theme.colors.red[9]} solid`,
										borderRadius: '0.25rem',
									},
									'> div': { marginBottom: 0 },
								})}
							/>
							<Textarea
								ref={textAreaRef}
								size="lg"
								autosize
								minRows={1}
								sx={{
									flexGrow: 1,
									overflowY: 'hidden',
									'> div': { marginBottom: 0 },
									'input': { paddingLeft: 8 }
								}}
								placeholder="Write a message..."
								variant="unstyled"
								{...getInputProps('text')}
								errorProps={{
									sx: { display: 'none' }
								}}
							/>
							<Button
								type="submit"
								variant="subtle"
								size="lg"
								sx={{
									height: 'auto',
									paddingLeft: '0.825rem',
									paddingRight: '0.825rem'
								}}
							>
								<IconSend size={rem(20)} />
							</Button>
						</Flex>
					</Box>
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
									backgroundColor: theme.colors.background[1]
								})}
								spacing="xs"
							>
								{image && <img src={image} alt="image" width={200} height={100} />}
								{text && <Text>{ text }</Text>}
								<Box sx={{ position: 'absolute', right: 0 }}>
									<Button onClick={() => deleteMessage({ id })} size="xs">
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

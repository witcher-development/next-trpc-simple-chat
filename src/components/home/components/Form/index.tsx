import React from 'react';
import { Button, FileInput, Flex, Textarea, rem } from '@mantine/core';
import { useEventListener } from '@mantine/hooks';
import { GetInputProps } from '@mantine/form/lib/types';
import { IconCirclePlus, IconSend } from '@tabler/icons-react';

import { ChatInputData } from '~/components/home';
import { ACCEPTED_IMAGE_TYPES } from '~/components/home/utils';

import { useStyles } from './styles';


const componentsSize = 'lg';

type Props = {
	sendMessage: () => void;
	imageSelected: boolean;
	getInputPropsHelper: GetInputProps<ChatInputData>;
}
export const Form = ({
	sendMessage,
	imageSelected,
	getInputPropsHelper
}: Props) => {
	const { classes } = useStyles();

	const textAreaRef = useEventListener('keypress', (event) => {
		// Enter+Shift - new line
		// Enter - send message
		if (event.key === 'Enter') {
			if (event.shiftKey) return;
			event.preventDefault();
			sendMessage();
		}
	});

	return (
		<form
			onSubmit={sendMessage}
			className={classes.formElement}
		>
			<Flex className={classes.formContainer}>
				<FileInput
					{...getInputPropsHelper('image')}
					clearable
					valueComponent={() => null}
					size={componentsSize}
					variant="unstyled"
					className={classes.imageInput}
					icon={<>{!imageSelected && <IconCirclePlus size={rem(25)} />}</>}
					accept={ACCEPTED_IMAGE_TYPES.join(',')}
				/>
				<Textarea
					ref={textAreaRef}
					{...getInputPropsHelper('text')}
					size={componentsSize}
					autosize
					minRows={1}
					className={classes.textInput}
					placeholder="Write a message..."
					variant="unstyled"
					errorProps={{
						sx: { display: 'none' }
					}}
				/>
				<Button
					type="submit"
					variant="subtle"
					size={componentsSize}
					className={classes.submitButton}
				>
					<IconSend size={rem(20)} />
				</Button>
			</Flex>
		</form>
	);
};

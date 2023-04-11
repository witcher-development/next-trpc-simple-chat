import React from 'react';
import { Box, Button, Flex, Stack, Text, rem } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { hoursMinutes } from '~/pages/home/utils';
import * as model from '~/pages/home/model';

import { useStyles } from './styles';


type Props = {
	message: model.Message,
	deleteMessage: () => void
}

export const Message = ({ message, deleteMessage }: Props) => {
	const { text, image, createdAt } = message;

	const { classes } = useStyles(!!image);

	return (
		<Stack className={classes.container} spacing={0}>
			{image && (
				<Flex	className={classes.imageContainer} justify="center">
					<img
						src={image}
						alt="image"
						className={classes.image}
					/>
				</Flex>
			)}
			<div className={classes.textContainer}>
				<p className={classes.text}>
					{ text }
					<Text
						component="time"
						c="dimmed"
						fz="sm"
						className={classes.timestamp}
					>{hoursMinutes(createdAt)}</Text>
				</p>
			</div>
			<Box sx={{ position: 'absolute', right: 0 }}>
				<Button onClick={deleteMessage} size="sm" variant="subtle">
					<IconTrash size={rem(20)} />
				</Button>
			</Box>
		</Stack>
	);
};

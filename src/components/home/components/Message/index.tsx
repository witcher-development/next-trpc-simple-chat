import React from 'react';
import { Button, Flex, Stack, Text, rem } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';

import { hoursMinutes } from '~/components/home/utils';
import * as model from '~/components/home/model';

import { useStyles } from './styles';


type Props = {
	message: model.Message,
	deleteMessage: () => void
}

export const Message = ({ message, deleteMessage }: Props) => {
	const { hovered, ref } = useHover();
	const { text, image, createdAt } = message;

	const { classes } = useStyles({
		image: !!image,
		hovered
	});

	return (
		<Stack className={classes.container} spacing={0} ref={ref}>
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
			<div className={classes.deleteButton}>
				<Button onClick={deleteMessage} size="xs" variant="subtle" sx={{ height: '100%' }}>
					<IconTrash size={rem(17)} />
				</Button>
			</div>
		</Stack>
	);
};

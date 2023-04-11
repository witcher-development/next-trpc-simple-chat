import { createStyles } from '@mantine/core';


type Props = { image: boolean, hovered: boolean }
export const useStyles = createStyles((theme, { image, hovered }: Props) => ({
	container: {
		position: 'relative',
		borderRadius: '0.25rem',
		backgroundColor: theme.colors.background[1],
		minWidth: image ? 300 : 0
	},
	imageContainer: {
		marginBottom: 10,
		borderRadius: '0.25rem',
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
		backgroundColor: theme.colors.background[2],
		overflow: 'hidden',
	},
	image: {
		maxWidth: 300,
		maxHeight: 300
	},
	textContainer: {
		padding: '10px 20px 5px',
		alignSelf: 'stretch'
	},
	text: {
		whiteSpace: 'pre-wrap',
		wordBreak: 'break-word'
	},
	timestamp: {
		float: 'right',
		paddingLeft: 8,
		marginRight: -8,
		lineHeight: 1.75
	},
	deleteButton: {
		position: 'absolute',
		left: '100%',
		'@media (max-width: 1150px)': {
			left: 'auto',
			right: 0
		},
		height: '100%',
		display: hovered ? 'block' : 'none'
	}
}));

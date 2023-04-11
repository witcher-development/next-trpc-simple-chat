import { createStyles } from '@mantine/core';


export const useStyles = createStyles((theme) => ({
	formElement: {
		position: 'sticky',
		top: '0',
		zIndex: 2,
	},
	formContainer: {
		backgroundColor: theme.colors.background[1],
		borderRadius: '0.25rem',
		borderTopLeftRadius: 0,
		borderTopRightRadius: 0,
		boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
		minHeight: 48
	},
	imageInput: {
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
	},
	textInput: {
		flexGrow: 1,
		overflowY: 'hidden',
		'> div': { marginBottom: 0 },
		'input': { paddingLeft: 8 }
	},
	submitButton: {
		height: 'auto',
		paddingLeft: '0.825rem',
		paddingRight: '0.825rem'
	}
}));

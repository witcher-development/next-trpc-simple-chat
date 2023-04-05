import * as z from 'zod';


export const messageTextSchema = z.string().min(1, { message: 'Required' }).max(5000);

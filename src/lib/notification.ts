// lib/notifications.ts
import { writable } from 'svelte/store';

export type Toast = {
	id: number;
	message: string;
	type?: 'info' | 'success' | 'error';
	duration?: number; // ms
};

const toasts = writable<Toast[]>([]);

let id = 0;

export function notify(message: string, options?: Partial<Omit<Toast, 'id'>>) {
	const toast: Toast = {
		id: id++,
		message,
		type: options?.type ?? 'info',
		duration: options?.duration ?? 3000
	};
	toasts.update((all) => [...all, toast]);

	setTimeout(() => {
		toasts.update((all) => all.filter((t) => t.id !== toast.id));
	}, toast.duration);

	return toast.id;
}

export default toasts;

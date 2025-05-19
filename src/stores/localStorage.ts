import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

export interface User {
	id: `${string}-${string}-${string}-${string}-${string}`;
	name: string;
	color: string;
	registered: boolean;
}

const defaultUser: User = {
	id: '0-0-0-0-0',
	name: '',
	color: '',
	registered: false
}

let userStore: Writable<User> | undefined;
const colors = ['love-light', 'gold-light', 'rose-light', 'pine-light', 'foam-light', 'iris-light'];
const randomColor = colors[Math.floor(Math.random() * colors.length)];

if (browser) {
	const storedUser = JSON.parse(localStorage.getItem('user') ?? 'null') as User | null;
	userStore = writable<User>(storedUser ?? defaultUser);

	//save changes to localStorage
	userStore.subscribe((value) => {
		localStorage.setItem('user', JSON.stringify(value));
	});
}

export function registerUser(name: string): void {
	if (browser && userStore) {
		userStore.set({
			id: crypto.randomUUID(),
			name,
			color: randomColor,
			registered: true
		});
	}
}

export default userStore;

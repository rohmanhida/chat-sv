import { PUBLIC_WS_URL, PUBLIC_OTHER_URL } from '$env/static/public'
import { writable, readable, type Readable } from 'svelte/store';

type WebSocketEventHandler = {
	onOpen?: (ws: WebSocket) => void;
	onMessage?: (data: Message, event: MessageEvent) => void;
	onError?: (event: Event) => void;
	onClose?: (event: Event) => void;
	sendMessage?: (socket: WebSocket, message: Message) => void;
};

export let socket: WebSocket;

export type Message = {
	type: string;
	content: string;
	sender: string;
};

export interface Stats {
	connected_clients: number;
}

export const stats = writable<Stats>({
	connected_clients: 0
});

export function webSocketStore<T>(
	countURL: string = "http://localhost:8080/stats",
	url: string = "ws://localhost:8080/ws",
	handlers: WebSocketEventHandler,
	reconnectDelay: 1000
): Readable<T | null> {
	let reconnectTimeout: ReturnType<typeof setTimeout>;
	countURL = PUBLIC_OTHER_URL
	url = PUBLIC_WS_URL
	console.log("cek url", PUBLIC_WS_URL)

	const store = readable<T | null>(null, (set) => {
		async function activeCount() {
			const res = await fetch(countURL);
			const resdata = await res.json();
			stats.update((stat) => ({ ...stat, connected_clients: resdata.connected_clients }));
		}

		function connect() {
			socket = new WebSocket(url);
			socket.onopen = () => {
				console.log('websocket connected');
				handlers?.onOpen?.(socket);
			};

			socket.onmessage = (event) => {
				try {
					// update the active count users
					activeCount();
					// parse data
					const parsed = JSON.parse(event.data);
					set(parsed as T);

					// call the handler function
					handlers?.onMessage?.(parsed, event);
				} catch (err) {
					console.error('Websocket message parsing failed', err);
				}
			};

			socket.onerror = (event) => {
				console.error('Error while connecting to websocket');
				handlers?.onError?.(event);
			};

			socket.onclose = (event) => {
				console.log('Disconnected to websocket');
				handlers?.onClose?.(event);
				reconnectTimeout = setTimeout(connect, reconnectDelay);
			};
		}

		connect();

		return () => {
			clearTimeout(reconnectTimeout);
			if (socket && socket.readyState == WebSocket.OPEN) {
				socket.close();
			}
		};
	});

	return store;
}

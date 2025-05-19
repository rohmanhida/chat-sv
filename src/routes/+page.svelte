<script lang="ts">
	import { writable } from 'svelte/store';
	import { webSocketStore, socket, stats, type Message, type Stats } from '../stores/websocket';
	import { onMount } from 'svelte';
	import userStore from '../stores/localStorage';
	import { registerUser, type User } from '../stores/localStorage';
	import { notify } from '$lib/notification';
	import ToastContainer from '$lib/ToastContainer.svelte';

	// states
	const messages = writable<Message[]>([]);
	let container: HTMLDivElement;
	let myMessage: string = '';
	let myName: string = '';
	let alert: string;

	// smoothly scroll to latest message
	const scroll = () => {
		setTimeout(() => {
			container?.scrollTo({
				top: container.scrollHeight,
				behavior: 'smooth'
			});
		}, 10);
	};

	function updateMyUser() {
		if (myName.trim()) {
			registerUser(myName);
		}
	}

	function sendMessage() {
		if (myMessage.trim()) {
			let formattedMessage: Message = {
				type: 'message',
				content: myMessage,
				sender: myUser?.name || ''
			};
			socket.send(JSON.stringify(formattedMessage));
			myMessage = '';
		}
	}

	function handleKeydownName(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			updateMyUser();
		}
	}

	function handleKeydownMessage(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			sendMessage();
		}
	}

	onMount(() => {});
	// define websocket
	const socketData = webSocketStore<Message>(
		"",
		"",
		{
			onMessage: (parsed, event) => {
				if (parsed.type == 'presence') {
					notify(parsed.content);
				} else {
					messages.update((msgs) => [...msgs, parsed]);
				}
				scroll();
				console.log('message received', parsed.content);
				console.log('cek sender', parsed.sender, myUser?.name);
			}
		},
		1000
	);

	let lastMessage: Message | null = null;
	let myUser: User | null = null;
	let myStats: Stats | null = null;

	$: if ($userStore) {
		myUser = $userStore;
		alert = myUser?.registered ? 'Welcome, ' + myUser?.name + '!' : 'Please tell us your name';
	}

	$: if ($socketData) {
		lastMessage = $socketData;
	}

	$: if ($stats) {
		myStats = $stats;
	}
</script>

<div
	class="bg-base-light dark:bg-base-dark text-text-light dark:text-text-dark flex h-screen overflow-hidden"
>
	<!-- Main Chat Area -->
	<ToastContainer />
	<main class="flex flex-1 flex-col">
		<!-- Header -->
		<header
			class="font-text border-overlay-light dark:border-overlay-dark flex items-center justify-between border-b p-4"
		>
			<div class="font-display text-lg">Chat</div>
			<p class="font-text text-text-light dark:text-text-dark text-xs">
				{myStats?.connected_clients} people online
			</p>
		</header>

		<!-- Chat Messages -->
		<div
			bind:this={container}
			class="bg-surface-light dark:bg-surface-dark flex-1 space-y-4 overflow-y-auto p-4"
		>
			{#each $messages as message}
				{#if message.type == 'message'}
					<span class="font-text text-right text-xs text-black dark:text-white"
						>{message.sender}</span
					>
					{#if message.sender == myUser?.name}
						<div
							class="font-text bg-rose-light dark:bg-rose-dark max-w-sm self-start rounded-lg px-4 py-2"
						>
							{message.content}
						</div>
					{:else}
						<div
							class="font-text bg-highlightlow-light dark:bg-highlightmed-dark max-w-sm self-start rounded-lg px-4 py-2"
						>
							{message.content}
						</div>
					{/if}
				{/if}
			{/each}
		</div>

		<!-- Message Input -->
		<div class="">
			<span
				contenteditable="true"
				bind:textContent={alert}
				class="font-text p-2 text-sm text-black dark:text-white"
			></span>
			<form class="flex items-center gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
				{#if myUser?.registered}
					<input
						bind:value={myMessage}
						on:keydown={handleKeydownMessage}
						type="text"
						placeholder="Type your message..."
						class="font-text flex-1 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
					/>
					<button
						on:click={sendMessage}
						type="submit"
						class="font-text bg-gold-light dark:bg-gold-dark hover:bg-pine-light dark:hover:bg-pine-dark rounded px-4 py-2 text-white dark:text-black"
						>Send</button
					>
				{:else}
					<input
						bind:value={myName}
						on:keydown={handleKeydownName}
						type="text"
						placeholder="Please tell us your name first"
						class="font-text flex-1 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
					/>
					<button
						on:click={updateMyUser}
						type="submit"
						class="font-text bg-gold-light dark:bg-gold-dark hover:bg-pine-light dark:hover:bg-pine-dark rounded px-4 py-2 text-white dark:text-black"
						>Register</button
					>
				{/if}
			</form>
		</div>
	</main>
</div>

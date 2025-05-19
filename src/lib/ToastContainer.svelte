<script lang="ts">
	import toasts, { type Toast } from '$lib/notification';
	import { fly } from 'svelte/transition';

	let toastList: Toast[] = [];
	$: toastList = $toasts;
</script>

<div class="fixed top-4 right-4 space-y-2 z-50">
	{#each $toasts as toast (toast.id)}
		<div
			in:fly={{ x: 100, duration: 200 }}
			out:fly={{ x: 100, duration: 200 }}
			class="px-4 py-2 rounded shadow-md text-sm text-white
			{toast.type === 'success' ? 'bg-foam-light dark:bg-foam-dark' : ''}
			{toast.type === 'error' ? 'bg-love-light dark:bg-love-dark' : ''}
			{toast.type === 'info' ? 'bg-pine-light dark:bg-pine-dark' : ''}"
		>
			{toast.message}
		</div>
	{/each}
</div>

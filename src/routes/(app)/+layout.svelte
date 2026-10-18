<script lang="ts">
	import { page } from '$app/state';
	import AppSidebar from '#lib/components/app-sidebar.svelte';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const titles: Record<string, string> = {
		'/': 'Beranda',
		'/tasks': 'Tugas'
	};

	const title = $derived(titles[page.url.pathname] ?? 'Panel Admin');
</script>

<Sidebar.Provider>
	<AppSidebar user={data.user} />
	<Sidebar.Inset>
		<header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger />
			<Separator orientation="vertical" class="mr-1 !h-5" />
			<h1 class="text-sm font-medium">{title}</h1>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import ListTodoIcon from '@lucide/svelte/icons/list-todo';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const stats = $derived([
		{ label: 'Tugas (halaman ini)', value: data.total, icon: ListTodoIcon },
		{ label: 'Selesai', value: data.completed, icon: CheckCircle2Icon },
		{ label: 'Belum selesai', value: data.pending, icon: ClockIcon }
	]);

	const dateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' });

	function formatDueDate(epochSeconds: number): string {
		return dateFormatter.format(new Date(epochSeconds * 1000));
	}
</script>

<div class="flex items-center justify-between">
	<div>
		<h2 class="text-xl font-semibold">Selamat datang</h2>
		<p class="text-sm text-muted-foreground">Ringkasan aktivitas tugas Anda.</p>
	</div>
	<Button href="/tasks">
		Kelola Tugas
		<ArrowRightIcon class="size-4" />
	</Button>
</div>

<div class="grid gap-4 sm:grid-cols-3">
	{#each stats as stat (stat.label)}
		{@const Icon = stat.icon}
		<Card.Root>
			<Card.Header class="flex-row items-center justify-between space-y-0">
				<Card.Description>{stat.label}</Card.Description>
				<Icon class="size-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<p class="text-3xl font-semibold">{stat.value}</p>
			</Card.Content>
		</Card.Root>
	{/each}
</div>

<Card.Root>
	<Card.Header>
		<Card.Title>Tugas terbaru</Card.Title>
		<Card.Description>5 tugas terakhir pada halaman pertama.</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if data.recent.length === 0}
			<p class="text-sm text-muted-foreground">
				Belum ada tugas. <a class="text-primary underline-offset-4 hover:underline" href="/tasks"
					>Buat tugas pertama</a
				>.
			</p>
		{:else}
			<ul class="divide-y">
				{#each data.recent as task (task.id)}
					<li class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
						<div class="min-w-0">
							<p class="truncate font-medium">{task.name}</p>
							<p class="truncate text-xs text-muted-foreground">
								Tenggat {formatDueDate(task.due_date)}
							</p>
						</div>
						<Badge variant={task.completed ? 'default' : 'secondary'}>
							{task.completed ? 'Selesai' : 'Belum'}
						</Badge>
					</li>
				{/each}
			</ul>
		{/if}
	</Card.Content>
</Card.Root>

<p class="text-xs text-muted-foreground">
	Catatan: API tidak menyediakan endpoint agregat, jadi angka di atas dihitung dari 50 tugas
	pertama.
</p>

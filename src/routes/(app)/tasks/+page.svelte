<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { invalidate } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { ApiError, createTask, deleteTask } from '#lib/api.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import type { Task } from '#lib/types.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const filters = [
		{ label: 'Semua', value: 'semua' },
		{ label: 'Belum selesai', value: 'belum' },
		{ label: 'Selesai', value: 'selesai' }
	];

	let createOpen = $state(false);
	let creating = $state(false);
	let deleteTarget = $state<Task | null>(null);
	let deleting = $state(false);

	let name = $state('');
	let slug = $state('');
	let description = $state('');
	let dueDate = $state('');
	let completed = $state(false);
	let slugTouched = $state(false);
	let fieldErrors = $state<Record<string, string>>({});

	const dateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' });

	function formatDueDate(epochSeconds: number): string {
		return dateFormatter.format(new Date(epochSeconds * 1000));
	}

	function slugify(value: string): string {
		return value
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 60);
	}

	function tasksHref(next: { status?: string; page?: number }): string {
		const params = new URLSearchParams();
		const status = next.status ?? data.status;
		const page = next.page ?? data.page;

		if (status !== 'semua') params.set('status', status);
		if (page > 0) params.set('page', String(page));

		const query = params.toString();

		return query ? `/tasks?${query}` : '/tasks';
	}

	function resetCreate() {
		name = '';
		slug = '';
		description = '';
		dueDate = '';
		completed = false;
		slugTouched = false;
		fieldErrors = {};
	}

	function openCreate() {
		resetCreate();
		createOpen = true;
	}

	$effect(() => {
		if (!slugTouched) slug = slugify(name);
	});

	async function submitCreate(event: SubmitEvent) {
		event.preventDefault();
		fieldErrors = {};

		const trimmedName = name.trim();
		if (!trimmedName) fieldErrors.name = 'Nama wajib diisi.';
		if (!dueDate) fieldErrors.due_date = 'Tenggat wajib diisi.';
		if (Object.keys(fieldErrors).length > 0) return;

		const dueSeconds = Math.floor(new Date(`${dueDate}T00:00:00`).getTime() / 1000);
		if (Number.isNaN(dueSeconds)) {
			fieldErrors.due_date = 'Format tanggal tidak valid.';
			return;
		}

		creating = true;
		try {
			await createTask({
				name: trimmedName,
				slug: slug.trim() || slugify(trimmedName),
				description: description.trim() || null,
				completed,
				due_date: dueSeconds
			});
			toast.success('Tugas berhasil dibuat.');
			createOpen = false;
			await invalidate('app:tasks');
		} catch (error) {
			if (error instanceof ApiError && error.status === 409) {
				fieldErrors = { slug: 'Slug sudah dipakai. Gunakan slug lain.' };
			} else {
				toast.error(error instanceof ApiError ? error.message : 'Gagal menyimpan tugas.');
			}
		} finally {
			creating = false;
		}
	}

	async function confirmDelete() {
		if (!deleteTarget) return;

		deleting = true;
		try {
			await deleteTask(deleteTarget.id);
			toast.success('Tugas berhasil dihapus.');
			deleteTarget = null;
			await invalidate('app:tasks');
		} catch (error) {
			toast.error(error instanceof ApiError ? error.message : 'Gagal menghapus tugas.');
		} finally {
			deleting = false;
		}
	}
</script>

<div class="flex flex-wrap items-center justify-between gap-4">
	<div>
		<h2 class="text-xl font-semibold">Tugas</h2>
		<p class="text-sm text-muted-foreground">Kelola daftar tugas Anda.</p>
	</div>
	<Button onclick={openCreate}>
		<PlusIcon class="size-4" />
		Tugas Baru
	</Button>
</div>

<div class="flex flex-wrap gap-2">
	{#each filters as filter (filter.value)}
		<Button
			href={tasksHref({ status: filter.value, page: 0 })}
			variant={data.status === filter.value ? 'secondary' : 'ghost'}
			size="sm"
		>
			{filter.label}
		</Button>
	{/each}
</div>

<div class="rounded-xl border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Nama</Table.Head>
				<Table.Head>Deskripsi</Table.Head>
				<Table.Head>Tenggat</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head class="text-right">Aksi</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.tasks as task (task.id)}
				<Table.Row>
					<Table.Cell>
						<div class="font-medium">{task.name}</div>
						<div class="text-xs text-muted-foreground">{task.slug}</div>
					</Table.Cell>
					<Table.Cell class="max-w-xs text-muted-foreground">
						<span class="line-clamp-2">{task.description ?? '—'}</span>
					</Table.Cell>
					<Table.Cell class="whitespace-nowrap">{formatDueDate(task.due_date)}</Table.Cell>
					<Table.Cell>
						<Badge variant={task.completed ? 'default' : 'secondary'}>
							{task.completed ? 'Selesai' : 'Belum'}
						</Badge>
					</Table.Cell>
					<Table.Cell class="text-right">
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Hapus tugas"
							onclick={() => (deleteTarget = task)}
						>
							<Trash2Icon class="size-4" />
						</Button>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={5} class="h-24 text-center text-muted-foreground">
						Belum ada tugas pada filter ini.
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<div class="flex items-center justify-between">
	<p class="text-sm text-muted-foreground">Halaman {data.page + 1}</p>
	<div class="flex gap-2">
		{#if data.canPrev}
			<Button variant="outline" size="sm" href={tasksHref({ page: data.page - 1 })}>
				Sebelumnya
			</Button>
		{:else}
			<Button variant="outline" size="sm" disabled>Sebelumnya</Button>
		{/if}
		{#if data.canNext}
			<Button variant="outline" size="sm" href={tasksHref({ page: data.page + 1 })}>
				Berikutnya
			</Button>
		{:else}
			<Button variant="outline" size="sm" disabled>Berikutnya</Button>
		{/if}
	</div>
</div>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Tugas Baru</Dialog.Title>
			<Dialog.Description>Isi detail tugas di bawah ini.</Dialog.Description>
		</Dialog.Header>
		<form class="grid gap-4" onsubmit={submitCreate}>
			<div class="grid gap-2">
				<Label for="task-name">Nama</Label>
				<Input id="task-name" bind:value={name} required />
				{#if fieldErrors.name}
					<p class="text-sm text-destructive">{fieldErrors.name}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="task-slug">Slug</Label>
				<Input id="task-slug" bind:value={slug} oninput={() => (slugTouched = true)} />
				{#if fieldErrors.slug}
					<p class="text-sm text-destructive">{fieldErrors.slug}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="task-description">Deskripsi</Label>
				<Textarea id="task-description" bind:value={description} rows={3} />
			</div>
			<div class="grid gap-2">
				<Label for="task-due-date">Tenggat</Label>
				<Input id="task-due-date" type="date" bind:value={dueDate} required />
				{#if fieldErrors.due_date}
					<p class="text-sm text-destructive">{fieldErrors.due_date}</p>
				{/if}
			</div>
			<label class="flex items-center gap-2 text-sm">
				<Checkbox bind:checked={completed} />
				Sudah selesai
			</label>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (createOpen = false)}>Batal</Button>
				<Button type="submit" disabled={creating}>
					{creating ? 'Menyimpan…' : 'Simpan'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root
	open={deleteTarget !== null}
	onOpenChange={(open) => {
		if (!open) deleteTarget = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus tugas ini?</AlertDialog.Title>
			<AlertDialog.Description>
				"{deleteTarget?.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Batal</AlertDialog.Cancel>
			<Button variant="destructive" onclick={confirmDelete} disabled={deleting}>
				{deleting ? 'Menghapus…' : 'Hapus'}
			</Button>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { ApiError, login } from '#lib/api.js';
	import { setToken } from '#lib/auth.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let submitting = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		submitting = true;

		try {
			const result = await login(email, password);
			setToken(result.token, result.expires_in);
			toast.success('Berhasil masuk.');
			await goto('/');
		} catch (err) {
			error =
				err instanceof ApiError && err.status === 401
					? 'Email atau kata sandi salah.'
					: err instanceof ApiError
						? err.message
						: 'Terjadi kesalahan. Coba lagi.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex min-h-svh items-center justify-center bg-muted/40 p-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title>Masuk</Card.Title>
			<Card.Description>Masuk untuk mengelola tugas Anda.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form class="grid gap-4" onsubmit={handleSubmit}>
				{#if error}
					<p class="text-sm text-destructive" role="alert">{error}</p>
				{/if}
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						placeholder="admin@example.com"
						required
						bind:value={email}
					/>
				</div>
				<div class="grid gap-2">
					<Label for="password">Kata sandi</Label>
					<Input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						bind:value={password}
					/>
				</div>
				<Button type="submit" class="w-full" disabled={submitting}>
					{submitting ? 'Memproses…' : 'Masuk'}
				</Button>
			</form>
		</Card.Content>
		<Card.Footer class="text-xs text-muted-foreground">
			Kredensial contoh: admin@example.com / secret123
		</Card.Footer>
	</Card.Root>
</div>

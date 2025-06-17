<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toasts } from '$lib/stores/toast';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let loading = false;

	// Show error toast once when form.error changes
	$: if (form?.error) {
		toasts.error(form.error);
	}

	onMount(() => {
		// Show info toast if message present in URL
		const urlParams = new URLSearchParams(window.location.search);
		const messageParam = urlParams.get('message');
		if (messageParam) {
			toasts.info(decodeURIComponent(messageParam));
		}
	});
</script>

<svelte:head>
	<title>Register - Admin Dashboard</title>
</svelte:head>

<div
	class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-12 sm:px-6 lg:px-8"
>
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h2 class="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
			<p class="mt-2 text-sm text-gray-600">
				Already have an account?
				<a
					href="/auth/login"
					class="font-medium text-primary-600 transition-colors hover:text-primary-500"
				>
					Sign in here
				</a>
			</p>
		</div>

		<div class="rounded-xl border border-gray-100 bg-white px-6 py-8 shadow-xl">
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					toasts.info('Creating your account...');
					return async ({ result }) => {
						loading = false;

						if (result.type === 'redirect') {
							toasts.success('Account created successfully!');
							setTimeout(() => {
								goto(result.location, { replaceState: true });
							}, 1000);
						} else if (result.type === 'failure') {
							if (result.data?.error) {
								toasts.error(result.data.error);
							} else if (result.data?.errors) {
								const errorMessages = Object.values(result.data.errors)
									.flat()
									.join(', ');
								toasts.error(errorMessages || 'Registration failed');
							} else {
								toasts.error('Registration failed. Please try again.');
							}
						}
					};
				}}
			>
				{#if form?.error}
					<div class="mb-4 rounded-md bg-red-50 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<!-- Error icon -->
								<svg
									class="h-5 w-5 text-red-400"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
							<div class="ml-3">
								<p class="text-sm font-medium text-red-800">{form.error}</p>
							</div>
						</div>
					</div>
				{/if}

				<div class="space-y-6">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="firstName" class="mb-2 block text-sm font-medium text-gray-700">
								First name
							</label>
							<input
								id="firstName"
								name="firstName"
								type="text"
								required
								placeholder="John"
								aria-invalid={form?.errors?.firstName ? 'true' : undefined}
								aria-describedby={form?.errors?.firstName ? 'firstName-error' : undefined}
								class="w-full rounded-lg border px-4 py-3 placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
								class:border-red-500={form?.errors?.firstName}
							/>
							{#if form?.errors?.firstName}
								<p id="firstName-error" class="mt-1 text-sm text-red-600">{form.errors.firstName[0]}</p>
							{/if}
						</div>

						<div>
							<label for="lastName" class="mb-2 block text-sm font-medium text-gray-700">
								Last name
							</label>
							<input
								id="lastName"
								name="lastName"
								type="text"
								required
								placeholder="Doe"
								aria-invalid={form?.errors?.lastName ? 'true' : undefined}
								aria-describedby={form?.errors?.lastName ? 'lastName-error' : undefined}
								class="w-full rounded-lg border px-4 py-3 placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
								class:border-red-500={form?.errors?.lastName}
							/>
							{#if form?.errors?.lastName}
								<p id="lastName-error" class="mt-1 text-sm text-red-600">{form.errors.lastName[0]}</p>
							{/if}
						</div>
					</div>

					<div>
						<label for="username" class="mb-2 block text-sm font-medium text-gray-700">
							Username
						</label>
						<input
							id="username"
							name="username"
							type="text"
							required
							placeholder="johndoe"
							aria-invalid={form?.errors?.username ? 'true' : undefined}
							aria-describedby={form?.errors?.username ? 'username-error' : undefined}
							class="w-full rounded-lg border px-4 py-3 placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
							class:border-red-500={form?.errors?.username}
						/>
						{#if form?.errors?.username}
							<p id="username-error" class="mt-1 text-sm text-red-600">{form.errors.username[0]}</p>
						{/if}
					</div>

					<div>
						<label for="email" class="mb-2 block text-sm font-medium text-gray-700">
							Email address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							placeholder="john@example.com"
							aria-invalid={form?.errors?.email ? 'true' : undefined}
							aria-describedby={form?.errors?.email ? 'email-error' : undefined}
							class="w-full rounded-lg border px-4 py-3 placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
							class:border-red-500={form?.errors?.email}
						/>
						{#if form?.errors?.email}
							<p id="email-error" class="mt-1 text-sm text-red-600">{form.errors.email[0]}</p>
						{/if}
					</div>

					<div>
						<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							placeholder="Enter a strong password"
							aria-invalid={form?.errors?.password ? 'true' : undefined}
							aria-describedby={form?.errors?.password ? 'password-error' : undefined}
							class="w-full rounded-lg border px-4 py-3 placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
							class:border-red-500={form?.errors?.password}
						/>
						{#if form?.errors?.password}
							<p id="password-error" class="mt-1 text-sm text-red-600">{form.errors.password[0]}</p>
						{/if}
					</div>

					<div>
						<label for="confirmPassword" class="mb-2 block text-sm font-medium text-gray-700">
							Confirm password
						</label>
						<input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							required
							placeholder="Confirm your password"
							aria-invalid={form?.errors?.confirmPassword ? 'true' : undefined}
							aria-describedby={form?.errors?.confirmPassword ? 'confirmPassword-error' : undefined}
							class="w-full rounded-lg border px-4 py-3 placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
							class:border-red-500={form?.errors?.confirmPassword}
						/>
						{#if form?.errors?.confirmPassword}
							<p id="confirmPassword-error" class="mt-1 text-sm text-red-600">{form.errors.confirmPassword[0]}</p>
						{/if}
					</div>

					<button
						type="submit"
						disabled={loading}
						class="flex w-full justify-center rounded-lg border border-transparent bg-primary-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if loading}
							<svg
								class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Creating account...
						{:else}
							Create account
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
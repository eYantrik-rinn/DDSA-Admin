import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		'process.env.NODE_ENV': '"development"'
	},
	css: {
		postcss: './postcss.config.cjs'
	}
});

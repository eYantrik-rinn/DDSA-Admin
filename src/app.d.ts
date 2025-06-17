// See https://kit.svelte.dev/docs/types#app
import type { ExamUser } from '@prisma/client';

declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
				username: string;
				role: string;
				isActive: boolean;
				firstName?: string | null;
				lastName?: string | null;
				returnUrl?: string;
				sessionToken?: string;
			} | null;
			authErrors?: {
				status: number;
				message: string;
				timestamp: string;
			}[];
		}
		
		interface PageData {
			user?: App.Locals['user'];
		}

		// interface Error {}
		
		interface Platform {
			env?: {
				DATABASE_URL: string;
				JWT_SECRET: string;
				SESSION_SECRET: string;
				[key: string]: string | undefined;
			};
		}
	}
}

export {};

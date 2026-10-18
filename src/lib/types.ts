/** Audit columns shared by every API model (epoch milliseconds / user ids). */
export interface AuditFields {
	created_at: number | null;
	updated_at: number | null;
	deleted_at: number | null;
	created_by: number | null;
	updated_by: number | null;
	deleted_by: number | null;
}

export interface User extends AuditFields {
	id: number;
	email: string;
	name: string;
}

export interface Task extends AuditFields {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	completed: boolean;
	/** Epoch seconds. */
	due_date: number;
}

export interface TaskInput {
	name: string;
	slug: string;
	description?: string | null;
	completed?: boolean;
	/** Epoch seconds. */
	due_date: number;
}

export interface LoginResult {
	token: string;
	expires_in: number;
}

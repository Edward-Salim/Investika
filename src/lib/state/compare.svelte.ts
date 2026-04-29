import { browser } from '$app/environment';

function normalizeId(project: any): string {
	// Always coerce to string for consistent comparison
	return String(project.id ?? project.id_peluang ?? '');
}

export class CompareStore {
	projects = $state<any[]>([]);
	/** Show a toast when limit is hit */
	limitReached = $state(false);

	constructor() {
		if (browser) {
			const stored = localStorage.getItem('vesti_compare_projects');
			if (stored) {
				try {
					this.projects = JSON.parse(stored);
				} catch (e) {
					console.error('Failed to parse compare projects', e);
				}
			}
		}
	}

	toggle(project: any) {
		const pid = normalizeId(project);
		const index = this.projects.findIndex((p: any) => normalizeId(p) === pid);

		if (index > -1) {
			// Remove
			this.projects = this.projects.filter((_: any, i: number) => i !== index);
			this.limitReached = false;
		} else {
			if (this.projects.length < 3) {
				this.projects = [...this.projects, project];
				this.limitReached = false;
			} else {
				// Flash the limit indicator briefly
				this.limitReached = true;
				setTimeout(() => { this.limitReached = false; }, 2500);
			}
		}
		this.save();
	}

	isCompared(id: string | number) {
		const pid = String(id);
		return this.projects.some((p: any) => normalizeId(p) === pid);
	}

	save() {
		if (browser) {
			localStorage.setItem('vesti_compare_projects', JSON.stringify(this.projects));
		}
	}

	clear() {
		this.projects = [];
		this.limitReached = false;
		this.save();
	}
}

export const compareStore = new CompareStore();

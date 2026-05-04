import { browser } from '$app/environment';
import { mapProjectToCard } from '$lib/projects/project-card';

const STORAGE_KEY = 'investika_bookmarked_projects';

function normalizeId(project: any): string {
	return String(project?.id ?? project?.id_peluang ?? '');
}

function normalizeProject(project: any) {
	if (!project) return project;
	if (project.title !== undefined) return project;
	if (project.id_peluang !== undefined) return mapProjectToCard(project);
	return project;
}

export class BookmarkStore {
	projects = $state<any[]>([]);

	constructor() {
		if (!browser) return;

		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return;

		try {
			const parsed = JSON.parse(stored);
			this.projects = Array.isArray(parsed) ? parsed : [];
		} catch (error) {
			console.error('Failed to parse bookmarked projects', error);
		}
	}

	toggle(project: any) {
		const normalizedProject = normalizeProject(project);
		const projectId = normalizeId(normalizedProject);
		const exists = this.projects.some((item: any) => normalizeId(item) === projectId);

		if (exists) {
			this.projects = this.projects.filter((item: any) => normalizeId(item) !== projectId);
		} else {
			this.projects = [...this.projects, normalizedProject];
		}

		this.save();
	}

	isBookmarked(id: string | number) {
		const projectId = String(id);
		return this.projects.some((item: any) => normalizeId(item) === projectId);
	}

	save() {
		if (!browser) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.projects));
	}

	clear() {
		this.projects = [];
		this.save();
	}
}

export const bookmarkStore = new BookmarkStore();

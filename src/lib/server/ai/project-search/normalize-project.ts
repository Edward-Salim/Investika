import { mapProjectToCard } from '$lib/projects/project-card';

export type ProjectCardRow = {
	id_peluang: number;
	nama: string | null;
	nama_provinsi?: string | null;
	nama_kabkot?: string | null;
	nama_sektor_peluang?: string | null;
	status?: string | null;
	status_proyek?: string | null;
	nilai_investasi?: string | null;
	nilai_irr?: string | null;
	nilai_npv?: string | null;
	nilai_investasi_amount?: string | number | null;
	nilai_irr_percent?: string | number | null;
	nilai_npv_amount?: string | number | null;
	image_url?: string | null;
	id_adm_provinsi?: number | null;
	wilayah_group?: string | null;
};

export function normalizeProjectCard(row: ProjectCardRow) {
	return mapProjectToCard(row);
}

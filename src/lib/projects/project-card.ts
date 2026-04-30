const categoryMap: Record<string, string> = {
	Pariwisata: 'Tourism',
	Infrastruktur: 'Infrastructure',
	'Kawasan Industri dan Real Estate': 'Property',
	'Jasa dan Kawasan': 'Services',
	'Industri Manufaktur': 'Manufacturing',
	'Pertanian dan Peternakan': 'Agriculture',
	Perikanan: 'Fisheries',
	Energi: 'Energy',
	Pertambangan: 'Mining',
	Kesehatan: 'Healthcare',
	'Transportasi dan Logistik': 'Logistics',
	Kehutanan: 'Agriculture',
	Perdagangan: 'Retail'
};

function parseInvestmentValue(value: string | null | undefined) {
	if (!value) return 0;
	const numeric = Number.parseFloat(value.replace(/[^0-9,.-]/g, '').replace(',', '.'));
	if (Number.isNaN(numeric)) return 0;
	if (value.includes('T')) return numeric * 1000;
	if (value.includes('B')) return numeric * 1000;
	return numeric;
}

function parseIrrValue(value: string | null | undefined) {
	if (!value) return 0;
	const numeric = Number.parseFloat(value.replace(/[^0-9,.-]/g, '').replace(',', '.'));
	return Number.isNaN(numeric) ? 0 : numeric;
}

export type ProjectCardSource = {
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

export function mapProjectToCard(project: ProjectCardSource) {
	const category = project.nama_sektor_peluang
		? (categoryMap[project.nama_sektor_peluang] || project.nama_sektor_peluang)
		: 'Other';

	return {
		id: String(project.id_peluang),
		title: project.nama || 'Untitled Project',
		category,
		status: project.status || project.status_proyek || 'Active',
		location: project.nama_provinsi || project.nama_kabkot || 'Indonesia',
		provinceId: project.id_adm_provinsi,
		wilayah: project.wilayah_group || null,
		investment: project.nilai_investasi || 'TBD',
		irr: project.nilai_irr || 'TBD',
		npv: project.nilai_npv || 'TBD',
		image: project.image_url || null,
		investmentNum:
			project.nilai_investasi_amount != null
				? Number.parseFloat(String(project.nilai_investasi_amount))
				: parseInvestmentValue(project.nilai_investasi),
		irrNum:
			project.nilai_irr_percent != null
				? Number.parseFloat(String(project.nilai_irr_percent))
				: parseIrrValue(project.nilai_irr),
		npvNum:
			project.nilai_npv_amount != null
				? Number.parseFloat(String(project.nilai_npv_amount))
				: parseInvestmentValue(project.nilai_npv)
	};
}

import { relations } from 'drizzle-orm';
import { pgTable, serial, integer, text, numeric, boolean, timestamp, doublePrecision, bigint } from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const countries = pgTable('countries', {
	id: serial('id').primaryKey(),
	name: text('name').notNull()
});

export const admProvinces = pgTable('adm_provinces', {
	id_adm_provinsi: integer('id_adm_provinsi').primaryKey(),
	nama: text('nama').notNull(),
	lon: doublePrecision('lon'),
	lat: doublePrecision('lat'),
	wilayah_group: text('wilayah_group'),
	luas_wilayah: numeric('luas_wilayah'),
	image_url: text('image_url')
});

export const admRegencies = pgTable('adm_regencies', {
	id_adm_kabkot: integer('id_adm_kabkot').primaryKey(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	nama: text('nama').notNull()
});

export const investmentOpportunities = pgTable('investment_opportunities', {
	id_peluang: integer('id_peluang').primaryKey(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	id_adm_kabkot: integer('id_adm_kabkot').references(() => admRegencies.id_adm_kabkot),
	nama: text('nama'),
	nama_provinsi: text('nama_provinsi'),
	nama_kabkot: text('nama_kabkot'),
	nama_sektor: text('nama_sektor'),
	nama_sektor_peluang: text('nama_sektor_peluang'),
	tahun: integer('tahun'),
	deskripsi: text('deskripsi'),
	status: text('status'),
	status_proyek: text('status_proyek'),
	project_status_enum: text('project_status_enum'),
	nilai_investasi: text('nilai_investasi'),
	nilai_irr: text('nilai_irr'),
	nilai_npv: text('nilai_npv'),
	nilai_pp: numeric('nilai_pp'),
	nilai_investasi_amount: numeric('nilai_investasi_amount'),
	nilai_investasi_currency: text('nilai_investasi_currency'),
	nilai_irr_percent: numeric('nilai_irr_percent'),
	nilai_npv_amount: numeric('nilai_npv_amount'),
	nilai_npv_currency: text('nilai_npv_currency'),
	icon_url: text('icon_url'),
	image_url: text('image_url'),
	fetched_at: timestamp('fetched_at', { withTimezone: true })
});

export const investmentOpportunityDetails = pgTable('investment_opportunity_details', {
	id_peluang: integer('id_peluang').primaryKey().references(() => investmentOpportunities.id_peluang),
	kode_kbli: text('kode_kbli'),
	alamat: text('alamat'),
	lokasi_kawasan: text('lokasi_kawasan'),
	is_ikn: boolean('is_ikn'),
	is_ipro: boolean('is_ipro'),
	luas_lahan: text('luas_lahan'),
	skema_kerja_sama: text('skema_kerja_sama'),
	readiness_status: text('readiness_status'),
	contact_name: text('contact_name'),
	contact_phone: text('contact_phone'),
	contact_email: text('contact_email'),
	lat: doublePrecision('lat'),
	lon: doublePrecision('lon')
});



export const investmentOpportunityContacts = pgTable('investment_opportunity_contacts', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	id_peluang: integer('id_peluang').references(() => investmentOpportunities.id_peluang),
	nama: text('nama'),
	alamat: text('alamat'),
	telepon: text('telepon'),
	email: text('email'),
	website: text('website')
});

export const investmentOpportunityGalleries = pgTable('investment_opportunity_galleries', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	id_peluang: integer('id_peluang').references(() => investmentOpportunities.id_peluang),
	image_url: text('image_url')
});

export const investmentOpportunityIncentives = pgTable('investment_opportunity_incentives', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	id_peluang: integer('id_peluang').references(() => investmentOpportunities.id_peluang),
	nama: text('nama'),
	keterangan: text('keterangan')
});

export const investmentOpportunityInfos = pgTable('investment_opportunity_infos', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	id_peluang: integer('id_peluang').references(() => investmentOpportunities.id_peluang),
	tipe: integer('tipe'),
	nama: text('nama'),
	url_rest: text('url_rest')
});

export const investmentOpportunitiesRelations = relations(investmentOpportunities, ({ one, many }) => ({
	details: one(investmentOpportunityDetails, {
		fields: [investmentOpportunities.id_peluang],
		references: [investmentOpportunityDetails.id_peluang]
	}),
	contacts: many(investmentOpportunityContacts),
	galleries: many(investmentOpportunityGalleries),
	incentives: many(investmentOpportunityIncentives),
	infos: many(investmentOpportunityInfos)
}));

export const investmentOpportunityContactsRelations = relations(investmentOpportunityContacts, ({ one }) => ({
	opportunity: one(investmentOpportunities, {
		fields: [investmentOpportunityContacts.id_peluang],
		references: [investmentOpportunities.id_peluang]
	})
}));

export const investmentOpportunityGalleriesRelations = relations(investmentOpportunityGalleries, ({ one }) => ({
	opportunity: one(investmentOpportunities, {
		fields: [investmentOpportunityGalleries.id_peluang],
		references: [investmentOpportunities.id_peluang]
	})
}));

export const investmentOpportunityIncentivesRelations = relations(investmentOpportunityIncentives, ({ one }) => ({
	opportunity: one(investmentOpportunities, {
		fields: [investmentOpportunityIncentives.id_peluang],
		references: [investmentOpportunities.id_peluang]
	})
}));

export const investmentOpportunityInfosRelations = relations(investmentOpportunityInfos, ({ one }) => ({
	opportunity: one(investmentOpportunities, {
		fields: [investmentOpportunityInfos.id_peluang],
		references: [investmentOpportunities.id_peluang]
	})
}));

export const investmentOpportunityDetailsRelations = relations(investmentOpportunityDetails, ({ one }) => ({
	opportunity: one(investmentOpportunities, {
		fields: [investmentOpportunityDetails.id_peluang],
		references: [investmentOpportunities.id_peluang]
	})
}));


export const regionalPopulation = pgTable('regional_population', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	region_type: text('region_type').notNull(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	id_adm_kabkot: integer('id_adm_kabkot').references(() => admRegencies.id_adm_kabkot),
	tahun: integer('tahun').notNull(),
	jumlah_pria: integer('jumlah_pria'),
	jumlah_wanita: integer('jumlah_wanita')
});

export const regionalUmr = pgTable('regional_umr', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	region_type: text('region_type').notNull(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	id_adm_kabkot: integer('id_adm_kabkot').references(() => admRegencies.id_adm_kabkot),
	tahun: integer('tahun').notNull(),
	nilai: numeric('nilai')
});

export const regionalProfiles = pgTable('regional_profiles', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	region_type: text('region_type').notNull(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	id_adm_kabkot: integer('id_adm_kabkot').references(() => admRegencies.id_adm_kabkot),
	nama: text('nama').notNull(),
	icon_url: text('icon_url'),
	banner_url: text('banner_url'),
	deskripsi: text('deskripsi'),
	profil: text('profil')
});

export const regionalPdrb = pgTable('regional_pdrb', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	region_type: text('region_type').notNull(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	id_adm_kabkot: integer('id_adm_kabkot').references(() => admRegencies.id_adm_kabkot),
	tahun: integer('tahun').notNull(),
	nilai: numeric('nilai')
});

export const regionalInvestmentYearly = pgTable('regional_investment_yearly', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	id_adm_kabkot: integer('id_adm_kabkot').references(() => admRegencies.id_adm_kabkot),
	tahun: integer('tahun').notNull(),
	total_pma: numeric('total_pma'),
	total_pmdn: numeric('total_pmdn')
});

export const regionalInfrastructureItems = pgTable('regional_infrastructure_items', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	infrastructure_type: text('infrastructure_type').notNull(),
	region_type: text('region_type').notNull(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	id_adm_kabkot: integer('id_adm_kabkot').references(() => admRegencies.id_adm_kabkot),
	nama: text('nama'),
	kategori: text('kategori'),
	jenis: text('jenis')
});

export const regionalInvestmentBySector = pgTable('regional_investment_by_sector', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	region_type: text('region_type').notNull(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	id_adm_kabkot: integer('id_adm_kabkot').references(() => admRegencies.id_adm_kabkot),
	nama_sektor: text('nama_sektor'),
	jumlah_investasi: numeric('jumlah_investasi')
});

export const regionalAreaSummaries = pgTable('regional_area_summaries', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	region_type: text('region_type').notNull(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	id_adm_kabkot: integer('id_adm_kabkot').references(() => admRegencies.id_adm_kabkot),
	nama: text('nama'),
	nama_kategori: text('nama_kategori'),
	luas_text: text('luas_text')
});

export const regionalCommoditySectors = pgTable('regional_commodity_sectors', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	id_adm_kabkot: integer('id_adm_kabkot').references(() => admRegencies.id_adm_kabkot),
	nama_sektor: text('nama_sektor').notNull()
});

export const regionalOffices = pgTable('regional_offices', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	region_type: text('region_type').notNull(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	id_adm_kabkot: integer('id_adm_kabkot').references(() => admRegencies.id_adm_kabkot),
	nama: text('nama').notNull(),
	alamat: text('alamat'),
	no_telp: text('no_telp')
});

export const regionalStudies = pgTable('regional_studies', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	id_adm_provinsi: integer('id_adm_provinsi').references(() => admProvinces.id_adm_provinsi),
	judul: text('judul').notNull(),
	deskripsi: text('deskripsi'),
	tahun: integer('tahun')
});

export const regionalStudyFiles = pgTable('regional_study_files', {
	id: bigint('id', { mode: 'bigint' }).primaryKey(),
	id_regional_study: bigint('id_regional_study', { mode: 'bigint' }).references(() => regionalStudies.id),
	file_url: text('file_url').notNull(),
	file_name: text('file_name')
});

export * from './auth.schema';



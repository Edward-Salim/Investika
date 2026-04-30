
/**
 * Utility to provide realistic mock data for investment project details
 * when the database contains NULL values.
 */

const SCHEMES = [
    'Pemerintah - Badan Usaha (KPBU)',
    'Direct Investment',
    'Joint Venture',
    'Build-Operate-Transfer (BOT)',
    'Public Private Partnership (PPP)'
];

const READINESS_PHASES = [
    'Pre-Feasibility Study',
    'Feasibility Study',
    'Ready to Offer',
    'Under Construction',
    'Operational'
];

const KAWASAN_TYPES = [
    'KEK (Kawasan Ekonomi Khusus)',
    'Kawasan Industri',
    'Kawasan Pariwisata Strategis',
    'Kawasan Strategis Nasional'
];

const NAMES = [
    'Bambang Wijaya',
    'Siti Aminah',
    'Budi Santoso',
    'Dewi Sartika',
    'Hendra Kurniawan'
];

export function enrichProjectWithMockData(project: any) {
    if (!project) return project;

    // Ensure details object exists
    if (!project.details) {
        project.details = {
            id_peluang: project.id_peluang,
            kode_kbli: null,
            alamat: null,
            lokasi_kawasan: null,
            is_ikn: false,
            is_ipro: false,
            luas_lahan: null,
            skema_kerja_sama: null,
            readiness_status: null,
            contact_name: null,
            contact_phone: null,
            contact_email: null,
            lat: null,
            lon: null
        };
    }

    const d = project.details;

    // Fill NULLs with random but deterministic-ish mock data based on id_peluang
    const seed = project.id_peluang || 0;
    
    if (!d.skema_kerja_sama) {
        d.skema_kerja_sama = SCHEMES[seed % SCHEMES.length];
    }
    
    if (!d.readiness_status) {
        d.readiness_status = READINESS_PHASES[seed % READINESS_PHASES.length];
    }

    if (!d.luas_lahan) {
        // Random land area between 10 and 500 Ha
        const area = (seed % 490) + 10;
        d.luas_lahan = `${area} Ha`;
    }

    if (!d.kode_kbli) {
        // Random 5 digit KBLI
        const kbli = (seed % 90000) + 10000;
        d.kode_kbli = kbli.toString();
    }

    if (!d.alamat && project.nama_kabkot) {
        d.alamat = `Jl. Raya ${project.nama_kabkot}, No. ${seed % 100 + 1}, ${project.nama_kabkot}, ${project.nama_provinsi || ''}`;
    }

    if (!d.lokasi_kawasan) {
        d.lokasi_kawasan = KAWASAN_TYPES[seed % KAWASAN_TYPES.length];
    }

    if (!d.contact_name) {
        d.contact_name = NAMES[seed % NAMES.length];
    }

    if (!d.contact_email) {
        const namePart = d.contact_name.toLowerCase().replace(' ', '.');
        d.contact_email = `${namePart}@invest-indonesia.go.id`;
    }

    if (!d.contact_phone) {
        d.contact_phone = `+62 812 ${1000 + (seed % 8999)} ${1000 + (seed % 8999)}`;
    }

    // Default boolean logic if null/undefined
    if (d.is_ipro === null || d.is_ipro === undefined) {
        d.is_ipro = seed % 3 === 0; // 33% chance
    }

    if (d.is_ikn === null || d.is_ikn === undefined) {
        d.is_ikn = project.nama_provinsi === 'Kalimantan Timur';
    }

    // Mock relational data
    if (!project.contacts || project.contacts.length === 0) {
        project.contacts = [
            {
                nama: d.contact_name || 'Ministry of Investment Official',
                email: d.contact_email || 'invest@bkpm.go.id',
                telepon: d.contact_phone || '+62 21 520 2015',
                alamat: d.alamat || 'Jakarta, Indonesia'
            }
        ];
    }

    if (!project.incentives || project.incentives.length === 0) {
        project.incentives = [
            {
                nama: 'Tax Holiday (Pioneering Industry)',
                keterangan: 'Corporate income tax reduction of up to 100% for 5-20 years depending on the total investment value.'
            },
            {
                nama: 'Import Duty Exemption',
                keterangan: 'Exemption from import duties on machinery, goods, and materials imported for industrial production.'
            }
        ];
    }

    if (!project.infos || project.infos.length === 0) {
        project.infos = [
            {
                nama: 'Executive Summary & Factsheet',
                url_rest: '#'
            },
            {
                nama: 'Pre-Feasibility Study (Pre-FS)',
                url_rest: '#'
            }
        ];
    }

    if (!project.galleries || project.galleries.length === 0) {
        project.galleries = [
            { image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop' },
            { image_url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&auto=format&fit=crop' },
            { image_url: 'https://images.unsplash.com/photo-1464039397811-476f652a343b?w=800&auto=format&fit=crop' }
        ];
    }

    return project;
}



export function generateMockProject(id: number) {
    const project = {
        id_peluang: id,
        nama: `Strategic Investment Project #${id}`,
        nama_provinsi: 'DKI Jakarta',
        nama_kabkot: 'Jakarta Pusat',
        nama_sektor: 'Tersier',
        nama_sektor_peluang: 'Technology',
        deskripsi: 'A high-impact strategic investment opportunity in Indonesia\'s growing digital ecosystem.',
        status: 'Ready to Offer',
        nilai_investasi: 'Rp 500,0M',
        nilai_irr: '18%',
        nilai_npv: 'Rp 150,0M',
        image_url: null,
        details: null
    };
    return enrichProjectWithMockData(project);
}

export function getMockProjects(count: number = 6) {
    return Array.from({ length: count }, (_, i) => generateMockProject(1000 + i));
}

export function getMockProvinces() {
    return [
        { id_adm_provinsi: 1, nama: 'DKI Jakarta', wilayah_group: 'wilayah indonesia bagian barat' },
        { id_adm_provinsi: 2, nama: 'Jawa Barat', wilayah_group: 'wilayah indonesia bagian barat' },
        { id_adm_provinsi: 3, nama: 'Jawa Timur', wilayah_group: 'wilayah indonesia bagian barat' },
        { id_adm_provinsi: 4, nama: 'Bali', wilayah_group: 'wilayah indonesia bagian tengah' },
        { id_adm_provinsi: 5, nama: 'Kalimantan Timur', wilayah_group: 'wilayah indonesia bagian tengah' }
    ];
}

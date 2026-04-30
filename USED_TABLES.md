# Database Tables Used

The following tables are currently being used in the Investika project to provide live data for investment opportunities and regional insights:

| Table Name | Description | Used In |
| Table Name | Description | Used In |
| --- | --- | --- |
| `investment_opportunities` | Core table containing all PIR investment project records, including CAPEX, IRR, and NPV strings. | Homepage (`/`), Project Detail (`/project/[id]`) |
| `adm_provinces` | Master data for Indonesia's provinces. | Regions Page (`/regions`) - *Implementation in progress* |
| `adm_regencies` | Master data for Indonesia's regencies (Kabupaten/Kota). | Regions Page (`/regions`) - *Implementation in progress* |
| `regional_profiles` | Detailed regional statistics (Population, UMR, etc.). | Regions Page (`/regions`) - *Implementation in progress* |
| `regional_pdrb` | Regional economic data (GRDP/PDRB). | Regions Page (`/regions`) - *Implementation in progress* |
| `regional_umr` | Regional minimum wage data. | Regions Page (`/regions`) - *Implementation in progress* |
| `regional_population` | Regional demographic data. | Regions Page (`/regions`) - *Implementation in progress* |

## Schema Details

### investment_opportunities

- `id_peluang`: Primary Key
- `nama`: Project Name
- `nilai_investasi`: Raw string for CAPEX (e.g., "Rp 395,5M")
- `nilai_irr`: Raw string for IRR (e.g., "15%")
- `nilai_npv`: Raw string for NPV (e.g., "Rp 126,0M")
- `nama_kabkot`: Regency Name
- `nama_sektor_peluang`: Main Sector Name (e.g., "Pariwisata")

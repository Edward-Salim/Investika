<script lang="ts">
	import { onMount, tick } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { Maximize, Plane, Anchor, Zap, Factory, MapPin } from 'lucide-svelte';
	// Leaflet styling
	import 'leaflet/dist/leaflet.css';

	let { 
		items = [], 
		projects = [],
		centerLat, 
		centerLon, 
		regionName = '' 
	} = $props<{ 
		items: any[], 
		projects?: any[],
		centerLat: number | null, 
		centerLon: number | null, 
		regionName?: string 
	}>();

	let mapElement: HTMLElement;
	let map: any;
	let L: any;
	let geoJsonLayer: any;
	let markerClusterGroup: any;
	let projectsLayer: any;

	const GEOJSON_URL = 'https://raw.githubusercontent.com/ans-4175/peta-indonesia-geojson/master/indonesia-prov.geojson';

	const getInfraIcon = (type: string) => {
		const lowerType = type?.toLowerCase() || '';
		if (lowerType.includes('bandara') || lowerType.includes('airport')) return '✈️';
		if (lowerType.includes('pelabuhan') || lowerType.includes('port')) return '⚓';
		if (lowerType.includes('listrik') || lowerType.includes('power')) return '⚡';
		if (lowerType.includes('industri') || lowerType.includes('industrial')) return '🏭';
		return '📍';
	};

	const getInfraColor = (type: string) => {
		const lowerType = type?.toLowerCase() || '';
		if (lowerType.includes('bandara') || lowerType.includes('airport')) return '#3b82f6'; // Blue
		if (lowerType.includes('pelabuhan') || lowerType.includes('port')) return '#0ea5e9'; // Cyan
		if (lowerType.includes('listrik') || lowerType.includes('power')) return '#eab308'; // Yellow
		if (lowerType.includes('industri') || lowerType.includes('industrial')) return '#8b5cf6'; // Purple
		return '#64748b'; // Slate
	};

	let activeFilters = $state<string[]>(['airport', 'port', 'power', 'industrial', 'other', 'investment']);

	const toggleFilter = (type: string) => {
		if (activeFilters.includes(type)) {
			activeFilters = activeFilters.filter(f => f !== type);
		} else {
			activeFilters = [...activeFilters, type];
		}
		renderMarkers();
	};

	const toggleAll = () => {
		const allPossible = ['airport', 'port', 'power', 'industrial', 'other', 'investment'];
		if (activeFilters.length === allPossible.length) {
			activeFilters = [];
		} else {
			activeFilters = allPossible;
		}
		renderMarkers();
	};

	const getNormalizedType = (type: string) => {
		const lower = type?.toLowerCase() || '';
		if (lower.includes('bandara') || lower.includes('airport')) return 'airport';
		if (lower.includes('pelabuhan') || lower.includes('port')) return 'port';
		if (lower.includes('listrik') || lower.includes('power')) return 'power';
		if (lower.includes('industri') || lower.includes('industrial')) return 'industrial';
		return 'other';
	};

	const typeCounts = $derived({
		airport: items.filter((i: any) => getNormalizedType(i.infrastructure_type || i.jenis) === 'airport').length,
		port: items.filter((i: any) => getNormalizedType(i.infrastructure_type || i.jenis) === 'port').length,
		power: items.filter((i: any) => getNormalizedType(i.infrastructure_type || i.jenis) === 'power').length,
		industrial: items.filter((i: any) => getNormalizedType(i.infrastructure_type || i.jenis) === 'industrial').length,
		other: items.filter((i: any) => getNormalizedType(i.infrastructure_type || i.jenis) === 'other').length,
		investment: projects.length
	});

	const renderMarkers = () => {
		if (!markerClusterGroup || !projectsLayer || !items || !L) return;
		
		markerClusterGroup.clearLayers();
		projectsLayer.clearLayers();

		console.log(`[InfraMap] renderMarkers called. Items: ${items?.length}, Projects: ${projects?.length}`);
		let addedInfraCount = 0;
		let skippedInfraCount = 0;

		// Infrastructure Markers (Clustered)
		items.forEach((item: any) => {
			const type = getNormalizedType(item.infrastructure_type || item.jenis);
			if (!activeFilters.includes(type)) return;

			const lat = Number(item.lat);
			const lon = Number(item.lon);
			
			// Sanity check coordinates for Indonesia bounds and proximity to center
			const isValidCoord = !isNaN(lat) && !isNaN(lon) && lat !== 0 && 
				lat > -15 && lat < 15 && lon > 90 && lon < 145 &&
				(!centerLat || Math.abs(lat - centerLat) < 5) &&
				(!centerLon || Math.abs(lon - centerLon) < 5);
			
			if (isValidCoord) {
				const color = getInfraColor(item.infrastructure_type || item.jenis);
				const icon = L.divIcon({
					className: 'infra-marker-container',
					html: `
						<div class="infra-dot-container" style="--infra-color: ${color}">
							<div class="infra-dot"></div>
							<div class="infra-dot-pulse"></div>
							<div class="infra-dot-icon">${getInfraIcon(item.infrastructure_type || item.jenis)}</div>
						</div>
					`,
					iconSize: [16, 16],
					iconAnchor: [8, 8]
				});

				const marker = L.marker([lat, lon], { icon });
				marker.bindPopup(`
					<div class="infra-popup">
						<div class="infra-popup-header" style="background:${color}">
							<div class="infra-popup-emoji">${getInfraIcon(item.infrastructure_type || item.jenis)}</div>
							<div class="infra-popup-title-wrap">
								<div class="infra-popup-type">${(item.infrastructure_type || item.jenis || 'Asset').toUpperCase()}</div>
								<div class="infra-popup-name">${(item.nama || '').toUpperCase()}</div>
							</div>
						</div>
						<div class="infra-popup-body">
							<div class="infra-popup-coords">📍 ${lat.toFixed(4)}°, ${lon.toFixed(4)}°</div>
						</div>
					</div>
				`, { closeButton: false, offset: [0, -4], className: 'infra-custom-popup' });
				
				markerClusterGroup.addLayer(marker);
				addedInfraCount++;
			} else {
				skippedInfraCount++;
			}
		});
		console.log(`[InfraMap] Added ${addedInfraCount} infra markers, skipped ${skippedInfraCount}`);

		// Investment Opportunity Pins (Standalone - Not Clustered)
		if (activeFilters.includes('investment')) {
			projects.forEach((project: any) => {
				// Try details.lat or direct lat
				let lat = Number(project.details?.lat || project.lat);
				let lon = Number(project.details?.lon || project.lon);

				// Fallback to region center with small jitter if missing
				if ((isNaN(lat) || lat === 0) && centerLat) {
					lat = centerLat + (Math.random() - 0.5) * 0.1;
					lon = centerLon! + (Math.random() - 0.5) * 0.1;
				}

				// Sanity check coordinates for Indonesia bounds and proximity to center
				const isValidCoord = !isNaN(lat) && !isNaN(lon) && lat !== 0 && 
					lat > -15 && lat < 15 && lon > 90 && lon < 145 &&
					(!centerLat || Math.abs(lat - centerLat) < 5) &&
					(!centerLon || Math.abs(lon - centerLon) < 5);

				if (isValidCoord) {
					const icon = L.divIcon({
						className: 'infra-marker-container',
						html: `
							<div class="infra-dot-container" style="--infra-color: #10b981">
								<div class="infra-dot investment-pin"></div>
								<div class="infra-dot-pulse"></div>
								<div class="infra-dot-icon">💼</div>
							</div>
						`,
						iconSize: [16, 16],
						iconAnchor: [8, 8]
					});

					const name = (project.title || project.nama || '').toUpperCase();
					const capex = project.capex || project.nilai_investasi || '-';

					const marker = L.marker([lat, lon], { 
						icon, 
						zIndexOffset: 100,
						riseOnHover: true 
					});
					marker.bindPopup(`
						<div class="infra-popup">
							<div class="infra-popup-header" style="background:#10b981">
								<div class="infra-popup-emoji">💼</div>
								<div class="infra-popup-title-wrap">
									<div class="infra-popup-type">Investment Opportunity</div>
									<div class="infra-popup-name">${name}</div>
								</div>
							</div>
							<div class="infra-popup-body">
								<div class="infra-popup-coords" style="color:#10b981;font-weight:800">CAPEX: ${capex}</div>
							</div>
						</div>
					`, { closeButton: false, offset: [0, -4], className: 'infra-custom-popup' });
					
					projectsLayer.addLayer(marker);
				}
			});
		}
	};

	const initMap = async () => {
		if (!centerLat || !centerLon) return;
		
		const leafletModule = await import('leaflet');
		const baseL = leafletModule.default || leafletModule;
		
		if (typeof window !== 'undefined') {
			if (!(window as any).L) {
				(window as any).L = baseL;
			}
		}

		// @ts-ignore
		await import('leaflet.markercluster');

		L = (window as any).L || baseL;

		if (map) {
			map.remove();
			map = null;
			markerClusterGroup = null;
			projectsLayer = null;
		}

		map = L.map(mapElement, {
			zoomControl: false,
			dragging: true,
			scrollWheelZoom: true,
			attributionControl: false
		}).setView([centerLat, centerLon], 8);

		L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
			maxZoom: 18,
		}).addTo(map);

		// Layer for standalone projects
		projectsLayer = L.layerGroup().addTo(map);

		// Cluster group for infrastructure
		// @ts-ignore
		markerClusterGroup = L.markerClusterGroup({
			showCoverageOnHover: false,
			zoomToBoundsOnClick: true,
			spiderfyOnMaxZoom: true,
			maxClusterRadius: 40,
			iconCreateFunction: function(cluster: any) {
				const count = cluster.getChildCount();
				return L.divIcon({
					html: `<div class="infra-cluster"><span>${count}</span></div>`,
					className: 'infra-cluster-container',
					iconSize: [36, 36]
				});
			}
		});
		map.addLayer(markerClusterGroup);

		renderMarkers();

		// Fetch and draw boundary (Non-blocking for markers)
		try {
			const response = await fetch(GEOJSON_URL);
			const data = await response.json();
			const targetName = regionName.toUpperCase()
				.replace('PROVINSI ', '')
				.replace('DAERAH ISTIMEWA ', '')
				.replace('-', ' ')
				.trim();

			let searchName = targetName;
			// Map newer provinces to older GeoJSON regions as fallback
			if (['PAPUA PEGUNUNGAN', 'PAPUA TENGAH', 'PAPUA SELATAN'].includes(targetName)) searchName = 'PAPUA';
			else if (targetName === 'PAPUA BARAT DAYA') searchName = 'PAPUA BARAT';
			else if (targetName.includes('BANGKA BELITUNG')) searchName = 'BANGKA BELITUNG';

			const feature = data.features.find((f: any) => {
				const pName = f.properties.Propinsi.toUpperCase().replace('-', ' ');
				return pName === searchName || pName.includes(searchName) || searchName.includes(pName);
			});

			if (feature) {
				geoJsonLayer = L.geoJSON(feature, {
					style: {
						color: '#005CAB',
						weight: 3,
						opacity: 0.8,
						fillColor: '#005CAB',
						fillOpacity: 0.03,
						dashArray: '8, 8',
						lineJoin: 'round'
					}
				}).addTo(map);
			}
		} catch (err) {
			console.warn('Could not load region boundary:', err);
		}

		const isValidCoord = (lat: number, lon: number) => 
			!isNaN(lat) && !isNaN(lon) && lat !== 0 && lat > -15 && lat < 15 && lon > 90 && lon < 145 &&
			(!centerLat || Math.abs(lat - centerLat) < 5) &&
			(!centerLon || Math.abs(lon - centerLon) < 5);

		const validItems = items.filter((i: any) => isValidCoord(Number(i.lat), Number(i.lon)));
		if (validItems.length > 0) {
			const group = new L.FeatureGroup(validItems.map((i: any) => L.marker([Number(i.lat), Number(i.lon)])));
			map.fitBounds(group.getBounds().pad(0.2));
		}

		await tick();
		map.invalidateSize();
	};

	const resetZoom = () => {
		if (!map || !items || !L) return;
		
		const isValidCoord = (lat: number, lon: number) => 
			!isNaN(lat) && !isNaN(lon) && lat !== 0 && lat > -15 && lat < 15 && lon > 90 && lon < 145 &&
			(!centerLat || Math.abs(lat - centerLat) < 5) &&
			(!centerLon || Math.abs(lon - centerLon) < 5);

		const filteredInfra = items.filter((i: any) => isValidCoord(Number(i.lat), Number(i.lon)) && activeFilters.includes(getNormalizedType(i.infrastructure_type || i.jenis)));
		const filteredProjects = activeFilters.includes('investment') ? projects : [];
		
		const allMarkers = [
			...filteredInfra.map((i: any) => L.marker([i.lat, i.lon])),
			...filteredProjects.map((p: any) => L.marker([p.details?.lat || p.lat || centerLat, p.details?.lon || p.lon || centerLon]))
		].filter(m => !isNaN(m.getLatLng().lat));

		if (allMarkers.length > 0) {
			const group = new L.FeatureGroup(allMarkers);
			map.fitBounds(group.getBounds().pad(0.2));
		} else if (centerLat && centerLon) {
			map.setView([centerLat, centerLon], 8);
		}
	};

	const zoomIn = () => map?.zoomIn();
	const zoomOut = () => map?.zoomOut();

	$effect(() => {
		// Track ALL region-dependent props so any change triggers a full re-init
		const _centerLat = centerLat;
		const _centerLon = centerLon;
		const _items = items;
		const _projects = projects;
		const _regionName = regionName;

		if (_centerLat && _centerLon && mapElement) {
			initMap();
		}
	});

	onMount(() => {
		const link1 = document.createElement('link');
		link1.rel = 'stylesheet';
		link1.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
		document.head.appendChild(link1);

		const link2 = document.createElement('link');
		link2.rel = 'stylesheet';
		link2.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css';
		document.head.appendChild(link2);

		return () => {
			map?.remove();
			document.head.removeChild(link1);
			document.head.removeChild(link2);
		};
	});
</script>

<div class="relative w-full h-full bg-[#f8fafc] overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[500px]">
	<div bind:this={mapElement} class="w-full h-full"></div>



	<!-- Interactive Map Legend -->
	<div class="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
		<div class="rounded-[24px] bg-white/90 backdrop-blur-xl p-4 shadow-xl shadow-slate-200/50 border border-white/50 space-y-3 min-w-[160px]">
			<button class="w-full flex items-center justify-between group cursor-pointer border-none bg-transparent p-0 focus:outline-none" onclick={toggleAll}>
				<h4 class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-bkpm-blue transition-colors">{(m as any).map_legend_title()}</h4>
				<div class="w-1.5 h-1.5 rounded-full {activeFilters.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}"></div>
			</button>
			<div class="space-y-1.5">
				<button 
					onclick={() => toggleFilter('airport')}
					disabled={typeCounts.airport === 0}
					class="w-full flex items-center gap-2.5 p-1.5 rounded-xl transition-all {typeCounts.airport === 0 ? 'opacity-20 cursor-not-allowed' : (activeFilters.includes('airport') ? 'bg-blue-50/50' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0')}"
				>
					<div class="text-[10px] w-3 flex justify-center">✈️</div>
					<div class="flex flex-1 items-center justify-between">
						<span class="text-[9px] font-black text-slate-700 uppercase tracking-tight">{(m as any).map_legend_airports()}</span>
						<span class="text-[8px] font-bold text-slate-400">{typeCounts.airport}</span>
					</div>
				</button>
				<button 
					onclick={() => toggleFilter('port')}
					disabled={typeCounts.port === 0}
					class="w-full flex items-center gap-2.5 p-1.5 rounded-xl transition-all {typeCounts.port === 0 ? 'opacity-20 cursor-not-allowed' : (activeFilters.includes('port') ? 'bg-cyan-50/50' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0')}"
				>
					<div class="text-[10px] w-3 flex justify-center">⚓</div>
					<div class="flex flex-1 items-center justify-between">
						<span class="text-[9px] font-black text-slate-700 uppercase tracking-tight">{(m as any).map_legend_ports()}</span>
						<span class="text-[8px] font-bold text-slate-400">{typeCounts.port}</span>
					</div>
				</button>
				<button 
					onclick={() => toggleFilter('power')}
					disabled={typeCounts.power === 0}
					class="w-full flex items-center gap-2.5 p-1.5 rounded-xl transition-all {typeCounts.power === 0 ? 'opacity-20 cursor-not-allowed' : (activeFilters.includes('power') ? 'bg-yellow-50/50' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0')}"
				>
					<div class="text-[10px] w-3 flex justify-center">⚡</div>
					<div class="flex flex-1 items-center justify-between">
						<span class="text-[9px] font-black text-slate-700 uppercase tracking-tight">{(m as any).map_legend_energy()}</span>
						<span class="text-[8px] font-bold text-slate-400">{typeCounts.power}</span>
					</div>
				</button>
				<button 
					onclick={() => toggleFilter('industrial')}
					disabled={typeCounts.industrial === 0}
					class="w-full flex items-center gap-2.5 p-1.5 rounded-xl transition-all {typeCounts.industrial === 0 ? 'opacity-20 cursor-not-allowed' : (activeFilters.includes('industrial') ? 'bg-purple-50/50' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0')}"
				>
					<div class="text-[10px] w-3 flex justify-center">🏭</div>
					<div class="flex flex-1 items-center justify-between">
						<span class="text-[9px] font-black text-slate-700 uppercase tracking-tight">{(m as any).map_legend_industrial()}</span>
						<span class="text-[8px] font-bold text-slate-400">{typeCounts.industrial}</span>
					</div>
				</button>
				<button 
					onclick={() => toggleFilter('other')}
					disabled={typeCounts.other === 0}
					class="w-full flex items-center gap-2.5 p-1.5 rounded-xl transition-all {typeCounts.other === 0 ? 'opacity-20 cursor-not-allowed' : (activeFilters.includes('other') ? 'bg-slate-50/50' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0')}"
				>
					<div class="text-[10px] w-3 flex justify-center">📍</div>
					<div class="flex flex-1 items-center justify-between">
						<span class="text-[9px] font-black text-slate-700 uppercase tracking-tight">{(m as any).map_legend_other()}</span>
						<span class="text-[8px] font-bold text-slate-400">{typeCounts.other}</span>
					</div>
				</button>
				<div class="border-t border-slate-100 pt-1.5 mt-0.5">
					<button 
						onclick={() => toggleFilter('investment')}
						disabled={typeCounts.investment === 0}
						class="w-full flex items-center gap-2.5 p-1.5 rounded-xl transition-all {typeCounts.investment === 0 ? 'opacity-20 cursor-not-allowed' : (activeFilters.includes('investment') ? 'bg-emerald-50/50' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0')}"
					>
						<div class="text-[10px] w-3 flex justify-center">💼</div>
						<div class="flex flex-1 items-center justify-between">
							<span class="text-[9px] font-black text-slate-700 uppercase tracking-tight">{(m as any).map_legend_investments()}</span>
							<span class="text-[8px] font-bold text-slate-400">{typeCounts.investment}</span>
						</div>
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Bottom Right Controls -->
	<div class="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
		<div class="flex flex-col rounded-2xl bg-white/90 backdrop-blur-xl shadow-xl shadow-slate-200/50 border border-white/50 overflow-hidden">
			<button 
				onclick={zoomIn}
				class="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-bkpm-blue transition-all border-b border-slate-100"
				title="Zoom In"
			>
				<span class="text-lg font-bold">+</span>
			</button>
			<button 
				onclick={zoomOut}
				class="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-bkpm-blue transition-all"
				title="Zoom Out"
			>
				<span class="text-lg font-bold">−</span>
			</button>
		</div>

		<button 
			onclick={resetZoom}
			class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-xl shadow-xl shadow-slate-200/50 border border-white/50 text-slate-600 hover:text-bkpm-blue transition-all group"
			title="Reset View"
		>
			<Maximize size={18} class="group-hover:scale-110 transition-transform" />
		</button>
	</div>
</div>

<style>
	:global(.leaflet-container) {
		background: #f8fafc !important;
		z-index: 1 !important;
	}

	/* Clustering Styles */
	:global(.infra-cluster-container) {
		background: none !important;
		border: none !important;
	}

	:global(.infra-cluster) {
		width: 36px;
		height: 36px;
		background: #005CAB;
		border: 3px solid white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 900;
		font-size: 11px;
		box-shadow: 0 4px 12px rgba(0, 92, 171, 0.4);
		transition: all 0.3s ease;
	}

	:global(.infra-cluster:hover) {
		transform: scale(1.1);
		box-shadow: 0 8px 24px rgba(0, 92, 171, 0.5);
	}

	/* Marker Styles */
	:global(.infra-marker-container) {
		background: none !important;
		border: none !important;
	}

	:global(.infra-dot-container) {
		position: relative;
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	:global(.infra-dot) {
		width: 10px;
		height: 10px;
		background: var(--infra-color);
		border: 2px solid white;
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0,0,0,0.2);
		z-index: 2;
		transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	:global(.investment-pin) {
		width: 14px;
		height: 14px;
		border: 2.5px solid white;
		z-index: 10;
	}

	:global(.infra-dot-container:hover .infra-dot) {
		transform: scale(1.4);
	}

	:global(.infra-dot-icon) {
		position: absolute;
		top: -18px;
		font-size: 12px;
		opacity: 0;
		transform: translateY(10px);
		transition: all 0.3s ease;
		pointer-events: none;
	}

	:global(.infra-dot-container:hover .infra-dot-icon) {
		opacity: 1;
		transform: translateY(0);
	}

	:global(.infra-dot-pulse) {
		position: absolute;
		width: 100%;
		height: 100%;
		background: var(--infra-color);
		opacity: 0.3;
		border-radius: 50%;
		animation: infra-pulse 2s infinite;
		z-index: 1;
		pointer-events: none;
	}

	@keyframes infra-pulse {
		0% { transform: scale(0.5); opacity: 0.5; }
		100% { transform: scale(2); opacity: 0; }
	}

	/* Popup Styles */
	:global(.infra-custom-popup .leaflet-popup-content-wrapper) {
		padding: 0;
		overflow: hidden;
		border-radius: 20px;
		box-shadow: 0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
		border: none;
		min-width: 200px;
		font-family: inherit;
	}

	:global(.infra-custom-popup .leaflet-popup-content) {
		margin: 0;
		width: auto !important;
	}

	:global(.infra-popup-header) {
		padding: 12px 14px;
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}

	:global(.infra-popup-emoji) {
		font-size: 18px;
		flex-shrink: 0;
		line-height: 1;
	}

	:global(.infra-popup-title-wrap) {
		min-width: 0;
		flex: 1;
	}

	:global(.infra-popup-type) {
		font-size: 8px;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(255,255,255,0.7);
		line-height: 1;
		margin-bottom: 3px;
	}

	:global(.infra-popup-name) {
		font-size: 11px;
		font-weight: 900;
		color: white;
		letter-spacing: 0.02em;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 160px;
	}

	:global(.infra-popup-body) {
		padding: 10px 14px;
		background: white;
	}

	:global(.infra-popup-coords) {
		font-size: 10px;
		color: #64748b;
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	:global(.leaflet-popup-tip-container) {
		display: none;
	}

	/* Cluster Styles */
	:global(.infra-cluster-container) {
		background: transparent;
		border: none;
	}

	:global(.infra-cluster) {
		width: 36px;
		height: 36px;
		background: #005CAB;
		border: 3px solid white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 900;
		font-size: 13px;
		box-shadow: 0 4px 12px rgba(0, 92, 171, 0.3);
		transition: all 0.2s ease;
		font-family: inherit;
	}

	:global(.infra-cluster:hover) {
		transform: scale(1.1);
		background: #004a8a;
		box-shadow: 0 6px 16px rgba(0, 92, 171, 0.4);
	}

	/* Unified Font for all map elements */
	:global(.leaflet-container) {
		font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
	}
</style>

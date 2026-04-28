<script lang="ts">
	import { onMount } from 'svelte';
	// Leaflet styling
	import 'leaflet/dist/leaflet.css';

	let mapElement: HTMLElement;
	let map: any;

	onMount(async () => {
		// Import leaflet dynamically to avoid SSR issues
		const L = await import('leaflet');

		// Fix default icon paths for Leaflet in Vite
		delete (L.Icon.Default.prototype as any)._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
			iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
		});

		// Indonesia center
		map = L.map(mapElement, {
			zoomControl: false // we can add it somewhere else or keep it hidden for aesthetics
		}).setView([-2.5489, 118.0149], 5);

		// Minimalist map tile (CartoDB Positron) for a sleek UI
		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			attribution: '© OpenStreetMap contributors, © CartoDB',
			maxZoom: 18,
		}).addTo(map);

		// Add a sleek zoom control
		L.control.zoom({ position: 'bottomright' }).addTo(map);

		// Example markers for specific daerah (regions)
		const regions = [
			{ name: 'DKI Jakarta', coords: [-6.2088, 106.8456], desc: 'Capital region, tech & infrastructure hub.' },
			{ name: 'West Java', coords: [-6.9147, 107.6098], desc: 'Manufacturing and industrial estates.' },
			{ name: 'East Kalimantan', coords: [-0.5022, 117.1536], desc: 'Future capital (IKN), energy transition.' },
			{ name: 'Bali', coords: [-8.3405, 115.0920], desc: 'Eco-tourism and hospitality investments.' },
			{ name: 'North Sumatra', coords: [2.1154, 99.5451], desc: 'Agriculture and special economic zones.' },
		];

		regions.forEach(r => {
			const marker = L.marker(r.coords as L.LatLngExpression).addTo(map);
			marker.bindPopup(`<div class="font-sans"><h4 class="font-bold text-bkpm-blue mb-1">${r.name}</h4><p class="text-xs text-slate-600 m-0 leading-tight">${r.desc}</p></div>`);
		});

		return () => {
			map?.remove();
		};
	});
</script>

<div class="relative w-full h-full bg-slate-50 border border-slate-100 overflow-hidden shadow-inner">
	<div bind:this={mapElement} class="w-full h-full"></div>
</div>

<style>
	/* Make sure the map doesn't overflow or conflict with tailwind z-indexes */
	:global(.leaflet-container) {
		z-index: 10 !important;
		font-family: inherit;
	}
	:global(.leaflet-popup-content-wrapper) {
		border-radius: 12px;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
	}
</style>

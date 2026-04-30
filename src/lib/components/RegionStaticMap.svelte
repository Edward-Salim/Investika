<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	// Leaflet styling
	import 'leaflet/dist/leaflet.css';
	import { getSimpleRegionBoundaries } from '$lib/utils/region-boundaries';

	let { lat, lon, zoom = 7, name = '' } = $props<{ lat: number | null, lon: number | null, zoom?: number, name?: string }>();

	let mapElement: HTMLElement;
	let map: any;
	let geoJsonLayer: any;
	let hasMounted = $state(false);

	const initMap = async () => {
		if (!lat || !lon) return;
		
		// Import leaflet dynamically
		const L = await import('leaflet');

		if (map) {
			map.remove();
		}

		map = L.map(mapElement, {
			zoomControl: false,
			dragging: false,
			touchZoom: false,
			doubleClickZoom: false,
			scrollWheelZoom: false,
			boxZoom: false,
			keyboard: false,
			attributionControl: false
		}).setView([lat, lon], zoom);

		// Premium Light Map Tile
		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			maxZoom: 18,
		}).addTo(map);

		// Fetch and draw boundary
		try {
			const data = await getSimpleRegionBoundaries();
			
			// Normalize name for matching
			const targetName = name.toUpperCase().replace('PROVINSI ', '').replace('DAERAH ISTIMEWA ', '').trim();
			
			const feature = data.features.find((f: any) => {
				const pName = f.properties.Propinsi.toUpperCase();
				return pName.includes(targetName) || targetName.includes(pName);
			});

			if (feature) {
				geoJsonLayer = L.geoJSON(feature, {
					style: {
						color: '#005CAB',
						weight: 2,
						opacity: 0.6,
						fillColor: '#005CAB',
						fillOpacity: 0.05,
						lineJoin: 'round'
					}
				}).addTo(map);
				
				map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20], animate: false });
			}
		} catch (err) {
			console.warn('Could not load region boundary:', err);
		}

		// Ensure map fills container correctly after layout
		await tick();
		map.invalidateSize();
	};

	$effect(() => {
		if (browser && hasMounted && lat && lon && mapElement) {
			initMap();
		}
	});

	onMount(() => {
		hasMounted = true;

		return () => {
			map?.remove();
		};
	});
</script>

<div class="relative w-full h-full bg-white overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
	<div bind:this={mapElement} class="w-full h-full transition-opacity duration-700"></div>
</div>

<style>
	:global(.leaflet-container) {
		background: #ffffff !important;
		z-index: 1 !important;
	}
</style>

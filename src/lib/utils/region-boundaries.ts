const SIMPLE_GEOJSON_URL =
	'https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json';
const DETAILED_GEOJSON_URL =
	'https://raw.githubusercontent.com/ans-4175/peta-indonesia-geojson/master/indonesia-prov.geojson';

let simpleGeoJsonPromise: Promise<any> | null = null;
let detailedGeoJsonPromise: Promise<any> | null = null;

async function fetchJson(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch GeoJSON from ${url}`);
	}

	return response.json();
}

export function getSimpleRegionBoundaries() {
	if (!simpleGeoJsonPromise) {
		simpleGeoJsonPromise = fetchJson(SIMPLE_GEOJSON_URL);
	}

	return simpleGeoJsonPromise;
}

export function getDetailedRegionBoundaries() {
	if (!detailedGeoJsonPromise) {
		detailedGeoJsonPromise = fetchJson(DETAILED_GEOJSON_URL);
	}

	return detailedGeoJsonPromise;
}


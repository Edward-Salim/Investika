import { getLocale } from '$lib/paraglide/runtime';
import { settingsStore } from '$lib/state/settings.svelte';

const EXCHANGE_RATES: Record<string, number> = {
	'en': 1 / 16000,   // IDR to USD
	'id': 1,           // IDR to IDR
	'zh': 1 / 2200,    // IDR to CNY
	'ja': 1 / 100,     // IDR to JPY
	'ko': 1 / 11       // IDR to KRW
};

const CURRENCY_CODES: Record<string, string> = {
	'en': 'USD',
	'id': 'IDR',
	'zh': 'CNY',
	'ja': 'JPY',
	'ko': 'KRW'
};

const LOCALE_MAP: Record<string, string> = {
	'en': 'en-US',
	'id': 'id-ID',
	'zh': 'zh-CN',
	'ja': 'ja-JP',
	'ko': 'ko-KR'
};

export function formatCurrency(valueInIDR: number | string | undefined | null): string {
	if (valueInIDR === undefined || valueInIDR === null || valueInIDR === '') return 'TBD';
	
	let numericValue = 0;

	if (typeof valueInIDR === 'string') {
		// Clean the string but keep decimal point and multipliers
		const cleanString = valueInIDR.replace(/[^0-9,TBMJjt]/gi, '').replace(',', '.');
		
		let multiplier = 1;
		if (/T/i.test(cleanString)) multiplier = 1000000000000;
		else if (/[MB]/i.test(cleanString)) multiplier = 1000000000;
		else if (/Jt/i.test(cleanString)) multiplier = 1000000;
		
		numericValue = parseFloat(cleanString.replace(/[TBMJjt]/gi, '')) * multiplier;
	} else {
		numericValue = valueInIDR;
	}

	if (isNaN(numericValue) || numericValue === 0) return 'TBD';

	const locale = getLocale();
	const followLanguage = settingsStore.followLanguageCurrency;
	
	const targetLocale = followLanguage ? locale : 'id';
	const rate = followLanguage ? (EXCHANGE_RATES[targetLocale] || 1) : 1;
	const currencyCode = followLanguage ? (CURRENCY_CODES[targetLocale] || 'IDR') : 'IDR';
	const jsLocale = LOCALE_MAP[targetLocale] || 'id-ID';

	const convertedValue = numericValue * rate;

	return new Intl.NumberFormat(jsLocale, {
		style: 'currency',
		currency: currencyCode,
		notation: 'compact',
		maximumFractionDigits: 1
	}).format(convertedValue);
}

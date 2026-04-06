/**
 * Country code, dial code, and flag data — no Svelte, plain TypeScript.
 * Used by PhoneInput and CountrySelect components.
 */

export interface CountryInfo {
	/** ISO 3166-1 alpha-2 code (e.g., "US") */
	code: string;
	/** Display name (e.g., "United States") */
	name: string;
	/** International dial code (e.g., "+1") */
	dialCode: string;
	/** Flag emoji (e.g., "\u{1F1FA}\u{1F1F8}") */
	flag: string;
	/** Phone format pattern (e.g., "### ### ####") */
	format?: string;
	/** Region grouping */
	region: string;
}

/**
 * List of 60+ countries sorted alphabetically by name.
 * Includes all G20 nations, major European countries, and commonly used countries.
 */
export const countries: CountryInfo[] = [
	{
		code: 'AF',
		name: 'Afghanistan',
		dialCode: '+93',
		flag: '\u{1F1E6}\u{1F1EB}',
		format: '## ### ####',
		region: 'Asia'
	},
	{
		code: 'AR',
		name: 'Argentina',
		dialCode: '+54',
		flag: '\u{1F1E6}\u{1F1F7}',
		format: '## ####-####',
		region: 'Americas'
	},
	{
		code: 'AU',
		name: 'Australia',
		dialCode: '+61',
		flag: '\u{1F1E6}\u{1F1FA}',
		format: '### ### ###',
		region: 'Oceania'
	},
	{
		code: 'AT',
		name: 'Austria',
		dialCode: '+43',
		flag: '\u{1F1E6}\u{1F1F9}',
		format: '#### ######',
		region: 'Europe'
	},
	{
		code: 'BD',
		name: 'Bangladesh',
		dialCode: '+880',
		flag: '\u{1F1E7}\u{1F1E9}',
		format: '#### ######',
		region: 'Asia'
	},
	{
		code: 'BE',
		name: 'Belgium',
		dialCode: '+32',
		flag: '\u{1F1E7}\u{1F1EA}',
		format: '### ## ## ##',
		region: 'Europe'
	},
	{
		code: 'BR',
		name: 'Brazil',
		dialCode: '+55',
		flag: '\u{1F1E7}\u{1F1F7}',
		format: '## #####-####',
		region: 'Americas'
	},
	{
		code: 'CA',
		name: 'Canada',
		dialCode: '+1',
		flag: '\u{1F1E8}\u{1F1E6}',
		format: '### ### ####',
		region: 'Americas'
	},
	{
		code: 'CL',
		name: 'Chile',
		dialCode: '+56',
		flag: '\u{1F1E8}\u{1F1F1}',
		format: '# #### ####',
		region: 'Americas'
	},
	{
		code: 'CN',
		name: 'China',
		dialCode: '+86',
		flag: '\u{1F1E8}\u{1F1F3}',
		format: '### #### ####',
		region: 'Asia'
	},
	{
		code: 'CO',
		name: 'Colombia',
		dialCode: '+57',
		flag: '\u{1F1E8}\u{1F1F4}',
		format: '### ### ####',
		region: 'Americas'
	},
	{
		code: 'HR',
		name: 'Croatia',
		dialCode: '+385',
		flag: '\u{1F1ED}\u{1F1F7}',
		format: '## ### ####',
		region: 'Europe'
	},
	{
		code: 'CZ',
		name: 'Czech Republic',
		dialCode: '+420',
		flag: '\u{1F1E8}\u{1F1FF}',
		format: '### ### ###',
		region: 'Europe'
	},
	{
		code: 'DK',
		name: 'Denmark',
		dialCode: '+45',
		flag: '\u{1F1E9}\u{1F1F0}',
		format: '## ## ## ##',
		region: 'Europe'
	},
	{
		code: 'EG',
		name: 'Egypt',
		dialCode: '+20',
		flag: '\u{1F1EA}\u{1F1EC}',
		format: '## #### ####',
		region: 'Africa'
	},
	{
		code: 'FI',
		name: 'Finland',
		dialCode: '+358',
		flag: '\u{1F1EB}\u{1F1EE}',
		format: '## ### ####',
		region: 'Europe'
	},
	{
		code: 'FR',
		name: 'France',
		dialCode: '+33',
		flag: '\u{1F1EB}\u{1F1F7}',
		format: '# ## ## ## ##',
		region: 'Europe'
	},
	{
		code: 'DE',
		name: 'Germany',
		dialCode: '+49',
		flag: '\u{1F1E9}\u{1F1EA}',
		format: '#### #######',
		region: 'Europe'
	},
	{
		code: 'GR',
		name: 'Greece',
		dialCode: '+30',
		flag: '\u{1F1EC}\u{1F1F7}',
		format: '### ### ####',
		region: 'Europe'
	},
	{
		code: 'HK',
		name: 'Hong Kong',
		dialCode: '+852',
		flag: '\u{1F1ED}\u{1F1F0}',
		format: '#### ####',
		region: 'Asia'
	},
	{
		code: 'HU',
		name: 'Hungary',
		dialCode: '+36',
		flag: '\u{1F1ED}\u{1F1FA}',
		format: '## ### ####',
		region: 'Europe'
	},
	{
		code: 'IN',
		name: 'India',
		dialCode: '+91',
		flag: '\u{1F1EE}\u{1F1F3}',
		format: '##### #####',
		region: 'Asia'
	},
	{
		code: 'ID',
		name: 'Indonesia',
		dialCode: '+62',
		flag: '\u{1F1EE}\u{1F1E9}',
		format: '### #### ####',
		region: 'Asia'
	},
	{
		code: 'IE',
		name: 'Ireland',
		dialCode: '+353',
		flag: '\u{1F1EE}\u{1F1EA}',
		format: '## ### ####',
		region: 'Europe'
	},
	{
		code: 'IL',
		name: 'Israel',
		dialCode: '+972',
		flag: '\u{1F1EE}\u{1F1F1}',
		format: '## ### ####',
		region: 'Asia'
	},
	{
		code: 'IT',
		name: 'Italy',
		dialCode: '+39',
		flag: '\u{1F1EE}\u{1F1F9}',
		format: '### ### ####',
		region: 'Europe'
	},
	{
		code: 'JP',
		name: 'Japan',
		dialCode: '+81',
		flag: '\u{1F1EF}\u{1F1F5}',
		format: '##-####-####',
		region: 'Asia'
	},
	{
		code: 'KE',
		name: 'Kenya',
		dialCode: '+254',
		flag: '\u{1F1F0}\u{1F1EA}',
		format: '### ######',
		region: 'Africa'
	},
	{
		code: 'KR',
		name: 'Korea, South',
		dialCode: '+82',
		flag: '\u{1F1F0}\u{1F1F7}',
		format: '##-####-####',
		region: 'Asia'
	},
	{
		code: 'MY',
		name: 'Malaysia',
		dialCode: '+60',
		flag: '\u{1F1F2}\u{1F1FE}',
		format: '##-### ####',
		region: 'Asia'
	},
	{
		code: 'MX',
		name: 'Mexico',
		dialCode: '+52',
		flag: '\u{1F1F2}\u{1F1FD}',
		format: '## #### ####',
		region: 'Americas'
	},
	{
		code: 'NL',
		name: 'Netherlands',
		dialCode: '+31',
		flag: '\u{1F1F3}\u{1F1F1}',
		format: '# ## ## ## ##',
		region: 'Europe'
	},
	{
		code: 'NZ',
		name: 'New Zealand',
		dialCode: '+64',
		flag: '\u{1F1F3}\u{1F1FF}',
		format: '## ### ####',
		region: 'Oceania'
	},
	{
		code: 'NG',
		name: 'Nigeria',
		dialCode: '+234',
		flag: '\u{1F1F3}\u{1F1EC}',
		format: '### ### ####',
		region: 'Africa'
	},
	{
		code: 'NO',
		name: 'Norway',
		dialCode: '+47',
		flag: '\u{1F1F3}\u{1F1F4}',
		format: '### ## ###',
		region: 'Europe'
	},
	{
		code: 'PK',
		name: 'Pakistan',
		dialCode: '+92',
		flag: '\u{1F1F5}\u{1F1F0}',
		format: '### #######',
		region: 'Asia'
	},
	{
		code: 'PE',
		name: 'Peru',
		dialCode: '+51',
		flag: '\u{1F1F5}\u{1F1EA}',
		format: '### ### ###',
		region: 'Americas'
	},
	{
		code: 'PH',
		name: 'Philippines',
		dialCode: '+63',
		flag: '\u{1F1F5}\u{1F1ED}',
		format: '### ### ####',
		region: 'Asia'
	},
	{
		code: 'PL',
		name: 'Poland',
		dialCode: '+48',
		flag: '\u{1F1F5}\u{1F1F1}',
		format: '## ### ## ##',
		region: 'Europe'
	},
	{
		code: 'PT',
		name: 'Portugal',
		dialCode: '+351',
		flag: '\u{1F1F5}\u{1F1F9}',
		format: '### ### ###',
		region: 'Europe'
	},
	{
		code: 'QA',
		name: 'Qatar',
		dialCode: '+974',
		flag: '\u{1F1F6}\u{1F1E6}',
		format: '#### ####',
		region: 'Asia'
	},
	{
		code: 'RO',
		name: 'Romania',
		dialCode: '+40',
		flag: '\u{1F1F7}\u{1F1F4}',
		format: '## ### ####',
		region: 'Europe'
	},
	{
		code: 'RU',
		name: 'Russia',
		dialCode: '+7',
		flag: '\u{1F1F7}\u{1F1FA}',
		format: '### ###-##-##',
		region: 'Europe'
	},
	{
		code: 'SA',
		name: 'Saudi Arabia',
		dialCode: '+966',
		flag: '\u{1F1F8}\u{1F1E6}',
		format: '## ### ####',
		region: 'Asia'
	},
	{
		code: 'SG',
		name: 'Singapore',
		dialCode: '+65',
		flag: '\u{1F1F8}\u{1F1EC}',
		format: '#### ####',
		region: 'Asia'
	},
	{
		code: 'ZA',
		name: 'South Africa',
		dialCode: '+27',
		flag: '\u{1F1FF}\u{1F1E6}',
		format: '## ### ####',
		region: 'Africa'
	},
	{
		code: 'ES',
		name: 'Spain',
		dialCode: '+34',
		flag: '\u{1F1EA}\u{1F1F8}',
		format: '### ## ## ##',
		region: 'Europe'
	},
	{
		code: 'SE',
		name: 'Sweden',
		dialCode: '+46',
		flag: '\u{1F1F8}\u{1F1EA}',
		format: '##-### ## ##',
		region: 'Europe'
	},
	{
		code: 'CH',
		name: 'Switzerland',
		dialCode: '+41',
		flag: '\u{1F1E8}\u{1F1ED}',
		format: '## ### ## ##',
		region: 'Europe'
	},
	{
		code: 'TW',
		name: 'Taiwan',
		dialCode: '+886',
		flag: '\u{1F1F9}\u{1F1FC}',
		format: '### ### ###',
		region: 'Asia'
	},
	{
		code: 'TH',
		name: 'Thailand',
		dialCode: '+66',
		flag: '\u{1F1F9}\u{1F1ED}',
		format: '## ### ####',
		region: 'Asia'
	},
	{
		code: 'TR',
		name: 'Turkey',
		dialCode: '+90',
		flag: '\u{1F1F9}\u{1F1F7}',
		format: '### ### ## ##',
		region: 'Europe'
	},
	{
		code: 'UA',
		name: 'Ukraine',
		dialCode: '+380',
		flag: '\u{1F1FA}\u{1F1E6}',
		format: '## ### ## ##',
		region: 'Europe'
	},
	{
		code: 'AE',
		name: 'United Arab Emirates',
		dialCode: '+971',
		flag: '\u{1F1E6}\u{1F1EA}',
		format: '## ### ####',
		region: 'Asia'
	},
	{
		code: 'GB',
		name: 'United Kingdom',
		dialCode: '+44',
		flag: '\u{1F1EC}\u{1F1E7}',
		format: '#### ######',
		region: 'Europe'
	},
	{
		code: 'US',
		name: 'United States',
		dialCode: '+1',
		flag: '\u{1F1FA}\u{1F1F8}',
		format: '### ### ####',
		region: 'Americas'
	},
	{
		code: 'VN',
		name: 'Vietnam',
		dialCode: '+84',
		flag: '\u{1F1FB}\u{1F1F3}',
		format: '## ### ## ##',
		region: 'Asia'
	}
];

/**
 * Look up a country by its ISO 3166-1 alpha-2 code.
 * Case-insensitive.
 */
export function getCountryByCode(code: string): CountryInfo | undefined {
	const upper = code.toUpperCase();
	return countries.find((c) => c.code === upper);
}

/**
 * Look up countries by dial code (may return multiple, e.g. "+1" returns US and Canada).
 */
export function getCountriesByDialCode(dialCode: string): CountryInfo[] {
	const normalized = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
	return countries.filter((c) => c.dialCode === normalized);
}

/**
 * Search countries by name, ISO code, or dial code.
 * Case-insensitive substring matching.
 */
export function searchCountries(query: string): CountryInfo[] {
	if (!query) return countries;

	const lower = query.toLowerCase().trim();
	if (!lower) return countries;

	return countries.filter(
		(c) =>
			c.name.toLowerCase().includes(lower) ||
			c.code.toLowerCase().includes(lower) ||
			c.dialCode.includes(lower)
	);
}

export type CountryRegion = 'Africa' | 'Americas' | 'Asia' | 'Europe' | 'Oceania';

export interface CountryInfo {
	code: string;
	name: string;
	dialCode: string;
	flag: string;
	region: CountryRegion;
	format?: string;
}

export const COUNTRY_DATA: CountryInfo[] = [
	{
		code: 'AF',
		name: 'Afghanistan',
		dialCode: '+93',
		flag: '\u{1F1E6}\u{1F1EB}',
		region: 'Asia'
	},
	{
		code: 'AR',
		name: 'Argentina',
		dialCode: '+54',
		flag: '\u{1F1E6}\u{1F1F7}',
		region: 'Americas'
	},
	{
		code: 'AU',
		name: 'Australia',
		dialCode: '+61',
		flag: '\u{1F1E6}\u{1F1FA}',
		region: 'Oceania',
		format: '### ### ###'
	},
	{
		code: 'AT',
		name: 'Austria',
		dialCode: '+43',
		flag: '\u{1F1E6}\u{1F1F9}',
		region: 'Europe'
	},
	{
		code: 'BE',
		name: 'Belgium',
		dialCode: '+32',
		flag: '\u{1F1E7}\u{1F1EA}',
		region: 'Europe'
	},
	{
		code: 'BR',
		name: 'Brazil',
		dialCode: '+55',
		flag: '\u{1F1E7}\u{1F1F7}',
		region: 'Americas',
		format: '## ##### ####'
	},
	{
		code: 'CA',
		name: 'Canada',
		dialCode: '+1',
		flag: '\u{1F1E8}\u{1F1E6}',
		region: 'Americas',
		format: '### ### ####'
	},
	{
		code: 'CL',
		name: 'Chile',
		dialCode: '+56',
		flag: '\u{1F1E8}\u{1F1F1}',
		region: 'Americas'
	},
	{
		code: 'CN',
		name: 'China',
		dialCode: '+86',
		flag: '\u{1F1E8}\u{1F1F3}',
		region: 'Asia',
		format: '### #### ####'
	},
	{
		code: 'CO',
		name: 'Colombia',
		dialCode: '+57',
		flag: '\u{1F1E8}\u{1F1F4}',
		region: 'Americas'
	},
	{
		code: 'CZ',
		name: 'Czech Republic',
		dialCode: '+420',
		flag: '\u{1F1E8}\u{1F1FF}',
		region: 'Europe'
	},
	{
		code: 'DK',
		name: 'Denmark',
		dialCode: '+45',
		flag: '\u{1F1E9}\u{1F1F0}',
		region: 'Europe'
	},
	{
		code: 'EG',
		name: 'Egypt',
		dialCode: '+20',
		flag: '\u{1F1EA}\u{1F1EC}',
		region: 'Africa'
	},
	{
		code: 'FI',
		name: 'Finland',
		dialCode: '+358',
		flag: '\u{1F1EB}\u{1F1EE}',
		region: 'Europe'
	},
	{
		code: 'FR',
		name: 'France',
		dialCode: '+33',
		flag: '\u{1F1EB}\u{1F1F7}',
		region: 'Europe',
		format: '# ## ## ## ##'
	},
	{
		code: 'DE',
		name: 'Germany',
		dialCode: '+49',
		flag: '\u{1F1E9}\u{1F1EA}',
		region: 'Europe',
		format: '### #######'
	},
	{
		code: 'GR',
		name: 'Greece',
		dialCode: '+30',
		flag: '\u{1F1EC}\u{1F1F7}',
		region: 'Europe'
	},
	{
		code: 'HK',
		name: 'Hong Kong',
		dialCode: '+852',
		flag: '\u{1F1ED}\u{1F1F0}',
		region: 'Asia'
	},
	{
		code: 'IN',
		name: 'India',
		dialCode: '+91',
		flag: '\u{1F1EE}\u{1F1F3}',
		region: 'Asia',
		format: '##### #####'
	},
	{
		code: 'ID',
		name: 'Indonesia',
		dialCode: '+62',
		flag: '\u{1F1EE}\u{1F1E9}',
		region: 'Asia'
	},
	{
		code: 'IE',
		name: 'Ireland',
		dialCode: '+353',
		flag: '\u{1F1EE}\u{1F1EA}',
		region: 'Europe'
	},
	{
		code: 'IL',
		name: 'Israel',
		dialCode: '+972',
		flag: '\u{1F1EE}\u{1F1F1}',
		region: 'Asia'
	},
	{
		code: 'IT',
		name: 'Italy',
		dialCode: '+39',
		flag: '\u{1F1EE}\u{1F1F9}',
		region: 'Europe',
		format: '### ### ####'
	},
	{
		code: 'JP',
		name: 'Japan',
		dialCode: '+81',
		flag: '\u{1F1EF}\u{1F1F5}',
		region: 'Asia',
		format: '## #### ####'
	},
	{
		code: 'KE',
		name: 'Kenya',
		dialCode: '+254',
		flag: '\u{1F1F0}\u{1F1EA}',
		region: 'Africa'
	},
	{
		code: 'KR',
		name: 'South Korea',
		dialCode: '+82',
		flag: '\u{1F1F0}\u{1F1F7}',
		region: 'Asia',
		format: '## #### ####'
	},
	{
		code: 'MY',
		name: 'Malaysia',
		dialCode: '+60',
		flag: '\u{1F1F2}\u{1F1FE}',
		region: 'Asia'
	},
	{
		code: 'MX',
		name: 'Mexico',
		dialCode: '+52',
		flag: '\u{1F1F2}\u{1F1FD}',
		region: 'Americas',
		format: '## #### ####'
	},
	{
		code: 'NL',
		name: 'Netherlands',
		dialCode: '+31',
		flag: '\u{1F1F3}\u{1F1F1}',
		region: 'Europe',
		format: '# ########'
	},
	{
		code: 'NZ',
		name: 'New Zealand',
		dialCode: '+64',
		flag: '\u{1F1F3}\u{1F1FF}',
		region: 'Oceania'
	},
	{
		code: 'NG',
		name: 'Nigeria',
		dialCode: '+234',
		flag: '\u{1F1F3}\u{1F1EC}',
		region: 'Africa'
	},
	{
		code: 'NO',
		name: 'Norway',
		dialCode: '+47',
		flag: '\u{1F1F3}\u{1F1F4}',
		region: 'Europe'
	},
	{
		code: 'PK',
		name: 'Pakistan',
		dialCode: '+92',
		flag: '\u{1F1F5}\u{1F1F0}',
		region: 'Asia'
	},
	{
		code: 'PE',
		name: 'Peru',
		dialCode: '+51',
		flag: '\u{1F1F5}\u{1F1EA}',
		region: 'Americas'
	},
	{
		code: 'PH',
		name: 'Philippines',
		dialCode: '+63',
		flag: '\u{1F1F5}\u{1F1ED}',
		region: 'Asia'
	},
	{
		code: 'PL',
		name: 'Poland',
		dialCode: '+48',
		flag: '\u{1F1F5}\u{1F1F1}',
		region: 'Europe'
	},
	{
		code: 'PT',
		name: 'Portugal',
		dialCode: '+351',
		flag: '\u{1F1F5}\u{1F1F9}',
		region: 'Europe'
	},
	{
		code: 'RO',
		name: 'Romania',
		dialCode: '+40',
		flag: '\u{1F1F7}\u{1F1F4}',
		region: 'Europe'
	},
	{
		code: 'RU',
		name: 'Russia',
		dialCode: '+7',
		flag: '\u{1F1F7}\u{1F1FA}',
		region: 'Europe',
		format: '### ### ## ##'
	},
	{
		code: 'SA',
		name: 'Saudi Arabia',
		dialCode: '+966',
		flag: '\u{1F1F8}\u{1F1E6}',
		region: 'Asia',
		format: '## ### ####'
	},
	{
		code: 'SG',
		name: 'Singapore',
		dialCode: '+65',
		flag: '\u{1F1F8}\u{1F1EC}',
		region: 'Asia',
		format: '#### ####'
	},
	{
		code: 'ZA',
		name: 'South Africa',
		dialCode: '+27',
		flag: '\u{1F1FF}\u{1F1E6}',
		region: 'Africa'
	},
	{
		code: 'ES',
		name: 'Spain',
		dialCode: '+34',
		flag: '\u{1F1EA}\u{1F1F8}',
		region: 'Europe',
		format: '### ## ## ##'
	},
	{
		code: 'SE',
		name: 'Sweden',
		dialCode: '+46',
		flag: '\u{1F1F8}\u{1F1EA}',
		region: 'Europe',
		format: '## ### ## ##'
	},
	{
		code: 'CH',
		name: 'Switzerland',
		dialCode: '+41',
		flag: '\u{1F1E8}\u{1F1ED}',
		region: 'Europe'
	},
	{
		code: 'TW',
		name: 'Taiwan',
		dialCode: '+886',
		flag: '\u{1F1F9}\u{1F1FC}',
		region: 'Asia'
	},
	{
		code: 'TH',
		name: 'Thailand',
		dialCode: '+66',
		flag: '\u{1F1F9}\u{1F1ED}',
		region: 'Asia'
	},
	{
		code: 'TR',
		name: 'Turkey',
		dialCode: '+90',
		flag: '\u{1F1F9}\u{1F1F7}',
		region: 'Europe'
	},
	{
		code: 'AE',
		name: 'United Arab Emirates',
		dialCode: '+971',
		flag: '\u{1F1E6}\u{1F1EA}',
		region: 'Asia',
		format: '## ### ####'
	},
	{
		code: 'GB',
		name: 'United Kingdom',
		dialCode: '+44',
		flag: '\u{1F1EC}\u{1F1E7}',
		region: 'Europe',
		format: '#### ######'
	},
	{
		code: 'US',
		name: 'United States',
		dialCode: '+1',
		flag: '\u{1F1FA}\u{1F1F8}',
		region: 'Americas',
		format: '### ### ####'
	},
	{
		code: 'VN',
		name: 'Vietnam',
		dialCode: '+84',
		flag: '\u{1F1FB}\u{1F1F3}',
		region: 'Asia'
	}
];

export function filterCountriesByRegions(countries: CountryInfo[], regions?: string[]) {
	if (regions === undefined) {
		return countries;
	}

	return countries.filter((country) => regions.includes(country.region));
}

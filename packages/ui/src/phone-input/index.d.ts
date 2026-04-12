import type { PhoneInputProps as PrimitivePhoneInputProps, CountryInfo } from '@dryui/primitives';
export type { CountryInfo };
export interface PhoneInputProps extends PrimitivePhoneInputProps {
    size?: 'sm' | 'md' | 'lg';
}
export { default as PhoneInput } from './phone-input-select.svelte';

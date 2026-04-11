import type { Component, Snippet } from 'svelte';
import ThumbnailRoot from './root.svelte';
import ThumbnailAccordion from './accordion.svelte';
import ThumbnailAddOnSelector from './add-on-selector.svelte';
import ThumbnailAlert from './alert.svelte';
import ThumbnailAlertDialog from './alert-dialog.svelte';
import ThumbnailAmenityGrid from './amenity-grid.svelte';
import ThumbnailAspectRatio from './aspect-ratio.svelte';
import ThumbnailAurora from './aurora.svelte';
import ThumbnailAvatar from './avatar.svelte';
import ThumbnailBackdrop from './backdrop.svelte';
import ThumbnailBadge from './badge.svelte';
import ThumbnailBookingConfirmation from './booking-confirmation.svelte';
import ThumbnailBreadcrumb from './breadcrumb.svelte';
import ThumbnailButton from './button.svelte';
import ThumbnailButtonGroup from './button-group.svelte';
import ThumbnailCalendar from './calendar.svelte';
import ThumbnailCard from './card.svelte';
import ThumbnailCarousel from './carousel.svelte';
import ThumbnailChart from './chart.svelte';
import ThumbnailChatThread from './chat-thread.svelte';
import ThumbnailCheckbox from './checkbox.svelte';
import ThumbnailChip from './chip.svelte';
import ThumbnailChipGroup from './chip-group.svelte';
import ThumbnailClipboard from './clipboard.svelte';
import ThumbnailCodeBlock from './code-block.svelte';
import ThumbnailCollapsible from './collapsible.svelte';
import ThumbnailColorPicker from './color-picker.svelte';
import ThumbnailCombobox from './combobox.svelte';
import ThumbnailCommandPalette from './command-palette.svelte';
import ThumbnailComparisonTable from './comparison-table.svelte';
import ThumbnailContainer from './container.svelte';
import ThumbnailContextMenu from './context-menu.svelte';
import ThumbnailCountrySelect from './country-select.svelte';
import ThumbnailCurrencySelector from './currency-selector.svelte';
import ThumbnailDataGrid from './data-grid.svelte';
import ThumbnailDateField from './date-field.svelte';
import ThumbnailDatePicker from './date-picker.svelte';
import ThumbnailDateRangePicker from './date-range-picker.svelte';
import ThumbnailDateTimeInput from './date-time-input.svelte';
import ThumbnailDescriptionList from './description-list.svelte';
import ThumbnailDialog from './dialog.svelte';
import ThumbnailDragAndDrop from './drag-and-drop.svelte';
import ThumbnailDrawer from './drawer.svelte';
import ThumbnailDropdownMenu from './dropdown-menu.svelte';
import ThumbnailFareClassPicker from './fare-class-picker.svelte';
import ThumbnailField from './field.svelte';
import ThumbnailFieldset from './fieldset.svelte';
import ThumbnailFileUpload from './file-upload.svelte';
import ThumbnailFilterSidebar from './filter-sidebar.svelte';
import ThumbnailFlexibleDatesGrid from './flexible-dates-grid.svelte';
import ThumbnailFlightTimeline from './flight-timeline.svelte';
import ThumbnailFlipCard from './flip-card.svelte';
import ThumbnailFloatButton from './float-button.svelte';
import ThumbnailFocusTrap from './focus-trap.svelte';
import ThumbnailFormatBytes from './format-bytes.svelte';
import ThumbnailFormatDate from './format-date.svelte';
import ThumbnailFormatNumber from './format-number.svelte';
import ThumbnailGauge from './gauge.svelte';
import ThumbnailGuestRoomSelector from './guest-room-selector.svelte';
import ThumbnailHeading from './heading.svelte';
import ThumbnailHotelGallery from './hotel-gallery.svelte';
import ThumbnailHotkey from './hotkey.svelte';
import ThumbnailHoverCard from './hover-card.svelte';
import ThumbnailImage from './image.svelte';
import ThumbnailImageComparison from './image-comparison.svelte';
import ThumbnailInfiniteScroll from './infinite-scroll.svelte';
import ThumbnailInput from './input.svelte';
import ThumbnailItineraryTimeline from './itinerary-timeline.svelte';
import ThumbnailKbd from './kbd.svelte';
import ThumbnailLabel from './label.svelte';
import ThumbnailLayoutHeaderContentFooter from './layout-header-content-footer.svelte';
import ThumbnailLayoutHeaderSidebarMain from './layout-header-sidebar-main.svelte';
import ThumbnailLayoutSidebarMain from './layout-sidebar-main.svelte';
import ThumbnailLink from './link.svelte';
import ThumbnailLinkPreview from './link-preview.svelte';
import ThumbnailList from './list.svelte';
import ThumbnailListbox from './listbox.svelte';
import ThumbnailLocationAutocomplete from './location-autocomplete.svelte';
import ThumbnailLoyaltyPointsDisplay from './loyalty-points-display.svelte';
import ThumbnailMap from './map.svelte';
import ThumbnailMapListToggle from './map-list-toggle.svelte';
import ThumbnailMarkdownRenderer from './markdown-renderer.svelte';
import ThumbnailMarquee from './marquee.svelte';
import ThumbnailMegaMenu from './mega-menu.svelte';
import ThumbnailMenubar from './menubar.svelte';
import ThumbnailMultiCitySearchForm from './multi-city-search-form.svelte';
import ThumbnailMultiSelectCombobox from './multi-select-combobox.svelte';
import ThumbnailNavigationMenu from './navigation-menu.svelte';
import ThumbnailNoise from './noise.svelte';
import ThumbnailNotificationCenter from './notification-center.svelte';
import ThumbnailNumberInput from './number-input.svelte';
import ThumbnailPagination from './pagination.svelte';
import ThumbnailPassengerClassSelector from './passenger-class-selector.svelte';
import ThumbnailPaymentCardInput from './payment-card-input.svelte';
import ThumbnailPhoneInput from './phone-input.svelte';
import ThumbnailPinInput from './pin-input.svelte';
import ThumbnailPopover from './popover.svelte';
import ThumbnailPortal from './portal.svelte';
import ThumbnailPriceCalendar from './price-calendar.svelte';
import ThumbnailPriceSummaryPanel from './price-summary-panel.svelte';
import ThumbnailProgress from './progress.svelte';
import ThumbnailProgressRing from './progress-ring.svelte';
import ThumbnailPromoCodeInput from './promo-code-input.svelte';
import ThumbnailPromptInput from './prompt-input.svelte';
import ThumbnailQrCode from './qr-code.svelte';
import ThumbnailRadioGroup from './radio-group.svelte';
import ThumbnailRangeCalendar from './range-calendar.svelte';
import ThumbnailRating from './rating.svelte';
import ThumbnailRecentSearches from './recent-searches.svelte';
import ThumbnailRelativeTime from './relative-time.svelte';
import ThumbnailResultCardCar from './result-card-car.svelte';
import ThumbnailResultCardFlight from './result-card-flight.svelte';
import ThumbnailResultCardHotel from './result-card-hotel.svelte';
import ThumbnailReveal from './reveal.svelte';
import ThumbnailReviewCard from './review-card.svelte';
import ThumbnailRichTextEditor from './rich-text-editor.svelte';
import ThumbnailRoomTypePicker from './room-type-picker.svelte';
import ThumbnailRouteMap from './route-map.svelte';
import ThumbnailScrollArea from './scroll-area.svelte';
import ThumbnailScrollToTop from './scroll-to-top.svelte';
import ThumbnailSearchFormTabs from './search-form-tabs.svelte';
import ThumbnailSeatMap from './seat-map.svelte';
import ThumbnailSegmentedControl from './segmented-control.svelte';
import ThumbnailSelect from './select.svelte';
import ThumbnailSeparator from './separator.svelte';
import ThumbnailSidebar from './sidebar.svelte';
import ThumbnailSkeleton from './skeleton.svelte';
import ThumbnailSlider from './slider.svelte';
import ThumbnailSortBar from './sort-bar.svelte';
import ThumbnailSpacer from './spacer.svelte';
import ThumbnailSparkline from './sparkline.svelte';
import ThumbnailSpinner from './spinner.svelte';
import ThumbnailSplitter from './splitter.svelte';
import ThumbnailSpotlight from './spotlight.svelte';
import ThumbnailStepper from './stepper.svelte';

import ThumbnailSystemMap from './system-map.svelte';
import ThumbnailTable from './table.svelte';
import ThumbnailTableOfContents from './table-of-contents.svelte';
import ThumbnailTabs from './tabs.svelte';
import ThumbnailTagsInput from './tags-input.svelte';
import ThumbnailText from './text.svelte';
import ThumbnailTextarea from './textarea.svelte';
import ThumbnailTimeInput from './time-input.svelte';
import ThumbnailTimeline from './timeline.svelte';
import ThumbnailToast from './toast.svelte';
import ThumbnailToggle from './toggle.svelte';
import ThumbnailToggleGroup from './toggle-group.svelte';
import ThumbnailToolbar from './toolbar.svelte';
import ThumbnailTooltip from './tooltip.svelte';
import ThumbnailTour from './tour.svelte';
import ThumbnailTransfer from './transfer.svelte';
import ThumbnailTree from './tree.svelte';
import ThumbnailTripCard from './trip-card.svelte';
import ThumbnailTrustBadges from './trust-badges.svelte';
import ThumbnailTypingIndicator from './typing-indicator.svelte';
import ThumbnailTypography from './typography.svelte';
import ThumbnailVideoEmbed from './video-embed.svelte';
import ThumbnailVirtualList from './virtual-list.svelte';
import ThumbnailVisuallyHidden from './visually-hidden.svelte';
import ThumbnailChromaticShift from './chromatic-shift.svelte';
import ThumbnailDisplacement from './displacement.svelte';
import ThumbnailGradientMesh from './gradient-mesh.svelte';
import ThumbnailGlow from './glow.svelte';
import ThumbnailHalftone from './halftone.svelte';
import ThumbnailIcon from './icon.svelte';
import ThumbnailMaskReveal from './mask-reveal.svelte';
import ThumbnailShaderCanvas from './shader-canvas.svelte';
import ThumbnailSvg from './svg.svelte';
import ThumbnailFileSelect from './file-select.svelte';
import ThumbnailAffixGroup from './affix-group.svelte';
import ThumbnailSelectableTileGroup from './selectable-tile-group.svelte';
import ThumbnailInputGroup from './input-group.svelte';
import ThumbnailOptionSwatchGroup from './option-swatch-group.svelte';
import ThumbnailPromoMosaic from './promo-mosaic.svelte';
import ThumbnailCommerceHeader from './commerce-header.svelte';
import ThumbnailDropZone from './drop-zone.svelte';
import ThumbnailAlphaSlider from './alpha-slider.svelte';
import ThumbnailDiagram from './diagram.svelte';

export interface ThumbnailProps {
	name?: string;
	size?: 'sm' | 'md' | 'lg' | number;
	class?: string;
	children?: Snippet;
}

// Thumbnail lookup map for dynamic name resolution
export const thumbnailMap: Record<string, Component<any>> = {
	Accordion: ThumbnailAccordion,
	AddOnSelector: ThumbnailAddOnSelector,
	Alert: ThumbnailAlert,
	AlertDialog: ThumbnailAlertDialog,
	AmenityGrid: ThumbnailAmenityGrid,
	AspectRatio: ThumbnailAspectRatio,
	Aurora: ThumbnailAurora,
	Avatar: ThumbnailAvatar,
	Backdrop: ThumbnailBackdrop,
	Badge: ThumbnailBadge,
	BookingConfirmation: ThumbnailBookingConfirmation,
	Breadcrumb: ThumbnailBreadcrumb,
	Button: ThumbnailButton,
	ButtonGroup: ThumbnailButtonGroup,
	Calendar: ThumbnailCalendar,
	Card: ThumbnailCard,
	Carousel: ThumbnailCarousel,
	Chart: ThumbnailChart,
	ChatThread: ThumbnailChatThread,
	Checkbox: ThumbnailCheckbox,
	Chip: ThumbnailChip,
	ChipGroup: ThumbnailChipGroup,
	Clipboard: ThumbnailClipboard,
	CodeBlock: ThumbnailCodeBlock,
	Collapsible: ThumbnailCollapsible,
	ColorPicker: ThumbnailColorPicker,
	Combobox: ThumbnailCombobox,
	CommandPalette: ThumbnailCommandPalette,
	ComparisonTable: ThumbnailComparisonTable,
	Container: ThumbnailContainer,
	ContextMenu: ThumbnailContextMenu,
	CountrySelect: ThumbnailCountrySelect,
	CurrencySelector: ThumbnailCurrencySelector,
	DataGrid: ThumbnailDataGrid,
	DateField: ThumbnailDateField,
	DatePicker: ThumbnailDatePicker,
	DateRangePicker: ThumbnailDateRangePicker,
	DateTimeInput: ThumbnailDateTimeInput,
	DescriptionList: ThumbnailDescriptionList,
	Dialog: ThumbnailDialog,
	DragAndDrop: ThumbnailDragAndDrop,
	Drawer: ThumbnailDrawer,
	DropdownMenu: ThumbnailDropdownMenu,
	FareClassPicker: ThumbnailFareClassPicker,
	Field: ThumbnailField,
	Fieldset: ThumbnailFieldset,
	FileUpload: ThumbnailFileUpload,
	FilterSidebar: ThumbnailFilterSidebar,
	FlexibleDatesGrid: ThumbnailFlexibleDatesGrid,
	FlightTimeline: ThumbnailFlightTimeline,
	FlipCard: ThumbnailFlipCard,
	FloatButton: ThumbnailFloatButton,
	FocusTrap: ThumbnailFocusTrap,
	FormatBytes: ThumbnailFormatBytes,
	FormatDate: ThumbnailFormatDate,
	FormatNumber: ThumbnailFormatNumber,
	Gauge: ThumbnailGauge,
	GuestRoomSelector: ThumbnailGuestRoomSelector,
	Heading: ThumbnailHeading,
	HotelGallery: ThumbnailHotelGallery,
	Hotkey: ThumbnailHotkey,
	HoverCard: ThumbnailHoverCard,
	Image: ThumbnailImage,
	ImageComparison: ThumbnailImageComparison,
	InfiniteScroll: ThumbnailInfiniteScroll,
	Input: ThumbnailInput,
	ItineraryTimeline: ThumbnailItineraryTimeline,
	Kbd: ThumbnailKbd,
	Label: ThumbnailLabel,
	LayoutHeaderContentFooter: ThumbnailLayoutHeaderContentFooter,
	LayoutHeaderSidebarMain: ThumbnailLayoutHeaderSidebarMain,
	LayoutSidebarMain: ThumbnailLayoutSidebarMain,
	Link: ThumbnailLink,
	LinkPreview: ThumbnailLinkPreview,
	List: ThumbnailList,
	Listbox: ThumbnailListbox,
	LocationAutocomplete: ThumbnailLocationAutocomplete,
	LoyaltyPointsDisplay: ThumbnailLoyaltyPointsDisplay,
	Map: ThumbnailMap,
	MapListToggle: ThumbnailMapListToggle,
	MarkdownRenderer: ThumbnailMarkdownRenderer,
	Marquee: ThumbnailMarquee,
	MegaMenu: ThumbnailMegaMenu,
	Menubar: ThumbnailMenubar,
	MultiCitySearchForm: ThumbnailMultiCitySearchForm,
	MultiSelectCombobox: ThumbnailMultiSelectCombobox,
	NavigationMenu: ThumbnailNavigationMenu,
	Noise: ThumbnailNoise,
	NotificationCenter: ThumbnailNotificationCenter,
	NumberInput: ThumbnailNumberInput,
	Pagination: ThumbnailPagination,
	PassengerClassSelector: ThumbnailPassengerClassSelector,
	PaymentCardInput: ThumbnailPaymentCardInput,
	PhoneInput: ThumbnailPhoneInput,
	PinInput: ThumbnailPinInput,
	Popover: ThumbnailPopover,
	Portal: ThumbnailPortal,
	PriceCalendar: ThumbnailPriceCalendar,
	PriceSummaryPanel: ThumbnailPriceSummaryPanel,
	Progress: ThumbnailProgress,
	ProgressRing: ThumbnailProgressRing,
	PromoCodeInput: ThumbnailPromoCodeInput,
	PromptInput: ThumbnailPromptInput,
	QrCode: ThumbnailQrCode,
	RadioGroup: ThumbnailRadioGroup,
	RangeCalendar: ThumbnailRangeCalendar,
	Rating: ThumbnailRating,
	RecentSearches: ThumbnailRecentSearches,
	RelativeTime: ThumbnailRelativeTime,
	ResultCardCar: ThumbnailResultCardCar,
	ResultCardFlight: ThumbnailResultCardFlight,
	ResultCardHotel: ThumbnailResultCardHotel,
	Reveal: ThumbnailReveal,
	ReviewCard: ThumbnailReviewCard,
	RichTextEditor: ThumbnailRichTextEditor,
	RoomTypePicker: ThumbnailRoomTypePicker,
	RouteMap: ThumbnailRouteMap,
	ScrollArea: ThumbnailScrollArea,
	ScrollToTop: ThumbnailScrollToTop,
	SearchFormTabs: ThumbnailSearchFormTabs,
	SeatMap: ThumbnailSeatMap,
	SegmentedControl: ThumbnailSegmentedControl,
	Select: ThumbnailSelect,
	Separator: ThumbnailSeparator,
	Sidebar: ThumbnailSidebar,
	Skeleton: ThumbnailSkeleton,
	Slider: ThumbnailSlider,
	SortBar: ThumbnailSortBar,
	Spacer: ThumbnailSpacer,
	Sparkline: ThumbnailSparkline,
	Spinner: ThumbnailSpinner,
	Splitter: ThumbnailSplitter,
	Spotlight: ThumbnailSpotlight,
	Stepper: ThumbnailStepper,
	Table: ThumbnailTable,
	TableOfContents: ThumbnailTableOfContents,
	Tabs: ThumbnailTabs,
	TagsInput: ThumbnailTagsInput,
	Text: ThumbnailText,
	Textarea: ThumbnailTextarea,
	TimeInput: ThumbnailTimeInput,
	Timeline: ThumbnailTimeline,
	Toast: ThumbnailToast,
	Toggle: ThumbnailToggle,
	ToggleGroup: ThumbnailToggleGroup,
	Toolbar: ThumbnailToolbar,
	Tooltip: ThumbnailTooltip,
	Tour: ThumbnailTour,
	Transfer: ThumbnailTransfer,
	Tree: ThumbnailTree,
	TripCard: ThumbnailTripCard,
	TrustBadges: ThumbnailTrustBadges,
	TypingIndicator: ThumbnailTypingIndicator,
	Typography: ThumbnailTypography,
	SystemMap: ThumbnailSystemMap,
	VideoEmbed: ThumbnailVideoEmbed,
	VirtualList: ThumbnailVirtualList,
	VisuallyHidden: ThumbnailVisuallyHidden,
	ChromaticShift: ThumbnailChromaticShift,
	Displacement: ThumbnailDisplacement,
	GradientMesh: ThumbnailGradientMesh,
	Glow: ThumbnailGlow,
	Halftone: ThumbnailHalftone,
	Icon: ThumbnailIcon,
	MaskReveal: ThumbnailMaskReveal,
	ShaderCanvas: ThumbnailShaderCanvas,
	Svg: ThumbnailSvg,
	FileSelect: ThumbnailFileSelect,
	AffixGroup: ThumbnailAffixGroup,
	SelectableTileGroup: ThumbnailSelectableTileGroup,
	InputGroup: ThumbnailInputGroup,
	OptionSwatchGroup: ThumbnailOptionSwatchGroup,
	PromoMosaic: ThumbnailPromoMosaic,
	CommerceHeader: ThumbnailCommerceHeader,
	DropZone: ThumbnailDropZone,
	AlphaSlider: ThumbnailAlphaSlider,
	Diagram: ThumbnailDiagram
};

export const Thumbnail = Object.assign(ThumbnailRoot, {
	Root: ThumbnailRoot
}) as typeof ThumbnailRoot & {
	Root: typeof ThumbnailRoot;
};

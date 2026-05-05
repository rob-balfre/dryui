/** Per-component example overrides for richer, realistic usage patterns. */
const EXAMPLE_OVERRIDES: Record<string, string> = {
	Button:
		'<Button variant="solid" onclick={handleClick}>Save</Button>\n<Button href="/getting-started" variant="outline">Continue</Button>',
	Combobox:
		'<Combobox.Root bind:value={selectedFramework} name="framework">\n  <Combobox.Input placeholder="Search frameworks..." />\n  <Combobox.Content>\n    <Combobox.Item value="svelte" index={0}>Svelte</Combobox.Item>\n    <Combobox.Item value="react" index={1}>React</Combobox.Item>\n  </Combobox.Content>\n</Combobox.Root>',
	MultiSelectCombobox:
		'<MultiSelectCombobox.Root bind:value={selectedFrameworks} bind:query={frameworkQuery} name="frameworks">\n  <MultiSelectCombobox.SelectionList>\n    {#each selectedFrameworks as framework}\n      <MultiSelectCombobox.SelectionItem value={framework}>\n        {framework}\n        <MultiSelectCombobox.SelectionRemove value={framework} />\n      </MultiSelectCombobox.SelectionItem>\n    {/each}\n  </MultiSelectCombobox.SelectionList>\n  <MultiSelectCombobox.Input placeholder="Search frameworks..." />\n  <MultiSelectCombobox.Content>\n    <MultiSelectCombobox.Item value="svelte">Svelte</MultiSelectCombobox.Item>\n    <MultiSelectCombobox.Item value="react">React</MultiSelectCombobox.Item>\n  </MultiSelectCombobox.Content>\n</MultiSelectCombobox.Root>',
	Input: '<Input type="email" bind:value={email} placeholder="you@example.com" />',
	Textarea: '<Textarea bind:value={message} placeholder="Write a message…" />',
	NumberInput: '<NumberInput bind:value={quantity} min={0} max={100} step={1} size="sm" />',
	Checkbox: '<Checkbox bind:checked={agreed}>I agree to the terms</Checkbox>',
	Switch: '<Switch bind:checked={darkMode}>Dark mode</Switch>',
	Slider: '<Slider bind:value={volume} min={0} max={100} />',
	Rating: '<Rating bind:value={score} />',
	Badge: '<Badge variant="soft">Active</Badge>',
	Alert:
		'<Alert variant="info">\n  {#snippet description()}Your changes have been saved.{/snippet}\n</Alert>',
	Progress: '<Progress value={65} max={100} />',
	Spinner: '<Spinner size="md" />',
	Skeleton: '<Skeleton width="200px" height="1rem" />',
	Separator: '<Separator />',
	Spacer: '<Spacer size="lg" />',
	Container: '<Container>\n  <p>Centered content</p>\n</Container>',
	Avatar: '<Avatar src="/avatar.jpg" alt="Jane" fallback="JD" />',
	ChatThread:
		'<ChatThread messageCount={messages.length}>\n  {#snippet children({ index })}\n    <ChatMessage role={messages[index].role} name={messages[index].name}>\n      {messages[index].message}\n    </ChatMessage>\n  {/snippet}\n</ChatThread>',
	DataGrid:
		'<DataGrid.Root items={rows} pageSize={10}>\n  <DataGrid.Table>\n    <DataGrid.Header>\n      <DataGrid.Row>\n        <DataGrid.Column key="name" sortable>Name</DataGrid.Column>\n        <DataGrid.Column key="status">Status</DataGrid.Column>\n      </DataGrid.Row>\n    </DataGrid.Header>\n    <DataGrid.Body>\n      {#snippet children({ items })}\n        {#each items as row (row.id)}\n          <DataGrid.Row rowId={row.id}>\n            <DataGrid.Cell>{row.name}</DataGrid.Cell>\n            <DataGrid.Cell>{row.status}</DataGrid.Cell>\n          </DataGrid.Row>\n        {/each}\n      {/snippet}\n    </DataGrid.Body>\n  </DataGrid.Table>\n  <DataGrid.Pagination />\n</DataGrid.Root>',
	Chip: '<Chip variant="soft" color="blue">Policy friendly</Chip>',
	ChipGroup:
		'<ChipGroup.Root gap="md">\n  <ChipGroup.Label>WORKS WITH</ChipGroup.Label>\n  <Badge variant="soft">Local/MLX</Badge>\n  <Badge variant="soft">OpenAI</Badge>\n  <Badge variant="soft">Anthropic</Badge>\n  <Badge variant="soft">Mistral</Badge>\n</ChipGroup.Root>',
	Tooltip:
		'<Tooltip.Root>\n  <Tooltip.Trigger>\n    <Button variant="ghost">Hover me</Button>\n  </Tooltip.Trigger>\n  <Tooltip.Content>Extra information</Tooltip.Content>\n</Tooltip.Root>',
	Dialog:
		'<Dialog.Root bind:open={showDialog}>\n  <Dialog.Trigger>\n    <Button>Open Dialog</Button>\n  </Dialog.Trigger>\n  <Dialog.Content>\n    <Dialog.Header>Confirm</Dialog.Header>\n    <p>Are you sure?</p>\n    <Dialog.Footer>\n      <Button variant="outline" onclick={() => showDialog = false}>Cancel</Button>\n      <Button variant="solid" onclick={handleConfirm}>Confirm</Button>\n    </Dialog.Footer>\n  </Dialog.Content>\n</Dialog.Root>',
	Tabs: '<Tabs.Root bind:value={activeTab}>\n  <Tabs.List>\n    <Tabs.Trigger value="one">Tab 1</Tabs.Trigger>\n    <Tabs.Trigger value="two">Tab 2</Tabs.Trigger>\n  </Tabs.List>\n  <Tabs.Content value="one">First panel</Tabs.Content>\n  <Tabs.Content value="two">Second panel</Tabs.Content>\n</Tabs.Root>',
	Accordion:
		'<Accordion.Root>\n  <Accordion.Item value="a">\n    <Accordion.Trigger>Section A</Accordion.Trigger>\n    <Accordion.Content>Content for section A.</Accordion.Content>\n  </Accordion.Item>\n  <Accordion.Item value="b">\n    <Accordion.Trigger>Section B</Accordion.Trigger>\n    <Accordion.Content>Content for section B.</Accordion.Content>\n  </Accordion.Item>\n</Accordion.Root>',
	Select:
		'<Select.Root bind:value={selected} bind:open={selectOpen} name="selection">\n  <Select.Trigger>\n    <Select.Value placeholder="Choose…" />\n  </Select.Trigger>\n  <Select.Content>\n    <Select.Item value="a">Alpha</Select.Item>\n    <Select.Item value="b">Beta</Select.Item>\n  </Select.Content>\n</Select.Root>',
	Popover:
		'<Popover.Root bind:open={popoverOpen}>\n  <Popover.Trigger>\n    <Button variant="outline">Info</Button>\n  </Popover.Trigger>\n  <Popover.Content>\n    <p>Popover details here.</p>\n  </Popover.Content>\n</Popover.Root>',
	Drawer:
		'<Drawer.Root bind:open={drawerOpen}>\n  <Drawer.Trigger>\n    <Button>Open Drawer</Button>\n  </Drawer.Trigger>\n  <Drawer.Content side="right">\n    <Drawer.Header>Settings</Drawer.Header>\n    <p>Drawer body content.</p>\n  </Drawer.Content>\n</Drawer.Root>',
	DropdownMenu:
		'<DropdownMenu.Root>\n  <DropdownMenu.Trigger>\n    <Button variant="ghost">Menu</Button>\n  </DropdownMenu.Trigger>\n  <DropdownMenu.Content>\n    <DropdownMenu.Item onclick={handleEdit}>Edit</DropdownMenu.Item>\n    <DropdownMenu.Item onclick={handleDelete}>Delete</DropdownMenu.Item>\n  </DropdownMenu.Content>\n</DropdownMenu.Root>',
	Table:
		'<Table.Root>\n  <Table.Header>\n    <Table.Row>\n      <Table.Head>Name</Table.Head>\n      <Table.Head>Status</Table.Head>\n    </Table.Row>\n  </Table.Header>\n  <Table.Body>\n    <Table.Row>\n      <Table.Cell>Alice</Table.Cell>\n      <Table.Cell><Badge variant="soft">Active</Badge></Table.Cell>\n    </Table.Row>\n  </Table.Body>\n</Table.Root>',
	Field:
		'<Field.Root>\n  <Label>Username</Label>\n  <Input bind:value={username} />\n</Field.Root>',
	Fieldset:
		'<Fieldset.Root>\n  <Fieldset.Legend>Notification preferences</Fieldset.Legend>\n  <Fieldset.Description>Choose how release updates reach your team.</Fieldset.Description>\n  <Fieldset.Content>\n    <Checkbox checked={true}>Email digests</Checkbox>\n    <Checkbox>SMS alerts</Checkbox>\n  </Fieldset.Content>\n</Fieldset.Root>',
	DescriptionList:
		'<DescriptionList.Root>\n  <DescriptionList.Item>\n    <DescriptionList.Term>Workspace</DescriptionList.Term>\n    <DescriptionList.Description>North America expansion</DescriptionList.Description>\n  </DescriptionList.Item>\n  <DescriptionList.Item>\n    <DescriptionList.Term>Status</DescriptionList.Term>\n    <DescriptionList.Description>Reviewing launch checklist</DescriptionList.Description>\n  </DescriptionList.Item>\n</DescriptionList.Root>',
	DateField:
		'<DateField.Root bind:value={departureDate} name="departureDate">\n  <DateField.Segment type="month" />\n  <DateField.Separator />\n  <DateField.Segment type="day" />\n  <DateField.Separator />\n  <DateField.Segment type="year" />\n</DateField.Root>',
	DatePicker:
		'<DatePicker.Root bind:value={departureDate} name="departureDate">\n  <DatePicker.Trigger placeholder="Select departure date" />\n  <DatePicker.Content>\n    <DatePicker.Calendar />\n  </DatePicker.Content>\n</DatePicker.Root>',
	SegmentedControl:
		'<SegmentedControl.Root bind:value={tripType}>\n  <SegmentedControl.Item value="one-way">One way</SegmentedControl.Item>\n  <SegmentedControl.Item value="round-trip">Round trip</SegmentedControl.Item>\n  <SegmentedControl.Item value="multi-city">Multi-city</SegmentedControl.Item>\n</SegmentedControl.Root>',
	Heading: '<Heading level={2}>Launch readiness</Heading>',
	Text: '<Text as="p" color="secondary" size="sm">Use Text for supporting copy, labels, and starter-kit body content.</Text>',
	ThemeToggle: '<ThemeToggle storageKey="my-app-theme" />',
	TypingIndicator: '<TypingIndicator aria-label="Assistant is typing" />',
	Typography:
		'<Typography.Heading level={2}>Launch readiness</Typography.Heading>\n<Typography.Text color="muted" size="sm">Use Typography.Text for supporting copy and metadata.</Typography.Text>',
	Breadcrumb:
		'<Breadcrumb.Root>\n  <Breadcrumb.List>\n    <Breadcrumb.Item>\n      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>\n    </Breadcrumb.Item>\n    <Breadcrumb.Separator />\n    <Breadcrumb.Item>\n      <Breadcrumb.Link href="/docs">Docs</Breadcrumb.Link>\n    </Breadcrumb.Item>\n    <Breadcrumb.Separator />\n    <Breadcrumb.Item>\n      <Breadcrumb.Link current>Current</Breadcrumb.Link>\n    </Breadcrumb.Item>\n  </Breadcrumb.List>\n</Breadcrumb.Root>',
	Stepper:
		'<Stepper.Root bind:activeStep={activeStep}>\n  <Stepper.List>\n    <Stepper.Step step={0}>Account</Stepper.Step>\n    <Stepper.Separator step={0} />\n    <Stepper.Step step={1}>Profile</Stepper.Step>\n    <Stepper.Separator step={1} />\n    <Stepper.Step step={2}>Review</Stepper.Step>\n  </Stepper.List>\n</Stepper.Root>',
	Timeline:
		'<Timeline.Root>\n  <Timeline.Item>\n    <Timeline.Icon />\n    <Timeline.Content>\n      <Timeline.Title>Event title</Timeline.Title>\n      <Timeline.Description>Event description</Timeline.Description>\n      <Timeline.Time>2 hours ago</Timeline.Time>\n    </Timeline.Content>\n  </Timeline.Item>\n</Timeline.Root>',
	DateTimeInput: '<DateTimeInput bind:value={appointmentDate} name="appointment" />',
	FlipCard:
		'<FlipCard.Root trigger="hover">\n  <FlipCard.Front>Front content</FlipCard.Front>\n  <FlipCard.Back>Back content</FlipCard.Back>\n</FlipCard.Root>',
	Gauge:
		'<Gauge value={72} min={0} max={100} thresholds={[{ value: 30, color: "red" }, { value: 70, color: "orange" }, { value: 90, color: "green" }]} />',
	Map: '<Map.Root center={[-122.4, 37.8]} zoom={12}>\n  <Map.Marker position={[-122.4, 37.8]}>\n    <Map.Popup>San Francisco</Map.Popup>\n  </Map.Marker>\n  <Map.Controls navigation fullscreen />\n</Map.Root>',
	MegaMenu:
		'<MegaMenu.Root>\n  <MegaMenu.Trigger>Products</MegaMenu.Trigger>\n  <MegaMenu.Panel>\n    <MegaMenu.Column title="Platform">\n      <MegaMenu.Link href="/analytics">Analytics</MegaMenu.Link>\n      <MegaMenu.Link href="/automation">Automation</MegaMenu.Link>\n    </MegaMenu.Column>\n  </MegaMenu.Panel>\n</MegaMenu.Root>',
	NotificationCenter:
		'<NotificationCenter.Root bind:items={notifications} bind:open={panelOpen}>\n  <NotificationCenter.Trigger>\n    {#snippet children({ unreadCount })}\n      <Button>Notifications ({unreadCount})</Button>\n    {/snippet}\n  </NotificationCenter.Trigger>\n  <NotificationCenter.Panel>\n    <NotificationCenter.Group label="Today">\n      <NotificationCenter.Item id="1" variant="info">New deployment complete</NotificationCenter.Item>\n    </NotificationCenter.Group>\n  </NotificationCenter.Panel>\n</NotificationCenter.Root>',
	PhoneInput: '<PhoneInput bind:value={phone} defaultCountry="US" placeholder="(555) 123-4567" />',
	PinInput:
		'<PinInput.Root bind:value={pin} length={6} oncomplete={handleVerify}>\n  {#snippet children({ cells })}\n    <PinInput.Group>\n      {#each cells.slice(0, 3) as cell}\n        <PinInput.Cell {cell} />\n      {/each}\n    </PinInput.Group>\n    <PinInput.Separator />\n    <PinInput.Group>\n      {#each cells.slice(3) as cell}\n        <PinInput.Cell {cell} />\n      {/each}\n    </PinInput.Group>\n  {/snippet}\n</PinInput.Root>',
	Sparkline: '<Sparkline data={[5, 10, 3, 8, 12, 7]} width={120} height={30} />',
	VideoEmbed:
		'<VideoEmbed src="https://youtube.com/watch?v=dQw4w9WgXcQ" provider="youtube" title="Video title" />',
	// Travel Booking Components
	AddOnSelector:
		'<AddOnSelector.Root bind:selected={addOns}>\n  <AddOnSelector.Item value="baggage" maxQuantity={3}>\n    <AddOnSelector.ItemLabel>Extra Baggage</AddOnSelector.ItemLabel>\n    <AddOnSelector.ItemPrice>$25/bag</AddOnSelector.ItemPrice>\n  </AddOnSelector.Item>\n</AddOnSelector.Root>',
	AmenityGrid:
		'<AmenityGrid.Root>\n  <AmenityGrid.Amenity icon="wifi" label="Free WiFi" />\n  <AmenityGrid.Amenity icon="pool" label="Pool" />\n  <AmenityGrid.Amenity icon="parking" label="Parking" />\n</AmenityGrid.Root>',
	BookingConfirmation:
		'<BookingConfirmation.Root variant="success">\n  <BookingConfirmation.ConfirmationHeader title="Booking Confirmed!" />\n  <BookingConfirmation.BookingReference reference="ABC123" copyable />\n  <BookingConfirmation.ItinerarySummary>JFK → LAX, Mar 15</BookingConfirmation.ItinerarySummary>\n</BookingConfirmation.Root>',
	ComparisonTable:
		'<ComparisonTable.Root columns={["Economy", "Premium", "Business"]} highlightedColumn={1}>\n  <ComparisonTable.Header>\n    <ComparisonTable.HeaderCell>Feature</ComparisonTable.HeaderCell>\n  </ComparisonTable.Header>\n  <ComparisonTable.Body>\n    <ComparisonTable.Row>\n      <ComparisonTable.Cell>Baggage</ComparisonTable.Cell>\n      <ComparisonTable.Cell>1 bag</ComparisonTable.Cell>\n      <ComparisonTable.Cell>2 bags</ComparisonTable.Cell>\n      <ComparisonTable.Cell>3 bags</ComparisonTable.Cell>\n    </ComparisonTable.Row>\n  </ComparisonTable.Body>\n</ComparisonTable.Root>',
	CurrencySelector: '<CurrencySelector.Root bind:value={currency} />',
	FareClassPicker:
		'<FareClassPicker.Root bind:value={fareClass}>\n  <FareClassPicker.Option value="economy" label="Economy" price={199} currency="USD">\n    <FareClassPicker.FeatureList>\n      <FareClassPicker.FeatureItem included>1 carry-on</FareClassPicker.FeatureItem>\n    </FareClassPicker.FeatureList>\n  </FareClassPicker.Option>\n</FareClassPicker.Root>',
	FilterSidebar:
		'<FilterSidebar.Root>\n  <FilterSidebar.Group title="Price Range">\n    <FilterSidebar.PriceRange min={0} max={1000} bind:value={priceRange} />\n  </FilterSidebar.Group>\n  <FilterSidebar.Group title="Stops">\n    <FilterSidebar.CheckboxFilter options={stops} bind:selected={selectedStops} />\n  </FilterSidebar.Group>\n</FilterSidebar.Root>',
	FlexibleDatesGrid:
		'<FlexibleDatesGrid.Root departDates={departDates} returnDates={returnDates} prices={priceMatrix} bind:selectedDepart bind:selectedReturn />',
	FlightTimeline:
		'<FlightTimeline.Root>\n  <FlightTimeline.Segment>\n    <FlightTimeline.Departure time="8:00 AM" airport="JFK" city="New York" />\n    <FlightTimeline.Duration value="5h 30m" />\n    <FlightTimeline.Arrival time="11:30 AM" airport="LAX" city="Los Angeles" />\n    <FlightTimeline.FlightInfo airline="American Airlines" flightNumber="AA 100" />\n  </FlightTimeline.Segment>\n</FlightTimeline.Root>',
	GuestRoomSelector:
		'<GuestRoomSelector.Root bind:rooms={rooms}>\n  <GuestRoomSelector.Trigger />\n  <GuestRoomSelector.Content />\n</GuestRoomSelector.Root>',
	HotelGallery:
		'<HotelGallery.Root images={hotelImages} bind:lightboxOpen>\n  <HotelGallery.CategoryTabs />\n  <HotelGallery.Grid columns={3} maxVisible={6} />\n  <HotelGallery.Lightbox />\n</HotelGallery.Root>',
	ItineraryTimeline:
		'<ItineraryTimeline.Root>\n  <ItineraryTimeline.Day date="March 15" label="Day 1">\n    <ItineraryTimeline.Activity type="flight">\n      <ItineraryTimeline.ActivityTime>8:00 AM</ItineraryTimeline.ActivityTime>\n      <ItineraryTimeline.ActivityTitle>Flight to Paris</ItineraryTimeline.ActivityTitle>\n    </ItineraryTimeline.Activity>\n  </ItineraryTimeline.Day>\n</ItineraryTimeline.Root>',
	LocationAutocomplete:
		'<LocationAutocomplete.Root bind:value={airport}>\n  <LocationAutocomplete.Input placeholder="Search airports..." />\n  <LocationAutocomplete.Content>\n    <LocationAutocomplete.Group label="Airports">\n      <LocationAutocomplete.Item value="JFK" index={0} code="JFK">John F. Kennedy International</LocationAutocomplete.Item>\n    </LocationAutocomplete.Group>\n  </LocationAutocomplete.Content>\n</LocationAutocomplete.Root>',
	LoyaltyPointsDisplay:
		'<LoyaltyPointsDisplay.Root>\n  <LoyaltyPointsDisplay.Balance points={45000} />\n  <LoyaltyPointsDisplay.Tier tier="gold" />\n  <LoyaltyPointsDisplay.TierProgress current={45000} target={75000} nextTier="Platinum" />\n</LoyaltyPointsDisplay.Root>',
	MapListToggle:
		'<MapListToggle.Root bind:view={view} bind:selectedId>\n  <MapListToggle.ToggleBar />\n  <MapListToggle.MapPanel>Map content</MapListToggle.MapPanel>\n  <MapListToggle.ListPanel>List content</MapListToggle.ListPanel>\n</MapListToggle.Root>',
	MultiCitySearchForm:
		'<MultiCitySearchForm.Root bind:legs={flightLegs}>\n  {#each flightLegs as leg, i}\n    <MultiCitySearchForm.FlightLeg index={i}>\n      <MultiCitySearchForm.LegNumber index={i} />\n    </MultiCitySearchForm.FlightLeg>\n  {/each}\n  <MultiCitySearchForm.AddLegButton />\n</MultiCitySearchForm.Root>',
	PassengerClassSelector:
		'<PassengerClassSelector.Root bind:passengers bind:cabinClass>\n  <PassengerClassSelector.Trigger />\n  <PassengerClassSelector.Content />\n</PassengerClassSelector.Root>',
	PaymentCardInput:
		'<PaymentCardInput.Root bind:cardNumber bind:expiry bind:cvv>\n  <PaymentCardInput.CardNumber />\n  <PaymentCardInput.Expiry />\n  <PaymentCardInput.CVV />\n  <PaymentCardInput.CardIcon />\n</PaymentCardInput.Root>',
	PriceCalendar:
		'<PriceCalendar.Root bind:value={selectedDate} prices={datePrices}>\n  <PriceCalendar.Header>\n    <PriceCalendar.Prev />\n    <PriceCalendar.Heading />\n    <PriceCalendar.Next />\n  </PriceCalendar.Header>\n  <PriceCalendar.Grid />\n  <PriceCalendar.Legend />\n</PriceCalendar.Root>',
	PriceSummaryPanel:
		'<PriceSummaryPanel.Root currency="USD" sticky>\n  <PriceSummaryPanel.LineItem label="Base fare" amount={299} quantity={2} />\n  <PriceSummaryPanel.Discount label="Promo code" amount={50} />\n  <PriceSummaryPanel.Tax amount={87.50} />\n  <PriceSummaryPanel.Total amount={635.50} />\n</PriceSummaryPanel.Root>',
	PromoCodeInput:
		'<PromoCodeInput.Root bind:value={promoCode} status="idle" onApply={applyPromo} />',
	RecentSearches:
		'<RecentSearches.Root>\n  <RecentSearches.Chip label="NYC → LAX, Mar 15-22" />\n  <RecentSearches.Chip label="Paris Hotels, Apr 1-5" />\n</RecentSearches.Root>',
	Reveal:
		'<Reveal variant="slide-up" delay={120}>\n  <p>Stage content as it enters the viewport.</p>\n</Reveal>',
	ResultCardCar:
		'<ResultCardCar.Root>\n  <ResultCardCar.Image src="/car.jpg" />\n  <ResultCardCar.Details>\n    <ResultCardCar.Category>SUV</ResultCardCar.Category>\n    <ResultCardCar.Specs items={[{icon: "seats", label: "5"}]} />\n    <ResultCardCar.Price>$65/day</ResultCardCar.Price>\n  </ResultCardCar.Details>\n</ResultCardCar.Root>',
	ResultCardFlight:
		'<ResultCardFlight.Root>\n  <ResultCardFlight.Airline>American Airlines</ResultCardFlight.Airline>\n  <ResultCardFlight.Route>\n    <ResultCardFlight.Segment departure="8:00 AM" arrival="11:30 AM" />\n  </ResultCardFlight.Route>\n  <ResultCardFlight.Duration>5h 30m</ResultCardFlight.Duration>\n  <ResultCardFlight.Stops>Direct</ResultCardFlight.Stops>\n  <ResultCardFlight.Price>$299</ResultCardFlight.Price>\n</ResultCardFlight.Root>',
	ResultCardHotel:
		'<ResultCardHotel.Root>\n  <ResultCardHotel.Image src="/hotel.jpg" />\n  <ResultCardHotel.Details>\n    <ResultCardHotel.Name>Grand Hotel</ResultCardHotel.Name>\n    <ResultCardHotel.Rating score={8.5} label="Excellent" />\n    <ResultCardHotel.Price>$189/night</ResultCardHotel.Price>\n  </ResultCardHotel.Details>\n</ResultCardHotel.Root>',
	ReviewCard:
		'<ReviewCard.Root>\n  <ReviewCard.Reviewer>\n    <ReviewCard.ReviewerAvatar fallback="JD" />\n    <ReviewCard.ReviewerName>Jane Doe</ReviewCard.ReviewerName>\n    <ReviewCard.ReviewDate date="2026-03-01" />\n  </ReviewCard.Reviewer>\n  <ReviewCard.ReviewRating rating={9} scale={10} />\n  <ReviewCard.ReviewText>Excellent hotel with great service!</ReviewCard.ReviewText>\n</ReviewCard.Root>',
	RoomTypePicker:
		'<RoomTypePicker.Root bind:value={selectedRoom}>\n  <RoomTypePicker.RoomOption value="standard" label="Standard Room">\n    <RoomTypePicker.RoomPrice>$189/night</RoomTypePicker.RoomPrice>\n  </RoomTypePicker.RoomOption>\n  <RoomTypePicker.RoomOption value="deluxe" label="Deluxe Room">\n    <RoomTypePicker.RoomPrice>$289/night</RoomTypePicker.RoomPrice>\n  </RoomTypePicker.RoomOption>\n</RoomTypePicker.Root>',
	RouteMap:
		'<RouteMap.Root>\n  <RouteMap.Origin lat={40.6413} lng={-73.7781} label="JFK" />\n  <RouteMap.Destination lat={33.9425} lng={-118.4081} label="LAX" />\n  <RouteMap.FlightPath />\n</RouteMap.Root>',
	SearchFormTabs:
		'<SearchFormTabs.Root bind:value={searchType}>\n  <SearchFormTabs.Tab value="flights" icon="flights" label="Flights" />\n  <SearchFormTabs.Tab value="hotels" icon="hotels" label="Hotels" />\n  <SearchFormTabs.Tab value="cars" icon="cars" label="Cars" />\n  <SearchFormTabs.TabPanel value="flights">Flight search form</SearchFormTabs.TabPanel>\n</SearchFormTabs.Root>',
	SortBar:
		'<SortBar.Root bind:value={sortBy} bind:direction={sortDir}>\n  <SortBar.Option value="price">Price</SortBar.Option>\n  <SortBar.Option value="duration">Duration</SortBar.Option>\n  <SortBar.Option value="departure">Departure</SortBar.Option>\n</SortBar.Root>',
	Spotlight:
		'<Spotlight intensity={32}>\n  <p>Hover to pull a radial highlight across the surface.</p>\n</Spotlight>',
	TripCard:
		'<TripCard.Root variant="upcoming">\n  <TripCard.Image src="/paris.jpg" alt="Paris" />\n  <TripCard.Details>\n    <TripCard.Destination>Paris, France</TripCard.Destination>\n    <TripCard.Dates start="Mar 15" end="Mar 22" />\n    <TripCard.Status status="confirmed" />\n  </TripCard.Details>\n</TripCard.Root>',
	TrustBadges:
		'<TrustBadges.Root variant="inline">\n  <TrustBadges.Badge icon="shield" label="Secure Checkout" />\n  <TrustBadges.Badge icon="guarantee" label="Money-Back Guarantee" />\n</TrustBadges.Root>',
	Aurora:
		'<Aurora palette="ocean">\n  <p>Ambient backgrounds stay native and no-dependency.</p>\n</Aurora>',
	Noise:
		'<Noise opacity={0.12} blend="soft-light">\n  <p>Grain adds atmosphere without loading an external texture.</p>\n</Noise>'
};

export function generateExample(name: string, compound: boolean, parts?: string[]): string {
	if (EXAMPLE_OVERRIDES[name]) return EXAMPLE_OVERRIDES[name];

	if (!compound) return `<${name}>Content</${name}>`;

	if (parts && !parts.includes('Root')) {
		return parts.map((part) => `<${name}.${part}>...</${name}.${part}>`).join('\n');
	}

	const lines = [`<${name}.Root>`];
	for (const part of parts ?? []) {
		if (part === 'Root') continue;
		lines.push(`  <${name}.${part}>...</${name}.${part}>`);
	}
	lines.push(`</${name}.Root>`);
	return lines.join('\n');
}

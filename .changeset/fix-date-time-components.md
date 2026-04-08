---
"@dryui/ui": patch
---

Fix date/time component rendering and replace native time input

- Fix container-type: inline-size collapse bug in DatePicker calendar, DateField, and Select
- Replace native `<input type="time">` in TimeInput with DryUI Select dropdowns (hour + minute)
- Fix DateRangePicker: seamless cell-level range band, readable text on range endpoints
- Switch DateTimeInput from DateField to DatePicker for calendar popup
- Add min-height to Select trigger with sm variant override
- Fix DateField segment focus style for click interactions

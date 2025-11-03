# WebSocket Implementation Plan

## Backend Changes
- [ ] Create draft entity for form auto-save functionality
- [ ] Update forms.service.ts to add draft save/load methods and real-time broadcasting
- [ ] Update forms.controller.ts with draft endpoints
- [ ] Extend response.gateway.ts for real-time response updates
- [ ] Update form.gateway.ts for draft auto-save events

## Frontend Changes
- [ ] Update api/forms.js with draft API calls
- [ ] Add WebSocket connection in FormResponses.jsx for real-time updates
- [ ] Add auto-save functionality in PublicForm.jsx with draft loading

## Testing
- [ ] Verify real-time response visibility from mobile QR scans
- [ ] Test form draft auto-save and restoration after network errors

# Test Cases: Maximum 16 Guests Limit

This document outlines the test cases for enforcing the maximum 16 guests limit across the frontend and backend.

## Frontend Test Cases

| ID | Component | Description | Steps | Expected Result |
|---|---|---|---|---|
| TC-FE-01 | SearchBar | Limit total guests (Adults + Children) to 16 | 1. Open Search Bar.<br>2. Increment Adults to 10.<br>3. Increment Children to 6. | "+" button for Adults and Children should be disabled when total is 16. |
| TC-FE-02 | SearchBar | Prevent increasing guests if no adults | 1. Open Search Bar.<br>2. Ensure Adults is 0.<br>3. Try to increment Children. | "+" button for Children should be disabled if Adults count is 0. |
| TC-FE-03 | ListingDetail | Guest dropdown should not exceed 16 | 1. Open a listing that allows many guests.<br>2. Check guest selection dropdown. | Dropdown options should only go up to a maximum of 16, even if listing allows more. |
| TC-FE-04 | ListingDetail | Guest dropdown should respect listing's `maxGuests` | 1. Open a listing with `maxGuests: 4`.<br>2. Check guest selection dropdown. | Dropdown options should only go up to 4. |
| TC-FE-05 | BecomeHost | Limit max guests during listing creation | 1. Navigate to Step 3 of "Become a Host".<br>2. Try to enter 17 in the "Guests" input. | Input should prevent values over 16 via the `max="16"` attribute. |

## Backend Test Cases

| ID | Endpoint | Description | Request Payload | Expected Result |
|---|---|---|---|---|
| TC-BE-01 | POST /api/bookings | Enforce absolute 16 guest limit | `{ "guests": 17, ... }` | `400 Bad Request`<br>`{ "error": "Maximum 16 guests allowed" }` |
| TC-BE-02 | POST /api/bookings | Respect listing's specific `maxGuests` | Listing has `maxGuests: 5`.<br>`{ "guests": 6, ... }` | `400 Bad Request`<br>`{ "error": "Maximum 5 guests allowed" }` |
| TC-BE-03 | POST /api/bookings | Allow valid guest count | Listing has `maxGuests: 10`.<br>`{ "guests": 8, ... }` | `201 Created` |
| TC-BE-04 | POST /api/listings | Enforce 16 guest limit on creation | `{ "maxGuests": 17, ... }` | `400 Bad Request`<br>(Mongoose validation error) |
| TC-BE-05 | PATCH /api/listings/:id | Enforce 16 guest limit on update | `{ "maxGuests": 20 }` | `400 Bad Request`<br>(Mongoose validation error) |

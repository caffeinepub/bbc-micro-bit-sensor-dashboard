# Specification

## Summary
**Goal:** Add a new password-gated "ATPA – Admin Transmission Ports Access" glassmorphism panel to the dashboard that houses the existing ConnectionPanel and a device location input, without modifying any existing components.

**Planned changes:**
- Add a new `ATPAPanel` component styled with the existing glassmorphism design (frosted glass, glowing borders, smooth CSS transitions).
- The panel always shows a password input and "Access" button when locked; entering the correct password (`2AKFPMB0220`) unlocks it, any other value shows "Access Denied – Invalid Credentials".
- In the unlocked state, render the existing `ConnectionPanel` component inside the ATPA panel via composition (no changes to `ConnectionPanel`).
- Remove the standalone `ConnectionPanel` from its current placement in `App.tsx` and render it exclusively inside the ATPA panel when unlocked.
- In the unlocked state, below the `ConnectionPanel`, add a "Device Location" section with a text input and "Set Location" button that displays the entered location as `micro:bit Location: <value>` within the ATPA panel.
- A "Lock / Sign Out" button in the unlocked state resets the panel to the login form and clears the location.
- All sensor data continues to flow to all other dashboard panels regardless of ATPA lock state.

**User-visible outcome:** Users see a new ATPA panel on the dashboard. After entering the correct password, they can connect the micro:bit via Bluetooth or USB Serial and set a location label — all without any other panel or component being affected.

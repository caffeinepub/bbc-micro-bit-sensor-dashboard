# Specification

## Summary
**Goal:** Extend the temperature scale bar range in TemperaturePanel to span from -50°C to +110°C.

**Planned changes:**
- Update the minimum bound of the temperature scale bar from its current value to -50°C
- Update the maximum bound of the temperature scale bar to +110°C
- Recalculate the percentage fill formula and any tick/label positions to use the new -50°C to +110°C range

**User-visible outcome:** The temperature bar now displays the full range from -50°C (0%) to +110°C (100%), with correct proportional fill for any reading within that range.

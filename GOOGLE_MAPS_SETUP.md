# Google Maps itinerary setup

1. Create or copy `.env.example` as `.env.local`.
2. Set `VITE_GOOGLE_MAPS_API_KEY` to a browser-restricted Google Maps Platform key.
3. Enable **Maps JavaScript API** and **Directions API** for that Google Cloud project, and make sure billing is enabled.
4. Restart Vite with `npm run dev`.

The route renderer sends the ordered `mission.route.stops` list to Google Directions with `optimizeWaypoints: false`, so the requested order is preserved. A round trip is represented by repeating the first stop as the last stop.

Without a key, the app intentionally falls back to its local road-style preview so the rest of the mission workflow remains usable.

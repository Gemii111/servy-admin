# Admin P2 Endpoints — Frontend Handoff

> **Audience:** Admin dashboard frontend team
> **Status:** Implemented on backend, build green, tests pass
> **Migration:** `000038_add_geofence_settings` must be applied before deploy
> **Last updated:** 2026-05-17

This document covers the **P2** batch. P0 work is in `ADMIN_P0_FRONTEND_HANDOFF.md`, P1 work is in `ADMIN_P1_FRONTEND_HANDOFF.md`.

P2 is being shipped in small slices. This first slice covers **DB-backed geofence settings**. Remaining P2 items (RBAC, rewards, admin WebSocket streams) are listed at the bottom and not yet implemented.

---

## 1. Common conventions

Same as P0/P1 — admin Bearer JWT or API key, `application/json`, `{ "error": "..." }` shape on failures.

---

## 2. Geofence settings

The service-area geofence used by checkout is now DB-backed instead of env-only. Admins can edit the polygon, the on/off toggle, and the failure messages from the dashboard. The order service reads the config with a 30-second in-memory cache, so admin edits propagate fast without hammering Postgres on every checkout.

### 2.1 Get current geofence

```
GET /admin/settings/geofence
```

**Response**
```json
{
  "enabled": true,
  "polygon": [
    [30.05, 31.23],
    [30.06, 31.25],
    [30.04, 31.26]
  ],
  "message_ar": "التوصيل غير متاح في منطقتك",
  "message_en": "Delivery is not available in your area"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `enabled` | bool | Master switch. When `false`, the geofence is ignored regardless of polygon contents |
| `polygon` | `[[lat, lon], ...]` | Vertices in `[lat, lon]` order. Doesn't need to be explicitly closed — backend wraps the last segment to the first vertex |
| `message_ar` | string | Arabic copy returned to clients when a delivery address falls outside the area |
| `message_en` | string | English copy |

### 2.2 Update geofence

```
PUT /admin/settings/geofence
```

All fields are optional — only the keys present in the body are updated. Returns the fully-resolved config after the update so the UI can refresh in one round-trip.

**Body**
```json
{
  "enabled": true,
  "polygon": [
    [30.05, 31.23],
    [30.06, 31.25],
    [30.04, 31.26]
  ],
  "message_ar": "...",
  "message_en": "..."
}
```

**Responses**
| Status | Body |
|--------|------|
| 200 | Returns the full `GeofenceSettings` object (same shape as GET) |
| 400 | `{ "error": "..." }` — invalid JSON |
| 500 | `{ "error": "..." }` |

### 2.3 Behavior rules

These are the backend rules so the UI can mirror them in real-time validation:

1. **`enabled: false` disables the geofence.** Checkouts are not constrained by polygon at all.
2. **A polygon with fewer than 3 vertices** is treated as "no polygon" — the order service falls back to the env-based service zones (legacy behavior). This is a safety hatch so admins can't accidentally lock everyone out.
3. **The 30-second cache** means admin edits can take up to 30s to take effect in production checkout. Acceptable for ops use — flag this in the success toast.
4. **Vertex order is `[lat, lon]`**, not `[lon, lat]`. Common gotcha — many mapping libraries default to the opposite.
5. The `message_ar` / `message_en` fields are **not currently surfaced** by the checkout failure response (the API returns a generic `ErrOutsideServiceArea`). If the customer app needs the localized message inline, ping backend to wire it into the order error payload.

---

## 3. Migration required before deploy

| Migration | What it does |
|-----------|--------------|
| `000038_add_geofence_settings` | Seeds `geofence_enabled` / `geofence_polygon` / `geofence_message_ar` / `geofence_message_en` rows in `app_settings`. Defaults to `enabled: false` and an empty polygon, so existing checkout behavior is preserved on deploy. |

> ⚠️ The migration was renumbered from `000037` → `000038` to avoid a collision with the `cuisine_type` migration that landed in parallel. Make sure your local branch has the renumbered file before running `migrate up`.

---

## 4. Suggested UI patterns

| Surface | Recommendation |
|---------|----------------|
| Settings → Geofence page | Map widget (Leaflet/Mapbox) with draggable polygon vertices. Show current vertex count next to the map; warn the user when count < 3. |
| Enable/disable toggle | Big switch at the top of the page. When off, render the polygon greyed out so the admin can still see/edit it without it taking effect. |
| Message inputs | Two text fields (AR/EN) side by side under the map. Show character count. |
| Save action | Submit the **full** geofence object (not a partial PUT). It's simpler for the UI even though the backend supports partial updates. |
| Cache notice | After save, show a toast like "Saved — may take up to 30 seconds to apply to live checkouts." |

---

## 5. What's still pending in P2

These items remain unimplemented and need separate scoping before backend work starts:

| Item | Why it's deferred |
|------|-------------------|
| WebSocket / SSE admin streams (`/admin/orders/stream`, `/admin/drivers/location/stream`) | Smallest of the remaining; ~45min. Easy to slot in next. |
| RBAC (super_admin / operations / marketing / support roles) | Needs design: how is the admin user model extended? How does API-key auth get a role? Best discussed before implementation. |
| Rewards admin endpoints | Brand new domain. Confirm product requirements (catalog? redemption flow? expiration?) before writing schema. |
| Per-route audit descriptions | Quality-of-life improvement on the existing audit log. Could be done incrementally per endpoint. |
| `adminName` lookup in audit rows | Requires linking admin user IDs to a display-name source. |

# Remaining Pricing Route Updates

All remaining routes follow this pattern:

## Transport Pricing
- Table: `transport_pricing` (has extra field: `price_per_vehicle`)
- Entity: `operator_transport`
- Routes to update:
  - `app/api/pricing/transport/[id]/prices/route.ts`
  - `app/api/pricing/transport/[id]/prices/[priceId]/route.ts`

## Restaurant Pricing
- Table: `restaurant_pricing` (has extra field: `menu_option`)
- Entity: `operator_restaurants`
- Routes to update:
  - `app/api/pricing/restaurants/[id]/prices/route.ts`
  - `app/api/pricing/restaurants/[id]/prices/[priceId]/route.ts`

## Guide Pricing
- Table: `guide_pricing` (different structure: only `daily_rate`, no child pricing)
- Entity: `operator_guide_services`
- Routes to update:
  - `app/api/pricing/guides/[id]/prices/route.ts`
  - `app/api/pricing/guides/[id]/prices/[priceId]/route.ts`

## Additional Service Pricing
- Table: `additional_service_pricing`
- Entity: `operator_additional_services`
- Routes to update:
  - `app/api/pricing/additional/[id]/prices/route.ts`
  - `app/api/pricing/additional/[id]/prices/[priceId]/route.ts`

All follow the same fields:
- season_name
- start_date, end_date
- pp_dbl_rate
- single_supplement
- child_0to2, child_3to5, child_6to11

# Excel Import Templates Structure

## 1. HOTELS.xlsx
**Single sheet with columns:**

| Hotel Name | City | Star Rating | Season Name | Start Date | End Date | Currency | Double BB | Single Supp BB | Triple BB | Child 0-6 BB | Child 6-12 BB | Base Meal Plan | HB Supplement | FB Supplement | AI Supplement | Notes |
|------------|------|-------------|-------------|------------|----------|----------|-----------|----------------|-----------|--------------|---------------|----------------|---------------|---------------|---------------|-------|
| Hotel Sultanahmet | Istanbul | 4 | Summer 2025 | 2025-04-01 | 2025-10-31 | EUR | 50 | 30 | 45 | 0 | 20 | BB | 10 | 20 | 30 | Breakfast included |
| Hotel Cappadocia Cave | Cappadocia | 5 | Winter 2025 | 2025-11-01 | 2026-03-31 | EUR | 80 | 40 | 70 | 0 | 30 | HB | 0 | 10 | 20 | HB is base price |

**Column Descriptions:**
- **Hotel Name**: Name of the hotel
- **City**: City location
- **Star Rating**: 1-5 stars
- **Season Name**: e.g., "Summer 2025", "Winter 2025"
- **Start Date**: Season start (YYYY-MM-DD)
- **End Date**: Season end (YYYY-MM-DD)
- **Currency**: EUR, USD, GBP, TRY
- **Double BB**: Price per person in double room with breakfast
- **Single Supp BB**: Single room supplement with breakfast
- **Triple BB**: Price per person in triple room with breakfast
- **Child 0-6 BB**: Child 0-5.99 years with breakfast
- **Child 6-12 BB**: Child 6-11.99 years with breakfast
- **Base Meal Plan**: BB/HB/FB/AI (what's included in base price)
- **HB/FB/AI Supplement**: Additional cost per person (0 if not offered)

---

## 2. TOURS.xlsx
**Single sheet with columns:**

| Tour Name | Tour Code | City | Duration Days | Tour Type | Season Name | Start Date | End Date | Currency | 2 Pax | 4 Pax | 6 Pax | 8 Pax | 10 Pax | Inclusions | Exclusions | Notes |
|-----------|-----------|------|---------------|-----------|-------------|------------|----------|----------|-------|-------|-------|-------|--------|------------|------------|-------|
| Bosphorus Cruise | BOS-SIC-01 | Istanbul | 1 | SIC | All Year | 2025-01-01 | 2025-12-31 | EUR | 45 | 45 | 45 | 45 | 45 | Guide, Transport, Entrance | Meals, Tips | Fixed per person |
| Ephesus Private | EPH-PVT-01 | Izmir | 1 | PRIVATE | Summer | 2025-04-01 | 2025-10-31 | EUR | 80 | 60 | 50 | 45 | 40 | Transport | Guide, Entrance | Guide separate |

**Column Descriptions:**
- **Tour Name**: Full tour name
- **Tour Code**: Unique identifier
- **City**: Main city
- **Duration Days**: Tour duration (1, 2, 3 days, etc.)
- **Tour Type**: SIC or PRIVATE
- **Season Name**: Season identifier
- **Start/End Date**: Valid dates (YYYY-MM-DD)
- **Currency**: EUR, USD, GBP, TRY
- **2 Pax to 10 Pax**: Price per person for each group size
- **Inclusions**: What's included (for SIC: guide, transport, entrance)
- **Exclusions**: What's NOT included

---

## 3. VEHICLES.xlsx
**Single sheet with columns:**

| Vehicle Type | Max Capacity | City | Season Name | Start Date | End Date | Currency | Full Day | Half Day | Airport to Hotel | Hotel to Airport | Round Trip | Notes |
|--------------|--------------|------|-------------|------------|----------|----------|----------|----------|------------------|------------------|-----------|-------|
| Vito | 4 | Istanbul | All Year | 2025-01-01 | 2025-12-31 | EUR | 120 | 70 | 50 | 50 | 85 | IST Airport |
| Vito | 4 | Antalya | All Year | 2025-01-01 | 2025-12-31 | EUR | 120 | 70 | 40 | 40 | 70 | AYT Airport |
| Sprinter | 10 | Istanbul | Summer | 2025-04-01 | 2025-10-31 | EUR | 180 | 100 | 70 | 70 | 120 | Max 10 passengers |
| Coach | 46 | Any | All Year | 2025-01-01 | 2025-12-31 | EUR | 350 | 200 | 120 | 120 | 200 | Large groups |

**Column Descriptions:**
- **Vehicle Type**: Vito, Sprinter, Isuzu, Coach
- **Max Capacity**: Maximum passengers
- **City**: City for transfers (Istanbul, Antalya, Cappadocia, Izmir, etc.) or "Any" for general use
- **Season Name**: Season identifier
- **Start/End Date**: Valid dates
- **Currency**: EUR, USD, GBP, TRY
- **Full Day**: Full day rental price
- **Half Day**: Half day rental price
- **Airport to Hotel**: One-way transfer from airport to hotel
- **Hotel to Airport**: One-way transfer from hotel to airport
- **Round Trip**: Both ways (usually discounted vs. 2x one-way)

---

## 4. GUIDES.xlsx
**Single sheet with columns:**

| City | Language | Season Name | Start Date | End Date | Currency | Full Day | Half Day | Night | Notes |
|------|----------|-------------|------------|----------|----------|----------|----------|-------|-------|
| Istanbul | English | All Year | 2025-01-01 | 2025-12-31 | EUR | 100 | 60 | 80 | Licensed guide |
| Istanbul | Spanish | All Year | 2025-01-01 | 2025-12-31 | EUR | 120 | 70 | 90 | Premium language |
| Cappadocia | English | Summer | 2025-04-01 | 2025-10-31 | EUR | 110 | 65 | 85 | Peak season |

**Column Descriptions:**
- **City**: Guide location
- **Language**: English, Spanish, French, German, etc.
- **Season Name**: Season identifier
- **Start/End Date**: Valid dates
- **Currency**: EUR, USD, GBP, TRY
- **Full Day**: Full day guide fee
- **Half Day**: Half day guide fee
- **Night**: Night tour guide fee

---

## 5. ENTRANCE-FEES.xlsx
**Single sheet with columns:**

| Site Name | City | Season Name | Start Date | End Date | Currency | Adult Price | Child Price | Student Price | Notes |
|-----------|------|-------------|------------|----------|----------|-------------|-------------|---------------|-------|
| Hagia Sophia | Istanbul | All Year | 2025-01-01 | 2025-12-31 | EUR | 25 | 0 | 12.50 | Children under 12 free |
| Topkapi Palace | Istanbul | Summer | 2025-04-01 | 2025-10-31 | EUR | 20 | 0 | 10 | Peak season |
| Ephesus | Izmir | All Year | 2025-01-01 | 2025-12-31 | EUR | 15 | 7.50 | 7.50 | Ancient ruins |

**Column Descriptions:**
- **Site Name**: Museum/site name
- **City**: Location
- **Season Name**: Season identifier
- **Start/End Date**: Valid dates
- **Currency**: EUR, USD, GBP, TRY
- **Adult/Child/Student Price**: Entrance fees

---

## 6. MEALS.xlsx
**Single sheet with columns:**

| Restaurant Name | City | Meal Type | Season Name | Start Date | End Date | Currency | Adult Lunch | Child Lunch | Adult Dinner | Child Dinner | Menu Description | Notes |
|-----------------|------|-----------|-------------|------------|----------|----------|-------------|-------------|--------------|--------------|------------------|-------|
| Sultanahmet Restaurant | Istanbul | Both | All Year | 2025-01-01 | 2025-12-31 | EUR | 15 | 10 | 20 | 12 | Turkish cuisine | Popular spot |
| Cappadocia Cave Rest | Cappadocia | Dinner | Summer | 2025-04-01 | 2025-10-31 | EUR | 0 | 0 | 25 | 15 | Traditional pottery | Dinner only |

**Column Descriptions:**
- **Restaurant Name**: Restaurant name
- **City**: Location
- **Meal Type**: Lunch, Dinner, or Both
- **Season Name**: Season identifier
- **Start/End Date**: Valid dates
- **Currency**: EUR, USD, GBP, TRY
- **Adult/Child Lunch/Dinner**: Meal prices (0 if not offered)
- **Menu Description**: What's included

---

## 7. EXTRAS.xlsx
**Single sheet with columns:**

| Expense Name | Category | City | Currency | Unit Price | Unit Type | Description | Notes |
|--------------|----------|------|----------|------------|-----------|-------------|-------|
| Parking Fee | Parking | Istanbul | EUR | 10 | per day | Daily parking fee | Central areas |
| Highway Toll | Tolls | Istanbul-Ankara | EUR | 15 | per trip | One-way toll | Motorway |
| Driver Tip | Tips | Any | EUR | 5 | per day | Recommended tip | Optional |
| Porter Service | Service | Any | EUR | 2 | per bag | Luggage handling | Hotels |

**Column Descriptions:**
- **Expense Name**: What is the expense
- **Category**: Parking, Tips, Tolls, Service, etc.
- **City**: Location (or "Any" for general)
- **Currency**: EUR, USD, GBP, TRY
- **Unit Price**: Cost per unit
- **Unit Type**: per day, per item, per pax, per trip, etc.
- **Description**: Details

---

## Important Notes:

1. **Date Format**: Always use YYYY-MM-DD (e.g., 2025-04-01)
2. **Decimal Numbers**: Use dot (.) not comma (e.g., 15.50 not 15,50)
3. **Leave Empty**: If a price doesn't apply, use 0 or leave empty
4. **Currency**: Must match: EUR, USD, GBP, TRY
5. **Duplicate Seasons**: You can have multiple rows for the same item with different seasons
6. **Price History**: When updating, don't delete old rows - add new rows with new dates

## Example: Multiple Seasons for Same Hotel

| Hotel Name | City | Season | Start Date | End Date | Double BB |
|------------|------|--------|------------|----------|-----------|
| Hotel ABC | Istanbul | Winter 2025 | 2025-01-01 | 2025-03-31 | 40 |
| Hotel ABC | Istanbul | Spring 2025 | 2025-04-01 | 2025-06-30 | 55 |
| Hotel ABC | Istanbul | Summer 2025 | 2025-07-01 | 2025-09-30 | 70 |
| Hotel ABC | Istanbul | Autumn 2025 | 2025-10-01 | 2025-12-31 | 50 |

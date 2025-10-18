import requests
import json
from typing import Dict, List, Any

class TQB_AI_Generator:
    """AI-powered itinerary generator for TravelQuoteBot"""

    def __init__(self):
        self.ai_api_url = "http://localhost:11434/api/generate"
        self.model = "turkey-expert"

    def generate_itinerary(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate itinerary using operator's data"""
        print(f"Generating for operator: {params.get('operator_id')}")

        # NEW: Check if we received a pre-built prompt from Next.js
        if params.get('prompt'):
            print("Using pre-built prompt from Next.js (SAME AS CLAUDE)")
            prompt = params['prompt']
        else:
            print("Building prompt internally")
            prompt = self._build_prompt(params)

        try:
            ai_response = self._call_ollama(prompt)
            itinerary = json.loads(ai_response)

            # Post-process: Map service names to actual IDs
            itinerary = self._map_service_ids(itinerary, params)

            return itinerary
        except Exception as e:
            print(f"Error: {e}")
            return {
                "title": f"{params['days']}-Day Turkey Tour",
                "summary": "Custom itinerary",
                "days": []
            }

    def _map_service_ids(self, itinerary: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
        """Map service names to database IDs"""
        # Build lookup dictionaries
        accs = {a['name']: a['id'] for a in params.get('accommodations', [])}
        acts = {a['name']: a['id'] for a in params.get('activities', [])}
        rests = {r['name']: r['id'] for r in params.get('restaurants', [])}

        # Map IDs in each day's expenses
        for day in itinerary.get('days', []):
            for expense in day.get('expenses', []):
                name = expense.get('name', '')

                # Try to find matching service ID
                if expense.get('category') == 'accommodation':
                    expense['serviceId'] = accs.get(name, None)
                elif expense.get('category') == 'activity':
                    expense['serviceId'] = acts.get(name, None)
                elif expense.get('category') == 'meal':
                    expense['serviceId'] = rests.get(name, None)

        return itinerary

    def _build_prompt(self, params: Dict[str, Any]) -> str:
        """Build comprehensive prompt with operator's services"""
        days = params['days']
        cities = ', '.join(params['cities'])
        pax = params['pax']
        interests = ', '.join(params.get('interests', ['history', 'culture']))
        start_date = params.get('start_date', '2025-06-01')
        budget = params.get('budget', 'moderate')

        accs = params.get('accommodations', [])
        acts = params.get('activities', [])
        rests = params.get('restaurants', [])

        # Simplified accommodation list
        acc_text = "\n".join([
            f"- {a['name']} ({a['city']}) - {a['star_rating']}⭐ | ${float(a['base_price_per_night']):.0f}/night"
            for a in accs[:10]
        ]) if accs else "None available"

        # Simplified activities list
        act_text = "\n".join([
            f"- {a['name']} ({a['city']}) | ${float(a['base_price']):.0f}/person | {a.get('duration_hours', 3)}hrs"
            for a in acts[:15]
        ]) if acts else "None available"

        # Simplified restaurants list
        rest_text = "\n".join([
            f"- {r['name']} ({r['city']}) - {r.get('cuisine_type', 'Turkish')} | L:${float(r.get('lunch_price') or 20):.0f} D:${float(r.get('dinner_price') or 30):.0f}"
            for r in rests[:10]
        ]) if rests else "None available"

        nights = days - 1

        return f"""Create a {days}-day Turkey itinerary as JSON.

REQUIREMENTS:
- Travelers: {pax} people
- Duration: {days} days ({nights} nights)
- Cities: {cities}
- Start: {start_date}
- Budget: {budget}

AVAILABLE SERVICES:
Hotels ({len(accs)} available):
{acc_text}

Activities ({len(acts)} available):
{act_text}

Restaurants ({len(rests)} available):
{rest_text}

PACKAGE STRUCTURE (REQUIRED):
Every full package MUST include these 3 components:
1. ACCOMMODATION - Hotel for {nights} nights (days - 1)
2. TRANSFERS - IN (arrival) + OUT (departure) transfers
3. SIGHTSEEING - Daily tours/activities

CRITICAL RULES:
1. Use ONLY services listed above (use exact names)
2. {days} days = {nights} nights accommodation (NOT {days} nights!)
3. ALWAYS include transfers (in & out) in Day 1 and final day
4. Return ONLY valid JSON (no markdown, no extra text)
5. Every price must be a number
6. Create exactly {days} days

JSON FORMAT:
{{
  "title": "Trip title",
  "summary": "Brief description",
  "highlights": ["Day 1: highlight", "Day 2: highlight"],
  "totalEstimatedCost": {{
    "breakdown": {{"accommodations": 200, "activities": 300, "meals": 150, "transportation": 0}},
    "subtotal": 650,
    "total": 650,
    "perPerson": 325,
    "currency": "USD"
  }},
  "whatIsIncluded": ["Item 1", "Item 2"],
  "whatIsNotIncluded": ["Item 1", "Item 2"],
  "days": [
    {{
      "day": 1,
      "date": "{start_date}",
      "title": "Arrival in Istanbul",
      "city": "Istanbul",
      "mealCode": "B,L,D",
      "highlights": ["Visit Hagia Sophia", "Blue Mosque tour"],
      "freeTime": "15:00-18:00 - Free time to explore",
      "expenses": [
        {{
          "category": "transport",
          "serviceId": null,
          "serviceType": "transport",
          "name": "Airport to Hotel Transfer (IN)",
          "description": "Private arrival transfer",
          "time": "Arrival time",
          "pricePerPerson": 30.00,
          "quantity": {pax},
          "totalPrice": {pax * 30.00}
        }},
        {{
          "category": "accommodation",
          "serviceId": null,
          "serviceType": "accommodation",
          "name": "Hotel Name From List",
          "description": "Comfortable hotel",
          "basePricePerNight": 100.00,
          "quantity": {nights},
          "totalPrice": {nights * 100.00}
        }},
        {{
          "category": "activity",
          "serviceId": null,
          "serviceType": "activity",
          "name": "Activity Name From List",
          "description": "Sightseeing tour",
          "time": "09:00",
          "pricePerPerson": 50.00,
          "quantity": {pax},
          "totalPrice": {pax * 50.00}
        }},
        {{
          "category": "meal",
          "serviceId": null,
          "serviceType": "restaurant",
          "name": "Restaurant Name From List",
          "mealType": "lunch",
          "time": "12:30",
          "pricePerPerson": 20.00,
          "quantity": {pax},
          "totalPrice": {pax * 20.00}
        }}
      ]
    }},
    {{
      "day": {days},
      "date": "Calculate final day date",
      "title": "Departure",
      "city": "Istanbul",
      "mealCode": "B",
      "highlights": ["Hotel checkout", "Departure transfer"],
      "freeTime": "Morning free time before departure",
      "expenses": [
        {{
          "category": "transport",
          "serviceId": null,
          "serviceType": "transport",
          "name": "Hotel to Airport Transfer (OUT)",
          "description": "Private departure transfer",
          "time": "Departure time",
          "pricePerPerson": 30.00,
          "quantity": {pax},
          "totalPrice": {pax * 30.00}
        }}
      ]
    }}
  ],
  "packingList": ["Item 1", "Item 2"],
  "importantNotes": ["Note 1", "Note 2"],
  "emergencyContacts": {{"tourOperator": "Contact info", "emergencyServices": "112"}}
}}

RESPOND WITH JSON ONLY - NO MARKDOWN, NO COMMENTS, NO EXTRA TEXT."""

    def _call_ollama(self, prompt: str) -> str:
        """Call Ollama AI"""
        response = requests.post(
            self.ai_api_url,
            json={
                "model": self.model,
                "prompt": prompt,
                "temperature": 0.5,
                "num_predict": 16000,
                "stream": False,
                "format": "json"
            },
            timeout=300
        )
        result = response.json()
        text = result.get("response", "")

        # Clean markdown formatting
        text = text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        return text

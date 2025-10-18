#!/usr/bin/env python3
"""
Database Connector for TravelQuoteBot AI
Connects to TravelQuoteBot database with UUID operator support
"""

import mysql.connector
from mysql.connector import pooling
from typing import List, Dict, Optional
import time

class TQBDatabaseConnector:
    def __init__(self):
        """Initialize database connection pool for TravelQuoteBot"""
        # Cache for operator data (reduces database queries)
        self._cache = {}
        self._cache_ttl = 3600  # Cache for 1 hour

        # TravelQuoteBot database configuration
        self.config = {
            'host': '188.132.230.193',
            'user': 'tqb',
            'password': 'Dlr235672.-Yt',
            'database': 'tqb_db',
            'port': 3306
        }

        # Create connection pool
        self.pool = pooling.MySQLConnectionPool(
            pool_name="tqb_pool",
            pool_size=10,
            **self.config
        )
        print("TQB Database connector initialized")

    def _execute_query(self, query: str, params: tuple = None) -> List[Dict]:
        """Execute query and return results as list of dictionaries"""
        conn = self.pool.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            cursor.execute(query, params or ())
            results = cursor.fetchall()
            return results
        except Exception as e:
            print(f"Database error: {e}")
            print(f"Query: {query}")
            print(f"Params: {params}")
            return []
        finally:
            cursor.close()
            conn.close()

    def _get_cached(self, cache_key: str):
        """Get data from cache if not expired"""
        if cache_key in self._cache:
            cached_data, timestamp = self._cache[cache_key]
            if time.time() - timestamp < self._cache_ttl:
                print(f"Cache HIT: {cache_key}")
                return cached_data
            else:
                print(f"Cache EXPIRED: {cache_key}")
                del self._cache[cache_key]
        return None

    def _set_cached(self, cache_key: str, data):
        """Store data in cache with timestamp"""
        self._cache[cache_key] = (data, time.time())
        print(f"Cache STORED: {cache_key} ({len(data)} items)")

    def get_operator_accommodations(self, operator_id: str, cities: List[str]) -> List[Dict]:
        """Get accommodations for given cities (operator_id is UUID string)"""
        cache_key = f"op_{operator_id}_acc_{'_'.join(sorted(cities))}"
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached

        if not cities:
            return []

        placeholders = ','.join(['%s'] * len(cities))
        query = f"""
            SELECT
                a.id, a.name, a.city, a.category, a.star_rating,
                a.base_price_per_night, a.description, a.amenities,
                a.address, a.phone, a.check_in_time, a.check_out_time
            FROM accommodations a
            WHERE a.operator_id = %s
                AND a.city IN ({placeholders})
                AND a.is_active = 1
            ORDER BY a.city, a.star_rating DESC, a.category
            LIMIT 20
        """
        params = (operator_id, *cities)
        results = self._execute_query(query, params)
        self._set_cached(cache_key, results)
        return results

    def get_operator_activities(self, operator_id: str, cities: List[str]) -> List[Dict]:
        """Get activities for given cities (operator_id is UUID string)"""
        cache_key = f"op_{operator_id}_act_{'_'.join(sorted(cities))}"
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached

        if not cities:
            return []

        placeholders = ','.join(['%s'] * len(cities))
        query = f"""
            SELECT
                a.id, a.name, a.city, a.category, a.duration_hours,
                a.base_price, a.description, a.highlights,
                a.meeting_point, a.phone, a.difficulty_level,
                a.included_items, a.excluded_items, a.min_participants
            FROM activities a
            WHERE a.operator_id = %s
                AND a.city IN ({placeholders})
                AND a.is_active = 1
            ORDER BY a.category, a.name
            LIMIT 25
        """
        params = (operator_id, *cities)
        results = self._execute_query(query, params)
        self._set_cached(cache_key, results)
        return results

    def get_operator_restaurants(self, operator_id: str, cities: List[str]) -> List[Dict]:
        """Get operator-specific restaurants for given cities (UUID operator_id)"""
        cache_key = f"op_{operator_id}_rest_{'_'.join(sorted(cities))}"
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached

        if not cities:
            # If no cities specified, get all operator restaurants
            query = """
                SELECT
                    r.id, r.name, r.city, r.cuisine_type,
                    r.breakfast_price, r.lunch_price, r.dinner_price,
                    r.address, r.phone, r.operating_hours,
                    r.reservation_required, r.recommended_dishes, r.specialties
                FROM operator_restaurants r
                WHERE r.operator_id = %s
                    AND r.is_active = 1
                ORDER BY r.city, r.cuisine_type
                LIMIT 20
            """
            params = (operator_id,)
        else:
            placeholders = ','.join(['%s'] * len(cities))
            query = f"""
                SELECT
                    r.id, r.name, r.city, r.cuisine_type,
                    r.breakfast_price, r.lunch_price, r.dinner_price,
                    r.address, r.phone, r.operating_hours,
                    r.reservation_required, r.recommended_dishes, r.specialties
                FROM operator_restaurants r
                WHERE r.operator_id = %s
                    AND r.city IN ({placeholders})
                    AND r.is_active = 1
                ORDER BY r.city, r.cuisine_type
                LIMIT 20
            """
            params = (operator_id, *cities)

        results = self._execute_query(query, params)
        self._set_cached(cache_key, results)
        return results

    def get_operator_transport(self, operator_id: str) -> List[Dict]:
        """Get operator-specific transport options (UUID operator_id)"""
        cache_key = f"op_{operator_id}_trans"
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached

        query = """
            SELECT
                t.id, t.name, t.type, t.from_location, t.to_location,
                t.vehicle_type, t.max_passengers, t.base_price,
                t.distance_km, t.duration_minutes,
                t.pickup_location, t.contact_phone
            FROM operator_transport t
            WHERE t.operator_id = %s
                AND t.is_active = 1
            ORDER BY t.type, t.from_location
            LIMIT 25
        """
        params = (operator_id,)
        results = self._execute_query(query, params)
        self._set_cached(cache_key, results)
        return results

    def get_operator_guides(self, operator_id: str) -> List[Dict]:
        """Get operator-specific tour guides (UUID operator_id)"""
        cache_key = f"op_{operator_id}_guides"
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached

        query = """
            SELECT
                g.id, g.name, g.guide_type, g.specialization,
                g.languages, g.price_per_day, g.price_half_day
            FROM operator_guide_services g
            WHERE g.operator_id = %s
                AND g.is_active = 1
            ORDER BY g.guide_type, g.name
            LIMIT 15
        """
        params = (operator_id,)
        results = self._execute_query(query, params)
        self._set_cached(cache_key, results)
        return results


# Create singleton instance
db = TQBDatabaseConnector()


# Test the connector
if __name__ == "__main__":
    print("\n=== Testing TQB Database Connector ===\n")

    # Test with a UUID operator_id
    test_operator_id = "ed58206d-f600-483b-b98a-79805310e9be"  # Example UUID
    test_cities = ['Istanbul', 'Cappadocia']

    print(f"Testing for operator: {test_operator_id}")
    print(f"Cities: {test_cities}\n")

    accommodations = db.get_operator_accommodations(test_operator_id, test_cities)
    print(f"✓ Accommodations: {len(accommodations)}")
    if accommodations:
        print(f"  Example: {accommodations[0]['name']} - {accommodations[0]['city']}")

    activities = db.get_operator_activities(test_operator_id, test_cities)
    print(f"✓ Activities: {len(activities)}")
    if activities:
        print(f"  Example: {activities[0]['name']} - {activities[0]['city']}")

    restaurants = db.get_operator_restaurants(test_operator_id, test_cities)
    print(f"✓ Restaurants: {len(restaurants)}")
    if restaurants:
        print(f"  Example: {restaurants[0]['name']} - {restaurants[0]['city']}")

    transport = db.get_operator_transport(test_operator_id)
    print(f"✓ Transport: {len(transport)}")
    if transport:
        print(f"  Example: {transport[0]['name']}")

    guides = db.get_operator_guides(test_operator_id)
    print(f"✓ Guides: {len(guides)}")
    if guides:
        print(f"  Example: {guides[0]['name']}")

    print("\n=== Database connector test complete! ===")
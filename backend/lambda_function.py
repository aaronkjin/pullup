import json
import os
import psycopg2
import uuid
from datetime import datetime

# Get database connection details from environment variables
DB_HOST = os.environ.get('DB_HOST')
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_PORT = os.environ.get('DB_PORT', 5432)

# def get_db_connection():
#     """Create and return a database connection"""
#     conn = psycopg2.connect(
#         host=DB_HOST,
#         database=DB_NAME,
#         user=DB_USER,
#         password=DB_PASSWORD,
#         port=DB_PORT
#     )
#     return conn
def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        return conn
    except Exception as e:
        print(f"Detailed connection error: {str(e)}")
        raise

def lambda_handler(event, context):
    """Main Lambda handler function"""
    
    # Extract HTTP method and path from the event
    http_method = event.get('httpMethod', '')
    path = event.get('path', '')
    
    # Parse request body if it exists
    body = {}
    if 'body' in event and event['body']:
        body = json.loads(event['body'])
    
    # Extract path parameters if they exist
    path_parameters = event.get('pathParameters', {}) or {}
    
    # Handle user operations
    if path.startswith('/users'):
        if path == '/users':
            if http_method == 'GET':
                return get_all_users()
            elif http_method == 'POST':
                return create_user(body)
        else:
            # Extract user_id from path parameters
            user_id = path_parameters.get('userId')
            if not user_id:
                return build_response(400, {'error': 'User ID is required'})
                
            if http_method == 'GET':
                return get_user(user_id)
            elif http_method == 'PUT':
                return update_user(user_id, body)
            elif http_method == 'DELETE':
                return delete_user(user_id)
    
    # Handle event operations
    elif path.startswith('/events'):
        if path == '/events':
            if http_method == 'GET':
                return get_all_events()
            elif http_method == 'POST':
                return create_event(body)
        else:
            # Extract event_id from path parameters
            event_id = path_parameters.get('eventId')
            if not event_id:
                return build_response(400, {'error': 'Event ID is required'})
                
            if http_method == 'GET':
                return get_event(event_id)
            elif http_method == 'PUT':
                return update_event(event_id, body)
            elif http_method == 'DELETE':
                return delete_event(event_id)
    
    # Handle not found
    return build_response(404, {'error': 'Not found'})

# User CRUD operations
def get_all_users():
    """Get all users from the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT user_id, username, email, created_at FROM users")
        rows = cursor.fetchall()
        
        users = []
        for row in rows:
            users.append({
                'userId': row[0],
                'username': row[1],
                'email': row[2],
                'createdAt': row[3].isoformat() if row[3] else None
            })
        
        cursor.close()
        conn.close()
        
        return build_response(200, users)
    except Exception as e:
        print(f"Error getting users: {str(e)}")
        return build_response(500, {'error': 'Failed to get users'})

def create_user(user_data):
    """Create a new user in the database"""
    try:
        if not user_data.get('username') or not user_data.get('email'):
            return build_response(400, {'error': 'Username and email are required'})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        user_id = str(uuid.uuid4())
        
        cursor.execute(
            "INSERT INTO users (user_id, username, email) VALUES (%s, %s, %s) RETURNING user_id, created_at",
            (user_id, user_data['username'], user_data['email'])
        )
        
        result = cursor.fetchone()
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(201, {
            'userId': user_id,
            'username': user_data['username'],
            'email': user_data['email'],
            'createdAt': result[1].isoformat() if result[1] else None
        })
    except psycopg2.errors.UniqueViolation:
        return build_response(409, {'error': 'Username or email already exists'})
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        return build_response(500, {'error': 'Failed to create user'})

def get_user(user_id):
    """Get a user by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT user_id, username, email, created_at FROM users WHERE user_id = %s",
            (user_id,)
        )
        
        row = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not row:
            return build_response(404, {'error': 'User not found'})
        
        return build_response(200, {
            'userId': row[0],
            'username': row[1],
            'email': row[2],
            'createdAt': row[3].isoformat() if row[3] else None
        })
    except Exception as e:
        print(f"Error getting user: {str(e)}")
        return build_response(500, {'error': 'Failed to get user'})

def update_user(user_id, user_data):
    """Update a user in the database"""
    try:
        if not user_data:
            return build_response(400, {'error': 'No data provided for update'})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build SET clause for SQL dynamically
        set_values = []
        params = []
        
        if 'username' in user_data:
            set_values.append("username = %s")
            params.append(user_data['username'])
        
        if 'email' in user_data:
            set_values.append("email = %s")
            params.append(user_data['email'])
        
        if not set_values:
            return build_response(400, {'error': 'No valid fields to update'})
        
        # Add user_id to params
        params.append(user_id)
        
        sql = f"UPDATE users SET {', '.join(set_values)} WHERE user_id = %s RETURNING user_id, username, email, created_at"
        
        cursor.execute(sql, params)
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return build_response(404, {'error': 'User not found'})
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(200, {
            'userId': row[0],
            'username': row[1],
            'email': row[2],
            'createdAt': row[3].isoformat() if row[3] else None
        })
    except psycopg2.errors.UniqueViolation:
        return build_response(409, {'error': 'Username or email already exists'})
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        return build_response(500, {'error': 'Failed to update user'})

def delete_user(user_id):
    """Delete a user from the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First check if user exists
        cursor.execute("SELECT 1 FROM users WHERE user_id = %s", (user_id,))
        if cursor.fetchone() is None:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'User not found'})
        
        # Delete associated events first (due to foreign key constraint)
        cursor.execute("DELETE FROM events WHERE user_id = %s", (user_id,))
        
        # Then delete the user
        cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(204, None)
    except Exception as e:
        print(f"Error deleting user: {str(e)}")
        return build_response(500, {'error': 'Failed to delete user'})

# Event CRUD operations
def get_all_events():
    """Get all events from the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT event_id, user_id, event_type, event_data, created_at FROM events")
        rows = cursor.fetchall()
        
        events = []
        for row in rows:
            events.append({
                'eventId': row[0],
                'userId': row[1],
                'eventType': row[2],
                'eventData': row[3],
                'createdAt': row[4].isoformat() if row[4] else None
            })
        
        cursor.close()
        conn.close()
        
        return build_response(200, events)
    except Exception as e:
        print(f"Error getting events: {str(e)}")
        return build_response(500, {'error': 'Failed to get events'})

def create_event(event_data):
    """Create a new event in the database"""
    try:
        if not event_data.get('userId') or not event_data.get('eventType'):
            return build_response(400, {'error': 'User ID and event type are required'})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT 1 FROM users WHERE user_id = %s", (event_data['userId'],))
        if cursor.fetchone() is None:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'User not found'})
        
        event_id = str(uuid.uuid4())
        event_data_json = json.dumps(event_data.get('eventData', {}))
        
        cursor.execute(
            "INSERT INTO events (event_id, user_id, event_type, event_data) VALUES (%s, %s, %s, %s) RETURNING event_id, created_at",
            (event_id, event_data['userId'], event_data['eventType'], event_data_json)
        )
        
        result = cursor.fetchone()
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(201, {
            'eventId': event_id,
            'userId': event_data['userId'],
            'eventType': event_data['eventType'],
            'eventData': event_data.get('eventData', {}),
            'createdAt': result[1].isoformat() if result[1] else None
        })
    except Exception as e:
        print(f"Error creating event: {str(e)}")
        return build_response(500, {'error': 'Failed to create event'})

def get_event(event_id):
    """Get an event by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT event_id, user_id, event_type, event_data, created_at FROM events WHERE event_id = %s",
            (event_id,)
        )
        
        row = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not row:
            return build_response(404, {'error': 'Event not found'})
        
        return build_response(200, {
            'eventId': row[0],
            'userId': row[1],
            'eventType': row[2],
            'eventData': row[3],
            'createdAt': row[4].isoformat() if row[4] else None
        })
    except Exception as e:
        print(f"Error getting event: {str(e)}")
        return build_response(500, {'error': 'Failed to get event'})

def update_event(event_id, event_data):
    """Update an event in the database"""
    try:
        if not event_data:
            return build_response(400, {'error': 'No data provided for update'})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if event exists
        cursor.execute("SELECT 1 FROM events WHERE event_id = %s", (event_id,))
        if cursor.fetchone() is None:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Event not found'})
        
        # Build SET clause for SQL dynamically
        set_values = []
        params = []
        
        if 'eventType' in event_data:
            set_values.append("event_type = %s")
            params.append(event_data['eventType'])
        
        if 'eventData' in event_data:
            set_values.append("event_data = %s")
            params.append(json.dumps(event_data['eventData']))
        
        if 'userId' in event_data:
            # Check if new user exists
            cursor.execute("SELECT 1 FROM users WHERE user_id = %s", (event_data['userId'],))
            if cursor.fetchone() is None:
                cursor.close()
                conn.close()
                return build_response(404, {'error': 'User not found'})
            
            set_values.append("user_id = %s")
            params.append(event_data['userId'])
        
        if not set_values:
            return build_response(400, {'error': 'No valid fields to update'})
        
        # Add event_id to params
        params.append(event_id)
        
        sql = f"UPDATE events SET {', '.join(set_values)} WHERE event_id = %s RETURNING event_id, user_id, event_type, event_data, created_at"
        
        cursor.execute(sql, params)
        row = cursor.fetchone()
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(200, {
            'eventId': row[0],
            'userId': row[1],
            'eventType': row[2],
            'eventData': row[3],
            'createdAt': row[4].isoformat() if row[4] else None
        })
    except Exception as e:
        print(f"Error updating event: {str(e)}")
        return build_response(500, {'error': 'Failed to update event'})

def delete_event(event_id):
    """Delete an event from the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if event exists
        cursor.execute("SELECT 1 FROM events WHERE event_id = %s", (event_id,))
        if cursor.fetchone() is None:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Event not found'})
        
        cursor.execute("DELETE FROM events WHERE event_id = %s", (event_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(204, None)
    except Exception as e:
        print(f"Error deleting event: {str(e)}")
        return build_response(500, {'error': 'Failed to delete event'})

def build_response(status_code, body):
    """Build and return an API Gateway response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
        },
        'body': json.dumps(body) if body is not None else ''
    }
import json
import os
import psycopg2
from datetime import datetime

# Get database connection details from environment variables
DB_HOST = os.environ.get('DB_HOST')
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_PORT = os.environ.get('DB_PORT', 5432)

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
    
    # Handle student operations
    if path.startswith('/students'):
        if path == '/students':
            if http_method == 'GET':
                return get_all_students()
            elif http_method == 'POST':
                return create_student(body)
        else:
            # Extract student_id from path parameters
            student_id = path_parameters.get('studentId')
            if not student_id:
                return build_response(400, {'error': 'Student ID is required'})
                
            if http_method == 'GET':
                return get_student(student_id)
            elif http_method == 'PUT':
                return update_student(student_id, body)
            elif http_method == 'DELETE':
                return delete_student(student_id)
    
    # Handle org operations
    elif path.startswith('/orgs'):
        if path == '/orgs':
            if http_method == 'GET':
                return get_all_orgs()
            elif http_method == 'POST':
                return create_org(body)
        else:
            # Extract org_id from path parameters
            org_id = path_parameters.get('orgId')
            if not org_id:
                return build_response(400, {'error': 'Organization ID is required'})
                
            if http_method == 'GET':
                return get_org(org_id)
            elif http_method == 'PUT':
                return update_org(org_id, body)
            elif http_method == 'DELETE':
                return delete_org(org_id)
    
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
    
    # Handle student-event operations
    elif path.startswith('/students-events'):
        if path == '/students-events':
            if http_method == 'GET':
                return get_all_student_events()
            elif http_method == 'POST':
                return register_student_for_event(body)
        else:
            # For DELETE we need both student_id and event_id
            student_id = path_parameters.get('studentId')
            event_id = path_parameters.get('eventId')
            
            if http_method == 'DELETE' and student_id and event_id:
                return unregister_student_from_event(student_id, event_id)
            elif http_method == 'GET' and student_id:
                return get_student_events(student_id)
            elif http_method == 'GET' and event_id:
                return get_event_students(event_id)
            else:
                return build_response(400, {'error': 'Missing or invalid parameters'})
    
    # Handle not found
    return build_response(404, {'error': 'Not found'})

# Student CRUD operations
def get_all_students():
    """Get all students from the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT student_id, name, email FROM Students")
        rows = cursor.fetchall()
        
        students = []
        for row in rows:
            students.append({
                'studentId': row[0],
                'name': row[1],
                'email': row[2]
            })
        
        cursor.close()
        conn.close()
        
        return build_response(200, students)
    except Exception as e:
        print(f"Error getting students: {str(e)}")
        return build_response(500, {'error': 'Failed to get students'})

def create_student(student_data):
    """Create a new student in the database"""
    try:
        if not student_data.get('name') or not student_data.get('email'):
            return build_response(400, {'error': 'Name and email are required'})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO Students (name, email) VALUES (%s, %s) RETURNING student_id",
            (student_data['name'], student_data['email'])
        )
        
        result = cursor.fetchone()
        student_id = result[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(201, {
            'studentId': student_id,
            'name': student_data['name'],
            'email': student_data['email']
        })
    except psycopg2.errors.UniqueViolation:
        return build_response(409, {'error': 'Email already exists'})
    except Exception as e:
        print(f"Error creating student: {str(e)}")
        return build_response(500, {'error': 'Failed to create student'})

def get_student(student_id):
    """Get a student by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT student_id, name, email FROM Students WHERE student_id = %s",
            (student_id,)
        )
        
        row = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not row:
            return build_response(404, {'error': 'Student not found'})
        
        return build_response(200, {
            'studentId': row[0],
            'name': row[1],
            'email': row[2]
        })
    except Exception as e:
        print(f"Error getting student: {str(e)}")
        return build_response(500, {'error': 'Failed to get student'})

def update_student(student_id, student_data):
    """Update a student in the database"""
    try:
        if not student_data:
            return build_response(400, {'error': 'No data provided for update'})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build SET clause for SQL dynamically
        set_values = []
        params = []
        
        if 'name' in student_data:
            set_values.append("name = %s")
            params.append(student_data['name'])
        
        if 'email' in student_data:
            set_values.append("email = %s")
            params.append(student_data['email'])
        
        if not set_values:
            return build_response(400, {'error': 'No valid fields to update'})
        
        # Add student_id to params
        params.append(student_id)
        
        sql = f"UPDATE Students SET {', '.join(set_values)} WHERE student_id = %s RETURNING student_id, name, email"
        
        cursor.execute(sql, params)
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return build_response(404, {'error': 'Student not found'})
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(200, {
            'studentId': row[0],
            'name': row[1],
            'email': row[2]
        })
    except psycopg2.errors.UniqueViolation:
        return build_response(409, {'error': 'Email already exists'})
    except Exception as e:
        print(f"Error updating student: {str(e)}")
        return build_response(500, {'error': 'Failed to update student'})

def delete_student(student_id):
    """Delete a student from the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First check if student exists
        cursor.execute("SELECT 1 FROM Students WHERE student_id = %s", (student_id,))
        if cursor.fetchone() is None:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Student not found'})
        
        # Delete associated student-event registrations first
        cursor.execute("DELETE FROM Students_Events WHERE student_id = %s", (student_id,))
        
        # Then delete the student
        cursor.execute("DELETE FROM Students WHERE student_id = %s", (student_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(204, None)
    except Exception as e:
        print(f"Error deleting student: {str(e)}")
        return build_response(500, {'error': 'Failed to delete student'})

# Organization CRUD operations
def get_all_orgs():
    """Get all organizations from the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT org_id, name, description FROM Orgs")
        rows = cursor.fetchall()
        
        orgs = []
        for row in rows:
            orgs.append({
                'orgId': row[0],
                'name': row[1],
                'description': row[2]
            })
        
        cursor.close()
        conn.close()
        
        return build_response(200, orgs)
    except Exception as e:
        print(f"Error getting organizations: {str(e)}")
        return build_response(500, {'error': 'Failed to get organizations'})

def create_org(org_data):
    """Create a new organization in the database"""
    try:
        if not org_data.get('name'):
            return build_response(400, {'error': 'Organization name is required'})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        description = org_data.get('description', '')
        
        cursor.execute(
            "INSERT INTO Orgs (name, description) VALUES (%s, %s) RETURNING org_id",
            (org_data['name'], description)
        )
        
        result = cursor.fetchone()
        org_id = result[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(201, {
            'orgId': org_id,
            'name': org_data['name'],
            'description': description
        })
    except Exception as e:
        print(f"Error creating organization: {str(e)}")
        return build_response(500, {'error': 'Failed to create organization'})

def get_org(org_id):
    """Get an organization by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT org_id, name, description FROM Orgs WHERE org_id = %s",
            (org_id,)
        )
        
        row = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not row:
            return build_response(404, {'error': 'Organization not found'})
        
        return build_response(200, {
            'orgId': row[0],
            'name': row[1],
            'description': row[2]
        })
    except Exception as e:
        print(f"Error getting organization: {str(e)}")
        return build_response(500, {'error': 'Failed to get organization'})

def update_org(org_id, org_data):
    """Update an organization in the database"""
    try:
        if not org_data:
            return build_response(400, {'error': 'No data provided for update'})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build SET clause for SQL dynamically
        set_values = []
        params = []
        
        if 'name' in org_data:
            set_values.append("name = %s")
            params.append(org_data['name'])
        
        if 'description' in org_data:
            set_values.append("description = %s")
            params.append(org_data['description'])
        
        if not set_values:
            return build_response(400, {'error': 'No valid fields to update'})
        
        # Add org_id to params
        params.append(org_id)
        
        sql = f"UPDATE Orgs SET {', '.join(set_values)} WHERE org_id = %s RETURNING org_id, name, description"
        
        cursor.execute(sql, params)
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return build_response(404, {'error': 'Organization not found'})
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(200, {
            'orgId': row[0],
            'name': row[1],
            'description': row[2]
        })
    except Exception as e:
        print(f"Error updating organization: {str(e)}")
        return build_response(500, {'error': 'Failed to update organization'})

def delete_org(org_id):
    """Delete an organization from the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First check if org exists
        cursor.execute("SELECT 1 FROM Orgs WHERE org_id = %s", (org_id,))
        if cursor.fetchone() is None:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Organization not found'})
        
        # Check if any events are associated with this org
        cursor.execute("SELECT 1 FROM Events WHERE org_id = %s LIMIT 1", (org_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            conn.close()
            return build_response(409, {'error': 'Cannot delete organization with associated events'})
        
        # Then delete the organization
        cursor.execute("DELETE FROM Orgs WHERE org_id = %s", (org_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(204, None)
    except Exception as e:
        print(f"Error deleting organization: {str(e)}")
        return build_response(500, {'error': 'Failed to delete organization'})

# Event CRUD operations
def get_all_events():
    """Get all events from the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT e.event_id, e.org_id, o.name as org_name, e.name, e.time_location, e.description 
            FROM Events e
            JOIN Orgs o ON e.org_id = o.org_id
        """)
        rows = cursor.fetchall()
        
        events = []
        for row in rows:
            events.append({
                'eventId': row[0],
                'orgId': row[1],
                'orgName': row[2],
                'name': row[3],
                'timeLocation': row[4],
                'description': row[5]
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
        if not event_data.get('orgId') or not event_data.get('name') or not event_data.get('timeLocation'):
            return build_response(400, {'error': 'Organization ID, name, and time/location are required'})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if organization exists
        cursor.execute("SELECT 1 FROM Orgs WHERE org_id = %s", (event_data['orgId'],))
        if cursor.fetchone() is None:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Organization not found'})
        
        description = event_data.get('description', '')
        
        cursor.execute(
            """INSERT INTO Events (org_id, name, time_location, description) 
            VALUES (%s, %s, %s, %s) RETURNING event_id""",
            (event_data['orgId'], event_data['name'], event_data['timeLocation'], description)
        )
        
        result = cursor.fetchone()
        event_id = result[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(201, {
            'eventId': event_id,
            'orgId': event_data['orgId'],
            'name': event_data['name'],
            'timeLocation': event_data['timeLocation'],
            'description': description
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
            """SELECT e.event_id, e.org_id, o.name as org_name, e.name, e.time_location, e.description 
            FROM Events e
            JOIN Orgs o ON e.org_id = o.org_id
            WHERE e.event_id = %s""",
            (event_id,)
        )
        
        row = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not row:
            return build_response(404, {'error': 'Event not found'})
        
        return build_response(200, {
            'eventId': row[0],
            'orgId': row[1],
            'orgName': row[2],
            'name': row[3],
            'timeLocation': row[4],
            'description': row[5]
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
        cursor.execute("SELECT 1 FROM Events WHERE event_id = %s", (event_id,))
        if cursor.fetchone() is None:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Event not found'})
        
        # Build SET clause for SQL dynamically
        set_values = []
        params = []
        
        if 'name' in event_data:
            set_values.append("name = %s")
            params.append(event_data['name'])
        
        if 'timeLocation' in event_data:
            set_values.append("time_location = %s")
            params.append(event_data['timeLocation'])
            
        if 'description' in event_data:
            set_values.append("description = %s")
            params.append(event_data['description'])
        
        if 'orgId' in event_data:
            # Check if new organization exists
            cursor.execute("SELECT 1 FROM Orgs WHERE org_id = %s", (event_data['orgId'],))
            if cursor.fetchone() is None:
                cursor.close()
                conn.close()
                return build_response(404, {'error': 'Organization not found'})
            
            set_values.append("org_id = %s")
            params.append(event_data['orgId'])
        
        if not set_values:
            return build_response(400, {'error': 'No valid fields to update'})
        
        # Add event_id to params
        params.append(event_id)
        
        sql = f"""UPDATE Events SET {', '.join(set_values)} 
                 WHERE event_id = %s 
                 RETURNING event_id, org_id, name, time_location, description"""
        
        cursor.execute(sql, params)
        row = cursor.fetchone()
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(200, {
            'eventId': row[0],
            'orgId': row[1],
            'name': row[2],
            'timeLocation': row[3],
            'description': row[4]
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
        cursor.execute("SELECT 1 FROM Events WHERE event_id = %s", (event_id,))
        if cursor.fetchone() is None:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Event not found'})
        
        # Delete associated student registrations first
        cursor.execute("DELETE FROM Students_Events WHERE event_id = %s", (event_id,))
        
        # Then delete the event
        cursor.execute("DELETE FROM Events WHERE event_id = %s", (event_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(204, None)
    except Exception as e:
        print(f"Error deleting event: {str(e)}")
        return build_response(500, {'error': 'Failed to delete event'})

# Student-Event operations
def get_all_student_events():
    """Get all student-event registrations"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT se.student_id, s.name as student_name, se.event_id, e.name as event_name 
            FROM Students_Events se
            JOIN Students s ON se.student_id = s.student_id
            JOIN Events e ON se.event_id = e.event_id
        """)
        rows = cursor.fetchall()
        
        registrations = []
        for row in rows:
            registrations.append({
                'studentId': row[0],
                'studentName': row[1],
                'eventId': row[2],
                'eventName': row[3]
            })
        
        cursor.close()
        conn.close()
        
        return build_response(200, registrations)
    except Exception as e:
        print(f"Error getting student-event registrations: {str(e)}")
        return build_response(500, {'error': 'Failed to get registrations'})

def register_student_for_event(registration_data):
    """Register a student for an event"""
    try:
        if not registration_data.get('studentId') or not registration_data.get('eventId'):
            return build_response(400, {'error': 'Student ID and Event ID are required'})
        
        student_id = registration_data['studentId']
        event_id = registration_data['eventId']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if student exists
        cursor.execute("SELECT name FROM Students WHERE student_id = %s", (student_id,))
        student_row = cursor.fetchone()
        if not student_row:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Student not found'})
            
        # Check if event exists
        cursor.execute("SELECT name FROM Events WHERE event_id = %s", (event_id,))
        event_row = cursor.fetchone()
        if not event_row:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Event not found'})
        
        # Check if registration already exists
        cursor.execute(
            "SELECT 1 FROM Students_Events WHERE student_id = %s AND event_id = %s",
            (student_id, event_id)
        )
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return build_response(409, {'error': 'Student is already registered for this event'})
        
        # Create the registration
        cursor.execute(
            "INSERT INTO Students_Events (student_id, event_id) VALUES (%s, %s)",
            (student_id, event_id)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(201, {
            'studentId': student_id,
            'studentName': student_row[0],
            'eventId': event_id,
            'eventName': event_row[0]
        })
    except Exception as e:
        print(f"Error registering student for event: {str(e)}")
        return build_response(500, {'error': 'Failed to register student for event'})

def unregister_student_from_event(student_id, event_id):
    """Unregister a student from an event"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if registration exists
        cursor.execute(
            "SELECT 1 FROM Students_Events WHERE student_id = %s AND event_id = %s",
            (student_id, event_id)
        )
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Registration not found'})
        
        # Delete the registration
        cursor.execute(
            "DELETE FROM Students_Events WHERE student_id = %s AND event_id = %s",
            (student_id, event_id)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(204, None)
    except Exception as e:
        print(f"Error unregistering student from event: {str(e)}")
        return build_response(500, {'error': 'Failed to unregister student from event'})

def get_student_events(student_id):
    """Get all events a student is registered for"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if student exists
        cursor.execute("SELECT 1 FROM Students WHERE student_id = %s", (student_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Student not found'})
        
        # Get all events for the student
        cursor.execute("""
            SELECT e.event_id, e.name as event_name, e.time_location, e.description,
                   o.org_id, o.name as org_name
            FROM Students_Events se
            JOIN Events e ON se.event_id = e.event_id
            JOIN Orgs o ON e.org_id = o.org_id
            WHERE se.student_id = %s
        """, (student_id,))
        
        rows = cursor.fetchall()
        
        events = []
        for row in rows:
            events.append({
                'eventId': row[0],
                'eventName': row[1],
                'timeLocation': row[2],
                'description': row[3],
                'orgId': row[4],
                'orgName': row[5]
            })
        
        cursor.close()
        conn.close()
        
        return build_response(200, events)
    except Exception as e:
        print(f"Error getting student events: {str(e)}")
        return build_response(500, {'error': 'Failed to get student events'})

def get_event_students(event_id):
    """Get all students registered for an event"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if event exists
        cursor.execute("SELECT 1 FROM Events WHERE event_id = %s", (event_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Event not found'})
        
        # Get all students for the event
        cursor.execute("""
            SELECT s.student_id, s.name, s.email
            FROM Students_Events se
            JOIN Students s ON se.student_id = s.student_id
            WHERE se.event_id = %s
        """, (event_id,))
        
        rows = cursor.fetchall()
        
        students = []
        for row in rows:
            students.append({
                'studentId': row[0],
                'name': row[1],
                'email': row[2]
            })
        
        cursor.close()
        conn.close()
        
        return build_response(200, students)
    except Exception as e:
        print(f"Error getting event students: {str(e)}")
        return build_response(500, {'error': 'Failed to get event students'})

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
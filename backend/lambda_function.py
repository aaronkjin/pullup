import json
import os
import psycopg2
import math
import time
from datetime import datetime

DB_HOST = os.environ.get('DB_HOST')
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_PORT = os.environ.get('DB_PORT', 5432)


# Connect to postgresql by network 
def get_db_connection():
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

def build_response(status_code, body):

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

#define all path to function connections
def lambda_handler(event, context):
    
    http_method = event.get('httpMethod', '')
    path = event.get('path', '')
    
    body = {}
    if 'body' in event and event['body']:
        body = json.loads(event['body'])
    
    path_parameters = event.get('pathParameters', {}) or {}

    if path.startswith('/events'):
        if path == '/events':
            if http_method == 'GET':
                return get_all_events()
            elif http_method == 'POST':
                return create_event(body)
            elif http_method == 'DELETE':
                return delete_event(body)
    elif path == '/students/create':
        if http_method == 'POST':
            return create_student(body)
    elif path == '/students/login':
        if http_method == 'POST':
            return check_student_password(body)
    elif path == '/orgs/create':
        if http_method == 'POST':
            return create_org(body)
    elif path == '/orgs/login':
        if http_method == 'POST':
            return check_org_password(body)
    elif path == '/orgs/org':
        if http_method == 'POST':
            return get_events_for_org(body)
    elif path == '/students-events/pu':
        if http_method == 'POST':
            return pu_student_for_event(body)
        elif http_method == 'DELETE':
            return unregister_student_from_event(body)
    elif path == '/students-events/student':
        if http_method == 'POST':
            return get_events_for_student(body)
    elif path == '/students-events/event':
        if http_method == 'POST':
            return get_students_for_event(body)
    elif path == '/students-events/update':
        if http_method == 'PUT':
            return update_student_event_registration(body)
    return build_response(404, {'error': 'Path not found'})

def calculate_event_score(participant_count, created_at, decay_factor=0.1):
    try:
        if isinstance(created_at, str) and created_at.isdigit():
            event_time = datetime.fromtimestamp(int(created_at))
        else:
            event_time = datetime.now() #fallback
        
        hrs = (datetime.now() - event_time).total_seconds() / 3600
        
        time_decay = math.exp(-decay_factor * hrs / 24)  
        
        score = participant_count * time_decay
        
        return score
    except Exception as e:
        print(f"Error calculating score: {e}")
        return participant_count

def get_all_events():

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT e.event_id, e.org_id, e.name, e.event_date, e.event_time,
                   e.location, e.description, e.participant_count, e.image_url,
                   e.is_public, e.passcode, e.created_at, o.name as org_name
            FROM Events e
            LEFT JOIN Orgs o ON e.org_id = o.org_id
            ORDER BY e.created_at DESC
        """
        
        cursor.execute(query)
        events = cursor.fetchall()
        
        event_list = []
        for event in events:
            event_dict = {
                'event_id': event[0],
                'org_id': event[1],
                'name': event[2],
                'event_date': event[3],
                'event_time': event[4],
                'location': event[5],
                'description': event[6],
                'participant_count': event[7] or 0,
                'image_url': event[8],
                'is_public': event[9],
                'passcode': event[10],
                'created_at': event[11],
                'org_name': event[12] or 'Unknown Organization'
            }
            
            event_dict['score'] = calculate_event_score(
                event_dict['participant_count'], 
                event_dict['created_at']
            )
            
            event_list.append(event_dict)
        
        event_list.sort(key=lambda x: x['score'], reverse=True)
        
        for event in event_list:
            del event['score']
        
        cursor.close()
        conn.close()
        
        return build_response(200, {
            'events': event_list
        })
    except Exception as e:
        print(f"Error fetching events: {str(e)}")
        return build_response(500, {'error': 'Failed to fetch events'})

def create_event(body):
    try:

        conn = get_db_connection()
        cursor = conn.cursor()
        
        created_at = str(int(time.time()))
        
        query = """
            INSERT INTO Events (org_id, name, event_date, event_time, location, 
                              description, participant_count, image_url, is_public, 
                              passcode, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING event_id
        """
        
        cursor.execute(query, (
            body['org_id'],
            body['name'],
            body.get('event_date'),
            body.get('event_time'),
            body.get('location'),
            body.get('description'),
            body.get('participant_count', 0),
            body.get('image_url'),
            body.get('is_public', True),
            body.get('passcode'),
            created_at
        ))
        
        event_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(201, {
            'message': 'Event created successfully',
            'event_id': event_id
        })
        
    except Exception as e:
        print(f"Error creating event: {str(e)}")
        return build_response(500, {'error': 'Failed to create event'})

def create_student(body):
    try:

        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO Students (name, email, password)
            VALUES (%s, %s, %s)
            RETURNING student_id
        """
        
        cursor.execute(query, (
            body['name'],
            body['email'],
            body['password']
        ))
        
        student_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(201, {
            'message': 'Student created successfully',
            'student_id': student_id
        })
        
    except psycopg2.IntegrityError:
        return build_response(409, {'error': 'Email already exists'})
    except Exception as e:
        print(f"Error creating student: {str(e)}")
        return build_response(500, {'error': 'Failed to create student'})

def check_student_password(body):
    try:

        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT student_id, name, password FROM Students 
            WHERE email = %s
        """
        
        cursor.execute(query, (body['email'],))
        student = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not student:
            return build_response(404, {'error': 'Student not found'})

        if student[2] == body['password']:
            return build_response(200, {
                'message': 'Password correct',
                'student_id': student[0],
                'name': student[1],
                'email': body['email']
            })
        else:
            return build_response(401, {'error': 'Invalid password'})
        
    except Exception as e:
        print(f"Error checking password: {str(e)}")
        return build_response(500, {'error': 'Failed to check password'})

def create_org(body):
    try:

        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO Orgs (name, email, password)
            VALUES (%s, %s, %s)
            RETURNING org_id
        """
        
        cursor.execute(query, (
            body['name'],
            body['email'],
            body['password']
        ))
        
        org_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(201, {
            'message': 'Org created successfully',
            'org_id': org_id
        })
        
    except psycopg2.IntegrityError:
        return build_response(409, {'error': 'Email already exists'})
    except Exception as e:
        print(f"Error creating org: {str(e)}")
        return build_response(500, {'error': 'Failed to create Org'})

def check_org_password(body):
    try:

        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT org_id, name, password FROM Orgs 
            WHERE email = %s
        """
        
        cursor.execute(query, (body['email'],))
        org = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not org:
            return build_response(404, {'error': 'Org not found'})

        if org[2] == body['password']:
            return build_response(200, {
                'message': 'Password correct',
                'org_id': org[0],
                'name': org[1],
                'email': body['email']
            })
        else:
            return build_response(401, {'error': 'Invalid password'})
        
    except Exception as e:
        print(f"Error checking password: {str(e)}")
        return build_response(500, {'error': 'Failed to check password'})

def get_events_for_org(body):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT e.event_id, e.org_id, e.name, e.event_date, e.event_time,
                   e.location, e.description, e.participant_count, e.image_url,
                   e.is_public, e.passcode, e.created_at, o.name as org_name
            FROM Events e
            LEFT JOIN Orgs o ON e.org_id = o.org_id
            WHERE e.org_id = %s
            ORDER BY e.created_at DESC
        """
        
        cursor.execute(query, (body['org_id'],))
        events = cursor.fetchall()
        
        event_list = []
        for event in events:
            event_dict = {
                'event_id': event[0],
                'org_id': event[1],
                'name': event[2],
                'event_date': event[3],
                'event_time': event[4],
                'location': event[5],
                'description': event[6],
                'participant_count': event[7] or 0,
                'image_url': event[8],
                'is_public': event[9],
                'passcode': event[10],
                'created_at': event[11],
                'org_name': event[12] or 'Unknown Organization'
            }
            event_list.append(event_dict)
        
        cursor.close()
        conn.close()
        
        return build_response(200, {
            'events': event_list,
            'count': len(event_list)
        })
        
    except Exception as e:
        print(f"Error fetching org events: {str(e)}")
        return build_response(500, {'error': 'Failed to fetch org events'})

def pu_student_for_event(body):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if the event exists and get its details
        event_query = """
            SELECT is_public, passcode FROM Events 
            WHERE event_id = %s
        """
        cursor.execute(event_query, (body['event_id'],))
        event = cursor.fetchone()
        
        if not event:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Event not found'})
        
        is_public, passcode = event
        
        # For private events, validate the password
        if not is_public:  
            if not body.get('reg_code'):
                cursor.close()
                conn.close()
                return build_response(403, {'message': 'Password required for private event'})
            
            if body.get('reg_code') != passcode:
                cursor.close()
                conn.close()
                return build_response(403, {'message': 'Invalid password'})
        
        # Check if student is already registered
        check_query = """
            SELECT 1 FROM Students_Events 
            WHERE student_id = %s AND event_id = %s
        """
        cursor.execute(check_query, (body['student_id'], body['event_id']))
        
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return build_response(409, {'error': 'Student already registered for this event'})
        
        # Register the student
        query = """
            INSERT INTO Students_Events (student_id, event_id, reg_code, registered)
            VALUES (%s, %s, %s, %s)
        """
        
        cursor.execute(query, (
            body['student_id'],
            body['event_id'],
            body.get('reg_code'),
            body.get('registered', True)
        ))
        
        # Update participant count
        update_query = """
            UPDATE Events 
            SET participant_count = participant_count + 1 
            WHERE event_id = %s
        """
        cursor.execute(update_query, (body['event_id'],))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(201, {'message': 'Student registered successfully'})
        
    except Exception as e:
        print(f"Error registering student: {str(e)}")
        return build_response(500, {'error': 'Failed to register student'})

def get_events_for_student(body):
    try:

        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT e.event_id, e.org_id, e.name, e.event_date, e.event_time,
                   e.location, e.description, e.participant_count, e.image_url,
                   e.is_public, e.created_at, se.reg_code, se.registered, o.name as org_name
            FROM Events e
            JOIN Students_Events se ON e.event_id = se.event_id
            LEFT JOIN Orgs o ON e.org_id = o.org_id
            WHERE se.student_id = %s
            ORDER BY e.created_at DESC
        """
        
        cursor.execute(query, (body['student_id'],))
        events = cursor.fetchall()
        
        event_list = []
        for event in events:
            event_dict = {
                'event_id': event[0],
                'org_id': event[1],
                'name': event[2],
                'event_date': event[3],
                'event_time': event[4],
                'location': event[5],
                'description': event[6],
                'participant_count': event[7] or 0,
                'image_url': event[8],
                'is_public': event[9],
                'created_at': event[10],
                'reg_code': event[11],
                'registered': event[12],
                'org_name': event[13] or 'Unknown Organization'
            }
            event_list.append(event_dict)
        
        cursor.close()
        conn.close()
        
        return build_response(200, {
            'events': event_list,
            'count': len(event_list)
        })
        
    except Exception as e:
        print(f"Error fetching student events: {str(e)}")
        return build_response(500, {'error': 'Failed to fetch student events'})

def get_students_for_event(body):
    try:

        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT s.student_id, s.name, s.email, se.reg_code, se.registered
            FROM Students s
            JOIN Students_Events se ON s.student_id = se.student_id
            WHERE se.event_id = %s
            ORDER BY s.name
        """
        
        cursor.execute(query, (body['event_id'],))
        students = cursor.fetchall()
        
        student_list = []
        for student in students:
            student_dict = {
                'student_id': student[0],
                'name': student[1],
                'email': student[2],
                'reg_code': student[3],
                'registered': student[4]
            }
            student_list.append(student_dict)
        
        cursor.close()
        conn.close()
        
        return build_response(200, {
            'students': student_list,
            'count': len(student_list)
        })
        
    except Exception as e:
        print(f"Error fetching event students: {str(e)}")
        return build_response(500, {'error': 'Failed to fetch event students'})

def update_student_event_registration(body):
    try:

        conn = get_db_connection()
        cursor = conn.cursor()
        
        check_query = """
            SELECT 1 FROM Students_Events 
            WHERE student_id = %s AND event_id = %s
        """
        cursor.execute(check_query, (body['student_id'], body['event_id']))
        
        if not cursor.fetchone():
            return build_response(404, {'error': 'Registration not found'})

        query = """
            UPDATE Students_Events 
            SET registered = %s
            WHERE student_id = %s AND event_id = %s
        """
        
        cursor.execute(query, (body['registered'], body['student_id'], body['event_id']))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(200, {'message': 'Registration updated successfully'})
        
    except Exception as e:
        print(f"Error updating registration: {str(e)}")
        return build_response(500, {'error': 'Failed to update registration'})

def unregister_student_from_event(body):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if the registration exists
        check_query = """
            SELECT 1 FROM Students_Events 
            WHERE student_id = %s AND event_id = %s
        """
        cursor.execute(check_query, (body['student_id'], body['event_id']))
        
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Registration not found'})

        # Delete the registration
        delete_query = """
            DELETE FROM Students_Events 
            WHERE student_id = %s AND event_id = %s
        """
        cursor.execute(delete_query, (body['student_id'], body['event_id']))
        
        # Decrement participant count
        update_query = """
            UPDATE Events 
            SET participant_count = GREATEST(participant_count - 1, 0)
            WHERE event_id = %s
        """
        cursor.execute(update_query, (body['event_id'],))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(200, {'message': 'Student unregistered successfully'})
        
    except Exception as e:
        print(f"Error unregistering student: {str(e)}")
        return build_response(500, {'error': 'Failed to unregister student'})

def delete_event(body):
    try:
        # Validate required parameters
        if not body.get('event_id'):
            return build_response(400, {'error': 'event_id is required'})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if event exists
        check_query = """
            SELECT event_id FROM Events 
            WHERE event_id = %s
        """
        cursor.execute(check_query, (body['event_id'],))
        event = cursor.fetchone()
        
        if not event:
            cursor.close()
            conn.close()
            return build_response(404, {'error': 'Event not found'})
        
        # Delete student registrations first (cascading delete)
        delete_registrations_query = """
            DELETE FROM Students_Events 
            WHERE event_id = %s
        """
        cursor.execute(delete_registrations_query, (body['event_id'],))
        
        # Delete the event
        delete_event_query = """
            DELETE FROM Events 
            WHERE event_id = %s
        """
        cursor.execute(delete_event_query, (body['event_id'],))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return build_response(200, {
            'message': 'Event deleted successfully',
            'event_id': body['event_id']
        })
        
    except Exception as e:
        print(f"Error deleting event: {str(e)}")
        return build_response(500, {'error': 'Failed to delete event'})

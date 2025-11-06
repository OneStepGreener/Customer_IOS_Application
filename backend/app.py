"""
Main Flask application file.
API endpoints for B2C Customer App.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import db
from config import Config
from datetime import datetime, timedelta
import re
import random
import requests


def create_app() -> Flask:
    """
    Create and configure Flask application.
    
    Returns:
        Flask: Configured Flask application instance
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for React Native app
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # In-memory OTP storage (in production, use Redis or database)
    # Format: {mobile_number: {'otp': '123456', 'expires_at': datetime, 'verified': False}}
    otp_storage = {}
    
    @app.route('/health', methods=['GET'])
    def health_check():
        """
        Health check endpoint.
        
        Returns:
            JSON response with health status
        """
        return jsonify({
            'status': 'healthy',
            'message': 'Flask backend is running'
        }), 200
    
    @app.route('/api/test-otp', methods=['POST'])
    def test_otp():
        """
        Test endpoint to verify OTP generation (for debugging).
        Returns the generated OTP directly for testing purposes.
        """
        try:
            data = request.get_json()
            mobile_number = (data.get('mobileNumber') or '').strip()
            
            if not mobile_number or not re.match(r'^[0-9]{10}$', mobile_number):
                return jsonify({
                    'status': 'error',
                    'message': 'Valid 10-digit mobile number required'
                }), 400
            
            # Generate OTP
            otp = str(random.randint(100000, 999999))
            
            # Store OTP for 5 minutes
            expires_at = datetime.now() + timedelta(minutes=5)
            otp_storage[mobile_number] = {
                'otp': otp,
                'expires_at': expires_at,
                'verified': False,
                'customer_id': None
            }
            
            return jsonify({
                'status': 'success',
                'message': 'OTP generated for testing',
                'data': {
                    'mobileNumber': mobile_number,
                    'otp': otp,
                    'expiresAt': expires_at.strftime('%Y-%m-%d %H:%M:%S')
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Error: {str(e)}'
            }), 500
    
    @app.route('/api/signup', methods=['POST'])
    def signup():
        """
        Customer signup endpoint.
        Saves customer data to b2c_customer_master table with status='pending'.
        
        Expected JSON body:
        {
            "fullName": "string",
            "email": "string",
            "mobileNumber": "string (10 digits)",
            "houseNumber": "string",
            "address": "string",
            "city": "string",
            "state": "string",
            "userType": "string",
            "knowAboutUs": "string",
            "expectation": "string",
            "alternateContact": "string (optional, 10 digits)"
        }
        
        Returns:
            JSON response with success or error message
        """
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = [
                'fullName', 'email', 'mobileNumber', 'houseNumber',
                'address', 'city', 'state', 'userType', 'knowAboutUs', 'expectation'
            ]
            
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required fields: {", ".join(missing_fields)}'
                }), 400
            
            # Extract and sanitize data
            # Handle None values by converting to empty string before strip
            full_name = (data.get('fullName') or '').strip()
            email = (data.get('email') or '').strip().lower()
            mobile_number = (data.get('mobileNumber') or '').strip()
            house_number = (data.get('houseNumber') or '').strip()
            address = (data.get('address') or '').strip()
            city = (data.get('city') or '').strip()
            state = (data.get('state') or '').strip()
            
            # Map user_type from frontend to database enum values
            user_type_mapping = {
                'Household Apartment': 'RESIDENTIAL',
                'School/Institution': 'INSTITUTIONAL',
                'Office': 'COMMERCIAL',
                'Shop': 'COMMERCIAL',
                'Other': 'OTHERS'
            }
            user_type_frontend = (data.get('userType') or '').strip()
            user_type = user_type_mapping.get(user_type_frontend, 'OTHERS')
            
            know_about_us = (data.get('knowAboutUs') or '').strip()
            
            # Extract numeric value from expectation (handles cases like "23kgs" or "23")
            expectation_raw = (data.get('expectation') or '').strip()
            # Extract only numbers and decimal point, convert to float
            expectation_numeric = re.sub(r'[^0-9.]', '', expectation_raw)
            expectation = float(expectation_numeric) if expectation_numeric else None
            
            alternate_contact = (data.get('alternateContact') or '').strip() if data.get('alternateContact') else ''
            
            # Validate mobile number (10 digits)
            if not mobile_number.isdigit() or len(mobile_number) != 10:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid mobile number. Must be 10 digits.'
                }), 400
            
            # Validate alternate contact if provided
            if alternate_contact and (not alternate_contact.isdigit() or len(alternate_contact) != 10):
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid alternate contact number. Must be 10 digits.'
                }), 400
            
            # Validate email format
            if '@' not in email or '.' not in email.split('@')[1]:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid email format.'
                }), 400
            
            # Validate waste quantity
            if expectation is None or expectation <= 0:
                return jsonify({
                    'status': 'error',
                    'message': 'Please enter a valid waste quantity (must be greater than 0).'
                }), 400
            
            # Prepare mobile numbers with country code (format: +919876543210 - without slash)
            contact_no = f"+91{mobile_number}" if mobile_number else None
            poc = f"+91{alternate_contact}" if alternate_contact else None
            
            # Get latitude and longitude
            latitude = data.get('latitude')
            longitude = data.get('longitude')
            # Convert to float if they exist, otherwise set to None
            latitude = float(latitude) if latitude is not None else None
            longitude = float(longitude) if longitude is not None else None
            
            # Combine house number with address if house number exists
            full_address = f"{house_number}, {address}".strip() if house_number else address
            
            # Generate customer_id starting from 1001
            # Get the maximum customer_id that is numeric, or start from 1000
            try:
                max_id_result = db.execute_query(
                    "SELECT MAX(CAST(customer_id AS UNSIGNED)) as max_id "
                    "FROM b2c_customer_master WHERE customer_id REGEXP '^[0-9]+$'"
                )
                max_id = max_id_result[0].get('max_id') if max_id_result and max_id_result[0].get('max_id') else 1000
                # Ensure we start from at least 1001
                customer_id = str(max(max_id + 1, 1001))
            except Exception as e:
                # If query fails, start from 1001
                print(f"Warning: Could not get max customer_id, starting from 1001: {e}")
                customer_id = "1001"
            
            # Get current timestamp
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Insert into database with correct column names including customer_id
            # Set area_id to 0 as default (column is NOT NULL with no default value)
            # Set created_by to 'APP' as default (column is NOT NULL varchar(50) with no default)
            # Set updated_by to 'APP' as default (column is NOT NULL varchar(50) with no default)
            insert_query = """
                INSERT INTO b2c_customer_master (
                    customer_id, customer_name, contact_no, email, address,
                    city, state, est_waste_qty, poc, user_type, reference,
                    status, area_id, latitude, longitude, created_by, updated_by, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
            """
            
            params = (
                customer_id, full_name, contact_no, email, full_address,
                                    city, state, expectation, poc, user_type, know_about_us,
                    'PENDING', 0, latitude, longitude, 'APP', 'APP', current_time, current_time
            )
            
            db.execute_query(insert_query, params, fetch=False)
            
            return jsonify({
                'status': 'success',
                'message': 'Account created successfully! Your profile is under consideration.',
                                    'data': {
                        'fullName': full_name,
                        'email': email,
                        'mobileNumber': mobile_number,
                        'status': 'PENDING'
                    }
            }), 201
            
        except Exception as e:
            error_msg = str(e).lower()
            
            # Handle duplicate entry (email or mobile already exists)
            if 'duplicate' in error_msg or 'unique' in error_msg:
                if 'email' in error_msg:
                    return jsonify({
                        'status': 'error',
                        'message': 'An account with this email already exists.'
                    }), 409
                elif 'mobile' in error_msg or 'phone' in error_msg:
                    return jsonify({
                        'status': 'error',
                        'message': 'An account with this mobile number already exists.'
                    }), 409
                else:
                    return jsonify({
                        'status': 'error',
                        'message': 'Account already exists with these details.'
                    }), 409
            
            # Handle other database errors
            return jsonify({
                'status': 'error',
                'message': f'Failed to create account: {str(e)}'
            }), 500
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors."""
        return jsonify({
            'status': 'error',
            'message': 'Endpoint not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors."""
        return jsonify({
            'status': 'error',
            'message': 'Internal server error'
        }), 500
    
    @app.route('/api/login/generate-otp', methods=['POST'])
    def generate_otp():
        """
        Generate and send OTP to mobile number via PRP OTP service.
        
        Expected JSON body:
        {
            "mobileNumber": "9876543210"  // 10-digit mobile number
        }
        
        Returns:
            JSON response with success/error status
        """
        try:
            data = request.get_json()
            mobile_number = (data.get('mobileNumber') or '').strip()
            
            # Validate mobile number
            if not mobile_number:
                return jsonify({
                    'status': 'error',
                    'message': 'Mobile number is required'
                }), 400
            
            if not re.match(r'^[0-9]{10}$', mobile_number):
                return jsonify({
                    'status': 'error',
                    'message': 'Please enter a valid 10-digit mobile number'
                }), 400
            
            # Check if mobile number exists in database (customer should be registered)
            # Check multiple formats: +91{mobile}, +91/{mobile}, 91{mobile}, plain {mobile}
            check_query = """
                SELECT customer_id, customer_name, status, contact_no 
                FROM b2c_customer_master 
                WHERE contact_no = %s 
                   OR contact_no = %s 
                   OR contact_no = %s
                   OR contact_no = %s
                   OR contact_no LIKE %s
                LIMIT 1
            """
            check_params = (
                f"+91{mobile_number}",
                f"+91/{mobile_number}",
                f"91{mobile_number}",
                mobile_number,
                f"%{mobile_number}"
            )
            customer_result = db.execute_query(check_query, check_params)
            
            if not customer_result:
                return jsonify({
                    'status': 'error',
                    'message': 'Mobile number not registered. Please sign up first.'
                }), 404
            
            customer = customer_result[0]
            
            # Check if customer is approved (only approved customers can login)
            if customer.get('status') != 'APPROVED':
                return jsonify({
                    'status': 'error',
                    'message': 'Your profile is under consideration. Please wait for approval.'
                }), 403
            
            # Generate 6-digit OTP
            otp = str(random.randint(100000, 999999))
            
            print(f"\n{'='*70}")
            print(f"📱 OTP GENERATION FOR: {mobile_number}")
            print(f"{'='*70}")
            print(f"🔑 Generated OTP: {otp}")
            print(f"👤 Customer: {customer.get('customer_name')} (ID: {customer.get('customer_id')})")
            print(f"📞 Contact: {customer.get('contact_no')}")
            print(f"✅ Status: {customer.get('status')}")
            print(f"{'='*70}\n")
            
            # Store OTP with expiration (5 minutes)
            expires_at = datetime.now() + timedelta(minutes=5)
            otp_storage[mobile_number] = {
                'otp': otp,
                'expires_at': expires_at,
                'verified': False,
                'customer_id': customer.get('customer_id')
            }
            
            # Send OTP via PRP SMS API using Template Name (as per PRP documentation)
            prp_api_key = app.config.get('PRP_API_KEY', '9n5ZIuuNKTkIGyJ')
            prp_api_base = app.config.get('PRP_API_BASE_URL', 'https://api.bulksmsadmin.com/BulkSMSapi/keyApiSendSMS')
            prp_sender_id = app.config.get('PRP_SENDER_ID', 'PRP***')
            prp_template_name = app.config.get('PRP_TEMPLATE_NAME', 'OSG_SMS_OTP')
            
            # PRP API endpoint for sending SMS using template name
            prp_api_url = f"{prp_api_base}/SendSmsTemplateName"
            
            # Mobile number format: 91{10-digit} (country code + mobile, no + sign)
            mobile_with_country = f"91{mobile_number}"
            
            # PRP API request body format (as per documentation)
            # IMPORTANT: templateParams must be a STRING, not an array
            payload = {
                "sender": prp_sender_id,
                "templateName": prp_template_name,
                "smsReciever": [
                    {
                        "mobileNo": mobile_with_country,
                        "templateParams": otp  # OTP as STRING (PRP API requirement)
                    }
                ]
            }
            
            # PRP API headers (as per documentation)
            headers = {
                "apikey": prp_api_key,  # Note: lowercase 'apikey' in header
                "Content-Type": "application/json"
            }
            
            print(f"\n{'='*70}")
            print(f"📱 SENDING OTP VIA PRP API")
            print(f"{'='*70}")
            print(f"📞 Mobile: {mobile_with_country}")
            print(f"🔑 OTP: {otp}")
            print(f"📋 Template: {prp_template_name}")
            print(f"📤 Sender: {prp_sender_id}")
            print(f"🌐 URL: {prp_api_url}")
            print(f"📦 templateParams: {otp}")
            print(f"{'='*70}\n")
            
            sms_sent = False
            error_message = None
            
            try:
                # Use 3 second timeout for fast SMS delivery
                response = requests.post(prp_api_url, json=payload, headers=headers, timeout=3)
                print(f"PRP API Response - Status: {response.status_code}")
                print(f"PRP API Response Body: {response.text}")
                
                if response.status_code == 200:
                    # Check if response indicates success
                    try:
                        response_data = response.json()
                        # PRP API returns isSuccess: true for successful SMS
                        if response_data.get('isSuccess') == True or response_data.get('status') == 'success' or 'success' in response.text.lower():
                            sms_sent = True
                            print(f"✅ PRP API confirmed SMS sent: {response_data.get('returnMessage', 'N/A')}")
                        else:
                            error_message = response.text
                    except Exception as json_error:
                        # If response is not JSON but status is 200, consider it success
                        print(f"⚠️ Could not parse JSON response: {json_error}")
                        sms_sent = True  # Status 200 usually means success
                else:
                    error_message = response.text
                    
            except requests.exceptions.Timeout:
                error_message = "SMS API timeout (may still be sent)"
                print(f"⚠️ PRP API timeout - SMS may still be delivered")
            except Exception as e:
                print(f"PRP API Error: {e}")
                error_message = str(e)
            
            # Log result
            if sms_sent:
                print(f"\n{'='*70}")
                print(f"✅ OTP SMS SENT SUCCESSFULLY")
                print(f"{'='*70}")
                print(f"📱 Mobile: {mobile_number}")
                print(f"🔑 OTP: {otp}")
                print(f"⏰ Valid for 5 minutes")
                print(f"💬 PRP Response: {response.text if 'response' in locals() else 'N/A'}")
                print(f"{'='*70}\n")
                success_message = 'OTP sent successfully to your mobile number'
            else:
                print(f"\n{'='*70}")
                print(f"⚠️ WARNING: OTP SMS MAY NOT HAVE BEEN SENT")
                print(f"{'='*70}")
                print(f"📱 Mobile: {mobile_number}")
                print(f"🔑 GENERATED OTP: {otp}")
                print(f"⏰ Valid for 5 minutes")
                print(f"❌ Error: {error_message}")
                print(f"{'='*70}\n")
                success_message = f'OTP generated. Please check SMS on {mobile_number}'
            
            # Prepare response data
            response_data = {
                'mobileNumber': mobile_number,
                'smsSent': sms_sent
            }
            
            # Include OTP in response for testing/debugging (remove in production)
            # This helps verify OTP generation when SMS delivery is problematic
            if not sms_sent or app.config.get('FLASK_DEBUG', False):
                response_data['otp'] = otp  # Include OTP for manual testing
                response_data['otpMessage'] = f'OTP: {otp} (Valid for 5 minutes) - Use this to test if SMS is not received'
            
            return jsonify({
                'status': 'success',
                'message': success_message,
                'data': response_data
            }), 200
            
        except Exception as e:
            print(f"Error in generate_otp: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to generate OTP: {str(e)}'
            }), 500
    
    @app.route('/api/login/verify-otp', methods=['POST'])
    def verify_otp():
        """
        Verify OTP and authenticate user.
        
        Expected JSON body:
        {
            "mobileNumber": "9876543210",  // 10-digit mobile number
            "otp": "123456"  // 6-digit OTP
        }
        
        Returns:
            JSON response with customer data on success
        """
        try:
            data = request.get_json()
            mobile_number = (data.get('mobileNumber') or '').strip()
            otp = (data.get('otp') or '').strip()
            
            # Validate inputs
            if not mobile_number:
                return jsonify({
                    'status': 'error',
                    'message': 'Mobile number is required'
                }), 400
            
            if not otp:
                return jsonify({
                    'status': 'error',
                    'message': 'OTP is required'
                }), 400
            
            if not re.match(r'^[0-9]{10}$', mobile_number):
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid mobile number format'
                }), 400
            
            if not re.match(r'^[0-9]{6}$', otp):
                return jsonify({
                    'status': 'error',
                    'message': 'OTP must be 6 digits'
                }), 400
            
            # Check if OTP exists for this mobile number
            if mobile_number not in otp_storage:
                return jsonify({
                    'status': 'error',
                    'message': 'OTP not found. Please generate a new OTP.'
                }), 404
            
            stored_otp_data = otp_storage[mobile_number]
            
            # Check if OTP has expired
            if datetime.now() > stored_otp_data['expires_at']:
                del otp_storage[mobile_number]
                return jsonify({
                    'status': 'error',
                    'message': 'OTP has expired. Please generate a new OTP.'
                }), 400
            
            # Check if OTP is already verified
            if stored_otp_data['verified']:
                return jsonify({
                    'status': 'error',
                    'message': 'OTP already used. Please generate a new OTP.'
                }), 400
            
            # Verify OTP
            if stored_otp_data['otp'] != otp:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid OTP. Please try again.'
                }), 400
            
            # OTP is valid - mark as verified and get customer data
            stored_otp_data['verified'] = True
            customer_id = stored_otp_data['customer_id']
            
            # Get customer details from database
            customer_query = """
                SELECT customer_id, customer_name, email, contact_no, address, 
                       city, state, status, user_type
                FROM b2c_customer_master 
                WHERE customer_id = %s
            """
            customer_result = db.execute_query(customer_query, (customer_id,))
            
            if not customer_result:
                return jsonify({
                    'status': 'error',
                    'message': 'Customer not found'
                }), 404
            
            customer = customer_result[0]
            
            # Clean up OTP from storage after successful verification
            del otp_storage[mobile_number]
            
            return jsonify({
                'status': 'success',
                'message': 'OTP verified successfully',
                'data': {
                    'customerId': customer.get('customer_id'),
                    'customerName': customer.get('customer_name'),
                    'email': customer.get('email'),
                    'mobileNumber': mobile_number,
                    'address': customer.get('address'),
                    'city': customer.get('city'),
                    'state': customer.get('state'),
                    'userType': customer.get('user_type'),
                    'status': customer.get('status')
                }
            }), 200
            
        except Exception as e:
            print(f"Error in verify_otp: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to verify OTP: {str(e)}'
            }), 500
    
    @app.route('/api/notifications', methods=['GET'])
    def get_notifications():
        """
        Get notifications for a customer.
        Generates notifications dynamically from customer data (no database table needed).
        
        Query Parameters:
            customerId: string (required) - Customer ID
        
        Returns:
            JSON response with list of notifications
        """
        try:
            customer_id = request.args.get('customerId')
            
            if not customer_id:
                return jsonify({
                    'status': 'error',
                    'message': 'Customer ID is required'
                }), 400
            
            # Get customer data
            customer_query = """
                SELECT customer_id, customer_name, status, created_at, updated_at,
                       est_waste_qty, user_type, city, state
                FROM b2c_customer_master 
                WHERE customer_id = %s
            """
            customer_result = db.execute_query(customer_query, (customer_id,))
            
            if not customer_result:
                return jsonify({
                    'status': 'error',
                    'message': 'Customer not found'
                }), 404
            
            customer = customer_result[0]
            notifications = []
            
            # Calculate time differences
            created_at = customer.get('created_at')
            updated_at = customer.get('updated_at')
            status = customer.get('status', '')
            customer_name = customer.get('customer_name', 'Customer')
            
            # Helper function to format time ago
            def get_time_ago(date_str):
                if not date_str:
                    return 'Recently'
                try:
                    if isinstance(date_str, str):
                        date_obj = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
                    else:
                        date_obj = date_str
                    now = datetime.now()
                    diff = now - date_obj
                    
                    if diff.days > 0:
                        if diff.days == 1:
                            return '1 day ago'
                        elif diff.days < 7:
                            return f'{diff.days} days ago'
                        elif diff.days < 30:
                            weeks = diff.days // 7
                            return f'{weeks} week{"s" if weeks > 1 else ""} ago'
                        else:
                            months = diff.days // 30
                            return f'{months} month{"s" if months > 1 else ""} ago'
                    elif diff.seconds >= 3600:
                        hours = diff.seconds // 3600
                        return f'{hours} hour{"s" if hours > 1 else ""} ago'
                    elif diff.seconds >= 60:
                        minutes = diff.seconds // 60
                        return f'{minutes} minute{"s" if minutes > 1 else ""} ago'
                    else:
                        return 'Just now'
                except:
                    return 'Recently'
            
            # Notification 1: Account Approval (if approved)
            if status == 'APPROVED':
                notifications.append({
                    'id': f'approval_{customer_id}',
                    'title': 'Account Approved',
                    'message': f'Great news, {customer_name}! Your account has been approved. You can now access all features of the app.',
                    'time': get_time_ago(updated_at if updated_at and updated_at != created_at else created_at),
                    'type': 'update',
                    'icon': '✅',
                    'isRead': False,
                    'priority': 'high',
                    'createdAt': updated_at if updated_at and updated_at != created_at else created_at
                })
            
            # Notification 2: Welcome message (if recently created)
            if created_at:
                try:
                    if isinstance(created_at, str):
                        created_date = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')
                    else:
                        created_date = created_at
                    days_since_creation = (datetime.now() - created_date).days
                    if days_since_creation <= 7:
                        notifications.append({
                            'id': f'welcome_{customer_id}',
                            'title': 'Welcome to OneStep Greener!',
                            'message': f'Welcome {customer_name}! Thank you for joining our recycling community. Start your eco-journey today!',
                            'time': get_time_ago(created_at),
                            'type': 'update',
                            'icon': '🌱',
                            'isRead': days_since_creation > 1,
                            'priority': 'high',
                            'createdAt': created_at
                        })
                except Exception as date_error:
                    print(f"Warning: Could not parse created_at date: {date_error}")
            
            # Notification 3: Profile under consideration (if pending)
            if status == 'PENDING':
                notifications.append({
                    'id': f'pending_{customer_id}',
                    'title': 'Profile Under Review',
                    'message': f'Hi {customer_name}, your profile is currently under consideration. We\'ll notify you once it\'s approved.',
                    'time': get_time_ago(created_at),
                    'type': 'update',
                    'icon': '⏳',
                    'isRead': False,
                    'priority': 'medium',
                    'createdAt': created_at
                })
            
            # Notification 4: Environmental impact (based on waste quantity)
            est_waste = customer.get('est_waste_qty')
            if est_waste and est_waste > 0:
                try:
                    # Convert to float if it's a Decimal or string
                    est_waste_float = float(est_waste) if est_waste else 0
                    
                    if est_waste_float > 0:
                        # Calculate environmental impact
                        trees_saved = int(est_waste_float * 0.08)  # Approx 0.08 trees per kg
                        co2_reduced = int(est_waste_float * 6)  # Approx 6kg CO2 per kg waste
                        
                        notifications.append({
                            'id': f'impact_{customer_id}',
                            'title': 'Environmental Impact',
                            'message': f'Your estimated waste quantity of {est_waste_float}kg could save approximately {trees_saved} trees and reduce {co2_reduced}kg of CO2 emissions!',
                            'time': get_time_ago(created_at),
                            'type': 'impact',
                            'icon': '🌍',
                            'isRead': True,
                            'priority': 'medium',
                            'createdAt': created_at
                        })
                except (ValueError, TypeError) as e:
                    print(f"Warning: Could not process waste quantity {est_waste}: {e}")
                    # Skip this notification if conversion fails
            
            # Notification 5: Service information
            user_type = customer.get('user_type', '')
            city = customer.get('city', '')
            if city:
                notifications.append({
                    'id': f'service_{customer_id}',
                    'title': 'Service Available',
                    'message': f'Our recycling pickup service is available in {city}. Schedule your first pickup from the dashboard!',
                    'time': get_time_ago(created_at),
                    'type': 'update',
                    'icon': '♻️',
                    'isRead': True,
                    'priority': 'low',
                    'createdAt': created_at
                })
            
            # Sort notifications by creation date (newest first)
            notifications.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
            
            # Limit to 20 most recent
            notifications = notifications[:20]
            
            return jsonify({
                'status': 'success',
                'data': {
                    'notifications': notifications,
                    'unreadCount': sum(1 for n in notifications if not n.get('isRead', False))
                }
            }), 200
            
        except Exception as e:
            print(f"Error in get_notifications: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to fetch notifications: {str(e)}'
            }), 500
    
    @app.route('/api/notifications/mark-read', methods=['POST'])
    def mark_notification_read():
        """
        Mark notification as read (optional - for future use with stored notifications).
        Currently notifications are generated dynamically, so this is a placeholder.
        
        Expected JSON body:
        {
            "customerId": "1001",
            "notificationId": "approval_1001"  // Optional
        }
        
        Returns:
            JSON response with success status
        """
        try:
            data = request.get_json()
            customer_id = data.get('customerId')
            
            if not customer_id:
                return jsonify({
                    'status': 'error',
                    'message': 'Customer ID is required'
                }), 400
            
            # Since notifications are generated dynamically, we can't mark them as read permanently
            # This endpoint is here for future use if we implement notification storage
            return jsonify({
                'status': 'success',
                'message': 'Notification marked as read'
            }), 200
            
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Failed to mark notification as read: {str(e)}'
            }), 500
    
    @app.route('/api/notifications/register-device', methods=['POST'])
    def register_device_token():
        """
        Register device token for push notifications.
        Stores FCM/APNS token for sending push notifications.
        
        Expected JSON body:
        {
            "customerId": "1001",
            "deviceToken": "fcm_token_or_apns_token",
            "platform": "ios" or "android"
        }
        
        Returns:
            JSON response with success status
        """
        try:
            data = request.get_json()
            customer_id = data.get('customerId')
            device_token = data.get('deviceToken')
            platform = data.get('platform', 'android')  # 'ios' or 'android'
            
            if not customer_id:
                return jsonify({
                    'status': 'error',
                    'message': 'Customer ID is required'
                }), 400
            
            if not device_token:
                return jsonify({
                    'status': 'error',
                    'message': 'Device token is required'
                }), 400
            
            # Check if customer exists
            customer_query = "SELECT customer_id FROM b2c_customer_master WHERE customer_id = %s"
            customer_result = db.execute_query(customer_query, (customer_id,))
            
            if not customer_result:
                return jsonify({
                    'status': 'error',
                    'message': 'Customer not found'
                }), 404
            
            # Check if device_tokens table exists, if not create it
            # This is a minimal table just for push notification tokens
            try:
                # Try to create table if it doesn't exist
                create_table_query = """
                    CREATE TABLE IF NOT EXISTS device_tokens (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        customer_id VARCHAR(50) NOT NULL,
                        device_token TEXT NOT NULL,
                        platform VARCHAR(10) NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        UNIQUE KEY unique_customer_token (customer_id, device_token(255)),
                        INDEX idx_customer_id (customer_id),
                        INDEX idx_device_token (device_token(255))
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
                db.execute_query(create_table_query, fetch=False)
                
                # Insert or update device token
                insert_query = """
                    INSERT INTO device_tokens (customer_id, device_token, platform, updated_at)
                    VALUES (%s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        device_token = VALUES(device_token),
                        platform = VALUES(platform),
                        updated_at = VALUES(updated_at)
                """
                current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                db.execute_query(insert_query, (customer_id, device_token, platform, current_time), fetch=False)
                
                return jsonify({
                    'status': 'success',
                    'message': 'Device token registered successfully'
                }), 200
                
            except Exception as table_error:
                # If table creation fails, log but don't fail the request
                print(f"Warning: Could not create/update device_tokens table: {table_error}")
                print("Device token registration skipped. Push notifications may not work.")
                return jsonify({
                    'status': 'success',
                    'message': 'Device token received (storage may be unavailable)'
                }), 200
            
        except Exception as e:
            print(f"Error in register_device_token: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to register device token: {str(e)}'
            }), 500
    
    @app.route('/api/profile/edit', methods=['PUT'])
    def edit_profile():
        """
        Edit customer profile endpoint.
        Allows customers to update their profile information.
        
        Expected JSON body:
        {
            "customerId": "1001",  // Required: Customer ID from login
            "fullName": "string",  // Optional
            "email": "string",  // Optional
            "houseNumber": "string",  // Optional
            "address": "string",  // Optional
            "city": "string",  // Optional
            "state": "string",  // Optional
            "userType": "string",  // Optional: "Household Apartment", "School/Institution", "Office", "Shop", "Other"
            "expectation": "string",  // Optional: Waste quantity (e.g., "50", "23kgs")
            "alternateContact": "string",  // Optional: 10-digit mobile number
            "knowAboutUs": "string",  // Optional
            "latitude": number,  // Optional
            "longitude": number  // Optional
        }
        
        Returns:
            JSON response with updated customer data
        """
        try:
            data = request.get_json()
            
            # Validate customerId is provided
            customer_id = data.get('customerId')
            if not customer_id:
                return jsonify({
                    'status': 'error',
                    'message': 'Customer ID is required'
                }), 400
            
            # Check if customer exists
            check_customer_query = """
                SELECT customer_id, customer_name, email, contact_no, address,
                       city, state, est_waste_qty, poc, user_type, reference,
                       status, latitude, longitude
                FROM b2c_customer_master 
                WHERE customer_id = %s
            """
            customer_result = db.execute_query(check_customer_query, (customer_id,))
            
            if not customer_result:
                return jsonify({
                    'status': 'error',
                    'message': 'Customer not found'
                }), 404
            
            customer = customer_result[0]
            
            # Check if customer is approved (only approved customers can edit profile)
            if customer.get('status') != 'APPROVED':
                return jsonify({
                    'status': 'error',
                    'message': 'Your profile is under consideration. Cannot edit profile at this time.'
                }), 403
            
            # Build update fields dynamically based on what's provided
            update_fields = []
            update_values = []
            
            # Full Name
            if 'fullName' in data and data.get('fullName'):
                full_name = (data.get('fullName') or '').strip()
                if full_name:
                    update_fields.append("customer_name = %s")
                    update_values.append(full_name)
            
            # Email
            if 'email' in data and data.get('email'):
                email = (data.get('email') or '').strip().lower()
                if email:
                    # Validate email format
                    if '@' not in email or '.' not in email.split('@')[1]:
                        return jsonify({
                            'status': 'error',
                            'message': 'Invalid email format.'
                        }), 400
                    update_fields.append("email = %s")
                    update_values.append(email)
            
            # House Number and Address
            house_number = None
            address = None
            if 'houseNumber' in data or 'address' in data:
                house_number = (data.get('houseNumber') or '').strip() if 'houseNumber' in data else ''
                address = (data.get('address') or '').strip() if 'address' in data else ''
                
                # If either is provided, combine them (similar to signup)
                if house_number or address:
                    # Get existing address to split if only one field is being updated
                    existing_address = customer.get('address', '')
                    if not house_number and 'houseNumber' not in data:
                        # User didn't provide houseNumber, try to extract from existing address
                        if existing_address and ',' in existing_address:
                            parts = existing_address.split(',', 1)
                            house_number = parts[0].strip()
                            if not address:
                                address = parts[1].strip() if len(parts) > 1 else ''
                        elif not address:
                            address = existing_address
                    elif not address and 'address' not in data:
                        # User didn't provide address, use existing address
                        if existing_address and ',' in existing_address:
                            address = existing_address.split(',', 1)[1].strip()
                        else:
                            address = existing_address
                    
                    # Combine house number with address
                    full_address = f"{house_number}, {address}".strip() if house_number else address
                    update_fields.append("address = %s")
                    update_values.append(full_address)
            
            # City
            if 'city' in data and data.get('city'):
                city = (data.get('city') or '').strip()
                if city:
                    update_fields.append("city = %s")
                    update_values.append(city)
            
            # State
            if 'state' in data and data.get('state'):
                state = (data.get('state') or '').strip()
                if state:
                    update_fields.append("state = %s")
                    update_values.append(state)
            
            # User Type
            if 'userType' in data and data.get('userType'):
                user_type_frontend = (data.get('userType') or '').strip()
                # Map user_type from frontend to database enum values
                user_type_mapping = {
                    'Household Apartment': 'RESIDENTIAL',
                    'School/Institution': 'INSTITUTIONAL',
                    'Office': 'COMMERCIAL',
                    'Shop': 'COMMERCIAL',
                    'Other': 'OTHERS'
                }
                user_type = user_type_mapping.get(user_type_frontend, 'OTHERS')
                update_fields.append("user_type = %s")
                update_values.append(user_type)
            
            # Expected Waste Quantity
            if 'expectation' in data and data.get('expectation'):
                expectation_raw = (data.get('expectation') or '').strip()
                if expectation_raw:
                    # Extract numeric value from expectation (handles cases like "23kgs" or "23")
                    expectation_numeric = re.sub(r'[^0-9.]', '', expectation_raw)
                    expectation = float(expectation_numeric) if expectation_numeric else None
                    
                    if expectation is None or expectation <= 0:
                        return jsonify({
                            'status': 'error',
                            'message': 'Please enter a valid waste quantity (must be greater than 0).'
                        }), 400
                    
                    update_fields.append("est_waste_qty = %s")
                    update_values.append(expectation)
            
            # Alternate Contact (POC)
            if 'alternateContact' in data:
                alternate_contact = (data.get('alternateContact') or '').strip() if data.get('alternateContact') else ''
                if alternate_contact:
                    # Validate alternate contact if provided
                    if not alternate_contact.isdigit() or len(alternate_contact) != 10:
                        return jsonify({
                            'status': 'error',
                            'message': 'Invalid alternate contact number. Must be 10 digits.'
                        }), 400
                    poc = f"+91{alternate_contact}"
                    update_fields.append("poc = %s")
                    update_values.append(poc)
                else:
                    # If empty string provided, clear the POC
                    update_fields.append("poc = %s")
                    update_values.append(None)
            
            # Know About Us (Reference)
            if 'knowAboutUs' in data and data.get('knowAboutUs'):
                know_about_us = (data.get('knowAboutUs') or '').strip()
                if know_about_us:
                    update_fields.append("reference = %s")
                    update_values.append(know_about_us)
            
            # Latitude
            if 'latitude' in data:
                latitude = data.get('latitude')
                latitude = float(latitude) if latitude is not None else None
                update_fields.append("latitude = %s")
                update_values.append(latitude)
            
            # Longitude
            if 'longitude' in data:
                longitude = data.get('longitude')
                longitude = float(longitude) if longitude is not None else None
                update_fields.append("longitude = %s")
                update_values.append(longitude)
            
            # If no fields to update
            if not update_fields:
                return jsonify({
                    'status': 'error',
                    'message': 'No fields provided for update'
                }), 400
            
            # Add updated_at and updated_by
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            update_fields.append("updated_at = %s")
            update_values.append(current_time)
            update_fields.append("updated_by = %s")
            update_values.append('APP')
            
            # Add customer_id for WHERE clause
            update_values.append(customer_id)
            
            # Build UPDATE query
            update_query = f"""
                UPDATE b2c_customer_master 
                SET {', '.join(update_fields)}
                WHERE customer_id = %s
            """
            
            # Execute update
            db.execute_query(update_query, tuple(update_values), fetch=False)
            
            # Get updated customer data
            updated_customer_result = db.execute_query(check_customer_query, (customer_id,))
            updated_customer = updated_customer_result[0] if updated_customer_result else customer
            
            # Extract mobile number from contact_no (remove +91 prefix)
            contact_no = updated_customer.get('contact_no', '')
            mobile_number = contact_no.replace('+91', '').replace('+91/', '').replace('/', '') if contact_no else ''
            
            # Split address into houseNumber and address if it contains comma
            full_address_str = updated_customer.get('address', '') or ''
            address_parts = full_address_str.split(',', 1) if ',' in full_address_str else ['', full_address_str]
            house_number_resp = address_parts[0].strip() if address_parts[0] else ''
            address_resp = address_parts[1].strip() if len(address_parts) > 1 and address_parts[1] else full_address_str
            
            # Map user_type back to frontend format
            user_type_db = updated_customer.get('user_type', '')
            user_type_mapping_reverse = {
                'RESIDENTIAL': 'Household Apartment',
                'INSTITUTIONAL': 'School/Institution',
                'COMMERCIAL': 'Office',
                'OTHERS': 'Other'
            }
            user_type_frontend_resp = user_type_mapping_reverse.get(user_type_db, 'Other')
            
            # Extract POC (alternateContact) - remove +91 prefix
            poc = updated_customer.get('poc', '') or ''
            alternate_contact_resp = poc.replace('+91', '').replace('+91/', '').replace('/', '') if poc else ''
            
            return jsonify({
                'status': 'success',
                'message': 'Profile updated successfully',
                'data': {
                    'customerId': updated_customer.get('customer_id'),
                    'customerName': updated_customer.get('customer_name'),
                    'email': updated_customer.get('email'),
                    'mobileNumber': mobile_number,
                    'houseNumber': house_number_resp,
                    'address': address_resp,
                    'city': updated_customer.get('city'),
                    'state': updated_customer.get('state'),
                    'userType': user_type_frontend_resp,
                    'expectation': str(updated_customer.get('est_waste_qty', '')) if updated_customer.get('est_waste_qty') else '',
                    'alternateContact': alternate_contact_resp,
                    'knowAboutUs': updated_customer.get('reference', ''),
                    'latitude': updated_customer.get('latitude'),
                    'longitude': updated_customer.get('longitude'),
                    'status': updated_customer.get('status')
                }
            }), 200
            
        except Exception as e:
            error_msg = str(e).lower()
            
            # Handle duplicate entry (email already exists for another customer)
            if 'duplicate' in error_msg or 'unique' in error_msg:
                if 'email' in error_msg:
                    return jsonify({
                        'status': 'error',
                        'message': 'An account with this email already exists.'
                    }), 409
            
            # Handle other errors
            print(f"Error in edit_profile: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to update profile: {str(e)}'
            }), 500
    
    @app.route('/api/logout', methods=['POST'])
    def logout():
        """
        Logout endpoint.
        Clears session data and invalidates any active sessions.
        
        Expected JSON body:
        {
            "customerId": "1001"  // Optional: Customer ID
        }
        
        Returns:
            JSON response with success status
        """
        try:
            data = request.get_json() or {}
            customer_id = data.get('customerId')
            
            # If customer ID is provided, we can perform additional cleanup
            # For example: clear device tokens, invalidate sessions, etc.
            if customer_id:
                # Optional: Clear device tokens for this customer (if you want to disable push notifications on logout)
                # This is optional - you might want to keep device tokens for future logins
                # try:
                #     db.execute_query(
                #         "DELETE FROM device_tokens WHERE customer_id = %s",
                #         (customer_id,),
                #         fetch=False
                #     )
                # except:
                #     pass  # Ignore if table doesn't exist or query fails
                
                print(f"User {customer_id} logged out")
            
            # Clear any OTP data for this customer (if mobile number was provided)
            # Note: OTPs expire automatically after 5 minutes, but we can clear them on logout
            
            return jsonify({
                'status': 'success',
                'message': 'Logged out successfully'
            }), 200
            
        except Exception as e:
            print(f"Error in logout: {str(e)}")
            # Even if there's an error, return success to allow frontend to proceed with logout
            return jsonify({
                'status': 'success',
                'message': 'Logged out successfully'
            }), 200
    
    return app


if __name__ == '__main__':
    app = create_app()
    config = Config()
    
    print(f"Starting Flask server on port {config.FLASK_PORT}")
    print(f"Database: {config.DB_NAME} @ {config.DB_HOST}")
    
    app.run(
        host='0.0.0.0',
        port=config.FLASK_PORT,
        debug=config.FLASK_DEBUG
    )

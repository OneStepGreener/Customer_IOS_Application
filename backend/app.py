"""
Main Flask application file.
API endpoints for B2C Customer App.

CODE SECTIONS:
==============
1. APP INITIALIZATION & CONFIGURATION
2. HEALTH CHECK & TESTING ENDPOINTS
3. CUSTOMER SIGNUP API
4. LOGIN & OTP MANAGEMENT (Generate, Verify, Resend)
5. PROFILE MANAGEMENT (Edit Profile)
6. PUSH NOTIFICATIONS API (Get Notifications, Mark Read, Register Device)
7. SESSION MANAGEMENT API (Logout)
8. ERROR HANDLERS
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import db
from config import Config
from datetime import datetime, timedelta
import re
import secrets
import requests


def create_app() -> Flask:
    """
    Create and configure Flask application.
    
    Returns:
        Flask: Configured Flask application instance
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # ========================================================================
    # SECTION 1: APP INITIALIZATION & CONFIGURATION
    # ========================================================================
    # Enable CORS for React Native app
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # In-memory OTP storage (in production, use Redis or database)
    # Format: {mobile_number: {'otp': '123456', 'expires_at': datetime, 'verified': False}}
    otp_storage = {}
    
    # ========================================================================
    # SECTION 2: HEALTH CHECK & TESTING ENDPOINTS
    # ========================================================================
    
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
            
            # Generate cryptographically secure random 6-digit OTP
            otp = str(secrets.randbelow(900000) + 100000)  # Generates random number between 100000-999999
            
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
    
    # ========================================================================
    # SECTION 3: CUSTOMER SIGNUP API
    # ========================================================================
    # This endpoint handles new customer registration
    # Creates customer record in b2c_customer_master table with status='PENDING'
    
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
    
    # ========================================================================
    # SECTION 4: LOGIN & OTP MANAGEMENT
    # ========================================================================
    # This section handles OTP generation, verification, and resend functionality
    # Uses PRP SMS API for sending OTPs dynamically (not hardcoded)
    
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
            
            # Check if mobile number exists in database (but allow OTP generation even if not found)
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
            
            # Track if user exists (for later verification)
            user_exists = bool(customer_result)
            customer_id = None
            customer_name = None
            customer_status = None
            
            if customer_result:
                customer = customer_result[0]
                customer_id = customer.get('customer_id')
                customer_name = customer.get('customer_name')
                customer_status = customer.get('status')
            
            # Generate cryptographically secure random 6-digit OTP
            # Using secrets module for secure random number generation
            otp = str(secrets.randbelow(900000) + 100000)  # Generates random number between 100000-999999
            
            print(f"\n{'='*70}")
            print(f"📱 OTP GENERATION FOR: {mobile_number}")
            print(f"{'='*70}")
            print(f"🔑 Generated OTP: {otp}")
            if user_exists:
                print(f"👤 Customer: {customer_name} (ID: {customer_id})")
                print(f"✅ Status: {customer_status}")
            else:
                print(f"👤 User: Not registered (will be directed to signup after OTP verification)")
            print(f"{'='*70}\n")
            
            # Store OTP with expiration (5 minutes) - also store user existence status
            expires_at = datetime.now() + timedelta(minutes=5)
            otp_storage[mobile_number] = {
                'otp': otp,
                'expires_at': expires_at,
                'verified': False,
                'customer_id': customer_id,
                'user_exists': user_exists,
                'customer_status': customer_status
            }
            
            # Send OTP via PRP SMS API using Template Name (as per PRP documentation)
            prp_api_key = app.config.get('PRP_API_KEY')
            prp_api_base = app.config.get('PRP_API_BASE_URL')
            prp_sender_id = app.config.get('PRP_SENDER_ID')
            prp_template_name = app.config.get('PRP_TEMPLATE_NAME')
            
            # PRP API endpoint for sending SMS using template name
            prp_api_url = f"{prp_api_base}/SendSmsTemplateName"
            
            # Mobile number format: 91{10-digit} (country code + mobile, no + sign)
            mobile_with_country = f"91{mobile_number}"
            
            # PRP API request body format (as per documentation)
            # Send dynamically generated OTP to PRP API via templateParams
            # IMPORTANT: templateParams must be a STRING containing the OTP value
            # The PRP template will replace the variable placeholder with this OTP value
            payload = {
                "sender": prp_sender_id,
                "templateName": prp_template_name,
                "smsReciever": [
                    {
                        "mobileNo": mobile_with_country,
                        "templateParams": otp  # Dynamically generated OTP sent as STRING to PRP API
                    }
                ]
            }
            
            # PRP API headers (as per documentation)
            headers = {
                "apikey": prp_api_key,  # Note: lowercase 'apikey' in header
                "Content-Type": "application/json"
            }
            
            print(f"\n{'='*70}")
            print(f"📱 SENDING DYNAMIC OTP VIA PRP API")
            print(f"{'='*70}")
            print(f"📞 Mobile: {mobile_with_country}")
            print(f"🔑 Generated OTP: {otp} (Dynamically generated, not hardcoded)")
            print(f"📋 Template: {prp_template_name}")
            print(f"📤 Sender: {prp_sender_id}")
            print(f"🌐 URL: {prp_api_url}")
            print(f"📦 templateParams (sent to PRP): {otp}")
            print(f"✅ OTP is dynamically generated and sent to PRP API")
            print(f"{'='*70}\n")
            
            sms_sent = False
            error_message = None
            
            try:
                # Use 30 second timeout to allow sufficient time for SMS delivery
                response = requests.post(prp_api_url, json=payload, headers=headers, timeout=30)
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
                'smsSent': sms_sent,
                'userExists': user_exists  # Indicate if user exists in database
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
    
    # OTP Verification Endpoint
    # Verifies OTP and checks if user exists in database
    # Returns userExists and userApproved flags for frontend routing
    
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
            
            # OTP is valid - mark as verified and check if user exists
            stored_otp_data['verified'] = True
            user_exists = stored_otp_data.get('user_exists', False)
            customer_id = stored_otp_data.get('customer_id')
            customer_status = stored_otp_data.get('customer_status')
            
            # Clean up OTP from storage after successful verification
            del otp_storage[mobile_number]
            
            # If user exists in database, get customer details
            if user_exists and customer_id:
                # Get customer details from database
                customer_query = """
                    SELECT customer_id, customer_name, email, contact_no, address, 
                           city, state, status, user_type
                    FROM b2c_customer_master 
                    WHERE customer_id = %s
                """
                customer_result = db.execute_query(customer_query, (customer_id,))
                
                if customer_result:
                    customer = customer_result[0]
                    
                    # Check if customer is approved
                    if customer.get('status') != 'APPROVED':
                        return jsonify({
                            'status': 'success',
                            'message': 'OTP verified successfully',
                            'userExists': True,
                            'userApproved': False,
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
                    
                    # User exists and is approved
                    return jsonify({
                        'status': 'success',
                        'message': 'OTP verified successfully',
                        'userExists': True,
                        'userApproved': True,
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
            
            # User does NOT exist in database - return success but indicate user doesn't exist
            return jsonify({
                'status': 'success',
                'message': 'OTP verified successfully',
                'userExists': False,
                'data': {
                    'mobileNumber': mobile_number
                }
            }), 200
            
        except Exception as e:
            print(f"Error in verify_otp: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to verify OTP: {str(e)}'
            }), 500
    
    # Resend OTP Endpoint
    # Allows users to request a new OTP if they didn't receive the first one
    # Only works for registered and approved customers
    
    @app.route('/api/login/resend-otp', methods=['POST'])
    def resend_otp():
        """
        Resend OTP to mobile number via PRP OTP service.
        This endpoint is used when user requests a new OTP (e.g., didn't receive SMS, expired, etc.)
        
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
            
            # Generate new cryptographically secure random 6-digit OTP
            # Using secrets module for secure random number generation
            otp = str(secrets.randbelow(900000) + 100000)  # Generates random number between 100000-999999
            
            print(f"\n{'='*70}")
            print(f"📱 RESENDING OTP FOR: {mobile_number}")
            print(f"{'='*70}")
            print(f"🔑 Generated New OTP: {otp}")
            print(f"👤 Customer: {customer.get('customer_name')} (ID: {customer.get('customer_id')})")
            print(f"📞 Contact: {customer.get('contact_no')}")
            print(f"✅ Status: {customer.get('status')}")
            print(f"{'='*70}\n")
            
            # Store new OTP with expiration (5 minutes) - this overwrites any existing OTP
            expires_at = datetime.now() + timedelta(minutes=5)
            otp_storage[mobile_number] = {
                'otp': otp,
                'expires_at': expires_at,
                'verified': False,
                'customer_id': customer.get('customer_id')
            }
            
            # Send OTP via PRP SMS API using Template Name (as per PRP documentation)
            prp_api_key = app.config.get('PRP_API_KEY')
            prp_api_base = app.config.get('PRP_API_BASE_URL')
            prp_sender_id = app.config.get('PRP_SENDER_ID')
            prp_template_name = app.config.get('PRP_TEMPLATE_NAME')
            
            # PRP API endpoint for sending SMS using template name
            prp_api_url = f"{prp_api_base}/SendSmsTemplateName"
            
            # Mobile number format: 91{10-digit} (country code + mobile, no + sign)
            mobile_with_country = f"91{mobile_number}"
            
            # PRP API request body format (as per documentation)
            # Send dynamically generated OTP to PRP API via templateParams
            # IMPORTANT: templateParams must be a STRING containing the OTP value
            # The PRP template will replace the variable placeholder with this OTP value
            payload = {
                "sender": prp_sender_id,
                "templateName": prp_template_name,
                "smsReciever": [
                    {
                        "mobileNo": mobile_with_country,
                        "templateParams": otp  # Dynamically generated OTP sent as STRING to PRP API
                    }
                ]
            }
            
            # PRP API headers (as per documentation)
            headers = {
                "apikey": prp_api_key,  # Note: lowercase 'apikey' in header
                "Content-Type": "application/json"
            }
            
            print(f"\n{'='*70}")
            print(f"📱 RESENDING OTP VIA PRP API")
            print(f"{'='*70}")
            print(f"📞 Mobile: {mobile_with_country}")
            print(f"🔑 Generated New OTP: {otp} (Dynamically generated, not hardcoded)")
            print(f"📋 Template: {prp_template_name}")
            print(f"📤 Sender: {prp_sender_id}")
            print(f"🌐 URL: {prp_api_url}")
            print(f"📦 templateParams (sent to PRP): {otp}")
            print(f"✅ New OTP is dynamically generated and sent to PRP API")
            print(f"{'='*70}\n")
            
            sms_sent = False
            error_message = None
            
            try:
                # Use 30 second timeout to allow sufficient time for SMS delivery
                response = requests.post(prp_api_url, json=payload, headers=headers, timeout=30)
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
                print(f"✅ RESEND OTP SMS SENT SUCCESSFULLY")
                print(f"{'='*70}")
                print(f"📱 Mobile: {mobile_number}")
                print(f"🔑 New OTP: {otp}")
                print(f"⏰ Valid for 5 minutes")
                print(f"💬 PRP Response: {response.text if 'response' in locals() else 'N/A'}")
                print(f"{'='*70}\n")
                success_message = 'New OTP sent successfully to your mobile number'
            else:
                print(f"\n{'='*70}")
                print(f"⚠️ WARNING: RESEND OTP SMS MAY NOT HAVE BEEN SENT")
                print(f"{'='*70}")
                print(f"📱 Mobile: {mobile_number}")
                print(f"🔑 GENERATED NEW OTP: {otp}")
                print(f"⏰ Valid for 5 minutes")
                print(f"❌ Error: {error_message}")
                print(f"{'='*70}\n")
                success_message = f'New OTP generated. Please check SMS on {mobile_number}'
            
            # Prepare response data
            response_data = {
                'mobileNumber': mobile_number,
                'smsSent': sms_sent
            }
            
            # Include OTP in response for testing/debugging (remove in production)
            # This helps verify OTP generation when SMS delivery is problematic
            if not sms_sent or app.config.get('FLASK_DEBUG', False):
                response_data['otp'] = otp  # Include OTP for manual testing
                response_data['otpMessage'] = f'New OTP: {otp} (Valid for 5 minutes) - Use this to test if SMS is not received'
            
            return jsonify({
                'status': 'success',
                'message': success_message,
                'data': response_data
            }), 200
            
        except Exception as e:
            print(f"Error in resend_otp: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to resend OTP: {str(e)}'
            }), 500
    
    # ========================================================================
    # SECTION 5: PROFILE MANAGEMENT
    # ========================================================================
    # This section handles customer profile editing
    # Allows partial updates to customer information
    
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
    
    # ========================================================================
    # SECTION 6: PUSH NOTIFICATIONS API
    # ========================================================================
    # This section handles all push notification related functionality:
    # - Fetching notifications for customers
    # - Marking notifications as read
    # - Registering device tokens for FCM push notifications
    
    # Get Notifications Endpoint
    # Fetches all notifications for a given customer from Customer_Notifications table
    
    @app.route('/api/notifications', methods=['GET'])
    def get_notifications():
        """
        Get all notifications for a customer.
        
        Query Parameters:
            customerId (required): Customer ID to fetch notifications for
        
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
            
            # Fetch notifications from database
            # Note: This assumes a notifications table exists. If not, create it with:
            # CREATE TABLE Customer_Notifications (
            #     id INT AUTO_INCREMENT PRIMARY KEY,
            #     customer_id VARCHAR(50) NOT NULL,
            #     title VARCHAR(255) NOT NULL,
            #     message TEXT NOT NULL,
            #     type VARCHAR(50),
            #     priority VARCHAR(20) DEFAULT 'medium',
            #     is_read BOOLEAN DEFAULT FALSE,
            #     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            #     FOREIGN KEY (customer_id) REFERENCES b2c_customer_master(customer_id)
            # );
            
            notifications_query = """
                SELECT id, customer_id, title, message, type, priority, is_read, created_at
                FROM Customer_Notifications 
                WHERE customer_id = %s 
                ORDER BY created_at DESC 
                LIMIT 50
            """
            
            try:
                notifications_result = db.execute_query(notifications_query, (customer_id,))
            except Exception as db_error:
                # If table doesn't exist, return empty array (will be created later)
                error_msg = str(db_error).lower()
                if 'table' in error_msg and 'doesn\'t exist' in error_msg:
                    print(f"Notifications table doesn't exist yet. Returning empty array.")
                    notifications_result = []
                else:
                    raise
            
            notifications = []
            for notif in notifications_result:
                # Calculate time ago
                created_at = notif.get('created_at')
                time_ago = 'Just now'
                if created_at:
                    if isinstance(created_at, str):
                        created_at = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')
                    time_diff = datetime.now() - created_at
                    
                    if time_diff.total_seconds() < 60:
                        time_ago = 'Just now'
                    elif time_diff.total_seconds() < 3600:
                        minutes = int(time_diff.total_seconds() / 60)
                        time_ago = f'{minutes} minute{"s" if minutes != 1 else ""} ago'
                    elif time_diff.days < 1:
                        hours = int(time_diff.total_seconds() / 3600)
                        time_ago = f'{hours} hour{"s" if hours != 1 else ""} ago'
                    elif time_diff.days < 7:
                        days = time_diff.days
                        time_ago = f'{days} day{"s" if days != 1 else ""} ago'
                    else:
                        weeks = time_diff.days // 7
                        time_ago = f'{weeks} week{"s" if weeks != 1 else ""} ago'
                
                # Map notification type to icon
                type_icons = {
                    'pickup': '♻️',
                    'achievement': '🌱',
                    'reward': '🎁',
                    'update': '📢',
                    'impact': '🌍',
                    'payment': '💳',
                    'system': '🔔',
                }
                icon = type_icons.get(notif.get('type', '').lower(), '🔔')
                
                notifications.append({
                    'id': notif.get('id'),
                    'title': notif.get('title', ''),
                    'message': notif.get('message', ''),
                    'time': time_ago,
                    'type': notif.get('type', 'system'),
                    'icon': icon,
                    'isRead': bool(notif.get('is_read', False)),
                    'priority': notif.get('priority', 'medium'),
                })
            
            return jsonify({
                'status': 'success',
                'data': notifications,
                'count': len(notifications),
                'unreadCount': sum(1 for n in notifications if not n['isRead'])
            }), 200
            
        except Exception as e:
            print(f"Error in get_notifications: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to fetch notifications: {str(e)}'
            }), 500
    
    # Mark Notification as Read Endpoint
    # Marks a specific notification or all notifications as read for a customer
    
    @app.route('/api/notifications/mark-read', methods=['POST'])
    def mark_notification_read():
        """
        Mark notification(s) as read.
        
        Request Body:
        {
            "customerId": "1001",  // Required
            "notificationId": 123,  // Optional: specific notification ID, if not provided, marks all as read
        }
        
        Returns:
            JSON response with success status
        """
        try:
            data = request.get_json()
            customer_id = data.get('customerId')
            notification_id = data.get('notificationId')
            
            if not customer_id:
                return jsonify({
                    'status': 'error',
                    'message': 'Customer ID is required'
                }), 400
            
            if notification_id:
                # Mark specific notification as read
                update_query = """
                    UPDATE Customer_Notifications 
                    SET is_read = TRUE 
                    WHERE id = %s AND customer_id = %s
                """
                db.execute_query(update_query, (notification_id, customer_id), fetch=False)
                message = 'Notification marked as read'
            else:
                # Mark all notifications as read
                update_query = """
                    UPDATE Customer_Notifications 
                    SET is_read = TRUE 
                    WHERE customer_id = %s
                """
                db.execute_query(update_query, (customer_id,), fetch=False)
                message = 'All notifications marked as read'
            
            return jsonify({
                'status': 'success',
                'message': message
            }), 200
            
        except Exception as e:
            print(f"Error in mark_notification_read: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to update notification: {str(e)}'
            }), 500
    
    # Register Device Token Endpoint
    # Registers FCM device tokens for push notifications
    # Stores tokens in b2c_device_tokens table for sending push notifications later
    
    @app.route('/api/notifications/register-device', methods=['POST'])
    def register_device_token():
        """
        Register device token for push notifications.
        
        Request Body:
        {
            "customerId": "1001",  // Required
            "deviceToken": "fcm_token_here",  // Required: FCM device token
            "platform": "ios" or "android"  // Required
        }
        
        Returns:
            JSON response with success status
        """
        try:
            data = request.get_json()
            customer_id = data.get('customerId')
            device_token = data.get('deviceToken')
            platform = data.get('platform', 'android')
            
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
            
            # Store device token in database
            # Note: This assumes a device_tokens table exists. If not, create it with:
            # CREATE TABLE b2c_device_tokens (
            #     id INT AUTO_INCREMENT PRIMARY KEY,
            #     customer_id VARCHAR(50) NOT NULL,
            #     device_token TEXT NOT NULL,
            #     platform VARCHAR(20) NOT NULL,
            #     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            #     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            #     UNIQUE KEY unique_customer_device (customer_id, device_token(255)),
            #     FOREIGN KEY (customer_id) REFERENCES b2c_customer_master(customer_id)
            # );
            
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Insert or update device token
            upsert_query = """
                INSERT INTO b2c_device_tokens (customer_id, device_token, platform, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                    device_token = VALUES(device_token),
                    platform = VALUES(platform),
                    updated_at = VALUES(updated_at)
            """
            
            try:
                db.execute_query(upsert_query, (customer_id, device_token, platform, current_time, current_time), fetch=False)
            except Exception as db_error:
                error_msg = str(db_error).lower()
                if 'table' in error_msg and 'doesn\'t exist' in error_msg:
                    print(f"Device tokens table doesn't exist yet. Please create it first.")
                    return jsonify({
                        'status': 'error',
                        'message': 'Device tokens table not found. Please contact administrator.'
                    }), 500
                else:
                    raise
            
            return jsonify({
                'status': 'success',
                'message': 'Device token registered successfully'
            }), 200
            
        except Exception as e:
            print(f"Error in register_device_token: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to register device token: {str(e)}'
            }), 500
    
    # ========================================================================
    # SECTION 7: SESSION MANAGEMENT API
    # ========================================================================
    # This section handles user session management
    # Note: Actual sessions are stored in AsyncStorage (frontend), not in database
    # This endpoint is for logging purposes and API consistency
    
    # Logout Endpoint
    # Logs user logout event (sessions are cleared in frontend AsyncStorage)
    
    @app.route('/api/logout', methods=['POST'])
    def logout():
        """
        Logout endpoint - clears user session.
        Note: Sessions are stored locally in AsyncStorage, not in database.
        This endpoint is for logging purposes and API consistency.
        
        Request Body:
        {
            "customerId": "1001",  // Optional: Customer ID for logging
            "sessionToken": "session_token_here"  // Optional: Session token for logging
        }
        
        Returns:
            JSON response with success status
        """
        try:
            data = request.get_json() or {}
            customer_id = data.get('customerId')
            session_token = data.get('sessionToken')
            
            # Log logout for analytics (optional)
            if customer_id:
                print(f"\n{'='*70}")
                print(f"🚪 USER LOGOUT")
                print(f"{'='*70}")
                print(f"👤 Customer ID: {customer_id}")
                print(f"🔑 Session Token: {session_token[:20] + '...' if session_token else 'N/A'}")
                print(f"⏰ Logout Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"{'='*70}\n")
            
            # Note: Actual session clearing happens in frontend AsyncStorage
            # This endpoint is for API consistency and logging purposes
            
            return jsonify({
                'status': 'success',
                'message': 'Logged out successfully'
            }), 200
            
        except Exception as e:
            print(f"Error in logout: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to logout: {str(e)}'
            }), 500
    
    # ========================================================================
    # SECTION 8: ERROR HANDLERS
    # ========================================================================
    # Global error handlers for 404 and 500 errors
    
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

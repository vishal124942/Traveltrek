import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import 'storage_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final StorageService _storage = StorageService();

  Future<Map<String, String>> _getHeaders({bool withAuth = true}) async {
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };

    if (withAuth) {
      final token = await _storage.getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  Future<Map<String, dynamic>> _handleResponse(http.Response response) async {
    final body = json.decode(response.body);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return {'success': true, 'data': body};
    } else {
      return {
        'success': false,
        'error': body['error'] ?? 'An error occurred',
        'statusCode': response.statusCode,
      };
    }
  }

  // Auth endpoints
  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/auth/register'),
        headers: await _getHeaders(withAuth: false),
        body: json.encode({
          'name': name,
          'email': email,
          'phone': phone,
          'password': password,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/auth/login'),
        headers: await _getHeaders(withAuth: false),
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Forgot Password - Request OTP
  Future<Map<String, dynamic>> forgotPassword({required String email}) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/auth/forgot-password'),
        headers: await _getHeaders(withAuth: false),
        body: json.encode({'email': email}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Reset Password - Verify OTP and update
  Future<Map<String, dynamic>> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/auth/reset-password'),
        headers: await _getHeaders(withAuth: false),
        body: json.encode({
          'email': email,
          'otp': otp,
          'newPassword': newPassword,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Google Sign-In
  Future<Map<String, dynamic>> googleAuth({
    required String email,
    required String name,
    required String googleId,
    String? photoUrl,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/auth/google'),
        headers: await _getHeaders(withAuth: false),
        body: json.encode({
          'email': email,
          'name': name,
          'googleId': googleId,
          'photoUrl': photoUrl,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // User endpoints
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.apiBaseUrl}/user/profile'),
        headers: await _getHeaders(),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> updateProfile({
    String? name,
    String? phone,
    String? email,
  }) async {
    try {
      final response = await http.put(
        Uri.parse('${AppConstants.apiBaseUrl}/user/profile'),
        headers: await _getHeaders(),
        body: json.encode({
          if (name != null) 'name': name,
          if (phone != null) 'phone': phone,
          if (email != null) 'email': email,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Request OTP for profile change (name/phone)
  Future<Map<String, dynamic>> requestProfileChange({
    required String field,
    required String newValue,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/user/profile/request-change'),
        headers: await _getHeaders(),
        body: json.encode({
          'field': field,
          'newValue': newValue,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Verify OTP and apply profile change
  Future<Map<String, dynamic>> verifyProfileChange({
    required String field,
    required String newValue,
    required String otp,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/user/profile/verify-change'),
        headers: await _getHeaders(),
        body: json.encode({
          'field': field,
          'newValue': newValue,
          'otp': otp,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Request OTP for password change
  Future<Map<String, dynamic>> requestPasswordChange({
    required String newPassword,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/user/password/request-change'),
        headers: await _getHeaders(),
        body: json.encode({'newPassword': newPassword}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Verify OTP and change password
  Future<Map<String, dynamic>> verifyPasswordChange({
    required String otp,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/user/password/verify-change'),
        headers: await _getHeaders(),
        body: json.encode({'otp': otp}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> updateFcmToken(String token) async {
    try {
      final response = await http.put(
        Uri.parse('${AppConstants.apiBaseUrl}/user/fcm-token'),
        headers: await _getHeaders(),
        body: json.encode({'fcmToken': token}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Membership endpoints
  Future<Map<String, dynamic>> getMembership() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.apiBaseUrl}/membership'),
        headers: await _getHeaders(),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Destinations endpoints
  Future<Map<String, dynamic>> getDestinations() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.apiBaseUrl}/destinations'),
        headers: await _getHeaders(withAuth: false),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Chat endpoints
  Future<Map<String, dynamic>> sendChatMessage(String message) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/chat'),
        headers: await _getHeaders(),
        body: json.encode({'message': message}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Stream<String> sendMessageStream(String message) async* {
    final client = http.Client();
    try {
      final request = http.Request('POST', Uri.parse('${AppConstants.apiBaseUrl}/chat'));
      request.headers.addAll(await _getHeaders());
      request.body = json.encode({'message': message});

      final response = await client.send(request);

      if (response.statusCode != 200) {
        throw Exception('Failed to send message: ${response.statusCode}');
      }

      await for (final chunk in response.stream.transform(utf8.decoder)) {
        // Parse SSE data
        final lines = chunk.split('\n');
        for (final line in lines) {
          if (line.startsWith('data: ')) {
            final data = line.substring(6);
            if (data.trim().isEmpty) continue;
            
            try {
              final jsonResponse = json.decode(data);
              if (jsonResponse['chunk'] != null) {
                yield jsonResponse['chunk'];
              } else if (jsonResponse['error'] != null) {
                throw Exception(jsonResponse['error']);
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (e) {
      throw Exception('Network error: $e');
    } finally {
      client.close();
    }
  }

  Future<Map<String, dynamic>> getChatHistory() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.apiBaseUrl}/chat/history'),
        headers: await _getHeaders(),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Clear chat history
  Future<Map<String, dynamic>> clearChatHistory() async {
    try {
      final response = await http.delete(
        Uri.parse('${AppConstants.apiBaseUrl}/chat/history'),
        headers: await _getHeaders(),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Plan endpoints
  Future<Map<String, dynamic>> getPlans() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.apiBaseUrl}/membership/plans'),
        headers: await _getHeaders(),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> choosePlan(String planType) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/membership/choose-plan'),
        headers: await _getHeaders(),
        body: json.encode({'planType': planType}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> cancelMembership() async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/membership/cancel'),
        headers: await _getHeaders(),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> markPaymentDone({
    required String paymentMethod,
    String? transactionId,
    String? notes,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/membership/payment-done'),
        headers: await _getHeaders(),
        body: json.encode({
          'paymentMethod': paymentMethod,
          'transactionId': transactionId,
          'notes': notes,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }
}

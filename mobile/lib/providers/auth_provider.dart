import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  final StorageService _storage = StorageService();

  User? _user;
  String? _token;
  bool _isLoading = false;
  String? _error;
  bool _isInitialized = false;

  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _token != null && _user != null;
  bool get isInitialized => _isInitialized;

  Future<void> initialize() async {
    if (_isInitialized) return;
    
    _token = await _storage.getToken();
    _user = await _storage.getUser();
    _isInitialized = true;
    notifyListeners();
  }

  // Set authenticated state (used for Google Sign-In)
  void setAuthenticated(String token, User user) {
    _token = token;
    _user = user;
    _isInitialized = true;
    notifyListeners();
  }

  Future<bool> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _api.register(
        name: name,
        email: email,
        phone: phone,
        password: password,
      );

      if (result['success']) {
        final data = result['data'];
        _token = data['token'];
        _user = User.fromJson(data['user']);
        
        await _storage.saveToken(_token!);
        await _storage.saveUser(_user!);
        
        _isInitialized = true; // Mark as initialized after registration
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = result['error'];
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Registration failed: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('DEBUG: Calling login API...');
      final result = await _api.login(email: email, password: password);
      print('DEBUG: Login API result: $result');

      if (result['success']) {
        final data = result['data'];
        _token = data['token'];
        _user = User.fromJson(data['user']);
        
        print('DEBUG: Token received: ${_token?.substring(0, 20)}...');
        print('DEBUG: User: ${_user?.name}');
        
        await _storage.saveToken(_token!);
        await _storage.saveUser(_user!);
        
        _isInitialized = true;
        _isLoading = false;
        
        print('DEBUG: isAuthenticated after login: $isAuthenticated');
        print('DEBUG: isInitialized after login: $isInitialized');
        
        notifyListeners();
        return true;
      } else {
        _error = result['error'];
        print('DEBUG: Login error: $_error');
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Login failed: $e';
      print('DEBUG: Login exception: $e');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.clearAll();
    _user = null;
    _token = null;
    _error = null;
    notifyListeners();
  }

  Future<bool> refreshProfile() async {
    try {
      final result = await _api.getProfile();
      if (result['success']) {
        _user = User.fromJson(result['data']['user']);
        await _storage.saveUser(_user!);
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = 'Failed to refresh profile: $e';
    }
    return false;
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

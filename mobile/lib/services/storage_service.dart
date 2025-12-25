import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';
import '../models/user.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  // Token management (secure storage)
  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: AppConstants.tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: AppConstants.tokenKey);
  }

  Future<void> deleteToken() async {
    await _secureStorage.delete(key: AppConstants.tokenKey);
  }

  // User data management (secure storage)
  Future<void> saveUser(User user) async {
    await _secureStorage.write(
      key: AppConstants.userKey, 
      value: json.encode(user.toJson()),
    );
  }

  Future<User?> getUser() async {
    final userData = await _secureStorage.read(key: AppConstants.userKey);
    if (userData != null) {
      return User.fromJson(json.decode(userData));
    }
    return null;
  }

  Future<void> deleteUser() async {
    await _secureStorage.delete(key: AppConstants.userKey);
  }

  // Password management (secure storage)
  Future<void> savePassword(String password) async {
    await _secureStorage.write(key: 'user_password', value: password);
  }

  Future<String?> getPassword() async {
    return await _secureStorage.read(key: 'user_password');
  }

  Future<void> deletePassword() async {
    await _secureStorage.delete(key: 'user_password');
  }

  // Clear all secure storage
  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
  }

  // Onboarding status (shared preferences)
  Future<void> setOnboardingComplete() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConstants.onboardingKey, true);
  }

  Future<bool> isOnboardingComplete() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(AppConstants.onboardingKey) ?? false;
  }
}

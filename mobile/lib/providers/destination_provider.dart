import 'package:flutter/foundation.dart';
import '../models/destination.dart';
import '../services/api_service.dart';

class DestinationProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  List<Destination> _destinations = [];
  bool _isLoading = false;
  String? _error;

  List<Destination> get destinations => _destinations;
  List<Destination> get availableDestinations => 
    _destinations.where((d) => d.status == 'available').toList();
  bool get isLoading => _isLoading;
  String? get error => _error;

  DateTime? _lastFetchTime;
  static const Duration _cacheDuration = Duration(minutes: 5);

  Future<void> fetchDestinations({bool forceRefresh = false}) async {
    // Check cache validity
    if (!forceRefresh && 
        _destinations.isNotEmpty && 
        _lastFetchTime != null && 
        DateTime.now().difference(_lastFetchTime!) < _cacheDuration) {
      return; // Return cached data
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _api.getDestinations();

      if (result['success']) {
        final data = result['data'];
        _destinations = (data['destinations'] as List)
            .map((d) => Destination.fromJson(d))
            .toList();
        _lastFetchTime = DateTime.now();
        _isLoading = false;
        notifyListeners();
      } else {
        _error = result['error'];
        _isLoading = false;
        notifyListeners();
      }
    } catch (e) {
      _error = 'Failed to fetch destinations: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  Destination? getDestinationById(String id) {
    try {
      return _destinations.firstWhere((d) => d.id == id);
    } catch (e) {
      return null;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

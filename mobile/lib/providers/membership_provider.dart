import 'package:flutter/foundation.dart';
import '../models/membership.dart';
import '../services/api_service.dart';

class MembershipProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  Membership? _membership;
  List<PlanConfig> _plans = [];
  bool _isLoading = false;
  String? _error;
  String _status = 'NONE'; // NONE, PENDING, ACTIVE, EXPIRED

  Membership? get membership => _membership;
  List<PlanConfig> get plans => _plans;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get status => _status;

  // State checks
  bool get hasMembership => _membership != null && _status != 'NONE';
  bool get isNoMembership => _membership == null || _status == 'NONE';
  bool get isPending => _status == 'PENDING';
  bool get isActive => _status == 'ACTIVE';
  bool get isExpired => _status == 'EXPIRED';

  DateTime? _lastFetchTime;
  static const Duration _cacheDuration = Duration(minutes: 5);

  Future<void> fetchMembership({bool forceRefresh = false}) async {
    // Check cache validity
    if (!forceRefresh && 
        _membership != null && 
        _lastFetchTime != null && 
        DateTime.now().difference(_lastFetchTime!) < _cacheDuration) {
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final result = await _api.getMembership();

      if (result['success']) {
        final data = result['data'];
        
        // Set status from response
        _status = data['status'] ?? 'NONE';
        
        if (data['membership'] != null) {
          _membership = Membership.fromJson(data['membership']);
          _status = _membership!.status.toUpperCase();
        } else {
          _membership = null;
          _status = 'NONE';
        }

        // Get available plans if present
        if (data['plans'] != null) {
          _plans = (data['plans'] as List)
              .map((p) => PlanConfig.fromJson(p))
              .toList();
        }

        _lastFetchTime = DateTime.now();
        _isLoading = false;
        notifyListeners();
      } else {
        _error = result['error'];
        _isLoading = false;
        notifyListeners();
      }
    } catch (e) {
      _error = 'Failed to fetch membership: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchPlans() async {
    try {
      final result = await _api.getPlans();
      if (result['success'] && result['data']['plans'] != null) {
        _plans = (result['data']['plans'] as List)
            .map((p) => PlanConfig.fromJson(p))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Failed to fetch plans: $e');
    }
  }

  Future<bool> choosePlan(String planType) async {
    _isLoading = true;
    _error = null;
    Future.microtask(() => notifyListeners());

    try {
      final result = await _api.choosePlan(planType);

      if (result['success']) {
        // Refetch membership to get updated state
        await fetchMembership();
        return true;
      } else {
        _error = result['error'];
        _isLoading = false;
        Future.microtask(() => notifyListeners());
        return false;
      }
    } catch (e) {
      _error = 'Failed to select plan: $e';
      _isLoading = false;
      Future.microtask(() => notifyListeners());
      return false;
    }
  }

  Future<bool> cancelMembership() async {
    _isLoading = true;
    _error = null;
    Future.microtask(() => notifyListeners());

    try {
      final result = await _api.cancelMembership();

      if (result['success']) {
        await fetchMembership();
        return true;
      } else {
        _error = result['error'];
        _isLoading = false;
        Future.microtask(() => notifyListeners());
        return false;
      }
    } catch (e) {
      _error = 'Failed to cancel membership: $e';
      _isLoading = false;
      Future.microtask(() => notifyListeners());
      return false;
    }
  }

  Future<bool> markPaymentDone({
    required String paymentMethod,
    String? transactionId,
    String? notes,
  }) async {
    _isLoading = true;
    _error = null;
    Future.microtask(() => notifyListeners());

    try {
      final result = await _api.markPaymentDone(
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        notes: notes,
      );

      if (result['success']) {
        await fetchMembership();
        return true;
      } else {
        _error = result['error'];
        _isLoading = false;
        Future.microtask(() => notifyListeners());
        return false;
      }
    } catch (e) {
      _error = 'Failed to record payment: $e';
      _isLoading = false;
      Future.microtask(() => notifyListeners());
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

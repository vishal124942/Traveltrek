import 'destination.dart';

class Membership {
  final String id;
  final String planType;
  final DateTime? startDate;
  final DateTime? endDate;
  final int totalDays;
  final int usedDays;
  final int remainingDays;
  final String status; // NONE, PENDING, ACTIVE, EXPIRED
  final String? paymentStatus; // UNPAID, PAID, FAILED
  final double? paymentAmount;
  final List<String>? customDestinations; // Admin-set destinations for this user

  Membership({
    required this.id,
    required this.planType,
    this.startDate,
    this.endDate,
    required this.totalDays,
    required this.usedDays,
    required this.remainingDays,
    required this.status,
    this.paymentStatus,
    this.paymentAmount,
    this.customDestinations,
  });

  factory Membership.fromJson(Map<String, dynamic> json) {
    return Membership(
      id: json['id'] ?? '',
      planType: json['planType'] ?? '1Y',
      startDate: json['startDate'] != null 
        ? DateTime.parse(json['startDate']) 
        : null,
      endDate: json['endDate'] != null 
        ? DateTime.parse(json['endDate']) 
        : null,
      totalDays: json['totalDays'] ?? 0,
      usedDays: json['usedDays'] ?? 0,
      remainingDays: json['remainingDays'] ?? json['totalDays'] ?? 0,
      status: json['status'] ?? 'NONE',
      paymentStatus: json['paymentStatus'],
      paymentAmount: json['paymentAmount']?.toDouble(),
      customDestinations: json['customDestinations'] != null 
        ? List<String>.from(json['customDestinations'])
        : null,
    );
  }

  String get planLabel {
    return planType == '1Y' ? '1-Year Membership' : '3-Year Membership';
  }

  String get statusLabel {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'Active';
      case 'PENDING':
        return 'Pending Activation';
      case 'EXPIRED':
        return 'Expired';
      default:
        return 'No Membership';
    }
  }

  String get paymentStatusLabel {
    switch (paymentStatus?.toUpperCase()) {
      case 'PAID':
        return 'Paid';
      case 'UNPAID':
        return 'Pending Payment';
      case 'FAILED':
        return 'Payment Failed';
      default:
        return 'Unknown';
    }
  }

  bool get isActive => status.toUpperCase() == 'ACTIVE';
  bool get isPending => status.toUpperCase() == 'PENDING';
  bool get isExpired => status.toUpperCase() == 'EXPIRED';
  bool get isPaid => paymentStatus?.toUpperCase() == 'PAID';
}

class PlanConfig {
  final String id;
  final String planType;
  final String name;
  final String? description;
  final int days;
  final double price;
  final bool isActive;
  final List<Destination>? destinations;

  PlanConfig({
    required this.id,
    required this.planType,
    required this.name,
    this.description,
    required this.days,
    required this.price,
    required this.isActive,
    this.destinations,
  });

  factory PlanConfig.fromJson(Map<String, dynamic> json) {
    return PlanConfig(
      id: json['id'] ?? '',
      planType: json['planType'] ?? '1Y',
      name: json['name'] ?? '',
      description: json['description'],
      days: json['days'] ?? 0,
      price: (json['price'] ?? 0).toDouble(),
      isActive: json['isActive'] ?? true,
      destinations: json['destinations'] != null
          ? (json['destinations'] as List).map((d) => Destination.fromJson(d)).toList()
          : null,
    );
  }
}

class Destination {
  final String id;
  final String name;
  final String? description;
  final int durationDays;
  final List<String> bestMonths;
  final String difficulty;
  final String status;
  final String? imageUrl;

  Destination({
    required this.id,
    required this.name,
    this.description,
    required this.durationDays,
    required this.bestMonths,
    required this.difficulty,
    required this.status,
    this.imageUrl,
  });

  factory Destination.fromJson(Map<String, dynamic> json) {
    List<String> months = [];
    if (json['bestMonths'] is List) {
      months = List<String>.from(json['bestMonths']);
    } else if (json['bestMonths'] is String) {
      months = List<String>.from(
        (json['bestMonths'] as String).isNotEmpty 
          ? (json['bestMonths'] as String).split(',') 
          : []
      );
    }

    return Destination(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      durationDays: json['durationDays'] ?? 0,
      bestMonths: months,
      difficulty: json['difficulty'] ?? 'easy',
      status: json['status'] ?? 'available',
      imageUrl: json['imageUrl'],
    );
  }

  String get difficultyLabel {
    switch (difficulty) {
      case 'easy':
        return 'Easy';
      case 'moderate':
        return 'Moderate';
      case 'difficult':
        return 'Difficult';
      default:
        return difficulty;
    }
  }

  String get statusLabel {
    switch (status) {
      case 'available':
        return 'Available';
      case 'not_available':
        return 'Not Available';
      case 'coming_soon':
        return 'Coming Soon';
      default:
        return status;
    }
  }

  bool get isAvailable => status == 'available';

  String get bestMonthsText => bestMonths.join(', ');
}

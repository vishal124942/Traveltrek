class AppConstants {
  // API Configuration
  static const String apiBaseUrl = 'http://localhost:3000/api';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String onboardingKey = 'onboarding_complete';
  
  // Company Info
  static const String companyName = 'TravelTrek';
  static const String tagline = 'Journey Beyond Boundaries';
  static const String supportEmail = 'support@traveltrek.com';
  static const String supportPhone = '+91-9876543210';
  
  // Membership Plans
  static const Map<String, int> membershipDays = {
    '1Y': 6,
    '3Y': 18,
  };
  
  static const Map<String, String> membershipLabels = {
    '1Y': '1-Year Membership',
    '3Y': '3-Year Membership',
  };
  
  // Difficulty Labels
  static const Map<String, String> difficultyLabels = {
    'easy': 'Easy',
    'moderate': 'Moderate',
    'difficult': 'Difficult',
  };
  
  // Status Labels
  static const Map<String, String> statusLabels = {
    'available': 'Available',
    'not_available': 'Not Available',
    'coming_soon': 'Coming Soon',
  };
  
  // Membership Status
  static const Map<String, String> membershipStatusLabels = {
    'active': 'Active',
    'inactive': 'Inactive',
    'expired': 'Expired',
  };
}

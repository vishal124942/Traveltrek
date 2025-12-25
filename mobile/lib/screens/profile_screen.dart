import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../config/constants.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _api = ApiService();
  final StorageService _storage = StorageService();
  bool _isLoading = false;

  Future<void> _showEditDialog(String field, String currentValue) async {
    final controller = TextEditingController(text: currentValue);
    final otpController = TextEditingController();
    bool showOtpField = false;
    bool isVerifying = false;

    // Only phone requires OTP verification
    final bool requiresOtp = field == 'phone';

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            top: 20,
            left: 20,
            right: 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Edit ${field.capitalize()}',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                requiresOtp 
                    ? (showOtpField ? 'Enter the OTP sent to your email' : 'An OTP will be sent to your registered email')
                    : 'Update your ${field.toLowerCase()}',
                style: TextStyle(fontSize: 14, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 24),
              
              // Input field (hide when showing OTP for phone)
              if (!showOtpField) ...[
                TextField(
                  controller: controller,
                  keyboardType: field == 'email' 
                      ? TextInputType.emailAddress 
                      : field == 'phone' 
                          ? TextInputType.phone 
                          : TextInputType.name,
                  decoration: InputDecoration(
                    labelText: 'New ${field.capitalize()}',
                    prefixIcon: Icon(
                      field == 'email' ? Icons.email_outlined 
                          : field == 'phone' ? Icons.phone_outlined 
                          : Icons.person_outline,
                      color: AppTheme.primaryColor,
                    ),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                    ),
                  ),
                ),
              ],
              
              // OTP field (only for phone after OTP is sent)
              if (showOtpField) ...[
                TextField(
                  controller: otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  autofocus: true,
                  decoration: InputDecoration(
                    labelText: 'Enter OTP',
                    prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.primaryColor),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                    ),
                    counterText: '',
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Check your registered email for the verification code',
                  style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                ),
              ],
              const SizedBox(height: 24),
              
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: isVerifying ? null : () async {
                    // Direct update for name and email
                    if (!requiresOtp) {
                      if (controller.text.trim().isEmpty) {
                        _showErrorSnackbar('Please enter a value');
                        return;
                      }
                      
                      setModalState(() => isVerifying = true);
                      final result = await _api.updateProfile(
                        name: field == 'name' ? controller.text.trim() : null,
                        email: field == 'email' ? controller.text.trim() : null,
                      );
                      setModalState(() => isVerifying = false);
                      
                      if (result['success']) {
                        await context.read<AuthProvider>().refreshProfile();
                        if (mounted) {
                          Navigator.pop(ctx);
                          _showSuccessSnackbar('${field.capitalize()} updated successfully!');
                        }
                      } else {
                        _showErrorSnackbar(result['error'] ?? 'Failed to update');
                      }
                    } 
                    // Phone requires OTP
                    else {
                      if (!showOtpField) {
                        // Step 1: Request OTP
                        if (controller.text.trim().isEmpty) {
                          _showErrorSnackbar('Please enter a phone number');
                          return;
                        }
                        
                        setModalState(() => isVerifying = true);
                        final result = await _api.requestProfileChange(
                          field: 'phone',
                          newValue: controller.text.trim(),
                        );
                        setModalState(() => isVerifying = false);
                        
                        if (result['success']) {
                          setModalState(() => showOtpField = true);
                          _showSuccessSnackbar('OTP sent to your registered email!');
                        } else {
                          _showErrorSnackbar(result['error'] ?? 'Failed to send OTP');
                        }
                      } else {
                        // Step 2: Verify OTP and update phone
                        if (otpController.text.trim().isEmpty) {
                          _showErrorSnackbar('Please enter the OTP');
                          return;
                        }
                        
                        setModalState(() => isVerifying = true);
                        final result = await _api.verifyProfileChange(
                          field: 'phone',
                          newValue: controller.text.trim(),
                          otp: otpController.text.trim(),
                        );
                        setModalState(() => isVerifying = false);
                        
                        print('DEBUG: verifyProfileChange result: $result');
                        
                        if (result['success']) {
                          await context.read<AuthProvider>().refreshProfile();
                          if (mounted) {
                            Navigator.pop(ctx);
                            _showSuccessSnackbar('Phone number updated successfully!');
                          }
                        } else {
                          _showErrorSnackbar(result['error'] ?? 'Invalid or expired OTP');
                        }
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: isVerifying
                      ? const SizedBox(
                          width: 24, height: 24,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          showOtpField ? 'Verify & Update' : (requiresOtp ? 'Send OTP' : 'Update'),
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  void _showSuccessSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _showErrorSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppTheme.errorColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Future<void> _showChangePasswordDialog() async {
    final passwordController = TextEditingController();
    final confirmController = TextEditingController();
    final otpController = TextEditingController();
    bool showOtpField = false;
    bool isVerifying = false;
    bool obscurePassword = true;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            top: 20,
            left: 20,
            right: 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Change Password',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                showOtpField 
                    ? 'Enter the OTP sent to your email'
                    : 'An OTP will be sent to your registered email',
                style: TextStyle(fontSize: 14, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 24),
              if (!showOtpField) ...[
                TextField(
                  controller: passwordController,
                  obscureText: obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'New Password',
                    prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.primaryColor),
                    suffixIcon: IconButton(
                      icon: Icon(obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                      onPressed: () => setModalState(() => obscurePassword = !obscurePassword),
                    ),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: confirmController,
                  obscureText: obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Confirm Password',
                    prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.primaryColor),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                    ),
                  ),
                ),
              ] else ...[
                TextField(
                  controller: otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  decoration: InputDecoration(
                    labelText: 'Enter OTP',
                    prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.primaryColor),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                    ),
                    counterText: '',
                  ),
                ),
              ],
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: isVerifying ? null : () async {
                    if (!showOtpField) {
                      // Validate passwords
                      if (passwordController.text.length < 6) {
                        _showErrorSnackbar('Password must be at least 6 characters');
                        return;
                      }
                      if (passwordController.text != confirmController.text) {
                        _showErrorSnackbar('Passwords do not match');
                        return;
                      }
                      
                      // Request OTP
                      setModalState(() => isVerifying = true);
                      final result = await _api.requestPasswordChange(
                        newPassword: passwordController.text,
                      );
                      setModalState(() => isVerifying = false);
                      
                      if (result['success']) {
                        setModalState(() => showOtpField = true);
                        _showSuccessSnackbar('OTP sent to your registered email!');
                      } else {
                        _showErrorSnackbar(result['error'] ?? 'Failed to send OTP');
                      }
                    } else {
                      // Verify OTP and change password
                      setModalState(() => isVerifying = true);
                      final result = await _api.verifyPasswordChange(
                        otp: otpController.text.trim(),
                      );
                      setModalState(() => isVerifying = false);
                      
                      if (result['success']) {
                        // Save new password to secure storage
                        await _storage.savePassword(passwordController.text);
                        // Update local state to show it immediately
                        if (mounted) {
                          Navigator.pop(ctx);
                          _showSuccessSnackbar('Password changed successfully!');
                        }
                      } else {
                        _showErrorSnackbar(result['error'] ?? 'Verification failed');
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: isVerifying
                      ? const SizedBox(
                          width: 24, height: 24,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          showOtpField ? 'Verify & Change Password' : 'Send OTP',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: AppTheme.backgroundColor,
        elevation: 0,
      ),
      body: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          final user = auth.user;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                // Profile Avatar
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryColor.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      user?.name.isNotEmpty == true
                          ? user!.name[0].toUpperCase()
                          : '?',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 40,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  user?.name ?? 'User',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user?.email ?? '',
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 40),

                // Profile Info Card - Editable
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 15,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      _buildEditableInfoRow(
                        icon: Icons.person_outline,
                        label: 'Name',
                        value: user?.name ?? '',
                        onEdit: () => _showEditDialog('name', user?.name ?? ''),
                      ),
                      const Divider(height: 24),
                      _buildEditableInfoRow(
                        icon: Icons.email_outlined,
                        label: 'Email',
                        value: user?.email ?? '',
                        onEdit: () => _showEditDialog('email', user?.email ?? ''),
                      ),
                      const Divider(height: 24),
                      _buildEditableInfoRow(
                        icon: Icons.phone_outlined,
                        label: 'Phone',
                        value: user?.phone ?? '',
                        onEdit: () => _showEditDialog('phone', user?.phone ?? ''),
                      ),
                      const Divider(height: 24),
                      _buildPasswordRow(),
                    ],
                  ),
                ),
                const SizedBox(height: 30),

                // Support Section
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Support',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildContactRow(Icons.email, 'Email', AppConstants.supportEmail),
                      const SizedBox(height: 12),
                      _buildContactRow(Icons.phone, 'Phone', AppConstants.supportPhone),
                    ],
                  ),
                ),
                const SizedBox(height: 30),

                // Logout Button
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: OutlinedButton.icon(
                    onPressed: () => _showLogoutDialog(context, auth),
                    icon: const Icon(Icons.logout, color: AppTheme.errorColor),
                    label: const Text(
                      'Logout',
                      style: TextStyle(color: AppTheme.errorColor),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppTheme.errorColor),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 30),

                // App Version
                Text(
                  '${AppConstants.companyName} v1.0.0',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.textMuted,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildEditableInfoRow({
    required IconData icon,
    required String label,
    required String value,
    required VoidCallback onEdit,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppTheme.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: AppTheme.primaryColor, size: 20),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
        IconButton(
          onPressed: onEdit,
          icon: const Icon(Icons.edit_outlined, size: 20),
          color: AppTheme.primaryColor,
          tooltip: 'Edit $label',
        ),
      ],
    );
  }

  Widget _buildPasswordRow() {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppTheme.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.lock_outline, color: AppTheme.primaryColor, size: 20),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Password', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
              const SizedBox(height: 2),
              Text(
                '••••••••',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ),
        // Edit button
        IconButton(
          onPressed: () => _showChangePasswordDialog(),
          icon: const Icon(Icons.edit_outlined, size: 20),
          color: AppTheme.primaryColor,
          tooltip: 'Change Password',
        ),
      ],
    );
  }

  Widget _buildContactRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primaryColor, size: 20),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
            Text(value, style: const TextStyle(fontSize: 14, color: AppTheme.primaryColor)),
          ],
        ),
      ],
    );
  }

  void _showLogoutDialog(BuildContext context, AuthProvider auth) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await auth.logout();
              if (context.mounted) context.go('/login');
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.errorColor),
            child: const Text('Logout', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

// Extension for capitalizing strings
extension StringExtension on String {
  String capitalize() => isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';
}

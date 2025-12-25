import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/theme.dart';
import '../config/constants.dart';
import '../providers/auth_provider.dart';
import '../providers/membership_provider.dart';
import '../providers/destination_provider.dart';
import '../models/membership.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Defer data loading to after the first frame to avoid setState during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    final membershipProvider = context.read<MembershipProvider>();
    final destinationProvider = context.read<DestinationProvider>();
    
    await Future.wait([
      membershipProvider.fetchMembership(),
      destinationProvider.fetchDestinations(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final membershipProvider = context.watch<MembershipProvider>();
    final destinationProvider = context.watch<DestinationProvider>();

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Welcome Header
                  _buildWelcomeHeader(authProvider),
                  const SizedBox(height: 30),

                  // Membership Section - Based on State
                  _buildMembershipSection(membershipProvider),
                  const SizedBox(height: 30),

                  // Show destinations only for ACTIVE members
                  if (membershipProvider.isActive) ...[
                    _buildDestinationsSection(destinationProvider),
                    const SizedBox(height: 30),
                  ],

                  // Quick Actions
                  _buildQuickActionsSection(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeHeader(AuthProvider authProvider) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome ${authProvider.user?.name.split(' ').first ?? ''} 👋',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Ready for your next adventure?',
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
        GestureDetector(
          onTap: () {
            // Navigate to profile tab (index 4)
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const ProfileScreen()),
            );
          },
          child: Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(15),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryColor.withOpacity(0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: Text(
                authProvider.user?.name.isNotEmpty == true
                    ? authProvider.user!.name[0].toUpperCase()
                    : '?',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMembershipSection(MembershipProvider provider) {
    if (provider.isLoading) {
      return Container(
        height: 180,
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Center(
          child: CircularProgressIndicator(color: Colors.white),
        ),
      );
    }

    // STATE A: NO MEMBERSHIP
    if (provider.isNoMembership) {
      return _buildNoMembershipCard(provider);
    }

    // STATE B: PENDING
    if (provider.isPending) {
      return _buildPendingCard(provider);
    }

    // STATE C: ACTIVE
    if (provider.isActive) {
      return _buildActiveMembershipCard(provider);
    }

    // STATE D: EXPIRED
    if (provider.isExpired) {
      return _buildExpiredCard(provider);
    }

    return _buildNoMembershipCard(provider);
  }

  // STATE A: No Membership - Show Plan Selection
  Widget _buildNoMembershipCard(MembershipProvider provider) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Choose Your Membership',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'You don\'t have an active membership. Choose a plan to get started.',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 24),
          
          // Plan buttons
          if (provider.plans.isNotEmpty) ...[
            for (final plan in provider.plans)
              _buildPlanButton(plan, provider),
          ] else ...[
            _buildDefaultPlanButtons(provider),
          ],
        ],
      ),
    );
  }

  Widget _buildPlanButton(PlanConfig plan, MembershipProvider provider) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
        onTap: provider.isLoading ? null : () => _selectPlan(plan, provider),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: plan.planType == '3Y' ? AppTheme.primaryGradient : null,
              color: plan.planType == '3Y' ? null : AppTheme.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: plan.planType == '1Y' ? Border.all(color: AppTheme.primaryColor) : null,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      plan.name,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: plan.planType == '3Y' ? Colors.white : AppTheme.primaryColor,
                      ),
                    ),
                    Text(
                      '${plan.days} travel days',
                      style: TextStyle(
                        fontSize: 12,
                        color: plan.planType == '3Y' ? Colors.white70 : AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
                Text(
                  '₹${plan.price.toStringAsFixed(0)}',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: plan.planType == '3Y' ? Colors.white : AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDefaultPlanButtons(MembershipProvider provider) {
    return Column(
      children: [
        _buildSimplePlanButton('1Y', '1-Year Membership', '6 days', provider),
        const SizedBox(height: 12),
        _buildSimplePlanButton('3Y', '3-Year Membership', '18 days', provider, isPrimary: true),
      ],
    );
  }

  Widget _buildSimplePlanButton(String planType, String name, String days, MembershipProvider provider, {bool isPrimary = false}) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: provider.isLoading ? null : () {
          final dummyPlan = PlanConfig(
            id: 'dummy_$planType',
            planType: planType,
            name: name,
            days: int.tryParse(days.split(' ')[0]) ?? 0,
            price: planType == '1Y' ? 15000 : 40000,
            isActive: true,
            description: 'Enjoy full access to all features and destinations.',
            destinations: [],
          );
          _selectPlan(dummyPlan, provider);
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: isPrimary ? AppTheme.primaryGradient : null,
            color: isPrimary ? null : AppTheme.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: !isPrimary ? Border.all(color: AppTheme.primaryColor) : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isPrimary ? Colors.white : AppTheme.primaryColor,
                    ),
                  ),
                  Text(
                    days,
                    style: TextStyle(
                      fontSize: 12,
                      color: isPrimary ? Colors.white70 : AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: isPrimary ? Colors.white : AppTheme.primaryColor,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _selectPlan(PlanConfig plan, MembershipProvider provider) {
    _showPlanDetailsDialog(plan, provider);
  }

  void _showPlanDetailsDialog(PlanConfig plan, MembershipProvider provider) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
        ),
        child: Column(
          children: [
            // Header
            Container(
              height: 150,
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: plan.planType == '3Y' ? AppTheme.primaryGradient : null,
                color: plan.planType == '3Y' ? null : AppTheme.primaryColor.withOpacity(0.1),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(25)),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      plan.name,
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: plan.planType == '3Y' ? Colors.white : AppTheme.primaryColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${plan.days} Days of Travel',
                      style: TextStyle(
                        fontSize: 16,
                        color: plan.planType == '3Y' ? Colors.white70 : AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Price
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Price', style: TextStyle(fontSize: 18, color: AppTheme.textSecondary)),
                        Text(
                          '₹${plan.price.toStringAsFixed(0)}',
                          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                        ),
                      ],
                    ),
                    const Divider(height: 32),
                    
                    // Description
                    if (plan.description != null && plan.description!.isNotEmpty) ...[
                      const Text('Description', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(plan.description!, style: const TextStyle(fontSize: 16, color: AppTheme.textSecondary, height: 1.5)),
                      const SizedBox(height: 24),
                    ],

                    // Destinations
                    if (plan.destinations != null && plan.destinations!.isNotEmpty) ...[
                      const Text('Included Destinations', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: plan.destinations!.map((d) => Chip(
                          label: Text(d.name),
                          backgroundColor: AppTheme.primaryColor.withOpacity(0.05),
                          labelStyle: const TextStyle(color: AppTheme.primaryColor),
                        )).toList(),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ],
                ),
              ),
            ),
            // Footer Buttons
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: Colors.grey),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Cancel', style: TextStyle(color: Colors.black)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _processPlanSelection(plan.planType, provider);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Confirm & Pay', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _processPlanSelection(String planType, MembershipProvider provider) async {
    final success = await provider.choosePlan(planType);
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Plan selected! Please complete payment.'),
          backgroundColor: AppTheme.successColor,
        ),
      );
    } else if (provider.error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.error!),
          backgroundColor: AppTheme.errorColor,
        ),
      );
      provider.clearError();
    }
  }

  // STATE B: Pending - Show Waiting Card
  Widget _buildPendingCard(MembershipProvider provider) {
    final membership = provider.membership;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.orange.shade400,
            Colors.orange.shade600,
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.orange.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Membership',
                style: TextStyle(color: Colors.white70, fontSize: 14),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  '🟡 PENDING',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            membership?.planLabel ?? 'Selected Plan',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    const Icon(Icons.payment, color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Payment: ${membership?.paymentStatusLabel ?? 'Pending'}',
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                    ),
                  ],
                ),
                if (membership?.paymentAmount != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.currency_rupee, color: Colors.white, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Amount: ₹${membership!.paymentAmount!.toStringAsFixed(0)}',
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            '⏳ Our team is verifying your membership. You will be notified once activated.',
            style: TextStyle(color: Colors.white70, fontSize: 13),
          ),
          
          // Mark Payment Done button (if UNPAID)
          if (membership?.paymentStatus?.toUpperCase() == 'UNPAID') ...[
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _cancelMembership(provider),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white.withOpacity(0.2),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: const Text('Cancel Request', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () => _showPaymentDialog(provider),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.orange,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Mark Payment Done', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _cancelMembership(MembershipProvider provider) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel Request?'),
        content: const Text('Are you sure you want to cancel your membership request?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Yes')),
        ],
      ),
    );

    if (confirmed == true) {
      final success = await provider.cancelMembership();
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Request cancelled'), backgroundColor: AppTheme.successColor),
        );
      } else if (provider.error != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(provider.error!), backgroundColor: AppTheme.errorColor),
        );
      }
    }
  }

  void _showPaymentDialog(MembershipProvider provider) {
    String selectedMethod = 'UPI';
    final transactionController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Payment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Select payment method and enter transaction ID:'),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: selectedMethod,
              items: ['UPI', 'CARD', 'NETBANKING', 'CASH'].map((m) => 
                DropdownMenuItem(value: m, child: Text(m))
              ).toList(),
              onChanged: (v) => selectedMethod = v ?? 'UPI',
              decoration: const InputDecoration(labelText: 'Payment Method'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: transactionController,
              decoration: const InputDecoration(
                labelText: 'Transaction ID (optional)',
                hintText: 'e.g., UPI ref number',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await provider.markPaymentDone(
                paymentMethod: selectedMethod,
                transactionId: transactionController.text.isNotEmpty ? transactionController.text : null,
              );
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success 
                      ? 'Payment recorded! Awaiting activation.' 
                      : provider.error ?? 'Failed to record payment'),
                    backgroundColor: success ? AppTheme.successColor : AppTheme.errorColor,
                  ),
                );
              }
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }

  // STATE C: Active Membership Card
  Widget _buildActiveMembershipCard(MembershipProvider provider) {
    final membership = provider.membership;
    final remainingDays = membership?.remainingDays ?? 0;
    final totalDays = membership?.totalDays ?? 0;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryColor.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Membership',
                style: TextStyle(color: Colors.white70, fontSize: 14),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  '✓ ACTIVE',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            membership?.planLabel ?? 'Membership',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildMembershipStat('Remaining', '$remainingDays days'),
              _buildMembershipStat('Total', '$totalDays days'),
              _buildMembershipStat('Used', '${membership?.usedDays ?? 0} days'),
            ],
          ),
          if (membership?.endDate != null) ...[
            const SizedBox(height: 16),
            Text(
              'Valid till: ${_formatDate(membership!.endDate!)}',
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }

  // STATE D: Expired Card
  Widget _buildExpiredCard(MembershipProvider provider) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.grey.shade700,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Membership', style: TextStyle(color: Colors.white70)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'EXPIRED',
                  style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Your membership has expired',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Renew your membership to continue traveling.',
            style: TextStyle(color: Colors.white70, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildMembershipStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  Widget _buildDestinationsSection(DestinationProvider provider) {
    // Get membership to check if user has custom destinations
    final membershipProvider = context.read<MembershipProvider>();
    final membership = membershipProvider.membership;
    
    // Filter destinations based on membership
    List destinations;
    String sectionTitle;
    
    if (membership != null && membership.isActive && membership.customDestinations != null && membership.customDestinations!.isNotEmpty) {
      // User is enrolled - show only their allowed destinations
      destinations = provider.availableDestinations.where((d) => 
        membership.customDestinations!.any((name) => 
          d.name.toLowerCase().contains(name.toLowerCase()) || 
          name.toLowerCase().contains(d.name.toLowerCase())
        )
      ).toList();
      sectionTitle = 'Your Destinations';
    } else {
      // Not enrolled or no custom destinations - show featured destinations
      destinations = provider.availableDestinations.take(4).toList();
      sectionTitle = 'Featured Destinations';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              sectionTitle,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
            ),
            TextButton(onPressed: () {}, child: const Text('See All')),
          ],
        ),
        const SizedBox(height: 16),
        if (destinations.isEmpty)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Center(
              child: Text(
                'No destinations assigned yet.\nContact support for assistance.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
            ),
          )
        else
          SizedBox(
            height: 220,
            child: provider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: destinations.length,
                    itemBuilder: (context, index) {
                      final destination = destinations[index];
                      return _buildDestinationCard(destination);
                    },
                  ),
          ),
      ],
    );
  }

  Widget _buildDestinationCard(destination) {
    return Container(
      width: 180,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 15, offset: const Offset(0, 5))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: destination.imageUrl != null
                ? CachedNetworkImage(
                    imageUrl: destination.imageUrl!,
                    height: 120,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(height: 120, color: Colors.grey[200]),
                    errorWidget: (_, __, ___) => Container(height: 120, color: Colors.grey[200], child: const Icon(Icons.image)),
                  )
                : Container(height: 120, color: Colors.grey[200], child: const Center(child: Text('🏔️', style: TextStyle(fontSize: 40)))),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(destination.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Text('${destination.durationDays} days', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Need Help?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
        const SizedBox(height: 16),
        Material(
          color: AppTheme.primaryColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            onTap: () async {
              final Uri emailUri = Uri(
                scheme: 'mailto',
                path: AppConstants.supportEmail,
              );
              if (await canLaunchUrl(emailUri)) {
                await launchUrl(emailUri);
              } else {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Email: ${AppConstants.supportEmail}'),
                      action: SnackBarAction(
                        label: 'Copy',
                        onPressed: () {
                          // Copy email to clipboard
                        },
                      ),
                    ),
                  );
                }
              }
            },
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.mail_outline, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Contact Support', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textPrimary)),
                        const SizedBox(height: 4),
                        Text(AppConstants.supportEmail, style: TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
                      ],
                    ),
                  ),
                  Icon(Icons.arrow_forward_ios, color: AppTheme.primaryColor, size: 18),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

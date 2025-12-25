import 'package:flutter/foundation.dart';
import '../models/chat_message.dart';
import '../services/api_service.dart';

class ChatProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  List<ChatMessage> _messages = [];
  bool _isLoading = false;
  bool _isSending = false;
  String? _error;

  List<ChatMessage> get messages => _messages;
  bool get isLoading => _isLoading;
  bool get isSending => _isSending;
  String? get error => _error;

  Future<void> fetchChatHistory() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _api.getChatHistory();

      if (result['success']) {
        final data = result['data'];
        _messages = (data['messages'] as List)
            .map((m) => ChatMessage.fromJson(m))
            .toList();
        _isLoading = false;
        notifyListeners();
      } else {
        _error = result['error'];
        _isLoading = false;
        notifyListeners();
      }
    } catch (e) {
      _error = 'Failed to fetch chat history: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> sendMessage(String content) async {
    _isSending = true;
    _error = null;
    
    // Add user message immediately
    final userMessage = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      role: 'user',
      content: content,
      createdAt: DateTime.now(),
    );
    _messages.add(userMessage);
    notifyListeners();

    try {
      // Add placeholder assistant message
      final assistantMessage = ChatMessage(
        id: 'temp_${DateTime.now().millisecondsSinceEpoch}',
        role: 'assistant',
        content: '',
        createdAt: DateTime.now(),
      );
      _messages.add(assistantMessage);
      notifyListeners();

      // Stream response
      await for (final chunk in _api.sendMessageStream(content)) {
        final lastIndex = _messages.length - 1;
        if (lastIndex >= 0 && _messages[lastIndex].role == 'assistant') {
          final currentContent = _messages[lastIndex].content;
          _messages[lastIndex] = ChatMessage(
            id: _messages[lastIndex].id,
            role: 'assistant',
            content: currentContent + chunk,
            createdAt: _messages[lastIndex].createdAt,
          );
          notifyListeners();
        }
      }

      _isSending = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to send message: $e';
      // Remove empty assistant message if failed
      if (_messages.isNotEmpty && _messages.last.role == 'assistant' && _messages.last.content.isEmpty) {
        _messages.removeLast();
      }
      _isSending = false;
      notifyListeners();
    }
  }

  Future<bool> clearChatHistory() async {
    try {
      final result = await _api.clearChatHistory();
      if (result['success']) {
        _messages = [];
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  void clearMessages() {
    _messages = [];
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

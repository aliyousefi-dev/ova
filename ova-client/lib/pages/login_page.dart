import 'package:flutter/material.dart';
import '../api/login_api.dart';
import 'loading_indicator.dart';
import 'error_message.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  String _serverIp = '192.168.164.100:8080';
  bool _loading = false;
  String? _errorText;
  bool _loginSuccess = false; // Track login success
  String? _sessionId; // Store session cookie string

  late LoginAPI _apiService;

  @override
  void initState() {
    super.initState();
    _apiService = LoginAPI(serverIp: _serverIp);
  }

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _errorText = null;
      _loginSuccess = false;
      _sessionId = null;
    });

    try {
      bool success = await _apiService.login(
        _usernameController.text,
        _passwordController.text,
      );
      setState(() => _loading = false);

      if (success) {
        setState(() {
          _loginSuccess = true;
          _sessionId = _apiService.sessionCookie;
        });
      } else {
        setState(() {
          _errorText = 'Invalid username or password.';
        });
      }
    } catch (e) {
      setState(() {
        _errorText = e.toString();
      });
    }
  }

  Future<void> _showSettingsDialog() async {
    final TextEditingController ipController = TextEditingController(
      text: _serverIp,
    );

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Server IP Settings'),
        content: TextField(
          controller: ipController,
          decoration: const InputDecoration(
            labelText: 'Server IP and Port',
            hintText: 'e.g., 10.0.2.2:5000 or 192.168.1.100:5000',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _serverIp = ipController.text.trim();
                _apiService = LoginAPI(serverIp: _serverIp);
              });
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        title: const Text('Login'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: _showSettingsDialog,
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_loading) const LoadingIndicator(),
              if (_loading) const SizedBox(height: 16),

              if (_loginSuccess && _sessionId != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blueAccent),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.vpn_key, color: Colors.blue),
                          SizedBox(width: 8),
                          Text(
                            'Session ID:',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.blue,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      SelectableText(
                        _sessionId!,
                        style: const TextStyle(fontSize: 14),
                      ),
                    ],
                  ),
                ),

              if (_loginSuccess) const SizedBox(height: 16),

              if (_errorText != null) ...[
                ErrorMessage(_errorText!),
                const SizedBox(height: 16),
              ],
              TextField(
                controller: _usernameController,
                decoration: const InputDecoration(
                  labelText: 'Username',
                  filled: true,
                  fillColor: Colors.white10,
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  filled: true,
                  fillColor: Colors.white10,
                ),
                obscureText: true,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _login,
                  child: const Text('Login'),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Current Server: $_serverIp',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

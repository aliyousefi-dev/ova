import 'dart:convert';
import 'package:http/http.dart' as http;

class LoginAPI {
  final String serverIp;
  String? sessionCookie; // store session cookie here

  LoginAPI({required this.serverIp});

  Future<bool> login(String username, String password) async {
    final url = Uri.parse('http://$serverIp/api/v1/login');

    try {
      final response = await http
          .post(url, body: {'username': username, 'password': password})
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        // Extract session cookie from headers
        final rawCookie = response.headers['set-cookie'];
        if (rawCookie != null) {
          final cookieParts = rawCookie.split(';');
          final sessionPart = cookieParts.firstWhere(
            (part) => part.trim().startsWith('session='),
            orElse: () => '',
          );
          if (sessionPart.isNotEmpty) {
            sessionCookie = sessionPart.trim();
            print('Session cookie: $sessionCookie');
          }
        }

        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        if (jsonResponse['success'] == true) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (_) {
      throw Exception('Server not reachable');
    }
  }

  // Example of how to use the saved cookie in future requests:
  Future<http.Response> getProtectedData() async {
    final url = Uri.parse('http://$serverIp/api/v1/protected-data');
    final headers = <String, String>{};
    if (sessionCookie != null) {
      headers['Cookie'] = sessionCookie!;
    }
    return await http.get(url, headers: headers);
  }
}

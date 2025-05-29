import 'package:flutter/material.dart';
import 'package:ova_mobile/pages/main_page.dart';
import 'package:ova_mobile/pages/login_page.dart';
import 'theme.dart'; // import your theme definitions

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Login Demo',
      debugShowCheckedModeBanner: false,
      theme: darkTheme, // ✅ Only use dark theme
      home: const LoginPage(),
    );
  }
}

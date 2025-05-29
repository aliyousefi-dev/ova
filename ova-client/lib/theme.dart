import 'package:flutter/material.dart';

final ThemeData darkTheme = ThemeData(
  brightness: Brightness.dark,
  useMaterial3: true,

  // Use near-true black for AMOLED screens
  scaffoldBackgroundColor: Colors.black,

  colorScheme: const ColorScheme(
    brightness: Brightness.dark,
    primary: Color.fromARGB(255, 255, 10, 10),
    onPrimary: Colors.white,
    secondary: Color(0xFF8AB4F8),
    onSecondary: Colors.white,
    surface: Color.fromARGB(255, 9, 9, 9), // Keep surface slightly lifted
    onSurface: Colors.white70,
    error: Color(0xFFFF453A),
    onError: Colors.white,
  ),

  appBarTheme: const AppBarTheme(
    backgroundColor: Color(0xFF121212), // Slight lift
    foregroundColor: Colors.white70,
    elevation: 0,
  ),

  bottomNavigationBarTheme: const BottomNavigationBarThemeData(
    backgroundColor: Color(0xFF121212),
    selectedItemColor: Color.fromARGB(255, 255, 10, 10),
    unselectedItemColor: Colors.white38,
  ),

  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: const Color(0xFF1A1A1A), // Closer to black but still distinct
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide.none,
    ),
    hintStyle: const TextStyle(color: Colors.white54),
  ),

  textTheme: const TextTheme(
    bodyLarge: TextStyle(
      fontSize: 16,
      fontWeight: FontWeight.w500,
      color: Colors.white,
    ),
    bodyMedium: TextStyle(fontSize: 14, color: Colors.white70),
  ),
);

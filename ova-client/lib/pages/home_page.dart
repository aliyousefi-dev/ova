import 'package:flutter/material.dart';
import 'package:ova_mobile/pages/tabs/collections_tab.dart' as collections_tab;
import 'package:ova_mobile/pages/tabs/saved_tab.dart' as saved_page;
import 'package:ova_mobile/pages/tabs/status_tab.dart' as status_tab;
import 'package:ova_mobile/widgets/SquareIconButton.dart'; // Import your custom button

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  void _openPage(BuildContext context, Widget page) {
    Navigator.push(context, MaterialPageRoute(builder: (context) => page));
  }

  void _logout(BuildContext context) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Logged out')));
    // Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    final logoutButtonStyle = TextButton.styleFrom(
      foregroundColor: Theme.of(context).colorScheme.error,
      textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
    );

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 40), // margin from top
            const Center(
              child: Text(
                'Home',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                mainAxisSpacing: 24,
                crossAxisSpacing: 24,
                padding: const EdgeInsets.all(24),
                children: [
                  SquareIconButton(
                    icon: Icons.bookmark,
                    label: 'Saved',
                    onPressed: () =>
                        _openPage(context, const saved_page.SavedTab()),
                  ),
                  SquareIconButton(
                    icon: Icons.folder,
                    label: 'Collections',
                    onPressed: () => _openPage(
                      context,
                      const collections_tab.CollectionsTab(),
                    ),
                  ),
                  SquareIconButton(
                    icon: Icons.info_outline,
                    label: 'Status',
                    onPressed: () => _openPage(
                      context,
                      status_tab.StatusTab(
                        totalVideos: 100,
                        totalCollections: 10,
                        totalSavedVideos: 25,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            TextButton.icon(
              style: logoutButtonStyle,
              icon: const Icon(Icons.logout),
              label: const Text('Logout'),
              onPressed: () => _logout(context),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

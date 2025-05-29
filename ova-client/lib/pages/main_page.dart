import 'package:flutter/material.dart';
import 'package:salomon_bottom_bar/salomon_bottom_bar.dart';
import 'explore_page.dart';
import 'folders_page.dart';
import 'home_page.dart';

class MainPage extends StatefulWidget {
  const MainPage({super.key});

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  int _selectedIndex = 2;

  final List<Widget> _pages = [
    FolderTabs(),
    const ExplorePage(),
    const HomePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _selectedIndex, children: _pages),
      bottomNavigationBar: SalomonBottomBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        items: [
          SalomonBottomBarItem(
            icon: const Icon(Icons.folder_copy_outlined),
            title: const Text("Folders"),
            selectedColor: Theme.of(context).colorScheme.primary,
          ),
          SalomonBottomBarItem(
            icon: const Icon(Icons.search),
            title: const Text("Explore"),
            selectedColor: Colors.orange,
          ),
          SalomonBottomBarItem(
            icon: const Icon(Icons.home),
            title: const Text("Home"),
            selectedColor: Colors.teal,
          ),
        ],
      ),
    );
  }
}

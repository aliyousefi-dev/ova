import 'package:flutter/material.dart';

class CollectionsTab extends StatefulWidget {
  const CollectionsTab({super.key});

  @override
  State<CollectionsTab> createState() => _CollectionsTabState();
}

class _CollectionsTabState extends State<CollectionsTab> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _collectionNameController =
      TextEditingController();

  List<Map<String, dynamic>> _collections = [
    {'title': 'Favorites', 'videos': 3},
    {'title': 'Watch Later', 'videos': 5},
    {'title': 'Tutorials', 'videos': 8},
  ];

  void _deleteCollection(String title) {
    setState(() {
      _collections.removeWhere((c) => c['title'] == title);
    });
  }

  void _deleteAllCollections() {
    setState(() {
      _collections.clear();
    });
  }

  void _createCollection(String name) {
    if (name.trim().isEmpty) return;
    setState(() {
      _collections.add({'title': name.trim(), 'videos': 0});
      _collectionNameController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _collections
        .where(
          (c) => c['title'].toLowerCase().contains(
            _searchController.text.toLowerCase(),
          ),
        )
        .toList();

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          children: [
            const SizedBox(height: 60),
            const Center(
              child: Text(
                'Collections',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 30),

            // Create Collection
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _collectionNameController,
                    decoration: const InputDecoration(
                      labelText: 'New Collection Name',
                    ),
                    onSubmitted: _createCollection,
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: () =>
                      _createCollection(_collectionNameController.text),
                  child: const Text('Create'),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Search Field
            TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: 'Search collections...',
              ),
              onChanged: (val) => setState(() {}),
            ),

            const SizedBox(height: 20),

            // Collection List
            Expanded(
              child: filtered.isEmpty
                  ? const Center(child: Text('No collections found.'))
                  : ListView.builder(
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final collection = filtered[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          child: ListTile(
                            leading: const Icon(Icons.folder),
                            title: Text(
                              '${collection['title']} (${collection['videos']})',
                            ),
                            subtitle: const Text('Collection'),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () =>
                                  _deleteCollection(collection['title']),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

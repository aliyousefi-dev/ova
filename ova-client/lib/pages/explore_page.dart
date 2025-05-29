import 'package:flutter/material.dart';
import '../widgets/VideoCard.dart';
import '../widgets/FolderCardWidget.dart';

class ExplorePage extends StatefulWidget {
  const ExplorePage({super.key});

  @override
  State<ExplorePage> createState() => _ExplorePageState();
}

class _ExplorePageState extends State<ExplorePage> {
  final TextEditingController _searchController = TextEditingController();
  String _searchText = '';

  final List<Map<String, dynamic>> _videos = [
    {
      'name': 'Amazing Nature',
      'tags': ['Nature', 'HD', 'Relaxing'],
      'thumbnailUrl': null,
      'lengthSeconds': 754,
    },
    {
      'name': 'Flutter Tutorial',
      'tags': ['Flutter', 'Development', 'Tutorial'],
      'thumbnailUrl': null,
      'lengthSeconds': 1320,
    },
    {
      'name': 'Space Documentary',
      'tags': ['Space', 'Science', 'Education'],
      'thumbnailUrl': null,
      'lengthSeconds': 900,
    },
    {
      'name': 'Ocean Life',
      'tags': ['Ocean', 'Wildlife', 'HD'],
      'thumbnailUrl': null,
      'lengthSeconds': 670,
    },
    {
      'name': 'Mountain Hiking',
      'tags': ['Adventure', 'Hiking', 'Nature'],
      'thumbnailUrl': null,
      'lengthSeconds': 840,
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filteredVideos {
    if (_searchText.isEmpty) return _videos;
    final query = _searchText.toLowerCase();
    return _videos.where((video) {
      final name = (video['name'] as String).toLowerCase();
      final tags = (video['tags'] as List<String>)
          .map((e) => e.toLowerCase())
          .toList();
      return name.contains(query) || tags.any((tag) => tag.contains(query));
    }).toList();
  }

  Future<void> _handleRefresh() async {
    await Future.delayed(const Duration(seconds: 1));
    setState(() {
      _videos.shuffle();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      // No appBar
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Column(
            children: [
              // Search bar at top, centered with margin from top
              Container(
                margin: const EdgeInsets.only(top: 30, bottom: 20),
                alignment: Alignment.center,
                child: SizedBox(
                  width: 250,
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search videos, tags...',
                      prefixIcon: const Icon(
                        Icons.search,
                        color: Colors.white54,
                      ),
                      // The theme's InputDecorationTheme will apply here automatically:
                      filled: true,
                      fillColor: Colors.black,
                    ),
                    style: const TextStyle(color: Colors.white),
                    cursorColor: const Color.fromARGB(
                      255,
                      255,
                      10,
                      10,
                    ), // your primary red
                    onChanged: (value) {
                      setState(() => _searchText = value);
                    },
                  ),
                ),
              ),

              // Videos grid
              Expanded(
                child: _filteredVideos.isEmpty
                    ? Center(
                        child: Text(
                          'No videos found.',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.disabledColor,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _handleRefresh,
                        color: theme.colorScheme.primary,
                        child: GridView.builder(
                          physics: const AlwaysScrollableScrollPhysics(),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                mainAxisSpacing: 10,
                                crossAxisSpacing: 10,
                                childAspectRatio: 3 / 4,
                              ),
                          itemCount: _filteredVideos.length,
                          itemBuilder: (context, index) {
                            final video = _filteredVideos[index];
                            return VideoCardWidget(
                              videoName: video['name'] as String,
                              tags: List<String>.from(video['tags'] as List),
                              thumbnailUrl: video['thumbnailUrl'] as String?,
                              lengthSeconds:
                                  video['lengthSeconds'] as int? ?? 0,
                            );
                          },
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

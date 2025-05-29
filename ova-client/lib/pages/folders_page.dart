import 'package:flutter/material.dart';
import '../widgets/VideoCard.dart';
import '../widgets/FolderCardWidget.dart';

class FolderTabs extends StatefulWidget {
  const FolderTabs({super.key});

  @override
  State<FolderTabs> createState() => _FolderTabsState();
}

class _FolderTabsState extends State<FolderTabs> {
  final TextEditingController _searchController = TextEditingController();
  String _searchText = '';

  final List<String> _folders = [
    'Movies',
    'Tutorials',
    'Documentaries',
    'Nature',
    'Travel',
  ];

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
      resizeToAvoidBottomInset: false,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 60), // Top margin
          const Center(
            child: Text(
              'Folders',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 30),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _handleRefresh,
              color: theme.colorScheme.primary,
              child: CustomScrollView(
                slivers: [
                  // Folders grid
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    sliver: SliverGrid(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            mainAxisSpacing: 12,
                            crossAxisSpacing: 12,
                            childAspectRatio: 4,
                          ),
                      delegate: SliverChildBuilderDelegate((context, index) {
                        final folder = _folders[index];
                        return FolderCardWidget(
                          folderName: folder,
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Opened folder: $folder')),
                            );
                          },
                        );
                      }, childCount: _folders.length),
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 24)),

                  // Videos grid or "No videos found"
                  if (_filteredVideos.isEmpty)
                    SliverFillRemaining(
                      child: Center(
                        child: Text(
                          'No videos found.',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.disabledColor,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      sliver: SliverGrid(
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              mainAxisSpacing: 10,
                              crossAxisSpacing: 10,
                              childAspectRatio: 3 / 4,
                            ),
                        delegate: SliverChildBuilderDelegate((context, index) {
                          final video = _filteredVideos[index];
                          return VideoCardWidget(
                            videoName: video['name'] as String,
                            tags: List<String>.from(video['tags'] as List),
                            thumbnailUrl: video['thumbnailUrl'] as String?,
                            lengthSeconds: video['lengthSeconds'] as int? ?? 0,
                          );
                        }, childCount: _filteredVideos.length),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

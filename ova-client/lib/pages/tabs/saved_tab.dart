import 'package:flutter/material.dart';
import '../../widgets/VideoCard.dart';
import '../watch_page.dart';

class SavedTab extends StatelessWidget {
  const SavedTab({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final List<Map<String, dynamic>> favoriteVideos = [
      {
        'name': 'Flutter Tutorial',
        'tags': ['Flutter', 'Development', 'Tutorial'],
      },
      {
        'name': 'Space Documentary',
        'tags': ['Space', 'Science', 'Education'],
      },
    ];

    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 60), // margin from top
          const Center(
            child: Text(
              'Saved',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: favoriteVideos.isEmpty
                ? const Center(
                    child: Text(
                      'No favorite videos yet',
                      style: TextStyle(fontSize: 18),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.only(top: 8, bottom: 80),
                    itemCount: favoriteVideos.length,
                    itemBuilder: (context, index) {
                      final video = favoriteVideos[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12.0,
                          vertical: 6.0,
                        ),
                        child: VideoCardWidget(
                          videoName: video['name'],
                          lengthSeconds: 3333,
                          tags: List<String>.from(video['tags']),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'TagBadge.dart';
import 'package:ova_mobile/pages/watch_page.dart';

class VideoCardWidget extends StatelessWidget {
  final String videoName;
  final List<String> tags;
  final String? thumbnailUrl;
  final int lengthSeconds;

  const VideoCardWidget({
    super.key,
    required this.videoName,
    required this.tags,
    this.thumbnailUrl,
    required this.lengthSeconds,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;
    final durationText = lengthSeconds >= 60
        ? '${lengthSeconds ~/ 60} min'
        : '$lengthSeconds sec';

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => WatchPage(videoName: videoName, tags: tags),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: theme.cardColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 6,
              offset: const Offset(2, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail with fallback
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              child: Stack(
                children: [
                  Container(
                    height: size.width * 0.35, // Dynamic height based on screen
                    width: double.infinity,
                    color: const Color.fromARGB(255, 20, 20, 20),
                    child: thumbnailUrl != null
                        ? Image.network(
                            thumbnailUrl!,
                            fit: BoxFit.cover,
                            width: double.infinity,
                          )
                        : Center(
                            child: Icon(
                              Icons.videocam_off,
                              size: 40,
                              color: Colors.grey.shade700,
                            ),
                          ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        durationText,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Title and tags
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    videoName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 6),
                  SizedBox(
                    height: 28,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: tags.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 6),
                      itemBuilder: (context, index) {
                        return TagBadge(text: tags[index], filled: false);
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

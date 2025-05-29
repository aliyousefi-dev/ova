import 'package:flutter/material.dart';

class StatusTab extends StatelessWidget {
  final int totalCollections;
  final int totalSavedVideos;
  final int totalVideos;

  const StatusTab({
    super.key,
    required this.totalCollections,
    required this.totalSavedVideos,
    required this.totalVideos,
  });

  @override
  Widget build(BuildContext context) {
    final textStyle = Theme.of(context).textTheme.titleMedium;

    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 60), // margin from top
          const Center(
            child: Text(
              'Stats',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 20),

          Expanded(
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  InfoRow(
                    label: 'Server Info',
                    value: 'sdf',
                    textStyle: textStyle,
                  ),
                  const SizedBox(height: 12),
                  InfoRow(
                    label: 'Total Collections',
                    value: totalCollections.toString(),
                    textStyle: textStyle,
                  ),
                  const SizedBox(height: 12),
                  InfoRow(
                    label: 'Total Saved Videos',
                    value: totalSavedVideos.toString(),
                    textStyle: textStyle,
                  ),
                  const SizedBox(height: 12),
                  InfoRow(
                    label: 'Total Videos',
                    value: totalVideos.toString(),
                    textStyle: textStyle,
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

class InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final TextStyle? textStyle;

  const InfoRow({
    super.key,
    required this.label,
    required this.value,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('$label: ', style: textStyle),
        Text(value, style: textStyle?.copyWith(fontWeight: FontWeight.bold)),
      ],
    );
  }
}

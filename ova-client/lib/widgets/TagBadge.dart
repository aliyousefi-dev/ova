import 'package:flutter/material.dart';

class TagBadge extends StatelessWidget {
  final String text;
  final EdgeInsetsGeometry? padding;
  final bool filled;

  const TagBadge({
    super.key,
    required this.text,
    this.padding,
    this.filled = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = theme.colorScheme.primary;

    return Container(
      margin: const EdgeInsets.only(
        right: 8,
        bottom: 8,
      ), // Add bottom margin for spacing between lines
      padding:
          padding ?? const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: filled ? color : color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        '#$text',
        style: theme.textTheme.bodySmall?.copyWith(
          color: filled ? theme.colorScheme.onPrimary : color,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}

class TagsScrollableExample extends StatelessWidget {
  final List<String> tags = [
    'flutter',
    'dart',
    'widget',
    'state',
    'animation',
    'performance',
    'ui',
    'openai',
    'chatgpt',
    'ai',
    'coding',
    'design',
    'mobile',
    'cross-platform',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scrollable Tags Example')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Tags:',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 100, // fixed height for scrollable tag area
              child: SingleChildScrollView(
                child: Wrap(
                  children: tags
                      .map((tag) => TagBadge(text: tag, filled: false))
                      .toList(),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text('Other content here...'),
          ],
        ),
      ),
    );
  }
}

void main() {
  runApp(
    MaterialApp(
      home: TagsScrollableExample(),
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
      ),
    ),
  );
}

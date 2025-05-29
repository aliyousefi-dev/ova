import 'package:flutter/material.dart';
import 'package:ova_mobile/widgets/TagBadge.dart';

class WatchPage extends StatefulWidget {
  final String videoName;
  final List<String> tags;

  const WatchPage({super.key, required this.videoName, required this.tags});

  @override
  State<WatchPage> createState() => _WatchPageState();
}

class _WatchPageState extends State<WatchPage> {
  bool isSaved = false;
  List<String> tags = [];
  String? selectedCollection;
  int _rating = 0; // rating from 0 to 5

  final List<String> collections = [
    'Favorites',
    'Watch Later',
    'Inspiration',
    'Tutorials',
  ];

  final TextEditingController _tagController = TextEditingController();

  void toggleSaved() {
    setState(() {
      isSaved = !isSaved;
    });
  }

  void addTag(String tag) {
    if (tag.isNotEmpty && !tags.contains(tag)) {
      setState(() {
        tags.add(tag);
      });
      _tagController.clear();
    }
  }

  void addToCollection(String? collection) {
    if (collection != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Added to '$collection'")));
    }
  }

  @override
  void initState() {
    super.initState();
    tags = List.from(widget.tags);
  }

  @override
  void dispose() {
    _tagController.dispose();
    super.dispose();
  }

  Future<void> _handleRefresh() async {
    await Future.delayed(const Duration(seconds: 1));
    setState(() {
      // Example refresh actions:
      _rating = 0;
      isSaved = false;
      // Reset tags or collections here if needed
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _handleRefresh,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 50),

              // Header
              const Center(
                child: Text(
                  'Streaming Video',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
              ),

              const SizedBox(height: 30),

              // Title left, rating + save right
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Text(
                      widget.videoName,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),

                  const SizedBox(width: 16),

                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: List.generate(5, (index) {
                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                _rating = index + 1;
                              });
                            },
                            child: Icon(
                              index < _rating ? Icons.star : Icons.star_border,
                              color: Colors.amber,
                              size: 20,
                            ),
                          );
                        }),
                      ),

                      const SizedBox(width: 12),

                      IconButton(
                        icon: Icon(
                          isSaved ? Icons.bookmark : Icons.bookmark_border,
                          color: isSaved
                              ? theme.colorScheme.primary
                              : theme.iconTheme.color,
                        ),
                        onPressed: toggleSaved,
                        tooltip: 'Save',
                        splashRadius: 20,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Video player with brighter background
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Container(
                  color: const Color.fromARGB(255, 34, 34, 34),
                  child: const Center(
                    child: Icon(Icons.play_circle_fill, size: 64),
                  ),
                ),
              ),

              const SizedBox(height: 30),

              // Tabs with tags and collections
              DefaultTabController(
                length: 2,
                child: Column(
                  children: [
                    const TabBar(
                      tabs: [
                        Tab(text: 'Tags'),
                        Tab(text: 'Collections'),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height:
                          300, // give fixed height for TabBarView inside scroll
                      child: TabBarView(
                        children: [
                          // Tags Tab
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Wrap(
                                spacing: 6,
                                runSpacing: 4,
                                children: tags
                                    .map((tag) => TagBadge(text: tag))
                                    .toList(),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: _tagController,
                                      decoration: const InputDecoration(
                                        labelText: 'Add tag',
                                        border: InputBorder.none,
                                      ),
                                      onSubmitted: addTag,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  ElevatedButton(
                                    onPressed: () =>
                                        addTag(_tagController.text),
                                    child: const Text('Add'),
                                  ),
                                ],
                              ),
                            ],
                          ),

                          // Collections Tab
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              DropdownButtonFormField<String>(
                                value: selectedCollection,
                                hint: const Text('Select a collection'),
                                items: collections.map((String collection) {
                                  return DropdownMenuItem(
                                    value: collection,
                                    child: Text(collection),
                                  );
                                }).toList(),
                                onChanged: (value) {
                                  setState(() {
                                    selectedCollection = value;
                                  });
                                },
                                decoration: const InputDecoration(
                                  border: InputBorder.none,
                                  labelText: 'Collections',
                                ),
                              ),
                              const SizedBox(height: 12),
                              ElevatedButton.icon(
                                onPressed: () =>
                                    addToCollection(selectedCollection),
                                icon: const Icon(Icons.add),
                                label: const Text('Add to Collection'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

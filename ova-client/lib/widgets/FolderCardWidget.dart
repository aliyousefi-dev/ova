import 'package:flutter/material.dart';

class FolderCardWidget extends StatelessWidget {
  final String folderName;
  final VoidCallback onTap;

  const FolderCardWidget({
    super.key,
    required this.folderName,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SizedBox(
      width: 120,
      height: double.infinity, // Make the button fill the parent's height
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          foregroundColor: theme.colorScheme.onSurface,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          minimumSize: const Size.fromHeight(36), // Keep accessible height
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          backgroundColor: theme.colorScheme.surfaceVariant,
          alignment: Alignment.centerLeft, // Align content left inside button
        ),
        child: Row(
          children: [
            Icon(Icons.folder_open, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                folderName,
                style: const TextStyle(fontSize: 12),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

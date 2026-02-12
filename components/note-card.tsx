import { Note } from '@/types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, onPress, onDelete }: NoteCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={[styles.card, { backgroundColor: note.color || '#f0f0f0' }]}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
            {note.title}
          </ThemedText>
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <IconSymbol name="trash" size={20} color="#ff3b30" />
          </TouchableOpacity>
        </View>
        <ThemedText numberOfLines={3} style={styles.content}>
          {note.content}
        </ThemedText>
        <ThemedText style={styles.date}>
          {new Date(note.updatedAt).toLocaleDateString()}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  content: {
    marginBottom: 8,
    opacity: 0.8,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  deleteBtn: {
    padding: 4,
  },
});

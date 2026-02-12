import { NoteCard } from '@/components/note-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Note } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const NOTES_KEY = '@notes';
const NOTE_COLORS = ['#fff4b3', '#b3e5fc', '#c8e6c9', '#ffccbc', '#e1bee7'];

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTES_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async (newNotes: Note[]) => {
    try {
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleAddNote = () => {
    setCurrentNote(null);
    setTitle('');
    setContent('');
    setSelectedColor(NOTE_COLORS[0]);
    setModalVisible(true);
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSelectedColor(note.color || NOTE_COLORS[0]);
    setModalVisible(true);
  };

  const handleSaveNote = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    const now = new Date().toISOString();
    
    if (currentNote) {
      // Update existing note
      const updatedNotes = notes.map(note =>
        note.id === currentNote.id
          ? { ...note, title, content, updatedAt: now, color: selectedColor }
          : note
      );
      saveNotes(updatedNotes);
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: now,
        updatedAt: now,
        color: selectedColor,
      };
      saveNotes([newNote, ...notes]);
    }
    
    setModalVisible(false);
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const filtered = notes.filter(note => note.id !== id);
            saveNotes(filtered);
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">My Notes</ThemedText>
        <TouchableOpacity onPress={handleAddNote} style={styles.addButton}>
          <IconSymbol name="plus.circle.fill" size={32} color={Colors[colorScheme ?? 'light'].tint} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {notes.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="note.text" size={64} color="#ccc" />
            <ThemedText style={styles.emptyText}>No notes yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Tap + to create your first note</ThemedText>
          </ThemedView>
        ) : (
          notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onPress={() => handleEditNote(note)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <ThemedText style={styles.cancelBtn}>Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText type="subtitle">
              {currentNote ? 'Edit Note' : 'New Note'}
            </ThemedText>
            <TouchableOpacity onPress={handleSaveNote}>
              <ThemedText style={styles.saveBtn}>Save</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.colorPicker}>
            {NOTE_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
              />
            ))}
          </View>

          <TextInput
            style={styles.titleInput}
            placeholder="Note title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />
          
          <TextInput
            style={styles.contentInput}
            placeholder="Start typing..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 20,
    marginTop: 16,
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.4,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cancelBtn: {
    color: '#ff3b30',
    fontSize: 16,
  },
  saveBtn: {
    color: '#007aff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#007aff',
    borderWidth: 3,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16,
    color: '#000',
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 20,
    color: '#000',
  },
});

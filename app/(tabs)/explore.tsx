import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodoItem } from '@/components/todo-item';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Todo } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const TODOS_KEY = '@todos';

export default function TodosScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const stored = await AsyncStorage.getItem(TODOS_KEY);
      if (stored) {
        setTodos(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const saveTodos = async (newTodos: Todo[]) => {
    try {
      await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(newTodos));
      setTodos(newTodos);
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const handleAddTodo = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a todo');
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      priority,
    };

    saveTodos([newTodo, ...todos]);
    setTitle('');
    setModalVisible(false);
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const filtered = todos.filter(todo => todo.id !== id);
            saveTodos(filtered);
          },
        },
      ]
    );
  };

  const clearCompleted = () => {
    const filtered = todos.filter(todo => !todo.completed);
    saveTodos(filtered);
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">My Todos</ThemedText>
          <ThemedText style={styles.stats}>
            {completedCount} of {todos.length} completed
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <IconSymbol name="plus.circle.fill" size={32} color={Colors[colorScheme ?? 'light'].tint} />
        </TouchableOpacity>
      </View>

      {completedCount > 0 && (
        <TouchableOpacity onPress={clearCompleted} style={styles.clearBtn}>
          <ThemedText style={styles.clearBtnText}>Clear Completed</ThemedText>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {todos.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="checklist" size={64} color="#ccc" />
            <ThemedText style={styles.emptyText}>No todos yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Tap + to create your first todo</ThemedText>
          </ThemedView>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
            />
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>New Todo</ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
              autoFocus
            />

            <ThemedText style={styles.label}>Priority</ThemedText>
            <View style={styles.priorityContainer}>
              {(['low', 'medium', 'high'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.priorityBtn,
                    priority === p && styles.priorityBtnActive,
                    { borderColor: p === 'high' ? '#ff3b30' : p === 'medium' ? '#ff9500' : '#34c759' }
                  ]}
                >
                  <ThemedText style={[
                    styles.priorityText,
                    priority === p && styles.priorityTextActive
                  ]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setTitle('');
                }}
                style={[styles.modalBtn, styles.cancelModalBtn]}
              >
                <ThemedText style={styles.cancelModalText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddTodo}
                style={[styles.modalBtn, styles.addModalBtn]}
              >
                <ThemedText style={styles.addModalText}>Add</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
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
    marginBottom: 12,
  },
  stats: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  addButton: {
    padding: 4,
  },
  clearBtn: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 12,
  },
  clearBtnText: {
    color: '#ff3b30',
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#000',
  },
  label: {
    marginBottom: 8,
    opacity: 0.7,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityBtnActive: {
    backgroundColor: '#f0f0f0',
  },
  priorityText: {
    fontSize: 14,
  },
  priorityTextActive: {
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalBtn: {
    backgroundColor: '#f0f0f0',
  },
  addModalBtn: {
    backgroundColor: '#007aff',
  },
  cancelModalText: {
    color: '#000',
    fontWeight: '600',
  },
  addModalText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

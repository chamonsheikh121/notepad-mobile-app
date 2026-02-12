import { Todo } from '@/types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const getPriorityColor = () => {
    switch (todo.priority) {
      case 'high': return '#ff3b30';
      case 'medium': return '#ff9500';
      case 'low': return '#34c759';
      default: return '#8e8e93';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
        <IconSymbol 
          name={todo.completed ? 'checkmark.circle.fill' : 'circle'} 
          size={24} 
          color={todo.completed ? '#34c759' : '#8e8e93'} 
        />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <ThemedText 
          style={[
            styles.title, 
            todo.completed && styles.completed
          ]}
        >
          {todo.title}
        </ThemedText>
        {todo.priority && (
          <View style={[styles.badge, { backgroundColor: getPriorityColor() }]}>
            <ThemedText style={styles.badgeText}>{todo.priority}</ThemedText>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <IconSymbol name="trash" size={20} color="#ff3b30" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  checkbox: {
    marginRight: 12,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
  },
  completed: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
});

// Expo chat screens (no Tailwind)
// Split into components, using StyleSheet API

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";

// -----------------------------------------
// Header
// -----------------------------------------
export const ChatHeader = ({ onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack}>
      <Text style={styles.backBtn}>{'<'} Back</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Служба поддержки</Text>
    <View style={{ width: 40 }} />
  </View>
);

// -----------------------------------------
// Message Bubble
// -----------------------------------------
export const Message = ({ text, time, isMe }) => (
  <View style={[styles.messageRow, isMe && styles.alignRight]}>
    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}> 
      <Text style={styles.messageText}>{text}</Text>
      <Text style={styles.time}>{time}</Text>
    </View>
  </View>
);

// -----------------------------------------
// Predefined Quick Buttons
// -----------------------------------------
export const QuickButtons = ({ options, onPress }) => (
  <View style={styles.quickContainer}>
    {options.map((o, i) => (
      <TouchableOpacity key={i} style={styles.quickBtn} onPress={() => onPress(o)}>
        <Text style={styles.quickText}>{o}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// -----------------------------------------
// Main Chat Screen
// -----------------------------------------


// -----------------------------------------
// Styles
// -----------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backBtn: {
    fontSize: 16,
    color: '#555',
  },
  messages: {
    flex: 1,
    padding: 16,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  bubbleMe: {
    backgroundColor: '#FF6600',
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    backgroundColor: '#F2F2F2',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
    color: '#000',
  },
  time: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
    textAlign: 'right',
  },
  quickContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#EEE',
  },
  quickBtn: {
    backgroundColor: '#F7F7F7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  quickText: {
    fontSize: 14,
    color: '#333',
  },
});

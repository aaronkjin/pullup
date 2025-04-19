import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

import { RootStackParamList, QRWristband } from '../types';
import { QRWristbandApi, EventApi } from '../services/api';
import QRWristbandComponent from '../components/QRWristband';
import { COLORS, SPACING, FONT } from '../utils/theme';

type QRWristbandRouteProp = RouteProp<RootStackParamList, 'QRWristband'>;

const QRWristbandScreen = () => {
  const route = useRoute<QRWristbandRouteProp>();
  const { eventId } = route.params;
  
  const [loading, setLoading] = useState<boolean>(true);
  const [wristband, setWristband] = useState<QRWristband | null>(null);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Generate or fetch wristband
  const getWristband = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the event title
      const event = await EventApi.getEventById(eventId);
      if (!event) {
        setError('Event not found');
        return;
      }
      
      if (!event.isPrivate) {
        setError('Wristbands are only available for private events');
        return;
      }
      
      setEventTitle(event.title);
      
      // Then generate the wristband
      const wristbandData = await QRWristbandApi.generateWristband(eventId);
      setWristband(wristbandData);
    } catch (error) {
      console.error('Failed to generate wristband:', error);
      setError('Failed to generate wristband. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    getWristband();
  }, [eventId]);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Generating your wristband...</Text>
      </View>
    );
  }
  
  if (error || !wristband) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'An unexpected error occurred'}</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <QRWristbandComponent wristband={wristband} eventTitle={eventTitle} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How to use your wristband</Text>
          <Text style={styles.infoText}>
            Present this QR code to the event organizer at the entrance. 
            This wristband is tied to your SUNet ID and cannot be transferred.
          </Text>
          <Text style={styles.infoText}>
            Keep your phone screen brightness up when showing the QR code for better scanning.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.l,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.l,
  },
  loadingText: {
    marginTop: SPACING.m,
    fontSize: FONT.sizes.m,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.l,
  },
  errorText: {
    fontSize: FONT.sizes.m,
    color: COLORS.error,
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: SPACING.xl,
    padding: SPACING.m,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: FONT.sizes.l,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  infoText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginBottom: SPACING.m,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default QRWristbandScreen; 
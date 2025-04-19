import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { QRWristband as QRWristbandType } from '../types';
import { COLORS, SPACING, FONT } from '../utils/theme';

interface QRWristbandComponentProps {
  wristband: QRWristbandType;
  eventTitle: string;
}

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.6;

const QRWristbandComponent: React.FC<QRWristbandComponentProps> = ({ 
  wristband, 
  eventTitle 
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Check if expired
  const isExpired = () => {
    const now = new Date();
    const expiresAt = new Date(wristband.expiresAt);
    return now > expiresAt;
  };
  
  // Calculate time remaining
  const getTimeRemaining = () => {
    const now = new Date();
    const expiresAt = new Date(wristband.expiresAt);
    const diffInMs = expiresAt.getTime() - now.getTime();
    
    if (diffInMs <= 0) return 'Expired';
    
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffInHours}h ${diffInMinutes}m remaining`;
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Wristband</Text>
      <Text style={styles.eventTitle}>{eventTitle}</Text>
      
      <View style={styles.qrContainer}>
        {isExpired() ? (
          <View style={styles.expiredOverlay}>
            <Text style={styles.expiredText}>EXPIRED</Text>
          </View>
        ) : (
          <QRCode 
            value={wristband.code}
            size={QR_SIZE}
            color={COLORS.text}
            backgroundColor={COLORS.card}
          />
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.codeText}>Code: {wristband.code}</Text>
        <Text style={styles.infoText}>
          Created: {formatDate(wristband.createdAt)}
        </Text>
        <Text style={[
          styles.infoText, 
          isExpired() ? styles.expiredTimeText : styles.validTimeText
        ]}>
          {isExpired() ? `Expired on ${formatDate(wristband.expiresAt)}` : getTimeRemaining()}
        </Text>
      </View>
      
      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          Present this QR code at the event entrance.
          This wristband is tied to your SUNet ID and is non-transferable.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.l,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  eventTitle: {
    fontSize: FONT.sizes.m,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginBottom: SPACING.l,
  },
  qrContainer: {
    width: QR_SIZE,
    height: QR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.l,
    position: 'relative',
  },
  expiredOverlay: {
    position: 'absolute',
    width: QR_SIZE,
    height: QR_SIZE,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  expiredText: {
    fontSize: FONT.sizes.xxl,
    fontWeight: '800',
    color: COLORS.card,
    transform: [{ rotate: '-30deg' }],
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.l,
    width: '100%',
  },
  codeText: {
    fontSize: FONT.sizes.m,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  infoText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginBottom: SPACING.xs,
  },
  validTimeText: {
    color: COLORS.success,
    fontWeight: '500',
  },
  expiredTimeText: {
    color: COLORS.error,
    fontWeight: '500',
  },
  noteContainer: {
    padding: SPACING.m,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    width: '100%',
  },
  noteText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default QRWristbandComponent; 
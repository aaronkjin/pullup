import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT } from '../utils/theme';
import { QRWristbandApi } from '../services/api';

const ScanQRScreen = () => {
  const [scanning, setScanning] = useState<boolean>(false);
  const [result, setResult] = useState<{
    isValid: boolean;
    message: string;
    eventId?: string;
    userId?: string;
  } | null>(null);

  // In a real app, this would use the camera to scan a QR code
  const handleStartScan = () => {
    setScanning(true);
    // Simulate a scan after 2 seconds
    setTimeout(() => {
      handleScanResult('test_code');
    }, 2000);
  };

  // Process scan result
  const handleScanResult = async (code: string) => {
    try {
      const response = await QRWristbandApi.validateWristband(code);
      
      // Set the result
      if (response.isValid) {
        setResult({
          isValid: true,
          message: 'Valid wristband! Guest can enter.',
          eventId: response.eventId,
          userId: response.userId,
        });
      } else {
        setResult({
          isValid: false,
          message: 'Invalid wristband. Entry denied.',
        });
      }
    } catch (error) {
      setResult({
        isValid: false,
        message: 'Error validating wristband.',
      });
    } finally {
      setScanning(false);
    }
  };

  // Reset the scanner
  const handleReset = () => {
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wristband Scanner</Text>
      </View>
      
      <View style={styles.content}>
        {!scanning && !result ? (
          <View style={styles.startScanContainer}>
            <Icon name="qr-code-outline" size={120} color={COLORS.secondaryText} />
            <Text style={styles.instructions}>
              Scan a guest's QR wristband to verify entry permission
            </Text>
            <TouchableOpacity 
              style={styles.scanButton} 
              onPress={handleStartScan}
            >
              <Text style={styles.scanButtonText}>Start Scanning</Text>
            </TouchableOpacity>
          </View>
        ) : scanning ? (
          <View style={styles.scanningContainer}>
            <View style={styles.scanner}>
              <Icon name="scan-outline" size={120} color={COLORS.primary} />
            </View>
            <Text style={styles.scanningText}>Scanning...</Text>
          </View>
        ) : result ? (
          <View style={styles.resultContainer}>
            <Icon 
              name={result.isValid ? "checkmark-circle" : "close-circle"} 
              size={100} 
              color={result.isValid ? COLORS.success : COLORS.error} 
            />
            <Text style={[
              styles.resultText,
              result.isValid ? styles.validText : styles.invalidText
            ]}>
              {result.message}
            </Text>
            
            {result.isValid && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>Event ID: {result.eventId}</Text>
                <Text style={styles.detailText}>User ID: {result.userId}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Note: In this MVP version, we're simulating the QR scanning functionality.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.l,
  },
  startScanContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  instructions: {
    fontSize: FONT.sizes.m,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginVertical: SPACING.l,
    lineHeight: 24,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderRadius: 24,
    marginTop: SPACING.l,
  },
  scanButtonText: {
    color: '#FFF',
    fontSize: FONT.sizes.m,
    fontWeight: '600',
  },
  scanningContainer: {
    alignItems: 'center',
  },
  scanner: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    marginBottom: SPACING.l,
  },
  scanningText: {
    fontSize: FONT.sizes.l,
    color: COLORS.primary,
    fontWeight: '600',
  },
  resultContainer: {
    alignItems: 'center',
    padding: SPACING.l,
  },
  resultText: {
    fontSize: FONT.sizes.l,
    fontWeight: '700',
    marginVertical: SPACING.l,
    textAlign: 'center',
  },
  validText: {
    color: COLORS.success,
  },
  invalidText: {
    color: COLORS.error,
  },
  detailsContainer: {
    backgroundColor: COLORS.card,
    padding: SPACING.m,
    borderRadius: 8,
    width: '100%',
    marginBottom: SPACING.l,
  },
  detailText: {
    fontSize: FONT.sizes.s,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderRadius: 24,
    marginTop: SPACING.l,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: FONT.sizes.m,
    fontWeight: '600',
  },
  footer: {
    padding: SPACING.m,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ScanQRScreen; 
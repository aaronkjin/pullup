declare module 'react-native-qrcode-svg' {
  import React from 'react';
  import { ViewProps } from 'react-native';

  interface QRCodeProps extends ViewProps {
    value: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
    logo?: any;
    logoSize?: number;
    logoBackgroundColor?: string;
    logoMargin?: number;
    logoBorderRadius?: number;
    quietZone?: number;
    enableLinearGradient?: boolean;
    linearGradient?: string[];
    ecl?: 'L' | 'M' | 'Q' | 'H';
    getRef?: (c: any) => void;
  }

  export default class QRCode extends React.Component<QRCodeProps> {
    toDataURL(callback: (data: string) => void): void;
  }
} 
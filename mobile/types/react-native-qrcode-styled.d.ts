declare module 'react-native-qrcode-styled' {
  import { ComponentType } from 'react';
  import { ViewStyle } from 'react-native';

  interface QRCodeStyledProps {
    data: string;
    style?: ViewStyle;
    className?: string;
    padding?: number;
    pieceSize?: number;
    [key: string]: any;
  }

  const QRCodeStyled: ComponentType<QRCodeStyledProps>;
  export default QRCodeStyled;
} 
export interface Message {
  id: string;
  text?: string;
  image?: string;
  isVoice?: boolean;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatScreenProps {
  // Add any props if needed in the future
}

export interface SplashScreenProps {
  onFinish: () => void;
}

export type RootStackParamList = {
  Chat: undefined;
};

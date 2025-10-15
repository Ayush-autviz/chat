# AI Chat App

A beautiful React Native chat application with AI assistant integration, featuring modern UI design and support for text, image, and voice messages.

## Features

- **Splash Screen**: Animated splash screen with smooth transitions
- **AI Chat Interface**: Modern chat UI with support for:
  - Text messages
  - Image sharing (placeholder implementation)
  - Voice messages (placeholder implementation)
- **Beautiful Icons**: Using Lucide React Native for consistent, modern icons
- **Responsive Design**: Optimized for both iOS and Android
- **TypeScript**: Full TypeScript support for better development experience

## Screenshots

The app includes:
1. **Splash Screen**: Animated welcome screen with AI branding
2. **Chat Screen**: Full-featured chat interface with message bubbles, input controls, and attachment options

## Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS, install pods:
```bash
cd ios && pod install && cd ..
```

3. Run the app:
```bash
# iOS
npm run ios

# Android
npm run android
```

## Project Structure

```
src/
├── screens/
│   ├── SplashScreen.tsx    # Animated splash screen
│   └── ChatScreen.tsx      # Main chat interface
├── types/
│   └── index.ts           # TypeScript type definitions
App.tsx                    # Main app component with navigation
```

## Technologies Used

- React Native 0.82.0
- TypeScript
- React Navigation
- Lucide React Native (for icons)
- React Native Safe Area Context

## Future Enhancements

- Real API integration for AI responses
- Image picker implementation
- Voice recording functionality
- Message persistence
- Push notifications
- Dark mode support

## Development Notes

This is a UI-focused implementation. The image picker and voice recording features show placeholder alerts and would need actual implementation using libraries like:
- `react-native-image-picker` for image selection
- `react-native-audio-recorder-player` for voice recording
- Backend API integration for AI responses
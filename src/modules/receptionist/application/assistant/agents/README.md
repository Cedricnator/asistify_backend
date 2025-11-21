# VoiceAgent: Gemini Live API Integration

This document explains how the VoiceAgent service integrates with Google's Gemini Live API for real-time voice conversations.

## 🎯 VoiceAgent Overview

VoiceAgent is a **transient service** that manages individual voice conversation sessions with Gemini Live API. Each instance represents one active conversation.

```
VOICEAGENT ARCHITECTURE:

┌─────────────────┐
│   VoiceAgent    │ ← Transient Service (per conversation)
│                 │
│ • Gemini Client │
│ • Audio Callbacks│
│ • Personality   │
│ • Session State │
└─────────────────┘
         │
         ▼ WebSocket
┌─────────────────┐
│ Gemini Live API │
│                 │
│ • Real-time AI  │
│ • Voice Synthesis│
│ • Audio Streaming│
└─────────────────┘
```

## 🔧 Core Components

### VoiceAgent Class
```typescript
@Injectable({ scope: Scope.TRANSIENT })
export class VoiceAgent implements OnModuleInit {
    private genAI: GoogleGenAI;           // Gemini API client
    private liveSession: any;             // Live API WebSocket session
    private audioResponseCallbacks: Function[] = []; // Audio listeners
    private personality: PersonalityConfig;
    private isConnected = false;
}
```

### Key Properties
- **Transient Scope**: New instance per conversation
- **WebSocket Connection**: Direct to Gemini Live API
- **Callback System**: Event-driven audio responses
- **Personality Engine**: Dynamic AI behavior configuration

## 🌐 Gemini Live API Integration

### Connection Establishment
```typescript
// 1. Initialize Gemini client
await this.genAI.live.connect({
    model: 'gemini-2.0-flash-live-001',
    config: {
        responseModalities: [Modality.AUDIO],  // Audio-only responses
        systemInstruction: { parts: [{ text: personalityPrompt }] },
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' } // Professional voice
            }
        }
    },
    callbacks: {
        onopen: () => this.logger.log('Gemini connected'),
        onmessage: (response) => this.handleGeminiMessage(response),
        onerror: (error) => this.handleError(error),
        onclose: () => this.cleanup()
    }
});
```

### WebSocket Event Handling
```
GEMINI WEBSOCKET EVENTS:

onopen()     → Connection established
├── Send system prompt
├── Send initial greeting
└── Ready for audio

onmessage()  → AI responses
├── setupComplete: Session ready
├── serverContent.modelTurn: AI audio/text
└── interrupted: Generation stopped

onerror()    → Connection issues
└── Log and cleanup

onclose()    → Session ended
└── Resource cleanup
```

## 🎵 Audio Streaming Protocol

### Input: VoiceAgent → Gemini
```typescript
// Send audio chunks (16kHz PCM, 16-bit, mono)
await liveSession.sendRealtimeInput({
    audio: {
        mimeType: 'audio/pcm;rate=16000',
        data: base64EncodedAudio  // Buffer.toString('base64')
    }
});
```

### Output: Gemini → VoiceAgent
```typescript
// Receive audio responses (24kHz PCM, 16-bit, mono)
onmessage: (response) => {
    if (response.serverContent?.modelTurn?.parts) {
        for (const part of modelTurn.parts) {
            if (part.inlineData?.data) {
                const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
                // Distribute to all registered callbacks
                this.audioResponseCallbacks.forEach(callback => {
                    callback(audioBuffer);
                });
            }
        }
    }
}
```

### Audio Format Requirements
```
┌─────────────┬────────────┬─────────────┬────────────┐
│ Direction   │ Format     │ Sample Rate │ Bit Depth  │
├─────────────┼────────────┼─────────────┼────────────┤
│ To Gemini   │ PCM        │ 16kHz       │ 16-bit     │
│ From Gemini │ PCM        │ 24kHz       │ 16-bit     │
└─────────────┴────────────┴─────────────┴────────────┘
```

## 🎭 Personality System

### Receptionist Personality Configuration
```typescript
interface ReceptionistPersonality {
    name: string;
    levelFormality: number;     // 1-10: Casual → Formal
    levelDynamism: number;      // 1-10: Calm → Energetic
    enterpriseInformation: string;
    clientInformation: string;
    businessRestrictions: string;
}
```

### System Prompt Generation
```typescript
private buildSystemInstruction(personality): string {
    return `
You are ${personality.name}, a virtual receptionist assistant.

**Personality:**
- Formality Level: ${getFormalityDescription(personality.levelFormality)}
- Dynamism Level: ${getDynamismDescription(personality.levelDynamism)}

**Business Context:**
${personality.enterpriseInformation}

**Client Handling:**
${personality.clientInformation}

**Restrictions:**
${personality.businessRestrictions}

Always maintain your personality while being helpful and professional.
    `.trim();
}
```

### Formality Scale Examples
- **Level 1-3**: "Very casual and friendly"
- **Level 4-6**: "Conversational and approachable"
- **Level 7-9**: "Professional yet warm"
- **Level 10**: "Highly formal and ceremonious"

## 🔄 Callback System

### Audio Response Callbacks
```typescript
// Register audio listener
voiceAgent.onAudioResponse((audioBuffer: Buffer) => {
    // Handle 24kHz PCM audio from Gemini
    console.log(`Received ${audioBuffer.length} bytes of AI audio`);
});

// Multiple callbacks supported
voiceAgent.onAudioResponse(saveToFile);
voiceAgent.onAudioResponse(sendToPhone);
voiceAgent.onAudioResponse(analyzeSentiment);
```

### Text Response Callbacks
```typescript
voiceAgent.onTextResponse((text: string) => {
    console.log(`AI said: ${text}`);
});
```

### Callback Management
```typescript
// Add callback
onAudioResponse(callback: (Buffer) => void): void {
    this.audioResponseCallbacks.push(callback);
}

// Remove callback
offAudioResponse(callback: (Buffer) => void): void {
    const index = this.audioResponseCallbacks.indexOf(callback);
    if (index > -1) this.audioResponseCallbacks.splice(index, 1);
}
```

## 🚀 Usage Lifecycle

### 1. Initialization
```typescript
const voiceAgent = new VoiceAgent(configService);
await voiceAgent.onModuleInit(); // Load Gemini API key
```

### 2. Session Setup
```typescript
await voiceAgent.initializeSession(personality, receptionistId);
// Configure personality and identity
```

### 3. Connection
```typescript
await voiceAgent.connect(personality);
// Establish WebSocket to Gemini Live API
// Send system prompt and voice configuration
```

### 4. Audio Streaming
```typescript
// Send user audio (continuous streaming)
await voiceAgent.sendAudio(pcm16khzBuffer);

// Receive AI responses via callbacks
voiceAgent.onAudioResponse((aiAudio) => {
    // Handle AI voice responses
});
```

### 5. Text Interaction
```typescript
// Send text messages
await voiceAgent.sendText("Hello! How can I help you today?");

// Receive text responses via callbacks
voiceAgent.onTextResponse((text) => {
    console.log(`AI: ${text}`);
});
```

### 6. Cleanup
```typescript
await voiceAgent.endSession();
// Close WebSocket, clear callbacks, reset state
```

## ⚙️ Configuration

### Environment Variables
```bash
GEMINI_API_KEY=your_google_ai_api_key
GEMINI_MODEL=gemini-2.0-flash-live-001
GEMINI_TEMPERATURE=1.0          # Creativity (0-2)
GEMINI_MAX_OUTPUT_TOKENS=8192   # Response length
GEMINI_TOP_P=0.95              # Nucleus sampling
GEMINI_TOP_K=40                # Top-k sampling
```

### Voice Configuration
- **Voice Name**: Kore (professional female voice)
- **Modality**: Audio-only responses
- **VAD**: Automatic voice activity detection

## 🔍 Message Handling

### Gemini Response Structure
```typescript
interface GeminiMessage {
    setupComplete?: boolean;           // Session initialized
    serverContent?: {
        modelTurn?: {
            parts: Array<{
                inlineData?: {
                    data: string;      // Base64 audio
                    mimeType: string;  // "audio/pcm;rate=24000"
                };
                text?: string;         // Text content
            }>;
        };
        interrupted?: boolean;         // Generation stopped
    };
    text?: string;                     // Direct text response
    data?: Uint8Array;                 // Raw audio data (not used)
    toolCall?: any;                    // Function calling
    usageMetadata?: any;               // Token usage stats
}
```

### Processing Logic
```typescript
onmessage: (response: GeminiMessage) => {
    if (response.setupComplete) {
        // Session ready
        return;
    }

    if (response.serverContent?.modelTurn) {
        // Process AI turn (audio/text)
        for (const part of response.serverContent.modelTurn.parts) {
            if (part.inlineData?.data) {
                // Audio response
                const audio = Buffer.from(part.inlineData.data, 'base64');
                this.audioResponseCallbacks.forEach(cb => cb(audio));
            }
            if (part.text) {
                // Text response
                this.textResponseCallbacks.forEach(cb => cb(part.text));
            }
        }
    }

    if (response.serverContent?.interrupted) {
        // Handle interruptions
        this.logger.log('AI generation interrupted');
    }
}
```

## 🛡️ Error Handling

### Connection Errors
```typescript
onerror: (error) => {
    this.logger.error('Gemini Live API error:', error);
    this.isConnected = false;
    // Attempt reconnection or graceful degradation
}
```

### Audio Processing Errors
```typescript
try {
    await liveSession.sendRealtimeInput(audioPayload);
} catch (error) {
    this.logger.error('Failed to send audio:', error);
    // Continue processing other chunks
}
```

### Session Recovery
- **Automatic Reconnection**: On temporary network issues
- **Graceful Degradation**: Fallback to text-only mode
- **Resource Cleanup**: Always clean up on errors


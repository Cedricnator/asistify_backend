# Twilio Media Streams Integration

This module handles real-time voice conversations between Twilio phone calls and Google's Gemini Live API, enabling AI-powered voice interactions.

## 🏗️ Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐
│  Caller     │────│  Twilio     │────│  Twilio Media       │
│  Phone      │    │  Cloud      │    │  Streams WebSocket  │
└─────────────┘    └─────────────┘    └─────────────────────┘
                                              │
                                              ▼
┌─────────────────────┐    ┌─────────────┐    ┌─────────────┐
│ TwilioMediaStream-  │────│ VoiceAgent  │────│ Gemini Live │
│ Gateway             │    │             │    │ API         │
│                     │    │             │    │             │
│ • WebSocket Mgmt    │    │ • Gemini API │    │ • AI Brain  │
│ • Audio Conversion  │    │ • Callbacks  │    │ • Voice Gen │
│ • Session Handling  │    │ • Personality │    │             │
└─────────────────────┘    └─────────────┘    └─────────────┘
```

## 🎯 Core Components

### TwilioMediaStreamGateway
**Purpose**: WebSocket gateway managing Twilio Media Streams connections
- **Handles**: Phone call lifecycle (connect/start/media/stop events)
- **Manages**: Per-call VoiceAgent instances
- **Coordinates**: Audio format conversions between Twilio and Gemini

### VoiceAgent
**Purpose**: Gemini Live API integration service
- **Manages**: WebSocket connection to Gemini Live API
- **Handles**: Real-time audio streaming and personality configuration
- **Provides**: Callback-based audio response system

### Audio Utils (`audio-utils.ts`)
**Purpose**: Bidirectional audio format conversion
- **Twilio → Gemini**: μ-law 8kHz → PCM 16kHz
- **Gemini → Twilio**: PCM 24kHz → μ-law 8kHz
- **Uses**: `wavefile` library for professional audio processing

## 🔄 Audio Flow Pipeline

```
SEQUENCE DIAGRAM: Complete Audio Journey

1. Caller speaks → Twilio Cloud (μ-law 8kHz)
2. Twilio → WebSocket → TwilioMediaStreamGateway
3. Gateway converts: μ-law 8kHz → PCM 16kHz
4. Gateway → VoiceAgent.sendAudio(pcm16khz)
5. VoiceAgent → Gemini Live API (WebSocket streaming)
6. Gemini processes → generates response (PCM 24kHz)
7. Gemini → VoiceAgent.onmessage() callback
8. VoiceAgent → audioResponseCallbacks.forEach(callback)
9. TwilioMediaStreamGateway callback executes
10. Gateway converts: PCM 24kHz → μ-law 8kHz
11. Gateway → WebSocket → Twilio Cloud
12. Twilio → Caller hears AI response

DETAILED AUDIO PROCESSING:
Input (Twilio) → μ-law 8kHz 8-bit → PCM 16kHz 16-bit → Gemini
Gemini Response → PCM 24kHz 16-bit → μ-law 8kHz 8-bit → Output (Twilio)
```

## 🎭 Personality System

Each VoiceAgent instance is configured with a receptionist personality:

```typescript
interface ReceptionistPersonality {
    name: string;                    // "AI Receptionist"
    levelFormality: number;          // 1-10 (casual → formal)
    levelDynamism: number;           // 1-10 (calm → energetic)
    enterpriseInformation: string;   // Business context
    clientInformation: string;       // Client handling rules
    businessRestrictions: string;    // Operational boundaries
}
```

### System Prompt Generation
The personality configuration generates detailed system instructions that define the AI's behavior, tone, and knowledge base for each conversation.

## 🔧 Key Files & Responsibilities

| File | Purpose | Key Methods |
|------|---------|-------------|
| `twilio-media-stream.gateway.ts` | WebSocket gateway for Twilio | `handleConnection()`, `handleMedia()`, `initializeAgent()` |
| `voice-agent.ts` | Gemini Live API wrapper | `connect()`, `sendAudio()`, `onAudioResponse()` |
| `audio-utils.ts` | Audio format conversion | `twilioToGeminiAudio()`, `geminiToTwilioAudio()` |
| `twilio.service.ts` | Twilio API integration | Call management, TwiML generation |
| `twilio.controller.ts` | HTTP endpoints | Webhook handlers, call routing |

## 🌊 Real-Time Streaming Architecture

### WebSocket Connections
```
Twilio ↔ Gateway:     Media Streams WebSocket (persistent per call)
Gateway ↔ VoiceAgent: Callback system (in-process)
VoiceAgent ↔ Gemini:  Live API WebSocket (per session)
```

### Event-Driven Design
```
TWILIO EVENTS:
├── handleConnection()  → New WebSocket connection
├── handleMedia()       → Audio data chunks (μ-law 8kHz)
├── handleStop()        → Call ended, cleanup

VOICEAGENT EVENTS:
├── onAudioResponse()   → AI audio chunks (24kHz PCM)
├── onTextResponse()    → AI text responses
├── onerror()          → Connection/error handling
└── onclose()          → Session cleanup
```

### Session Management
```
PER-CALL ISOLATION:
├── Each phone call → Dedicated VoiceAgent instance
├── Separate WebSocket connections
├── Independent audio processing pipelines
└── Automatic resource cleanup on call end
```

## 🎵 Audio Format Specifications

```
┌─────────────┬────────────┬─────────────┬────────────┬──────────┐
│ Component   │ Format     │ Sample Rate │ Bit Depth  │ Encoding │
├─────────────┼────────────┼─────────────┼────────────┼──────────┤
│ Twilio In   │ μ-law      │ 8kHz        │ 8-bit      │ Mono     │
│ Gemini In   │ PCM        │ 16kHz       │ 16-bit     │ Mono     │
│ Gemini Out  │ PCM        │ 24kHz       │ 16-bit     │ Mono     │
│ Twilio Out  │ μ-law      │ 8kHz        │ 8-bit      │ Mono     │
└─────────────┴────────────┴─────────────┴────────────┴──────────┘
```

## ⚙️ Configuration

### Environment Variables
```bash
# Gemini API
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.0-flash-live-001

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### VoiceAgent Configuration
- **Model**: `gemini-2.0-flash-live-001` (configurable)
- **Voice**: Kore (professional female voice)
- **Modality**: Audio-only responses
- **VAD**: Automatic voice activity detection

## 🔄 Call Lifecycle

```
CALL JOURNEY STATE MACHINE:

[*] → Incoming Call → Twilio Answer → WebSocket Connect → Agent Init
      ↓                    ↓              ↓                  ↓
   Phone Rings      TwiML Response   Media Streams     VoiceAgent
      ↓                    ↓              ↓                  ↓
   User Answers     WebSocket Up     Audio Flow       Gemini Connect
      ↓                    ↓              ↓                  ↓
   Conversation     Audio Chunks     Bidirectional    AI Ready
      ↓                    ↓              ↓                  ↓
   User Speaks      μ-law 8kHz       Convert → 16kHz   Send to Gemini
      ↓                    ↓              ↓                  ↓
   AI Responds      ← 24kHz PCM      ← Convert 8kHz    Receive from AI
      ↓                    ↓              ↓                  ↓
   Call End         WebSocket Close  Cleanup Sessions  End Session
      ↓                    ↓              ↓                  ↓
   [*]            Resources Freed  Memory Cleanup    Connection Closed

KEY TRANSITIONS:
├── Agent Initialize: Create VoiceAgent, set personality, register callbacks
├── Gemini Connect: WebSocket to Live API, send system prompt, greeting
├── Audio Streaming: Continuous bidirectional audio processing
└── Cleanup: Automatic resource deallocation, session termination
```

### Key Lifecycle Events
1. **Incoming Call** → Twilio webhook triggers
2. **WebSocket Connect** → Media Streams established
3. **Agent Initialize** → VoiceAgent instance created
4. **Gemini Connect** → AI session established
5. **Audio Streaming** → Bidirectional audio flow
6. **Call End** → Resources cleaned up

## 📝 Audio Flow Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Browser   │         │   Your Server    │         │  Gemini AI      │
│  (VoIP)     │         │   (WebSocket)    │         │  (Live API)     │
└─────────────┘         └──────────────────┘         └─────────────────┘
      │                          │                             │
      │ 1. Start Call           │                             │
      ├────────────────────────►│                             │
      │                          │                             │
      │ 2. TwiML with Stream    │                             │
      │◄────────────────────────┤                             │
      │                          │                             │
      │ 3. WebSocket Connect    │                             │
      ├────────────────────────►│                             │
      │                          │ 4. Init VoiceAgent          │
      │                          ├────────────────────────────►│
      │                          │                             │
      │ 5. Audio (μ-law 8kHz)   │                             │
      ├────────────────────────►│ 6. Convert to PCM 16kHz     │
      │                          ├────────────────────────────►│
      │                          │                             │
      │                          │ 7. AI Response (PCM 24kHz)  │
      │ 8. Audio (μ-law 8kHz)   │◄────────────────────────────┤
      │◄────────────────────────┤ Convert back                │
      │                          │                             │
```
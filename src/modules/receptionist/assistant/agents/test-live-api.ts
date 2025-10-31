/**
 * Test script for Gemini Live API integration
 *
 * This script tests the VoiceAgent with Live API without Twilio
 *
 * Run with: npx ts-node src/modules/receptionist/assistant/agents/test-live-api.ts
 */

import { config as loadEnv } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { VoiceAgent } from './voice-agent';
import { ReceptionistPersonality } from '../types/receptionist-personality';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file
loadEnv();

// Mock ConfigService for testing
class MockConfigService extends ConfigService {
    private config = {
        'gemini.apiKey': process.env.GEMINI_API_KEY,
        'gemini.model': 'gemini-2.0-flash-live-001',
        'gemini.temperature': 1.0,
        'gemini.maxOutputTokens': 8192,
        'gemini.topP': 0.95,
        'gemini.topK': 40,
    };

    get<T = any>(key: string): T | undefined {
        return this.config[key] as T;
    }
}

async function testVoiceAgent() {
    console.log('🧪 Testing Gemini Live API Integration\n');

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY not found in environment variables');
        console.log('💡 Make sure you have a .env file with:');
        console.log('   GEMINI_API_KEY=your-key-here');
        process.exit(1);
    }

    console.log('✅ API Key found');

    // Create voice agent
    const configService = new MockConfigService();
    const voiceAgent = new VoiceAgent(configService);

    // Initialize the module
    console.log('📡 Initializing Voice Agent...');
    await voiceAgent.onModuleInit();
    console.log('✅ Voice Agent initialized\n');

    // Create test personality
    const testPersonality: ReceptionistPersonality = {
        name: 'Sophia',
        levelFormality: 7,
        levelDynamism: 8,
        enterpriseInformation:
            'We are a modern medical clinic providing healthcare services.',
        clientInformation:
            'Be friendly and helpful. Answer questions about appointments and services.',
        businessRestrictions:
            'Do not provide medical advice. Always suggest speaking with a doctor.',
    };

    // Initialize session
    console.log('🎯 Initializing session...');
    const session = await voiceAgent.initializeSession(
        testPersonality,
        'test-receptionist-001',
    );
    console.log('✅ Session initialized');
    console.log(`   Receptionist: ${testPersonality.name}`);
    console.log(`   Formality: ${testPersonality.levelFormality}/10`);
    console.log(`   Dynamism: ${testPersonality.levelDynamism}/10\n`);

    // Create output directory for audio files
    const outputDir = path.join(process.cwd(), 'test-audio-output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    let audioChunks: Buffer[] = [];
    let chunkCount = 0;

    // Set up audio response handler
    console.log('🎧 Setting up audio response handler...');
    session.onAudioResponse((audioData: Buffer) => {
        chunkCount++;
        audioChunks.push(audioData);
        console.log(
            `   📦 Received audio chunk #${chunkCount}: ${audioData.length} bytes`,
        );
    });

    // Set up text response handler (for debugging)
    session.onTextResponse((text: string) => {
        console.log(`   💬 Text response: ${text}`);
    });

    console.log('✅ Response handlers registered\n');

    // Connect to Live API
    console.log('🔌 Connecting to Gemini Live API...');
    await session.connect(testPersonality);
    console.log('✅ Connected to Live API\n');

    // Wait a moment for connection to stabilize
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 1: Send text input
    console.log('📝 Test 1: Sending text input...');
    console.log('   Input: "Hello, I would like to schedule an appointment"');
    await session.sendText('Hello, I would like to schedule an appointment');

    // Wait for response (Live API streams response)
    console.log('⏳ Waiting for response (10 seconds)...\n');
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Save audio output
    if (audioChunks.length > 0) {
        const audioBuffer = Buffer.concat(audioChunks);
        const outputPath = path.join(outputDir, 'test-response.pcm');
        fs.writeFileSync(outputPath, audioBuffer);
        console.log(
            `\n💾 Saved ${audioChunks.length} audio chunks to: ${outputPath}`,
        );
        console.log(`   Total size: ${audioBuffer.length} bytes`);
        console.log(`   Format: 24kHz PCM, mono, 16-bit`);
        console.log(
            `   Duration: ~${(audioBuffer.length / 2 / 24000).toFixed(2)} seconds\n`,
        );

        // Create instructions for playing the audio
        console.log('🔊 To play this audio (convert to WAV first):');
        console.log(
            `   ffmpeg -f s16le -ar 24000 -ac 1 -i "${outputPath}" "${path.join(outputDir, 'test-response.wav')}"`,
        );
        console.log(
            `   Then open: ${path.join(outputDir, 'test-response.wav')}\n`,
        );
    } else {
        console.log('\n⚠️  No audio chunks received. Possible issues:');
        console.log('   - Model might be responding with text only');
        console.log('   - Response modality might not be set to audio');
        console.log('   - Connection might have dropped\n');
    }

    // Test session info
    console.log('ℹ️  Session Info:');
    const info = session.getReceptionistInfo();
    console.log(`   ID: ${info.id}`);
    console.log(`   Name: ${info.name}`);
    console.log(`   Formality: ${info.personality.formality}/10`);
    console.log(`   Dynamism: ${info.personality.dynamism}/10`);
    console.log(`   Connected: ${session.isSessionConnected()}\n`);

    // Clean up
    console.log('🧹 Cleaning up...');
    await session.endSession();
    console.log('✅ Session ended');

    console.log('\n✨ Test completed successfully!\n');
}

// Run test
testVoiceAgent().catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
});

/**
 * Audio utilities for converting between Twilio (μ-law 8kHz) and Gemini (PCM 16kHz) formats
 * Using wavefile library for robust audio processing
 */

import { WaveFile } from 'wavefile';

/**
 * Check if audio buffer contains actual signal (not silence)
 * @param pcmBuffer - Buffer containing 16-bit PCM samples
 * @returns True if audio has signal, false if silent
 */
export function hasAudioSignal(pcmBuffer: Buffer): boolean {
    // Calculate RMS (Root Mean Square) to detect signal
    let sum = 0;
    const sampleCount = pcmBuffer.length / 2;

    for (let i = 0; i < pcmBuffer.length; i += 2) {
        const sample = pcmBuffer.readInt16LE(i);
        sum += sample * sample;
    }

    const rms = Math.sqrt(sum / sampleCount);
    // Threshold for detecting audio (adjust if needed)
    return rms > 100;
}


/**
 * Convert Twilio μ-law 8kHz audio to Gemini PCM 16kHz format
 * Uses wavefile library for robust audio processing
 * @param mulawBuffer - Buffer containing μ-law encoded audio from Twilio
 * @returns Buffer containing 16-bit PCM audio at 16kHz for Gemini
 */
export function twilioToGeminiAudio(mulawBuffer: Buffer): Buffer {
    try {
        const wav = new WaveFile();

        // Create μ-law WAV: 1 channel, 8kHz, 8-bit μ-law
        wav.fromScratch(1, 8000, '8m', Array.from(mulawBuffer));

        // Convert μ-law to PCM
        wav.fromMuLaw();

        // Convert to 16-bit PCM
        wav.toBitDepth('16');

        // Resample to 16kHz
        wav.toSampleRate(16000);

        // Get raw PCM data
        const samples = wav.getSamples(false) as Float64Array;

        // Convert Float64Array to Int16 Buffer
        const pcmBuffer = Buffer.alloc(samples.length * 2);
        for (let i = 0; i < samples.length; i++) {
            const value = Math.max(
                -32768,
                Math.min(32767, Math.round(samples[i])),
            );
            pcmBuffer.writeInt16LE(value, i * 2);
        }

        return pcmBuffer;
    } catch (error) {
        console.error('Error converting Twilio to Gemini audio:', error);
        // Fallback to silence if conversion fails
        return Buffer.alloc(mulawBuffer.length * 4, 0);
    }
}

/**
 * Convert Gemini PCM 24kHz audio to Twilio μ-law 8kHz format
 * Uses wavefile library for robust audio processing
 * @param pcm24khz - Buffer containing 16-bit PCM audio at 24kHz from Gemini
 * @returns Buffer containing μ-law encoded audio at 8kHz for Twilio
 */
export function geminiToTwilioAudio(pcm24khz: Buffer): Buffer {
    try {
        // Convert Buffer to sample array
        const sampleCount = pcm24khz.length / 2;
        const samples: number[] = [];
        for (let i = 0; i < sampleCount; i++) {
            samples.push(pcm24khz.readInt16LE(i * 2));
        }

        // Create WAV from PCM: 1 channel, 24kHz, 16-bit
        const wav = new WaveFile();
        wav.fromScratch(1, 24000, '16', samples);

        // Downsample to 8kHz (with built-in anti-aliasing)
        wav.toSampleRate(8000);

        // Convert to μ-law
        wav.toMuLaw();

        // Get μ-law data
        const mulawSamples = wav.getSamples(false) as Float64Array;

        // Convert to Buffer
        const mulawBuffer = Buffer.alloc(mulawSamples.length);
        for (let i = 0; i < mulawSamples.length; i++) {
            mulawBuffer[i] = Math.round(mulawSamples[i]) & 0xff;
        }

        return mulawBuffer;
    } catch (error) {
        console.error('Error converting Gemini to Twilio audio:', error);
        // Fallback to silence
        return Buffer.alloc(Math.floor(pcm24khz.length / 6), 0xff);
    }
}

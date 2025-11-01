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
/**
 * Convert Twilio μ-law 8kHz audio to Gemini PCM 16kHz format
 * Returns a payload object ready to send to Gemini Live API:
 * { mimeType: 'audio/pcm;rate=16000', data: '<base64>' }
 */
export function twilioToGeminiAudio(mulawBuffer: Buffer): { mimeType: string; data: string } {
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

        // Extract numeric samples from the WaveFile. The wavefile library
        // may return either floats in [-1,1] or integer sample values
        // depending on the internal representation. Normalize both cases
        // to signed 16-bit little-endian PCM (linear16) which the Live API
        // expects for mimeType 'audio/pcm;rate=16000'.
    // wavefile returns a typed array (Float64Array). Convert to a plain
    // number[] to make subsequent handling and TS typing straightforward.
    const samples = Array.from(wav.getSamples(false) as Float64Array);

        // Convert numeric samples to Int16LE Buffer (raw PCM, no WAV header)
        const pcmBuffer = Buffer.alloc(samples.length * 2);
        for (let i = 0; i < samples.length; i++) {
            const s = samples[i];
            let intSample = 0;

            if (typeof s === 'number' && Number.isFinite(s)) {
                // If sample is float in [-1,1], scale to 16-bit range
                if (Math.abs(s) <= 1) {
                    intSample = Math.round(s * 32767);
                } else {
                    // Already integer-like sample
                    intSample = Math.round(s);
                }
            }

            // Clamp to int16 range
            if (intSample > 32767) intSample = 32767;
            if (intSample < -32768) intSample = -32768;

            pcmBuffer.writeInt16LE(intSample, i * 2);
        }

        // Return payload ready for Gemini Live API: raw PCM bytes (base64) and matching mimeType
        return {
            mimeType: 'audio/pcm;rate=16000',
            data: pcmBuffer.toString('base64'),
        };
    } catch (error) {
        console.error('Error converting Twilio to Gemini audio:', error);
        // Fallback to an empty payload (silence)
        const empty = Buffer.alloc(1600, 0);
        return {
            mimeType: 'audio/pcm;rate=16000',
            data: empty.toString('base64'),
        };
    }
}

/**
 * Decode μ-law buffer (8kHz) to raw PCM 16-bit little-endian Buffer at 8kHz
 * This returns raw linear16 PCM bytes (no WAV header) which is useful for
 * debugging the pre-resample audio stage.
 */
export function mulawToPcm8k(mulawBuffer: Buffer): Buffer {
    try {
        const wav = new WaveFile();
        // Create μ-law WAV: 1 channel, 8kHz, 8-bit μ-law
        wav.fromScratch(1, 8000, '8m', Array.from(mulawBuffer));
        // Convert μ-law to PCM and to 16-bit depth (but do NOT resample)
        wav.fromMuLaw();
        wav.toBitDepth('16');

        // Extract samples and write as Int16LE buffer
        const samples = Array.from(wav.getSamples(false) as Float64Array);
        const pcmBuffer = Buffer.alloc(samples.length * 2);
        for (let i = 0; i < samples.length; i++) {
            const s = samples[i];
            let intSample = 0;
            if (typeof s === 'number' && Number.isFinite(s)) {
                if (Math.abs(s) <= 1) {
                    intSample = Math.round(s * 32767);
                } else {
                    intSample = Math.round(s);
                }
            }
            if (intSample > 32767) intSample = 32767;
            if (intSample < -32768) intSample = -32768;
            pcmBuffer.writeInt16LE(intSample, i * 2);
        }
        return pcmBuffer;
    } catch (error) {
        console.error('Error decoding μ-law to PCM8k:', error);
        return Buffer.alloc(0);
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

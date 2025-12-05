/**
 * Audio utilities for converting between Twilio (μ-law 8kHz) and Gemini (PCM 16kHz) formats
 * Using wavefile library for robust audio processing
 */

import { WaveFile } from 'wavefile';
import config from '../../config/configuration';

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
  // Threshold for detecting audio
  return rms > config().twilio.audioSignalThreshold;
}

/**
 * Convert Twilio μ-law 8kHz audio to Gemini PCM 16kHz format
 * Uses wavefile library for robust audio processing
 * @param mulawBuffer - Buffer containing μ-law encoded audio from Twilio
 * @returns Buffer containing 16-bit PCM audio at 16kHz for Gemini
 */
// Pre-compute μ-law to linear PCM lookup table
const MU_LAW_DECODE_TABLE = new Int16Array(256);
for (let i = 0; i < 256; i++) {
  const mu = ~i;
  const sign = (mu & 0x80) >> 7;
  const exponent = (mu & 0x70) >> 4;
  const mantissa = mu & 0x0F;
  let sample = ((mantissa << 3) + 0x84) << exponent;
  sample -= 0x84;
  if (sign === 0) sample = -sample;
  MU_LAW_DECODE_TABLE[i] = sample;
}

/**
 * Convert Twilio μ-law 8kHz audio to Gemini PCM 16kHz format
 * Optimized version: Uses lookup table and simple sample duplication (upsampling)
 * @param mulawBuffer - Buffer containing μ-law encoded audio from Twilio
 * @returns Payload object ready to send to Gemini Live API
 */
export function twilioToGeminiAudio(mulawBuffer: Buffer): {
  mimeType: string;
  data: string;
} {
  try {
    // Calculate output size: input length * 2 (bytes per sample) * 2 (upsampling 8k->16k)
    const outputSize = mulawBuffer.length * 4;
    const pcmBuffer = Buffer.allocUnsafe(outputSize);

    let offset = 0;
    for (let i = 0; i < mulawBuffer.length; i++) {
      const byte = mulawBuffer[i];
      const sample = MU_LAW_DECODE_TABLE[byte];

      // Write 16-bit sample twice (upsampling 8kHz -> 16kHz)
      pcmBuffer.writeInt16LE(sample, offset);
      offset += 2;
      pcmBuffer.writeInt16LE(sample, offset);
      offset += 2;
    }

    return {
      mimeType: 'audio/pcm;rate=16000',
      data: pcmBuffer.toString('base64'),
    };
  } catch (error) {
    console.error('Error converting Twilio to Gemini audio:', error);
    return {
      mimeType: 'audio/pcm;rate=16000',
      data: '',
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

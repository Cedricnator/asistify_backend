import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Twilio Service
 *
 * Handles Twilio-specific logic for VoIP:
 * - Access token generation for Twilio Voice Client
 * - TwiML generation for VoIP calls
 * - Call management
 */
@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate Twilio Voice Access Token for VoIP client
   *
   * This token allows a web/mobile client to connect to Twilio Voice
   * without needing a phone number.
   *
   * @param identity - Unique identifier for the client (e.g., user ID, session ID)
   * @returns Access token for the Voice Client SDK
   */
  generateVoiceAccessToken(identity: string): string {
    // We'll use the Twilio SDK to generate this
    // For now, returning a placeholder - will implement with Twilio SDK
    this.logger.log(`Generating voice access token for identity: ${identity}`);

    const accountSid = this.configService.get<string>('twilio.accountSid');
    const apiKeySid = this.configService.get<string>('twilio.apiKeySid');
    const apiKeySecret = this.configService.get<string>('twilio.apiKeySecret');
    const twimlAppSid = this.configService.get<string>('twilio.twimlAppSid');

    if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
      this.logger.error('Missing Twilio VoIP configuration');
      throw new Error(
        'Twilio VoIP not configured. Please set TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, and TWILIO_TWIML_APP_SID',
      );
    }

    const AccessToken = require('twilio').jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity: identity,
      ttl: 3600, // 1 hour
    });

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);
    return token.toJwt();
  }

  /**
   * Generate TwiML response for incoming VoIP call with Media Streams
   * This connects the VoIP client to the AI receptionist via WebSocket
   *
   * @param streamUrl - WebSocket URL for Media Streams (e.g., wss://your-domain.com/twilio/media-stream)
   */
  generateIncomingCallTwiML(streamUrl?: string): string {
    this.logger.log('Generating TwiML for incoming VoIP call');

    // If no stream URL provided, use simple greeting
    if (!streamUrl) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">Hello! You've reached our AI receptionist. Please hold while we connect you.</Say>
    <Pause length="1"/>
    <Say voice="Polly.Joanna">VoIP connection established. Media streaming coming soon!</Say>
</Response>`;
    }

    // Use Media Streams to connect to Gemini AI
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">Connecting you to our AI receptionist.</Say>
    <Connect>
        <Stream url="${streamUrl}" />
    </Connect>
</Response>`;
  }

  /**
   * Generate TwiML for Media Streams (future implementation)
   */
  generateMediaStreamTwiML(streamUrl: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">Connecting to our AI receptionist.</Say>
    <Connect>
        <Stream url="${streamUrl}" />
    </Connect>
</Response>`;
  }

  /**
   * Validate Twilio webhook signature (future implementation)
   */
  validateWebhookSignature(
    signature: string,
    url: string,
    params: any,
  ): boolean {
    // TODO: Implement Twilio signature validation
    // For now, accept all requests (development only)
    this.logger.warn('Webhook signature validation not implemented');
    return true;
  }
}

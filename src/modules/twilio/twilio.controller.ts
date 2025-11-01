import {
    Controller,
    Post,
    Get,
    Body,
    Headers,
    Logger,
    Res,
    Query,
    HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { TwilioService } from './twilio.service';

/**
 * Twilio Webhook Controller
 *
 * Handles Twilio VoIP integration:
 * - Access token generation for Voice Client SDK
 * - Voice call webhooks
 * - Status callbacks
 */
@Controller('twilio')
export class TwilioWebhookController {
    private readonly logger = new Logger(TwilioWebhookController.name);

    constructor(private readonly twilioService: TwilioService) {}

    /**
     * Generate Voice Access Token for VoIP client
     *
     * GET /twilio/token?identity=user123
     *
     * This endpoint generates a JWT token that allows a web/mobile client
     * to connect to Twilio Voice without needing a phone number.
     *
     * Usage:
     * 1. Client requests token with unique identity
     * 2. Client uses token to initialize Twilio Voice Client SDK
     * 3. Client can make/receive calls through browser/app
     *
     * @param identity - Unique identifier for the user/session
     * @returns JWT access token
     */
    @Get('token')
    getVoiceAccessToken(@Query('identity') identity: string) {
        if (!identity) {
            this.logger.error('Token request missing identity');
            return {
                error: 'Missing required parameter: identity',
                message:
                    'Please provide an identity query parameter (e.g., /twilio/token?identity=user123)',
            };
        }

        this.logger.log(`Generating access token for identity: ${identity}`);

        try {
            const token = this.twilioService.generateVoiceAccessToken(identity);
            return {
                token,
                identity,
                expiresIn: 3600, // 1 hour
            };
        } catch (error) {
            this.logger.error('Error generating access token:', error.message);
            return {
                error: 'Failed to generate access token',
                message: error.message,
            };
        }
    }

    /**
     * Handle incoming VoIP voice call
     *
     * POST /twilio/webhook/voice
     *
     * This endpoint receives webhooks when a VoIP client initiates a call.
     * Returns TwiML instructions for how Twilio should handle the call.
     *
     */
    @Post('webhook/voice')
    handleVoiceCall(
        @Body() body: any,
        @Headers('x-twilio-signature') signature: string,
        @Headers('host') host: string,
        @Res() res: Response,
    ) {
        this.logger.log('Received VoIP voice call webhook');
        this.logger.debug('Call details:', body);

        // Log call information
        const { From, To, CallSid, CallStatus } = body;
        this.logger.log(
            `VoIP call from ${From} to ${To} (SID: ${CallSid}, Status: ${CallStatus})`,
        );

        // Build WebSocket URL for Media Streams
        // In production, use your actual domain. For development, use ngrok URL
        const protocol = 'wss'; // Always use secure WebSocket
        const streamUrl = `${protocol}://${host}/twilio/media-stream`;

        this.logger.log(`Media Stream URL: ${streamUrl}`);

        // Validate webhook signature (skip for development)
        // const isValid = this.twilioService.validateWebhookSignature(
        //     signature,
        //     req.url,
        //     body,
        // );

        // Generate TwiML response with Media Streams
        const twiml = this.twilioService.generateIncomingCallTwiML(streamUrl);

        // Send TwiML response
        res.status(HttpStatus.OK).type('text/xml').send(twiml);
    }

    /**
     * Handle call status updates
     *
     * POST /twilio/webhook/status
     *
     * Twilio sends status updates throughout the call lifecycle:
     * - queued, ringing, in-progress, completed, failed, busy, no-answer
     */
    @Post('webhook/status')
    handleStatusCallback(@Body() body: any) {
        this.logger.log('Received status callback');
        this.logger.debug('Status details:', body);

        const { CallSid, CallStatus, CallDuration } = body;
        this.logger.log(
            `Call ${CallSid} status: ${CallStatus} (Duration: ${CallDuration}s)`,
        );

        return { message: 'Status received' };
    }
}

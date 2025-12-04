import { Module } from '@nestjs/common';
import { TwilioWebhookController } from './twilio.controller';
import { TwilioService } from './twilio.service';
import { TwilioMediaStreamGateway } from './twilio-media-stream.gateway';
import { ReceptionistModule } from '../receptionist/receptionist.module';
import { MetricsModule } from '../metrics/metrics.module';

/**
 * Twilio Module
 *
 * Handles Twilio integration for voice calls:
 * - Webhook endpoints for incoming calls
 * - Media Streams WebSocket gateway for real-time audio with Gemini AI
 * - Call management and routing
 */
@Module({
  imports: [ReceptionistModule, MetricsModule],
  controllers: [TwilioWebhookController],
  providers: [TwilioService, TwilioMediaStreamGateway],
  exports: [TwilioService],
})
export class TwilioModule {}

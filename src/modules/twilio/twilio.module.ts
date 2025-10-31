import { Module } from '@nestjs/common';
import { TwilioWebhookController } from './twilio.controller';
import { TwilioService } from './twilio.service';
import { ReceptionistModule } from '../receptionist/receptionist.module';

/**
 * Twilio Module
 *
 * Handles Twilio integration for voice calls:
 * - Webhook endpoints for incoming calls
 * - Media Streams for real-time audio (future)
 * - Call management and routing
 */
@Module({
    imports: [ReceptionistModule],
    controllers: [TwilioWebhookController],
    providers: [TwilioService],
    exports: [TwilioService],
})
export class TwilioModule {}

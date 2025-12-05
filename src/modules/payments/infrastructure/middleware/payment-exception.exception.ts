import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentRequiredException extends HttpException {
  constructor(message = 'Payment required to access this resource') {
    super(
      {
        message,
        code: 'PAYMENT_REQUIRED',
      },
      HttpStatus.PAYMENT_REQUIRED, // 402
    );
  }
}
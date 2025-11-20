export class PaymentMethodEntity {
  constructor(
    public readonly id: string,
    public readonly number: string,
    public readonly cvc: string,
    public readonly expiry: string,
  ) {}
}

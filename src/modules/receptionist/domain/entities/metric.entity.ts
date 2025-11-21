export class MetricEntity {
  constructor(
    public readonly id: string,
    public readonly modelUsed: string,
    public readonly tokenUsage: number,
    public readonly responseTimeMs: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly receptionistId: string,
  ) {}
}

interface MetricBuilder {
  withId(id: string): MetricBuilder;
  withModelUsed(modelUsed: string): MetricBuilder;
  withTokenUsage(tokenUsage: number): MetricBuilder;
  withResponseTimeMs(responseTimeMs: number): MetricBuilder;
  withCreatedAt(createdAt: Date): MetricBuilder;
  withUpdatedAt(updatedAt: Date): MetricBuilder;
  withReceptionistId(receptionistId: string): MetricBuilder;
  build(): MetricEntity;
}

export class ConcreteMetricBuilder implements MetricBuilder {
  private id: string;
  private modelUsed: string;
  private tokenUsage: number;
  private responseTimeMs: number;
  private createdAt: Date;
  private updatedAt: Date;
  private receptionistId: string;

  withId(id: string): MetricBuilder {
    if (!id) {
      throw new Error('ID cannot be empty');
    }
    this.id = id;
    return this;
  }

  withModelUsed(modelUsed: string): MetricBuilder {
    if (!modelUsed) {
      throw new Error('ModelUsed cannot be empty');
    }
    this.modelUsed = modelUsed;
    return this;
  }

  withTokenUsage(tokenUsage: number): MetricBuilder {
    if (tokenUsage == null || tokenUsage < 0) {
      throw new Error('TokenUsage must be a non-negative number');
    }
    this.tokenUsage = tokenUsage;
    return this;
  }

  withResponseTimeMs(responseTimeMs: number): MetricBuilder {
    if (responseTimeMs == null || responseTimeMs < 0) {
      throw new Error('ResponseTimeMs must be a non-negative number');
    }
    this.responseTimeMs = responseTimeMs;
    return this;
  }

  withCreatedAt(createdAt: Date): MetricBuilder {
    if (!createdAt) {
      throw new Error('CreatedAt cannot be empty');
    }
    this.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): MetricBuilder {
    if (!updatedAt) {
      throw new Error('UpdatedAt cannot be empty');
    }
    this.updatedAt = updatedAt;
    return this;
  }

  withReceptionistId(receptionistId: string): MetricBuilder {
    if (!receptionistId) {
      throw new Error('ReceptionistId cannot be empty');
    }
    this.receptionistId = receptionistId;
    return this;
  }

  build(): MetricEntity {
    return new MetricEntity(
      this.id,
      this.modelUsed,
      this.tokenUsage,
      this.responseTimeMs,
      this.createdAt,
      this.updatedAt,
      this.receptionistId,
    );
  }
}

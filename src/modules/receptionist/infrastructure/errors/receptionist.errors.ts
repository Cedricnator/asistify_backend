import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

/**
 * Thrown when a receptionist is not found by ID
 */
export class ReceptionistNotFoundException extends NotFoundException {
  constructor(id: string) {
    super({
      message: `Receptionist with ID "${id}" not found`,
      error: 'ReceptionistNotFound',
      statusCode: 404,
    });
  }
}

/**
 * Thrown when trying to create a receptionist that already exists
 */
export class ReceptionistAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super({
      message: `Receptionist with identifier "${identifier}" already exists`,
      error: 'ReceptionistAlreadyExists',
      statusCode: 409,
    });
  }
}

/**
 * Thrown when receptionist data is invalid
 */
export class InvalidReceptionistDataException extends BadRequestException {
  constructor(field: string, reason: string) {
    super({
      message: `Invalid receptionist data: ${field} - ${reason}`,
      error: 'InvalidReceptionistData',
      statusCode: 400,
    });
  }
}

/**
 * Thrown when enterprise doesn't exist for receptionist creation
 */
export class EnterpriseNotFoundException extends NotFoundException {
  constructor(enterpriseId: string) {
    super({
      message: `Enterprise with ID "${enterpriseId}" not found`,
      error: 'EnterpriseNotFound',
      statusCode: 404,
    });
  }
}

/**
 * Thrown when trying to delete a receptionist that has dependencies
 */
export class ReceptionistHasDependenciesException extends ConflictException {
  constructor(id: string, dependencies: string) {
    super({
      message: `Cannot delete receptionist "${id}" because it has ${dependencies}`,
      error: 'ReceptionistHasDependencies',
      statusCode: 409,
    });
  }
}

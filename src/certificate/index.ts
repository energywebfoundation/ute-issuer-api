import { BlockchainProperties, Certificate, CertificationRequest } from '@energyweb/issuer-api';

export * from './certificate.controller';
export * from './certificate.module';

export const entities = [Certificate, BlockchainProperties, CertificationRequest];

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import {
    Certificate,
    BlockchainPropertiesModule,
    CertificateHandlers,
    OnChainCertificateWatcher
} from '@energyweb/issuer-api';
import { CertificateController } from './certificate.controller';

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Certificate]), BlockchainPropertiesModule],
    controllers: [CertificateController],
    providers: [...CertificateHandlers, OnChainCertificateWatcher],
    exports: [...CertificateHandlers, OnChainCertificateWatcher]
})
export class CertificateModule {}

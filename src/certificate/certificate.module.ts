import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import {
    BlockchainPropertiesModule,
    Certificate,
    CertificateHandlers,
    OnChainCertificateWatcher
} from '@energyweb/issuer-api';
import { CertificateController } from './certificate.controller';

@Module({
    imports: [
        ConfigModule,
        CqrsModule,
        TypeOrmModule.forFeature([Certificate]),
        BlockchainPropertiesModule
    ],
    controllers: [CertificateController],
    providers: [...CertificateHandlers, OnChainCertificateWatcher],
    exports: [...CertificateHandlers, OnChainCertificateWatcher]
})
export class CertificateModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainProperties, BlockchainPropertiesService } from '@energyweb/issuer-api';
import { ConfigModule } from '@nestjs/config';
import { BlockchainPropertiesController } from './blockchain-properties.controller';

@Module({
    imports: [TypeOrmModule.forFeature([BlockchainProperties]), ConfigModule],
    controllers: [BlockchainPropertiesController],
    providers: [BlockchainPropertiesService],
    exports: [BlockchainPropertiesService]
})
export class BlockchainPropertiesModule {}

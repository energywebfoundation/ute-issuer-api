import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Account } from './account.entity';
import { BlockchainPropertiesModule } from '../blockchain/blockchain-properties.module';

@Module({
    imports: [TypeOrmModule.forFeature([Account]), ConfigModule, BlockchainPropertiesModule],
    controllers: [AccountController],
    providers: [AccountService],
    exports: [AccountService]
})
export class AccountModule {}

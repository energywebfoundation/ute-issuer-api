import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HTTPLoggingInterceptor } from '@energyweb/origin-backend-utils';
import { CertificateModule, entities as CertificateEntities } from './certificate';
import { BlockchainPropertiesModule, entities as BlockchainPropertiesEntities } from './blockchain';
import { AccountModule } from './account/account.module';
import { Account } from './account/account.entity';

const OriginAppTypeOrmModule = () => {
    const entities = [...CertificateEntities, ...BlockchainPropertiesEntities, Account];

    return process.env.DATABASE_URL
        ? TypeOrmModule.forRoot({
              type: 'postgres',
              url: process.env.DATABASE_URL,
              ssl: {
                  rejectUnauthorized: false
              },
              entities,
              logging: ['info']
          })
        : TypeOrmModule.forRoot({
              type: 'postgres',
              host: process.env.DB_HOST ?? 'localhost',
              port: Number(process.env.DB_PORT ?? 5432),
              username: process.env.DB_USERNAME ?? 'postgres',
              password: process.env.DB_PASSWORD ?? 'postgres',
              database: process.env.DB_DATABASE ?? 'ute-issuer',
              entities,
              logging: ['log']
          });
};

@Module({
    imports: [
        OriginAppTypeOrmModule(),
        ConfigModule.forRoot(),
        CertificateModule,
        BlockchainPropertiesModule,
        CqrsModule,
        AccountModule
    ],
    providers: [{ provide: APP_INTERCEPTOR, useClass: HTTPLoggingInterceptor }]
})
export class UteAppModule {}

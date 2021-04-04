import { ConfigService } from '@nestjs/config';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class UteIssuerGuard implements CanActivate {
    public constructor(private readonly configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const request: Request = context.switchToHttp().getRequest();

        if (request.headers['api-key'] === this.configService.get<string>('UTE_ISSUER_API_KEY')) {
            return true;
        }

        throw new ForbiddenException();
    }
}

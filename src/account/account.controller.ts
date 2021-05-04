import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { UteIssuerGuard } from '../ute-issuer.guard';
import { AccountDTO } from './account.dto';
import { AccountService } from './account.service';

@ApiSecurity('ute-api-key')
@ApiTags('account')
@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    @Get()
    @UseGuards(UteIssuerGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: AccountDTO,
        description: 'Creates a new blockchain account'
    })
    public async create(): Promise<AccountDTO> {
        return this.accountService.create();
    }
}

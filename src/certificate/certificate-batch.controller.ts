import {
    BatchIssueCertificatesCommand,
    BatchIssueCertificateDTO,
    BatchTransferCertificatesCommand,
    BatchClaimCertificatesCommand,
    BatchCertificateClaimDTO,
    BatchCertificateTransferDTO,
    TxHashDTO
} from '@energyweb/issuer-api';
import { ExceptionInterceptor } from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Post,
    UseGuards,
    Put,
    UseInterceptors,
    HttpStatus,
    UsePipes,
    ValidationPipe,
    Query,
    HttpCode
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiBody, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { BigNumber } from 'ethers';

import { UteIssuerGuard } from '../ute-issuer.guard';

@ApiTags('certificates')
@ApiSecurity('ute-api-key')
@Controller('certificate-batch')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class CertificateBatchController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post('issue')
    @HttpCode(HttpStatus.OK)
    @UseGuards(UteIssuerGuard)
    @ApiBody({ type: [BatchIssueCertificateDTO] })
    @ApiOkResponse({
        type: TxHashDTO,
        description: 'Triggers a Batch Issuance transaction and returns the transaction hash'
    })
    public async batchIssue(
        @Body() certificatesInfo: BatchIssueCertificateDTO[]
    ): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
            new BatchIssueCertificatesCommand(certificatesInfo)
        );

        return { txHash: tx.hash };
    }

    @Put('transfer')
    @UseGuards(UteIssuerGuard)
    @ApiBody({ type: BatchCertificateTransferDTO })
    @ApiOkResponse({
        type: TxHashDTO,
        description: 'Triggers a Batch Transfer transaction and returns the transaction hash'
    })
    public async batchTransfer(
        @Query('fromAddress') fromAddress: string,
        @Body() transfers: [BatchCertificateTransferDTO]
    ): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
            new BatchTransferCertificatesCommand(
                transfers.map((transfer) => ({
                    ...transfer,
                    amount: transfer.amount ? BigNumber.from(transfer.amount) : undefined,
                    from: transfer.from ?? fromAddress
                }))
            )
        );

        return { txHash: tx.hash };
    }

    @Put('claim')
    @UseGuards(UteIssuerGuard)
    @ApiBody({ type: BatchCertificateClaimDTO })
    @ApiOkResponse({
        type: TxHashDTO,
        description: 'Triggers a Batch Claim transaction and returns the transaction hash'
    })
    public async batchClaim(
        @Query('fromAddress') fromAddress: string,
        @Body() claims: BatchCertificateClaimDTO[]
    ): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
            new BatchClaimCertificatesCommand(
                claims.map((claim) => ({
                    ...claim,
                    amount: claim.amount ? BigNumber.from(claim.amount) : undefined,
                    from: claim.from ?? fromAddress,
                    to: claim.to ?? fromAddress
                }))
            )
        );

        return { txHash: tx.hash };
    }
}

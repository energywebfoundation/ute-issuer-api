import {
    BatchIssueCertificatesCommand,
    BatchIssueCertificateDTO,
    BatchTransferCertificatesCommand,
    BatchTransferCertificatesDTO,
    BatchClaimCertificatesCommand,
    BatchClaimCertificatesDTO,
    CertificateIdsDTO
} from '@energyweb/issuer-api';
import { ExceptionInterceptor, SuccessResponseDTO } from '@energyweb/origin-backend-utils';
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
    Query
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UteIssuerGuard } from '../ute-issuer.guard';

@ApiTags('certificates')
@ApiSecurity('ute-api-key')
@Controller('certificate-batch')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class CertificateBatchController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post('issue')
    @UseGuards(UteIssuerGuard)
    @ApiBody({ type: [BatchIssueCertificateDTO] })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: CertificateIdsDTO,
        description: 'Returns the IDs of created certificates'
    })
    public async batchIssue(
        @Body() certificatesInfo: BatchIssueCertificateDTO[]
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(new BatchIssueCertificatesCommand(certificatesInfo));
    }

    @Put('transfer')
    @UseGuards(UteIssuerGuard)
    @ApiBody({ type: BatchTransferCertificatesDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the batch claim succeeded'
    })
    public async batchTransfer(
        @Query('fromAddress') fromAddress: string,
        @Body() { certificateAmounts, to }: BatchTransferCertificatesDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new BatchTransferCertificatesCommand(certificateAmounts, to, fromAddress)
        );
    }

    @Put('claim')
    @UseGuards(UteIssuerGuard)
    @ApiBody({ type: BatchClaimCertificatesDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the batch claim succeeded'
    })
    public async batchClaim(
        @Query('fromAddress') fromAddress: string,
        @Body() { certificateAmounts, claimData }: BatchClaimCertificatesDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new BatchClaimCertificatesCommand(certificateAmounts, claimData, fromAddress)
        );
    }
}

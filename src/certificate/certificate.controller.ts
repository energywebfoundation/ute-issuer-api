import { BigNumber } from 'ethers';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ExceptionInterceptor } from '@energyweb/origin-backend-utils';
import {
    Certificate,
    CertificateDTO,
    CertificateEvent,
    certificateToDto,
    ClaimCertificateCommand,
    GetAllCertificateEventsQuery,
    GetAllCertificatesQuery,
    GetCertificateByTxHashQuery,
    GetCertificateQuery,
    IssueCertificateCommand,
    TransferCertificateCommand,
    TxHashDTO
} from '@energyweb/issuer-api';

import { UteIssuerGuard } from '../ute-issuer.guard';
import { IssueCertificateDTO } from './dto/issue-certificate.dto';
import { TransferCertificateDTO } from './dto/transfer-certificate.dto';
import { ClaimCertificateDTO } from './dto/claim-certificate.dto';

@ApiSecurity('ute-api-key')
@ApiTags('certificates')
@Controller('certificate')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class CertificateController {
    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

    @Get('/:id')
    @UseGuards(UteIssuerGuard)
    @ApiOkResponse({
        type: CertificateDTO,
        description: 'Returns a Certificate'
    })
    public async get(
        @Param('id', new ParseIntPipe()) id: number,
        @Query('blockchainAddress') blockchainAddress: string
    ): Promise<CertificateDTO> {
        const certificate = await this.queryBus.execute<GetCertificateQuery, Certificate>(
            new GetCertificateQuery(id)
        );

        if (!certificate) {
            throw new NotFoundException(`Certificate with ID ${id} does not exist.`);
        }

        return certificateToDto(certificate, blockchainAddress);
    }

    @Get('/by-transaction/:txHash')
    @UseGuards(UteIssuerGuard)
    @ApiOkResponse({
        type: [CertificateDTO],
        description: 'Returns Certificates that were created in the transaction'
    })
    public async getByTxHash(
        @Query('blockchainAddress') blockchainAddress: string,
        @Param('txHash') txHash: string
    ): Promise<CertificateDTO[]> {
        const certificates = await this.queryBus.execute<
            GetCertificateByTxHashQuery,
            Certificate[]
        >(new GetCertificateByTxHashQuery(txHash));

        if (certificates?.length === 0) {
            throw new NotFoundException(
                `No certificates were issued in the tx with hash ${txHash}.`
            );
        }

        return certificates.map((cert) => certificateToDto(cert, blockchainAddress));
    }

    @Get()
    @UseGuards(UteIssuerGuard)
    @ApiOkResponse({
        type: [CertificateDTO],
        description: 'Returns all Certificates'
    })
    public async getAll(
        @Query('blockchainAddress') blockchainAddress: string
    ): Promise<CertificateDTO[]> {
        const certificates = await this.queryBus.execute<GetAllCertificatesQuery, Certificate[]>(
            new GetAllCertificatesQuery()
        );

        const userCertificates = certificates.filter(
            (cert) =>
                BigNumber.from(cert.owners?.[blockchainAddress] ?? 0) > BigNumber.from(0) ||
                BigNumber.from(cert.claimers?.[blockchainAddress] ?? 0) > BigNumber.from(0)
        );

        return Promise.all(
            userCertificates.map((certificate) => certificateToDto(certificate, blockchainAddress))
        );
    }

    @Post()
    @HttpCode(HttpStatus.OK)
    @UseGuards(UteIssuerGuard)
    @ApiOkResponse({
        type: TxHashDTO,
        description: 'Triggers an issuance transaction and returns the transaction hash'
    })
    @ApiBody({ type: IssueCertificateDTO })
    public async issue(@Body() dto: IssueCertificateDTO): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
            new IssueCertificateCommand(
                dto.to,
                dto.energy,
                dto.fromTime,
                dto.toTime,
                dto.deviceId,
                dto.to
            )
        );

        return { txHash: tx.hash };
    }

    @Put('/:id/transfer')
    @UseGuards(UteIssuerGuard)
    @ApiBody({ type: TransferCertificateDTO })
    @ApiOkResponse({
        type: TxHashDTO,
        description: 'Triggers a Transfer transaction and returns the transaction hash'
    })
    public async transfer(
        @Query('fromAddress') fromAddress: string,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: TransferCertificateDTO
    ): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
            new TransferCertificateCommand(certificateId, fromAddress, dto.to, dto.amount)
        );

        return { txHash: tx.hash };
    }

    @Put('/:id/claim')
    @UseGuards(UteIssuerGuard)
    @ApiBody({ type: ClaimCertificateDTO })
    @ApiOkResponse({
        type: TxHashDTO,
        description: 'Triggers a Transfer transaction and returns the transaction hash'
    })
    public async claim(
        @Query('fromAddress') fromAddress: string,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: ClaimCertificateDTO
    ): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
            new ClaimCertificateCommand(certificateId, dto.claimData, fromAddress, dto.amount)
        );

        return { txHash: tx.hash };
    }

    @Get('/:id/events')
    @UseGuards(UteIssuerGuard)
    @ApiOkResponse({
        type: [CertificateEvent],
        description: 'Returns all the events for a Certificate'
    })
    public async getAllEvents(
        @Param('id', new ParseIntPipe()) id: number
    ): Promise<CertificateEvent[]> {
        return this.queryBus.execute(new GetAllCertificateEventsQuery(id));
    }
}

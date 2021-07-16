import { BigNumber } from 'ethers';
import {
    Body,
    Controller,
    Get,
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
import { ApiBody, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ExceptionInterceptor, SuccessResponseDTO } from '@energyweb/origin-backend-utils';
import {
    Certificate,
    CertificateDTO,
    CertificateEvent,
    certificateToDto,
    ClaimCertificateCommand,
    GetAllCertificateEventsQuery,
    GetAllCertificatesQuery,
    GetCertificateQuery,
    IssueCertificateCommand,
    TransferCertificateCommand
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
    @ApiResponse({
        status: HttpStatus.OK,
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

    @Get()
    @UseGuards(UteIssuerGuard)
    @ApiResponse({
        status: HttpStatus.OK,
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
    @UseGuards(UteIssuerGuard)
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: CertificateDTO,
        description: 'Returns the issued Certificate'
    })
    @ApiBody({ type: IssueCertificateDTO })
    public async issue(@Body() dto: IssueCertificateDTO): Promise<CertificateDTO> {
        return this.commandBus.execute(
            new IssueCertificateCommand(
                dto.to,
                dto.energy,
                dto.fromTime,
                dto.toTime,
                dto.deviceId,
                dto.to
            )
        );
    }

    @Put('/:id/transfer')
    @UseGuards(UteIssuerGuard)
    @ApiBody({ type: TransferCertificateDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the transfer succeeded'
    })
    public async transfer(
        @Query('fromAddress') fromAddress: string,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: TransferCertificateDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new TransferCertificateCommand(certificateId, fromAddress, dto.to, dto.amount)
        );
    }

    @Put('/:id/claim')
    @UseGuards(UteIssuerGuard)
    @ApiBody({ type: ClaimCertificateDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the claim succeeded'
    })
    public async claim(
        @Query('fromAddress') fromAddress: string,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: ClaimCertificateDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new ClaimCertificateCommand(certificateId, dto.claimData, fromAddress, dto.amount)
        );
    }

    @Get('/:id/events')
    @UseGuards(UteIssuerGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [CertificateEvent],
        description: 'Returns all the events for a Certificate'
    })
    public async getAllEvents(
        @Param('id', new ParseIntPipe()) id: number
    ): Promise<CertificateEvent[]> {
        return this.queryBus.execute(new GetAllCertificateEventsQuery(id));
    }
}

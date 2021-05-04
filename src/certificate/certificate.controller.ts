import moment from 'moment';
import { BigNumber } from 'ethers';
import {
    Body,
    Controller,
    Get,
    HttpStatus,
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
import { Role } from '@energyweb/origin-backend-core';
import { ExceptionInterceptor, Roles } from '@energyweb/origin-backend-utils';
import {
    BulkClaimCertificatesCommand,
    Certificate,
    ClaimCertificateCommand,
    GetAggregateCertifiedEnergyByDeviceIdQuery,
    GetAllCertificateEventsQuery,
    GetAllCertificatesQuery,
    GetCertificateByTokenIdQuery,
    GetCertificateQuery,
    IssueCertificateCommand,
    TransferCertificateCommand
} from '@energyweb/issuer-api';
import { SuccessResponseDTO } from '@energyweb/issuer-api/dist/js/src/utils/success-response.dto';
import { CertificateEvent } from '@energyweb/issuer-api/dist/js/src/types';

import {
    BulkClaimCertificatesDTO,
    CertificateDTO,
    ClaimCertificateDTO,
    IssueCertificateDTO,
    TransferCertificateDTO
} from './dto';
import { certificateToDto } from './utils';
import { UteIssuerGuard } from '../ute-issuer.guard';

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

        return certificateToDto(certificate, blockchainAddress);
    }

    @Get('/token-id/:tokenId')
    @UseGuards(UteIssuerGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: CertificateDTO,
        description: 'Returns a Certificate by token ID'
    })
    public async getByTokenId(
        @Param('tokenId', new ParseIntPipe()) tokenId: number,
        @Query('blockchainAddress') blockchainAddress: string
    ): Promise<CertificateDTO> {
        const certificate = await this.queryBus.execute<GetCertificateByTokenIdQuery, Certificate>(
            new GetCertificateByTokenIdQuery(tokenId)
        );

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
                BigNumber.from(cert.owners[blockchainAddress]) > BigNumber.from(0) ||
                BigNumber.from(cert.claimers[blockchainAddress]) > BigNumber.from(0)
        );

        return Promise.all(
            userCertificates.map((certificate) => certificateToDto(certificate, blockchainAddress))
        );
    }

    @Get('/issuer/certified/:deviceId')
    @ApiResponse({
        status: HttpStatus.OK,
        type: String,
        description: 'Returns SUM of certified energy by device ID'
    })
    public async getAggregateCertifiedEnergyByDeviceId(
        @Param('deviceId') deviceId: string,
        @Query('start') start: string,
        @Query('end') end: string
    ): Promise<string> {
        const startDateToUnix = moment(start).unix();
        const endDateToUnix = moment(end).unix();

        const result = await this.queryBus.execute<
            GetAggregateCertifiedEnergyByDeviceIdQuery,
            BigNumber
        >(new GetAggregateCertifiedEnergyByDeviceIdQuery(deviceId, startDateToUnix, endDateToUnix));

        return result.toString();
    }

    @Post()
    @UseGuards(UteIssuerGuard)
    @Roles(Role.Issuer)
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
                dto.to,
                dto.isPrivate
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
        @Query('blockchainAddress') blockchainAddress: string,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: TransferCertificateDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new TransferCertificateCommand(
                certificateId,
                blockchainAddress,
                dto.to,
                dto.amount,
                dto.delegated
            )
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
        @Query('blockchainAddress') blockchainAddress: string,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: ClaimCertificateDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new ClaimCertificateCommand(certificateId, dto.claimData, blockchainAddress, dto.amount)
        );
    }

    @Put('/bulk-claim')
    @UseGuards(UteIssuerGuard)
    @ApiBody({ type: BulkClaimCertificatesDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the bulk claim succeeded'
    })
    public async bulkClaim(
        @Query('blockchainAddress') blockchainAddress: string,
        @Body() dto: BulkClaimCertificatesDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new BulkClaimCertificatesCommand(dto.certificateIds, dto.claimData, blockchainAddress)
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

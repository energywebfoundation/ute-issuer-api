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
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@energyweb/origin-backend-core';
import {
    BlockchainAccountDecorator,
    BlockchainAccountGuard,
    ExceptionInterceptor,
    Roles
} from '@energyweb/origin-backend-utils';
import {
    BulkClaimCertificatesCommand,
    BulkClaimCertificatesDTO,
    Certificate,
    CertificateDTO,
    certificateToDto,
    ClaimCertificateCommand,
    ClaimCertificateDTO,
    GetAggregateCertifiedEnergyByDeviceIdQuery,
    GetAllCertificateEventsQuery,
    GetAllCertificatesQuery,
    GetCertificateByTokenIdQuery,
    GetCertificateQuery,
    IssueCertificateCommand,
    IssueCertificateDTO,
    TransferCertificateCommand,
    TransferCertificateDTO
} from '@energyweb/issuer-api';
import { SuccessResponseDTO } from '@energyweb/issuer-api/dist/js/src/utils/success-response.dto';
import { CertificateEvent } from '@energyweb/issuer-api/dist/js/src/types';

import { UteIssuerGuard } from './ute-issuer.guard';

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
        @BlockchainAccountDecorator() blockchainAddress: string
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
        @BlockchainAccountDecorator() blockchainAddress: string
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
        @BlockchainAccountDecorator() blockchainAddress: string
    ): Promise<CertificateDTO[]> {
        const certificates = await this.queryBus.execute<GetAllCertificatesQuery, Certificate[]>(
            new GetAllCertificatesQuery()
        );
        return Promise.all(
            certificates.map((certificate) => certificateToDto(certificate, blockchainAddress))
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
    @UseGuards(UteIssuerGuard, BlockchainAccountGuard)
    @Roles(Role.Issuer)
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: CertificateDTO,
        description: 'Returns the issued Certificate'
    })
    @ApiBody({ type: IssueCertificateDTO })
    public async issue(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Body() dto: IssueCertificateDTO
    ): Promise<CertificateDTO> {
        return this.commandBus.execute(
            new IssueCertificateCommand(
                dto.to,
                dto.energy,
                dto.fromTime,
                dto.toTime,
                dto.deviceId,
                blockchainAddress,
                dto.isPrivate
            )
        );
    }

    @Put('/:id/transfer')
    @UseGuards(UteIssuerGuard, BlockchainAccountGuard)
    @ApiBody({ type: TransferCertificateDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the transfer succeeded'
    })
    public async transfer(
        @BlockchainAccountDecorator() blockchainAddress: string,
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
    @UseGuards(UteIssuerGuard, BlockchainAccountGuard)
    @ApiBody({ type: ClaimCertificateDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the claim succeeded'
    })
    public async claim(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: ClaimCertificateDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new ClaimCertificateCommand(certificateId, dto.claimData, blockchainAddress, dto.amount)
        );
    }

    @Put('/bulk-claim')
    @UseGuards(UteIssuerGuard, BlockchainAccountGuard)
    @ApiBody({ type: BulkClaimCertificatesDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the bulk claim succeeded'
    })
    public async bulkClaim(
        @BlockchainAccountDecorator() blockchainAddress: string,
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

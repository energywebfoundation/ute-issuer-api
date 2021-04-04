import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlockchainPropertiesDTO, BlockchainPropertiesService } from '@energyweb/issuer-api';
import { UteIssuerGuard } from '../ute-issuer.guard';

@ApiTags('blockchain-properties')
@ApiBearerAuth('access-token')
@Controller('blockchain-properties')
export class BlockchainPropertiesController {
    constructor(private readonly blockchainPropertiesService: BlockchainPropertiesService) {}

    @Get()
    @UseGuards(UteIssuerGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: BlockchainPropertiesDTO,
        description: 'Returns blockchain properties'
    })
    public async get(): Promise<BlockchainPropertiesDTO> {
        return this.blockchainPropertiesService.dto();
    }
}

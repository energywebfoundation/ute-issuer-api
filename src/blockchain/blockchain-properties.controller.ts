import {
    Controller,
    Get,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BlockchainPropertiesDTO, BlockchainPropertiesService } from '@energyweb/issuer-api';
import { ExceptionInterceptor } from '@energyweb/origin-backend-utils';
import { UteIssuerGuard } from '../ute-issuer.guard';

@ApiSecurity('ute-api-key')
@ApiTags('blockchain-properties')
@Controller('blockchain-properties')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
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

import { ApiProperty } from '@nestjs/swagger';

export class AccountDTO {
    @ApiProperty({ type: String })
    blockchainAddress: string;

    @ApiProperty({ type: String })
    privateKey: string;
}

import { PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Validate, ValidateIf, ValidateNested } from 'class-validator';

import { DelegatedTransferOptions } from './delegated-transfer.dto';
import { IntUnitsOfEnergy } from '../utils';

export class TransferCertificateDTO {
    @ApiProperty({ type: String, example: '0xD173313A51f8fc37BcF67569b463abd89d81844f' })
    @IsString()
    to: string;

    @ValidateNested()
    @ApiProperty({
        type: DelegatedTransferOptions,
        required: false,
        example: { from: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8', signature: '' }
    })
    delegated?: DelegatedTransferOptions;

    @ApiProperty({ type: String, required: false, example: '10000000' })
    @ValidateIf((dto: TransferCertificateDTO) => !!dto.amount)
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}

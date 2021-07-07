import { PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Validate, ValidateIf } from 'class-validator';

import { IntUnitsOfEnergy } from '../utils';

export class TransferCertificateDTO {
    @ApiProperty({ type: String, example: '0xD173313A51f8fc37BcF67569b463abd89d81844f' })
    @IsString()
    to: string;

    @ApiProperty({ type: String, required: false, example: '10000000' })
    @ValidateIf((dto: TransferCertificateDTO) => !!dto.amount)
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}

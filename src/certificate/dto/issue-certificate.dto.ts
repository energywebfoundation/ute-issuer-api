import { PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, Validate } from 'class-validator';

import { IntUnitsOfEnergy } from '../utils';

export class IssueCertificateDTO {
    @ApiProperty({ type: String, example: '0xD173313A51f8fc37BcF67569b463abd89d81844f' })
    @IsString()
    to: string;

    @ApiProperty({ type: String, example: '10000000' })
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    energy: string;

    @ApiProperty({ type: Number, example: 1616605000 })
    @IsInt()
    @IsPositive()
    fromTime: number;

    @ApiProperty({ type: Number, example: 1616655000 })
    @IsInt()
    @IsPositive()
    toTime: number;

    @ApiProperty({ type: String, example: 'Device100' })
    @IsString()
    deviceId: string;
}

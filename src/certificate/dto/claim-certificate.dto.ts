import { PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Validate, ValidateNested } from 'class-validator';

import { ClaimDataDTO } from '@energyweb/issuer-api';
import { IntUnitsOfEnergy } from '../utils';

export class ClaimCertificateDTO {
    @ApiProperty({
        type: ClaimDataDTO,
        example: {
            beneficiary: 'Adam X',
            location: 'Some St, X, 12345',
            countryCode: 'GB',
            periodStartDate: '2021-03-01T04:00:00.000Z',
            periodEndDate: '2021-04-01T04:00:00.000Z',
            purpose: 'Claiming'
        }
    })
    @ValidateNested()
    claimData: ClaimDataDTO;

    @ApiPropertyOptional({ type: String, required: false, example: '10000000' })
    @IsOptional()
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}

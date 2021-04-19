import { PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate, ValidateIf, ValidateNested } from 'class-validator';

import { ClaimDataDTO } from './claim-data.dto';
import { IntUnitsOfEnergy } from '../utils';

export class ClaimCertificateDTO {
    @ApiProperty({
        type: ClaimDataDTO,
        example: {
            beneficiary: 'Adam X',
            address: 'Some St',
            region: 'X',
            zipCode: '1234',
            countryCode: 'GB',
            fromDate: '2021-03-01T04:00:00.000Z',
            toDate: '2021-04-01T04:00:00.000Z'
        }
    })
    @IsOptional()
    @ValidateNested()
    claimData?: ClaimDataDTO;

    @ApiProperty({ type: String, required: false, example: '10000000' })
    @ValidateIf((dto: ClaimCertificateDTO) => !!dto.amount)
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}

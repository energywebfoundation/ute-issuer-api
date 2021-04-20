import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';

import { IntUnitsOfEnergy } from '../utils';

export class EnergyDTO {
    @ApiProperty({ type: String })
    @Validate(IntUnitsOfEnergy)
    publicVolume: string;

    @ApiProperty({ type: String })
    @Validate(IntUnitsOfEnergy)
    privateVolume: string;

    @ApiProperty({ type: String })
    @Validate(IntUnitsOfEnergy)
    claimedVolume: string;
}

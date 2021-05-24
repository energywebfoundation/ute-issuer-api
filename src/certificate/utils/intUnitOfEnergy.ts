import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import BN from 'bn.js';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint()
@Injectable()
export class IntUnitsOfEnergy implements ValidatorConstraintInterface {
    private energyPerUnit: BN;

    constructor() {
        this.energyPerUnit = new BN(process.env.ENERGY_PER_UNIT ?? 1);
    }

    validate(volume: string) {
        if (new BN(volume).mod(this.energyPerUnit).isZero()) {
            return true;
        }
        return false;
    }

    defaultMessage() {
        return (
            `Energy volume must be integer number of energy units. ` +
            `The number must be divisible by ENERGY_PER_UNIT without a remainder. ` +
            `ENERGY_PER_UNIT=${this.energyPerUnit}`
        );
    }
}

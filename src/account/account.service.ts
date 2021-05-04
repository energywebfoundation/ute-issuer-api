import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from 'ethers';
import { Repository } from 'typeorm';
import { AccountDTO } from './account.dto';
import { Account } from './account.entity';

export class AccountService {
    constructor(
        @InjectRepository(Account)
        private readonly repository: Repository<Account>
    ) {}

    public async create(): Promise<AccountDTO> {
        const totalAccounts = await this.repository.count();

        const newAccount = Wallet.fromMnemonic(
            process.env.MNEMONIC,
            `m/44'/60'/0'/0/${totalAccounts + 1}`
        );

        const account = this.repository.create({
            address: newAccount.address,
            privateKey: newAccount.privateKey
        });

        const savedAccount = await this.repository.save(account);

        return {
            blockchainAddress: savedAccount.address,
            privateKey: savedAccount.privateKey
        };
    }
}

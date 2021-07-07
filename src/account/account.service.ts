import { BlockchainPropertiesService } from '@energyweb/issuer-api';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from 'ethers';
import { Contracts as IssuerContracts } from '@energyweb/issuer';
import { getProviderWithFallback } from '@energyweb/utils-general';

import { Repository } from 'typeorm';
import { AccountDTO } from './account.dto';
import { Account } from './account.entity';

export class AccountService {
    constructor(
        @InjectRepository(Account)
        private readonly repository: Repository<Account>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    public async create(): Promise<AccountDTO> {
        const totalAccounts = await this.repository.count();

        const newAccount = Wallet.fromMnemonic(
            process.env.MNEMONIC,
            `m/44'/60'/0'/0/${totalAccounts + 1}`
        );

        const { registry, rpcNode, platformOperatorPrivateKey } =
            await this.blockchainPropertiesService.get();
        const provider = getProviderWithFallback(rpcNode);

        const issuerAccount = new Wallet(platformOperatorPrivateKey);

        const registryWithSigner = IssuerContracts.factories.RegistryFactory.connect(
            registry,
            new Wallet(newAccount.privateKey, provider)
        );

        await registryWithSigner.setApprovalForAll(issuerAccount.address, true);

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

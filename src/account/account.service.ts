import { BlockchainPropertiesService } from '@energyweb/issuer-api';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Wallet, utils } from 'ethers';
import { Contracts as IssuerContracts } from '@energyweb/issuer';
import { getProviderWithFallback } from '@energyweb/utils-general';

import { Repository } from 'typeorm';
import { AccountDTO } from './account.dto';
import { Account } from './account.entity';

export class AccountService {
    constructor(
        @InjectRepository(Account)
        private readonly repository: Repository<Account>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService,
        private readonly configService: ConfigService
    ) {}

    public async create(): Promise<AccountDTO> {
        const totalAccounts = await this.repository.count();

        const { registry, rpcNode, platformOperatorPrivateKey } =
            await this.blockchainPropertiesService.get();
        const provider = getProviderWithFallback(rpcNode);
        const issuerAccount = new Wallet(platformOperatorPrivateKey, provider);

        const minBalanceNeeded = utils.parseEther(
            this.configService.get<string>('MIN_ETHER_BALANCE') || '0.01'
        );

        const newAccount = Wallet.fromMnemonic(
            process.env.MNEMONIC,
            `m/44'/60'/0'/0/${totalAccounts + 1}`
        );
        const newAccountBalance = await newAccount.connect(provider).getBalance();

        if (newAccountBalance.lte(minBalanceNeeded)) {
            const fillUpTx = await issuerAccount.sendTransaction({
                to: newAccount.address,
                value: minBalanceNeeded
            });

            await fillUpTx.wait();
        }

        const registryWithSigner = IssuerContracts.factories.RegistryExtendedFactory.connect(
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

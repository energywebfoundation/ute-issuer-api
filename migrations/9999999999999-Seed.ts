/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { MigrationInterface, QueryRunner } from 'typeorm';
import { providers, Wallet } from 'ethers';
import { Contracts as IssuerContracts, IContractsLookup } from '@energyweb/issuer';
import { getProviderWithFallback } from '@energyweb/utils-general';

require('dotenv').config({ path: '../.env' });

export class Seed9999999999999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await this.seedBlockchain(queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {}

    private async seedBlockchain(queryRunner: QueryRunner) {
        console.log({
            __dirname,
            WEB3: process.env.WEB3,
            env: process.env
        });

        const [primaryRpc, fallbackRpc] = process.env.WEB3.split(';');
        const provider = getProviderWithFallback(primaryRpc, fallbackRpc);
        const deployer = Wallet.fromMnemonic(process.env.MNEMONIC, `m/44'/60'/0'/0/${0}`); // Index 0 account
        const contractsLookup = await this.deployContracts(deployer, provider);

        await queryRunner.query(
            `INSERT INTO public.issuer_blockchain_properties (
                "netId", "registry", "issuer", "rpcNode", "rpcNodeFallback", "platformOperatorPrivateKey"
            ) VALUES (${provider.network.chainId}, '${contractsLookup.registry}', '${
                contractsLookup.issuer
            }', '${primaryRpc}', '${fallbackRpc ?? ''}', '${deployer.privateKey}')`
        );
    }

    private async deployContracts(
        deployer: Wallet,
        provider: providers.FallbackProvider
    ): Promise<IContractsLookup> {
        const adminPK = deployer.privateKey.startsWith('0x')
            ? deployer.privateKey
            : `0x${deployer.privateKey}`;

        const registry = await IssuerContracts.migrateRegistry(provider, adminPK);
        const issuer = await IssuerContracts.migrateIssuer(provider, adminPK, registry.address);

        return {
            registry: registry.address,
            issuer: issuer.address
        };
    }
}

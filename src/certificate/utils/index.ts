import { BigNumber, utils } from 'ethers';
import { Certificate } from '@energyweb/issuer-api';
import { CertificateDTO } from '../dto';

export * from './intUnitOfEnergy';

export const certificateToDto = async (
    certificate: Certificate,
    userId?: string
): Promise<CertificateDTO> => {
    let userAddress: string;

    if (userId) {
        userAddress = utils.getAddress(userId);
    }

    const publicVolume = BigNumber.from(
        !certificate.issuedPrivately && userId ? certificate.owners[userAddress] ?? 0 : 0
    );
    const privateVolume = BigNumber.from(
        certificate.issuedPrivately && userId
            ? certificate.latestCommitment.commitment[userAddress] ?? 0
            : 0
    );
    const claimedVolume = BigNumber.from(
        certificate.claimers && userId ? certificate.claimers[userAddress] ?? 0 : 0
    );

    return {
        id: certificate.id,
        tokenId: certificate.tokenId,
        deviceId: certificate.deviceId,
        generationStartTime: certificate.generationStartTime,
        generationEndTime: certificate.generationEndTime,
        creationTime: certificate.creationTime,
        creationBlockHash: certificate.creationBlockHash,
        energy: {
            publicVolume: publicVolume.toString(),
            privateVolume: privateVolume.toString(),
            claimedVolume: claimedVolume.toString()
        },
        isClaimed: claimedVolume.gt(0),
        isOwned: publicVolume.add(privateVolume).gt(0),
        myClaims:
            certificate.claims?.filter((claim) => utils.getAddress(claim.to) === userAddress) ?? [],
        claims: certificate.claims ?? [],
        issuedPrivately: certificate.issuedPrivately
    };
};

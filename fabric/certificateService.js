const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const issueCertificate = async (applicationId, applicantName) => {
    const ccpPath = path.resolve(__dirname, '../fabric-network/connection-profile.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('CertificateContract');

    await contract.submitTransaction('issueCertificate', applicationId, applicantName);
    console.log('Certificate issued successfully');

    await gateway.disconnect();
};

module.exports = {
    issueCertificate
};

'use strict';
const { Contract } = require('fabric-contract-api');

class CertificateContract extends Contract {
    async issueCertificate(ctx, applicationId, applicantName) {
        const certificateKey = ctx.stub.createCompositeKey('Certificate', [applicationId]);

        const certificate = {
            applicationId,
            applicantName,
            issuedDate: new Date(),
            status: 'Green Light'
        };

        await ctx.stub.putState(certificateKey, Buffer.from(JSON.stringify(certificate)));
        return JSON.stringify(certificate);
    }

    async getCertificate(ctx, applicationId) {
        const certificateKey = ctx.stub.createCompositeKey('Certificate', [applicationId]);
        const certificateData = await ctx.stub.getState(certificateKey);

        if (!certificateData || certificateData.length === 0) {
            throw new Error(`Certificate for ${applicationId} does not exist`);
        }
        return certificateData.toString();
    }
}

module.exports = CertificateContract;

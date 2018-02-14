const msRestAzure = require('ms-rest-azure');
const StreamAnalyticsClient = require('azure-arm-streamanalytics');
const { URL } = require('url');

const login = async () => {
    console.log('logging in');

    const loginType = process.env.loginType;
    const loginId = process.env.loginId;
    const loginSecret = process.env.loginSecret;

    let response;
    if (loginType === 'sp') {
        // https://github.com/Azure/azure-sdk-for-node/blob/66a255dd882762e93e5b9b92ba63ebb222962d59/runtime/ms-rest-azure/lib/login.js#L414
        response = await msRestAzure.loginWithServicePrincipalSecret(loginId, loginSecret, process.env.loginTenantId);
    } else {
        // https://github.com/Azure/azure-sdk-for-node/blob/66a255dd882762e93e5b9b92ba63ebb222962d59/runtime/ms-rest-azure/index.d.ts#L376
        response = await msRestAzure.loginWithUsernamePassword(loginId, loginSecret, {domain: process.env.loginTenantId});
    }

    console.log('login successful');
    return response;
};

const stopJob = async (credentials) => {
    console.log('stopping stream analytics job:', process.env.name);

    let client = new StreamAnalyticsClient(credentials, process.env.subscriptionId);
    let result = await client.streamingJobs.stop(process.env.resourceGroup, process.env.name);

    if (result !== null) {
        console.log('Error:', result)
    } else {
        console.log('stopping stream analytics job successful!');
    }
};

login().then(stopJob).catch(error => {
    if (error.body.code === 'ResourceNotFound') {
        console.log('no stream analytics job found with name: ' + process.env.name + ' skipping.')
    } else {
        console.log(error);
        process.exit(1)
    }
});

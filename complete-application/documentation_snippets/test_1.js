const client = require('@fusionauth/typescript-client');
const jwt = require('jsonwebtoken');
const test = require('tape');
const fetchMock = require('fetch-mock');

const applicationId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
const fusionUrl = 'http://localhost:9011';
const userId = 'c924cd34-879a-430d-a0ac-87a3f98df2dd';
const userPassword = 'password';
const userEmail = 'richard@example.com';
const username = 'lambdatestuser';

createUser();

async function createUser() {
  try {
    const request = {
      registration: {
        applicationId: applicationId,
        username: username,
      },
      sendSetPasswordEmail: false,
      skipRegistrationVerification: true,
      skipVerification: true,
      user: {
        active: true,
        email: userEmail,
        password: userPassword,
        username: username,
        registrations: [{
          applicationId: applicationId
        }]
      }
    };
    const fusion = new client.FusionAuthClient('lambda_testing_key', fusionUrl);
    const clientResponse = await fusion.register(userId, request);
    if (!clientResponse.wasSuccessful)
      throw Error(clientResponse);
    console.info('User created successfully');
  } catch (e) {
    console.error('Error creating user: ');
    console.dir(e, { depth: null });
    process.exit(1);
  }
}
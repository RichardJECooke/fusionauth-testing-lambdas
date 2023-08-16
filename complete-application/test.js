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

// createUser();

test('test login returns JWT with "Goodbye World"', async function (t) {
  t.plan(1);
  const result = await login();
  t.ok(result.toLowerCase().includes('goodbye world'));
  t.end();
});

test('test lambda rejects sanctioned emails and accepts others', async function (t) {
  t.plan(2);

  fetchMock.get('https://issanctioned.example.com/api/banned?email=kim%40company.kp', { isBanned: true });
  const jwt1 = {};
  await populate(jwt1, {email: 'kim@company.kp'}, {});
  t.true(jwt1.isBanned, 'Check North Korea email banned');

  fetchMock.get('https://issanctioned.example.com/api/banned?email=kim%40company.ca', { isBanned: false });
  const jwt2 = {};
  await populate(jwt2, {email: 'kim@company.ca'}, {});
  t.false(jwt2.isBanned, 'Check Canada email allowed');

  fetchMock.restore();
  t.end();
});

async function populate(jwt, user, registration) {
  const response = await fetch("https://issanctioned.example.com/api/banned?email=" + encodeURIComponent(user.email), {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  if (response.status === 200) {
    const jsonResponse = await response.json();
    jwt.isBanned = jsonResponse.isBanned;
  }
  else
    jwt.isBanned = false;
}

async function login() {
  try {
    const request  = {
      applicationId: applicationId,
      loginId: userEmail,
      password: userPassword,
    };
    const fusion = new client.FusionAuthClient('lambda_testing_key', fusionUrl);
    const clientResponse = await fusion.login(request);
    if (!clientResponse.wasSuccessful)
      throw Error(clientResponse);
    const jwtToken = clientResponse.response.token;
    const decodedToken = jwt.decode(jwtToken);
    const message = decodedToken.message;
    return message;
  }
  catch (e) {
    console.error('Error: ');
    console.dir(e, { depth: null });
    process.exit(1);
  }
}

async function populate(jwt, user, registration) {
  const response = await fetch("https://issanctioned.example.com/api/banned?email=" + encodeURIComponent(user.email), {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  if (response.status === 200) {
    const jsonResponse = await response.json();
    jwt.isBanned = jsonResponse.isBanned;
  }
  else
    jwt.isBanned = false;
}


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
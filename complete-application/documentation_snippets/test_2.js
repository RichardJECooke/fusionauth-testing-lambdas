test('test login returns JWT with "Goodbye World"', async function (t) {
    t.plan(1);
    const result = await login();
    t.ok(result.toLowerCase().includes('goodbye world'));
    t.end();
  });

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
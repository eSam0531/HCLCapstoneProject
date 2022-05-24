export default {

    oidc: {
        clientId: '<clientID>',
        issuer: '<issuer>',
        redirectUri: 'https://capstonefrontendtestdeploy.azurewebsites.net/login/callback',
        //redirectUri: 'http://localhost:4200/login/callback',
        scopes: ['openid', 'profile', 'email']
    }
}

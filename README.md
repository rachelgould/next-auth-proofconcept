# Example Project: Simple User Auth in Next.js Using Cognito & Facebook Login

Used to explore ways to perform OAuth federated sign-in in Next.js using Amazon Cognito service. Uses the hosted UI.

## Getting Started

Fill in `next.config.js.example` and remove the `.example`. 

Make sure that your Cognito OAuth 2.0 settings allow the following scopes: email, openid, profile, aws.cognito.signin.user.admin.

Get your JWKS at `https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json`

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on ZEIT Now

The easiest way to deploy your Next.js app is to use the [ZEIT Now Platform](https://zeit.co/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

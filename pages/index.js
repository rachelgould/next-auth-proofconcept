import Head from 'next/head';
import { useEffect, useState } from 'react';
import { parseCookies, setCookie, destroyCookie } from 'nookies';
import { verifySetToken, transformToClientToken, decodeClientToken } from '../utils/tokens';

const Home = (props) => {
  const [user, setUser] = useState(props.user);
  
  const logout = () => {
    destroyCookie(null, 'id');
    setUser(null);
  }

  // This should go on whatever page your signin is redirecting to
  useEffect(() => {
    async function detectNewLogin() {
      try {
        if (typeof window !== 'undefined') {
          const tokenParams = new URLSearchParams(window.location.href.split("#")[1]);
          const idToken = tokenParams.get("id_token");
          if (idToken) {
            const verified = await verifySetToken(idToken);
            const newToken = await transformToClientToken(verified);
            setCookie(null, 'id', newToken, {
              maxAge: process.env.DAYS_REMEMBER_USER * 60 * 60 * 24,
              path: '/'
            });
            const user = await decodeClientToken(newToken);
            setUser(user);
          }
        }
      } catch (e) {
        console.log("Error logging in: ", e);
      }
    }
    detectNewLogin();
  }, [])

  return(
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className="description">
          {
            user ?
            <>
              {Object.keys(user).map((k) => <>{k}: {user[k]}<br /></>)}
              <br />
              Click here to logout: <a onClick={()=> logout()}>Log out</a>
            </>
            :
            <>Click here to login: <a href={`${process.env.O_AUTH_DOMAIN}/login?client_id=${process.env.CLIENT_ID}&response_type=token&scope=aws.cognito.signin.user.admin%20profile%20openid%20email&redirect_uri=${process.env.O_AUTH_SIGNIN_REDIRECT}`}>
              Log in
            </a></>
          }
        </p>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        a {
          color: #0070f3;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}

// This should go wherever you're going to need to use the user id
Home.getInitialProps = async function(ctx) {
  const { id } = parseCookies(ctx);
  if (id) {
    const user = await decodeClientToken(id);
    return { user };
  } else {
    return { }
  }
};

export default Home

import { useEffect, useState } from "react";

const API = "http://127.0.0.1:3001";

export default function App() {

  const [identity, setIdentity] =
    useState(null);

  const [credentials, setCredentials] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    const storedIdentity =
      localStorage.getItem(
        "fluxlock_wallet_identity"
      );

    if (storedIdentity) {

      setIdentity(
        JSON.parse(
          storedIdentity
        )
      );
    }

    const storedCredentials =
      localStorage.getItem(
        "fluxlock_wallet_credentials"
      );

    if (storedCredentials) {

      setCredentials(
        JSON.parse(
          storedCredentials
        )
      );
    }

  }, []);

  const createIdentity = async () => {

    try {

      setLoading(true);

      const response =
        await fetch(
          `${API}/identity/create`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              validator_id: 0,
            }),
          }
        );

      const data =
        await response.json();

      localStorage.setItem(
        "fluxlock_wallet_identity",
        JSON.stringify(data)
      );

      setIdentity(data);

    } catch (err) {

      console.error(err);

      alert(
        "Identity creation failed"
      );

    } finally {

      setLoading(false);
    }
  };

  const authenticateIdentity =
    async () => {

      if (!identity) return;

      try {

        const signResponse =
          await fetch(
            `${API}/sign`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                message: "login",
                validator_id: 0,
              }),
            }
          );

        const signData =
          await signResponse.json();

        const authResponse =
          await fetch(
            `${API}/auth/flow`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                message: "login",
                signature:
                  signData.signature,
                validator_id: 0,
                identity_id:
                  identity.identity_id,
                nonce:
                  crypto.randomUUID(),
                timestamp:
                  Math.floor(
                    Date.now() / 1000
                  ),
              }),
            }
          );

        const authData =
          await authResponse.json();

        alert(
          JSON.stringify(
            authData,
            null,
            2
          )
        );

      } catch (err) {

        console.error(err);

        alert(
          "Authentication failed"
        );
      }
    };

  const issueCredential =
    async () => {

      if (!identity) return;

      try {

        const response =
          await fetch(
            `${API}/credential/issue`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                identity_id:
                  identity.identity_id,
              }),
            }
          );

        const credential =
          await response.json();

        const updated =
          [
            ...credentials,
            credential,
          ];

        setCredentials(
          updated
        );

        localStorage.setItem(
          "fluxlock_wallet_credentials",
          JSON.stringify(
            updated
          )
        );

      } catch (err) {

        console.error(err);

        alert(
          "Credential issuance failed"
        );
      }
    };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050b18",
        color: "white",
        padding: "40px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >

      <h1>
        Fluxlock Wallet
      </h1>

      {!identity && (

        <button
          onClick={
            createIdentity
          }
        >
          {
            loading
              ? "Creating..."
              : "Create Identity"
          }
        </button>
      )}

      {identity && (

        <div
          style={{
            background:
              "#0c1528",
            padding: "20px",
            borderRadius:
              "12px",
            maxWidth: "800px",
            marginTop: "20px",
          }}
        >

          <h2>
            Identity
          </h2>

          <p>
            <strong>ID:</strong>
            <br />
            {
              identity.identity_id
            }
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {
              identity.status
            }
          </p>

          <p>
            <strong>Trust:</strong>{" "}
            {
              identity.trust_score
            }
          </p>

          <p>
            <strong>Continuity:</strong>{" "}
            {
              identity.continuity_score
            }
          </p>

          <button
            onClick={
              authenticateIdentity
            }
          >
            Authenticate
          </button>

          <button
            onClick={
              issueCredential
            }
            style={{
              marginLeft:
                "15px",
            }}
          >
            Issue Credential
          </button>

        </div>
      )}

      {credentials.length > 0 && (

        <div
          style={{
            marginTop: "30px",
            background:
              "#102038",
            padding: "20px",
            borderRadius:
              "12px",
            maxWidth: "1000px",
          }}
        >

          <h2>
            Credentials
          </h2>

          {
            credentials.map(
              (
                credential,
                index
              ) => (

                <div
                  key={index}
                  style={{
                    marginBottom:
                      "20px",
                    background:
                      "#1b3157",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                  }}
                >

                  <p>
                    <strong>
                      Credential ID:
                    </strong>
                    <br />
                    {
                      credential.credential_id
                    }
                  </p>

                  <p>
                    <strong>
                      Type:
                    </strong>{" "}
                    {
                      credential.credential_type
                    }
                  </p>

                  <p>
                    <strong>
                      Issuer:
                    </strong>{" "}
                    {
                      credential.issuer
                    }
                  </p>

                  <p>
                    <strong>
                      Trust:
                    </strong>{" "}
                    {
                      credential.trust_score
                    }
                  </p>

                  <p>
                    <strong>
                      Continuity:
                    </strong>{" "}
                    {
                      credential.continuity_score
                    }
                  </p>

                  <p>
                    <strong>
                      Signature:
                    </strong>
                    <br />
                    {
                      credential.signature
                    }
                  </p>

                </div>
              )
            )
          }

        </div>
      )}

    </div>
  );
}
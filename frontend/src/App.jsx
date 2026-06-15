import { useEffect, useState } from "react";

const API = "http://127.0.0.1:3001";

export default function App() {

  const [identity, setIdentity] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [credentials, setCredentials] =
    useState([]);

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
        "fluxlock_credentials"
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

      setIdentity(data);

      localStorage.setItem(
        "fluxlock_wallet_identity",
        JSON.stringify(data)
      );

    } catch (err) {

      console.error(err);

      alert(
        "Failed to create identity"
      );

    } finally {

      setLoading(false);
    }
  };

  const authenticateIdentity =
    async () => {

      if (!identity) {
        return;
      }

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

        if (
          authData.authenticated
        ) {

          const credential = {

            credential_id:
              "cred-" +
              crypto.randomUUID(),

            identity_id:
              identity.identity_id,

            validator_id: 0,

            trust_score:
              authData.trust,

            continuity_score:
              identity.continuity_score,

            status:
              authData.status,

            issued_epoch:
              authData.epoch_age,

            issued_at:
              Math.floor(
                Date.now() / 1000
              ),
          };

          const updated =
            [
              credential,
              ...credentials,
            ];

          setCredentials(
            updated
          );

          localStorage.setItem(
            "fluxlock_credentials",
            JSON.stringify(
              updated
            )
          );
        }

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
          "Authentication Failed"
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
            marginTop: "30px",
            background:
              "#0c1528",
            padding: "20px",
            borderRadius:
              "12px",
            maxWidth: "700px",
          }}
        >
          <h2>
            Identity Created
          </h2>

          <p>
            <strong>ID:</strong>
            <br />
            {
              identity.identity_id
            }
          </p>

          <p>
            <strong>
              Validator:
            </strong>{" "}
            {
              identity.validator_id
            }
          </p>

          <p>
            <strong>
              Trust:
            </strong>{" "}
            {
              identity.trust_score
            }
          </p>

          <p>
            <strong>
              Continuity:
            </strong>{" "}
            {
              identity.continuity_score
            }
          </p>

          <p>
            <strong>
              Status:
            </strong>{" "}
            {
              identity.status
            }
          </p>

          <button
            onClick={
              authenticateIdentity
            }
            style={{
              marginTop:
                "15px",
              padding:
                "10px 20px",
              cursor:
                "pointer",
            }}
          >
            Authenticate Identity
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
            maxWidth: "900px",
          }}
        >
          <h2>
            Credentials
          </h2>

          {credentials.map(
            (
              credential
            ) => (
              <div
                key={
                  credential.credential_id
                }
                style={{
                  marginBottom:
                    "20px",
                  padding:
                    "15px",
                  background:
                    "#182c4d",
                  borderRadius:
                    "8px",
                }}
              >
                <p>
                  <strong>
                    Credential:
                  </strong>
                  <br />
                  {
                    credential.credential_id
                  }
                </p>

                <p>
                  <strong>
                    Status:
                  </strong>{" "}
                  {
                    credential.status
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
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
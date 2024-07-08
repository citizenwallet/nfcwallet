const client_id = process.env.POAP_CLIENT_ID || "";
const secret = process.env.POAP_CLIENT_SECRET || "";
const apiKey = process.env.POAP_API_KEY || "";

export type PoapHash = {
  qr_hash: string;
  claimed: boolean;
};

export type Poap = {
  id: string;
  editCode: string;
};

let accessToken: AccessTokenType = {
  access_token: "",
  token_type: "",
  scope: "",
  expires_in: 0,
};

const interval = setInterval(() => {
  renewAccessToken();
}, 1000 * 60 * 60 * 4); // renew accessToken every 4h

export function stopRenewAccessToken() {
  clearInterval(interval);
}

export type AccessTokenType = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
};

export async function renewAccessToken() {
  console.log(">>> renewing access token for POAP api");
  const url = "https://auth.accounts.poap.xyz/oauth/token";
  const headers = {
    "Content-Type": "application/json",
  };
  const body = JSON.stringify({
    audience: "https://api.poap.tech",
    grant_type: "client_credentials",
    client_id: client_id,
    client_secret: secret,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });
    const data = await response.json();
    accessToken = data;
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function getPoapData(hash: string) {
  if (!accessToken.access_token) {
    await renewAccessToken();
  }

  const url = ` https://api.poap.tech/actions/claim-qr?qr_hash=${hash}`;
  const headers = {
    accept: "application/json",
    "Content-Type": "application/json",
    authorization: `Bearer ${accessToken.access_token}`,
    "x-api-key": apiKey,
  };
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.error("Error:", e);
    return e;
  }
}

export async function claimPoap(address: string, hash: string, secret: string) {
  if (!accessToken.access_token) {
    await renewAccessToken();
  }

  const url = ` https://api.poap.tech/actions/claim-qr`;
  const headers = {
    "Content-Type": "application/json",
    authorization: `Bearer ${accessToken.access_token}`,
    "x-api-key": apiKey,
  };

  // Claim the POAP
  const body = JSON.stringify({
    sendEmail: true,
    address,
    qr_hash: hash,
    secret,
  });

  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });
  const data = await response.json();
  return data;
}

export async function getPoapHashes(eventId: string, secret: string) {
  if (!accessToken.access_token) {
    await renewAccessToken();
  }
  const url = ` https://api.poap.tech/event/${eventId}/qr-codes`;
  const headers = {
    "Content-Type": "application/json",
    authorization: `Bearer ${accessToken.access_token}`,
    "x-api-key": apiKey,
  };
  console.log(">>> getPoapHashes", eventId, secret, url, headers);
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      secret_code: secret,
    }),
  });
  const data = await response.json();
  console.log(">>> getPoapHashes", new Date(), data);
  return data;
}

/**
 * Returns true if the address has the poap for eventId
 * @param eventId
 * @returns
 */
export async function getEvent(eventId: number) {
  // actions/scan/{address}/{eventID}
  const url = ` https://api.poap.tech/events/id/${eventId}`;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  };
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  const data = await response.json();

  return data;
}

/**
 * Returns true if the address has the poap for eventId
 * @param address
 * @param eventId
 * @returns
 */
export async function hasPoap(address: string, eventId: number) {
  // actions/scan/{address}/{eventID}
  const url = ` https://api.poap.tech/actions/scan/${address}/${eventId}`;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  };
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  const data = await response.json();

  return data;
}

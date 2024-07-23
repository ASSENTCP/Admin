import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getAccessToken() {
  const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];
  return new Promise(function (resolve, reject) {
    const key_client_email = process.env.NEXT_PUBLIC_FIREBASE_CE;
    const key_private_key = process.env.NEXT_PUBLIC_FIREBASE_PK;
    const jwtClient = new google.auth.JWT(
      key_client_email,
      null,
      key_private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}

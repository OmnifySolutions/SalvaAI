import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: business, error: dbError } = await supabaseAdmin
      .from('businesses')
      .select('id, name')
      .eq('clerk_user_id', userId)
      .single();

    if (dbError) {
      return NextResponse.json({ error: `DB error: ${dbError.message}` }, { status: 500 });
    }
    if (!business) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    const accountSid   = process.env.TWILIO_ACCOUNT_SID;
    const apiKeySid    = process.env.TWILIO_API_KEY_SID;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
    const twimlAppSid  = process.env.TWILIO_TWIML_APP_SID;

    if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
      const missing = ['TWILIO_ACCOUNT_SID', 'TWILIO_API_KEY_SID', 'TWILIO_API_KEY_SECRET', 'TWILIO_TWIML_APP_SID']
        .filter((k) => !process.env[k])
        .join(', ');
      return NextResponse.json({ error: `Missing env vars: ${missing}` }, { status: 500 });
    }

    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity: `user-${userId}`,
      ttl: 3600,
    });

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: false,
    });

    token.addGrant(voiceGrant);

    return NextResponse.json({
      token: token.toJwt(),
      businessId: business.id,
      businessName: business.name,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[browser-token]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

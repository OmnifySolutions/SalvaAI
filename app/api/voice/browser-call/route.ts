import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import twilio from 'twilio';

// Called by Twilio when a browser-initiated call starts (TwiML App Request URL)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const businessId = formData.get('businessId') as string;
    const callSid    = formData.get('CallSid') as string;

    console.log(`[browser-call] businessId=${businessId} callSid=${callSid}`);

    if (!businessId) {
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say('Missing business ID.');
      twiml.hangup();
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // Create conversation record
    const { data: conversation } = await supabaseAdmin
      .from('conversations')
      .insert({
        business_id: businessId,
        channel: 'voice',
        twilio_call_sid: callSid,
        caller_phone: 'browser-demo',
        status: 'active',
      })
      .select()
      .single();

    const railwayUrl = process.env.RAILWAY_URL || 'wss://hustleclaude-production.up.railway.app';

    const streamUrl = `${railwayUrl}/media-stream`;
    console.log(`[browser-call] streamUrl=${streamUrl} conversationId=${conversation?.id} businessId=${businessId}`);

    const twiml = new twilio.twiml.VoiceResponse();
    const connect = twiml.connect();
    const stream = connect.stream({ url: streamUrl });
    // Pass IDs as Twilio Stream Parameters — more reliable than URL query params
    // (express-ws drops query params from WebSocket upgrade requests)
    if (conversation?.id) stream.parameter({ name: 'conversationId', value: conversation.id });
    stream.parameter({ name: 'businessId', value: businessId });

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Browser call webhook error:', error);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('An error occurred. Please try again.');
    twiml.hangup();
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

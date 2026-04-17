import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAfterHours } from '@/lib/classify';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;

    console.log(`Incoming call: ${callSid} from ${from} to ${to}`);

    // Find the business by their Twilio number
    const { data: businesses } = await supabaseAdmin
      .from('businesses')
      .select('id, hours')
      .eq('twilio_sid', to)
      .single();

    if (!businesses) {
      // No business found, return hangup
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say("Sorry, we couldn't process your call. Please try again.");
      twiml.hangup();
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // Create conversation record
    const afterHours = isAfterHours(businesses.hours as never);
    const { data: conversation } = await supabaseAdmin
      .from('conversations')
      .insert({
        business_id: businesses.id,
        channel: 'voice',
        twilio_call_sid: callSid,
        caller_phone: from,
        visitor_phone: from,
        status: 'active',
        urgency: 'routine',
        is_after_hours: afterHours,
      })
      .select()
      .single();

    // Return TwiML that connects to Railway WebSocket
    const railwayUrl = process.env.RAILWAY_URL || 'wss://your-railway-url.railway.app';
    const twiml = new twilio.twiml.VoiceResponse();

    const connect = twiml.connect();
    const streamUrl = `${railwayUrl}/media-stream`;
    console.log(`[incoming-call] streamUrl=${streamUrl} conversationId=${conversation.id} businessId=${businesses.id}`);
    const stream = connect.stream({ url: streamUrl });
    stream.parameter({ name: 'conversationId', value: conversation.id });
    stream.parameter({ name: 'businessId', value: businesses.id });

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Voice webhook error:', error);

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('An error occurred. Please try again later.');
    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

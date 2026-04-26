import { supabaseAdmin } from "@/lib/supabase";
import ChatWidget from "@/components/ChatWidget";
import { notFound } from "next/navigation";

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, name, widget_config")
    .eq("id", businessId)
    .single();

  if (!business) notFound();

  return (
    <div className="h-screen w-screen">
      <ChatWidget
        businessId={business.id}
        businessName={business.name}
        widgetConfig={business.widget_config ?? undefined}
      />
    </div>
  );
}

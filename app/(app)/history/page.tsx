import { createClient } from "@/lib/supabase/server";
import { HistoryView } from "@/components/HistoryView";
import type { Bottle } from "@/lib/types";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bottles")
    .select("*")
    .not("consumed_at", "is", null)
    .order("consumed_at", { ascending: false });

  return <HistoryView initialBottles={(data as Bottle[]) ?? []} />;
}

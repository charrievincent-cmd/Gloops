import { createClient } from "@/lib/supabase/server";
import { CaveView } from "@/components/CaveView";
import type { Bottle } from "@/lib/types";

export default async function CavePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bottles")
    .select("*")
    .is("consumed_at", null)
    .order("created_at", { ascending: false });

  return <CaveView initialBottles={(data as Bottle[]) ?? []} />;
}

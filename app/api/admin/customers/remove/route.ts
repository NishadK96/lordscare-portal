import { createClient } from "@supabase/supabase-js";
import { publicSupabaseUrl } from "@/lib/public-supabase-config";

export async function DELETE(request: Request) {
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!serviceKey) return Response.json({ error: "The private server connection is not configured." }, { status: 503 });
  if (!bearer) return Response.json({ error: "Sign in is required." }, { status: 401 });

  const adminClient = createClient(publicSupabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await adminClient.auth.getUser(bearer);
  if (authError || !authData.user) return Response.json({ error: "Your session is not valid." }, { status: 401 });
  const { data: adminProfile } = await adminClient.from("profiles").select("role, active").eq("id", authData.user.id).single();
  if (adminProfile?.role !== "admin" || !adminProfile.active) return Response.json({ error: "Admin access is required." }, { status: 403 });

  const body = await request.json() as { recordKind?: "internal" | "portal"; customerId?: string };
  if (!body.customerId || !["internal", "portal"].includes(body.recordKind ?? "")) return Response.json({ error: "A valid customer record is required." }, { status: 400 });

  if (body.recordKind === "internal") {
    const { data: record } = await adminClient.from("internal_customers").select("id, customer_code, full_name").eq("id", body.customerId).maybeSingle();
    if (!record) return Response.json({ error: "The internal customer record was not found." }, { status: 404 });
    const { error } = await adminClient.from("internal_customers").delete().eq("id", record.id);
    if (error) return Response.json({ error: error.message || "Could not remove the customer record." }, { status: 400 });
    await adminClient.from("audit_log").insert({ actor_id: authData.user.id, action: "internal_customer_removed", entity_type: "internal_customer", entity_id: record.id, details: { customer_code: record.customer_code, full_name: record.full_name } });
    return Response.json({ ok: true });
  }

  const { data: profile } = await adminClient.from("profiles").select("id, role, full_name, customer_code").eq("id", body.customerId).maybeSingle();
  if (!profile || profile.role !== "customer") return Response.json({ error: "The portal customer was not found or cannot be removed." }, { status: 404 });
  const { error } = await adminClient.auth.admin.deleteUser(profile.id);
  if (error) return Response.json({ error: typeof error.message === "string" ? error.message : "Could not remove the portal customer." }, { status: 400 });
  await adminClient.from("audit_log").insert({ actor_id: authData.user.id, action: "portal_customer_removed", entity_type: "profile", entity_id: profile.id, details: { customer_code: profile.customer_code, full_name: profile.full_name } });
  return Response.json({ ok: true });
}

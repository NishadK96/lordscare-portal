import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !serviceKey) return Response.json({ error: "Server connection is not configured." }, { status: 503 });
  if (!bearer) return Response.json({ error: "Sign in is required." }, { status: 401 });

  const adminClient = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await adminClient.auth.getUser(bearer);
  if (authError || !authData.user) return Response.json({ error: "Your session is not valid." }, { status: 401 });

  const { data: profile } = await adminClient.from("profiles").select("role, active").eq("id", authData.user.id).single();
  if (profile?.role !== "admin" || !profile.active) return Response.json({ error: "Admin access is required." }, { status: 403 });

  const body = await request.json() as { email?: string; fullName?: string; planCode?: string };
  if (!body.email || !body.fullName || !body.planCode) return Response.json({ error: "Name, email and plan are required." }, { status: 400 });

  const { data: plan, error: planError } = await adminClient.from("plans").select("id, price_inr").eq("code", body.planCode).eq("active", true).single();
  if (planError || !plan) return Response.json({ error: "The selected plan was not found." }, { status: 400 });

  const { data: invite, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(body.email, { data: { full_name: body.fullName } });
  if (inviteError || !invite.user) return Response.json({ error: inviteError?.message ?? "Could not invite customer." }, { status: 400 });

  await adminClient.from("profiles").update({ full_name: body.fullName }).eq("id", invite.user.id);
  const { error: subscriptionError } = await adminClient.from("subscriptions").insert({
    user_id: invite.user.id,
    plan_id: plan.id,
    amount_paid_inr: plan.price_inr,
    status: "pending",
  });
  if (subscriptionError) return Response.json({ error: subscriptionError.message }, { status: 400 });

  await adminClient.from("audit_log").insert({
    actor_id: authData.user.id,
    action: "customer_invited",
    entity_type: "profile",
    entity_id: invite.user.id,
    details: { email: body.email, plan_code: body.planCode },
  });
  return Response.json({ ok: true, userId: invite.user.id });
}

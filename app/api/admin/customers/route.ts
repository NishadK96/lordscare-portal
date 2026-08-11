import { createClient } from "@supabase/supabase-js";
import { publicSupabaseUrl } from "@/lib/public-supabase-config";

const allowedStatuses = new Set(["pending", "active", "past_due", "expired", "cancelled"]);

export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!serviceKey) return Response.json({ error: "The private server connection is not configured." }, { status: 503 });
  if (!bearer) return Response.json({ error: "Sign in is required." }, { status: 401 });

  const adminClient = createClient(publicSupabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await adminClient.auth.getUser(bearer);
  if (authError || !authData.user) return Response.json({ error: "Your session is not valid." }, { status: 401 });
  const { data: adminProfile } = await adminClient.from("profiles").select("role, active").eq("id", authData.user.id).single();
  if (adminProfile?.role !== "admin" || !adminProfile.active) return Response.json({ error: "Admin access is required." }, { status: 403 });

  const body = await request.json() as { fullName?: string; phone?: string; planCode?: string; amountPaid?: string; startedAt?: string; renewsAt?: string; status?: string };
  const fullName = body.fullName?.trim();
  const status = body.status || "active";
  const amountPaid = Number(body.amountPaid);
  if (!fullName || !body.planCode || !body.startedAt || !body.renewsAt) return Response.json({ error: "Name, plan, start date and due date are required." }, { status: 400 });
  if (!allowedStatuses.has(status)) return Response.json({ error: "Choose a valid payment status." }, { status: 400 });
  if (!Number.isFinite(amountPaid) || amountPaid < 0) return Response.json({ error: "Enter a valid payment amount." }, { status: 400 });
  if (new Date(body.renewsAt) < new Date(body.startedAt)) return Response.json({ error: "The due date must be after the start date." }, { status: 400 });

  const { data: plan, error: planError } = await adminClient.from("plans").select("id").eq("code", body.planCode).eq("active", true).single();
  if (planError || !plan) return Response.json({ error: "The selected plan was not found." }, { status: 400 });

  const internalId = crypto.randomUUID();
  const internalEmail = `record-${internalId}@internal.lordscare.invalid`;
  const customerCode = `LC-${Date.now().toString(36).toUpperCase()}-${internalId.slice(0, 4).toUpperCase()}`;
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: internalEmail,
    password: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
    email_confirm: true,
    user_metadata: { full_name: fullName, internal_record: true },
  });
  if (createError || !created.user) return Response.json({ error: createError?.message ?? "Could not create the customer record." }, { status: 400 });

  const { error: profileError } = await adminClient.from("profiles").update({ full_name: fullName, phone: body.phone?.trim() || null, customer_code: customerCode, role: "customer", active: true, updated_at: new Date().toISOString() }).eq("id", created.user.id);
  if (profileError) { await adminClient.auth.admin.deleteUser(created.user.id); return Response.json({ error: profileError.message }, { status: 400 }); }

  const { data: subscription, error: subscriptionError } = await adminClient.from("subscriptions").insert({
    user_id: created.user.id,
    plan_id: plan.id,
    amount_paid_inr: amountPaid,
    status,
    started_at: `${body.startedAt}T00:00:00.000Z`,
    renews_at: `${body.renewsAt}T00:00:00.000Z`,
    notes: "Internal admin record; no customer invitation sent.",
  }).select("id").single();
  if (subscriptionError) { await adminClient.auth.admin.deleteUser(created.user.id); return Response.json({ error: subscriptionError.message }, { status: 400 }); }

  await adminClient.from("audit_log").insert({
    actor_id: authData.user.id,
    action: "internal_customer_created",
    entity_type: "subscription",
    entity_id: subscription.id,
    details: { customer_id: created.user.id, customer_code: customerCode, plan_code: body.planCode, amount_paid_inr: amountPaid, status, renews_at: body.renewsAt, invitation_sent: false },
  });
  return Response.json({ ok: true, customerId: created.user.id, customerCode });
}

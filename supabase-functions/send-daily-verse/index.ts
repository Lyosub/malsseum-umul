// 매일 아침 GitHub Actions cron이 호출하는 전용 발송 함수.
// 관리자 로그인 세션 없이, 공유 비밀값(x-cron-secret)만으로 인증한다.
// 로직은 send-push와 동일(push_subscriptions 전체에 web-push 발송, 실패 구독 정리)하되
// 사용자 JWT 대신 서버 자체 SERVICE_ROLE 권한으로 push_subscriptions에 접근한다.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  const provided = req.headers.get("x-cron-secret");
  if (!cronSecret || provided !== cronSecret) {
    return new Response(JSON.stringify({ error: "인증에 실패했습니다." }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const { title, body: message, url, only_user_id } = await req.json();
  if (!title || !message) {
    return new Response(JSON.stringify({ error: "title, body가 필요합니다." }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT")!,
    Deno.env.get("VAPID_PUBLIC_KEY")!,
    Deno.env.get("VAPID_PRIVATE_KEY")!
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let query = supabaseAdmin.from("push_subscriptions").select("user_id, endpoint, p256dh, auth");
  if (only_user_id) query = query.eq("user_id", only_user_id);
  const { data: subs, error: subsErr } = await query;

  if (subsErr) {
    return new Response(JSON.stringify({ error: subsErr.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const payload = JSON.stringify({ title, body: message, url: url || "./" });
  let sent = 0;
  const results: { user_id: string; ok: boolean; statusCode?: number; error?: string }[] = [];

  await Promise.all(
    (subs || []).map((sub) =>
      webpush
        .sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
        .then(() => {
          sent++;
          results.push({ user_id: sub.user_id, ok: true });
        })
        .catch(async (err: { statusCode?: number; body?: string; message?: string }) => {
          results.push({ user_id: sub.user_id, ok: false, statusCode: err.statusCode, error: err.body || err.message });
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        })
    )
  );

  return new Response(JSON.stringify({ sent, total: subs?.length || 0, results }), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});

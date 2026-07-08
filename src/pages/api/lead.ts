import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false; // sunucu tarafı

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const FROM = "Agent Hukuku <merhaba@agenthukuku.com>";
const SITE = "https://agenthukuku.com";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function buildEmail(type: string, meta: any) {
  const wrap = (title: string, body: string) =>
    `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#26313f">
      <h2 style="color:#1B2A41">${title}</h2>${body}
      <hr style="border:0;border-top:1px solid #e6edf5;margin:24px 0">
      <p style="font-size:12px;color:#8592a6">Agent Hukuku · Yapay zeka ajanları için hukuk ve yönetişim · ${SITE}<br>Bu içerikler hukuki tavsiye değildir.</p>
    </div>`;
  if (type === "kitap")
    return { subject: "Kitabınız hazır: Yapay Zeka Ajanları & KVKK",
      html: wrap("Kitabınız hazır 📘", `<p>Aşağıdaki bağlantıdan indirebilirsiniz:</p>
      <p><a href="${SITE}/indir/yapay-zeka-ajanlari-ve-kvkk.pdf" style="background:#2F6D9E;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">PDF'i indir</a></p>
      <p>Şablonlara da <a href="${SITE}/sablonlar">buradan</a> ulaşabilirsiniz.</p>`) };
  if (type === "sablon")
    return { subject: "Şablon paketiniz — Agent Hukuku",
      html: wrap("Şablon paketiniz hazır 🗂️", `<p>Envanter, görev tanımı, aydınlatma metni, olay planı ve daha fazlası:</p>
      <p><a href="${SITE}/sablonlar">Şablonları indir</a></p>`) };
  if (type === "degerlendirme")
    return { subject: "Olgunluk karneniz — Agent Hukuku",
      html: wrap("Olgunluk karneniz 📊", `<p>Genel olgunluk skorunuz: <b>${meta?.total ?? "-"} / 100</b></p>
      <p>Detaylı analiz ve öncelik planı için kitabı da ekledik: <a href="${SITE}/indir/yapay-zeka-ajanlari-ve-kvkk.pdf">PDF'i indir</a></p>`) };
  return { subject: "Agent Hukuku bültenine hoş geldiniz",
    html: wrap("Aramıza hoş geldiniz 👋", `<p>İki haftada bir; yeni düzenlemeler, vakalar ve pratik şablonlar.</p>
    <p>Başlamak için: <a href="${SITE}/kitap">ücretsiz kitap</a> · <a href="${SITE}/degerlendirme">olgunluk testi</a></p>`) };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, type = "bulten", meta } = await request.json();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return json({ ok: false, error: "Geçerli bir e-posta girin." }, 400);

    const { subject, html } = buildEmail(type, meta);
    await resend.emails.send({ from: FROM, to: email, subject, html });

    // (opsiyonel) kendine bildirim
    if (import.meta.env.NOTIFY_TO)
      await resend.emails.send({ from: FROM, to: import.meta.env.NOTIFY_TO,
        subject: `Yeni kayıt: ${type}`, html: `<p>${email}</p><pre>${JSON.stringify(meta || {}, null, 2)}</pre>` });

    // (opsiyonel) bülten listesine ekle
    if (import.meta.env.RESEND_AUDIENCE_ID)
      try { await resend.contacts.create({ email, audienceId: import.meta.env.RESEND_AUDIENCE_ID, unsubscribed: false }); } catch {}

    return json({ ok: true });
  } catch {
    return json({ ok: false, error: "Bir hata oluştu, tekrar deneyin." }, 500);
  }
};

import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false; // sunucu tarafı

const FROM = "Agent Hukuku <merhaba@agenthukuku.com>";
const SITE = "https://agenthukuku.com";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

const PDF = `${SITE}/indir/yapay-zeka-ajanlari-ve-kvkk.pdf`;
const VAKALAR_PDF = `${SITE}/indir/agent-vakalari-2026.pdf`;
const PILLARS = ["Sorumlu", "Güvenli", "Şeffaf", "Uyumlu", "Hesap Verebilir"];
const RECS = [
  { t: "Görünürlüğü kurun", d: "Tüm ajanların envanterini çıkarın ve her birine isimle bir sahip atayın.", c: "Bölüm 2 & 4" },
  { t: "Erişimi ve durdurmayı sıkılaştırın", d: "Ayrı kimlik + en az yetki verin; acil durdurmayı test edin.", c: "Bölüm 5, 6, 8, 9" },
  { t: "Şeffaflığı sağlayın", d: "Ajan kullanımını açıkça bildirin; kararların izlenebilirliğini kurun.", c: "Bölüm 10 & 11" },
  { t: "Hukuki zemini tamamlayın", d: "İşleme şartlarını netleştirin, sözleşme ve aktarımı düzenleyin.", c: "Bölüm 14, 16, 17" },
  { t: "Hesap verebilirliği inşa edin", d: "Denetim izi + tek sayfalık olay müdahale planı oluşturun.", c: "Bölüm 10 & 18" },
];
const C = { navy: "#1B2A41", accent: "#2F6D9E", ink: "#26313f", muted: "#8592a6", line: "#e6edf5", bg: "#F7F9FC", ok: "#2E7D5B", warn: "#C77D2E", risk: "#C0492F" };
const sCol = (p: number) => (p >= 70 ? C.ok : p >= 40 ? C.warn : C.risk);

const btn = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:${C.accent}">
    <a href="${href}" style="display:inline-block;padding:13px 26px;font:600 15px Inter,Arial,sans-serif;color:#ffffff;text-decoration:none;border-radius:10px">${label}</a>
  </td></tr></table>`;

const secTitle = (t: string) =>
  `<div style="font:700 12px Inter,Arial,sans-serif;color:${C.navy};text-transform:uppercase;letter-spacing:.05em;margin:26px 0 13px;padding-bottom:8px;border-bottom:2px solid ${C.line}">${t}</div>`;

const eyebrow = (t: string) => `<p style="margin:0 0 4px;font:700 12px Inter,Arial,sans-serif;color:${C.accent};letter-spacing:.06em">${t}</p>`;
const h1 = (t: string) => `<h1 style="margin:0 0 14px;font:700 24px Georgia,serif;color:${C.navy};line-height:1.2">${t}</h1>`;
const p = (t: string) => `<p style="margin:0 0 14px;font:400 15px Inter,Arial,sans-serif;color:${C.ink};line-height:1.6">${t}</p>`;

function shell(preheader: string, inner: string) {
  return `<!DOCTYPE html><html lang="tr"><body style="margin:0;padding:0;background:${C.bg}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:26px 12px">
   <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${C.line}">
      <tr><td style="background:${C.navy};padding:18px 28px">
        <table role="presentation" width="100%"><tr>
          <td style="font:700 18px Georgia,serif;color:#ffffff">Agent Hukuku</td>
          <td align="right" style="font:500 12px Inter,Arial,sans-serif;color:#9db4d0">Ajanlar için hukuk &amp; yönetişim</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:28px 28px 8px">${inner}</td></tr>
      <tr><td style="padding:18px 28px 24px">
        <p style="margin:0;font:400 12px Inter,Arial,sans-serif;color:${C.muted};line-height:1.6;border-top:1px solid ${C.line};padding-top:16px">
          Agent Hukuku · <a href="${SITE}" style="color:${C.accent};text-decoration:none">agenthukuku.com</a> · Bu içerikler hukuki tavsiye değildir.<br>
          Bu e-postayı, sitemizde açık rıza vererek talep ettiğiniz için alıyorsunuz.</p>
      </td></tr>
    </table>
   </td></tr>
  </table></body></html>`;
}

function bar(name: string, pct: number) {
  const col = sCol(pct);
  const W = 300, fill = Math.min(Math.max(Math.round((pct / 100) * W), 4), W);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 11px"><tr>
    <td width="118" style="font:600 13px Inter,Arial,sans-serif;color:${C.ink};padding-right:10px">${name}</td>
    <td>
      <table role="presentation" width="${W}" cellpadding="0" cellspacing="0" style="width:${W}px;background:#e9eff6;border-radius:7px"><tr>
        <td width="${fill}" style="width:${fill}px;background:${col};height:13px;border-radius:7px;font-size:1px;line-height:1px">&nbsp;</td>
        <td style="font-size:1px;line-height:1px">&nbsp;</td>
      </tr></table>
    </td>
    <td width="40" align="right" style="font:700 13px Inter,Arial,sans-serif;color:${col};padding-left:10px">%${pct}</td>
  </tr></table>`;
}

function dashboard(meta: any) {
  const total = Math.round(Number(meta?.total ?? 0));
  const pcts: number[] = Array.isArray(meta?.pillars) && meta.pillars.length === 5
    ? meta.pillars.map((n: any) => Math.round(Number(n) || 0))
    : [0, 0, 0, 0, 0];

  let band: string, verdict: string, sum: string, bandColor: string;
  if (total < 40) { band = "Başlangıç"; bandColor = C.risk; verdict = "Temeli kurma zamanı"; sum = "Ajanlar iş görüyor ama yönetişim henüz kurulmamış. En büyük kazanımlar önünüzde — aşağıdaki önceliklerden başlayın."; }
  else if (total < 70) { band = "Gelişmekte"; bandColor = C.warn; verdict = "İyi yoldasınız"; sum = "Temel bazı yerlerde var ama boşluklar risk taşıyor. Zayıf alanları kapatarak hızla olgunlaşabilirsiniz."; }
  else { band = "Olgun"; bandColor = C.ok; verdict = "Güçlü bir yönetişim"; sum = "Ajanlarınızı bilinçli yönetiyorsunuz. Bundan sonrası sürekliliği ve kanıtlanabilirliği korumak."; }

  const strong = pcts.indexOf(Math.max(...pcts));
  const weak = pcts.indexOf(Math.min(...pcts));
  const order = [0, 1, 2, 3, 4].sort((a, b) => pcts[a] - pcts[b]).slice(0, 3);

  const hero = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px"><tr>
    <td width="120" valign="top">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:108px;background:${C.navy};border-radius:14px"><tr>
        <td align="center" valign="middle" style="height:104px;text-align:center">
          <div style="font:700 42px Georgia,serif;color:#ffffff;line-height:1">${total}</div>
          <div style="font:600 11px Inter,Arial,sans-serif;color:#9db4d0;letter-spacing:.08em;margin-top:2px">/ 100 PUAN</div>
        </td>
      </tr></table>
    </td>
    <td valign="top" style="padding-left:18px">
      <span style="display:inline-block;background:${bandColor};color:#ffffff;font:700 12px Inter,Arial,sans-serif;padding:4px 13px;border-radius:20px;letter-spacing:.03em">${band}</span>
      <div style="font:700 20px Georgia,serif;color:${C.navy};margin:10px 0 5px">${verdict}</div>
      <div style="font:400 14px Inter,Arial,sans-serif;color:${C.ink};line-height:1.55">${sum}</div>
    </td>
  </tr></table>`;

  const bars = pcts.map((v, i) => bar(PILLARS[i], v)).join("");

  const kpis = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px"><tr>
    <td width="50%" valign="top" style="padding-right:6px">
      <table role="presentation" width="100%" style="background:#f2f8f4;border:1px solid #d8ebe0;border-radius:12px"><tr><td style="padding:12px 14px">
        <div style="font:600 11px Inter,Arial,sans-serif;color:${C.muted};text-transform:uppercase;letter-spacing:.04em">En güçlü ilke</div>
        <div style="font:700 16px Georgia,serif;color:${C.navy};margin-top:3px">${PILLARS[strong]}</div>
        <div style="font:600 12px Inter,Arial,sans-serif;color:${C.ok};margin-top:2px">%${pcts[strong]} olgunluk</div>
      </td></tr></table>
    </td>
    <td width="50%" valign="top" style="padding-left:6px">
      <table role="presentation" width="100%" style="background:#fdf4f0;border:1px solid #f2d9cf;border-radius:12px"><tr><td style="padding:12px 14px">
        <div style="font:600 11px Inter,Arial,sans-serif;color:${C.muted};text-transform:uppercase;letter-spacing:.04em">En zayıf ilke</div>
        <div style="font:700 16px Georgia,serif;color:${C.navy};margin-top:3px">${PILLARS[weak]}</div>
        <div style="font:600 12px Inter,Arial,sans-serif;color:${C.risk};margin-top:2px">%${pcts[weak]} olgunluk</div>
      </td></tr></table>
    </td>
  </tr></table>`;

  const plan = order.map((i) => {
    const r = RECS[i]; const col = sCol(pcts[i]); const pr = pcts[i] < 40 ? "Yüksek" : "Orta";
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;background:#f7f9fc;border:1px solid ${C.line};border-radius:12px"><tr><td style="padding:13px 15px">
      <span style="display:inline-block;background:${col};color:#ffffff;font:700 11px Inter,Arial,sans-serif;padding:3px 10px;border-radius:20px">${pr} öncelik</span>
      <span style="font:600 12px Inter,Arial,sans-serif;color:${C.muted};margin-left:8px">${PILLARS[i]} · %${pcts[i]}</span>
      <div style="font:700 15px Georgia,serif;color:${C.navy};margin:9px 0 3px">${r.t}</div>
      <div style="font:400 13px Inter,Arial,sans-serif;color:${C.ink};line-height:1.55">${r.d}</div>
      <div style="font:600 12px Inter,Arial,sans-serif;color:${C.accent};margin-top:5px">→ Kitapta ${r.c}</div>
    </td></tr></table>`;
  }).join("");

  return eyebrow("OLGUNLUK KARNENİZ")
    + h1("Yapay zeka ajanı yönetişim karneniz")
    + p("İşte beş ilkede olgunluk fotoğrafınız ve nereden başlamanız gerektiği. Her başlık kitaptaki ilgili bölüme bağlı.")
    + hero
    + secTitle("Beş ilkede olgunluk")
    + bars
    + kpis
    + secTitle("Öncelikli aksiyon planı")
    + `<p style="margin:0 0 14px;font:400 13px Inter,Arial,sans-serif;color:${C.muted}">En hızlı kazanımı bu üç alanda elde edersiniz.</p>`
    + plan
    + `<div style="margin:22px 0 6px">${btn(PDF, "📘 Kitabı indirin")}</div>`
    + p("Planınızı bölüm bölüm uygulamak için 145 sayfalık rehberi ekledik.");
}

function buildEmail(type: string, meta: any) {
  if (type === "kitap")
    return {
      subject: "📘 Kitabınız hazır: Yapay Zeka Ajanları & KVKK",
      html: shell("145 sayfalık pratik rehberiniz indirmeye hazır.",
        eyebrow("ÜCRETSİZ E-KİTAP")
        + h1("Kitabınız hazır 📘")
        + p("<b>Yapay Zeka Ajanları &amp; KVKK</b> — 145 sayfa, 20 bölüm. Kurgu şirket TeknoVadi'nin başına gelen gerçek vakalarla; ajanları sorumlu, güvenli, şeffaf ve KVKK'ya uyumlu yönetmenin pratik rehberi.")
        + `<div style="margin:18px 0">${btn(PDF, "PDF'i indir")}</div>`
        + secTitle("Kitapta ne var?")
        + p("• Ajan envanteri ve sahiplik &nbsp;• En az yetki ve acil durdurma &nbsp;• KVKK işleme şartları ve aydınlatma &nbsp;• Yurt dışı aktarım &nbsp;• Olay müdahale planı &nbsp;• 20 kural + 10 hata listesi")
        + p(`Bir sonraki adım: <a href="${SITE}/degerlendirme" style="color:${C.accent}">olgunluk testini</a> çözün, şirketinize özel bir yol haritası çıkarın. Hazır <a href="${SITE}/sablonlar" style="color:${C.accent}">şablonlar</a> da sizi bekliyor.`)),
    };

  if (type === "sablon")
    return {
      subject: "🗂️ Şablon paketiniz — Agent Hukuku",
      html: shell("6 hazır Word şablonu: envanter, görev tanımı, aydınlatma ve daha fazlası.",
        eyebrow("HAZIR ŞABLONLAR")
        + h1("Şablon paketiniz hazır 🗂️")
        + p("Doldur-kullan formatında altı Word şablonu ile yönetişimi bugün başlatın:")
        + p("• <b>Ajan envanteri</b> &nbsp;• <b>Görev tanımı</b> (amaç/izin/yasak/eskalasyon) &nbsp;• <b>İşleme şartı haritası</b> &nbsp;• <b>Aydınlatma metni</b> &nbsp;• <b>Olay müdahale planı</b> &nbsp;• <b>Tedarikçi değerlendirme</b>")
        + `<div style="margin:18px 0">${btn(`${SITE}/sablonlar`, "Şablonları indir")}</div>`
        + p(`Şablonları nasıl dolduracağınızı kitaptaki vakalarla adım adım görebilirsiniz: <a href="${PDF}" style="color:${C.accent}">e-kitabı indirin</a>.`)),
    };

  if (type === "degerlendirme")
    return {
      subject: `📊 Karneniz: ${Math.round(Number(meta?.total ?? 0))}/100 — Agent Hukuku`,
      html: shell(`Olgunluk skorunuz ${Math.round(Number(meta?.total ?? 0))}/100. İşte ilke ilke analiz ve aksiyon planınız.`, dashboard(meta)),
    };

  if (type === "iletisim")
    return {
      subject: "✅ Mesajınızı aldık — Agent Hukuku",
      html: shell("İletişim talebinizi aldık; en kısa sürede dönüş yapacağız.",
        eyebrow("İLETİŞİM")
        + h1("Mesajınızı aldık ✅")
        + p("Bize ulaştığınız için teşekkürler. Mesajınız iletildi; en kısa sürede size dönüş yapacağız.")
        + p(`Bu arada <a href="${SITE}/vakalar" style="color:${C.accent}">vaka kütüphanesine</a> göz atabilir ya da <a href="${SITE}/kitaplar" style="color:${C.accent}">ücretsiz e-kitapları</a> indirebilirsiniz.`)),
    };

  if (type === "vakalar")
    return {
      subject: "📕 Agent Vakaları 2026 — e-kitabınız hazır",
      html: shell("Ajanların yol açtığı 33 gerçek olay, 12 temada — indirmeye hazır.",
        eyebrow("ÜCRETSİZ E-KİTAP")
        + h1("Agent Vakaları 2026 📕")
        + p("Yapay zeka ajanlarının gerçek dünyada yol açtığı <b>33 olay</b>, on iki temaya göre derlendi. Her vaka; ne olduğu, kör noktası ve çıkarılacak <b>dersiyle</b> birlikte — kurgu değil, kayıt.")
        + `<div style="margin:18px 0">${btn(VAKALAR_PDF, "PDF'i indir")}</div>`
        + p(`Bu vakalar canlı ve büyüyen bir liste olarak <a href="${SITE}/vakalar" style="color:${C.accent}">agenthukuku.com/vakalar</a>'da güncelleniyor. Aynı gecelerden korunmak için <a href="${SITE}/degerlendirme" style="color:${C.accent}">olgunluk testini</a> çözün ve <a href="${SITE}/araclar" style="color:${C.accent}">belge üreteçlerini</a> kullanın.`)),
    };

  if (type === "envanter")
    return {
      subject: "🗂️ Ajan Envanteri üreteciniz — Agent Hukuku",
      html: shell("Ajan envanterinizi tarayıcıda oluşturup Word olarak indirin.",
        eyebrow("ARAÇ")
        + h1("Ajan Envanteri üreteciniz hazır 🗂️")
        + p("Tarayıcınızda doldurup Word belgesi olarak indirebileceğiniz <b>Ajan Envanteri üreteci</b> kullanımınıza açık. Girdiğiniz hiçbir bilgi sunucuya gönderilmez — belge tamamen tarayıcınızda oluşturulur.")
        + `<div style="margin:18px 0">${btn(`${SITE}/sablonlar/ajan-envanteri-ureteci`, "Üreteci aç")}</div>`
        + p(`Envanteri neden ve nasıl doldurmanız gerektiğini kitaptaki vakalarla görün: <a href="${PDF}" style="color:${C.accent}">e-kitabı indirin</a>. Diğer belgeler <a href="${SITE}/sablonlar" style="color:${C.accent}">şablonlar</a> sayfasında.`)),
    };

  return {
    subject: "👋 Agent Hukuku bültenine hoş geldiniz",
    html: shell("İki haftada bir; yeni düzenlemeler, gerçek vakalar ve pratik şablonlar.",
      eyebrow("BÜLTEN")
      + h1("Aramıza hoş geldiniz 👋")
      + p("İki haftada bir kutunuza; yeni KVKK düzenlemeleri, gerçek ajan vakaları ve doğrudan kullanabileceğiniz şablonlar. Reklam yok, dolgu yok — sadece işinize yarayanı.")
      + secTitle("Başlamak için")
      + p(`📘 <a href="${PDF}" style="color:${C.accent}">Ücretsiz e-kitabı indirin</a> — 145 sayfalık pratik rehber.`)
      + p(`📊 <a href="${SITE}/degerlendirme" style="color:${C.accent}">Olgunluk testini çözün</a> — şirketinize özel yol haritası.`)
      + p(`🗂️ <a href="${SITE}/sablonlar" style="color:${C.accent}">Şablonları alın</a> — envanterden olay planına.`)
      + `<div style="margin:18px 0">${btn(PDF, "📘 Kitapla başlayın")}</div>`),
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!import.meta.env.RESEND_API_KEY)
      return json({ ok: false, error: "Sunucu yapılandırması eksik: RESEND_API_KEY bu ortamda tanımlı değil." }, 500);

    const { email, type = "bulten", meta, message, consent } = await request.json();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return json({ ok: false, error: "Geçerli bir e-posta girin." }, 400);
    if (consent !== true)
      return json({ ok: false, error: "KVKK Aydınlatma Metni kapsamında açık rıza gerekli." }, 400);

    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    // KVKK: açık rıza kaydı (kanıt için)
    const consentText =
      "KVKK kapsamında e-postamın işlenmesine ve bilgilendirme/pazarlama iletisi gönderilmesine Aydınlatma Metni uyarınca açık rıza veriyorum.";
    const consentRecord = {
      consent: true,
      consentText,
      at: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "",
      ua: request.headers.get("user-agent") || "",
    };

    const { subject, html } = buildEmail(type, meta);
    const sent = await resend.emails.send({ from: FROM, to: email, subject, html });
    if (sent.error)
      return json({ ok: false, error: `Resend: ${sent.error.message || sent.error.name}` }, 502);

    // (opsiyonel) kendine bildirim — açık rıza kanıtıyla birlikte
    if (import.meta.env.NOTIFY_TO)
      await resend.emails.send({ from: FROM, to: import.meta.env.NOTIFY_TO,
        subject: `Yeni kayıt: ${type}`,
        html: `<p><b>${email}</b></p>${message ? `<p><b>Mesaj:</b><br>${String(message).replace(/</g, "&lt;")}</p>` : ""}<p>Açık rıza: ✔ ${consentRecord.at}</p>
        <pre>${JSON.stringify({ meta: meta || {}, consent: consentRecord }, null, 2)}</pre>` });

    // (opsiyonel) bülten listesine ekle
    if (import.meta.env.RESEND_AUDIENCE_ID)
      try { await resend.contacts.create({ email, audienceId: import.meta.env.RESEND_AUDIENCE_ID, unsubscribed: false }); } catch {}

    return json({ ok: true });
  } catch (err: any) {
    // Geçici teşhis: gerçek hata mesajını döndür (sorun çözülünce sadeleştirilebilir)
    return json({ ok: false, error: `Sunucu hatası: ${err?.message || String(err)}` }, 500);
  }
};

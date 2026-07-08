# Agent Hukuku — web sitesi (Astro)

Yapay zeka ajanları için hukuk ve yönetişim girişiminin hub sitesi. v1: ana sayfa (tasarım temeli).

## Çalıştırma
```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # ./dist
```

## Yapı
- `src/styles/global.css` — tasarım sistemi (kitabın mavi editoryal kimliği)
- `src/layouts/Base.astro` — sayfa iskeleti + fontlar + meta
- `src/components/Header.astro`, `Footer.astro`
- `src/pages/index.astro` — ana sayfa
- `public/kitap-kapak.png` — kitap kapağı

## Sonraki sayfalar (IA)
`/makaleler` (blog) · `/degerlendirme` (interaktif olgunluk testi) · `/sablonlar` · `/kitap` (gated indirme) · `/hakkinda`

Hızlı önizleme (kurulum gerekmez): `Agent-Hukuku-anasayfa-onizleme.html`

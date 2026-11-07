import React, { useEffect, useMemo, useRef, useState } from 'react'
import { PRODUCTS, CATEGORIES, COLORS, WHATSAPP } from './data.js'

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const money = (v) => BRL.format(v)

function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function prodById(id) {
  return PRODUCTS.find((p) => p.id === id)
}

function colorsOf(p) {
  return p.colors ? COLORS.filter((c) => p.colors.includes(c.id)) : COLORS
}

const FEATURED = [
  { cat: 'natal', img: '/images/presepio.jpg', line: 'presépios, vilas e enfeites' },
  { cat: 'japandi', img: '/images/vaso-hana.jpg', line: 'o essencial, com calma' },
  { cat: 'bebe', img: '/images/mobile-bebe.jpg', line: 'lembranças da chegada' },
  { cat: 'pet', img: '/images/comedouro-pet.jpg', line: 'pro melhor amigo da casa' },
  { cat: 'casal', img: '/images/letreiro-casal.jpg', line: 'presentes com significado' },
]

function useReveal(deps) {
  useEffect(() => {
    const els = document.querySelectorAll('.rv:not(.in)')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, deps)
}

export default function App() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('all')
  const [cart, setCart] = useState([])
  const [drawer, setDrawer] = useState(false)
  const [modal, setModal] = useState(null) // product id
  const [toast, setToast] = useState('')
  const [custName, setCustName] = useState('')
  const [delivery, setDelivery] = useState('Retirada (a combinar)')
  const [obs, setObs] = useState('')
  const toastTimer = useRef(null)

  const counts = useMemo(() => {
    const c = { all: PRODUCTS.length }
    for (const p of PRODUCTS) c[p.cat] = (c[p.cat] || 0) + 1
    return c
  }, [])

  const filtered = useMemo(() => {
    const q = norm(query.trim())
    return PRODUCTS.filter((p) => {
      if (cat !== 'all' && p.cat !== cat) return false
      if (!q) return true
      return norm(`${p.name} ${p.desc} ${CATEGORIES[p.cat].name}`).includes(q)
    })
  }, [query, cat])

  const total = useMemo(
    () => cart.reduce((s, it) => s + prodById(it.pid).price * it.qty, 0),
    [cart],
  )
  const cartCount = useMemo(() => cart.reduce((s, it) => s + it.qty, 0), [cart])

  useReveal([filtered.length, cat])

  useEffect(() => {
    document.body.style.overflow = drawer || modal ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawer, modal])

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }

  function addToCart(pid, color, pers, qty = 1) {
    const key = `${pid}|${color}|${pers || ''}`
    setCart((prev) => {
      const i = prev.findIndex((it) => it.key === key)
      if (i >= 0) {
        const next = [...prev]
        next[i] = { ...next[i], qty: next[i].qty + qty }
        return next
      }
      return [...prev, { key, pid, color, pers: pers || '', qty }]
    })
    showToast('Adicionado ao pedido ✓')
  }

  function quickAdd(p) {
    if (p.pers && p.pers.required) {
      setModal(p.id)
      return
    }
    addToCart(p.id, colorsOf(p)[0].id, '')
  }

  function setQty(key, qty) {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((it) => it.key !== key)
        : prev.map((it) => (it.key === key ? { ...it, qty } : it)),
    )
  }

  function checkout() {
    if (!cart.length) {
      showToast('Seu carrinho está vazio.')
      return
    }
    const lines = []
    lines.push('*Novo pedido — MinducoLabs*')
    lines.push('————————————')
    cart.forEach((it, i) => {
      const p = prodById(it.pid)
      lines.push(`${i + 1}. *${p.name}*`)
      lines.push(`    Cor: ${it.color}`)
      if (it.pers) lines.push(`    Personalização: "${it.pers}"`)
      lines.push(`    Qtd: ${it.qty} × ${money(p.price)} = *${money(p.price * it.qty)}*`)
    })
    lines.push('————————————')
    lines.push(`*Total estimado: ${money(total)}*`)
    lines.push(`Entrega: ${delivery}`)
    if (custName.trim()) lines.push(`Nome: ${custName.trim()}`)
    if (obs.trim()) lines.push(`Obs.: ${obs.trim()}`)
    lines.push('')
    lines.push('Pode me confirmar prazo e pagamento? Obrigado(a)!')
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(url, '_blank', 'noopener')
  }

  function goToCat(c) {
    setCat(c)
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
  }

  const modalProduct = modal ? prodById(modal) : null

  return (
    <div className="page">
      <header className="topbar">
        <a className="logo" href="#top" onClick={() => { setCat('all'); setQuery('') }}>
          Minduco<span className="logo-dot">●</span>Labs
        </a>
        <div className="topbar-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar no catálogo…"
            aria-label="Buscar no catálogo"
          />
        </div>
        <button className="cart-btn" onClick={() => setDrawer(true)} aria-label="Ver carrinho">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
            <path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.4 18h8.9a2 2 0 0 0 2-1.6L22 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="21" r="1.4" fill="currentColor" />
            <circle cx="18" cy="21" r="1.4" fill="currentColor" />
          </svg>
          <span className="cart-btn-label">Carrinho</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <p className="eyebrow">Impressão 3D sob encomenda · peças maiores em várias partes, cada parte em 1 cor</p>
          <h1>
            Peças em 3D,
            <br />
            <em>feitas pra você</em> — sem complicação.
          </h1>
          <p className="hero-sub">
            Decoração, presentes, chaveiros articulados e peças com o seu nome ou a sua foto —
            agora também com linhas de Natal, estilo japandi, bebê, pet e casal. As peças saem em
            cinza, preto ou branco; as maiores são montadas com várias partes, cada parte em uma
            cor, sem troca de filamento no meio da impressão. Monte o pedido aqui e finalize pelo WhatsApp.
          </p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={() => goToCat('all')}>Ver o catálogo</button>
            <button className="btn-ghost" onClick={() => goToCat('pers')}>Quero algo personalizado</button>
          </div>
          <div className="hero-stats">
            <div><strong>{PRODUCTS.length}</strong><span>peças no catálogo</span></div>
            <div><strong>{Object.keys(CATEGORIES).length}</strong><span>coleções</span></div>
            <div><strong>1 cor</strong><span>por parte, sem AMS</span></div>
            <div><strong>2–5 dias</strong><span>prazo de produção</span></div>
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((n) => (
              <span key={n}>
                {Object.values(CATEGORIES).map((c) => (
                  <span key={`${n}-${c.id}`} className="marquee-item">{c.name} <i>✦</i></span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <section className="collections rv">
          <div className="section-head">
            <h2>Coleções em destaque</h2>
            <p>Comece por um tema — ou role direto pro catálogo completo.</p>
          </div>
          <div className="collection-row">
            {FEATURED.map((f) => (
              <button key={f.cat} className="collection-card" onClick={() => goToCat(f.cat)}>
                <img src={f.img} alt={CATEGORIES[f.cat].name} loading="lazy" />
                <span className="collection-info">
                  <strong>{CATEGORIES[f.cat].name}</strong>
                  <span>{counts[f.cat]} peças · {f.line}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="toolbar" id="catalogo">
          <div className="chips" role="group" aria-label="Filtrar por categoria">
            <button className={cat === 'all' ? 'chip active' : 'chip'} onClick={() => setCat('all')}>
              Tudo · {counts.all}
            </button>
            {Object.values(CATEGORIES).map((c) => (
              <button
                key={c.id}
                className={cat === c.id ? 'chip active' : 'chip'}
                onClick={() => setCat(c.id)}
              >
                {c.name} · {counts[c.id] || 0}
              </button>
            ))}
          </div>
          <div className="searchrow">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar no catálogo… (ex.: vaso, chaveiro, natal)"
              aria-label="Buscar no catálogo"
            />
          </div>
          <p className="result-count">
            {filtered.length} {filtered.length === 1 ? 'peça' : 'peças'}
            {cat !== 'all' && <> em {CATEGORIES[cat].name}</>}
            {query.trim() && <> para “{query.trim()}”</>}
          </p>
        </div>

        <section className="grid" aria-live="polite">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} onOpen={() => setModal(p.id)} onAdd={() => quickAdd(p)} />
          ))}
        </section>
        {filtered.length === 0 && (
          <p className="empty-msg">Nada por aqui com esse filtro. Tenta outra categoria ou limpa a busca.</p>
        )}

        <section className="how rv">
          <h2>Como funciona o pedido</h2>
          <p className="sub">Sem cadastro, sem pagamento na página — o pedido chega organizado direto no nosso WhatsApp.</p>
          <div className="steps">
            <div className="step"><span className="num">1</span><div><h3>Monte seu carrinho</h3><p>Escolha a peça, a cor principal (cinza, preto ou branco) e a quantidade. Nas peças de várias partes, cada parte sai em uma cor e a gente monta tudo antes da entrega — as cores das demais partes você combina no WhatsApp. Nos itens personalizados, digite o nome ou o texto na própria ficha do produto.</p></div></div>
            <div className="step"><span className="num">2</span><div><h3>Finalize pelo WhatsApp</h3><p>No carrinho, toque em “Enviar pedido no WhatsApp”. A mensagem já vai montada com itens, cores, personalizações e total estimado.</p></div></div>
            <div className="step"><span className="num">3</span><div><h3>A gente produz e combina a entrega</h3><p>Confirmamos prazo, pagamento e entrega na conversa. Peças personalizadas com foto: você envia a foto no WhatsApp logo depois de fechar o pedido.</p></div></div>
          </div>
        </section>

        <section className="notes rv">
          <p><b>Prazo:</b> a maioria das peças fica pronta em 2 a 5 dias úteis após a confirmação — itens maiores e personalizados podem levar um pouco mais. Confirmamos o prazo exato no WhatsApp antes de produzir.</p>
          <p><b>Cores e fotos:</b> as fotos são ilustrativas do modelo. Trabalhamos com filamento em <b>cinza, preto e branco</b> — a cor final da sua peça é a que você escolher no pedido. Peças maiores podem ser formadas por <b>várias partes, cada uma impressa em uma única cor</b> e montadas depois (sem AMS): você escolhe a cor principal no pedido e combina as cores das outras partes no WhatsApp. Variações leves de tom e textura são naturais da impressão 3D.</p>
          <p><b>Material:</b> peças decorativas e de uso interno em PLA/PETG. Vasinhos são para flores secas ou como cachepot (com um copinho por dentro, se for regar a planta).</p>
        </section>
      </main>

      <footer>
        <span className="brandline">MinducoLabs</span>
        <span>Impressão 3D sob encomenda · Pedidos pelo WhatsApp (11) 94585-3707</span>
        <span>Chaveiro Flexi Rex: design disponibilizado sob licença CC BY-SA, com atribuição ao autor.</span>
      </footer>

      <button className="fab" onClick={() => setDrawer(true)} aria-label="Ver carrinho">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
          <path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.4 18h8.9a2 2 0 0 0 2-1.6L22 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="21" r="1.4" fill="currentColor" />
          <circle cx="18" cy="21" r="1.4" fill="currentColor" />
        </svg>
        <span>Ver carrinho{cartCount > 0 ? ` · ${money(total)}` : ''}</span>
      </button>

      {drawer && (
        <CartDrawer
          cart={cart}
          total={total}
          onClose={() => setDrawer(false)}
          onQty={setQty}
          onCheckout={checkout}
          custName={custName}
          setCustName={setCustName}
          delivery={delivery}
          setDelivery={setDelivery}
          obs={obs}
          setObs={setObs}
        />
      )}

      {modalProduct && (
        <ProductModal
          p={modalProduct}
          onClose={() => setModal(null)}
          onAdd={(color, pers, qty) => {
            addToCart(modalProduct.id, color, pers, qty)
            setModal(null)
            setDrawer(true)
          }}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

function ProductCard({ p, onOpen, onAdd }) {
  return (
    <article className="card rv">
      <button className="card-img" onClick={onOpen} aria-label={`Ver ${p.name}`}>
        <img src={p.img} alt={p.alt} loading="lazy" />
        {p.badge && <span className={`badge ${p.badgeCls || ''}`}>{p.badge}</span>}
      </button>
      <div className="card-body">
        <span className="card-cat">{CATEGORIES[p.cat].name}</span>
        <h3 onClick={onOpen}>{p.name}</h3>
        <p className="card-desc">{p.desc}</p>
        <p className="card-meta">{p.grams} · {p.time}</p>
        {p.parts && <p className="card-parts">🧩 Várias partes — cada parte em 1 cor, montadas depois</p>}
        <div className="buyrow">
          <span className="price">{money(p.price)}</span>
          <button className="btn-add" onClick={onAdd}>Adicionar</button>
        </div>
      </div>
    </article>
  )
}

function ProductModal({ p, onClose, onAdd }) {
  const opts = colorsOf(p)
  const [color, setColor] = useState(opts[0].id)
  const [pers, setPers] = useState('')
  const [qty, setQty] = useState(1)
  const [err, setErr] = useState('')

  function submit() {
    if (p.pers && p.pers.required && !pers.trim()) {
      setErr('Preencha a personalização antes de adicionar.')
      return
    }
    onAdd(color, pers.trim(), qty)
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={p.name} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        <img className="modal-img" src={p.img} alt={p.alt} />
        <div className="modal-body">
          <span className="card-cat">{CATEGORIES[p.cat].name}</span>
          <h2>{p.name}</h2>
          {p.badge && <span className={`badge ${p.badgeCls || ''}`}>{p.badge}</span>}
          <p className="modal-desc">{p.desc}</p>
          <p className="card-meta">{p.grams} · {p.time}</p>
          {p.parts && (
            <div className="note-box">
              <strong>🧩 Peça em várias partes</strong>
              <p>{p.parts}</p>
            </div>
          )}
          {p.colorNote && (
            <div className="note-box">
              <p>{p.colorNote}</p>
            </div>
          )}
          <div className="field">
            <label>Cor principal</label>
            <div className="swatches">
              {opts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={color === c.id ? 'swatch active' : 'swatch'}
                  onClick={() => setColor(c.id)}
                  aria-pressed={color === c.id}
                >
                  <span className="dot" style={{ background: c.hex }} />
                  {c.id}
                </button>
              ))}
            </div>
          </div>
          {p.pers && (
            <div className="field">
              <label>{p.pers.label}{p.pers.required ? ' *' : ''}</label>
              <input
                type="text"
                value={pers}
                onChange={(e) => setPers(e.target.value)}
                placeholder={p.pers.ph}
              />
              <span className="hint">{p.pers.hint}</span>
            </div>
          )}
          <div className="modal-buy">
            <div className="qty">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir quantidade">−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Aumentar quantidade">+</button>
            </div>
            <span className="price big">{money(p.price * qty)}</span>
            <button className="btn-primary" onClick={submit}>Adicionar ao pedido</button>
          </div>
          {err && <p className="error">{err}</p>}
        </div>
      </div>
    </div>
  )
}

function CartDrawer({ cart, total, onClose, onQty, onCheckout, custName, setCustName, delivery, setDelivery, obs, setObs }) {
  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Seu pedido">
        <div className="drawer-head">
          <h2>Seu pedido</h2>
          <button className="drawer-close" onClick={onClose} aria-label="Fechar carrinho">✕</button>
        </div>
        {cart.length === 0 ? (
          <p className="cart-empty">Seu carrinho está vazio.<br />Escolha uma peça no catálogo pra começar.</p>
        ) : (
          <>
            <ul className="cart-list">
              {cart.map((it) => {
                const p = prodById(it.pid)
                return (
                  <li key={it.key} className="cart-item">
                    <img src={p.img} alt={p.alt} />
                    <div className="cart-item-info">
                      <strong>{p.name}</strong>
                      <span>Cor: {it.color}</span>
                      {it.pers && <span>“{it.pers}”</span>}
                      <span className="cart-item-price">{money(p.price)} cada</span>
                    </div>
                    <div className="cart-item-right">
                      <div className="qty small">
                        <button type="button" onClick={() => onQty(it.key, it.qty - 1)} aria-label="Diminuir">−</button>
                        <span>{it.qty}</span>
                        <button type="button" onClick={() => onQty(it.key, it.qty + 1)} aria-label="Aumentar">+</button>
                      </div>
                      <strong>{money(p.price * it.qty)}</strong>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="field">
              <label>Seu nome</label>
              <input type="text" value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Como a gente te chama?" />
            </div>
            <div className="field">
              <label>Entrega</label>
              <select value={delivery} onChange={(e) => setDelivery(e.target.value)}>
                <option>Retirada (a combinar)</option>
                <option>Entrega (a combinar)</option>
              </select>
            </div>
            <div className="field">
              <label>Observações (opcional)</label>
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Algum detalhe do pedido?" />
            </div>
          </>
        )}
        <div className="drawer-foot">
          <div className="total-row">
            <span>Total estimado</span>
            <strong>{money(total)}</strong>
          </div>
          <button className="btn-primary block" onClick={onCheckout} disabled={!cart.length}>
            Enviar pedido no WhatsApp
          </button>
          <p className="hint center">Abre o WhatsApp com a mensagem do pedido já preenchida — é só enviar.</p>
        </div>
      </aside>
    </>
  )
}

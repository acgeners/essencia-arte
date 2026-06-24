# Essência & Arte — Diagnóstico & Plano de Ação

> Documento de acompanhamento. Última atualização: **2026-06-24**.
> Consolida a auditoria de consultoria (coerência, eficiência, UI, layout, navegação/renderização) **+** a decisão de **descartar a integração Asaas** e seguir **somente com PIX** (QR/copia-e-cola estático com valor e recebedor corretos).
>
> **Legenda de status:** ⬜ Pendente · 🟦 Em andamento · ✅ Feito · ➖ Removido do escopo
> **Legenda de severidade:** 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 1. Contexto / Onde paramos

O e-commerce está **funcional e bem arquitetado**:
wizard de 5 passos (Produto → Modelo → Personalização → Entrega → Resumo) → sacola (`cart-store`) → checkout dentro do `CartDrawer` → `createOrderAction` (recalcula preço **no servidor**, não confia no cliente) → RPC com baixa de estoque.

**Decisão (2026-06-24):** a integração de pagamento **Asaas foi descartada**. O pagamento será **somente PIX estático** (gerar QR Code / copia-e-cola já com o valor correto e a conta de destino). Confirmação de pagamento é **manual no admin** por enquanto.

**Pontos fortes (manter):**
- Preço centralizado numa única função pura `calculatePrice`.
- Separação correta dos clients Supabase (server / browser / service-role nunca vaza pro client).
- `next/image` bem usado com `sizes`/`fill`; `remotePatterns` do Supabase configurados.
- Copy de ajuda do wizard boa ("opcional", "+R$2,00", explicação dos 50%).
- **Gerador EMV-BR de PIX já pronto** em [pix.ts](src/lib/pix.ts) (`generatePixPayload`) — correto, porém ainda **não ligado** em lugar nenhum.

---

## 2. PIX — situação e o que falta

A parte difícil já existe. PIX estático é problema de **fiação**, não de implementação.

**Já temos:**
- [pix.ts](src/lib/pix.ts) → `generatePixPayload` (padrão BACEN, CRC16, valor embutido). **Zero call sites.**
- `react-qr-code` já nas dependências → renderiza o QR a partir do payload, **sem imagem base64, sem webhook, sem dependência externa**.
- Payload é **determinístico** (chave + recebedor + valor) → pode ser **regenerado em qualquer página** (acompanhar pedido, minha conta) a partir do total. **Não precisa persistir QR nem tabela `payments`.**

**Limitação conhecida (aceita por enquanto):**
- PIX estático por chave **não reconcilia automaticamente** (sem `txid` único por pedido). O lojista vê o PIX cair e **confirma o pedido na mão** no admin (combina com o fluxo de WhatsApp atual).
- Reconciliação automática por pedido exigiria QR **dinâmico** via PSP (cobrança `cob`) — fora de escopo agora, caminho fica aberto.
- Estoque é baixado **na criação** do pedido → PIX abandonado segura estoque. Ok para baixo volume, mas pede uma rotina de cancelar pedidos `awaiting_payment` antigos e devolver estoque (ver EF-5).

| ID | Sev | Tarefa | Onde | Status |
|---|---|---|---|---|
| PIX-1 | 🔴 | Configurar recebedor: `PIX_KEY` **obrigatória** (hoje `.optional()` → QR inválido silencioso) + `MERCHANT_NAME` + `MERCHANT_CITY` | [env.ts](src/lib/env.ts), `.env.example` | ✅ via env (`PIX_KEY`/`PIX_MERCHANT_NAME`/`PIX_MERCHANT_CITY`) — **falta preencher `.env.local`** |
| PIX-2 | 🔴 | Gerar payload no `createOrderAction` (server) com `generatePixPayload({ key, merchantName, merchantCity, amount: depositoTotal })` e retornar a string | [confirmacao/actions.ts](src/app/(public)/pedido/confirmacao/actions.ts), [pix.ts](src/lib/pix.ts) | ✅ `createPixPayload` (valor server-side) |
| PIX-3 | 🔴 | Renderizar com `<QRCode value={payload} />` (react-qr-code) + copia-e-cola = payload, no lugar do `<img src=data:base64>` do Asaas | [cart-drawer.tsx](src/components/public/cart-drawer.tsx) (`PaymentView`) | ✅ `react-qr-code` + copia-e-cola |
| PIX-4 | 🔴 | Arrancar Asaas do checkout: remover seleção PIX/boleto/cartão → **só PIX**; reverter bloco Asaas no action | [confirmacao/actions.ts](src/app/(public)/pedido/confirmacao/actions.ts), [cart-drawer.tsx](src/components/public/cart-drawer.tsx) | ✅ checkout único, só PIX |
| PIX-5 | 🟡 | Sacola multi-item gera **um QR para o total do sinal** (problema "mostra só o 1º QR" some naturalmente) | [cart-drawer.tsx](src/components/public/cart-drawer.tsx) (`handleSubmit`) | ✅ um QR pelo total do sinal |

---

## 3. Coerência interna

| ID | Sev | Problema | Onde | Status |
|---|---|---|---|---|
| COE-1 | 🔴 | **Status do pedido diverge em camadas.** RPC insere `pending_payment`, `ORDER_STATUS` define `awaiting_payment`, filtro do admin usa `confirmed`/`production`. Pedido nasce com status fora do enum; `ORDER_STATUS_TRANSITIONS` nunca valida. **Sem webhook, toda confirmação é manual no admin → este item fica ainda mais crítico.** | [constants.ts](src/lib/constants.ts), [order RPC](supabase/migrations/20260426214158_create_order_rpc.sql), [pedidos/page.tsx](src/app/(admin)/admin/pedidos/page.tsx) | ✅ código alinhado a `pending_payment` (sem migration) |
| COE-2 | 🔴 | **Dois checkouts paralelos e já divergentes** (`CartDrawer` é o vivo; `OrderConfirmation` em `/pedido/confirmacao/preview` duplica form/validação/pagamento). Ambos têm UI Asaas a remover. | [cart-drawer.tsx:466](src/components/public/cart-drawer.tsx#L466) vs ~~order-confirmation.tsx~~ (deletado) | ✅ checkout único no `CartDrawer` |
| COE-3 | 🔴 | **Passo de embalagem inalcançável, mas precificado e exibido.** Wizard tem 5 passos sem packaging, mas `calculatePrice` soma `packagingFee`, RPC grava `p_packaging_id` e Resumo/Confirmação mostram "Embalagem". | [wizard-shell.tsx:29](src/components/public/wizard/wizard-shell.tsx#L29), [step-review.tsx:55](src/components/public/wizard/step-review.tsx#L55) | ⬜ |
| COE-4 | 🟡 | **`domain.ts` é ficção** — tipos (`Product.slug/models`, `Order.orderNumber/depositPaidAt`, `Address` camelCase) não existem no schema real. | [domain.ts](src/types/domain.ts) | ✅ reduzido a `PriceCalculation`/`PriceBreakdown` |
| COE-5 | 🟡 | **Taxa de personalização `2.0` hardcoded em 3 lugares** (preço, resumo lateral, label). | [calculate.ts:27](src/lib/pricing/calculate.ts#L27), [order-summary-panel.tsx:89](src/components/public/wizard/order-summary-panel.tsx#L89), [step-customization.tsx:127](src/components/public/wizard/step-customization.tsx#L127) | ⬜ |
| COE-6 | 🟡 | **Categoria com duas fontes de verdade**: coluna `products.category_id` (usada) + tabela M2M `product_category_links` (semeada, morta). | [expand_relations.sql](supabase/migrations/20260427000003_expand_relations.sql) | ⬜ |

---

## 4. Eficiência

| ID | Sev | Problema | Onde | Status |
|---|---|---|---|---|
| EF-1 | 🔴 | **`force-dynamic` no storefront público inteiro** força render dinâmico de catálogo quase estático em toda request. | [(public)/layout.tsx:1](src/app/(public)/layout.tsx#L1) | ⬜ |
| EF-2 | 🟡 | **`listUsers()` para achar cliente por email** retorna só a 1ª página (~50) → cliente recorrente vira usuário duplicado. | [confirmacao/actions.ts:90](src/app/(public)/pedido/confirmacao/actions.ts#L90) | ⬜ |
| EF-3 | 🟡 | **Wizard recalcula preço/prazos em todo render** e assina o store inteiro; vários componentes usam `useWizardStore()`/`useCartStore()` **sem seletor**. | [wizard-shell.tsx:55](src/components/public/wizard/wizard-shell.tsx#L55) | ⬜ |
| EF-4 | 🟡 | **Totais da sacola são snapshots congelados** no add-time; se o catálogo mudar de preço, cliente vê um valor e é cobrado outro (server recalcula). | [cart-store.ts](src/stores/cart-store.ts), [cart-drawer.tsx:128](src/components/public/cart-drawer.tsx#L128) | ⬜ |
| EF-5 | 🟡 | **PIX abandonado segura estoque** (baixado na criação do pedido, sem liberação automática). Pede rotina de cancelar `awaiting_payment` antigos e devolver estoque. | [confirmacao/actions.ts](src/app/(public)/pedido/confirmacao/actions.ts) | ⬜ |
| EF-6 | 🟢 | `select('*')` + sem paginação no admin (orders/customers); `PAGE_SIZE` existe e nunca é usado. | [queries/orders.ts:24](src/server/queries/orders.ts#L24), [admin/customers.ts:7](src/server/queries/admin/customers.ts#L7) | ⬜ |

---

## 5. UI intuitiva / amigável

> Questão central: vários controles proeminentes são **fachadas que não fazem nada**, e o admin mostra **números falsos**.

| ID | Sev | Problema | Onde | Status |
|---|---|---|---|---|
| UI-1 | 🔴 | **Busca do header é decorativa** — input sem `value`/`onChange`/submit. | [header.tsx:132](src/components/public/header.tsx#L132) | ⬜ |
| UI-2 | 🔴 | **Acompanhamento de pedido é 100% mock** (`setTimeout` retornando dados fixos). | [order-tracking.tsx:32](src/components/public/order-tracking.tsx#L32) | ⬜ |
| UI-3 | 🔴 | **Admin nasce vazio + dados fabricados** (dashboard `defaultWidgets: []`, abre em modo customização; receita/relatórios/financeiro mock com selo "em tempo real"). | [admin-home.tsx:73](src/components/admin/admin-home.tsx#L73), [relatorios/page.tsx](src/app/(admin)/admin/relatorios/page.tsx), [financeiro/page.tsx](src/app/(admin)/admin/financeiro/page.tsx) | ⬜ |
| UI-4 | 🔴 | **Busca e filtro de status na lista de pedidos do admin são decorativos** (sem handler); opções de status incompletas. | [pedidos/page.tsx:32](src/app/(admin)/admin/pedidos/page.tsx#L32) | ⬜ |
| UI-5 | 🟡 | **Links de footer quebrados** (`/produtos`, `/contato` não existem; `/#como-funciona` sem âncora; redes sociais `href="#"`). | [footer.tsx:6](src/components/public/footer.tsx#L6) | ⬜ |
| UI-6 | 🟡 | **Nav "Mais Vendidos" rotula errado** — dropdown contém "Nossas Coleções"; "Outlet" leva a wizard sem outlet. | [header.tsx:232](src/components/public/header.tsx#L232) | ⬜ |
| UI-7 | 🟡 | **`Tooltip` existe e nunca é usado**; controles só-ícone dependem de `title=`. Botões "Mudar status" parecem estados, não ações; "Cancelar pedido" não confirma. | [tooltip.tsx](src/components/ui/tooltip.tsx), [status-actions.tsx:22](src/app/(admin)/admin/pedidos/[id]/status-actions.tsx#L22) | ⬜ |
| UI-8 | 🟡 | **Prova social fabricada como fato** ("+500 clientes", depoimentos 5★ "de clientes reais") — risco de credibilidade/legal. | [page.tsx:103](src/app/(public)/page.tsx#L103), [testimonials.tsx](src/components/public/testimonials.tsx) | ⬜ |
| UI-9 | 🟢 | Labels crípticos: "Cor P."/"Cor S.", enum cru `tassel_color`, "Quantidade Físico". | [pedidos/[id]/page.tsx:91](src/app/(admin)/admin/pedidos/[id]/page.tsx#L91) | ⬜ |

---

## 6. Layout / design

> Visual geral é moderno e amigável. Problemas pontuais:

| ID | Sev | Problema | Onde | Status |
|---|---|---|---|---|
| LAY-1 | 🟡 | **Pill de status truncada** no dashboard: `max-w-[112px] truncate` em `text-[10px]` corta "Pagamento confirmado". | [recent-orders-panel.tsx:74](src/components/admin/recent-orders-panel.tsx#L74) | ⬜ |
| LAY-2 | 🟡 | **Cores literais quebram tema/dark-mode** (`bg-green-100`, `text-red-500`) onde o resto usa tokens semânticos. | [options-list.tsx:101](src/app/(admin)/admin/opcoes/options-list.tsx#L101), [inventory-list.tsx:96](src/app/(admin)/admin/estoque/inventory-list.tsx#L96) | ⬜ |
| LAY-3 | 🟡 | **Botões mortos parecem clicáveis** (Configurações, Relatórios "Exportar", Integrações). | [configuracoes/page.tsx:25](src/app/(admin)/admin/configuracoes/page.tsx#L25) | ⬜ |
| LAY-4 | 🟢 | **`text-[10px]` uppercase por toda parte** — difícil de ler no mobile. | [page.tsx:51](src/app/(public)/page.tsx#L51) | ⬜ |
| LAY-5 | 🟢 | Shells de página inconsistentes (padding duplicado, headings divergentes). | [admin/layout.tsx:36](src/app/(admin)/admin/layout.tsx#L36) | ⬜ |
| LAY-6 | 🟢 | Campo de estado é texto livre (`maxLength={2}`, aceita "XX") em vez de select de UF. | [minha-conta-content.tsx:765](src/components/public/minha-conta-content.tsx#L765) | ⬜ |

---

## 7. Navegação / renderização

| ID | Sev | Problema | Onde | Status |
|---|---|---|---|---|
| NAV-1 | 🟡 | **`priority` na 1ª imagem de todo produto** — na home, todas as primeiras imagens pré-carregam como alta prioridade, anulando a priorização do LCP. | [product-image-carousel.tsx:67](src/components/public/product-image-carousel.tsx#L67) | ⬜ |
| NAV-2 | 🟢 | **Zero `loading.tsx`/`error.tsx`** em ~20 rotas; navegação bloqueia no round-trip do DB sem skeleton. | `src/app/**` | ⬜ |
| NAV-3 | 🟢 | Logo em `<img>` cru (poderia ser `next/image` com import estático). | [header.tsx:114](src/components/public/header.tsx#L114) | ⬜ |
| NAV-✅ | — | `next/image`, `Suspense` no wizard, `<img>` cru só em QR/preview blob — corretos, sem ação. | — | ✅ |

---

## 8. Higiene de repositório

| ID | Sev | Tarefa | Detalhe | Status |
|---|---|---|---|---|
| HIG-1 | 🔴 | **Deletar ~32 arquivos mortos** (`* 2.tsx`/`* 3.tsx` + 2 arquivos `page` **sem extensão** ao lado dos `page.tsx` reais em `pedidos/`). Confirmado por grep: **nenhum é importado.** | Risco de editar arquivo fantasma. | ✅ 34 arquivos + .DS_Store removidos |
| HIG-2 | 🔴 | **Deletar arquivos Asaas** (escopo abandonado): [asaas.ts](src/lib/asaas.ts), [webhooks/asaas/](src/app/api/webhooks/asaas/), migration `20260509000000_asaas_integration.sql`. **NÃO apagar [middleware.ts](src/middleware.ts)** — é o guard de auth do admin. | ✅ webhook + `asaas.ts` + `OrderConfirmation` removidos; tabela/colunas dormentes (drop futuro) |
| HIG-3 | 🟡 | **`.gitignore`**: adicionar `scratch/` (892K) e `public/backups/` (300K, servido publicamente). | ✅ `.gitignore` atualizado |

---

## 9. Plano de ação proposto (lista explicada, por fases)

Ordem recomendada: do menor risco / maior retorno para o mais elaborado. 29 ações em 4 fases. Cada item referencia os IDs das seções acima.

### Fase 0 — Limpeza & base coerente _(baixo risco, destrava o resto)_ — ✅ **CONCLUÍDA (2026-06-24)**
- [x] **1. Deletar ~32 arquivos mortos** (`* 2.tsx`, `* 3.tsx`, 2 `page` sem extensão) — `HIG-1` — ✅ 34 arquivos + `.DS_Store` removidos; nenhum era importado.
- [x] **2. Remover Asaas** — `HIG-2` — ✅ concluído junto da Fase 1: webhook, `asaas.ts` e `OrderConfirmation`/preview removidos; constants/types Asaas limpos; `middleware.ts` preservado. Tabela `payments` + colunas `asaas_*` ficam dormentes no banco (drop-migration futuro).
- [x] **3. `.gitignore` para `scratch/` e `public/backups/`** — `HIG-3` — ✅ entradas adicionadas.
- [x] **4. Unificar o enum de status do pedido** — `COE-1` — ✅ código alinhado ao que o banco grava: `awaiting_payment` → `pending_payment` em `constants.ts`, `status-actions.tsx`, `whatsapp.ts`; filtro do admin agora gera opções de `ORDER_STATUS`. **Sem migration; pedidos existentes seguem válidos.** Isso repara o admin, que antes não conseguia avançar nenhum pedido.
- [x] **5. Limpar `domain.ts`** — `COE-4` — ✅ reduzido aos únicos tipos usados (`PriceCalculation`/`PriceBreakdown`); removida a ficção que duplicava `database.ts`.

### Fase 1 — PIX no checkout único _(bloqueador para vender)_ — ✅ **CONCLUÍDA (2026-06-24)**
- [x] **6. Configurar o recebedor** — `PIX-1` — ✅ via `.env` (`PIX_KEY`, `PIX_MERCHANT_NAME`, `PIX_MERCHANT_CITY`) + `.env.example`. ⚠️ **Pendência operacional: preencher `PIX_KEY`/recebedor no `.env.local`/produção** — sem a chave, o checkout cai no fallback "combine via WhatsApp".
- [x] **7. Consolidar em um único checkout** — `PIX-4`/`COE-2` — ✅ `OrderConfirmation` + rota `/confirmacao/preview` deletados; seleção de boleto/cartão removida → só PIX no `CartDrawer`.
- [x] **8. Gerar o payload PIX no servidor** — `PIX-2` — ✅ action `createPixPayload(amount)` reusa `generatePixPayload`; valor = soma dos sinais calculados no servidor.
- [x] **9. Renderizar QR + copia-e-cola** — `PIX-3` — ✅ `react-qr-code` (`<QRCode value={payload} />`) + botão copiar.
- [x] **10. Um único QR para o total do sinal** — `PIX-5` — ✅ `handleSubmit` soma os sinais e gera um QR só.
- [x] **11. Pedido nasce `pending_payment`, admin confirma na mão** — ✅ (RPC + COE-1); confirmação manual no admin, sem reconciliação automática.

> **Nota de arquitetura:** mantém-se 1 pedido por item da sacola (o RPC cria um pedido por produto), porém com **um único QR PIX** para o total. Migrar para "1 pedido com N itens" continua como melhoria futura (não-bloqueante). O `payments`/colunas `asaas_*` no banco ficaram dormentes (PIX estático não persiste cobrança — o payload é regenerável). Drop-migration opcional no futuro.

### Fase 2 — Coerência de fluxo
- [ ] **12. Resolver a embalagem** (reinserir o passo **ou** remover de preço/RPC/resumo) — `COE-3` — hoje é cobrada e exibida, mas o cliente nunca escolhe.
- [ ] **13. Centralizar a taxa de personalização** (`PERSONALIZATION_FEE` único) — `COE-5` — hoje o `2.0` está hardcoded em 3 lugares.
- [ ] **14. Recalcular o preço da sacola no checkout** antes de gerar o PIX — `EF-4` — os totais são snapshots antigos; cliente pode ver um valor e ser cobrado outro.
- [ ] **15. Buscar cliente por email diretamente** (não `listUsers()`) — `EF-2` — hoje só varre a 1ª página (~50) e cria usuário duplicado depois.
- [ ] **16. Rotina de cancelar `awaiting_payment` antigos + devolver estoque** — `EF-5` — estoque baixa na criação; PIX abandonado segura produto.
- [ ] **17. Decidir o modelo de categoria** (dropar M2M morta se não usar) — `COE-6` — evita duas fontes de verdade.

### Fase 3 — Confiança da loja _(ligar ou esconder fachadas)_
- [ ] **18. Admin com dados reais** (ou rotular "Dados de exemplo"); dashboard com KPIs/pedidos visíveis — `UI-3` — hoje mostra números inventados e abre vazio.
- [ ] **19. Ligar busca e filtro de pedidos no admin** — `UI-4` — são a ferramenta principal da tela e hoje não fazem nada.
- [ ] **20. Acompanhamento de pedido: query real ou "em breve"** — `UI-2` — hoje é 100% mock.
- [ ] **21. Busca do header: ligar ou remover** — `UI-1` — caixa grande e morta passa desconfiança.
- [ ] **22. Corrigir footer e navegação** (links quebrados; "Mais Vendidos" → "Coleções"; Outlet) — `UI-5`/`UI-6`.
- [ ] **23. Prova social: dados reais ou suavizar a copy** — `UI-8` — "+500 clientes", depoimentos "reais".
- [ ] **24. Botões mortos: linkar ou `disabled` + "Em breve"** — `LAY-3` — Configurações/Relatórios/Integrações.

### Fase 4 — Performance & polimento
- [ ] **25. Remover `force-dynamic` e usar ISR** (`revalidate`) em home/produto — `EF-1` — catálogo é quase estático e hoje renderiza a cada request.
- [ ] **26. `priority` só nas imagens above-the-fold** — `NAV-1` — hoje toda 1ª imagem de produto pré-carrega, atrapalhando o LCP.
- [ ] **27. Seletores no Zustand + `useMemo` no wizard** — `EF-3` — evita re-render total e recálculo de preço a cada tecla.
- [ ] **28. Adicionar `loading.tsx`/`error.tsx`** — `NAV-2` — navegação trava no banco sem skeleton e sem recuperação de erro.
- [ ] **29. Polimentos de UI** — `LAY-1`/`LAY-2`/`LAY-4`/`UI-7`/`UI-9`/`LAY-5`/`LAY-6`/`NAV-3`/`EF-6` — pill truncada, tokens de cor, `text-xs`, tooltips, labels, shells, select de UF, logo, paginação.

---

## 10. Log de progresso

| Data | Mudança |
|---|---|
| 2026-06-24 | Documento criado. Diagnóstico inicial + decisão de descartar Asaas e seguir só com PIX estático. |
| 2026-06-24 | **Fase 0 concluída** no branch `fase-0-limpeza`: limpeza de 34 arquivos mortos + `.DS_Store` + webhook Asaas; `.gitignore`; enum de status unificado (`pending_payment`); `domain.ts` enxugado. Typecheck sem novos erros. |
| 2026-06-24 | **Fase 1 (PIX) concluída** + **Asaas removido por completo**: deletados `asaas.ts`, `OrderConfirmation`/preview; checkout único só-PIX no `CartDrawer` com QR (`react-qr-code`) + copia-e-cola gerados via `createPixPayload`/`generatePixPayload`; recebedor configurável por `.env`; `scratch/` excluído do tsconfig. `tsc` + `eslint` limpos. Tabela `payments`/colunas `asaas_*` dormentes no banco. |
| 2026-06-24 | **Fix de build (Vercel)**: o 1º commit incluiu por engano `src/middleware.ts` (convenção antiga), conflitando com `src/proxy.ts` — Next 16 exige só `proxy.ts`. Removido `middleware.ts`; a auth de admin permanece no `proxy.ts`. `next build` local concluído com sucesso (18 rotas). |

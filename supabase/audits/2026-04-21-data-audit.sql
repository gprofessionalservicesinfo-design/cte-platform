-- ============================================================
-- CTE PLATFORM — DATA AUDIT
-- Fecha: 2026-04-21
-- Propósito: auditoría de estado de datos en producción
-- SOLO LECTURA — ninguna query modifica datos
-- Ejecutar query por query en Supabase SQL Editor
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- QUERY 1: Clients con email de prueba (test / example)
-- Objetivo: identificar registros basura o cuentas de demo
-- ──────────────────────────────────────────────────────────────

SELECT
  u.id          AS user_id,
  u.email,
  u.full_name,
  u.role,
  u.created_at  AS user_created_at,
  c.id          AS client_id,
  c.country,
  c.phone,
  c.referral_source
FROM users u
LEFT JOIN clients c ON c.user_id = u.id
WHERE
  u.email ILIKE '%test%'
  OR u.email ILIKE '%example%'
  OR u.email ILIKE '%demo%'
  OR u.email ILIKE '%fake%'
  OR u.email ILIKE '%prueba%'
ORDER BY u.created_at DESC;


-- ──────────────────────────────────────────────────────────────
-- QUERY 2: Totales — clients con y sin empresa/order asociada
-- Objetivo: detectar clients huérfanos (registrados pero sin caso)
-- ──────────────────────────────────────────────────────────────

SELECT
  COUNT(DISTINCT c.id)                                        AS total_clients,
  COUNT(DISTINCT co.id)                                       AS total_companies,
  COUNT(DISTINCT c.id) FILTER (WHERE co.id IS NOT NULL)      AS clients_con_empresa,
  COUNT(DISTINCT c.id) FILTER (WHERE co.id IS NULL)          AS clients_sin_empresa,
  COUNT(DISTINCT u.id) FILTER (WHERE c.id IS NULL)           AS users_sin_client_row
FROM users u
LEFT JOIN clients  c  ON c.user_id    = u.id
LEFT JOIN companies co ON co.client_id = c.id
WHERE u.role = 'client'  -- excluir admins del conteo
   OR u.role IS NULL;


-- ──────────────────────────────────────────────────────────────
-- QUERY 3: Últimas 20 órdenes / empresas con info de pago
-- Objetivo: revisar montos, estados y coherencia de datos
-- Nota: en este sistema "order" = registro en companies
-- ──────────────────────────────────────────────────────────────

SELECT
  co.id                                         AS company_id,
  co.order_reference,
  co.company_name,
  co.package,
  co.total_paid,
  co.status,
  co.stripe_customer_id,
  co.stripe_session_id,
  co.state,
  co.created_at,
  u.email                                       AS client_email,
  u.full_name                                   AS client_name,
  -- payments asociados (si existe tabla payments)
  (
    SELECT COUNT(*) FROM payments p
    WHERE p.company_id = co.id
  )                                             AS payment_count,
  (
    SELECT SUM(p.amount) FROM payments p
    WHERE p.company_id = co.id
  )                                             AS payments_sum
FROM companies co
LEFT JOIN clients  c ON c.id       = co.client_id
LEFT JOIN users    u ON u.id       = c.user_id
ORDER BY co.created_at DESC
LIMIT 20;


-- ──────────────────────────────────────────────────────────────
-- QUERY 4: Casos por status con conteo y % del total
-- Objetivo: snapshot del pipeline completo
-- ──────────────────────────────────────────────────────────────

SELECT
  COALESCE(status, 'NULL / sin status')         AS status,
  COUNT(*)                                      AS total,
  ROUND(
    COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0),
    1
  )                                             AS porcentaje,
  MIN(created_at)                               AS caso_mas_antiguo,
  MAX(created_at)                               AS caso_mas_reciente
FROM companies
GROUP BY status
ORDER BY total DESC;


-- ──────────────────────────────────────────────────────────────
-- QUERY 5: Casos "atascados" — En revisión / in_progress
--          con más de 7 días sin actualización
-- Objetivo: detectar casos que necesitan seguimiento urgente
-- ──────────────────────────────────────────────────────────────

SELECT
  co.id,
  co.company_name,
  co.status,
  co.package,
  co.state,
  co.created_at,
  co.updated_at,
  NOW() - co.updated_at                         AS tiempo_sin_update,
  EXTRACT(DAY FROM NOW() - co.updated_at)::int  AS dias_sin_update,
  u.email                                       AS client_email,
  u.full_name                                   AS client_name,
  c.phone                                       AS client_phone,
  -- último status_history registrado
  (
    SELECT sh.new_status
    FROM status_history sh
    WHERE sh.company_id = co.id
    ORDER BY sh.created_at DESC
    LIMIT 1
  )                                             AS ultimo_status_registrado,
  (
    SELECT sh.created_at
    FROM status_history sh
    WHERE sh.company_id = co.id
    ORDER BY sh.created_at DESC
    LIMIT 1
  )                                             AS ultimo_cambio_status,
  -- onboarding completado?
  co.onboarding_completed,
  -- whatsapp
  co.whatsapp_status
FROM companies co
LEFT JOIN clients  c ON c.id  = co.client_id
LEFT JOIN users    u ON u.id  = c.user_id
WHERE
  co.status IN (
    'under_review',
    'name_check',
    'in_progress',
    'articles_filed',
    'ein_processing',
    'pending',
    'on_hold'
  )
  AND (
    co.updated_at IS NULL
    OR co.updated_at < NOW() - INTERVAL '7 days'
  )
ORDER BY dias_sin_update DESC NULLS FIRST;

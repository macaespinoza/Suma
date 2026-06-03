-- =============================================================================
-- SUMA - Plataforma PropTech y de Cohesión Comunitaria
-- Script de Migración: 003_responsable_pago.sql
-- Descripción: Agrega la columna responsable_pago a Unidades_Vecinales
-- y permite designar a propietario, arrendatario o tercero como responsable del pago.
-- =============================================================================

-- 1. Añadimos el valor 'tercero' al enum tipo_titular_unidad
-- ALTER TYPE ... ADD VALUE no puede ejecutarse dentro de transacciones en PostgreSQL.
-- Usamos IF NOT EXISTS o capturamos excepción para mayor robustez en repeticiones.
ALTER TYPE tipo_titular_unidad ADD VALUE IF NOT EXISTS 'tercero';

-- 2. Añadimos la columna responsable_pago a Unidades_Vecinales
ALTER TABLE Unidades_Vecinales 
  ADD COLUMN IF NOT EXISTS responsable_pago VARCHAR(50) NOT NULL DEFAULT 'propietario' 
  CONSTRAINT chk_responsable_pago CHECK (responsable_pago IN ('propietario', 'arrendatario', 'tercero'));

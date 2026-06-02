-- =============================================================================
-- SUMA - Plataforma PropTech y de Cohesión Comunitaria
-- Script de Migración: 002_metros_cuadrados.sql
-- Descripción: Agrega la columna metros_cuadrados a Unidades_Vecinales
-- para habilitar el cálculo automático de alícuotas según la Ley 21.442.
-- =============================================================================

ALTER TABLE Unidades_Vecinales 
  ADD COLUMN IF NOT EXISTS metros_cuadrados DECIMAL(8, 2) DEFAULT NULL;

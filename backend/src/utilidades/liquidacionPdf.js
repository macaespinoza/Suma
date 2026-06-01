// =============================================================================
// SUMA — Utilidad de Generación de Liquidación de Gasto Común (PDF)
// Genera un documento simple en formato PDF con el desglose de egresos.
// Diseñado para que el administrador pueda enviarlo a los residentes.
// =============================================================================

import PDFDocument from 'pdfkit';

const formatoMonedaCLP = (valor) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
};

const formatearFecha = (fecha) => {
  if (!fecha) return '—';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatearMesAno = (fecha) => {
  if (!fecha) return '—';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
  });
};

const AGRUPACIONES = {
  'Agua': 'Servicios Básicos',
  'Electricidad': 'Servicios Básicos',
  'Gas': 'Servicios Básicos',
  'Portería': 'Personal',
  'Seguridad': 'Personal',
  'Administración': 'Personal',
  'Mantención': 'Operación',
  'Aseo': 'Operación',
  'Seguros': 'Administración',
  'Otro': 'Varios',
};

const ICONOS_CATEGORIA = {
  'Agua': '💧',
  'Electricidad': '⚡',
  'Gas': '🔥',
  'Portería': '🛡️',
  'Seguridad': '🔒',
  'Administración': '📋',
  'Mantención': '🔧',
  'Aseo': '🧹',
  'Seguros': '🛡️',
  'Otro': '📦',
};

export const generarLiquidacionPDF = async (datos) => {
  const {
    condominio,
    gasto,
    egresos,
    cobrosResumen,
  } = datos;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 50, right: 50 },
        info: {
          Title: `Liquidación Gasto Común - ${formatearMesAno(gasto.mes_anio)}`,
          Author: 'SUMA - Plataforma PropTech',
        },
      });

      const fragmentos = [];

      doc.on('data', (fragmento) => fragmentos.push(fragmento));
      doc.on('end', () => resolve(Buffer.concat(fragmentos)));
      doc.on('error', reject);

      const ANCHO = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      const colorPrimario = '#f9951a';
      const colorSecundario = '#5122a7';
      const colorTexto = '#2C2C2C';
      const colorTextoSecundario = '#6B6B6B';
      const colorLinea = '#E0E0E0';

      doc
        .fillColor(colorPrimario)
        .fontSize(8)
        .text('COMUNIDAPP', doc.page.margins.left, 30, { continued: true })
        .fillColor(colorTextoSecundario)
        .text('  |  Plataforma de Gestión Comunitaria', { align: 'left' });

      doc.moveDown(1.5);

      doc
        .fillColor(colorTexto)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('LIQUIDACIÓN DE GASTO COMÚN', { align: 'center' });

      doc.moveDown(0.3);

      doc
        .fillColor(colorPrimario)
        .fontSize(14)
        .font('Helvetica')
        .text(condominio.nombre.toUpperCase(), { align: 'center' });

      doc.moveDown(0.2);

      doc
        .fillColor(colorTextoSecundario)
        .fontSize(11)
        .text(condominio.direccion, { align: 'center' });

      doc.moveDown(1);

      doc
        .fillColor(colorSecundario)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`Período: ${formatearMesAno(gasto.mes_anio).toUpperCase()}`, { align: 'center' });

      doc.moveDown(1);

      const estadoBadge = gasto.estado === 'publicado' ? '✓ PUBLICADO' : '⏳ BORRADOR';
      const estadoColor = gasto.estado === 'publicado' ? '#2D8659' : '#f9951a';

      doc
        .fillColor(estadoColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Estado: ${estadoBadge}`, doc.page.margins.left, doc.y, { align: 'right' });

      doc.moveDown(1);

      doc
        .fillColor(colorTexto)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('RESUMEN GENERAL', doc.page.margins.left)
        .moveTo(doc.page.margins.left, doc.y + 5)
        .lineTo(doc.page.margins.left + ANCHO, doc.y + 5)
        .stroke(colorLinea);

      doc.moveDown(0.8);

      const resumenFilaY = doc.y;
      const colAncho = ANCHO / 2;

      doc
        .fillColor(colorTextoSecundario)
        .fontSize(9)
        .font('Helvetica');

      doc.text('Total Egresos del Mes', doc.page.margins.left, resumenFilaY);
      doc
        .fillColor(colorTexto)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(formatoMonedaCLP(gasto.total_gastos), doc.page.margins.left + colAncho, resumenFilaY, { align: 'right' });

      doc.moveDown(0.6);
      doc
        .fillColor(colorTextoSecundario)
        .fontSize(9)
        .font('Helvetica');

      doc.text('Total Cobrado a Residentes', doc.page.margins.left, doc.y);
      doc
        .fillColor(colorTexto)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(formatoMonedaCLP(cobrosResumen?.total_cobrado || 0), doc.page.margins.left + colAncho, doc.y, { align: 'right' });

      doc.moveDown(0.6);
      doc
        .fillColor(colorTextoSecundario)
        .fontSize(9)
        .font('Helvetica');

      doc.text('Total Recaudado', doc.page.margins.left, doc.y);
      doc
        .fillColor('#2D8659')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(formatoMonedaCLP(cobrosResumen?.total_pagado || 0), doc.page.margins.left + colAncho, doc.y, { align: 'right' });

      doc.moveDown(0.6);
      doc
        .fillColor(colorTextoSecundario)
        .fontSize(9)
        .font('Helvetica');

      doc.text('Total Pendiente de Cobro', doc.page.margins.left, doc.y);
      doc
        .fillColor('#f9951a')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(formatoMonedaCLP(cobrosResumen?.total_pendiente || 0), doc.page.margins.left + colAncho, doc.y, { align: 'right' });

      doc.moveDown(1.5);

      doc
        .fillColor(colorTexto)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('DETALLE DE EGRESOS POR CATEGORÍA', doc.page.margins.left)
        .moveTo(doc.page.margins.left, doc.y + 5)
        .lineTo(doc.page.margins.left + ANCHO, doc.y + 5)
        .stroke(colorLinea);

      doc.moveDown(1);

      if (egresos && egresos.length > 0) {
        const agrupados = {};
        egresos.forEach((e) => {
          const grupo = AGRUPACIONES[e.categoria] || 'Varios';
          if (!agrupados[grupo]) agrupados[grupo] = { total: 0, items: [] };
          agrupados[grupo].total += parseFloat(e.monto);
          agrupados[grupo].items.push(e);
        });

        Object.entries(agrupados).forEach(([grupo, data]) => {
          if (doc.y > doc.page.height - 120) {
            doc.addPage();
          }

          doc
            .fillColor(colorSecundario)
            .fontSize(9)
            .font('Helvetica-Bold')
            .text(grupo.toUpperCase(), doc.page.margins.left);

          doc.moveDown(0.4);

          data.items.forEach((egreso) => {
            doc
              .fillColor(colorTexto)
              .fontSize(9)
              .font('Helvetica')
              .text(`${ICONOS_CATEGORIA[egreso.categoria] || '📦'}  ${egreso.categoria}`, doc.page.margins.left + 10, doc.y);

            if (egreso.descripcion) {
              doc
                .fillColor(colorTextoSecundario)
                .fontSize(8)
                .text(egreso.descripcion, doc.page.margins.left + 70, doc.y);
            }

            doc
              .fillColor(colorTexto)
              .fontSize(9)
              .font('Helvetica-Bold')
              .text(formatoMonedaCLP(parseFloat(egreso.monto)), doc.page.margins.left + ANCHO - 80, doc.y, { width: 80, align: 'right' });

            doc.moveDown(0.5);
          });

          doc
            .fillColor(colorTextoSecundario)
            .fontSize(8)
            .font('Helvetica')
            .text(`Subtotal ${grupo}:`, doc.page.margins.left + 10, doc.y);

          doc
            .fillColor(colorPrimario)
            .fontSize(9)
            .font('Helvetica-Bold')
            .text(formatoMonedaCLP(data.total), doc.page.margins.left + ANCHO - 80, doc.y, { width: 80, align: 'right' });

          doc.moveDown(0.8);
        });

        doc
          .moveTo(doc.page.margins.left, doc.y)
          .lineTo(doc.page.margins.left + ANCHO, doc.y)
          .stroke(colorLinea);

        doc.moveDown(0.5);

        doc
          .fillColor(colorTexto)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('TOTAL EGRESOS:', doc.page.margins.left, doc.y);

        doc
          .fillColor(colorPrimario)
          .fontSize(13)
          .text(formatoMonedaCLP(gasto.total_gastos), doc.page.margins.left + ANCHO - 100, doc.y - 2, { width: 100, align: 'right' });

      } else {
        doc
          .fillColor(colorTextoSecundario)
          .fontSize(10)
          .font('Helvetica')
          .text('No hay egresos registrados para este período.', doc.page.margins.left, doc.y, { align: 'center' });
      }

      doc.moveDown(2);

      if (doc.y > doc.page.height - 100) {
        doc.addPage();
      }

      doc
        .fillColor(colorTexto)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('INFORMACIÓN DE LA COMUNIDAD', doc.page.margins.left)
        .moveTo(doc.page.margins.left, doc.y + 5)
        .lineTo(doc.page.margins.left + ANCHO, doc.y + 5)
        .stroke(colorLinea);

      doc.moveDown(0.8);

      doc
        .fillColor(colorTextoSecundario)
        .fontSize(9)
        .font('Helvetica')
        .text(`RUT Comunidad: ${condominio.rut_comunidad}`, doc.page.margins.left);

      doc.moveDown(0.4);

      doc
        .fillColor(colorTextoSecundario)
        .fontSize(9)
        .font('Helvetica')
        .text(`Unidades Activas: ${cobrosResumen?.unidades_activas || 0}`, doc.page.margins.left);

      doc.moveDown(0.4);

      doc
        .fillColor(colorTextoSecundario)
        .fontSize(9)
        .font('Helvetica')
        .text(`Fecha de Emisión: ${formatearFecha(new Date())}`, doc.page.margins.left);

      doc.moveDown(2);

      doc
        .fillColor(colorTextoSecundario)
        .fontSize(8)
        .font('Helvetica')
        .text('Este documento es un comprobante informal de gastos comunes. Para pagos oficiales, conserve sus comprobantes de transferencia o boleta de pago.', doc.page.margins.left, doc.y, { align: 'center', width: ANCHO });

      doc.moveDown(1);

      doc
        .fillColor(colorPrimario)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('Generado por SUMA - Plataforma PropTech de Gestión Comunitaria', doc.page.margins.left, doc.page.height - 30, { align: 'center', width: ANCHO });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default generarLiquidacionPDF;
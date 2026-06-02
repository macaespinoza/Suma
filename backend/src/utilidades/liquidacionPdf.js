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

const formatearMesAno = (fecha) => {
  if (!fecha) return '—';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
  });
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
        margins: { top: 50, bottom: 50, left: 60, right: 60 },
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

      const colorTitulos = '#1a56db'; // Azul tipo el documento de ejemplo
      const colorTexto = '#000000';
      const colorBorde = '#000000';
      const colorAlerta = '#e02424'; // Rojo para total a pagar

      // HEADER
      doc
        .fillColor(colorTitulos)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`COMUNIDAD ${condominio.nombre.toUpperCase()}`, { align: 'center' });
      doc.moveDown(2);

      // SECTION 1: DETALLE GASTOS COMUNES
      doc
        .fillColor(colorTexto)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`1. DETALLE GASTOS COMUNES (${formatearMesAno(gasto.mes_anio).toUpperCase()})`, doc.page.margins.left);
      
      doc.moveDown(1);

      // DRAW TABLE 1
      const tableTop = doc.y;
      const col1X = doc.page.margins.left + 20;
      const col2X = doc.page.margins.left + ANCHO - 120;
      
      // Función helper para dibujar filas de tabla
      let currentY = tableTop;
      const drawRow = (concepto, valor, isBold = false, isRed = false, drawTopLine = false, drawBottomLine = false) => {
        if (drawTopLine) {
          doc.moveTo(col1X, currentY).lineTo(col1X + ANCHO - 40, currentY).stroke(colorBorde);
          currentY += 5;
        }

        doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
           .fillColor(isRed ? colorAlerta : colorTexto)
           .fontSize(10);
        
        doc.text(concepto, col1X + 5, currentY + 2);
        
        // Simular "$    15.000" alineado
        doc.text(valor, col2X, currentY + 2, { width: 90, align: 'right' });
        
        currentY += 15;

        if (drawBottomLine) {
          currentY += 5;
          doc.moveTo(col1X, currentY).lineTo(col1X + ANCHO - 40, currentY).stroke(colorBorde);
        }
      };

      // Header Tabla 1
      drawRow('CONCEPTO', 'VALOR', true, false, true, true);

      // Egresos (Lista plana)
      if (egresos && egresos.length > 0) {
        egresos.forEach(e => {
          drawRow(e.categoria.toUpperCase() + (e.descripcion ? ` - ${e.descripcion}` : ''), formatoMonedaCLP(e.monto));
        });
      } else {
        drawRow('SIN EGRESOS REGISTRADOS', formatoMonedaCLP(0));
      }

      currentY += 5;
      // Total Gastos Comunidad
      drawRow('TOTAL GASTOS COMUNIDAD', formatoMonedaCLP(gasto.total_gastos), true, false, true, true);

      // Cálculos Promedio por Unidad
      const unidadesActivas = cobrosResumen?.unidades_activas > 0 ? cobrosResumen.unidades_activas : 1;
      const subTotalUnidad = Math.round(gasto.total_gastos / unidadesActivas);
      const fondoReservaUnidad = Math.round((gasto.monto_fondo_reserva || 0) / unidadesActivas);
      const totalAPagarPromedio = subTotalUnidad + fondoReservaUnidad;

      currentY += 5;
      drawRow(`SUB TOTAL (Promedio 1/${unidadesActivas} unidades)`, formatoMonedaCLP(subTotalUnidad));
      drawRow('FONDO DE RESERVA', formatoMonedaCLP(fondoReservaUnidad));

      currentY += 5;
      drawRow('TOTAL A PAGAR (Promedio por unidad)', formatoMonedaCLP(totalAPagarPromedio), true, true, true, true);

      // Cuadro principal contenedor
      doc.rect(doc.page.margins.left, tableTop - 30, ANCHO, currentY - tableTop + 40).stroke(colorBorde);

      doc.y = currentY + 20;

      // Nota al pie tabla 1
      doc.font('Helvetica-Oblique').fontSize(9).fillColor(colorTexto);
      doc.text('(*) El valor real a pagar por su unidad puede variar ligeramente según su porcentaje de alícuota legal estipulado en el reglamento de copropiedad.', doc.page.margins.left + 20);

      doc.moveDown(3);

      // SECTION 2: FONDO DE RESERVA
      doc
        .fillColor(colorTexto)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`2. FONDO DE RESERVA DE LA COMUNIDAD (${formatearMesAno(gasto.mes_anio).toUpperCase()})`, doc.page.margins.left);
      
      doc.moveDown(1);

      const table2Top = doc.y;
      currentY = table2Top;

      // Header Tabla 2
      drawRow('CONCEPTO', 'VALOR', true, false, true, true);
      
      drawRow('AHORRO ESTE MES', formatoMonedaCLP(gasto.monto_fondo_reserva || 0));
      currentY += 5;

      const saldoHistorico = parseFloat(condominio.saldo_fondo_reserva || 0);
      drawRow('TOTAL FONDO RESERVA*', formatoMonedaCLP(saldoHistorico), true, true, true, true);

      // Cuadro contenedor tabla 2
      doc.rect(col1X - 5, table2Top - 5, ANCHO - 30, currentY - table2Top + 10).stroke(colorBorde);

      doc.y = currentY + 10;
      doc.font('Helvetica').fontSize(9).fillColor(colorTexto);
      doc.text('* El Total Fondo Reserva incluye todos los aportes cobrados y recaudados históricamente hasta la fecha de emisión de este documento.', doc.page.margins.left + 20, doc.y, { width: ANCHO - 40 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default generarLiquidacionPDF;
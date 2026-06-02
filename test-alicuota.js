import { consultar } from './backend/src/config/database.js';

async function test() {
  const { rows } = await consultar(`
    SELECT g.mes_anio, g.total_gastos, cu.monto_cobrado, cu.saldo_anterior, cu.total_a_pagar
    FROM Cobros_Unidad cu
    JOIN Gastos_Comunes_Mes g ON cu.gasto_comun_mes_id = g.id
    ORDER BY cu.created_at DESC
    LIMIT 20
  `);
  console.log("Últimos cobros generados:", rows);
  
  process.exit(0);
}
test();
test();

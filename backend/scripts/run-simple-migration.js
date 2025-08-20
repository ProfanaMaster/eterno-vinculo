import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('📋 Migración de restricciones de memoriales')
console.log('==========================================')
console.log('')
console.log('Para aplicar la migración:')
console.log('1. Ve a https://supabase.com/dashboard/project/bhbnmuernqfbahkazbyg/sql')
console.log('2. Copia y pega el siguiente SQL:')
console.log('')

const sqlPath = path.join(__dirname, 'memorial-restrictions-simple.sql')
const sql = fs.readFileSync(sqlPath, 'utf8')

console.log('--- INICIO DEL SQL ---')
console.log(sql)
console.log('--- FIN DEL SQL ---')
console.log('')
console.log('3. Haz clic en "Run" para ejecutar la migración')
console.log('✅ Una vez ejecutado, la lógica de restricciones estará activa')
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 Corrección de estado de publicación')
console.log('====================================')
console.log('')
console.log('Ejecuta este SQL en Supabase:')
console.log('https://supabase.com/dashboard/project/bhbnmuernqfbahkazbyg/sql')
console.log('')

const sqlPath = path.join(__dirname, 'fix-published-status.sql')
const sql = fs.readFileSync(sqlPath, 'utf8')

console.log('--- SQL ---')
console.log(sql)
console.log('--- FIN ---')
console.log('')
console.log('✅ Esto actualizará todos los memoriales a publicado y cambiará el valor por defecto')
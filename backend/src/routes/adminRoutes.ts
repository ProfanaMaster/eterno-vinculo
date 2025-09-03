import { Router } from 'express'
import { 
  getDashboardStats, 
  getOrders, 
  updateOrderStatus, 
  getQROrders, 
  updateQROrderStatus,
  getSettings,
  updateSetting 
} from '../controllers/adminController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Todas las rutas de admin requieren autenticación
router.use(requireAuth)

router.get('/dashboard', getDashboardStats)
router.get('/orders', getOrders)
router.patch('/orders/:id', updateOrderStatus)
router.get('/qr-orders', getQROrders)
router.patch('/qr-orders/:id', updateQROrderStatus)

// Configuraciones completas (solo para admin)
router.get('/settings', getSettings)
router.patch('/settings/:key', updateSetting)

export default router
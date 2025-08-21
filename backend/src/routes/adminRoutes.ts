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

const router = Router()

router.get('/stats', getDashboardStats)
router.get('/orders', getOrders)
router.patch('/orders/:id', updateOrderStatus)
router.get('/qr-orders', getQROrders)
router.put('/qr-orders/:id', updateQROrderStatus)
router.get('/settings', getSettings)
router.put('/settings/:key', updateSetting)

export default router
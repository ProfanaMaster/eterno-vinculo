import { Router } from 'express'
import authRoutes from './authRoutes.js'
import profileRoutes from './profileRoutes.js'
import adminRoutes from './adminRoutes.js'
import uploadRoutes from './uploadRoutes.js'
import ordersRoutes from './orders.js'

import { requireAuth } from '../middleware/auth.js'
import { getSettings } from '../controllers/adminController.js'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

router.get('/settings', getSettings)

router.use('/auth', authRoutes)
router.use('/orders', requireAuth, ordersRoutes)
router.use('/profiles', requireAuth, profileRoutes)
router.use('/admin', requireAuth, adminRoutes)
router.use('/upload', requireAuth, uploadRoutes)


export default router
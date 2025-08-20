import { Router } from 'express'
import { 
  createProfile, 
  updateProfile, 
  publishProfile, 
  getPublicProfile,
  getUserProfiles,
  getTemplates,
  deleteProfile,
  canCreateMemorial 
} from '../controllers/profileController.js'

const router = Router()

router.get('/can-create', canCreateMemorial)
router.post('/', createProfile)
router.get('/my-profiles', getUserProfiles)
router.put('/:id', updateProfile)
router.delete('/:id', deleteProfile)
router.post('/:id/publish', publishProfile)
router.get('/public/:slug', getPublicProfile)
router.get('/templates', getTemplates)

export default router
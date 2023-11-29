import express from 'express';
import {
	createCareer,
	deleteCareer,
	getAllCareers,
	getCareerById,
	updateCareer,
} from '../controllers/careerController';
import {
	createCertification,
	deleteCertification,
	getAllCertifications,
	getCertificationById,
	updateCertification,
} from '../controllers/certificationController';
import {
	createSkill,
	deleteSkill,
	getAllSkills,
	getSkillById,
	updateSkill,
} from '../controllers/skillController';

const router = express.Router();

router.get('/certifications', getAllCertifications);
router.get('/certifications/:id', getCertificationById);
router.post('/certifications', createCertification);
router.put('/cerfications/:id', updateCertification);
router.delete('/cerfications/:id', deleteCertification);

router.get('/skills', getAllSkills);
router.get('/skills/:id', getSkillById);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);

router.get('/careers', getAllCareers);
router.get('/careers/:id', getCareerById);
router.post('/careers', createCareer);
router.put('/careers/:id', updateCareer);
router.delete('/careers/:id', deleteCareer);

export default router;

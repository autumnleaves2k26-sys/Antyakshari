import { Router, type IRouter } from "express";
import healthRouter from "./health";
import registrationsRouter from "./registrations";
import adminRouter from "./admin";
import passesRouter from "./passes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(registrationsRouter);
router.use(adminRouter);
router.use(passesRouter);

export default router;

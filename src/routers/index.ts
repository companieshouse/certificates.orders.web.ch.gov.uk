import {Router} from "express";
import {homeHandler} from "../handlers";

// a router is a collection of routes that can have their own middleware chain. It is helpful to create routers for
// a collection of related routes for better organisation and specific logic.
const router = Router();
router.get("/", homeHandler);

export default router;

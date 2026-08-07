import express, { Router, Request, Response } from "express";
import {
  createMeeting,
  listMeetings,
  deleteMeeting,
} from "../supabase/db";
import { authRequired } from "../middleware/auth";

const router: Router = express.Router();

router.use(authRequired);

// Save a meeting (transcript + summary) transcribed on the client
router.post("/", async (req: Request, res: Response) => {
  try {
    const meeting = await createMeeting(req.userId as string, req.body || {});
    res.json({ ok: true, meeting });
  } catch (e) {
    console.error("Error saving meeting", e);
    res.status(500).json({ ok: false });
  }
});

// List the user's meetings
router.get("/", async (req: Request, res: Response) => {
  try {
    const meetings = await listMeetings(req.userId as string);
    res.json({ ok: true, meetings });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// Delete a meeting
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteMeeting(req.userId as string, String(req.params.id));
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

export default router;
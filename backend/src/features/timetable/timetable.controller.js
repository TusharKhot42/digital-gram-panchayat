import { timetableService } from './timetable.service.js';

export async function getTimetable(_req, res, next) {
  try {
    const data = await timetableService.getTimetable();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateTimetable(req, res, next) {
  try {
    const { ghantagadi, water } = req.body;
    const data = await timetableService.updateTimetable(
      { ghantagadi, water },
      req.user?._id || req.user?.id,
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function resetTimetable(req, res, next) {
  try {
    const data = await timetableService.resetTimetable(req.user?._id || req.user?.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

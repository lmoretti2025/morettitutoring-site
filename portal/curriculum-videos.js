/* =========================================================================
   CURRICULUM VIDEOS: which video plays for each part of each lesson.

   One line per lesson, one entry per part, in order. Lesson ids are the
   course letter and the lesson number: 'm2.1' is Math 2.1 Linear Equations,
   'e3.1' is Reading & Writing 3.1 Transitions I. The portal's Curriculum
   page shows each lesson's parts (Part 1, Part 2, ...); leave a part as ''
   until its video is ready and the page shows "Video coming soon" there.

   The course videos are private files (Luca, 2026-09-30):
     'r2:m2.1-1.mp4'     the file's name in the private bucket, which is
                         <lesson id>-<part number>.mp4. Only the name goes
                         here, never a link: the portal asks the backend for
                         a signed link that works for two hours, for the
                         signed-in student alone, so it cannot be passed on.

   These also work, but anyone with the link can watch and share them, so
   they are not for course videos:
     'youtube:VIDEO_ID'  /  'https://youtu.be/VIDEO_ID'
     'vimeo:123456789'   /  'https://vimeo.com/123456789'
     'https://.../lesson.mp4'

   A lesson recorded as one video: give each part its stretch of it,
     'r2:m2.1-1.mp4@0:00-3:10', 'r2:m2.1-1.mp4@3:10-7:45', ...
   (minutes:seconds, either end may be left off), or 'part:1' for a part
   whose material is in Part 1's video.

   Example (remove the // to use it):
   //   'm2.1': ['r2:m2.1-1.mp4', 'r2:m2.1-2.mp4', ''],
   ========================================================================= */
window.CURRICULUM_VIDEOS = {
  'm1.1': ['r2:m1.1-1.mp4'],
  // One video per lesson, each part playing its stretch of it. The times are
  // where each part's title slide first appears, read off the videos
  // (2026-10-02), one second early.
  // Re-recorded 2026-10-02 (19:45, was ~16:00). Part boundaries are the Standard Form and
  // Point-Slope Form title slides at 13:00 and 17:19, one second early as before.
  'm2.1': ['r2:m2.1-1.mp4@0:00-12:59', 'r2:m2.1-1.mp4@12:59-17:18', 'r2:m2.1-1.mp4@17:18'],
  // Re-recorded 2026-10-03 (14:30). Boundaries are the Equation-to-table and When given
  // two points title slides at 7:44 and 12:10, one second early as the others are.
  'm2.2': ['r2:m2.2-1.mp4@0:00-7:43', 'r2:m2.2-1.mp4@7:43-12:09', 'r2:m2.2-1.mp4@12:09'],
  // 2.3 and 2.4 swapped places (Luca, 2026-10-02): this recording is Building
  // the Equation, now 2.4. The new 2.3, Interpretation, has no video yet.
  'm2.4': ['r2:m2.3-1.mp4@0:00-12:29', 'r2:m2.3-1.mp4@12:29-16:53', 'r2:m2.3-1.mp4@16:53-24:39', 'r2:m2.3-1.mp4@24:39']
};

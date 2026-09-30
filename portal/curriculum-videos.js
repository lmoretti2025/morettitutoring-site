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

   Example (remove the // to use it):
   //   'm2.1': ['r2:m2.1-1.mp4', 'r2:m2.1-2.mp4', ''],
   ========================================================================= */
window.CURRICULUM_VIDEOS = {
};

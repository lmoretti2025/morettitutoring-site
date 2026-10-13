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
  'm2.1': ['r2:m2.1-1.mp4@0:00-12:59', 'r2:m2.1-1.mp4@12:59-17:18', 'r2:m2.1-1.mp4@17:18'],
  'm2.2': ['r2:m2.2-1.mp4@0:00-7:43', 'r2:m2.2-1.mp4@7:43-12:09', 'r2:m2.2-1.mp4@12:09'],
  // 2.3 to 2.8, recorded 2026-10-04. Each boundary is where that part's title
  // slide first appears, read off the video, one second early. 2.8 is two parts:
  // the "Solving an inequality" slide was cut and its questions moved up.
  'm2.3': ['r2:m2.3-1.mp4@0:00-11:03', 'r2:m2.3-1.mp4@11:03-20:30', 'r2:m2.3-1.mp4@20:30'],
  'm2.4': ['r2:m2.4-1.mp4@0:00-6:21', 'r2:m2.4-1.mp4@6:21-9:01', 'r2:m2.4-1.mp4@9:01-14:19', 'r2:m2.4-1.mp4@14:19'],
  'm2.5': ['r2:m2.5-1.mp4@0:00-4:55', 'r2:m2.5-1.mp4@4:55-5:53', 'r2:m2.5-1.mp4@5:53-8:55', 'r2:m2.5-1.mp4@8:55'],
  'm2.6': ['r2:m2.6-1.mp4@0:00-4:16', 'r2:m2.6-1.mp4@4:16'],
  'm2.7': ['r2:m2.7-1.mp4@0:00-9:33', 'r2:m2.7-1.mp4@9:33'],
  'm2.8': ['r2:m2.8-1.mp4@0:00-8:18', 'r2:m2.8-1.mp4@8:18']
};

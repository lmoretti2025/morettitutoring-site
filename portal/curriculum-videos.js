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
  'm2.8': ['r2:m2.8-1.mp4@0:00-8:18', 'r2:m2.8-1.mp4@8:18'],
  // 2.9, recorded 2026-10-15. Same rule for the boundaries: the second the
  // part's title slide appears, one second early.
  'm2.9': ['r2:m2.9-1.mp4@0:00-5:08', 'r2:m2.9-1.mp4@5:08-9:36', 'r2:m2.9-1.mp4@9:36'],
  // 2.10, recorded 2026-10-20. One notes page and then all 14 questions, so
  // the lesson is a single part and the whole 36:10 belongs to it - no
  // boundaries to read off.
  'm2.10': ['r2:m2.10-1.mp4'],
  // 3.1, recorded 2026-10-22. Boundaries read off the video the usual way:
  // the second the part's title slide appears, one second early.
  //   Part 2  "Expressing One Variable in Terms of Another"  appears 9:10  -> 9:09
  //   Part 3  "When there's a story"                         appears 18:14 -> 18:13
  'm3.1': ['r2:m3.1-1.mp4@0:00-9:09', 'r2:m3.1-1.mp4@9:09-18:13', 'r2:m3.1-1.mp4@18:13'],
  // 3.2, recorded 2026-10-22. Two parts: the first three note pages have no
  // questions of their own, so they belong to Part 1.
  //   Part 2  "What is the value of the constant?"  appears 10:08 -> 10:07
  'm3.2': ['r2:m3.2-1.mp4@0:00-10:07', 'r2:m3.2-1.mp4@10:07'],
  // 3.11, recorded 2026-10-23. Three parts: What regression is has no
  // questions of its own, so it belongs to Part 1.
  //   Part 2  "Without a table"      appears 8:03  -> 8:02
  //   Part 3  "Adding the brackets"  appears 13:03 -> 13:02
  'm3.11': ['r2:m3.11-1.mp4@0:00-8:02', 'r2:m3.11-1.mp4@8:02-13:02', 'r2:m3.11-1.mp4@13:02'],
  // 3.3, recorded 2026-10-28. Six parts, boundaries read off the video the
  // usual way: the second the part's title slide appears, one second early.
  //   Part 2  "What “Solutions” Mean for a Quadratic"  appears 6:25  -> 6:24
  //   Part 3  "The Slider"                              appears 12:43 -> 12:42
  //   Part 4  "Solutions from Factored Form"            appears 19:47 -> 19:46
  //   Part 5  "The Quadratic Formula"                   appears 27:57 -> 27:56
  //   Part 6  "Sum and Product of Solutions"            appears 36:40 -> 36:39
  'm3.3': ['r2:m3.3-1.mp4@0:00-6:24', 'r2:m3.3-1.mp4@6:24-12:42', 'r2:m3.3-1.mp4@12:42-19:46',
           'r2:m3.3-1.mp4@19:46-27:56', 'r2:m3.3-1.mp4@27:56-36:39', 'r2:m3.3-1.mp4@36:39'],
  // 4.9, recorded 2026-10-30. Four parts, boundaries read off the video the
  // usual way: the second the part's title slide appears, one second early.
  //   Part 2  "Desmos Calculator Functions to Finish Faster"  appears 10:20 -> 10:19
  //   Part 3  "Tangent Lines"                                 appears 16:40 -> 16:39
  //   Part 4  "Shapes Inside Circles"                         appears 20:49 -> 20:48
  'm4.9': ['r2:m4.9-1.mp4@0:00-10:19', 'r2:m4.9-1.mp4@10:19-16:39', 'r2:m4.9-1.mp4@16:39-20:48', 'r2:m4.9-1.mp4@20:48']
};

/* WHEN EACH VIDEO WENT UP (Luca, 2026-10-30). The admin page judges a finished
   part against the video that existed when it was finished: a part done before
   its video was posted reads "No video yet", not "skipped". Add a line here
   with every new video, or its parts will read skipped until one is added. */
window.CURRICULUM_VIDEO_DATES = {
  'm1.1-1.mp4': '2026-09-30T14:53:55Z',
  'm2.1-1.mp4': '2026-10-02T04:43:29Z',
  'm2.2-1.mp4': '2026-10-02T04:43:29Z',
  'm2.3-1.mp4': '2026-10-02T04:43:29Z',
  'm2.4-1.mp4': '2026-10-04T22:07:09Z',
  'm2.5-1.mp4': '2026-10-04T22:07:09Z',
  'm2.6-1.mp4': '2026-10-04T22:07:09Z',
  'm2.7-1.mp4': '2026-10-04T22:07:09Z',
  'm2.8-1.mp4': '2026-10-04T22:07:09Z',
  'm2.9-1.mp4': '2026-10-16T04:16:36Z',
  'm2.10-1.mp4': '2026-10-21T01:24:35Z',
  'm3.1-1.mp4': '2026-10-22T13:44:04Z',
  'm3.2-1.mp4': '2026-10-22T22:01:53Z',
  'm3.11-1.mp4': '2026-10-23T04:54:52Z',
  'm3.3-1.mp4': '2026-10-29T18:26:18Z',
  'm4.9-1.mp4': '2026-10-31T04:04:53Z'
};

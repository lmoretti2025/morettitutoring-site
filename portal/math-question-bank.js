/* =========================================================================
   MORETTI MATH QUESTION BANK — Luca's own hand-written Math questions for
   the Question Practice tool (see the isolated "Question Practice module"
   script near the end of portal/index.html, which reads this file
   alongside practice-tests.js). Unlike practice-tests.js, these aren't
   split into 22/22/22 test modules — they're a flat, ever-growing pool
   per domain/skill, which is exactly what the topic-filter and
   weak-spot-practice modes need. Domain/skill strings are kept identical
   to the taxonomy already used in banks.js and practice-tests.js so a
   student's diagnostic weak-spot results (which use that same taxonomy)
   correctly match questions here.

   SOURCE — transcribed from Luca's own question images (folder: "my math
   qs", organized as <Domain>_<Skill>_q<id>.png + a matching
   _explanation.png per question, in Luca's own answer-key format:
   Correct Answer / Rationale / Question Difficulty). Text, choices,
   correct answers, and per-choice explanations below are transcribed
   from those images; any figure/table in a question is rebuilt here as
   clean inline HTML/SVG (matching the .dx-table/.dx-fig convention
   already used in banks.js) rather than embedding the original image.

   STATUS — in progress: Evaluating Statistical Claims (10/10), Circles
   (18/18), Sample Statistics and Margin of Error (16/16), Linear
   Inequalities in One or Two Variables (33/33), Right Triangles and
   Trigonometry (20/20), and Lines, Angles, and Triangles (37/37) done —
   134 questions total. 13 Math skill folders remain (~663 more
   questions), transcribed in the same format, folder by folder.
   ========================================================================= */
window.MATH_QUESTION_BANK = [
  {"domain": "Problem-Solving & Data Analysis", "skill": "Evaluating Statistical Claims: Observational Studies and Experiments", "difficulty": "hard", "type": "mc",
    "text": "A sample of 40 fourth-grade students was selected at random from a certain school. The 40 students completed a survey about the morning announcements, and 32 thought the announcements were helpful. Which of the following is the largest population to which the results of the survey can be applied?",
    "choices": ["The 40 students who were surveyed", "All fourth-grade students at the school", "All students at the school", "All fourth-grade students in the county in which the school is located"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. The results do apply to the 40 students who were surveyed, but that isn't the largest population they generalize to — the sample was drawn from a bigger group.",
      "Correct. The sample was selected at random from all fourth-grade students at the school, so the results can be generalized to that whole population, but not beyond it.",
      "Incorrect. The sample was drawn only from fourth-graders, not from the entire student body, so the results can't be extended to every student at the school.",
      "Incorrect. The sample came only from fourth-graders at this one school, not from fourth-graders elsewhere in the county, so the results can't be generalized that far."
    ],
    "explanation": "Choice B is correct. Selecting a sample of a reasonable size at random to use for a survey allows the results from that survey to be applied to the population from which the sample was selected, but not beyond this population. In this case, the population from which the sample was selected is all fourth-grade students at a certain school. Therefore, the results of the survey can be applied to all fourth-grade students at the school.<br><br>Choice A is incorrect. The results of the survey can be applied to the 40 students who were surveyed. However, this isn't the largest group to which the results of the survey can be applied. Choices C and D are incorrect. Since the sample was selected at random from among the fourth-grade students at a certain school, the results of the survey can't be applied to other students at the school or to other fourth-grade students who weren't represented in the survey results. Students in other grades in the school or other fourth-grade students in the country may feel differently about announcements than the fourth-grade students at the school."},
  {"domain": "Problem-Solving & Data Analysis", "skill": "Evaluating Statistical Claims: Observational Studies and Experiments", "difficulty": "medium", "type": "mc",
    "text": "Residents of a town were surveyed to determine whether they are satisfied with the concession stand at the local park. A random sample of 200 residents was selected. All 200 responded, and 87% said they are satisfied. Based on this information, which of the following statements must be true?<br><br>I. Of all the town residents, 87% would say they are satisfied with the concession stand at the local park.<br>II. If another random sample of 200 residents were surveyed, 87% would say they are satisfied.",
    "choices": ["Neither", "I only", "II only", "I and II"],
    "correct": 0,
    "choiceNotes": [
      "Correct. A sample's result only approximates the population's true value — it doesn't guarantee the same percentage would show up if every resident were surveyed, or if a different sample of 200 were.",
      "Incorrect. Statement I need not be true — surveying every resident of the town could turn up a different percentage than the sample did.",
      "Incorrect. Statement II need not be true — a different random sample of 200 residents could easily produce a different percentage.",
      "Incorrect. Neither statement is guaranteed — a single sample's result doesn't have to match the population's exact value or another sample's result."
    ],
    "explanation": "Choice A is correct. The purpose of surveying a random sample of residents is to approximate the percent of the town residents that are satisfied with the concession stand. The sample doesn't necessarily get the same result as surveying every resident of the town, nor would another sample necessarily have identical results. Therefore, although it's possible that either statement I or statement II could prove true by surveying every resident of the town, these statements cannot be proven true solely based on the results of the sample.<br><br>Choice B is incorrect because surveying a sample of the town residents may not have the same result as surveying all the town residents. Choices C and D are incorrect because surveying a different sample of residents could yield different results."},
  {"domain": "Problem-Solving & Data Analysis", "skill": "Evaluating Statistical Claims: Observational Studies and Experiments", "difficulty": "hard", "type": "mc",
    "text": "To determine the mean number of children per household in a community, Tabitha surveyed 20 families at a playground. For the 20 families surveyed, the mean number of children per household was 2.4. Which of the following statements must be true?",
    "choices": ["The mean number of children per household in the community is 2.4.", "A determination about the mean number of children per household in the community should not be made because the sample size is too small.", "The sampling method is flawed and may produce a biased estimate of the mean number of children per household in the community.", "The sampling method is not flawed and is likely to produce an unbiased estimate of the mean number of children per household in the community."],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. This assumes the sampling method was unbiased, but families at a playground are more likely to have children than households in general, so the sample isn't representative of the whole community.",
      "Incorrect. Sample size isn't the real problem here — a sample of 20 could work fine if it were representative. Where the sample was taken from is the issue.",
      "Correct. Surveying families at a playground oversamples households with children, so the sample isn't representative of the community and the estimate is likely biased.",
      "Incorrect. This also assumes the sampling method was unbiased, which isn't the case — sampling at a playground skews toward households with children."
    ],
    "explanation": "Choice C is correct. In order to use a sample mean to estimate the mean for a population, the sample must be representative of the population (for example, a simple random sample). In this case, Tabitha surveyed 20 families in a playground. Families in the playground are more likely to have children than other households in the community. Therefore, the sample isn't representative of the population. Hence, the sampling method is flawed and may produce a biased estimate.<br><br>Choices A and D are incorrect because they incorrectly assume the sampling method is unbiased. Choice B is incorrect because a sample of size 20 could be large enough to make an estimate if the sample had been representative of all the families in the community."},
  {"domain": "Problem-Solving & Data Analysis", "skill": "Evaluating Statistical Claims: Observational Studies and Experiments", "difficulty": "medium", "type": "mc",
    "text": "A polling agency recently surveyed 1,000 adults who were selected at random from a large city and asked each of the adults, “Are you satisfied with the quality of air in the city?” Of those surveyed, 78 percent responded that they were satisfied with the quality of air in the city. Based on the results of the survey, which of the following statements must be true?<br><br>1. Of all adults in the city, 78 percent are satisfied with the quality of air in the city.<br>2. If another 1,000 adults selected at random from the city were surveyed, 78 percent of them would report they are satisfied with the quality of air in the city.<br>3. If 1,000 adults selected at random from a different city were surveyed, 78 percent of them would report they are satisfied with the quality of air in the city.",
    "choices": ["None", "II only", "I and II only", "I and III only"],
    "correct": 0,
    "choiceNotes": [
      "Correct. None of the three statements has to be true — a sample result only estimates the population value, and different samples (from the same city or a different one) can vary.",
      "Incorrect. Statement II doesn't have to be true — a different random sample of the same size from the same city could still produce a different percentage.",
      "Incorrect. Statement I doesn't have to be true either — the sample's 78% is an estimate for the whole city, not a guaranteed exact value.",
      "Incorrect. Statement III is especially unlikely to hold, since a different city's population could have very different opinions about its own air quality."
    ],
    "explanation": "Choice A is correct. Statement I need not be true. The fact that 78% of the 1,000 adults who were surveyed responded that they were satisfied with the air quality in the city does not mean that the exact same percentage of all adults in the city will be satisfied with the air quality in the city. Statement II need not be true because random samples, even when they are of the same size, are not necessarily identical with regard to percentages of people in them who have a certain opinion. Statement III need not be true for the same reason that statement II need not be true: results from different samples can vary. The variation may be even bigger for this sample since it would be selected from a different city. Therefore, none of the statements must be true.<br><br>Choices B, C, and D are incorrect because none of the statements must be true."},
  {"domain": "Problem-Solving & Data Analysis", "skill": "Evaluating Statistical Claims: Observational Studies and Experiments", "difficulty": "hard", "type": "mc",
    "text": "A psychologist designed and conducted a study to determine whether playing a certain educational game increases middle school students’ accuracy in adding fractions. For the study, the psychologist chose a random sample of 35 students from all of the students at one of the middle schools in a large city. The psychologist found that students who played the game showed significant improvement in accuracy when adding fractions. What is the largest group to which the results of the study can be generalized?",
    "choices": ["The 35 students in the sample", "All students at the school", "All middle school students in the city", "All students in the city"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. The results do apply to the 35 sampled students, but that isn't the largest group they generalize to — the sample was drawn from the whole school.",
      "Correct. The sample was chosen at random from all students at one particular school, so the results generalize to that entire school population, but not further.",
      "Incorrect. The sample was drawn only from one school, not from middle schoolers across the whole city, so it can't be extended that far.",
      "Incorrect. This group is even broader than middle schoolers in the city, and the sample wasn't drawn from anywhere near that wide a population."
    ],
    "explanation": "Choice B is correct. The largest group to which the results of a study can be generalized is the population from which the random sample was chosen. In this case, the psychologist chose a random sample from all students at one particular middle school. Therefore, the largest group to which the results can be generalized is all the students at the school.<br><br>Choice A is incorrect because this isn't the largest group the results can be generalized to. Choices C and D are incorrect because these groups are larger than the population from which the random sample was chosen. Therefore, the sample isn't representative of these groups."},
  {"domain": "Problem-Solving & Data Analysis", "skill": "Evaluating Statistical Claims: Observational Studies and Experiments", "difficulty": "hard", "type": "mc",
    "text": "A trivia tournament organizer wanted to study the relationship between the number of points a team scores in a trivia round and the number of hours that a team practices each week. For the study, the organizer selected 55 teams at random from all trivia teams in a certain tournament. The table displays the information for the 40 teams in the sample that practiced for at least 3 hours per week.<br><br>" +
      "<table class=\"dx-table\"><tr><th rowspan=\"2\">Hours practiced</th><th colspan=\"3\">Number of points per round</th></tr><tr><th>6 to 13 points</th><th>14 or more points</th><th>Total</th></tr>" +
      "<tr><td>3 to 5 hours</td><td>6</td><td>4</td><td>10</td></tr>" +
      "<tr><td>More than 5 hours</td><td>4</td><td>26</td><td>30</td></tr>" +
      "<tr><td>Total</td><td>10</td><td>30</td><td>40</td></tr></table>" +
      "Which of the following is the largest population to which the results of the study can be generalized?",
    "choices": ["All trivia teams in the tournament that scored 14 or more points in the round", "The 55 trivia teams in the sample", "The 40 trivia teams in the sample that practiced for at least 3 hours per week", "All trivia teams in the tournament"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. The 55-team sample wasn't limited to teams that scored 14 or more points, so this describes a narrower group than what the results actually generalize to.",
      "Incorrect. Since the sample of 55 teams was chosen at random from all tournament teams, the results generalize beyond just the sample, to the full population it was drawn from.",
      "Incorrect. The table only shows the 40 teams that practiced at least 3 hours per week, but the original random sample was 55 teams drawn from the whole tournament.",
      "Correct. The organizer selected the sample of 55 teams at random from all trivia teams in the tournament, so the results generalize to every team in the tournament."
    ],
    "explanation": "Choice D is correct. It's given that the organizer selected 55 teams at random from all trivia teams in the tournament. A table is also given displaying the information for the 40 teams in the sample that practiced for at least 3 hours per week. Selecting a sample of a reasonable size at random to use for a survey allows the results from that survey to be applied to the population from which the sample was selected, but not beyond this population. Thus, only the sampling method information is necessary to determine the largest population to which the results of the study can be generalized. Since the organizer selected the sample at random from all trivia teams in the tournament, the largest population to which the results of the study can be generalized is all trivia teams in the tournament.<br><br>Choice A is incorrect. The sample was selected at random from all trivia teams in the tournament, not just from the teams that scored an average of 14 or more points per round.<br><br>Choice B is incorrect. If a study uses a sample selected at random from a population, the results of the study can be generalized to the population, not just the sample.<br><br>Choice C is incorrect. If a study uses a sample selected at random from a population, the results of the study can be generalized to the population, not just a subset of the sample."},
  {"domain": "Problem-Solving & Data Analysis", "skill": "Evaluating Statistical Claims: Observational Studies and Experiments", "difficulty": "easy", "type": "mc",
    "text": "A market researcher selected 200 people at random from a group of people who indicated that they liked a certain book. The 200 people were shown a movie based on the book and then asked whether they liked or disliked the movie. Of those surveyed, 95% said they disliked the movie. Which of the following inferences can appropriately be drawn from this survey result?",
    "choices": ["At least 95% of people who go see movies will dislike this movie.", "At least 95% of people who read books will dislike this movie.", "Most people who dislike this book will like this movie.", "Most people who like this book will dislike this movie."],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. The sample was drawn only from people who liked the book, not from moviegoers in general, so the result can't be extended to that broader group.",
      "Incorrect. The sample was drawn only from people who liked this specific book, not from readers in general, so this goes beyond what the survey supports.",
      "Incorrect. The survey only sampled people who liked the book, so it says nothing about how people who dislike the book would react to the movie.",
      "Correct. Since the sample was drawn from people who liked the book and 95% of them disliked the movie, the appropriate inference is about that same group."
    ],
    "explanation": "Choice D is correct. The sample was selected from a group of people who indicated that they liked the book. It is inappropriate to generalize the result of the survey beyond the population from which the participants were selected. Choice D is the most appropriate inference from the survey results because it describes a conclusion about people who liked the book, and the results of the survey indicate that most people who like the book disliked the movie.<br><br>Choices A, B, and C are incorrect because none of these inferences can be drawn from the survey results. Choices A and B need not be true. The people surveyed all liked the book on which the movie was based, which is not necessarily true of all people who go see movies or all people who read books. Thus, the people surveyed are not representative of all people who go see movies or all people who read books. Therefore, the results of this survey cannot appropriately be extended to at least 95% of people who go see movies or to at least 95% of people who read books. Choice C need not be true because the sample includes only people who liked the book, and so the results do not extend to people who dislike the book."},
  {"domain": "Problem-Solving & Data Analysis", "skill": "Evaluating Statistical Claims: Observational Studies and Experiments", "difficulty": "easy", "type": "mc",
    "text": "The members of a city council wanted to assess the opinions of all city residents about converting an open field into a dog park. The council surveyed a sample of 500 city residents who own dogs. The survey showed that the majority of those sampled were in favor of the dog park. Which of the following is true about the city council’s survey?",
    "choices": ["It shows that the majority of city residents are in favor of the dog park.", "The survey sample should have included more residents who are dog owners.", "The survey sample should have consisted entirely of residents who do not own dogs.", "The survey sample is biased because it is not representative of all city residents."],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. Since the sample wasn't random or representative of all residents, its result can't be generalized to every city resident.",
      "Incorrect. Adding more dog owners to the sample wouldn't fix the underlying problem — the sample would still be missing residents who don't own dogs.",
      "Incorrect. A sample of only non-dog-owners would be just as biased in the opposite direction, still not representative of all city residents.",
      "Correct. The council wanted to assess all city residents' opinions but only surveyed dog owners, who aren't representative of the full population, so the sample is biased."
    ],
    "explanation": "Choice D is correct. The members of a city council wanted to assess opinions of all city residents. To gather an unbiased sample, the council should have used a random sampling design to select subjects from all city residents. The given survey introduced a sampling bias because the 500 city residents surveyed were all dog owners. This sample is not representative of all city residents because not all city residents are dog owners.<br><br>Choice A is incorrect because when the sampling method isn't random, there is no guarantee that the survey results will be reliable; hence, they cannot be generalized to the entire population. Choice B is incorrect because a larger sample of residents who are dog owners would not correct the sampling bias. Choice C is incorrect because a survey sample of entirely non–dog owners would likely have a biased opinion, just as a sample of dog owners would likely have a biased opinion."},
  {"domain": "Problem-Solving & Data Analysis", "skill": "Evaluating Statistical Claims: Observational Studies and Experiments", "difficulty": "hard", "type": "mc",
    "text": "Near the end of a US cable news show, the host invited viewers to respond to a poll on the show’s website that asked, “Do you support the new federal policy discussed during the show?” At the end of the show, the host reported that 28% responded “Yes,” and 70% responded “No.” Which of the following best explains why the results are unlikely to represent the sentiments of the population of the United States?",
    "choices": ["The percentages do not add up to 100%, so any possible conclusions from the poll are invalid.", "Those who responded to the poll were not a random sample of the population of the United States.", "There were not 50% “Yes” responses and 50% “No” responses.", "The show did not allow viewers enough time to respond to the poll."],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. The percentages not summing to 100% (some viewers may not have responded either way) isn't what makes the sample unrepresentative — the sampling method is the real issue.",
      "Correct. Only viewers who watched the show and chose to respond were counted — that's not a random sample of the U.S. population, so the results can't be generalized to the country as a whole.",
      "Incorrect. Whether the responses split evenly has nothing to do with whether the sample represents the population.",
      "Incorrect. The time allowed to respond isn't what makes this sample unrepresentative — the self-selected nature of who chose to respond is the issue."
    ],
    "explanation": "Choice B is correct. In order for the poll results from a sample of a population to represent the entire population, the sample must be representative of the population. A sample that is randomly selected from a population is more likely than a sample of the type described to represent the population. In this case, the people who responded were people with access to cable television and websites, which aren't accessible to the entire population. Moreover, the people who responded also chose to watch the show and respond to the poll. The people who made these choices aren't representative of the entire population of the United States because they were not a random sample of the population of the United States.<br><br>Choices A, C, and D are incorrect because they present reasons unrelated to whether the sample is representative of the population of the United States."},
  {"domain": "Problem-Solving & Data Analysis", "skill": "Evaluating Statistical Claims: Observational Studies and Experiments", "difficulty": "medium", "type": "mc",
    "text": "A survey was conducted using a sample of history professors selected at random from the California State Universities. The professors surveyed were asked to name the publishers of their current texts. What is the largest population to which the results of the survey can be generalized?",
    "choices": ["All professors in the United States", "All history professors in the United States", "All history professors at all California State Universities", "All professors at all California State Universities"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. The sample was drawn only from history professors at California State Universities, not from all professors nationwide, so it can't generalize that far.",
      "Incorrect. The sample was limited to California State Universities specifically, so the results can't be extended to history professors across the whole country.",
      "Correct. The sample was selected at random from history professors at the California State Universities, so the results generalize to that whole population, but not beyond it.",
      "Incorrect. The sample only included history professors, not professors from other departments, so the results can't be extended to all professors at these schools."
    ],
    "explanation": "Choice C is correct. Selecting a sample at random when conducting a survey allows the results to be generalized to the population from which the sample was selected, but not beyond this population. In this situation, the population that the sample was selected from is history professors from the California State Universities. Therefore, the largest population to which the results of the survey can be generalized is all history professors at all California State Universities.<br><br>Choices A, B, and D are incorrect. Since the sample was selected at random from history professors from the California State Universities, the results of the survey can't be generalized to all professors in the United States, all history professors in the United States, or all professors at all California State Universities. All three of these populations may use different texts and therefore may name different publishers."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "hard", "type": "mc",
    "text": "The equation x² + 20x + y² + 16y = −20 defines a circle in the xy-plane. What are the coordinates of the center of the circle?",
    "choices": ["(−20, −16)", "(−10, −8)", "(10, 8)", "(20, 16)"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This uses the coefficients of x and y directly as the center's coordinates instead of completing the square first.",
      "Correct. Completing the square on x² + 20x and y² + 16y shows the equation is equivalent to (x + 10)² + (y + 8)² = 144, so the center is (−10, −8).",
      "Incorrect. This is the negative of the correct center — a sign error when reading off the completed-square form.",
      "Incorrect. This uses the coefficients directly with the wrong sign, rather than completing the square."
    ],
    "explanation": "Choice B is correct. The standard equation of a circle in the xy-plane is of the form (x − h)² + (y − k)² = r², where (h, k) are the coordinates of the center of the circle and r is the radius. The given equation can be rewritten in standard form by completing the squares. So the sum of the first two terms, x² + 20x, needs a 100 to complete the square, and the sum of the second two terms, y² + 16y, needs a 64 to complete the square. Adding 100 and 64 to both sides of the given equation yields (x² + 20x + 100) + (y² + 16y + 64) = −20 + 100 + 64, which is equivalent to (x + 10)² + (y + 8)² = 144. Therefore, the coordinates of the center of the circle are (−10, −8).<br><br>Choices A, C, and D are incorrect and may result from computational errors made when attempting to complete the squares or when identifying the coordinates of the center."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "easy", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 200\" class=\"dx-fig\" style=\"color:var(--text);\"><circle cx=\"100\" cy=\"100\" r=\"80\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"44\" y1=\"44\" x2=\"156\" y2=\"156\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"156\" y1=\"44\" x2=\"44\" y2=\"156\" stroke=\"currentColor\" stroke-width=\"1.3\"/><rect x=\"92\" y=\"92\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" transform=\"rotate(45 100 100)\"/><circle cx=\"100\" cy=\"100\" r=\"2\" fill=\"currentColor\"/><text x=\"106\" y=\"98\" font-size=\"11\" fill=\"currentColor\">O</text><text x=\"28\" y=\"40\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"162\" y=\"40\" font-size=\"13\" fill=\"currentColor\">C</text></svg>The circle above with center O has a circumference of 36. What is the length of minor arc AC?",
    "choices": ["9", "12", "18", "36"],
    "correct": 0,
    "choiceNotes": [
      "Correct. The two diameters shown are perpendicular, so angle AOC is 90°, one-fourth of the circle's 360°. One-fourth of the circumference 36 is 9.",
      "Incorrect. This is one-third of the circumference, not the one-fourth that the perpendicular diameters actually cut off.",
      "Incorrect. This is half the circumference, but arc AC is only a quarter of the circle.",
      "Incorrect. This is the entire circumference, not just minor arc AC."
    ],
    "explanation": "Choice A is correct. A circle has 360 degrees of arc. In the circle shown, O is the center of the circle and ∠AOC is a central angle of the circle. From the figure, the two diameters that meet to form ∠AOC are perpendicular, so the measure of ∠AOC is 90°. Therefore, the length of minor arc AC is 90/360 of the circumference of the circle. Since the circumference of the circle is 36, the length of minor arc AC is (90/360) × 36 = 9.<br><br>Choices B, C, and D are incorrect. The perpendicular diameters divide the circumference of the circle into four equal arcs; therefore, minor arc AC is 1/4 of the circumference. However, the lengths in choices B and C are 1/3 and 1/2 the circumference of the circle, respectively, and the length in choice D is the length of the entire circumference. None of these lengths is 1/4 the circumference."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "hard", "type": "mc",
    "text": "A circle in the xy-plane has its center at (−4, −6). Line k is tangent to this circle at the point (−7, −7). What is the slope of line k?",
    "choices": ["−3", "−1/3", "1/3", "3"],
    "correct": 0,
    "choiceNotes": [
      "Correct. The radius to the point of tangency has slope 1/3; a tangent line is perpendicular to its radius, and the negative reciprocal of 1/3 is −3.",
      "Incorrect. This is not the negative reciprocal of the radius's slope — likely a sign or inversion error.",
      "Incorrect. This is the slope of the radius itself, not the tangent line, which must be perpendicular to it.",
      "Incorrect. This is the reciprocal of the radius's slope but with the wrong sign."
    ],
    "explanation": "Choice A is correct. A line that's tangent to a circle is perpendicular to the radius of the circle at the point of tangency. It's given that the circle has its center at (−4, −6) and line k is tangent to the circle at the point (−7, −7). The slope of a radius defined by the points (q, r) and (s, t) can be calculated as (t − r)/(s − q). The points (−7, −7) and (−4, −6) define the radius of the circle at the point of tangency. Therefore, the slope of this radius can be calculated as ((−6) − (−7))/((−4) − (−7)), or 1/3. If a line and a radius are perpendicular, the slope of the line must be the negative reciprocal of the slope of the radius. The negative reciprocal of 1/3 is −3. Thus, the slope of line k is −3.<br><br>Choice B is incorrect and may result from conceptual or calculation errors. Choice C is incorrect. This is the slope of the radius of the circle at the point of tangency, not the slope of line k. Choice D is incorrect and may result from conceptual or calculation errors."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "hard", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 200\" class=\"dx-fig\" style=\"color:var(--text);\"><circle cx=\"100\" cy=\"90\" r=\"70\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"45\" y1=\"45\" x2=\"155\" y2=\"45\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"45\" y1=\"45\" x2=\"100\" y2=\"90\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"155\" y1=\"45\" x2=\"100\" y2=\"90\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"100\" y1=\"90\" x2=\"100\" y2=\"160\" stroke=\"currentColor\" stroke-width=\"1.3\"/><circle cx=\"100\" cy=\"90\" r=\"2\" fill=\"currentColor\"/><text x=\"106\" y=\"86\" font-size=\"11\" fill=\"currentColor\">O</text><text x=\"30\" y=\"42\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"162\" y=\"42\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"106\" y=\"175\" font-size=\"13\" fill=\"currentColor\">C</text></svg>Point O is the center of the circle above, and the measure of ∠OAB is 30°. If the length of OC is 18, what is the length of arc AB?",
    "choices": ["9π", "12π", "15π", "18π"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This uses only part of the correct central angle in radians, not the full 2π/3 that angle AOB actually measures.",
      "Correct. Triangle AOB is isosceles since OA and OB are radii, so angle AOB = 180° − 30° − 30° = 120° = 2π/3 radians; with radius 18, arc AB = (2π/3)(18) = 12π.",
      "Incorrect. This doesn't match the arc length produced by the correct central angle and radius.",
      "Incorrect. This equals the radius times π, not the actual arc length calculation."
    ],
    "explanation": "Choice B is correct. Because segments OA and OB are radii of the circle centered at point O, these segments have equal lengths. Therefore, triangle AOB is an isosceles triangle, where angles OAB and OBA are congruent base angles of the triangle. It's given that angle OAB measures 30°. Therefore, angle OBA also measures 30°. Let x° represent the measure of angle AOB. Since the sum of the measures of the three angles of any triangle is 180°, it follows that 30° + 30° + x° = 180°, or 60° + x° = 180°. Subtracting 60° from both sides of this equation yields x° = 120°, or 2π/3 radians. Therefore, the measure of angle AOB, and thus the measure of arc AB, is 2π/3 radians. Since OC is a radius of the given circle and its length is 18, the length of the radius of the circle is 18. Therefore, the length of arc AB can be calculated as (2π/3)(18), or 12π.<br><br>Choices A, C, and D are incorrect and may result from conceptual or computational errors."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "medium", "type": "fr",
    "text": "An angle has a measure of 9π/20 radians. What is the measure of the angle in degrees?",
    "answer": 81,
    "explanation": "The correct answer is 81. The measure of an angle, in degrees, can be found by multiplying its measure, in radians, by (180 degrees)/(π radians). Multiplying the given angle measure, 9π/20 radians, by (180 degrees)/(π radians) yields (9π/20 radians)(180 degrees / π radians), which is equivalent to 81 degrees."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "medium", "type": "mc",
    "text": "A circle in the xy-plane has its center at (−4, 5) and the point (−8, 8) lies on the circle. Which equation represents this circle?",
    "choices": ["(x − 4)² + (y + 5)² = 5", "(x + 4)² + (y − 5)² = 5", "(x − 4)² + (y + 5)² = 25", "(x + 4)² + (y − 5)² = 25"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. This equation has center (4, −5), not (−4, 5), and also has the wrong radius.",
      "Incorrect. The center (−4, 5) is correct, but the right-hand side should be r² = 25, not 5.",
      "Incorrect. This has the wrong center, (4, −5) instead of (−4, 5), even though the value 25 on the right side is correct.",
      "Correct. Substituting h = −4, k = 5 into (x − h)² + (y − k)² = r² gives (x + 4)² + (y − 5)² = r²; using the point (−8, 8), r² = (−8 + 4)² + (8 − 5)² = 16 + 9 = 25."
    ],
    "explanation": "Choice D is correct. A circle in the xy-plane can be represented by an equation of the form (x − h)² + (y − k)² = r², where (h, k) is the center of the circle and r is the length of a radius of the circle. It's given that the circle has its center at (−4, 5). Therefore, h = −4 and k = 5. Substituting −4 for h and 5 for k in the equation (x − h)² + (y − k)² = r² yields (x − (−4))² + (y − 5)² = r², or (x + 4)² + (y − 5)² = r². It's also given that the point (−8, 8) lies on the circle. Substituting −8 for x and 8 for y in the equation (x + 4)² + (y − 5)² = r² yields (−8 + 4)² + (8 − 5)² = r², or (−4)² + (3)² = r², which is equivalent to 16 + 9 = r², or 25 = r². Substituting 25 for r² in the equation (x + 4)² + (y − 5)² = r² yields (x + 4)² + (y − 5)² = 25. Thus, the equation (x + 4)² + (y − 5)² = 25 represents the circle.<br><br>Choice A is incorrect. The circle represented by this equation has its center at (4, −5), not (−4, 5), and the point (−8, 8) doesn't lie on the circle. Choice B is incorrect. The point (−8, 8) doesn't lie on the circle represented by this equation. Choice C is incorrect. The circle represented by this equation has its center at (4, −5), not (−4, 5), and the point (−8, 8) doesn't lie on the circle."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "medium", "type": "mc",
    "text": "In the xy-plane, a circle with radius 5 has center (−8, 6). Which of the following is an equation of the circle?",
    "choices": ["(x − 8)² + (y + 6)² = 25", "(x + 8)² + (y − 6)² = 25", "(x − 8)² + (y + 6)² = 5", "(x + 8)² + (y − 6)² = 5"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This equation has center (8, −6), the opposite sign of the given center (−8, 6).",
      "Correct. Substituting h = −8, k = 6, r = 5 into (x − h)² + (y − k)² = r² gives (x + 8)² + (y − 6)² = 25.",
      "Incorrect. This has center (8, −6) and uses r = 5 instead of r² = 25 on the right side.",
      "Incorrect. This has the correct center but uses r = 5 instead of r² = 25 on the right side."
    ],
    "explanation": "Choice B is correct. An equation of a circle is (x − h)² + (y − k)² = r², where the center of the circle is (h, k) and the radius is r. It's given that the center of this circle is (−8, 6) and the radius is 5. Substituting these values into the equation gives (x − (−8))² + (y − 6)² = 5², or (x + 8)² + (y − 6)² = 25.<br><br>Choice A is incorrect. This is an equation of a circle that has center (8, −6). Choice C is incorrect. This is an equation of a circle that has center (8, −6) and radius √5. Choice D is incorrect. This is an equation of a circle that has radius √5."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "hard", "type": "mc",
    "text": "A circle in the xy-plane has its center at (−1, 1). Line t is tangent to this circle at the point (5, −4). Which of the following points also lies on line t?",
    "choices": ["(0, 6/5)", "(4, 7)", "(10, 2)", "(11, 1)"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. The slope from this point to (5, −4) is −26/25, not the 6/5 slope of tangent line t.",
      "Incorrect. The slope from this point to (5, −4) is −11, not the 6/5 slope of tangent line t.",
      "Correct. The radius from (−1, 1) to (5, −4) has slope −5/6, so the tangent line's slope is the negative reciprocal, 6/5; the slope from (5, −4) to (10, 2) is also 6/5.",
      "Incorrect. The slope from this point to (5, −4) is 5/6, the radius's slope, not the tangent's slope of 6/5."
    ],
    "explanation": "Choice C is correct. It's given that the circle has its center at (−1, 1) and that line t is tangent to this circle at the point (5, −4). Therefore, the points (−1, 1) and (5, −4) are the endpoints of the radius of the circle at the point of tangency. The slope of a line or line segment that contains the points (a, b) and (c, d) can be calculated as (d − b)/(c − a). Substituting (−1, 1) for (a, b) and (5, −4) for (c, d) in the expression (d − b)/(c − a) yields (−4 − 1)/(5 − (−1)), or −5/6. Thus, the slope of this radius is −5/6. A line that's tangent to a circle is perpendicular to the radius of the circle at the point of tangency. It follows that line t is perpendicular to the radius at the point (5, −4), so the slope of line t is the negative reciprocal of the slope of this radius. The negative reciprocal of −5/6 is 6/5. Therefore, the slope of line t is 6/5. Since the slope of line t is the same between any two points on line t, a point lies on line t if the slope of the line segment connecting the point and (5, −4) is 6/5. Substituting choice C, (10, 2), for (a, b) and (5, −4) for (c, d) in the expression (d − b)/(c − a) yields (−4 − 2)/(5 − 10), or 6/5. Therefore, the point (10, 2) lies on line t.<br><br>Choice A is incorrect. The slope of the line segment connecting (0, 6/5) and (5, −4) is (−4 − 6/5)/(5 − 0), or −26/25, not 6/5. Choice B is incorrect. The slope of the line segment connecting (4, 7) and (5, −4) is (−4 − 7)/(5 − 4), or −11, not 6/5. Choice D is incorrect. The slope of the line segment connecting (11, 1) and (5, −4) is (−4 − 1)/(5 − 11), or 5/6, not 6/5."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "hard", "type": "fr",
    "text": "A circle in the xy-plane has its center at (−5, 2) and has a radius of 9. An equation of this circle is x² + y² + ax + by + c = 0, where a, b, and c are constants. What is the value of c?",
    "answer": -52,
    "explanation": "The correct answer is −52. The equation of a circle in the xy-plane with its center at (h, k) and a radius of r can be written in the form (x − h)² + (y − k)² = r². It's given that a circle in the xy-plane has its center at (−5, 2) and has a radius of 9. Substituting −5 for h, 2 for k, and 9 for r in the equation (x − h)² + (y − k)² = r² yields (x − (−5))² + (y − 2)² = 9², or (x + 5)² + (y − 2)² = 81. It's also given that an equation of this circle is x² + y² + ax + by + c = 0, where a, b, and c are constants. Therefore, (x + 5)² + (y − 2)² = 81 can be rewritten in the form x² + y² + ax + by + c = 0. The equation (x + 5)² + (y − 2)² = 81, or (x + 5)(x + 5) + (y − 2)(y − 2) = 81, can be rewritten as x² + 5x + 5x + 25 + y² − 2y − 2y + 4 = 81. Combining like terms on the left-hand side of this equation yields x² + y² + 10x − 4y + 29 = 81. Subtracting 81 from both sides of this equation yields x² + y² + 10x − 4y − 52 = 0, which is equivalent to x² + y² + 10x + (−4)y + (−52) = 0. This equation is in the form x² + y² + ax + by + c = 0. Therefore, the value of c is −52."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "medium", "type": "fr",
    "text": "The number of radians in a 720-degree angle can be written as aπ, where a is a constant. What is the value of a?",
    "answer": 4,
    "explanation": "The correct answer is 4. There are π radians in a 180° angle. An angle measure of 720° is 4 times greater than an angle measure of 180°. Therefore, the number of radians in a 720° angle is 4π."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "medium", "type": "mc",
    "text": "<svg viewBox=\"0 0 240 210\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"20\" y1=\"120\" x2=\"215\" y2=\"120\" stroke=\"currentColor\" stroke-width=\"1.3\"/><polygon points=\"205,116 205,124 213,120\" fill=\"currentColor\"/><text x=\"220\" y=\"124\" font-size=\"12\" fill=\"currentColor\">x</text><line x1=\"120\" y1=\"20\" x2=\"120\" y2=\"120\" stroke=\"currentColor\" stroke-width=\"1.3\"/><polygon points=\"116,28 124,28 120,20\" fill=\"currentColor\"/><text x=\"126\" y=\"18\" font-size=\"12\" fill=\"currentColor\">y</text><circle cx=\"120\" cy=\"120\" r=\"75\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"120\" y1=\"120\" x2=\"185\" y2=\"82.5\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"120\" y1=\"120\" x2=\"55\" y2=\"82.5\" stroke=\"currentColor\" stroke-width=\"1.3\"/><circle cx=\"120\" cy=\"120\" r=\"2\" fill=\"currentColor\"/><text x=\"126\" y=\"116\" font-size=\"11\" fill=\"currentColor\">O</text><text x=\"45\" y=\"140\" font-size=\"11\" text-anchor=\"middle\" fill=\"currentColor\">T(−1, 0)</text><text x=\"195\" y=\"140\" font-size=\"11\" text-anchor=\"middle\" fill=\"currentColor\">P(1, 0)</text><text x=\"40\" y=\"78\" font-size=\"13\" fill=\"currentColor\">R</text><text x=\"200\" y=\"78\" font-size=\"13\" fill=\"currentColor\">Q</text></svg>In the xy-plane above, points P, Q, R, and T lie on the circle with center O. The degree measures of angles POQ and ROT are each 30°. What is the radian measure of angle QOR?",
    "choices": ["5π/6", "3π/4", "2π/3", "π/3"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. This results from subtracting only angle POQ from 180°, not both given 30° angles.",
      "Incorrect. This doesn't match the 120° that remains once both 30° angles are subtracted from the straight 180° angle formed by T, O, and P.",
      "Correct. Since T, O, and P lie on a line, angle QOR = 180° − 30° − 30° = 120° = 2π/3 radians.",
      "Incorrect. This equals the sum of angles POQ and ROT converted to radians, not the angle QOR itself."
    ],
    "explanation": "Choice C is correct. Because points T, O, and P all lie on the x-axis, they form a line. Since the angles on a line add up to 180°, and it's given that angles POQ and ROT each measure 30°, it follows that the measure of angle QOR is 180° − 30° − 30° = 120°. Since the arc of a complete circle is 360° or 2π radians, a proportion can be set up to convert the measure of angle QOR from degrees to radians: (360 degrees)/(2π radians) = (120 degrees)/(x radians), where x is the radian measure of angle QOR. Multiplying each side of the proportion by 2πx gives 360x = 240π. Solving for x gives x = (240/360)π, or (2/3)π.<br><br>Choice A is incorrect and may result from subtracting only angle POQ from 180° to get a value of 150° and then finding the radian measure equivalent to that value. Choice B is incorrect and may result from a calculation error. Choice D is incorrect and may result from calculating the sum of the angle measures, in radians, of angles POQ and ROT."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "hard", "type": "mc",
    "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">(x − 6)² + (y + 5)² = 16</div>In the xy-plane, the graph of the equation above is a circle. Point P is on the circle and has coordinates (10, −5). If PQ is a diameter of the circle, what are the coordinates of point Q?",
    "choices": ["(2, −5)", "(6, −1)", "(6, −5)", "(6, −9)"],
    "correct": 0,
    "choiceNotes": [
      "Correct. The center (6, −5) is the midpoint of diameter PQ; since P is (10, −5), Q must be (2, −5) so the midpoint of P and Q is (6, −5).",
      "Incorrect. This point lies on a diameter perpendicular to PQ, not on PQ itself.",
      "Incorrect. This is the center of the circle, not a point on it.",
      "Incorrect. This point lies on a diameter perpendicular to PQ, not on PQ itself."
    ],
    "explanation": "Choice A is correct. The standard form for the equation of a circle is (x − h)² + (y − k)² = r², where (h, k) are the coordinates of the center and r is the length of the radius. According to the given equation, the center of the circle is (6, −5). Let (x1, y1) represent the coordinates of point Q. Since point P (10, −5) and point Q (x1, y1) are the endpoints of a diameter of the circle, the center (6, −5) lies on the diameter, halfway between P and Q. Therefore, the following relationships hold: (x1 + 10)/2 = 6 and (y1 + (−5))/2 = −5. Solving for x1 and y1, respectively, yields x1 = 2 and y1 = −5. Therefore, the coordinates of point Q are (2, −5).<br><br>Alternate approach: Since point P (10, −5) on the circle and the center of the circle (6, −5) have the same y-coordinate, it follows that the radius of the circle is 10 − 6 = 4. In addition, the opposite end of the diameter PQ must have the same y-coordinate as P and be 4 units away from the center. Hence, the coordinates of point Q must be (2, −5).<br><br>Choices B and D are incorrect because the points given in these choices lie on a diameter that is perpendicular to the diameter PQ. If either of these points were point Q, then PQ would not be the diameter of the circle. Choice C is incorrect because (6, −5) is the center of the circle and does not lie on the circle."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "hard", "type": "mc",
    "text": "In the xy-plane, the graph of 2x² − 6x + 2y² + 2y = 45 is a circle. What is the radius of the circle?",
    "choices": ["5", "6.5", "√40", "√50"],
    "correct": 0,
    "choiceNotes": [
      "Correct. Dividing by 2 and completing the square gives (x − 1.5)² + (y + 0.5)² = 25 = 5², so the radius is 5.",
      "Incorrect. This isn't a value that results from correctly completing the square on this equation.",
      "Incorrect. This is √40, not the actual r² = 25 found by completing the square.",
      "Incorrect. This is √50, not the actual r² = 25 found by completing the square."
    ],
    "explanation": "Choice A is correct. One way to find the radius of the circle is to rewrite the given equation in standard form, (x − h)² + (y − k)² = r², where (h, k) is the center of the circle and the radius of the circle is r. To do this, divide the original equation, 2x² − 6x + 2y² + 2y = 45, by 2 to make the leading coefficients of x² and y² each equal to 1: x² − 3x + y² + y = 22.5. Then complete the square to put the equation in standard form. To do so, first rewrite x² − 3x + y² + y = 22.5 as (x² − 3x + 2.25) − 2.25 + (y² + y + 0.25) − 0.25 = 22.5. Second, add 2.25 and 0.25 to both sides of the equation: (x² − 3x + 2.25) + (y² + y + 0.25) = 25. Since x² − 3x + 2.25 = (x − 1.5)², and y² + y + 0.25 = (y + 0.5)², and 25 = 5², it follows that (x − 1.5)² + (y + 0.5)² = 5². Therefore, the radius of the circle is 5.<br><br>Choices B, C, and D are incorrect and may be the result of errors in manipulating the equation or of a misconception about the standard form of the equation of a circle in the xy-plane."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "hard", "type": "fr",
    "text": "The equation (x + 6)² + (y + 3)² = 121 defines a circle in the xy-plane. What is the radius of the circle?",
    "answer": 11,
    "explanation": "The correct answer is 11. A circle with equation (x − a)² + (y − b)² = r², where a, b, and r are constants, has center (a, b) and radius r. Therefore, the radius of the given circle is √121, or 11."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "hard", "type": "mc",
    "text": "A circle in the xy-plane has equation (x + 3)² + (y − 1)² = 25. Which of the following points does NOT lie in the interior of the circle?",
    "choices": ["(−7, 3)", "(−3, 1)", "(0, 0)", "(3, 2)"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. The distance from this point to the center (−3, 1) is √20, which is less than the radius 5, so it does lie in the interior.",
      "Incorrect. This is the center of the circle itself, which lies in the interior.",
      "Incorrect. The distance from this point to the center is √8, less than the radius 5, so it lies in the interior.",
      "Correct. The distance from (3, 2) to the center (−3, 1) is √37, which is greater than the radius 5, so this point lies outside the circle."
    ],
    "explanation": "Choice D is correct. The circle with equation (x + 3)² + (y − 1)² = 25 has center (−3, 1) and radius 5. For a point to be inside of the circle, the distance from that point to the center must be less than the radius, 5. The distance between (3, 2) and (−3, 1) is √((−3 − 3)² + (1 − 2)²) = √((−6)² + (−1)²) = √37, which is greater than 5. Therefore, (3, 2) does NOT lie in the interior of the circle.<br><br>Choice A is incorrect. The distance between (−7, 3) and (−3, 1) is √((−7 + 3)² + (3 − 1)²) = √((−4)² + (2)²) = √20, which is less than 5, and therefore (−7, 3) lies in the interior of the circle. Choice B is incorrect because it is the center of the circle. Choice C is incorrect because the distance between (0, 0) and (−3, 1) is √((0 + 3)² + (0 − 1)²) = √((3)² + (1)²) = √8, which is less than 5, and therefore (0, 0) lies in the interior of the circle."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "hard", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 200\" class=\"dx-fig\" style=\"color:var(--text);\"><circle cx=\"100\" cy=\"100\" r=\"75\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"100\" y1=\"100\" x2=\"100\" y2=\"25\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"100\" y1=\"100\" x2=\"165\" y2=\"145\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"100\" y1=\"100\" x2=\"25\" y2=\"100\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"150\" y1=\"55\" x2=\"165\" y2=\"145\" stroke=\"currentColor\" stroke-width=\"1.3\"/><circle cx=\"100\" cy=\"100\" r=\"2\" fill=\"currentColor\"/><text x=\"106\" y=\"70\" font-size=\"11\" fill=\"currentColor\">x°</text><text x=\"94\" y=\"18\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"156\" y=\"50\" font-size=\"13\" fill=\"currentColor\">D</text><text x=\"170\" y=\"156\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"10\" y=\"104\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"80\" y=\"98\" font-size=\"11\" fill=\"currentColor\">O</text></svg>The circle above has center O, the length of arc ADC is 5π, and x = 100. What is the length of arc ABC?",
    "choices": ["9π", "13π", "18π", "13π/2"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This is half the circle's circumference, but arc ABC is more than half the circle.",
      "Correct. Since arc ADC corresponds to a 100° central angle, arc ABC corresponds to the remaining 260°; setting up s/5π = 260/100 gives s = 13π.",
      "Incorrect. This equals the entire circumference of the circle, not just arc ABC.",
      "Incorrect. This is half of the correct arc length, 13π."
    ],
    "explanation": "Choice B is correct. The ratio of the lengths of two arcs of a circle is equal to the ratio of the measures of the central angles that subtend the arcs. It's given that arc ADC is subtended by a central angle with measure 100°. Since the sum of the measures of the angles about a point is 360°, it follows that arc ABC is subtended by a central angle with measure 360° − 100° = 260°. If s is the length of arc ABC, then s must satisfy the ratio s/5π = 260/100. Reducing the fraction 260/100 to its simplest form gives 13/5. Therefore, s/5π = 13/5. Multiplying both sides of s/5π = 13/5 by 5π yields s = 13π.<br><br>Choice A is incorrect. This is the length of an arc consisting of exactly half of the circle, but arc ABC is greater than half of the circle. Choice C is incorrect. This is the total circumference of the circle. Choice D is incorrect. This is half the length of arc ABC, not its full length."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "hard", "type": "mc",
    "text": "A circle has center O, and points A and B lie on the circle. The measure of arc AB is 45° and the length of arc AB is 3 inches. What is the circumference, in inches, of the circle?",
    "choices": ["3", "6", "9", "24"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. This is just the length of arc AB itself, not the full circumference.",
      "Incorrect. This results from doubling the arc length rather than scaling by the correct 360°/45° ratio.",
      "Incorrect. This results from squaring the arc length rather than correctly solving the proportion.",
      "Correct. Setting up 45/360 = 3/x and solving gives x = 24 inches."
    ],
    "explanation": "Choice D is correct. It's given that the measure of arc AB is 45° and the length of arc AB is 3 inches. The arc measure of the full circle is 360°. If x represents the circumference, in inches, of the circle, it follows that 45/360 = 3/x. This equation is equivalent to 45/360 = 3/x, or 1/8 = 3/x. Multiplying both sides of this equation by 8x yields 1(x) = 3(8), or x = 24. Therefore, the circumference of the circle is 24 inches.<br><br>Choice A is incorrect. This is the length of arc AB. Choice B is incorrect and may result from multiplying the length of arc AB by 2. Choice C is incorrect and may result from squaring the length of arc AB."},

  {"domain": "Geometry & Trigonometry", "skill": "Circles", "difficulty": "hard", "type": "fr",
    "text": "Points A and B lie on a circle with radius 1, and arc AB has length π/3. What fraction of the circumference of the circle is the length of arc AB? (Enter your answer as a decimal, e.g. 0.1667.)",
    "answer": 0.1667,
    "explanation": "The correct answer is 1/6 (enter as 0.1667). The circumference, C, of a circle is C = 2πr, where r is the length of the radius of the circle. For the given circle with a radius of 1, the circumference is C = 2(π)(1), or C = 2π. To find what fraction of the circumference the length of arc AB is, divide the length of the arc by the circumference, which gives (π/3) ÷ 2π. This division can be represented by (π/3) · (1/2π) = 1/6. Note that 1/6, 0.1666, 0.1667, 0.166, and 0.167 are examples of ways this answer could be entered on a numeric-entry question; on this platform, enter the decimal form 0.1667."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "easy", "type": "mc",
    "text": "At a large high school, 300 students were selected at random and were asked in a survey about a menu change in the school cafeteria. All 300 students completed the survey. It was estimated that 38% of the students were in support of a menu change, with a margin of error of 5.5%. Which of the following is the best interpretation of the survey results?",
    "choices": ["The percent of the students at the school who support a menu change is 38%.", "The percent of the students at the school who support a menu change is greater than 38%.", "Plausible values of the percent of the students at the school who support a menu change are between 32.5% and 43.5%.", "Plausible values of the number of the students at the school who support a menu change are between 295 and 305."],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. This is the percent of the sampled students who support a menu change, not an interval accounting for the margin of error.",
      "Incorrect. The margin of error doesn't indicate the true percent is higher — it gives a plausible range on both sides of the estimate.",
      "Correct. Subtracting and adding the 5.5% margin of error to the 38% estimate gives the plausible range 32.5% to 43.5%.",
      "Incorrect. This misinterprets the margin of error as being about the count of students in the sample rather than the percent across the whole school."
    ],
    "explanation": "Choice C is correct. It's given that an estimated 38% of sampled students at the school were in support of a menu change, with a margin of error of 5.5%. It follows that the percent of the students at the school who support a menu change is 38% plus or minus 5.5%. The lower bound of this estimation is 38 − 5.5, or 32.5%. The upper bound of this estimation is 38 + 5.5, or 43.5%. Therefore, plausible values of the percent of the students at the school who support a menu change are between 32.5% and 43.5%.<br><br>Choice A is incorrect. This is the percent of the sampled students at the school who support a menu change. Choices B and D are incorrect and may result from misinterpreting the margin of error."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "hard", "type": "mc",
    "text": "<table class=\"dx-table\"><tr><th>Sample</th><th>Percent in favor</th><th>Margin of error</th></tr><tr><td>A</td><td>52%</td><td>4.2%</td></tr><tr><td>B</td><td>48%</td><td>1.6%</td></tr></table>The results of two random samples of votes for a proposition are shown above. The samples were selected from the same population, and the margins of error were calculated using the same method. Which of the following is the most appropriate reason that the margin of error for sample A is greater than the margin of error for sample B?",
    "choices": ["Sample A had a smaller number of votes that could not be recorded.", "Sample A had a higher percent of favorable responses.", "Sample A had a larger sample size.", "Sample A had a smaller sample size."],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. The margin of error depends on the size of the sample of recorded votes, not the number of votes that couldn't be recorded; this would tend to decrease, not increase, sample A's margin of error.",
      "Incorrect. Since sample A's percent in favor (52%) and sample B's (48%) are the same distance from 50%, the percent of favorable responses doesn't explain the difference in margin of error.",
      "Incorrect. A larger sample size would tend to decrease, not increase, the margin of error, so this doesn't explain why sample A's margin of error is greater.",
      "Correct. A smaller sample size increases the margin of error because the sample may be less representative of the whole population."
    ],
    "explanation": "Choice D is correct. Sample size is an appropriate reason for the margin of error to change. In general, a smaller sample size increases the margin of error because the sample may be less representative of the whole population.<br><br>Choice A is incorrect. The margin of error will depend on the size of the sample of recorded votes, not the number of votes that could not be recorded. In any case, the smaller number of votes that could not be recorded for sample A would tend to decrease, not increase, the comparative size of the margin of error. Choice B is incorrect. Since the percent in favor for sample A is the same distance from 50% as the percent in favor for sample B, the percent of favorable responses doesn't affect the comparative size of the margin of error for the two samples. Choice C is incorrect. If sample A had a larger margin of error than sample B, then sample A would tend to be less representative of the population. Therefore, sample A is not likely to have a larger sample size."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "medium", "type": "mc",
    "text": "A study was done on the weights of different types of fish in a pond. A random sample of fish were caught and marked in order to ensure that none were weighed more than once. The sample contained 150 largemouth bass, of which 30% weighed more than 2 pounds. Which of the following conclusions is best supported by the sample data?",
    "choices": ["The majority of all fish in the pond weigh less than 2 pounds.", "The average weight of all fish in the pond is approximately 2 pounds.", "Approximately 30% of all fish in the pond weigh more than 2 pounds.", "Approximately 30% of all largemouth bass in the pond weigh more than 2 pounds."],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. The sample only included largemouth bass, so this conclusion about all fish in the pond goes beyond what the data supports.",
      "Incorrect. The sample gives information about weight thresholds for largemouth bass specifically, not an average weight for all fish.",
      "Incorrect. This generalizes the largemouth-bass-only sample result to all fish in the pond, which isn't supported.",
      "Correct. The sample of 150 largemouth bass was selected at random from all largemouth bass in the pond, so the 30% result generalizes only to largemouth bass."
    ],
    "explanation": "Choice D is correct. The sample of 150 largemouth bass was selected at random from all the largemouth bass in the pond, and since 30% of the fish in the sample weighed more than 2 pounds, it can be concluded that approximately 30% of all largemouth bass in the pond weigh more than 2 pounds.<br><br>Choices A, B, and C are incorrect. Since the sample contained 150 largemouth bass, of which 30% weighed more than 2 pounds, this result can be generalized only to largemouth bass in the pond, not to all fish in the pond."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "easy", "type": "mc",
    "text": "In a study, the data from a random sample of a population had a mean of 37, with an associated margin of error of 3. Which of the following is the most appropriate conclusion that can be made about the population mean?",
    "choices": ["It is less than 37.", "It is greater than 37.", "It is between 34 and 40.", "It is less than 34 or greater than 40."],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. While 37 − 3 = 34 is an appropriate lower bound, it isn't appropriate to conclude the population mean is below 37 outright.",
      "Incorrect. While 37 + 3 = 40 is an appropriate upper bound, it isn't appropriate to conclude the population mean is above 37 outright.",
      "Correct. The most appropriate conclusion is that the population mean falls between 37 − 3 = 34 and 37 + 3 = 40.",
      "Incorrect. It isn't an appropriate conclusion that the population mean is outside the 34-to-40 interval."
    ],
    "explanation": "Choice C is correct. It's given that the mean of the data from a random sample of a population is 37, with an associated margin of error of 3. The most appropriate conclusion that can be made is that the mean of the entire population will fall between 37, plus or minus 3. Therefore, the population mean is between 37 − 3 = 34 and 37 + 3 = 40.<br><br>Choice A is incorrect. While it's an appropriate conclusion that the population mean is as low as 37 − 3, or 34, it isn't appropriate to conclude that the population mean is less than 34. Choice B is incorrect. While it's an appropriate conclusion that the population mean is as high as 37 + 3, or 40, it isn't appropriate to conclude that the population mean is greater than 40. Choice D is incorrect. It isn't an appropriate conclusion that the population mean is less than 34 or greater than 40."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "hard", "type": "mc",
    "text": "<table class=\"dx-table\"><tr><th rowspan=\"2\">Texting behavior</th><th colspan=\"2\">Talks on cell phone</th></tr><tr><th>Daily</th><th>Not daily</th></tr><tr><td>Light</td><td>110</td><td>146</td></tr><tr><td>Medium</td><td>139</td><td>164</td></tr><tr><td>Heavy</td><td>166</td><td>74</td></tr><tr><td><b>Total</b></td><td><b>415</b></td><td><b>384</b></td></tr></table>In a study of cell phone use, 799 randomly selected US teens were asked how often they talked on a cell phone and about their texting behavior. The data are summarized in the table above. Based on the data from the study, an estimate of the percent of US teens who are heavy texters is 30% and the associated margin of error is 3%. Which of the following is a correct statement based on the given margin of error?",
    "choices": ["Approximately 3% of the teens in the study who are classified as heavy texters are not really heavy texters.", "It is not possible that the percent of all US teens who are heavy texters is less than 27%.", "The percent of all US teens who are heavy texters is 33%.", "It is doubtful that the percent of all US teens who are heavy texters is 35%."],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. The margin of error doesn't provide any information about the accuracy of classifying individual respondents as heavy texters.",
      "Incorrect. It's unlikely, but not impossible, that the true percent of all US teens who are heavy texters is less than 27%.",
      "Incorrect. While the percent is likely between 27% and 33%, any single value in that interval, including 33%, is equally plausible — it isn't certain to be exactly 33%.",
      "Correct. The 3% margin of error means the true percent is likely between 27% and 33%, so it's doubtful the true percent is as high as 35%, which falls outside that interval."
    ],
    "explanation": "Choice D is correct. The given margin of error of 3% indicates that the actual percent of all US teens who are heavy texters is likely within 3% of the estimate of 30%, or between 27% and 33%. Therefore, it is unlikely, or doubtful, that the percent of all US teens who are heavy texters would be 35%.<br><br>Choice A is incorrect. The margin of error doesn't provide any information about the accuracy of reporting in the study. Choice B is incorrect. Based on the estimate and given margin of error, it is unlikely that the percent of all US teens who are heavy texters would be less than 27%, but it is possible. Choice C is incorrect. While the percent of all US teens who are heavy texters is likely between 27% and 33%, any value within this interval is equally likely. We can't be certain that the value is exactly 33%."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "easy", "type": "mc",
    "text": "Scott selected 20 employees at random from all 400 employees at a company. He found that 16 of the employees in this sample are enrolled in exactly three professional development courses this year. Based on Scott's findings, which of the following is the best estimate of the number of employees at the company who are enrolled in exactly three professional development courses this year?",
    "choices": ["4", "320", "380", "384"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This is the number of employees from the sample who aren't enrolled in exactly three professional development courses this year.",
      "Correct. Since 16/20 = 80% of the sample is enrolled, applying 80% to the 400 total employees gives 320.",
      "Incorrect. This is the number of employees who weren't selected for the sample, not the estimate of how many are enrolled.",
      "Incorrect and may result from conceptual or calculation errors."
    ],
    "explanation": "Choice B is correct. It's given that from the sample of 20 employees at the company, 16 of the employees are enrolled in exactly three professional development courses this year. Since 16/20 is equal to 0.80, or 80/100, it follows that 80% of the employees in the sample are enrolled in exactly three professional development courses this year. Therefore, the best estimate for the percentage of employees at the company who are enrolled in exactly three professional development courses this year is 80%. It's given that there are a total of 400 employees at the company. Therefore, the best estimate of the number of employees at the company who are enrolled in exactly three professional development courses this year is (80/100)(400), or 320.<br><br>Choice A is incorrect. This is the number of employees from the sample who aren't enrolled in exactly three professional development courses this year. Choice C is incorrect. This is the number of employees who weren't selected for the sample. Choice D is incorrect and may result from conceptual or calculation errors."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "medium", "type": "mc",
    "text": "A store manager reviewed the receipts from 80 customers who were selected at random from all the customers who made purchases last Thursday. Of those selected, 20 receipts showed that the customer had purchased fruit. If 1,500 customers made purchases last Thursday, which of the following is the most appropriate conclusion?",
    "choices": ["Exactly 75 customers must have purchased fruit last Thursday.", "Exactly 375 customers must have purchased fruit last Thursday.", "The best estimate for the number of customers who purchased fruit last Thursday is 75.", "The best estimate for the number of customers who purchased fruit last Thursday is 375."],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. An exact number can't be known from a random sample, and this value results from a calculation error besides.",
      "Incorrect. An exact number can't be known from taking a random selection — only an estimate can be made.",
      "Incorrect. This results from a calculation error — the fraction 20/80 = 1/4 applied to 1,500 gives 375, not 75.",
      "Correct. The sample fraction 20/80 = 1/4 applied to the total of 1,500 customers gives (1/4)(1,500) = 375."
    ],
    "explanation": "Choice D is correct. It's given that the manager took a random selection of the receipts of 80 customers from a total of 1,500. It's also given that of those 80 receipts, 20 showed that the customer had purchased fruit. This means that an appropriate estimate of the fraction of customers who purchased fruit is 20/80, or 1/4. Multiplying this fraction by the total number of customers yields (1/4)(1,500) = 375. Therefore, the best estimate for the number of customers who purchased fruit is 375.<br><br>Choices A and B are incorrect because an exact number of customers can't be known from taking a random selection. Additionally, choice A may also be the result of a calculation error. Choice C is incorrect and may result from a calculation error."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "easy", "type": "mc",
    "text": "A city has 50 city council members. A reporter polled a random sample of 20 city council members and found that 6 of those polled supported a specific bill. Based on the sample, which of the following is the best estimate of the number of city council members in the city who support the bill?",
    "choices": ["6", "9", "15", "30"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. This is the number of city council members in the sample who supported the bill, not the estimate for the full council.",
      "Incorrect. This doesn't match the estimate produced by scaling the sample proportion up to the full council of 50.",
      "Correct. The sample proportion 6/20 = 30% applied to all 50 council members gives 50 × 0.3 = 15.",
      "Incorrect. This is the number of city council members who weren't polled, not the estimate of supporters."
    ],
    "explanation": "Choice C is correct. Because a random sample of the city council was polled, the proportion of the sample who supported the bill is expected to be approximately equal to the proportion of the total city council who supports the bill. Since 6 of the 20 polled, or 30%, supported the bill, it can be estimated that 50 × 0.3, or 15, city council members support the bill.<br><br>Choice A is incorrect. This is the number of city council members in the sample who supported the bill. Choice B is incorrect and may result from a computational error. Choice D is incorrect. This is the number of city council members in the sample of city council members who were not polled."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "hard", "type": "mc",
    "text": "In State X, Mr. Camp's eighth-grade class consisting of 26 students was surveyed and 34.6 percent of the students reported that they had at least two siblings. The average eighth-grade class size in the state is 26. If the students in Mr. Camp's class are representative of students in the state's eighth-grade classes and there are 1,800 eighth-grade classes in the state, which of the following best estimates the number of eighth-grade students in the state who have fewer than two siblings?",
    "choices": ["16,200", "23,400", "30,600", "46,800"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. This is the best estimate for the number of students who have at least, not fewer than, two siblings.",
      "Incorrect. This is half of the estimated total number of eighth-grade students in the state, but more than half of the students actually have fewer than two siblings.",
      "Correct. Since 34.6% of 26 is about 9 students with at least two siblings, about 17 students per class have fewer than two siblings; 17 × 1,800 = 30,600.",
      "Incorrect. This is the estimated total number of eighth-grade students in the state, not the number with fewer than two siblings."
    ],
    "explanation": "Choice C is correct. It is given that 34.6% of 26 students in Mr. Camp's class reported that they had at least two siblings. Since 34.6% of 26 is 8.996, there must have been 9 students in the class who reported having at least two siblings and 17 students who reported that they had fewer than two siblings. It is also given that the average eighth-grade class size in the state is 26 and that Mr. Camp's class is representative of all eighth-grade classes in the state. This means that in each eighth-grade class in the state there are about 17 students who have fewer than two siblings. Therefore, the best estimate of the number of eighth-grade students in the state who have fewer than two siblings is 17 × (number of eighth-grade classes in the state), or 17 × 1,800 = 30,600.<br><br>Choice A is incorrect because 16,200 is the best estimate for the number of eighth-grade students in the state who have at least, not fewer than, two siblings. Choice B is incorrect because 23,400 is half of the estimated total number of eighth-grade students in the state; however, since the students in Mr. Camp's class are representative of students in the eighth-grade classes in the state and more than half of the students in Mr. Camp's class have fewer than two siblings, more than half of the students in each eighth-grade class in the state have fewer than two siblings, too. Choice D is incorrect because 46,800 is the estimated total number of eighth-grade students in the state."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "medium", "type": "fr",
    "text": "<table class=\"dx-table\"><tr><th></th><th>Plan to vote for Candidate A</th><th>Plan to vote for Candidate B</th></tr><tr><td>Female</td><td>202</td><td>20</td></tr><tr><td>Male</td><td>34</td><td>144</td></tr></table>A random sample of 400 town voters were asked if they plan to vote for Candidate A or Candidate B for mayor. The results were sorted by gender and are shown in the table above. The town has a total of 6,000 voters. Based on the table, what is the best estimate of the number of voters who plan to vote for Candidate A?",
    "answer": 3540,
    "explanation": "The correct answer is 3,540. According to the table, of 400 voters randomly sampled, the total number of men and women who plan to vote for Candidate A is 202 + 34 = 236. The best estimate of the total number of voters in the town who plan to vote for Candidate A is the fraction of voters in the sample who plan to vote for Candidate A, 236/400, multiplied by the total voter population of 6,000. Therefore, the answer is (236/400)(6,000) = 3,540."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "hard", "type": "fr",
    "text": "<table class=\"dx-table\"><tr><th colspan=\"2\">Views on Nuclear Energy Use</th></tr><tr><th>Response</th><th>Frequency</th></tr><tr><td>Strongly favor</td><td>56</td></tr><tr><td>Somewhat favor</td><td>214</td></tr><tr><td>Somewhat oppose</td><td>104</td></tr><tr><td>Strongly oppose</td><td>37</td></tr></table>A researcher interviewed 411 randomly selected US residents and asked about their views on the use of nuclear energy. The table above summarizes the responses of the interviewees. If the population of the United States was 300 million when the survey was given, based on the sample data for the 411 US residents, what is the best estimate, in millions, of the difference between the number of US residents who somewhat favor or strongly favor the use of nuclear energy and the number of those who somewhat oppose or strongly oppose it? (Round your answer to the nearest whole number.)",
    "answer": 94,
    "explanation": "The correct answer is 94. Of those interviewed, 56 + 214 = 270 \"strongly favor\" or \"somewhat favor\" the use of nuclear energy, and 104 + 37 = 141 interviewees \"somewhat oppose\" or \"strongly oppose\" the use of nuclear energy. The difference between the sizes of the two surveyed groups is 270 − 141 = 129. The proportion of this difference among the entire group of interviewees is 129/411. Because the sample of interviewees was selected at random from US residents, it is reasonable to assume that the proportion of this difference is the same among all US residents as in the sample. Therefore, the best estimate, in millions, of the difference between the number of US residents who somewhat favor or strongly favor the use of nuclear energy and the number of those who somewhat oppose or strongly oppose it is (129/411) × 300, which to the nearest million is 94."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "medium", "type": "mc",
    "text": "A sample consisting of 720 adults who own televisions was selected at random for a study. Based on the sample, it is estimated that 32% of all adults who own televisions use their televisions to watch nature shows, with an associated margin of error of 3.41%. Which of the following is the most plausible conclusion about all adults who own televisions?",
    "choices": ["More than 35.41% of all adults who own televisions use their televisions to watch nature shows.", "Between 28.59% and 35.41% of all adults who own televisions use their televisions to watch nature shows.", "Since the sample included adults who own televisions and not just those who use their televisions to watch nature shows, no conclusion can be made.", "Since the sample did not include all the people who watch nature shows, no conclusion can be made."],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. There's no basis for concluding the true percent exceeds the upper bound of the plausible interval.",
      "Correct. Subtracting and adding the 3.41% margin of error to the 32% estimate gives the plausible interval 28.59% to 35.41%.",
      "Incorrect. The sample was selected at random from all adults who own televisions, which is exactly the population being generalized to, so a conclusion can be made.",
      "Incorrect. The sample doesn't need to include everyone who watches nature shows — it needs to be a random sample of the population being generalized to, which it is."
    ],
    "explanation": "Choice B is correct. It's given that based on a sample selected at random, it's estimated that 32% of all adults who own televisions use their televisions to watch nature shows, with an associated margin of error of 3.41%. Subtracting the margin of error from the estimate and adding the margin of error to the estimate gives an interval of plausible values for the true percentage of adults who own televisions who use their televisions to watch nature shows. This means it's plausible that between 32% − 3.41%, or 28.59%, and 32% + 3.41%, or 35.41%, of all adults who own televisions use their televisions to watch nature shows. Therefore, of the given choices, the most plausible conclusion is that between 28.59% and 35.41% of all adults who own televisions use their televisions to watch nature shows.<br><br>Choice A is incorrect and may result from conceptual errors. Choice C is incorrect. To make a plausible conclusion about all adults who own televisions, the sample must be selected at random from all adults who own televisions, not just those who use their televisions to watch nature shows. Choice D is incorrect. Since the sample was selected at random from all adults who own televisions, a plausible conclusion can be made about all adults who own televisions."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "easy", "type": "mc",
    "text": "A random sample of 50 people from a town with a population of 14,878 were asked to name their favorite flavor of ice cream. If 7 people in the sample named chocolate as their favorite ice-cream flavor, about how many people in the town would be expected to name chocolate?",
    "choices": ["350", "2,100", "7,500", "10,500"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This is far too small compared to the proportional estimate produced by scaling the sample up to the full town population.",
      "Correct. Setting up 7/50 = x/14,878 and solving gives x ≈ 2,083, and 2,100 is the closest choice to that value.",
      "Incorrect. This overshoots the proportional estimate substantially — check the proportion setup.",
      "Incorrect. This overshoots the proportional estimate substantially — check the proportion setup."
    ],
    "explanation": "Choice B is correct. Let x be the number of people in the entire town that would be expected to name chocolate. Since the sample of 50 people was selected at random, it is reasonable to expect that the proportion of people who named chocolate as their favorite ice-cream flavor would be the same for both the sample and the town population. Symbolically, this can be expressed as 7/50 = x/14,878. Using cross multiplication, 7 × 14,878 = x × 50; solving for x yields 2,083. The choice closest to the value of 2,083 is choice B, 2,100.<br><br>Choices A, C, and D are incorrect and may be the result of errors when setting up the proportion, solving for the unknown, or incorrectly comparing the choices to the number of people expected to name chocolate, 2,083."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "easy", "type": "mc",
    "text": "A certain forest is 253 acres. To estimate the number of trees in the forest, a ranger randomly selects 5 different 1-acre parcels in the forest and determines the number of trees in each parcel. The numbers of trees in the sample acres are 51, 59, 45, 52, and 73. Based on the mean of the sample, which of the following ranges contains the best estimate for the number of trees in the entire forest?",
    "choices": ["11,000 to 12,000", "12,500 to 13,500", "13,500 to 14,500", "18,000 to 19,000"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. This results from multiplying the minimum number of trees per acre in the sample, 45, by the 253 acres, not the mean.",
      "Incorrect. This results from multiplying the median number of trees per acre in the sample, 52, by the 253 acres, not the mean.",
      "Correct. The mean of the 5 sample acres is (51+59+45+52+73)/5 = 56 trees per acre; 56 × 253 = 14,168, which falls in this range.",
      "Incorrect. This results from multiplying the maximum number of trees per acre in the sample, 73, by the 253 acres, not the mean."
    ],
    "explanation": "Choice C is correct. The mean of the 5 samples is (51+59+45+52+73)/5 = 56 trees per acre. The best estimate for the total number of trees in the forest is the product of the mean number of trees per acre in the sample and the total number of acres in the forest. This is (56)(253) = 14,168, which is between 13,500 and 14,500.<br><br>Choice A is incorrect and may result from multiplying the minimum number of trees per acre in the sample, 45, by the number of acres, 253. Choice B is incorrect and may result from multiplying the median number of trees per acre in the sample, 52, by the number of acres, 253. Choice D is incorrect and may result from multiplying the maximum number of trees per acre in the sample, 73, by the number of acres, 253."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "medium", "type": "mc",
    "text": "A park ranger asked a random sample of visitors how far they hiked during their visit. Based on the responses, the estimated mean was found to be 4.5 miles, with an associated margin of error of 0.5 miles. Which of the following is the best conclusion from these data?",
    "choices": ["It is likely that all visitors hiked between 4 and 5 miles.", "It is likely that most visitors hiked exactly 4.5 miles.", "It is not possible that any visitor hiked less than 3 miles.", "It is plausible that the mean distance hiked for all visitors is between 4 and 5 miles."],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. The margin of error applies to the estimate of the mean, not to a claim that every single visitor's distance falls in that range.",
      "Incorrect. The margin of error says nothing about how many visitors hiked exactly the mean distance.",
      "Incorrect. The data give no information ruling out any individual visitor's distance, only a plausible range for the mean.",
      "Correct. The margin of error means the population mean plausibly lies between 4.5 − 0.5 = 4 and 4.5 + 0.5 = 5 miles."
    ],
    "explanation": "Choice D is correct. The given estimated mean has an associated margin of error because from sample data, the population mean can't be determined precisely. Rather, from the sample mean, an interval can be determined within which it's plausible that the population's mean is likely to lie. Since the estimated mean is 4.5 miles with an associated margin of error of 0.5 miles, it follows that between 4.5 − 0.5 miles and 4.5 + 0.5 miles, or between 4 and 5 miles, is plausibly the mean distance hiked for all visitors.<br><br>Choices A, B, and C are incorrect. Based on the estimated mean, no determination can be made about the number of miles hiked for all visitors."},

  {"domain": "Problem-Solving & Data Analysis", "skill": "Sample Statistics and Margin of Error", "difficulty": "medium", "type": "mc",
    "text": "A bag containing 10,000 beads of assorted colors is purchased from a craft store. To estimate the percent of red beads in the bag, a sample of beads is selected at random. The percent of red beads in the bag was estimated to be 15%, with an associated margin of error of 2%. If r is the actual number of red beads in the bag, which of the following is most plausible?",
    "choices": ["r > 1,700", "1,300 < r < 1,700", "200 < r < 1,500", "r < 1,300"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. It's unlikely that the actual number of red beads exceeds the upper bound of the plausible interval.",
      "Correct. 15% of 10,000 is 1,500 estimated red beads; the 2% margin of error corresponds to 200 beads, giving a plausible interval of 1,500 − 200 = 1,300 to 1,500 + 200 = 1,700.",
      "Incorrect. This interval doesn't correctly reflect adding and subtracting the margin of error from the estimate of 1,500 red beads.",
      "Incorrect. It's unlikely that the actual number of red beads is below the lower bound of the plausible interval."
    ],
    "explanation": "Choice B is correct. It was estimated that 15% of the beads in the bag are red. Since the bag contains 10,000 beads, it follows that there are an estimated 10,000 × 0.15 = 1,500 red beads. It's given that the margin of error is 2%, or 10,000 × 0.02 = 200 beads. If the estimate is too high, there could plausibly be 1,500 − 200 = 1,300 red beads. If the estimate is too low, there could plausibly be 1,500 + 200 = 1,700 red beads. Therefore, the most plausible statement of the actual number of red beads in the bag is 1,300 < r < 1,700.<br><br>Choices A and D are incorrect and may result from misinterpreting the margin of error. It's unlikely that more than 1,700 beads or fewer than 1,300 beads in the bag are red. Choice C is incorrect because 200 is the margin of error for the number of red beads, not the lower bound of the range of red beads."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "hard", "type": "mc",
    "text": "A psychologist set up an experiment to study the tendency of a person to select the first item when presented with a series of items. In the experiment, 300 people were presented with a set of five pictures arranged in random order. Each person was asked to choose the most appealing picture. Of the first 150 participants, 36 chose the first picture in the set. Among the remaining 150 participants, p people chose the first picture in the set. If more than 20% of all participants chose the first picture in the set, which of the following inequalities best describes the possible values of p?",
    "choices": ["p > 0.20(300 − 36), where p ≤ 150", "p > 0.20(300 + 36), where p ≤ 150", "p − 36 > 0.20(300), where p ≤ 150", "p + 36 > 0.20(300), where p ≤ 150"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. This subtracts 36 from the 300 total instead of adding p and 36 together as the total who chose the first picture.",
      "Incorrect. This adds 36 to the total number of participants, 300, rather than to the count who chose the first picture.",
      "Incorrect. This subtracts 36 from p rather than adding p and 36 to represent the total who chose the first picture.",
      "Correct. The total who chose the first picture is 36 + p out of 300, so (36 + p)/300 > 0.20, which rearranges to p + 36 > 0.20(300), with p ≤ 150 since p comes from the remaining 150 participants."
    ],
    "explanation": "Choice D is correct. Of the first 150 participants, 36 chose the first picture in the set, and of the 150 remaining participants, p chose the first picture in the set. Hence, the proportion of the participants who chose the first picture in the set is (36 + p)/300. Since more than 20% of all the participants chose the first picture, it follows that (36 + p)/300 > 0.20. This inequality can be rewritten as p + 36 > 0.20(300). Since p is a number of people among the remaining 150 participants, p ≤ 150.<br><br>Choices A, B, and C are incorrect and may be the result of some incorrect interpretations of the given information or of computational errors."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "hard", "type": "fr",
    "text": "A number x is at most 2 less than 3 times the value of y. If the value of y is −4, what is the greatest possible value of x?",
    "answer": -14,
    "explanation": "The correct answer is −14. It's given that a number x is at most 2 less than 3 times the value of y. Therefore, x is less than or equal to 2 less than 3 times the value of y. The expression 3y represents 3 times the value of y. The expression 3y − 2 represents 2 less than 3 times the value of y. Therefore, x is less than or equal to 3y − 2. This can be shown by the inequality x ≤ 3y − 2. Substituting −4 for y in this inequality yields x ≤ 3(−4) − 2, or x ≤ −14. Therefore, if the value of y is −4, the greatest possible value of x is −14."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "easy", "type": "mc",
    "text": "Valentina bought two containers of beads. In the first container 30% of the beads are red, and in the second container 70% of the beads are red. Together, the containers have at least 400 red beads. Which inequality shows this relationship, where x is the total number of beads in the first container and y is the total number of beads in the second container?",
    "choices": ["0.3x + 0.7y ≥ 400", "0.7x + 0.3y ≤ 400", "x/3 + y/7 ≤ 400", "30x + 70y ≥ 400"],
    "correct": 0,
    "choiceNotes": [
      "Correct. 0.3x represents the red beads in the first container and 0.7y the red beads in the second; together they must be at least 400, giving 0.3x + 0.7y ≥ 400.",
      "Incorrect. This represents the containers having at most, rather than at least, 400 red beads, and also swaps which percentage goes with which container.",
      "Incorrect. This misrepresents how to express a percentage of beads in each container, and also shows at most rather than at least 400 red beads.",
      "Incorrect. The percentages were not converted to decimals, so this doesn't correctly represent the number of red beads in each container."
    ],
    "explanation": "Choice A is correct. It is given that x is the total number of beads in the first container and that 30% of those beads are red; therefore, the expression 0.3x represents the number of red beads in the first container. It is given that y is the total number of beads in the second container and that 70% of those beads are red; therefore, the expression 0.7y represents the number of red beads in the second container. It is also given that, together, the containers have at least 400 red beads, so the inequality that shows this relationship is 0.3x + 0.7y ≥ 400.<br><br>Choice B is incorrect because it represents the containers having a total of at most, rather than at least, 400 red beads. Choice C is incorrect and may be the result of misunderstanding how to represent a percentage of beads in each container. Also, the inequality shows the containers having a combined total of at most, rather than at least, 400 red beads. Choice D is incorrect because the percentages were not converted to decimals."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "medium", "type": "mc",
    "text": "The length of a rectangle is 50 inches and the width is x inches. The perimeter is at most 210 inches. Which inequality represents this situation?",
    "choices": ["2x + 100 ≤ 210", "2x + 100 ≥ 210", "2x + 50 ≤ 210", "2x + 50 ≥ 210"],
    "correct": 0,
    "choiceNotes": [
      "Correct. The perimeter is 2(50) + 2x = 100 + 2x, and since it's at most 210, 2x + 100 ≤ 210 represents this situation.",
      "Incorrect. This represents a situation where the perimeter is at least, rather than at most, 210 inches.",
      "Incorrect. This represents a situation where 2 times the length, rather than the length, is 50 inches.",
      "Incorrect. This represents a situation where 2 times the length, rather than the length, is 50 inches, and the perimeter is at least, rather than at most, 210 inches."
    ],
    "explanation": "Choice A is correct. The perimeter of a rectangle is equal to the sum of 2 times its length and 2 times its width. It's given that the rectangle's length is 50 inches and the width is x inches. Therefore, the perimeter, in inches, is 2(50) + 2x, or 100 + 2x, which is equivalent to 2x + 100. It's given that the perimeter is at most 210 inches; therefore, 2x + 100 ≤ 210 represents this situation.<br><br>Choice B is incorrect. This inequality represents a situation where the perimeter is at least, rather than at most, 210 inches. Choice C is incorrect. This inequality represents a situation where 2 times the length, rather than the length, is 50 inches. Choice D is incorrect. This inequality represents a situation where 2 times the length, rather than the length, is 50 inches, and the perimeter is at least, rather than at most, 210 inches."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "hard", "type": "mc",
    "text": "Adam's school is a 20-minute walk or a 5-minute bus ride away from his house. The bus runs once every 30 minutes, and the number of minutes, w, that Adam waits for the bus varies between 0 and 30. Which of the following inequalities gives the values of w for which it would be faster for Adam to walk to school?",
    "choices": ["w − 5 < 20", "w − 5 > 20", "w + 5 < 20", "w + 5 > 20"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. w − 5 isn't the total length of time for Adam to wait for and then take the bus to school.",
      "Incorrect. w − 5 isn't the total length of time for Adam to wait for and then take the bus to school.",
      "Incorrect. The inequality should be true when walking 20 minutes is faster than waiting for and riding the bus, not less than.",
      "Correct. Adam's total bus time is w + 5 (wait plus the 5-minute ride); walking is 20 minutes, so walking is faster when w + 5 > 20."
    ],
    "explanation": "Choice D is correct. It is given that w is the number of minutes that Adam waits for the bus. The total time it takes Adam to get to school on a day he takes the bus is the sum of the minutes, w, he waits for the bus and the 5 minutes the bus ride takes; thus, this time, in minutes, is w + 5. It is also given that the total amount of time it takes Adam to get to school on a day that he walks is 20 minutes. Therefore, w + 5 > 20 gives the values of w for which it would be faster for Adam to walk to school.<br><br>Choices A and B are incorrect because w − 5 is not the total length of time for Adam to wait for and then take the bus to school. Choice C is incorrect because the inequality should be true when walking 20 minutes is faster than the time it takes Adam to wait for and ride the bus, not less."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "easy", "type": "mc",
    "text": "A bakery sells trays of cookies. Each tray contains at least 50 cookies but no more than 60. Which of the following could be the total number of cookies on 4 trays of cookies?",
    "choices": ["165", "205", "245", "285"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This is less than the minimum possible total of 200 cookies on 4 trays.",
      "Correct. The minimum total on 4 trays is 50 × 4 = 200 and the maximum is 60 × 4 = 240; 205 falls between 200 and 240.",
      "Incorrect. This exceeds the maximum possible total of 240 cookies on 4 trays.",
      "Incorrect. This exceeds the maximum possible total of 240 cookies on 4 trays."
    ],
    "explanation": "Choice B is correct. If each tray contains the least number of cookies possible, 50 cookies, then the least number of cookies possible on 4 trays is 50 × 4 = 200 cookies. If each tray contains the greatest number of cookies possible, 60 cookies, then the greatest number of cookies possible on 4 trays is 60 × 4 = 240 cookies. If the least number of cookies on 4 trays is 200 and the greatest number of cookies is 240, then 205 could be the total number of cookies on these 4 trays because 200 ≤ 205 ≤ 240.<br><br>Choices A, C, and D are incorrect. The least number of cookies on 4 trays is 200 cookies, and the greatest number of cookies on 4 trays is 240 cookies. The choices 165, 245, and 285 are each either less than 200 or greater than 240; therefore, they cannot represent the total number of cookies on 4 trays."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "hard", "type": "mc",
    "text": "The triangle inequality theorem states that the sum of any two sides of a triangle must be greater than the length of the third side. If a triangle has side lengths of 6 and 12, which inequality represents the possible lengths, x, of the third side of the triangle?",
    "choices": ["x < 18", "x > 18", "6 < x < 18", "x < 6 or x > 18"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. This gives the upper bound for x but does not include its lower bound.",
      "Incorrect and may result from conceptual or calculation errors.",
      "Correct. Combining 6 + x > 12 (giving x > 6) and 12 + x > 6 (always true) with x < 18 (from 6 + 12 > x) gives 6 < x < 18.",
      "Incorrect and may result from conceptual or calculation errors."
    ],
    "explanation": "Choice C is correct. It's given that a triangle has side lengths of 6 and 12, and x represents the length of the third side of the triangle. It's also given that the triangle inequality theorem states that the sum of any two sides of a triangle must be greater than the length of the third side. Therefore, the inequalities 6 + x > 12, 6 + 12 > x, and 12 + x > 6 represent all possible values of x. Subtracting 6 from both sides of the inequality 6 + x > 12 yields x > 12 − 6, or x > 6. Adding 6 and 12 in the inequality 6 + 12 > x yields 18 > x, or x < 18. Subtracting 12 from both sides of the inequality 12 + x > 6 yields x > 6 − 12, or x > −6. Since all x-values that satisfy the inequality x > 6 also satisfy the inequality x > −6, it follows that the inequalities x > 6 and x < 18 represent the possible values of x. Therefore, the inequality 6 < x < 18 represents the possible lengths, x, of the third side of the triangle.<br><br>Choice A is incorrect. This inequality gives the upper bound for x but does not include its lower bound. Choice B is incorrect and may result from a calculation error. Choice D is incorrect and may result from conceptual or calculation errors."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "medium", "type": "mc",
    "text": "In North America, the standard width of a parking space is at least 7.5 feet and no more than 9.0 feet. A restaurant owner recently resurfaced the restaurant's parking lot and wants to determine the number of parking spaces, n, in the parking lot that could be placed perpendicular to a curb that is 135 feet long, based on the standard width of a parking space. Which of the following describes all the possible values of n?",
    "choices": ["18 ≤ n ≤ 135", "7.5 ≤ n ≤ 9", "15 ≤ n ≤ 135", "15 ≤ n ≤ 18"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. This equates the length of the curb with the maximum possible number of parking spaces.",
      "Incorrect. This is the range of possible values for the width of a parking space, not the number of parking spaces.",
      "Incorrect. This equates the length of the curb with the maximum possible number of parking spaces.",
      "Correct. The maximum number of spaces (using the minimum width 7.5 ft) is 135/7.5 = 18, and the minimum number (using the maximum width 9 ft) is 135/9 = 15, giving 15 ≤ n ≤ 18."
    ],
    "explanation": "Choice D is correct. Placing the parking spaces with the minimum width of 7.5 feet gives the maximum possible number of parking spaces. Thus, the maximum number that can be placed perpendicular to a 135-foot-long curb is 135/7.5 = 18. Placing the parking spaces with the maximum width of 9 feet gives the minimum number of parking spaces. Thus, the minimum number that can be placed perpendicular to a 135-foot-long curb is 135/9 = 15. Therefore, if n is the number of parking spaces in the lot, the range of possible values for n is 15 ≤ n ≤ 18.<br><br>Choices A and C are incorrect. These choices equate the length of the curb with the maximum possible number of parking spaces. Choice B is incorrect. This is the range of possible values for the width of a parking space instead of the range of possible values for the number of parking spaces."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "hard", "type": "mc",
    "text": "A salesperson's total earnings consist of a base salary of x dollars per year, plus commission earnings of 11% of the total sales the salesperson makes during the year. This year, the salesperson has a goal for the total earnings to be at least 3 times and at most 4 times the base salary. Which of the following inequalities represents all possible values of total sales s, in dollars, the salesperson can make this year in order to meet that goal?",
    "choices": ["2x ≤ s ≤ 3x", "(2/0.11)x ≤ s ≤ (3/0.11)x", "3x ≤ s ≤ 4x", "(3/0.11)x ≤ s ≤ (4/0.11)x"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This represents total sales, rather than total earnings, being at least 2 times and at most 3 times the base salary — the commission rate of 0.11 hasn't been divided out.",
      "Correct. Total earnings x + 0.11s must satisfy 3x ≤ x + 0.11s ≤ 4x; subtracting x gives 2x ≤ 0.11s ≤ 3x, and dividing by 0.11 gives (2/0.11)x ≤ s ≤ (3/0.11)x.",
      "Incorrect. This represents total sales, rather than total earnings, being at least 3 times and at most 4 times the base salary.",
      "Incorrect. This shifts the bounds up by one multiple of x, giving at least 4 times and at most 5 times the base salary for total earnings instead of 3 to 4 times."
    ],
    "explanation": "Choice B is correct. It's given that a salesperson's total earnings consist of a base salary of x dollars per year plus commission earnings of 11% of the total sales the salesperson makes during the year. If the salesperson makes s dollars in total sales this year, the salesperson's total earnings can be represented by the expression x + 0.11s. It's also given that the salesperson has a goal for the total earnings to be at least 3 times and at most 4 times the base salary, which can be represented by the expressions 3x and 4x, respectively. Therefore, this situation can be represented by the inequality 3x ≤ x + 0.11s ≤ 4x. Subtracting x from each part of this inequality yields 2x ≤ 0.11s ≤ 3x. Dividing each part of this inequality by 0.11 yields (2/0.11)x ≤ s ≤ (3/0.11)x. Therefore, the inequality (2/0.11)x ≤ s ≤ (3/0.11)x represents all possible values of total sales s, in dollars, the salesperson can make this year in order to meet their goal.<br><br>Choice A is incorrect. This inequality represents a situation in which the total sales, rather than the total earnings, are at least 2 times and at most 3 times the base salary. Choice C is incorrect. This inequality represents a situation in which the total sales, rather than the total earnings, are at least 3 times and at most 4 times the base salary. Choice D is incorrect. This inequality represents a situation in which the total earnings are at least 4 times and at most 5 times, rather than at least 3 times and at most 4 times, the base salary."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "easy", "type": "fr",
    "text": "For a party, 50 dinner rolls are needed. Dinner rolls are sold in packages of 12. What is the minimum number of packages that should be bought for the party?",
    "answer": 5,
    "explanation": "The correct answer is 5. Let p represent the number of packages of dinner rolls that should be bought for the party. It's given that dinner rolls are sold in packages of 12. Therefore, 12p represents the number of dinner rolls that should be bought for the party. It's also given that 50 dinner rolls are needed; therefore, 12p ≥ 50. Dividing both sides of this inequality by 12 yields p ≥ 50/12, or approximately p ≥ 4.17. Since the number of packages of dinner rolls must be a whole number, the minimum number of packages that should be bought for the party is 5."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "medium", "type": "mc",
    "text": "A certain elephant weighs 200 pounds at birth and gains more than 2 but less than 3 pounds per day during its first year. Which of the following inequalities represents all possible weights w, in pounds, for the elephant 365 days after birth?",
    "choices": ["400 < w < 600", "565 < w < 930", "730 < w < 1,095", "930 < w < 1,295"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. This may result from solving the inequality 200(2) < w < 200(3) instead of accounting for the 200-pound birth weight correctly.",
      "Incorrect. This may result from solving for a weight gain range of more than 1 pound but less than 2 pounds per day instead of 2 to 3.",
      "Incorrect. This may result from calculating the possible weight gained during the first year without adding the 200 pounds the elephant weighed at birth.",
      "Correct. The weight is 200 + 2d < w < 200 + 3d; substituting d = 365 gives 930 < w < 1,295."
    ],
    "explanation": "Choice D is correct. It's given that the elephant weighs 200 pounds at birth and gains more than 2 pounds but less than 3 pounds per day during its first year. The inequality 200 + 2d < w < 200 + 3d represents this situation, where d is the number of days after birth. Substituting 365 for d in the inequality gives 200 + 2(365) < w < 200 + 3(365), or 930 < w < 1,295.<br><br>Choice A is incorrect and may result from solving the inequality 200(2) < w < 200(3). Choice B is incorrect and may result from solving the inequality for a weight range of more than 1 pound but less than 2 pounds: 200 + 1(365) < w < 200 + 2(365). Choice C is incorrect and may result from calculating the possible weight gained by the elephant during the first year without adding the 200 pounds the elephant weighed at birth."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "hard", "type": "mc",
    "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">y &gt; 2x − 1<br>2x &gt; 5</div>Which of the following consists of the y-coordinates of all the points that satisfy the system of inequalities above?",
    "choices": ["y > 6", "y > 4", "y > 5/2", "y > 3/2"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. There are points with a y-coordinate less than 6 that satisfy both inequalities, such as (3, 5.5).",
      "Correct. Since 2x > 5 means 2x − 1 > 4, and y > 2x − 1, the transitive property gives y > 4.",
      "Incorrect. This may result from solving the inequality 2x > 5 for x and then replacing x with y.",
      "Incorrect. This allows y-values, such as y = 2, that aren't the y-coordinate of any point satisfying both inequalities."
    ],
    "explanation": "Choice B is correct. Subtracting the same number from each side of an inequality gives an equivalent inequality. Hence, subtracting 1 from each side of the inequality 2x > 5 gives 2x − 1 > 4. So the given system of inequalities is equivalent to the system of inequalities y > 2x − 1 and 2x − 1 > 4, which can be rewritten as y > 2x − 1 > 4. Using the transitive property of inequalities, it follows that y > 4.<br><br>Choice A is incorrect because there are points with a y-coordinate less than 6 that satisfy the given system of inequalities. For example, (3, 5.5) satisfies both inequalities. Choice C is incorrect. This may result from solving the inequality 2x > 5 for x, then replacing x with y. Choice D is incorrect because this inequality allows y-values that are not the y-coordinate of any point that satisfies both inequalities. For example, y = 2 is contained in the set y > 3/2; however, if 2 is substituted into the first inequality for y, the result is x < 3/2. This cannot be true because the second inequality gives x > 5/2."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "easy", "type": "mc",
    "text": "A clothing store is having a sale on shirts and pants. During the sale, the cost of each shirt is $15 and the cost of each pair of pants is $25. Geoff can spend at most $120 at the store. If Geoff buys s shirts and p pairs of pants, which of the following must be true?",
    "choices": ["15s + 25p ≤ 120", "15s + 25p ≥ 120", "25s + 15p ≤ 120", "25s + 15p ≥ 120"],
    "correct": 0,
    "choiceNotes": [
      "Correct. 15s represents the amount spent on shirts and 25p on pants; since Geoff spends at most $120, 15s + 25p ≤ 120.",
      "Incorrect. This represents Geoff spending at least, rather than at most, $120 at the store.",
      "Incorrect. This may result from reversing the cost of a shirt and that of a pair of pants.",
      "Incorrect. This may result from reversing the cost of a shirt and that of a pair of pants, and from representing spending at least, rather than at most, $120."
    ],
    "explanation": "Choice A is correct. Since the cost of each shirt is $15 and Geoff buys s shirts, the expression 15s represents the amount Geoff spends on shirts. Since the cost of each pair of pants is $25 and Geoff buys p pairs of pants, the expression 25p represents the amount Geoff spends on pants. Therefore, the sum 15s + 25p represents the total amount Geoff spends at the store. Since Geoff can spend at most $120 at the store, the total amount he spends must be less than or equal to 120. Thus, 15s + 25p ≤ 120.<br><br>Choice B is incorrect. This represents the situation in which Geoff spends at least, rather than at most, $120 at the store. Choice C is incorrect and may result from reversing the cost of a shirt and that of a pair of pants. Choice D is incorrect and may result from both reversing the cost of a shirt and that of a pair of pants and from representing a situation in which Geoff spends at least, rather than at most, $120 at the store."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "medium", "type": "mc",
    "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">y ≤ 3x + 1<br>x − y &gt; 1</div>Which of the following ordered pairs (x, y) satisfies the system of inequalities above?",
    "choices": ["(−2, −1)", "(−1, 3)", "(1, 5)", "(2, −1)"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. Substituting into the first inequality gives −1 ≤ 3(−2) + 1, or −1 ≤ −5, which is false.",
      "Incorrect. Substituting into the first inequality gives 3 ≤ 3(−1) + 1, or 3 ≤ −2, which is false.",
      "Incorrect. Substituting into the first inequality gives 5 ≤ 3(1) + 1, or 5 ≤ 4, which is false.",
      "Correct. The second inequality rewrites to x > y + 1; substituting (2, −1) gives 2 > −1 + 1 = 0, true, and (2,−1) also satisfies the first inequality."
    ],
    "explanation": "Choice D is correct. Any point (x, y) that is a solution to the given system of inequalities must satisfy both inequalities in the system. The second inequality in the system can be rewritten as x > y + 1. Of the given answer choices, only choice D satisfies this inequality, because inequality 2 > −1 + 1 is a true statement. The point (2, −1) also satisfies the first inequality.<br><br>Alternate approach: Substituting (2, −1) into the first inequality gives −1 ≤ 3(2) + 1, or −1 ≤ 7, which is a true statement. Substituting (2, −1) into the second inequality gives 2 − (−1) > 1, or 3 > 1, which is a true statement. Therefore, since (2, −1) satisfies both inequalities, it is a solution to the system.<br><br>Choice A is incorrect because substituting −2 for x and −1 for y in the first inequality gives −1 ≤ 3(−2) + 1, or −1 ≤ −5, which is false. Choice B is incorrect because substituting −1 for x and 3 for y in the first inequality gives 3 ≤ 3(−1) + 1, or 3 ≤ −2, which is false. Choice C is incorrect because substituting 1 for x and 5 for y in the first inequality gives 5 ≤ 3(1) + 1, or 5 ≤ 4, which is false."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "easy", "type": "mc",
    "text": "During spring migration, a dragonfly traveled a minimum of 1,510 miles and a maximum of 4,130 miles between stopover locations. Which inequality represents this situation, where d is a possible distance, in miles, this dragonfly traveled between stopover locations during spring migration?",
    "choices": ["d ≤ 1,510", "1,510 ≤ d ≤ 4,130", "d ≥ 4,130", "4,130 ≤ d ≤ 5,640"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This represents a situation in which the dragonfly traveled a maximum of 1,510 miles between stopover locations.",
      "Correct. Since the minimum distance is 1,510 miles and the maximum is 4,130 miles, 1,510 ≤ d ≤ 4,130 represents all possible distances.",
      "Incorrect. This represents a situation in which the dragonfly traveled a minimum of 4,130 miles between stopover locations.",
      "Incorrect. This represents a situation with the wrong minimum and maximum distances entirely."
    ],
    "explanation": "Choice B is correct. It's given that during spring migration, a dragonfly traveled a minimum of 1,510 miles and a maximum of 4,130 miles between stopover locations. It's also given that d represents a possible distance, in miles, this dragonfly traveled between stopover locations. It follows that the inequality 1,510 ≤ d ≤ 4,130 represents this situation.<br><br>Choice A is incorrect. This inequality represents a situation in which a dragonfly traveled a maximum of 1,510 miles between stopover locations. Choice C is incorrect. This inequality represents a situation in which a dragonfly traveled a minimum of 4,130 miles between stopover locations. Choice D is incorrect. This inequality represents a situation in which a dragonfly traveled a minimum of 4,310 miles and a maximum of 5,640 miles between stopover locations."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "easy", "type": "mc",
    "text": "Which of the following ordered pairs (x, y) satisfies the inequality 5x − 3y < 4?<br><br>I. (1, 1)<br>II. (2, 5)<br>III. (3, 2)",
    "choices": ["I only", "II only", "I and II only", "I and III only"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. The ordered pair (2, 5) also satisfies the inequality, so I alone leaves out a valid pair.",
      "Incorrect. The ordered pair (1, 1) also satisfies the inequality, so II alone leaves out a valid pair.",
      "Correct. Substituting (1,1) gives 2 < 4 (true) and substituting (2,5) gives −5 < 4 (true), while (3,2) gives 9 < 4 (false).",
      "Incorrect. The ordered pair (3, 2) does not satisfy the inequality, since substituting gives 9 < 4, which is false."
    ],
    "explanation": "Choice C is correct. Substituting (1,1) into the inequality gives 5(1) − 3(1) < 4, or 2 < 4, which is a true statement. Substituting (2,5) into the inequality gives 5(2) − 3(5) < 4, or −5 < 4, which is a true statement. Substituting (3,2) into the inequality gives 5(3) − 3(2) < 4, or 9 < 4, which is not a true statement. Therefore, (1,1) and (2,5) are the only ordered pairs shown that satisfy the given inequality.<br><br>Choice A is incorrect because the ordered pair (2,5) also satisfies the inequality. Choice B is incorrect because the ordered pair (1,1) also satisfies the inequality. Choice D is incorrect because the ordered pair (3,2) does not satisfy the inequality."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "medium", "type": "mc",
    "text": "The average annual energy cost for a certain home is $4,334. The homeowner plans to spend $25,000 to install a geothermal heating system. The homeowner estimates that the average annual energy cost will then be $2,712. Which of the following inequalities can be solved to find t, the number of years after installation at which the total amount of energy cost savings will exceed the installation cost?",
    "choices": ["25,000 > (4,334 − 2,712)t", "25,000 < (4,334 − 2,712)t", "25,000 − 4,334 > 2,712t", "25,000 > (4,332/2,712)t"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This gives the number of years after installation at which the total savings will be less than, not exceed, the installation cost.",
      "Correct. Annual savings are (4,334 − 2,712) dollars; after t years, total savings are (4,334 − 2,712)t, and this must exceed the $25,000 installation cost.",
      "Incorrect. This results from subtracting the average annual energy cost from the onetime installation cost, which isn't how to find the total predicted savings.",
      "Incorrect. This ratio compares the average energy cost before and after installation; it doesn't represent the savings."
    ],
    "explanation": "Choice B is correct. The savings each year from installing the geothermal heating system will be the average annual energy cost for the home before the geothermal heating system installation minus the average annual energy cost after the geothermal heating system installation, which is (4,334 − 2,712) dollars. In t years, the savings will be (4,334 − 2,712)t dollars. Therefore, the inequality that can be solved to find the number of years after installation at which the total amount of energy cost savings will exceed (be greater than) the installation cost, $25,000, is 25,000 < (4,334 − 2,712)t.<br><br>Choice A is incorrect. It gives the number of years after installation at which the total amount of energy cost savings will be less than the installation cost. Choice C is incorrect and may result from subtracting the average annual energy cost for the home from the onetime cost of the geothermal heating system installation. To find the predicted total savings, the predicted average cost should be subtracted from the average annual energy cost before the installation, and the result should be multiplied by the number of years, t. Choice D is incorrect and may result from misunderstanding the context. The ratio 4,332/2,712 compares the average energy cost before installation and the average energy cost after installation; it does not represent the savings."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "hard", "type": "mc",
    "text": "A laundry service is buying detergent and fabric softener from its supplier. The supplier will deliver no more than 300 pounds in a shipment. Each container of detergent weighs 7.35 pounds, and each container of fabric softener weighs 6.2 pounds. The service wants to buy at least twice as many containers of detergent as containers of fabric softener. Let d represent the number of containers of detergent, and let s represent the number of containers of fabric softener, where d and s are nonnegative integers. Which of the following systems of inequalities best represents this situation?",
    "choices": ["7.35d + 6.2s ≤ 300<br>d ≥ 2s", "7.35d + 6.2s ≤ 300<br>2d ≥ s", "14.7d + 6.2s ≤ 300<br>d ≥ 2s", "14.7d + 6.2s ≤ 300<br>2d ≥ s"],
    "correct": 0,
    "choiceNotes": [
      "Correct. The weight constraint is 7.35d + 6.2s ≤ 300, and buying at least twice as much detergent as softener gives d ≥ 2s.",
      "Incorrect. This misrepresents the relationship between the numbers of each container the service wants to buy.",
      "Incorrect. The first inequality incorrectly doubles the weight per container of detergent — it's 7.35, not 14.7, pounds.",
      "Incorrect. This doubles the weight per container of detergent and transposes the relationship between the numbers of containers."
    ],
    "explanation": "Choice A is correct. The number of containers in a shipment must have a weight less than or equal to 300 pounds. The total weight, in pounds, of detergent and fabric softener that the supplier delivers can be expressed as the weight of each container multiplied by the number of each type of container, which is 7.35d for detergent and 6.2s for fabric softener. Since this total cannot exceed 300 pounds, it follows that 7.35d + 6.2s ≤ 300. Also, since the laundry service wants to buy at least twice as many containers of detergent as containers of fabric softener, the number of containers of detergent should be greater than or equal to two times the number of containers of fabric softener. This can be expressed by the inequality d ≥ 2s.<br><br>Choice B is incorrect because it misrepresents the relationship between the numbers of each container that the laundry service wants to buy. Choice C is incorrect because the first inequality of the system incorrectly doubles the weight per container of detergent. The weight of each container of detergent is 7.35, not 14.7, pounds. Choice D is incorrect because it doubles the weight per container of detergent and transposes the relationship between the numbers of containers."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "hard", "type": "mc",
    "text": "A shipping service restricts the dimensions of the boxes it will ship for a certain type of service. The restriction states that for boxes shaped like rectangular prisms, the sum of the perimeter of the base of the box and the height of the box cannot exceed 130 inches. The perimeter of the base is determined using the width and length of the box. If a box has a height of 60 inches and its length is 2.5 times the width, which inequality shows the allowable width x, in inches, of the box?",
    "choices": ["0 < x ≤ 10", "0 < x ≤ 11 2/3", "0 < x ≤ 17 1/2", "0 < x ≤ 20"],
    "correct": 0,
    "choiceNotes": [
      "Correct. The perimeter of the base is 2(2.5x + x) = 7x; with height 60, 7x + 60 ≤ 130 gives 7x ≤ 70, so x ≤ 10.",
      "Incorrect and may result from a calculation error when solving the inequality.",
      "Incorrect and may result from a calculation error when solving the inequality.",
      "Incorrect and may result from a calculation error or misreading the given information."
    ],
    "explanation": "Choice A is correct. If x is the width, in inches, of the box, then the length of the box is 2.5x inches. It follows that the perimeter of the base is 2(2.5x + x), or 7x inches. The height of the box is given to be 60 inches. According to the restriction, the sum of the perimeter of the base and the height of the box should not exceed 130 inches. Algebraically, this can be represented by 7x + 60 ≤ 130, or 7x ≤ 70. Dividing both sides of the inequality by 7 gives x ≤ 10. Since x represents the width of the box, x must also be a positive number. Therefore, the inequality 0 < x ≤ 10 represents all the allowable values of x that satisfy the given conditions.<br><br>Choices B, C, and D are incorrect and may result from calculation errors or misreading the given information."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "medium", "type": "mc",
    "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">y ≤ x<br>y ≤ −x</div>Which of the following ordered pairs (x, y) is a solution to the system of inequalities above?",
    "choices": ["(1, 0)", "(−1, 0)", "(0, 1)", "(0, −1)"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. This ordered pair satisfies only y ≤ x in the given system, not both inequalities.",
      "Incorrect. This ordered pair satisfies only y ≤ −x in the system, but not both inequalities.",
      "Incorrect. This ordered pair satisfies neither inequality.",
      "Correct. For (0, −1), −1 ≤ 0 (satisfies y ≤ x) and −1 ≤ −(0) = 0 (satisfies y ≤ −x), so both inequalities hold."
    ],
    "explanation": "Choice D is correct. The solutions to the given system of inequalities is the set of all ordered pairs (x,y) that satisfy both inequalities in the system. For an ordered pair to satisfy the inequality y ≤ x, the value of the ordered pair's y-coordinate must be less than or equal to the value of the ordered pair's x-coordinate. This is true of the ordered pair (0,−1), because −1 ≤ 0. To satisfy the inequality y ≤ −x, the value of the ordered pair's y-coordinate must be less than or equal to the value of the additive inverse of the ordered pair's x-coordinate. This is also true of the ordered pair (0,−1). Because 0 is its own additive inverse, −1 ≤ −(0) is the same as −1 ≤ 0. Therefore, the ordered pair (0,−1) is a solution to the given system of inequalities.<br><br>Choice A is incorrect. This ordered pair satisfies only the inequality y ≤ x in the given system, not both inequalities. Choice B incorrect. This ordered pair satisfies only the inequality y ≤ −x in the system, but not both inequalities. Choice C is incorrect. This ordered pair satisfies neither inequality."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "medium", "type": "mc",
    "text": "Marisa needs to hire at least 10 staff members for an upcoming project. The staff members will be made up of junior directors, who will be paid $640 per week, and senior directors, who will be paid $880 per week. Her budget for paying the staff members is no more than $9,700 per week. She must hire at least 3 junior directors and at least 1 senior director. Which of the following systems of inequalities represents the conditions described if x is the number of junior directors and y is the number of senior directors?",
    "choices": ["640x + 880y ≥ 9,700<br>x + y ≤ 10<br>x ≥ 3<br>y ≥ 1", "640x + 880y ≤ 9,700<br>x + y ≥ 10<br>x ≥ 3<br>y ≥ 1", "640x + 880y ≥ 9,700<br>x + y ≥ 10<br>x ≤ 3<br>y ≤ 1", "640x + 880y ≤ 9,700<br>x + y ≤ 10<br>x ≤ 3<br>y ≤ 1"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. The budget condition implies Marisa can pay the new staff more than her $9,700 budget, which is backwards.",
      "Correct. x + y ≥ 10 (at least 10 staff), 640x + 880y ≤ 9,700 (budget), x ≥ 3, and y ≥ 1 correctly represent all four conditions.",
      "Incorrect. The budget condition implies Marisa can pay the new staff more than her $9,700 budget, which is backwards.",
      "Incorrect. This requires at most, not at least, 10 staff members, which contradicts the problem."
    ],
    "explanation": "Choice B is correct. Marisa will hire x junior directors and y senior directors. Since she needs to hire at least 10 staff members, x + y ≥ 10. Each junior director will be paid $640 per week, and each senior director will be paid $880 per week. Marisa's budget for paying the new staff is no more than $9,700 per week; in terms of x and y, this condition is 640x + 880y ≤ 9,700. Since Marisa must hire at least 3 junior directors and at least 1 senior director, it follows that x ≥ 3 and y ≥ 1. All four of these conditions are represented correctly in choice B.<br><br>Choices A and C are incorrect. For example, the first condition, 640x + 880y ≥ 9,700, in each of these options implies that Marisa can pay the new staff members more than her budget of $9,700. Choice D is incorrect because Marisa needs to hire at least 10 staff members, not at most 10 staff members, as the inequality x + y ≤ 10 implies."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "medium", "type": "mc",
    "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">H = 120p + 60</div>The Karvonen formula above shows the relationship between Alice's target heart rate H, in beats per minute (bpm), and the intensity level p of different activities. When p = 0, Alice has a resting heart rate. When p = 1, Alice has her maximum heart rate. It is recommended that p be between 0.5 and 0.85 for Alice when she trains. Which of the following inequalities describes Alice's target training heart rate?",
    "choices": ["120 ≤ H ≤ 162", "102 ≤ H ≤ 120", "60 ≤ H ≤ 162", "60 ≤ H ≤ 102"],
    "correct": 0,
    "choiceNotes": [
      "Correct. When p = 0.5, H = 120(0.5) + 60 = 120; when p = 0.85, H = 120(0.85) + 60 = 162, so 120 ≤ H ≤ 162.",
      "Incorrect. This describes Alice's target heart rate for 0.35 ≤ p ≤ 0.5.",
      "Incorrect. This describes her target heart rate for 0 ≤ p ≤ 0.85.",
      "Incorrect. This describes her target heart rate for 0 ≤ p ≤ 0.35."
    ],
    "explanation": "Choice A is correct. When Alice trains, it's recommended that p be between 0.5 and 0.85. Therefore, her target training heart rate is represented by the values of H corresponding to 0.5 ≤ p ≤ 0.85. When p = 0.5, H = 120(0.5) + 60, or H = 120. When p = 0.85, H = 120(0.85) + 60, or H = 162. Therefore, the inequality that describes Alice's target training heart rate is 120 ≤ H ≤ 162.<br><br>Choice B is incorrect. This inequality describes Alice's target heart rate for 0.35 ≤ p ≤ 0.5. Choice C is incorrect. This inequality describes her target heart rate for 0 ≤ p ≤ 0.85. Choice D is incorrect. This inequality describes her target heart rate for 0 ≤ p ≤ 0.35."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "easy", "type": "fr",
    "text": "Maria plans to rent a boat. The boat rental costs $60 per hour, and she will also have to pay for a water safety course that costs $10. Maria wants to spend no more than $280 for the rental and the course. If the boat rental is available only for a whole number of hours, what is the maximum number of hours for which Maria can rent the boat?",
    "answer": 4,
    "explanation": "The correct answer is 4. The equation 60h + 10 ≤ 280, where h is the number of hours the boat has been rented, can be written to represent the situation. Subtracting 10 from both sides and then dividing by 60 yields h ≤ 4.5. Since the boat can be rented only for whole numbers of hours, the maximum number of hours for which Maria can rent the boat is 4."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "hard", "type": "mc",
    "text": "Ken is working this summer as part of a crew on a farm. He earned $8 per hour for the first 10 hours he worked this week. Because of his performance, his crew leader raised his salary to $10 per hour for the rest of the week. Ken saves 90% of his earnings from each week. What is the least number of hours he must work the rest of the week to save at least $270 for the week?",
    "choices": ["38", "33", "22", "16"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. Ken can save $270 by working fewer hours than 38 for the rest of the week.",
      "Incorrect. Ken can save $270 by working fewer hours than 33 for the rest of the week.",
      "Correct. Total earnings are 10x + 80, and saving 90% means 0.9(10x + 80) ≥ 270, which simplifies to 9(x + 8) ≥ 270, so x ≥ 22.",
      "Incorrect. Working 16 hours gives total earnings of $80 + $160 = $240, and 90% of that is less than $270."
    ],
    "explanation": "Choice C is correct. Ken earned $8 per hour for the first 10 hours he worked, so he earned a total of $80 for the first 10 hours he worked. For the rest of the week, Ken was paid at the rate of $10 per hour. Let x be the number of hours he will work for the rest of the week. The total of Ken's earnings, in dollars, for the week will be 10x + 80. He saves 90% of his earnings each week, so this week he will save 0.9(10x + 80) dollars. The inequality 0.9(10x + 80) ≥ 270 represents the condition that he will save at least $270 for the week. Factoring 10 out of the expression 10x + 80 gives 10(x + 8). The product of 10 and 0.9 is 9, so the inequality can be rewritten as 9(x + 8) ≥ 270. Dividing both sides of this inequality by 9 yields x + 8 ≥ 30, so x ≥ 22. Therefore, the least number of hours Ken must work the rest of the week to save at least $270 for the week is 22.<br><br>Choices A and B are incorrect because Ken can save $270 by working fewer hours than 38 or 33 for the rest of the week. Choice D is incorrect. If Ken worked 16 hours for the rest of the week, his total earnings for the week will be $80 + $160 = $240, which is less than $270. Since he saves only 90% of his earnings each week, he would save even less than $240 for the week."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "easy", "type": "mc",
    "text": "Normal body temperature for an adult is between 97.8°F and 99°F, inclusive. If Kevin, an adult male, has a body temperature that is considered to be normal, which of the following could be his body temperature?",
    "choices": ["96.7°F", "97.6°F", "97.9°F", "99.7°F"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. This temperature is less than 97.8°F, so it doesn't fit the given restrictions.",
      "Incorrect. This temperature is less than 97.8°F, so it doesn't fit the given restrictions.",
      "Correct. 97.9°F falls between 97.8°F and 99°F, inclusive, so it fits the given restrictions.",
      "Incorrect. This temperature is greater than 99°F, so it doesn't fit the given restrictions."
    ],
    "explanation": "Choice C is correct. Normal body temperature must be greater than or equal to 97.8°F but less than or equal to 99°F. Of the given choices, 97.9°F is the only temperature that fits these restrictions.<br><br>Choices A and B are incorrect. These temperatures are less than 97.8°F, so they don't fit the given restrictions. Choice D is incorrect. This temperature is greater than 99°F, so it doesn't fit the given restrictions."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "medium", "type": "mc",
    "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">y &lt; −4x + 4</div>Which point (x, y) is a solution to the given inequality in the xy-plane?",
    "choices": ["(−4, 0)", "(0, 5)", "(2, 1)", "(2, −1)"],
    "correct": 0,
    "choiceNotes": [
      "Correct. Substituting (−4, 0): 0 < −4(−4) + 4 = 20, which is true, so (−4, 0) is a solution.",
      "Incorrect. Substituting gives 5 < −4(0) + 4 = 4, which is false.",
      "Incorrect. Substituting gives 1 < −4(2) + 4 = −4, which is false.",
      "Incorrect. Substituting gives −1 < −4(2) + 4 = −4, which is false."
    ],
    "explanation": "Choice A is correct. For a point (x, y) to be a solution to the given inequality in the xy-plane, the value of the point's y-coordinate must be less than the value of −4x + 4, where x is the value of the x-coordinate of the point. This is true of the point (−4, 0) because 0 < −4(−4) + 4, or 0 < 20. Therefore, the point (−4, 0) is a solution to the given inequality.<br><br>Choices B, C, and D are incorrect. None of these points are a solution to the given inequality because each point's y-coordinate is greater than the value of −4x + 4 for the point's x-coordinate."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "easy", "type": "mc",
    "text": "Tom scored 85, 78, and 98 on his first three exams in history class. Solving which inequality gives the score, G, on Tom's fourth exam that will result in a mean score on all four exams of at least 90?",
    "choices": ["90 − (85 + 78 + 98) ≤ 4G", "4G + 85 + 78 + 98 ≥ 360", "(G + 85 + 78 + 98)/4 ≥ 90", "(85 + 78 + 98)/4 ≥ 90 − 4G"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. The sum of the scores (G, 85, 78, and 98) isn't divided by 4 to express the mean.",
      "Incorrect and may be the result of an algebraic error when multiplying both sides of the inequality by 4.",
      "Correct. The mean of the four scores is (G + 85 + 78 + 98)/4, and for the mean to be at least 90, (G + 85 + 78 + 98)/4 ≥ 90.",
      "Incorrect because it doesn't include G in the mean with the other three scores."
    ],
    "explanation": "Choice C is correct. The mean of the four scores (G, 85, 78, and 98) can be expressed as (G + 85 + 78 + 98)/4. The inequality that expresses the condition that the mean score is at least 90 can therefore be written as (G + 85 + 78 + 98)/4 ≥ 90.<br><br>Choice A is incorrect. The sum of the scores (G, 85, 78, and 98) isn't divided by 4 to express the mean. Choice B is incorrect and may be the result of an algebraic error when multiplying both sides of the inequality by 4. Choice D is incorrect because it doesn't include G in the mean with the other three scores."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "easy", "type": "mc",
    "text": "An elementary school teacher is ordering x workbooks and y sets of flash cards for a math class. The teacher must order at least 20 items, but the total cost of the order must not be over $80. If the workbooks cost $3 each and the flash cards cost $4 per set, which of the following systems of inequalities models this situation?",
    "choices": ["x + y ≥ 20<br>3x + 4y ≤ 80", "x + y ≥ 20<br>3x + 4y ≥ 80", "3x + 4y ≤ 20<br>x + y ≥ 80", "x + y ≤ 20<br>3x + 4y ≥ 80"],
    "correct": 0,
    "choiceNotes": [
      "Correct. x + y ≥ 20 represents ordering at least 20 items, and 3x + 4y ≤ 80 represents the total cost not exceeding $80.",
      "Incorrect. The second inequality says the total cost must be greater, not less than or equal to, $80.",
      "Incorrect. This incorrectly limits the cost by the minimum number of items and the number of items by the maximum cost.",
      "Incorrect. The first inequality incorrectly says at most 20 items must be ordered, and the second says the total cost must be at least, not at most, $80."
    ],
    "explanation": "Choice A is correct. The total number of workbooks and sets of flash cards ordered is represented by x + y. Since the teacher must order at least 20 items, it must be true that x + y ≥ 20. Each workbook costs $3; therefore, 3x represents the cost, in dollars, of x workbooks. Each set of flashcards costs $4; therefore, 4y represents the cost, in dollars, of y sets of flashcards. It follows that the total cost for x workbooks and y sets of flashcards is 3x + 4y. Since the total cost of the order must not be over $80, it must also be true that 3x + 4y ≤ 80. Of the choices given, these inequalities are shown only in choice A.<br><br>Choice B is incorrect. The second inequality says that the total cost must be greater, not less than or equal to, $80. Choice C incorrectly limits the cost by the minimum number of items and the number of items with the maximum cost. Choice D is incorrect. The first inequality incorrectly says that at most 20 items must be ordered, and the second inequality says that the total cost of the order must be at least, not at most, $80."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "hard", "type": "fr",
    "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">I = V/R</div>The formula above is Ohm's law for an electric circuit with current I, in amperes, potential difference V, in volts, and resistance R, in ohms. A circuit has a resistance of 500 ohms, and its potential difference will be generated by n six-volt batteries that produce a total potential difference of 6n volts. If the circuit is to have a current of no more than 0.25 ampere, what is the greatest number, n, of six-volt batteries that can be used?",
    "answer": 20,
    "explanation": "The correct answer is 20. For the given circuit, the resistance R is 500 ohms, and the total potential difference V generated by n batteries is 6n volts. It's also given that the circuit is to have a current of no more than 0.25 ampere, which can be expressed as I ≤ 0.25. Since Ohm's law says that I = V/R, the given values for V and R can be substituted for I in this inequality, which yields 6n/500 ≤ 0.25. Multiplying both sides of this inequality by 500 yields 6n ≤ 125, and dividing both sides of this inequality by 6 yields n ≤ 20.833. Since the number of batteries must be a whole number less than 20.833, the greatest number of batteries that can be used in this circuit is 20."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "medium", "type": "mc",
    "text": "A model estimates that whales from the genus Eschrichtius travel 72 to 77 miles in the ocean each day during their migration. Based on this model, which inequality represents the estimated total number of miles, x, a whale from the genus Eschrichtius could travel in 16 days of its migration?",
    "choices": ["72 + 16 ≤ x ≤ 77 + 16", "(72)(16) ≤ x ≤ (77)(16)", "72 ≤ 16 + x ≤ 77", "72 ≤ 16x ≤ 77"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect and may result from conceptual errors — adding the days instead of multiplying by them.",
      "Correct. Traveling 72 miles/day for 16 days gives 72(16) miles, and 77 miles/day for 16 days gives 77(16) miles, so (72)(16) ≤ x ≤ (77)(16).",
      "Incorrect and may result from conceptual errors — adding the number of days instead of multiplying.",
      "Incorrect and may result from conceptual errors — multiplying x by 16 rather than multiplying the daily distances by 16."
    ],
    "explanation": "Choice B is correct. It's given that the model estimates that whales from the genus Eschrichtius travel 72 to 77 miles in the ocean each day during their migration. If one of these whales travels 72 miles each day for 16 days, then the whale travels 72(16) miles total. If one of these whales travels 77 miles each day for 16 days, then the whale travels 77(16) miles total. Therefore, the model estimates that in 16 days of its migration, a whale from the genus Eschrichtius could travel at least 72(16) and at most 77(16) miles total. Thus, the inequality (72)(16) ≤ x ≤ (77)(16) represents the estimated total number of miles, x, a whale from the genus Eschrichtius could travel in 16 days of its migration.<br><br>Choice A is incorrect and may result from conceptual errors. Choice C is incorrect and may result from conceptual errors. Choice D is incorrect and may result from conceptual errors."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "hard", "type": "fr",
    "text": "A local transit company sells a monthly pass for $95 that allows an unlimited number of trips of any length. Tickets for individual trips cost $1.50, $2.50, or $3.50, depending on the length of the trip. What is the minimum number of trips per month for which a monthly pass could cost less than purchasing individual tickets for trips?",
    "answer": 28,
    "explanation": "The correct answer is 28. The minimum number of individual trips for which the cost of the monthly pass is less than the cost of individual tickets can be found by assuming the maximum cost of the individual tickets, $3.50. If n tickets costing $3.50 each are purchased in one month, the inequality 95 < 3.50n represents this situation. Dividing both sides of the inequality by 3.50 yields 27.14 < n, which is equivalent to n > 27.14. Since only a whole number of tickets can be purchased, it follows that 28 is the minimum number of trips."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "easy", "type": "mc",
    "text": "On a car trip, Rhett and Jessica each drove for part of the trip, and the total distance they drove was under 220 miles. Rhett drove at an average speed of 35 miles per hour (mph), and Jessica drove at an average speed of 40 mph. Which of the following inequalities represents this situation, where r is the number of hours Rhett drove and j is the number of hours Jessica drove?",
    "choices": ["35r + 40j > 220", "35r + 40j < 220", "40r + 35j > 220", "40r + 35j < 220"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This represents a situation in which the total distance Rhett and Jessica drove was over, rather than under, 220 miles.",
      "Correct. 35r represents the distance Rhett drove and 40j the distance Jessica drove; since the total was under 220 miles, 35r + 40j < 220.",
      "Incorrect. This swaps Rhett's and Jessica's speeds and represents the total distance being over, rather than under, 220 miles.",
      "Incorrect. This swaps Rhett's and Jessica's speeds."
    ],
    "explanation": "Choice B is correct. It's given that Rhett drove at an average speed of 35 miles per hour and that he drove for r hours. Multiplying 35 miles per hour by r hours yields 35r miles, or the distance that Rhett drove. It's also given that Jessica drove at an average speed of 40 miles per hour and that she drove for j hours. Multiplying 40 miles per hour by j hours yields 40j miles, or the distance that Jessica drove. The total distance, in miles, that Rhett and Jessica drove can be represented by the expression 35r + 40j. It's given that the total distance they drove was under 220 miles. Therefore, the inequality 35r + 40j < 220 represents this situation.<br><br>Choice A is incorrect. This inequality represents a situation in which the total distance Rhett and Jessica drove was over, rather than under, 220 miles. Choice C is incorrect. This inequality represents a situation in which Rhett drove at an average speed of 40, rather than 35, miles per hour, Jessica drove at an average speed of 35, rather than 40, miles per hour, and the total distance they drove was over, rather than under, 220 miles. Choice D is incorrect. This inequality represents a situation in which Rhett drove at an average speed of 40, rather than 35, miles per hour, and Jessica drove at an average speed of 35, rather than 40, miles per hour."},

  {"domain": "Algebra", "skill": "Linear Inequalities in One or Two Variables", "difficulty": "medium", "type": "mc",
    "text": "A cargo helicopter delivers only 100-pound packages and 120-pound packages. For each delivery trip, the helicopter must carry at least 10 packages, and the total weight of the packages can be at most 1,100 pounds. What is the maximum number of 120-pound packages that the helicopter can carry per trip?",
    "choices": ["2", "4", "5", "6"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect and may result from incorrectly creating or solving the system of inequalities.",
      "Incorrect and may result from incorrectly creating or solving the system of inequalities.",
      "Correct. Minimizing the number of 100-pound packages (b ≥ 10 − a) and substituting into 120a + 100b ≤ 1,100 gives 20a ≤ 100, so a ≤ 5.",
      "Incorrect and may result from incorrectly creating or solving the system of inequalities."
    ],
    "explanation": "Choice C is correct. Let a equal the number of 120-pound packages, and let b equal the number of 100-pound packages. It's given that the total weight of the packages can be at most 1,100 pounds: the inequality 120a + 100b ≤ 1,100 represents this situation. It's also given that the helicopter must carry at least 10 packages: the inequality a + b ≥ 10 represents this situation. Values of a and b that satisfy these two inequalities represent the allowable numbers of 120-pound packages and 100-pound packages the helicopter can transport. To maximize the number of 120-pound packages, a, in the helicopter, the number of 100-pound packages, b, in the helicopter needs to be minimized. Expressing b in terms of a in the second inequality yields b ≥ 10 − a, so the minimum value of b is equal to 10 − a. Substituting 10 − a for b in the first inequality results in 120a + 100(10 − a) ≤ 1,100. Using the distributive property to rewrite this inequality yields 120a + 1,000 − 100a ≤ 1,100, or 20a + 1,000 ≤ 1,100. Subtracting 1,000 from both sides of this inequality yields 20a ≤ 100. Dividing both sides of this inequality by 20 results in a ≤ 5. This means that the maximum number of 120-pound packages that the helicopter can carry per trip is 5.<br><br>Choices A, B, and D are incorrect and may result from incorrectly creating or solving the system of inequalities."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "medium", "type": "fr",
    "text": "<svg viewBox=\"0 0 200 180\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"40\" y1=\"150\" x2=\"40\" y2=\"30\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"40\" y1=\"150\" x2=\"170\" y2=\"150\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"40\" y1=\"30\" x2=\"170\" y2=\"150\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"40\" y=\"138\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"22\" y=\"20\" font-size=\"13\" fill=\"currentColor\">Q</text><text x=\"25\" y=\"165\" font-size=\"13\" fill=\"currentColor\">P</text><text x=\"175\" y=\"160\" font-size=\"13\" fill=\"currentColor\">R</text><text x=\"95\" y=\"80\" font-size=\"12\" fill=\"currentColor\">8</text><text x=\"120\" y=\"140\" font-size=\"11\" fill=\"currentColor\">30°</text></svg>In the right triangle shown above, what is the length of PQ?",
    "answer": 4,
    "explanation": "The correct answer is 4. Triangle PQR has given angle measures of 30° and 90°, so the third angle must be 60° because the measures of the angles of a triangle sum to 180°. For any special right triangle with angles measuring 30°, 60°, and 90°, the length of the hypotenuse (the side opposite the right angle) is 2x, where x is the length of the side opposite the 30° angle. Segment PQ is opposite the 30° angle. Therefore, 2(PQ) = 8 and PQ = 4."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 220 200\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"40\" y1=\"170\" x2=\"40\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"40\" y1=\"170\" x2=\"200\" y2=\"170\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"40\" y1=\"20\" x2=\"200\" y2=\"170\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"40\" y=\"158\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"22\" y=\"38\" font-size=\"12\" fill=\"currentColor\">x°</text><text x=\"110\" y=\"85\" font-size=\"13\" fill=\"currentColor\">23</text><text x=\"110\" y=\"190\" font-size=\"13\" fill=\"currentColor\">16</text><text x=\"55\" y=\"205\" font-size=\"10\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the triangle shown, what is the value of sin x°? (Enter as a decimal, e.g. 0.6957.)",
    "answer": 0.6957,
    "explanation": "The correct answer is 16/23 (enter as 0.6957). In a right triangle, the sine of an acute angle is defined as the ratio of the length of the side opposite the angle to the length of the hypotenuse. In the triangle shown, the length of the side opposite the angle with measure x° is 16 units and the length of the hypotenuse is 23 units. Therefore, the value of sin x° is 16/23. Note that 16/23, 0.6956, 0.6957, 0.695, and 0.696 are examples of ways to enter a correct answer; on this platform, enter the decimal form 0.6957."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "fr",
    "text": "A triangle with angle measures 30°, 60°, and 90° has a perimeter of 18 + 6√3. What is the length of the longest side of the triangle?",
    "answer": 12,
    "explanation": "The correct answer is 12. It is given that the triangle has angle measures of 30°, 60°, and 90°, and so the triangle is a special right triangle. The side measures of this type of special triangle are in the ratio 2:1:√3. If x is the measure of the shortest leg, then the measure of the other leg is √3x and the measure of the hypotenuse is 2x. The perimeter of the triangle is given to be 18 + 6√3, and so the equation for the perimeter can be written as 2x + x + √3x = 18 + 6√3. Combining like terms and factoring out a common factor of x on the left-hand side of the equation gives (3 + √3)x = 18 + 6√3. Rewriting the right-hand side of the equation by factoring out 6 gives (3 + √3)x = 6(3 + √3). Dividing both sides of the equation by the common factor (3 + √3) gives x = 6. The longest side of the right triangle, the hypotenuse, has a length of 2x, or 2(6), which is 12."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "fr",
    "text": "Triangle ABC is similar to triangle DEF, where angle A corresponds to angle D and angle C corresponds to angle F. Angles C and F are right angles. If tan(A) = 50/7, what is the value of tan(E)? (Enter as a decimal, e.g. 0.14.)",
    "answer": 0.14,
    "explanation": "The correct answer is 7/50 (enter as 0.14). It's given that triangle ABC is similar to triangle DEF, where angle A corresponds to angle D and angle C corresponds to angle F. In similar triangles, the tangents of corresponding angles are equal. Since angle A and angle D are corresponding angles, if tan(A) = 50/7, then tan(D) = 50/7. It's also given that angles C and F are right angles. It follows that triangle DEF is a right triangle with acute angles D and E. The tangent of one acute angle in a right triangle is the inverse of the tangent of the other acute angle in the triangle. Therefore, tan(E) = 1/tan(D). Substituting 50/7 for tan(D) in this equation yields tan(E) = 1/(50/7), or tan(E) = 7/50. Thus, if tan(A) = 50/7, the value of tan(E) is 7/50."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "mc",
    "text": "<svg viewBox=\"0 0 260 100\" class=\"dx-fig\" style=\"color:var(--text);\"><polygon points=\"20,90 70,20 120,90\" fill=\"rgba(120,120,120,0.35)\" stroke=\"currentColor\" stroke-width=\"1.3\"/><polygon points=\"120,90 170,20 220,90\" fill=\"rgba(120,120,120,0.35)\" stroke=\"currentColor\" stroke-width=\"1.3\"/></svg>A graphic designer is creating a logo for a company. The logo is shown in the figure above. The logo is in the shape of a trapezoid and consists of three congruent equilateral triangles. If the perimeter of the logo is 20 centimeters, what is the combined area of the shaded regions, in square centimeters, of the logo?",
    "choices": ["2√3", "4√3", "8√3", "16"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. This is the height of the trapezoid, not the combined shaded area.",
      "Incorrect. This is the area of just one of the equilateral triangles, not two.",
      "Correct. Each side of an equilateral triangle is 20/5 = 4 cm; each triangle's area is 4√3 cm², and the shaded area consists of two such triangles, so (2)(4)√3 = 8√3 cm².",
      "Incorrect and may result from using a height of 4 for each triangle rather than the correct height of 2√3."
    ],
    "explanation": "Choice C is correct. It's given that the logo is in the shape of a trapezoid that consists of three congruent equilateral triangles, and that the perimeter of the trapezoid is 20 centimeters (cm). Since the perimeter of the trapezoid is the sum of the lengths of 5 of the sides of the triangles, the length of each side of an equilateral triangle is 20/5 = 4 cm. Dividing up one equilateral triangle into two right triangles yields a pair of congruent 30°-60°-90° triangles. The shorter leg of each right triangle is half the length of the side of an equilateral triangle, or 2 cm. Using the Pythagorean Theorem, a² + b² = c², the height of the equilateral triangle can be found. Substituting a = 2 and c = 4 and solving for b yields √(4² − 2²) = √12 = 2√3 cm. The area of one equilateral triangle is (1/2)bh, where b = 2 and h = 2√3. Therefore, the area of one equilateral triangle is (1/2)(4)(2√3) = 4√3 cm². The shaded area consists of two such triangles, so its area is (2)(4)√3 = 8√3 cm².<br><br>Alternate approach: The area of a trapezoid can be found by evaluating the expression (1/2)(b1 + b2)h, where b1 is the length of one base, b2 is the length of the other base, and h is the height of the trapezoid. Substituting b1 = 8, b2 = 4, and h = 2√3 yields the expression (1/2)(8 + 4)(2√3), or (1/2)(12)(2√3), which gives an area of 12√3 cm² for the trapezoid. Since two-thirds of the trapezoid is shaded, the area of the shaded region is (2/3) × 12√3 = 8√3.<br><br>Choice A is incorrect. This is the height of the trapezoid. Choice B is incorrect. This is the area of one of the equilateral triangles, not two. Choice D is incorrect and may result from using a height of 4 for each triangle rather than the height of 2√3."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "mc",
    "text": "<svg viewBox=\"0 0 220 200\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"40\" y1=\"20\" x2=\"40\" y2=\"170\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"40\" y1=\"170\" x2=\"200\" y2=\"170\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"40\" y1=\"20\" x2=\"200\" y2=\"170\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"40\" y=\"158\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"22\" y=\"18\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"22\" y=\"185\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"205\" y=\"180\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"110\" y=\"85\" font-size=\"13\" fill=\"currentColor\">54</text><text x=\"165\" y=\"160\" font-size=\"11\" fill=\"currentColor\">30°</text><text x=\"55\" y=\"200\" font-size=\"10\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>Right triangle ABC is shown. What is the value of tan A?",
    "choices": ["√3/54", "1/√3", "√3", "27√3"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect and may result from conceptual or calculation errors.",
      "Incorrect. This is the value of 1/tan(A), not the value of tan(A).",
      "Correct. Angle A = 60°; the legs are in ratio x, x√3 with hypotenuse 2x = 54, so x = 27; tan(A) = (27√3)/27 = √3.",
      "Incorrect. This is the length of the leg opposite angle A, not the value of tan(A)."
    ],
    "explanation": "Choice C is correct. In the triangle shown, the measure of angle B is 30° and angle C is a right angle, which means that it has a measure of 90°. Since the sum of the angles in a triangle is equal to 180°, the measure of angle A is equal to 180° − 30° − 90°, or 60°. In a right triangle whose acute angles have measures 30° and 60°, the lengths of the legs can be represented by the expressions x, x√3, and 2x, where x is the length of the leg opposite the angle with measure 30°, x√3 is the length of the leg opposite the angle with measure 60°, and 2x is the length of the hypotenuse. In the triangle shown, the hypotenuse has a length of 54. It follows that 2x = 54, or x = 27. Therefore, the length of the leg opposite angle B is 27 and the length of the leg opposite angle A is 27√3. The tangent of an acute angle in a right triangle is defined as the ratio of the length of the leg opposite the angle to the length of the leg adjacent to the angle. The length of the leg opposite angle A is 27√3 and the length of the leg adjacent to angle A is 27. Therefore, the value of tan A is (27√3)/27, or √3.<br><br>Choice A is incorrect and may result from conceptual or calculation errors. Choice B is incorrect. This is the value of 1/tan A, not the value of tan A. Choice D is incorrect. This is the length of the leg opposite angle A, not the value of tan A."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 220 200\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"40\" y1=\"170\" x2=\"40\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"40\" y1=\"20\" x2=\"190\" y2=\"170\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"40\" y1=\"170\" x2=\"190\" y2=\"170\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"40\" y1=\"110\" x2=\"130\" y2=\"110\" stroke=\"currentColor\" stroke-width=\"1.3\"/><rect x=\"40\" y=\"158\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><rect x=\"40\" y=\"98\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"22\" y=\"185\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"22\" y=\"18\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"195\" y=\"180\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"25\" y=\"105\" font-size=\"13\" fill=\"currentColor\">D</text><text x=\"135\" y=\"105\" font-size=\"13\" fill=\"currentColor\">E</text></svg>In the figure above, tan B = 3/4. If BC = 15 and DA = 4, what is the length of DE?",
    "answer": 6,
    "explanation": "The correct answer is 6. Since tan B = 3/4, triangle ABC and triangle DBE are both similar to 3-4-5 triangles. This means that they are both similar to the right triangle with sides of lengths 3, 4, and 5. Since BC = 15, which is 3 times as long as the hypotenuse of the 3-4-5 triangle, the similarity ratio of triangle ABC to the 3-4-5 triangle is 3:1. Therefore, the length of AC (the side opposite to angle B) is 3 × 3 = 9, and the length of AB (the side adjacent to angle B) is 4 × 3 = 12. It is also given that DA = 4. Since AB = DA + DB and AB = 12, it follows that DB = 8, which means that the similarity ratio of triangle DBE to the 3-4-5 triangle is 2:1 (DB is the side adjacent to angle B). Therefore, the length of DE, which is the side opposite to angle B, is 3 × 2 = 6."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 220 160\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"20\" y1=\"140\" x2=\"90\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"90\" y1=\"20\" x2=\"200\" y2=\"140\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"20\" y1=\"140\" x2=\"200\" y2=\"140\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"82\" y=\"28\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" transform=\"rotate(20 88 34)\"/><text x=\"8\" y=\"150\" font-size=\"13\" fill=\"currentColor\">R</text><text x=\"85\" y=\"14\" font-size=\"13\" fill=\"currentColor\">S</text><text x=\"205\" y=\"150\" font-size=\"13\" fill=\"currentColor\">T</text><text x=\"45\" y=\"75\" font-size=\"13\" fill=\"currentColor\">12</text><text x=\"150\" y=\"75\" font-size=\"13\" fill=\"currentColor\">5</text></svg>In triangle RST above, point W (not shown) lies on RT. What is the value of cos(∠RSW) − sin(∠WST)?",
    "answer": 0,
    "explanation": "The correct answer is 0. Note that no matter where point W is on RT, the sum of the measures of ∠RSW and ∠WST is equal to the measure of ∠RST, which is 90°. Thus, ∠RSW and ∠WST are complementary angles. Since the cosine of an angle is equal to the sine of its complementary angle, cos(∠RSW) = sin(∠WST). Therefore, cos(∠RSW) − sin(∠WST) = 0."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "mc",
    "text": "Triangle ABC is similar to triangle DEF, where A corresponds to D and C corresponds to F. Angles C and F are right angles. If tan(A) = √3 and DF = 125, what is the length of DE?",
    "choices": ["125√3/3", "125√3/2", "125√3", "250"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect and may result from conceptual or calculation errors.",
      "Incorrect and may result from conceptual or calculation errors.",
      "Incorrect. This is the length of EF, not DE.",
      "Correct. tan(D) = √3 means EF = 125√3, making triangle DEF a 30-60-90 triangle where hypotenuse DE = 2(DF) = 2(125) = 250."
    ],
    "explanation": "Choice D is correct. Corresponding angles in similar triangles have equal measures. It's given that triangle ABC is similar to triangle DEF, where A corresponds to D, so the measure of angle A is equal to the measure of angle D. Therefore, if tan(A) = √3, then tan(D) = √3. It's given that angles C and F are right angles, so triangles ABC and DEF are right triangles. The adjacent side of an acute angle in a right triangle is the side closest to the angle that is not the hypotenuse. It follows that the adjacent side of angle D is side DF. The opposite side of an acute angle in a right triangle is the side across from the acute angle. It follows that the opposite side of angle D is side EF. The tangent of an acute angle in a right triangle is the ratio of the length of the opposite side to the length of the adjacent side. Therefore, tan(D) = EF/DF. If DF = 125, the length of side EF can be found by substituting √3 for tan(D) and 125 for DF in the equation tan(D) = EF/DF, which yields √3 = EF/125. Multiplying both sides of this equation by 125 yields 125√3 = EF. Since the length of side EF is √3 times the length of side DF, it follows that triangle DEF is a special right triangle with angle measures 30°, 60°, and 90°. Therefore, the length of the hypotenuse, DE, is 2 times the length of side DF, or DE = 2(DF). Substituting 125 for DF in this equation yields DE = 2(125), or DE = 250. Thus, if tan(A) = √3 and DF = 125, the length of DE is 250.<br><br>Choice A is incorrect and may result from conceptual or calculation errors. Choice B is incorrect and may result from conceptual or calculation errors. Choice C is incorrect. This is the length of EF, not DE."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "fr",
    "text": "The length of a rectangle's diagonal is 3√17, and the length of the rectangle's shorter side is 3. What is the length of the rectangle's longer side?",
    "answer": 12,
    "explanation": "The correct answer is 12. The diagonal of a rectangle forms a right triangle, where the shorter side and the longer side of the rectangle are the legs of the triangle and the diagonal of the rectangle is the hypotenuse of the triangle. It's given that the length of the rectangle's diagonal is 3√17 and the length of the rectangle's shorter side is 3. Thus, the length of the hypotenuse of the right triangle formed by the diagonal is 3√17 and the length of one of the legs is 3. By the Pythagorean theorem, if a right triangle has a hypotenuse with length c and legs with lengths a and b, then a² + b² = c². Substituting 3√17 for c and 3 for b in this equation yields a² + (3)² = (3√17)², or a² + 9 = 153. Subtracting 9 from both sides of this equation yields a² = 144. Taking the square root of both sides of this equation yields a = ±√144, or a = ±12. Since a represents a length, which must be positive, the value of a is 12. Thus, the length of the rectangle's longer side is 12."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "medium", "type": "mc",
    "text": "<svg viewBox=\"0 0 220 180\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"30\" y1=\"150\" x2=\"190\" y2=\"150\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"190\" y1=\"150\" x2=\"190\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"30\" y1=\"150\" x2=\"190\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"178\" y=\"138\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"12\" y=\"160\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"195\" y=\"20\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"195\" y=\"165\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"105\" y=\"168\" font-size=\"13\" fill=\"currentColor\">21</text><text x=\"198\" y=\"90\" font-size=\"13\" fill=\"currentColor\">20</text><text x=\"95\" y=\"80\" font-size=\"13\" fill=\"currentColor\">29</text></svg>In the figure above, what is the value of tan(A)?",
    "choices": ["20/29", "21/29", "20/21", "21/20"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. This is the value of sin(A), not tan(A).",
      "Incorrect. This is the value of cos(A), not tan(A).",
      "Correct. tan(A) is the ratio of the side opposite angle A (20) to the side adjacent to angle A (21), so tan(A) = 20/21.",
      "Incorrect. This is the value of tan(B), not tan(A)."
    ],
    "explanation": "Choice C is correct. Angle A is an acute angle in a right triangle, so the value of tan(A) is equivalent to the ratio of the length of the side opposite angle A, 20, to the length of the nonhypotenuse side adjacent to angle A, 21. Therefore, tan(A) = 20/21.<br><br>Choice A is incorrect. This is the value of sin(A). Choice B is incorrect. This is the value of cos(A). Choice D is incorrect. This is the value of tan(B)."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "mc",
    "text": "In a right triangle, the tangent of one of the two acute angles is √3/3. What is the tangent of the other acute angle?",
    "choices": ["−√3/3", "−3/√3", "√3/3", "3/√3"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. This assumes the tangent of the other acute angle is the negative of the tangent of the angle described, but tangents of both acute angles in a right triangle are positive.",
      "Incorrect. This assumes the tangent of the other acute angle is the negative reciprocal, but it should be the positive reciprocal.",
      "Incorrect. This treats the tangent of the other acute angle as equal to the tangent of the angle described, but they are reciprocals, not equal, unless the angle is 45°.",
      "Correct. The tangents of the two acute angles in a right triangle are reciprocals of each other, so the tangent of the other angle is the reciprocal of √3/3, which is 3/√3."
    ],
    "explanation": "Choice D is correct. The tangent of a nonright angle in a right triangle is defined as the ratio of the length of the leg opposite the angle to the length of the leg adjacent to the angle. Using that definition for tangent, in a right triangle with legs that have lengths a and b, the tangent of one acute angle is a/b and the tangent for the other acute angle is b/a. It follows that the tangents of the acute angles in a right triangle are reciprocals of each other. Therefore, the tangent of the other acute angle in the given triangle is the reciprocal of √3/3, or 3/√3.<br><br>Choice A is incorrect and may result from assuming that the tangent of the other acute angle is the negative of the tangent of the angle described. Choice B is incorrect and may result from assuming that the tangent of the other acute angle is the negative of the reciprocal of the tangent of the angle described. Choice C is incorrect and may result from interpreting the tangent of the other acute angle as equal to the tangent of the angle described."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "medium", "type": "mc",
    "text": "A right triangle has legs with lengths of 28 centimeters and 20 centimeters. What is the length of this triangle's hypotenuse, in centimeters?",
    "choices": ["8√6", "4√74", "48", "1,184"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect and may result from conceptual or calculation errors.",
      "Correct. By the Pythagorean theorem, 28² + 20² = c², or 1,184 = c², so c = √1,184 = 4√74.",
      "Incorrect and may result from conceptual or calculation errors.",
      "Incorrect. This is the square of the length of the triangle's hypotenuse, not the hypotenuse itself."
    ],
    "explanation": "Choice B is correct. The Pythagorean theorem states that in a right triangle, the sum of the squares of the lengths of the two legs is equal to the square of the length of the hypotenuse. It's given that the right triangle has legs with lengths of 28 centimeters and 20 centimeters. Let c represent the length of this triangle's hypotenuse, in centimeters. Therefore, by the Pythagorean theorem, 28² + 20² = c², or 1,184 = c². Taking the positive square root of both sides of this equation yields √1,184 = c, or 4√74 = c. Therefore, the length of this triangle's hypotenuse, in centimeters, is 4√74.<br><br>Choice A is incorrect and may result from conceptual or calculation errors. Choice C is incorrect and may result from conceptual or calculation errors. Choice D is incorrect. This is the square of the length of the triangle's hypotenuse."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "medium", "type": "mc",
    "text": "The length of a rectangle's diagonal is 5√17, and the length of the rectangle's shorter side is 5. What is the length of the rectangle's longer side?",
    "choices": ["√17", "20", "15√2", "400"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect and may result from dividing the length of the rectangle's diagonal by the length of the rectangle's shorter side, rather than substituting these values into the Pythagorean theorem.",
      "Correct. Using a² + b² = c² with b = 5 and c = 5√17: 25 + b² = 25(17) = 425, so b² = 400 and b = 20.",
      "Incorrect and may result from using the length of the rectangle's diagonal as the length of a leg of the right triangle, rather than the length of the hypotenuse.",
      "Incorrect. This is the square of the length of the rectangle's longer side, not the longer side itself."
    ],
    "explanation": "Choice B is correct. A rectangle's diagonal divides a rectangle into two congruent right triangles, where the diagonal is the hypotenuse of both triangles. It's given that the length of the diagonal is 5√17 and the length of the rectangle's shorter side is 5. Therefore, each of the two right triangles formed by the rectangle's diagonal has a hypotenuse with length 5√17, and a shorter leg with length 5. To calculate the length of the longer leg of each right triangle, the Pythagorean theorem, a² + b² = c², can be used, where a and b are the lengths of the legs and c is the length of the hypotenuse of the triangle. Substituting 5 for a and 5√17 for c in the equation a² + b² = c² yields 5² + b² = (5√17)², which is equivalent to 25 + b² = 25(17), or 25 + b² = 425. Subtracting 25 from each side of this equation yields b² = 400. Taking the positive square root of each side of this equation yields b = 20. Therefore, the length of the longer leg of each right triangle formed by the diagonal of the rectangle is 20. It follows that the length of the rectangle's longer side is 20.<br><br>Choice A is incorrect and may result from dividing the length of the rectangle's diagonal by the length of the rectangle's shorter side, rather than substituting these values into the Pythagorean theorem. Choice C is incorrect and may result from using the length of the rectangle's diagonal as the length of a leg of the right triangle, rather than the length of the hypotenuse. Choice D is incorrect. This is the square of the length of the rectangle's longer side."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 160 180\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"30\" y1=\"150\" x2=\"90\" y2=\"150\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"90\" y1=\"150\" x2=\"90\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"30\" y1=\"150\" x2=\"90\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"78\" y=\"138\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"12\" y=\"160\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"95\" y=\"165\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"95\" y=\"18\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"48\" y=\"80\" font-size=\"13\" fill=\"currentColor\">26</text></svg>Triangle ABC above is a right triangle, and sin(B) = 5/13. What is the length of side BC?",
    "answer": 24,
    "explanation": "The correct answer is 24. The sine of an acute angle in a right triangle is equal to the ratio of the length of the side opposite the angle to the length of the hypotenuse. In the triangle shown, the sine of angle B, or sin(B), is equal to the ratio of the length of side AC to the length of side AB. It's given that the length of side AB is 26 and that sin(B) = 5/13. Therefore, 5/13 = AC/26. Multiplying both sides of this equation by 26 yields AC = 10.<br><br>By the Pythagorean Theorem, the relationship between the lengths of the sides of triangle ABC is as follows: 26² = 10² + BC², or 676 = 100 + BC². Subtracting 100 from both sides of 676 = 100 + BC² yields 576 = BC². Taking the square root of both sides of 576 = BC² yields 24 = BC."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "medium", "type": "mc",
    "text": "<svg viewBox=\"0 0 220 180\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"30\" y1=\"150\" x2=\"190\" y2=\"150\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"30\" y1=\"150\" x2=\"110\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"110\" y1=\"20\" x2=\"190\" y2=\"150\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"110\" y1=\"20\" x2=\"110\" y2=\"150\" stroke=\"currentColor\" stroke-width=\"1.3\"/><rect x=\"110\" y=\"138\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"14\" y=\"165\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"105\" y=\"14\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"195\" y=\"160\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"105\" y=\"168\" font-size=\"13\" fill=\"currentColor\">D</text><text x=\"70\" y=\"55\" font-size=\"11\" fill=\"currentColor\">30°</text><text x=\"130\" y=\"55\" font-size=\"11\" fill=\"currentColor\">60°</text><text x=\"140\" y=\"85\" font-size=\"13\" fill=\"currentColor\">12</text></svg>In triangle ABC above, what is the length of AD?",
    "choices": ["4", "6", "6√2", "6√3"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. If AD were 4, then AB would be 8, but AB is congruent to BC, which has length 12.",
      "Correct. Triangles ADB and CDB are both 30-60-90 triangles sharing BD, so they're congruent; AD is half the hypotenuse AB = BC = 12, so AD = 6.",
      "Incorrect. Following the same procedure as for AD = 4 gives AB a length of 12√2, but AB is congruent to BC, which has length 12.",
      "Incorrect. Following the same procedure as for AD = 4 gives AB a length of 12√3, but AB is congruent to BC, which has length 12."
    ],
    "explanation": "Choice B is correct. Triangles ADB and CDB are both 30°-60°-90° triangles and share BD. Therefore, triangles ADB and CDB are congruent by the angle-side-angle postulate. Using the properties of 30°-60°-90° triangles, the length of AD is half the length of hypotenuse AB. Since the triangles are congruent, AB = BC = 12. So the length of AD is 12/2 = 6.<br><br>Alternate approach: Since angle CBD has a measure of 30°, angle ABC must have a measure of 60°. It follows that triangle ABC is equilateral, so side AC also has length 12. It also follows that the altitude BD is also a median, and therefore the length of AD is half of the length of AC, which is 6.<br><br>Choice A is incorrect. If the length of AD were 4, then the length of AB would be 8. However, this is incorrect because AB is congruent to BC, which has a length of 12. Choices C and D are also incorrect. Following the same procedures as used to test choice A gives AB a length of 12√2 for choice C and 12√3 for choice D. However, these results cannot be true because AB is congruent to BC, which has a length of 12."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "fr",
    "text": "Triangle ABC is similar to triangle DEF, where angle A corresponds to angle D and angles C and F are right angles. The length of AB is 2.9 times the length of DE. If tan A = 21/20, what is the value of sin D? (Enter as a decimal, e.g. 0.7241.)",
    "answer": 0.7241,
    "explanation": "The correct answer is 21/29 (enter as 0.7241). It's given that triangle ABC is similar to triangle DEF, where angle A corresponds to angle D and angles C and F are right angles. In similar triangles, the tangents of corresponding angles are equal. Therefore, if tan A = 21/20, then tan D = 21/20. In a right triangle, the tangent of an acute angle is the ratio of the length of the leg opposite the angle to the length of the leg adjacent to the angle. Therefore, in triangle DEF, if tan D = 21/20, the ratio of the length of EF to the length of DF is 21/20. If the lengths of EF and DF are 21 and 20, respectively, then the ratio of the length of EF to the length of DF is 21/20. In a right triangle, the sine of an acute angle is the ratio of the length of the leg opposite the angle to the length of the hypotenuse. Therefore, the value of sin D is the ratio of the length of EF to the length of DE. The length of DE can be calculated using the Pythagorean theorem, which states that if the lengths of the legs of a right triangle are a and b and the length of the hypotenuse is c, then a² + b² = c². Therefore, if the lengths of EF and DF are 21 and 20, then (21)² + (20)² = (DE)², or 841 = (DE)². Taking the positive square root of both sides of this equation yields 29 = DE. Therefore, if the lengths of EF and DF are 21 and 20, respectively, then the length of DE is 29 and the ratio of the length of EF to the length of DE is 21/29. Thus, if tan A = 21/20, the value of sin D is 21/29."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 240 200\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"20\" y1=\"170\" x2=\"190\" y2=\"170\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"90\" y1=\"170\" x2=\"90\" y2=\"110\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"190\" y1=\"170\" x2=\"190\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"20\" y1=\"170\" x2=\"190\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"78\" y=\"158\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><rect x=\"178\" y=\"158\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"5\" y=\"185\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"55\" y=\"185\" font-size=\"13\" fill=\"currentColor\">8</text><text x=\"95\" y=\"185\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"95\" y=\"105\" font-size=\"13\" fill=\"currentColor\">D</text><text x=\"78\" y=\"140\" font-size=\"12\" fill=\"currentColor\">6</text><text x=\"195\" y=\"185\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"195\" y=\"18\" font-size=\"13\" fill=\"currentColor\">E</text><text x=\"195\" y=\"95\" font-size=\"13\" fill=\"currentColor\">18</text></svg>In the figure above, BD is parallel to AE. What is the length of CE?",
    "answer": 30,
    "explanation": "The correct answer is 30. In the figure given, since BD is parallel to AE and both segments are intersected by CE, then angle BDC and angle AEC are corresponding angles and therefore congruent. Angle BCD and angle ACE are also congruent because they are the same angle. Triangle BCD and triangle ACE are similar because if two angles of one triangle are congruent to two angles of another triangle, the triangles are similar. Since triangle BCD and triangle ACE are similar, their corresponding sides are proportional. So in triangle BCD and triangle ACE, BD corresponds to AE and CD corresponds to CE. Therefore, BD/CD = AE/CE. Since triangle BCD is a right triangle, the Pythagorean theorem can be used to give the value of CD: 6² + 8² = CD². Taking the square root of each side gives CD = 10. Substituting the values in the proportion BD/CD = AE/CE yields 6/10 = 18/CE. Multiplying each side by CE, and then multiplying by 10/6, yields CE = 30. Therefore, the length of CE is 30."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "medium", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 180\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"20\" y1=\"160\" x2=\"160\" y2=\"160\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"160\" y1=\"160\" x2=\"160\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"20\" y1=\"160\" x2=\"160\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"148\" y=\"148\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"85\" y=\"175\" font-size=\"13\" fill=\"currentColor\">a</text><text x=\"170\" y=\"95\" font-size=\"13\" fill=\"currentColor\">6</text><text x=\"70\" y=\"85\" font-size=\"13\" fill=\"currentColor\">21</text><text x=\"25\" y=\"195\" font-size=\"10\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>For the triangle shown, which expression represents the value of a?",
    "choices": ["√(21² − 6²)", "21² − 6²", "√(21 − 6)", "21 − 6"],
    "correct": 0,
    "choiceNotes": [
      "Correct. By the Pythagorean theorem, a² + 6² = 21², so a² = 21² − 6², and since a is a length, a = √(21² − 6²).",
      "Incorrect. This expression represents the value of a², not a.",
      "Incorrect and may result from conceptual errors — subtracting inside the radical before squaring.",
      "Incorrect and may result from conceptual errors — subtracting the side lengths directly rather than applying the Pythagorean theorem."
    ],
    "explanation": "Choice A is correct. For the right triangle shown, the lengths of the legs are a units and 6 units, and the length of the hypotenuse is 21 units. The Pythagorean theorem states that in a right triangle, the sum of the squares of the lengths of the two legs is equal to the square of the length of the hypotenuse. Therefore, a² + 6² = 21². Subtracting 6² from both sides of this equation yields a² = 21² − 6². Taking the square root of both sides of this equation yields a = ±√(21² − 6²). Since a is a length, a must be positive. Therefore, a = √(21² − 6²). Thus, for the triangle shown, √(21² − 6²) represents the value of a.<br><br>Choice B is incorrect. For the triangle shown, this expression represents the value of a², not a. Choice C is incorrect and may result from conceptual errors. Choice D is incorrect and may result from conceptual errors."},

  {"domain": "Geometry & Trigonometry", "skill": "Right Triangles and Trigonometry", "difficulty": "easy", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 180\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"20\" y1=\"160\" x2=\"20\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"20\" y1=\"160\" x2=\"160\" y2=\"160\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"20\" y1=\"20\" x2=\"160\" y2=\"160\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"20\" y=\"148\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"2\" y=\"90\" font-size=\"13\" fill=\"currentColor\">3</text><text x=\"85\" y=\"175\" font-size=\"13\" fill=\"currentColor\">7</text><text x=\"25\" y=\"195\" font-size=\"10\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>The lengths of the legs of a right triangle are shown. Which of the following is closest to the length of the triangle's hypotenuse?",
    "choices": ["3.2", "5", "7.6", "20"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect and may result from conceptual or calculation errors.",
      "Incorrect and may result from conceptual or calculation errors.",
      "Correct. By the Pythagorean theorem, 3² + 7² = c², or 58 = c², so c = √58 ≈ 7.6.",
      "Incorrect and may result from conceptual or calculation errors."
    ],
    "explanation": "Choice C is correct. The Pythagorean theorem states that for a right triangle, a² + b² = c², where a and b represent the lengths of the legs of the triangle and c represents the length of its hypotenuse. In the triangle shown, the legs have lengths of 3 and 7. Substituting 3 for a and 7 for b in the equation a² + b² = c² yields 3² + 7² = c², which is equivalent to 9 + 49 = c², or 58 = c². Taking the positive square root of both sides of this equation yields √58 = c. Thus, the value of c is approximately 7.6. Therefore, of the given choices, 7.6 is the closest to the length of the triangle's hypotenuse.<br><br>Choice A is incorrect and may result from conceptual or calculation errors. Choice B is incorrect and may result from conceptual or calculation errors. Choice D is incorrect and may result from conceptual or calculation errors."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "easy", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 140\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"10\" y1=\"70\" x2=\"190\" y2=\"70\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"60\" y1=\"10\" x2=\"140\" y2=\"130\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"130\" y1=\"10\" x2=\"70\" y2=\"130\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"70\" y=\"58\" font-size=\"12\" fill=\"currentColor\">x°</text><text x=\"120\" y=\"58\" font-size=\"12\" fill=\"currentColor\">z°</text><text x=\"95\" y=\"92\" font-size=\"12\" fill=\"currentColor\">y°</text><text x=\"105\" y=\"75\" font-size=\"11\" fill=\"currentColor\">P</text><text x=\"55\" y=\"135\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure, three lines intersect at point P. If x = 65 and y = 75, what is the value of z?",
    "choices": ["140", "80", "40", "20"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect and may result from finding the value of x + y rather than z.",
      "Incorrect and may result from conceptual or computational errors.",
      "Correct. The angle between the y° and z° angles is vertical to the x° angle, so it measures 65°; since 65° + 75° + z° = 180°, z = 40.",
      "Incorrect and may result from conceptual or computational errors."
    ],
    "explanation": "Choice C is correct. The angle that is shown as lying between the y° angle and the z° angle is a vertical angle with the x° angle. Since vertical angles are congruent and x = 65, the angle between the y° angle and the z° angle measures 65°. Since the 65° angle, the y° angle, and the z° angle are adjacent and form a straight angle, it follows that the sum of the measures of these three angles is 180°, which is represented by the equation 65° + y° + z° = 180°. It's given that y = 75. Substituting 75 for y yields 65° + 75° + z° = 180°, which can be rewritten as 140° + z° = 180°. Subtracting 140° from both sides of this equation yields z° = 40°. Therefore, z = 40.<br><br>Choice A is incorrect and may result from finding the value of x + y rather than z. Choices B and D are incorrect and may result from conceptual or computational errors."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 260 200\" class=\"dx-fig\" style=\"color:var(--text);\"><text x=\"30\" y=\"18\" font-size=\"13\" fill=\"currentColor\">r</text><text x=\"110\" y=\"14\" font-size=\"13\" fill=\"currentColor\">s</text><line x1=\"10\" y1=\"60\" x2=\"230\" y2=\"60\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"236\" y=\"64\" font-size=\"12\" fill=\"currentColor\">q</text><line x1=\"10\" y1=\"140\" x2=\"230\" y2=\"140\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"236\" y=\"144\" font-size=\"12\" fill=\"currentColor\">t</text><line x1=\"40\" y1=\"185\" x2=\"140\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"110\" y1=\"20\" x2=\"210\" y2=\"185\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"100\" y=\"42\" font-size=\"11\" fill=\"currentColor\">a°</text><text x=\"55\" y=\"78\" font-size=\"11\" fill=\"currentColor\">b°</text><text x=\"148\" y=\"155\" font-size=\"11\" fill=\"currentColor\">w°</text><text x=\"166\" y=\"162\" font-size=\"11\" fill=\"currentColor\">w°</text><text x=\"70\" y=\"196\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure, parallel lines q and t are intersected by lines r and s. If a = 43 and b = 122, what is the value of w?",
    "answer": 50.5,
    "explanation": "The correct answer is 101/2 (enter as 50.5). In the figure, lines q, r, and s form a triangle. One interior angle of this triangle is vertical to the angle marked a°; therefore, the interior angle also has measure a°. It's given that a = 43. Therefore, the interior angle of the triangle has measure 43°. A second interior angle of the triangle forms a straight line, q, with the angle marked b°. Therefore, the sum of the measures of these two angles is 180°. It's given that b = 122. Therefore, the angle marked b° has measure 122° and the second interior angle of the triangle has measure (180 − 122)°, or 58°. The sum of the interior angles of a triangle is 180°. Therefore, the measure of the third interior angle of the triangle is (180 − 43 − 58)°, or 79°. It's given that parallel lines q and t are intersected by line r. It follows that the triangle's interior angle with measure 79° is congruent to the same-side interior angle between lines q and t formed by lines t and r. Since this angle is supplementary to the two angles marked w°, the sum of 79°, w°, and w° is 180°. It follows that 79 + w + w = 180, or 79 + 2w = 180. Subtracting 79 from both sides of this equation yields 2w = 101. Dividing both sides of this equation by 2 yields w = 101/2."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "medium", "type": "fr",
    "text": "<svg viewBox=\"0 0 220 100\" class=\"dx-fig\" style=\"color:var(--text);\"><polygon points=\"20,90 90,20 130,90\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"85\" y=\"14\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"6\" y=\"98\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"134\" y=\"98\" font-size=\"13\" fill=\"currentColor\">C</text><polygon points=\"150,80 180,25 205,80\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"176\" y=\"18\" font-size=\"13\" fill=\"currentColor\">E</text><text x=\"140\" y=\"88\" font-size=\"13\" fill=\"currentColor\">D</text><text x=\"208\" y=\"88\" font-size=\"13\" fill=\"currentColor\">F</text><text x=\"20\" y=\"12\" font-size=\"9\" fill=\"currentColor\">Note: Figures not drawn to scale.</text></svg>Triangle ABC and triangle DEF are shown. The relationship between the side lengths of the two triangles is such that AB/DE = BC/EF = AC/DF = 3. If the measure of angle BAC is 20°, what is the measure, in degrees, of angle EDF? (Disregard the degree symbol when gridding your answer.)",
    "answer": 20,
    "explanation": "The correct answer is 20. By the equality given, the three pairs of corresponding sides of the two triangles are in the same proportion. By the side-side-side (SSS) similarity theorem, triangle ABC is similar to triangle DEF. In similar triangles, the measures of corresponding angles are congruent. Since angle BAC corresponds to angle EDF, these two angles are congruent and their measures are equal. It's given that the measure of angle BAC is 20°, so the measure of angle EDF is also 20°."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 220 160\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"10\" y1=\"140\" x2=\"200\" y2=\"140\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"10\" y1=\"140\" x2=\"180\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"90\" y1=\"140\" x2=\"110\" y2=\"70\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"178\" y=\"14\" font-size=\"13\" fill=\"currentColor\">S</text><text x=\"105\" y=\"68\" font-size=\"13\" fill=\"currentColor\">T</text><text x=\"110\" y=\"85\" font-size=\"11\" fill=\"currentColor\">x°</text><text x=\"2\" y=\"150\" font-size=\"13\" fill=\"currentColor\">U</text><text x=\"85\" y=\"155\" font-size=\"13\" fill=\"currentColor\">V</text><text x=\"200\" y=\"150\" font-size=\"13\" fill=\"currentColor\">R</text><text x=\"55\" y=\"12\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure, RT = TU, the measure of angle VST is 29°, and the measure of angle RVS is 41°. What is the value of x?",
    "answer": 156,
    "explanation": "The correct answer is 156. In the figure shown, the sum of the measures of angle UVS and angle RVS is 180°. It's given that the measure of angle RVS is 41°. Therefore, the measure of angle UVS is 180 − 41°, or 139°. The sum of the measures of the interior angles of a triangle is 180°. In triangle UVS, the measure of angle UVS is 139° and it's given that the measure of angle VST is 29°. Thus, the measure of angle VUS is 180 − 139 − 29°, or 12°. It's given that RT = TU. Therefore, triangle TUR is an isosceles triangle and the measure of VUS is equal to the measure of angle TRU. In triangle TUR, the measure of angle VUS is 12° and the measure of angle TRU is 12°. Thus, the measure of angle UTR is 180 − 12 − 12°, or 156°. The figure shows that the measure of angle UTR is x°, so the value of x is 156."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "easy", "type": "mc",
    "text": "At a certain time and day, the Washington Monument in Washington, DC, casts a shadow that is 300 feet long. At the same time, a nearby cherry tree casts a shadow that is 16 feet long. Given that the Washington Monument is approximately 555 feet tall, which of the following is closest to the height, in feet, of the cherry tree?",
    "choices": ["10", "20", "30", "35"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect and may result from a calculation error.",
      "Incorrect and may result from a calculation error.",
      "Correct. Setting up 555/300 = c/16 and solving gives c = 29.6, which is closest to 30.",
      "Incorrect and may result from a calculation error."
    ],
    "explanation": "Choice C is correct. There is a proportional relationship between the height of an object and the length of its shadow. Let c represent the height, in feet, of the cherry tree. The given relationship can be expressed by the proportion 555/300 = c/16. Multiplying both sides of this equation by 16 yields c = 29.6. This height is closest to the value given in choice C, 30.<br><br>Choices A, B, and D are incorrect and may result from calculation errors."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "easy", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 140\" class=\"dx-fig\" style=\"color:var(--text);\"><polygon points=\"30,120 90,20 150,120\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"90\" y1=\"20\" x2=\"55\" y2=\"5\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"30\" y1=\"120\" x2=\"10\" y2=\"120\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"150\" y1=\"120\" x2=\"170\" y2=\"120\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"62\" y=\"18\" font-size=\"12\" fill=\"currentColor\">x°</text><text x=\"38\" y=\"110\" font-size=\"11\" fill=\"currentColor\">70°</text><text x=\"110\" y=\"110\" font-size=\"11\" fill=\"currentColor\">50°</text></svg>In the figure above, two sides of a triangle are extended. What is the value of x?",
    "choices": ["110", "120", "130", "140"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect and may be the result of misinterpreting x° as supplementary to 70°.",
      "Correct. The third interior angle is 180 − 70 − 50 = 60°, and x° is supplementary to it, so x = 180 − 60 = 120.",
      "Incorrect and may be the result of misinterpreting x° as supplementary to 50°.",
      "Incorrect and may be the result of a calculation error."
    ],
    "explanation": "Choice B is correct. The sum of the interior angles of a triangle is 180°. The measures of the two interior angles of the given triangle are shown. Therefore, the measure of the third interior angle is 180° − 70° − 50° = 60°. The angles of measures x° and 60° are supplementary, so their sum is 180°. Therefore, x = 180 − 60 = 120.<br><br>Choice A is incorrect and may be the result of misinterpreting x° as supplementary to 70°. Choice C is incorrect and may be the result of misinterpreting x° as supplementary to 50°. Choice D is incorrect and may be the result of a calculation error."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "easy", "type": "mc",
    "text": "<svg viewBox=\"0 0 220 130\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"10\" y1=\"30\" x2=\"200\" y2=\"30\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"206\" y=\"34\" font-size=\"12\" fill=\"currentColor\">m</text><line x1=\"10\" y1=\"90\" x2=\"200\" y2=\"90\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"206\" y=\"94\" font-size=\"12\" fill=\"currentColor\">n</text><line x1=\"20\" y1=\"115\" x2=\"120\" y2=\"5\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"100\" y=\"8\" font-size=\"12\" fill=\"currentColor\">j</text><line x1=\"70\" y1=\"5\" x2=\"170\" y2=\"115\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"175\" y=\"5\" font-size=\"12\" fill=\"currentColor\">ℓ</text><text x=\"55\" y=\"25\" font-size=\"11\" fill=\"currentColor\">a°</text><text x=\"58\" y=\"66\" font-size=\"11\" fill=\"currentColor\">b°</text><rect x=\"116\" y=\"22\" width=\"10\" height=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"125\" y=\"78\" font-size=\"11\" fill=\"currentColor\">y°</text><text x=\"40\" y=\"128\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure above, lines m and n are parallel. What is the value of b?",
    "choices": ["40", "50", "65", "80"],
    "correct": 0,
    "choiceNotes": [
      "Correct. The 130° angle is supplementary to the leftmost a° angle, giving a = 50; since ℓ and m meet at a right angle, a° and b° are complementary, so b = 40.",
      "Incorrect. This is the value of a, not b.",
      "Incorrect and may be the result of dividing 130° by 2.",
      "Incorrect and may be the result of multiplying b by 2."
    ],
    "explanation": "Choice A is correct. Given that lines m and n are parallel, the angle marked 130° must be supplementary to the leftmost angle marked a° because they are same-side interior angles. Therefore, 130° + a° = 180°, which yields a = 50°. Lines ℓ and m intersect at a right angle, so lines j, ℓ, and m form a right triangle where the two acute angles are a° and b°. The acute angles of a right triangle are complementary, so a° + b° = 90°, which yields 50° + b° = 90°, and b = 40.<br><br>Choice B is incorrect. This is the value of a, not b. Choice C is incorrect and may be the result of dividing 130° by 2. Choice D is incorrect and may be the result of multiplying b by 2."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "easy", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 130\" class=\"dx-fig\" style=\"color:var(--text);\"><polygon points=\"20,120 70,10 190,120\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"64\" y=\"8\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"45\" y=\"35\" font-size=\"11\" fill=\"currentColor\">31°</text><text x=\"6\" y=\"128\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"196\" y=\"128\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"58\" y=\"113\" font-size=\"11\" fill=\"currentColor\">2b°</text><text x=\"96\" y=\"113\" font-size=\"11\" fill=\"currentColor\">a°</text></svg>In the triangle above, a = 45. What is the value of b?",
    "choices": ["52", "59", "76", "104"],
    "correct": 0,
    "choiceNotes": [
      "Correct. Since 31 + 2b + a = 180 and a = 45, 2b = 104, so b = 52.",
      "Incorrect and may result from a calculation error.",
      "Incorrect. This is the value of a + 31.",
      "Incorrect. This is the value of 2b."
    ],
    "explanation": "Choice A is correct. The sum of the measures of the three interior angles of a triangle is 180°. Therefore, 31 + 2b + a = 180. Since it's given that a = 45, it follows that 31 + 2b + 45 = 180, or 2b = 104. Dividing both sides of this equation by 2 yields b = 52.<br><br>Choice B is incorrect and may result from a calculation error. Choice C is incorrect. This is the value of a + 31. Choice D is incorrect. This is the value of 2b."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "medium", "type": "mc",
    "text": "In a right triangle, the measure of one of the acute angles is 51°. What is the measure, in degrees, of the other acute angle?",
    "choices": ["6", "39", "49", "51"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect and may result from conceptual or calculation errors.",
      "Correct. The two acute angles of a right triangle sum to 90°, so the other acute angle is 90 − 51 = 39.",
      "Incorrect and may result from conceptual or calculation errors.",
      "Incorrect. This is the measure of the acute angle whose measure is given."
    ],
    "explanation": "Choice B is correct. The sum of the measures of the interior angles of a triangle is 180 degrees. Since the triangle is a right triangle, it has one angle that measures 90 degrees. Therefore, the sum of the measures, in degrees, of the remaining two angles is 180 − 90, or 90. It's given that the measure of one of the acute angles in the triangle is 51 degrees. Therefore, the measure, in degrees, of the other acute angle is 90 − 51, or 39.<br><br>Choice A is incorrect and may result from conceptual or calculation errors. Choice C is incorrect and may result from conceptual or calculation errors. Choice D is incorrect. This is the measure, in degrees, of the acute angle whose measure is given."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "easy", "type": "mc",
    "text": "<svg viewBox=\"0 0 240 160\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"10\" y1=\"55\" x2=\"140\" y2=\"55\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"146\" y=\"59\" font-size=\"12\" fill=\"currentColor\">m</text><line x1=\"10\" y1=\"115\" x2=\"140\" y2=\"115\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"146\" y=\"119\" font-size=\"12\" fill=\"currentColor\">n</text><line x1=\"195\" y1=\"5\" x2=\"25\" y2=\"150\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"198\" y=\"4\" font-size=\"12\" fill=\"currentColor\">k</text><text x=\"50\" y=\"48\" font-size=\"12\" fill=\"currentColor\">x°</text><text x=\"58\" y=\"128\" font-size=\"11\" fill=\"currentColor\">145°</text><text x=\"55\" y=\"160\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure, line m is parallel to line n, and line k intersects both lines. Which of the following statements is true?",
    "choices": ["The value of x is less than 145.", "The value of x is greater than 145.", "The value of x is equal to 145.", "The value of x cannot be determined."],
    "correct": 2,
    "choiceNotes": [
      "Incorrect and may result from conceptual or calculation errors.",
      "Incorrect and may result from conceptual or calculation errors.",
      "Correct. The angle with measure x° and the angle with measure 145° are vertical angles formed where line k crosses line n, so x = 145.",
      "Incorrect and may result from conceptual or calculation errors."
    ],
    "explanation": "Choice C is correct. Vertical angles, or angles that are opposite each other when two lines intersect, are congruent. It's given that line k intersects line n. Based on the figure, the angle with measure x° and the angle with measure 145° are vertical angles. Therefore, the value of x is equal to 145.<br><br>Choices A, B, and D are incorrect and may result from conceptual or calculation errors."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "easy", "type": "mc",
    "text": "<svg viewBox=\"0 0 240 130\" class=\"dx-fig\" style=\"color:var(--text);\"><polygon points=\"90,10 160,110 60,110\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"160\" y1=\"110\" x2=\"220\" y2=\"110\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"84\" y=\"8\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"70\" y=\"40\" font-size=\"12\" fill=\"currentColor\">x°</text><text x=\"140\" y=\"105\" font-size=\"11\" fill=\"currentColor\">110°</text><text x=\"10\" y=\"122\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"162\" y=\"122\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"224\" y=\"122\" font-size=\"13\" fill=\"currentColor\">D</text></svg>In the given figure, AC extends to point D. If the measure of angle BAC is equal to the measure of angle BCA, what is the value of x?",
    "choices": ["110", "70", "55", "40"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. This is the value of the measure of angle BCD.",
      "Incorrect. This is the value of the measure of each of the other two interior angles, angle BCA and angle BAC.",
      "Incorrect and may result from an error made when identifying the relationship between the exterior angle of a triangle and the interior angles of the triangle.",
      "Correct. Angle BCA = 180 − 110 = 70°, so angle BAC is also 70°; then x = 180 − 70 − 70 = 40."
    ],
    "explanation": "Choice D is correct. Since angle BCD and angle BCA form a linear pair of angles, their measures sum to 180°. It's given that the measure of angle BCD is 110°. Therefore, 110° + angle BCA = 180°. Subtracting 110° from both sides of this equation gives the measure of angle BCA as 70°. It's also given that the measure of angle BAC is equal to the measure of angle BCA. Thus, the measure of angle BAC is also 70°. The measures of the interior angles of a triangle sum to 180°. Thus, 70° + 70° + x° = 180°. Combining like terms on the left-hand side of this equation yields 140° + x° = 180°. Subtracting 140° from both sides of this equation yields x° = 40°, or x = 40.<br><br>Choice A is incorrect. This is the value of the measure of angle BCD. Choice B is incorrect. This is the value of the measure of each of the other two interior angles, angle BCA and angle BAC. Choice C is incorrect and may result from an error made when identifying the relationship between the exterior angle of a triangle and the interior angles of the triangle."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "fr",
    "text": "In triangle RST, angle T is a right angle, point L lies on RS, point K lies on ST, and LK is parallel to RT. If the length of RT is 72 units, the length of LK is 24 units, and the area of triangle RST is 792 square units, what is the length of KT, in units?",
    "answer": 14.67,
    "explanation": "The correct answer is 44/3 (enter as 14.67). It's given that in triangle RST, angle T is a right angle. The area of a right triangle can be found using the formula A = (1/2)ℓ1ℓ2, where A represents the area of the right triangle, ℓ1 represents the length of one leg of the triangle, and ℓ2 represents the length of the other leg of the triangle. In triangle RST, the two legs are RT and ST. Therefore, if the length of RT is 72 and the area of triangle RST is 792, then 792 = (1/2)(72)(ST), or 792 = (36)(ST). Dividing both sides of this equation by 36 yields 22 = ST. Therefore, the length of ST is 22. It's also given that point L lies on RS, point K lies on ST, and LK is parallel to RT. It follows that angle LKS is a right angle. Since triangles RST and LSK share angle S and have right angles T and K, respectively, triangles RST and LSK are similar triangles. Therefore, the ratio of the length of RT to the length of LK is equal to the ratio of the length of ST to the length of SK. If the length of RT is 72 and the length of LK is 24, it follows that the ratio of the length of RT to the length of LK is 72/24, or 3, so the ratio of the length of ST to the length of SK is 3. Therefore, 22/SK = 3. Multiplying both sides of this equation by SK yields 22 = (3)(SK). Dividing both sides of this equation by 3 yields 22/3 = SK. Since the length of ST, 22, is the sum of the length of SK, 22/3, and the length of KT, it follows that the length of KT is 22 − 22/3, or 44/3."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "medium", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 130\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"20\" y1=\"110\" x2=\"180\" y2=\"110\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"20\" y1=\"110\" x2=\"20\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"20\" y1=\"20\" x2=\"180\" y2=\"110\" stroke=\"currentColor\" stroke-width=\"1.3\"/><rect x=\"20\" y=\"98\" width=\"10\" height=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"25\" y=\"38\" font-size=\"11\" fill=\"currentColor\">13°</text><text x=\"140\" y=\"105\" font-size=\"12\" fill=\"currentColor\">a°</text><text x=\"55\" y=\"125\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the right triangle shown, what is the value of a?",
    "choices": ["13", "77", "90", "103"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This is the measure, in degrees, of the other acute interior angle of the right triangle, not the value of a.",
      "Correct. 90 + 13 + a = 180, so a = 77.",
      "Incorrect. This is the measure, in degrees, of the right angle of the right triangle, not the value of a.",
      "Incorrect. This is the sum of the measures, in degrees, of the other two interior angles of the right triangle, not the value of a."
    ],
    "explanation": "Choice B is correct. The triangle shown is a right triangle, where the interior angle shown with a right angle symbol has a measure of 90°. It's shown that the other two interior angles measure 13° and a°. The sum of the measures of the interior angles of a triangle is 180°; therefore, 90 + 13 + a = 180. Combining like terms on the left-hand side of this equation yields 103 + a = 180. Subtracting 103 from both sides of this equation yields a = 77.<br><br>Choice A is incorrect. This is the measure, in degrees, of the other acute interior angle of the right triangle, not the value of a. Choice C is incorrect. This is the measure, in degrees, of the right angle of the right triangle, not the value of a. Choice D is incorrect. This is the sum of the measures, in degrees, of the other two interior angles of the right triangle, not the value of a."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 240 130\" class=\"dx-fig\" style=\"color:var(--text);\"><polygon points=\"20,110 120,10 220,110\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"120\" y1=\"10\" x2=\"120\" y2=\"110\" stroke=\"currentColor\" stroke-width=\"1.3\"/><rect x=\"120\" y=\"98\" width=\"10\" height=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"115\" y=\"8\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"6\" y=\"122\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"222\" y=\"122\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"126\" y=\"122\" font-size=\"13\" fill=\"currentColor\">D</text><text x=\"50\" y=\"6\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure above, BD = 6 and AD = 8. What is the length of DC?",
    "answer": 4.5,
    "explanation": "The correct answer is 4.5. According to the properties of right triangles, BD divides triangle ABC into two similar triangles, ABD and BCD. The corresponding sides of ABD and BCD are proportional, so the ratio of BD to AD is the same as the ratio of DC to BD. Expressing this information as a proportion gives 6/8 = DC/6. Solving the proportion for DC results in DC = 4.5. Note that 4.5 and 9/2 are examples of ways to enter a correct answer."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 260 200\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"20\" y1=\"30\" x2=\"230\" y2=\"180\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"230\" y1=\"30\" x2=\"70\" y2=\"180\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"20\" y1=\"180\" x2=\"230\" y2=\"180\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"226\" y=\"24\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"110\" y=\"92\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"6\" y=\"192\" font-size=\"13\" fill=\"currentColor\">D</text><text x=\"125\" y=\"192\" font-size=\"13\" fill=\"currentColor\">E</text><text x=\"235\" y=\"192\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"60\" y=\"14\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure, AC = CD. The measure of angle EBC is 45°, and the measure of angle ACD is 104°. What is the value of x, where x° is the measure of angle AEB?",
    "answer": 83,
    "explanation": "The correct answer is 83. It's given that in the figure, AC = CD. Thus, triangle ACD is an isosceles triangle and the measure of angle CDA is equal to the measure of angle CAD. The sum of the measures of the interior angles of a triangle is 180°. Thus, the sum of the measures of interior angles CDA and CAD of triangle ACD is (180 − 104)°, or 76°. Since the measure of angle CDA is equal to the measure of angle CAD, the measure of angle CDA is half of 76°, or 38°. The sum of the measures of the interior angles of triangle BDE is 180°. It's given that the measure of angle EBC is 45°. Since the measure of angle BDE, which is the same angle as angle CDA, is 38°, it follows that the measure of angle DEB is (180 − 45 − 38)°, or 97°. Since angle DEB and angle AEB form a straight line, the sum of the measures of these angles is 180°. It's given in the figure that the measure of angle AEB is x°. It follows that 97 + x = 180. Subtracting 97 from both sides of this equation yields x = 83."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "medium", "type": "mc",
    "text": "<svg viewBox=\"0 0 220 150\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"10\" y1=\"60\" x2=\"150\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"156\" y=\"78\" font-size=\"12\" fill=\"currentColor\">q</text><line x1=\"10\" y1=\"120\" x2=\"150\" y2=\"135\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"156\" y=\"138\" font-size=\"12\" fill=\"currentColor\">t</text><line x1=\"70\" y1=\"140\" x2=\"120\" y2=\"10\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"122\" y=\"6\" font-size=\"12\" fill=\"currentColor\">r</text><line x1=\"140\" y1=\"10\" x2=\"25\" y2=\"140\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"142\" y=\"6\" font-size=\"12\" fill=\"currentColor\">s</text><text x=\"106\" y=\"32\" font-size=\"11\" fill=\"currentColor\">y°</text><text x=\"38\" y=\"70\" font-size=\"11\" fill=\"currentColor\">z°</text><text x=\"90\" y=\"128\" font-size=\"11\" fill=\"currentColor\">w°</text><text x=\"90\" y=\"128\" font-size=\"11\" fill=\"currentColor\">w°</text><text x=\"55\" y=\"148\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure above, lines q and t are parallel, y = 20, and z = 60. What is the value of x?",
    "choices": ["120", "100", "90", "80"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect and may result from incorrectly assuming that angles x + z = 180.",
      "Correct. Since lines q and t are parallel, the third angle of the smaller triangle equals y = 20; then a + x + z = 180 gives 20 + x + 60 = 180, so x = 100.",
      "Incorrect and may result from incorrectly assuming that the smaller triangle is a right triangle, with x as the right angle.",
      "Incorrect and may result from a misunderstanding of the exterior angle theorem and incorrectly assuming that x = y + z."
    ],
    "explanation": "Choice B is correct. Let the measure of the third angle in the smaller triangle be a°. Since lines q and t are parallel and cut by transversals, it follows that the corresponding angles formed are congruent. So a° = y° = 20°. The sum of the measures of the interior angles of a triangle is 180°, which for the interior angles in the smaller triangle yields a + x + z = 180. Given that z = 60 and a = 20, it follows that 20 + x + 60 = 180. Solving for x gives x = 180 − 60 − 20, or x = 100.<br><br>Choice A is incorrect and may result from incorrectly assuming that angles x + z = 180. Choice C is incorrect and may result from incorrectly assuming that the smaller triangle is a right triangle, with x as the right angle. Choice D is incorrect and may result from a misunderstanding of the exterior angle theorem and incorrectly assuming that x = y + z."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "medium", "type": "mc",
    "text": "<svg viewBox=\"0 0 220 130\" class=\"dx-fig\" style=\"color:var(--text);\"><polygon points=\"110,10 20,120 200,120\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"60\" y1=\"70\" x2=\"160\" y2=\"70\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"104\" y=\"8\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"55\" y=\"64\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"164\" y=\"64\" font-size=\"13\" fill=\"currentColor\">D</text><text x=\"6\" y=\"128\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"204\" y=\"128\" font-size=\"13\" fill=\"currentColor\">E</text></svg>In the figure above, segments AE and BD are parallel. If angle BDC measures 58° and angle ACE measures 62°, what is the measure of angle CAE?",
    "choices": ["58°", "60°", "62°", "120°"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect. This is the measure of angle AEC, not that of angle CAE.",
      "Correct. Since AE and BD are parallel, angle CEA = angle BDC = 58°; then 62 + 58 + x = 180 gives x = 60.",
      "Incorrect. This is the measure of angle ACE, not that of CAE.",
      "Incorrect. This is the sum of the measures of angles ACE and CEA."
    ],
    "explanation": "Choice B is correct. It's given that angle ACE measures 62°. Since segments AE and BD are parallel, angles BDC and CEA are congruent. Therefore, angle CEA measures 58°. The sum of the measures of angles ACE, CEA, and CAE is 180° since the sum of the interior angles of triangle ACE is equal to 180°. Let the measure of angle CAE be x°. Therefore, 62 + 58 + x = 180, which simplifies to x = 60. Thus, the measure of angle CAE is 60°.<br><br>Choice A is incorrect. This is the measure of angle AEC, not that of angle CAE. Choice C is incorrect. This is the measure of angle ACE, not that of CAE. Choice D is incorrect. This is the sum of the measures of angles ACE and CEA."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 140\" class=\"dx-fig\" style=\"color:var(--text);\"><polygon points=\"20,120 90,10 190,120\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"90\" y1=\"10\" x2=\"120\" y2=\"120\" stroke=\"currentColor\" stroke-width=\"1.3\"/><rect x=\"110\" y=\"108\" width=\"10\" height=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"84\" y=\"8\" font-size=\"13\" fill=\"currentColor\">N</text><text x=\"50\" y=\"55\" font-size=\"13\" fill=\"currentColor\">3</text><text x=\"105\" y=\"55\" font-size=\"13\" fill=\"currentColor\">4</text><text x=\"6\" y=\"132\" font-size=\"13\" fill=\"currentColor\">M</text><text x=\"122\" y=\"132\" font-size=\"13\" fill=\"currentColor\">Q</text><text x=\"194\" y=\"132\" font-size=\"13\" fill=\"currentColor\">P</text></svg>In the figure above, what is the length of NQ?",
    "choices": ["2.2", "2.3", "2.4", "2.5"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect and may result from setting up an incorrect ratio.",
      "Incorrect and may result from setting up an incorrect ratio.",
      "Correct. MP is the hypotenuse of right triangle MNP with legs 3 and 4, so MP = 5; triangle MNP is similar to triangle NQP, giving NQ/MN = NP/MP, so NQ = (3)(4)/5 = 2.4.",
      "Incorrect and may result from setting up an incorrect ratio."
    ],
    "explanation": "Choice C is correct. First, MP is the hypotenuse of right triangle MNP, whose legs have lengths 3 and 4. Therefore, (MP)² = 3² + 4², so (MP)² = 25 and MP = 5. Second, because angle MNP corresponds to angle NQP and because angle MPN corresponds to angle NPQ, triangle MNP is similar to triangle NQP. The ratio of corresponding sides of similar triangles is constant, so NQ/MN = NP/MP. Since MP = 5 and it's given that MN = 3 and NP = 4, NQ/3 = 4/5. Solving for NQ results in NQ = 12/5, or 2.4.<br><br>Choices A, B, and D are incorrect and may result from setting up incorrect ratios."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "medium", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 130\" class=\"dx-fig\" style=\"color:var(--text);\"><polygon points=\"20,110 120,110 160,20 60,20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"40\" y1=\"65\" x2=\"140\" y2=\"65\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"2\" y=\"120\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"55\" y=\"120\" font-size=\"13\" fill=\"currentColor\">D</text><text x=\"124\" y=\"120\" font-size=\"13\" fill=\"currentColor\">F</text><text x=\"55\" y=\"16\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"163\" y=\"16\" font-size=\"13\" fill=\"currentColor\">E</text><text x=\"20\" y=\"60\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"144\" y=\"60\" font-size=\"13\" fill=\"currentColor\">9</text><text x=\"20\" y=\"88\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure above, AF, BE, and CD are parallel. Points B and E lie on AC and FD, respectively. If AB = 9, BC = 18.5, and FE = 8.5, what is the length of ED, to the nearest tenth?",
    "choices": ["16.8", "17.5", "18.4", "19.6"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect and may result from an error made when setting up the proportion.",
      "Correct. Since quadrilaterals AFEB and BEDC are similar, 9/18.5 = 8.5/x gives x = 17.5.",
      "Incorrect and may result from an error made when setting up the proportion.",
      "Incorrect and may result from an error made when setting up the proportion."
    ],
    "explanation": "Choice B is correct. Since AF, BE, and CD are parallel, quadrilaterals AFEB and BEDC are similar. Let x represent the length of ED. With similar figures, the ratios of the lengths of corresponding sides are equal. It follows that 9/18.5 = 8.5/x. Multiplying both sides of this equation by 18.5 and by x yields 9x = (18.5)(8.5), or 9x = 157.25. Dividing both sides of this equation by 9 yields x = 17.47, which to the nearest tenth is 17.5.<br><br>Choices A, C, and D are incorrect and may result from errors made when setting up the proportion."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "medium", "type": "mc",
    "text": "In triangle ABC, the measure of angle A is 50°. If triangle ABC is isosceles, which of the following is NOT a possible measure of angle B?",
    "choices": ["50°", "65°", "80°", "100°"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect. If angle B has measure 50°, then angle C would measure 80°, and 50°, 50°, and 80° could be the angle measures of an isosceles triangle.",
      "Incorrect. If angle B has measure 65°, then angle C would measure 65°, and 50°, 65°, and 65° could be the angle measures of an isosceles triangle.",
      "Incorrect. If angle B has measure 80°, then angle C would measure 50°, and 50°, 80°, and 50° could be the angle measures of an isosceles triangle.",
      "Correct. If angle B measured 100°, angle C would measure 30°, giving angle measures 50°, 100°, and 30° — no two of which are equal, so angle B can't measure 100° in an isosceles triangle."
    ],
    "explanation": "Choice D is correct. The sum of the three interior angles in a triangle is 180°. It's given that angle A measures 50°. If angle B measured 100°, the measure of angle C would be 180° − (50° + 100°) = 30°. Thus, the measures of the angles in the triangle would be 50°, 100°, and 30°. However, an isosceles triangle has two angles of equal measure. Therefore, angle B can't measure 100°.<br><br>Choice A is incorrect. If angle B has measure 50°, then angle C would measure 180° − (50° + 50°) = 80°, and 50°, 50°, and 80° could be the angle measures of an isosceles triangle. Choice B is incorrect. If angle B has measure 65°, then angle C would measure 180° − (65° + 50°) = 65°, and 50°, 65°, and 65° could be the angle measures of an isosceles triangle. Choice C is incorrect. If angle B has measure 80°, then angle C would measure 180° − (80° + 50°) = 50°, and 50°, 80°, and 50° could be the angle measures of an isosceles triangle."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "medium", "type": "mc",
    "text": "<svg viewBox=\"0 0 260 130\" class=\"dx-fig\" style=\"color:var(--text);\"><polygon points=\"20,105 100,20 130,105\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><rect x=\"110\" y=\"93\" width=\"10\" height=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"55\" y=\"100\" font-size=\"11\" fill=\"currentColor\">32°</text><text x=\"20\" y=\"120\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"96\" y=\"14\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"133\" y=\"120\" font-size=\"13\" fill=\"currentColor\">C</text><polygon points=\"160,105 210,20 240,105\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><rect x=\"220\" y=\"93\" width=\"10\" height=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"175\" y=\"100\" font-size=\"11\" fill=\"currentColor\">58°</text><text x=\"156\" y=\"120\" font-size=\"13\" fill=\"currentColor\">D</text><text x=\"206\" y=\"14\" font-size=\"13\" fill=\"currentColor\">E</text><text x=\"243\" y=\"120\" font-size=\"13\" fill=\"currentColor\">F</text></svg>Triangles ABC and DEF are shown above. Which of the following is equal to the ratio BC/AB?",
    "choices": ["DE/DF", "DF/DE", "DF/EF", "EF/DE"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect because DE/DF is the reciprocal of the ratio BC/AB.",
      "Correct. In right triangle ABC, BC/AB = sin(32°); in right triangle DEF, angle E = 32°, and DF/DE = sin(32°), so DF/DE = BC/AB.",
      "Incorrect because DF/EF = BC/AC, not BC/AB.",
      "Incorrect because EF/DE = AC/AB, not BC/AB."
    ],
    "explanation": "Choice B is correct. In right triangle ABC, the measure of angle B must be 58° because the sum of the measure of angle A, which is 32°, and the measure of angle B is 90°. Angle D in the right triangle DEF has measure 58°. Hence, triangles ABC and DEF are similar (by angle-angle similarity). Since BC is the side opposite to the angle with measure 32° and AB is the hypotenuse in right triangle ABC, the ratio BC/AB is equal to the ratio DF/DE.<br><br>Alternate approach: The trigonometric ratios can be used to answer this question. In right triangle ABC, the ratio BC/AB = sin(32°). The angle E in triangle DEF has measure 32° because m(∠D) + m(∠E) = 90°. In triangle DEF, the ratio DF/DE = sin(32°). Therefore, DF/DE = BC/AB.<br><br>Choice A is incorrect because DE/DF is the reciprocal of the ratio BC/AB. Choice C is incorrect because DF/EF = BC/AC, not BC/AB. Choice D is incorrect because EF/DE = AC/AB, not BC/AB."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "medium", "type": "mc",
    "text": "Two nearby trees are perpendicular to the ground, which is flat. One of these trees is 10 feet tall and has a shadow that is 5 feet long. At the same time, the shadow of the other tree is 2 feet long. How tall, in feet, is the other tree?",
    "choices": ["3", "4", "8", "27"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect and may result from calculating the difference between the lengths of the shadows, rather than the height of the other tree.",
      "Correct. Setting up 10/5 = x/2 gives x = 4.",
      "Incorrect and may result from calculating the difference between the height of the 10-foot-tall tree and the length of the shadow of the other tree.",
      "Incorrect and may result from a conceptual or calculation error."
    ],
    "explanation": "Choice B is correct. Each tree and its shadow can be modeled using a right triangle, where the height of the tree and the length of its shadow are the legs of the triangle. At a given point in time, the right triangles formed by two nearby trees and their respective shadows will be similar. Therefore, if the height of the other tree is x, in feet, the value of x can be calculated by solving the proportional relationship (10 feet tall)/(5 feet long) = (x feet tall)/(2 feet long). This equation is equivalent to 10/5 = x/2, or 2 = x/2. Multiplying each side of the equation 2 = x/2 by 2 yields 4 = x. Therefore, the other tree is 4 feet tall.<br><br>Choice A is incorrect and may result from calculating the difference between the lengths of the shadows, rather than the height of the other tree. Choice C is incorrect and may result from calculating the difference between the height of the 10-foot-tall tree and the length of the shadow of the other tree, rather than calculating the height of the other tree. Choice D is incorrect and may result from a conceptual or calculation error."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 260 200\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"20\" y1=\"190\" x2=\"110\" y2=\"10\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"110\" y1=\"10\" x2=\"250\" y2=\"110\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"20\" y1=\"190\" x2=\"250\" y2=\"110\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"60\" y1=\"110\" x2=\"200\" y2=\"70\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"105\" y=\"6\" font-size=\"13\" fill=\"currentColor\">N</text><text x=\"55\" y=\"120\" font-size=\"13\" fill=\"currentColor\">M</text><text x=\"200\" y=\"62\" font-size=\"11\" fill=\"currentColor\">60°</text><text x=\"115\" y=\"105\" font-size=\"11\" fill=\"currentColor\">P</text><text x=\"5\" y=\"200\" font-size=\"13\" fill=\"currentColor\">L</text><text x=\"254\" y=\"115\" font-size=\"13\" fill=\"currentColor\">Q</text><text x=\"60\" y=\"6\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure, MQ and NR intersect at point P, NP = QP, and MP = PR. What is the measure, in degrees, of angle QMR? (Disregard the degree symbol when gridding your answer.)",
    "answer": 30,
    "explanation": "The correct answer is 30. It is given that the measure of angle QPR is 60°. Angle MPR and angle QPR are collinear and therefore are supplementary angles. This means that the sum of the two angle measures is 180°, and so the measure of angle MPR is 120°. The sum of the angles in a triangle is 180°. Subtracting the measure of angle MPR from 180° yields the sum of the other angles in the triangle MPR. Since 180 − 120 = 60, the sum of the measures of angle QMR and angle NRM is 60°. It is given that MP = PR, so it follows that triangle MPR is isosceles. Therefore, angle QMR and angle NRM must be congruent. Since the sum of the measure of these two angles is 60°, it follows that the measure of each angle is 30°.<br><br>An alternate approach would be to use the exterior angle theorem, noting that the measure of angle QPR is equal to the sum of the measures of angle QMR and angle NRM. Since both angles are equal, each of them has a measure of 30°."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "easy", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 120\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"10\" y1=\"45\" x2=\"170\" y2=\"45\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"176\" y=\"49\" font-size=\"12\" fill=\"currentColor\">ℓ</text><line x1=\"10\" y1=\"95\" x2=\"170\" y2=\"95\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"176\" y=\"99\" font-size=\"12\" fill=\"currentColor\">k</text><line x1=\"170\" y1=\"5\" x2=\"30\" y2=\"115\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"172\" y=\"4\" font-size=\"12\" fill=\"currentColor\">j</text><text x=\"110\" y=\"40\" font-size=\"11\" fill=\"currentColor\">a°</text><text x=\"70\" y=\"88\" font-size=\"11\" fill=\"currentColor\">64°</text></svg>In the figure above, lines ℓ and k are parallel. What is the value of a?",
    "choices": ["26", "64", "116", "154"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect and likely results from thinking the angle with measure a° is the complement of the angle with measure 64°.",
      "Incorrect and likely results from thinking the angle with measure a° is congruent to the angle with measure 64°.",
      "Correct. Since ℓ and k are parallel, the angle with measure a° must be the supplement of the corresponding angle to 64°, so a = 180 − 64 = 116.",
      "Incorrect and likely results from a conceptual or computational error."
    ],
    "explanation": "Choice C is correct. Since lines ℓ and k are parallel, corresponding angles formed by the intersection of line j with lines ℓ and k are congruent. Therefore, the angle with measure a° must be the supplement of the angle with measure 64°. The sum of two supplementary angles is 180°, so a = 180 − 64 = 116.<br><br>Choice A is incorrect and likely results from thinking the angle with measure a° is the complement of the angle with measure 64°. Choice B is incorrect and likely results from thinking the angle with measure a° is congruent to the angle with measure 64°. Choice D is incorrect and likely results from a conceptual or computational error."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "medium", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 130\" class=\"dx-fig\" style=\"color:var(--text);\"><text x=\"6\" y=\"10\" font-size=\"12\" fill=\"currentColor\">m</text><line x1=\"20\" y1=\"20\" x2=\"110\" y2=\"120\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"55\" y1=\"40\" x2=\"55\" y2=\"120\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"50\" y=\"14\" font-size=\"12\" fill=\"currentColor\">r</text><line x1=\"110\" y1=\"40\" x2=\"110\" y2=\"120\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"106\" y=\"14\" font-size=\"12\" fill=\"currentColor\">s</text><text x=\"55\" y=\"58\" font-size=\"11\" fill=\"currentColor\">x°</text><text x=\"96\" y=\"100\" font-size=\"11\" fill=\"currentColor\">y°</text><text x=\"40\" y=\"128\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure shown, lines r and s are parallel, and line m intersects both lines. If y < 65, which of the following must be true?",
    "choices": ["x < 115", "x > 115", "x + y < 180", "x + y > 180"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect and may result from conceptual or calculation errors.",
      "Correct. The vertical angle to y° forms a same-side interior pair with x°, so x + y = 180; since y < 65, x > 115.",
      "Incorrect. x + y must equal, not be less than, 180.",
      "Incorrect. x + y must equal, not be greater than, 180."
    ],
    "explanation": "Choice B is correct. In the figure shown, the angle measuring y° is congruent to its vertical angle formed by lines s and m, so the measure of the vertical angle is also y°. The vertical angle forms a same-side interior angle pair with the angle measuring x°. It's given that lines r and s are parallel. Therefore, same-side interior angles in the figure are supplementary, which means the sum of the measure of the vertical angle and the measure of the angle measuring x° is 180°, or x + y = 180. Subtracting x from both sides of this equation yields y = 180 − x. Substituting 180 − x for y in the inequality y < 65 yields 180 − x < 65. Adding x to both sides of this inequality yields 180 < 65 + x. Subtracting 65 from both sides of this inequality yields 115 < x, or x > 115. Thus, if y < 65, it must be true that x > 115.<br><br>Choice A is incorrect and may result from conceptual or calculation errors. Choice C is incorrect. x + y must be equal to, not less than, 180. Choice D is incorrect. x + y must be equal to, not greater than, 180."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "mc",
    "text": "<svg viewBox=\"0 0 220 170\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"30\" y1=\"20\" x2=\"200\" y2=\"120\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"170\" y1=\"20\" x2=\"20\" y2=\"140\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"20\" y1=\"140\" x2=\"200\" y2=\"120\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"25\" y=\"14\" font-size=\"13\" fill=\"currentColor\">S</text><text x=\"32\" y=\"36\" font-size=\"11\" fill=\"currentColor\">31°</text><text x=\"120\" y=\"70\" font-size=\"13\" fill=\"currentColor\">T</text><text x=\"120\" y=\"88\" font-size=\"11\" fill=\"currentColor\">114°</text><text x=\"5\" y=\"152\" font-size=\"13\" fill=\"currentColor\">R</text><text x=\"22\" y=\"130\" font-size=\"11\" fill=\"currentColor\">x°</text><text x=\"38\" y=\"152\" font-size=\"13\" fill=\"currentColor\">V</text><text x=\"204\" y=\"132\" font-size=\"13\" fill=\"currentColor\">U</text><text x=\"55\" y=\"6\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure above, RT = TU. What is the value of x?",
    "choices": ["72", "66", "64", "58"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect. This is the measure of angle STR, but angle STR is not congruent to angle SVR.",
      "Incorrect. This is the measure of angle STR, but angle STR is not congruent to angle SVR.",
      "Correct. Triangle RTU is isosceles with base RU, so angle TRU = angle TUR = t; solving 114 + 2t = 180 gives t = 33, and angle SUV = 33; then x = 31 + 33 = 64.",
      "Incorrect and may result from a calculation error."
    ],
    "explanation": "Choice C is correct. Since RT = TU, it follows that triangle RTU is an isosceles triangle with base RU. Therefore, angle TRU and angle TUR are the base angles of an isosceles triangle and are congruent. Let the measures of both angle TRU and angle TUR be t°. According to the triangle sum theorem, the sum of the measures of the three angles of a triangle is 180°. Therefore, 114° + 2t° = 180°, so t = 33. Note that angle TUR is the same angle as angle SUV. Thus, the measure of angle SUV is 33°. According to the triangle exterior angle theorem, an external angle of a triangle is equal to the sum of the opposite interior angles. Therefore, x° is equal to the sum of the measures of angle VSU and angle SUV; that is, 31° + 33° = 64°. Thus, the value of x is 64.<br><br>Choice B is incorrect. This is the measure of angle STR, but angle STR is not congruent to angle SVR. Choices A and D are incorrect and may result from a calculation error."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "easy", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 100\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"10\" y1=\"40\" x2=\"170\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"176\" y=\"20\" font-size=\"12\" fill=\"currentColor\">m</text><line x1=\"10\" y1=\"70\" x2=\"170\" y2=\"90\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"176\" y=\"90\" font-size=\"12\" fill=\"currentColor\">n</text><line x1=\"90\" y1=\"5\" x2=\"55\" y2=\"95\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"92\" y=\"5\" font-size=\"12\" fill=\"currentColor\">t</text><text x=\"70\" y=\"33\" font-size=\"12\" fill=\"currentColor\">134°</text><text x=\"60\" y=\"80\" font-size=\"12\" fill=\"currentColor\">w°</text></svg>In the figure, line m is parallel to line n. What is the value of w?",
    "choices": ["13", "34", "66", "134"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect and may result from conceptual or calculation errors.",
      "Incorrect and may result from conceptual or calculation errors.",
      "Incorrect and may result from conceptual or calculation errors.",
      "Correct. The angle marked 134° and the angle marked w° are corresponding angles formed by transversal t crossing parallel lines m and n, so they're congruent: w = 134."
    ],
    "explanation": "Choice D is correct. It's given that lines m and n are parallel. Since line t intersects both lines m and n, it's a transversal. The angles in the figure marked as 134° and w° are on the same side of the transversal, where one is an interior angle with line m as a side, and the other is an exterior angle with line n as a side. Thus, the marked angles are corresponding angles. When two parallel lines are intersected by a transversal, corresponding angles are congruent and, therefore, have equal measure. It follows that w° = 134°. Therefore, the value of w is 134.<br><br>Choices A, B, and C are incorrect and may result from conceptual or calculation errors."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "easy", "type": "mc",
    "text": "<svg viewBox=\"0 0 200 120\" class=\"dx-fig\" style=\"color:var(--text);\"><polygon points=\"95,10 30,110 165,110\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"90\" y=\"8\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"90\" y=\"35\" font-size=\"11\" fill=\"currentColor\">x°</text><text x=\"10\" y=\"122\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"168\" y=\"122\" font-size=\"13\" fill=\"currentColor\">C</text></svg>In the given triangle, AB = AC and angle ABC has a measure of 67°. What is the value of x?",
    "choices": ["36", "46", "58", "70"],
    "correct": 1,
    "choiceNotes": [
      "Incorrect and may result from a calculation error.",
      "Correct. Since AB = AC, angle ACB is also 67°, so x = 180 − 67 − 67 = 46.",
      "Incorrect and may result from a calculation error.",
      "Incorrect and may result from a calculation error."
    ],
    "explanation": "Choice B is correct. Since AB = AC, the measures of their corresponding angles, angle ABC and angle ACB, are equal. Since angle ABC has a measure of 67°, the measure of angle ACB is also 67°. Since the sum of the measures of the interior angles in a triangle is 180°, it follows that 67 + 67 + x = 180, or 134 + x = 180. Subtracting by 134 on both sides of this equation yields x = 46.<br><br>Choices A, C, and D are incorrect and may result from calculation errors."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "easy", "type": "mc",
    "text": "In triangle XYZ, the measure of angle X is 24° and the measure of angle Y is 98°. What is the measure of angle Z?",
    "choices": ["58°", "74°", "122°", "212°"],
    "correct": 0,
    "choiceNotes": [
      "Correct. 180 − 24 − 98 = 58.",
      "Incorrect and may result from conceptual or calculation errors.",
      "Incorrect. This is the sum of the measures of angle X and angle Y, not the measure of angle Z.",
      "Incorrect and may result from conceptual or calculation errors."
    ],
    "explanation": "Choice A is correct. The triangle angle sum theorem states that the sum of the measures of the interior angles of a triangle is 180°. It's given that in triangle XYZ, the measure of angle X is 24° and the measure of angle Y is 98°. It follows that the measure of angle Z is (180 − 24 − 98)°, or 58°.<br><br>Choice B is incorrect and may result from conceptual or calculation errors. Choice C is incorrect. This is the sum of the measures of angle X and angle Y, not the measure of angle Z. Choice D is incorrect and may result from conceptual or calculation errors."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "medium", "type": "mc",
    "text": "Triangle ABC is similar to triangle XYZ, such that A, B, and C correspond to X, Y, and Z respectively. The length of each side of triangle XYZ is 2 times the length of its corresponding side in triangle ABC. The measure of side AB is 16. What is the measure of side XY?",
    "choices": ["14", "16", "18", "32"],
    "correct": 3,
    "choiceNotes": [
      "Incorrect and may result from conceptual or calculation errors.",
      "Incorrect. This is the measure of side AB, not side XY.",
      "Incorrect and may result from conceptual or calculation errors.",
      "Correct. Since side AB corresponds to side XY and XY is 2 times AB, XY = 2(16) = 32."
    ],
    "explanation": "Choice D is correct. It's given that triangle ABC is similar to triangle XYZ, such that A, B, and C correspond to X, Y, and Z, respectively. Therefore, side AB corresponds to side XY. Since the length of each side of triangle XYZ is 2 times the length of its corresponding side in triangle ABC, it follows that the measure of side XY is 2 times the measure of side AB. Thus, since the measure of side AB is 16, then the measure of side XY is 2(16), or 32.<br><br>Choice A is incorrect and may result from conceptual or calculation errors. Choice B is incorrect. This is the measure of side AB, not side XY. Choice C is incorrect and may result from conceptual or calculation errors."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "easy", "type": "mc",
    "text": "<svg viewBox=\"0 0 260 160\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"120\" y1=\"10\" x2=\"200\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"200\" y1=\"20\" x2=\"220\" y2=\"90\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"200\" y1=\"20\" x2=\"20\" y2=\"60\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"220\" y1=\"90\" x2=\"120\" y2=\"10\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"220\" y1=\"90\" x2=\"140\" y2=\"140\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"114\" y=\"6\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"200\" y=\"14\" font-size=\"11\" fill=\"currentColor\">x°</text><text x=\"200\" y=\"36\" font-size=\"11\" fill=\"currentColor\">C</text><text x=\"205\" y=\"52\" font-size=\"11\" fill=\"currentColor\">y°</text><text x=\"226\" y=\"90\" font-size=\"11\" fill=\"currentColor\">40°</text><text x=\"12\" y=\"70\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"52\" y=\"48\" font-size=\"11\" fill=\"currentColor\">20°</text><text x=\"140\" y=\"152\" font-size=\"13\" fill=\"currentColor\">E</text><text x=\"55\" y=\"6\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure above, AD intersects BE at C. If x = 100, what is the value of y?",
    "choices": ["100", "90", "80", "60"],
    "correct": 2,
    "choiceNotes": [
      "Incorrect and may result from a calculation error.",
      "Incorrect and may result from classifying angle CDE as a right angle.",
      "Correct. Angle BCA = 180 − 100 − 20 = 60°; angle DCE is vertical to it (also 60°); so y = 180 − 60 − 40 = 80.",
      "Incorrect and may result from finding the measure of angle BCA or DCE instead of the measure of angle CDE."
    ],
    "explanation": "Choice C is correct. It's given that x = 100; therefore, substituting 100 for x in triangle ABC gives two known angle measures for this triangle. The sum of the measures of the interior angles of any triangle equals 180°. Subtracting the two known angle measures of triangle ABC from 180° gives the third angle measure: 180° − 100° − 20° = 60°. This is the measure of angle BCA. Since vertical angles are congruent, the measure of angle DCE is also 60°. Subtracting the two known angle measures of triangle CDE from 180° gives the third angle measure: 180° − 60° − 40° = 80°. Therefore, the value of y is 80.<br><br>Choice A is incorrect and may result from a calculation error. Choice B is incorrect and may result from classifying angle CDE as a right angle. Choice D is incorrect and may result from finding the measure of angle BCA or DCE instead of the measure of angle CDE."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 260 190\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"10\" y1=\"20\" x2=\"250\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"5\" y=\"14\" font-size=\"13\" fill=\"currentColor\">P</text><text x=\"35\" y=\"14\" font-size=\"13\" fill=\"currentColor\">Q</text><text x=\"75\" y=\"14\" font-size=\"13\" fill=\"currentColor\">R</text><text x=\"170\" y=\"14\" font-size=\"13\" fill=\"currentColor\">S</text><text x=\"228\" y=\"14\" font-size=\"13\" fill=\"currentColor\">T</text><text x=\"252\" y=\"14\" font-size=\"13\" fill=\"currentColor\">V</text><line x1=\"38\" y1=\"20\" x2=\"75\" y2=\"90\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"75\" y1=\"20\" x2=\"30\" y2=\"95\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"78\" y=\"88\" font-size=\"13\" fill=\"currentColor\">X</text><text x=\"55\" y=\"78\" font-size=\"13\" fill=\"currentColor\">W</text><line x1=\"170\" y1=\"20\" x2=\"130\" y2=\"160\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"230\" y1=\"20\" x2=\"70\" y2=\"90\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"124\" y=\"170\" font-size=\"13\" fill=\"currentColor\">U</text><text x=\"70\" y=\"6\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure shown, points Q, R, S, and T lie on line segment PV, and line segment RU intersects line segment SX at point W. The measure of angle SQX is 48°, the measure of angle SXQ is 86°, the measure of angle SWU is 85°, and the measure of angle VTU is 162°. What is the measure, in degrees, of angle TUR?",
    "answer": 123,
    "explanation": "The correct answer is 123. The triangle angle sum theorem states that the sum of the measures of the interior angles of a triangle is 180 degrees. It's given that the measure of angle SQX is 48° and the measure of angle SXQ is 86°. Since points S, Q, and X form a triangle, it follows from the triangle angle sum theorem that the measure, in degrees, of angle QSX is 180 − 48 − 86, or 46. It's also given that the measure of angle SWU is 85°. Since angle SWU and angle SWR are supplementary angles, the sum of their measures is 180 degrees. It follows that the measure, in degrees, of angle SWR is 180 − 85, or 95. Since points R, S, and W form a triangle, and angle RSW is the same angle as angle QSX, it follows from the triangle angle sum theorem that the measure, in degrees, of angle WRS is 180 − 46 − 95, or 39. It's given that the measure of angle VTU is 162°. Since angle VTU and angle STU are supplementary angles, the sum of their measures is 180 degrees. It follows that the measure, in degrees, of angle STU is 180 − 162, or 18. Since points R, T, and U form a triangle, and angle URT is the same angle as angle WRS, it follows from the triangle angle sum theorem that the measure, in degrees, of angle TUR is 180 − 39 − 18, or 123."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "fr",
    "text": "In right triangle ABC, angle C is the right angle and BC = 162. Point D on side AB is connected by a line segment with point E on side AC such that line segment DE is parallel to side BC and CE = 2AE. What is the length of line segment DE?",
    "answer": 54,
    "explanation": "The correct answer is 54. It's given that in triangle ABC, point D on side AB is connected by a line segment with point E on side AC such that line segment DE is parallel to side BC. It follows that parallel segments DE and BC are intersected by sides AB and AC. If two parallel segments are intersected by a third segment, corresponding angles are congruent. Thus, corresponding angles C and AED are congruent and corresponding angles B and ADE are congruent. Since triangle ADE has two angles that are each congruent to an angle in triangle ABC, triangle ADE is similar to triangle ABC by the angle-angle similarity postulate, where side DE corresponds to side BC, and side AE corresponds to side AC. Since the lengths of corresponding sides in similar triangles are proportional, it follows that DE/BC = AE/AC. Since point E lies on side AC, AE + CE = AC. It's given that CE = 2AE. Substituting 2AE for CE in the equation AE + CE = AC yields AE + 2AE = AC, or 3AE = AC. It's given that BC = 162. Substituting 162 for BC and 3AE for AC in the equation DE/BC = AE/AC yields DE/162 = AE/3AE, or DE/162 = 1/3. Multiplying both sides of this equation by 162 yields DE = 54. Thus, the length of line segment DE is 54."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 220 180\" class=\"dx-fig\" style=\"color:var(--text);\"><line x1=\"25\" y1=\"10\" x2=\"95\" y2=\"95\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"25\" y1=\"10\" x2=\"200\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"15\" y1=\"75\" x2=\"200\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"95\" y1=\"95\" x2=\"140\" y2=\"170\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"18\" y=\"8\" font-size=\"13\" fill=\"currentColor\">M</text><text x=\"5\" y=\"70\" font-size=\"13\" fill=\"currentColor\">L</text><text x=\"205\" y=\"72\" font-size=\"13\" fill=\"currentColor\">Q</text><text x=\"92\" y=\"112\" font-size=\"13\" fill=\"currentColor\">P</text><text x=\"98\" y=\"88\" font-size=\"13\" fill=\"currentColor\">R</text><text x=\"55\" y=\"6\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>In the figure, LQ intersects MP at point R, and LM is parallel to PQ. The lengths of MR, LR, and RP are 6, 7, and 11, respectively. What is the length of LQ?",
    "answer": 19.83,
    "explanation": "The correct answer is 119/6 (enter as 19.83). Since LM is parallel to PQ, triangle LRM and triangle QRP are similar: the angles at R are vertical angles (congruent), and the alternate interior angles formed by the parallel segments LM and PQ with transversals LQ and MP are also congruent. Since triangle LRM is similar to triangle QRP, corresponding sides are proportional: LR/QR = MR/RP. Substituting the given lengths, 7/QR = 6/11. Cross-multiplying gives 6·QR = 77, so QR = 77/6. The length of LQ is the sum of LR and RQ: LQ = LR + RQ = 7 + 77/6 = 42/6 + 77/6 = 119/6, which is approximately 19.83."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 220 130\" class=\"dx-fig\" style=\"color:var(--text);\"><polygon points=\"100,10 20,110 210,110\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"55\" y1=\"110\" x2=\"55\" y2=\"58\" stroke=\"currentColor\" stroke-width=\"1.3\"/><rect x=\"55\" y=\"98\" width=\"10\" height=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"94\" y=\"8\" font-size=\"13\" fill=\"currentColor\">B</text><text x=\"60\" y=\"85\" font-size=\"13\" fill=\"currentColor\">x</text><text x=\"6\" y=\"122\" font-size=\"13\" fill=\"currentColor\">A</text><text x=\"45\" y=\"122\" font-size=\"11\" fill=\"currentColor\">5</text><text x=\"70\" y=\"122\" font-size=\"11\" fill=\"currentColor\">7</text><text x=\"210\" y=\"122\" font-size=\"13\" fill=\"currentColor\">C</text><text x=\"140\" y=\"70\" font-size=\"13\" fill=\"currentColor\">y</text><text x=\"55\" y=\"6\" font-size=\"9\" fill=\"currentColor\">Note: Figure not drawn to scale.</text></svg>The area of triangle ABC above is at least 48 but no more than 60. If y is an integer, what is one possible value of x? (Enter as a decimal, e.g. 3.75.)",
    "answer": 3.75,
    "explanation": "The correct answer is one of 10/3, 15/4, or 25/6 (for example, enter as 3.33, 3.75, or 4.17). The area of triangle ABC can be expressed as (1/2)(5 + 7)y or 6y. It's given that the area of triangle ABC is at least 48 but no more than 60. It follows that 48 ≤ 6y ≤ 60. Dividing by 6 to isolate y in this compound inequality yields 8 ≤ y ≤ 10. Since y is an integer, y = 8, 9, or 10. In the given figure, the two right triangles shown are similar because they have two pairs of congruent angles: their respective right angles and angle A. Therefore, the following proportion is true: x/y = 5/12. Substituting 8 for y in the proportion results in x/8 = 5/12. Cross multiplying and solving for x yields x = 10/3, or approximately 3.33. Substituting 9 for y in the proportion results in x/9 = 5/12. Cross multiplying and solving for x yields x = 15/4, or 3.75. Substituting 10 for y in the proportion results in x/10 = 5/12. Cross multiplying and solving for x yields x = 25/6, or approximately 4.17. On this platform, enter one of these decimal values (3.33, 3.75, or 4.17)."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "hard", "type": "fr",
    "text": "<svg viewBox=\"0 0 200 150\" class=\"dx-fig\" style=\"color:var(--text);\"><text x=\"96\" y=\"10\" font-size=\"12\" fill=\"currentColor\">s</text><line x1=\"90\" y1=\"15\" x2=\"90\" y2=\"140\" stroke=\"currentColor\" stroke-width=\"1.3\"/><line x1=\"20\" y1=\"50\" x2=\"190\" y2=\"25\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"194\" y=\"22\" font-size=\"12\" fill=\"currentColor\">r</text><line x1=\"20\" y1=\"130\" x2=\"190\" y2=\"70\" stroke=\"currentColor\" stroke-width=\"1.3\"/><text x=\"194\" y=\"68\" font-size=\"12\" fill=\"currentColor\">t</text><text x=\"96\" y=\"40\" font-size=\"11\" fill=\"currentColor\">106°</text><text x=\"140\" y=\"58\" font-size=\"11\" fill=\"currentColor\">23°</text><text x=\"55\" y=\"115\" font-size=\"11\" fill=\"currentColor\">x°</text><text x=\"55\" y=\"148\" font-size=\"9\" fill=\"currentColor\">Intersecting lines r, s, and t are shown.</text></svg>Intersecting lines r, s, and t are shown. What is the value of x?",
    "answer": 97,
    "explanation": "The correct answer is 97. The intersecting lines form a triangle, and the angle with measure of x° is an exterior angle of this triangle. The measure of an exterior angle of a triangle is equal to the sum of the measures of the two nonadjacent interior angles of the triangle. One of these angles has measure of 23° and the other, which is supplementary to the angle with measure 106°, has measure of 180° − 106° = 74°. Therefore, the value of x is 23 + 74 = 97."},

  {"domain": "Geometry & Trigonometry", "skill": "Lines, Angles, and Triangles", "difficulty": "medium", "type": "fr",
    "text": "In triangle JKL, the measures of angle K and angle L are each 48°. What is the measure of angle J, in degrees? (Disregard the degree symbol when entering your answer.)",
    "answer": 84,
    "explanation": "The correct answer is 84. The sum of the measures of the interior angles of a triangle is 180°. It's given that in triangle JKL, the measures of angle K and angle L are each 48°. Adding the measures, in degrees, of angle K and angle L gives 48 + 48, or 96. Therefore, the measure of angle J, in degrees, is 180 − 96, or 84."}
];

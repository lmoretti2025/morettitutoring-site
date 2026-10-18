/* RETIRED DIAGNOSTIC ITEMS - a qid -> question lookup, nothing more.
 *
 * WHY. A saved attempt records answers BY POSITION and stamps the qid of each question
 * (portal/index.html, the `q` field). report.html resolves by qid and falls back to
 * position, so an item that leaves banks.js takes its attempts with it: the slot
 * re-points, the Mistakes list shows questions the student never saw, and because the
 * score is recomputed from the resolved question it moves too. That is the 2026-10-12
 * corruption, exactly.
 *
 * banks-v1.js froze the pre-2026-10-13 diagnostic. This file is the general form of the
 * same idea and removes the need for another frozen snapshot: every re-deal appends the
 * items it retired, the file only grows, and no new cutover instant has to be chosen.
 * An item here is EVIDENCE of what some student sat. Append; never edit, never delete.
 *
 * 2026-10-17: math module2Harder re-dealt from 2/8/12 easy/medium/hard to 1/5/16, to sit
 * at the practice tests' median instead of third lowest of fifteen. These are the 22
 * items it replaced.
 *
 * 2026-10-17, later the same day: that re-deal REVERTED. A score simulation showed the
 * comparability problem it was meant to fix did not exist - the diagnostic already sat
 * 2-8 points from the 14-test median - and a label-driven simulation cannot settle the
 * question anyway (it tracks the label mix at r=-0.993). These 22 are the items that
 * were briefly live, kept because the file's whole purpose is that a student who sat an
 * item can still have it resolved, however short its life was.
 *
 * 2026-10-18: math module2Harder re-dealt again, on Luca's explicit call after seeing the
 * measurement - 1/5/16, and every hard item carrying a twist or mechanism. It added
 * NOTHING here, which is the file working as intended: the module it replaced was the
 * original one, already retired on 10-17 and then restored by the revert, so its 22 items
 * were in this list before this deal ran. The dedupe is on qid; append blindly and the
 * same item would land twice.
 */
window.RETIRED_ITEMS = [
 {
  "qid": "de550be0",
  "domain": "Geometry and Trigonometry",
  "skill": "Right Triangles and Trigonometry",
  "difficulty": "medium",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0;\"><img src=\"question-bank-assets/de550be0.png\" alt=\"Right triangle with legs a and 6, hypotenuse 21\" style=\"max-width:280px;width:100%;height:auto;\"/></div><p>Note: Figure not drawn to scale.</p><p>For the triangle shown, which expression represents the value of a?</p>",
  "choices": [
   "√(21<sup>2</sup> − 6<sup>2</sup>)",
   "21<sup>2</sup> − 6<sup>2</sup>",
   "√(21 − 6)",
   "21 − 6"
  ],
  "correct": 0,
  "explanation": "Choice A is correct. For the right triangle shown, the lengths of the legs are a units and 6 units, and the length of the hypotenuse is 21 units. The Pythagorean theorem states that in a right triangle, the sum of the squares of the lengths of the two legs is equal to the square of the length of the hypotenuse. Therefore, a<sup>2</sup> + 6<sup>2</sup> = 21<sup>2</sup>. Subtracting 6<sup>2</sup> from both sides of this equation yields a<sup>2</sup> = 21<sup>2</sup> − 6<sup>2</sup>. Taking the square root of both sides of this equation yields a = ±√(21<sup>2</sup> − 6<sup>2</sup>). Since a is a length, a must be positive. Therefore, a = √(21<sup>2</sup> − 6<sup>2</sup>). Thus, for the triangle shown, √(21<sup>2</sup> − 6<sup>2</sup>) represents the value of a.<br><br>Choice B is incorrect. For the triangle shown, this expression represents the value of a<sup>2</sup>, not a.<br><br>Choice C is incorrect and may result from conceptual errors.<br><br>Choice D is incorrect and may result from conceptual errors.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "b3582ceb",
  "domain": "Algebra",
  "skill": "Linear Functions",
  "difficulty": "easy",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\"><i>h</i>(<i>x</i>) = 4<i>x</i> + 12</div>For what value of <i>x</i> does <i>h</i>(<i>x</i>) = 100?",
  "choices": [
   "13",
   "22",
   "28",
   "88"
  ],
  "correct": 1,
  "explanation": "Choice B is correct. Substituting 100 for <i>h</i>(<i>x</i>) in the given function gives 100 = 4<i>x</i> + 12. Subtracting 12 from both sides of this equation yields 88 = 4<i>x</i>. Dividing both sides of this equation by 4 yields 22 = <i>x</i>. Therefore, <i>h</i>(<i>x</i>) = 100 when <i>x</i> = 22.<br><br>Choice A is incorrect. This is <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">100</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span> &minus; 12, which divides by 4 before subtracting 12. The constant 12 must be subtracted from 100 first, because 12 is added after <i>x</i> is multiplied by 4.<br><br>Choice C is incorrect. This is <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">100 + 12</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span>, which adds 12 to 100 instead of subtracting it.<br><br>Choice D is incorrect. This is 100 &minus; 12, the value of 4<i>x</i>. Since 4<i>x</i> = 88, the value of <i>x</i> is 88 divided by 4.",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "9da41c80",
  "domain": "Advanced Math",
  "skill": "Nonlinear Functions",
  "difficulty": "easy",
  "type": "mc",
  "text": "A ball is dropped from an initial height of 22 feet and bounces off the ground repeatedly. The function <i>h</i> estimates that the maximum height reached after each time the ball hits the ground is 85% of the maximum height reached after the previous time the ball hit the ground. Which equation defines <i>h</i>, where <i>h</i>(<i>n</i>) is the estimated maximum height of the ball after it has hit the ground <i>n</i> times and <i>n</i> is a whole number greater than 1 and less than 10?",
  "choices": [
   "<i>h</i>(<i>n</i>) = 22(0.22)<sup>n</sup>",
   "<i>h</i>(<i>n</i>) = 22(0.85)<sup>n</sup>",
   "<i>h</i>(<i>n</i>) = 85(0.22)<sup>n</sup>",
   "<i>h</i>(<i>n</i>) = 85(0.85)<sup>n</sup>"
  ],
  "correct": 1,
  "explanation": "Choice B is correct. It's given that for the function <i>h</i>, <i>h</i>(<i>n</i>) is the estimated maximum height, in feet, of the ball after it has hit the ground <i>n</i> times. It's also given that the function <i>h</i> estimates that the maximum height reached after each time the ball hits the ground is 85% of the maximum height reached after the previous time the ball hit the ground. It follows that <i>h</i> is a decreasing exponential function that can be written in the form <i>h</i>(<i>n</i>) = a(p/100)<sup>n</sup>, where a is the initial height, in feet, the ball was dropped from and the function estimates that the maximum height reached after each time the ball hits the ground is p% of the maximum height reached after the previous time the ball hit the ground. It's given that the ball is dropped from an initial height of 22 feet. Therefore, a = 22. Since the function <i>h</i> estimates that the maximum height reached after each time the ball hits the ground is 85% of the maximum height reached after the previous time the ball hit the ground, p = 85. Substituting 22 for a and 85 for p in the equation <i>h</i>(<i>n</i>) = a(p/100)<sup>n</sup> yields <i>h</i>(<i>n</i>) = 22(85/100)<sup>n</sup>, or <i>h</i>(<i>n</i>) = 22(0.85)<sup>n</sup>.<br><br>Choice A is incorrect. This function estimates that the maximum height reached after each time the ball hits the ground is 22%, not 85%, of the maximum height reached after the previous time the ball hit the ground. Choice C is incorrect. This function estimates that the ball is dropped from an initial height of 85 feet, not 22 feet, and that the maximum height reached after each time the ball hits the ground is 22%, not 85%, of the maximum height reached after the previous time the ball hit the ground. Choice D is incorrect. This function estimates that the ball is dropped from an initial height of 85 feet, not 22 feet.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "af9addc2",
  "domain": "Problem-Solving and Data Analysis",
  "skill": "Inference from Sample Statistics and Margin of Error",
  "difficulty": "medium",
  "type": "mc",
  "text": "A random sample of 1,500 households in a city was surveyed. Based on the sample, it is estimated that 61% of all households in the city have at least one pet, with an associated margin of error of 3.4%. Which of the following is the most plausible conclusion about the percent of all households in the city that do not have a pet?",
  "choices": [
   "Exactly 39% of all households in the city do not have a pet.",
   "It is plausible that between 57.6% and 64.4% of all households in the city do not have a pet.",
   "It is plausible that more than 42.4% of all households in the city do not have a pet.",
   "It is plausible that between 35.6% and 42.4% of all households in the city do not have a pet."
  ],
  "correct": 3,
  "explanation": "Choice D is correct. Based on the estimate and the margin of error, plausible values for the percent of all households in the city that have at least one pet are between 61% − 3.4%, or 57.6%, and 61% + 3.4%, or 64.4%. Every household either has at least one pet or does not have a pet, so the percent of households that do not have a pet is 100% minus the percent that have at least one pet. Therefore plausible values for the percent of all households in the city that do not have a pet are between 100% − 64.4%, or 35.6%, and 100% − 57.6%, or 42.4%.<br><br>Choice A is incorrect. The estimate for the percent of households that do not have a pet is 100% − 61%, or 39%, but an estimate based on a sample is not known to be exact. The margin of error indicates a range of plausible values.<br><br>Choice B is incorrect. This is the range of plausible values for the percent of households that have at least one pet, not the percent of households that do not have a pet.<br><br>Choice C is incorrect. Percents greater than 42.4% are outside the range of plausible values for the percent of households that do not have a pet.",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "a0b165f8",
  "domain": "Problem-Solving and Data Analysis",
  "skill": "Percentages",
  "difficulty": "hard",
  "type": "mc",
  "text": "A scientist studying the life cycle of dragonflies counted the number of dragonflies in a certain habitat each day for 46 days. On February 15, there were 99 dragonflies in the habitat. The percent increase in the number of dragonflies in the habitat from January 1 to February 15 was 12.50%. How many dragonflies were in the habitat on January 1?",
  "choices": [
   "88",
   "87",
   "12",
   "8"
  ],
  "correct": 0,
  "explanation": "Choice A is correct. It's given that a scientist studying the life cycle of dragonflies counted the number of dragonflies in a certain habitat each day for 46 days. It's also given that on February 15, there were 99 dragonflies in the habitat and that the percent increase in the number of dragonflies in the habitat from January 1 to February 15 was 12.50%. This can be represented by the equation 99 = (1 + 12.50/100)<i>x</i>, where <i>x</i> represents the number of dragonflies in the habitat on January 1. This equation can be rewritten as 99 = 1.125<i>x</i>. Dividing both sides of this equation by 1.125 yields 88 = <i>x</i>. Therefore, there were 88 dragonflies in the habitat on January 1.<br><br>Choice B is incorrect and may result from conceptual or calculation errors.<br><br>Choice C is incorrect and may result from conceptual or calculation errors.<br><br>Choice D is incorrect and may result from conceptual or calculation errors.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "89ff6a0a",
  "domain": "Problem-Solving and Data Analysis",
  "skill": "Probability and Conditional Probability",
  "difficulty": "hard",
  "type": "fr",
  "text": "<table class=\"dx-table\" style=\"margin:0.6em auto;\"><tr><th rowspan=\"2\">Group</th><th colspan=\"3\">Diameter (millimeters)</th></tr><tr><th>Less than 20</th><th>20 to 30</th><th>Greater than 30</th></tr><tr><th>Group 1</th><td>12</td><td>8</td><td>3</td></tr><tr><th>Group 2</th><td>0</td><td>17</td><td>18</td></tr><tr><th>Group 3</th><td>10</td><td>32</td><td>0</td></tr></table>For 100 buttons, the table summarizes the distribution by group and diameter. One of these buttons will be selected at random. What is the probability of selecting a button with a diameter that is less than or equal to 30 millimeters, given that it is <b>not</b> in group 2? (Express your answer as a decimal or fraction, not as a percent.)",
  "answer": "62/65",
  "explanation": "The correct answer is <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">62</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">65</span></span>. It's given that one button will be selected at random out of a total of 100 buttons and that the table shows the distribution of buttons by group and diameter. The probability of selecting a button with a diameter less than or equal to 30 millimeters, given that it is not in group 2, is the number of buttons with a diameter less than or equal to 30 millimeters that are not in group 2 divided by the total number of buttons not in group 2. Based on the table, the buttons not in group 2 are those in group 1 and group 3. In group 1, there are 12 buttons with a diameter less than 20 millimeters and 8 buttons with a diameter from 20 to 30 millimeters, which yields 12 + 8, or 20, buttons with a diameter less than or equal to 30 millimeters. In group 3, there are 10 buttons with a diameter less than 20 millimeters and 32 buttons with a diameter from 20 to 30 millimeters, which yields 10 + 32, or 42, buttons with a diameter less than or equal to 30 millimeters. Therefore, the total number of buttons with a diameter less than or equal to 30 millimeters that are not in group 2 is 20 + 42, or 62. The total number of buttons that are not in group 2 is the sum of all buttons in group 1 and group 3. There are 12 + 8 + 3, or 23, buttons in group 1 and 10 + 32 + 0, or 42, buttons in group 3. Therefore, the total number of buttons in groups 1 and 3 is 23 + 42, or 65. It follows that the probability of selecting a button with a diameter less than or equal to 30 millimeters, given that it is not in group 2, is <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">62</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">65</span></span>. Note that 62/65 or .9538 are examples of ways to enter a correct answer.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "40e3618e",
  "domain": "Geometry and Trigonometry",
  "skill": "Circles",
  "difficulty": "hard",
  "type": "fr",
  "text": "A segment with both endpoints on a circle has a length of 24 units, and its distance from the center of the circle is 5 units. A second segment with both endpoints on the same circle is 12 units from the center. What is the length, in units, of the second segment?",
  "answer": "10",
  "explanation": "The correct answer is 10. The segment drawn from the center perpendicular to such a segment cuts it into two equal halves, forming a right triangle whose hypotenuse is a radius. For the first segment, half its length is 12, so the radius is √(12<sup>2</sup> + 5<sup>2</sup>), which is √169, or 13 units. For the second segment, half its length is √(13<sup>2</sup> − 12<sup>2</sup>), which is √25, or 5 units. The second segment is therefore 2(5), or 10 units long.",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "39bd7e76",
  "domain": "Geometry and Trigonometry",
  "skill": "Area and Volume",
  "difficulty": "hard",
  "type": "mc",
  "text": "A storage tank has the shape of a right circular cylinder with a hemisphere resting on top of it, where the flat face of the hemisphere is the top of the cylinder and has the same radius as the cylinder. The height of the cylinder is 5 times the radius of the hemisphere, and the total height of the tank is 36 feet. What is the volume, in cubic feet, of the tank?",
  "choices": [
   "1,080π",
   "1,224π",
   "1,296π",
   "1,440π"
  ],
  "correct": 1,
  "explanation": "Choice B is correct. The hemisphere rests on the top of the cylinder, and the greatest distance from the flat face of a hemisphere to its surface is the radius of the hemisphere. It follows that the total height of the tank is the height of the cylinder plus the radius of the hemisphere. Let <i>r</i> be the radius, in feet. The height of the cylinder is 5<i>r</i>, so 5<i>r</i> + <i>r</i> = 36, or 6<i>r</i> = 36, which gives <i>r</i> = 6. The height of the cylinder is therefore 5(6), or 30, feet. The volume of a right circular cylinder is π<i>r</i>²<i>h</i>, so the cylinder has a volume of π(6)²(30), or 1,080π, cubic feet. The volume of a sphere is <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span></span>π<i>r</i>³, so a hemisphere has a volume of <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span></span>π<i>r</i>³, and this one has a volume of <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span></span>π(6)³, or 144π, cubic feet. The volume of the tank is 1,080π + 144π, or 1,224π, cubic feet.<br><br>Choice A is incorrect. This is the volume of the cylinder alone. The hemisphere resting on top of it has a volume of <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span></span>π(6)³, or 144π, cubic feet, which must be added.<br><br>Choice C is incorrect. This uses 36 feet as the height of the cylinder and leaves out the hemisphere. The 36 feet is the total height of the tank, and the hemisphere accounts for 6 feet of it, so the cylinder is 30 feet tall.<br><br>Choice D is incorrect. This uses 36 feet as the height of the cylinder. The hemisphere rises a distance equal to its radius, 6 feet, above the top of the cylinder, so the cylinder is 36 − 6, or 30, feet tall.",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "1dd2b1a2",
  "domain": "Geometry and Trigonometry",
  "skill": "Circles",
  "difficulty": "hard",
  "type": "mc",
  "text": "A circular pizza has a radius of 6 inches. The pizza is cut through its center into 8 congruent slices. What is the perimeter, in inches, of one slice?",
  "choices": [
   "<span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">3π</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span>",
   "<span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">9π</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span>",
   "12 + <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">3π</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span>",
   "12 + <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">9π</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span>"
  ],
  "correct": 2,
  "explanation": "Choice C is correct. The circumference of the pizza is 2π(6), or 12π, inches. The 8 slices are congruent, so the arc of each slice is <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">8</span></span> of the circumference, and its length is <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">12π</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">8</span></span>, or <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">3π</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span>, inches. Each of the two straight edges of a slice is a radius of the circle, so each is 6 inches long. The perimeter of one slice is therefore 6 + 6 + <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">3π</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span>, or 12 + <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">3π</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span>, inches.<br><br>Choice A is incorrect. This is the length of the arc of one slice only. The perimeter of a slice also includes its two straight edges, each of which is a radius of the pizza.<br><br>Choice B is incorrect. This is the area, in square inches, of one slice, <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">π(6<sup>2</sup>)</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">8</span></span>, not its perimeter.<br><br>Choice D is incorrect. This uses the area of one slice, <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">9π</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span> square inches, in place of the length of its arc.",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "76f29fa5",
  "domain": "Algebra",
  "skill": "Linear Equations in One Variable",
  "difficulty": "medium",
  "type": "mc",
  "text": "The cost to rent a commercial fishing boat from a certain company is $950 for the first 2 hours and an additional $50 per hour for each hour after the first 2 hours. If the total cost to rent the commercial fishing boat from the company for <i>t</i> hours, where <i>t</i> &gt; 2, is $1,100, which equation represents this situation?",
  "choices": [
   "950(<i>t</i> − 2) + 50<i>t</i> = 1,100",
   "950(2<i>t</i>) + 50<i>t</i> = 1,100",
   "950 + 50(<i>t</i> − 2) = 1,100",
   "950 + 50(2<i>t</i>) = 1,100"
  ],
  "correct": 2,
  "explanation": "Choice C is correct. It's given that the cost to rent a commercial fishing boat is $950 for the first 2 hours and an additional $50 per hour for each hour after the first 2 hours. It's also given that <i>t</i> represents the total number of hours and <i>t</i> &gt; 2. Therefore, the number of additional hours after the first 2 hours can be represented with the expression <i>t</i> − 2. The cost for these additional hours is $50 per hour, so the cost for the additional hours can be represented by the expression 50(<i>t</i> − 2). The total cost can be calculated by adding the cost for the first 2 hours to the cost for the additional hours and can be represented by the expression 950 + 50(<i>t</i> − 2). It's also given that the total cost to rent the commercial fishing boat from the company for <i>t</i> hours is $1,100. Thus, the equation that represents this situation is 950 + 50(<i>t</i> − 2) = 1,100.<br><br>Choice A is incorrect and may result from conceptual errors.<br><br>Choice B is incorrect and may result from conceptual errors.<br><br>Choice D is incorrect and may result from conceptual errors.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "70e29454",
  "domain": "Algebra",
  "skill": "Linear Equations in One Variable",
  "difficulty": "medium",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">a(3 − <i>x</i>) − <i>b</i> = −1 − 2<i>x</i></div>In the equation above, a and <i>b</i> are constants. If the equation has infinitely many solutions, what are the values of a and <i>b</i>?",
  "choices": [
   "a = 2 and <i>b</i> = 1",
   "a = 2 and <i>b</i> = 7",
   "a = −2 and <i>b</i> = 5",
   "a = −2 and <i>b</i> = −5"
  ],
  "correct": 1,
  "explanation": "Choice B is correct. Distributing the a on the left-hand side of the equation gives 3a − <i>b</i> − a<i>x</i> = −1 − 2<i>x</i>. Rearranging the terms in each side of the equation yields −a<i>x</i> + 3a − <i>b</i> = −2<i>x</i> − 1. Since the equation has infinitely many solutions, it follows that the coefficients of <i>x</i> and the free terms on both sides must be equal. That is, −a = −2, or a = 2, and 3a − <i>b</i> = −1. Substituting 2 for a in the equation 3a − <i>b</i> = −1 gives 3(2) − <i>b</i> = −1, so <i>b</i> = 7.<br><br>Choice A is incorrect and may be the result of a conceptual error when finding the value of <i>b</i>. Choices C and D are incorrect and may result from making a sign error when simplifying.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "a1262cdb",
  "domain": "Advanced Math",
  "skill": "Nonlinear Equations in One Variable and Systems of Equations in Two Variables",
  "difficulty": "medium",
  "type": "mc",
  "text": "The equation 12<i>t</i> + <i>b</i> = <i>c</i> relates the variables <i>t</i>, <i>b</i>, and <i>c</i>. Which of the following correctly expresses the value of <i>c</i> − <i>b</i> in terms of <i>t</i>?",
  "choices": [
   "<span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>t</i></span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">12</span></span>",
   "<i>t</i>",
   "<i>t</i> + <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">12</span></span>",
   "12<i>t</i>"
  ],
  "correct": 3,
  "explanation": "Choice D is correct. Subtracting <i>b</i> from each side of the given equation yields 12<i>t</i> = <i>c</i> − <i>b</i>. Therefore, the expression 12<i>t</i> correctly expresses the value of <i>c</i> − <i>b</i> in terms of <i>t</i>.<br><br>Choice A is incorrect and may result from conceptual or calculation errors.<br><br>Choice B is incorrect and may result from conceptual or calculation errors.<br><br>Choice C is incorrect and may result from conceptual or calculation errors.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "55447be2",
  "domain": "Algebra",
  "skill": "Systems of Two Linear Equations in Two Variables",
  "difficulty": "medium",
  "type": "fr",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\"><i>y</i> = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span></span><i>x</i> − 14<br><i>y</i> = −<i>x</i> + 18</div><div>The solution to the given system of equations is (<i>x</i>, <i>y</i>). What is the value of <i>x</i>?</div>",
  "answer": "24",
  "explanation": "The correct answer is 24. The given system of equations can be solved by the substitution method. The first equation in the given system of equations is <i>y</i> = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span></span><i>x</i> − 14. Substituting <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span></span><i>x</i> − 14 for <i>y</i> in the second equation in the given system yields <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span></span><i>x</i> − 14 = −<i>x</i> + 18. Adding 14 to both sides of this equation yields <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span></span><i>x</i> = −<i>x</i> + 32. Adding <i>x</i> to both sides of this equation yields <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span></span><i>x</i> = 32. Multiplying both sides of this equation by <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span> yields <i>x</i> = 24.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "717a1964",
  "domain": "Advanced Math",
  "skill": "Nonlinear Equations in One Variable and Systems of Equations in Two Variables",
  "difficulty": "medium",
  "type": "fr",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\"><i>z</i><sup>2</sup> + 10<i>z</i> − 24 = 0</div>What is one of the solutions to the given equation?",
  "answer": "2",
  "explanation": "The correct answer is either 2 or −12. The left-hand side of the given equation can be rewritten by factoring. The two values that multiply to −24 and add to 10 are 12 and −2. It follows that the given equation can be rewritten as (<i>z</i> + 12)(<i>z</i> − 2) = 0. Setting each factor equal to 0 yields two equations: <i>z</i> + 12 = 0 and <i>z</i> − 2 = 0. Subtracting 12 from both sides of the equation <i>z</i> + 12 = 0 results in <i>z</i> = −12. Adding 2 to both sides of the equation <i>z</i> − 2 = 0 results in <i>z</i> = 2. Note that 2 and -12 are examples of ways to enter a correct answer.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "895628b5",
  "domain": "Advanced Math",
  "skill": "Nonlinear Equations in One Variable and Systems of Equations in Two Variables",
  "difficulty": "medium",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\"><i>y</i> = (<i>x</i> − 2)(<i>x</i> + 4)<br><i>y</i> = 6<i>x</i> − 12</div>Which ordered pair (<i>x</i>, <i>y</i>) is the solution to the given system of equations?",
  "choices": [
   "(0, 2)",
   "(−4, 2)",
   "(2, 0)",
   "(2, −4)"
  ],
  "correct": 2,
  "explanation": "Choice C is correct. The second equation in the given system of equations is <i>y</i> = 6<i>x</i> − 12. Substituting 6<i>x</i> − 12 for <i>y</i> in the first equation of the given system yields 6<i>x</i> − 12 = (<i>x</i> − 2)(<i>x</i> + 4). Factoring 6 out of the left-hand side of this equation yields 6(<i>x</i> − 2) = (<i>x</i> − 2)(<i>x</i> + 4). An expression with a factor of the form (<i>x</i> − a) is equal to zero when <i>x</i> = a. Each side of this equation has a factor of (<i>x</i> − 2), so each side of the equation is equal to zero when <i>x</i> = 2. Substituting 2 for <i>x</i> into the equation 6(<i>x</i> − 2) = (<i>x</i> − 2)(<i>x</i> + 4) yields 6(2 − 2) = (2 − 2)(2 + 4), or 0 = 0, which is true. Substituting 2 for <i>x</i> into the second equation in the given system of equations yields <i>y</i> = 6(2) − 12, or <i>y</i> = 0. Therefore, the solution to the system of equations is the ordered pair (2, 0).<br><br>Choice A is incorrect and may result from switching the order of the solutions for <i>x</i> and <i>y</i>.<br><br>Choice B is incorrect and may result from conceptual or calculation errors.<br><br>Choice D is incorrect and may result from conceptual or calculation errors.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "4e1f56f6",
  "domain": "Advanced Math",
  "skill": "Equivalent Expressions",
  "difficulty": "hard",
  "type": "mc",
  "text": "The expression (2<i>x</i><sup>2</sup> + 5<i>x</i> − 3)(3<i>x</i><sup>2</sup> − 4<i>x</i> + 7) is written in the form <i>ax</i><sup>4</sup> + <i>bx</i><sup>3</sup> + <i>cx</i><sup>2</sup> + <i>dx</i> + <i>e</i>, where <i>a</i>, <i>b</i>, <i>c</i>, <i>d</i>, and <i>e</i> are constants. What is the value of <i>c</i>?",
  "choices": [
   "−29",
   "−15",
   "6",
   "14"
  ],
  "correct": 1,
  "explanation": "Choice B is correct. The <i>x</i><sup>2</sup> term of the product collects every pair of terms whose degrees add to 2. There are three such pairs: (2<i>x</i><sup>2</sup>)(7), which gives 14<i>x</i><sup>2</sup>; (5<i>x</i>)(−4<i>x</i>), which gives −20<i>x</i><sup>2</sup>; and (−3)(3<i>x</i><sup>2</sup>), which gives −9<i>x</i><sup>2</sup>. Adding these gives 14 − 20 − 9, or −15, so <i>c</i> = −15. The rest of the product does not have to be worked out.<br><br>Choice A is incorrect. This collects (5<i>x</i>)(−4<i>x</i>) and (−3)(3<i>x</i><sup>2</sup>) but leaves out the third pair, (2<i>x</i><sup>2</sup>)(7).<br><br>Choice C is incorrect. This multiplies only the two leading coefficients, 2 and 3.<br><br>Choice D is incorrect. This uses only the product (2<i>x</i><sup>2</sup>)(7).",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "528e71ce",
  "domain": "Advanced Math",
  "skill": "Equivalent Expressions",
  "difficulty": "hard",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\"><span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">40<i>x</i> + 100</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2<i>x</i><sup>2</sup> &minus; 5<i>x</i> &minus; 25</span></span> + <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i><sup>2</sup><i>y</i> &minus; 5<i>xy</i></span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4<i>xy</i></span></span></div>Which of the following is equivalent to the given expression?",
  "choices": [
   "5",
   "<span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i> &minus; 1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i> + 15</span></span>",
   "<span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i><sup>2</sup> &minus; 10<i>x</i> + 105</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4(<i>x</i> &minus; 5)</span></span>",
   "<span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i><sup>2</sup> &minus; 10<i>x</i> + 105</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4(2<i>x</i> + 5)</span></span>"
  ],
  "correct": 2,
  "explanation": "Choice C is correct. Factoring the first fraction gives <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">20(2<i>x</i> + 5)</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">(2<i>x</i> + 5)(<i>x</i> &minus; 5)</span></span>, and dividing out the common factor 2<i>x</i> + 5 leaves <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">20</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i> &minus; 5</span></span>. Factoring the second fraction gives <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>xy</i>(<i>x</i> &minus; 5)</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4<i>xy</i></span></span>, and dividing out the common factor <i>xy</i> leaves <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i> &minus; 5</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span>. The least common denominator of the two results is 4(<i>x</i> &minus; 5), so the sum is <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">80 + (<i>x</i> &minus; 5)<sup>2</sup></span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4(<i>x</i> &minus; 5)</span></span>. Expanding the numerator gives 80 + <i>x</i><sup>2</sup> &minus; 10<i>x</i> + 25, or <i>x</i><sup>2</sup> &minus; 10<i>x</i> + 105. Therefore the expression is equivalent to <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i><sup>2</sup> &minus; 10<i>x</i> + 105</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4(<i>x</i> &minus; 5)</span></span>.<br><br>Choice A is incorrect. This is the result of MULTIPLYING the two simplified fractions rather than adding them: <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">20</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i> &minus; 5</span></span> times <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i> &minus; 5</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span> is 5, because the factors of <i>x</i> &minus; 5 cancel. The expression is a sum, so the two fractions must be written over a common denominator first.<br><br>Choice B is incorrect. This is the result of adding the numerators and the denominators separately, which gives <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i> + 15</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i> &minus; 1</span></span>, and then writing that upside down. Adding fractions requires a common denominator; their numerators and denominators are never added across.<br><br>Choice D is incorrect. This has the correct numerator over the wrong factor. In the first fraction it is 2<i>x</i> + 5 that cancels, since 40<i>x</i> + 100 is 20(2<i>x</i> + 5), so the factor left in the denominator is <i>x</i> &minus; 5, not 2<i>x</i> + 5.",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "af2ba762",
  "domain": "Algebra",
  "skill": "Linear Functions",
  "difficulty": "hard",
  "type": "mc",
  "text": "According to data provided by the US Department of Energy, the average price per gallon of regular gasoline in the United States from September 1, 2014, to December 1, 2014, is modeled by the function <i>F</i> defined below, where <i>F</i>(<i>x</i>) is the average price per gallon <i>x</i> months after September 1.<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\"><i>F</i>(<i>x</i>) = 2.74 − 0.19(<i>x</i> − 3)</div>The constant 2.74 in this function estimates which of the following?",
  "choices": [
   "The average monthly decrease in the price per gallon",
   "The difference in the average price per gallon from September 1, 2014, to December 1, 2014",
   "The average price per gallon on September 1, 2014",
   "The average price per gallon on December 1, 2014"
  ],
  "correct": 3,
  "explanation": "Since 2.74 is a constant term, it represents an actual price of gas rather than a measure of change in gas price. To determine what gas price it represents, find <i>x</i> such that <i>F</i>(<i>x</i>) = 2.74, or 2.74 = 2.74 − 0.19(<i>x</i> − 3). Subtracting 2.74 from both sides gives 0 = −0.19(<i>x</i> − 3). Dividing both sides by −0.19 results in 0 = <i>x</i> − 3, or <i>x</i> = 3. Therefore, the average price of gas is $2.74 per gallon 3 months after September 1, 2014, which is December 1, 2014.<br><br>Choice A is incorrect. Since 2.74 is a constant, not a multiple of <i>x</i>, it cannot represent a rate of change in price. Choice B is incorrect. The difference in the average price from September 1, 2014, to December 1, 2014, is <i>F</i>(3) − <i>F</i>(0) = 2.74 − 0.19(3 − 3) − (2.74 − 0.19(0 − 3)) = 2.74 − (2.74 + 0.57) = −0.57, which is not 2.74. Choice C is incorrect. The average price per gallon on September 1, 2014, is <i>F</i>(0) = 2.74 − 0.19(0 − 3) = 2.74 + 0.57 = 3.31, which is not 2.74.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "567ac7ab",
  "domain": "Algebra",
  "skill": "Systems of Two Linear Equations in Two Variables",
  "difficulty": "hard",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">2<i>x</i> + 6<i>y</i> = 10</div><div>One of the two equations in a linear system is shown above. The system has no solution. Which of the following could be the other equation in the system?</div>",
  "choices": [
   "<i>x</i> + 3<i>y</i> = 5",
   "<i>x</i> + 3<i>y</i> = −20",
   "6<i>x</i> − 2<i>y</i> = 0",
   "6<i>x</i> + 2<i>y</i> = 10"
  ],
  "correct": 1,
  "explanation": "Choice B is correct. A system of two linear equations written in standard form has no solution when the equations are distinct and the ratio of the <i>x</i>-coefficient to the <i>y</i>-coefficient for one equation is equivalent to the ratio of the <i>x</i>-coefficient to the <i>y</i>-coefficient for the other equation. This ratio for the given equation is 2 to 6, or 1 to 3. Only choice B is an equation that isn't equivalent to the given equation and whose ratio of the <i>x</i>-coefficient to the <i>y</i>-coefficient is 1 to 3.<br><br>Choice A is incorrect. Multiplying each of the terms in this equation by 2 yields an equation that is equivalent to the given equation. This system would have infinitely many solutions. Choices C and D are incorrect. The ratio of the <i>x</i>-coefficient to the <i>y</i>-coefficient in 6<i>x</i> − 2<i>y</i> = 0 (choice C) is −6 to 2, or −3 to 1. This ratio in 6<i>x</i> + 2<i>y</i> = 10 (choice D) is 6 to 2, or 3 to 1. Since neither of these ratios is equivalent to that for the given equation, these systems would have exactly one solution.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "5355c0ef",
  "domain": "Advanced Math",
  "skill": "Equivalent Expressions",
  "difficulty": "hard",
  "type": "fr",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">0.36<i>x</i><sup>2</sup> + 0.63<i>x</i> + 1.17</div>The given expression can be rewritten as a(4<i>x</i><sup>2</sup> + 7<i>x</i> + 13), where a is a constant. What is the value of a?",
  "answer": ".09",
  "explanation": "Applying the distributive property to a(4<i>x</i><sup>2</sup> + 7<i>x</i> + 13) yields 4a<i>x</i><sup>2</sup> + 7a<i>x</i> + 13a. Since this is equivalent to 0.36<i>x</i><sup>2</sup> + 0.63<i>x</i> + 1.17, the corresponding coefficients must be equal: 0.36 = 4a, 0.63 = 7a, and 1.17 = 13a. Dividing 0.36 = 4a by 4 yields a = 0.09.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "b988eeec",
  "domain": "Algebra",
  "skill": "Linear Functions",
  "difficulty": "hard",
  "type": "fr",
  "text": "The functions <i>f</i> and <i>g</i> are defined as <i>f</i>(<i>x</i>) = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span><i>x</i> − 9 and <i>g</i>(<i>x</i>) = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span><i>x</i> + 21. If the function <i>h</i> is defined as <i>h</i>(<i>x</i>) = <i>f</i>(<i>x</i>) + <i>g</i>(<i>x</i>), what is the <i>x</i>-coordinate of the <i>x</i>-intercept of the graph of <i>y</i> = <i>h</i>(<i>x</i>) in the <i>xy</i>-plane?",
  "answer": "-12",
  "explanation": "It's given that the functions <i>f</i> and <i>g</i> are defined as <i>f</i>(<i>x</i>) = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span><i>x</i> − 9 and <i>g</i>(<i>x</i>) = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span><i>x</i> + 21. If the function <i>h</i> is defined as <i>h</i>(<i>x</i>) = <i>f</i>(<i>x</i>) + <i>g</i>(<i>x</i>), then substituting <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span><i>x</i> − 9 for <i>f</i>(<i>x</i>) and <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span><i>x</i> + 21 for <i>g</i>(<i>x</i>) in this function yields <i>h</i>(<i>x</i>) = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span><i>x</i> − 9 + <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">3</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span><i>x</i> + 21. This can be rewritten as <i>h</i>(<i>x</i>) = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span><i>x</i> + 12, or <i>h</i>(<i>x</i>) = <i>x</i> + 12. The <i>x</i>-intercept of a graph in the <i>xy</i>-plane is the point on the graph where <i>y</i> = 0. The equation representing the graph of <i>y</i> = <i>h</i>(<i>x</i>) is <i>y</i> = <i>x</i> + 12. Substituting 0 for <i>y</i> in this equation yields 0 = <i>x</i> + 12. Subtracting 12 from both sides of this equation yields −12 = <i>x</i>, or <i>x</i> = −12. Therefore, the <i>x</i>-coordinate of the <i>x</i>-intercept of the graph of <i>y</i> = <i>h</i>(<i>x</i>) in the <i>xy</i>-plane is −12.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "a54f1ba0",
  "domain": "Algebra",
  "skill": "Linear Functions",
  "difficulty": "hard",
  "type": "mc",
  "text": "The function <i>f</i> is linear, and <i>f</i>(<i>x</i> + 4) − <i>f</i>(<i>x</i>) = 10 for all values of <i>x</i>. Which equation could define <i>f</i>?",
  "choices": [
   "<i>f</i>(<i>x</i>) = 4<i>x</i> + 10",
   "<i>f</i>(<i>x</i>) = 10<i>x</i> + 4",
   "<i>f</i>(<i>x</i>) = 2.5<i>x</i> + 1",
   "<i>f</i>(<i>x</i>) = 40<i>x</i> + 1"
  ],
  "correct": 2,
  "explanation": "Choice C is correct. A linear function can be written as <i>f</i>(<i>x</i>) = <i>m</i><i>x</i> + <i>b</i>, where <i>m</i> is the slope. Then <i>f</i>(<i>x</i> + 4) − <i>f</i>(<i>x</i>) = <i>m</i>(<i>x</i> + 4) + <i>b</i> − (<i>m</i><i>x</i> + <i>b</i>), which simplifies to 4<i>m</i>. Setting 4<i>m</i> = 10 yields <i>m</i> = 2.5. The value of <i>b</i> isn't determined by the given information, so any linear function with slope 2.5 satisfies the condition, and <i>f</i>(<i>x</i>) = 2.5<i>x</i> + 1 is such a function.<br><br>Choice A is incorrect. This function has slope 4, so <i>f</i>(<i>x</i> + 4) − <i>f</i>(<i>x</i>) = 16.<br><br>Choice B is incorrect. This uses the given difference, 10, as the slope, giving <i>f</i>(<i>x</i> + 4) − <i>f</i>(<i>x</i>) = 40.<br><br>Choice D is incorrect. This results from multiplying 10 by 4 rather than dividing 10 by 4.",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "45b65bef",
  "domain": "Geometry and Trigonometry",
  "skill": "Lines, Angles, and Triangles",
  "difficulty": "easy",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0;\"><svg viewBox=\"0 0 320 135\" class=\"dx-fig\" role=\"img\" style=\"color:var(--text);max-width:300px;\" aria-label=\"A triangle representing a roof frame: a horizontal beam at the bottom and two sides meeting at the peak; the angle at the left end of the beam is labeled 35 degrees, the angle at the peak is labeled 115 degrees, and the angle at the right end of the beam is labeled x degrees\"><title>A triangle representing a roof frame: a horizontal beam at the bottom and two sides meeting at the peak; the angle at the left end of the beam is labeled 35 degrees, the angle at the peak is labeled 115 degrees, and the angle at the right end of the beam is labeled x degrees</title><line x1=\"40\" y1=\"112\" x2=\"280\" y2=\"112\" stroke=\"currentColor\" stroke-width=\"1.2\"/><line x1=\"280\" y1=\"112\" x2=\"151.4\" y2=\"15.1\" stroke=\"currentColor\" stroke-width=\"1.2\"/><line x1=\"151.4\" y1=\"15.1\" x2=\"40\" y2=\"112\" stroke=\"currentColor\" stroke-width=\"1.2\"/><path d=\"M 66.0,112.0 A 26,26 0 0,0 59.6,94.9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><path d=\"M 250.0,112.0 A 30,30 0 0,1 256.0,93.9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><path d=\"M 137.8,26.9 A 18,18 0 0,0 165.8,25.9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\"/><text x=\"72\" y=\"104\" font-size=\"12\" fill=\"currentColor\">35°</text><text x=\"244\" y=\"107\" font-size=\"12\" text-anchor=\"end\" fill=\"currentColor\"><tspan font-style=\"italic\">x</tspan>°</text><text x=\"153.4\" y=\"49.1\" font-size=\"12\" text-anchor=\"middle\" fill=\"currentColor\">115°</text></svg></div>Note: Figure not drawn to scale.<br><br>The figure shown is a side view of the frame of a roof. The frame is a triangle with a horizontal beam as its base. What is the value of <i>x</i>?",
  "choices": [
   "30",
   "32.5",
   "65",
   "145"
  ],
  "correct": 0,
  "explanation": "Choice A is correct. The measures of the three angles of a triangle sum to 180°. The frame is a triangle whose angles measure 35°, 115°, and <i>x</i>°, so 35 + 115 + <i>x</i> = 180. This gives 150 + <i>x</i> = 180, so <i>x</i> = 30.<br><br>Choice B is incorrect. This assumes the roof is symmetric, so that the two angles at the ends of the beam are equal: <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">180 − 115</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span> = 32.5. But the angle at the left end measures 35°, so the two angles are not equal.<br><br>Choice C is incorrect. This subtracts only the angle at the peak, 115°, from 180°. It is the sum of the measures of the two angles at the ends of the beam, not the value of <i>x</i>.<br><br>Choice D is incorrect. This subtracts only the 35° angle from 180° and leaves out the 115° angle at the peak.",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "25fc031a",
  "domain": "Problem-Solving and Data Analysis",
  "skill": "One-Variable Data: Distributions and Measures of Center and Spread",
  "difficulty": "medium",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0;\"><img src=\"question-bank-assets/25fc031a_A.png\" alt=\"Two histograms of the number of units sold, in thousands, with frequency on the vertical axis. Company A is concentrated between 25 and 40, with frequencies 42, 49 and 42 in the intervals 25 to 30, 30 to 35 and 35 to 40, and nothing outside them. Company B spreads across 15 to 50, with frequencies 31, 22, 12, 3, 12, 22 and 31 in the seven intervals from 15 to 50, highest at both ends and lowest in the middle\" style=\"max-width:48%;width:100%;height:auto;display:inline-block;\"/><img src=\"question-bank-assets/25fc031a_B.png\" alt=\"Histogram for Company B, number of units sold in thousands\" style=\"max-width:48%;width:100%;height:auto;display:inline-block;\"/></div>The histograms summarize the distributions of number of units sold, in thousands, for company A and company B. Which statement best compares the standard deviations of number of units sold for these companies?",
  "choices": [
   "The standard deviation of number of units sold for company A is less than the standard deviation of number of units sold for company B.",
   "The standard deviation of number of units sold for company A is greater than the standard deviation of number of units sold for company B.",
   "The standard deviation of number of units sold for company A is equal to the standard deviation of number of units sold for company B.",
   "There is not enough information to compare the standard deviations."
  ],
  "correct": 0,
  "explanation": "Choice A is correct. Standard deviation measures the spread of a given data set from its mean. In a data set with a smaller standard deviation, there are more values close to the mean. In a data set with a greater standard deviation, there are more values farther from the mean. The two histograms shown have the same scale on the horizontal axis. Therefore, their standard deviations can be compared by visually comparing the spreads of their histograms. The distribution summarized by each histogram is symmetric. Therefore, the mean of the data set for each histogram is a value in the middle bar of that histogram. The middle bar of each histogram has a value of at least 30 thousand units sold but less than 35 thousand units sold. Therefore, the mean of the data set for each histogram is at least 30 thousand and less than 35 thousand. The histogram for company A shows all the values in that data set are close to the mean. For company B, the histogram shows there are fewer values close to the mean and more values farther from the mean. Therefore, the standard deviation of number of units sold for company A is less than the standard deviation of number of units sold for company B.<br><br>Choice B is incorrect and may result from conceptual or calculation errors.<br><br>Choice C is incorrect and may result from conceptual or calculation errors.<br><br>Choice D is incorrect and may result from conceptual or calculation errors.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "cb8f449f",
  "domain": "Algebra",
  "skill": "Systems of Two Linear Equations in Two Variables",
  "difficulty": "medium",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\"><span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span><i>y</i> = 4<br><i>x</i> − <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span><i>y</i> = 2</div><div>The system of equations above has solution (<i>x</i>, <i>y</i>). What is the value of <i>x</i>?</div>",
  "choices": [
   "3",
   "<span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">7</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span>",
   "4",
   "6"
  ],
  "correct": 3,
  "explanation": "Choice D is correct. Adding the corresponding sides of the two equations eliminates <i>y</i> and yields <i>x</i> = 6, as shown.<div style=\"text-align:center; margin:1.2em 0;\"><span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span><i>y</i> = 4<br><i>x</i> − <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">1</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span><i>y</i> = 2<br><i>x</i> + 0 = 6</div>If (<i>x</i>, <i>y</i>) is a solution to the system, then (<i>x</i>, <i>y</i>) satisfies both equations in the system and any equation derived from them. Therefore, <i>x</i> = 6.<br><br>Choices A, B, and C are incorrect and may be the result of errors when solving the system.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "9d4270fe",
  "domain": "Algebra",
  "skill": "Linear Equations in One Variable",
  "difficulty": "medium",
  "type": "mc",
  "text": "A company that creates and sells tape dispensers calculates its monthly profit, in dollars, by subtracting its fixed monthly costs, in dollars, from its monthly sales revenue, in dollars. The equation 15,000 = 2.00<i>x</i> − 4,500 represents this situation for a month where <i>x</i> tape dispensers are created and sold. Which statement is the best interpretation of 2.00<i>x</i> in this context?",
  "choices": [
   "The monthly sales revenue, in dollars, from selling <i>x</i> tape dispensers",
   "The monthly sales revenue, in dollars, from each tape dispenser sold",
   "The monthly cost, in dollars, of creating each tape dispenser",
   "The monthly cost, in dollars, of creating <i>x</i> tape dispensers"
  ],
  "correct": 0,
  "explanation": "Choice A is correct. It's given that the equation 15,000 = 2.00<i>x</i> − 4,500 represents this situation for a month where <i>x</i> tape dispensers are created and sold. It's also given that the company calculates its monthly profit, in dollars, by subtracting its fixed monthly costs, in dollars, from its monthly sales revenue, in dollars. It follows that 2.00<i>x</i> represents the monthly sales revenue, in dollars. Therefore, the best interpretation of 2.00<i>x</i> in this context is the monthly sales revenue from selling <i>x</i> tape dispensers.<br><br>Choice B is incorrect. This is the best interpretation of 2.00, not 2.00<i>x</i>.<br><br>Choice C is incorrect and may result from conceptual errors.<br><br>Choice D is incorrect. This is the best interpretation of 4,500, not 2.00<i>x</i>.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "f1fa0821",
  "domain": "Advanced Math",
  "skill": "Nonlinear Functions",
  "difficulty": "medium",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0;\"><svg role=\"img\" viewBox=\"0 0 300 250\" class=\"dx-fig\" style=\"color:var(--text);max-width:280px;\" aria-label=\"Graph of a curve in the xy-plane, rising from left to right, with a y-intercept of 6.\"><title>Graph of a curve in the xy-plane, rising from left to right, with a y-intercept of 6.</title><rect x=\"30.0\" y=\"14.0\" width=\"254.0\" height=\"212.0\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"0.4\" opacity=\"0.35\"/><line x1=\"30.0\" y1=\"226.0\" x2=\"30.0\" y2=\"14.0\" stroke=\"currentColor\" stroke-width=\"0.3\" opacity=\"0.2\"/><line x1=\"80.8\" y1=\"226.0\" x2=\"80.8\" y2=\"14.0\" stroke=\"currentColor\" stroke-width=\"0.3\" opacity=\"0.2\"/><line x1=\"131.6\" y1=\"226.0\" x2=\"131.6\" y2=\"14.0\" stroke=\"currentColor\" stroke-width=\"0.3\" opacity=\"0.2\"/><line x1=\"182.4\" y1=\"226.0\" x2=\"182.4\" y2=\"14.0\" stroke=\"currentColor\" stroke-width=\"0.3\" opacity=\"0.2\"/><line x1=\"233.2\" y1=\"226.0\" x2=\"233.2\" y2=\"14.0\" stroke=\"currentColor\" stroke-width=\"0.3\" opacity=\"0.2\"/><line x1=\"284.0\" y1=\"226.0\" x2=\"284.0\" y2=\"14.0\" stroke=\"currentColor\" stroke-width=\"0.3\" opacity=\"0.2\"/><line x1=\"30.0\" y1=\"226.0\" x2=\"284.0\" y2=\"226.0\" stroke=\"currentColor\" stroke-width=\"0.3\" opacity=\"0.2\"/><line x1=\"30.0\" y1=\"183.6\" x2=\"284.0\" y2=\"183.6\" stroke=\"currentColor\" stroke-width=\"0.3\" opacity=\"0.2\"/><line x1=\"30.0\" y1=\"141.2\" x2=\"284.0\" y2=\"141.2\" stroke=\"currentColor\" stroke-width=\"0.3\" opacity=\"0.2\"/><line x1=\"30.0\" y1=\"98.8\" x2=\"284.0\" y2=\"98.8\" stroke=\"currentColor\" stroke-width=\"0.3\" opacity=\"0.2\"/><line x1=\"30.0\" y1=\"56.4\" x2=\"284.0\" y2=\"56.4\" stroke=\"currentColor\" stroke-width=\"0.3\" opacity=\"0.2\"/><line x1=\"30.0\" y1=\"14.0\" x2=\"284.0\" y2=\"14.0\" stroke=\"currentColor\" stroke-width=\"0.3\" opacity=\"0.2\"/><line x1=\"30.0\" y1=\"226.0\" x2=\"284.0\" y2=\"226.0\" stroke=\"currentColor\" stroke-width=\"1\"/><line x1=\"30.0\" y1=\"226.0\" x2=\"30.0\" y2=\"14.0\" stroke=\"currentColor\" stroke-width=\"1\"/><polygon points=\"284.0,226.0 279.0,223.5 279.0,228.5\" fill=\"currentColor\"/><polygon points=\"30.0,14.0 27.5,19.0 32.5,19.0\" fill=\"currentColor\"/><text x=\"80.8\" y=\"236.0\" font-size=\"7.5\" text-anchor=\"middle\" fill=\"currentColor\">1</text><text x=\"131.6\" y=\"236.0\" font-size=\"7.5\" text-anchor=\"middle\" fill=\"currentColor\">2</text><text x=\"182.4\" y=\"236.0\" font-size=\"7.5\" text-anchor=\"middle\" fill=\"currentColor\">3</text><text x=\"233.2\" y=\"236.0\" font-size=\"7.5\" text-anchor=\"middle\" fill=\"currentColor\">4</text><text x=\"284.0\" y=\"236.0\" font-size=\"7.5\" text-anchor=\"middle\" fill=\"currentColor\">5</text><text x=\"26.0\" y=\"186.3\" font-size=\"7.5\" text-anchor=\"end\" fill=\"currentColor\">10</text><text x=\"26.0\" y=\"143.9\" font-size=\"7.5\" text-anchor=\"end\" fill=\"currentColor\">20</text><text x=\"26.0\" y=\"101.5\" font-size=\"7.5\" text-anchor=\"end\" fill=\"currentColor\">30</text><text x=\"26.0\" y=\"59.1\" font-size=\"7.5\" text-anchor=\"end\" fill=\"currentColor\">40</text><text x=\"26.0\" y=\"16.7\" font-size=\"7.5\" text-anchor=\"end\" fill=\"currentColor\">50</text><text x=\"26.0\" y=\"236.0\" font-size=\"7.5\" text-anchor=\"end\" fill=\"currentColor\">0</text><path d=\"M 30.0 200.6 L 33.2 199.9 L 36.4 199.2 L 39.5 198.6 L 42.7 197.8 L 45.9 197.1 L 49.0 196.4 L 52.2 195.6 L 55.4 194.8 L 58.6 194.0 L 61.8 193.2 L 64.9 192.4 L 68.1 191.5 L 71.3 190.6 L 74.4 189.7 L 77.6 188.8 L 80.8 187.8 L 84.0 186.9 L 87.2 185.9 L 90.3 184.8 L 93.5 183.8 L 96.7 182.7 L 99.9 181.6 L 103.0 180.4 L 106.2 179.3 L 109.4 178.1 L 112.5 176.8 L 115.7 175.6 L 118.9 174.3 L 122.1 173.0 L 125.2 171.6 L 128.4 170.2 L 131.6 168.8 L 134.8 167.3 L 137.9 165.8 L 141.1 164.2 L 144.3 162.7 L 147.5 161.0 L 150.6 159.4 L 153.8 157.6 L 157.0 155.9 L 160.2 154.1 L 163.3 152.3 L 166.5 150.4 L 169.7 148.4 L 172.9 146.4 L 176.0 144.4 L 179.2 142.3 L 182.4 140.1 L 185.6 137.9 L 188.8 135.7 L 191.9 133.4 L 195.1 131.0 L 198.3 128.5 L 201.5 126.0 L 204.6 123.5 L 207.8 120.8 L 211.0 118.1 L 214.2 115.4 L 217.3 112.5 L 220.5 109.6 L 223.7 106.6 L 226.8 103.6 L 230.0 100.4 L 233.2 97.2 L 236.4 93.9 L 239.5 90.5 L 242.7 87.0 L 245.9 83.5 L 249.1 79.8 L 252.2 76.1 L 255.4 72.2 L 258.6 68.3 L 261.8 64.2 L 265.0 60.1 L 268.1 55.8 L 271.3 51.4 L 274.5 47.0 L 277.6 42.4 L 280.8 37.6 L 284.0 32.8\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\"/></svg></div>The graph gives the estimated population <i>y</i>, in thousands, of a town <i>x</i> years since 2003, where 0 ≤ <i>x</i> ≤ 5. Which of the following best describes the increase in the estimated population from <i>x</i> = 0 to <i>x</i> = 1?",
  "choices": [
   "The estimated population at <i>x</i> = 1 is 0.5 times the estimated population at <i>x</i> = 0.",
   "The estimated population at <i>x</i> = 1 is 1.5 times the estimated population at <i>x</i> = 0.",
   "The estimated population at <i>x</i> = 1 is 2.5 times the estimated population at <i>x</i> = 0.",
   "The estimated population at <i>x</i> = 1 is 3.5 times the estimated population at <i>x</i> = 0."
  ],
  "correct": 1,
  "explanation": "On the graph shown, the <i>y</i>-axis represents estimated population, in thousands. The graph shows that when <i>x</i> = 0, the <i>y</i>-coordinate is 6. Therefore, the estimated population at <i>x</i> = 0 is 6 thousand. The graph also shows that when <i>x</i> = 1, the <i>y</i>-coordinate is 9. Therefore, the estimated population at <i>x</i> = 1 is 9 thousand. Dividing 9 thousand by 6 thousand yields 1.5; therefore, 9 thousand is 1.5 times 6 thousand. It follows that the estimated population at <i>x</i> = 1 is 1.5 times the estimated population at <i>x</i> = 0.<br><br>Choice A is incorrect and may result from conceptual or calculation errors. Choice C is incorrect and may result from conceptual or calculation errors. Choice D is incorrect and may result from conceptual or calculation errors.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "13896d5c",
  "domain": "Advanced Math",
  "skill": "Nonlinear Functions",
  "difficulty": "medium",
  "type": "fr",
  "text": "The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = <i>x</i><sup>2</sup> + 6. If <i>f</i>(<i>a</i>) = 70, where <i>a</i> &gt; 0, what is the value of <i>f</i>(<i>a</i> − 3)?",
  "answer": "31",
  "explanation": "The correct answer is 31. Since <i>f</i>(<i>a</i>) = <i>a</i><sup>2</sup> + 6, the equation <i>f</i>(<i>a</i>) = 70 gives <i>a</i><sup>2</sup> + 6 = 70, or <i>a</i><sup>2</sup> = 64. So <i>a</i> = 8 or <i>a</i> = −8, and since <i>a</i> &gt; 0, <i>a</i> = 8. Then <i>a</i> − 3 = 5, and <i>f</i>(5) = 5<sup>2</sup> + 6, which is 25 + 6, or 31. Note that <i>f</i>(<i>a</i> − 3) is the value of <i>f</i> at the input <i>a</i> − 3; it is not <i>f</i>(<i>a</i>) − 3, which is 67.",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "f888421e",
  "domain": "Problem-Solving and Data Analysis",
  "skill": "Percentages",
  "difficulty": "hard",
  "type": "fr",
  "text": "A 60-kilogram batch of fruit is 92% water by mass. After some of the water evaporates, the batch is 88% water by mass. What is the mass, in kilograms, of the batch after the water evaporates?",
  "answer": "40",
  "explanation": "The correct answer is 40. Before any water evaporates, the part of the batch that is not water is 8% of 60 kilograms, or 4.8 kilograms. Only water evaporates, so this 4.8 kilograms stays the same. Afterward the batch is 88% water, so the 4.8 kilograms that is not water makes up the remaining 12% of the new mass. If the new mass is <i>m</i> kilograms, then 0.12<i>m</i> = 4.8, so <i>m</i> = 40. The water content falls from 92% to 88%, but the batch loses 20 kilograms, a third of its mass.",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "34f8cd89",
  "domain": "Problem-Solving and Data Analysis",
  "skill": "Percentages",
  "difficulty": "hard",
  "type": "mc",
  "text": "37% of the items in a box are green. Of those, 37% are also rectangular. Of the green rectangular items, 42% are also metal. Which of the following is closest to the percentage of the items in the box that are <u>not</u> rectangular green metal items?",
  "choices": [
   "1.16%",
   "57.50%",
   "94.25%",
   "98.84%"
  ],
  "correct": 2,
  "explanation": "Choice C is correct. It's given that 37% of the items in a box are green. Let <i>x</i> represent the total number of items in the box. It follows that (37/100)<i>x</i>, or 0.37<i>x</i>, items in the box are green. It's also given that of those, 37% are also rectangular. Therefore, (37/100)(0.37<i>x</i>), or 0.1369<i>x</i>, items in the box are green rectangular items. It's also given that of the green rectangular items, 42% are also metal. Therefore, (42/100)(0.1369<i>x</i>), or 0.057498<i>x</i>, items in the box are rectangular green metal items. The number of items in the box that are not rectangular green metal items is the total number of items in the box minus the number of rectangular green metal items in the box. Therefore, the number of items in the box that are not rectangular green metal items is <i>x</i> − 0.057498<i>x</i>, or 0.942502<i>x</i>. The percentage of items in the box that are not rectangular green metal items is the percentage that 0.942502<i>x</i> is of <i>x</i>. If <i>p</i> represents this percentage, the value of <i>p</i> is 100(0.942502<i>x</i>/<i>x</i>), or 94.2502. Of the given choices, 94.25% is closest to the percentage of items in the box that are not rectangular green metal items.<br><br>Choice A is incorrect and may result from conceptual or calculation errors.<br><br>Choice B is incorrect and may result from conceptual or calculation errors.<br><br>Choice D is incorrect and may result from conceptual or calculation errors.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "a4c0547f",
  "domain": "Geometry and Trigonometry",
  "skill": "Right Triangles and Trigonometry",
  "difficulty": "hard",
  "type": "mc",
  "text": "In triangle <i>XYZ</i>, angle <i>Z</i> is a right angle and the length of <i>YZ</i> is 24 units. If tan <i>X</i> = 12/35, what is the perimeter, in units, of triangle <i>XYZ</i>?",
  "choices": [
   "188",
   "168",
   "84",
   "71"
  ],
  "correct": 1,
  "explanation": "Choice B is correct. It's given that angle <i>Z</i> in triangle <i>XYZ</i> is a right angle. Thus, side <i>YZ</i> is the leg opposite angle <i>X</i> and side <i>XZ</i> is the leg adjacent to angle <i>X</i>. The tangent of an acute angle in a right triangle is the ratio of the length of the leg opposite the angle to the length of the leg adjacent to the angle. It follows that tan <i>X</i> = <i>YZ</i>/<i>XZ</i>. It's given that tan <i>X</i> = 12/35 and the length of side <i>YZ</i> is 24 units. Substituting 12/35 for tan <i>X</i> and 24 for <i>YZ</i> in the equation tan <i>X</i> = <i>YZ</i>/<i>XZ</i> yields 12/35 = 24/<i>XZ</i>. Multiplying both sides of this equation by 35(<i>XZ</i>) yields 12(<i>XZ</i>) = 24(35), or 12(<i>XZ</i>) = 840. Dividing both sides of this equation by 12 yields <i>XZ</i> = 70. The length <i>XY</i> can be calculated using the Pythagorean theorem, which states that if a right triangle has legs with lengths of a and <i>b</i> and a hypotenuse with length <i>c</i>, then a<sup>2</sup> + <i>b</i><sup>2</sup> = <i>c</i><sup>2</sup>. Substituting 70 for a and 24 for <i>b</i> in this equation yields 70<sup>2</sup> + 24<sup>2</sup> = <i>c</i><sup>2</sup>, or 5,476 = <i>c</i><sup>2</sup>. Taking the square root of both sides of this equation yields ±74 = <i>c</i>. Since the length of the hypotenuse must be positive, 74 = <i>c</i>. Therefore, the length of <i>XY</i> is 74 units. The perimeter of a triangle is the sum of the lengths of all sides. Thus, (74 + 70 + 24) units, or 168 units, is the perimeter of triangle <i>XYZ</i>.<br><br>Choice A is incorrect and may result from conceptual or calculation errors.<br><br>Choice C is incorrect. This would be the perimeter, in units, for a right triangle where the length of side <i>YZ</i> is 12 units, not 24 units.<br><br>Choice D is incorrect and may result from conceptual or calculation errors.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "9fec9d49",
  "domain": "Geometry and Trigonometry",
  "skill": "Area and Volume",
  "difficulty": "hard",
  "type": "mc",
  "text": "The floor of a ballroom has an area of 600 square meters. An architect creates a scale model of the floor of the ballroom, where the length of each side of the model is 1/10 times the length of the corresponding side of the actual floor of the ballroom. What is the area, in square meters, of the scale model?",
  "choices": [
   "6",
   "10",
   "60",
   "150"
  ],
  "correct": 0,
  "explanation": "Choice A is correct. It's given that the length of each side of a scale model is 1/10 the length of the corresponding side of the actual floor of a ballroom. Therefore, the area of the scale model is (1/10)<sup>2</sup>, or 1/100, times the area of the actual floor of the ballroom. It's given that the area of the floor of the ballroom is 600 square meters. Therefore, the area, in square meters, of the scale model is (1/100)(600), or 6.<br><br>Choice B is incorrect and may result from conceptual or calculation errors.<br><br>Choice C is incorrect and may result from conceptual or calculation errors.<br><br>Choice D is incorrect and may result from conceptual or calculation errors.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "d8789a4c",
  "domain": "Advanced Math",
  "skill": "Equivalent Expressions",
  "difficulty": "hard",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\"><span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i><sup>2</sup> − <i>c</i></span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i> − <i>b</i></span></span></div>In the expression above, <i>b</i> and <i>c</i> are positive integers. If the expression is equivalent to <i>x</i> + <i>b</i> and <i>x</i> ≠ <i>b</i>, which of the following could be the value of <i>c</i>?",
  "choices": [
   "4",
   "6",
   "8",
   "10"
  ],
  "correct": 0,
  "explanation": "Choice A is correct. If the given expression is equivalent to <i>x</i> + <i>b</i>, then <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i><sup>2</sup> − <i>c</i></span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i> − <i>b</i></span></span> = <i>x</i> + <i>b</i>, where <i>x</i> isn't equal to <i>b</i>. Multiplying both sides of this equation by <i>x</i> − <i>b</i> yields <i>x</i><sup>2</sup> − <i>c</i> = (<i>x</i> + <i>b</i>)(<i>x</i> − <i>b</i>). Since the right-hand side of this equation is in factored form for the difference of squares, the value of <i>c</i> must be a perfect square. Only choice A gives a perfect square for the value of <i>c</i>.<br><br>Choices B, C, and D are incorrect. None of these values of <i>c</i> produces a difference of squares. For example, when 6 is substituted for <i>c</i> in the given expression, the result is <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i><sup>2</sup> − 6</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i> − <i>b</i></span></span>. The expression <i>x</i><sup>2</sup> − 6 can't be factored with integer values, and therefore <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i><sup>2</sup> − 6</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>x</i> − <i>b</i></span></span> isn't equivalent to <i>x</i> + <i>b</i>.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "f89e1d6f",
  "domain": "Advanced Math",
  "skill": "Equivalent Expressions",
  "difficulty": "hard",
  "type": "mc",
  "text": "If a = <i>c</i> + <i>d</i>, which of the following is equivalent to the expression <i>x</i><sup>2</sup> − <i>c</i><sup>2</sup> − 2<i>c</i><i>d</i> − <i>d</i><sup>2</sup>?",
  "choices": [
   "(<i>x</i> + a)<sup>2</sup>",
   "(<i>x</i> − a)<sup>2</sup>",
   "(<i>x</i> + a)(<i>x</i> − a)",
   "<i>x</i><sup>2</sup> − a<i>x</i> − a<sup>2</sup>"
  ],
  "correct": 2,
  "explanation": "Choice C is correct. Factoring −1 from the second, third, and fourth terms gives <i>x</i><sup>2</sup> − <i>c</i><sup>2</sup> − 2<i>c</i><i>d</i> − <i>d</i><sup>2</sup> = <i>x</i><sup>2</sup> − (<i>c</i><sup>2</sup> + 2<i>c</i><i>d</i> + <i>d</i><sup>2</sup>). The expression <i>c</i><sup>2</sup> + 2<i>c</i><i>d</i> + <i>d</i><sup>2</sup> is the expanded form of a perfect square: <i>c</i><sup>2</sup> + 2<i>c</i><i>d</i> + <i>d</i><sup>2</sup> = (<i>c</i> + <i>d</i>)<sup>2</sup>. Therefore, <i>x</i><sup>2</sup> − (<i>c</i><sup>2</sup> + 2<i>c</i><i>d</i> + <i>d</i><sup>2</sup>) = <i>x</i><sup>2</sup> − (<i>c</i> + <i>d</i>)<sup>2</sup>. Since a = <i>c</i> + <i>d</i>, <i>x</i><sup>2</sup> − (<i>c</i> + <i>d</i>)<sup>2</sup> = <i>x</i><sup>2</sup> − a<sup>2</sup>. Finally, because <i>x</i><sup>2</sup> − a<sup>2</sup> is the difference of squares, it can be expanded as <i>x</i><sup>2</sup> − a<sup>2</sup> = (<i>x</i> + a)(<i>x</i> − a).<br><br>Choices A and B are incorrect and may be the result of making an error in factoring the difference of squares <i>x</i><sup>2</sup> − a<sup>2</sup>. Choice D is incorrect and may be the result of incorrectly combining terms.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "8027db3f",
  "domain": "Geometry and Trigonometry",
  "skill": "Right Triangles and Trigonometry",
  "difficulty": "hard",
  "type": "fr",
  "text": "In triangle <i>JKL</i>, cos(<i>K</i>) = 24/51 and angle <i>J</i> is a right angle. What is the value of cos(<i>L</i>)?",
  "answer": "15/17",
  "explanation": "The correct answer is 15/17. It's given that angle <i>J</i> is the right angle in triangle <i>JKL</i>. Therefore, the acute angles of triangle <i>JKL</i> are angle <i>K</i> and angle <i>L</i>. The hypotenuse of a right triangle is the side opposite its right angle. Therefore, the hypotenuse of triangle <i>JKL</i> is side <i>KL</i>. The cosine of an acute angle in a right triangle is the ratio of the length of the side adjacent to the angle to the length of the hypotenuse. It's given that cos(<i>K</i>) = 24/51. This can be written as cos(<i>K</i>) = 8/17. Since the cosine of angle <i>K</i> is a ratio, it follows that the length of the side adjacent to angle <i>K</i> is 8<i>n</i> and the length of the hypotenuse is 17<i>n</i>, where <i>n</i> is a constant. Therefore, <i>JK</i> = 8<i>n</i> and <i>KL</i> = 17<i>n</i>. The Pythagorean theorem states that in a right triangle, the square of the length of the hypotenuse is equal to the sum of the squares of the lengths of the other two sides. For triangle <i>JKL</i>, it follows that (<i>JK</i>)<sup>2</sup> + (<i>JL</i>)<sup>2</sup> = (<i>KL</i>)<sup>2</sup>. Substituting 8<i>n</i> for <i>JK</i> and 17<i>n</i> for <i>KL</i> yields (8<i>n</i>)<sup>2</sup> + (<i>JL</i>)<sup>2</sup> = (17<i>n</i>)<sup>2</sup>. This is equivalent to 64<i>n</i><sup>2</sup> + (<i>JL</i>)<sup>2</sup> = 289<i>n</i><sup>2</sup>. Subtracting 64<i>n</i><sup>2</sup> from each side of this equation yields (<i>JL</i>)<sup>2</sup> = 225<i>n</i><sup>2</sup>. Taking the square root of each side of this equation yields <i>JL</i> = 15<i>n</i>. Since cos(<i>L</i>) = <i>JL</i>/<i>KL</i>, it follows that cos(<i>L</i>) = 15<i>n</i>/17<i>n</i>, which can be rewritten as cos(<i>L</i>) = 15/17. Note that 15/17, .8824, .8823, and 0.882 are examples of ways to enter a correct answer.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "162242da",
  "domain": "Advanced Math",
  "skill": "Equivalent Expressions",
  "difficulty": "hard",
  "type": "fr",
  "text": "If 5<sup><i>x</i></sup> = 2, what is the value of 25<sup>1 − <i>x</i></sup>?",
  "answer": "25/4",
  "explanation": "The correct answer is <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">25</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span>. By the properties of exponents, 25<sup>1 − <i>x</i></sup> = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">25<sup>1</sup></span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">25<sup><i>x</i></sup></span></span> = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">25</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">25<sup><i>x</i></sup></span></span>. Since 25 = 5<sup>2</sup>, it follows that 25<sup><i>x</i></sup> = (5<sup>2</sup>)<sup><i>x</i></sup> = (5<sup><i>x</i></sup>)<sup>2</sup>. It’s given that 5<sup><i>x</i></sup> = 2, so 25<sup><i>x</i></sup> = 2<sup>2</sup>, or 4. Therefore, 25<sup>1 − <i>x</i></sup> = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">25</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span>. Note that 25/4 and 6.25 are examples of ways to enter a correct answer.",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "c3b116d7",
  "domain": "Advanced Math",
  "skill": "Equivalent Expressions",
  "difficulty": "hard",
  "type": "mc",
  "text": "Which of the following expressions is(are) a factor of 3<i>x</i><sup>2</sup> + 20<i>x</i> − 63?<br>I. <i>x</i> − 9<br>II. 3<i>x</i> − 7",
  "choices": [
   "I only",
   "II only",
   "I and II",
   "Neither I nor II"
  ],
  "correct": 1,
  "explanation": "Choice B is correct. The given expression can be factored by first finding two values whose sum is 20 and whose product is 3(−63), or −189. Those two values are 27 and −7. It follows that the given expression can be rewritten as 3<i>x</i><sup>2</sup> + 27<i>x</i> − 7<i>x</i> − 63. Since the first two terms of this expression have a common factor of 3<i>x</i> and the last two terms of this expression have a common factor of −7, this expression can be rewritten as 3<i>x</i>(<i>x</i> + 9) − 7(<i>x</i> + 9). Since the two terms of this expression have a common factor of (<i>x</i> + 9), it can be rewritten as (3<i>x</i> − 7)(<i>x</i> + 9). Therefore, expression II, 3<i>x</i> − 7, is a factor of 3<i>x</i><sup>2</sup> + 20<i>x</i> − 63, but expression I, <i>x</i> − 9, is not a factor of 3<i>x</i><sup>2</sup> + 20<i>x</i> − 63.<br><br>Choice A is incorrect and may result from conceptual or calculation errors.<br><br>Choice C is incorrect and may result from conceptual or calculation errors.<br><br>Choice D is incorrect and may result from conceptual or calculation errors.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "371cbf6b",
  "domain": "Advanced Math",
  "skill": "Equivalent Expressions",
  "difficulty": "hard",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">(a<i>x</i> + 3)(5<i>x</i><sup>2</sup> − <i>b</i><i>x</i> + 4) = 20<i>x</i><sup>3</sup> − 9<i>x</i><sup>2</sup> − 2<i>x</i> + 12</div>The equation above is true for all <i>x</i>, where a and <i>b</i> are constants. What is the value of a<i>b</i>?",
  "choices": [
   "18",
   "20",
   "24",
   "40"
  ],
  "correct": 2,
  "explanation": "Choice C is correct. If the equation is true for all <i>x</i>, then the expressions on both sides of the equation will be equivalent. Multiplying the polynomials on the left-hand side of the equation gives 5a<i>x</i><sup>3</sup> − a<i>b</i><i>x</i><sup>2</sup> + 4a<i>x</i> + 15<i>x</i><sup>2</sup> − 3<i>b</i><i>x</i> + 12. On the right-hand side of the equation, the only <i>x</i><sup>2</sup>-term is −9<i>x</i><sup>2</sup>. Since the expressions on both sides of the equation are equivalent, it follows that −a<i>b</i><i>x</i><sup>2</sup> + 15<i>x</i><sup>2</sup> = −9<i>x</i><sup>2</sup>, which can be rewritten as (−a<i>b</i> + 15)<i>x</i><sup>2</sup> = −9<i>x</i><sup>2</sup>. Therefore, −a<i>b</i> + 15 = −9, which gives a<i>b</i> = 24.<br><br>Choice A is incorrect. If a<i>b</i> = 18, then the coefficient of <i>x</i><sup>2</sup> on the left-hand side of the equation would be −18 + 15 = −3, which doesn't equal the coefficient of <i>x</i><sup>2</sup>, −9, on the right-hand side. Choice B is incorrect. If a<i>b</i> = 20, then the coefficient of <i>x</i><sup>2</sup> on the left-hand side of the equation would be −20 + 15 = −5, which doesn't equal the coefficient of <i>x</i><sup>2</sup>, −9, on the right-hand side. Choice D is incorrect. If a<i>b</i> = 40, then the coefficient of <i>x</i><sup>2</sup> on the left-hand side of the equation would be −40 + 15 = −25, which doesn't equal the coefficient of <i>x</i><sup>2</sup>, −9, on the right-hand side.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "68c5c81a",
  "domain": "Algebra",
  "skill": "Linear Inequalities in One or Two Variables",
  "difficulty": "hard",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">11<i>x</i> + 14<i>y</i> ≤ 115</div>Anthony will spend at most $115 to purchase <i>x</i> small cheese pizzas and <i>y</i> large cheese pizzas for a team dinner. The given inequality represents this situation. Which of the following is the best interpretation of 14<i>y</i> in this context?",
  "choices": [
   "The amount, in dollars, Anthony will spend on each large cheese pizza",
   "The amount, in dollars, Anthony will spend on each small cheese pizza",
   "The total amount, in dollars, Anthony will spend on large cheese pizzas",
   "The total amount, in dollars, Anthony will spend on small cheese pizzas"
  ],
  "correct": 2,
  "explanation": "Choice C is correct. It's given that Anthony will spend at most $115 to purchase <i>x</i> small cheese pizzas and <i>y</i> large cheese pizzas. In the inequality 11<i>x</i> + 14<i>y</i> ≤ 115, <i>y</i> represents the number of large cheese pizzas that Anthony will purchase. This means the coefficient 14 represents the amount, in dollars, Anthony will spend on each large cheese pizza. Therefore, the best interpretation of 14<i>y</i> in this context is the total amount, in dollars, Anthony will spend on large cheese pizzas.<br><br>Choice A is incorrect. This is the best interpretation of 14, not 14<i>y</i>.<br><br>Choice B is incorrect. This is the best interpretation of 11, not 14<i>y</i>.<br><br>Choice D is incorrect. This is the best interpretation of 11<i>x</i>, not 14<i>y</i>.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "5bf5136d",
  "domain": "Algebra",
  "skill": "Linear Inequalities in One or Two Variables",
  "difficulty": "hard",
  "type": "mc",
  "text": "The triangle inequality theorem states that the sum of any two sides of a triangle must be greater than the length of the third side. If a triangle has side lengths of 6 and 12, which inequality represents the possible lengths, <i>x</i>, of the third side of the triangle?",
  "choices": [
   "<i>x</i> &lt; 18",
   "<i>x</i> &gt; 18",
   "6 &lt; <i>x</i> &lt; 18",
   "<i>x</i> &lt; 6 or <i>x</i> &gt; 18"
  ],
  "correct": 2,
  "explanation": "Choice C is correct. It's given that a triangle has side lengths of 6 and 12, and <i>x</i> represents the length of the third side of the triangle. It's also given that the triangle inequality theorem states that the sum of any two sides of a triangle must be greater than the length of the third side. Therefore, the inequalities 6 + <i>x</i> &gt; 12, 6 + 12 &gt; <i>x</i>, and 12 + <i>x</i> &gt; 6 represent all possible values of <i>x</i>. Subtracting 6 from both sides of the inequality 6 + <i>x</i> &gt; 12 yields <i>x</i> &gt; 12 − 6, or <i>x</i> &gt; 6. Adding 6 and 12 in the inequality 6 + 12 &gt; <i>x</i> yields 18 &gt; <i>x</i>, or <i>x</i> &lt; 18. Subtracting 12 from both sides of the inequality 12 + <i>x</i> &gt; 6 yields <i>x</i> &gt; 6 − 12, or <i>x</i> &gt; −6. Since all <i>x</i>-values that satisfy the inequality <i>x</i> &gt; 6 also satisfy the inequality <i>x</i> &gt; −6, it follows that the inequalities <i>x</i> &gt; 6 and <i>x</i> &lt; 18 represent the possible values of <i>x</i>. Therefore, the inequality 6 &lt; <i>x</i> &lt; 18 represents the possible lengths, <i>x</i>, of the third side of the triangle.<br><br>Choice A is incorrect. This inequality gives the upper bound for <i>x</i> but does not include its lower bound.<br><br>Choice B is incorrect and may result from conceptual or calculation errors.<br><br>Choice D is incorrect and may result from conceptual or calculation errors.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "16546c6f",
  "domain": "Algebra",
  "skill": "Systems of Two Linear Equations in Two Variables",
  "difficulty": "hard",
  "type": "mc",
  "text": "3<i>x</i> − <i>y</i> = <i>c</i><br><i>ax</i> + 2<i>y</i> = 8<br>In the given system of equations, <i>a</i> and <i>c</i> are constants. In the <i>xy</i>-plane, the graph of the first equation passes through the point (2, 10), and the graph of the second equation passes through the point (1, 7). How many solutions does this system of equations have?",
  "choices": [
   "Exactly one",
   "Exactly two",
   "Infinitely many",
   "Zero"
  ],
  "correct": 2,
  "explanation": "Choice C is correct. Since the graph of the first equation passes through the point (2, 10), substituting 2 for <i>x</i> and 10 for <i>y</i> in the first equation gives 3(2) − 10 = <i>c</i>, or <i>c</i> = −4. Since the graph of the second equation passes through (1, 7), substituting gives <i>a</i>(1) + 2(7) = 8, or <i>a</i> = 8 − 14, so <i>a</i> = −6. The system is therefore 3<i>x</i> − <i>y</i> = −4 and −6<i>x</i> + 2<i>y</i> = 8. Dividing each side of the second equation by −2 gives 3<i>x</i> − <i>y</i> = −4, which is the first equation. The two equations represent the same line, so every point on that line is a solution of the system, and the system has infinitely many solutions.<br><br>Choice A is incorrect. Each of the two given points satisfies both equations, but a point that two graphs share is the only solution of the system only when the graphs are two different lines. Here the two equations turn out to represent the same line, so every point on that line is a solution.<br><br>Choice B is incorrect. The graph of each equation in the given system is a line, and two lines in the <i>xy</i>-plane have either no point, exactly one point, or every point in common. A system of two linear equations can never have exactly two solutions.<br><br>Choice D is incorrect. A system of two linear equations has no solution when its graphs are parallel lines that are not the same line. The graphs here do have the same slope, 3, but they are not different lines: both equations represent the graph of 3<i>x</i> − <i>y</i> = −4, which passes through (2, 10).",
  "source": "Moretti Test Prep & Tutoring"
 },
 {
  "qid": "571174f3",
  "domain": "Algebra",
  "skill": "Systems of Two Linear Equations in Two Variables",
  "difficulty": "hard",
  "type": "fr",
  "text": "<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\"><span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">5</span></span><i>x</i> + <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">7</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">5</span></span><i>y</i> = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">7</span></span><br><i>g</i><i>x</i> + <i>k</i><i>y</i> = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">5</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span></div><div>In the given system of equations, <i>g</i> and <i>k</i> are constants. The system has infinitely many solutions. What is the value of <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>g</i></span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>k</i></span></span>?</div>",
  "answer": "2/7",
  "explanation": "The correct answer is <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">7</span></span>. It's given that the system has infinitely many solutions. A system of two linear equations has infinitely many solutions if and only if the two linear equations are equivalent. Multiplying each side of the first equation in the system by <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">35</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span> yields <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">35</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span>(<span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">5</span></span><i>x</i> + <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">7</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">5</span></span><i>y</i>) = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">35</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span>(<span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">7</span></span>), or <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">7</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span><i>x</i> + <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">49</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span><i>y</i> = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">5</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span>. Since this equation is equivalent to the second equation and has the same right side as the second equation, the coefficients of <i>x</i> and <i>y</i>, respectively, should be the same. It follows that <i>g</i> = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">7</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span> and <i>k</i> = <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">49</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span>. Therefore, the value of <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>g</i></span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\"><i>k</i></span></span> is <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\"><span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">7</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span></span></span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\"><span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">49</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">4</span></span></span></span>, or <span style=\"display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;\"><span style=\"border-bottom:1px solid currentColor;padding:0 0.25em;text-align:center;white-space:nowrap;\">2</span><span style=\"padding:0 0.25em;text-align:center;white-space:nowrap;\">7</span></span>. Note that 2/7, .2857, 0.285, and 0.286 are examples of ways to enter a correct answer.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "4f1342d6",
  "domain": "Algebra",
  "skill": "Systems of Two Linear Equations in Two Variables",
  "difficulty": "hard",
  "type": "fr",
  "text": "<div>In August, a car dealer completed 15 more than 3 times the number of sales the car dealer completed in September. In August and September, the car dealer completed 363 sales. How many sales did the car dealer complete in September?</div>",
  "answer": "87",
  "explanation": "The correct answer is 87. It's given that in August, the car dealer completed 15 more than 3 times the number of sales the car dealer completed in September. Let <i>x</i> represent the number of sales the car dealer completed in September. It follows that 3<i>x</i> + 15 represents the number of sales the car dealer completed in August. It's also given that in August and September, the car dealer completed 363 sales. It follows that <i>x</i> + (3<i>x</i> + 15) = 363, or 4<i>x</i> + 15 = 363. Subtracting 15 from each side of this equation yields 4<i>x</i> = 348. Dividing each side of this equation by 4 yields <i>x</i> = 87. Therefore, the car dealer completed 87 sales in September.",
  "source": "Non-Bluebook"
 },
 {
  "qid": "187f74bc",
  "domain": "Algebra",
  "skill": "Linear Inequalities in One or Two Variables",
  "difficulty": "hard",
  "type": "mc",
  "text": "<div style=\"text-align:center; margin:1.2em 0;\"><img src=\"question-bank-assets/187f74bc.png\" alt=\"Coordinate plane with x-axis from -8 to 8 and y-axis from 2 down to -10; a dashed horizontal line is drawn at y = -4, and the entire region above that dashed line is shaded\" style=\"max-width:280px;width:100%;height:auto;\"/></div>The shaded region shown represents the solutions to the inequality <i>r</i><i>y</i> < 60, where <i>r</i> is a constant. What is the value of <i>r</i>?",
  "choices": [
   "15",
   "4",
   "−4",
   "−15"
  ],
  "correct": 3,
  "explanation": "Choice D is correct. The line representing the boundary of the shaded region shown is a horizontal line; therefore, the equation of the line can be written as <i>y</i> = −4. Since the shaded region represents all of the points above this boundary line, it follows that the shaded region represents the solutions to the inequality <i>y</i> > −4. It's given that the shaded region shown represents the solutions to the inequality <i>r</i><i>y</i> < 60, where <i>r</i> is a constant. The inequality <i>y</i> > −4 can be rewritten in the form <i>r</i><i>y</i> < 60 by multiplying both sides of the inequality by −15, which yields (−15)<i>y</i> < 60. Therefore, the value of <i>r</i> is −15.<br><br>Choice A is incorrect and may result from conceptual or calculation errors.<br><br>Choice B is incorrect and may result from conceptual or calculation errors.<br><br>Choice C is incorrect and may result from conceptual or calculation errors.",
  "source": "Non-Bluebook"
 }
];

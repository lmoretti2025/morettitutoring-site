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
 }
];

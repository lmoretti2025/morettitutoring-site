/* =========================================================================
   MORETTI SAT/ACT PRACTICE TESTS — fully original, hand-written and
   hand-verified content. No question here is copied, adapted, or derived
   from any official College Board or ACT, Inc. test material — every
   passage, word problem, and answer choice was written from scratch for
   this bank, the same way the diagnostic banks in banks.js were.

   -------------------------------------------------------------------------
   ARCHITECTURE — mirrors the real digital SAT's adaptive, multistage
   structure:

     Each SAT practice test has two sections (Reading & Writing, Math).
     Each section has two stages:
       Module 1  — a fixed set of questions spanning easy/medium/hard,
                    given to every student the same way.
       Module 2  — NOT fixed. There are two pre-written variants:
                     module2Easier — a gentler mix, served to students who
                                     scored below a threshold on Module 1
                     module2Harder — a tougher mix, served to students who
                                     scored at/above that threshold
                    Exactly one of the two is shown per student per section,
                    chosen by whatever runs the test (portal-side logic,
                    not written yet — see NEXT STEPS below).

     Real spec counts: SAT R&W = 27 (Module 1) + 27 (Module 2) = 54.
                        SAT Math = 22 (Module 1) + 22 (Module 2) = 44.
     So each fully-built test requires 27+27+27=81 R&W questions and
     22+22+22=66 Math questions (Module 1 plus BOTH Module 2 variants,
     since only one variant is shown per student but both must exist).

   -------------------------------------------------------------------------
   QUESTION SCHEMA — every question carries full teaching material, not
   just a key, per Luca's request ("written explanations why the correct
   answer is right, and why the wrong ones are wrong"):

     Multiple choice:
       {
         "domain": "...",       // matches banks.js domain taxonomy
         "skill": "...",        // matches banks.js skill taxonomy
         "difficulty": "easy" | "medium" | "hard",
         "type": "mc",
         "text": "...",
         "choices": ["...", "...", "...", "..."],
         "correct": 0,          // index into choices
         "choiceNotes": [       // one explanation per choice, same order
           "Why this one is right/wrong, specifically — not just 'incorrect'."
         ]
       }

     Free response (grid-in):
       {
         "domain": "...", "skill": "...", "difficulty": "...",
         "type": "fr",
         "text": "...",
         "answer": 82,
         "explanation": "Full worked solution."
       }

   -------------------------------------------------------------------------
   STATUS — SAT Test 1 is complete: Math Module 1 (22), Module 2 Easier (22),
   Module 2 Harder (22); Reading & Writing Module 1 (27), Module 2 Easier
   (27), Module 2 Harder (27). Every numeric math answer independently
   solved and verified while writing; every choice's correct/incorrect
   status backed by a specific explanation, not just "incorrect." This is
   the pilot test for Luca to review before scaling to the rest of the
   25-test set.

   Adaptive routing (see index.html): after Module 1 of a section, if the
   student scored >=60% on that module, Module 2 Harder is served;
   otherwise Module 2 Easier is served. Routing is independent per section.

   NEXT STEPS (not yet built):
     - SAT Tests 2-25, same structure (Module 1 + both Module 2 variants
       per section, same explanation-per-choice standard).
     - ACT full-length tests (not adaptive — ACT is fixed-form), same
       explanation-per-choice standard, once the SAT set is solid.

   -------------------------------------------------------------------------
   STYLE CALIBRATION — derived from reading every one of the ~1,152 images
   in Luca's "My SAT Questions" reference folder (structure/format/rigor
   only — no content copied; see COPYRIGHT NOTE below for what to exclude
   from that folder if it's ever revisited). Apply these per-skill patterns
   to every new question. Test 1's Text Structure & Purpose and Inferences
   items were already rewritten to match — use them as reference examples.

   COPYRIGHT NOTE: close reading surfaced roughly 60+ images across the
   folder — concentrated almost entirely in Cross-Text Connections (34 of
   38 items match specific, identifiable released Digital SAT questions)
   and Text Structure & Purpose (12 of 51, several citing real in-copyright
   novels) — that read as real released/copyrighted material rather than
   Luca's own writing. None of that folder is used as a source for this
   file; this section is a distillation of pattern/structure only, built
   from the clean majority of the folder. If "My SAT Questions" is ever
   used again, treat Cross-Text Connections as unreliable entirely and
   spot-check named-researcher R&W items against real published work.

   GENERAL R&W PATTERNS:
     - Ground every passage in specific, named, real-sounding detail: a
       full-named researcher with a credential ("archaeologist Robert
       Rosenswig," "ecologist Ralf Aben"), a specific place, a specific
       year or figure. Anonymous "a researcher found..." framing reads
       thin next to this — avoid it. Topics should span science, history,
       art, music, and social science — don't over-index on one domain.
     - Passages run a full paragraph (4-6 sentences), not one or two lines.
       Answer choices for Information & Ideas items are full sentences with
       a subordinate clause, not short blunt phrases, similar length across
       all 4 choices (mitigates length-based guessing).
     - Distractors are almost always "true-but-off-target," not "twisted
       fact": restates one true detail without addressing the actual ask,
       overreaches into an absolute/unsupported claim, focuses on a
       secondary/tangential point, or reverses the actual relationship.
       Straight factual contradictions are rare — avoid leaning on them.

   PER-SKILL NOTES (Reading & Writing):
     - Words in Context: ~75% informational fill-in-blank ("Which choice
       completes the text with the most logical and precise word or
       phrase?"), ~25% original short excerpt with an underlined polysemous
       word ("As used in the text, what does the word 'X' most nearly
       mean?" — all 4 choices are real dictionary senses of that word, only
       one fits). Never cite a real author/title for the excerpt variant —
       write fully original short fiction/poetry instead.
     - Text Structure & Purpose: THREE distinct valid mechanics, roughly
       even split — vary between them: (1) one paragraph with a single
       <u>underlined</u> sentence + "Which choice best describes the
       function of the underlined sentence?" (2) no underline, "Which
       choice best states the main purpose of the text?" (3) no underline,
       "Which choice best describes the overall structure of the text?"
       with answer choices shaped "It does X, then does Y[, then Z]."
     - Cross-Text Connections: full paragraph on each side (Text 1 / Text
       2), each grounded in a named researcher/study. Relationship types to
       rotate: Text 2 complicates/qualifies Text 1; Text 2 directly
       disputes Text 1; both converge on a shared, hedged claim despite
       different methods; Text 2 studies the same phenomenon from a
       different angle. Correct answer usually requires reasoning from
       Text 2's methodology back onto Text 1's claim, not just paraphrase.
     - Central Ideas and Details: same dense-paragraph/named-researcher
       style; correct answer is a full-sentence synthesis of the passage's
       actual point (not a detail, not an unsupported generalization).
     - Inferences: "complete the text" blank mechanic — passage ends with a
       connective clause into a blank ("This finding suggests that ______,"
       "...therefore conclude that ______," or the blank can complete a
       mid-sentence verb phrase) + "Which choice most logically completes
       the text?" NOT "It can most reasonably be inferred that...". The
       tested leap is always genuinely inferential (necessary-condition
       reasoning, convergent evidence, causal mechanism from a natural
       experiment, timing/threshold bound, population comparison) — never
       simple restatement.
     - Command of Evidence: vary framing between a research finding
       ("Which finding, if true, would most directly support/weaken...")
       and a quotation ("Which quotation from [a work/scholar] most
       effectively illustrates/supports...") and table/graph data-citation
       ("Which choice best describes data from the table that support...").
     - Rhetorical Synthesis: "While researching a topic, a student has
       taken the following notes:" + 4-6 short bullet facts + "The student
       wants to [GOAL]. Which choice most effectively uses relevant
       information from the notes to accomplish this goal?" Goals to rotate:
       identify a specific fact, emphasize/highlight a detail, contrast two
       things, emphasize a similarity, summarize a finding, introduce a
       topic to an unfamiliar audience, address an already-familiar
       audience, explain a cause/reason, make-and-support a generalization,
       use a quotation to accomplish a goal. Distractors are "true but
       off-goal" — never twist a fact, just answer the wrong question.
     - Transitions: full paragraph, real named/specific grounding (not bare
       two-sentence pairs). Distractors are near-miss same-category words
       (e.g. "however" vs. "on the other hand" vs. "nevertheless") more
       often than wrong-category words.
     - Boundaries: don't lean only on comma splices/semicolons. Also test:
       essential vs. nonessential appositives (a named person following a
       generic noun is almost always essential/no-comma — "playwright Wakako
       Yamauchi," not "playwright, Wakako Yamauchi,"), colons/dashes vs.
       commas introducing a list or explanation, conjunctive adverbs
       needing semicolon+comma (not just a comma), and declarative-vs-
       interrogative word order paired with matching end punctuation.
     - Form, Structure, and Sense: subject-verb agreement (usually with a
       long intervening phrase burying the true subject), verb tense/
       sequence (past vs. past perfect, cued by "by the time"/"already"),
       pronoun-antecedent number/case, possessive/apostrophe placement,
       modifier placement. Choices vary exactly one grammatical axis at a
       time — never mix two variables in one item's answer set.

   PER-SKILL NOTES (Math):
     - Answer choices should be clean numbers/fractions; distractors should
       be the result of one specific, nameable error (sign flip, wrong
       base, forgot to square/cube a scale factor, used diameter instead
       of radius, wrong denominator in a table problem, extraneous root
       from an unchecked radical/rational equation) — not random wrong
       numbers.
     - Nonlinear Functions: skews ~55-60% real-world (population/bacteria
       growth, projectile motion, revenue) vs. abstract. Exponential
       growth/decay is the single largest subtopic — base/rate confusion
       (raw percent used as the base instead of 1±rate) is the most common
       trap. No "Figure not drawn to scale" note is used for function
       graphs (only for geometry figures).
     - Nonlinear Equations and Systems: includes literal-equation
       rearrangement (isolate one variable in a real-world formula) as a
       legitimate sub-type, not just quadratic-solving. ~2:1 MC:FR.
     - Equivalent Expressions: a recurring format is asking for a *derived*
       quantity after simplifying (solve for a+b+c, or ab, or rt) rather
       than the simplified expression itself — forces full simplification
       before the "answer" step begins.
     - Geometry (Area & Volume, Circles, Lines/Angles/Triangles, Right
       Triangles & Trig): use "Note: Figure not drawn to scale." under any
       figure where given numeric values don't match the drawn proportions.
       Center of a circle always labeled O; triangle vertices single
       capital letters; right-angle tick marks shown. Scale-factor items
       must test forgetting to square (area) or cube (volume) the linear
       factor — this is the single most repeated geometry trap.
     - Ratios, Rates, Proportions, and Units: heavily real-world (unit
       conversion is the largest subtopic); ~60/40 MC:FR split.
     - Probability: two-way frequency tables are the dominant vehicle
       (~70% of items); distractors are structural (wrong cell/row/column,
       not arithmetic slips) — wrong denominator and complement confusion
       are the two most common traps. Include at least one compound/
       independent-event ("and") and one "at least one" complement item per
       test — both were underrepresented in the sampled reference set.
     - One/Two-Variable Data: scatterplot slope reading, regression-
       equation prediction, and linear-vs-exponential model selection from
       a table are the core Two-Variable formats; sign-flip on slope is the
       most common distractor. One-Variable covers mean/median/mode/range
       and the effect of adding/removing a data point.
     - Percentages: chained/compound percent problems (a percent change of
       a percent change) are a deliberate recurring FR template — always
       double-check compounding arithmetic by hand before finalizing.
     - Sample Statistics & Margin of Error / Evaluating Statistical Claims:
       purely conceptual, no computation. Core traps: overclaiming
       certainty (stating one point value instead of the plausible range),
       overgeneralizing beyond the actually-sampled population, and
       treating a self-selected/voluntary sample as if it were random.
   ========================================================================= */

window.SAT_PRACTICE_TESTS = [
  {
    "id": "sat-practice-1",
    "title": "SAT Practice Test 1",
    "sections": {
      "math": {
        "module1": [
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"easy","type":"mc","text":"Solve for x: 3x − 7 = 20","choices":["x = 13","x = 27","x = 9","x = 4.33"],"correct":2,"choiceNotes":[
            "This is 20 − 7, the value before dividing by 3 — the final division step was skipped.",
            "This is 3x itself (27), the value right before the final division by 3 to solve for x.",
            "Correct. Add 7 to both sides to get 3x = 27, then divide by 3 to get x = 9.",
            "This comes from subtracting 7 from 20 instead of adding it to isolate 3x, then dividing by 3 (13/3 ≈ 4.33)."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"easy","type":"mc","text":"A jacket originally priced $80 is discounted 15%. What is the sale price?","choices":["$92","$68","$65","$12"],"correct":1,"choiceNotes":[
            "This adds the discount instead of subtracting it, as if the price increased by 15%.",
            "Correct. The discount is 0.15 × 80 = $12, so the sale price is 80 − 12 = $68.",
            "This treats the 15 as if it were a dollar amount subtracted directly, rather than 15% of the price.",
            "This is only the discount amount (0.15 × 80 = $12), not the final sale price."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"medium","type":"mc","text":"Solve by factoring: x² + 2x − 15 = 0","choices":["x = −5, −3","x = 5, 3","x = 5, −3","x = −5, 3"],"correct":3,"choiceNotes":[
            "This has the sign of the positive root (3) reversed.",
            "This has the sign of the negative root (−5) reversed.",
            "This has the correct magnitudes but the signs of both roots reversed.",
            "Correct. The expression factors as (x + 5)(x − 3) = 0, giving x = −5 and x = 3."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"medium","type":"fr","text":"A right triangle has legs of length 9 cm and 12 cm. What is its area, in cm²?","answer":54,"explanation":"Area of a triangle = (1/2)(base)(height). Using the two legs as base and height: (1/2)(9)(12) = 54."},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"medium","type":"fr","text":"A store sells pens for $2 each and notebooks for $5 each. A customer buys 10 items total and spends $29. How many notebooks did the customer buy?","answer":3,"explanation":"Let p = pens and n = notebooks. p + n = 10 and 2p + 5n = 29. Substituting p = 10 − n gives 2(10 − n) + 5n = 29, so 20 + 3n = 29, meaning n = 3."},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"hard","type":"mc","text":"Solve for x: 2^(3x−1) = 32","choices":["x = 2","x = 5/3","x = 4/3","x = 6"],"correct":0,"choiceNotes":[
            "Correct. Since 32 = 2⁵, the exponents must be equal: 3x − 1 = 5, so 3x = 6 and x = 2.",
            "This comes from dropping the −1 and solving 3x = 5 directly, instead of first adding 1 to both sides.",
            "This comes from a sign error, solving 3x + 1 = 5 instead of 3x − 1 = 5.",
            "This is the value of 3x after correctly solving 3x − 1 = 5 — the final division by 3 to isolate x was skipped."
          ]},
          {"domain":"Algebra","skill":"Linear Functions","difficulty":"easy","type":"mc","text":"What is the slope of the line through the points (−2, 3) and (4, −9)?","choices":["2","−1/2","−12","−2"],"correct":3,"choiceNotes":[
            "This has the correct magnitude but the wrong sign, likely from a sign error in the numerator or denominator.",
            "This comes from inverting the slope formula — dividing the change in x by the change in y instead of the reverse.",
            "This is the change in y (−12) without dividing by the change in x (6).",
            "Correct. Slope = (−9 − 3)/(4 − (−2)) = −12/6 = −2."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Probability and Conditional Probability","difficulty":"medium","type":"mc","text":"A bag contains 5 red marbles, 3 blue marbles, and 2 green marbles. If one marble is drawn at random, what is the probability that it is NOT green?","choices":["1/2","4/5","1/5","3/10"],"correct":1,"choiceNotes":[
            "This is the probability of drawing red only (5/10 = 1/2), not accounting for blue.",
            "Correct. P(not green) = (5 + 3)/10 = 8/10 = 4/5.",
            "This is the probability of drawing green — the complement of the event actually being asked about.",
            "This is the probability of drawing blue only (3/10), not accounting for red."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles and Trigonometry","difficulty":"hard","type":"mc","text":"In a right triangle, the side opposite angle θ has length 8 and the hypotenuse has length 17. What is cos θ?","choices":["8/15","17/15","15/17","8/17"],"correct":2,"choiceNotes":[
            "This is tan θ (opposite/adjacent), not cos θ.",
            "This is the reciprocal of cos θ — secant θ, or hypotenuse/adjacent = 17/15 — not cos θ itself.",
            "Correct. The adjacent side is √(17² − 8²) = √225 = 15, so cos θ = adjacent/hypotenuse = 15/17.",
            "This is sin θ (opposite/hypotenuse), not cos θ."
          ]},
          {"domain":"Algebra","skill":"Linear Inequalities in One or Two Variables","difficulty":"medium","type":"mc","text":"A parking garage charges $4 for the first hour and $2.50 for each additional hour. If a driver wants to pay at most $16.50 total, which inequality gives the possible number of additional hours, a, beyond the first hour?","choices":["4 + 2.5a ≤ 16.50","2.5 + 4a ≤ 16.50","4 + 2.5a ≥ 16.50","4a + 2.5 ≤ 16.50"],"correct":0,"choiceNotes":[
            "Correct. The flat $4 fee plus $2.50 per additional hour must total at most $16.50.",
            "This swaps which rate is flat and which applies per hour.",
            "This uses the correct expression but the wrong inequality direction — 'at most' means ≤, not ≥.",
            "This incorrectly applies the $4 rate per additional hour instead of as a flat fee."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"easy","type":"mc","text":"If f(x) = 2x² − 3x + 1, what is f(−2)?","choices":["3","23","8","15"],"correct":3,"choiceNotes":[
            "This results from evaluating f(2) instead of f(−2), losing the negative sign on x.",
            "This results from squaring 2x instead of x — computing (2(−2))² = 16 instead of 2(−2)² = 8 — before combining terms.",
            "This is only the first term, 2(−2)² = 8; the −3x and +1 terms were dropped.",
            "Correct. f(−2) = 2(4) − 3(−2) + 1 = 8 + 6 + 1 = 15."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"hard","type":"mc","text":"Solve the system: 3x − 2y = 4 and 5x + 2y = 28. What is the value of x?","choices":["2","4","−4","6"],"correct":1,"choiceNotes":[
            "This is half of the correct value — likely from dividing 8x = 32 by 16 instead of 8.",
            "Correct. Adding the two equations eliminates y: 8x = 32, so x = 4. (Then y = 4 as well.)",
            "This has the correct magnitude but the wrong sign for x.",
            "This is a likely arithmetic slip when adding or dividing during elimination."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"One-Variable Data: Distributions and Measures of Center and Spread","difficulty":"medium","type":"fr","text":"A set of 7 test scores has a mean of 82. Six of the scores are 75, 80, 85, 90, 78, and 84. What is the seventh score?","answer":82,"explanation":"The sum of all 7 scores must be 82 × 7 = 574. The six known scores sum to 75+80+85+90+78+84 = 492, so the seventh score is 574 − 492 = 82."},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"medium","type":"mc","text":"A circle has an area of 49π square inches. What is its circumference?","choices":["49π in","28π in","14π in","7π in"],"correct":2,"choiceNotes":[
            "This mistakenly reuses the area value (49π) as the circumference.",
            "This is double the correct value, likely from using the diameter incorrectly in the formula.",
            "Correct. Area = πr² = 49π means r² = 49, so r = 7, and circumference = 2πr = 14π.",
            "This uses r instead of 2r — the factor of 2 in the circumference formula was dropped."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"hard","type":"fr","text":"A population of bacteria doubles every 3 hours. If the population starts at 500, what is the population after 9 hours?","answer":4000,"explanation":"9 hours contains 9/3 = 3 doubling periods. Population = 500 × 2³ = 500 × 8 = 4,000."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"easy","type":"mc","text":"A car travels at 54 miles per hour. What is this speed in miles per minute?","choices":["0.9","9","5.4","3,240"],"correct":0,"choiceNotes":[
            "Correct. 54 miles per hour ÷ 60 minutes per hour = 0.9 miles per minute.",
            "This comes from a misplaced decimal point, as if dividing by 6 instead of 60.",
            "This comes from dividing by 10 instead of 60.",
            "This comes from multiplying 54 by 60 instead of dividing by it — the inverse of the correct operation."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"medium","type":"mc","text":"Given f(x) = 2x² − 8x + 3, what is the x-coordinate of the vertex?","choices":["−2","4","8","2"],"correct":3,"choiceNotes":[
            "This has the correct magnitude but the wrong sign.",
            "This comes from dividing by a instead of 2a, dropping the factor of 2 in the denominator.",
            "This is −b alone (8), without dividing by 2a at all.",
            "Correct. The vertex x-coordinate is −b/(2a) = −(−8)/(2·2) = 8/4 = 2."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Lines, Angles, and Triangles","difficulty":"hard","type":"fr","text":"Triangle ABC is similar to triangle DEF, with AB corresponding to DE and BC corresponding to EF. If AB = 8, DE = 12, and BC = 10, what is the length of EF?","answer":15,"explanation":"The scale factor from triangle ABC to triangle DEF is DE/AB = 12/8 = 1.5. So EF = BC × 1.5 = 10 × 1.5 = 15."},
          {"domain":"Algebra","skill":"Linear Functions","difficulty":"medium","type":"mc","text":"If f(x) = x + 5 and g(x) = 2x − 3, what is f(g(3))?","choices":["13","8","11","3"],"correct":1,"choiceNotes":[
            "This is g(f(3)), the functions applied in the reverse order: f(3) = 8, then g(8) = 2(8) − 3 = 13.",
            "Correct. g(3) = 2(3) − 3 = 3, then f(3) = 3 + 5 = 8.",
            "This adds f(3) and g(3) instead of composing them: f(3) + g(3) = 8 + 3 = 11.",
            "This is g(3) alone — the outer function f was never applied."
          ]},
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"hard","type":"mc","text":"What are all real solutions to |3x + 6| = 21?","choices":["x = 5 only","x = −5 and x = 9","x = 5 and x = −9","x = 9 only"],"correct":2,"choiceNotes":[
            "This only solves the positive case (3x + 6 = 21) and misses the negative case entirely.",
            "This has the sign of each solution reversed from the correct pair.",
            "Correct. 3x + 6 = 21 gives x = 5; 3x + 6 = −21 gives x = −9. Both satisfy the original equation.",
            "This solves only one case, and with a sign error in that case."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"easy","type":"mc","text":"A recipe calls for flour and sugar in a ratio of 5:2. If a baker uses 15 cups of flour, how many cups of sugar are needed?","choices":["6","3","10","7.5"],"correct":0,"choiceNotes":[
            "Correct. 15 cups of flour is 15/5 = 3 times the base ratio amount, so sugar = 2 × 3 = 6 cups.",
            "This is the scale factor (3) itself, not the final amount of sugar.",
            "This mixes up which quantity in the ratio scales with the 15 cups.",
            "This comes from dividing 15 by 2 instead of first finding the correct scale factor from the ratio."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles and Trigonometry","difficulty":"medium","type":"mc","text":"A ladder 13 feet long leans against a wall, with its base 5 feet from the wall. How high up the wall does the ladder reach?","choices":["144 ft","12 ft","8 ft","18 ft"],"correct":1,"choiceNotes":[
            "This is 13² − 5² before taking the square root — the final square-root step was skipped.",
            "Correct. By the Pythagorean theorem, height = √(13² − 5²) = √(169 − 25) = √144 = 12 ft.",
            "This comes from subtracting the two lengths directly (13 − 5) instead of using the Pythagorean theorem.",
            "This comes from adding the two lengths directly (13 + 5) instead of using the Pythagorean theorem."
          ]}
        ],
        "module2Easier": [
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"easy","type":"mc","text":"Solve for x: 5x + 3 = 28","choices":["x = 25","x = 5","x = 5.6","x = 6.2"],"correct":1,"choiceNotes":[
            "This is 5x itself (28 − 3 = 25) — the final division by 5 was skipped.",
            "Correct. Subtract 3 from both sides: 5x = 25, then divide by 5: x = 5.",
            "This is 28/5, dividing by 5 without first subtracting 3.",
            "This adds 3 instead of subtracting it, then divides: (28 + 3)/5."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"easy","type":"mc","text":"A shirt priced at $45 increases in price by 20%. What is the new price?","choices":["$36","$9","$54","$65"],"correct":2,"choiceNotes":[
            "This applies a 20% decrease instead of an increase: 45 × 0.8 = 36.",
            "This is only the amount of the increase ($9), not the final price.",
            "Correct. The increase is 0.20 × 45 = $9, so the new price is 45 + 9 = $54.",
            "This adds 20 (treated as a dollar amount) to $45 instead of 20% of $45."
          ]},
          {"domain":"Algebra","skill":"Linear Functions","difficulty":"easy","type":"mc","text":"What is the slope of the line through the points (1, 4) and (3, 10)?","choices":["6","2","1/3","3"],"correct":3,"choiceNotes":[
            "This is the change in y (6) alone, without dividing by the change in x.",
            "This is the change in x (2) alone, without dividing into the change in y.",
            "This inverts the slope formula, dividing the change in x by the change in y instead of the reverse.",
            "Correct. Slope = (10 − 4)/(3 − 1) = 6/2 = 3."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"easy","type":"mc","text":"A rectangle has a length of 8 cm and a width of 5 cm. What is its area?","choices":["20 cm²","40 cm²","26 cm²","13 cm²"],"correct":1,"choiceNotes":[
            "This is half of the correct area, as if using the triangle area formula on a rectangle.",
            "Correct. Area = length × width = 8 × 5 = 40 cm².",
            "This is the perimeter, 2(8 + 5) = 26, not the area.",
            "This is half the perimeter (8 + 5 = 13), not the area."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"easy","type":"mc","text":"How many minutes are there in 3 hours?","choices":["3","36","180","60"],"correct":2,"choiceNotes":[
            "This restates the original value in hours instead of converting it.",
            "This comes from an arithmetic slip, multiplying 3 by 12 instead of 60.",
            "Correct. 3 hours × 60 minutes per hour = 180 minutes.",
            "This uses the conversion factor (60) alone, without multiplying by 3."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Probability and Conditional Probability","difficulty":"easy","type":"mc","text":"A bag contains 4 red marbles and 6 blue marbles. If one marble is drawn at random, what is the probability that it is blue?","choices":["2/5","3/10","5/3","3/5"],"correct":3,"choiceNotes":[
            "This is P(red) = 4/10 = 2/5, the complement of the event actually being asked about.",
            "This is half the correct probability, likely from a division slip.",
            "This inverts the probability, computing total over blue (10/6) instead of blue over total.",
            "Correct. P(blue) = 6/10 = 3/5."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"One-Variable Data: Distributions and Measures of Center and Spread","difficulty":"easy","type":"fr","text":"A set of 5 numbers has a mean of 20. What is the sum of the 5 numbers?","answer":100,"explanation":"Mean × count = sum, so 20 × 5 = 100."},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles and Trigonometry","difficulty":"easy","type":"fr","text":"A right triangle has legs of length 6 and 8. What is the length of its hypotenuse?","answer":10,"explanation":"By the Pythagorean theorem, the hypotenuse = √(6² + 8²) = √(36 + 64) = √100 = 10."},
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"medium","type":"mc","text":"Solve for x: (x/3) − 4 = 1","choices":["x = 15","x = −9","x = 5","x = 3"],"correct":0,"choiceNotes":[
            "Correct. Add 4 to both sides: x/3 = 5, then multiply by 3: x = 15.",
            "This subtracts 4 again instead of adding it, giving x/3 = −3, then x = −9.",
            "This is x/3 itself (5) — the final multiplication by 3 was skipped.",
            "This mistakes the coefficient 3 for the answer, ignoring the equation entirely."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"medium","type":"mc","text":"Solve by factoring: x² − 7x + 10 = 0","choices":["x = −5, 2","x = 5, 2","x = −5, −2","x = 5, −2"],"correct":1,"choiceNotes":[
            "This has the sign of the first root reversed.",
            "Correct. The expression factors as (x − 5)(x − 2) = 0, giving x = 5 and x = 2.",
            "This has both signs reversed from the correct roots.",
            "This has the sign of the second root reversed."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"medium","type":"mc","text":"A price is discounted 25% to a sale price of $60. What was the original price?","choices":["$45","$85","$80","$75"],"correct":2,"choiceNotes":[
            "This treats $60 as 75% too much rather than too little, computing 60 × 0.75 = 45 instead of dividing.",
            "This is a plausible-looking number near the correct value rather than the result of the actual calculation.",
            "Correct. Let p be the original price: 0.75p = 60, so p = 80.",
            "This adds 25% of the discounted price ($15) back onto $60, using the wrong base for the percentage."
          ]},
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"medium","type":"fr","text":"A plumber charges a flat fee of $50 plus $30 per hour. What is the total charge for a 3.5-hour job?","answer":155,"explanation":"Total = 50 + 30(3.5) = 50 + 105 = 155."},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"medium","type":"mc","text":"If f(x) = 3x² − 2x + 4, what is f(3)?","choices":["31","21","7","25"],"correct":3,"choiceNotes":[
            "This drops the −2x term entirely: 3(9) + 4 = 31.",
            "This drops the +4 constant entirely: 3(9) − 2(3) = 21.",
            "This computes 3x instead of 3x², forgetting to square x first: 3(3) − 2(3) + 4 = 7.",
            "Correct. f(3) = 3(9) − 2(3) + 4 = 27 − 6 + 4 = 25."
          ]},
          {"domain":"Algebra","skill":"Linear Functions","difficulty":"medium","type":"mc","text":"A table of values shows a linear pattern: at x = 0, y = 5; at x = 1, y = 8; at x = 2, y = 11. Based on this pattern, what value of y corresponds to x = 4?","choices":["20","23","17","14"],"correct":2,"choiceNotes":[
            "This overshoots by one step, giving the value at x = 5 (20) instead of x = 4.",
            "This overshoots by two steps, giving the value at x = 6 (23) instead of x = 4.",
            "Correct. y increases by 3 for each increase of 1 in x; from (2, 11), two more steps reach (4, 11 + 3 + 3) = (4, 17).",
            "This stops one step short, giving the value at x = 3 (14) instead of x = 4."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Lines, Angles, and Triangles","difficulty":"medium","type":"mc","text":"A triangle has angles measuring 40° and 65°. What is the measure of the third angle?","choices":["25°","75°","105°","65°"],"correct":1,"choiceNotes":[
            "This is the difference between the two given angles (65 − 40 = 25°), not the third angle.",
            "Correct. The three angles of a triangle sum to 180°: 180 − 40 − 65 = 75°.",
            "This is the sum of the two given angles (40 + 65 = 105°), not the third angle.",
            "This just repeats one of the two given angles instead of solving for the third."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Lines, Angles, and Triangles","difficulty":"medium","type":"fr","text":"Two similar triangles have a scale factor of 2 between their corresponding sides. If the smaller triangle has an area of 12, what is the area of the larger triangle?","answer":48,"explanation":"Area scales by the square of the linear scale factor: 2² = 4, so the larger triangle's area is 12 × 4 = 48."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"medium","type":"mc","text":"At a school, the ratio of boys to girls is 3:4. If there are 28 students total, how many are boys?","choices":["16","21","7","12"],"correct":3,"choiceNotes":[
            "This is the number of girls (4 × 4 = 16), not boys.",
            "This computes 3/4 of 28 directly (28 × 3/4 = 21) instead of using the 3:4 ratio out of 7 total parts.",
            "This is the value of one part using 4 total parts instead of the correct 7 (28/4 = 7).",
            "Correct. 3 + 4 = 7 parts total; 28/7 = 4 students per part; boys = 3 × 4 = 12."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"medium","type":"mc","text":"How many real solutions does the equation x² + 4x + 4 = 0 have?","choices":["1","0","2","Infinitely many"],"correct":0,"choiceNotes":[
            "Correct. The expression factors as (x + 2)² = 0, giving a single repeated solution, x = −2.",
            "This would be the case only if the discriminant were negative; here the discriminant is 0.",
            "This assumes two distinct solutions, but the discriminant b² − 4ac = 16 − 16 = 0 means the two roots coincide.",
            "This confuses a repeated root with an identity — the equation is only true for one specific value of x, not all x."
          ]},
          {"domain":"Algebra","skill":"Linear Inequalities in One or Two Variables","difficulty":"easy","type":"mc","text":"Solve for x: 2x + 5 ≤ 17","choices":["x ≥ 6","x ≤ 6","x ≤ 12","x ≤ 22"],"correct":1,"choiceNotes":[
            "This has the correct boundary value but the inequality sign flipped, which would only happen when dividing by a negative number.",
            "Correct. Subtract 5 from both sides: 2x ≤ 12, then divide by 2: x ≤ 6.",
            "This is 2x ≤ 12 written as if it were the final answer — the division by 2 was skipped.",
            "This adds 5 instead of subtracting it, and also skips the division by 2."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"easy","type":"mc","text":"15 is what percent of 60?","choices":["400%","6%","25%","15%"],"correct":2,"choiceNotes":[
            "This inverts the fraction, computing 60/15 = 4 = 400% instead of 15/60.",
            "This comes from a misplaced decimal point, as if computing 15/60 = 0.06 instead of 0.25.",
            "Correct. 15/60 = 0.25 = 25%.",
            "This mistakes the number 15 itself for the percentage, ignoring its relationship to 60."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"medium","type":"fr","text":"Two numbers have a sum of 24 and a difference of 6. What is the larger number?","answer":15,"explanation":"Let the numbers be x and y with x + y = 24 and x − y = 6. Adding the equations: 2x = 30, so x = 15 (and y = 9)."},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"hard","type":"mc","text":"Solve the system: x + y = 10 and 2x − y = 8. What is the value of x?","choices":["4","5","9","6"],"correct":3,"choiceNotes":[
            "This is the value of y (4), not x — the two variables were switched.",
            "This is a likely arithmetic slip when dividing 18 by an incorrect value.",
            "This comes from adding 10 and 8 first (18) and then dividing by 2 instead of 3.",
            "Correct. Adding the two equations eliminates y: 3x = 18, so x = 6 (and y = 4)."
          ]}
        ],
        "module2Harder": [
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"easy","type":"mc","text":"Solve for x: 7x − 4 = 24","choices":["x = 28","x = 4","x = 3.43","x = 2.86"],"correct":1,"choiceNotes":[
            "This is 7x itself (28) — the final division by 7 was skipped.",
            "Correct. Add 4 to both sides: 7x = 28, then divide by 7: x = 4.",
            "This divides 24 by 7 directly, without first adding 4: 24/7 ≈ 3.43.",
            "This subtracts 4 instead of adding it, then divides: (24 − 4)/7 ≈ 2.86."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"easy","type":"mc","text":"A town's population grows from 250 to 300. What is the percent increase?","choices":["83.3%","120%","20%","50%"],"correct":2,"choiceNotes":[
            "This computes 250/300 instead of the increase divided by the original amount.",
            "This computes 300/250 = 1.2 and reports it as 120%, describing the new value as a percent of the old rather than finding the percent increase.",
            "Correct. The increase is 50; 50/250 = 0.20 = 20%.",
            "This is the raw increase in population (50), stated as if it were the percent itself."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"medium","type":"mc","text":"Solve by factoring: 2x² − 3x − 9 = 0","choices":["x = −3, 3/2","x = 3, 3/2","x = −3, −3/2","x = 3, −3/2"],"correct":3,"choiceNotes":[
            "This has both signs reversed from the correct roots.",
            "This has the sign of −3/2 reversed.",
            "This has the sign of 3 reversed.",
            "Correct. The expression factors as (2x + 3)(x − 3) = 0, giving x = 3 and x = −3/2."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"medium","type":"mc","text":"If f(x) = 2x² + 5x − 3, what is f(−3)?","choices":["0","36","−36","3"],"correct":0,"choiceNotes":[
            "Correct. f(−3) = 2(9) + 5(−3) − 3 = 18 − 15 − 3 = 0.",
            "This computes (2 · −3)² = 36 and stops, never adding the remaining terms.",
            "This treats (−3)² as −9 (a sign error in squaring), giving 2(−9) + 5(−3) − 3 = −36.",
            "This drops the constant term −3, giving 2(9) + 5(−3) = 3."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"medium","type":"mc","text":"A cylinder has a radius of 3 and a height of 10. What is its volume?","choices":["60π","90π","30π","270π"],"correct":1,"choiceNotes":[
            "This uses the diameter (6) in place of r without squaring it: π(6)(10) = 60π.",
            "Correct. V = πr²h = π(3²)(10) = 90π.",
            "This uses r instead of r², computing π(3)(10) = 30π.",
            "This uses r³ instead of r², computing π(27)(10) = 270π."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles and Trigonometry","difficulty":"medium","type":"mc","text":"In a right triangle, sin θ = 5/13. What is cos θ?","choices":["13/12","5/13","12/13","5/12"],"correct":2,"choiceNotes":[
            "This is the reciprocal of cos θ — secant θ, or hypotenuse/adjacent = 13/12 — not cos θ itself.",
            "This repeats sin θ instead of computing cos θ.",
            "Correct. The adjacent side is √(13² − 5²) = √144 = 12, so cos θ = 12/13.",
            "This is tan θ (opposite/adjacent = 5/12), not cos θ."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"medium","type":"fr","text":"A car travels 210 miles in 3.5 hours at a constant rate. At that same rate, how many miles would it travel in 5 hours?","answer":300,"explanation":"Rate = 210/3.5 = 60 miles per hour. In 5 hours: 60 × 5 = 300 miles."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Probability and Conditional Probability","difficulty":"medium","type":"mc","text":"A fair coin is flipped twice. What is the probability of getting heads on both flips?","choices":["1/2","1/3","2/3","1/4"],"correct":3,"choiceNotes":[
            "This is the probability of a single flip landing heads, not both flips.",
            "This treats the outcomes as one of three equally likely results (HH, one head, TT) instead of counting HT and TH as separate outcomes.",
            "This is the complement of 1/3, compounding the same miscount of outcomes.",
            "Correct. P(H) × P(H) = 1/2 × 1/2 = 1/4."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"One-Variable Data: Distributions and Measures of Center and Spread","difficulty":"medium","type":"mc","text":"What is the median of the data set 3, 7, 9, 12, 14, 20?","choices":["12","11","10.5","9"],"correct":2,"choiceNotes":[
            "This is the 4th value alone, without averaging with the 3rd.",
            "This is a plausible-looking number near the correct value but not the actual average of 9 and 12.",
            "Correct. With 6 values in order, the median is the average of the 3rd and 4th values: (9 + 12)/2 = 10.5.",
            "This is the 3rd value alone, without averaging with the 4th."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Two-Variable Data: Models and Scatterplots","difficulty":"medium","type":"fr","text":"A line of best fit relating study hours (x) to predicted test score (y) is given by y = 2.5x + 12. Using this model, what is the predicted score for 8 study hours?","answer":32,"explanation":"y = 2.5(8) + 12 = 20 + 12 = 32."},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"hard","type":"mc","text":"How many real solutions does the equation x² + 6x + 9 = −4 have?","choices":["Infinitely many","0","1","2"],"correct":1,"choiceNotes":[
            "This would only apply to an identity true for all x, not a quadratic equation with a negative discriminant.",
            "Correct. Rewriting as x² + 6x + 13 = 0, the discriminant is 6² − 4(1)(13) = 36 − 52 = −16, which is negative, so there are no real solutions.",
            "This would be the case only if the discriminant were exactly 0, but here it's negative.",
            "This assumes the discriminant is positive, but 36 − 52 = −16 is negative."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"hard","type":"fr","text":"For what value of k does the system 3x + 2y = 7 and 6x + 4y = k have infinitely many solutions?","answer":14,"explanation":"Multiplying the first equation by 2 gives 6x + 4y = 14. For the system to have infinitely many solutions, the second equation must be identical to this, so k = 14."},
          {"domain":"Advanced Math","skill":"Equivalent Expressions","difficulty":"hard","type":"mc","text":"Which expression is equivalent to (2x⁻²y³)/(xy⁻¹) for x, y ≠ 0?","choices":["2y⁴/x²","2x²y⁴","2y²/x³","2y⁴/x³"],"correct":3,"choiceNotes":[
            "This subtracts the x exponents incorrectly, treating −2 − 1 as −2 instead of −3.",
            "This adds the exponents instead of subtracting when dividing, and flips a sign along the way.",
            "This subtracts the y exponents instead of adding when dividing by y⁻¹, using 3 − 1 = 2 instead of 3 − (−1) = 4.",
            "Correct. Dividing exponents: x^(−2−1) = x⁻³ and y^(3−(−1)) = y⁴, giving 2x⁻³y⁴ = 2y⁴/x³."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"hard","type":"fr","text":"A population of bacteria triples every 4 hours, starting at 200. What is the population after 12 hours?","answer":5400,"explanation":"12 hours contains 12/4 = 3 tripling periods. Population = 200 × 3³ = 200 × 27 = 5,400."},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"hard","type":"mc","text":"A circle has the equation (x − 2)² + (y + 3)² = 25. What is its radius?","choices":["5","25","10","2.5"],"correct":0,"choiceNotes":[
            "Correct. In the form (x − h)² + (y − k)² = r², r² = 25, so r = 5.",
            "This is r² itself — the final square root was skipped.",
            "This is double the correct radius, as if it were the diameter.",
            "This is half the correct radius, likely from confusing r² with 2r."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"hard","type":"fr","text":"Solve the system y = x² and y = 2x + 3 for the positive value of x.","answer":3,"explanation":"Setting x² = 2x + 3 gives x² − 2x − 3 = 0, which factors as (x − 3)(x + 1) = 0, so x = 3 or x = −1. The positive solution is x = 3."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Inference from Sample Statistics and Margin of Error","difficulty":"medium","type":"mc","text":"A poll of 500 voters found that 54% support a proposal, with a margin of error of 3 percentage points. Which of the following is NOT a plausible value for the true percentage of all voters who support the proposal?","choices":["52%","60%","51%","57%"],"correct":1,"choiceNotes":[
            "This falls within the margin of error range, so it is plausible.",
            "Correct. This falls outside the range 51%–57% given by the margin of error, so it is not plausible.",
            "This falls within the margin of error (54 − 3 = 51), so it is plausible.",
            "This falls within the margin of error (54 + 3 = 57), so it is plausible."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Evaluating Statistical Claims: Observational Studies and Experiments","difficulty":"medium","type":"mc","text":"A study finds that students who eat breakfast tend to have higher test scores than students who don't. Which finding, if true, would most weaken a causal conclusion that eating breakfast improves test scores?","choices":["The study measured scores using a standardized test.","Breakfast foods vary widely in nutritional content.","Students who eat breakfast also tend to come from households with more resources for tutoring and study materials.","Some students who eat breakfast still score below average."],"correct":2,"choiceNotes":[
            "The type of test used doesn't affect whether the breakfast-score link is causal or merely correlational.",
            "Variation in breakfast content doesn't address the core issue of a possible confounding variable behind the correlation.",
            "Correct. This introduces a confounding variable (household resources) that could explain the score difference independent of breakfast itself.",
            "A few individual exceptions don't undermine an overall correlation."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"hard","type":"fr","text":"The function g is defined by g(x) = (x − 1)(x + 5). What is the minimum value of g?","answer":-9,"explanation":"Expanding gives g(x) = x² + 4x − 5. The vertex occurs at x = −b/(2a) = −4/2 = −2, so g(−2) = 4 − 8 − 5 = −9, which is the minimum since the parabola opens upward."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"medium","type":"fr","text":"An investment of $2,000 grows by 10% each year for 2 years. What is its value after 2 years?","answer":2420,"explanation":"2,000 × 1.1² = 2,000 × 1.21 = 2,420."},
          {"domain":"Problem-Solving & Data Analysis","skill":"One-Variable Data: Distributions and Measures of Center and Spread","difficulty":"medium","type":"mc","text":"Two data sets have the same mean. Set A's values are clustered tightly around the mean; Set B's values are spread widely. Which statement must be true?","choices":["Set A has a larger mean than Set B.","Set B has a smaller range than Set A.","Set A and Set B have the same standard deviation.","Set A has a smaller standard deviation than Set B."],"correct":3,"choiceNotes":[
            "The problem states the means are equal, so neither set has a larger mean.",
            "A widely spread set would have a larger, not smaller, range than a tightly clustered one.",
            "Different spreads mean different standard deviations, so they can't be equal.",
            "Correct. Standard deviation measures spread, and tightly clustered data has less spread than widely spread data."
          ]},
          {"domain":"Advanced Math","skill":"Equivalent Expressions","difficulty":"hard","type":"mc","text":"Which expression is equivalent to (3x²y⁻¹)⁻¹ · (x⁻¹y²) for x, y ≠ 0?","choices":["3x³/y³","y³/(3x³)","3y³/x³","y/(3x)"],"correct":1,"choiceNotes":[
            "This forgets to apply the outer exponent −1 to the whole first factor, leaving 3x² in the numerator instead of taking its reciprocal.",
            "Correct. (3x²y⁻¹)⁻¹ = x⁻²y/3, and multiplying by x⁻¹y² gives (x⁻²·x⁻¹)(y·y²)/3 = x⁻³y³/3 = y³/(3x³).",
            "This forgets to distribute the outer exponent −1 to the constant 3, leaving it in the numerator instead of the denominator.",
            "This drops the x exponent entirely, as if x⁻²·x⁻¹ = x⁻¹ instead of x⁻³."
          ]}
        ],
      },
      "readingWriting": {
        "module1": [
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"easy","type":"mc","text":"The critic's review was scathing at first glance, but ______ scrutiny revealed genuine admiration beneath the mockery.<br><br>Which choice completes the text with the most logical and precise word?","choices":["distant","brief","occasional","closer"],"correct":3,"choiceNotes":[
            "\"Distant\" suggests less careful attention, the opposite of what would reveal hidden admiration.",
            "\"Brief\" also implies too little attention to notice something subtle.",
            "\"Occasional\" describes frequency, not depth of attention, and doesn't fit the sentence's logic.",
            "Correct. \"Closer\" fits the idea that deeper examination reveals something not obvious at first glance."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"medium","type":"mc","text":"Despite decades of ______ evidence, the theory remains unproven to the satisfaction of most specialists in the field.<br><br>Which choice completes the text with the most logical and precise word?","choices":["suggestive","conclusive","irrelevant","contradictory"],"correct":0,"choiceNotes":[
            "Correct. \"Suggestive\" evidence points toward a conclusion without fully proving it, matching \"remains unproven.\"",
            "\"Conclusive\" evidence would settle the matter, contradicting \"remains unproven.\"",
            "\"Irrelevant\" evidence wouldn't logically connect to the theory at all.",
            "\"Contradictory\" evidence would argue against the theory, not merely leave it unproven."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"medium","type":"mc","text":"The negotiator's ______ manner put both sides at ease, even as she pushed each toward significant concessions.<br><br>Which choice completes the text with the most logical and precise word?","choices":["hesitant","disarming","abrasive","indifferent"],"correct":1,"choiceNotes":[
            "\"Hesitant\" contradicts the confidence implied by successfully pushing for concessions.",
            "Correct. \"Disarming\" captures putting people at ease while still achieving a difficult goal.",
            "\"Abrasive\" would make people tense, not \"at ease.\"",
            "\"Indifferent\" wouldn't explain how she actively achieved concessions."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"Marine biologist Asha Patel spent three years tracking a colony of Atlantic puffins on a remote Icelandic island. Puffin numbers there had declined for over a decade, and many researchers assumed the cause was overfishing of the sand eels puffins rely on for food. <u>Patel's team found that sand eel populations near the colony had actually remained stable throughout the study period.</u> Her data pointed instead to rising sea temperatures disrupting the timing of chick-rearing.<br><br>Which choice best describes the function of the underlined sentence?","choices":["It confirms the researchers' original assumption about the cause of the decline.","It rules out one commonly assumed explanation, setting up an alternative explanation.","It summarizes the entire study's methodology.","It introduces the topic of the passage for the first time."],"correct":1,"choiceNotes":[
            "This finding contradicts, rather than confirms, the overfishing assumption.",
            "Correct. Ruling out stable sand eel populations eliminates the overfishing explanation, setting up Patel's temperature-based explanation that follows.",
            "This sentence reports a finding, not a description of methods.",
            "The topic (the puffin decline) was already introduced in the first two sentences."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"City planner Marcus Webb's 2019 report on downtown Cleveland begins with a single statistic: the average commuter there spent 27 more hours in traffic that year than a decade earlier. Webb then spends the report's next twelve pages examining zoning changes, bus route cuts, and population shifts that might explain the increase, before closing with a specific policy recommendation.<br><br>Which choice best states the main purpose of the text?","choices":["To argue that the 2019 statistic was miscalculated and should be revised.","To trace the likely causes of a documented rise in commute time and propose a response.","To compare Cleveland's traffic patterns with those of a similarly sized city.","To describe the history of Cleveland's public transit system in detail."],"correct":1,"choiceNotes":[
            "The report never claims the statistic itself is wrong — it treats it as accurate and investigates its causes.",
            "Correct. The report opens with the traffic statistic, spends most of its length investigating possible causes, and closes with a policy recommendation — tracing causes and proposing a response.",
            "The passage never compares Cleveland to another city.",
            "The passage focuses on causes of a specific traffic increase and a policy response, not a general transit history."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1: One economist argues that remote work permanently reduced downtown retail foot traffic.<br><br>Text 2: A separate analysis finds that foot traffic in several downtown districts returned to pre-2020 levels as of last year.<br><br>Based on the texts, the author of Text 2 would most likely respond to the claim in Text 1 by","choices":["agreeing completely, with no reservations.","arguing that downtown retail never existed.","proposing that foot traffic will keep declining indefinitely.","questioning whether the reduction the claim describes was actually permanent."],"correct":3,"choiceNotes":[
            "Text 2's data actively conflicts with Text 1's claim, so full agreement doesn't fit.",
            "Neither text suggests downtown retail never existed.",
            "Text 2 reports recovery, not continued decline.",
            "Correct. Text 2's data on recovered foot traffic directly challenges the idea that the reduction was \"permanent.\""
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1 argues that a particular species of frog uses camouflage as its primary defense against predators.<br><br>Text 2 documents the same frog secreting a mild toxin when handled by predators in laboratory trials.<br><br>Which choice best describes the relationship between the two texts?","choices":["Text 2 restates the same defense mechanism described in Text 1.","Text 2 identifies an additional defense mechanism beyond the one described in Text 1.","Text 2 disproves the claim made in Text 1.","The two texts describe unrelated species."],"correct":1,"choiceNotes":[
            "Toxin secretion is a different mechanism from camouflage, not a restatement of it.",
            "Correct. Camouflage and toxin secretion are two different mechanisms, so Text 2 adds to rather than contradicts Text 1.",
            "Text 2 doesn't disprove camouflage as a defense; it adds another one.",
            "Both texts describe the same frog species."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"medium","type":"mc","text":"\"The bridge was never meant to be beautiful — its engineers prioritized load capacity over ornament at every turn. And yet, a century later, its stark geometry is what draws photographers from around the world.\"<br><br>Which choice best states the main idea of the text?","choices":["Photographers dislike ornate architecture.","Load capacity is unrelated to a structure's appearance.","A structure designed purely for function can still come to be admired for its form.","The bridge collapsed shortly after being built."],"correct":2,"choiceNotes":[
            "The text doesn't make a general claim about photographers' preferences.",
            "The text doesn't make this broad claim — it only describes this one bridge's story.",
            "Correct. The text shows a function-first design becoming aesthetically admired later, matching this statement.",
            "Nothing in the text mentions collapse."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"easy","type":"mc","text":"\"Critics initially panned the film for its slow pacing, but audiences kept returning to it for exactly that reason, describing the unhurried scenes as a rare kind of relief.\"<br><br>Which choice best states the main idea of the text?","choices":["What critics saw as a flaw, audiences experienced as a strength.","The film was a total commercial failure.","Critics and audiences always agree about pacing.","Slow pacing is objectively good filmmaking."],"correct":0,"choiceNotes":[
            "Correct. This directly reflects the contrast between critical and audience reactions to the same trait.",
            "The text suggests audiences kept returning, implying popularity, not failure.",
            "The text shows critics and audiences disagreeing here, not always agreeing.",
            "The text describes one audience's reaction, not an objective claim about filmmaking generally."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"medium","type":"mc","text":"A logistics audit of Halvorsen Freight's main distribution center found the facility's storage bays, built to hold six months of typical inventory, completely empty during an unannounced inspection in March. Company records show no unusual sales spike in the weeks before the inspection. This suggests that ______.<br><br>Which choice most logically completes the text?","choices":["Halvorsen Freight had recently expanded its storage capacity.","the inspection had been scheduled more than a year in advance.","Halvorsen Freight was experiencing unusually low inventory levels at the time of the inspection.","the company had stopped selling its products entirely."],"correct":2,"choiceNotes":[
            "Expanded capacity wouldn't explain empty bays; if anything it would make the emptiness more surprising.",
            "The inspection is described as unannounced, contradicting a year of advance notice.",
            "Correct. Empty storage built for six months of inventory, without a sales spike to explain it, points to unusually low inventory at that moment.",
            "A single audit finding doesn't indicate the company stopped selling products altogether."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"hard","type":"mc","text":"Historian Wen Zhao's study of a nineteenth-century Arctic expedition found that every letter its lead surveyor sent home arrived out of sequence, some delayed more than a year — a fact the surveyor's family only discovered decades later when postal archives were opened to researchers. During the expedition itself, the family had received and answered each letter as it arrived, believing the correspondence to be current. This suggests that ______.<br><br>Which choice most logically completes the text?","choices":["the surveyor's family stopped writing back after the first year.","the surveyor and his family may have misunderstood each other's circumstances during the correspondence.","no letters from the expedition survived to reach postal archives.","the postal service of the period lost most of the letters permanently."],"correct":1,"choiceNotes":[
            "The family is described as answering each letter as it arrived, not stopping.",
            "Correct. Responding to badly out-of-order letters as though they were current would plausibly leave both sides confused about each other's actual circumstances at any given time.",
            "Postal archives holding the letters decades later shows they did survive.",
            "The letters were delayed, not lost — they eventually reached postal archives."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"medium","type":"mc","text":"Claim: A city's new streetlight program reduced nighttime traffic accidents.<br><br>Which finding, if true, would most directly support this claim?","choices":["The streetlights cost less to install than expected.","Daytime accident rates were unaffected by the program.","Nighttime accident rates on newly lit streets fell 30% in the year after installation, while rates on unlit streets stayed flat.","Residents reported feeling safer walking at night."],"correct":2,"choiceNotes":[
            "Installation cost has no bearing on whether accidents decreased.",
            "Daytime accidents wouldn't be affected by streetlights either way, so this is irrelevant to the claim.",
            "Correct. A direct before/after accident-rate comparison, with an unlit control group, most directly supports a causal claim about accidents.",
            "A feeling of safety doesn't directly measure actual accident rates."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"hard","type":"mc","text":"A researcher claims a particular 19th-century ledger was forged decades after its supposed date.<br><br>Which discovery would most directly support this claim?","choices":["The ledger is written in elegant, old-fashioned handwriting.","The ledger discusses events from the correct historical period.","The ledger was found in an archive alongside other 19th-century documents.","Chemical analysis shows the ledger's paper contains a wood-pulp additive not manufactured until the 20th century."],"correct":3,"choiceNotes":[
            "Handwriting style alone doesn't prove a forgery or an authentic date.",
            "Discussing period-accurate events doesn't rule out a later forger researching the period.",
            "Proximity to genuine documents in an archive doesn't establish the ledger's own authenticity.",
            "Correct. A manufacturing anachronism in the physical paper directly demonstrates the document couldn't be as old as claimed."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Quantitative)","difficulty":"easy","type":"mc","text":"A survey of 400 commuters found that 220 said they would use a new bike lane if it were built.<br><br>Which choice most accurately interprets the data?","choices":["Exactly 220 commuters in the city support the bike lane.","The survey proves the bike lane would eliminate car traffic.","Fewer than half of the commuters surveyed said they would use the bike lane.","Just over half of the commuters surveyed said they would use the new bike lane."],"correct":3,"choiceNotes":[
            "The 220 figure describes the surveyed sample, not the entire city's commuters.",
            "Interest in a bike lane doesn't prove anything about eliminating car traffic.",
            "220 out of 400 is more than half, not fewer.",
            "Correct. 220/400 = 55%, which is just over half."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"The city's oldest bridge was condemned for safety reasons in 2015. ______, it remains standing today, propped up by temporary supports while funding disputes continue.<br><br>Which choice completes the text with the most logical transition?","choices":["For example","Similarly","Nevertheless","Therefore"],"correct":2,"choiceNotes":[
            "\"For example\" would introduce an illustration, not a contrast with the condemnation.",
            "\"Similarly\" implies agreement between the two ideas, but standing despite condemnation is a contrast.",
            "Correct. \"Nevertheless\" signals the contrast between being condemned and still standing.",
            "\"Therefore\" would suggest the second fact follows logically from the first, but it doesn't — it defies expectation instead."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"hard","type":"mc","text":"Deep-sea anglerfish rely on bioluminescent lures to attract prey in total darkness. ______, some species have gone further, evolving lures that mimic the exact flash pattern of the small crustaceans their prey feed on.<br><br>Which choice completes the text with the most logical transition?","choices":["Similarly","However","In fact","On the other hand"],"correct":2,"choiceNotes":[
            "\"Similarly\" would compare two separate things, not extend a single ongoing idea.",
            "\"However\" signals a contrast, but the second sentence extends and intensifies the first idea rather than contradicting it.",
            "Correct. \"In fact\" signals that the second sentence elaborates on and intensifies the point made in the first.",
            "\"On the other hand\" implies a contrasting idea, which doesn't fit here."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"The committee's first proposal was rejected for being too expensive. ______, the revised plan cut costs by nearly forty percent while preserving the original design's core features.<br><br>Which choice completes the text with the most logical transition?","choices":["Meanwhile","Regardless","In response","For instance"],"correct":2,"choiceNotes":[
            "\"Meanwhile\" implies simultaneous, unrelated events, not a direct response.",
            "\"Regardless\" suggests the revision happened independent of the rejection, which contradicts the clear cause-and-effect relationship.",
            "Correct. \"In response\" correctly signals that the revised plan was created because of the rejection.",
            "\"For instance\" would introduce an example, not describe a resulting action."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"A student has taken these notes: the Sahara was once a lush grassland; this era is called the \"African Humid Period\"; it ended roughly 5,000 years ago; the shift to desert took only a few centuries in some models.<br><br>The student wants to emphasize how quickly the change occurred. Which choice most effectively uses the notes to accomplish this goal?","choices":["The African Humid Period ended roughly 5,000 years ago.","The Sahara is now a desert.","The Sahara was once known as the African Humid Period.","Some models suggest the Sahara's shift from grassland to desert took only a few centuries — a strikingly fast transformation on a geological timescale."],"correct":3,"choiceNotes":[
            "This states a fact from the notes but doesn't emphasize speed.",
            "This is true but omits any sense of pace or transformation.",
            "This misstates the notes — the African Humid Period is the name of an era, not a former name for the Sahara.",
            "Correct. This choice highlights the speed of the shift, which is exactly what the student wants to emphasize."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"hard","type":"mc","text":"A student has taken these notes: Hedy Lamarr was a film actress in the 1930s and 40s; she co-invented a frequency-hopping radio guidance system during World War II; the technology later influenced Wi-Fi and Bluetooth.<br><br>The student wants to highlight the contrast between Lamarr's public image and her technical achievements. Which choice most effectively uses the notes to accomplish this goal?","choices":["Wi-Fi and Bluetooth are technologies used today.","Lamarr's invention was developed during World War II.","Hedy Lamarr appeared in many films during the 1930s and 40s.","Best known to the public as a film actress, Hedy Lamarr also co-invented a wartime radio guidance system whose ideas later shaped Wi-Fi and Bluetooth."],"correct":3,"choiceNotes":[
            "This is true but doesn't mention Lamarr at all, losing the contrast.",
            "This mentions the invention but not the actress image it's meant to contrast with.",
            "This states only her acting career, missing the contrast entirely.",
            "Correct. This choice explicitly juxtaposes her public image (actress) against her lesser-known technical legacy."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"A student has taken these notes: a 2019 study tracked 60 office workers; those given standing desks reported 15% less afternoon fatigue; the study's authors cautioned the sample size was small.<br><br>The student wants to present the finding with appropriate caution. Which choice most effectively uses the notes to accomplish this goal?","choices":["Standing desks eliminate afternoon fatigue completely.","A 2019 study of 60 office workers found that standing desks were associated with 15% less afternoon fatigue, though the authors noted the small sample size warrants further study.","Sixty office workers participated in a 2019 study.","Standing desks are now used in most offices."],"correct":1,"choiceNotes":[
            "This overstates the finding — the study reports a percentage reduction, not elimination.",
            "Correct. This reports the specific finding while also including the authors' caution about sample size.",
            "This states a detail from the notes but omits the actual finding and any caution.",
            "This isn't supported by the notes at all."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"medium","type":"mc","text":"The renovation was completed well under budget ______ the contractor still submitted additional invoices months later.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["budget, however the contractor","budget, the contractor","budget; the contractor","budget the contractor"],"correct":2,"choiceNotes":[
            "This creates a comma splice; \"however\" is a conjunctive adverb, not a coordinating conjunction, so a comma alone cannot use it to join two independent clauses this way.",
            "This creates a comma splice by joining two independent clauses with only a comma.",
            "Correct. A semicolon properly joins two independent clauses without a coordinating conjunction.",
            "This creates a run-on sentence by joining two independent clauses with no punctuation at all."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"easy","type":"mc","text":"The collection of rare manuscripts, housed in a climate-controlled vault, ______ insured for several million dollars.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["were","have been","are","is"],"correct":3,"choiceNotes":[
            "\"Were\" is both plural and past tense, neither of which fits the singular subject or the sentence's tense.",
            "\"Have been\" is plural and doesn't agree with the singular subject \"collection.\"",
            "\"Are\" is plural and doesn't agree with the singular subject \"collection.\"",
            "Correct. \"Collection\" is a singular noun, so it takes the singular verb \"is.\""
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"easy","type":"mc","text":"The researchers published ______ findings in a peer-reviewed journal last month.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["their","they're","it's","its"],"correct":0,"choiceNotes":[
            "Correct. \"Their\" is the plural possessive pronoun that agrees with \"researchers.\"",
            "\"They're\" is a contraction of \"they are,\" not a possessive form.",
            "\"It's\" is a contraction of \"it is,\" which doesn't fit as a possessive here.",
            "\"Its\" is a singular possessive, but \"researchers\" is plural."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"By the time the inspectors arrived, the crew ______ already sealed the leak.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["are","had","have","will have"],"correct":1,"choiceNotes":[
            "\"Are\" is present tense and doesn't fit the past-tense context at all.",
            "Correct. The past perfect \"had\" correctly shows the sealing was completed before the inspectors arrived, an earlier past action.",
            "\"Have\" is present perfect, which doesn't fit a sequence of two past events.",
            "\"Will have\" is future perfect, which doesn't fit a sentence describing past events."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"The chef's specialty dishes involve smoking the meat overnight, slow-roasting the vegetables, and ______.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["to reduce the sauce for hours","the sauce is reduced for hours","reducing the sauce for hours","she reduces the sauce for hours"],"correct":2,"choiceNotes":[
            "The infinitive \"to reduce\" doesn't match the -ing form used by the other two items in the list.",
            "This breaks the parallel -ing structure established by \"smoking\" and \"slow-roasting.\"",
            "Correct. \"Reducing\" matches the -ing form of \"smoking\" and \"slow-roasting,\" maintaining parallel structure.",
            "This shifts to a full clause with a new subject, breaking the parallel list structure."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"easy","type":"mc","text":"The expedition required three essential supplies______ fresh water, waterproof matches, and a reliable compass.<br><br>Which punctuation mark correctly fills the blank?","choices":["a semicolon","no punctuation","a comma","a colon"],"correct":3,"choiceNotes":[
            "A semicolon is used to join two independent clauses or separate complex list items, not to introduce a simple list like this one.",
            "Without any punctuation, the list would run directly into the sentence with no clear introduction.",
            "A comma isn't strong enough to introduce a list following an independent clause like this one.",
            "Correct. A colon properly introduces a list after a complete independent clause."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"hard","type":"mc","text":"The observatory's main telescope, ______ took engineers nearly six years to calibrate, captured its first images last spring.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["which","that","it","who"],"correct":0,"choiceNotes":[
            "Correct. \"Which\" correctly introduces a nonessential clause (set off by commas) describing the telescope.",
            "\"That\" is typically used for essential clauses, not nonessential clauses set off by commas.",
            "\"It\" would create a comma splice, joining two independent clauses with only a comma.",
            "\"Who\" is used for people, not for an inanimate object like a telescope."
          ]}
        ],
        "module2Easier": [
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"easy","type":"mc","text":"After years of drought, the reservoir's water level had dropped so ______ that the old town it once submerged became visible again.<br><br>Which choice completes the text with the most logical and precise word?","choices":["slightly","predictably","dramatically","occasionally"],"correct":2,"choiceNotes":[
            "\"Slightly\" contradicts a drop large enough to reveal an entire town.",
            "\"Predictably\" doesn't capture the magnitude of the change described.",
            "Correct. \"Dramatically\" fits a change large enough to reveal a submerged town.",
            "\"Occasionally\" describes frequency, not the degree of the drop needed to expose a town."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"easy","type":"mc","text":"The intern's report was so ______ that her supervisor didn't need to ask a single follow-up question.<br><br>Which choice completes the text with the most logical and precise word?","choices":["brief","vague","overdue","thorough"],"correct":3,"choiceNotes":[
            "\"Brief\" wouldn't necessarily prevent follow-up questions — a short report could still leave gaps.",
            "\"Vague\" would likely prompt more questions, not fewer.",
            "\"Overdue\" describes timing, not content, and doesn't explain the lack of questions.",
            "Correct. \"Thorough\" explains why no follow-up questions were needed."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"medium","type":"mc","text":"Though the committee's public statements remained ______, internal memos revealed sharp disagreement over the merger's terms.<br><br>Which choice completes the text with the most logical and precise word?","choices":["unified","chaotic","tentative","expansive"],"correct":0,"choiceNotes":[
            "Correct. \"Unified\" sets up the contrast with the internal disagreement revealed by the memos.",
            "\"Chaotic\" would align with, rather than contrast, the internal disagreement.",
            "\"Tentative\" doesn't create a clear contrast with sharp internal disagreement.",
            "\"Expansive\" describes scope, not the agreement or disagreement the sentence is contrasting."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"Restaurant critic Dana Ilic's profile of chef Min-jun Kwon opens by describing, in precise detail, the exact temperature Kwon keeps her walk-in freezer and the labeling system she uses for every ingredient inside it. <u>Only after several paragraphs of this technical detail does Ilic turn to Kwon's philosophy that cooking should feel spontaneous, even reckless.</u> The contrast, Ilic suggests, is the key to understanding Kwon's kitchen.<br><br>Which choice best describes the function of the underlined sentence?","choices":["It criticizes Kwon for being overly technical in her approach to cooking.","It marks a shift from precise technical detail to a seemingly contradictory philosophy.","It proves that spontaneity is impossible in a professional kitchen.","It provides a complete inventory of the freezer's contents."],"correct":1,"choiceNotes":[
            "Nothing in the sentence suggests criticism of Kwon.",
            "Correct. The sentence signals the pivot from meticulous technical description to Kwon's philosophy of spontaneity, setting up the contrast Ilic wants to explore.",
            "The passage doesn't argue spontaneity is impossible — Kwon's philosophy embraces it.",
            "The sentence describes a shift in topic, not an inventory of items."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"The Hartwell Public Library's history, compiled by local archivist Rosa Delgado, opens with the building's construction in 1920 by shipping magnate Elias Hartwell. Delgado then devotes most of her account to the library's current renovation plans, including a new digital media wing and an expanded children's reading room, before closing by noting that Hartwell's original blueprints are still on file.<br><br>Which choice best describes the overall structure of the text?","choices":["It disputes a popular account of the library's founding, then offers a corrected version.","It describes the library's origins, then shifts to its planned future, then closes with a detail linking back to its past.","It compares the library to several other buildings from the same architect.","It presents two competing renovation plans and argues for one over the other."],"correct":1,"choiceNotes":[
            "The text doesn't dispute any existing account of the founding — it simply describes it.",
            "Correct. It moves from the building's 1920 origins, to current renovation plans, to a closing detail (the surviving blueprints) that ties back to the opening.",
            "No other buildings or architects are mentioned.",
            "Only one set of renovation plans is described, and the text doesn't argue for or against it."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1: A historian argues that a particular ancient trade route was primarily used for transporting silk.<br><br>Text 2: Archaeologists recently uncovered pottery fragments along the same route, suggesting it also carried ceramics in large quantities.<br><br>Based on the texts, the author of Text 2 would most likely respond to the claim in Text 1 by","choices":["agreeing completely that silk was the only good transported.","arguing that the route was never used for trade.","claiming that ceramics were more valuable than silk.","suggesting that the route carried a wider range of goods than silk alone."],"correct":3,"choiceNotes":[
            "The new evidence suggests more than just silk was carried, so full agreement doesn't fit.",
            "Both texts agree the route was used for trade.",
            "Neither text makes a comparative claim about value.",
            "Correct. The pottery evidence suggests goods beyond silk traveled the route, broadening rather than contradicting Text 1's claim."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1 argues that a species of migratory bird navigates primarily using the Earth's magnetic field.<br><br>Text 2 documents the same species successfully navigating even when researchers used equipment to disrupt magnetic signals.<br><br>Which choice best describes the relationship between the two texts?","choices":["Text 2 discusses a completely unrelated species.","Text 2 proves the birds do not migrate at all.","Text 2 raises doubt about the primary explanation offered in Text 1.","Text 2 fully confirms the claim made in Text 1."],"correct":2,"choiceNotes":[
            "Both texts study the same species.",
            "Text 2's findings concern navigation method, not whether migration occurs.",
            "Correct. If navigation still succeeded without magnetic signals, that challenges the idea that magnetic sensing is the primary mechanism.",
            "The disruption findings undercut, rather than confirm, Text 1's claim."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"easy","type":"mc","text":"\"The startup's founders had no formal training in software engineering, yet their product outperformed those built by teams of veteran developers.\"<br><br>Which choice best states the main idea of the text?","choices":["Software engineering requires no skill at all.","Formal training is not always necessary for building a superior product.","Veteran developers are incompetent.","The startup failed within its first year."],"correct":1,"choiceNotes":[
            "The text doesn't claim the field requires no skill, only that formal training wasn't necessary here.",
            "Correct. This captures the contrast between lack of formal training and superior results.",
            "The text doesn't call veteran developers incompetent, only that this particular product outperformed theirs.",
            "Nothing in the text mentions failure."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"medium","type":"mc","text":"\"The museum's new wing was designed to be nearly invisible from the street, its glass façade reflecting the historic buildings around it rather than competing with them.\"<br><br>Which choice best states the main idea of the text?","choices":["The museum's new wing is larger than the historic buildings nearby.","The architects intended the wing to be the neighborhood's main attraction.","The glass façade was added purely for structural support.","The new wing was designed to blend with, rather than stand out from, its surroundings."],"correct":3,"choiceNotes":[
            "Size isn't discussed in the text.",
            "The text says the opposite — the design avoids drawing attention.",
            "The purpose described is visual and reflective, not structural.",
            "Correct. This directly reflects the design goal of blending in rather than competing visually."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"medium","type":"mc","text":"A survey of a regional theater's spring season found that although every seat for its opening-night performance of a new play had been reserved weeks in advance, ushers counted nearly a third of the seats empty once the curtain rose. Box office records confirm no seats were resold or exchanged that night. This suggests that ______.<br><br>Which choice most logically completes the text?","choices":["a significant number of ticket holders did not attend the performance.","the theater's reservation system malfunctioned that night.","the performance was ultimately cancelled.","the theater had oversold the venue's actual capacity."],"correct":0,"choiceNotes":[
            "Correct. Reserved seats sitting empty at curtain, with no resales to explain it, points directly to no-shows among ticket holders.",
            "A malfunction isn't suggested — the seats were validly reserved, just unoccupied.",
            "A performance that opened with a rising curtain was not cancelled.",
            "Oversold seats would produce a shortage, not empty seats."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"hard","type":"mc","text":"An ethics review of publication practices in ecology journals found that Dr. Renata Alves submitted the same manuscript to three journals at once, a practice her field's guidelines explicitly forbid, and that she withdrew it from two of them within a week of a colleague pointing out the overlap. Alves has published eleven papers in the same journals without any other flagged violations. This suggests that ______.<br><br>Which choice most logically completes the text?","choices":["Alves's submission was most likely an oversight rather than a deliberate, repeated strategy.","the guideline against simultaneous submission does not apply to established researchers.","none of the three journals ever reviewed the manuscript.","Alves intended from the outset to violate the guidelines."],"correct":0,"choiceNotes":[
            "Correct. A clean record of eleven prior papers plus a quick withdrawal once the overlap was flagged both point toward an isolated oversight rather than a deliberate pattern.",
            "The text states the guideline forbids the practice outright, with no exception for established researchers.",
            "The text states two journals had the manuscript withdrawn after the overlap was flagged, implying review had already begun, not zero review.",
            "The quick withdrawal upon discovery cuts against, rather than supports, a deliberate intent to violate the guideline from the start."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"medium","type":"mc","text":"Claim: A new fertilizer increases crop yield.<br><br>Which finding, if true, would most directly support this claim?","choices":["Farmers reported liking the fertilizer's packaging.","The fertilizer was tested in a single field only once.","Fields treated with the fertilizer produced 20% more crop per acre than untreated fields planted under identical conditions.","The fertilizer is cheaper to produce than older alternatives."],"correct":2,"choiceNotes":[
            "Packaging preference says nothing about crop yield.",
            "A single, one-time test provides weak, not strong, direct support.",
            "Correct. A direct yield comparison between treated and untreated fields under identical conditions most directly supports a yield claim.",
            "Cost has no bearing on whether yield actually increased."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"hard","type":"mc","text":"A researcher claims a newly discovered fossil belongs to a previously unknown species rather than a known one.<br><br>Which discovery would most directly support this claim?","choices":["The fossil was found in a well-studied excavation site.","The fossil is similar in size to a known species.","The fossil was dated using standard radiometric methods.","The fossil's skeletal proportions differ measurably from every known species in its genus."],"correct":3,"choiceNotes":[
            "The location of discovery doesn't establish species identity.",
            "Similarity in size to a known species would argue against, not for, it being a new species.",
            "The dating method establishes age, not species novelty.",
            "Correct. Measurable, distinct proportions from all known species directly support the claim of a new species."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Quantitative)","difficulty":"easy","type":"mc","text":"A survey of 300 residents found that 189 said they support a new recycling program.<br><br>Which choice most accurately interprets the data?","choices":["Fewer than half of the residents surveyed support the program.","Just under two-thirds of the residents surveyed said they support the program.","Exactly 189 residents in the town support the program.","The survey proves the program will succeed."],"correct":1,"choiceNotes":[
            "189/300 is well over half, not fewer.",
            "Correct. 189/300 = 0.63, just under two-thirds.",
            "The 189 figure describes the surveyed sample, not the entire town.",
            "Support in a survey doesn't prove a program's future success."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"The bakery's original recipe called for hand-kneading each loaf. ______, the owner installed a mechanical kneader to keep up with growing demand.<br><br>Which choice completes the text with the most logical transition?","choices":["For example","Nonetheless","Eventually","Similarly"],"correct":2,"choiceNotes":[
            "\"For example\" would introduce an illustration, not a resulting change.",
            "\"Nonetheless\" implies a contrast that undercuts an expectation, which doesn't fit the cause-and-effect relationship here.",
            "Correct. \"Eventually\" signals a change that happened over time as demand grew.",
            "\"Similarly\" would compare two similar things, not describe a change from one practice to another."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"The city council approved funding for the new park unanimously. ______, construction was delayed for over a year due to permitting issues.<br><br>Which choice completes the text with the most logical transition?","choices":["Additionally","Consequently","Specifically","However"],"correct":3,"choiceNotes":[
            "\"Additionally\" would add a similar point, not introduce a contrasting outcome.",
            "\"Consequently\" would suggest the delay resulted from the approval, but permitting issues, not the approval itself, caused it.",
            "\"Specifically\" would narrow a general claim, not introduce a contrast.",
            "Correct. \"However\" signals the contrast between unanimous approval and the unexpected delay."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"hard","type":"mc","text":"Octopuses can alter both the color and the texture of their skin to blend into their surroundings. ______, some species can change their skin pattern in under a second, faster than the human eye can fully track.<br><br>Which choice completes the text with the most logical transition?","choices":["In fact","On the other hand","Similarly","Instead"],"correct":0,"choiceNotes":[
            "Correct. \"In fact\" signals that the second sentence intensifies and elaborates on the first, rather than contrasting it.",
            "\"On the other hand\" signals contrast, but the second sentence extends the same idea rather than opposing it.",
            "\"Similarly\" would compare two separate things, not extend a single ongoing idea about the same ability.",
            "\"Instead\" would suggest a replacement or contrast, not an elaboration."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"A student has taken these notes: the Wright brothers made their first powered flight in 1903; the flight lasted 12 seconds; it covered 120 feet; the location was Kitty Hawk, North Carolina.<br><br>The student wants to emphasize how brief the historic flight was. Which choice most effectively uses the notes to accomplish this goal?","choices":["The flight covered a distance of 120 feet.","The Wright brothers' first powered flight, in 1903, lasted a mere 12 seconds.","The Wright brothers flew at Kitty Hawk, North Carolina.","The Wright brothers achieved powered flight in 1903."],"correct":1,"choiceNotes":[
            "This states distance, not duration — it doesn't emphasize brevity.",
            "Correct. This choice explicitly highlights the brief duration (12 seconds), matching the student's goal.",
            "This states the location but says nothing about duration.",
            "This is true but doesn't mention how brief the flight was."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"A student has taken these notes: Marie Curie won the Nobel Prize in Physics in 1903; she won a second Nobel Prize, in Chemistry, in 1911; she remains the only person to win Nobel Prizes in two different sciences.<br><br>The student wants to emphasize how unique Curie's achievement was. Which choice most effectively uses the notes to accomplish this goal?","choices":["Marie Curie's second prize came in 1911.","Marie Curie studied both physics and chemistry.","Marie Curie remains the only person ever to win Nobel Prizes in two different scientific fields.","Marie Curie won a Nobel Prize in 1903."],"correct":2,"choiceNotes":[
            "This states a date without emphasizing the rarity of the achievement.",
            "This is true but vague, and doesn't communicate that she is the only person to do this.",
            "Correct. This choice directly states the singular, unmatched nature of her achievement.",
            "This states one fact but doesn't convey uniqueness."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"hard","type":"mc","text":"A student has taken these notes: a 2021 survey polled 1,000 remote workers; 68% reported feeling more productive at home; the survey's authors noted that self-reported productivity may not match measured output.<br><br>The student wants to present the finding while noting its limitation. Which choice most effectively uses the notes to accomplish this goal?","choices":["Remote work makes all employees more productive.","A survey of 1,000 remote workers was conducted in 2021.","68% of workers prefer remote work over office work.","A 2021 survey found that 68% of 1,000 remote workers reported feeling more productive at home, though the authors cautioned that self-reported data may not reflect actual output."],"correct":3,"choiceNotes":[
            "This overstates the finding as a universal fact, ignoring both the percentage and the stated limitation.",
            "This omits the actual finding and the limitation entirely.",
            "This isn't supported by the notes, which discuss productivity, not preference.",
            "Correct. This reports the specific finding while also including the authors' caution about self-reported data."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"medium","type":"mc","text":"The museum's new exhibit opened to enthusiastic reviews ______ attendance nearly doubled within the first month.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["reviews attendance","reviews, attendance","reviews; attendance","reviews, however attendance"],"correct":2,"choiceNotes":[
            "This creates a run-on sentence by joining two independent clauses with no punctuation at all.",
            "This creates a comma splice by joining two independent clauses with only a comma.",
            "Correct. A semicolon properly joins two independent clauses without a coordinating conjunction.",
            "This creates a comma splice; \"however\" is a conjunctive adverb, not a coordinating conjunction, so a comma alone cannot use it to join two independent clauses this way."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"easy","type":"mc","text":"The hikers reached the summit just before sunset ______ they immediately began setting up camp for the night.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["sunset they",", and","; moreover they","sunset, they"],"correct":1,"choiceNotes":[
            "This creates a run-on sentence by joining two independent clauses with no punctuation at all.",
            "Correct. A comma followed by the coordinating conjunction \"and\" properly joins two independent clauses.",
            "This is missing a needed comma before \"moreover\" and creates awkward, nonstandard phrasing as a connector here.",
            "This creates a comma splice by joining two independent clauses with only a comma."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"easy","type":"mc","text":"The list of ingredients for the recipe ______ printed on the back of the box.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["are","were","have been","is"],"correct":3,"choiceNotes":[
            "\"Are\" is plural and doesn't agree with the singular subject \"list.\"",
            "\"Were\" is both plural and past tense, neither of which fits.",
            "\"Have been\" is plural and doesn't agree with the singular subject \"list.\"",
            "Correct. \"List\" is a singular noun, so it takes the singular verb \"is.\""
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"easy","type":"mc","text":"The two scientists shared credit for ______ discovery in the published paper.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["their","they're","its","there"],"correct":0,"choiceNotes":[
            "Correct. \"Their\" is the plural possessive pronoun that agrees with \"the two scientists.\"",
            "\"They're\" is a contraction of \"they are,\" not a possessive form.",
            "\"Its\" is a singular possessive, but \"scientists\" is plural.",
            "\"There\" indicates location, not possession."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"By the time the fire department arrived, the neighbors ______ already contained the small blaze with a garden hose.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["will have","had","have","are"],"correct":1,"choiceNotes":[
            "\"Will have\" is future perfect, which doesn't fit a sentence describing past events.",
            "Correct. The past perfect \"had\" correctly shows the containment happened before the fire department's arrival, an earlier past action.",
            "\"Have\" is present perfect, which doesn't fit a sequence of two past events.",
            "\"Are\" is present tense and doesn't fit the past-tense context at all."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"The internship required drafting press releases, coordinating with reporters, and ______.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["interviews are scheduled","she scheduled interviews","scheduling interviews","to schedule interviews"],"correct":2,"choiceNotes":[
            "This shifts to a full passive clause with a new subject, breaking the parallel list structure.",
            "This shifts to a full clause with a new subject, breaking the parallel list structure.",
            "Correct. \"Scheduling\" matches the -ing form of \"drafting\" and \"coordinating,\" maintaining parallel structure.",
            "The infinitive \"to schedule\" doesn't match the -ing form used by the other two items in the list."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"easy","type":"mc","text":"The chemistry lab required three items______ safety goggles, a lab coat, and closed-toe shoes.<br><br>Which punctuation mark correctly fills the blank?","choices":["a comma","no punctuation","a semicolon","a colon"],"correct":3,"choiceNotes":[
            "A comma isn't strong enough to introduce a list following an independent clause like this one.",
            "Without any punctuation, the list would run directly into the sentence with no clear introduction.",
            "A semicolon is used to join two independent clauses or separate complex list items, not to introduce a simple list like this one.",
            "Correct. A colon properly introduces a list after a complete independent clause."
          ]}
        ],
        "module2Harder": [
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"medium","type":"mc","text":"The negotiations, once thought hopelessly ______, resumed within days after a single private phone call between the two leaders.<br><br>Which choice completes the text with the most logical and precise word?","choices":["celebrated","stalled","productive","expedited"],"correct":1,"choiceNotes":[
            "\"Celebrated\" doesn't fit the context of negotiations needing to restart.",
            "Correct. \"Stalled\" explains why resuming so quickly, after one call, would be notable.",
            "\"Productive\" negotiations wouldn't need to be described as needing to \"resume.\"",
            "\"Expedited\" contradicts the idea that they were stuck and needed to resume."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"medium","type":"mc","text":"Critics initially dismissed the novel as derivative, but its ______ handling of a familiar plot eventually won over even the harshest reviewers.<br><br>Which choice completes the text with the most logical and precise word?","choices":["conventional","tedious","inventive","predictable"],"correct":2,"choiceNotes":[
            "\"Conventional\" would also support rather than contradict the \"derivative\" criticism.",
            "\"Tedious\" would not win over harsh reviewers.",
            "Correct. \"Inventive\" explains the shift from dismissal to acclaim despite a \"familiar plot.\"",
            "\"Predictable\" would reinforce, not overturn, the initial dismissal as derivative."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"hard","type":"mc","text":"The diplomat's remarks were carefully ______, offering just enough ambiguity that each side in the dispute could claim she supported its position.<br><br>Which choice completes the text with the most logical and precise word?","choices":["forthright","incendiary","dismissive","equivocal"],"correct":3,"choiceNotes":[
            "\"Forthright\" (direct and open) is nearly the opposite of the ambiguity described.",
            "\"Incendiary\" remarks would provoke conflict, not allow both sides to claim support.",
            "\"Dismissive\" remarks wouldn't let either side claim the diplomat's support.",
            "Correct. \"Equivocal\" (deliberately ambiguous) matches remarks vague enough for both sides to interpret favorably."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"Journalist Priya Chandrasekaran's article on coastal flood insurance opens with a single family in Biloxi, Mississippi, watching six inches of water rise through their living room for the third time in four years. Chandrasekaran then pivots to a broader analysis of how federal flood insurance premiums are calculated nationwide, returning to the family's story only in her final paragraph to show how the national formula affects them directly.<br><br>Which choice best states the main purpose of the text?","choices":["To prove that federal flood insurance premiums are calculated unfairly nationwide.","To use one family's repeated flooding to illustrate the human impact of a national insurance policy.","To argue that the Biloxi family should relocate to a lower-risk area.","To document the history of flood insurance legislation in the United States."],"correct":1,"choiceNotes":[
            "The article explains how premiums are calculated but never argues the formula is unfair.",
            "Correct. The article grounds a national policy analysis in one family's repeated experience, connecting abstract premium calculations to their real impact.",
            "The article never recommends the family relocate.",
            "The article focuses on current premium calculations and one family's experience, not a legislative history."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"hard","type":"mc","text":"A 2021 paper by neuroscientist Tobias Rehn opens with four paragraphs summarizing decades of research on how fruit flies process visual motion. Near the end of the introduction, Rehn narrows this background to the specific, narrow question his own experiments will address: whether a newly identified neuron type contributes to that processing. The rest of the paper is devoted to answering it.<br><br>Which choice best describes the overall structure of the text?","choices":["It disproves earlier research on fruit fly vision, then proposes a replacement theory.","It surveys established background research, then narrows to a specific unanswered question, then addresses that question directly.","It compares fruit fly vision to human vision in equal detail throughout.","It poses a question in the opening paragraph, then spends the rest of the paper summarizing background research."],"correct":1,"choiceNotes":[
            "The paper builds on prior research as background — it doesn't disprove it.",
            "Correct. It moves from broad established background, to a narrow specific question, to the experiments answering that question.",
            "Human vision is never mentioned.",
            "This reverses the actual order — the background comes first, and the specific question comes near the end of the introduction, not before the background."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1: An economist argues that a particular tax policy primarily benefits large corporations at the expense of small businesses.<br><br>Text 2: A separate analysis finds that small businesses in the relevant sector saw a net increase in after-tax profits in the two years following the policy's enactment.<br><br>Based on the texts, the author of Text 2 would most likely respond to the claim in Text 1 by","choices":["arguing that large corporations were unaffected by the policy.","claiming that small businesses do not pay taxes at all.","questioning whether the policy actually harmed small businesses as claimed.","agreeing entirely, citing the same profit data."],"correct":2,"choiceNotes":[
            "Neither text makes a claim about large corporations being unaffected.",
            "Neither text suggests small businesses pay no taxes.",
            "Correct. Rising after-tax profits for small businesses directly challenges the claim that they were harmed at large corporations' expense.",
            "The profit data conflicts with, rather than confirms, Text 1's claim."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1 argues that a particular coral species' bleaching events are caused primarily by rising ocean temperatures.<br><br>Text 2 documents the same coral species bleaching in a controlled tank experiment where temperature was held constant but water acidity was increased.<br><br>Which choice best describes the relationship between the two texts?","choices":["Text 2 confirms that temperature is the only cause of bleaching.","Text 2 shows that the coral species discussed is immune to bleaching.","Text 2 is unrelated to the claim made in Text 1.","Text 2 suggests a factor beyond temperature alone can also cause the effect described in Text 1."],"correct":3,"choiceNotes":[
            "The experiment isolates temperature by holding it constant, so it can't be confirming temperature as the sole cause.",
            "Bleaching still occurred in the experiment, showing the coral is not immune.",
            "Both texts concern the same phenomenon in the same species, so they are directly related.",
            "Correct. Bleaching occurring under constant temperature but increased acidity suggests acidity alone can also trigger it, complicating a temperature-only explanation."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"medium","type":"mc","text":"\"The city's transit authority spent a decade lobbying for a new rail line, only to see ridership fall short of projections within its first year of operation, even as traffic on the parallel highway continued to worsen.\"<br><br>Which choice best states the main idea of the text?","choices":["Highway traffic decreased after the rail line opened.","The transit authority never wanted the rail line built.","A long-sought transit project underperformed expectations despite an apparent need for it.","The rail line was a complete success by every measure."],"correct":2,"choiceNotes":[
            "The text states highway traffic continued to worsen, not decrease.",
            "A decade of lobbying for the project contradicts not wanting it built.",
            "Correct. This captures both the underperformance and the persisting need (worsening highway traffic) that make the shortfall notable.",
            "Falling short of projections is not a complete success."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"hard","type":"mc","text":"\"The translator chose to render the poem's central metaphor literally rather than adapting it to an equivalent image in the target language, a decision some reviewers praised as faithful and others criticized as alienating to readers unfamiliar with the original culture.\"<br><br>Which choice best states the main idea of the text?","choices":["Literal translation is always superior to adaptation.","A translation choice was praised by some as faithful and criticized by others as inaccessible, reflecting a genuine tradeoff.","All reviewers agreed the translation was a failure.","The poem's central metaphor was removed entirely from the translation."],"correct":1,"choiceNotes":[
            "The text presents a genuine tradeoff with reviewers on both sides, not a universal claim that literal translation is always better.",
            "Correct. This captures the divided reception and the tradeoff between faithfulness and accessibility.",
            "Reviewers were divided, not unanimous in condemnation.",
            "The metaphor was rendered literally, not removed."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"medium","type":"mc","text":"Kessler Instruments reported record profits for the third consecutive year in its April earnings call, exceeding the previous year's net income by 4%. Despite this, the company's stock price fell nearly 15% the day the report was released, and the analyst commentary that followed focused heavily on the word \"only.\" This suggests that ______.<br><br>Which choice most logically completes the text?","choices":["investors had expected stronger results than the company actually reported.","Kessler Instruments' profits had actually declined that year.","the stock exchange was closed on the day of the report's release.","the earnings report contained inaccurate financial figures."],"correct":0,"choiceNotes":[
            "Correct. A stock drop despite record profits, paired with analysts fixating on \"only,\" points to results falling short of elevated expectations rather than being bad in absolute terms.",
            "The text states profits were a record for the third straight year, meaning they rose, not declined.",
            "A falling stock price implies the market was open and trading that day.",
            "Nothing in the text questions the accuracy of the figures themselves."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"hard","type":"mc","text":"When cataloguing the correspondence of 19th-century naturalist Eliza Fenwick, archivist Tomás Reyes organized every letter strictly by postmark date rather than by subject. The system let Reyes trace the chronology of Fenwick's travels with ease, but when a researcher later asked for every letter mentioning a specific plant species, Reyes had to read through the entire 800-letter collection to find them. This suggests that ______.<br><br>Which choice most logically completes the text?","choices":["Reyes's cataloguing choice involved a tradeoff between one kind of usefulness and another.","the postmarks on Fenwick's letters were too faded to read accurately.","Reyes intended for the collection to remain inaccessible to researchers.","Fenwick's letters were never actually organized in any systematic way."],"correct":0,"choiceNotes":[
            "Correct. Chronological ease came directly at the cost of topic-based searchability — a clear tradeoff, not a flaw-free system.",
            "Postmarks were used successfully to establish chronology, so they weren't illegibly faded.",
            "Cataloguing a collection at all, and fielding a researcher's request, shows an intent for it to be used, just not by topic.",
            "Postmark-based ordering is itself a systematic organization, not an absence of one."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"medium","type":"mc","text":"Claim: A city's new noise ordinance reduced noise complaints in residential neighborhoods.<br><br>Which finding, if true, would most directly support this claim?","choices":["The ordinance also addressed unrelated zoning regulations.","Recorded noise complaints in residential areas dropped 40% in the year after the ordinance took effect, while complaints in unaffected commercial areas stayed flat.","The ordinance was more expensive to enforce than city officials expected.","Residents were surveyed about their opinion of the mayor."],"correct":1,"choiceNotes":[
            "Unrelated zoning content doesn't provide evidence about noise complaints specifically.",
            "Correct. A direct before/after complaint comparison, with an unaffected control group, most directly supports a causal claim about noise complaints.",
            "Enforcement cost has no bearing on whether complaints actually decreased.",
            "Opinions about the mayor are unrelated to noise complaint data."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"hard","type":"mc","text":"A researcher claims a particular medieval manuscript was produced by more than one scribe.<br><br>Which discovery would most directly support this claim?","choices":["The manuscript was found in a monastery known for producing many texts.","The manuscript's pages are made of the same type of parchment throughout.","Handwriting analysis reveals distinct, consistent differences in letterforms across different sections of the manuscript.","The manuscript is written entirely in the same language throughout."],"correct":2,"choiceNotes":[
            "A monastery's general productivity doesn't establish how many scribes worked on this specific manuscript.",
            "Uniform parchment suggests a single production batch, not multiple scribes.",
            "Correct. Consistent, distinct handwriting differences between sections directly indicate multiple scribes were involved.",
            "A single consistent language doesn't indicate anything about the number of scribes."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Quantitative)","difficulty":"hard","type":"mc","text":"A study tracked 800 patients over five years: 208 who took a new medication reported significant symptom improvement, compared to 96 of 400 patients in a control group who received a placebo.<br><br>Which choice most accurately interprets the data?","choices":["The medication cured all patients who took it.","The placebo group showed no improvement whatsoever.","Every patient in the study took the new medication.","The medication group's improvement rate (26%) was higher than the placebo group's rate (24%), a difference researchers would need to evaluate for statistical significance."],"correct":3,"choiceNotes":[
            "208 out of 800 is far from all patients, ruling out a claim of curing everyone.",
            "96 patients in the placebo group did report improvement, not zero.",
            "The study describes two separate groups; not everyone received the medication.",
            "Correct. 208/800 = 26% and 96/400 = 24% — a modest difference, correctly framed as needing further evaluation rather than an obvious triumph."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"The satellite's primary antenna failed less than a year into its mission. ______, engineers on the ground successfully rerouted its signal through a backup system, extending the mission by nearly a decade.<br><br>Which choice completes the text with the most logical transition?","choices":["Consequently","Remarkably","Similarly","For instance"],"correct":1,"choiceNotes":[
            "\"Consequently\" would suggest the extension resulted simply from the failure itself, but it resulted from the engineers' intervention, which the sentence needs to credit.",
            "Correct. \"Remarkably\" signals that the outcome (a decade-long extension) was an impressive, notable response to the failure.",
            "\"Similarly\" would compare two similar situations, not describe a response to a problem.",
            "\"For instance\" would introduce an example, not describe an engineering response."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"hard","type":"mc","text":"Lichens are often mistaken for a single organism. ______, each lichen is actually a symbiotic partnership between a fungus and an alga or cyanobacterium, two entirely separate organisms living as one.<br><br>Which choice completes the text with the most logical transition?","choices":["As a result","For example","In reality","Likewise"],"correct":2,"choiceNotes":[
            "\"As a result\" would suggest a cause-and-effect relationship that isn't present here.",
            "\"For example\" would introduce an illustration of the first sentence rather than correct it.",
            "Correct. \"In reality\" signals a correction of the common misconception stated in the first sentence.",
            "\"Likewise\" would compare two similar ideas, not correct a misconception."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"hard","type":"mc","text":"Traditional refrigeration relies on compressing and expanding a refrigerant gas to move heat. ______, a newer technique called magnetic refrigeration achieves the same cooling effect by exposing certain metals to a changing magnetic field, with no refrigerant gas at all.<br><br>Which choice completes the text with the most logical transition?","choices":["Similarly","Therefore","In addition","By contrast"],"correct":3,"choiceNotes":[
            "\"Similarly\" would suggest the two methods work the same way, but the second sentence stresses they don't.",
            "\"Therefore\" would suggest the second method follows logically from the first, but it's a fundamentally different technique, not a consequence.",
            "\"In addition\" would suggest the second sentence adds a related detail rather than contrasting the mechanism entirely.",
            "Correct. \"By contrast\" signals the fundamental difference in mechanism between the two cooling methods."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"A student has taken these notes: the Great Barrier Reef spans over 2,300 kilometers; it is composed of nearly 3,000 individual reefs; it is visible from space; it faces threats from rising ocean temperatures.<br><br>The student wants to emphasize the reef's enormous scale. Which choice most effectively uses the notes to accomplish this goal?","choices":["Spanning over 2,300 kilometers and composed of nearly 3,000 individual reefs, the Great Barrier Reef is visible even from space.","The Great Barrier Reef faces threats from rising ocean temperatures.","The Great Barrier Reef is located off the coast of Australia.","Rising ocean temperatures threaten reefs worldwide."],"correct":0,"choiceNotes":[
            "Correct. This choice combines the two scale-related facts (length and number of reefs) and the space-visibility detail, all reinforcing enormous scale.",
            "This states a threat, not a scale detail.",
            "Location isn't mentioned in the notes and doesn't convey scale.",
            "This generalizes beyond the notes and doesn't emphasize scale."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"hard","type":"mc","text":"A student has taken these notes: Ada Lovelace worked with Charles Babbage on his proposed Analytical Engine in the 1840s; she wrote what is considered the first algorithm intended for a machine; the Analytical Engine was never actually built in her lifetime.<br><br>The student wants to highlight the gap between Lovelace's theoretical contribution and its practical realization. Which choice most effectively uses the notes to accomplish this goal?","choices":["Ada Lovelace is remembered as an early computing pioneer.","Though Ada Lovelace wrote what is considered the first algorithm intended for a machine in the 1840s, the machine itself, the Analytical Engine, was never built in her lifetime.","Ada Lovelace worked with Charles Babbage in the 1840s.","The Analytical Engine was a proposed computing machine."],"correct":1,"choiceNotes":[
            "This is a vague summary that doesn't address the specific gap between theory and realization.",
            "Correct. This choice explicitly contrasts the completed algorithm with the never-built machine, directly addressing the gap the student wants to highlight.",
            "This states a collaboration fact but doesn't address the theory-versus-practice gap.",
            "This describes the machine alone, without mentioning Lovelace's algorithm or the gap."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"hard","type":"mc","text":"A student has taken these notes: a 2018 field study observed 40 urban fox dens over one winter; foxes near dens with artificial food sources spent 30% less time foraging than foxes near dens without such sources; the study's authors noted the sample was limited to a single city.<br><br>The student wants to present the finding while noting its limitation. Which choice most effectively uses the notes to accomplish this goal?","choices":["Forty fox dens were observed during the winter of 2018.","Foxes near artificial food sources foraged more than other foxes.","A 2018 study of 40 urban fox dens found that foxes near artificial food sources foraged 30% less, though the authors cautioned the finding came from a single city.","Urban foxes always rely on artificial food sources."],"correct":2,"choiceNotes":[
            "This states a detail from the notes but omits the actual finding and its limitation.",
            "This reverses the finding — the study found foxes with artificial food sources foraged less, not more.",
            "Correct. This reports the specific finding while including the authors' noted limitation about the single-city sample.",
            "This overstates the finding as a universal fact and drops the specific percentage and limitation."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"medium","type":"mc","text":"The renovation crew discovered structural damage behind the drywall, ______ the project's timeline had to be extended by several months.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["however","therefore","being that","so"],"correct":3,"choiceNotes":[
            "\"However\" is a conjunctive adverb; using it after only a comma creates a comma splice.",
            "\"Therefore\" is also a conjunctive adverb; using it after only a comma creates a comma splice.",
            "\"Being that\" is a nonstandard, informal substitute for \"because\" and is not used in formal Standard English.",
            "Correct. A comma followed by the coordinating conjunction \"so\" properly joins the two independent clauses."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"hard","type":"mc","text":"The satellite transmitted data flawlessly for six years ______ a single software update, pushed without adequate testing, caused it to lose contact with mission control permanently.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["but","or","until","and"],"correct":2,"choiceNotes":[
            "\"But\" would suggest a contrast, but the second clause is a consequence in a timeline, not a contradiction.",
            "\"Or\" would present the two clauses as alternatives, which doesn't fit a sequence of events that both happened.",
            "Correct. \"Until\" precisely shows that the software update marked the end of six years of flawless transmission.",
            "\"And\" treats the two events as merely additive, losing the sense that the update caused the transmission to end."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"hard","type":"mc","text":"Neither the committee members nor the chairperson ______ aware of the funding shortfall until the annual audit.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["have been","was","were","are"],"correct":1,"choiceNotes":[
            "\"Have been\" is plural and present perfect, matching neither the required singular agreement nor the past tense.",
            "Correct. In a \"neither...nor\" construction, the verb agrees with the closer subject, \"the chairperson\" (singular), so \"was\" is correct.",
            "\"Were\" would agree with the plural \"committee members,\" but in \"neither...nor\" constructions the verb must agree with the nearer subject, which is singular here.",
            "\"Are\" is present tense, which doesn't fit the past-tense context (\"until the annual audit\")."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"hard","type":"mc","text":"Each of the researchers submitted ______ individual analysis before the team compiled a single unified report.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["they're","its","it's","their"],"correct":3,"choiceNotes":[
            "\"They're\" is a contraction of \"they are,\" not a possessive form.",
            "\"Its\" is a singular, non-personal possessive pronoun and doesn't fit reference to a person.",
            "\"It's\" is a contraction of \"it is,\" not a possessive form at all.",
            "Correct. \"Their\" is the possessive pronoun that agrees with \"each of the researchers,\" referring back to the individual researchers."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"hard","type":"mc","text":"By the time historians began cataloguing the shipwreck's contents, deep-sea currents ______ many of the smaller artifacts miles from the original site.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["had scattered","have scattered","scatter","will have scattered"],"correct":0,"choiceNotes":[
            "Correct. The past perfect \"had scattered\" shows the scattering occurred before the cataloguing began, an earlier past action relative to another past action.",
            "\"Have scattered\" is present perfect, which doesn't fit a sequence of two past events.",
            "\"Scatter\" is present tense and doesn't fit the past-tense context at all.",
            "\"Will have scattered\" is future perfect, which doesn't fit a sentence describing past events."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"The city's revitalization plan calls for widening the sidewalks, planting new trees along Main Street, and ______.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["installation of bike lanes is planned","installing bike lanes","to install bike lanes","bike lanes will be installed"],"correct":1,"choiceNotes":[
            "This shifts to a noun phrase with a separate verb, breaking the parallel -ing structure.",
            "Correct. \"Installing\" matches the -ing form of \"widening\" and \"planting,\" maintaining parallel structure.",
            "The infinitive \"to install\" doesn't match the -ing form used by the other two items in the list.",
            "This shifts to a full passive clause, breaking the parallel list structure."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"hard","type":"mc","text":"The manuscript, ______ authorship remained disputed for nearly two centuries, was finally attributed to a little-known monk through handwriting analysis.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["who","that","whose","which"],"correct":2,"choiceNotes":[
            "\"Who\" is used for people, not for an inanimate object like a manuscript.",
            "\"That\" doesn't indicate possession and is also typically used for essential, not comma-set-off, clauses.",
            "Correct. \"Whose\" correctly shows possession (the manuscript's authorship) while introducing the nonessential clause.",
            "\"Which\" doesn't indicate possession the way \"whose\" does; it would need a different construction to convey \"its authorship.\""
          ]}
        ]
      }
    }
  },
  {
    "id": "sat-practice-2",
    "title": "SAT Practice Test 2",
    "sections": {
      "math": {
        "module1": [
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"easy","type":"mc","text":"Solve for x: 4x + 9 = 41","choices":["32","12.5","8","2"],"correct":2,"choiceNotes":[
            "This is 41 − 9 = 32, the value before the final division by 4 — that last step was skipped.",
            "This comes from a sign error, solving 4x − 9 = 41 instead of 4x + 9 = 41, giving 4x = 50 and x = 12.5.",
            "Correct. Subtract 9 from both sides to get 4x = 32, then divide by 4 to get x = 8.",
            "This comes from dividing 32 by 4 twice (by 16 total) instead of once."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"easy","type":"mc","text":"A tablet originally priced $120 is marked up 35% for a limited-edition version. What is the new price?","choices":["$155","$162","$84","$42"],"correct":1,"choiceNotes":[
            "This adds $35 directly to the price instead of 35% of the price.",
            "Correct. The markup is 0.35 × 120 = $42, so the new price is 120 + 42 = $162.",
            "This treats the 35% as a discount (120 × 0.65) rather than a markup.",
            "This is only the markup amount ($42), not the final marked-up price."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"medium","type":"mc","text":"Solve by factoring: x² − 5x − 14 = 0","choices":["x = 7, −2","x = −7, 2","x = 7, 2","x = −7, −2"],"correct":0,"choiceNotes":[
            "Correct. The expression factors as (x − 7)(x + 2) = 0, giving x = 7 and x = −2.",
            "This has the signs of both roots reversed.",
            "This has the correct magnitudes but the sign of the negative root (−2) reversed.",
            "This has the sign of the positive root (7) reversed."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"medium","type":"fr","text":"A right triangle has legs of length 14 cm and 11 cm. What is its area, in cm²?","answer":77,"explanation":"Area of a triangle = (1/2)(base)(height). Using the two legs as base and height: (1/2)(14)(11) = 77."},
          {"domain":"Algebra","skill":"Linear Functions","difficulty":"easy","type":"mc","text":"What is the slope of the line through the points (3, −4) and (−1, 8)?","choices":["3","−3","1/3","−1/3"],"correct":1,"choiceNotes":[
            "This has the correct magnitude but the wrong sign.",
            "Correct. Slope = (8 − (−4))/(−1 − 3) = 12/(−4) = −3.",
            "This comes from inverting the slope formula and losing the sign — dividing the change in x by the change in y instead of the reverse.",
            "This comes from inverting the slope formula, dividing the change in x by the change in y instead of the reverse."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"hard","type":"mc","text":"Solve for x: 2^(2x+1) = 128","choices":["x = 3","x = 6","x = 7/2","x = 4"],"correct":0,"choiceNotes":[
            "Correct. Since 128 = 2⁷, the exponents must be equal: 2x + 1 = 7, so 2x = 6 and x = 3.",
            "This is the value of 2x after correctly solving 2x + 1 = 7 — the final division by 2 to isolate x was skipped.",
            "This comes from dropping the +1 entirely and solving 2x = 7 directly.",
            "This comes from a sign error, solving 2x − 1 = 7 instead of 2x + 1 = 7."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"medium","type":"mc","text":"If f(x) = 3x² − 12x + 5, what is the x-coordinate of the vertex?","choices":["−2","4","6","2"],"correct":3,"choiceNotes":[
            "This has the correct magnitude but the wrong sign.",
            "This comes from dividing by a instead of 2a, dropping the factor of 2 in the denominator (12/3 = 4).",
            "This divides by 2 alone instead of 2a, forgetting to include the coefficient a in the denominator (12/2 = 6).",
            "Correct. The vertex x-coordinate is −b/(2a) = −(−12)/(2·3) = 12/6 = 2."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"medium","type":"fr","text":"A vendor sells pens for $3 each and notebooks for $7 each. A customer buys 12 items total and spends $56. How many notebooks did the customer buy?","answer":5,"explanation":"Let p = pens and n = notebooks. p + n = 12 and 3p + 7n = 56. Substituting p = 12 − n gives 3(12 − n) + 7n = 56, so 36 + 4n = 56, meaning n = 5."},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"medium","type":"mc","text":"A circle has a circumference of 18π inches. What is its area, in square inches?","choices":["9π","18π","81π","324π"],"correct":2,"choiceNotes":[
            "This uses r without squaring it, computing πr instead of πr² (9π instead of 81π).",
            "This mistakenly treats the circumference value itself (18π) as the area, skipping the steps to find r and r².",
            "Correct. Circumference = 2πr = 18π means r = 9, so area = πr² = π(9²) = 81π.",
            "This uses the diameter (18) in place of the radius, computing π(18²) = 324π instead of using r = 9."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"hard","type":"fr","text":"A population of insects doubles every 6 hours. If the population starts at 150, what is the population after 18 hours?","answer":1200,"explanation":"18 hours contains 18/6 = 3 doubling periods. Population = 150 × 2³ = 150 × 8 = 1,200."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"easy","type":"mc","text":"A car travels at 60 miles per hour. What is this speed in feet per second?","choices":["8.8","88","880","0.088"],"correct":1,"choiceNotes":[
            "This comes from a misplaced decimal point, off by a factor of 10 from the correct value.",
            "Correct. 60 miles per hour × 5,280 feet per mile ÷ 3,600 seconds per hour = 88 feet per second.",
            "This comes from a misplaced decimal point, off by a factor of 10 in the other direction.",
            "This comes from dividing by 3,600 twice instead of once."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"hard","type":"mc","text":"Solve the system: 4x + 3y = 25 and 2x − 3y = −1. What is the value of x?","choices":["2","4","6","24"],"correct":1,"choiceNotes":[
            "This divides 24 by 12 instead of 6.",
            "Correct. Adding the two equations eliminates y: 6x = 24, so x = 4. (Then y = 3.)",
            "This divides 24 by 4 instead of 6.",
            "This is 6x itself, the value right before the final division by 6 to solve for x."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"One-Variable Data: Distributions and Measures of Center and Spread","difficulty":"medium","type":"fr","text":"A set of 8 test scores has a mean of 76. Seven of the scores are 70, 74, 78, 82, 68, 79, and 75. What is the eighth score?","answer":82,"explanation":"The sum of all 8 scores must be 76 × 8 = 608. The seven known scores sum to 70+74+78+82+68+79+75 = 526, so the eighth score is 608 − 526 = 82."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Probability and Conditional Probability","difficulty":"medium","type":"mc","text":"A bag contains 6 red marbles, 4 blue marbles, and 5 yellow marbles. If one marble is drawn at random, what is the probability that it is red or blue?","choices":["1/3","2/5","2/3","4/5"],"correct":2,"choiceNotes":[
            "This is the probability of drawing yellow, the complement of the event actually being asked about.",
            "This uses 4 blue out of the wrong total (10) instead of the full 15 marbles in the denominator.",
            "Correct. P(red or blue) = (6 + 4)/15 = 10/15 = 2/3.",
            "This overcounts by including yellow along with red and blue instead of excluding it."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles and Trigonometry","difficulty":"hard","type":"mc","text":"In a right triangle, the side opposite angle θ has length 9 and the hypotenuse has length 41. What is cos θ?","choices":["9/41","40/41","9/40","41/40"],"correct":1,"choiceNotes":[
            "This is sin θ (opposite/hypotenuse), not cos θ.",
            "Correct. The adjacent side is √(41² − 9²) = √1600 = 40, so cos θ = adjacent/hypotenuse = 40/41.",
            "This is tan θ (opposite/adjacent), not cos θ.",
            "This is the reciprocal of cos θ — secant θ, or hypotenuse/adjacent = 41/40 — not cos θ itself."
          ]},
          {"domain":"Algebra","skill":"Linear Inequalities in One or Two Variables","difficulty":"medium","type":"mc","text":"A parking garage charges $5 for the first hour and $3 for each additional hour. If a driver wants to pay at most $23 total, which inequality gives the possible number of additional hours, a, beyond the first hour?","choices":["5 + 3a ≤ 23","3 + 5a ≤ 23","5 + 3a ≥ 23","5a + 3 ≤ 23"],"correct":0,"choiceNotes":[
            "Correct. The flat $5 fee plus $3 per additional hour must total at most $23.",
            "This swaps which rate is flat and which applies per hour.",
            "This uses the correct expression but the wrong inequality direction — 'at most' means ≤, not ≥.",
            "This incorrectly applies the $5 rate per additional hour instead of as a flat fee."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"easy","type":"mc","text":"If f(x) = x² − 6x + 2, what is f(−1)?","choices":["−3","8","9","−9"],"correct":2,"choiceNotes":[
            "This is f(1) instead of f(−1) — the negative sign on x was lost: 1² − 6(1) + 2 = −3.",
            "This adds only −6(−1) + 2 = 8, without including the squared term (−1)² = 1.",
            "Correct. f(−1) = (−1)² − 6(−1) + 2 = 1 + 6 + 2 = 9.",
            "This has the correct magnitude but the sign flipped throughout the computation."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"medium","type":"fr","text":"Solve the system: 2x + 5y = 16 and 4x − 5y = 2. What is the value of x?","answer":3,"explanation":"Adding the two equations eliminates y: 6x = 18, so x = 3. (Then y = 2.)"},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"medium","type":"fr","text":"A train travels 260 miles in 4 hours at a constant rate. At that same rate, how many miles will it travel in 7 hours?","answer":455,"explanation":"The rate is 260/4 = 65 miles per hour. At that rate, in 7 hours the train travels 65 × 7 = 455 miles."},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"hard","type":"fr","text":"What is the minimum value of the function f(x) = 2x² − 8x + 9?","answer":1,"explanation":"The minimum of an upward-opening parabola occurs at its vertex, x = −b/(2a) = −(−8)/(2·2) = 2. f(2) = 2(2)² − 8(2) + 9 = 8 − 16 + 9 = 1."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"easy","type":"mc","text":"A cyclist travels at 15 meters per second. What is this speed in kilometers per hour?","choices":["15","54","5.4","540"],"correct":1,"choiceNotes":[
            "This reuses the original speed value without converting units at all.",
            "Correct. 15 meters per second × 3,600 seconds per hour ÷ 1,000 meters per kilometer = 54 kilometers per hour.",
            "This comes from a misplaced decimal point, off by a factor of 10.",
            "This comes from a misplaced decimal point, off by a factor of 10 in the other direction."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Lines, Angles, and Triangles","difficulty":"medium","type":"mc","text":"In triangle ABC, the measure of angle A is twice the measure of angle B, and the measure of angle C is 20° more than the measure of angle B. What is the measure of angle B?","choices":["30°","40°","45°","50°"],"correct":1,"choiceNotes":[
            "This doesn't satisfy the triangle angle sum: 2(30) + 30 + (30 + 20) = 140°, not 180°.",
            "Correct. The three angles sum to 180°: 2B + B + (B + 20) = 180, so 4B = 160 and B = 40°.",
            "This doesn't satisfy the given relationships between the three angles precisely.",
            "This doesn't satisfy the triangle angle sum: 2(50) + 50 + (50 + 20) = 270°, far exceeding 180°."
          ]}
        ],
        "module2Easier": [
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"easy","type":"mc","text":"Solve for x: 5x − 6 = 29","choices":["7","4.6","35","23"],"correct":0,"choiceNotes":[
            "Correct. Add 6 to both sides to get 5x = 35, then divide by 5 to get x = 7.",
            "This comes from dividing 23 by 5 instead of adding 6 first — the order of operations was reversed.",
            "This is 29 + 6 = 35, the value before the final division by 5 — that last step was skipped.",
            "This is 29 − 6 = 23, using subtraction instead of addition to isolate 5x."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"easy","type":"mc","text":"A jacket originally priced $150 is discounted 20%. What is the sale price?","choices":["$180","$30","$120","$130"],"correct":2,"choiceNotes":[
            "This adds the discount instead of subtracting it, as if the price increased by 20%.",
            "This is only the discount amount (0.20 × 150 = $30), not the final sale price.",
            "Correct. The discount is 0.20 × 150 = $30, so the sale price is 150 − 30 = $120.",
            "This subtracts a flat $20 instead of 20% of the price."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"easy","type":"mc","text":"Solve by factoring: x² − 4 = 0","choices":["x = 2, −2","x = 4, −4","x = 2 only","x = 16"],"correct":0,"choiceNotes":[
            "Correct. The expression factors as (x − 2)(x + 2) = 0, giving x = 2 and x = −2.",
            "This mistakes the constant term for the roots directly, without taking a square root.",
            "This drops the negative root — both +2 and −2 satisfy the equation.",
            "This confuses x² = 4 with x = 4², squaring instead of taking the square root."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"easy","type":"fr","text":"A rectangle has a length of 13 cm and a width of 6 cm. What is its area, in cm²?","answer":78,"explanation":"Area of a rectangle = length × width = 13 × 6 = 78."},
          {"domain":"Algebra","skill":"Linear Functions","difficulty":"easy","type":"mc","text":"What is the slope of the line through the points (1, 2) and (5, 10)?","choices":["2","1/2","8","4"],"correct":0,"choiceNotes":[
            "Correct. Slope = (10 − 2)/(5 − 1) = 8/4 = 2.",
            "This comes from inverting the slope formula, dividing the change in x by the change in y instead of the reverse.",
            "This is the change in y (8) without dividing by the change in x (4).",
            "This is the change in x (4) used in place of the actual computed slope."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"easy","type":"mc","text":"If f(x) = 2x + 7, what is f(3)?","choices":["13","10","6","17"],"correct":0,"choiceNotes":[
            "Correct. f(3) = 2(3) + 7 = 6 + 7 = 13.",
            "This adds 7 to 3 first (getting 10) instead of multiplying 3 by 2 first.",
            "This computes only 2(3), forgetting to add 7.",
            "This computes 2(3 + 7) = 20 incorrectly reduced, applying the multiplication after the addition instead of before."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"medium","type":"mc","text":"Solve for x: 3^x = 81","choices":["3","4","27","9"],"correct":1,"choiceNotes":[
            "This is the base, 3, mistaken for the exponent.",
            "Correct. Since 81 = 3⁴, x = 4.",
            "This is 81/3, an unrelated intermediate value from dividing rather than matching exponents.",
            "This is 3², not the correct exponent needed to reach 81."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"medium","type":"fr","text":"A vendor sells pens for $4 each and notebooks for $9 each. A customer buys 8 items total and spends $52. How many notebooks did the customer buy?","answer":4,"explanation":"Let p = pens and n = notebooks. p + n = 8 and 4p + 9n = 52. Substituting p = 8 − n gives 4(8 − n) + 9n = 52, so 32 + 5n = 52, meaning n = 4."},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"medium","type":"mc","text":"A circle has an area of 36π square inches. What is its circumference?","choices":["36π in","6π in","18π in","12π in"],"correct":3,"choiceNotes":[
            "This mistakenly reuses the area value as the circumference.",
            "This uses r itself (6) without doubling it for the circumference formula.",
            "This is 3 times r instead of 2 times r, an arithmetic slip in the formula.",
            "Correct. Area = πr² = 36π means r² = 36, so r = 6, and circumference = 2πr = 12π."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"medium","type":"fr","text":"A population of bacteria doubles every 2 hours. If the population starts at 100, what is the population after 6 hours?","answer":800,"explanation":"6 hours contains 6/2 = 3 doubling periods. Population = 100 × 2³ = 100 × 8 = 800."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"easy","type":"mc","text":"A runner travels at 30 miles per hour. What is this speed in feet per second?","choices":["44","4.4","440","0.44"],"correct":0,"choiceNotes":[
            "Correct. 30 miles per hour × 5,280 feet per mile ÷ 3,600 seconds per hour = 44 feet per second.",
            "This comes from a misplaced decimal point, off by a factor of 10.",
            "This comes from a misplaced decimal point, off by a factor of 10 in the other direction.",
            "This comes from dividing by 3,600 twice instead of once."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"easy","type":"fr","text":"Solve the system: x + y = 10 and x − y = 2. What is the value of x?","answer":6,"explanation":"Adding the two equations eliminates y: 2x = 12, so x = 6. (Then y = 4.)"},
          {"domain":"Problem-Solving & Data Analysis","skill":"One-Variable Data: Distributions and Measures of Center and Spread","difficulty":"easy","type":"fr","text":"A set of 5 test scores has a mean of 80. Four of the scores are 76, 82, 79, and 85. What is the fifth score?","answer":78,"explanation":"The sum of all 5 scores must be 80 × 5 = 400. The four known scores sum to 76+82+79+85 = 322, so the fifth score is 400 − 322 = 78."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Probability and Conditional Probability","difficulty":"easy","type":"mc","text":"A fair six-sided die is rolled once. What is the probability that the result is greater than 4?","choices":["1/6","1/3","1/2","2/3"],"correct":1,"choiceNotes":[
            "This counts only one of the two favorable outcomes (just rolling a 6, or just a 5).",
            "Correct. The results greater than 4 are 5 and 6, so P = 2/6 = 1/3.",
            "This overcounts, as if 3 of the 6 outcomes were favorable instead of 2.",
            "This is the complement — the probability of rolling 4 or less — not the probability being asked about."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles and Trigonometry","difficulty":"easy","type":"mc","text":"A right triangle has legs of length 6 and 8. What is the length of its hypotenuse?","choices":["14","48","100","10"],"correct":3,"choiceNotes":[
            "This adds the two legs directly (6 + 8 = 14) instead of applying the Pythagorean theorem.",
            "This is the product of the two legs (6 × 8 = 48), not the hypotenuse.",
            "This is 6² + 8² = 100, the value before taking the square root — that final step was skipped.",
            "Correct. By the Pythagorean theorem, hypotenuse = √(6² + 8²) = √(36 + 64) = √100 = 10."
          ]},
          {"domain":"Algebra","skill":"Linear Inequalities in One or Two Variables","difficulty":"easy","type":"mc","text":"Solve for a: 2a + 7 ≤ 19","choices":["a ≤ 6","a ≤ 13","a ≤ 26","a ≤ 12"],"correct":0,"choiceNotes":[
            "Correct. Subtract 7 from both sides to get 2a ≤ 12, then divide by 2 to get a ≤ 6.",
            "This adds 7 instead of subtracting it, as if solving 2a − 7 ≤ 19.",
            "This multiplies by 2 instead of dividing, inverting the correct operation.",
            "This is 2a ≤ 12 itself, the value before the final division by 2 — that last step was skipped."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"easy","type":"mc","text":"If f(x) = x² + 3, what is f(4)?","choices":["19","16","7","22"],"correct":0,"choiceNotes":[
            "Correct. f(4) = 4² + 3 = 16 + 3 = 19.",
            "This computes only 4², forgetting to add 3.",
            "This adds 3 to 4 first (getting 7) instead of squaring 4 first.",
            "This computes (4 + 3)² incorrectly reduced instead of 4² + 3."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"medium","type":"fr","text":"Solve the system: 3x + 2y = 16 and x − 2y = 0. What is the value of x?","answer":4,"explanation":"From the second equation, x = 2y. Substituting into the first equation: 3(2y) + 2y = 16, so 8y = 16 and y = 2. Then x = 2(2) = 4."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"medium","type":"fr","text":"A delivery truck travels 180 miles in 3 hours at a constant rate. At that same rate, how many miles will it travel in 5 hours?","answer":300,"explanation":"The rate is 180/3 = 60 miles per hour. At that rate, in 5 hours the truck travels 60 × 5 = 300 miles."},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"medium","type":"fr","text":"What is the maximum value of the function f(x) = −x² + 6x + 1?","answer":10,"explanation":"The maximum of a downward-opening parabola occurs at its vertex, x = −b/(2a) = −6/(2·(−1)) = 3. f(3) = −(3)² + 6(3) + 1 = −9 + 18 + 1 = 10."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"easy","type":"mc","text":"A swimmer travels at 30 meters per second. What is this speed in kilometers per hour?","choices":["30","108","10.8","300"],"correct":1,"choiceNotes":[
            "This reuses the original speed value without converting units at all.",
            "Correct. 30 meters per second × 3,600 seconds per hour ÷ 1,000 meters per kilometer = 108 kilometers per hour.",
            "This comes from a misplaced decimal point, off by a factor of 10.",
            "This comes from multiplying by 10 instead of converting through the correct 3,600/1,000 factor."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Lines, Angles, and Triangles","difficulty":"medium","type":"mc","text":"In triangle ABC, the measure of angle A is three times the measure of angle B, and the measure of angle C is 10° more than the measure of angle B. What is the measure of angle B?","choices":["28°","34°","40°","50°"],"correct":1,"choiceNotes":[
            "This doesn't satisfy the triangle angle sum: 3(28) + 28 + (28 + 10) = 150°, not 180°.",
            "Correct. The three angles sum to 180°: 3B + B + (B + 10) = 180, so 5B = 170 and B = 34°.",
            "This doesn't satisfy the triangle angle sum: 3(40) + 40 + (40 + 10) = 210°, exceeding 180°.",
            "This doesn't satisfy the given relationships between the three angles precisely."
          ]}
        ],
        "module2Harder": [
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"medium","type":"mc","text":"Solve for x: 7x − 15 = 6x + 12","choices":["27","−3","3","−27"],"correct":0,"choiceNotes":[
            "Correct. Subtracting 6x from both sides gives x − 15 = 12, so x = 27.",
            "This comes from a sign error combining the constant terms, treating −15 and 12 as if they had the same sign.",
            "This divides the constant terms instead of adding 15 to both sides.",
            "This has the correct magnitude but the wrong sign, from a sign error early in isolating x."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"hard","type":"fr","text":"A price of $200 is increased by 25% and then the new price is decreased by 20%. What is the final price, in dollars?","answer":200,"explanation":"After the increase: 200 × 1.25 = 250. After the decrease: 250 × 0.80 = 200. The two percent changes exactly offset because they're applied to different base amounts — the final price equals the original price."},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"hard","type":"mc","text":"What are the solutions to 2x² + 5x − 12 = 0?","choices":["x = 3/2, −4","x = −3/2, 4","x = 3, −4","x = 3/2, 4"],"correct":0,"choiceNotes":[
            "Correct. By the quadratic formula, x = (−5 ± √(25 + 96))/4 = (−5 ± 11)/4, giving x = 3/2 and x = −4.",
            "This has the signs of both roots reversed.",
            "This drops the denominator of 2 on the positive root, treating it as a whole number.",
            "This has the sign of the negative root (−4) reversed."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"medium","type":"mc","text":"A cylinder has a radius of 5 units and a height of 12 units. What is its volume, in cubic units?","choices":["60π","300π","1,200π","900π"],"correct":1,"choiceNotes":[
            "This computes only πrh instead of πr²h, forgetting to square the radius.",
            "Correct. Volume = πr²h = π(5²)(12) = π(25)(12) = 300π.",
            "This uses 4r² instead of r² in the formula, roughly quadrupling the correct value.",
            "This uses the diameter (10) squared instead of the radius squared, computing π(10²)(9) with an additional error."
          ]},
          {"domain":"Algebra","skill":"Linear Functions","difficulty":"medium","type":"mc","text":"What is the slope of the line through the points (−3, 7) and (5, −9)?","choices":["2","−2","1/2","−1/2"],"correct":1,"choiceNotes":[
            "This has the correct magnitude but the wrong sign.",
            "Correct. Slope = (−9 − 7)/(5 − (−3)) = −16/8 = −2.",
            "This comes from inverting the slope formula and losing the sign — dividing the change in x by the change in y instead of the reverse.",
            "This comes from inverting the slope formula, dividing the change in x by the change in y instead of the reverse."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"hard","type":"mc","text":"Solve for x: (2x + 1)/(x − 4) = 3","choices":["13","11","9","4"],"correct":0,"choiceNotes":[
            "Correct. Multiplying both sides by (x − 4) gives 2x + 1 = 3x − 12, so 13 = x.",
            "This comes from an arithmetic slip combining the terms after cross-multiplying.",
            "This comes from mishandling the distribution of 3 across (x − 4), applying it to only one term.",
            "This is the value that makes the denominator zero, not a solution to the equation at all."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"hard","type":"fr","text":"A radioactive isotope's mass decays by half every 5 years. If a sample starts with a mass of 800 grams, how many years does it take for the mass to reach 100 grams?","answer":15,"explanation":"800 must be halved until it reaches 100: 800 → 400 → 200 → 100, which is 3 halvings. At 5 years per halving, that's 3 × 5 = 15 years."},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"medium","type":"fr","text":"A vendor sells pens for $6 each and notebooks for $11 each. A customer buys 15 items total and spends $115. How many notebooks did the customer buy?","answer":5,"explanation":"Let p = pens and n = notebooks. p + n = 15 and 6p + 11n = 115. Substituting p = 15 − n gives 6(15 − n) + 11n = 115, so 90 + 5n = 115, meaning n = 5."},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"hard","type":"mc","text":"A sphere has a radius of 6 units. What is its volume, in cubic units? (Volume of a sphere = (4/3)πr³.)","choices":["144π","72π","288π","864π"],"correct":2,"choiceNotes":[
            "This uses r² instead of r³, dropping one factor of the radius.",
            "This drops the factor of 4 in the formula's numerator, computing only (1/3)πr³.",
            "Correct. Volume = (4/3)π(6³) = (4/3)π(216) = 288π.",
            "This forgets to apply the (4/3) factor, using r³ alone multiplied by π and then by 4."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"hard","type":"fr","text":"A radioactive sample's mass is halved every 8 years. If the initial mass is 960 grams, what is the mass, in grams, after 24 years?","answer":120,"explanation":"24 years contains 24/8 = 3 halving periods. Mass = 960 × (1/2)³ = 960/8 = 120."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"medium","type":"mc","text":"A construction company pays $578,000 for 3,400 square feet of commercial space. What is the price per square foot?","choices":["$170","$17","$1,700","$196"],"correct":0,"choiceNotes":[
            "Correct. 578,000 ÷ 3,400 = 170.",
            "This comes from a misplaced decimal point, off by a factor of 10.",
            "This comes from a misplaced decimal point, off by a factor of 10 in the other direction.",
            "This comes from an arithmetic slip in the division."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"hard","type":"fr","text":"Solve the system: 5x − 3y = 19 and 2x + 3y = 9. What is the value of x?","answer":4,"explanation":"Adding the two equations eliminates y: 7x = 28, so x = 4. (Then y = 1/3.)"},
          {"domain":"Problem-Solving & Data Analysis","skill":"One-Variable Data: Distributions and Measures of Center and Spread","difficulty":"hard","type":"mc","text":"A data set of 10 values has a mean of 24. If a new value of 46 is added to the set, what is the mean of the resulting 11 values?","choices":["25","26","30","35"],"correct":1,"choiceNotes":[
            "This underestimates the shift caused by the new value, likely from dividing by 10 instead of the new total of 11.",
            "Correct. The original sum is 24 × 10 = 240. Adding 46 gives a new sum of 286, and 286/11 = 26.",
            "This overestimates the new mean, possibly from averaging 24 and 46 directly without weighting by count.",
            "This is far too large a shift for a single added value among 11 total values."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Probability and Conditional Probability","difficulty":"hard","type":"mc","text":"Of 200 students surveyed, 120 play a sport. Of those who play a sport, 45 also play an instrument. Of those who don't play a sport, 20 play an instrument. What is the probability that a randomly selected student who plays an instrument also plays a sport?","choices":["45/200","45/65","20/65","45/120"],"correct":1,"choiceNotes":[
            "This uses the total surveyed (200) as the denominator instead of the total who play an instrument.",
            "Correct. The total who play an instrument is 45 + 20 = 65, and of those, 45 also play a sport, so P = 45/65.",
            "This is the probability that an instrument-playing student does NOT play a sport, the complement of what's asked.",
            "This uses only the sport-playing group (120) as the denominator instead of the full instrument-playing group (65)."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles and Trigonometry","difficulty":"hard","type":"mc","text":"If sin θ = 5/13 and θ is an acute angle, what is tan θ?","choices":["5/12","12/13","5/13","12/5"],"correct":0,"choiceNotes":[
            "Correct. With opposite = 5 and hypotenuse = 13, the adjacent side is √(13² − 5²) = √144 = 12, so tan θ = opposite/adjacent = 5/12.",
            "This is cos θ (adjacent/hypotenuse), not tan θ.",
            "This restates sin θ itself rather than computing tan θ.",
            "This is the reciprocal of the correct answer, cot θ instead of tan θ."
          ]},
          {"domain":"Algebra","skill":"Linear Inequalities in One or Two Variables","difficulty":"medium","type":"mc","text":"A vendor's monthly profit, in dollars, is modeled by P = 25n − 1200, where n is the number of units sold. What is the least number of units the vendor must sell for the profit to be at least $1,550?","choices":["n ≥ 110","n ≥ 44","n ≥ 98","n ≥ 128"],"correct":0,"choiceNotes":[
            "Correct. 25n − 1200 ≥ 1550 gives 25n ≥ 2750, so n ≥ 110.",
            "This divides 1,100 by 25 without first accounting correctly for the full 2,750 needed above zero.",
            "This comes from an arithmetic slip adding instead of properly isolating the 25n term.",
            "This overshoots by mishandling the constant term's sign when moving it across the inequality."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"hard","type":"mc","text":"Solve for x: 2^x = 1/32","choices":["−5","5","−4","1/5"],"correct":0,"choiceNotes":[
            "Correct. Since 1/32 = 2⁻⁵, x = −5.",
            "This has the correct magnitude but the wrong sign — 2⁵ = 32, not 1/32.",
            "This miscounts the power of 2 needed to reach 32, off by one.",
            "This mistakes the exponent itself for a fractional answer."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"hard","type":"fr","text":"Solve the system: 4x + 7y = 1 and 3x − 7y = 34. What is the value of x?","answer":5,"explanation":"Adding the two equations eliminates y: 7x = 35, so x = 5. (Then y = −19/7.)"},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"hard","type":"fr","text":"A pipe can fill a tank in 6 hours. A separate drain, if left open, can empty the same full tank in 10 hours. If the tank starts empty and both the pipe and the drain are left open, how many hours does it take to fill the tank?","answer":15,"explanation":"The pipe fills at a rate of 1/6 tank per hour; the drain empties at 1/10 tank per hour. The net fill rate is 1/6 − 1/10 = 5/30 − 3/30 = 2/30 = 1/15 tank per hour. At that net rate, filling 1 full tank takes 15 hours."},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"hard","type":"fr","text":"What is the maximum value of the function f(x) = −2x² + 16x − 5?","answer":27,"explanation":"The maximum of a downward-opening parabola occurs at its vertex, x = −b/(2a) = −16/(2·(−2)) = 4. f(4) = −2(4)² + 16(4) − 5 = −32 + 64 − 5 = 27."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"hard","type":"fr","text":"A signal travels at a constant speed of 3 × 10⁸ meters per second. How many seconds does it take the signal to travel 1.5 × 10⁹ meters?","answer":5,"explanation":"Time = distance/speed = (1.5 × 10⁹)/(3 × 10⁸) = (1.5/3) × 10¹ = 0.5 × 10 = 5 seconds."},
          {"domain":"Geometry & Trigonometry","skill":"Lines, Angles, and Triangles","difficulty":"hard","type":"mc","text":"In triangle ABC, the measure of angle A is 6° less than three times the measure of angle B, and the measure of angle C is twice the measure of angle B. What is the measure of angle B?","choices":["28°","31°","34°","36°"],"correct":1,"choiceNotes":[
            "This doesn't satisfy the triangle angle sum precisely, though it's close to the correct value.",
            "Correct. The three angles sum to 180°: (3B − 6) + B + 2B = 180, so 6B = 186 and B = 31°.",
            "This doesn't satisfy the triangle angle sum: (3(34) − 6) + 34 + 2(34) = 96 + 34 + 68 = 198°, exceeding 180°.",
            "This doesn't satisfy the triangle angle sum: (3(36) − 6) + 36 + 2(36) = 102 + 36 + 72 = 210°, exceeding 180°."
          ]}
        ]
      },
      "readingWriting": {
        "module1": [
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"medium","type":"mc","text":"Marine geologist Fatima Al-Rashid has spent over a decade studying methane deposits along the Arctic seafloor, and her recent survey data has done little to ______ the debate over how quickly those deposits might destabilize as ocean temperatures rise.<br><br>Which choice completes the text with the most logical and precise word or phrase?","choices":["settle","complicate","begin","avoid"],"correct":0,"choiceNotes":[
            "Correct. \"Settle\" fits \"done little to\" — the data hasn't resolved the ongoing debate.",
            "\"Complicate\" would mean the data added new controversy, but the sentence describes an unresolved debate, not an intensified one.",
            "\"Begin\" doesn't fit since the debate is already established, not newly starting.",
            "\"Avoid\" doesn't logically pair with \"the debate\" as a direct object in this construction."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"medium","type":"mc","text":"In the closing lines of an original short story, a character reflects: \"The letter had sat unopened on the table for three days, and Marguerite found she could no longer summon the will to face what it might contain.\"<br><br>As used in the text, what does the word \"summon\" most nearly mean?","choices":["call forth","legally require","invite formally","gather troops"],"correct":0,"choiceNotes":[
            "Correct. Here \"summon\" means to call forth or muster (the will/courage), matching \"summon the will.\"",
            "This is the legal sense of \"summon\" (to summon someone to court), which doesn't fit summoning an inner quality like will.",
            "This is the sense of a formal invitation, which doesn't fit summoning an abstract quality like will.",
            "This is a military sense, unrelated to the passage's meaning of mustering inner resolve."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"Urban ecologist Diego Fuentes tracked coyote sightings across a mid-sized city for four years, expecting the animals to avoid dense residential blocks entirely. <u>Fuentes instead found coyotes were most frequently spotted within a quarter mile of single-family homes, not in the city's larger parks.</u> He now suspects backyard food sources, not open green space, are the primary draw.<br><br>Which choice best describes the function of the underlined sentence?","choices":["It confirms Fuentes's original expectation about where coyotes would be found.","It presents an unexpected finding that contradicts the initial expectation, setting up Fuentes's revised explanation.","It summarizes the methodology used to track the coyotes.","It introduces the topic of the passage for the first time."],"correct":1,"choiceNotes":[
            "This finding contradicts, rather than confirms, Fuentes's original expectation.",
            "Correct. The surprising finding about residential blocks sets up the explanation about backyard food sources that follows.",
            "This sentence reports a finding, not a description of tracking methods.",
            "The topic (coyote sightings) was already introduced in the first sentence."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"Historian Priya Nair's 2021 study of a 19th-century shipping ledger began as a routine cataloguing project. As she cross-referenced cargo manifests with insurance records, she noticed a pattern of underreported cargo weights on a specific trade route. What started as an administrative task became an investigation into a previously undocumented smuggling network.<br><br>Which choice best states the main purpose of the text?","choices":["To argue that shipping ledgers are unreliable historical sources.","To describe how a routine research task led to an unexpected historical discovery.","To summarize the insurance practices of the 19th century.","To criticize Nair's initial cataloguing methodology."],"correct":1,"choiceNotes":[
            "The text doesn't argue ledgers are unreliable — it shows one led to a real discovery.",
            "Correct. The passage traces Nair's shift from routine cataloguing to uncovering a smuggling network.",
            "Insurance practices are mentioned only as a tool Nair used, not the passage's main focus.",
            "The passage doesn't criticize her methodology; the cataloguing task is presented neutrally as a starting point."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1: Economist Warren Doyle argues that a four-day workweek reduces overall productivity, since fewer working hours mean fewer tasks completed regardless of any efficiency gains.<br><br>Text 2: A 2022 trial led by researcher Elena Vasquez tracked twelve companies that adopted a four-day week and found productivity per hour rose enough to fully offset the lost day in nine of the twelve firms.<br><br>Based on the texts, Vasquez would most likely respond to Doyle's claim by","choices":["agreeing completely, with no reservations.","pointing out that per-hour efficiency gains can offset, and in most cases in her study did offset, the reduction in hours.","arguing that productivity cannot be measured across companies.","dismissing the four-day workweek as an unproven concept."],"correct":1,"choiceNotes":[
            "Vasquez's data shows productivity gains offsetting the loss in most firms, so full agreement doesn't fit.",
            "Correct. Vasquez's finding — that per-hour efficiency rose enough to offset lost hours in nine of twelve firms — directly complicates Doyle's assumption that fewer hours always mean lower output.",
            "Vasquez's study measures productivity across multiple companies, so she wouldn't argue it's unmeasurable.",
            "Vasquez's trial treats the four-day workweek as a testable practice, not dismissing it as unproven."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1: Nutritionist Aiko Tanaka's early research suggested that skipping breakfast consistently led to overeating later in the day.<br><br>Text 2: A larger follow-up study by researcher Samuel Okafor found no significant difference in daily caloric intake between breakfast-skippers and breakfast-eaters, though it did find skippers reported higher hunger levels in the late morning.<br><br>Based on the texts, how would Okafor's findings most likely be characterized in relation to Tanaka's claim?","choices":["They fully confirm Tanaka's claim with stronger evidence.","They complicate Tanaka's claim by finding no overall difference in intake, while still noting a related effect on hunger.","They are entirely unrelated to the question Tanaka investigated.","They prove that skipping breakfast is beneficial for weight management."],"correct":1,"choiceNotes":[
            "Okafor's findings do not confirm Tanaka's claim — they found no difference in overall intake.",
            "Correct. Okafor's study complicates Tanaka's overeating claim by finding no difference in total intake, even though it confirms a related hunger effect.",
            "Both studies investigate the same general question about breakfast and eating patterns, so they are directly related.",
            "Okafor's study doesn't address weight management outcomes, only caloric intake and hunger."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"easy","type":"mc","text":"Community organizer Luis Bautista worked for years to secure funding for the neighborhood's first public library branch, and residents now consider the building's opening his ______ achievement.<br><br>Which choice completes the text with the most logical and precise word or phrase?","choices":["forgettable","crowning","minor","accidental"],"correct":1,"choiceNotes":[
            "\"Forgettable\" contradicts the sense that residents consider this an important achievement.",
            "Correct. \"Crowning\" captures the sense of a career-defining, most notable achievement.",
            "\"Minor\" contradicts the significance implied by years of dedicated work.",
            "\"Accidental\" contradicts the years of deliberate effort described."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"medium","type":"mc","text":"Botanist Helen Cho spent five growing seasons comparing wildflower diversity in meadows with and without seasonal controlled burns. Meadows subjected to periodic burns consistently supported more plant species than unburned meadows nearby, even though burned meadows appeared barren and lifeless for the first several weeks after each fire. Cho attributes this to burns clearing out fast-growing dominant grasses that would otherwise crowd out slower-growing wildflower species.<br><br>Which choice best states the central idea of the text?","choices":["Controlled burns make meadows appear barren for several weeks.","Controlled burns increase wildflower diversity by removing grasses that would otherwise outcompete slower-growing species.","Wildflowers cannot survive in meadows without any burns at all.","Cho's research took place over exactly five growing seasons."],"correct":1,"choiceNotes":[
            "This is a supporting detail about the burns' short-term appearance, not the central idea.",
            "Correct. This synthesizes Cho's finding: burns increase diversity because they remove competing dominant grasses.",
            "The text says unburned meadows have less diversity, not that wildflowers can't survive there at all.",
            "The five-season timeframe is a methodological detail, not the passage's central point."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"medium","type":"mc","text":"Archivist Renata Sousa spent two years digitizing a collection of handwritten letters from a 1920s labor union, expecting mostly routine administrative correspondence. Instead, she found dozens of letters documenting a previously unrecorded strike that never appeared in official union records or contemporary newspaper coverage. Sousa now argues that the union's official archive significantly understates the frequency of labor disputes during that decade.<br><br>Which choice best states the central idea of the text?","choices":["Sousa's digitization project took two years to complete.","The letters reveal an undocumented strike, leading Sousa to argue that official records understate labor disputes from that period.","Newspapers from the 1920s never covered labor disputes accurately.","The union's official archive contains only administrative correspondence."],"correct":1,"choiceNotes":[
            "The two-year timeframe is a methodological detail, not the central idea.",
            "Correct. This synthesizes the discovery and Sousa's resulting argument about underrepresented labor disputes.",
            "The text doesn't make a general claim about all newspaper coverage, just this one undocumented strike.",
            "The text shows the archive contains more than routine correspondence — that's the whole discovery."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"medium","type":"mc","text":"A recent trial randomly assigned one group of office workers to take a 10-minute walk every two hours and a control group to remain seated throughout the workday. Researchers measured afternoon alertness using standardized cognitive tests. The walking group consistently scored higher on these tests than the control group, even though both groups reported similar total sleep the night before. This suggests that ______<br><br>Which choice most logically completes the text?","choices":["sleep has no effect on afternoon alertness.","the alertness difference likely stems from the walking breaks themselves, not from differences in sleep.","office workers should avoid sitting entirely.","cognitive tests are unreliable measures of alertness."],"correct":1,"choiceNotes":[
            "The text doesn't claim sleep has zero effect generally — only that it didn't differ between the two groups here.",
            "Correct. Since sleep was similar across groups but alertness differed, the walking intervention is the more likely explanation — a random-assignment design supports this causal inference.",
            "The text doesn't support such an extreme conclusion — only that the walking breaks helped, not that all sitting must be avoided.",
            "The text uses the cognitive tests as a valid measurement tool, not questioning their reliability."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"hard","type":"mc","text":"Entomologist Kwame Asante studied firefly populations across dozens of ponds and found that flash-synchrony behavior — where large groups of fireflies flash in unison — only reliably appeared in ponds with firefly densities above a specific threshold. Below that threshold, individual fireflies flashed independently regardless of how many other environmental conditions matched the synchronized ponds. Asante therefore concludes that ______<br><br>Which choice most logically completes the text?","choices":["all firefly populations eventually develop synchronized flashing.","population density itself, not merely the presence of other matching conditions, is a necessary condition for synchronized flashing to emerge.","environmental conditions have no effect on firefly flashing behavior.","flash-synchrony is caused entirely by random chance."],"correct":1,"choiceNotes":[
            "The text shows synchrony fails to appear below the density threshold, so not all populations develop it.",
            "Correct. Since synchrony consistently failed below the threshold even when other conditions matched, density appears to be a necessary condition specifically.",
            "The text explicitly discusses matching environmental conditions as relevant, just not sufficient without density.",
            "The consistent threshold pattern argues against pure random chance as the explanation."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"medium","type":"mc","text":"A researcher claims that a particular species of migratory bird relies primarily on magnetic-field cues, rather than visual landmarks, to navigate during its annual migration.<br><br>Which finding, if true, would most directly support this claim?","choices":["Birds fitted with magnets that disrupted magnetic-field sensing became significantly less accurate navigators, even in clear daytime conditions with visible landmarks.","Birds migrated successfully on both cloudy and clear nights.","Birds flew at a consistent altitude throughout their migration.","Birds traveled in larger flocks during the migration season."],"correct":0,"choiceNotes":[
            "Correct. If disrupting magnetic sensing harmed navigation even when visual landmarks were available, that directly supports magnetic cues being the primary mechanism.",
            "Cloud cover affects visibility, not magnetic-field sensing, so this doesn't isolate the claim about magnetic cues.",
            "Altitude doesn't address which navigational cue the birds rely on.",
            "Flock size doesn't address which navigational cue the birds rely on."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"hard","type":"mc","text":"A literary scholar argues that a 19th-century author's later novels show a marked shift away from optimistic endings compared to her earlier work.<br><br>Which quotation from the author's own letters would most effectively support this claim?","choices":["\"I have always believed a story owes its reader some measure of hope by its final page.\"","\"My readers write to tell me my recent endings have left them unsettled, and I confess I intend exactly that now.\"","\"I finished the manuscript in record time this spring.\"","\"The publisher has requested several revisions to chapter three.\""],"correct":1,"choiceNotes":[
            "This quotation reflects the author's earlier philosophy, not a described shift away from it.",
            "Correct. This quotation directly shows the author acknowledging and intending a shift toward unsettling, less optimistic endings.",
            "This addresses the author's writing pace, not the tone of her endings.",
            "This addresses publisher revisions to an early chapter, not the tone of her endings."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Quantitative)","difficulty":"hard","type":"mc","text":"Researchers compared germination rates of a wildflower species under three soil moisture conditions. Table: Low moisture — 22% germination; Medium moisture — 61% germination; High moisture — 58% germination.<br><br>Which choice best describes data from the table that support the claim that germination rate does not increase indefinitely with soil moisture?","choices":["Germination rate at low moisture (22%) was lower than at medium moisture (61%).","Germination rate at medium moisture (61%) was slightly higher than at high moisture (58%), even though high moisture had the most water available.","Germination rate at high moisture (58%) was higher than at low moisture (22%).","All three moisture levels produced germination rates above 20%."],"correct":1,"choiceNotes":[
            "This comparison shows an increase from low to medium, which doesn't by itself demonstrate a leveling-off or decline.",
            "Correct. The slight drop from medium (61%) to high (58%) moisture, despite high moisture offering more water, supports the idea that germination doesn't just keep climbing with more moisture.",
            "This comparison shows an increase from low to high, which doesn't demonstrate the claim about germination not increasing indefinitely.",
            "This is a true general observation but doesn't isolate the relationship between moisture level and germination trend."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"easy","type":"mc","text":"City archivist Ben Okafor discovered a set of blueprints for a subway line that was designed in the 1950s but never built. The blueprints reveal a route that would have connected two neighborhoods still poorly served by public transit today.<br><br>Which choice best states the central idea of the text?","choices":["Okafor found blueprints for an unbuilt subway line that would have served two neighborhoods still underserved today.","Subway construction in the 1950s was more advanced than modern construction.","Okafor works exclusively with city transit records.","The two neighborhoods have never had any public transit options."],"correct":0,"choiceNotes":[
            "Correct. This restates the passage's central point: an unbuilt 1950s subway line would have addressed a transit gap that persists today.",
            "The text doesn't compare 1950s and modern construction techniques.",
            "The text doesn't establish Okafor's full scope of work, only this one discovery.",
            "The text says the neighborhoods are \"poorly served,\" not that they have zero transit options."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"easy","type":"mc","text":"While researching a topic, a student has taken the following notes:<br>• Lighthouses were once essential for maritime navigation.<br>• GPS technology has largely replaced their navigational function.<br>• Many lighthouses are now maintained as historic landmarks instead.<br>• Some coastal towns rely on lighthouse tourism for local revenue.<br><br>The student wants to identify a specific economic fact about lighthouses today. Which choice most effectively uses relevant information from the notes to accomplish this goal?","choices":["Lighthouses were once essential for maritime navigation.","GPS technology has largely replaced the navigational function lighthouses once served.","Many lighthouses are now maintained primarily as historic landmarks.","Some coastal towns rely on lighthouse tourism as a source of local revenue."],"correct":3,"choiceNotes":[
            "This states a historical fact about navigation, not a specific present-day economic fact.",
            "This describes a technological shift, not a specific economic fact.",
            "This describes a preservation status, not a specific economic fact.",
            "Correct. This is the one note that states a specific economic fact — tourism revenue — about lighthouses today."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"While researching a topic, a student has taken the following notes:<br>• Urban beekeeping has grown in popularity in several major cities.<br>• City rooftop hives can produce honey with distinct flavor profiles based on local flora.<br>• Some cities have passed ordinances regulating hive placement near property lines.<br>• A 2020 survey found urban honey yields per hive were comparable to rural yields in the same region.<br><br>The student wants to emphasize a similarity between urban and rural beekeeping. Which choice most effectively uses relevant information from the notes to accomplish this goal?","choices":["Urban beekeeping has grown in popularity in several major cities.","A 2020 survey found that honey yields per hive in urban settings were comparable to yields from rural hives in the same region.","Some cities have passed ordinances regulating where hives can be placed near property lines.","City rooftop hives can produce honey with distinct flavor profiles based on local flora."],"correct":1,"choiceNotes":[
            "This states a popularity trend, not a similarity between urban and rural beekeeping.",
            "Correct. This note directly compares urban and rural yields and finds them similar, matching the goal of emphasizing a similarity.",
            "This describes a regulatory difference specific to urban settings, not a similarity.",
            "This describes a distinguishing feature of urban honey, not a similarity between the two settings."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"While researching a topic, a student has taken the following notes:<br>• A city library system digitized its full newspaper archive in 2019.<br>• The archive spans over 140 years of continuous local publication.<br>• Digitization required scanning more than 2 million individual pages.<br>• Researchers can now search the archive by keyword instead of by date alone.<br><br>The student wants to emphasize the scale of the digitization project. Which choice most effectively uses relevant information from the notes to accomplish this goal?","choices":["A city library system digitized its full newspaper archive in 2019.","Digitization required scanning more than 2 million individual pages.","Researchers can now search the archive by keyword instead of by date alone.","The archive spans over 140 years of continuous local publication."],"correct":1,"choiceNotes":[
            "This states when the project happened, not its scale.",
            "Correct. The 2-million-page figure most directly conveys the scale of the digitization effort.",
            "This describes a new capability the project enabled, not the scale of the effort itself.",
            "This describes the archive's age, which relates to scope but less directly conveys the scale of the digitization work itself."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"easy","type":"mc","text":"Chef Marisol Vega trained for a decade in classical French technique before opening her own restaurant. ______, her menu features almost no French dishes, drawing instead from the street food of her grandmother's hometown.<br><br>Which choice completes the text with the most logical transition?","choices":["For example","Yet","Similarly","As a result"],"correct":1,"choiceNotes":[
            "\"For example\" would introduce an illustration of the French training, not a contrast with it.",
            "Correct. \"Yet\" signals the contrast between her French training and her actual menu choices.",
            "\"Similarly\" would suggest agreement between the two ideas, not the contrast that's actually present.",
            "\"As a result\" would suggest the menu followed logically from her training, when the opposite relationship is described."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"Engineer Tobias Lindqvist designed a bridge support system intended to flex slightly during high winds rather than resist them rigidly. Early wind-tunnel tests showed the flexible design reduced structural stress by nearly 40 percent compared to rigid designs. ______, the flexible joints required more frequent maintenance inspections than a standard rigid support would.<br><br>Which choice completes the text with the most logical transition?","choices":["Consequently","Nevertheless","For instance","Likewise"],"correct":1,"choiceNotes":[
            "\"Consequently\" would suggest the maintenance need followed as a result of the stress reduction, but no causal link like that is established.",
            "Correct. \"Nevertheless\" signals a trade-off — the design has a real benefit, but also this offsetting drawback.",
            "\"For instance\" would introduce an example of the stress reduction, not a separate drawback.",
            "\"Likewise\" would suggest the maintenance point supports the same idea as the previous sentence, not a contrasting one."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"hard","type":"mc","text":"A 2018 audit of a regional power grid found that upgrading transmission lines in older districts reduced energy loss by nearly 15 percent. Grid planners initially assumed similar upgrades in newer districts, where lines were already more modern, would yield comparable savings. ______, the newer districts showed almost no measurable improvement after the same upgrades were installed, since their existing infrastructure had already minimized most avoidable energy loss.<br><br>Which choice completes the text with the most logical transition?","choices":["In fact","However","Additionally","Specifically"],"correct":1,"choiceNotes":[
            "\"In fact\" would suggest what follows reinforces the planners' assumption, when it actually contradicts it.",
            "Correct. \"However\" signals the contrast between the planners' assumption and the actual near-zero results in newer districts.",
            "\"Additionally\" would suggest an added point of the same kind, not a contrasting outcome.",
            "\"Specifically\" would suggest a narrower restatement of the assumption, not a contradiction of it."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"easy","type":"mc","text":"Marine biologist ______ was among the first to document coral bleaching events in the region.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["Teresa Alvarado,","Teresa Alvarado","Teresa, Alvarado","Teresa Alvarado;"],"correct":1,"choiceNotes":[
            "A comma here would incorrectly separate the subject (the full name) from its verb with no grammatical justification.",
            "Correct. A named person following a generic noun like \"biologist\" is an essential appositive here and takes no commas, flowing directly into the verb \"was.\"",
            "A comma between first and last name breaks up the name itself, which is never correct.",
            "A semicolon here would incorrectly separate the subject from its verb, which isn't a valid use of a semicolon."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"medium","type":"mc","text":"After months of testing, the engineers reached a single conclusion______ the bridge's cables could be tensioned unevenly to counteract wind load without adding extra weight.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":[",",":",";",", that"],"correct":1,"choiceNotes":[
            "A comma alone doesn't have the strength to introduce a full explanatory clause like this one.",
            "Correct. A colon correctly introduces an explanation or elaboration of the \"single conclusion\" just named.",
            "A semicolon joins two independent clauses of roughly equal weight; what follows here functions as an explanation of what precedes it, which calls for a colon instead.",
            "Adding \"that\" after a comma creates an ungrammatical construction here — the explanatory relationship calls for a colon, not a comma-plus-relative-pronoun."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"hard","type":"mc","text":"The committee reviewed three proposals for the new community center: a design emphasizing outdoor space, one prioritizing indoor gathering rooms, ______ one blending both approaches evenly.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["and",", and","; and","and,"],"correct":1,"choiceNotes":[
            "Without a comma, this doesn't correctly separate the third item in a list that already uses commas between the first two items.",
            "Correct. In a list of three or more items already separated by commas, a comma before \"and\" correctly precedes the final item.",
            "A semicolon is used to separate independent clauses or complex list items already containing commas — not needed for this straightforward list.",
            "A comma after \"and\" incorrectly interrupts the connection between \"and\" and the final list item."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"easy","type":"mc","text":"Eager to impress the visiting scientists, ______<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["the laboratory was cleaned from top to bottom by the interns.","the interns cleaned the laboratory from top to bottom.","cleaning the laboratory from top to bottom was done by the interns.","the laboratory's cleanliness impressed the visiting scientists."],"correct":1,"choiceNotes":[
            "This places \"the laboratory\" right after the modifier, but a laboratory can't be \"eager to impress\" — the modifier needs to attach to the people who were eager, not the object they cleaned.",
            "Correct. \"The interns\" — the ones who were eager to impress — appears immediately after the modifier, so the sentence correctly attaches \"eager to impress\" to the people it actually describes.",
            "This places \"cleaning\" right after the modifier, but an action can't be \"eager to impress\" — the modifier needs to attach to a person.",
            "This places \"the laboratory's cleanliness\" right after the modifier, but cleanliness itself can't be \"eager to impress\" — the modifier needs to attach to the people who were eager."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"By the time the search team reached the summit, the storm ______ , leaving the descent even more dangerous than the climb up.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["has arrived","arrives","had arrived","will have arrived"],"correct":2,"choiceNotes":[
            "\"Has arrived\" is present perfect, which doesn't fit a sequence of two past events.",
            "\"Arrives\" is present tense and doesn't fit the past-tense context established by \"reached.\"",
            "Correct. The past perfect \"had arrived\" shows the storm's arrival occurred before the team reached the summit, an earlier past action relative to another past action.",
            "\"Will have arrived\" is future perfect, which doesn't fit a sentence describing past events."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"hard","type":"mc","text":"The novelist, ______ debut work was rejected by over twenty publishers before finding an audience, later became one of the decade's bestselling authors.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["who","that","whose","which"],"correct":2,"choiceNotes":[
            "\"Who\" is used for people as a subject or object pronoun, not to show possession.",
            "\"That\" doesn't indicate possession and is also typically used for essential, not comma-set-off, clauses.",
            "Correct. \"Whose\" correctly shows possession (the novelist's debut work) while introducing the nonessential clause.",
            "\"Which\" doesn't indicate possession the way \"whose\" does; it would need a different construction to convey \"its debut work.\""
          ]}
        ],
        "module2Easier": [
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"easy","type":"mc","text":"Wildlife photographer Desmond Ariyoshi spent months trying to capture a rare snow leopard on camera, and his patience finally proved ______ when a single photograph sold for enough to fund his next three expeditions.<br><br>Which choice completes the text with the most logical and precise word or phrase?","choices":["futile","worthwhile","unnecessary","premature"],"correct":1,"choiceNotes":[
            "\"Futile\" would mean his patience achieved nothing, contradicting the successful sale described.",
            "Correct. \"Worthwhile\" fits since the patience ultimately paid off, funding future expeditions.",
            "\"Unnecessary\" contradicts the fact that the patience directly led to a valuable result.",
            "\"Premature\" doesn't fit describing patience that paid off after the fact."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"easy","type":"mc","text":"In an original short story, a character remarks: \"After the trial, the lawyer's reputation was left in tatters, though her conscience, oddly, felt lighter than it had in years.\"<br><br>As used in the text, what does the word \"tatters\" most nearly mean?","choices":["small torn pieces of fabric","a state of being severely damaged","a type of formal courtroom attire","a brief period of silence"],"correct":1,"choiceNotes":[
            "This is the literal sense of \"tatters\" (torn cloth), not the figurative sense used here.",
            "Correct. \"In tatters\" figuratively means severely damaged or ruined, matching the description of her reputation.",
            "This invents an unrelated meaning about clothing type, not supported by the text.",
            "This invents an unrelated meaning about silence, not supported by the text."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"easy","type":"mc","text":"Wildlife veterinarian Grace Okonkwo treated dozens of injured sea turtles over one summer. She began by cataloguing the type and severity of each injury. She then compared those records against boat traffic logs for the same stretch of coastline. Only after finding a strong overlap did she recommend stricter speed limits in turtle nesting areas.<br><br>Which choice best describes the overall structure of the text?","choices":["It presents a recommendation, then abandons it in favor of a different one.","It catalogues injuries, compares that data against a separate record, then recommends a policy based on what the comparison revealed.","It summarizes turtle nesting habits without reference to any injury data.","It argues that boat traffic logs are an unreliable source of data."],"correct":1,"choiceNotes":[
            "The passage builds toward one recommendation at the end — it never presents and then abandons an earlier one.",
            "Correct. This matches the passage's actual sequence: catalogue injuries, cross-reference with boat traffic data, then recommend a policy based on the overlap found.",
            "The passage is centered on injury data and its comparison to boat traffic, not a general summary of nesting habits.",
            "The passage uses the boat traffic logs as a legitimate part of her analysis, not something she argues is unreliable."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"easy","type":"mc","text":"Journalist Talia Reyes spent a year investigating a small town's water quality complaints, initially treating the story as a minor local issue. As she gathered testing data, she uncovered evidence of a decades-old industrial contamination the town's utility company had never disclosed. Her reporting eventually prompted a state investigation.<br><br>Which choice best states the main purpose of the text?","choices":["To argue that small towns should not trust their utility companies.","To describe how what began as a minor local story revealed a larger, undisclosed problem.","To summarize the state investigation's final conclusions.","To criticize Reyes's initial approach to the story."],"correct":1,"choiceNotes":[
            "The text doesn't make this broad an argument — it describes one specific case.",
            "Correct. The passage traces Reyes's shift from a minor story to uncovering serious undisclosed contamination.",
            "The state investigation's conclusions aren't described — only that her reporting prompted it.",
            "The passage doesn't criticize her approach; it's presented as a reasonable starting point."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"medium","type":"mc","text":"Text 1: A sociologist argues that increased remote work has weakened workplace friendships, since employees interact less spontaneously than they did in shared offices.<br><br>Text 2: A 2023 survey of remote employees found that most reported maintaining close friendships with coworkers, often through informal video calls unrelated to work tasks.<br><br>Based on the texts, the author of Text 2 would most likely respond to the claim in Text 1 by","choices":["agreeing completely, with no reservations.","suggesting that close friendships can persist even without the spontaneous in-office interaction the claim assumes is necessary.","arguing that workplace friendships never existed before remote work.","dismissing survey data as an invalid research method."],"correct":1,"choiceNotes":[
            "Text 2's data suggests friendships persisted, so full agreement doesn't fit.",
            "Correct. Text 2 complicates Text 1's assumption by showing friendships can be maintained through other means, like informal video calls.",
            "Neither text claims workplace friendships never existed before remote work.",
            "Text 2 itself relies on survey data, so it wouldn't dismiss the method."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"medium","type":"mc","text":"Text 1: Climate researcher Owen Marsh's early models predicted a specific coastal region would see significant flooding within a decade.<br><br>Text 2: A follow-up analysis by researcher Dana Whitfield, using updated sediment data, found the flooding timeline in that region was likely to be delayed by several years due to previously unaccounted-for land elevation changes.<br><br>Based on the texts, how would Whitfield's findings most likely be characterized in relation to Marsh's claim?","choices":["They fully confirm Marsh's original timeline.","They refine Marsh's timeline by identifying a factor that was previously left out of the models.","They are entirely unrelated to Marsh's research question.","They prove flooding will never occur in that region."],"correct":1,"choiceNotes":[
            "Whitfield's findings adjust the timeline rather than confirming it exactly.",
            "Correct. Whitfield's analysis refines Marsh's prediction by accounting for a factor — land elevation change — the original models missed.",
            "Both studies investigate flooding timing in the same region, so they are directly related.",
            "Whitfield's findings delay the timeline, not eliminate the possibility of flooding entirely."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"easy","type":"mc","text":"After years of underfunding, the theater company's latest production was considered a ______ success, exceeding even the most optimistic ticket sales projections.<br><br>Which choice completes the text with the most logical and precise word or phrase?","choices":["dismal","surprising","predictable","modest"],"correct":1,"choiceNotes":[
            "\"Dismal\" would mean the production failed, contradicting the described exceeded projections.",
            "Correct. \"Surprising\" fits given the context of years of underfunding followed by unexpectedly strong sales.",
            "\"Predictable\" contradicts the framing of exceeding even optimistic projections.",
            "\"Modest\" undersells the described success, which exceeded even optimistic projections."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"easy","type":"mc","text":"Conservationist Mateo Ruiz spent three years reintroducing beavers to a degraded wetland, tracking changes in local water tables as the beaver dams multiplied. By the end of the study, groundwater levels in the area had risen substantially, and several plant species absent for decades had reappeared.<br><br>Which choice best states the central idea of the text?","choices":["Beaver reintroduction raised groundwater levels and helped restore previously absent plant species.","Ruiz's study lasted exactly three years.","Beavers are difficult animals to reintroduce successfully.","The wetland had been degraded for an unknown length of time."],"correct":0,"choiceNotes":[
            "Correct. This synthesizes the passage's central finding: beaver reintroduction raised water tables and restored plant diversity.",
            "The three-year timeframe is a methodological detail, not the central idea.",
            "The text doesn't describe reintroduction difficulty — it describes a successful outcome.",
            "The text doesn't specify how long the wetland had been degraded."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"easy","type":"mc","text":"Astronomer Julia Byrne reanalyzed decades-old telescope data using new image-processing software, expecting mostly to confirm earlier catalogued star positions. Instead, she identified twelve previously uncatalogued faint objects, several of which may be small, previously undetected exoplanets.<br><br>Which choice best states the central idea of the text?","choices":["Byrne's reanalysis uncovered previously uncatalogued objects, some possibly new exoplanets.","Telescope data from past decades is generally unreliable.","Byrne primarily works with image-processing software.","Star positions had never been catalogued before Byrne's work."],"correct":0,"choiceNotes":[
            "Correct. This captures the passage's central point: Byrne's reanalysis revealed new objects, potentially including exoplanets.",
            "The text doesn't argue the old data was unreliable — it was reanalyzed with new tools, not discredited.",
            "The text doesn't establish this as her primary or exclusive area of work.",
            "The text says positions were \"catalogued\" already; her work found additional uncatalogued objects."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"easy","type":"mc","text":"A study tracked recovery times for patients following a specific knee surgery, randomly assigning one group to a standard rehabilitation program and another to a modified program with more frequent, shorter sessions. The modified-program group returned to full mobility on average two weeks sooner, even though total rehabilitation time was similar between groups. This suggests that ______<br><br>Which choice most logically completes the text?","choices":["total rehabilitation time is the only factor that matters for recovery.","session frequency, not just total time spent, may meaningfully affect recovery speed.","the standard program should be discontinued entirely.","knee surgery outcomes cannot be studied through controlled trials."],"correct":1,"choiceNotes":[
            "The finding actually undercuts this, since total time was similar but outcomes still differed.",
            "Correct. Since total time was similar but the more-frequent-session group recovered faster, session frequency appears to matter independent of total time.",
            "The text doesn't support discontinuing the standard program entirely, only that the modified approach showed an advantage in this study.",
            "The text describes exactly this kind of controlled trial being used successfully."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"medium","type":"mc","text":"Linguist Fatima Haidari studied vocabulary retention among students learning a second language, comparing those who used spaced repetition apps with those who used traditional flashcards. Both groups spent equal total study time, but the spaced-repetition group retained significantly more vocabulary after three months, even on words neither group had reviewed recently. Haidari concludes that ______<br><br>Which choice most logically completes the text?","choices":["flashcards are entirely ineffective for language learning.","the timing pattern of review, not just total study time, plays a meaningful role in long-term retention.","students in the spaced-repetition group studied for more total time.","vocabulary retention cannot be measured reliably after three months."],"correct":1,"choiceNotes":[
            "The text doesn't claim flashcards are entirely ineffective, only that spaced repetition outperformed them here.",
            "Correct. Since total study time was equal but retention differed, the review timing pattern itself appears to matter.",
            "The text explicitly states both groups spent equal total study time.",
            "The text treats the three-month retention measurement as valid and meaningful."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"easy","type":"mc","text":"A researcher claims that a particular fish species relies on scent, rather than sight, to locate its preferred food source in murky water.<br><br>Which finding, if true, would most directly support this claim?","choices":["Fish with experimentally blocked smell receptors failed to locate food significantly more often than fish with unobstructed vision in the same murky water.","Fish located food more easily in clear water than in murky water.","Fish swam faster when searching for food.","Fish preferred a specific type of food over others."],"correct":0,"choiceNotes":[
            "Correct. If blocking smell specifically impaired food-finding even when vision was unaffected, that directly supports scent being the primary cue in murky water.",
            "This compares water clarity broadly, without isolating whether scent or sight was responsible.",
            "Swimming speed doesn't address which sense the fish relies on.",
            "Food preference doesn't address which sense the fish relies on to locate it."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"medium","type":"mc","text":"A biographer argues that a famous inventor grew increasingly guarded about sharing his ideas after a rival successfully patented one of his early designs.<br><br>Which quotation from the inventor's own journal would most effectively support this claim?","choices":["\"I used to sketch freely at the café, showing anyone who asked. Now I keep my notebook locked away, even from my closest colleagues.\"","\"The weather this spring has been unusually mild.\"","\"I received a letter from my sister today.\"","\"The workshop needs a new set of tools before winter.\""],"correct":0,"choiceNotes":[
            "Correct. This quotation directly shows the inventor's shift toward guarding his ideas after the earlier openness.",
            "This addresses the weather, unrelated to the claim about guarding ideas.",
            "This addresses personal correspondence, unrelated to the claim about guarding ideas.",
            "This addresses workshop tools, unrelated to the claim about guarding ideas."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Quantitative)","difficulty":"medium","type":"mc","text":"Researchers tracked the number of native bee visits to three garden plots with different flower densities. Table: Low density — 14 visits per hour; Medium density — 38 visits per hour; High density — 36 visits per hour.<br><br>Which choice best describes data from the table that support the claim that bee visits do not increase indefinitely with flower density?","choices":["Bee visits at low density (14) were fewer than at medium density (38).","Bee visits at medium density (38) were slightly higher than at high density (36), even though high density offered more flowers.","Bee visits at high density (36) were more than at low density (14).","All three plots recorded at least 10 visits per hour."],"correct":1,"choiceNotes":[
            "This shows an increase from low to medium, which alone doesn't demonstrate a leveling-off.",
            "Correct. The slight drop from medium (38) to high (36) density, despite more flowers being available, supports the idea that visits don't simply keep climbing with density.",
            "This shows an increase from low to high, which doesn't demonstrate the claim about visits not increasing indefinitely.",
            "This is a true general observation but doesn't isolate the trend across density levels."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"easy","type":"mc","text":"Curator Simone Laurent found a set of unlabeled photographs in a museum's storage archive. After months of research, she identified them as rare images of a 1930s labor march previously believed undocumented.<br><br>Which choice best states the central idea of the text?","choices":["Laurent identified previously unlabeled photographs as rare documentation of a 1930s labor march.","Museum archives never contain unlabeled materials.","The 1930s labor march had already been extensively photographed.","Laurent works exclusively with archival photographs."],"correct":0,"choiceNotes":[
            "Correct. This restates the passage's central point: Laurent's research identified the photos as rare, previously undocumented evidence of the march.",
            "The text describes exactly this kind of unlabeled material existing in the archive.",
            "The text says the march was \"believed undocumented,\" the opposite of extensively photographed.",
            "The text doesn't establish this as her exclusive area of work."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"easy","type":"mc","text":"While researching a topic, a student has taken the following notes:<br>• Community gardens have become more common in urban neighborhoods.<br>• Some gardens are run entirely by volunteer labor.<br>• A 2021 study found gardens reduced local produce costs for participating families by an average of $240 per year.<br>• Gardens can also serve as informal neighborhood gathering spaces.<br><br>The student wants to identify a specific financial fact about community gardens. Which choice most effectively uses relevant information from the notes to accomplish this goal?","choices":["Community gardens have become more common in urban neighborhoods.","A 2021 study found that community gardens reduced local produce costs for participating families by an average of $240 per year.","Some gardens are run entirely by volunteer labor.","Gardens can also serve as informal neighborhood gathering spaces."],"correct":1,"choiceNotes":[
            "This states a popularity trend, not a specific financial fact.",
            "Correct. This is the one note that states a specific financial fact — the dollar amount saved — about community gardens.",
            "This describes labor structure, not a financial fact.",
            "This describes a social function, not a financial fact."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"easy","type":"mc","text":"While researching a topic, a student has taken the following notes:<br>• A city installed solar-powered streetlights in a downtown district.<br>• The lights reduced the district's electricity costs by 18 percent in the first year.<br>• Some residents raised concerns about the lights' initial installation cost.<br>• The city plans to expand the program to two more districts next year.<br><br>The student wants to introduce the topic to an audience unfamiliar with the streetlight program. Which choice most effectively uses relevant information from the notes to accomplish this goal?","choices":["A city installed solar-powered streetlights in a downtown district.","The lights reduced the district's electricity costs by 18 percent in the first year.","Some residents raised concerns about the lights' initial installation cost.","The city plans to expand the program to two more districts next year."],"correct":0,"choiceNotes":[
            "Correct. This note introduces the basic fact of the program's existence, appropriate for an audience unfamiliar with it.",
            "This assumes the audience already knows about the program's existence.",
            "This assumes the audience already knows about the program's existence.",
            "This assumes the audience already knows about the program's existence."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"While researching a topic, a student has taken the following notes:<br>• A rural clinic began offering telehealth appointments in 2020.<br>• Patient no-show rates dropped from 22 percent to 9 percent after telehealth was introduced.<br>• Some older patients reported difficulty using the required video software.<br>• The clinic added phone-based support to help patients with technical issues.<br><br>The student wants to make and support a generalization about telehealth's effect on patient attendance. Which choice most effectively uses relevant information from the notes to accomplish this goal?","choices":["A rural clinic began offering telehealth appointments in 2020.","Some older patients reported difficulty using the required video software.","Patient no-show rates dropped from 22 percent to 9 percent after telehealth was introduced, suggesting telehealth can improve appointment attendance.","The clinic added phone-based support to help patients with technical issues."],"correct":2,"choiceNotes":[
            "This states when the program began, not a generalization about its effect on attendance.",
            "This describes a drawback for some patients, not a generalization supported by the strongest evidence about attendance.",
            "Correct. The no-show rate data directly supports a generalization about telehealth improving attendance.",
            "This describes a support measure, not a generalization about attendance."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"easy","type":"mc","text":"Author Kenji Watanabe spent his early career writing strictly realist fiction. ______, his most recent novel embraces magical realism, blending everyday settings with dreamlike, unexplained events.<br><br>Which choice completes the text with the most logical transition?","choices":["For example","In contrast","Similarly","Consequently"],"correct":1,"choiceNotes":[
            "\"For example\" would introduce an illustration of his realist fiction, not a shift away from it.",
            "Correct. \"In contrast\" signals the shift between his earlier realist work and his new magical-realist novel.",
            "\"Similarly\" would suggest agreement between the two styles, not the contrast that's actually present.",
            "\"Consequently\" would suggest the new style followed logically as a result, when no such causal link is described."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"easy","type":"mc","text":"The volunteer fire department relied on donated equipment for over a decade. ______, a recent grant allowed them to purchase a brand-new truck outright.<br><br>Which choice completes the text with the most logical transition?","choices":["Similarly","Recently","For instance","Likewise"],"correct":1,"choiceNotes":[
            "\"Similarly\" would suggest agreement between the two situations, but the sentence describes a change, not a similarity.",
            "Correct. \"Recently\" signals the shift in time from the decade of relying on donations to the new grant-funded purchase.",
            "\"For instance\" would introduce an example of relying on donations, not a shift away from it.",
            "\"Likewise\" would suggest agreement, not the change in circumstances actually described."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"A city's bike-share program cut average commute times by 12 minutes in its downtown pilot zone, where traffic congestion was heaviest. Transit planners assumed expanding the same program to the suburbs, where congestion was far lighter, would produce comparable time savings. ______, suburban riders reported almost no change in commute time, since driving there was already fast enough that the bike lanes offered little advantage.<br><br>Which choice completes the text with the most logical transition?","choices":["Similarly","Instead","For example","Consequently"],"correct":1,"choiceNotes":[
            "\"Similarly\" would suggest agreement with the planners' assumption, not the contradiction actually described.",
            "Correct. \"Instead\" signals that the actual suburban outcome replaced the expected one — comparable savings didn't happen, and something different (no real change) did.",
            "\"For example\" would introduce an illustration of the assumption, not a contradiction of it.",
            "\"Consequently\" would suggest the near-zero change followed logically from the assumption as a cause, when the assumption was actually wrong, not a cause of this outcome."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"easy","type":"mc","text":"Sculptor ______ unveiled her latest installation at the city's riverfront park.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["Nadia Petrov,","Nadia Petrov","Nadia, Petrov","Nadia Petrov;"],"correct":1,"choiceNotes":[
            "A comma here would incorrectly separate the subject (the full name) from its verb with no grammatical justification.",
            "Correct. A named person following a generic noun like \"sculptor\" is an essential appositive here and takes no commas, flowing directly into the verb \"unveiled.\"",
            "A comma between first and last name breaks up the name itself, which is never correct.",
            "A semicolon here would incorrectly separate the subject from its verb."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"easy","type":"mc","text":"The chef refused to reveal one detail about her signature dish______ the exact ratio of spices in the sauce.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":[",","—",";",", which was"],"correct":1,"choiceNotes":[
            "A comma alone doesn't have the strength to set off a specific detail being named after a general reference like \"one detail.\"",
            "Correct. A dash correctly introduces the specific detail that elaborates on \"one detail\" just mentioned, giving it emphasis.",
            "A semicolon joins two independent clauses of roughly equal weight; what follows here isn't a standalone independent clause, so a dash fits better.",
            "Adding \"which was\" after a comma creates an unnecessarily wordy, less direct construction than the dash the sentence calls for."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"medium","type":"mc","text":"The festival featured three main attractions: a live music stage, a row of food vendors, ______ a juried art exhibit.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["and",", and","; and","and,"],"correct":1,"choiceNotes":[
            "Without a comma, this doesn't correctly separate the third item in a list that already uses commas between the first two items.",
            "Correct. In a list of three or more items already separated by commas, a comma before \"and\" correctly precedes the final item.",
            "A semicolon is used to separate independent clauses or complex list items already containing commas — not needed for this straightforward list.",
            "A comma after \"and\" incorrectly interrupts the connection between \"and\" and the final list item."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"easy","type":"mc","text":"The two research teams shared access to the same laboratory, but each team kept ______ equipment carefully separated to avoid cross-contamination.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["teams'","team's","teams's","teams"],"correct":1,"choiceNotes":[
            "\"Teams'\" is a plural possessive, but \"each team\" is singular, so it needs a singular possessive form.",
            "Correct. \"Each team\" is singular, so it takes the singular possessive \"team's.\"",
            "\"Teams's\" is not a standard possessive form in English — plural possessives ending in s use just an apostrophe (teams'), not apostrophe-s.",
            "\"Teams\" with no apostrophe doesn't show possession at all, leaving the sentence without the needed possessive relationship to \"equipment.\""
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"easy","type":"mc","text":"By the time the rescue crew arrived, the flood waters ______ , leaving behind a thick layer of mud across the entire street.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["has receded","recede","had receded","will have receded"],"correct":2,"choiceNotes":[
            "\"Has receded\" is present perfect, which doesn't fit a sequence of two past events.",
            "\"Recede\" is present tense and doesn't fit the past-tense context established by \"arrived.\"",
            "Correct. The past perfect \"had receded\" shows the water's recession occurred before the crew arrived, an earlier past action relative to another past action.",
            "\"Will have receded\" is future perfect, which doesn't fit a sentence describing past events."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"The violinist, ______ early performances drew little attention, later became one of the era's most celebrated soloists.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["who","that","whose","which"],"correct":2,"choiceNotes":[
            "\"Who\" is used for people as a subject or object pronoun, not to show possession.",
            "\"That\" doesn't indicate possession and is also typically used for essential, not comma-set-off, clauses.",
            "Correct. \"Whose\" correctly shows possession (the violinist's early performances) while introducing the nonessential clause.",
            "\"Which\" doesn't indicate possession the way \"whose\" does; it would need a different construction to convey \"its early performances.\""
          ]}
        ],
        "module2Harder": [
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"hard","type":"mc","text":"Despite the committee's public assurances, internal memos later revealed a considerably more ______ assessment of the project's chances, one far removed from the optimism expressed in press releases.<br><br>Which choice completes the text with the most logical and precise word or phrase?","choices":["favorable","guarded","enthusiastic","effusive"],"correct":1,"choiceNotes":[
            "\"Favorable\" would align with the optimistic public assurances, not contrast with them as the sentence requires.",
            "Correct. \"Guarded\" captures a cautious, less optimistic internal assessment, contrasting with the public optimism.",
            "\"Enthusiastic\" would align with, not contrast with, the public optimism described.",
            "\"Effusive\" would align with, not contrast with, the public optimism described."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"hard","type":"mc","text":"In an original short story, a narrator reflects: \"Years later, she would still describe that summer as the fulcrum on which the rest of her life had turned.\"<br><br>As used in the text, what does the word \"fulcrum\" most nearly mean?","choices":["a type of lever used in construction","a pivotal, central turning point","a musical term for tempo change","a formal legal proceeding"],"correct":1,"choiceNotes":[
            "This is the literal, mechanical sense of \"fulcrum,\" not the figurative sense used here.",
            "Correct. Used figuratively, \"fulcrum\" means a pivotal turning point, matching \"the rest of her life had turned\" around that summer.",
            "This invents an unrelated musical meaning, not supported by the text.",
            "This invents an unrelated legal meaning, not supported by the text."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"hard","type":"mc","text":"Paleoclimatologist Rosalind Kerr spent a decade analyzing ice cores from a remote glacier, expecting temperature records to show a steady, gradual warming trend matching regional averages. <u>Kerr's data instead revealed two abrupt multi-year temperature spikes disconnected from any regional pattern she could identify.</u> She now suspects localized volcanic activity, not broader climate trends, explains the anomalies.<br><br>Which choice best describes the function of the underlined sentence?","choices":["It confirms Kerr's original expectation about a steady warming trend.","It presents an anomalous finding that undermines the initial expectation, setting up an alternative explanation.","It summarizes the ice core extraction methodology in full.","It introduces the topic of glacial ice cores for the first time."],"correct":1,"choiceNotes":[
            "This finding contradicts, rather than confirms, Kerr's expectation of a steady, gradual trend.",
            "Correct. The unexpected spikes undermine the steady-warming expectation and set up the volcanic-activity explanation that follows.",
            "This sentence reports a finding, not a description of extraction methods.",
            "The topic (ice cores) was already introduced in the first sentence."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"hard","type":"mc","text":"Economist Devon Marsh's report on a regional currency shift opens by presenting three competing theories from prior literature, each predicting a different market outcome. The report then devotes its middle section to testing each theory against a decade of trade data. Only in its final pages does Marsh state which theory the data actually supports.<br><br>Which choice best describes the overall structure of the text?","choices":["It presents one theory, immediately refutes it, then proposes a new one.","It surveys competing explanations, tests them against data, then identifies the one the evidence supports.","It summarizes trade data without reference to any theoretical framework.","It argues that all three competing theories are equally invalid."],"correct":1,"choiceNotes":[
            "The text presents three theories from the start, not just one that's immediately refuted.",
            "Correct. This matches the described structure: survey competing theories, test them against data, then identify which one the evidence supports.",
            "The report explicitly organizes around the three competing theories, not data alone.",
            "The report identifies one theory the data supports, rather than dismissing all three."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1: Sociologist Priya Deshmukh argues that increased screen time among teenagers directly causes declines in in-person social skills, citing a correlation between hours spent on devices and lower scores on social-skills assessments.<br><br>Text 2: A longitudinal study by researcher Marcus Webb followed the same teenagers over five years and found that those with lower social-skills scores tended to increase their screen time afterward, rather than screen time preceding the decline.<br><br>Based on the texts, Webb's findings would most likely be used to","choices":["fully confirm Deshmukh's claim about the direction of the effect.","question the direction of causality in Deshmukh's claim, suggesting the relationship may run the opposite way.","prove that screen time has no relationship to social skills at all.","argue that social-skills assessments are invalid research tools."],"correct":1,"choiceNotes":[
            "Webb's longitudinal ordering suggests the opposite direction from what Deshmukh claims, so full confirmation doesn't fit.",
            "Correct. By showing lower social skills preceded increased screen time, Webb's findings question whether Deshmukh's causal direction is correct.",
            "Webb's findings still show a relationship between the two variables — just possibly reversed in direction, not absent.",
            "Webb's study itself relies on the same social-skills assessments, so it wouldn't invalidate them."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1: A 2015 analysis concluded that a particular ancient trade route was abandoned primarily due to political conflict between two neighboring kingdoms.<br><br>Text 2: A more recent excavation led by archaeologist Femi Adeyemi uncovered sediment evidence of a prolonged drought along the same route dated to the same period, with no corresponding evidence of major conflict-related destruction at excavated waypoints.<br><br>Based on the texts, Adeyemi's findings would most likely be characterized as","choices":["fully consistent with the original political-conflict explanation.","offering an alternative environmental explanation that the original analysis did not consider.","irrelevant to the question of why the route was abandoned.","proof that political conflict never occurred in the region."],"correct":1,"choiceNotes":[
            "The lack of conflict-related destruction evidence sits in tension with, not fully consistent with, the original explanation.",
            "Correct. The drought evidence, combined with the absence of destruction evidence, offers an environmental explanation the original political-conflict analysis didn't account for.",
            "Both texts address the same question — why the route was abandoned — so Adeyemi's findings are directly relevant.",
            "Adeyemi's findings show an absence of destruction evidence at the excavated sites, not proof that conflict never occurred anywhere in the region."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"hard","type":"mc","text":"The panel's final report was notably ______ on the question of long-term funding, offering detailed recommendations for every other aspect of the program.<br><br>Which choice completes the text with the most logical and precise word or phrase?","choices":["thorough","silent","emphatic","specific"],"correct":1,"choiceNotes":[
            "\"Thorough\" contradicts the sentence's contrast with detailed recommendations on other topics — thoroughness would match, not oppose, that detail.",
            "Correct. \"Silent\" fits the contrast: detailed on every other aspect, but notably lacking any comment on funding specifically.",
            "\"Emphatic\" would suggest a strong statement was made, contradicting the described lack of comment.",
            "\"Specific\" contradicts the sentence's contrast with detailed recommendations elsewhere — specificity would match, not oppose, that detail."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"hard","type":"mc","text":"Anthropologist Idris Bello spent six years living among a coastal fishing community, initially intending to document traditional net-making techniques before they disappeared. Over time, his research shifted toward the community's informal system of resource-sharing during poor fishing seasons, which he found had sustained the community through droughts no formal aid program had addressed. Bello now argues this informal system deserves as much scholarly attention as the region's more visible economic institutions.<br><br>Which choice best states the central idea of the text?","choices":["Bello's research focus shifted from documenting net-making to studying an informal resource-sharing system that sustained the community, which he argues deserves more scholarly attention.","Traditional net-making techniques have entirely disappeared from the community.","Formal aid programs successfully addressed the community's droughts.","Bello lived with the community for exactly six years."],"correct":0,"choiceNotes":[
            "Correct. This synthesizes the passage's arc: a shift in research focus toward an underappreciated resource-sharing system, and Bello's resulting argument.",
            "The text doesn't state the techniques have entirely disappeared, only that Bello initially intended to document them before they might.",
            "The text says the opposite — no formal aid program addressed the droughts the informal system helped the community survive.",
            "The six-year timeframe is a methodological detail, not the central idea."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"hard","type":"mc","text":"Historian Naomi Reyes reexamined municipal records from a 1930s public works project long credited to a single celebrated engineer. Her research uncovered detailed contribution logs showing that a team of uncredited draftsmen, many of them women barred from formal engineering credentials at the time, produced the majority of the project's technical designs. Reyes argues the historical record should be revised to reflect their role.<br><br>Which choice best states the central idea of the text?","choices":["Reyes's research uncovered evidence that uncredited draftsmen, not the celebrated engineer alone, produced most of the project's designs, prompting her call to revise the record.","The celebrated engineer had no involvement in the public works project at all.","Women were never permitted to work on public works projects in the 1930s.","Municipal records from the 1930s are generally unreliable historical sources."],"correct":0,"choiceNotes":[
            "Correct. This synthesizes the passage's central finding and Reyes's resulting argument about revising credit for the project.",
            "The text doesn't claim the engineer had zero involvement, only that credit was misattributed away from the uncredited team.",
            "The text says women worked on the project as draftsmen, just without formal credentials or credit — not that they were barred from working entirely.",
            "The text doesn't make this broad a claim about all municipal records — only that this one project's credit was inaccurate."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"hard","type":"mc","text":"A controlled agricultural trial planted identical crop varieties in adjacent plots, varying only the timing of irrigation relative to sunrise. Plots irrigated within an hour after sunrise consistently showed 12 percent higher yields than plots irrigated at midday, even though total water volume was identical across all plots and soil composition was controlled for. Researchers therefore concluded that ______<br><br>Which choice most logically completes the text?","choices":["total water volume is the only factor affecting crop yield.","irrigation timing itself, independent of total water volume, can meaningfully affect yield.","midday irrigation should be banned in all agricultural settings.","soil composition has no effect on crop yield whatsoever."],"correct":1,"choiceNotes":[
            "The finding actually undercuts this, since total volume was identical but yields still differed.",
            "Correct. Since water volume and soil were controlled for but yields still differed by irrigation timing, timing itself appears to matter independently.",
            "The text doesn't support banning midday irrigation in all settings, only that this trial found an advantage to earlier timing.",
            "The text says soil composition was controlled for as a variable, which doesn't mean it has no effect — only that it wasn't the cause of this particular difference."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"hard","type":"mc","text":"A team studying a species of migratory eel found that eels raised in tanks with artificial magnetic-field variation matching their natural migratory route developed stronger orientation responses than eels raised in tanks with no field variation at all, even when both groups were later tested in identical conditions. This suggests that ______<br><br>Which choice most logically completes the text?","choices":["magnetic-field exposure has no lasting effect once testing conditions are standardized.","early exposure to migratory-route-like magnetic variation may have a lasting influence on orientation ability, independent of later testing conditions.","all eels develop identical orientation responses regardless of upbringing.","orientation ability is determined solely by genetics."],"correct":1,"choiceNotes":[
            "The finding contradicts this — the effect persisted even under identical later testing conditions.",
            "Correct. Since the groups only differed in early-life exposure but showed different responses under identical later conditions, that early exposure appears to have a lasting influence.",
            "The text shows a clear difference between the two groups, not identical responses.",
            "The text points to an environmental factor (early exposure), not evidence isolating genetics as the sole determinant."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"hard","type":"mc","text":"A researcher claims that a specific species of octopus uses visual camouflage as a primary defense against predators, rather than fleeing or using ink as a first response.<br><br>Which finding, if true, would most directly support this claim?","choices":["In the majority of recorded predator encounters, octopuses changed skin pattern and color to match their surroundings before attempting to flee or release ink, and this response alone deterred most approaching predators.","Octopuses were observed hunting more frequently at night than during the day.","Octopuses in the study varied in size from juvenile to adult.","Octopuses were found in a wide range of ocean depths."],"correct":0,"choiceNotes":[
            "Correct. This directly shows camouflage occurring first and succeeding as a defense, supporting it as the primary response over fleeing or inking.",
            "Hunting time doesn't address which defense mechanism is used first against predators.",
            "Size variation doesn't address which defense mechanism is primary.",
            "Depth range doesn't address which defense mechanism is primary."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"hard","type":"mc","text":"A critic argues that a celebrated novelist's public statements about her writing process contradict what her private notebooks actually reveal about how she worked.<br><br>Which quotation from the novelist's notebooks would most effectively support this claim, given that she publicly claimed to write each novel in a single, uninterrupted draft?","choices":["\"I have rewritten this opening chapter for the ninth time this month, and I still cannot get the tone right.\"","\"The garden outside my window is especially lovely this time of year.\"","\"My publisher has requested the manuscript by the end of the month.\"","\"I received several letters from readers this week.\""],"correct":0,"choiceNotes":[
            "Correct. This directly contradicts the public claim of a single, uninterrupted draft by showing extensive private revision.",
            "This addresses the garden view, unrelated to her writing process.",
            "This addresses a publisher deadline, not evidence about her drafting process itself.",
            "This addresses reader correspondence, unrelated to her writing process."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Quantitative)","difficulty":"hard","type":"mc","text":"Researchers measured reaction times for participants performing a task after 4, 6, and 8 hours of sleep. Table: 4 hours — 412 ms average; 6 hours — 340 ms average; 8 hours — 337 ms average.<br><br>Which choice best describes data from the table that support the claim that additional sleep beyond a certain point yields diminishing returns for reaction time?","choices":["Reaction time at 4 hours (412 ms) was slower than at 6 hours (340 ms).","Reaction time at 8 hours (337 ms) was only slightly faster than at 6 hours (340 ms), a much smaller improvement than the gain from 4 to 6 hours.","Reaction time at 8 hours (337 ms) was faster than at 4 hours (412 ms).","All three sleep durations produced average reaction times under 500 ms."],"correct":1,"choiceNotes":[
            "This shows a large improvement from 4 to 6 hours, which doesn't by itself demonstrate a leveling-off at higher durations.",
            "Correct. The much smaller gap between 6 and 8 hours (just 3 ms), compared to the large gap between 4 and 6 hours (72 ms), directly supports diminishing returns beyond a certain point.",
            "This shows an overall improvement from 4 to 8 hours, which doesn't isolate the diminishing-returns pattern specifically.",
            "This is a true general observation but doesn't isolate the comparative sizes of the improvements."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"hard","type":"mc","text":"Geologist Owen Farrow reexamined seismic data from a decades-old survey originally interpreted as showing a single continuous fault line beneath a coastal city. Using updated modeling techniques, Farrow determined the data actually shows two separate, smaller faults that happen to run in a similar direction. He argues this distinction significantly changes earthquake-risk assessments for specific neighborhoods within the city.<br><br>Which choice best states the central idea of the text?","choices":["Farrow's reanalysis found two separate faults rather than one continuous fault, a distinction he argues meaningfully changes neighborhood-level earthquake-risk assessments.","The original seismic survey contained no usable data.","Earthquake risk is identical across the entire coastal city.","Farrow's modeling techniques are unrelated to earthquake research."],"correct":0,"choiceNotes":[
            "Correct. This synthesizes Farrow's finding and its stated significance for risk assessment.",
            "The original survey's data was reinterpreted, not discarded as unusable — Farrow used the same underlying data with new modeling.",
            "The text argues the opposite — the distinction changes risk assessments at the neighborhood level, implying risk isn't uniform.",
            "The text directly connects his modeling techniques to reinterpreting earthquake-relevant seismic data."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"hard","type":"mc","text":"While researching a topic, a student has taken the following notes:<br>• A national park saw record visitor numbers in 2022.<br>• Trail erosion increased significantly in the park's most popular sections that year.<br>• Park rangers introduced a permit system to limit daily visitors to high-traffic trails in 2023.<br>• Erosion rates in those sections decreased by 31 percent in 2023 compared to 2022.<br><br>The student wants to explain a likely cause-and-effect relationship between visitor management and trail erosion. Which choice most effectively uses relevant information from the notes to accomplish this goal?","choices":["A national park saw record visitor numbers in 2022.","After rangers introduced a permit system limiting daily visitors in 2023, erosion rates in previously high-traffic sections decreased by 31 percent compared to the prior year.","Trail erosion increased significantly in the park's most popular sections in 2022.","Park rangers introduced a permit system to limit daily visitors to high-traffic trails in 2023."],"correct":1,"choiceNotes":[
            "This states a visitor statistic alone, without connecting it to the erosion outcome.",
            "Correct. This choice explicitly links the permit system (cause) to the erosion decrease (effect), which is the relationship the student wants to explain.",
            "This states the erosion increase alone, without connecting it to a cause.",
            "This states the permit system alone, without connecting it to the erosion outcome that followed."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"hard","type":"mc","text":"While researching a topic, a student has taken the following notes:<br>• A regional hospital piloted an AI-assisted diagnostic tool for reading chest X-rays.<br>• Radiologists using the tool flagged potential issues 15 percent faster on average.<br>• The tool occasionally flagged benign findings as concerning, requiring radiologist review.<br>• The hospital plans a larger trial across three additional facilities next year.<br><br>The student wants to contrast a benefit and a limitation of the diagnostic tool. Which choice most effectively uses relevant information from the notes to accomplish this goal?","choices":["A regional hospital piloted an AI-assisted diagnostic tool for reading chest X-rays.","While the tool helped radiologists flag potential issues 15 percent faster, it also occasionally flagged benign findings as concerning, requiring additional review.","The hospital plans a larger trial across three additional facilities next year.","Radiologists using the tool flagged potential issues 15 percent faster on average."],"correct":1,"choiceNotes":[
            "This states the pilot's existence alone, without contrasting a benefit and a limitation.",
            "Correct. This choice explicitly contrasts the speed benefit with the false-flagging limitation, matching the goal exactly.",
            "This describes a future plan, not a contrast between a benefit and a limitation.",
            "This states only the benefit, without contrasting it against a limitation."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"hard","type":"mc","text":"While researching a topic, a student has taken the following notes:<br>• A city converted an abandoned rail line into a pedestrian greenway.<br>• Nearby property values rose an average of 11 percent within two years of completion.<br>• The greenway cost $4.2 million to construct.<br>• Local business revenue along the greenway increased by 18 percent in the same period.<br><br>The student wants to summarize the greenway's overall economic impact. Which choice most effectively uses relevant information from the notes to accomplish this goal?","choices":["A city converted an abandoned rail line into a pedestrian greenway.","The greenway cost $4.2 million to construct.","Within two years, the greenway was associated with an 11 percent rise in nearby property values and an 18 percent increase in local business revenue.","The rail line had been abandoned prior to its conversion."],"correct":2,"choiceNotes":[
            "This describes the project's origin, not a summary of its economic impact.",
            "This describes only the construction cost, not the broader economic impact.",
            "Correct. This choice combines both economic indicators — property values and business revenue — into a summary of overall impact.",
            "This describes the rail line's prior state, not the greenway's economic impact."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"hard","type":"mc","text":"A 2020 field study found that predator-deterrent lighting reduced livestock losses by nearly 60 percent on farms bordering forested land. Ranchers in open grassland regions, with far fewer nearby predator populations, expected similarly dramatic reductions after installing the same lighting systems. ______, grassland ranchers reported almost no measurable change in livestock losses, since predator encounters were already rare enough that the lighting had little additional deterrent effect to provide.<br><br>Which choice completes the text with the most logical transition?","choices":["Predictably","By contrast","Moreover","Namely"],"correct":1,"choiceNotes":[
            "\"Predictably\" would suggest the near-zero result matched the ranchers' expectation, when it actually contradicted it.",
            "Correct. \"By contrast\" signals the gap between the expectation of similarly dramatic reductions and the near-zero results actually observed.",
            "\"Moreover\" would suggest an added point of the same kind as the expectation, not a contrasting outcome.",
            "\"Namely\" would suggest a narrower restatement of the expectation, not a contradiction of it."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"hard","type":"mc","text":"Urban planner Yusuf Karimi's proposal for a car-free downtown corridor was initially rejected by the city council over concerns about local business access. ______, three years later, after a smaller pilot version showed increased foot traffic and steady business revenue, the council unanimously approved the full proposal.<br><br>Which choice completes the text with the most logical transition?","choices":["Similarly","Nevertheless","For example","Consequently"],"correct":1,"choiceNotes":[
            "\"Similarly\" would suggest agreement with the initial rejection, not the eventual reversal described.",
            "Correct. \"Nevertheless\" signals the shift from initial rejection to eventual approval despite the original concerns.",
            "\"For example\" would introduce an illustration of the rejection, not a later reversal of it.",
            "\"Consequently\" would suggest the approval followed directly from the rejection as a cause, which isn't the relationship described — the pilot's results are the actual cause."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"hard","type":"mc","text":"A pharmaceutical trial found that a new medication reduced symptom severity significantly more than a placebo across the full study population. Researchers expected the effect to be consistent across all age groups included in the trial. ______, when the data was broken down by age, the medication showed no significant benefit over placebo for participants over 65, even though it strongly outperformed placebo in every younger age group.<br><br>Which choice completes the text with the most logical transition?","choices":["As expected","Yet","Furthermore","In other words"],"correct":1,"choiceNotes":[
            "\"As expected\" would suggest the age-65-and-over result matched the researchers' expectation, when it actually contradicted it.",
            "Correct. \"Yet\" signals the contrast between the expectation of consistency and the actual lack of benefit found in the older age group.",
            "\"Furthermore\" would suggest an added point of the same kind as the expectation, not a contrasting outcome.",
            "\"In other words\" would suggest a rephrasing of the expectation, not a contradiction of it."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"hard","type":"mc","text":"Playwright ______ received an unusual amount of criticism for a work that, decades later, would be considered her finest.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["Wakako Yamauchi,","Wakako Yamauchi","Wakako, Yamauchi","Wakako Yamauchi;"],"correct":1,"choiceNotes":[
            "A comma here would incorrectly separate the subject (the full name) from its verb with no grammatical justification.",
            "Correct. A named person following a generic noun like \"playwright\" is an essential appositive here and takes no commas, flowing directly into the verb \"received.\"",
            "A comma between first and last name breaks up the name itself, which is never correct.",
            "A semicolon here would incorrectly separate the subject from its verb."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"hard","type":"mc","text":"The archive's cataloguing system had worked reliably for decades______ the sudden influx of digital records in the 2010s made it obsolete within a single year.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":[", however,","; however,","; however","however,"],"correct":1,"choiceNotes":[
            "A comma alone can't join two independent clauses this way — using \"however\" after just a comma creates a comma splice.",
            "Correct. A semicolon properly joins the two independent clauses, and the required comma follows the conjunctive adverb \"however.\"",
            "The semicolon is correctly placed, but the required comma after the conjunctive adverb \"however\" is missing.",
            "Without the semicolon, \"however\" alone can't properly join the two independent clauses — this creates a run-on."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"hard","type":"mc","text":"The expedition required three specialized permits: one for wildlife observation, one for restricted-area access, ______ one for scientific sample collection.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["and",", and","; and","and,"],"correct":1,"choiceNotes":[
            "Without a comma, this doesn't correctly separate the third item in a list that already uses commas between the first two items.",
            "Correct. In a list of three or more items already separated by commas, a comma before \"and\" correctly precedes the final item.",
            "A semicolon is used to separate independent clauses or complex list items already containing commas — not needed for this straightforward list.",
            "A comma after \"and\" incorrectly interrupts the connection between \"and\" and the final list item."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"hard","type":"mc","text":"After the two research labs merged into a single institute, ______ funding structure had to be completely reorganized.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["their","its","they're","it's"],"correct":1,"choiceNotes":[
            "\"Their\" is plural, but the sentence describes \"a single institute\" (singular) as the entity now needing reorganization — a plural pronoun doesn't agree with a singular antecedent.",
            "Correct. \"Its\" is the singular possessive pronoun that correctly agrees with \"a single institute.\"",
            "\"They're\" is a contraction for \"they are,\" not a possessive pronoun, and doesn't fit grammatically before \"funding structure.\"",
            "\"It's\" is a contraction for \"it is,\" not the possessive pronoun \"its\" — a common confusion, but grammatically wrong here."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"hard","type":"mc","text":"By the time the auditors completed their review, the company's leadership ______ every document they had requested, despite earlier claims that many records no longer existed.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["has produced","produces","had produced","will have produced"],"correct":2,"choiceNotes":[
            "\"Has produced\" is present perfect, which doesn't fit a sequence of two past events.",
            "\"Produces\" is present tense and doesn't fit the past-tense context established by \"completed.\"",
            "Correct. The past perfect \"had produced\" shows the documents were produced before the auditors completed their review, an earlier past action relative to another past action.",
            "\"Will have produced\" is future perfect, which doesn't fit a sentence describing past events."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"hard","type":"mc","text":"The architect, ______ earliest designs were rejected as impractical, went on to define the visual style of the entire district.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["who","that","whose","which"],"correct":2,"choiceNotes":[
            "\"Who\" is used for people as a subject or object pronoun, not to show possession.",
            "\"That\" doesn't indicate possession and is also typically used for essential, not comma-set-off, clauses.",
            "Correct. \"Whose\" correctly shows possession (the architect's earliest designs) while introducing the nonessential clause.",
            "\"Which\" doesn't indicate possession the way \"whose\" does; it would need a different construction to convey \"its earliest designs.\""
          ]}
        ]
      }
    }
  },
  {
    "id": "sat-practice-3",
    "title": "SAT Practice Test 3",
    "sections": {
      "math": {
        "module1": [
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"easy","type":"mc","text":"Solve for x: 4x + 9 = 33","choices":["x = 6","x = 10.5","x = 24","x = −6"],"correct":0,"choiceNotes":[
            "Correct. Subtract 9 from both sides to get 4x = 24, then divide by 4 to get x = 6.",
            "This comes from adding 9 to 33 instead of subtracting it, then dividing by 4: (33 + 9)/4 = 10.5.",
            "This is 4x itself (33 − 9 = 24), the value before dividing by 4.",
            "This comes from subtracting 33 from 9 instead of the reverse, then dividing by 4: (9 − 33)/4 = −6."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"easy","type":"mc","text":"A backpack originally priced $60 is marked up 25%. What is the new price?","choices":["$45","$75","$15","$85"],"correct":1,"choiceNotes":[
            "This applies a 25% decrease instead of an increase: 60 × 0.75 = 45.",
            "Correct. The increase is 0.25 × 60 = $15, so the new price is 60 + 15 = $75.",
            "This is only the amount of the increase ($15), not the final price.",
            "This adds 25 (treated as a dollar amount) to $60 instead of 25% of $60."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"medium","type":"mc","text":"Solve by factoring: x² − x − 20 = 0","choices":["x = 5, −4","x = −5, 4","x = 5, 4","x = −5, −4"],"correct":0,"choiceNotes":[
            "Correct. The expression factors as (x − 5)(x + 4) = 0, giving x = 5 and x = −4.",
            "This has the signs of both roots reversed from the correct pair.",
            "This has the sign of the negative root (−4) reversed.",
            "This has the sign of the positive root (5) reversed."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"medium","type":"fr","text":"A rectangular prism has a length of 6, a width of 4, and a height of 5. What is its volume?","answer":120,"explanation":"Volume of a rectangular prism = length × width × height = 6 × 4 × 5 = 120."},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"medium","type":"fr","text":"A theater sells adult tickets for $12 and child tickets for $7. A total of 150 tickets were sold for $1,400. How many child tickets were sold?","answer":80,"explanation":"Let a = adult tickets and c = child tickets. a + c = 150 and 12a + 7c = 1,400. Substituting a = 150 − c gives 12(150 − c) + 7c = 1,400, so 1,800 − 5c = 1,400, meaning 5c = 400 and c = 80."},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"hard","type":"mc","text":"Solve for x: 3^(2x+1) = 81","choices":["x = 1.5","x = 2","x = 2.5","x = 3"],"correct":0,"choiceNotes":[
            "Correct. Since 81 = 3⁴, the exponents must be equal: 2x + 1 = 4, so 2x = 3 and x = 1.5.",
            "This comes from dropping the +1 and solving 2x = 4 directly, instead of first subtracting 1 from both sides.",
            "This comes from a sign error, solving 2x − 1 = 4 instead of 2x + 1 = 4.",
            "This is the value of 2x after correctly solving 2x + 1 = 4 — the final division by 2 to isolate x was skipped."
          ]},
          {"domain":"Algebra","skill":"Linear Functions","difficulty":"easy","type":"mc","text":"What is the slope of the line through the points (−3, 5) and (1, −3)?","choices":["−2","2","−1/2","−8"],"correct":0,"choiceNotes":[
            "Correct. Slope = (−3 − 5)/(1 − (−3)) = −8/4 = −2.",
            "This has the correct magnitude but the wrong sign, likely from a sign error in the numerator or denominator.",
            "This comes from inverting the slope formula — dividing the change in x by the change in y instead of the reverse.",
            "This is the change in y (−8) without dividing by the change in x (4)."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Probability and Conditional Probability","difficulty":"medium","type":"mc","text":"A bag contains 6 yellow marbles, 4 purple marbles, and 5 orange marbles. If one marble is drawn at random, what is the probability that it is NOT purple?","choices":["11/15","4/15","1/3","4/11"],"correct":0,"choiceNotes":[
            "Correct. P(not purple) = (6 + 5)/15 = 11/15.",
            "This is P(purple), the complement of the event actually being asked about.",
            "This is the probability of orange alone (5/15 = 1/3), not accounting for yellow.",
            "This inverts the ratio, computing purple over the remaining marbles (4/11) instead of purple over the total."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles and Trigonometry","difficulty":"hard","type":"mc","text":"In a right triangle, the side adjacent to angle θ has length 7 and the hypotenuse has length 25. What is sin θ?","choices":["24/25","7/25","24/7","7/24"],"correct":0,"choiceNotes":[
            "Correct. The opposite side is √(25² − 7²) = √576 = 24, so sin θ = opposite/hypotenuse = 24/25.",
            "This is cos θ (adjacent/hypotenuse), not sin θ.",
            "This is tan θ (opposite/adjacent), not sin θ.",
            "This is the reciprocal of tan θ (adjacent/opposite), not sin θ."
          ]},
          {"domain":"Algebra","skill":"Linear Inequalities in One or Two Variables","difficulty":"medium","type":"mc","text":"A rideshare service charges a $3 base fee plus $1.75 per mile. If a rider wants the total cost to be at most $22, which inequality gives the possible number of miles, m?","choices":["3 + 1.75m ≤ 22","1.75 + 3m ≤ 22","3 + 1.75m ≥ 22","1.75m + 3m ≤ 22"],"correct":0,"choiceNotes":[
            "Correct. The flat $3 fee plus $1.75 per mile must total at most $22.",
            "This swaps which rate is flat and which applies per mile.",
            "This uses the correct expression but the wrong inequality direction — \"at most\" means ≤, not ≥.",
            "This incorrectly adds two separate per-mile terms instead of a flat fee plus a per-mile term."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"easy","type":"mc","text":"If f(x) = 3x² + 2x − 5, what is f(−1)?","choices":["−4","0","−2","−10"],"correct":0,"choiceNotes":[
            "Correct. f(−1) = 3(1) + 2(−1) − 5 = 3 − 2 − 5 = −4.",
            "This results from evaluating f(1) instead of f(−1), losing the negative sign on x: 3(1) + 2(1) − 5 = 0.",
            "This drops the +2x term entirely: 3(1) − 5 = −2.",
            "This treats (−1)² as −1 instead of 1 (a sign error in squaring): 3(−1) + 2(−1) − 5 = −10."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"hard","type":"mc","text":"Solve the system: 4x + 3y = 2 and 2x − 3y = 16. What is the value of x?","choices":["3","6","−3","18"],"correct":0,"choiceNotes":[
            "Correct. Adding the two equations eliminates y: 6x = 18, so x = 3. (Then y = −10/3.)",
            "This is a likely arithmetic slip, dividing 18 by 3 instead of 6.",
            "This has the correct magnitude but the wrong sign for x.",
            "This is 6x itself, the value before dividing by 6."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"One-Variable Data: Distributions and Measures of Center and Spread","difficulty":"medium","type":"fr","text":"A set of 8 numbers has a mean of 15. Seven of the numbers are 12, 18, 10, 20, 14, 16, and 11. What is the eighth number?","answer":19,"explanation":"The sum of all 8 numbers must be 15 × 8 = 120. The seven known numbers sum to 12+18+10+20+14+16+11 = 101, so the eighth number is 120 − 101 = 19."},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"medium","type":"mc","text":"A cone has a radius of 6 and a height of 8. What is its volume?","choices":["96π","288π","16π","384π"],"correct":0,"choiceNotes":[
            "Correct. V = (1/3)πr²h = (1/3)π(36)(8) = 96π.",
            "This forgets the 1/3 factor in the cone volume formula: π(36)(8) = 288π.",
            "This uses r instead of r²: (1/3)π(6)(8) = 16π.",
            "This uses the diameter (12) in place of r without adjusting the formula: (1/3)π(144)(8) = 384π."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"hard","type":"fr","text":"A radioactive sample decays to half its mass every 5 years. If the sample starts at 800 grams, what is its mass, in grams, after 20 years?","answer":50,"explanation":"20 years contains 20/5 = 4 half-lives. Mass = 800 × (1/2)⁴ = 800/16 = 50."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"easy","type":"mc","text":"A car travels at 72 kilometers per hour. What is this speed in kilometers per minute?","choices":["1.2","12","0.72","4,320"],"correct":0,"choiceNotes":[
            "Correct. 72 kilometers per hour ÷ 60 minutes per hour = 1.2 kilometers per minute.",
            "This comes from a misplaced decimal point, as if dividing by 6 instead of 60.",
            "This comes from dividing by 100 instead of 60.",
            "This comes from multiplying 72 by 60 instead of dividing by it — the inverse of the correct operation."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"medium","type":"mc","text":"Given f(x) = 3x² + 12x − 5, what is the x-coordinate of the vertex?","choices":["−2","2","−4","−12"],"correct":0,"choiceNotes":[
            "Correct. The vertex x-coordinate is −b/(2a) = −12/(2·3) = −12/6 = −2.",
            "This has the correct magnitude but the wrong sign.",
            "This comes from dividing by a instead of 2a, dropping the factor of 2 in the denominator: −12/3 = −4.",
            "This is −b alone (−12), without dividing by 2a at all."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Lines, Angles, and Triangles","difficulty":"hard","type":"fr","text":"Triangle PQR is similar to triangle STU, with PQ corresponding to ST and QR corresponding to TU. If PQ = 10, ST = 15, and QR = 14, what is the length of TU?","answer":21,"explanation":"The scale factor from triangle PQR to triangle STU is ST/PQ = 15/10 = 1.5. So TU = QR × 1.5 = 14 × 1.5 = 21."},
          {"domain":"Algebra","skill":"Linear Functions","difficulty":"medium","type":"mc","text":"If f(x) = 2x − 1 and g(x) = x + 4, what is f(g(2))?","choices":["11","7","9","6"],"correct":0,"choiceNotes":[
            "Correct. g(2) = 2 + 4 = 6, then f(6) = 2(6) − 1 = 11.",
            "This is g(f(2)), the functions applied in the reverse order: f(2) = 3, then g(3) = 3 + 4 = 7.",
            "This adds f(2) and g(2) instead of composing them: f(2) + g(2) = 3 + 6 = 9.",
            "This is g(2) alone — the outer function f was never applied."
          ]},
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"hard","type":"mc","text":"What are all real solutions to |2x − 5| = 13?","choices":["x = 9 and x = −4","x = −9 and x = 4","x = 9 only","x = 4 only"],"correct":0,"choiceNotes":[
            "Correct. 2x − 5 = 13 gives x = 9; 2x − 5 = −13 gives x = −4. Both satisfy the original equation.",
            "This has the sign of each solution reversed from the correct pair.",
            "This only solves the positive case (2x − 5 = 13) and misses the negative case entirely.",
            "This solves only the negative case, and with a sign error in that case."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"easy","type":"mc","text":"A recipe calls for butter and flour in a ratio of 3:8. If a baker uses 24 cups of flour, how many cups of butter are needed?","choices":["9","3","20","8"],"correct":0,"choiceNotes":[
            "Correct. 24 cups of flour is 24/8 = 3 times the base ratio amount, so butter = 3 × 3 = 9 cups.",
            "This is the scale factor (3) itself, not the final amount of butter.",
            "This mixes up which quantity in the ratio scales with the 24 cups.",
            "This comes from dividing 24 by 3 instead of first finding the correct scale factor from the ratio."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles and Trigonometry","difficulty":"medium","type":"mc","text":"A ladder 15 feet long leans against a wall, with its base 9 feet from the wall. How high up the wall does the ladder reach?","choices":["12 ft","144 ft","6 ft","24 ft"],"correct":0,"choiceNotes":[
            "Correct. By the Pythagorean theorem, height = √(15² − 9²) = √(225 − 81) = √144 = 12 ft.",
            "This is 15² − 9² before taking the square root — the final square-root step was skipped.",
            "This comes from subtracting the two lengths directly (15 − 9) instead of using the Pythagorean theorem.",
            "This comes from adding the two lengths directly (15 + 9) instead of using the Pythagorean theorem."
          ]}
        ],
        "module2Easier": [
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"easy","type":"mc","text":"Solve for x: 6x − 5 = 19","choices":["x = 4","x = 24","x = 2.33","x = −4"],"correct":0,"choiceNotes":[
            "Correct. Add 5 to both sides to get 6x = 24, then divide by 6 to get x = 4.",
            "This is 6x itself (24), the value before dividing by 6.",
            "This subtracts 5 again instead of adding it, then divides: (19 − 5)/6 ≈ 2.33.",
            "This has the correct magnitude but the wrong sign, from a sign error while isolating x."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"easy","type":"mc","text":"A phone priced at $200 is discounted 10%. What is the sale price?","choices":["$220","$180","$20","$190"],"correct":1,"choiceNotes":[
            "This adds the discount instead of subtracting it, as if the price increased by 10%.",
            "Correct. The discount is 0.10 × 200 = $20, so the sale price is 200 − 20 = $180.",
            "This is only the discount amount (0.10 × 200 = $20), not the final sale price.",
            "This treats the 10 as if it were a dollar amount subtracted directly, rather than 10% of the price."
          ]},
          {"domain":"Algebra","skill":"Linear Functions","difficulty":"easy","type":"mc","text":"What is the slope of the line through the points (2, −1) and (5, 8)?","choices":["3","1/3","9","−3"],"correct":0,"choiceNotes":[
            "Correct. Slope = (8 − (−1))/(5 − 2) = 9/3 = 3.",
            "This inverts the slope formula, dividing the change in x by the change in y instead of the reverse.",
            "This is the change in y (9) alone, without dividing by the change in x.",
            "This has the correct magnitude but the wrong sign."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"easy","type":"mc","text":"A triangle has a base of 10 cm and a height of 7 cm. What is its area?","choices":["35 cm²","70 cm²","17 cm²","24.5 cm²"],"correct":0,"choiceNotes":[
            "Correct. Area = (1/2)(base)(height) = (1/2)(10)(7) = 35 cm².",
            "This forgets the factor of 1/2 in the triangle area formula: 10 × 7 = 70.",
            "This adds the base and height instead of multiplying them: 10 + 7 = 17.",
            "This is a plausible-looking number near the correct value rather than the result of the actual formula."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"easy","type":"mc","text":"How many seconds are there in 4.5 minutes?","choices":["270","45","4.5","24"],"correct":0,"choiceNotes":[
            "Correct. 4.5 minutes × 60 seconds per minute = 270 seconds.",
            "This comes from an arithmetic slip, dividing by 6 instead of multiplying by 60.",
            "This restates the original value in minutes instead of converting it.",
            "This comes from an arithmetic slip in applying the conversion factor."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Probability and Conditional Probability","difficulty":"easy","type":"mc","text":"A bag contains 5 green marbles and 7 white marbles. If one marble is drawn at random, what is the probability that it is white?","choices":["7/12","5/12","12/7","5/7"],"correct":0,"choiceNotes":[
            "Correct. P(white) = 7/12.",
            "This is P(green) = 5/12, the complement of the event actually being asked about.",
            "This inverts the probability, computing total over white (12/7) instead of white over total.",
            "This compares green to white directly (5/7) instead of white to the total."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"One-Variable Data: Distributions and Measures of Center and Spread","difficulty":"easy","type":"fr","text":"A set of 6 numbers has a mean of 24. What is the sum of the 6 numbers?","answer":144,"explanation":"Mean × count = sum, so 24 × 6 = 144."},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles and Trigonometry","difficulty":"easy","type":"fr","text":"A right triangle has legs of length 9 and 40. What is the length of its hypotenuse?","answer":41,"explanation":"By the Pythagorean theorem, the hypotenuse = √(9² + 40²) = √(81 + 1,600) = √1,681 = 41."},
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"medium","type":"mc","text":"Solve for x: (x/4) + 3 = 9","choices":["x = 24","x = 6","x = 48","x = −24"],"correct":0,"choiceNotes":[
            "Correct. Subtract 3 from both sides: x/4 = 6, then multiply by 4: x = 24.",
            "This is x/4 itself (6) — the final multiplication by 4 was skipped.",
            "This adds 3 again instead of subtracting it, giving x/4 = 12, then x = 48.",
            "This has the correct magnitude but the wrong sign, from a sign error while isolating x."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"medium","type":"mc","text":"Solve by factoring: x² + 3x − 18 = 0","choices":["x = −6, 3","x = 6, −3","x = −6, −3","x = 6, 3"],"correct":0,"choiceNotes":[
            "Correct. The expression factors as (x + 6)(x − 3) = 0, giving x = −6 and x = 3.",
            "This has the signs of both roots reversed from the correct pair.",
            "This has the sign of the second root (3) reversed.",
            "This has the sign of the first root (−6) reversed."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"medium","type":"mc","text":"A price is discounted 30% to a sale price of $84. What was the original price?","choices":["$58.80","$125","$120","$109.20"],"correct":2,"choiceNotes":[
            "This treats $84 as if it still needed a further 30% reduction, computing 84 × 0.7 = 58.80, instead of solving for the original price.",
            "This is a plausible-looking number near the correct value rather than the result of the actual calculation.",
            "Correct. Let p be the original price: 0.70p = 84, so p = 120.",
            "This adds 30% of the discounted price ($25.20) back onto $84, using the wrong base for the percentage."
          ]},
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"medium","type":"fr","text":"An electrician charges a flat fee of $40 plus $45 per hour. What is the total charge for a 2.5-hour job?","answer":152.5,"explanation":"Total = 40 + 45(2.5) = 40 + 112.5 = 152.5."},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"medium","type":"mc","text":"If f(x) = 2x² − 5x + 1, what is f(4)?","choices":["13","33","12","−11"],"correct":0,"choiceNotes":[
            "Correct. f(4) = 2(16) − 5(4) + 1 = 32 − 20 + 1 = 13.",
            "This drops the −5x term entirely: 2(16) + 1 = 33.",
            "This drops the +1 constant entirely: 2(16) − 5(4) = 12.",
            "This computes 2x instead of 2x², forgetting to square x first: 2(4) − 5(4) + 1 = −11."
          ]},
          {"domain":"Algebra","skill":"Linear Functions","difficulty":"medium","type":"mc","text":"A table of values shows a linear pattern: at x = 0, y = 7; at x = 1, y = 11; at x = 2, y = 15. Based on this pattern, what value of y corresponds to x = 5?","choices":["27","23","31","19"],"correct":0,"choiceNotes":[
            "Correct. y increases by 4 for each increase of 1 in x; from (2, 15), three more steps reach (5, 15 + 4 + 4 + 4) = (5, 27).",
            "This stops one step short, giving the value at x = 4 (23) instead of x = 5.",
            "This overshoots by one step, giving the value at x = 6 (31) instead of x = 5.",
            "This stops two steps short, giving the value at x = 3 (19) instead of x = 5."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Lines, Angles, and Triangles","difficulty":"medium","type":"mc","text":"A triangle has angles measuring 55° and 72°. What is the measure of the third angle?","choices":["53°","127°","17°","72°"],"correct":0,"choiceNotes":[
            "Correct. The three angles of a triangle sum to 180°: 180 − 55 − 72 = 53°.",
            "This is the sum of the two given angles (55 + 72 = 127°), not the third angle.",
            "This is the difference between the two given angles (72 − 55 = 17°), not the third angle.",
            "This just repeats one of the two given angles instead of solving for the third."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Lines, Angles, and Triangles","difficulty":"medium","type":"fr","text":"Two similar triangles have a scale factor of 3 between their corresponding sides. If the smaller triangle has an area of 8, what is the area of the larger triangle?","answer":72,"explanation":"Area scales by the square of the linear scale factor: 3² = 9, so the larger triangle's area is 8 × 9 = 72."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"medium","type":"mc","text":"At a school, the ratio of teachers to students is 2:25. If there are 486 people total, how many are teachers?","choices":["36","450","18","54"],"correct":0,"choiceNotes":[
            "Correct. 2 + 25 = 27 parts total; 486/27 = 18 people per part; teachers = 2 × 18 = 36.",
            "This is the number of students (25 × 18 = 450), not teachers.",
            "This is the value of one part (18), not the final number of teachers.",
            "This comes from multiplying the per-part value by 3 instead of the correct ratio value of 2."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"medium","type":"mc","text":"How many real solutions does the equation x² − 6x + 9 = 0 have?","choices":["2","Infinitely many","0","1"],"correct":3,"choiceNotes":[
            "This assumes two distinct solutions, but the discriminant b² − 4ac = 36 − 36 = 0 means the two roots coincide.",
            "This would only apply to an identity true for all x, not a quadratic equation with a discriminant of exactly 0.",
            "This would be the case only if the discriminant were negative; here the discriminant is 0.",
            "Correct. The expression factors as (x − 3)² = 0, giving a single repeated solution, x = 3."
          ]},
          {"domain":"Algebra","skill":"Linear Inequalities in One or Two Variables","difficulty":"easy","type":"mc","text":"Solve for x: 3x − 4 ≥ 11","choices":["x ≥ 5","x ≤ 5","x ≥ 15","x ≥ 7"],"correct":0,"choiceNotes":[
            "Correct. Add 4 to both sides: 3x ≥ 15, then divide by 3: x ≥ 5.",
            "This has the correct boundary value but the inequality sign flipped, which would only happen when dividing by a negative number.",
            "This is 3x ≥ 15 written as if it were the final answer — the division by 3 was skipped.",
            "This subtracts 4 instead of adding it, and also skips the division by 3."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"easy","type":"mc","text":"18 is what percent of 40?","choices":["45%","222%","4.5%","18%"],"correct":0,"choiceNotes":[
            "Correct. 18/40 = 0.45 = 45%.",
            "This inverts the fraction, computing 40/18 ≈ 2.22 = 222% instead of 18/40.",
            "This comes from a misplaced decimal point, as if computing 18/40 = 0.045 instead of 0.45.",
            "This mistakes the number 18 itself for the percentage, ignoring its relationship to 40."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"medium","type":"fr","text":"Two numbers have a sum of 32 and a difference of 14. What is the larger number?","answer":23,"explanation":"Let the numbers be x and y with x + y = 32 and x − y = 14. Adding the equations: 2x = 46, so x = 23 (and y = 9)."},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"hard","type":"mc","text":"Solve the system: x + y = 15 and 3x − y = 9. What is the value of x?","choices":["6","9","3","−6"],"correct":0,"choiceNotes":[
            "Correct. Adding the two equations eliminates y: 4x = 24, so x = 6 (and y = 9).",
            "This is the value of y (9), not x — the two variables were switched.",
            "This is a likely arithmetic slip, dividing 24 by 8 instead of 4.",
            "This has the correct magnitude but the wrong sign for x."
          ]}
        ],
        "module2Harder": [
          {"domain":"Algebra","skill":"Linear Equations in One Variable","difficulty":"easy","type":"mc","text":"Solve for x: 9x − 6 = 48","choices":["x = 6","x = 54","x = 5.33","x = 4.67"],"correct":0,"choiceNotes":[
            "Correct. Add 6 to both sides: 9x = 54, then divide by 9: x = 6.",
            "This is 9x itself (54) — the final division by 9 was skipped.",
            "This divides 48 by 9 directly, without first adding 6: 48/9 ≈ 5.33.",
            "This subtracts 6 instead of adding it, then divides: (48 − 6)/9 ≈ 4.67."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"easy","type":"mc","text":"A town's population grows from 400 to 460. What is the percent increase?","choices":["87%","115%","15%","60%"],"correct":2,"choiceNotes":[
            "This computes 400/460 instead of the increase divided by the original amount.",
            "This computes 460/400 = 1.15 and reports it as 115%, describing the new value as a percent of the old rather than finding the percent increase.",
            "Correct. The increase is 60; 60/400 = 0.15 = 15%.",
            "This is the raw increase in population (60), stated as if it were the percent itself."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"medium","type":"mc","text":"Solve by factoring: 2x² − x − 15 = 0","choices":["x = −5/2, 3","x = 5/2, 3","x = −5/2, −3","x = 5/2, −3"],"correct":0,"choiceNotes":[
            "Correct. The expression factors as (2x + 5)(x − 3) = 0, giving x = −5/2 and x = 3.",
            "This has the sign of −5/2 reversed.",
            "This has the sign of 3 reversed.",
            "This has both signs reversed from the correct roots."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"medium","type":"mc","text":"If f(x) = 3x² + 4x − 7, what is f(−2)?","choices":["−3","36","−27","4"],"correct":0,"choiceNotes":[
            "Correct. f(−2) = 3(4) + 4(−2) − 7 = 12 − 8 − 7 = −3.",
            "This computes (3 · −2)² = 36 and stops, never adding the remaining terms.",
            "This treats (−2)² as −4 (a sign error in squaring), giving 3(−4) + 4(−2) − 7 = −27.",
            "This drops the constant term −7, giving 3(4) + 4(−2) = 4."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Area and Volume","difficulty":"medium","type":"mc","text":"A cylinder has a radius of 4 and a height of 9. What is its volume?","choices":["144π","72π","36π","576π"],"correct":0,"choiceNotes":[
            "Correct. V = πr²h = π(4²)(9) = 144π.",
            "This uses the diameter (8) in place of r without squaring it: π(8)(9) = 72π.",
            "This uses r instead of r², computing π(4)(9) = 36π.",
            "This uses r³ instead of r², computing π(64)(9) = 576π."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles and Trigonometry","difficulty":"medium","type":"mc","text":"In a right triangle, sin θ = 7/25. What is cos θ?","choices":["25/24","7/25","24/25","7/24"],"correct":2,"choiceNotes":[
            "This is the reciprocal of cos θ — secant θ, or hypotenuse/adjacent = 25/24 — not cos θ itself.",
            "This repeats sin θ instead of computing cos θ.",
            "Correct. The adjacent side is √(25² − 7²) = √576 = 24, so cos θ = 24/25.",
            "This is tan θ (opposite/adjacent = 7/24), not cos θ."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios, Rates, Proportions, and Units","difficulty":"medium","type":"fr","text":"A car travels 275 miles in 5 hours at a constant rate. At that same rate, how many miles would it travel in 8 hours?","answer":440,"explanation":"Rate = 275/5 = 55 miles per hour. In 8 hours: 55 × 8 = 440 miles."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Probability and Conditional Probability","difficulty":"medium","type":"mc","text":"A fair coin is flipped three times. What is the probability of getting heads on all three flips?","choices":["1/8","1/2","1/4","3/8"],"correct":0,"choiceNotes":[
            "Correct. P(H) × P(H) × P(H) = 1/2 × 1/2 × 1/2 = 1/8.",
            "This is the probability of a single flip landing heads, not all three.",
            "This is the probability of two heads in a row (1/2 × 1/2 = 1/4), missing the third flip entirely.",
            "This miscounts the number of favorable outcomes among the 8 equally likely three-flip sequences."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"One-Variable Data: Distributions and Measures of Center and Spread","difficulty":"medium","type":"mc","text":"What is the median of the data set 4, 9, 11, 15, 18, 23?","choices":["13","15","12.5","11"],"correct":0,"choiceNotes":[
            "Correct. With 6 values in order, the median is the average of the 3rd and 4th values: (11 + 15)/2 = 13.",
            "This is the 4th value alone, without averaging with the 3rd.",
            "This is a plausible-looking number near the correct value but not the actual average of 11 and 15.",
            "This is the 3rd value alone, without averaging with the 4th."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Two-Variable Data: Models and Scatterplots","difficulty":"medium","type":"fr","text":"A line of best fit relating hours practiced (x) to a predicted performance score (y) is given by y = 3.2x + 18. Using this model, what is the predicted score for 10 hours of practice?","answer":50,"explanation":"y = 3.2(10) + 18 = 32 + 18 = 50."},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"hard","type":"mc","text":"How many real solutions does the equation x² + 8x + 16 = −3 have?","choices":["1","2","0","Infinitely many"],"correct":2,"choiceNotes":[
            "This would be the case only if the discriminant were exactly 0, but here it's negative.",
            "This assumes the discriminant is positive, but 64 − 76 = −12 is negative.",
            "Correct. Rewriting as x² + 8x + 19 = 0, the discriminant is 8² − 4(1)(19) = 64 − 76 = −12, which is negative, so there are no real solutions.",
            "This would only apply to an identity true for all x, not a quadratic equation with a negative discriminant."
          ]},
          {"domain":"Algebra","skill":"Systems of Two Linear Equations in Two Variables","difficulty":"hard","type":"fr","text":"For what value of k does the system 4x + 5y = 9 and 8x + 10y = k have infinitely many solutions?","answer":18,"explanation":"Multiplying the first equation by 2 gives 8x + 10y = 18. For the system to have infinitely many solutions, the second equation must be identical to this, so k = 18."},
          {"domain":"Advanced Math","skill":"Equivalent Expressions","difficulty":"hard","type":"mc","text":"Which expression is equivalent to (3x⁻¹y²)/(x²y⁻³) for x, y ≠ 0?","choices":["3y⁵/x³","3x³y⁵","3y⁵/x","3y²/x³"],"correct":0,"choiceNotes":[
            "Correct. x^(−1−2) = x⁻³ and y^(2−(−3)) = y⁵, giving 3x⁻³y⁵ = 3y⁵/x³.",
            "This drops the negative sign when subtracting the x exponents, treating −1 − 2 as 3 instead of −3, leaving x in the numerator.",
            "This subtracts the x exponents incorrectly, treating −1 − 2 as −1 instead of −3.",
            "This drops the y⁻³ term in the denominator entirely, using the numerator's original y² exponent unchanged instead of subtracting."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"hard","type":"fr","text":"A population of bacteria doubles every 4 hours. If the population starts at 300, what is the population after 16 hours?","answer":4800,"explanation":"16 hours contains 16/4 = 4 doubling periods. Population = 300 × 2⁴ = 300 × 16 = 4,800."},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"hard","type":"mc","text":"A circle has the equation (x + 4)² + (y − 1)² = 64. What is its radius?","choices":["8","64","16","4"],"correct":0,"choiceNotes":[
            "Correct. In the form (x − h)² + (y − k)² = r², r² = 64, so r = 8.",
            "This is r² itself — the final square root was skipped.",
            "This is double the correct radius, as if it were the diameter.",
            "This is half the correct radius, likely from confusing r² with 2r."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Equations in One Variable and Systems of Equations in Two Variables","difficulty":"hard","type":"fr","text":"Solve the system y = x² and y = 3x + 10 for the positive value of x.","answer":5,"explanation":"Setting x² = 3x + 10 gives x² − 3x − 10 = 0, which factors as (x − 5)(x + 2) = 0, so x = 5 or x = −2. The positive solution is x = 5."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Inference from Sample Statistics and Margin of Error","difficulty":"medium","type":"mc","text":"A poll of 800 voters found that 47% support a proposal, with a margin of error of 2.5 percentage points. Which of the following is NOT a plausible value for the true percentage of all voters who support the proposal?","choices":["46%","50%","45%","49%"],"correct":1,"choiceNotes":[
            "This falls within the margin of error range, so it is plausible.",
            "Correct. This falls outside the range 44.5%–49.5% given by the margin of error, so it is not plausible.",
            "This falls within the margin of error (47 − 2.5 = 44.5), so it is plausible.",
            "This falls within the margin of error (47 + 2.5 = 49.5), so it is plausible."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Evaluating Statistical Claims: Observational Studies and Experiments","difficulty":"medium","type":"mc","text":"A study finds that students who play a musical instrument tend to have higher GPAs than students who don't. Which finding, if true, would most weaken a causal conclusion that playing an instrument improves GPA?","choices":["The study measured GPA using each school's own grading scale.","Musical instruments vary widely in cost.","Students who play an instrument also tend to come from households with more resources for private tutoring.","Some students who play an instrument still have below-average GPAs."],"correct":2,"choiceNotes":[
            "The grading scale used doesn't affect whether the music-GPA link is causal or merely correlational.",
            "Variation in instrument cost doesn't address the core issue of a possible confounding variable behind the correlation.",
            "Correct. This introduces a confounding variable (household resources) that could explain the GPA difference independent of playing an instrument itself.",
            "A few individual exceptions don't undermine an overall correlation."
          ]},
          {"domain":"Advanced Math","skill":"Nonlinear Functions","difficulty":"hard","type":"fr","text":"The function g is defined by g(x) = (x + 2)(x − 6). What is the minimum value of g?","answer":-16,"explanation":"Expanding gives g(x) = x² − 4x − 12. The vertex occurs at x = −b/(2a) = 4/2 = 2, so g(2) = 4 − 8 − 12 = −16, which is the minimum since the parabola opens upward."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percentages","difficulty":"medium","type":"fr","text":"An investment of $3,000 grows by 8% each year for 2 years. What is its value after 2 years?","answer":3499.2,"explanation":"3,000 × 1.08² = 3,000 × 1.1664 = 3,499.20."},
          {"domain":"Problem-Solving & Data Analysis","skill":"One-Variable Data: Distributions and Measures of Center and Spread","difficulty":"medium","type":"mc","text":"A data set of 10 values has a mean of 50. One value, an outlier of 120, is removed, leaving 9 values. Which statement must be true about the new mean?","choices":["The new mean is greater than 50.","The new mean is less than 50.","The new mean equals 50.","The new mean cannot be determined without additional information."],"correct":1,"choiceNotes":[
            "Removing a value above the mean cannot increase the mean.",
            "Correct. Since the removed value (120) is above the original mean (50), removing it decreases the mean.",
            "The mean would only stay the same if the removed value equaled the original mean; 120 does not.",
            "The direction of the change is determinate: removing any value above the mean must decrease it, regardless of the other values."
          ]},
          {"domain":"Advanced Math","skill":"Equivalent Expressions","difficulty":"hard","type":"mc","text":"Which expression is equivalent to (4x³y⁻²)⁻¹ · (x⁻¹y⁴) for x, y ≠ 0?","choices":["y⁶/(4x⁴)","4x⁴y⁶","4y⁶/x⁴","y⁴/(4x⁴)"],"correct":0,"choiceNotes":[
            "Correct. (4x³y⁻²)⁻¹ = x⁻³y²/4, and multiplying by x⁻¹y⁴ gives (x⁻³·x⁻¹)(y²·y⁴)/4 = x⁻⁴y⁶/4 = y⁶/(4x⁴).",
            "This forgets to apply the outer exponent −1 to the whole first factor, leaving 4x³ in the numerator instead of taking its reciprocal.",
            "This forgets to distribute the outer exponent −1 to the constant 4, leaving it in the numerator instead of the denominator.",
            "This drops part of the y exponent, treating y²·y⁴ as y⁴ instead of y⁶."
          ]}
        ]
      },
      "readingWriting": {
        "module1": [
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"easy","type":"mc","text":"The senator's argument was ______ enough that even her harshest critics struggled to find a counterpoint.<br><br>Which choice completes the text with the most logical and precise word?","choices":["flimsy","airtight","tedious","vague"],"correct":1,"choiceNotes":[
            "\"Flimsy\" would invite counterpoints, not stop them.",
            "Correct. \"Airtight\" fits an argument strong enough to leave no opening for critics.",
            "\"Tedious\" describes tone, not logical strength, and doesn't explain the lack of counterpoints.",
            "\"Vague\" would make an argument easier, not harder, to counter."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"medium","type":"mc","text":"Rather than confront the board directly, the CEO chose a more ______ approach, raising her concerns gradually over several private conversations.<br><br>Which choice completes the text with the most logical and precise word?","choices":["abrupt","impulsive","measured","confrontational"],"correct":2,"choiceNotes":[
            "\"Abrupt\" contradicts the gradual, multi-conversation approach described.",
            "\"Impulsive\" also contradicts an approach built on careful, gradual conversations.",
            "Correct. \"Measured\" captures the careful, restrained approach implied by raising concerns gradually rather than directly.",
            "\"Confrontational\" is the opposite of the indirect approach described."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"medium","type":"mc","text":"The old man kept his stories close, doling them out to the grandchildren only a sentence or two at a time, as if each one cost him something to give away. Even so, by the time the fire had burned low, he had spent the whole evening on a single tale about a flood that swallowed his childhood village.<br><br>As used in the text, what does the word \"spent\" most nearly mean?","choices":["Purchased","Exhausted financially","Used up","Rested"],"correct":2,"choiceNotes":[
            "\"Purchased\" doesn't fit — no transaction is described.",
            "\"Exhausted financially\" is a specific sense of \"spent\" unrelated to time or storytelling.",
            "Correct. Here \"spent\" means used up (the evening), matching how the whole night was devoted to one tale.",
            "\"Rested\" isn't a standard meaning of \"spent\" and doesn't fit the sentence."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"Astronomer Fatou Diallo spent two years cataloguing faint radio signals from a distant galaxy cluster, initially assuming the irregular pulses were instrument noise. <u>After a routine recalibration eliminated a known source of interference, the exact same pulses reappeared, but only whenever the cluster was within the telescope's field of view.</u> That correlation forced Diallo to reconsider the signals as a real astronomical phenomenon rather than a hardware artifact.<br><br>Which choice best describes the function of the underlined sentence?","choices":["It confirms that the pulses were caused by leftover instrument noise.","It rules out the instrument-noise explanation by tying the pulses specifically to the cluster's presence, setting up a new interpretation.","It summarizes the full two years of Diallo's cataloguing work.","It introduces the topic of the passage for the first time."],"correct":1,"choiceNotes":[
            "The finding argues against, not for, an instrument-noise origin.",
            "Correct. Eliminating interference yet still seeing pulses tied to the cluster's presence rules out the noise explanation and points toward a real phenomenon.",
            "This sentence reports one finding, not a summary of the entire two-year project.",
            "The topic (the radio pulses) was already introduced in the first sentence."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"Economist Bjorn Solheim's 2021 paper examines why small coastal towns in Norway retained higher youth population rates than similar inland towns over a thirty-year span. Rather than crediting government subsidies, which were distributed equally to both regions, Solheim traces the difference to the timing of broadband internet access, which reached coastal towns nearly a decade earlier due to existing undersea cable infrastructure built for the fishing industry. Towns with earlier broadband saw significantly more remote-work retention among young adults.<br><br>Which choice best states the main purpose of the text?","choices":["To argue that government subsidies are ineffective at retaining young residents.","To describe how existing infrastructure built for one purpose gave certain towns an unplanned advantage in retaining young residents through early internet access.","To criticize inland towns for failing to build their own broadband infrastructure.","To provide a complete history of Norway's fishing industry."],"correct":1,"choiceNotes":[
            "The paper doesn't argue subsidies are ineffective broadly, only that they don't explain this particular difference.",
            "Correct. This captures the paper's core claim: repurposed fishing-industry cable infrastructure gave coastal towns an incidental advantage in early broadband, which explains the youth retention gap.",
            "The text doesn't criticize inland towns, only explains a difference in infrastructure timing.",
            "The fishing industry is mentioned only as context for the cables, not as the text's subject."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1: A sociologist studying urban food deserts argues that the primary barrier to healthy eating in low-income neighborhoods is the physical distance to full-service grocery stores.<br><br>Text 2: A separate study tracking grocery purchases in neighborhoods where a new full-service store opened found that healthy food purchases increased only slightly, while overall shopping patterns remained largely unchanged.<br><br>Based on the texts, the author of Text 2 would most likely respond to the claim in Text 1 by","choices":["agreeing completely that distance is the only relevant barrier.","arguing that grocery stores have no effect on shopping patterns whatsoever.","suggesting that factors beyond physical distance also shape food purchasing habits.","claiming that the new store should be closed due to low demand."],"correct":2,"choiceNotes":[
            "Text 2's modest results suggest distance isn't the whole story, so full agreement doesn't fit.",
            "Text 2 reports a slight increase, not zero effect.",
            "Correct. If reducing distance produced only a small change, other factors besides distance likely also shape purchasing habits.",
            "Nothing in Text 2 recommends closing the store."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1: Entomologist Petra Vogel's field observations suggest that a species of desert ant navigates home primarily by counting its own steps.<br><br>Text 2: A laboratory study using treadmills to alter the ants' stride length found that the ants consistently misjudged distance in proportion to the artificial stride change, matching a step-counting model almost exactly.<br><br>Which choice best describes the relationship between the two texts?","choices":["Text 2 uses a controlled experimental method to support the mechanism Text 1 proposed from field observation.","Text 2 contradicts the mechanism proposed in Text 1.","Text 2 studies an entirely different navigation strategy unrelated to Text 1.","Text 2 proves that the ants do not navigate using distance cues at all."],"correct":0,"choiceNotes":[
            "Correct. The treadmill experiment isolates stride length and finds distance errors that match a step-counting model, supporting Vogel's field-based hypothesis through a different, controlled method.",
            "The treadmill results align with, rather than contradict, the step-counting idea.",
            "Both texts investigate the same step-counting navigation mechanism.",
            "The ants' errors were tied directly to distance cues (stride-based), not the absence of them."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"medium","type":"mc","text":"\"The senator's proposed bill was drafted in under a week, a fact her opponents seized on as evidence of carelessness. Yet the bill's core provisions had been quietly negotiated over the better part of a year, long before any formal draft existed.\"<br><br>Which choice best states the main idea of the text?","choices":["The senator's opponents were correct that the bill was carelessly drafted.","What looked like haste in drafting concealed months of careful prior negotiation.","The bill's provisions were never actually finalized.","Fast drafting always indicates careless legislation."],"correct":1,"choiceNotes":[
            "The text undercuts, rather than confirms, the opponents' claim.",
            "Correct. This captures the contrast between the apparent speed of drafting and the actual months of prior negotiation.",
            "The text says the provisions had been negotiated, not left unfinished.",
            "The text doesn't make this broad generalization — it only describes this one bill."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"easy","type":"mc","text":"\"The small publisher had rejected the manuscript twice before finally accepting it on a third submission, revised only slightly from the original.\"<br><br>Which choice best states the main idea of the text?","choices":["The manuscript changed dramatically between submissions.","Persistence, more than major revision, led to the manuscript's eventual acceptance.","The publisher never actually accepted the manuscript.","Publishers typically reject manuscripts on the first submission."],"correct":1,"choiceNotes":[
            "The text says the revision was slight, not dramatic.",
            "Correct. This reflects that repeated submission, not substantial change, was what led to acceptance.",
            "The text states the manuscript was accepted on the third submission.",
            "The text describes one publisher's decisions, not a general pattern."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"medium","type":"mc","text":"A quality audit at Brightwell Ceramics found that of the 400 mugs pulled from a single production run for inspection, none showed the hairline cracks that had prompted customer complaints the previous month. Production records confirm the clay supplier and kiln settings were unchanged between the two months. This suggests that ______.<br><br>Which choice most logically completes the text?","choices":["the customer complaints from the previous month were fabricated.","whatever caused the cracks was likely something other than the clay supplier or kiln settings.","Brightwell Ceramics has stopped producing mugs entirely.","the audit inspected every mug the company has ever produced."],"correct":1,"choiceNotes":[
            "Nothing in the passage suggests the complaints were fabricated.",
            "Correct. If the crack-free run shares the same supplier and kiln settings as the cracked run, the actual cause more likely lies elsewhere.",
            "The passage describes an ongoing production run, not a shutdown.",
            "The audit sampled 400 mugs from one run, not the company's entire output."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"hard","type":"mc","text":"Historian Ines Duarte's study of a shipping company's 1890s payroll ledgers found that every dockworker's wage entry was recorded in a different ink than the surrounding entries, and that this pattern held across ledgers from three separate ports the company operated. Company correspondence from the period never mentions a change in bookkeeping staff. This suggests that ______.<br><br>Which choice most logically completes the text?","choices":["the dockworkers' wages were recorded using a separate, standardized process from other entries.","the company employed different bookkeepers at each of the three ports.","the ledgers from the three ports were later forged by a single individual.","dockworkers were paid significantly less than other employees."],"correct":0,"choiceNotes":[
            "Correct. A consistent, distinct ink pattern across three separate ports, with no mention of staffing changes, points to a standardized separate process for recording wage entries rather than incidental variation.",
            "Different bookkeepers at each port would more plausibly produce inconsistent, not identically patterned, ink differences.",
            "Nothing in the passage suggests forgery.",
            "The passage describes how wages were recorded, not their relative amount."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"medium","type":"mc","text":"Claim: A city's new bike-share program reduced downtown car congestion.<br><br>Which finding, if true, would most directly support this claim?","choices":["The bike-share program was profitable in its first year.","Average downtown traffic speeds increased by 18% in the months after the program launched, with no other road changes made.","Bike-share stations were installed near several downtown office buildings.","Survey respondents said they liked the look of the bike-share stations."],"correct":1,"choiceNotes":[
            "Profitability says nothing about traffic congestion.",
            "Correct. A direct before/after traffic-speed improvement, with no other confounding road changes, most directly supports a congestion-reduction claim.",
            "Station placement alone doesn't establish an effect on congestion.",
            "Aesthetic opinions don't measure traffic impact."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"hard","type":"mc","text":"A curator argues that a newly attributed painting was likely produced by an apprentice in a master painter's workshop rather than by the master himself.<br><br>Which quotation from a conservation report would most effectively support this claim?","choices":["\"The canvas dates to within the master's active working years.\"","\"Pigment analysis shows a mix of the workshop's standard materials.\"","\"Underdrawing beneath the paint layer shows tentative, corrected lines inconsistent with the confident brushwork found in the master's confirmed works.\"","\"The painting was found in a private collection with no documented provenance.\""],"correct":2,"choiceNotes":[
            "A matching timeframe is consistent with either the master or an apprentice working in his studio.",
            "Standard workshop materials would be used by the master and apprentices alike, so this doesn't distinguish between them.",
            "Correct. Tentative, corrected underdrawing inconsistent with the master's confident technique directly supports the claim of an apprentice's hand.",
            "Missing provenance doesn't indicate who painted the work."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Quantitative)","difficulty":"easy","type":"mc","text":"A survey of 250 residents found that 165 said they would support a proposed streetcar line.<br><br>Which choice most accurately interprets the data?","choices":["Exactly 165 residents in the city support the streetcar line.","The survey proves the streetcar line will be built.","Fewer than half of the residents surveyed support the streetcar line.","Just under two-thirds of the residents surveyed said they support the streetcar line."],"correct":3,"choiceNotes":[
            "The 165 figure describes the surveyed sample, not the entire city.",
            "Support in a survey doesn't prove the project will be built.",
            "165 out of 250 is well over half, not fewer.",
            "Correct. 165/250 = 0.66, just under two-thirds."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"The county's plan to install a wind turbine farm on nearby ridgelines drew immediate opposition from area residents concerned about noise. ______, within a year of the turbines going online, several of the same residents reported that the promised drop in their electricity bills had exceeded expectations.<br><br>Which choice completes the text with the most logical transition?","choices":["Similarly","In fact","Yet","Consequently"],"correct":2,"choiceNotes":[
            "\"Similarly\" would compare two matching outcomes, not a reversal in the residents' experience.",
            "\"In fact\" would intensify the initial claim, not introduce the later reversal.",
            "Correct. \"Yet\" signals the contrast between initial opposition and the later positive outcome.",
            "\"Consequently\" would suggest the drop in bills followed logically from the opposition itself, not a shift in the residents' experience."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"hard","type":"mc","text":"Tardigrades can survive being frozen to nearly absolute zero, a feat almost no other animal can match. ______, some species can also withstand direct exposure to the vacuum of outer space, surviving several days with no spacesuit or pressurized capsule at all.<br><br>Which choice completes the text with the most logical transition?","choices":["Nevertheless","Moreover","Conversely","Instead"],"correct":1,"choiceNotes":[
            "\"Nevertheless\" signals a contrast, but the second sentence extends the same idea of extreme resilience rather than opposing it.",
            "Correct. \"Moreover\" signals that the second sentence builds on and extends the resilience described in the first.",
            "\"Conversely\" implies an opposing idea, which doesn't fit here.",
            "\"Instead\" would suggest replacing the first idea rather than building on it."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"The orchestra's new music director initially planned an entire season built around unfamiliar contemporary works. ______, after subscriber ticket sales dropped sharply during the first month, the season's second half was quietly revised to include several audience favorites.<br><br>Which choice completes the text with the most logical transition?","choices":["Granted","However","For example","Additionally"],"correct":1,"choiceNotes":[
            "\"Granted\" would concede a point before pivoting back to the original plan, not describe an actual change made to it.",
            "Correct. \"However\" signals the contrast between the original all-contemporary plan and the later revision.",
            "\"For example\" would introduce an illustration, not a change in plan.",
            "\"Additionally\" would add a similar point, not describe a change made in response to falling sales."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"A student has taken these notes: Comet Halley was last visible from Earth in 1986; it will not return until 2061; ancient Chinese astronomers recorded a comet matching its orbit as early as 240 BCE; modern orbital calculations confirmed the match in the 20th century.<br><br>The student wants to contrast the comet's ancient observation history with the precision of modern confirmation. Which choice most effectively uses the notes to accomplish this goal?","choices":["Comet Halley will not return until 2061.","Comet Halley was last visible from Earth in 1986.","Ancient Chinese astronomers recorded a comet matching Halley's orbit as early as 240 BCE, a sighting modern orbital calculations only confirmed centuries later.","Ancient Chinese astronomers made many astronomical records."],"correct":2,"choiceNotes":[
            "This gives a fact from the notes but doesn't create the requested contrast.",
            "This states a fact without contrasting ancient observation with modern confirmation.",
            "Correct. This choice juxtaposes the ancient 240 BCE sighting with the much later modern confirmation, creating the requested contrast.",
            "This is a vague generalization not drawn from the specific notes."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"hard","type":"mc","text":"A student has taken these notes: mycorrhizal fungi form thread-like networks connecting the roots of separate trees; trees can exchange sugars and warning signals through these networks; the phenomenon is sometimes called an underground \"nutrient web\"; the term was popularized after research by ecologist Naomi Castellan.<br><br>The student is writing for an audience with no background in ecology and wants to introduce the topic. Which choice most effectively uses the notes to accomplish this goal?","choices":["Naomi Castellan's research popularized a memorable term for an underground plant network.","Underground fungal networks link the roots of separate trees, allowing them to exchange sugars and warning signals — a phenomenon nicknamed the \"nutrient web.\"","Mycorrhizal fungi form thread-like networks.","The \"nutrient web\" is a term used in ecology."],"correct":1,"choiceNotes":[
            "This centers on the researcher's name before explaining the underlying phenomenon, offering little context for an unfamiliar audience.",
            "Correct. This explains the phenomenon in accessible terms before introducing its nickname, appropriate for an audience new to the topic.",
            "This states a fact without explaining what the networks do or why they matter.",
            "This mentions the term without any explanation of what it refers to."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"A student has taken these notes: potter Yusuf Aziz has worked in the same studio for 40 years; he said in an interview, \"Every crack in a glaze teaches you something the last firing didn't\"; he now teaches ceramics workshops to beginners.<br><br>The student wants to use a quotation to convey Aziz's philosophy toward mistakes in his craft. Which choice most effectively uses the notes to accomplish this goal?","choices":["Yusuf Aziz has worked in the same studio for 40 years.","Aziz now teaches ceramics workshops to beginners.","As Aziz put it, \"Every crack in a glaze teaches you something the last firing didn't,\" reflecting his view that mistakes are part of learning the craft.","Aziz has taught many students over the years."],"correct":2,"choiceNotes":[
            "This states a fact but includes no quotation or philosophy.",
            "This states a fact but doesn't use the quotation to convey his philosophy.",
            "Correct. This uses Aziz's own words to directly convey his philosophy that mistakes are instructive.",
            "This is a vague generalization not drawn from the quotation itself."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"medium","type":"mc","text":"The novel's translator, ______ decision to preserve the original's untranslated dialect words drew both praise and criticism, later explained her reasoning in an afterword.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["who's","whose","who","which"],"correct":1,"choiceNotes":[
            "\"Who's\" is a contraction of \"who is,\" not a possessive pronoun.",
            "Correct. \"Whose\" correctly shows possession (the translator's decision) while introducing the nonessential clause.",
            "\"Who\" is used as a subject or object pronoun, not to show possession.",
            "\"Which\" doesn't indicate possession the way \"whose\" does."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"easy","type":"mc","text":"The museum's ______ Elena Bayramov unveiled the new sculpture wing to widespread acclaim.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["director, Elena Bayramov,","director Elena Bayramov","director, Elena Bayramov","director Elena Bayramov,"],"correct":1,"choiceNotes":[
            "This sets off \"Elena Bayramov\" as nonessential with commas on both sides, but a named person following a role like \"director\" is treated as essential information and shouldn't be set off by commas.",
            "Correct. The name directly identifies which director is meant, so no commas are needed around it.",
            "This adds a comma before the name but not after, creating inconsistent, incorrect punctuation.",
            "This adds a comma after the name but not before, creating inconsistent, incorrect punctuation."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"easy","type":"mc","text":"The proposal, along with several supporting studies and a detailed budget breakdown, ______ scheduled for review next week.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["are","were","is","have been"],"correct":2,"choiceNotes":[
            "\"Are\" is plural and doesn't agree with the singular subject \"proposal.\"",
            "\"Were\" is both plural and past tense, neither of which fits the singular subject or the sentence's tense.",
            "Correct. The subject is the singular \"proposal\" — the phrase \"along with several supporting studies and a detailed budget breakdown\" doesn't change the verb's number.",
            "\"Have been\" is plural and doesn't agree with the singular subject \"proposal.\""
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"easy","type":"mc","text":"The two companies announced that ______ merger would be finalized by the end of the fiscal year.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["they're","its","their","there"],"correct":2,"choiceNotes":[
            "\"They're\" is a contraction of \"they are,\" not a possessive form.",
            "\"Its\" is a singular possessive pronoun, but the sentence refers to two companies, which is plural.",
            "Correct. \"Their\" is the plural possessive pronoun that agrees with \"the two companies.\"",
            "\"There\" indicates location, not possession."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"By the time the technicians finished installing the new servers, the old system ______ down twice already that week.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["goes","had gone","has gone","will go"],"correct":1,"choiceNotes":[
            "\"Goes\" is present tense and doesn't fit the past-tense context.",
            "Correct. The past perfect \"had gone\" shows the system's failures happened before the technicians finished installing, an earlier past action relative to another past action.",
            "\"Has gone\" is present perfect, which doesn't fit a sequence of two past events.",
            "\"Will go\" is future tense, which doesn't fit a sentence describing past events."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"The workshop taught participants how to sketch a floor plan, calculate load-bearing requirements, and ______.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["how permits are obtained","obtaining the necessary permits","the necessary permits should be obtained","obtain the necessary permits"],"correct":3,"choiceNotes":[
            "This shifts to a \"how\" clause, breaking the parallel infinitive structure established by \"sketch\" and \"calculate.\"",
            "This breaks the parallel infinitive structure by switching to the -ing form.",
            "This shifts to a full passive clause, breaking the parallel list structure.",
            "Correct. \"Obtain\" matches the infinitive form (without \"to\") of \"sketch\" and \"calculate,\" maintaining parallel structure."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"hard","type":"mc","text":"The bridge's original support cables, together with the anchoring bolts installed at the same time, ______ finally inspected after decades of deferred maintenance.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["was","is","were","has been"],"correct":2,"choiceNotes":[
            "\"Was\" is singular and doesn't agree with the plural subject \"cables.\"",
            "\"Is\" is singular and present tense, matching neither the plural subject nor the past-tense context.",
            "Correct. The subject is the plural \"cables\" — the phrase \"together with the anchoring bolts installed at the same time\" doesn't change the verb's number.",
            "\"Has been\" is singular and doesn't agree with the plural subject \"cables.\""
          ]}
        ],
        "module2Easier": [
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"easy","type":"mc","text":"The chef's plating was so ______ that diners often photographed their meals before taking a single bite.<br><br>Which choice completes the text with the most logical and precise word?","choices":["haphazard","meticulous","forgettable","standard"],"correct":1,"choiceNotes":[
            "\"Haphazard\" wouldn't inspire diners to photograph the plating.",
            "Correct. \"Meticulous\" explains why the plating was striking enough to photograph.",
            "\"Forgettable\" contradicts diners wanting to capture it in a photo.",
            "\"Standard\" doesn't explain why it stood out enough to photograph."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"easy","type":"mc","text":"The new hire's questions during the meeting were so ______ that the manager wondered if she had already read the entire project file.<br><br>Which choice completes the text with the most logical and precise word?","choices":["basic","irrelevant","incisive","random"],"correct":2,"choiceNotes":[
            "\"Basic\" questions wouldn't suggest prior deep knowledge of the file.",
            "\"Irrelevant\" would suggest a lack of understanding, not familiarity.",
            "Correct. \"Incisive\" explains why the manager suspected she'd already studied the project closely.",
            "\"Random\" doesn't capture the sense of sharp, informed questioning."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"medium","type":"mc","text":"The mural's colors had faded so ______ over the decades that restorers had to consult old photographs just to identify the original palette.<br><br>Which choice completes the text with the most logical and precise word?","choices":["slightly","predictably","severely","occasionally"],"correct":2,"choiceNotes":[
            "\"Slightly\" contradicts fading serious enough to require outside references to identify colors.",
            "\"Predictably\" doesn't capture the degree of fading.",
            "Correct. \"Severely\" fits fading serious enough that the original palette became unrecognizable.",
            "\"Occasionally\" describes frequency, not degree of fading."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"Naturalist Callum Ashford's field guide to alpine wildflowers opens by explaining the harsh conditions of the growing season at high elevation. It then walks through each major flower family found in that environment, organized by blooming month rather than alphabetically. The guide closes with a short chapter on how climbing routes have shifted flowering times in recent decades.<br><br>Which choice best describes the overall structure of the text?","choices":["It disproves a widely held theory, then proposes an alternative, then tests it experimentally.","It establishes the environmental context, then catalogues species by a practical organizing principle, then closes with a note on recent change.","It lists every alpine flower species in alphabetical order without further commentary.","It argues that alpine wildflowers are declining, then proposes conservation policy."],"correct":1,"choiceNotes":[
            "The text doesn't disprove a theory or run an experiment.",
            "Correct. The guide moves from environmental context, to a practical (bloom-month) catalogue, to a closing note on recent change — matching this structure.",
            "The guide is organized by blooming month, explicitly not alphabetically.",
            "The text doesn't argue decline or propose policy; it's a field guide."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"Urban historian Grace Okafor's account of a mid-century housing project begins by praising its ambitious modernist design, which won several architecture awards upon completion. <u>Okafor then spends most of the chapter documenting the maintenance funding cuts that left the buildings crumbling within twenty years.</u> She closes by asking what the project's fate says about how cities value design versus upkeep.<br><br>Which choice best describes the function of the underlined sentence?","choices":["It reinforces the praise for the project's design given in the first sentence.","It shifts the account from praising the project's design to examining the neglect that followed.","It proves that the architecture awards were undeserved.","It concludes the chapter with a final judgment."],"correct":1,"choiceNotes":[
            "The sentence documents decline, which doesn't reinforce the earlier praise.",
            "Correct. The sentence pivots from celebrating the design to detailing the funding cuts and decay that followed.",
            "The sentence doesn't address whether the awards were deserved.",
            "The chapter's actual conclusion comes in the final sentence, not here."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1: A climatologist argues that a series of unusually mild winters in a mountain region was driven primarily by a shift in regional wind patterns.<br><br>Text 2: A separate analysis of ocean temperature data from the same period found that ocean temperatures in a nearby current were also significantly above average throughout the mild winters.<br><br>Based on the texts, the author of Text 2 would most likely respond to the claim in Text 1 by","choices":["agreeing completely that wind patterns were the sole cause.","suggesting that ocean temperature may also have contributed to the mild winters.","arguing that the winters were not actually unusually mild.","claiming that wind patterns have no effect on regional climate."],"correct":1,"choiceNotes":[
            "Text 2's finding suggests an additional factor, so full agreement with a single-cause claim doesn't fit.",
            "Correct. If ocean temperatures were also unusually high during the same period, that points to an additional contributing factor beyond wind patterns alone.",
            "Both texts accept that the winters were unusually mild.",
            "Text 2 doesn't dispute that wind patterns matter, only that they may not be the sole cause."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1 argues that a species of songbird learns its migratory route primarily by following older, experienced birds during its first journey.<br><br>Text 2 documents young birds fitted with tracking devices successfully completing the migration alone, after researchers removed all older birds from their group before departure.<br><br>Which choice best describes the relationship between the two texts?","choices":["Text 2 confirms that young birds cannot migrate without guidance.","Text 2 raises doubt about the primary explanation offered in Text 1.","Text 2 describes an unrelated species.","Text 2 proves the birds do not migrate at all."],"correct":1,"choiceNotes":[
            "The birds in Text 2 completed migration without older guidance, the opposite of this claim.",
            "Correct. Successful migration without older birds present challenges the idea that following experienced birds is the primary learning mechanism.",
            "Both texts study the same species.",
            "The birds in Text 2 did migrate, just without older companions."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"easy","type":"mc","text":"\"The startup's first product failed within months of launch, but the engineering team's internal notes from that failure became the blueprint for the company's second, wildly successful product.\"<br><br>Which choice best states the main idea of the text?","choices":["The company's first product was ultimately successful.","A failure directly informed the company's later success.","The engineering team disbanded after the first failure.","Startups rarely succeed on a second attempt."],"correct":1,"choiceNotes":[
            "The text states the first product failed, not succeeded.",
            "Correct. This reflects how the notes from the failure directly shaped the successful second product.",
            "Nothing in the text mentions the team disbanding.",
            "The text describes this one company's experience, not a general rule about startups."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"medium","type":"mc","text":"\"The city's tallest building was designed without a single right angle, a choice the architect later admitted was less about aesthetics than about complying with a wind-load regulation that curved buildings satisfied more easily.\"<br><br>Which choice best states the main idea of the text?","choices":["A design choice that appeared purely aesthetic was actually driven by a practical regulatory requirement.","The building violated wind-load regulations.","The architect regretted the building's unusual design.","Right angles are required by most building codes."],"correct":0,"choiceNotes":[
            "Correct. This captures the contrast between the design's apparent aesthetic motive and its actual regulatory cause.",
            "The text says the design satisfied the regulation, not violated it.",
            "The text doesn't describe regret, only a later explanation of the reasoning.",
            "The text doesn't make this broad claim about most codes."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"medium","type":"mc","text":"A facilities review at Kestrel Robotics found that the company's server room, designed with cooling capacity for twice its current equipment load, still recorded temperature spikes above safe operating limits twice last month. Maintenance logs show the cooling units passed inspection both times. This suggests that ______.<br><br>Which choice most logically completes the text?","choices":["the server room's cooling units were undersized from the start.","something other than the cooling units' basic function likely caused the temperature spikes.","the company has stopped using the server room entirely.","the maintenance logs were falsified."],"correct":1,"choiceNotes":[
            "The room was designed with double the needed capacity, arguing against simple undersizing.",
            "Correct. Passing inspection twice while still spiking suggests the cause lies elsewhere — such as airflow blockage or a placement issue — rather than the units' basic function.",
            "The room is described as still in active, monitored use.",
            "Nothing in the passage suggests the logs were falsified."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"hard","type":"mc","text":"An analysis of a 1930s architectural firm's blueprints found that every building the firm designed for a particular client included a small, unlabeled room adjacent to the kitchen, a feature absent from the firm's work for any other client. The client's descendants have no record of the room's intended use. This suggests that ______.<br><br>Which choice most logically completes the text?","choices":["the room served some specific, client-requested purpose that went undocumented.","the firm made a drafting error that was repeated by accident.","the client never actually lived in any of the buildings.","the firm designed the room for structural support only."],"correct":0,"choiceNotes":[
            "Correct. A consistently repeated, client-specific feature across multiple separate buildings points to a deliberate, requested purpose, even though its exact use wasn't recorded.",
            "A single drafting error wouldn't plausibly repeat identically across every building for one client and no others.",
            "Nothing in the passage suggests the client didn't live in the buildings.",
            "A purely structural feature wouldn't need to be unlabeled and specific to one client only."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"medium","type":"mc","text":"Claim: A company's new employee onboarding program reduced first-year turnover.<br><br>Which finding, if true, would most directly support this claim?","choices":["Employees said the onboarding materials were well-designed.","The onboarding program cost less than the previous version.","First-year turnover fell from 24% to 11% among employees hired after the program launched, with no other HR policy changes made.","The company expanded its hiring in the following year."],"correct":2,"choiceNotes":[
            "A positive opinion about materials doesn't establish an effect on turnover.",
            "Cost has no bearing on whether turnover actually decreased.",
            "Correct. A direct before/after turnover-rate comparison, with no other confounding policy changes, most directly supports the claim.",
            "Expanded hiring doesn't measure whether turnover decreased."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"hard","type":"mc","text":"A marine ecologist claims that a coral reef's recovery after a bleaching event was driven mainly by a nearby marine protected area rather than by natural regrowth alone.<br><br>Which finding would most directly support this claim?","choices":["Coral coverage increased slightly at reefs outside any protected area during the same period.","Water temperatures returned to normal shortly after the bleaching event.","Coral coverage inside the protected area increased three times faster than at comparable unprotected reefs nearby.","The protected area was established several years before the bleaching event occurred."],"correct":2,"choiceNotes":[
            "A slight increase elsewhere doesn't isolate the protected area's specific effect.",
            "Temperature recovery would help all reefs equally, not specifically support the protected-area explanation.",
            "Correct. A direct comparison showing faster recovery inside the protected area than at similar unprotected reefs most directly supports the claim.",
            "The timing of establishment alone doesn't demonstrate a causal effect on recovery speed."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Quantitative)","difficulty":"easy","type":"mc","text":"A survey of 350 commuters found that 231 said they would switch to public transit if fares were reduced by half.<br><br>Which choice most accurately interprets the data?","choices":["Exactly 231 commuters in the city would switch to public transit.","The survey proves fares will be reduced.","Fewer than half of the commuters surveyed said they would switch.","Sixty-six percent of the commuters surveyed said they would switch to public transit."],"correct":3,"choiceNotes":[
            "The 231 figure describes the surveyed sample, not the entire city's commuters.",
            "A survey about commuter preference doesn't prove any fare policy will change.",
            "231/350 is well over half, not fewer.",
            "Correct. 231/350 = 0.66 = 66%."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"The city library's late fees had remained unchanged for over twenty years. ______, the library board voted to eliminate late fees entirely, citing research showing fees discouraged low-income patrons from returning at all.<br><br>Which choice completes the text with the most logical transition?","choices":["For instance","Eventually","Similarly","Regardless"],"correct":1,"choiceNotes":[
            "\"For instance\" would introduce an illustration, not a resulting policy change.",
            "Correct. \"Eventually\" signals a change that occurred over time, following two decades of unchanged fees.",
            "\"Similarly\" would compare two matching situations, not describe a change from one policy to another.",
            "\"Regardless\" would suggest the vote happened independent of any reasoning, but a specific cause (the research) is given."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"hard","type":"mc","text":"Coral polyps are simple animals, each only a few millimeters across, with no centralized brain or nervous system to coordinate behavior. ______, entire reef colonies can synchronize their spawning within the same hour, once a year, guided by cues like moonlight and water temperature that every polyp senses independently.<br><br>Which choice completes the text with the most logical transition?","choices":["Likewise","Yet","Therefore","For example"],"correct":1,"choiceNotes":[
            "\"Likewise\" would compare two matching traits, not highlight a surprising contrast.",
            "Correct. \"Yet\" signals the surprising contrast between having no central coordination and still achieving synchronized colony-wide spawning.",
            "\"Therefore\" would suggest the synchronization follows logically from lacking a nervous system, which isn't the relationship described.",
            "\"For example\" would introduce an illustration of the first idea, not a contrasting capability."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"The vineyard's original owners insisted on hand-harvesting every grape. ______, after a series of labor shortages during peak season, the current owners introduced mechanical harvesters for all but the estate's oldest vines.<br><br>Which choice completes the text with the most logical transition?","choices":["Likewise","However","Specifically","Additionally"],"correct":1,"choiceNotes":[
            "\"Likewise\" would compare two matching practices, not describe a change.",
            "Correct. \"However\" signals the contrast between the original hand-harvesting insistence and the later shift to machines.",
            "\"Specifically\" would narrow a prior general point, not introduce a change in practice.",
            "\"Additionally\" would add a similar point, not describe a change made in response to labor shortages."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"A student has taken these notes: Yellowstone National Park spans nearly 3,500 square miles; it sits atop an active supervolcano; it draws over 4 million visitors annually; it was established in 1872 as the world's first national park.<br><br>The student wants to identify a single fact that conveys the park's massive scale. Which choice most effectively uses the notes to accomplish this goal?","choices":["Yellowstone National Park was established in 1872 as the world's first national park.","Yellowstone National Park spans nearly 3,500 square miles, an area larger than several U.S. states combined.","Yellowstone National Park sits atop an active supervolcano.","Millions of tourists benefit from national parks around the world."],"correct":1,"choiceNotes":[
            "This states a historical first, not a scale detail.",
            "Correct. This choice identifies a specific, striking fact — the park's massive area — that directly conveys scale.",
            "This states a geological feature, not a measure of physical scale.",
            "This is a generalization not drawn from the specific notes."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"A student has taken these notes: the peregrine falcon can reach diving speeds over 240 miles per hour; the black marlin can reach swimming speeds over 80 miles per hour; both are considered the fastest animals in their respective environments.<br><br>The student wants to emphasize a similarity between the two animals. Which choice most effectively uses the notes to accomplish this goal?","choices":["The peregrine falcon can dive at over 240 miles per hour.","The black marlin can swim at over 80 miles per hour.","Though their top speeds differ enormously, both the peregrine falcon and the black marlin are considered the fastest animals in their respective environments.","Falcons and marlins live in very different environments."],"correct":2,"choiceNotes":[
            "This states one animal's speed without drawing any comparison.",
            "This states one animal's speed without drawing any comparison.",
            "Correct. This choice highlights the shared distinction of being the fastest in their environments, directly addressing the requested similarity.",
            "This emphasizes a difference (environment), not a similarity."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"hard","type":"mc","text":"A student has taken these notes: a 2020 study followed 200 remote workers over one year; workers who took a 15-minute walk at midday reported 22% higher afternoon productivity than those who didn't; the study's authors noted the effect was strongest among workers with sedentary jobs.<br><br>The student wants to summarize the study's finding, including the noted caveat. Which choice most effectively uses the notes to accomplish this goal?","choices":["Walking is good for overall health.","Two hundred remote workers were followed for one year in 2020.","A 2020 study found that remote workers who took a midday walk reported 22% higher afternoon productivity, an effect the authors noted was strongest among those with sedentary jobs.","Remote work has become increasingly common."],"correct":2,"choiceNotes":[
            "This is a vague generalization not drawn from the specific study.",
            "This states a detail from the notes but omits the actual finding and caveat.",
            "Correct. This reports the specific finding while also including the authors' noted caveat about sedentary workers.",
            "This isn't supported by the notes at all."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"medium","type":"mc","text":"The lighthouse's original lens, ______ was shipped from France in 1887, still rotates using its hand-cranked mechanism.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["it","which","who","this"],"correct":1,"choiceNotes":[
            "\"It\" would create a comma splice, joining two independent clauses with only a comma.",
            "Correct. \"Which\" correctly introduces a nonessential clause (set off by commas) describing the lens.",
            "\"Who\" is used for people, not for an inanimate object like a lens.",
            "\"This\" would create a comma splice, joining two independent clauses with only a comma."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"easy","type":"mc","text":"The festival requires three items for entry______ a valid ticket, a government-issued ID, and a printed confirmation email.<br><br>Which punctuation mark correctly fills the blank?","choices":["a comma","a colon","a semicolon","no punctuation"],"correct":1,"choiceNotes":[
            "A comma isn't strong enough to introduce a list following an independent clause like this one.",
            "Correct. A colon properly introduces a list after a complete independent clause.",
            "A semicolon is used to join two independent clauses or separate complex list items, not to introduce a simple list like this one.",
            "Without any punctuation, the list would run directly into the sentence with no clear introduction."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"medium","type":"mc","text":"The vineyard's harvest was delayed nearly a month by unseasonal rain______ the grapes ended up with an unusually high sugar content.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["rain, consequently, the grapes","rain; consequently, the grapes","rain, consequently the grapes","rain consequently, the grapes"],"correct":1,"choiceNotes":[
            "This creates a comma splice; \"consequently\" is a conjunctive adverb, not a coordinating conjunction, so a comma alone cannot use it to join two independent clauses this way.",
            "Correct. A semicolon properly joins two independent clauses, and the conjunctive adverb \"consequently\" is correctly followed by a comma.",
            "This omits the semicolon needed before the conjunctive adverb, creating a comma splice.",
            "This omits both the semicolon before \"consequently\" and the comma after it."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"easy","type":"mc","text":"The fleet of delivery trucks, along with its two backup vehicles, ______ inspected every morning before dispatch.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["are","is","have been","were"],"correct":1,"choiceNotes":[
            "\"Are\" is plural and doesn't agree with the singular subject \"fleet.\"",
            "Correct. \"Fleet\" is a singular collective noun, so it takes the singular verb \"is\"; the phrase \"along with its two backup vehicles\" doesn't change the verb's number.",
            "\"Have been\" is plural and doesn't agree with the singular subject \"fleet.\"",
            "\"Were\" is both plural and past tense, neither of which fits the singular subject or the sentence's tense."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"easy","type":"mc","text":"The researchers confirmed that ______ initial hypothesis had been disproven by the new data.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["their","there","they're","its"],"correct":0,"choiceNotes":[
            "Correct. \"Their\" is the plural possessive pronoun that agrees with \"the researchers.\"",
            "\"There\" indicates location, not possession.",
            "\"They're\" is a contraction of \"they are,\" not a possessive form.",
            "\"Its\" is a singular possessive pronoun, but \"the researchers\" is plural."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"The museum's new exhibit ______ already closed by the time the reviewer arrived, despite the printed schedule listing it as open until six.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["has","was","had","is"],"correct":2,"choiceNotes":[
            "\"Has\" is present perfect, which doesn't fit a sequence of two past events.",
            "\"Was\" alone doesn't form the past perfect needed to show the closing happened before the reviewer's arrival.",
            "Correct. The past perfect \"had\" (paired with \"closed\") shows the exhibit closed before the reviewer arrived, an earlier past action relative to another past action.",
            "\"Is\" is present tense and doesn't fit the past-tense context at all."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"Having practiced the concerto for nearly a year, ______.<br><br>Which choice most logically and grammatically completes the sentence?","choices":["the audience gave the violinist a standing ovation","the violinist's performance was flawless","it was a flawless performance by the violinist","the violinist delivered a flawless performance"],"correct":3,"choiceNotes":[
            "This creates a dangling modifier — the audience, not the violinist, is placed as the subject who practiced, which doesn't match the intended meaning.",
            "This creates a dangling modifier — \"the violinist's performance\" did not practice for a year, the violinist did.",
            "This creates a dangling modifier — \"it\" did not practice for a year.",
            "Correct. \"The violinist\" immediately follows the introductory modifier, correctly identifying who practiced for nearly a year."
          ]}
        ],
        "module2Harder": [
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"easy","type":"mc","text":"The critic's praise for the debut novel was so ______ that the publisher printed the entire quote on the book's cover.<br><br>Which choice completes the text with the most logical and precise word?","choices":["muted","effusive","conditional","brief"],"correct":1,"choiceNotes":[
            "\"Muted\" praise wouldn't be dramatic enough to print prominently.",
            "Correct. \"Effusive\" explains why the praise was striking enough to feature on the cover.",
            "\"Conditional\" praise would include reservations, which wouldn't make for strong cover copy.",
            "\"Brief\" doesn't capture the enthusiasm needed to explain the publisher's choice."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"easy","type":"mc","text":"The negotiations remained ______ for months, with neither side willing to make the first concession.<br><br>Which choice completes the text with the most logical and precise word?","choices":["resolved","fluid","deadlocked","casual"],"correct":2,"choiceNotes":[
            "\"Resolved\" contradicts months of continued negotiation.",
            "\"Fluid\" would suggest movement or change, not a stalled standoff.",
            "Correct. \"Deadlocked\" captures neither side conceding for months.",
            "\"Casual\" doesn't explain the tension of neither side conceding."
          ]},
          {"domain":"Craft & Structure","skill":"Words in Context","difficulty":"hard","type":"mc","text":"She had always trusted her hands more than her instincts, and so when the potter's wheel began to wobble under the half-formed vase, she did not stop to think — she simply pressed harder into the clay, willing it to hold its shape before the whole thing collapsed into itself.<br><br>As used in the text, what does the word \"hold\" most nearly mean?","choices":["To grasp with the hands","To maintain or keep","To contain a certain amount","To detain in custody"],"correct":1,"choiceNotes":[
            "\"To grasp with the hands\" is a literal sense that doesn't fit — the vase isn't being physically grasped here.",
            "Correct. Here \"hold\" means to maintain or keep (its shape), matching the effort to prevent the vase from collapsing.",
            "\"To contain a certain amount\" refers to capacity, not maintaining form.",
            "\"To detain in custody\" is unrelated to a vase's shape."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"Neuroscientist Ingrid Moen's paper on sleep and memory begins by summarizing decades of research linking REM sleep to memory consolidation. It then presents her own lab's contradictory finding: participants deprived of REM sleep but allowed extended slow-wave sleep still consolidated memories normally. The paper closes by proposing that slow-wave sleep, not REM sleep, may be the more essential stage for this process.<br><br>Which choice best describes the overall structure of the text?","choices":["It summarizes prior consensus, then presents contradicting evidence, then proposes a revised explanation.","It disproves the existence of REM sleep entirely.","It lists unrelated sleep disorders in chronological order.","It argues that memory consolidation does not occur during sleep at all."],"correct":0,"choiceNotes":[
            "Correct. The paper moves from established consensus, to contradicting lab evidence, to a revised proposal — matching this structure.",
            "The paper doesn't dispute that REM sleep exists, only its specific role in memory.",
            "The paper isn't organized as a list of disorders.",
            "The paper affirms memory consolidation occurs during sleep, just via a different stage than previously assumed."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure and Purpose","difficulty":"medium","type":"mc","text":"Marine archaeologist Kwame Owusu's report on a sunken 17th-century cargo ship focuses less on the ship's route or cargo manifest and more on a puzzling detail: the ballast stones lining its hull came from a quarry nearly a thousand miles from any port the ship is known to have visited. Owusu spends the bulk of the report tracing possible explanations, from an undocumented earlier voyage to a secondhand stone trade Owusu argues has been overlooked by historians.<br><br>Which choice best states the main purpose of the text?","choices":["To provide a complete inventory of the ship's cargo.","To investigate an anomaly in the ship's ballast stones and consider possible explanations for it.","To argue that the ship never actually sank.","To criticize previous historians for their research methods."],"correct":1,"choiceNotes":[
            "The report focuses on the ballast anomaly, not a cargo inventory.",
            "Correct. This captures the report's central focus: investigating the ballast stone puzzle and weighing possible explanations.",
            "Nothing in the text disputes that the ship sank.",
            "The report proposes an overlooked possibility, but doesn't broadly criticize historians' methods."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1: A geologist argues that a series of unusual rock formations in a river valley were shaped primarily by a single catastrophic flood roughly 10,000 years ago.<br><br>Text 2: A separate sediment-layer analysis of the same valley found evidence of at least four distinct flood events spread across several thousand years, each leaving a similar sediment signature.<br><br>Based on the texts, the author of Text 2 would most likely respond to the claim in Text 1 by","choices":["agreeing completely that a single flood explains the formations.","arguing that the valley was never affected by flooding at all.","questioning whether one catastrophic event, rather than several over time, actually produced the formations.","claiming that the sediment layers are too damaged to interpret."],"correct":2,"choiceNotes":[
            "Evidence of multiple flood events conflicts with a single-flood explanation, so full agreement doesn't fit.",
            "Both texts agree flooding shaped the valley.",
            "Correct. Evidence of several distinct flood events challenges the idea that one catastrophic flood alone produced the formations.",
            "Text 2 draws clear conclusions from the sediment layers rather than dismissing them as unreadable."
          ]},
          {"domain":"Craft & Structure","skill":"Cross-Text Connections","difficulty":"hard","type":"mc","text":"Text 1 argues that a species of cave-dwelling fish lost its eyesight through the gradual accumulation of random genetic mutations over many generations.<br><br>Text 2 documents populations of the same fish species evolving blindness independently in at least six separate, geographically isolated caves, each on a similar timescale.<br><br>Which choice best describes the relationship between the two texts?","choices":["Text 2 disproves the mutation-based explanation given in Text 1.","Text 2 raises the possibility that blindness resulted from a more consistent evolutionary pressure than purely random mutation.","Text 2 describes a completely different trait unrelated to Text 1.","Text 2 confirms that the fish in different caves are unrelated species."],"correct":1,"choiceNotes":[
            "Text 2 doesn't disprove mutation as a mechanism, but complicates the idea that it happened purely at random.",
            "Correct. Independent, similarly timed blindness across six isolated populations suggests a shared selective pressure rather than pure chance, complicating a purely random account.",
            "Both texts discuss the same trait — loss of eyesight.",
            "The text doesn't address whether the populations are separate species, only that blindness evolved independently in each."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"medium","type":"mc","text":"\"The orchestra's principal cellist turned down three offers from larger, more prestigious ensembles over the course of her career, each time citing an unwillingness to leave the community youth program she had built from a handful of students into a full training orchestra.\"<br><br>Which choice best states the main idea of the text?","choices":["The cellist regretted staying with her original orchestra.","The cellist prioritized a mentorship commitment over career advancement.","The youth program failed shortly after it was founded.","Larger ensembles are always more prestigious than community programs."],"correct":1,"choiceNotes":[
            "The text gives no indication of regret.",
            "Correct. This reflects her repeated choice to remain with the youth program over more prestigious opportunities.",
            "The text says the program grew into a full training orchestra, not that it failed.",
            "The text doesn't make this broad generalization about ensembles."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas and Details","difficulty":"medium","type":"mc","text":"\"The bridge's engineers had insisted the design would outlast the surrounding buildings by at least a century. Records show it was demolished only eleven years after the last of those buildings came down.\"<br><br>Which choice best states the main idea of the text?","choices":["The bridge outlasted the surrounding buildings by exactly a century.","The engineers' prediction about the bridge's longevity proved inaccurate.","The surrounding buildings were demolished before the bridge was completed.","Bridges typically last longer than nearby buildings."],"correct":1,"choiceNotes":[
            "The text states the bridge was demolished only eleven years after, not a century after.",
            "Correct. This reflects the contrast between the engineers' confident prediction and the bridge's actual, much shorter lifespan relative to the buildings.",
            "The text implies the buildings came down before the bridge was demolished, not that the bridge was incomplete when they fell.",
            "The text doesn't make this broad generalization — it only describes this one bridge."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"hard","type":"mc","text":"A records review of a regional airline found that of the 40 flights cancelled for \"mechanical issues\" over one winter, 37 were rescheduled to depart within two hours using the same aircraft that had originally been assigned. Maintenance logs show no repair work was logged for those 37 aircraft during the cancellation window. This suggests that ______.<br><br>Which choice most logically completes the text?","choices":["most of those 37 cancellations were not actually caused by mechanical problems.","the airline's entire fleet was grounded that winter.","all 40 cancelled flights involved genuine mechanical failures.","the maintenance logs for that winter were lost."],"correct":0,"choiceNotes":[
            "Correct. Reusing the same aircraft within two hours, with no logged repairs, points to something other than a genuine mechanical fix in most of those cases.",
            "The passage describes specific cancelled flights, not a fleet-wide grounding.",
            "The evidence points against genuine mechanical causes for the 37 flights that reused the same aircraft unrepaired.",
            "The logs are described as available and reviewed, not lost."
          ]},
          {"domain":"Information & Ideas","skill":"Inferences","difficulty":"hard","type":"mc","text":"Literary scholar Beatriz Salgado's analysis of a 19th-century author's private correspondence found that letters written in the final two years of the author's life used significantly shorter sentences than earlier letters, even when discussing the same recurring topics with the same recipient. Medical records from the period confirm no change in the author's eyesight or handwriting ability. This suggests that ______.<br><br>Which choice most logically completes the text?","choices":["the shift in sentence length likely reflects something other than physical difficulty writing.","the author stopped writing letters entirely in the final two years.","the recipient requested shorter letters during that period.","the author's handwriting became illegible near the end of life."],"correct":0,"choiceNotes":[
            "Correct. With eyesight and handwriting ability unchanged, a shift in sentence length more plausibly reflects a change in the author's thinking or intent, not physical writing difficulty.",
            "The passage describes continued letters in the final two years, just shorter ones.",
            "Nothing in the passage indicates the recipient made such a request.",
            "Medical records confirm handwriting ability was unchanged."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"medium","type":"mc","text":"Claim: A wildlife crossing built over a highway reduced vehicle collisions with deer.<br><br>Which finding, if true, would most directly support this claim?","choices":["The crossing was more expensive to build than initially budgeted.","Deer sightings near the highway increased slightly after construction.","Recorded vehicle-deer collisions on that highway segment fell by 65% in the two years after the crossing opened, compared to the two years before.","Local residents said the crossing was aesthetically pleasing."],"correct":2,"choiceNotes":[
            "Cost has no bearing on whether collisions decreased.",
            "More sightings near the highway doesn't establish an effect on collisions.",
            "Correct. A direct before/after collision-rate comparison most directly supports the claim.",
            "Aesthetic opinions don't measure collision rates."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Textual)","difficulty":"hard","type":"mc","text":"A paleobotanist argues that a fossilized plant species was pollinated by a specific extinct insect rather than by wind, as previously assumed.<br><br>Which finding would most directly support this claim?","choices":["The fossil was found in rock layers dated to the same period as the insect.","The plant's fossilized flowers show a shape that would trap wind-blown pollen effectively.","Fossilized pollen grains matching the plant species were found preserved on the mouthparts of a fossilized specimen of the insect.","The plant species has descendants alive today that rely on wind pollination."],"correct":2,"choiceNotes":[
            "A shared time period alone doesn't establish an interaction between the two species.",
            "A shape suited to trapping wind-blown pollen would support wind pollination, not undercut it.",
            "Correct. Finding the plant's pollen physically preserved on the insect's mouthparts directly demonstrates contact consistent with insect pollination.",
            "Modern descendants' pollination method doesn't establish how the extinct ancestor was pollinated."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence (Quantitative)","difficulty":"medium","type":"mc","text":"A study tracked 240 patients across two treatment groups: 120 received a new medication and 120 received a placebo. Among the medication group, 84 reported symptom improvement, compared to 30 in the placebo group.<br><br>Which choice best describes what the data show?","choices":["Improvement occurred only among patients who received the medication.","A higher proportion of the medication group reported improvement than the placebo group.","Exactly 84 patients in the study improved.","The placebo had no effect on any patient."],"correct":1,"choiceNotes":[
            "30 placebo-group patients also reported improvement, so it wasn't exclusive to the medication group.",
            "Correct. 84/120 = 70% in the medication group versus 30/120 = 25% in the placebo group, a clearly higher proportion.",
            "84 describes only the medication group; the placebo group also had improvements (30), for 114 total.",
            "The placebo group did show some improvement (30 patients), just less than the medication group."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"The city's transit authority initially rejected the proposal to add bike lanes downtown, citing concerns about reduced parking. ______, after a six-month pilot on two streets showed no measurable drop in nearby business revenue, the authority approved lanes citywide.<br><br>Which choice completes the text with the most logical transition?","choices":["Similarly","However","For example","Meanwhile"],"correct":1,"choiceNotes":[
            "\"Similarly\" would compare two matching decisions, not describe a reversal.",
            "Correct. \"However\" signals the contrast between the initial rejection and the later citywide approval.",
            "\"For example\" would introduce an illustration, not a change in decision.",
            "\"Meanwhile\" implies simultaneous, unrelated events, not a resulting decision based on the pilot's findings."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"hard","type":"mc","text":"Tardigrades can survive being frozen to near absolute zero, boiled past the temperature of the water in most kettles, and even exposed directly to the vacuum of space. ______, researchers have found their tolerance has limits: a slow, gradual temperature change of only a few degrees can still kill them if it disrupts the chemical process they use to enter dormancy.<br><br>Which choice completes the text with the most logical transition?","choices":["Likewise","Yet","Therefore","In addition"],"correct":1,"choiceNotes":[
            "\"Likewise\" would compare two matching capabilities, not highlight a surprising limitation.",
            "Correct. \"Yet\" signals the contrast between tardigrades' extreme resilience and their surprising vulnerability to a specific, gradual change.",
            "\"Therefore\" would suggest the vulnerability follows logically from the extreme resilience, which isn't the relationship described.",
            "\"In addition\" would simply add another example of resilience, not introduce a contrasting limitation."
          ]},
          {"domain":"Expression of Ideas","skill":"Transitions","difficulty":"medium","type":"mc","text":"The startup's founders originally planned to fund the company entirely through venture capital. ______, after two rounds of investor rejections, they turned to a crowdfunding campaign that ultimately raised more than either round had sought.<br><br>Which choice completes the text with the most logical transition?","choices":["Likewise","Instead","For example","Additionally"],"correct":1,"choiceNotes":[
            "\"Likewise\" would compare two matching funding plans, not describe a change.",
            "Correct. \"Instead\" signals that crowdfunding replaced the original venture-capital plan after it failed.",
            "\"For example\" would introduce an illustration, not a change in strategy.",
            "\"Additionally\" would add a similar point, not describe a change made after rejection."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"hard","type":"mc","text":"A student has taken these notes: octopuses have been observed using coconut shells as portable shelters; some octopuses arrange rocks to block den entrances; captive octopuses have solved multi-step puzzle boxes to obtain food.<br><br>The student wants to make a generalization about octopus behavior and support it with an example. Which choice most effectively uses the notes to accomplish this goal?","choices":["Octopuses live in oceans around the world.","Octopuses display notably flexible problem-solving behavior, as when captive individuals have solved multi-step puzzle boxes to obtain food.","Some octopuses arrange rocks to block den entrances.","Coconut shells can be used as portable shelters."],"correct":1,"choiceNotes":[
            "This is unrelated to behavior and provides no supporting example.",
            "Correct. This states a generalization (flexible problem-solving) and supports it with a specific example from the notes.",
            "This states a specific example without a generalization to support.",
            "This states a specific example without a generalization to support."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"medium","type":"mc","text":"A student has taken these notes: bioluminescence in fireflies is produced by a reaction between a molecule called luciferin and an enzyme called luciferase; the same luciferin-luciferase reaction has been isolated and used in medical research to visualize gene activity in cells.<br><br>The student is writing for an audience of biology majors who already understand bioluminescence and wants to introduce this specific application. Which choice most effectively uses the notes to accomplish this goal?","choices":["Fireflies produce light through a chemical reaction.","The luciferin-luciferase reaction responsible for firefly bioluminescence has since been isolated and applied in medical research to visualize gene activity in cells.","Bioluminescence is a fascinating natural phenomenon.","Luciferin and luciferase are two molecules found in fireflies."],"correct":1,"choiceNotes":[
            "This restates background the audience already knows without introducing the application.",
            "Correct. This assumes familiarity with the basic mechanism and moves directly to the specific medical application, appropriate for an already-informed audience.",
            "This is a vague generalization that doesn't introduce the specific application.",
            "This restates background the audience already knows without introducing the application."
          ]},
          {"domain":"Expression of Ideas","skill":"Rhetorical Synthesis","difficulty":"hard","type":"mc","text":"A student has taken these notes: a regional theater's ticket sales dropped 40% over three years; a new multiplex cinema opened nearby during that period; the theater's own audience surveys cited \"convenience\" as the top reason for reduced attendance.<br><br>The student wants to explain a likely reason for the decline in ticket sales. Which choice most effectively uses the notes to accomplish this goal?","choices":["The theater's ticket sales dropped 40% over three years.","A new multiplex cinema opened nearby during the same three-year period.","Audience surveys citing \"convenience\" as the top reason for reduced attendance suggest that the nearby multiplex, which opened during the same period, likely drew audiences away.","Movie theaters have changed significantly in recent decades."],"correct":2,"choiceNotes":[
            "This states the effect without explaining a cause.",
            "This states a fact without connecting it to the sales decline as an explanation.",
            "Correct. This choice connects the survey's \"convenience\" finding to the multiplex's opening, effectively explaining a likely reason for the decline.",
            "This is a vague generalization not drawn from the specific notes."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"hard","type":"mc","text":"The archive's rarest holding — ______ a handwritten draft annotated in the author's own hand — will be displayed publicly for the first time next spring.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["a handwritten draft annotated in the author's own hand,","a handwritten draft, annotated in the author's own hand —","a handwritten draft annotated in the author's own hand —","a handwritten draft annotated, in the author's own hand,"],"correct":2,"choiceNotes":[
            "This closes the interrupting phrase with a comma instead of matching the opening dash, mixing two different punctuation marks.",
            "This inserts an unnecessary comma in the middle of the phrase, breaking up \"a handwritten draft annotated in the author's own hand\" without cause.",
            "Correct. A pair of matching dashes correctly sets off the nonessential interrupting phrase describing the holding.",
            "This inserts an unnecessary comma before \"in the author's own hand\" and fails to close the phrase with a matching dash."
          ]},
          {"domain":"Standard English Conventions","skill":"Boundaries","difficulty":"medium","type":"mc","text":"The committee reviewed dozens of applications______ ultimately selecting only three finalists for the final round of interviews.<br><br>Which punctuation mark correctly fills the blank?","choices":["no punctuation","a colon","a comma","a semicolon"],"correct":2,"choiceNotes":[
            "Without any punctuation, the sentence runs the independent clause directly into the participial phrase with no separation.",
            "A colon is used to introduce a list or explanation following a complete independent clause, not to set off a participial phrase like this.",
            "Correct. A comma correctly sets off the nonessential participial phrase (\"ultimately selecting only three finalists\") describing the result of the committee's review.",
            "A semicolon is used to join two independent clauses, but \"ultimately selecting only three finalists\" is not an independent clause."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"hard","type":"mc","text":"The results of the three-year clinical trial, which involved over two thousand participants across five countries and required extensive follow-up interviews, ______ still being analyzed by an independent review board.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["is","was","are","has been"],"correct":2,"choiceNotes":[
            "\"Is\" is singular and doesn't agree with the plural subject \"results.\"",
            "\"Was\" is both singular and past tense, neither of which fits the plural subject or the ongoing action described.",
            "Correct. The subject is the plural \"results\" — the long intervening clause describing the trial doesn't change the verb's number.",
            "\"Has been\" is singular and doesn't agree with the plural subject \"results.\""
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"By the time the review board finishes its analysis, the trial's original funding ______ for over a year.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["expired","will have expired","expires","had expired"],"correct":1,"choiceNotes":[
            "\"Expired\" is simple past, which doesn't fit an action that will be complete only at a future point.",
            "Correct. The future perfect \"will have expired\" correctly shows an action that will be completed before another future point (\"by the time the review board finishes\").",
            "\"Expires\" is present tense and doesn't capture an action completed by a future point.",
            "\"Had expired\" is past perfect, which requires a past reference point, not the future one established here."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"Neither the museum's director nor its curators ______ aware of the shipment's delay until the morning of the exhibit opening.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["was","were","is","has been"],"correct":1,"choiceNotes":[
            "With \"neither...nor,\" the verb agrees with the nearer subject, \"curators,\" which is plural, so the singular \"was\" doesn't fit.",
            "Correct. With \"neither...nor\" constructions, the verb agrees with the nearer subject; \"curators\" is plural, so the plural \"were\" is correct.",
            "\"Is\" is present tense and doesn't fit the past-tense context.",
            "\"Has been\" is singular and doesn't agree with the nearer plural subject, \"curators.\""
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"hard","type":"mc","text":"Restored over the course of a decade using techniques unavailable when it was first painted, ______.<br><br>Which choice most logically and grammatically completes the sentence?","choices":["the museum unveiled the mural to record crowds","visitors could finally see the mural's original colors","the mural's original colors were finally visible to visitors","the mural finally revealed its original colors to visitors"],"correct":3,"choiceNotes":[
            "This creates a dangling modifier — the museum was not restored, the mural was.",
            "This creates a dangling modifier — the visitors were not restored, the mural was.",
            "This creates a dangling modifier — \"the mural's original colors\" were not themselves restored over a decade; the mural was.",
            "Correct. \"The mural\" immediately follows the introductory modifier, correctly identifying what was restored over the decade."
          ]},
          {"domain":"Standard English Conventions","skill":"Form, Structure, and Sense","difficulty":"medium","type":"mc","text":"The grant will fund not only the construction of the new wing but also ______.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["the hiring of additional staff will be possible","additional staff will be hired","the hiring of additional staff","to hire additional staff"],"correct":2,"choiceNotes":[
            "This shifts to a full independent clause, breaking the parallel structure required after \"not only...but also.\"",
            "This shifts to a full independent clause, breaking the parallel structure required after \"not only...but also.\"",
            "Correct. \"The hiring of additional staff\" matches the noun-phrase structure of \"the construction of the new wing,\" maintaining parallelism after \"not only...but also.\"",
            "This shifts to an infinitive phrase, breaking the parallel noun-phrase structure established by \"the construction.\""
          ]}
        ]
      }
    }
  }
];

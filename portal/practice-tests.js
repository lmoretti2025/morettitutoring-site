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
          {"domain":"Non-Desmos Equations","skill":"Isolation","difficulty":"easy","type":"mc","text":"Solve for x: 3x − 7 = 20","choices":["x = 13","x = 27","x = 9","x = 4.33"],"correct":2,"choiceNotes":[
            "This is 20 − 7, the value before dividing by 3 — the final division step was skipped.",
            "This is 3x itself (27), the value right before the final division by 3 to solve for x.",
            "Correct. Add 7 to both sides to get 3x = 27, then divide by 3 to get x = 9.",
            "This comes from subtracting 7 from 20 instead of adding it to isolate 3x, then dividing by 3 (13/3 ≈ 4.33)."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percents","difficulty":"easy","type":"mc","text":"A jacket originally priced $80 is discounted 15%. What is the sale price?","choices":["$92","$68","$65","$12"],"correct":1,"choiceNotes":[
            "This adds the discount instead of subtracting it, as if the price increased by 15%.",
            "Correct. The discount is 0.15 × 80 = $12, so the sale price is 80 − 12 = $68.",
            "This treats the 15 as if it were a dollar amount subtracted directly, rather than 15% of the price.",
            "This is only the discount amount (0.15 × 80 = $12), not the final sale price."
          ]},
          {"domain":"Desmos","skill":"Factoring","difficulty":"medium","type":"mc","text":"Solve by factoring: x² + 2x − 15 = 0","choices":["x = −5, −3","x = 5, 3","x = 5, −3","x = −5, 3"],"correct":3,"choiceNotes":[
            "This has the sign of the positive root (3) reversed.",
            "This has the sign of the negative root (−5) reversed.",
            "This has the correct magnitudes but the signs of both roots reversed.",
            "Correct. The expression factors as (x + 5)(x − 3) = 0, giving x = −5 and x = 3."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Area & Volume","difficulty":"medium","type":"fr","text":"A right triangle has legs of length 9 cm and 12 cm. What is its area, in cm²?","answer":54,"explanation":"Area of a triangle = (1/2)(base)(height). Using the two legs as base and height: (1/2)(9)(12) = 54."},
          {"domain":"Non-Desmos Equations","skill":"Function Word Problems","difficulty":"medium","type":"fr","text":"A store sells pens for $2 each and notebooks for $5 each. A customer buys 10 items total and spends $29. How many notebooks did the customer buy?","answer":3,"explanation":"Let p = pens and n = notebooks. p + n = 10 and 2p + 5n = 29. Substituting p = 10 − n gives 2(10 − n) + 5n = 29, so 20 + 3n = 29, meaning n = 3."},
          {"domain":"Desmos","skill":"Regression","difficulty":"hard","type":"mc","text":"Solve for x: 2^(3x−1) = 32","choices":["x = 2","x = 5/3","x = 4/3","x = 6"],"correct":0,"choiceNotes":[
            "Correct. Since 32 = 2⁵, the exponents must be equal: 3x − 1 = 5, so 3x = 6 and x = 2.",
            "This comes from dropping the −1 and solving 3x = 5 directly, instead of first adding 1 to both sides.",
            "This comes from a sign error, solving 3x + 1 = 5 instead of 3x − 1 = 5.",
            "This is the value of 3x after correctly solving 3x − 1 = 5 — the final division by 3 to isolate x was skipped."
          ]},
          {"domain":"Desmos","skill":"Table Regression","difficulty":"easy","type":"mc","text":"What is the slope of the line through the points (−2, 3) and (4, −9)?","choices":["2","−1/2","−12","−2"],"correct":3,"choiceNotes":[
            "This has the correct magnitude but the wrong sign, likely from a sign error in the numerator or denominator.",
            "This comes from inverting the slope formula — dividing the change in x by the change in y instead of the reverse.",
            "This is the change in y (−12) without dividing by the change in x (6).",
            "Correct. Slope = (−9 − 3)/(4 − (−2)) = −12/6 = −2."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Probability","difficulty":"medium","type":"mc","text":"A bag contains 5 red marbles, 3 blue marbles, and 2 green marbles. If one marble is drawn at random, what is the probability that it is NOT green?","choices":["1/2","4/5","1/5","3/10"],"correct":1,"choiceNotes":[
            "This is the probability of drawing red only (5/10 = 1/2), not accounting for blue.",
            "Correct. P(not green) = (5 + 3)/10 = 8/10 = 4/5.",
            "This is the probability of drawing green — the complement of the event actually being asked about.",
            "This is the probability of drawing blue only (3/10), not accounting for red."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles","difficulty":"hard","type":"mc","text":"In a right triangle, the side opposite angle θ has length 8 and the hypotenuse has length 17. What is cos θ?","choices":["8/15","17/15","15/17","8/17"],"correct":2,"choiceNotes":[
            "This is tan θ (opposite/adjacent), not cos θ.",
            "This is the reciprocal of cos θ — secant θ, or hypotenuse/adjacent = 17/15 — not cos θ itself.",
            "Correct. The adjacent side is √(17² − 8²) = √225 = 15, so cos θ = adjacent/hypotenuse = 15/17.",
            "This is sin θ (opposite/hypotenuse), not cos θ."
          ]},
          {"domain":"Non-Desmos Equations","skill":"Function Word Problems","difficulty":"medium","type":"mc","text":"A parking garage charges $4 for the first hour and $2.50 for each additional hour. If a driver wants to pay at most $16.50 total, which inequality gives the possible number of additional hours, a, beyond the first hour?","choices":["4 + 2.5a ≤ 16.50","2.5 + 4a ≤ 16.50","4 + 2.5a ≥ 16.50","4a + 2.5 ≤ 16.50"],"correct":0,"choiceNotes":[
            "Correct. The flat $4 fee plus $2.50 per additional hour must total at most $16.50.",
            "This swaps which rate is flat and which applies per hour.",
            "This uses the correct expression but the wrong inequality direction — 'at most' means ≤, not ≥.",
            "This incorrectly applies the $4 rate per additional hour instead of as a flat fee."
          ]},
          {"domain":"Desmos","skill":"Regression","difficulty":"easy","type":"mc","text":"If f(x) = 2x² − 3x + 1, what is f(−2)?","choices":["3","23","8","15"],"correct":3,"choiceNotes":[
            "This results from evaluating f(2) instead of f(−2), losing the negative sign on x.",
            "This results from squaring 2x instead of x — computing (2(−2))² = 16 instead of 2(−2)² = 8 — before combining terms.",
            "This is only the first term, 2(−2)² = 8; the −3x and +1 terms were dropped.",
            "Correct. f(−2) = 2(4) − 3(−2) + 1 = 8 + 6 + 1 = 15."
          ]},
          {"domain":"Desmos","skill":"Bracket Regression","difficulty":"hard","type":"mc","text":"Solve the system: 3x − 2y = 4 and 5x + 2y = 28. What is the value of x?","choices":["2","4","−4","6"],"correct":1,"choiceNotes":[
            "This is half of the correct value — likely from dividing 8x = 32 by 16 instead of 8.",
            "Correct. Adding the two equations eliminates y: 8x = 32, so x = 4. (Then y = 4 as well.)",
            "This has the correct magnitude but the wrong sign for x.",
            "This is a likely arithmetic slip when adding or dividing during elimination."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Single-Variable Data","difficulty":"medium","type":"fr","text":"A set of 7 test scores has a mean of 82. Six of the scores are 75, 80, 85, 90, 78, and 84. What is the seventh score?","answer":82,"explanation":"The sum of all 7 scores must be 82 × 7 = 574. The six known scores sum to 75+80+85+90+78+84 = 492, so the seventh score is 574 − 492 = 82."},
          {"domain":"Geometry & Trigonometry","skill":"Area & Volume","difficulty":"medium","type":"mc","text":"A circle has an area of 49π square inches. What is its circumference?","choices":["49π in","28π in","14π in","7π in"],"correct":2,"choiceNotes":[
            "This mistakenly reuses the area value (49π) as the circumference.",
            "This is double the correct value, likely from using the diameter incorrectly in the formula.",
            "Correct. Area = πr² = 49π means r² = 49, so r = 7, and circumference = 2πr = 14π.",
            "This uses r instead of 2r — the factor of 2 in the circumference formula was dropped."
          ]},
          {"domain":"Non-Desmos Equations","skill":"Function Word Problems","difficulty":"hard","type":"fr","text":"A population of bacteria doubles every 3 hours. If the population starts at 500, what is the population after 9 hours?","answer":4000,"explanation":"9 hours contains 9/3 = 3 doubling periods. Population = 500 × 2³ = 500 × 8 = 4,000."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Converting Units","difficulty":"easy","type":"mc","text":"A car travels at 54 miles per hour. What is this speed in miles per minute?","choices":["0.9","9","5.4","3,240"],"correct":0,"choiceNotes":[
            "Correct. 54 miles per hour ÷ 60 minutes per hour = 0.9 miles per minute.",
            "This comes from a misplaced decimal point, as if dividing by 6 instead of 60.",
            "This comes from dividing by 10 instead of 60.",
            "This comes from multiplying 54 by 60 instead of dividing by it — the inverse of the correct operation."
          ]},
          {"domain":"Desmos","skill":"Regression","difficulty":"medium","type":"mc","text":"Given f(x) = 2x² − 8x + 3, what is the x-coordinate of the vertex?","choices":["−2","4","8","2"],"correct":3,"choiceNotes":[
            "This has the correct magnitude but the wrong sign.",
            "This comes from dividing by a instead of 2a, dropping the factor of 2 in the denominator.",
            "This is −b alone (8), without dividing by 2a at all.",
            "Correct. The vertex x-coordinate is −b/(2a) = −(−8)/(2·2) = 8/4 = 2."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Similar Shapes","difficulty":"hard","type":"fr","text":"Triangle ABC is similar to triangle DEF, with AB corresponding to DE and BC corresponding to EF. If AB = 8, DE = 12, and BC = 10, what is the length of EF?","answer":15,"explanation":"The scale factor from triangle ABC to triangle DEF is DE/AB = 12/8 = 1.5. So EF = BC × 1.5 = 10 × 1.5 = 15."},
          {"domain":"Non-Desmos Equations","skill":"Function Word Problems","difficulty":"medium","type":"mc","text":"If f(x) = x + 5 and g(x) = 2x − 3, what is f(g(3))?","choices":["13","8","11","3"],"correct":1,"choiceNotes":[
            "This is g(f(3)), the functions applied in the reverse order: f(3) = 8, then g(8) = 2(8) − 3 = 13.",
            "Correct. g(3) = 2(3) − 3 = 3, then f(3) = 3 + 5 = 8.",
            "This adds f(3) and g(3) instead of composing them: f(3) + g(3) = 8 + 3 = 11.",
            "This is g(3) alone — the outer function f was never applied."
          ]},
          {"domain":"Desmos","skill":"Number of Solutions","difficulty":"hard","type":"mc","text":"What are all real solutions to |3x + 6| = 21?","choices":["x = 5 only","x = −5 and x = 9","x = 5 and x = −9","x = 9 only"],"correct":2,"choiceNotes":[
            "This only solves the positive case (3x + 6 = 21) and misses the negative case entirely.",
            "This has the sign of each solution reversed from the correct pair.",
            "Correct. 3x + 6 = 21 gives x = 5; 3x + 6 = −21 gives x = −9. Both satisfy the original equation.",
            "This solves only one case, and with a sign error in that case."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios","difficulty":"easy","type":"mc","text":"A recipe calls for flour and sugar in a ratio of 5:2. If a baker uses 15 cups of flour, how many cups of sugar are needed?","choices":["6","3","10","7.5"],"correct":0,"choiceNotes":[
            "Correct. 15 cups of flour is 15/5 = 3 times the base ratio amount, so sugar = 2 × 3 = 6 cups.",
            "This is the scale factor (3) itself, not the final amount of sugar.",
            "This mixes up which quantity in the ratio scales with the 15 cups.",
            "This comes from dividing 15 by 2 instead of first finding the correct scale factor from the ratio."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Angles, Lines & Triangles","difficulty":"medium","type":"mc","text":"A ladder 13 feet long leans against a wall, with its base 5 feet from the wall. How high up the wall does the ladder reach?","choices":["144 ft","12 ft","8 ft","18 ft"],"correct":1,"choiceNotes":[
            "This is 13² − 5² before taking the square root — the final square-root step was skipped.",
            "Correct. By the Pythagorean theorem, height = √(13² − 5²) = √(169 − 25) = √144 = 12 ft.",
            "This comes from subtracting the two lengths directly (13 − 5) instead of using the Pythagorean theorem.",
            "This comes from adding the two lengths directly (13 + 5) instead of using the Pythagorean theorem."
          ]}
        ],
        "module2Easier": [
          {"domain":"Non-Desmos Equations","skill":"Isolation","difficulty":"easy","type":"mc","text":"Solve for x: 5x + 3 = 28","choices":["x = 25","x = 5","x = 5.6","x = 6.2"],"correct":1,"choiceNotes":[
            "This is 5x itself (28 − 3 = 25) — the final division by 5 was skipped.",
            "Correct. Subtract 3 from both sides: 5x = 25, then divide by 5: x = 5.",
            "This is 28/5, dividing by 5 without first subtracting 3.",
            "This adds 3 instead of subtracting it, then divides: (28 + 3)/5."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percents","difficulty":"easy","type":"mc","text":"A shirt priced at $45 increases in price by 20%. What is the new price?","choices":["$36","$9","$54","$65"],"correct":2,"choiceNotes":[
            "This applies a 20% decrease instead of an increase: 45 × 0.8 = 36.",
            "This is only the amount of the increase ($9), not the final price.",
            "Correct. The increase is 0.20 × 45 = $9, so the new price is 45 + 9 = $54.",
            "This adds 20 (treated as a dollar amount) to $45 instead of 20% of $45."
          ]},
          {"domain":"Desmos","skill":"Table Regression","difficulty":"easy","type":"mc","text":"What is the slope of the line through the points (1, 4) and (3, 10)?","choices":["6","2","1/3","3"],"correct":3,"choiceNotes":[
            "This is the change in y (6) alone, without dividing by the change in x.",
            "This is the change in x (2) alone, without dividing into the change in y.",
            "This inverts the slope formula, dividing the change in x by the change in y instead of the reverse.",
            "Correct. Slope = (10 − 4)/(3 − 1) = 6/2 = 3."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Area & Volume","difficulty":"easy","type":"mc","text":"A rectangle has a length of 8 cm and a width of 5 cm. What is its area?","choices":["20 cm²","40 cm²","26 cm²","13 cm²"],"correct":1,"choiceNotes":[
            "This is half of the correct area, as if using the triangle area formula on a rectangle.",
            "Correct. Area = length × width = 8 × 5 = 40 cm².",
            "This is the perimeter, 2(8 + 5) = 26, not the area.",
            "This is half the perimeter (8 + 5 = 13), not the area."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Converting Units","difficulty":"easy","type":"mc","text":"How many minutes are there in 3 hours?","choices":["3","36","180","60"],"correct":2,"choiceNotes":[
            "This restates the original value in hours instead of converting it.",
            "This comes from an arithmetic slip, multiplying 3 by 12 instead of 60.",
            "Correct. 3 hours × 60 minutes per hour = 180 minutes.",
            "This uses the conversion factor (60) alone, without multiplying by 3."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Probability","difficulty":"easy","type":"mc","text":"A bag contains 4 red marbles and 6 blue marbles. If one marble is drawn at random, what is the probability that it is blue?","choices":["2/5","3/10","5/3","3/5"],"correct":3,"choiceNotes":[
            "This is P(red) = 4/10 = 2/5, the complement of the event actually being asked about.",
            "This is half the correct probability, likely from a division slip.",
            "This inverts the probability, computing total over blue (10/6) instead of blue over total.",
            "Correct. P(blue) = 6/10 = 3/5."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Single-Variable Data","difficulty":"easy","type":"fr","text":"A set of 5 numbers has a mean of 20. What is the sum of the 5 numbers?","answer":100,"explanation":"Mean × count = sum, so 20 × 5 = 100."},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles","difficulty":"easy","type":"fr","text":"A right triangle has legs of length 6 and 8. What is the length of its hypotenuse?","answer":10,"explanation":"By the Pythagorean theorem, the hypotenuse = √(6² + 8²) = √(36 + 64) = √100 = 10."},
          {"domain":"Non-Desmos Equations","skill":"Isolation","difficulty":"medium","type":"mc","text":"Solve for x: (x/3) − 4 = 1","choices":["x = 15","x = −9","x = 5","x = 3"],"correct":0,"choiceNotes":[
            "Correct. Add 4 to both sides: x/3 = 5, then multiply by 3: x = 15.",
            "This subtracts 4 again instead of adding it, giving x/3 = −3, then x = −9.",
            "This is x/3 itself (5) — the final multiplication by 3 was skipped.",
            "This mistakes the coefficient 3 for the answer, ignoring the equation entirely."
          ]},
          {"domain":"Desmos","skill":"Factoring","difficulty":"medium","type":"mc","text":"Solve by factoring: x² − 7x + 10 = 0","choices":["x = −5, 2","x = 5, 2","x = −5, −2","x = 5, −2"],"correct":1,"choiceNotes":[
            "This has the sign of the first root reversed.",
            "Correct. The expression factors as (x − 5)(x − 2) = 0, giving x = 5 and x = 2.",
            "This has both signs reversed from the correct roots.",
            "This has the sign of the second root reversed."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percents","difficulty":"medium","type":"mc","text":"A price is discounted 25% to a sale price of $60. What was the original price?","choices":["$45","$85","$80","$75"],"correct":2,"choiceNotes":[
            "This treats $60 as 75% too much rather than too little, computing 60 × 0.75 = 45 instead of dividing.",
            "This is a plausible-looking number near the correct value rather than the result of the actual calculation.",
            "Correct. Let p be the original price: 0.75p = 60, so p = 80.",
            "This adds 25% of the discounted price ($15) back onto $60, using the wrong base for the percentage."
          ]},
          {"domain":"Non-Desmos Equations","skill":"Function Word Problems","difficulty":"medium","type":"fr","text":"A plumber charges a flat fee of $50 plus $30 per hour. What is the total charge for a 3.5-hour job?","answer":155,"explanation":"Total = 50 + 30(3.5) = 50 + 105 = 155."},
          {"domain":"Desmos","skill":"Regression","difficulty":"medium","type":"mc","text":"If f(x) = 3x² − 2x + 4, what is f(3)?","choices":["31","21","7","25"],"correct":3,"choiceNotes":[
            "This drops the −2x term entirely: 3(9) + 4 = 31.",
            "This drops the +4 constant entirely: 3(9) − 2(3) = 21.",
            "This computes 3x instead of 3x², forgetting to square x first: 3(3) − 2(3) + 4 = 7.",
            "Correct. f(3) = 3(9) − 2(3) + 4 = 27 − 6 + 4 = 25."
          ]},
          {"domain":"Desmos","skill":"Table Regression","difficulty":"medium","type":"mc","text":"A table of values shows a linear pattern: at x = 0, y = 5; at x = 1, y = 8; at x = 2, y = 11. Based on this pattern, what value of y corresponds to x = 4?","choices":["20","23","17","14"],"correct":2,"choiceNotes":[
            "This overshoots by one step, giving the value at x = 5 (20) instead of x = 4.",
            "This overshoots by two steps, giving the value at x = 6 (23) instead of x = 4.",
            "Correct. y increases by 3 for each increase of 1 in x; from (2, 11), two more steps reach (4, 11 + 3 + 3) = (4, 17).",
            "This stops one step short, giving the value at x = 3 (14) instead of x = 4."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Angles, Lines & Triangles","difficulty":"medium","type":"mc","text":"A triangle has angles measuring 40° and 65°. What is the measure of the third angle?","choices":["25°","75°","105°","65°"],"correct":1,"choiceNotes":[
            "This is the difference between the two given angles (65 − 40 = 25°), not the third angle.",
            "Correct. The three angles of a triangle sum to 180°: 180 − 40 − 65 = 75°.",
            "This is the sum of the two given angles (40 + 65 = 105°), not the third angle.",
            "This just repeats one of the two given angles instead of solving for the third."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Similar Shapes","difficulty":"medium","type":"fr","text":"Two similar triangles have a scale factor of 2 between their corresponding sides. If the smaller triangle has an area of 12, what is the area of the larger triangle?","answer":48,"explanation":"Area scales by the square of the linear scale factor: 2² = 4, so the larger triangle's area is 12 × 4 = 48."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios","difficulty":"medium","type":"mc","text":"At a school, the ratio of boys to girls is 3:4. If there are 28 students total, how many are boys?","choices":["16","21","7","12"],"correct":3,"choiceNotes":[
            "This is the number of girls (4 × 4 = 16), not boys.",
            "This computes 3/4 of 28 directly (28 × 3/4 = 21) instead of using the 3:4 ratio out of 7 total parts.",
            "This is the value of one part using 4 total parts instead of the correct 7 (28/4 = 7).",
            "Correct. 3 + 4 = 7 parts total; 28/7 = 4 students per part; boys = 3 × 4 = 12."
          ]},
          {"domain":"Desmos","skill":"Number of Solutions","difficulty":"medium","type":"mc","text":"How many real solutions does the equation x² + 4x + 4 = 0 have?","choices":["1","0","2","Infinitely many"],"correct":0,"choiceNotes":[
            "Correct. The expression factors as (x + 2)² = 0, giving a single repeated solution, x = −2.",
            "This would be the case only if the discriminant were negative; here the discriminant is 0.",
            "This assumes two distinct solutions, but the discriminant b² − 4ac = 16 − 16 = 0 means the two roots coincide.",
            "This confuses a repeated root with an identity — the equation is only true for one specific value of x, not all x."
          ]},
          {"domain":"Non-Desmos Equations","skill":"Inequalities","difficulty":"easy","type":"mc","text":"Solve for x: 2x + 5 ≤ 17","choices":["x ≥ 6","x ≤ 6","x ≤ 12","x ≤ 22"],"correct":1,"choiceNotes":[
            "This has the correct boundary value but the inequality sign flipped, which would only happen when dividing by a negative number.",
            "Correct. Subtract 5 from both sides: 2x ≤ 12, then divide by 2: x ≤ 6.",
            "This is 2x ≤ 12 written as if it were the final answer — the division by 2 was skipped.",
            "This adds 5 instead of subtracting it, and also skips the division by 2."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percents","difficulty":"easy","type":"mc","text":"15 is what percent of 60?","choices":["400%","6%","25%","15%"],"correct":2,"choiceNotes":[
            "This inverts the fraction, computing 60/15 = 4 = 400% instead of 15/60.",
            "This comes from a misplaced decimal point, as if computing 15/60 = 0.06 instead of 0.25.",
            "Correct. 15/60 = 0.25 = 25%.",
            "This mistakes the number 15 itself for the percentage, ignoring its relationship to 60."
          ]},
          {"domain":"Non-Desmos Equations","skill":"Function Word Problems","difficulty":"medium","type":"fr","text":"Two numbers have a sum of 24 and a difference of 6. What is the larger number?","answer":15,"explanation":"Let the numbers be x and y with x + y = 24 and x − y = 6. Adding the equations: 2x = 30, so x = 15 (and y = 9)."},
          {"domain":"Desmos","skill":"Bracket Regression","difficulty":"hard","type":"mc","text":"Solve the system: x + y = 10 and 2x − y = 8. What is the value of x?","choices":["4","5","9","6"],"correct":3,"choiceNotes":[
            "This is the value of y (4), not x — the two variables were switched.",
            "This is a likely arithmetic slip when dividing 18 by an incorrect value.",
            "This comes from adding 10 and 8 first (18) and then dividing by 2 instead of 3.",
            "Correct. Adding the two equations eliminates y: 3x = 18, so x = 6 (and y = 4)."
          ]}
        ],
        "module2Harder": [
          {"domain":"Non-Desmos Equations","skill":"Isolation","difficulty":"easy","type":"mc","text":"Solve for x: 7x − 4 = 24","choices":["x = 28","x = 4","x = 3.43","x = 2.86"],"correct":1,"choiceNotes":[
            "This is 7x itself (28) — the final division by 7 was skipped.",
            "Correct. Add 4 to both sides: 7x = 28, then divide by 7: x = 4.",
            "This divides 24 by 7 directly, without first adding 4: 24/7 ≈ 3.43.",
            "This subtracts 4 instead of adding it, then divides: (24 − 4)/7 ≈ 2.86."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percents","difficulty":"easy","type":"mc","text":"A town's population grows from 250 to 300. What is the percent increase?","choices":["83.3%","120%","20%","50%"],"correct":2,"choiceNotes":[
            "This computes 250/300 instead of the increase divided by the original amount.",
            "This computes 300/250 = 1.2 and reports it as 120%, describing the new value as a percent of the old rather than finding the percent increase.",
            "Correct. The increase is 50; 50/250 = 0.20 = 20%.",
            "This is the raw increase in population (50), stated as if it were the percent itself."
          ]},
          {"domain":"Desmos","skill":"Factoring","difficulty":"medium","type":"mc","text":"Solve by factoring: 2x² − 3x − 9 = 0","choices":["x = −3, 3/2","x = 3, 3/2","x = −3, −3/2","x = 3, −3/2"],"correct":3,"choiceNotes":[
            "This has both signs reversed from the correct roots.",
            "This has the sign of −3/2 reversed.",
            "This has the sign of 3 reversed.",
            "Correct. The expression factors as (2x + 3)(x − 3) = 0, giving x = 3 and x = −3/2."
          ]},
          {"domain":"Desmos","skill":"Regression","difficulty":"medium","type":"mc","text":"If f(x) = 2x² + 5x − 3, what is f(−3)?","choices":["0","36","−36","3"],"correct":0,"choiceNotes":[
            "Correct. f(−3) = 2(9) + 5(−3) − 3 = 18 − 15 − 3 = 0.",
            "This computes (2 · −3)² = 36 and stops, never adding the remaining terms.",
            "This treats (−3)² as −9 (a sign error in squaring), giving 2(−9) + 5(−3) − 3 = −36.",
            "This drops the constant term −3, giving 2(9) + 5(−3) = 3."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Area & Volume","difficulty":"medium","type":"mc","text":"A cylinder has a radius of 3 and a height of 10. What is its volume?","choices":["60π","90π","30π","270π"],"correct":1,"choiceNotes":[
            "This uses the diameter (6) in place of r without squaring it: π(6)(10) = 60π.",
            "Correct. V = πr²h = π(3²)(10) = 90π.",
            "This uses r instead of r², computing π(3)(10) = 30π.",
            "This uses r³ instead of r², computing π(27)(10) = 270π."
          ]},
          {"domain":"Geometry & Trigonometry","skill":"Right Triangles","difficulty":"medium","type":"mc","text":"In a right triangle, sin θ = 5/13. What is cos θ?","choices":["13/12","5/13","12/13","5/12"],"correct":2,"choiceNotes":[
            "This is the reciprocal of cos θ — secant θ, or hypotenuse/adjacent = 13/12 — not cos θ itself.",
            "This repeats sin θ instead of computing cos θ.",
            "Correct. The adjacent side is √(13² − 5²) = √144 = 12, so cos θ = 12/13.",
            "This is tan θ (opposite/adjacent = 5/12), not cos θ."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Ratios","difficulty":"medium","type":"fr","text":"A car travels 210 miles in 3.5 hours at a constant rate. At that same rate, how many miles would it travel in 5 hours?","answer":300,"explanation":"Rate = 210/3.5 = 60 miles per hour. In 5 hours: 60 × 5 = 300 miles."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Probability","difficulty":"medium","type":"mc","text":"A fair coin is flipped twice. What is the probability of getting heads on both flips?","choices":["1/2","1/3","2/3","1/4"],"correct":3,"choiceNotes":[
            "This is the probability of a single flip landing heads, not both flips.",
            "This treats the outcomes as one of three equally likely results (HH, one head, TT) instead of counting HT and TH as separate outcomes.",
            "This is the complement of 1/3, compounding the same miscount of outcomes.",
            "Correct. P(H) × P(H) = 1/2 × 1/2 = 1/4."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Single-Variable Data","difficulty":"medium","type":"mc","text":"What is the median of the data set 3, 7, 9, 12, 14, 20?","choices":["12","11","10.5","9"],"correct":2,"choiceNotes":[
            "This is the 4th value alone, without averaging with the 3rd.",
            "This is a plausible-looking number near the correct value but not the actual average of 9 and 12.",
            "Correct. With 6 values in order, the median is the average of the 3rd and 4th values: (9 + 12)/2 = 10.5.",
            "This is the 3rd value alone, without averaging with the 4th."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Two-Variable Data","difficulty":"medium","type":"fr","text":"A line of best fit relating study hours (x) to predicted test score (y) is given by y = 2.5x + 12. Using this model, what is the predicted score for 8 study hours?","answer":32,"explanation":"y = 2.5(8) + 12 = 20 + 12 = 32."},
          {"domain":"Desmos","skill":"Number of Solutions","difficulty":"hard","type":"mc","text":"How many real solutions does the equation x² + 6x + 9 = −4 have?","choices":["Infinitely many","0","1","2"],"correct":1,"choiceNotes":[
            "This would only apply to an identity true for all x, not a quadratic equation with a negative discriminant.",
            "Correct. Rewriting as x² + 6x + 13 = 0, the discriminant is 6² − 4(1)(13) = 36 − 52 = −16, which is negative, so there are no real solutions.",
            "This would be the case only if the discriminant were exactly 0, but here it's negative.",
            "This assumes the discriminant is positive, but 36 − 52 = −16 is negative."
          ]},
          {"domain":"Desmos","skill":"Bracket Regression","difficulty":"hard","type":"fr","text":"For what value of k does the system 3x + 2y = 7 and 6x + 4y = k have infinitely many solutions?","answer":14,"explanation":"Multiplying the first equation by 2 gives 6x + 4y = 14. For the system to have infinitely many solutions, the second equation must be identical to this, so k = 14."},
          {"domain":"Desmos","skill":"Equivalent Expressions","difficulty":"hard","type":"mc","text":"Which expression is equivalent to (2x⁻²y³)/(xy⁻¹) for x, y ≠ 0?","choices":["2y⁴/x²","2x²y⁴","2y²/x³","2y⁴/x³"],"correct":3,"choiceNotes":[
            "This subtracts the x exponents incorrectly, treating −2 − 1 as −2 instead of −3.",
            "This adds the exponents instead of subtracting when dividing, and flips a sign along the way.",
            "This subtracts the y exponents instead of adding when dividing by y⁻¹, using 3 − 1 = 2 instead of 3 − (−1) = 4.",
            "Correct. Dividing exponents: x^(−2−1) = x⁻³ and y^(3−(−1)) = y⁴, giving 2x⁻³y⁴ = 2y⁴/x³."
          ]},
          {"domain":"Non-Desmos Equations","skill":"Function Word Problems","difficulty":"hard","type":"fr","text":"A population of bacteria triples every 4 hours, starting at 200. What is the population after 12 hours?","answer":5400,"explanation":"12 hours contains 12/4 = 3 tripling periods. Population = 200 × 3³ = 200 × 27 = 5,400."},
          {"domain":"Geometry & Trigonometry","skill":"Circles","difficulty":"hard","type":"mc","text":"A circle has the equation (x − 2)² + (y + 3)² = 25. What is its radius?","choices":["5","25","10","2.5"],"correct":0,"choiceNotes":[
            "Correct. In the form (x − h)² + (y − k)² = r², r² = 25, so r = 5.",
            "This is r² itself — the final square root was skipped.",
            "This is double the correct radius, as if it were the diameter.",
            "This is half the correct radius, likely from confusing r² with 2r."
          ]},
          {"domain":"Desmos","skill":"Systems of Equations","difficulty":"hard","type":"fr","text":"Solve the system y = x² and y = 2x + 3 for the positive value of x.","answer":3,"explanation":"Setting x² = 2x + 3 gives x² − 2x − 3 = 0, which factors as (x − 3)(x + 1) = 0, so x = 3 or x = −1. The positive solution is x = 3."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Sample Statistics & Margin of Error","difficulty":"medium","type":"mc","text":"A poll of 500 voters found that 54% support a proposal, with a margin of error of 3 percentage points. Which of the following is NOT a plausible value for the true percentage of all voters who support the proposal?","choices":["52%","60%","51%","57%"],"correct":1,"choiceNotes":[
            "This falls within the margin of error range, so it is plausible.",
            "Correct. This falls outside the range 51%–57% given by the margin of error, so it is not plausible.",
            "This falls within the margin of error (54 − 3 = 51), so it is plausible.",
            "This falls within the margin of error (54 + 3 = 57), so it is plausible."
          ]},
          {"domain":"Problem-Solving & Data Analysis","skill":"Evaluating Statistical Claims","difficulty":"medium","type":"mc","text":"A study finds that students who eat breakfast tend to have higher test scores than students who don't. Which finding, if true, would most weaken a causal conclusion that eating breakfast improves test scores?","choices":["The study measured scores using a standardized test.","Breakfast foods vary widely in nutritional content.","Students who eat breakfast also tend to come from households with more resources for tutoring and study materials.","Some students who eat breakfast still score below average."],"correct":2,"choiceNotes":[
            "The type of test used doesn't affect whether the breakfast-score link is causal or merely correlational.",
            "Variation in breakfast content doesn't address the core issue of a possible confounding variable behind the correlation.",
            "Correct. This introduces a confounding variable (household resources) that could explain the score difference independent of breakfast itself.",
            "A few individual exceptions don't undermine an overall correlation."
          ]},
          {"domain":"Desmos","skill":"Regression","difficulty":"hard","type":"fr","text":"The function g is defined by g(x) = (x − 1)(x + 5). What is the minimum value of g?","answer":-9,"explanation":"Expanding gives g(x) = x² + 4x − 5. The vertex occurs at x = −b/(2a) = −4/2 = −2, so g(−2) = 4 − 8 − 5 = −9, which is the minimum since the parabola opens upward."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Percents","difficulty":"medium","type":"fr","text":"An investment of $2,000 grows by 10% each year for 2 years. What is its value after 2 years?","answer":2420,"explanation":"2,000 × 1.1² = 2,000 × 1.21 = 2,420."},
          {"domain":"Problem-Solving & Data Analysis","skill":"Single-Variable Data","difficulty":"medium","type":"mc","text":"Two data sets have the same mean. Set A's values are clustered tightly around the mean; Set B's values are spread widely. Which statement must be true?","choices":["Set A has a larger mean than Set B.","Set B has a smaller range than Set A.","Set A and Set B have the same standard deviation.","Set A has a smaller standard deviation than Set B."],"correct":3,"choiceNotes":[
            "The problem states the means are equal, so neither set has a larger mean.",
            "A widely spread set would have a larger, not smaller, range than a tightly clustered one.",
            "Different spreads mean different standard deviations, so they can't be equal.",
            "Correct. Standard deviation measures spread, and tightly clustered data has less spread than widely spread data."
          ]},
          {"domain":"Desmos","skill":"Equivalent Expressions","difficulty":"hard","type":"mc","text":"Which expression is equivalent to (3x²y⁻¹)⁻¹ · (x⁻¹y²) for x, y ≠ 0?","choices":["3x³/y³","y³/(3x³)","3y³/x³","y/(3x)"],"correct":1,"choiceNotes":[
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
          {"domain":"Craft & Structure","skill":"Text Structure & Purpose","difficulty":"medium","type":"mc","text":"Marine biologist Asha Patel spent three years tracking a colony of Atlantic puffins on a remote Icelandic island. Puffin numbers there had declined for over a decade, and many researchers assumed the cause was overfishing of the sand eels puffins rely on for food. <u>Patel's team found that sand eel populations near the colony had actually remained stable throughout the study period.</u> Her data pointed instead to rising sea temperatures disrupting the timing of chick-rearing.<br><br>Which choice best describes the function of the underlined sentence?","choices":["It confirms the researchers' original assumption about the cause of the decline.","It rules out one commonly assumed explanation, setting up an alternative explanation.","It summarizes the entire study's methodology.","It introduces the topic of the passage for the first time."],"correct":1,"choiceNotes":[
            "This finding contradicts, rather than confirms, the overfishing assumption.",
            "Correct. Ruling out stable sand eel populations eliminates the overfishing explanation, setting up Patel's temperature-based explanation that follows.",
            "This sentence reports a finding, not a description of methods.",
            "The topic (the puffin decline) was already introduced in the first two sentences."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure & Purpose","difficulty":"medium","type":"mc","text":"City planner Marcus Webb's 2019 report on downtown Cleveland begins with a single statistic: the average commuter there spent 27 more hours in traffic that year than a decade earlier. <u>Webb then spends the report's next twelve pages examining zoning changes, bus route cuts, and population shifts that might explain the increase.</u> Only in his conclusion does he recommend a specific policy response.<br><br>Which choice best describes the function of the underlined sentence?","choices":["It presents the report's central recommendation.","It shifts from a single striking figure to a broader investigation of its possible causes.","It contradicts the statistic given in the first sentence.","It summarizes the policy response described in the conclusion."],"correct":1,"choiceNotes":[
            "The recommendation doesn't appear until the conclusion, not in this sentence.",
            "Correct. The sentence moves from one attention-grabbing number to the wider examination of causes that makes up most of the report.",
            "The examination of causes doesn't contradict the initial statistic — it investigates it.",
            "The policy response doesn't appear until the conclusion, not in this sentence."
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
          {"domain":"Information & Ideas","skill":"Central Ideas","difficulty":"medium","type":"mc","text":"\"The bridge was never meant to be beautiful — its engineers prioritized load capacity over ornament at every turn. And yet, a century later, its stark geometry is what draws photographers from around the world.\"<br><br>Which choice best states the main idea of the text?","choices":["Photographers dislike ornate architecture.","Load capacity is unrelated to a structure's appearance.","A structure designed purely for function can still come to be admired for its form.","The bridge collapsed shortly after being built."],"correct":2,"choiceNotes":[
            "The text doesn't make a general claim about photographers' preferences.",
            "The text doesn't make this broad claim — it only describes this one bridge's story.",
            "Correct. The text shows a function-first design becoming aesthetically admired later, matching this statement.",
            "Nothing in the text mentions collapse."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas","difficulty":"easy","type":"mc","text":"\"Critics initially panned the film for its slow pacing, but audiences kept returning to it for exactly that reason, describing the unhurried scenes as a rare kind of relief.\"<br><br>Which choice best states the main idea of the text?","choices":["What critics saw as a flaw, audiences experienced as a strength.","The film was a total commercial failure.","Critics and audiences always agree about pacing.","Slow pacing is objectively good filmmaking."],"correct":0,"choiceNotes":[
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
          {"domain":"Information & Ideas","skill":"Command of Evidence","difficulty":"medium","type":"mc","text":"Claim: A city's new streetlight program reduced nighttime traffic accidents.<br><br>Which finding, if true, would most directly support this claim?","choices":["The streetlights cost less to install than expected.","Daytime accident rates were unaffected by the program.","Nighttime accident rates on newly lit streets fell 30% in the year after installation, while rates on unlit streets stayed flat.","Residents reported feeling safer walking at night."],"correct":2,"choiceNotes":[
            "Installation cost has no bearing on whether accidents decreased.",
            "Daytime accidents wouldn't be affected by streetlights either way, so this is irrelevant to the claim.",
            "Correct. A direct before/after accident-rate comparison, with an unlit control group, most directly supports a causal claim about accidents.",
            "A feeling of safety doesn't directly measure actual accident rates."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence","difficulty":"hard","type":"mc","text":"A researcher claims a particular 19th-century ledger was forged decades after its supposed date.<br><br>Which discovery would most directly support this claim?","choices":["The ledger is written in elegant, old-fashioned handwriting.","The ledger discusses events from the correct historical period.","The ledger was found in an archive alongside other 19th-century documents.","Chemical analysis shows the ledger's paper contains a wood-pulp additive not manufactured until the 20th century."],"correct":3,"choiceNotes":[
            "Handwriting style alone doesn't prove a forgery or an authentic date.",
            "Discussing period-accurate events doesn't rule out a later forger researching the period.",
            "Proximity to genuine documents in an archive doesn't establish the ledger's own authenticity.",
            "Correct. A manufacturing anachronism in the physical paper directly demonstrates the document couldn't be as old as claimed."
          ]},
          {"domain":"Information & Ideas","skill":"Quantitative Evidence","difficulty":"easy","type":"mc","text":"A survey of 400 commuters found that 220 said they would use a new bike lane if it were built.<br><br>Which choice most accurately interprets the data?","choices":["Exactly 220 commuters in the city support the bike lane.","The survey proves the bike lane would eliminate car traffic.","Fewer than half of the commuters surveyed said they would use the bike lane.","Just over half of the commuters surveyed said they would use the new bike lane."],"correct":3,"choiceNotes":[
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
          {"domain":"Standard English Conventions","skill":"Sentence Boundaries","difficulty":"medium","type":"mc","text":"The renovation was completed well under budget ______ the contractor still submitted additional invoices months later.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["budget, however the contractor","budget, the contractor","budget; the contractor","budget the contractor"],"correct":2,"choiceNotes":[
            "This creates a comma splice; \"however\" is a conjunctive adverb, not a coordinating conjunction, so a comma alone cannot use it to join two independent clauses this way.",
            "This creates a comma splice by joining two independent clauses with only a comma.",
            "Correct. A semicolon properly joins two independent clauses without a coordinating conjunction.",
            "This creates a run-on sentence by joining two independent clauses with no punctuation at all."
          ]},
          {"domain":"Standard English Conventions","skill":"Subject-Verb Agreement","difficulty":"easy","type":"mc","text":"The collection of rare manuscripts, housed in a climate-controlled vault, ______ insured for several million dollars.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["were","have been","are","is"],"correct":3,"choiceNotes":[
            "\"Were\" is both plural and past tense, neither of which fits the singular subject or the sentence's tense.",
            "\"Have been\" is plural and doesn't agree with the singular subject \"collection.\"",
            "\"Are\" is plural and doesn't agree with the singular subject \"collection.\"",
            "Correct. \"Collection\" is a singular noun, so it takes the singular verb \"is.\""
          ]},
          {"domain":"Standard English Conventions","skill":"Pronouns & Apostrophes","difficulty":"easy","type":"mc","text":"The researchers published ______ findings in a peer-reviewed journal last month.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["their","they're","it's","its"],"correct":0,"choiceNotes":[
            "Correct. \"Their\" is the plural possessive pronoun that agrees with \"researchers.\"",
            "\"They're\" is a contraction of \"they are,\" not a possessive form.",
            "\"It's\" is a contraction of \"it is,\" which doesn't fit as a possessive here.",
            "\"Its\" is a singular possessive, but \"researchers\" is plural."
          ]},
          {"domain":"Standard English Conventions","skill":"Verb Tense & Sequence","difficulty":"medium","type":"mc","text":"By the time the inspectors arrived, the crew ______ already sealed the leak.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["are","had","have","will have"],"correct":1,"choiceNotes":[
            "\"Are\" is present tense and doesn't fit the past-tense context at all.",
            "Correct. The past perfect \"had\" correctly shows the sealing was completed before the inspectors arrived, an earlier past action.",
            "\"Have\" is present perfect, which doesn't fit a sequence of two past events.",
            "\"Will have\" is future perfect, which doesn't fit a sentence describing past events."
          ]},
          {"domain":"Standard English Conventions","skill":"Parallel Structure","difficulty":"medium","type":"mc","text":"The chef's specialty dishes involve smoking the meat overnight, slow-roasting the vegetables, and ______.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["to reduce the sauce for hours","the sauce is reduced for hours","reducing the sauce for hours","she reduces the sauce for hours"],"correct":2,"choiceNotes":[
            "The infinitive \"to reduce\" doesn't match the -ing form used by the other two items in the list.",
            "This breaks the parallel -ing structure established by \"smoking\" and \"slow-roasting.\"",
            "Correct. \"Reducing\" matches the -ing form of \"smoking\" and \"slow-roasting,\" maintaining parallel structure.",
            "This shifts to a full clause with a new subject, breaking the parallel list structure."
          ]},
          {"domain":"Standard English Conventions","skill":"Colons & Lists","difficulty":"easy","type":"mc","text":"The expedition required three essential supplies______ fresh water, waterproof matches, and a reliable compass.<br><br>Which punctuation mark correctly fills the blank?","choices":["a semicolon","no punctuation","a comma","a colon"],"correct":3,"choiceNotes":[
            "A semicolon is used to join two independent clauses or separate complex list items, not to introduce a simple list like this one.",
            "Without any punctuation, the list would run directly into the sentence with no clear introduction.",
            "A comma isn't strong enough to introduce a list following an independent clause like this one.",
            "Correct. A colon properly introduces a list after a complete independent clause."
          ]},
          {"domain":"Standard English Conventions","skill":"Relative Pronouns","difficulty":"hard","type":"mc","text":"The observatory's main telescope, ______ took engineers nearly six years to calibrate, captured its first images last spring.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["which","that","it","who"],"correct":0,"choiceNotes":[
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
          {"domain":"Craft & Structure","skill":"Text Structure & Purpose","difficulty":"medium","type":"mc","text":"Restaurant critic Dana Ilic's profile of chef Min-jun Kwon opens by describing, in precise detail, the exact temperature Kwon keeps her walk-in freezer and the labeling system she uses for every ingredient inside it. <u>Only after several paragraphs of this technical detail does Ilic turn to Kwon's philosophy that cooking should feel spontaneous, even reckless.</u> The contrast, Ilic suggests, is the key to understanding Kwon's kitchen.<br><br>Which choice best describes the function of the underlined sentence?","choices":["It criticizes Kwon for being overly technical in her approach to cooking.","It marks a shift from precise technical detail to a seemingly contradictory philosophy.","It proves that spontaneity is impossible in a professional kitchen.","It provides a complete inventory of the freezer's contents."],"correct":1,"choiceNotes":[
            "Nothing in the sentence suggests criticism of Kwon.",
            "Correct. The sentence signals the pivot from meticulous technical description to Kwon's philosophy of spontaneity, setting up the contrast Ilic wants to explore.",
            "The passage doesn't argue spontaneity is impossible — Kwon's philosophy embraces it.",
            "The sentence describes a shift in topic, not an inventory of items."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure & Purpose","difficulty":"medium","type":"mc","text":"The Hartwell Public Library's history, compiled by local archivist Rosa Delgado, opens with the building's construction in 1920 by shipping magnate Elias Hartwell. <u>Delgado then devotes most of her account to the library's current renovation plans, including a new digital media wing and an expanded children's reading room.</u> She closes by noting that Hartwell's original blueprints are still on file.<br><br>Which choice best describes the function of the underlined sentence?","choices":["It provides a complete biography of Elias Hartwell.","It argues that the renovation should not proceed.","It shifts the account's focus from the building's origins to its future.","It proves that the original blueprints have been lost."],"correct":2,"choiceNotes":[
            "The sentence discusses renovation plans, not Hartwell's biography.",
            "Nothing in the sentence argues against the renovation.",
            "Correct. The sentence moves the account from the library's 1920 origins to its present-day renovation, shifting the temporal focus.",
            "The passage states the blueprints are still on file, not lost."
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
          {"domain":"Information & Ideas","skill":"Central Ideas","difficulty":"easy","type":"mc","text":"\"The startup's founders had no formal training in software engineering, yet their product outperformed those built by teams of veteran developers.\"<br><br>Which choice best states the main idea of the text?","choices":["Software engineering requires no skill at all.","Formal training is not always necessary for building a superior product.","Veteran developers are incompetent.","The startup failed within its first year."],"correct":1,"choiceNotes":[
            "The text doesn't claim the field requires no skill, only that formal training wasn't necessary here.",
            "Correct. This captures the contrast between lack of formal training and superior results.",
            "The text doesn't call veteran developers incompetent, only that this particular product outperformed theirs.",
            "Nothing in the text mentions failure."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas","difficulty":"medium","type":"mc","text":"\"The museum's new wing was designed to be nearly invisible from the street, its glass façade reflecting the historic buildings around it rather than competing with them.\"<br><br>Which choice best states the main idea of the text?","choices":["The museum's new wing is larger than the historic buildings nearby.","The architects intended the wing to be the neighborhood's main attraction.","The glass façade was added purely for structural support.","The new wing was designed to blend with, rather than stand out from, its surroundings."],"correct":3,"choiceNotes":[
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
          {"domain":"Information & Ideas","skill":"Command of Evidence","difficulty":"medium","type":"mc","text":"Claim: A new fertilizer increases crop yield.<br><br>Which finding, if true, would most directly support this claim?","choices":["Farmers reported liking the fertilizer's packaging.","The fertilizer was tested in a single field only once.","Fields treated with the fertilizer produced 20% more crop per acre than untreated fields planted under identical conditions.","The fertilizer is cheaper to produce than older alternatives."],"correct":2,"choiceNotes":[
            "Packaging preference says nothing about crop yield.",
            "A single, one-time test provides weak, not strong, direct support.",
            "Correct. A direct yield comparison between treated and untreated fields under identical conditions most directly supports a yield claim.",
            "Cost has no bearing on whether yield actually increased."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence","difficulty":"hard","type":"mc","text":"A researcher claims a newly discovered fossil belongs to a previously unknown species rather than a known one.<br><br>Which discovery would most directly support this claim?","choices":["The fossil was found in a well-studied excavation site.","The fossil is similar in size to a known species.","The fossil was dated using standard radiometric methods.","The fossil's skeletal proportions differ measurably from every known species in its genus."],"correct":3,"choiceNotes":[
            "The location of discovery doesn't establish species identity.",
            "Similarity in size to a known species would argue against, not for, it being a new species.",
            "The dating method establishes age, not species novelty.",
            "Correct. Measurable, distinct proportions from all known species directly support the claim of a new species."
          ]},
          {"domain":"Information & Ideas","skill":"Quantitative Evidence","difficulty":"easy","type":"mc","text":"A survey of 300 residents found that 189 said they support a new recycling program.<br><br>Which choice most accurately interprets the data?","choices":["Fewer than half of the residents surveyed support the program.","Just under two-thirds of the residents surveyed said they support the program.","Exactly 189 residents in the town support the program.","The survey proves the program will succeed."],"correct":1,"choiceNotes":[
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
          {"domain":"Standard English Conventions","skill":"Sentence Boundaries","difficulty":"medium","type":"mc","text":"The museum's new exhibit opened to enthusiastic reviews ______ attendance nearly doubled within the first month.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["reviews attendance","reviews, attendance","reviews; attendance","reviews, however attendance"],"correct":2,"choiceNotes":[
            "This creates a run-on sentence by joining two independent clauses with no punctuation at all.",
            "This creates a comma splice by joining two independent clauses with only a comma.",
            "Correct. A semicolon properly joins two independent clauses without a coordinating conjunction.",
            "This creates a comma splice; \"however\" is a conjunctive adverb, not a coordinating conjunction, so a comma alone cannot use it to join two independent clauses this way."
          ]},
          {"domain":"Standard English Conventions","skill":"Sentence Boundaries","difficulty":"easy","type":"mc","text":"The hikers reached the summit just before sunset ______ they immediately began setting up camp for the night.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["sunset they",", and","; moreover they","sunset, they"],"correct":1,"choiceNotes":[
            "This creates a run-on sentence by joining two independent clauses with no punctuation at all.",
            "Correct. A comma followed by the coordinating conjunction \"and\" properly joins two independent clauses.",
            "This is missing a needed comma before \"moreover\" and creates awkward, nonstandard phrasing as a connector here.",
            "This creates a comma splice by joining two independent clauses with only a comma."
          ]},
          {"domain":"Standard English Conventions","skill":"Subject-Verb Agreement","difficulty":"easy","type":"mc","text":"The list of ingredients for the recipe ______ printed on the back of the box.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["are","were","have been","is"],"correct":3,"choiceNotes":[
            "\"Are\" is plural and doesn't agree with the singular subject \"list.\"",
            "\"Were\" is both plural and past tense, neither of which fits.",
            "\"Have been\" is plural and doesn't agree with the singular subject \"list.\"",
            "Correct. \"List\" is a singular noun, so it takes the singular verb \"is.\""
          ]},
          {"domain":"Standard English Conventions","skill":"Pronouns & Apostrophes","difficulty":"easy","type":"mc","text":"The two scientists shared credit for ______ discovery in the published paper.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["their","they're","its","there"],"correct":0,"choiceNotes":[
            "Correct. \"Their\" is the plural possessive pronoun that agrees with \"the two scientists.\"",
            "\"They're\" is a contraction of \"they are,\" not a possessive form.",
            "\"Its\" is a singular possessive, but \"scientists\" is plural.",
            "\"There\" indicates location, not possession."
          ]},
          {"domain":"Standard English Conventions","skill":"Verb Tense & Sequence","difficulty":"medium","type":"mc","text":"By the time the fire department arrived, the neighbors ______ already contained the small blaze with a garden hose.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["will have","had","have","are"],"correct":1,"choiceNotes":[
            "\"Will have\" is future perfect, which doesn't fit a sentence describing past events.",
            "Correct. The past perfect \"had\" correctly shows the containment happened before the fire department's arrival, an earlier past action.",
            "\"Have\" is present perfect, which doesn't fit a sequence of two past events.",
            "\"Are\" is present tense and doesn't fit the past-tense context at all."
          ]},
          {"domain":"Standard English Conventions","skill":"Parallel Structure","difficulty":"medium","type":"mc","text":"The internship required drafting press releases, coordinating with reporters, and ______.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["interviews are scheduled","she scheduled interviews","scheduling interviews","to schedule interviews"],"correct":2,"choiceNotes":[
            "This shifts to a full passive clause with a new subject, breaking the parallel list structure.",
            "This shifts to a full clause with a new subject, breaking the parallel list structure.",
            "Correct. \"Scheduling\" matches the -ing form of \"drafting\" and \"coordinating,\" maintaining parallel structure.",
            "The infinitive \"to schedule\" doesn't match the -ing form used by the other two items in the list."
          ]},
          {"domain":"Standard English Conventions","skill":"Colons & Lists","difficulty":"easy","type":"mc","text":"The chemistry lab required three items______ safety goggles, a lab coat, and closed-toe shoes.<br><br>Which punctuation mark correctly fills the blank?","choices":["a comma","no punctuation","a semicolon","a colon"],"correct":3,"choiceNotes":[
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
          {"domain":"Craft & Structure","skill":"Text Structure & Purpose","difficulty":"medium","type":"mc","text":"Journalist Priya Chandrasekaran's article on coastal flood insurance opens with a single family in Biloxi, Mississippi, watching six inches of water rise through their living room for the third time in four years. <u>Chandrasekaran then pivots to a broader analysis of how federal flood insurance premiums are calculated nationwide.</u> The two threads don't meet again until her final paragraph.<br><br>Which choice best describes the function of the underlined sentence?","choices":["It provides statistical evidence that contradicts the family's experience.","It moves from a specific, human-scale account to a wider policy analysis.","It argues that federal flood insurance should be eliminated entirely.","It repeats the anecdote from the opening paragraph in different words."],"correct":1,"choiceNotes":[
            "The broader analysis doesn't contradict the family's account — it contextualizes it.",
            "Correct. The sentence marks the shift from one family's specific experience to a national-level policy discussion.",
            "The article analyzes how premiums are calculated, not an argument to eliminate the program.",
            "This sentence introduces new content (premium calculations), not a repetition of the opening anecdote."
          ]},
          {"domain":"Craft & Structure","skill":"Text Structure & Purpose","difficulty":"hard","type":"mc","text":"A 2021 paper by neuroscientist Tobias Rehn opens with four paragraphs summarizing decades of research on how fruit flies process visual motion. <u>Only in a single sentence near the end of the introduction does Rehn state the specific, narrow question his own experiments will address: whether a newly identified neuron type contributes to that processing.</u> The rest of the paper is devoted to answering it.<br><br>Which choice best describes the function of the underlined sentence?","choices":["It summarizes the paper's entire methodology in advance.","It proves that no prior research on fruit fly vision exists.","It narrows four paragraphs of established background into the paper's specific, unanswered question.","It contradicts the research summarized in the opening paragraphs."],"correct":2,"choiceNotes":[
            "The sentence states a research question, not a methodology summary.",
            "The four opening paragraphs establish that considerable prior research does exist.",
            "Correct. After establishing broad context, this sentence narrows to the one specific gap Rehn's own study will fill.",
            "The sentence builds on, rather than contradicts, the prior research just summarized."
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
          {"domain":"Information & Ideas","skill":"Central Ideas","difficulty":"medium","type":"mc","text":"\"The city's transit authority spent a decade lobbying for a new rail line, only to see ridership fall short of projections within its first year of operation, even as traffic on the parallel highway continued to worsen.\"<br><br>Which choice best states the main idea of the text?","choices":["Highway traffic decreased after the rail line opened.","The transit authority never wanted the rail line built.","A long-sought transit project underperformed expectations despite an apparent need for it.","The rail line was a complete success by every measure."],"correct":2,"choiceNotes":[
            "The text states highway traffic continued to worsen, not decrease.",
            "A decade of lobbying for the project contradicts not wanting it built.",
            "Correct. This captures both the underperformance and the persisting need (worsening highway traffic) that make the shortfall notable.",
            "Falling short of projections is not a complete success."
          ]},
          {"domain":"Information & Ideas","skill":"Central Ideas","difficulty":"hard","type":"mc","text":"\"The translator chose to render the poem's central metaphor literally rather than adapting it to an equivalent image in the target language, a decision some reviewers praised as faithful and others criticized as alienating to readers unfamiliar with the original culture.\"<br><br>Which choice best states the main idea of the text?","choices":["Literal translation is always superior to adaptation.","A translation choice was praised by some as faithful and criticized by others as inaccessible, reflecting a genuine tradeoff.","All reviewers agreed the translation was a failure.","The poem's central metaphor was removed entirely from the translation."],"correct":1,"choiceNotes":[
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
          {"domain":"Information & Ideas","skill":"Command of Evidence","difficulty":"medium","type":"mc","text":"Claim: A city's new noise ordinance reduced noise complaints in residential neighborhoods.<br><br>Which finding, if true, would most directly support this claim?","choices":["The ordinance also addressed unrelated zoning regulations.","Recorded noise complaints in residential areas dropped 40% in the year after the ordinance took effect, while complaints in unaffected commercial areas stayed flat.","The ordinance was more expensive to enforce than city officials expected.","Residents were surveyed about their opinion of the mayor."],"correct":1,"choiceNotes":[
            "Unrelated zoning content doesn't provide evidence about noise complaints specifically.",
            "Correct. A direct before/after complaint comparison, with an unaffected control group, most directly supports a causal claim about noise complaints.",
            "Enforcement cost has no bearing on whether complaints actually decreased.",
            "Opinions about the mayor are unrelated to noise complaint data."
          ]},
          {"domain":"Information & Ideas","skill":"Command of Evidence","difficulty":"hard","type":"mc","text":"A researcher claims a particular medieval manuscript was produced by more than one scribe.<br><br>Which discovery would most directly support this claim?","choices":["The manuscript was found in a monastery known for producing many texts.","The manuscript's pages are made of the same type of parchment throughout.","Handwriting analysis reveals distinct, consistent differences in letterforms across different sections of the manuscript.","The manuscript is written entirely in the same language throughout."],"correct":2,"choiceNotes":[
            "A monastery's general productivity doesn't establish how many scribes worked on this specific manuscript.",
            "Uniform parchment suggests a single production batch, not multiple scribes.",
            "Correct. Consistent, distinct handwriting differences between sections directly indicate multiple scribes were involved.",
            "A single consistent language doesn't indicate anything about the number of scribes."
          ]},
          {"domain":"Information & Ideas","skill":"Quantitative Evidence","difficulty":"hard","type":"mc","text":"A study tracked 800 patients over five years: 208 who took a new medication reported significant symptom improvement, compared to 96 of 400 patients in a control group who received a placebo.<br><br>Which choice most accurately interprets the data?","choices":["The medication cured all patients who took it.","The placebo group showed no improvement whatsoever.","Every patient in the study took the new medication.","The medication group's improvement rate (26%) was higher than the placebo group's rate (24%), a difference researchers would need to evaluate for statistical significance."],"correct":3,"choiceNotes":[
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
          {"domain":"Standard English Conventions","skill":"Sentence Boundaries","difficulty":"medium","type":"mc","text":"The renovation crew discovered structural damage behind the drywall, ______ the project's timeline had to be extended by several months.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["however","therefore","being that","so"],"correct":3,"choiceNotes":[
            "\"However\" is a conjunctive adverb; using it after only a comma creates a comma splice.",
            "\"Therefore\" is also a conjunctive adverb; using it after only a comma creates a comma splice.",
            "\"Being that\" is a nonstandard, informal substitute for \"because\" and is not used in formal Standard English.",
            "Correct. A comma followed by the coordinating conjunction \"so\" properly joins the two independent clauses."
          ]},
          {"domain":"Standard English Conventions","skill":"Sentence Boundaries","difficulty":"hard","type":"mc","text":"The satellite transmitted data flawlessly for six years ______ a single software update, pushed without adequate testing, caused it to lose contact with mission control permanently.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["but","or","until","and"],"correct":2,"choiceNotes":[
            "\"But\" would suggest a contrast, but the second clause is a consequence in a timeline, not a contradiction.",
            "\"Or\" would present the two clauses as alternatives, which doesn't fit a sequence of events that both happened.",
            "Correct. \"Until\" precisely shows that the software update marked the end of six years of flawless transmission.",
            "\"And\" treats the two events as merely additive, losing the sense that the update caused the transmission to end."
          ]},
          {"domain":"Standard English Conventions","skill":"Subject-Verb Agreement","difficulty":"hard","type":"mc","text":"Neither the committee members nor the chairperson ______ aware of the funding shortfall until the annual audit.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["have been","was","were","are"],"correct":1,"choiceNotes":[
            "\"Have been\" is plural and present perfect, matching neither the required singular agreement nor the past tense.",
            "Correct. In a \"neither...nor\" construction, the verb agrees with the closer subject, \"the chairperson\" (singular), so \"was\" is correct.",
            "\"Were\" would agree with the plural \"committee members,\" but in \"neither...nor\" constructions the verb must agree with the nearer subject, which is singular here.",
            "\"Are\" is present tense, which doesn't fit the past-tense context (\"until the annual audit\")."
          ]},
          {"domain":"Standard English Conventions","skill":"Pronouns & Apostrophes","difficulty":"hard","type":"mc","text":"Each of the researchers submitted ______ individual analysis before the team compiled a single unified report.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["they're","its","it's","their"],"correct":3,"choiceNotes":[
            "\"They're\" is a contraction of \"they are,\" not a possessive form.",
            "\"Its\" is a singular, non-personal possessive pronoun and doesn't fit reference to a person.",
            "\"It's\" is a contraction of \"it is,\" not a possessive form at all.",
            "Correct. \"Their\" is the possessive pronoun that agrees with \"each of the researchers,\" referring back to the individual researchers."
          ]},
          {"domain":"Standard English Conventions","skill":"Verb Tense & Sequence","difficulty":"hard","type":"mc","text":"By the time historians began cataloguing the shipwreck's contents, deep-sea currents ______ many of the smaller artifacts miles from the original site.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["had scattered","have scattered","scatter","will have scattered"],"correct":0,"choiceNotes":[
            "Correct. The past perfect \"had scattered\" shows the scattering occurred before the cataloguing began, an earlier past action relative to another past action.",
            "\"Have scattered\" is present perfect, which doesn't fit a sequence of two past events.",
            "\"Scatter\" is present tense and doesn't fit the past-tense context at all.",
            "\"Will have scattered\" is future perfect, which doesn't fit a sentence describing past events."
          ]},
          {"domain":"Standard English Conventions","skill":"Parallel Structure","difficulty":"medium","type":"mc","text":"The city's revitalization plan calls for widening the sidewalks, planting new trees along Main Street, and ______.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["installation of bike lanes is planned","installing bike lanes","to install bike lanes","bike lanes will be installed"],"correct":1,"choiceNotes":[
            "This shifts to a noun phrase with a separate verb, breaking the parallel -ing structure.",
            "Correct. \"Installing\" matches the -ing form of \"widening\" and \"planting,\" maintaining parallel structure.",
            "The infinitive \"to install\" doesn't match the -ing form used by the other two items in the list.",
            "This shifts to a full passive clause, breaking the parallel list structure."
          ]},
          {"domain":"Standard English Conventions","skill":"Relative Pronouns","difficulty":"hard","type":"mc","text":"The manuscript, ______ authorship remained disputed for nearly two centuries, was finally attributed to a little-known monk through handwriting analysis.<br><br>Which choice completes the text so that it conforms to the conventions of Standard English?","choices":["who","that","whose","which"],"correct":2,"choiceNotes":[
            "\"Who\" is used for people, not for an inanimate object like a manuscript.",
            "\"That\" doesn't indicate possession and is also typically used for essential, not comma-set-off, clauses.",
            "Correct. \"Whose\" correctly shows possession (the manuscript's authorship) while introducing the nonessential clause.",
            "\"Which\" doesn't indicate possession the way \"whose\" does; it would need a different construction to convey \"its authorship.\""
          ]}
        ]
      }
    }
  }
];

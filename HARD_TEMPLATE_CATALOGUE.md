# Hard-Template Catalogue

Ten adversarial review rounds blocked 129 of 179 generated items. In round after round the
same verdict came back: **the bank already contains this template at `hard`, and the
candidate deleted the step that earned the rating.**

That is a solvable problem. The reviewers, between them, identified which templates the
bank actually rates hard *and why*. This is that list. Generate **by** these shapes —
run backwards, or with a parameter added — rather than inventing shapes and hoping.

**The three moves that turn a medium template hard**, observed across every skill:

1. **Run it backwards.** Given the result, recover an input. (Bank-medium: "two points →
   slope." Bank-hard: "slope and one point → the other point's coordinate.")
2. **Put a parameter where a number was**, and make it reach the answer. A symbolic
   constant that cancels is decorative; the bank's hard versions force it into the result.
3. **Withhold one quantity** so it must be derived before the main work starts.

And the three that do **not**: chaining extra steps, adding decorative conditions, or
dressing the same arithmetic in a new context.

---

## Algebra

**Linear Equations in One Variable**
- Integer-parameter divisor constraint — `x(r − 9) + 4 = 19x + 27`, solution must be an integer
- Fractional coefficients on both sides — `3(kx + 13) = (48/17)x + 36`; `2(kx − n) = −(28/15)x − (36/19)`
- *Everything else in this skill the bank rates easy or medium.* Only 33 of its 151 items are hard — the lowest proportion in the bank.

**Linear Equations in Two Variables**
- A parameter inside the point coordinates — three points involving `k` and `n`, slope given, find `k + n`
- Perpendicular through a point, then the **new** line's intercept — `4x + 6y = 15`, perpendicular through (0, −4)
- Translation of a **standard-form** line, then an intercept — `9x − 10y = 19` shifted down 4
- A table whose constant is **additive** and whose slope is fractional — `x = −34, −17, 0` against `y = t, t + 23, t + 46`, so `t` survives into the answer

**Systems of Two Linear Equations**
- Symbolic coefficient swap — `ax + by = 7 / bx + ay = 11`; `3x + ky = 12 / kx + 3y = 12`
- Fractional coefficients for infinitely-many — `(2/5)x + (7/5)y = 2/7 / gx + ky = 5/2`, where the constant turns out not to be needed
- Intersection with **one coordinate withheld** — "intersect at (4, y)", "(q, 19)"
- Mixture or alloy with a **final multiplication** past the recovered quantity

**Linear Inequalities**
- Feasibility band plus an integer condition — `y > 2x − 5 / y < −x + 4`, x an integer, greatest x
- Compound inequality with a sign flip **and** fractional endpoints
- At-least-N count against a weight or cost cap, maximising the expensive item

## Advanced Math

**Equivalent Expressions**
- Coefficient of a single power in a product of two polynomials
- `(3x − 23)(19x + 6) → ax² + bx + c`, find `b`
- `6x⁴ + 31x² + 35 → (3x² + a)(2x² + b)`
- Radical and fractional-exponent products — `6·⁵√(3⁵x⁴⁵)·⁸√(2⁸x) = ax^b`
- Partial fractions — `(29x + 102)/(x(x + 51)) = p/x + w/(x + 51)`
- Factor-pair search for an extremum — `−x² + bx − 676 = 0`, greatest possible `b`

**Nonlinear Functions**
- `f(x) = 4x² + 64x + 262`, `g(x) = f(x + 5)` — asked for **where** the minimum occurs, not its value
- A bounded exponential — `f(x) = 24 − 6(1/4)^x`, least `k` with `f(x) < k`
- `g(x) = (x + 14)(t − x)` families
- `h(x) = pq^x` with a percent-growth condition
- Rewriting `(1.84)^(x/4)` as `(1 + p/100)^x`

**Nonlinear Equations**
- Discriminant with a parameter — `9x² + (2b − 5)x + 2027 = 0`, no real solutions, least `b`
- `−4x² + bx − 81 = 0`, two distinct real solutions, `b` a positive integer
- Vieta with parameterised coefficients — `36x² + (11r + 17s)x + rs = 0`; `91x² + (91m + n)x + mn = 0`
- Factored form mixing a repeated root and a fractional root — `5(3x − 4)²(2x − 7)(2x − k) = 0`
- Sign conditions bracketing a parameter — `g(x) = (3/5)(2x − p)(x − q)`, `g(8) > 0`, `g(13) < 0`
- Radical with an offset, asked for the **solution set** — `√(2x + 6) + 4 = x + 3`

## Problem-Solving and Data Analysis

**Percentages**
- Reverse from a residual count to the whole — 15% / 45% / 25%, remaining 6 individuals
- Two chained multipliers reported against the first quantity — "`a` is 70% less than `b`, `c` is 80% greater than `a`, `c` is how many times `b`"
- Two operations in **opposite** directions — sale price 80% less than list *and* 30% greater than cost
- Percent increase given, original count to be recovered

**Ratios, Rates, Units**
- Density → mass → price (four bank instances, all hard)
- Three-category chained multipliers finishing in a probability to the nearest tenth

**One-Variable Data**
- Combined mean, and especially its **inversion** (recover a group size)
- Frequency-table mean-vs-median turning on a symmetry
- Constraint search on a data set under mean and range bounds
- Standard-deviation comparison among sets deliberately sharing a mean and a range

**Probability / Two-Variable Data**
- Conditional probability where the condition removes a row **and** a column
- A stated probability fixing one category, a ratio splitting the rest
- Line of best fit under a transformation of every output value

## Geometry and Trigonometry

- Similar solids — volume ratio is the cube of the length ratio, area ratio the square; run in **both** directions
- Right square prism: height 14, volume 2,016, recover the base edge
- Cube with an inscribed sphere, volume of the space left over
- Cylinder factorisation — "a second cylinder has 392 times the volume; which radius and height?"
- Two-variable complete-the-square for a circle's centre, then a distance
- Tangent perpendicular to a radius
- Equilateral triangle inscribed in a circle, region inside the circle and outside the triangle
- Altitude to the hypotenuse run **backwards** — given BD and AD, find DC
- Rectangle with a given diagonal and a side relation, forcing a quadratic

---

## Skills with little headroom

Three skills have so few hard items that they cannot support a large original set:
Linear Equations in One Variable (33 hard of 151), Two-Variable Data (15 of 91), and
Inference from Sample Statistics (5 of 33). The allocation in `gen/alloc.json` now
reflects this. Asking these skills for more than they contain is what produced the
worst rounds — 1 pass in 32, and 0 in 23.

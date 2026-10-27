# Demo script

## 60–90 second guided campus demo

“I’ll start with the central idea: the cyan analytical curve is Weibull survival, while the orange step curve is one reproducible Monte Carlo population. At the initial time, both surviving and failed tiles are visible, so we can compare probability with actual sampled outcomes.

First, I’ll move time. Notice that the seed does not change—time only reveals which existing lifetimes have elapsed. Next, I’ll change beta. Below one, the mathematical hazard decreases; at one it is constant and becomes the exponential case; above one it increases. Those are curve-shape interpretations, not diagnoses of physical failure mechanisms.

I can select a tile to show its sampled lifetime and current status. The package geometry is deliberately illustrative and tile adjacency has no statistical meaning. Then I’ll press Resample: that changes the seed and creates a genuinely new trial, while identical inputs remain repeatable.

This could motivate conversations about lifetime-data analysis, test planning, and uncertainty, but it has no fitted field data, confidence intervals, censoring, or equipment physics. It does not predict ASML systems, semiconductor yield, or real component reliability. AI assisted development; I remain responsible for the mathematics, assumptions, validation, and implementation review.”

## 45-second recruiter version

“This is my Semiconductor Reliability Lab, an educational browser simulation built with React, TypeScript, and Three.js. Each tile represents an independent component lifetime sampled from a Weibull distribution. I can change the shape, scale, population size, seed, or time, then compare the analytical survival curve with the finite Monte Carlo sample. The simulation is reproducible: moving time never redraws the sample, and Resample explicitly changes the seed. The 3D chip is intentionally abstract—it does not claim to model ASML equipment, semiconductor physics, yield, or real field reliability. AI assisted my implementation, while I remain responsible for the model, assumptions, validation, design decisions, and explaining every result.”

## 90-second mathematical version

“I model each component lifetime as IID Weibull with positive shape beta and scale eta. The survival function is exp of negative t over eta to the beta, the CDF is one minus survival, and the hazard is beta over eta times t over eta to beta minus one. I do not evaluate hazard at exactly zero because it diverges there when beta is below one.

For sampling, I start with a seeded uniform value strictly between zero and one. Inverting the CDF gives T equals eta times negative log of one minus U to the power one over beta. The implementation stores the negative-log term—the unit-exponential draw—once per seed and component count. That detail matters: changing time only reclassifies the existing lifetimes, and changing beta or eta transforms the same random factors. Only Resample, the seed, or population size creates a new random trial.

The empirical curve is the count of lifetimes greater than time divided by N, so it must be monotone nonincreasing. Tests cover boundary identities, the exponential special case, deterministic sampling, stable draws, monotonicity, and large-sample convergence. The visual tile positions are not spatial data, and all time values are arbitrary units. This is an educational probability model, not a physical reliability claim. AI helped accelerate implementation, but I own the mathematical choices, validation, review, and final explanation.”

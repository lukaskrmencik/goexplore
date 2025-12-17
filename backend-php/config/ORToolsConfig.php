<?php

return [
    //score weight * score is the penalty the solver gets for missing a point
    "score_weight" => 1000,
    
    //the penalty the solver receives for each meter that deviates from the target distance of the route
    "distance_penalty" => 50,

    # To avoid uneven point distribution. For any deviation from the ideal distance we will not penalize the solver.
    "balanced_threshold_multiplier" => 1.6,

    # How much will we penalize the solver for an uneven route
    "balanced_penalty_strength" => 0.5,

    //time limit for how long the solver should search for a route (in seconds)
    "time_limit" => 1
];
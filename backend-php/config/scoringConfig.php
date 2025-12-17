<?php

return [
    "camps" => [
		"data" => [
			"weight" => 0.3,
			"image"    				=>  ["weight" => 0.1],
			"operating_time" 		=>  ["weight" => 0.1],
			"web" 					=>  ["weight" => 0.1],
			"review" 				=>  ["weight" => 0.4, "min" => 0, "max" => 10],
			"review_count" 			=>	["weight" => 0.3],
		],
		"distance" => [
			"weight" => 0.7,
		]
	],
	
	"poi" => [
		"data" => [
			"weight" => 0.8,
			"review" 				=> 	["weight" => 0.4, "min" => 0, "max" => 5],
			"review_count" 			=>  ["weight" => 0.3],
			"article_popularity" 	=> 	["weight" => 0.2, "min" => 0, "max" => 100],
			"has_opening_hours"  	=> 	["weight" => 0.05],
			"website"				=> 	["weight" => 0.05],
		],
		"distance" => [
			"weight" => 0.2,
		],
		"CLUSTER_BONUS_THRESHOLD_PERCENT" => 1,
		"CLUSTER_BONUS_WEIGHT" => 0.1
	],


];
<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Redis;

class JobHelper
{
    public static function setJobProgress($jobId, $percent, $status)
    {
        $expires = intval(env("REDIS_JOB_EXPIRES"));

        if($percent !== null){
            Redis::setex("job_progress:{$jobId}", $expires, $percent);
        }

        if($status !== null){
            Redis::setex("job_status:{$jobId}", $expires, $status);
        }
    }

    public static function setJobRouteId($jobId, $routeId)
    {
        $expires = intval(env("REDIS_JOB_EXPIRES"));
        Redis::setex("job_route:{$jobId}", $expires, $routeId);
    }

    public static function getJobRouteId($jobId)
    {
        return intval(Redis::get("job_route:{$jobId}") ?? null);
    }

    public static function getJobProgress($jobId)
    {
        $progress = intval(Redis::get("job_progress:{$jobId}") ?? 0);
        $status = Redis::get("job_status:{$jobId}") ?? "None";
        return [
            "progress" => $progress,
            "status" => $status
        ];
    }
}
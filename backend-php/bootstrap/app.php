<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\JwtMiddleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'jwt' => JwtMiddleware::class
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return $request->is('api/*');
        });

        $exceptions->render(function (Throwable $e, Request $request) {

            if ($request->is('api/*')) {

                $statusCode = 400;
                $errors = [];

                if ($e instanceof ValidationException) {
                    $statusCode = 422;
                    $errors = $e->errors();
                } elseif ($e instanceof AuthenticationException) {
                    $statusCode = 401;
                } elseif ($e instanceof AuthorizationException) {
                    $statusCode = 403;
                } elseif ($e instanceof ModelNotFoundException) {
                    $statusCode = 404;
                } elseif ($e instanceof HttpException) {
                    $statusCode = $e->getStatusCode();
                } else {
                    $statusCode = 500;
                }

                return response()->json([
                    'status' => 'error',
                    'status_code' => $statusCode,
                    'error_message' => $e->getMessage() ?: 'Bad Request',
                    'errors' => $errors,
                ], $statusCode);
            }

            return false;
        });

    })->create();

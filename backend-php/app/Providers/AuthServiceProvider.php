<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

// models
use App\Models\Camp\Camp;
use App\Models\Camp\CampAccommodationType;
use App\Models\Camp\CampEquipment;
use App\Models\Camp\CampService;
use App\Models\Equipment\GeneralEquipment;
use App\Models\Equipment\MyEquipment;
use App\Models\Poi\Poi;
use App\Models\Poi\PoiCategory;
use App\Models\Poi\PoiLabel;
use App\Models\Poi\PoiOpeningHourDay;
use App\Models\Poi\PoiOpeningHourMonth;
use App\Models\Poi\PoiTag;
use App\Models\Route\Route;
use App\Models\User\User;
use App\Models\Route\Waypoint;
use App\Models\Route\RouteCamp;
use App\Models\Route\RouteEquipment;
use App\Models\Route\RoutePoi;
use App\Models\Route\RouteUser;

// Policies
use App\Policies\Camp\CampPolicy;
use App\Policies\Camp\CampAccommodationTypePolicy;
use App\Policies\Camp\CampEquipmentPolicy;
use App\Policies\Camp\CampServicePolicy;
use App\Policies\Equipment\GeneralEquipmentPolicy;
use App\Policies\Equipment\MyEquipmentPolicy;
use App\Policies\Poi\PoiPolicy;
use App\Policies\Poi\PoiCategoryPolicy;
use App\Policies\Poi\PoiLabelPolicy;
use App\Policies\Poi\PoiOpeningHourDayPolicy;
use App\Policies\Poi\PoiOpeningHourMonthPolicy;
use App\Policies\Poi\PoiTagPolicy;
use App\Policies\Route\RoutePolicy;
use App\Policies\User\UserPolicy;
use App\Policies\Route\WaypointPolicy;
use App\Policies\Route\RouteCampPolicy;
use App\Policies\Route\RouteEquipmentPolicy;
use App\Policies\Route\RoutePoiPolicy;
use App\Policies\Route\RouteUserPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Camp::class => CampPolicy::class,
        CampAccommodationType::class => CampAccommodationTypePolicy::class,
        CampEquipment::class => CampEquipmentPolicy::class,
        CampService::class => CampServicePolicy::class,
        GeneralEquipment::class => GeneralEquipmentPolicy::class,
        MyEquipment::class => MyEquipmentPolicy::class,
        Poi::class => PoiPolicy::class,
        PoiCategory::class => PoiCategoryPolicy::class,
        PoiLabel::class => PoiLabelPolicy::class,
        PoiOpeningHourDay::class => PoiOpeningHourDayPolicy::class,
        PoiOpeningHourMonth::class => PoiOpeningHourMonthPolicy::class,
        PoiTag::class => PoiTagPolicy::class,
        Route::class => RoutePolicy::class,
        User::class => UserPolicy::class,
        Waypoint::class => WaypointPolicy::class,
        RouteCamp::class => RouteCampPolicy::class,
        RouteEquipment::class => RouteEquipmentPolicy::class,
        RoutePoi::class => RoutePoiPolicy::class,
        RouteUser::class => RouteUserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

    }
}

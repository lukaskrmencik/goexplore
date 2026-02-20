# SKELETON PROJEKTU GOEXPLORE
Generováno: 2. února 2026
Tento soubor obsahuje kompletní strukturu projektu s inline popisky.

.
├── GOEXPLORE_DESIGN_SYSTEM.md  # 🎨 HLAVNÍ DESIGN MANUÁL. Definuje barvy (Emerald/Slate), typografii, mobile-first přístup a vzhled komponent.
├── PROJECT_SKELETON.md         # 📄 Tento soubor se strukturou projektu.
├── config                      # ⚙️ Konfigurační soubor (env šablona).
├── config copy                 # ⚙️ Záloha konfigurace.
├── config copy 2               # ⚙️ Záloha konfigurace.
├── postgres-login              # 🔑 Pomocný soubor s přihlašovacími údaji k DB.
├── test.php                    # 🧪 Jednoduchý PHP skript pro rychlé testování funkčnosti backendu.
├── tools                       # 🛠️ Pomocné nástroje.
│   └── adminer.php             # 🗄️ Webové rozhraní pro správu databáze (SQL klient).
├── frontend                    # ⚛️ REACT FRONTEND APLIKACE (Vite + TypeScript + TailwindCSS).
│   ├── index.html              # 🚪 Vstupní HTML bod aplikace.
│   ├── package.json            # 📦 Definice závislostí (React 19, Leaflet, Axios, Tailwind 4) a skriptů.
│   ├── vite.config.ts          # ⚙️ Konfigurace Vite build nástroje.
│   ├── tsconfig.json           # ⚙️ Konfigurace TypeScriptu (root).
│   ├── tsconfig.app.json       # ⚙️ Konfigurace TS pro aplikaci.
│   ├── tsconfig.node.json      # ⚙️ Konfigurace TS pro Node.js prostředí.
│   ├── tailwind.config.js      # 🎨 Konfigurace TailwindCSS (pokud se používá, v v4 může být v CSS).
│   ├── public                  # 📂 Statické soubory přístupné veřejně.
│   │   └── vite.svg            # Ikonka Vite.
│   └── src                     # 🧠 ZDROJOVÉ KÓDY FRONTENDU.
│       ├── main.tsx            # 🚀 Vstupní bod React aplikace (mountuje App do DOMu).
│       ├── index.css           # 🎨 Globální styly a Tailwind importy.
│       ├── app                 # 📦 Kořenové komponenty aplikace.
│       │   ├── App.tsx         # Hlavní obalovací komponenta (Providers, Layout).
│       │   └── router.tsx      # 🚦 Definice routování (URL -> Page komponenty).
│       ├── config              # ⚙️ Konstanty a konfigurace.
│       │   └── mapConfig.ts    # Nastavení mapy (startovní pozice, zoom, API klíče).
│       ├── services            # 🔌 Komunikace s API (Data Fetching).
│       │   ├── apiClient.ts    # Instance Axiosu s interceptorem pro přidávání JWT tokenu.
│       │   ├── routesApiService.ts # Metody pro práci s trasami (CRUD, calculate).
│       │   ├── geocodingService.ts # Vyhledávání adres a souřadnic (Mapy.cz/OpenCage).
│       │   └── testToken.ts    # Pomocný soubor pro testování tokenů.
│       ├── types               # 📝 TypeScript definice (Interfaces/Types).
│       │   ├── routes.ts       # Typy pro Route, RoutePoi, Camp, RouteMode.
│       │   ├── users.ts        # Typy pro User, Profile.
│       │   ├── equipment.ts    # Typy pro vybavení (General/My).
│       │   ├── editor.ts       # Typy pro stavy editorů.
│       │   ├── general.ts      # Obecné typy.
│       │   └── wizard.ts       # Typy pro průvodce vytvořením trasy.
│       ├── utils               # 🛠️ Pomocné funkce.
│       │   ├── date.ts         # Formátování a práce s daty.
│       │   ├── geo.ts          # Geografické výpočty (vzdálenosti, konverze).
│       │   ├── mapEditor.ts    # Logika pro editor mapy.
│       │   ├── mapIcons.ts     # Definice ikonek pro mapu (Leaflet divIcons).
│       │   └── wizardNav.ts    # Logika navigace v průvodci.
│       ├── components          # 🧩 Znovupoužitelné UI komponenty.
│       │   ├── layout          # Komponenty rozložení stránky.
│       │   │   └── MainLayout.tsx # Obaluje obsah, přidává Header/Sidebar/BottomBar.
│       │   └── ui              # Základní UI prvky (Design System).
│       │       ├── Badge.tsx   # Štítek.
│       │       ├── Button.tsx  # Tlačítko (Primary/Secondary).
│       │       ├── Card.tsx    # Karta pro obsah.
│       │       ├── Input.tsx   # Vstupní pole.
│       │       └── WizardStepper.tsx # Ukazatel kroku v průvodci.
│       ├── features            # 📦 HLAVNÍ FUNKČNÍ MODULY (Feature-based).
│       │   ├── home            # Domovská stránka.
│       │   ├── navigation      # Navigační prvky aplikace.
│       │   │   ├── MainLayout.tsx # (Duplicita? Zkontrolovat) Layout navigace.
│       │   │   ├── hooks       # Logika navigace.
│       │   │   │   └── useNavigationLogic.ts
│       │   │   └── components
│       │   │       ├── BottomBar.tsx   # 📱 Spodní lišta pro mobil.
│       │   │       ├── MobileHeader.tsx # 📱 Hlavička pro mobil.
│       │   │       ├── Sidebar.tsx     # 💻 Boční panel pro desktop.
│       │   │       └── NavigationItems.tsx # Seznam odkazů v navigaci.
│       │   ├── leafletMap      # Práce s mapou Leaflet.
│       │   │   └── components
│       │   │       └── LeafletMap.tsx # Wrapper nad React-Leaflet mapou.
│       │   ├── createRoute     # 🗺️ Wizard pro novou trasu.
│       │   │   ├── hooks
│       │   │   │   └── useCreateRoute.ts # Hlavní stavový automat wizardu.
│       │   │   └── components
│       │   │       ├── RouteInitStep.tsx # 1. krok: Název a lokace.
│       │   │       └── RouteSummary.tsx  # Poslední krok: Přehled a uložení.
│       │   ├── mapEditor       # Komplexní logika editoru mapy.
│       │   │   ├── hooks
│       │   │   │   ├── useMapEditor.ts # Logika editace mapy.
│       │   │   │   └── usePois.ts      # Načítání POI bodů.
│       │   │   └── components
│       │   │       └── map     # Mapové elementy.
│       │   │           ├── Map.tsx         # Mapa editoru.
│       │   │           ├── CampMarker.tsx  # Značka kempu.
│       │   │           ├── ClusterMarker.tsx # Shluk bodů.
│       │   │           ├── PoiMarker.tsx   # Značka bodu zájmu.
│       │   │           └── RoutePolyline.tsx # Čára trasy.
│       │   └── editors         # ✏️ Editory specifických částí trasy.
│       │       ├── routeAxisEditor # Editor osy trasy (kreslení).
│       │       │   ├── RouteAxisEditor.tsx
│       │       │   ├── hooks
│       │       │   │   └── useRouteAxis.ts
│       │       │   └── components
│       │       │       ├── EditorMarkers.tsx
│       │       │       ├── LocationSearch.tsx
│       │       │       ├── MapClickHandler.tsx # Klikání do mapy.
│       │       │       └── RoutePolyline.tsx
│       │       ├── routeDateEditor # Editor termínu.
│       │       │   ├── RouteDateEditor.tsx
│       │       │   └── hooks
│       │       │       └── useRouteDate.ts
│       │       ├── routeConfigurationEditor # Nastavení parametrů trasy.
│       │       │   ├── RouteConfigurationEditor.tsx
│       │       │   └── hooks
│       │       │       └── useRouteConfiguration.ts
│       │       ├── routeEquipmentEditor # Editor vybavení.
│       │       │   ├── RouteEquipmentEditor.tsx
│       │       │   ├── hooks
│       │       │   │   └── useRouteEquipment.ts
│       │       │   └── components
│       │       │       ├── EquipmentItem.tsx
│       │       │       └── EquipmentList.tsx
│       │       ├── routeUsersEditor # Zvaní uživatelů.
│       │       │   ├── RouteUsersEditor.tsx
│       │       │   ├── hooks
│       │       │   │   └── useRouteUsers.ts
│       │       │   └── components
│       │       │       ├── InviteBox.tsx
│       │       │       └── UserList.tsx
│       │       ├── routesListEditor # Seznam tras.
│       │       │   ├── RoutesListEditor.tsx
│       │       │   ├── hooks
│       │       │   │   └── useRoutesList.ts
│       │       │   └── components
│       │       │       └── RouteCard.tsx
│       │       ├── equipmentEditor # Editor vlastního vybavení.
│       │       │   └── EquipmentEditorPlaceholder.tsx
│       │       └── userAccountEditor # Nastavení účtu.
│       │           └── UserAccountEditorPlaceholder.tsx
│       └── pages               # 📄 Hlavní stránky (Views).
│           ├── HomePage.tsx    # Nástěnka.
│           ├── CreateRoutePage.tsx # Stránka průvodce trasou.
│           ├── MapEditorPage.tsx   # Stránka mapového editoru.
│           ├── EquipmentPage.tsx   # Stránka vybavení.
│           ├── RoutesListPage.tsx  # Seznam mých tras.
│           └── UserAccountPage.tsx # Profil uživatele.
├── backend-php                 # 🐘 LARAVEL BACKEND API.
│   ├── composer.json           # 📦 PHP závislosti.
│   ├── artisan                 # 🛠️ CLI nástroj Laravelu.
│   ├── public                  # 📂 Public složka webserveru.
│   │   ├── index.php           # Vstupní bod backendu.
│   │   └── ...                 # (Laravel boilerplate).
│   ├── bootstrap               # (Laravel boilerplate - startování app).
│   ├── vendor                  # (Laravel boilerplate - knihovny).
│   ├── storage                 # (Laravel boilerplate - logy, cache, soubory).
│   ├── tests                   # (Laravel boilerplate - testy).
│   │   └── ...
│   ├── config                  # ⚙️ Konfigurace backendu.
│   │   ├── app.php             # Hlavní nastavení app.
│   │   ├── database.php        # Nastavení DB připojení.
│   │   ├── ORToolsConfig.php   # 🔧 Vlastní config pro Python optimalizátor.
│   │   ├── scoringConfig.php   # 🔧 Nastavení skórování bodů.
│   │   └── ...                 # (Další standardní Laravel configy).
│   ├── database                # 🗄️ Databázová vrstva.
│   │   ├── database.sqlite     # Lokální SQLite DB (pokud se používá).
│   │   ├── migrations          # 📝 Definice struktury tabulek (schéma).
│   │   │   ├── create_users_table.php
│   │   │   ├── create_routes_table.php
│   │   │   ├── create_pois_table.php
│   │   │   ├── create_camps_table.php
│   │   │   └── ... (další migrace pro vybavení a propojení).
│   │   ├── seeders             # ☘️ Naplnění databáze daty.
│   │   │   └── DatabaseSeeder.php
│   │   └── factories           # Generátory testovacích dat.
│   ├── routes                  # 🚦 Definice API endpointů.
│   │   ├── api.php             # 🔑 HLAVNÍ API ROUTES (volané frontendem).
│   │   ├── web.php             # Webové routy (většinou nepoužité pro API).
│   │   └── console.php         # Příkazy konzole.
│   └── app                     # 🧠 HLAVNÍ LOGIKA BACKENDU.
│       ├── Models              # 🗄️ Eloquent modely (reprezentace tabulek).
│       │   ├── User            # Modely uživatele.
│       │   │   ├── User.php
│       │   │   └── UsersPreference.php
│       │   ├── Route           # Modely trasy.
│       │   │   ├── Route.php   # Hlavní entita trasy.
│       │   │   ├── RouteCamp.php # Kempy na trase.
│       │   │   ├── RoutePoi.php  # Body zájmu na trase.
│       │   │   ├── RouteEquipment.php
│       │   │   └── Waypoint.php
│       │   ├── Camp            # Modely kempů.
│       │   │   └── Camp.php
│       │   ├── Poi             # Modely bodů zájmu.
│       │   │   └── Poi.php
│       │   └── Equipment       # Modely vybavení.
│       ├── Http                # 🌐 HTTP vrstva.
│       │   ├── Middleware      # Filtry požadavků.
│       │   │   └── JwtMiddleware.php # Ověření JWT tokenu.
│       │   └── Controllers     # 🎮 Obsluha požadavků (Business logika).
│       │       ├── User        # Správa uživatelů.
│       │       │   ├── AuthController.php # Login, Register, Logout.
│       │       │   └── UserController.php # Profil.
│       │       ├── Route       # Správa tras.
│       │       │   ├── RouteController.php # 🚀 Klíčový controller. Vytváří trasy a volá Python výpočty.
│       │       │   ├── RouteEquipmentController.php
│       │       │   ├── RouteUserController.php
│       │       │   └── WaypointController.php
│       │       ├── Camp        # Správa kempů.
│       │       ├── Poi         # Správa POI.
│       │       └── Equipment   # Správa vybavení.
│       └── Services            # 🛠️ Pomocné služby.
│           ├── CalculateRouteService.php # Logika pro volání výpočtu trasy.
│           └── GeoService.php  # Geografické operace.
├── backend-py                  # 🐍 PYTHON SLUŽBA PRO VÝPOČTY (OR-Tools, NumPy).
│   ├── main.py                 # (Možný vstupní bod, ale spíše skripty volané z PHP).
│   ├── requirements.txt        # 📦 Seznam Python knihoven.
│   ├── venv                    # (Python virtuální prostředí - boilerplate).
│   └── app                     # 🧠 Zdrojové kódy Python backendu.
│       ├── main.py             # Vstupní bod aplikace.
│       ├── routes.py           # Definice endpointů (pokud běží jako server).
│       ├── models              # 📝 Pydantic modely (validace dat).
│       │   ├── general_models.py
│       │   ├── select_camps_models.py
│       │   └── select_poi_models.py
│       ├── services            # 🧮 Algoritmy optimalizace tras.
│       │   ├── camps_selection # Výběr nejlepších kempů.
│       │   │   ├── choose_camps.py # Hlavní logika výběru kempů.
│       │   │   └── divide_axis.py  # Rozdělení trasy na úseky.
│       │   └── poi_selection   # Výběr nejlepších bodů zájmu.
│       │       ├── choose_best_pois.py # Scoring a výběr POI.
│       │       ├── calc_full_route.py  # Finální sestavení trasy.
│       │       └── or_tools_solver.py  # 🔧 Wrapper nad Google OR-Tools (TSP/VRP solver).
│       └── utils               # 🛠️ Pomocné funkce.
│           └── general.py
└── db                          # 🗄️ DATABÁZOVÉ SOUBORY A EXPORTY.
    ├── camps_cz.db             # 🔦 Zdrojová SQLite databáze kempů (raw data).
    ├── export_postgres.sql     # 🐘 SQL dump pro import do PostgreSQL (finální struktura + data).
    └── sqlite_to_postgres_export_fixed.py # 🐍 Skript pro migraci dat z SQLite do Postgresu.

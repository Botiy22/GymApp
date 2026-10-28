# Smartwatch data in the iOS and Android apps

The web app cannot read Apple Watch, Wear OS, Garmin or other watch data. The screens that use it are already built: swim logging (Workout → cardio → Swimming) and the bike section (Workout → Ride). They talk to `js/wearable.js`, so the native apps only need to implement the bridge below. On the web, the screens show a short "available in the iOS/Android app" note.

Status: **contract implemented and tested in the web code with a simulated bridge; no native code exists yet.** The platform API names in the mapping tables are starting points taken from the vendors' documentation and must be checked against the SDK version used when the native apps are built.

## Transport

| Platform | JS → native | native → JS |
|---|---|---|
| iOS (WKWebView) | `window.webkit.messageHandlers.reppsyWearable.postMessage(obj)` | `webView.evaluateJavaScript("Wearable.receive(" + json + ")")` |
| Android (WebView) | `window.ReppsyWearableAndroid.postMessage(jsonString)` (`@JavascriptInterface`) | `webView.evaluateJavascript("Wearable.receive(" + json + ")", null)` |
| Capacitor | `Capacitor.Plugins.ReppsyWearable.request(obj)` (resolves with the reply) | plugin event `message` with the same objects |

`Wearable.platform()` picks the first one that exists. All messages carry `v: 1`.

## Requests (JS → native)

`{ v:1, id, method, params }`. Reply with `{ v:1, re:id, ok:true, result }` or `{ v:1, re:id, ok:false, error:{ code, message } }`. Error codes the app understands: `denied` (permission refused), `unavailable`, `timeout`, `native`. The app waits 20 s.

| method | params | result |
|---|---|---|
| `authorize` | `{ kinds:['swim'] }` or `['ride']` | `{ granted:true }` (ask only for what that kind needs) |
| `status` | `{}` | `{}`; then push a `status` message |
| `startLive` | `{ kind:'swim', pool:25 }` / `{ kind:'ride' }` | `{ session }`; then push `live` messages about once per second |
| `stopLive` | `{ kind }` | `{}`; then push the finished `workout` |
| `importWorkouts` | `{ kinds:['swim'], since:<ms>, limit:1 }` | `{ workouts:[workout, ...] }` newest first |

## Pushed messages (native → JS)

- `{ v:1, type:'status', device:{ name, kind }, authorized:['swim','ride'] }`
- `{ v:1, type:'live', session, kind, sample }`. The sample has `t` (ms), `hr` (bpm), `kcal` (active energy so far), `dist` (m), `laps`, `strokes`, `stroke` (`free|breast|back|fly|mixed`), `cadence` (rpm), `power` (W) and `speed` (m/s). Send only the fields you have.
- `{ v:1, type:'workout', workout }`. A workout has:
  - `kind`: `swim|ride|run|walk|strength|other`
  - `start`, `end` (ms), `device` (name)
  - `kcal`: **active** energy, not total
  - `dist` (m), `hr:{avg,max}`
  - swim only: `pool` (m), `laps:[{ stroke, dist, sec, strokes }]` and the total `strokes`
  - ride only: `moving` (s), `cadence`, `power:{avg,max}`

Everything is range-checked in `Wearable.cleanSample` / `cleanWorkout`; out-of-range values are dropped, not clamped.

## What the app does with it

- **Swim:** `Wearable.toSwim` turns the laps into lengths per stroke for the pool length, plus the duration. The form is filled in and stays editable. The watch's active kcal is stored as `cardio.wear.kcal` and **replaces** the MET estimate in `WorkoutEnergy.cardio`. The heart rate, stroke count and device are kept in `cardio.wear`.
- **Ride:** `Wearable.toRide` gives the stored ride shape (`src:'watch'`, hr/cadence/power). The ride's cycling entry carries the watch's active kcal in `wear`. Live `ride` samples feed the same live display and averages as Bluetooth sensors (`rideLive`, `Rides.sensor`) while a ride is being recorded.

## Platform mapping (verify against the current SDKs)

| Need | iOS HealthKit / watchOS | Android Health Connect / Wear OS |
|---|---|---|
| Permission | `HKHealthStore.requestAuthorization` | Health Connect permission contract |
| Pool swim workout | `HKWorkout`, activity type swimming, location pool, lap length metadata | `ExerciseSessionRecord` (pool swimming type), laps |
| Stroke per lap | swimming stroke style metadata on lap events | exercise segments by stroke |
| Strokes, distance | swimming stroke count, swimming distance quantities | `DistanceRecord`; stroke count where available |
| Heart rate | heart rate samples | `HeartRateRecord` |
| Active energy | active energy burned | `ActiveCaloriesBurnedRecord` |
| Cycling | cycling distance, cadence, power | `ExerciseSessionRecord` (biking), `SpeedRecord`, `PowerRecord`, cadence |
| Live data during the workout | a watchOS workout session/builder on the watch, sent to the phone (e.g. WatchConnectivity) | Wear OS Health Services exercise client on the watch, sent to the phone |

Live data needs a companion app on the watch (watchOS / Wear OS). Reading finished workouts from Health/Health Connect does not. Garmin, Polar and others usually sync into Apple Health / Health Connect, so the same import path covers them once they have synced.

## Testing without a watch

`tests/test_wearable.cjs` and `tests/test_swim_wearable_browser.py` install a fake `reppsyWearable` handler that answers like a native app. Use the same approach to check a native build: post the messages above from the native side and watch the swim form and the ride screen update.

'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
require('../js/rides.js');
const R = globalThis.Rides;

// A deterministic pseudo-random source so GPS noise is repeatable.
function noise(seed) { let x = seed; return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648 - 0.5; }; }
const north = (lat, metres) => lat + metres / 111195;

test('path encoding matches the published polyline example and round-trips', () => {
  const pts = [{ lat: 38.5, lon: -120.2 }, { lat: 40.7, lon: -120.95 }, { lat: 43.252, lon: -126.453 }];
  assert.equal(R.encodePath(pts), '_p~iF~ps|U_ulLnnqC_mqNvxq`@');
  assert.deepEqual(R.decodePath(R.encodePath(pts)), pts);
  const ints = [0, 5, 3, 3, -40, 1200, 1199];
  assert.deepEqual(R.decInts(R.encInts(ints)), ints);
});

test('distance and moving time stay accurate under GPS noise', () => {
  const s = R.start(0), rnd = noise(7); let lat = 47.5;
  for (let i = 1; i <= 600; i++) { lat = north(lat, 8); R.add(s, { lat: lat + rnd() * 3 / 111195, lon: 19.04 + rnd() * 3 / 75000, t: i * 1000, acc: 6, alt: 100 + i * 0.05 + rnd() }); }
  assert.ok(Math.abs(s.dist - 4800) < 4800 * 0.03, 'distance ' + s.dist);
  assert.ok(s.moving > 560 && s.moving <= 600, 'moving ' + s.moving);
  assert.ok(s.gain > 20 && s.gain < 36, 'gain ' + s.gain);
  assert.ok(s.maxSpd * 3.6 < 40, 'max speed ' + s.maxSpd * 3.6);
  // standing still with jitter adds almost nothing
  const before = s.dist;
  for (let i = 601; i <= 720; i++) R.add(s, { lat: lat + rnd() * 6 / 111195, lon: 19.04 + rnd() * 6 / 75000, t: i * 1000, acc: 10 });
  assert.ok(s.dist - before < 15, 'jitter ' + (s.dist - before));
});

test('weak fixes, glitches and paused time are not counted', () => {
  const s = R.start(0);
  R.add(s, { lat: 47, lon: 19, t: 1000, acc: 5 });
  assert.equal(R.add(s, { lat: north(47, 50), lon: 19, t: 2000, acc: 80 }), 'weak');
  assert.equal(R.add(s, { lat: north(47, 500), lon: 19, t: 3000, acc: 5 }), 'glitch');
  assert.equal(R.add(s, { lat: north(47, 10), lon: 19, t: 4000, acc: 5 }), 'ok');
  R.pause(s, 5000);
  assert.equal(R.add(s, { lat: north(47, 20), lon: 19, t: 6000, acc: 5 }), 'skip');
  R.resume(s, 65000);
  assert.equal(R.add(s, { lat: north(47, 900), lon: 19, t: 66000, acc: 5 }), 'first');     // no straight line across the pause
  assert.equal(R.add(s, { lat: north(47, 910), lon: 19, t: 67000, acc: 5 }), 'ok');
  assert.ok(Math.abs(s.dist - 20) < 0.5, 'distance ' + s.dist);
  assert.equal(Math.round(R.elapsed(s, 67000)), 7);
});

test('finished ride is simplified, compact and survives cleaning', () => {
  const s = R.start(1e12); let lat = 47.5;
  for (let i = 1; i <= 1800; i++) { lat = north(lat, 7); R.add(s, { lat, lon: 19 + Math.sin(i / 200) * 0.002, t: 1e12 + i * 1000, acc: 5, alt: 120 + Math.sin(i / 100) * 20 }); }
  const ride = R.finish(s, 1e12 + 1800e3, 'gps');
  assert.equal(ride.elapsed, 1800);
  assert.ok(ride.path.length + ride.ts.length + ride.ele.length < 6000, 'stored size ' + (ride.path.length + ride.ts.length + ride.ele.length));
  const route = R.route(ride);
  assert.ok(route.length >= 2 && route.length < 600, 'points ' + route.length);
  assert.equal(route[0].t, 1); assert.equal(route[route.length - 1].t, 1800);
  assert.deepEqual(R.clean(JSON.parse(JSON.stringify(ride))), ride);
  assert.equal(R.clean({ dist: 0, moving: 0 }), null);
  const bad = R.clean({ dist: 10, moving: 5, path: '<script>', hr: { avg: 'x' }, src: 'evil' });
  assert.equal(bad.path, undefined); assert.equal(bad.hr, undefined); assert.equal(bad.src, 'gps');
  assert.equal(R.clean({ dist: 10, moving: 5, path: R.encodePath([{ lat: 1, lon: 1 }, { lat: 1.001, lon: 1 }]), ts: R.encInts([0]) }).ts, undefined);
});

test('GPX files from other apps import with heart rate, and export back', () => {
  const t0 = Date.parse('2026-10-01T08:00:00Z');
  const rows = Array.from({ length: 121 }, (_, i) => `<trkpt lon="19.0" lat='${north(47.5, i * 6).toFixed(6)}'><ele>${100 + i * 0.5}</ele><time>${new Date(t0 + i * 1000).toISOString()}</time><extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>140</gpxtpx:hr><gpxtpx:cad>85</gpxtpx:cad></gpxtpx:TrackPointExtension></extensions></trkpt>`).join('');
  const out = R.parse(`<?xml version="1.0"?><gpx version="1.1"><trk><name>Morning &amp; hills</name><trkseg>${rows}</trkseg></trk></gpx>`);
  assert.equal(out.name, 'Morning & hills');
  assert.equal(out.start, t0);
  assert.ok(Math.abs(out.ride.dist - 720) < 5, 'dist ' + out.ride.dist);
  assert.equal(out.ride.elapsed, 120); assert.equal(out.ride.moving, 120);
  assert.equal(out.ride.hr.avg, 140); assert.equal(out.ride.cad.avg, 85);
  assert.ok(out.ride.gain >= 56 && out.ride.gain <= 60, 'gain ' + out.ride.gain);
  const back = R.parse(R.gpx(out.ride, out.start, 'A <b>ride</b>'));
  assert.equal(back.name, 'A <b>ride</b>');
  assert.ok(Math.abs(back.ride.dist - out.ride.dist) < 3);
  assert.equal(back.start, t0 + 0);
  assert.equal(R.parse('hello').error, 'format');
  assert.equal(R.parse('<gpx></gpx>').error, 'empty');
});

test('indoor TCX without positions uses the recorded distance', () => {
  const t0 = Date.parse('2026-10-02T18:00:00Z');
  const pts = Array.from({ length: 61 }, (_, i) => `<Trackpoint><Time>${new Date(t0 + i * 30000).toISOString()}</Time><DistanceMeters>${i * 250}</DistanceMeters><HeartRateBpm><Value>150</Value></HeartRateBpm><Cadence>90</Cadence><Extensions><ns3:TPX><ns3:Watts>200</ns3:Watts></ns3:TPX></Extensions></Trackpoint>`).join('');
  const out = R.parse(`<TrainingCenterDatabase><Activities><Activity Sport="Biking"><Lap><Track>${pts}</Track></Lap></Activity></Activities></TrainingCenterDatabase>`);
  assert.equal(out.sport, 'Biking');
  assert.equal(out.ride.dist, 15000); assert.equal(out.ride.elapsed, 1800); assert.equal(out.ride.moving, 1800);
  assert.equal(out.ride.pw.avg, 200); assert.equal(out.ride.hr.max, 150); assert.equal(out.ride.path, undefined);
});

test('Bluetooth heart rate, speed/cadence and power packets are decoded', () => {
  const dv = bytes => new DataView(new Uint8Array(bytes).buffer);
  assert.equal(R.parseHr(dv([0x00, 72])), 72);
  assert.equal(R.parseHr(dv([0x01, 0x2c, 0x01])), 300);
  const a = R.parseCsc(dv([0x03, 100, 0, 0, 0, 0x00, 0x04, 10, 0, 0x00, 0x04]));     // wheel 100 revs @1s, crank 10 @1s
  const b = R.parseCsc(dv([0x03, 104, 0, 0, 0, 0x00, 0x08, 12, 0, 0x00, 0x06]));     // +4 wheel revs in 1s, +2 crank in 0.5s
  const d = R.revDelta(a, b, 2.105);
  assert.ok(Math.abs(d.speed - 8.42) < 1e-9); assert.ok(Math.abs(d.dist - 8.42) < 1e-9); assert.equal(d.cadence, 240);
  // the 1/1024 s event clock wraps at 64 s
  const w1 = { wheelRevs: 10, wheelTime: 63.5, wheelWrap: 64 }, w2 = { wheelRevs: 12, wheelTime: 0.5, wheelWrap: 64 };
  assert.ok(Math.abs(R.revDelta(w1, w2, 2).speed - 4) < 1e-9);
  const p = R.parsePower(dv([0x20, 0x00, 0xfa, 0x00, 5, 0, 0x00, 0x04]));             // 250 W with crank data
  assert.equal(p.watts, 250); assert.equal(p.crankRevs, 5); assert.equal(p.crankTime, 1);
});

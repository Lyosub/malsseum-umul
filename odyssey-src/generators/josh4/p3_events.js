  // 3부 사건
  function kingsCamp(){ kingsShow = true; refresh('gibeon'); try { api.startCine('j10Kings', KCAMP[0], api.heightAt(KCAMP[0], KCAMP[1]) + 2, KCAMP[1], { r: 16, h: 7, dur: 4.5, spin: 0.3 }); } catch (e){} }
  function hail(){ hailShow = true; flash('#e8f2ff', 0.5); refresh('gibeon'); try { api.startCine('j10Hail', SLOPE[0], api.heightAt(SLOPE[0], SLOPE[1]) + 2, SLOPE[1], { r: 18, h: 9, dur: 5, spin: 0.3 }); } catch (e){} api.toast('🧊 하늘에서 큰 우박 덩이가 내렸어요', 2600); }
  function sunStop(){ sunShow = true; flash('#fff3c4', 0.45); refresh('gibeon'); try { api.startCine('j10Sun', GB[0], api.heightAt(GB[0], GB[1]) + 20, GB[1], { r: 30, h: 16, dur: 5.5, spin: 0.2 }); } catch (e){} api.toast('☀ 태양이 기브온 위에 머물렀어요', 2600); }
  function caveStone(){ caveShow = true; refresh('gibeon'); try { api.startCine('j10Cave', CAVE[0] - 3.6, api.heightAt(CAVE[0], CAVE[1]) + 1.5, CAVE[1] - 3.6, { r: 9, h: 3.5, dur: 4, spin: 0.4 }); } catch (e){} }
  function edAltar(){ edShow = true; refresh('shiloh'); try { api.startCine('j13Ed', ED[0], api.heightAt(ED[0], ED[1]) + 2, ED[1], { r: 12, h: 5, dur: 4.5, spin: 0.4 }); } catch (e){} }
  function stoneUp(){ stoneShow = true; refresh('shiloh'); try { api.startCine('j13Stone', OAK[0] - 2.6, api.heightAt(OAK[0], OAK[1]) + 2, OAK[1] + 1.4, { r: 9, h: 3.5, dur: 4.5, spin: 0.4 }); } catch (e){} }
  // 마 1:5 "살몬은 라합에게서 보아스를 낳고" — 족보 칸은 「보아스(라합)」
  function rahabGen(){ api.addGeneal2('보아스'); setTimeout(() => api.toast('📜 족보 조각 「보아스」 — "살몬은 라합에게서 보아스를 낳고" (마 1:5)', 3400), 600); }

# Инженерные заметки по проектам Parhelio

Фактическая сводка технологий, реализованных в каждом из 5 портов Wii U и 4 приложений macOS (все цифры и пути сверены напрямую по исходным репозиториям и сборочным логам).

---

## Порты для Nintendo Wii U

### 1. Minecraft: Wii U Edition (`Update v688` · `00050000101D7500`)
- **Источник:** `/Users/nikitasyzdykov/Downloads/mcwiiu-reconstructed-main`
- **Стек:** C++ декомпиляция (3 753 `.cpp`, 4 016 `.hpp`), RedHills (Clang 19 / Green Hills C++ ABI), LLVM 22, WUT. Чистый `Minecraft.Client.rpx` (`9.38 МБ`, 0% оригинального бинарника).
- **Ключевые решения:**
  - `SeparateGamePad`: Игрок 1 на TV (`720p→1080p` fused-шейдер `GammaCASShader` с **AMD FidelityFX CAS, sharpness=0.38**), Игрок 2 на GamePad (`854×480` с отдельным D24_S8 + HiZ в 22 МБ MEM1).
  - `DualScreenUI`: масштабирование меню P2 (`1.14×` для сундуков/зельеварения, `1.35×` для инвентаря/верстака/печи) с точным ремаппингом касаний `VPADGetTPCalibratedPoint`.
  - Раздельное аудио Miles + BinkA на **Core 2** (`AXInit`, 128 голосов 32 кГц): два 3D-слушателя и два музыкальных потока (HDMI vs GamePad 3.5 мм).
  - 60 FPS vsync + 20 TPS, `nn::save` (51 МБ квота, до 99 миров), `nn::swkbd`, GamePad + до 4 Pro / Classic / Wii Remote.
- **Форматы:** Aroma `.wuhb` (`1.41 ГБ`) и WUP Installer `.zip` (`1.44 ГБ`).

### 2. Buckshot Roulette (`Build 116 / v44` · `000500001337B001` · `WUP-P-OBR0`)
- **Источник:** `/Users/nikitasyzdykov/Kraken Disk/Desktop/what-to-do/OpenBuckshotRoulette-main`
- **Стек:** Собственный нативный **C++20 / PowerPC / WUT** рантайм (без Godot на консоли): `gd_to_cpp_transpiler.py` (корутины `co_task.h`), бинарные сцены `.blayout`, пакеты `OBPK`, единый `game.rpx` (`4.17 МБ`).
- **Ключевые решения:**
  - **28 нативных GX2-шейдеров** (CafeGLSL 1.0.0-rc1), 3D 720p → **1080p AMD CAS** на TV (`SD:/openbr_render.cfg`), GamePad 854×480, лок **30 FPS**, tiled BC-текстуры вне render pass на Core 2.
  - Нативный **`AXAudioEngine`** + **4-bit IMA-ADPCM** (сжатие с ~1.28 ГБ до **303–313 МБ**), фоновый стриминг >512 КБ на Core 2, маршрутизация `TVOnly` / `DRCOnly` / `Both`.
  - Полный SP + локальный PvP **1v1 (TV ↔ GamePad)** с раздельной FP/TP-видимостью предметов, личной паузой и звуком (сетевой MP отключён).
  - GamePad (антидребезг 2.5 px), Pro Controller, Classic, Wii Remote + IR-указатель (3.0 px), `nn::swkbd`, 17 языков, подтверждённый чистый ProcUI-выход.
- **Форматы:** Aroma `.wuhb` (`303 МБ`) и WUP Installer `.zip` (`313 МБ`, AES/TMD/H0–H3/FST PASS).

### 3. Slime Rancher (`v42 NoLog` · `0005000021000002` · `WUP-P-SLIM`)
- **Источник:** `/Users/nikitasyzdykov/Kraken Disk/Downloads/slime-wiiu-sprint`
- **Стек:** PC v1.2.2 (`Unity 2017.1`) → консольный **`Unity-master.rpx` (5.6.5p4)** + **100% Full-AOT** (`50 719 / 50 719` методов в 12 `.rpl`) + собственный C/PPC плагин **`slime_wiiu_nolog.rpl`** (`-DWIIU_NO_LOG`, Core 2 Paired Singles SIMD куллинг 512 акторов).
- **Ключевые решения:**
  - **2 821 PS + 965 VS** скомпилированы под GX2, вырезаны `GrabPass` и `while(true)` fBM, восстановлен аппаратный Early-Z (`KILL_ENABLE=0`).
  - Статический батчинг `level3` (`24 434 → 2 686` батчей, `-70 436` объектов), Float16 VBO + Tom Forsyth, **Dual-Volume WPVS** (`12 742` ячеек, отсечение >32% батчей), Single-RT **Luma-only AMD CAS** + DRS (`720p→648p→576p`).
  - 100% AudioClip (`583/583`) в аппаратном **GCADPCM** (AX DSP 120 МГц, ~0% CPU) + патч вывода одновременно на TV и GamePad.
  - Интерактивная карта **`MapUI` на GamePad** (рендер 3–15 Гц, ~0.05 мс GPU, без паузы TV, тач изолирован от вакпака), Zero-GC, FastSyncLoad v42, безопасный `/$SAVE`.
- **Формат:** **только WUP Installer `.zip`** (`902 МБ`, 23 `.app`, AES/TMD/H0–H3/FST PASS; `.wuhb` нет).

### 4. Animal Crossing: New Horizons (`Wave 9` · `0005000021AC0001` · `WUP-P-ACNH`)
- **Источник:** `/Users/nikitasyzdykov/Desktop/animal-crossing/acnh-wiiu`
- **Статус:** Активная разработка и тестирование (внутренний WUP 3.6 ГБ собран и криптопроверен; публичная раздача после оптимизации CPU и калибровки на реальной Wii U).
- **Стек:** Собственный **статический рекомпилятор Switch AArch64 → C → PowerPC32 Big-Endian** + WUT 1.9.1 + NVN→GX2: `acnh.rpx` + 12 `.rpl` (`149 716` функций; PGO-модуль `acnh_hot_0.rpl` `1.22 МБ` целиком в 2 МБ L2 кэше Core 1).
- **Ключевые решения:**
  - **62 нативных C HLE** (Tiers 1–5 с Espresso Paired Singles SIMD) + 20 `fontll` + AES-128: **`10 378 / 10 378` дифференциальных тестов Unicorn (ARM64 vs C, 0 ULP) PASS**.
  - **NVN → Latte GX2** на Core 0 (`-90% GX2Invalidate`, zero-copy UBO), **4 299 шейдеров** Maxwell→R600 (`0` ошибок), MEM1 теневая карта `768×768 D16+HiZ`, 5-ступенчатый 3D-only DRS (`75%–100%`) + 1-pass Luma AMD CAS + нативный 720p UI.
  - RomFS перепакована `6.3 → 3.4 ГБ`: 61 597 архивов в быстрый `WLZ4` (3–5× быстрее Zstd/Yaz0 на Espresso), ASTC/BC7 → линейный BC1–5 без GOB deswizzle, `OpeningMovie` → H.264 720p30.
  - Полный `audren:u`/`audout:u` на `sndcore2` AX DSP 48 кГц (TV + DRC), Off-TV Play на GamePad (854×480) с калиброванным тачскрином, 6-осевым гироскопом, вибрацией и Pro Controller.
  - Телеметрия Cemu 2.6: загрузка `57–60 FPS`, аэропорт `14.5–20.7 FPS`, 3D-остров `10–14 FPS` (пик `24.3 FPS`), `fb=0`.

### 5. Subnautica (`R&D v18` · `0005000021000003` · `WUP-P-SUBN`)
- **Источник:** `/Users/nikitasyzdykov/Downloads/subnautica-wiiu-sprint`
- **Стек:** Unity 5.6.2p4 → `Unity-master.rpx`, 100% Full-AOT (`45 582` метода), 5 600 GX2-шейдеров, Single-RT WBOIT, `768×432→1280×720` AMD CAS (`sharp=0.80`) + нативный 720p UI, `RT ~23–29 МБ` в 32 МБ MEM1, стабильная память `554–563 МБ`, `fmodstudio.rpl` на Core 2.
- **Статус:** R&D (Cemu 24–30 FPS, реальная Wii U ~10 FPS в океане, полный WUP 9.2 ГБ — прорабатывается формат адаптера).

---

## Приложения для macOS (Apple Silicon)

- **Epidaurus (`v0.2.0`, 31 МБ `.dmg`):** Rust + FFmpeg 9 + SwiftUI/AppKit; VVdeC H.266 4K10 (302 FPS NEON), HDR/Dolby Vision EDR, 16-канальный Dolby Atmos TrueHD → Apple HRTF, HTDemucs 3D upmix, прямой торрент-стриминг libtorrent 2.1.2.
- **Kraken (`v0.4.0`, 9.9 МБ `.pkg`):** Прозрачное сжатие (2.1×–4.09×) и BLAKE3-дедупликация на Mac (NFSv3 loopback без отключения SIP + опция kext), чтение до 14–20 ГБ/с, Sunburst-карта и Free Up Space.
- **Real3D (`v1.2.0`, 857 МБ `.dmg`):** ScreenCaptureKit IOSurface → Core ML Depth Anything V2/V3 Split (GPU ∥ ANE @ 60 FPS) → Metal DIBR (1.9 мс/кадр) → Full SBS 3840×1080 для XREAL.
- **Fovea (`v1.0.0`, 164 МБ `.dmg`):** Swift 6 + Core ML ANE + Metal GPU 3D eye tracking по обычной камере (60–120 Гц ProMotion, 6DoF EPnP/ESKF, Zero-Calibration с `LidAngleSensor`, MAGIC/Absolute/Dwell, жесты веками и Music Control Mode).

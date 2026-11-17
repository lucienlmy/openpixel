<div align="center">

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

<img src="docs/assets/banner.en.png" alt="OpenPixel — Make these pixel worlds your own." width="100%">

# OpenPixel

**Make these pixel worlds your own.**

31 pixel experiments rendered in real time in your browser, from ripples on a pond to colliding galaxies.

<img src="docs/assets/badge-works.en.svg" alt="Artworks"> <img src="docs/assets/badge-runtime.en.svg" alt="Runs in"> <img src="docs/assets/badge-license.en.svg" alt="License">

[Download the collection](https://github.com/ma1902056219-coder/openpixel/archive/refs/heads/main.zip) · [Gallery](#gallery) · [Run locally](#start) · [Remix guide](docs/guide.en.md)

</div>

## Batch 02 · Five more experiments to remix

From molten sparks to seeds: each folder runs independently, with editable code and practical controls.

<table>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#iron-flower"><img src="works/iron-flower/poster.webp" alt="Molten Iron Flowers" width="100%"><br><strong>Molten Iron Flowers</strong></a><br><sub>Strike molten iron into a shower of sparks that lights the village.</sub><br><a href="works/iron-flower/source.js">View source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#watercolor"><img src="works/watercolor/poster.webp" alt="Watercolor Bloom" width="100%"><br><strong>Watercolor Bloom</strong></a><br><sub>Paint on wet paper and watch pigments spread and mix.</sub><br><a href="works/watercolor/source.js">View source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#coral-reef"><img src="works/coral-reef/poster.webp" alt="Coral Reef" width="100%"><br><strong>Coral Reef</strong></a><br><sub>Touch coral, push a current and watch a small underwater ecosystem respond.</sub><br><a href="works/coral-reef/source.js">View source</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#dandelion"><img src="works/dandelion/poster.webp" alt="Dandelion" width="100%"><br><strong>Dandelion</strong></a><br><sub>Scatter seeds in the wind and watch new plants grow.</sub><br><a href="works/dandelion/source.js">View source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#kaleidoscope"><img src="works/kaleidoscope/poster.webp" alt="Kaleidoscope" width="100%"><br><strong>Kaleidoscope</strong></a><br><sub>Turn colored fragments into changing mirrored patterns.</sub><br><a href="works/kaleidoscope/source.js">View source</a></td>
<td width="33%"></td>
</tr>
</table>


## See them in motion

<div align="center">
<img src="docs/assets/batch-02.gif" alt="Actual runtime footage of molten iron flowers, watercolor, coral, dandelions and a kaleidoscope" width="850">
</div>

Actual runtime footage from the five new experiments. The collection now contains 31 works, including all 26 from the first batch.

- **Reach in:** feed koi, move a magnetic field, wipe frost and rake sand.
- **Watch it evolve:** moons form rings, fish avoid a dolphin and stars draw long tails.
- **Take over a scene:** a boss encounter, a sunset drive and a town that wakes up as a puzzle is assembled.
- **Edit the source:** each artwork has its own folder, source and instructions. No build step or AI API is required.

<a id="start"></a>

## Run locally

1. [Download and extract the collection](https://github.com/ma1902056219-coder/openpixel/archive/refs/heads/main.zip), or clone the repository.
2. Open the root `index.html`, or any `works/<artwork>/index.html`.
3. Watch the demonstration, then use the controls described on the page.

If your browser restricts local files, start a local server:

```bash
git clone https://github.com/ma1902056219-coder/openpixel.git
cd openpixel
python -m http.server 8080 --bind 127.0.0.1
```

Open [the local gallery](http://127.0.0.1:8080). Press `Ctrl+C` in the terminal to stop the server.

The README, remix guide and artwork controls are available in four languages. In-scene labels and source comments remain primarily Chinese. Desktop browsers with a keyboard and mouse provide the most complete experience; touch support varies by artwork.

<a id="gallery"></a>

## Gallery

Click a card for its English controls and source links. All 31 artworks include an editable `source.js`; download the collection to run them locally.

### Materials and interaction

<table>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#night-pond"><img src="works/night-pond/poster.webp" alt="Night Pond" width="100%"><br><strong>Night Pond</strong></a><br><sub>Ripple the reflections and feed the koi.</sub><br><a href="works/night-pond/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#plasma-globe"><img src="works/plasma-globe/poster.webp" alt="Plasma Globe" width="100%"><br><strong>Plasma Globe</strong></a><br><sub>Gather electric arcs at your fingertip.</sub><br><a href="works/plasma-globe/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#chladni-plate"><img src="works/chladni-plate/poster.webp" alt="Chladni Plate" width="100%"><br><strong>Chladni Plate</strong></a><br><sub>Vibrations gather sand into changing patterns.</sub><br><a href="works/chladni-plate/source.js">Source</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#ferrofluid"><img src="works/ferrofluid/poster.webp" alt="Ferrofluid" width="100%"><br><strong>Ferrofluid</strong></a><br><sub>Move a magnetic field to shape spikes and reflections.</sub><br><a href="works/ferrofluid/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#cracking-ice"><img src="works/cracking-ice/poster.webp" alt="Cracking Ice" width="100%"><br><strong>Cracking Ice</strong></a><br><sub>Pressure sends cracks across a frozen surface.</sub><br><a href="works/cracking-ice/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#frost-window"><img src="works/frost-window/poster.webp" alt="Frosted Window" width="100%"><br><strong>Frosted Window</strong></a><br><sub>Wipe frost away and watch it grow back.</sub><br><a href="works/frost-window/source.js">Source</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#zen-garden"><img src="works/zen-garden/poster.webp" alt="Zen Garden" width="100%"><br><strong>Zen Garden</strong></a><br><sub>Rake sand and change the light and weather.</sub><br><a href="works/zen-garden/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#pottery"><img src="works/pottery/poster.webp" alt="Pottery Wheel" width="100%"><br><strong>Pottery Wheel</strong></a><br><sub>Shape clay on a spinning wheel.</sub><br><a href="works/pottery/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#kintsugi"><img src="works/kintsugi/poster.webp" alt="Kintsugi" width="100%"><br><strong>Kintsugi</strong></a><br><sub>Reassemble broken pottery, then lacquer, gild and polish it.</sub><br><a href="works/kintsugi/source.js">Source</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#light-painting"><img src="works/light-painting/poster.webp" alt="Light Painting" width="100%"><br><strong>Light Painting</strong></a><br><sub>Build trails, spirals and glowing layers of light.</sub><br><a href="works/light-painting/source.js">Source</a></td>
<td width="33%"></td>
<td width="33%"></td>
</tr>
</table>

### Nature and cosmos

<table>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#sardine-storm"><img src="works/sardine-storm/poster.webp" alt="Sardine Storm" width="100%"><br><strong>Sardine Storm</strong></a><br><sub>Guide a dolphin through a swirling school of fish.</sub><br><a href="works/sardine-storm/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#jellyfish"><img src="works/jellyfish/poster.webp" alt="Jellyfish" width="100%"><br><strong>Jellyfish</strong></a><br><sub>Translucent bodies, soft tentacles and a chain of light.</sub><br><a href="works/jellyfish/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#saturn-rings"><img src="works/saturn-rings/poster.webp" alt="Saturn&#x27;s Rings" width="100%"><br><strong>Saturn&#x27;s Rings</strong></a><br><sub>Launch moons and watch them break into rings.</sub><br><a href="works/saturn-rings/source.js">Source</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#galaxy-collision"><img src="works/galaxy-collision/poster.webp" alt="Galaxy Collision" width="100%"><br><strong>Galaxy Collision</strong></a><br><sub>Two galaxies draw long tidal tails as they meet.</sub><br><a href="works/galaxy-collision/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#black-hole"><img src="works/black-hole/poster.webp" alt="Black Hole" width="100%"><br><strong>Black Hole</strong></a><br><sub>An accretion disk, lensing and moving starlight.</sub><br><a href="works/black-hole/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#solar-limb"><img src="works/solar-limb/poster.webp" alt="Solar Limb" width="100%"><br><strong>Solar Limb</strong></a><br><sub>Prominences, solar granules and Earth shown for scale.</sub><br><a href="works/solar-limb/source.js">Source</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#aurora"><img src="works/aurora/poster.webp" alt="Aurora" width="100%"><br><strong>Aurora</strong></a><br><sub>Curtains of light over snow, a cabin and reflected water.</sub><br><a href="works/aurora/source.js">Source</a></td>
<td width="33%"></td>
<td width="33%"></td>
</tr>
</table>

### Space and illusions

<table>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#endless-window"><img src="works/endless-window/poster.webp" alt="Endless Window" width="100%"><br><strong>Endless Window</strong></a><br><sub>Six nested worlds lead back to the beginning.</sub><br><a href="works/endless-window/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#penrose-tower"><img src="works/penrose-tower/poster.webp" alt="Endless Ascent" width="100%"><br><strong>Endless Ascent</strong></a><br><sub>Rotate the view to reveal an impossible staircase.</sub><br><a href="works/penrose-tower/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#living-jigsaw"><img src="works/living-jigsaw/poster.webp" alt="Living Jigsaw" width="100%"><br><strong>Living Jigsaw</strong></a><br><sub>Assembled pieces come alive; the bus waits for the final piece.</sub><br><a href="works/living-jigsaw/source.js">Source</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#ocean-in-a-tank"><img src="works/ocean-in-a-tank/poster.webp" alt="Ocean in a Tank" width="100%"><br><strong>Ocean in a Tank</strong></a><br><sub>A desk-sized aquarium hides a much larger sea.</sub><br><a href="works/ocean-in-a-tank/source.js">Source</a></td>
<td width="33%"></td>
<td width="33%"></td>
</tr>
</table>

### Playable scenes

<table>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#crown-knight"><img src="works/crown-knight/poster.webp" alt="The Crownless Knight" width="100%"><br><strong>The Crownless Knight</strong></a><br><sub>A boss encounter with dodges, stagger and changing camera angles.</sub><br><a href="works/crown-knight/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#sunset-loop"><img src="works/sunset-loop/poster.webp" alt="Sunset Loop" width="100%"><br><strong>Sunset Loop</strong></a><br><sub>Drive toward the sunset with a rear-view camera.</sub><br><a href="works/sunset-loop/source.js">Source</a></td>
<td width="33%"></td>
</tr>
</table>

### Pixel landscapes

<table>
<tr>
<td width="33%" valign="top"><a href="docs/works.en.md#thousand-li"><img src="works/thousand-li/poster.webp" alt="A Thousand Li of Rivers and Mountains" width="100%"><br><strong>A Thousand Li of Rivers and Mountains</strong></a><br><sub>A moving blue-green landscape scroll.</sub><br><a href="works/thousand-li/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#rainbow-bridge"><img src="works/rainbow-bridge/poster.webp" alt="Qingming Scroll: Rainbow Bridge" width="100%"><br><strong>Qingming Scroll: Rainbow Bridge</strong></a><br><sub>Boats, vendors and pedestrians bring a scroll to life.</sub><br><a href="works/rainbow-bridge/source.js">Source</a></td>
<td width="33%" valign="top"><a href="docs/works.en.md#rose-window"><img src="works/rose-window/poster.webp" alt="Gothic Rose Window" width="100%"><br><strong>Gothic Rose Window</strong></a><br><sub>Colored glass casts shifting patterns across a cathedral floor.</sub><br><a href="works/rose-window/source.js">Source</a></td>
</tr>
</table>

## Make your own version

Copy one complete artwork folder, edit `source.js`, then refresh the running page. Change one color or parameter first, and check both the demonstration and manual controls.

The original project was made with Claude-assisted programming. You can also give a complete folder and a specific request to GPT, Gemini or another coding assistant. Always run and check the result. See the [remix guide](docs/guide.en.md) for examples.

```text
Read source.js and identify initialization, per-frame updates and drawing.
Change the night palette into sunset colors while preserving the controls.
Explain the changes first; do not add external images, services or dependencies.
```

## Project layout

Each `works/<slug>/` folder includes `index.html`, `source.js`, a read-only `source.html`, `poster.webp`, a Chinese `README.md` and a copy of `LICENSE`. Translated [artwork controls](docs/works.en.md) explain how to interact with every scene. Shared runtime code is included in each folder so it can be copied independently.

These are pixel-art and small gameplay experiments. Combat and driving retain simplified prototype rules. System fonts and random processes can produce differences between runs.

## Updates and contributions

The collection now includes 31 artworks across two batches. More effects will be shared from time to time. Improvements to interaction, visuals and performance are welcome. For issues, include the artwork name, browser and steps to reproduce. For a pull request, explain your change and check both demo and manual modes. See [CONTRIBUTING.md](CONTRIBUTING.md) for the original Chinese guidelines.

## Author and license

Curated and maintained by **喵老弟 [@MarkMFFF](https://x.com/MarkMFFF)**. Follow for demos, experiments and future batches.

Code is available under the [MIT License](LICENSE); retain the copyright and license text when reusing it. Style references do not imply affiliation with commercial games or brands. Original file fingerprints and extraction notes are recorded in [SOURCE_NOTES.md](SOURCE_NOTES.md).

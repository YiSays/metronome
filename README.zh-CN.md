# Pro Metronome 🎵

[English](./README.md) | **中文**

专为专业音乐人打造的高精度、移动端优先的 Web 节拍器。它结合了基于 Web Audio API 的采样级精准计时、响亮有力的音频引擎以及现代化的手势交互界面。

## ✨ 核心功能

### 🎧 **专业级音频引擎**
- **响亮有力：** 采用定制的音频处理链路，包含 **压缩 (Compression)**、**软削波失真 (Soft-Clipping Distortion)** 和 **增益分级 (Gain Staging)**，确保在嘈杂的练习环境中也能清晰可闻。
- **实时合成音色：** 无需静态采样文件。所有声音均实时合成，实现零延迟和无限变化。
  - **木鱼 (Woodblock)：** 经典、自然的敲击声。
  - **电子咔哒声 (Click)：** 尖锐的高频数字脉冲。
  - **机械铃声 (Bell)：** 共鸣丰富的机械铃声（非常适合重拍）。
  - **双脉冲 (Double Pulse)：** 独特的节奏标记声。
  - **琥珀音 (Amber)：** 温暖的滤波合成音色。
- **采样级精准计时：** 使用 Web Audio API 时钟，独立于 JavaScript 主线程，杜绝节奏漂移。

### 📱 **现代化的移动端优先 UI**
- **环形 BPM 拨盘：** 
  - 拖动拨盘即可平滑调节速度。
  - **视觉反馈：** 拨盘随节拍脉动，重拍时闪烁。
  - **分段路径设计：** 精美的渐变填充展示当前速度进度。
- **视觉节拍追踪：**
  - **完美同步：** 视觉效果通过自定义的队列预读系统与音频子系统同步，确保闪烁效果与声音播放 **毫秒级精准对齐**。
- **侧边栏设置：** 干净的抽屉式界面用于高级设置，保持主舞台整洁。

### 💾 **智能预设 (Smart Presets)**
- **动态命名：** 
  - 当您修改预设参数时，名称会自动变更为 "Custom X"。
  - 如果您将参数恢复为原始设置，名称会自动回退到原始名称（如 "Slow Jam"）。
- **指尖测速 (Tap Tempo)：** 跟随节奏点击即可即时设定 BPM。

## 🛠️ 技术栈

- **框架：** React 18 + TypeScript
- **构建工具：** Vite
- **样式：** CSS Modules / Vanilla CSS variables
- **音频：** 原生 Web Audio API (Oscillators, GainNodes, DynamicsCompressorNode, WaveShaperNode)
- **状态管理：** React Hooks (`useMetronome`, `useRef` 用于音频计时)

## 🚀 快速开始

### 前置要求
- Node.js (v16+)
- `npm` or `yarn`

### 安装

1. **克隆仓库：**
   ```bash
   git clone <repository-url>
   cd metronome
   ```

2. **安装依赖：**
   ```bash
   npm install
   ```

3. **启动开发服务器：**
   ```bash
   npm run dev
   ```

4. **构建生产版本：**
   ```bash
   npm run build
   ```

## 📐 项目结构

```
src/
├── components/
│   ├── BpmDial.tsx           # 环形交互拨盘
│   ├── VisualMetronome.tsx   # 音画同步引擎
│   ├── SettingsDrawer.tsx    # 预设/音量等侧边栏设置
│   └── TimeSignatureControl.tsx
├── hooks/
│   └── useMetronome.ts       # 核心音频调度逻辑
├── utils/
│   ├── audioGenerator.ts     # 声音合成与音频图谱构建
│   ├── constants.ts          # 共享配置 (拍号)
│   └── presets.ts            # 预设数据与存储逻辑
├── App.tsx                   # 主布局与状态编排
└── types/                    # TypeScript 类型定义
```

## 🧠 架构亮点

### 音画同步 (Audio-Visual Synchronization)
为了解决 JS 节拍器常见的视觉滞后问题，本项目采用了分离式架构：
1. **音频线程：** 使用 `AudioContext.currentTime` 提前调度音频事件（预读机制）。
2. **视觉线程：** 使用 `requestAnimationFrame` 轮询已调度的节拍队列。
3. **同步：** 视觉组件将队列时间与 **实际** 音频时间进行比对，在声音触达扬声器的瞬间精准触发动画，修正主线程延迟。

### "响度" 工程 (Loudness Engineering)
标准的 Web Audio 振荡器声音通常较小。我们实现了一个母带处理链：
`Oscillators -> Pre-Gain -> WaveShaper (饱和度) -> Compressor (限制器) -> Master Gain`
这使得节拍器在不产生数字削波的情况下，听感响度显著提升。

## 📄 许可证

MIT License.

# QuantumForge Studio (`|ψ⟩`)

**QuantumForge Studio** is a full-stack interactive quantum computing learning platform, real-time statevector and density-matrix circuit composer, spin-Hamiltonian physics lab, and closed-loop AI quantum circuit optimization studio.

Designed with an editorial, distraction-free learning interface inspired by interactive scientific textbooks, QuantumForge Studio bridges foundational quantum mechanics (IBM Quantum Learning & Qiskit SDK v2.0) with frontier research in automated quantum circuit compression (closed-loop LLM synthesis paired with deterministic mathematical verifiers).

---

## ✨ Core Capabilities

### 1. Split-Pane Progressive Disclosure Learning Mode
- **4 Structured Learning Stages**:
  1. **First Quantum Program**: Superposition ($H$), two-qubit entanglement ($\text{CX}$), Bell states ($|\Phi^+\rangle$), Qiskit little-endian bit ordering ($|q_{n-1}\dots q_0\rangle$), and finite-shot Born statistics.
  2. **Quantum Math Basics**: $2\times 2$ and $4\times 4$ unitary matrices ($U^\dagger U = I$), Pauli operators ($X, Y, Z$), relative phase gates ($S, T$), and navigating the four orthogonal Bell states ($|\Phi^\pm\rangle, |\Psi^\pm\rangle$).
  3. **Two-Spin Experiment**: Antiferromagnetic Heisenberg exchange Hamiltonian $\hat{H} = J(X_0X_1 + Y_0Y_1 + Z_0Z_1) + h_x(X_0 + X_1)$, singlet ground-state discovery ($E = -3J$), and Qiskit v2 `SamplerV2` vs. `EstimatorV2` workflows.
  4. **AI Circuit Efficiency**: Bennett's reversible uncomputation pattern ($U_{\text{compute}}^\dagger$), ancilla entanglement debugging, and closed-loop $\text{Qubits} \times \text{Gates}$ circuit optimization.
- **Interactive "Click-to-Load" Dirac Presets**: Every lesson step includes inline clickable quantum state and gate sequence cards that immediately populate the live quantum register and update all statevector and shot readouts.
- **Contextual Gate Palette**: Automatically filters available gates to match the active concept step while allowing one-click expansion (`+ All Gates`) or switching into **Open Lab Mode**.

### 2. Exact $2^n$ Complex Statevector & Reduced Density Matrix Engine
- **Coherent Statevector Simulation**: Computes exact complex amplitudes $\alpha_x = \text{re} + i\cdot\text{im}$, Born probabilities $|\alpha_x|^2$, and phase angles $\theta = \text{atan2}(\text{im}, \text{re})$ across 1 to 6 qubit wires ($q_0 \dots q_5$).
- **Partial-Trace Single-Qubit Density Matrices**: Computes $\rho_q = \text{Tr}_{\neq q}(|\psi\rangle\langle\psi|)$, Bloch vectors $(r_x, r_y, r_z)$, single-qubit purity $\text{Tr}(\rho_q^2) \in [0.5, 1.0]$, and von Neumann entanglement entropy $S(\rho_q)$ in bits.
- **Horizontal Timeline Scrubber**: Scrub step-by-step across circuit columns to inspect intermediate superpositions and entanglement formation in real time.
- **Ideal vs. Noisy QPU Shot Sampling**: Compare exact Born probabilities against finite-shot (`100`, `1K`, `10K`) multinomial runs with realistic two-qubit depolarizing and readout error profiles (`ibm_fez` Heron r2 & `ibm_pittsburgh` Nighthawk).

### 3. Interactive Ancilla Uncomputation Debugger
- **Scratch Wire Monitoring**: Mark any wire as an ancilla scratch qubit (`ANC`) to monitor whether intermediate computations leave it non-zero or entangled with the data register.
- **Coherence Loss Diagnosis & 1-Click $U^\dagger$ Repair**: Detects when tracing out an uncomputed scratch wire corrupts quantum interference and synthesizes the inverse mirror uncomputation sequence ($U_{\text{compute}}^\dagger$) automatically.

### 4. Closed-Loop AI Quantum Circuit Optimizer
- **Space-Time Cost Metric**: Evaluates circuits using hardware-weighted $\text{Qubits} \times \text{Gates}$ volume and non-Clifford Toffoli (`CCX`) counts.
- **Deterministic Verifier + Multi-Round Refinement**: Pairs server-side Gemini synthesis (`/api/optimize-circuit`) with a deterministic computational-basis truth-table and unitary verifier across 3 closed-loop refinement rounds, plus interactive benchmarks modeled on frontier quantum circuit optimization case studies.

### 5. Hardware ISA Transpiler & Coupling Map Inspector
- **On-Demand Code, Math & Topology Drawer**:
  - **Live-Synced Qiskit v2 Code**: Auto-generates copy-ready Python scripts using `QuantumCircuit`, `generate_preset_pass_manager`, `SamplerV2`, `EstimatorV2`, and `SparsePauliOp`.
  - **Unitary & Density Matrix Inspector**: Inspect exact gate unitaries and per-wire reduced density matrices $\rho_q$.
  - **Physical Coupling Map**: Compare **IBM Heron (Heavy-Hex)** vs. **IBM Nighthawk (Square Lattice Grid)** connectivity, visualizing inserted routing `SWAP` gates, decomposed 1Q/2Q ISA instruction counts, QuOps, and estimated circuit fidelity.

### 6. Certification Exam & Context-Aware Quantum Tutor (`⌘K`)
- **20-Question Quantum Certification Assessment**: Covers foundational quantum mechanics, Qiskit v2 primitives, spin physics, and reversible circuit optimization with instant analytical explanations.
- **Floating Quantum Tutor (`⌘K` / `Ctrl+K`)**: Context-aware AI assistant with live visibility into the user's current lesson step, active gate sequence, Dirac statevector, and ancilla uncomputation status.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion (`framer-motion`)
- **Quantum Simulation Engine**: Custom TypeScript linear algebra statevector, partial trace ($\rho_q$), multinomial noisy shot sampler, and ISA routing transpiler (`src/utils/quantumEngine.ts`)
- **Backend**: Node.js, Express, `tsx` (Vite middleware integration in development, compiled ESM bundle in production)
- **AI Integration**: `@google/genai` SDK (Server-side `GEMINI_API_KEY` for closed-loop circuit synthesis and contextual tutoring, with deterministic local mathematical verification and fallbacks)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `>= 20.x` (or **Bun** `>= 1.1`)
- **npm** (or **bun**)

### 1. Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd quantumforge-studio
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Edit `.env` and provide your Gemini API key (optional for core simulation; required for live AI closed-loop circuit synthesis and AI Tutor responses):

```env
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```

> **Note**: If `GEMINI_API_KEY` is omitted, QuantumForge Studio automatically falls back to its built-in deterministic algebraic circuit optimizer and local curriculum tutor engine so every workspace remains 100% functional offline.

### 3. Run the Development Server

```bash
npm run dev
```

Open **`http://localhost:3000`** in your browser.

### 4. Typecheck & Production Build

```bash
# Run TypeScript compiler verification
npm run lint

# Build frontend assets and bundle server into dist/
npm run build

# Start production server
npm start
```

---

## 🔌 Backend API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/optimize-circuit` | `POST` | Runs closed-loop quantum circuit synthesis and deterministic truth-table/unitary verification, returning gate reductions, `Qubits × Gates` score, and mathematical insights. |
| `/api/evaluate-circuit` | `POST` | Evaluates an arbitrary quantum gate array against computational basis test vectors, checking ancilla restoration ($|0\rangle_{\text{anc}}$), circuit depth, and Toffoli overhead. |
| `/api/tutor` | `POST` | Context-aware quantum computing tutor that receives the live circuit summary, Dirac statevector, and active lesson step to diagnose bugs or explain concepts. |

---

## 📁 Project Structure

```text
├── index.html                        # App entry HTML (Plus Jakarta Sans & JetBrains Mono)
├── server.ts                         # Express backend + deterministic verifier + Gemini API routes
├── package.json                      # Scripts and dependencies
├── src/
│   ├── App.tsx                       # Root application shell (Guided Learn, Open Lab, Exam modes)
│   ├── index.css                     # Minimal Warm Alabaster & Obsidian theme tokens
│   ├── types/
│   │   └── quantum.ts                # Core TypeScript interfaces for gates, statevectors, and ISA reports
│   ├── utils/
│   │   └── quantumEngine.ts          # 2^n statevector simulator, partial trace ρ_q, ancilla & ISA engine
│   ├── data/
│   │   ├── curriculumData.ts         # 4-stage progressive micro-steps & inline Dirac presets
│   │   ├── optimizerData.ts          # Closed-loop optimization benchmarks & Pareto frontier data
│   │   └── examQuestions.ts          # 20-question quantum certification assessment bank
│   └── components/
│       ├── Navigation.tsx            # Sleek 52px top navigation bar & mode switcher
│       ├── GuidedLearnSplitView.tsx  # 44%/56% Split-Pane Progressive Disclosure Learning UI
│       ├── Drawers/
│       │   └── InspectCodeMathDrawer.tsx # On-demand Qiskit v2 code, unitary/density ρ_q & ISA topology
│       ├── TutorDrawer/
│       │   └── AITutorDrawer.tsx     # Floating bottom-right Quantum Tutor command pill & popover (⌘K)
│       ├── ComposerWorkspace/        # Full unconstrained 6-qubit laboratory circuit studio
│       ├── CurriculumWorkspace/      # Deep-dive spin Hamiltonian & myth-buster reference modules
│       ├── OptimizerWorkspace/       # Pareto frontier & multi-round AI circuit optimization lab
│       └── CertificationWorkspace/   # Interactive 20-question exam & hardware benchmark explorer
```

---

## 📜 License

SPDX-License-Identifier: Apache-2.0

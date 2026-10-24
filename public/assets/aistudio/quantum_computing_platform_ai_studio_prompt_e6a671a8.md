# Google AI Studio Master Build Prompt: Interactive Quantum Computing Learning & Circuit Optimization Platform

Use the prompt sections below inside [Google AI Studio Build Mode](https://ai.google.dev/gemini-api/docs/aistudio-build-mode) (`aistudio.google.com`) to generate a full-stack React and Node.js web application powered by the server-side Gemini API. The application combines the hands-on beginner curriculum from [IBM Quantum Learning: Use a quantum computer today](https://quantum.cloud.ibm.com/learning/en/courses/use-a-qc-today) with the advanced AI-driven circuit optimization and reversibility concepts from [Anthropic Research: Designing more efficient quantum circuits with Claude](https://www.anthropic.com/research/designing-efficient-quantum-circuits).

## 1. Primary One-Shot Build Prompt (Copy & Paste into Google AI Studio Build Mode)

Build a full-stack, interactive web application called **QuantumForge Studio**: a Digital Quantum Computing Learning Platform, Online Quantum Circuit Composer, and AI-Driven Circuit Optimization Lab built with React (TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Recharts/Canvas) on the frontend and a Node.js backend integrated with the server-side `GEMINI_API_KEY`.

### A. Visual Identity & Layout Architecture
1. **Theme & Aesthetics**: Design a dark-mode scientific workspace (`#0B0F19` obsidian background, `#111827` surface panels, `#38BDF8` cyan for superposition states, `#A855F7` violet for entanglement links, `#F97316` orange for Pareto-optimal AI circuit designs, and `#10B981` emerald for verified evaluator passes) with a high-contrast light-mode toggle.
2. **Navigation Shell**: Provide a persistent left sidebar and top workspace bar switching seamlessly between four core workspaces:
   - **Interactive Circuit Composer & Simulator** (drag-and-drop builder + live Qiskit code sync)
   - **Guided Curriculum & Spin Physics Lab** (4 structured modules + interactive two-spin Hamiltonian experiment)
   - **AI Closed-Loop Circuit Optimizer** (Anthropic-inspired Qubit $\times$ Gate cost evaluator + Pareto frontier lab)
   - **Certification Exam & Hardware Context Explorer** (20-question assessment + Scale/Quality/Speed benchmark dashboard)

### B. Workspace 1: Online Drag-and-Drop Quantum Circuit Composer & Live Simulator
Build an in-browser quantum circuit designer and statevector/shot simulator modeled on the workflow in [Build and run your first quantum program](https://quantum.cloud.ibm.com/learning/courses/use-a-qc-today/build-and-run-your-first-quantum-program) and [Quantum mechanics basics](https://quantum.cloud.ibm.com/learning/courses/use-a-qc-today/quantum-mechanics-basics):
1. **Circuit Canvas**:
   - Support 1 to 6 horizontal qubit wires ($q_0$ to $q_5$) initialized to $\vert 0\rangle$, plus a gray double-line classical measurement register (`meas`).
   - Allow dragging, dropping, reordering, and deleting quantum gates across time steps (columns):
     - **Single-Qubit Gates**: Hadamard (`H`, red badge), Pauli-X (`X` / NOT), Pauli-Y (`Y`), Pauli-Z (`Z`), Phase (`S`, `T`), Rotation gates (`RX(θ)`, `RY(θ)`, `RZ(θ)` with angle sliders), and Basis Measurement (`M` in $Z$, $X$, or $Y$ basis).
     - **Multi-Qubit Gates**: Controlled-NOT (`CNOT` / `CX` with selectable control dot and target $\oplus$), Controlled-Z (`CZ`), `SWAP`, and 3-qubit **Toffoli (`CCX`)** gates (flagged with a high-resource hardware cost badge).
   - Provide one-click **Preset Circuit Templates**:
     - $\vert\Phi^+\rangle$ Bell State (`H` on $q_0$, `CX` $q_0 \rightarrow q_1$)
     - All four Bell States ($\vert\Phi^+\rangle, \vert\Phi^-\rangle, \vert\Psi^+\rangle, \vert\Psi^-\rangle$, highlighting $\vert\Psi^-\rangle = \frac{1}{\sqrt{2}}(\vert 01\rangle - \vert 10\rangle)$ built with `H(0)`, `CX(0,1)`, `X(1)`, `Z(0)`)
     - 3-Qubit GHZ State
     - Reversible Uncomputation Demo (Ancilla scratch computation + inverse uncomputation)
2. **Mathematical & Physical Inspection Panels (Real-Time)**:
   - **Dirac & Vector View**: Render the exact state in Dirac bra-ket notation (e.g., $\vert\Phi^+\rangle = \frac{1}{\sqrt{2}}(\vert 00\rangle + \vert 11\rangle)$) and full $2^n$ column statevector amplitudes using Qiskit's **little-endian convention** (rightmost bit = $q_0$, leftmost bit = $q_{n-1}$).
   - **Unitary Matrix Inspector**: Clicking any gate or step displays its $2\times 2$ or tensor-expanded $4\times 4$ unitary matrix (such as $H_0 = H \otimes I$ and $\text{CNOT}$), demonstrating length preservation and reversibility ($U^\dagger U = I$).
   - **Measurement Basis Selector**: Allow measuring qubits in the $Z$ basis ($\vert 0\rangle, \vert 1\rangle$), $X$ basis ($\vert +\rangle, \vert -\rangle$ by applying a pre-measurement $H$ gate), or $Y$ basis ($\vert i\rangle, \vert -i\rangle$), showing how Pauli matrices act as both gates and observables.
3. **Ideal Simulator vs. Noisy Real QPU Execution Mode**:
   - Include a **Shots Slider** (`10`, `100`, `1,000`, `10,000` shots) and a backend toggle between **Ideal `AerSimulator`** and **Simulated Real QPU (`ibm_fez` / `ibm_pittsburgh` Noise Profile)**.
   - On the Ideal Simulator, sample from Born-rule probabilities ($P_i = \vert\alpha_i\vert^2$) with realistic multinomial statistical fluctuations (explaining why 1,000 shots of $\vert\Phi^+\rangle$ yields e.g. `504` counts of `00` and `496` counts of `11`).
   - On the Simulated Real QPU, inject realistic gate infidelities, readout error, and $T_1/T_2$ thermal decoherence so users observe minor leakage into `01` and `10` states alongside simulated queue status and transpiler pass changes.
4. **Live Bidirectional Qiskit v2 Code Panel**:
   - Auto-generate copyable Python code using modern Qiskit syntax (`QuantumCircuit`, `AerSimulator`, `generate_preset_pass_manager`, `SamplerV2`, `EstimatorV2`, `SparsePauliOp`, `plot_histogram`) that updates live as gates are dragged on the canvas.

### C. Workspace 2: Guided Interactive Curriculum & Spin Physics Lab
Structure four hands-on learning modules grounded in [IBM Quantum Learning: Use a quantum computer today](https://quantum.cloud.ibm.com/learning/en/courses/use-a-qc-today) with interactive "Check Your Understanding" reveal cards:
1. **Lesson 1 — Build & Run Your First Quantum Program**: Interactive walkthrough of qubits, superposition amplitudes, CNOT entanglement, shot statistics, and the challenge to transform $\vert\Phi^+\rangle$ into $\vert\Psi^-\rangle$.
2. **Lesson 2 — Quantum Mechanics Basics**: Interactive matrix-vector multiplier where users step through $H_0\vert 00\rangle = \frac{1}{\sqrt{2}}(\vert 00\rangle + \vert 01\rangle)$ followed by $\text{CNOT}$ to produce $\frac{1}{\sqrt{2}}(\vert 00\rangle + \vert 11\rangle)$, plus an interactive complex-plane phase wheel ($e^{i\theta}$) and Pauli observable explorer.
3. **Lesson 3 — Your First Quantum Experiment (Two Interacting Spins & Qiskit Patterns)**:
   - Model two interacting magnetic spins using the Hamiltonian $H = J Z_1 Z_0 + h_x (X_1 + X_0)$ from [Your first quantum experiment](https://quantum.cloud.ibm.com/learning/courses/use-a-qc-today/your-first-quantum-experiment).
   - Provide interactive sliders for antiferromagnetic coupling $J$ (default $J = 1.0$) and transverse magnetic field $h_x$ (default $h_x = -0.5$).
   - Walk through the **4-Step Qiskit Patterns Workflow**: **Map** (state preparation & `SparsePauliOp.from_list([("ZZ", J), ("XI", hx), ("IX", hx)])`) $\rightarrow$ **Optimize** (`generate_preset_pass_manager` transpilation to hardware ISA gates) $\rightarrow$ **Execute** $\rightarrow$ **Post-Process**.
   - Contrast **Sampler** (bitstring probability histogram showing `01` and `10` dominance for $\vert\Psi^-\rangle$) side-by-side with **Estimator** (expectation value calculation $\langle\psi\vert H\vert\psi\rangle \approx -0.9934$), and include an interactive variational challenge where learners tune a single-qubit rotation angle to discover an even lower ground-state energy.
4. **Lesson 4 — Quantum Computing Context & Hardware Metrics**:
   - Interactive myth-buster cards covering the 6 core misconceptions from [Quantum computing context](https://quantum.cloud.ibm.com/learning/courses/use-a-qc-today/quantum-computing-context).
   - Interactive **3D Hardware Benchmark Explorer** comparing **Scale** (programmable qubits), **Quality** (QuOps, $T_1/T_2$, EPLG), and **Speed** (circuit throughput, CLOPS), explaining why processor upgrades like IBM Heron to Nighthawk prioritize connectivity topology for error correction over raw qubit count, and contrasting **Error Mitigation** vs. **Error Correction** within a hybrid classical CPU + QPU workflow.

### D. Workspace 3: AI-Driven Quantum Circuit Optimization Lab (Anthropic Research Module)
Build an interactive lab modeled directly on [Anthropic Research: Designing more efficient quantum circuits with Claude](https://www.anthropic.com/research/designing-efficient-quantum-circuits):
1. **Quantum Programming Constraints Sandbox**:
   - **Constraint 1 — No Classical `if-then` Branching**: Visual comparison showing how a classical conditional branch only executes one path, whereas a quantum circuit acting on a superposition must include fixed gate sequences covering all branches simultaneously.
   - **Constraint 2 — Reversibility & The Uncomputation Trade-Off**: Interactive slider demonstrating how leftover scratch qubits corrupt quantum interference unless uncomputed by running gates in reverse—illustrating the fundamental **Space (Qubits) vs. Time (Gates)** trade-off (immediate uncomputation saves qubits but requires recomputation later; retaining intermediates saves gates but consumes ancilla qubits).
2. **Closed-Loop AI Circuit Optimizer & Programmatic Evaluator (Powered by Server-Side Gemini API)**:
   - Allow the user to input a plain-language circuit specification or select one of eight benchmark primitives (chemistry, optimization, quantum simulation, number theory, arithmetic).
   - Implement a simulated multi-round **Closed-Loop Optimization Engine**:
     - The server-side Gemini model proposes a circuit implementation and structural mathematical insight (e.g., exploiting molecular symmetry to compute once and reuse, or algebraic state decoding instead of storing branch history).
     - A deterministic client/server **Evaluator Engine** checks functional correctness across test inputs and computes the objective score: $\text{Cost Score} = \text{Qubits} \times \text{Gates}$ (weighting expensive **Toffoli gates**).
     - Display live iteration logs across rounds and plot the **Qubit vs. Gate Pareto Frontier** chart comparing published baseline circuits (gray markers) against AI-optimized designs (orange markers).
3. **Three Interactive Deep-Dive Case Studies**:
   - **Case Study 1 — FeMoco Nitrogenase Catalyst Simulation**: Interactive timeline chart showing how circuit redesigns lowered ground-state energy estimates from **50 trillion Toffoli gates** (2017) to **340 million gates** (~150,000$\times$ reduction, ~3 million physical qubits for a few hours), highlighting how exploiting iron-sulfide symmetries avoids redundant recomputation.
   - **Case Study 2 — Elliptic-Curve Point Addition & Reversible `divsteps` Modular Inversion ($ax \equiv 1 \pmod p$)**: Interactive visualizer comparing naive reversible `divsteps` (which accumulates branch history in ancilla qubits at each round) vs. algebraic branch decoding from numerical pairs (zero stored branch history, verified via algebraic identities and Lean formalization) vs. hybrid threshold designs that expand the Pareto frontier (**17$\times$ fewer gates** with **12% more qubits** than the smallest prior circuit).
   - **Case Study 3 — Decoded Quantum Interferometry (DQI) & Reed-Solomon Syndrome Decoding**: Interactive visual comparison of the Optimal Polynomial Intersection (OPI) curve-fitting grid and the three Reed-Solomon locator circuit architectures drawn to scale:
     - *(a) Extended Euclidean Algorithm*: Input-dependent step order forced into worst-case stretched rounds.
     - *(b) Naive Reversible Berlekamp-Massey*: Fixed-round structure suited for quantum circuits, but stores a 12-qubit record per round (**840 qubits** total).
     - *(c) State-Reconstructed Berlekamp-Massey with Statistical Exception Budgeting*: Reconstructs temporary values from current state and replaces a worst-case 35-exception reserve (**665 qubits**) with a single saved exception slot (**19 qubits**, based on 403 million simulations showing $>1$ exception occurs in only ~1 in 10,000 runs), achieving a **12$\times$ gate reduction**.

### E. Workspace 4: AI Quantum Tutor & 20-Question Certification Readiness Exam
1. **Context-Aware AI Quantum Tutor Drawer**: Connect a persistent chat drawer to the Node.js Gemini API route that reads the user's currently active circuit on the canvas, inspects its statevector and gate count, diagnoses bugs (e.g., missing uncomputation or wrong endianness), and suggests gate reductions.
2. **20-Question Interactive Badge Readiness Exam**: Include a 20-question assessment modeled on the [IBM Quantum Learning Exam](https://quantum.cloud.ibm.com/learning/courses/use-a-qc-today/exam) and Anthropic circuit-efficiency concepts with instant grading, step-by-step mathematical explanations, and a downloadable completion certificate.

## 2. Iterative Follow-Up Prompts for Google AI Studio

After running the initial build prompt in [Google AI Studio Build Mode](https://ai.google.dev/gemini-api/docs/aistudio-build-mode), use these targeted follow-up prompts in the Build chat panel to deepen specific subsystems:

| Iteration Stage | Follow-Up Prompt to Paste in Google AI Studio | Target Capability |
| :--- | :--- | :--- |
| **1. Exact Complex Statevector Engine** | *"Upgrade the client-side quantum simulator engine so that every gate drop immediately computes exact $2^n$ complex amplitudes $(\text{re}, \text{im})$, phase angles $\theta = \text{atan2}(\text{im}, \text{re})$, reduced single-qubit density matrices, and step-by-step intermediate statevectors as the user scrubs a vertical timeline bar across the circuit."* | Real-time linear algebra & timeline scrubbing |
| **2. Interactive Uncomputation Debugger** | *"Add an 'Ancilla Entanglement Warning' detector to the Circuit Composer: when a user marks a wire as an ancilla/scratch qubit and leaves it entangled or non-zero at the end of the circuit without uncomputing it, highlight how measuring or discarding that scratch qubit corrupts interference on the output register."* | Reversibility & uncomputation visualization |
| **3. Live Closed-Loop Gemini Evaluator API** | *"Connect the AI Circuit Optimizer tab to a backend `/api/optimize-circuit` endpoint using `GEMINI_API_KEY`. Have Gemini generate a sequence of quantum gates in JSON for a target truth table or arithmetic rule, run a deterministic JavaScript truth-table/unitary verifier in the backend, compute `qubits * gates` and Toffoli count, and automatically feed the score back to Gemini for 3 closed-loop refinement rounds."* | Closed-loop AI synthesis + verification |
| **4. Transpiler & Topology Visualizer** | *"Add a 'Hardware Transpiler View' toggle in the Circuit Composer that maps the user's logical circuit onto a physical coupling map (comparing Heavy-Hex Heron vs. Nighthawk connectivity), inserting SWAP gates and decomposing Toffoli gates into native 1- and 2-qubit ISA gates while updating the QuOps and EPLG estimate."* | Qiskit `generate_preset_pass_manager` & topology |

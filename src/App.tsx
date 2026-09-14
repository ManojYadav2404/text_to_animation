import { useState, useEffect } from "react";
import {
  Play,
  Key,
  Code2,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  FileCode,
  Sliders,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers,
  HelpCircle,
  Maximize2,
  FileText
} from "lucide-react";
import { SAMPLE_ANIMATIONS, SampleAnimation } from "./samples";
import { PYTHON_APP_PY_CODE, REQUIREMENTS_TXT_CODE } from "./pythonSource";

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [currentHtml, setCurrentHtml] = useState<string>(SAMPLE_ANIMATIONS[0].html);
  const [activePromptLabel, setActivePromptLabel] = useState<string>(SAMPLE_ANIMATIONS[0].prompt);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isExpanderOpen, setIsExpanderOpen] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);
  const [activeTab, setActiveTab] = useState<"app" | "python">("app");
  const [hasEnvKey, setHasEnvKey] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);

  // Check if server-side environment key is present
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasEnvKey) {
          setHasEnvKey(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate prompt
    if (!prompt.trim()) {
      setErrorMessage("Please describe an animation concept before generating.");
      return;
    }

    // Validate API key if server key is not available
    if (!apiKey.trim() && !hasEnvKey) {
      setErrorMessage("Gemini API Key is missing! Please enter your key in the sidebar on the left.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate animation.");
      }

      if (data.html) {
        setCurrentHtml(data.html);
        setActivePromptLabel(prompt.trim());
        setIframeKey((prev) => prev + 1);
        setSuccessMessage("Animation generated successfully! Rendered live in 600x400 canvas below.");
      } else {
        throw new Error("Empty animation code returned by Gemini.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: SampleAnimation) => {
    setPrompt(sample.prompt);
    setCurrentHtml(sample.html);
    setActivePromptLabel(sample.prompt);
    setIframeKey((prev) => prev + 1);
    setErrorMessage(null);
    setSuccessMessage(`Loaded sample animation: "${sample.title}"`);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(currentHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleCopyPython = () => {
    navigator.clipboard.writeText(PYTHON_APP_PY_CODE);
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2000);
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#F0F2F6] text-[#262730] flex flex-col font-sans">
      {/* Top Header simulating Streamlit App Header */}
      <header id="main-header" className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center font-bold text-lg">
            🎬
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              Text to Animation Generator
            </h1>
            <p className="text-xs text-gray-500">
              Streamlit + Google Gemini 1.5 Flash • HTML5 Canvas Engine
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs sm:text-sm">
          <button
            id="tab-interactive-app"
            onClick={() => setActiveTab("app")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "app"
                ? "bg-white text-gray-900 shadow-xs font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Play className="w-3.5 h-3.5 text-red-500" />
            Live App View
          </button>
          <button
            id="tab-python-source"
            onClick={() => setActiveTab("python")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "python"
                ? "bg-white text-gray-900 shadow-xs font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            Python app.py
          </button>
        </div>
      </header>

      {/* Main Body with Streamlit-style Sidebar & Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Streamlit Sidebar */}
        <aside id="st-sidebar" className="w-full md:w-80 bg-white border-r border-gray-200 p-5 shrink-0 flex flex-col gap-6 overflow-y-auto">
          {/* Sidebar Section: API Key */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
              <Key className="w-4 h-4 text-red-500" />
              <span>API Configuration</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Input your Gemini API key securely. In the Python app, this is handled via{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 text-[11px]">
                st.text_input(..., type="password")
              </code>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 block">
                Google Gemini API Key:
              </label>
              <input
                id="api-key-input"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasEnvKey ? "Using configured Gemini key (or enter custom key)" : "AIzaSy..."}
                className="w-full px-3 py-2 text-xs rounded-md border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden bg-gray-50/50"
              />
              {hasEnvKey && !apiKey && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium pt-0.5">
                  <Check className="w-3 h-3" />
                  <span>Platform Gemini API key connected</span>
                </div>
              )}
            </div>

            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
            >
              Get a free API key at Google AI Studio
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <hr className="border-gray-200" />

          {/* Sidebar Section: Sample Ideas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Sample Animation Ideas</span>
            </div>
            <p className="text-xs text-gray-500">
              Click any sample prompt to instantly test and load pre-rendered animations:
            </p>

            <div className="flex flex-col gap-2">
              {SAMPLE_ANIMATIONS.map((sample) => (
                <button
                  key={sample.id}
                  id={`sample-btn-${sample.id}`}
                  onClick={() => loadSample(sample)}
                  className="text-left px-3 py-2 rounded-md border border-gray-200 bg-gray-50 hover:bg-red-50/60 hover:border-red-200 text-xs transition-colors flex items-start gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-red-700">
                      {sample.title}
                    </div>
                    <div className="text-[11px] text-gray-500 line-clamp-1">
                      {sample.prompt}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Assignment Submission Card */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-900 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-blue-950">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Academic Assignment Info</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Complete single-file <code className="font-bold">app.py</code> and <code className="font-bold">requirements.txt</code> are generated at the workspace root.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                id="sidebar-download-app-py"
                onClick={() => downloadFile("app.py", PYTHON_APP_PY_CODE, "text/x-python")}
                className="flex-1 bg-white hover:bg-blue-100 border border-blue-300 text-blue-700 font-medium py-1 px-2 rounded text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                app.py
              </button>
              <button
                id="sidebar-download-reqs"
                onClick={() => downloadFile("requirements.txt", REQUIREMENTS_TXT_CODE, "text/plain")}
                className="bg-white hover:bg-blue-100 border border-blue-300 text-blue-700 font-medium py-1 px-2 rounded text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                reqs.txt
              </button>
            </div>
          </div>

          {/* Architecture info */}
          <div className="mt-auto text-[11px] text-gray-400 border-t border-gray-100 pt-3">
            Google Gemini 1.5 Flash • 100% Free Architecture • Streamlit HTML5 Canvas
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
          {activeTab === "app" ? (
            <div className="space-y-6">
              {/* Hero Title & Description */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    🎬 Text to Animation Generator
                  </h2>
                </div>
                <p className="text-sm text-gray-600">
                  Transform your natural language ideas into smooth, interactive{" "}
                  <strong className="text-gray-800">HTML5 Canvas animations</strong> using Google Gemini 1.5 Flash.
                </p>
              </div>

              {/* Error Notice (Streamlit st.error style) */}
              {errorMessage && (
                <div id="st-error-box" className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold">Generation Error: </span>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Success Notice (Streamlit st.success style) */}
              {successMessage && (
                <div id="st-success-box" className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1">{successMessage}</div>
                </div>
              )}

              {/* Input Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="prompt-input" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Describe your animation concept:
                  </label>
                  <textarea
                    id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A bouncing red ball with realistic squash-and-stretch gravity physics, or A solar system with glowing planetary orbits..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-hidden bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="text-gray-400 self-center">Try:</span>
                    {SAMPLE_ANIMATIONS.slice(0, 3).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setPrompt(s.prompt)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded text-xs transition-colors"
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>

                  <button
                    id="generate-animation-btn"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Canvas Animation...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Animation
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Canvas Rendering Section (Streamlit components.html) */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                      Live Animation Display (600x400 Canvas)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIframeKey((k) => k + 1)}
                      title="Replay / Restart Animation"
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-colors font-medium"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Replay
                    </button>
                    <button
                      onClick={() => downloadFile("animation.html", currentHtml, "text/html")}
                      title="Download animation.html"
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-colors font-medium"
                    >
                      <Download className="w-3 h-3" />
                      Save HTML
                    </button>
                  </div>
                </div>

                {activePromptLabel && (
                  <div className="text-xs text-gray-500 italic bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                    Active concept: &ldquo;{activePromptLabel}&rdquo;
                  </div>
                )}

                {/* The 600x400 Container simulating Streamlit components.v1.html */}
                <div className="flex justify-center items-center bg-gray-950 p-4 sm:p-6 rounded-lg overflow-hidden shadow-inner">
                  <iframe
                    key={iframeKey}
                    id="animation-canvas-iframe"
                    title="Generated Canvas Animation"
                    srcDoc={currentHtml}
                    sandbox="allow-scripts allow-same-origin"
                    className="w-[600px] h-[400px] max-w-full rounded-md border-0 shadow-lg bg-black"
                    style={{ aspectRatio: "600/400" }}
                  />
                </div>
              </div>

              {/* Streamlit Expander: st.expander for Faculty Code Review */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                <button
                  id="toggle-code-expander"
                  onClick={() => setIsExpanderOpen(!isExpanderOpen)}
                  className="w-full px-5 py-3.5 bg-gray-50/70 hover:bg-gray-100/70 text-left flex items-center justify-between text-sm font-semibold text-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-red-500" />
                    <span>View Generated HTML/JavaScript Source Code (Faculty Review)</span>
                  </div>
                  {isExpanderOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {isExpanderOpen && (
                  <div className="p-5 border-t border-gray-200 bg-gray-900 text-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-mono">
                        Generated Canvas Code ({currentHtml.length} bytes)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          id="copy-html-btn"
                          onClick={handleCopyHtml}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                        >
                          {copiedHtml ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy HTML
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => downloadFile("animation.html", currentHtml, "text/html")}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                      </div>
                    </div>

                    <pre className="text-xs font-mono p-4 bg-gray-950 rounded-lg overflow-x-auto text-emerald-400/90 leading-relaxed max-h-96 border border-gray-800">
                      <code>{currentHtml}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Python app.py & Assignment Code View */
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Complete Python Streamlit Code (`app.py`)
                  </h2>
                  <p className="text-sm text-gray-600">
                    Single-file Python application fulfilling all faculty requirements with comprehensive documentation comments.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="copy-python-btn"
                    onClick={handleCopyPython}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {copiedPython ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        Copied app.py!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </button>
                  <button
                    id="download-app-py-btn"
                    onClick={() => downloadFile("app.py", PYTHON_APP_PY_CODE, "text/x-python")}
                    className="bg-gray-800 hover:bg-gray-900 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    Download app.py
                  </button>
                </div>
              </div>

              {/* Requirement Checklist Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-1">
                  <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    1. UI & UX Architecture
                  </div>
                  <p className="text-gray-500">
                    Title, description, concept text area, sidebar with password input, and generate button.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-1">
                  <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    2. Gemini API Integration
                  </div>
                  <p className="text-gray-500">
                    Uses <code className="text-red-600">google-generativeai</code> with gemini-1.5-flash and the creative coder system prompt.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-1">
                  <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    3. Rendering & Inspection
                  </div>
                  <p className="text-gray-500">
                    Backtick cleaning, <code className="text-red-600">components.html(..., height=600)</code>, and <code className="text-red-600">st.expander</code>.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-1">
                  <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    4. 100% Free Architecture
                  </div>
                  <p className="text-gray-500">
                    Free Gemini Flash tier, no external databases or paid dependencies required.
                  </p>
                </div>
              </div>

              {/* Execution Instructions */}
              <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-lg text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1 text-amber-950">
                  <Layers className="w-4 h-4 text-amber-600" />
                  How to run locally on your machine:
                </div>
                <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs space-y-1">
                  <div>pip install streamlit google-generativeai</div>
                  <div>streamlit run app.py</div>
                </div>
              </div>

              {/* Python Code Display */}
              <div className="bg-gray-900 text-gray-200 rounded-xl overflow-hidden border border-gray-800 shadow-md">
                <div className="bg-gray-950 px-4 py-2.5 flex items-center justify-between border-b border-gray-800 text-xs">
                  <span className="font-mono text-gray-400">app.py (Single-File Streamlit Source)</span>
                  <span className="text-gray-500">Python 3.10+</span>
                </div>
                <pre className="p-4 sm:p-6 text-xs font-mono overflow-x-auto text-emerald-300 leading-relaxed max-h-[600px]">
                  <code>{PYTHON_APP_PY_CODE}</code>
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

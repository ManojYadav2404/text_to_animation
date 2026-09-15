"""
Text to Animation Generator - Streamlit Application
---------------------------------------------------
This application leverages the Google Gemini API (via google-generativeai)
to translate natural language descriptions into complete, interactive
HTML5 / JavaScript Canvas animations rendered live in the Streamlit UI.

Dependencies:
    - streamlit
    - google-generativeai

Usage:
    streamlit run app.py
"""

import os
import re
import streamlit as st
import streamlit.components.v1 as components
import google.generativeai as genai
default_key = os.environ.get("GEMINI_API_KEY", "AQ.Ab8RN6IUPSxJt45nDp8U6uGYVEvNrUMUSaSp9mwLH1VNkaC99g")
# ==============================================================================
# 1. PAGE CONFIGURATION & METADATA
# ==============================================================================
# Set up modern layout, title, and favicon for the Streamlit application
st.set_page_config(
    page_title="Text to Animation Generator",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==============================================================================
# 2. SYSTEM PROMPT DEFINITION
# ==============================================================================
# Strict system prompt instructing the model to generate self-contained HTML/JS Canvas code
SYSTEM_PROMPT = (
    "You are an expert creative coder. The user will give you an animation concept. "
    "You must write a complete, single-file HTML document (combining HTML, CSS, and "
    "JavaScript/Canvas) that animates this concept. The animation must loop smoothly, "
    "be visually appealing, and fit within a 600x400 canvas. Output ONLY valid, "
    "executable HTML code. Do not include markdown code blocks (like ```html), "
    "explanations, or any other text."
)

# ==============================================================================
# 3. HELPER FUNCTIONS
# ==============================================================================
def clean_generated_code(raw_text: str) -> str:
    """
    Strips any residual markdown code fences or backticks (e.g., ```html ... ```)
    that the LLM might hallucinate despite system prompt instructions.
    
    Args:
        raw_text (str): The raw output string from the Gemini API.
        
    Returns:
        str: Pure, executable HTML string without markdown fences.
    """

    cleaned = raw_text.strip()
    
    # Remove leading ```html or ``` markdown markers
    if cleaned.startswith("```html"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
        
    # Remove trailing ``` markdown markers
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
        
    return cleaned.strip()


def generate_animation_html(api_key: str, prompt: str) -> str:
    """
    Configures the Gemini API client, sends the user's prompt to gemini-1.5-flash
    with the strict creative coder system prompt, and returns cleaned HTML code.
    
    Args:
        api_key (str): The Google Gemini API key provided by the user.
        prompt (str): The natural language animation idea.
        
    Returns:
        str: The generated single-file HTML document.
        
    Raises:
        Exception: If the API call fails or encounters network/authentication errors.
    """
    # Configure the google-generativeai SDK with the provided API key
    genai.configure(api_key=api_key)
    
    # Attempt gemini-1.5-flash first (as requested), with graceful fallback to modern versions
    model_candidates = ["gemini-3.5-flash"]
    last_error = None

    for model_name in model_candidates:
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=SYSTEM_PROMPT
            )
            response = model.generate_content(prompt)
            if response and response.text:
                return clean_generated_code(response.text)
        except Exception as err:
            last_error = err
            continue

    raise last_error or ValueError("Gemini returned an empty response. Please try another prompt.")


# ==============================================================================
# 4. STATE MANAGEMENT
# ==============================================================================
# Use Streamlit session state so rendered animations and code persist across re-runs
if "generated_html" not in st.session_state:
    st.session_state.generated_html = None
if "last_prompt" not in st.session_state:
    st.session_state.last_prompt = ""

# ==============================================================================
# 5. SIDEBAR CONFIGURATION (API KEY & HELP)
# ==============================================================================
with st.sidebar:
    #st.header("🔑 API Settings")
    #st.markdown("Enter your Gemini API key to activate the animation generator.")
    # Secure password input for the API key (also checks environment variable fallback)
    api_key_input=default_key
    #api_key_input = st.text_input(label="Gemini API Key",value=default_key,type="password",help="Get a free API key from Google AI Studio at https://aistudio.google.com/",placeholder="AIzaSy...")
    #st.divider()
    
    st.subheader("💡 Sample Ideas")
    sample_ideas = [
        "A bouncing red ball with realistic squash-and-stretch gravity physics",
        "A glowing solar system with orbiting planets and dust trails",
        "Matrix digital green code rain streaming down a dark screen",
        "A pulsating neon jellyfish floating through deep sea particles",
        "A mesmerizing kaleidoscope of geometric rotating fractals"
    ]
    st.markdown("Need inspiration? Try one of these prompts:")
    for idea in sample_ideas:
        st.markdown(f"- *{idea}*")

    st.divider()
    #st.caption("Architecture: 100% free-tier compatible using Google Gemini 3.5 Flash + Streamlit HTML Components.")

# ==============================================================================
# 6. MAIN USER INTERFACE
# ==============================================================================
# Title and overview description
st.title("🎬 Text to Animation Generator")
st.markdown(
    "Turn your natural language concepts into pure **HTML5 / JavaScript Canvas animations**"
)

# Text area for user animation idea
user_prompt = st.text_area(
    label="Describe the animation you want to generate:",
    placeholder="e.g., A bouncing red ball with gravity and trail effects, or A solar system orbiting...",
    height=110
)

# Action button
col1, col2 = st.columns([1, 4])
with col1:
    generate_clicked = st.button("🚀 Generate Animation", type="primary", use_container_width=True)

# ==============================================================================
# 7. GENERATION & ERROR HANDLING PIPELINE
# ==============================================================================
if generate_clicked:
    # 1. Validation: Check if API key is provided
    if not api_key_input.strip():
        st.error("⚠️ Gemini API Key is missing! Please enter your key in the sidebar on the left.")
    # 2. Validation: Check if user prompt is provided
    elif not user_prompt.strip():
        st.warning("⚠️ Please provide an animation concept in the text box before generating.")
    else:
        # Show a progress spinner while contacting Gemini API
        with st.spinner("✨ Please Wait, Generating your animation..."):
            try:
                # Call helper function to run model generation and sanitization
                html_output = generate_animation_html(
                    api_key=api_key_input.strip(),
                    prompt=user_prompt.strip()
                )
                
                # Persist result into session state
                st.session_state.generated_html = html_output
                st.session_state.last_prompt = user_prompt.strip()
                st.success("🎉 Animation generated successfully!")
                
            except Exception as e:
                # Display user-friendly error message if API call or parsing fails
                st.error(f"❌ Failed to generate animation: {str(e)}")

# ==============================================================================
# 8. LIVE RENDERING & CODE INSPECTION EXPANDER
# ==============================================================================
if st.session_state.generated_html:
    st.markdown("---")
    st.subheader("📺 Live Animation Preview")
    if st.session_state.last_prompt:
        st.caption(f"Text : *\"{st.session_state.last_prompt}\"*")
    
    # Render the self-contained HTML/JS canvas within Streamlit iframe component
    # Canvas fits in 600x400, container height is set to 600 for comfortable viewing
    components.html(st.session_state.generated_html, height=600, scrolling=True)
    
    # Code expander showing the exact underlying HTML/CSS/JS written by the AI
    with st.expander("🔍 View Generated HTML/JavaScript Source Code", expanded=False):
        st.markdown(
            "Below is the complete, single-file HTML5 Canvas document genearted :"
        )
        st.code(st.session_state.generated_html, language="html")
        st.download_button(
            label="💾 Download animation.html",
            data=st.session_state.generated_html,
            file_name="animation.html",
            mime="text/html"
        )

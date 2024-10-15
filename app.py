import streamlit as st
import time
import simpleaudio as sa

# App Layout
st.set_page_config(initial_sidebar_state="collapsed", page_title="Metronome App")
st.set_option("client.showWarningDetails", False)
st.title("Metronome App")

# Sidebar for song presets
st.sidebar.title("Presets")

# Initialize presets if not done
if "presets" not in st.session_state:
    st.session_state.presets = {
        "Song 1": {"bpm": 60, "tempo_type": "4/4"},
        "Song 2": {"bpm": 70, "tempo_type": "3/4"},
        "Song 3": {"bpm": 80, "tempo_type": "6/8"},
        "Song 4": {"bpm": 90, "tempo_type": "4/4"},
    }

if "running" not in st.session_state:
    st.session_state.running = False


# Function to update preset
def update_preset(song_name):
    st.session_state.presets[song_name]["bpm"] = st.session_state[f"{song_name}_bpm"]
    st.session_state["bpm"] = st.session_state.presets[song_name]["bpm"]
    st.session_state.presets[song_name]["tempo_type"] = st.session_state[
        f"{song_name}_tempo_type"
    ]
    st.session_state["tempo_type"] = st.session_state.presets[song_name]["tempo_type"]


@st.cache_data
def load_audio(file_path):
    return sa.WaveObject.from_wave_file(file_path)


# Display and edit presets
for song_name in st.session_state.presets:
    st.sidebar.subheader(song_name)
    col1, col2, col3 = st.sidebar.columns(3)
    with col1:
        st.number_input(
            f"BPM for {song_name}",
            key=f"{song_name}_bpm",
            value=st.session_state.presets[song_name]["bpm"],
            min_value=40,
            max_value=160,
        )
    with col2:
        st.selectbox(
            f"Tempo for {song_name}",
            options=["4/4", "3/4", "6/8"],
            key=f"{song_name}_tempo_type",
            index=["4/4", "3/4", "6/8"].index(
                st.session_state.presets[song_name]["tempo_type"]
            ),
        )
    with col3:
        st.write("")
        st.button(
            f"Set",
            key=f"Set {song_name}",
            on_click=update_preset,
            args=(song_name,),
            type="primary",
        )

# Main app area
tempo_type = st.radio(
    "Tempo Type", key="tempo_type", options=["4/4", "3/4", "6/8"], horizontal=True
)
bpm = st.slider("BPM", min_value=40, max_value=160, value=60, key="bpm")

# Calculate beat interval and number of dots
num_beats = int(tempo_type.split("/")[0])
beat_unit = int(tempo_type.split("/")[1]) / 4
beat_interval = 60 / bpm / beat_unit


st.write(f"Current Settings: {tempo_type} - {bpm} BPM")
col_beat_1, col_beat_2, col_beat_3 = st.columns([1, 3, 5])
col_beat_1.text("")
col_beat_1.text("")
start_metronome = col_beat_1.button("Start")
flash_placeholder = col_beat_2.markdown("# " + " ".join(["○ "] * num_beats))
col_beat_3.text("")
col_beat_3.text("")
stop_metronome = col_beat_3.button("Stop")

# Sound files
hi_beat_sound = load_audio("sounds/Synth_Bell_B_hi.wav")
lo_beat_sound = load_audio("sounds/Synth_Bell_B_lo.wav")

# Metronome loop
if start_metronome:
    st.session_state.running = True

if stop_metronome:
    st.session_state.running = False

while st.session_state.running:
    for i in range(num_beats):

        # Stop if the button was pressed
        if not st.session_state.running:
            break

        # Play the sound and flash dots
        if not i:
            hi_beat_sound.play()
        else:
            lo_beat_sound.play()
        flash_placeholder.markdown("# " + "● " * (i + 1) + "○ " * (num_beats - i - 1))
        time.sleep(beat_interval)

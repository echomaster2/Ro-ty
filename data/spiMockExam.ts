
import { AssessmentQuestion } from './courseContent';

export const spiMockExamQuestions: AssessmentQuestion[] = [
  {
    question: "What is the propagation speed of sound in soft tissue?",
    options: ["330 m/s", "1,450 m/s", "1,540 m/s", "3,500 m/s"],
    correctAnswer: 2,
    explanation: "The average propagation speed of sound in soft tissue is 1,540 m/s (or 1.54 mm/µs).",
    domain: "Fundamentals"
  },
  {
    question: "Which of the following is an acoustic variable?",
    options: ["Frequency", "Period", "Density", "Propagation speed"],
    correctAnswer: 2,
    explanation: "The three acoustic variables are Pressure, Density, and Distance (particle motion).",
    domain: "Fundamentals"
  },
  {
    question: "If the frequency of a transducer is doubled, what happens to the period?",
    options: ["Doubled", "Quadrupled", "Halved", "Unchanged"],
    correctAnswer: 2,
    explanation: "Frequency and period are inversely related (f = 1/T). Doubling frequency halves the period.",
    domain: "Fundamentals"
  },
  {
    question: "What determines the propagation speed of sound in a medium?",
    options: ["The transducer frequency", "The sound source", "The medium's density and stiffness", "The pulse duration"],
    correctAnswer: 2,
    explanation: "Propagation speed is determined solely by the characteristics of the medium (stiffness and density).",
    domain: "Fundamentals"
  },
  {
    question: "Which of the following media has the highest propagation speed?",
    options: ["Air", "Fat", "Soft tissue", "Bone"],
    correctAnswer: 3,
    explanation: "Bone is the stiffest medium listed and has the highest propagation speed (approx. 3,500 m/s).",
    domain: "Fundamentals"
  },
  {
    question: "What is the relationship between frequency and wavelength in soft tissue?",
    options: ["Directly proportional", "Inversely proportional", "Unrelated", "Logarithmic"],
    correctAnswer: 1,
    explanation: "Wavelength = c / f. In a given medium (constant c), frequency and wavelength are inversely proportional.",
    domain: "Fundamentals"
  },
  {
    question: "Attenuation is the result of which three processes?",
    options: ["Reflection, refraction, and diffraction", "Absorption, reflection, and scattering", "Transmission, reflection, and refraction", "Absorption, scattering, and interference"],
    correctAnswer: 1,
    explanation: "Attenuation is the weakening of the sound beam as it travels, caused by absorption (conversion to heat), reflection, and scattering.",
    domain: "Fundamentals"
  },
  {
    question: "Which of the following will increase the amount of attenuation?",
    options: ["Lower frequency", "Shorter path length", "Higher frequency", "Lower density"],
    correctAnswer: 2,
    explanation: "Higher frequency sound waves attenuate more rapidly than lower frequency waves.",
    domain: "Fundamentals"
  },
  {
    question: "What is the attenuation coefficient in soft tissue?",
    options: ["0.5 dB/cm/MHz", "1.0 dB/cm/MHz", "1.54 dB/cm/MHz", "2.0 dB/cm/MHz"],
    correctAnswer: 0,
    explanation: "The attenuation coefficient in soft tissue is approximately 0.5 dB per centimeter for every megahertz of frequency.",
    domain: "Fundamentals"
  },
  {
    question: "A 3 dB increase in intensity represents a change of how much?",
    options: ["Double", "Triple", "Tenfold", "Half"],
    correctAnswer: 0,
    explanation: "A 3 dB increase means the intensity has doubled.",
    domain: "Fundamentals"
  },
  {
    question: "What is required for reflection to occur at an interface?",
    options: ["Oblique incidence", "Different propagation speeds", "Difference in acoustic impedances", "Identical densities"],
    correctAnswer: 2,
    explanation: "Reflection occurs when there is a difference in acoustic impedance (Z = ρc) between two media at an interface with normal incidence.",
    domain: "Fundamentals"
  },
  {
    question: "What two conditions are required for refraction to occur?",
    options: ["Normal incidence and different impedances", "Oblique incidence and different propagation speeds", "Oblique incidence and different densities", "Normal incidence and different frequencies"],
    correctAnswer: 1,
    explanation: "Refraction (bending of the transmitted beam) requires oblique incidence and a difference in propagation speeds between the two media.",
    domain: "Fundamentals"
  },
  {
    question: "The 13-microsecond rule states that for every 13 µs of go-return time, the reflector is how deep?",
    options: ["1 mm", "2 mm", "1 cm", "2 cm"],
    correctAnswer: 2,
    explanation: "In soft tissue, it takes 13 µs for sound to travel 1 cm and return (total distance 2 cm).",
    domain: "Fundamentals"
  },
  {
    question: "What is the thickness of the matching layer in a transducer?",
    options: ["1/2 wavelength", "1/4 wavelength", "1 wavelength", "2 wavelengths"],
    correctAnswer: 1,
    explanation: "The matching layer is typically 1/4 wavelength thick.",
    domain: "Instrumentation"
  },
  {
    question: "What is the thickness of the piezoelectric crystal (PZT)?",
    options: ["1/2 wavelength", "1/4 wavelength", "1 wavelength", "2 wavelengths"],
    correctAnswer: 0,
    explanation: "The PZT crystal is typically 1/2 wavelength thick.",
    domain: "Instrumentation"
  },
  {
    question: "What is the purpose of the damping material (backing material)?",
    options: ["Increase sensitivity", "Increase pulse duration", "Reduce spatial pulse length", "Narrow the bandwidth"],
    correctAnswer: 2,
    explanation: "Damping material reduces the 'ringing' of the crystal, shortening the pulse duration and spatial pulse length, which improves axial resolution.",
    domain: "Instrumentation"
  },
  {
    question: "Which of the following is a consequence of damping material?",
    options: ["Increased sensitivity", "Narrow bandwidth", "Low Q-factor", "Longer pulses"],
    correctAnswer: 2,
    explanation: "Damping decreases sensitivity, increases bandwidth, and lowers the Quality (Q) factor.",
    domain: "Instrumentation"
  },
  {
    question: "Axial resolution is also known by which mnemonic?",
    options: ["LATA", "LARRD", "ALARA", "NYQUIST"],
    correctAnswer: 1,
    explanation: "LARRD stands for Longitudinal, Axial, Range, Radial, and Depth resolution.",
    domain: "Resolution"
  },
  {
    question: "What determines axial resolution?",
    options: ["Beam diameter", "Spatial pulse length", "Transducer diameter", "Focusing"],
    correctAnswer: 1,
    explanation: "Axial resolution = SPL / 2. Shorter pulses improve axial resolution.",
    domain: "Resolution"
  },
  {
    question: "Lateral resolution is also known by which mnemonic?",
    options: ["LARRD", "LATA", "ALARA", "TGC"],
    correctAnswer: 1,
    explanation: "LATA stands for Lateral, Angular, Transverse, and Azimuthal resolution.",
    domain: "Resolution"
  },
  {
    question: "What determines lateral resolution?",
    options: ["Spatial pulse length", "Beam diameter", "Damping", "Frequency"],
    correctAnswer: 1,
    explanation: "Lateral resolution is equal to the beam diameter. Narrower beams improve lateral resolution.",
    domain: "Resolution"
  },
  {
    question: "Where is lateral resolution the best?",
    options: ["At the transducer face", "In the far field", "At the focus", "At the dead zone"],
    correctAnswer: 2,
    explanation: "Lateral resolution is best at the focus, where the beam is narrowest.",
    domain: "Resolution"
  },
  {
    question: "Which type of resolution is usually superior in clinical imaging?",
    options: ["Axial", "Lateral", "Elevational", "Temporal"],
    correctAnswer: 0,
    explanation: "Axial resolution is typically better than lateral resolution because ultrasound pulses are shorter than they are wide.",
    domain: "Resolution"
  },
  {
    question: "What is the Fresnel zone?",
    options: ["The far field", "The focal point", "The near field", "The Fraunhofer zone"],
    correctAnswer: 2,
    explanation: "The Fresnel zone is the near field (the region from the transducer to the focus).",
    domain: "Transducers"
  },
  {
    question: "What is the Fraunhofer zone?",
    options: ["The near field", "The focal point", "The far field", "The Fresnel zone"],
    correctAnswer: 2,
    explanation: "The Fraunhofer zone is the far field (the region starting from the focus and extending deeper).",
    domain: "Transducers"
  },
  {
    question: "Which transducer creates a rectangular image?",
    options: ["Linear Phased Array", "Linear Sequential Array", "Convex Array", "Annular Array"],
    correctAnswer: 1,
    explanation: "A linear sequential (or switched) array creates a rectangular image.",
    domain: "Transducers"
  },
  {
    question: "Which transducer uses electronic steering and electronic focusing?",
    options: ["Mechanical Transducer", "Linear Phased Array", "Linear Sequential Array", "All of the above"],
    correctAnswer: 1,
    explanation: "Linear phased arrays use electronic steering and focusing.",
    domain: "Transducers"
  },
  {
    question: "What happens if a crystal is damaged in a mechanical transducer?",
    options: ["Vertical line of dropout", "Horizontal line of dropout", "Entire image is lost", "Erratic steering"],
    correctAnswer: 2,
    explanation: "Since a mechanical transducer has only one crystal, if it breaks, the entire image is lost.",
    domain: "Transducers"
  },
  {
    question: "What happens if a crystal is damaged in a linear phased array?",
    options: ["Vertical line of dropout", "Horizontal line of dropout", "Erratic steering and focusing", "No effect"],
    correctAnswer: 2,
    explanation: "In a phased array, all crystals contribute to every pulse, so damage results in erratic steering and focusing.",
    domain: "Transducers"
  },
  {
    question: "Which transducer has a ring-shaped crystal and provides the best elevational resolution?",
    options: ["Linear Phased Array", "Annular Phased Array", "Convex Array", "Vector Array"],
    correctAnswer: 1,
    explanation: "Annular phased arrays use concentric rings to provide a thin slice (good elevational resolution).",
    domain: "Transducers"
  },
  {
    question: "Temporal resolution is determined by what factor?",
    options: ["Spatial pulse length", "Frame rate", "Beam diameter", "Damping"],
    correctAnswer: 1,
    explanation: "Temporal resolution (resolution in time) is determined by the frame rate. Higher frame rates improve temporal resolution.",
    domain: "Instrumentation"
  },
  {
    question: "Which of the following will decrease the frame rate?",
    options: ["Decreasing depth", "Decreasing sector width", "Increasing the number of focal zones", "Decreasing line density"],
    correctAnswer: 2,
    explanation: "Increasing the number of focal zones requires more pulses per scan line, which takes more time and decreases the frame rate.",
    domain: "Instrumentation"
  },
  {
    question: "What are the five functions of the receiver in order?",
    options: ["Amplification, Compensation, Compression, Demodulation, Rejection", "Amplification, Compression, Compensation, Rejection, Demodulation", "Compression, Amplification, Compensation, Demodulation, Rejection", "Rejection, Demodulation, Compression, Compensation, Amplification"],
    correctAnswer: 0,
    explanation: "The mnemonic is 'ACCDR': Amplification, Compensation (TGC), Compression (Dynamic Range), Demodulation, and Rejection.",
    domain: "Instrumentation"
  },
  {
    question: "Which receiver function is responsible for correcting for attenuation?",
    options: ["Amplification", "Compensation", "Compression", "Rejection"],
    correctAnswer: 1,
    explanation: "Compensation (TGC) creates an image that is uniformly bright from top to bottom by compensating for attenuation.",
    domain: "Instrumentation"
  },
  {
    question: "Which receiver function reduces the dynamic range of the signals?",
    options: ["Amplification", "Compensation", "Compression", "Demodulation"],
    correctAnswer: 2,
    explanation: "Compression reduces the range between the largest and smallest signals to a level the display can handle.",
    domain: "Instrumentation"
  },
  {
    question: "What are the two parts of demodulation?",
    options: ["Rectification and Smoothing", "Amplification and Rejection", "Compression and Compensation", "Steering and Focusing"],
    correctAnswer: 0,
    explanation: "Demodulation consists of Rectification (converting negative voltages to positive) and Smoothing/Enveloping.",
    domain: "Instrumentation"
  },
  {
    question: "What receiver function eliminates low-level noise?",
    options: ["Amplification", "Compensation", "Compression", "Rejection"],
    correctAnswer: 3,
    explanation: "Rejection (Threshold) removes weak, low-level echoes that are likely noise.",
    domain: "Instrumentation"
  },
  {
    question: "How many shades of gray can be represented by 4 bits?",
    options: ["4", "8", "16", "32"],
    correctAnswer: 2,
    explanation: "Number of shades = 2^n. 2^4 = 16.",
    domain: "Instrumentation"
  },
  {
    question: "Where does coded excitation take place?",
    options: ["In the receiver", "In the pulser", "In the display", "In the scan converter"],
    correctAnswer: 1,
    explanation: "Coded excitation occurs in the pulser.",
    domain: "Instrumentation"
  },
  {
    question: "What is the purpose of write magnification (write zoom)?",
    options: ["Enlarge an existing image", "Re-scan a region of interest with more pixels", "Improve temporal resolution", "Reduce line density"],
    correctAnswer: 1,
    explanation: "Write zoom is a pre-processing function that re-scans the area with more pixels, improving spatial resolution.",
    domain: "Instrumentation"
  },
  {
    question: "Which of the following is a post-processing function?",
    options: ["TGC", "Write magnification", "Read magnification", "Coded excitation"],
    correctAnswer: 2,
    explanation: "Read magnification (zoom) is performed on frozen data and is a post-processing function.",
    domain: "Instrumentation"
  },
  {
    question: "What is the Doppler shift?",
    options: ["The frequency of the transmitted beam", "The difference between received and transmitted frequencies", "The speed of the blood cells", "The angle of the beam"],
    correctAnswer: 1,
    explanation: "Doppler shift = Received frequency - Transmitted frequency.",
    domain: "Doppler"
  },
  {
    question: "What happens to the Doppler shift if the velocity of blood doubles?",
    options: ["Halved", "Doubled", "Quadrupled", "Unchanged"],
    correctAnswer: 1,
    explanation: "Doppler shift is directly proportional to velocity.",
    domain: "Doppler"
  },
  {
    question: "At what angle is the Doppler shift at its maximum?",
    options: ["0 degrees", "60 degrees", "90 degrees", "180 degrees"],
    correctAnswer: 0,
    explanation: "The cosine of 0 is 1.0, which provides the maximum shift.",
    domain: "Doppler"
  },
  {
    question: "At what angle is the Doppler shift zero?",
    options: ["0 degrees", "45 degrees", "90 degrees", "180 degrees"],
    correctAnswer: 2,
    explanation: "The cosine of 90 is 0, so no shift is detected at a perpendicular angle.",
    domain: "Doppler"
  },
  {
    question: "What is the Nyquist limit?",
    options: ["PRF / 2", "2 * PRF", "Transmitted frequency / 2", "Wavelength * Frequency"],
    correctAnswer: 0,
    explanation: "The Nyquist limit is the highest Doppler frequency that can be measured without aliasing, equal to half the PRF.",
    domain: "Doppler"
  },
  {
    question: "Which of the following will reduce aliasing?",
    options: ["Increasing frequency", "Increasing depth", "Increasing PRF (Scale)", "Decreasing the Doppler angle"],
    correctAnswer: 2,
    explanation: "Increasing the PRF (Scale) raises the Nyquist limit, reducing aliasing.",
    domain: "Doppler"
  },
  {
    question: "Which Doppler modality is subject to aliasing?",
    options: ["Continuous Wave Doppler", "Pulsed Wave Doppler", "Power Doppler", "All of the above"],
    correctAnswer: 1,
    explanation: "Pulsed Wave Doppler is subject to aliasing because it is a sampling technique.",
    domain: "Doppler"
  },
  {
    question: "What is the primary advantage of Continuous Wave Doppler?",
    options: ["Range resolution", "Ability to measure high velocities", "No aliasing", "Both B and C"],
    correctAnswer: 3,
    explanation: "CW Doppler can measure very high velocities without aliasing, but it lacks range resolution (range ambiguity).",
    domain: "Doppler"
  },
  {
    question: "What does the color in Color Doppler represent?",
    options: ["Peak velocities", "Mean velocities", "Exact velocities", "Volume of flow"],
    correctAnswer: 1,
    explanation: "Color Doppler reports mean (average) velocities.",
    domain: "Doppler"
  },
  {
    question: "What is the primary advantage of Power Doppler?",
    options: ["Directional information", "High sensitivity to slow flow", "No aliasing", "High frame rate"],
    correctAnswer: 1,
    explanation: "Power Doppler is very sensitive to slow flow and is independent of angle, but it provides no directional information.",
    domain: "Doppler"
  },
  {
    question: "Which artifact appears as a 'step-off' or 'split' image due to sound bending?",
    options: ["Reverberation", "Refraction", "Mirror Image", "Shadowing"],
    correctAnswer: 1,
    explanation: "Refraction artifact occurs when the beam bends and the system incorrectly places a second copy of the reflector side-by-side.",
    domain: "Artifacts"
  },
  {
    question: "Which artifact is caused by multiple reflections between two strong reflectors?",
    options: ["Comet Tail", "Reverberation", "Ring Down", "All of the above"],
    correctAnswer: 3,
    explanation: "Reverberation, Comet Tail, and Ring Down are all caused by multiple reflections.",
    domain: "Artifacts"
  },
  {
    question: "Shadowing is caused by what process?",
    options: ["High attenuation", "Low attenuation", "Refraction", "Speed error"],
    correctAnswer: 0,
    explanation: "Shadowing occurs behind structures with high attenuation (like bone or stones).",
    domain: "Artifacts"
  },
  {
    question: "Enhancement is caused by what process?",
    options: ["High attenuation", "Low attenuation", "Reflection", "Scattering"],
    correctAnswer: 1,
    explanation: "Enhancement occurs behind structures with low attenuation (like cysts).",
    domain: "Artifacts"
  },
  {
    question: "Which artifact places a copy of a structure deeper than the original?",
    options: ["Refraction", "Mirror Image", "Side Lobes", "Grating Lobes"],
    correctAnswer: 1,
    explanation: "Mirror image artifact occurs when sound reflects off a strong specular reflector (like the diaphragm), placing a copy deeper.",
    domain: "Artifacts"
  },
  {
    question: "What causes side lobes and grating lobes?",
    options: ["Refraction", "Energy outside the main beam", "High attenuation", "Speed errors"],
    correctAnswer: 1,
    explanation: "Lobes are extra beams of energy outside the main axis that can create 'clutter' or false reflections.",
    domain: "Artifacts"
  },
  {
    question: "How are grating lobes reduced?",
    options: ["Damping", "Apodization and Subdicing", "TGC", "Increasing frequency"],
    correctAnswer: 1,
    explanation: "Apodization (varying voltage) and subdicing (splitting crystals) reduce grating lobes.",
    domain: "Artifacts"
  },
  {
    question: "If the propagation speed is 1,400 m/s, where will the reflector be placed?",
    options: ["Too shallow", "Too deep", "Correct depth", "Side-by-side"],
    correctAnswer: 1,
    explanation: "If the speed is slower than 1,540 m/s, the echo takes longer to return, and the system places it too deep.",
    domain: "Artifacts"
  },
  {
    question: "What does ALARA stand for?",
    options: ["As Low As Reasonably Achievable", "Always Look At Real Anatomy", "Acoustic Levels And Radiation Awareness", "As Long As Results Appear"],
    correctAnswer: 0,
    explanation: "ALARA is the principle of minimizing patient exposure by using the lowest output power necessary.",
    domain: "Safety"
  },
  {
    question: "Which index is associated with tissue heating?",
    options: ["Mechanical Index", "Thermal Index", "Attenuation Index", "Refraction Index"],
    correctAnswer: 1,
    explanation: "The Thermal Index (TI) estimates the potential for temperature rise.",
    domain: "Safety"
  },
  {
    question: "Which index is associated with cavitation?",
    options: ["Thermal Index", "Mechanical Index", "Dynamic Index", "Quality Index"],
    correctAnswer: 1,
    explanation: "The Mechanical Index (MI) estimates the potential for mechanical bioeffects, specifically cavitation.",
    domain: "Safety"
  },
  {
    question: "What is stable cavitation?",
    options: ["Bubbles burst", "Bubbles oscillate but do not burst", "Bubbles disappear", "Bubbles create shockwaves"],
    correctAnswer: 1,
    explanation: "In stable cavitation, gas bubbles expand and contract but remain intact.",
    domain: "Safety"
  },
  {
    question: "What is transient (inertial) cavitation?",
    options: ["Bubbles oscillate", "Bubbles burst violently", "Bubbles grow slowly", "No bubbles are formed"],
    correctAnswer: 1,
    explanation: "Transient cavitation involves the violent collapse of bubbles, creating localized high temperatures and shockwaves.",
    domain: "Safety"
  },
  {
    question: "Which tissue type is most susceptible to heating?",
    options: ["Fat", "Muscle", "Bone", "Fluid"],
    correctAnswer: 2,
    explanation: "Bone absorbs significantly more energy than soft tissue, leading to faster heating.",
    domain: "Safety"
  },
  {
    question: "What is the SPTA intensity limit for an unfocused beam?",
    options: ["100 mW/cm²", "720 mW/cm²", "1000 mW/cm²", "94 mW/cm²"],
    correctAnswer: 0,
    explanation: "The AIUM limit for an unfocused beam is 100 mW/cm² SPTA.",
    domain: "Safety"
  },
  {
    question: "What is the SPTA intensity limit for a focused beam?",
    options: ["100 mW/cm²", "1000 mW/cm² (1 W/cm²)", "720 mW/cm²", "94 mW/cm²"],
    correctAnswer: 1,
    explanation: "The AIUM limit for a focused beam is 1000 mW/cm² (or 1 W/cm²) SPTA.",
    domain: "Safety"
  },
  {
    question: "Which device is used to measure the output of a transducer?",
    options: ["Tissue Phantom", "Hydrophone", "AIUM Test Object", "Calipers"],
    correctAnswer: 1,
    explanation: "A hydrophone (micro-transducer) measures acoustic pressure and intensity.",
    domain: "Safety"
  },
  {
    question: "What is the purpose of a tissue-equivalent phantom?",
    options: ["Measure output power", "Evaluate grayscale and resolution", "Test for cavitation", "Calibrate the monitor"],
    correctAnswer: 1,
    explanation: "Tissue phantoms mimic soft tissue properties to test system performance (resolution, sensitivity, etc.).",
    domain: "QA"
  },
  {
    question: "What is the 'dead zone'?",
    options: ["The far field", "The region closest to the probe where no data is seen", "The focal zone", "The shadow behind a stone"],
    correctAnswer: 1,
    explanation: "The dead zone is the near-field area where the system cannot image due to crystal ringing.",
    domain: "QA"
  },
  {
    question: "How can you image a structure in the dead zone?",
    options: ["Increase gain", "Decrease frequency", "Use an acoustic standoff pad", "Increase power"],
    correctAnswer: 2,
    explanation: "A standoff pad (gel block) moves the anatomy further from the probe, out of the dead zone.",
    domain: "QA"
  },
  {
    question: "What is the vertical registration accuracy test?",
    options: ["Checking side-to-side placement", "Checking depth placement accuracy", "Checking resolution", "Checking gray shades"],
    correctAnswer: 1,
    explanation: "Vertical registration (range accuracy) checks if the system places reflectors at the correct depth.",
    domain: "QA"
  },
  {
    question: "According to Bernoulli's principle, what happens to velocity at a stenosis?",
    options: ["Decreases", "Increases", "Stays the same", "Becomes zero"],
    correctAnswer: 1,
    explanation: "Velocity increases at a narrowing to maintain flow rate (Continuity Equation).",
    domain: "Hemodynamics"
  },
  {
    question: "According to Bernoulli's principle, what happens to pressure at a stenosis?",
    options: ["Increases", "Decreases", "Stays the same", "Fluctuates"],
    correctAnswer: 1,
    explanation: "As velocity increases at a stenosis, the pressure decreases.",
    domain: "Hemodynamics"
  },
  {
    question: "Which factor has the greatest effect on flow resistance in Poiseuille's Law?",
    options: ["Viscosity", "Vessel length", "Vessel radius", "Pressure gradient"],
    correctAnswer: 2,
    explanation: "Resistance is inversely proportional to the radius to the 4th power. Small changes in radius cause massive changes in resistance.",
    domain: "Hemodynamics"
  },
  {
    question: "What Reynolds number indicates turbulent flow?",
    options: ["< 1,500", "Exactly 1,540", "> 2,000", "> 10,000"],
    correctAnswer: 2,
    explanation: "A Reynolds number greater than 2,000 typically indicates turbulence.",
    domain: "Hemodynamics"
  },
  {
    question: "What is the primary cause of spectral broadening?",
    options: ["Laminar flow", "Plug flow", "Turbulent flow", "High PRF"],
    correctAnswer: 2,
    explanation: "Turbulence creates many different velocities, which 'fills in' the spectral window.",
    domain: "Hemodynamics"
  },
  {
    question: "What is the frequency of infrasound?",
    options: ["< 20 Hz", "20 Hz to 20,000 Hz", "> 20,000 Hz", "> 2 MHz"],
    correctAnswer: 0,
    explanation: "Infrasound is below the range of human hearing (< 20 Hz).",
    domain: "Fundamentals"
  },
  {
    question: "What is the frequency of ultrasound?",
    options: ["< 20 Hz", "20 Hz to 20,000 Hz", "> 20,000 Hz", "> 2 MHz"],
    correctAnswer: 2,
    explanation: "Ultrasound is above the range of human hearing (> 20,000 Hz or 20 kHz).",
    domain: "Fundamentals"
  },
  {
    question: "What is the frequency range of diagnostic medical ultrasound?",
    options: ["20 Hz to 20 kHz", "20 kHz to 100 kHz", "2 MHz to 15 MHz", "100 MHz to 500 MHz"],
    correctAnswer: 2,
    explanation: "Diagnostic ultrasound typically operates between 2 MHz and 15 MHz.",
    domain: "Fundamentals"
  },
  {
    question: "What happens to the intensity if the amplitude is tripled?",
    options: ["Tripled", "Increased by 6 dB", "Increased 9 times", "Halved"],
    correctAnswer: 2,
    explanation: "Intensity is proportional to amplitude squared. 3^2 = 9.",
    domain: "Fundamentals"
  },
  {
    question: "Which of the following is a unit of power?",
    options: ["Watts", "Watts/cm²", "dB", "Pascals"],
    correctAnswer: 0,
    explanation: "Power is measured in Watts.",
    domain: "Fundamentals"
  },
  {
    question: "Which of the following is a unit of intensity?",
    options: ["Watts", "Watts/cm²", "dB", "Pascals"],
    correctAnswer: 1,
    explanation: "Intensity is Power / Area, measured in W/cm².",
    domain: "Fundamentals"
  },
  {
    question: "What is the duty factor of a typical pulsed-wave system?",
    options: ["< 1%", "10%", "50%", "100%"],
    correctAnswer: 0,
    explanation: "Pulsed ultrasound spends most of its time listening, so the duty factor is very low (usually 0.1% to 1%).",
    domain: "Fundamentals"
  },
  {
    question: "What is the relationship between PRF and depth?",
    options: ["Directly proportional", "Inversely proportional", "Unrelated", "Logarithmic"],
    correctAnswer: 1,
    explanation: "As depth increases, the system must wait longer for echoes, so the PRF decreases.",
    domain: "Fundamentals"
  },
  {
    question: "What is the relationship between PRP and depth?",
    options: ["Directly proportional", "Inversely proportional", "Unrelated", "Logarithmic"],
    correctAnswer: 0,
    explanation: "As depth increases, the PRP (time from start of one pulse to the next) increases.",
    domain: "Fundamentals"
  },
  {
    question: "Which resolution is improved by using a high-frequency transducer?",
    options: ["Axial", "Lateral", "Both A and B", "Temporal"],
    correctAnswer: 2,
    explanation: "High frequency improves axial resolution (shorter SPL) and lateral resolution (less divergence in the far field).",
    domain: "Resolution"
  },
  {
    question: "What is the purpose of the matching layer?",
    options: ["Protect the crystal", "Reduce the impedance mismatch", "Focus the beam", "Increase damping"],
    correctAnswer: 1,
    explanation: "The matching layer reduces the reflection at the skin interface, allowing more sound to enter the body.",
    domain: "Instrumentation"
  },
  {
    question: "What is the bandwidth?",
    options: ["The center frequency", "The range of frequencies in a pulse", "The Q-factor", "The pulse duration"],
    correctAnswer: 1,
    explanation: "Bandwidth is the range of frequencies between the highest and lowest in a pulse.",
    domain: "Instrumentation"
  },
  {
    question: "Which transducer has a fixed focal point?",
    options: ["Linear Phased Array", "Mechanical Transducer", "Convex Array", "Annular Array"],
    correctAnswer: 1,
    explanation: "Mechanical transducers use a single crystal and a fixed lens or curved crystal for focusing.",
    domain: "Transducers"
  },
  {
    question: "What is the shape of the image created by a convex (curved) array?",
    options: ["Rectangular", "Sector", "Blunted Sector", "Circular"],
    correctAnswer: 2,
    explanation: "A convex array creates a blunted sector (curved top) image.",
    domain: "Transducers"
  },
  {
    question: "What is the purpose of the beam former?",
    options: ["Amplify echoes", "Control the timing of the pulses", "Display the image", "Store the data"],
    correctAnswer: 1,
    explanation: "The beam former controls the electronic steering and focusing by timing the electrical spikes to the crystals.",
    domain: "Instrumentation"
  },
  {
    question: "What is the dynamic range?",
    options: ["The range of frequencies", "The ratio of the largest to smallest signals", "The depth of the image", "The frame rate"],
    correctAnswer: 1,
    explanation: "Dynamic range is the ratio of the largest to smallest signal amplitudes that a system can process.",
    domain: "Instrumentation"
  },
  {
    question: "Which component has the widest dynamic range?",
    options: ["Transducer/Receiver", "Scan Converter", "Display", "Archive"],
    correctAnswer: 0,
    explanation: "The dynamic range is widest at the beginning of the chain (transducer) and narrows as it moves toward the display.",
    domain: "Instrumentation"
  },
  {
    question: "What is the function of the scan converter?",
    options: ["Amplify signals", "Store image data and convert it for display", "Create the sound pulse", "Focus the beam"],
    correctAnswer: 1,
    explanation: "The scan converter stores the image data and converts it from 'spoke' format to 'video' format.",
    domain: "Instrumentation"
  },
  {
    question: "What is the smallest element of a digital picture?",
    options: ["Bit", "Byte", "Pixel", "Voxel"],
    correctAnswer: 2,
    explanation: "A pixel is the smallest building block of a digital image.",
    domain: "Instrumentation"
  },
  {
    question: "What is the smallest amount of computer memory?",
    options: ["Bit", "Byte", "Pixel", "Word"],
    correctAnswer: 0,
    explanation: "A bit (binary digit) is the smallest unit of digital memory.",
    domain: "Instrumentation"
  },
  {
    question: "Which of the following will improve spatial resolution?",
    options: ["Higher pixel density", "Lower line density", "Read zoom", "Lower frequency"],
    correctAnswer: 0,
    explanation: "Higher pixel density (more pixels per inch) improves spatial detail.",
    domain: "Resolution"
  },
  {
    question: "What is the purpose of persistence (temporal averaging)?",
    options: ["Improve temporal resolution", "Reduce noise and smooth the image", "Increase frame rate", "Improve axial resolution"],
    correctAnswer: 1,
    explanation: "Persistence averages frames over time to reduce random noise and create a smoother image, but it decreases temporal resolution.",
    domain: "Instrumentation"
  },
  {
    question: "What is the Doppler equation?",
    options: ["Δf = 2fv cosθ / c", "Δf = c / f", "Δf = SPL / 2", "Δf = PRF / 2"],
    correctAnswer: 0,
    explanation: "Δf = 2 * transmitted frequency * velocity * cos(angle) / propagation speed.",
    domain: "Doppler"
  },
  {
    question: "What is the cosine of 60 degrees?",
    options: ["0", "0.5", "0.707", "1.0"],
    correctAnswer: 1,
    explanation: "The cosine of 60 degrees is 0.5. At this angle, you detect exactly half the true Doppler shift.",
    domain: "Doppler"
  },
  {
    question: "What is the cosine of 90 degrees?",
    options: ["0", "0.5", "1.0", "-1.0"],
    correctAnswer: 0,
    explanation: "The cosine of 90 degrees is 0. No Doppler shift is detected perpendicular to flow.",
    domain: "Doppler"
  },
  {
    question: "Which Doppler technique uses the fast Fourier transform (FFT)?",
    options: ["Color Doppler", "Spectral Doppler (PW and CW)", "Power Doppler", "M-mode"],
    correctAnswer: 1,
    explanation: "FFT is the mathematical process used to process spectral Doppler signals.",
    domain: "Doppler"
  },
  {
    question: "Which Doppler technique uses autocorrelation?",
    options: ["Spectral Doppler", "Color Doppler", "Continuous Wave Doppler", "A-mode"],
    correctAnswer: 1,
    explanation: "Autocorrelation is the faster (but less accurate) process used for Color Doppler.",
    domain: "Doppler"
  },
  {
    question: "What is the 'clutter' artifact in Doppler?",
    options: ["Aliasing", "Low-frequency shifts from tissue motion", "High-frequency noise", "Mirror image"],
    correctAnswer: 1,
    explanation: "Clutter is caused by the movement of vessel walls or heart valves.",
    domain: "Artifacts"
  },
  {
    question: "How is clutter removed?",
    options: ["Increase scale", "Wall filter", "Decrease gain", "Increase frequency"],
    correctAnswer: 1,
    explanation: "A wall filter (high-pass filter) removes low-frequency clutter.",
    domain: "Doppler"
  },
  {
    question: "What is the primary cause of the 'crosstalk' artifact?",
    options: ["Aliasing", "Doppler gain too high or angle near 90 degrees", "Low PRF", "Refraction"],
    correctAnswer: 1,
    explanation: "Crosstalk is a mirror image of the spectral waveform appearing on the other side of the baseline.",
    domain: "Artifacts"
  },
  {
    question: "Which artifact is caused by the sound beam being wider than the structure being imaged?",
    options: ["Axial resolution artifact", "Slice thickness (elevational) artifact", "Refraction artifact", "Shadowing"],
    correctAnswer: 1,
    explanation: "Slice thickness artifact (or partial volume filling) occurs when the beam is thick and picks up echoes from outside the intended plane.",
    domain: "Artifacts"
  },
  {
    question: "What is the primary factor that determines the axial resolution of a transducer?",
    options: ["Beam diameter", "Spatial pulse length", "Transducer diameter", "Focusing"],
    correctAnswer: 1,
    explanation: "Axial resolution is determined by the spatial pulse length (SPL). Shorter pulses result in better axial resolution.",
    domain: "Resolution"
  },
  {
    question: "Which of the following describes the relationship between frequency and penetration depth?",
    options: ["Directly proportional", "Inversely proportional", "Unrelated", "Logarithmic"],
    correctAnswer: 1,
    explanation: "Higher frequency sound waves attenuate more quickly and therefore have less penetration depth than lower frequency waves.",
    domain: "Fundamentals"
  }
];

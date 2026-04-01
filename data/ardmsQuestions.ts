
export type ARDMSQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  domain: 'SPI' | 'Abdomen' | 'OB/GYN' | 'Vascular' | 'Echo';
};

export const ardmsPracticeQuestions: ARDMSQuestion[] = [
  {
    id: "q1",
    domain: "SPI",
    question: "Acoustic impedance is defined as the product of which two parameters?",
    options: [
      "Frequency and wavelength",
      "Density and propagation speed",
      "Intensity and power",
      "Amplitude and period"
    ],
    correctAnswer: 1,
    explanation: "Acoustic impedance (Z) is calculated by multiplying the density (ρ) of the medium by the propagation speed (c) of sound in that medium (Z = ρc)."
  },
  {
    id: "q2",
    domain: "SPI",
    question: "Which of the following will improve axial resolution?",
    options: [
      "Increasing the transducer frequency",
      "Decreasing the damping material",
      "Increasing the beam diameter",
      "Decreasing the matching layer thickness"
    ],
    correctAnswer: 0,
    explanation: "Axial resolution is improved by shortening the spatial pulse length (SPL). Higher frequency transducers produce shorter wavelengths, which decreases the SPL and improves axial resolution."
  },
  {
    id: "q3",
    domain: "Vascular",
    question: "According to Bernoulli's principle, what happens to the pressure at the site of a significant arterial stenosis?",
    options: [
      "Pressure increases",
      "Pressure decreases",
      "Pressure remains constant",
      "Pressure fluctuates randomly"
    ],
    correctAnswer: 1,
    explanation: "Bernoulli's principle states that as the velocity of a fluid increases (as it does through a stenosis), the pressure exerted by that fluid decreases."
  },
  {
    id: "q4",
    domain: "Abdomen",
    question: "When comparing the echogenicity of the normal liver to the normal renal cortex, which statement is true?",
    options: [
      "The liver is hypoechoic to the renal cortex",
      "The liver is hyperechoic or isoechoic to the renal cortex",
      "The renal cortex is always hyperechoic to the liver",
      "The liver and renal cortex should be anechoic"
    ],
    correctAnswer: 1,
    explanation: "In a normal patient, the liver parenchyma should be slightly more echogenic (hyperechoic) or equal in echogenicity (isoechoic) to the renal cortex."
  },
  {
    id: "q5",
    domain: "OB/GYN",
    question: "What is the first structure typically visualized within the gestational sac to confirm an intrauterine pregnancy?",
    options: [
      "Fetal pole",
      "Yolk sac",
      "Amniotic membrane",
      "Chorionic villi"
    ],
    correctAnswer: 1,
    explanation: "The yolk sac is the first structure seen within the gestational sac, typically appearing around 5-5.5 weeks of gestation, confirming an intrauterine pregnancy."
  },
  {
    id: "q6",
    domain: "Echo",
    question: "Which cardiac valve is located between the left atrium and the left ventricle?",
    options: [
      "Tricuspid valve",
      "Pulmonary valve",
      "Aortic valve",
      "Mitral valve"
    ],
    correctAnswer: 3,
    explanation: "The mitral (bicuspid) valve separates the left atrium from the left ventricle."
  },
  {
    id: "q7",
    domain: "SPI",
    question: "The Nyquist limit, which defines the onset of aliasing in pulsed-wave Doppler, is equal to:",
    options: [
      "The pulse repetition frequency (PRF)",
      "One-half of the pulse repetition frequency (PRF/2)",
      "Twice the pulse repetition frequency (2 * PRF)",
      "The operating frequency of the transducer"
    ],
    correctAnswer: 1,
    explanation: "Aliasing occurs when the Doppler shift frequency exceeds the Nyquist limit, which is half of the pulse repetition frequency (PRF/2)."
  },
  {
    id: "q8",
    domain: "SPI",
    question: "Which artifact is characterized by a series of equally spaced reflections located at increasing depths?",
    options: [
      "Shadowing",
      "Enhancement",
      "Reverberation",
      "Mirror image"
    ],
    correctAnswer: 2,
    explanation: "Reverberation artifact is caused by multiple reflections between two strong reflectors, appearing as equally spaced horizontal lines at increasing depths."
  },
  {
    id: "q9",
    domain: "SPI",
    question: "The ALARA principle stands for:",
    options: [
      "As Low As Reasonably Achievable",
      "Always Look At Real-time Anatomy",
      "Acoustic Levels And Radiation Awareness",
      "As Long As Results Appear"
    ],
    correctAnswer: 0,
    explanation: "ALARA (As Low As Reasonably Achievable) is the fundamental safety principle in ultrasound, emphasizing the use of minimum output power and exposure time to obtain diagnostic information."
  },
  {
    id: "q10",
    domain: "SPI",
    question: "Which receiver function is responsible for reducing the dynamic range of the signals to a level that the display can handle?",
    options: [
      "Amplification",
      "Compensation",
      "Compression",
      "Demodulation"
    ],
    correctAnswer: 2,
    explanation: "Compression (also known as dynamic range) reduces the difference between the largest and smallest signal amplitudes, allowing the system to display the wide range of echoes on a monitor with limited grayscale levels."
  },
  {
    id: "q11",
    domain: "SPI",
    question: "The duty factor for a continuous wave (CW) ultrasound system is:",
    options: [
      "0.1%",
      "1%",
      "50%",
      "100%"
    ],
    correctAnswer: 3,
    explanation: "Duty factor is the percentage of time the system is transmitting sound. For continuous wave ultrasound, the system is always transmitting, so the duty factor is 100% (or 1.0)."
  },
  {
    id: "q12",
    domain: "SPI",
    question: "Which type of resolution is determined by the thickness of the ultrasound beam?",
    options: [
      "Axial resolution",
      "Lateral resolution",
      "Elevational resolution",
      "Temporal resolution"
    ],
    correctAnswer: 2,
    explanation: "Elevational resolution (or slice thickness resolution) is determined by the thickness of the ultrasound beam perpendicular to the imaging plane."
  },
  {
    id: "q13",
    domain: "SPI",
    question: "What is the primary advantage of using a coded excitation technique?",
    options: [
      "Improved temporal resolution",
      "Improved signal-to-noise ratio",
      "Reduced patient exposure",
      "Increased frame rate"
    ],
    correctAnswer: 1,
    explanation: "Coded excitation involves transmitting a long, complex pulse and then decoding it upon reception. This technique significantly improves the signal-to-noise ratio and penetration without increasing peak intensity."
  },
  {
    id: "q14",
    domain: "SPI",
    question: "The Doppler shift is directly proportional to which of the following?",
    options: [
      "The cosine of the Doppler angle",
      "The propagation speed of sound",
      "The depth of the reflector",
      "The pulse repetition period"
    ],
    correctAnswer: 0,
    explanation: "The Doppler equation (Δf = 2 * f₀ * v * cosθ / c) shows that the Doppler shift (Δf) is directly proportional to the cosine of the angle (θ) between the sound beam and the direction of flow."
  },
  {
    id: "q15",
    domain: "SPI",
    question: "Which of the following will increase the frame rate of an ultrasound system?",
    options: [
      "Increasing the imaging depth",
      "Increasing the number of focal zones",
      "Decreasing the sector width",
      "Increasing the line density"
    ],
    correctAnswer: 2,
    explanation: "Frame rate is inversely related to the time required to create a single frame. Decreasing the sector width reduces the number of scan lines needed per frame, which decreases the frame time and increases the frame rate."
  },
  {
    id: "q16",
    domain: "SPI",
    question: "What is the purpose of the matching layer in an ultrasound transducer?",
    options: [
      "To protect the piezoelectric element",
      "To reduce the spatial pulse length",
      "To reduce the impedance mismatch between the crystal and the skin",
      "To focus the ultrasound beam"
    ],
    correctAnswer: 2,
    explanation: "The matching layer has an acoustic impedance between that of the piezoelectric crystal and the skin, which reduces the reflection at the transducer-skin interface and improves the transmission of sound into the body."
  },
  {
    id: "q17",
    domain: "SPI",
    question: "Which of the following is a characteristic of turbulent flow?",
    options: [
      "Parabolic velocity profile",
      "Spectral broadening on a Doppler display",
      "Uniform velocity across the vessel",
      "High pressure and low velocity"
    ],
    correctAnswer: 1,
    explanation: "Turbulent flow is characterized by chaotic, multi-directional flow patterns. On a spectral Doppler display, this results in spectral broadening, where the clear 'window' under the systolic peak is filled in."
  },
  {
    id: "q18",
    domain: "SPI",
    question: "The mechanical index (MI) is most closely related to which bioeffect?",
    options: [
      "Thermal heating",
      "Cavitation",
      "Acoustic streaming",
      "Radiation force"
    ],
    correctAnswer: 1,
    explanation: "The mechanical index (MI) is a parameter used to estimate the likelihood of non-thermal bioeffects, specifically cavitation (the formation and behavior of gas bubbles in a sound field)."
  },
  {
    id: "q19",
    domain: "SPI",
    question: "Which of the following will occur if the propagation speed of the medium is greater than 1,540 m/s?",
    options: [
      "Reflectors will be placed too deep on the display",
      "Reflectors will be placed too shallow on the display",
      "Reflectors will appear larger than their actual size",
      "The image will be distorted laterally"
    ],
    correctAnswer: 1,
    explanation: "Ultrasound systems assume a constant propagation speed of 1,540 m/s. If the actual speed is faster, the echoes return sooner than expected, and the system places the reflectors at a shallower depth than their true location."
  },
  {
    id: "q20",
    domain: "SPI",
    question: "What is the primary function of the wall filter in Doppler ultrasound?",
    options: [
      "To eliminate high-frequency noise",
      "To eliminate low-frequency, high-amplitude signals from vessel walls",
      "To increase the sensitivity to slow flow",
      "To prevent aliasing in pulsed-wave Doppler"
    ],
    correctAnswer: 1,
    explanation: "The wall filter (or high-pass filter) is used to remove low-frequency Doppler shifts caused by the movement of vessel walls or heart valves, which can otherwise obscure the signals from moving blood cells."
  }
];

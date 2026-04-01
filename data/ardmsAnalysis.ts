
export interface ARDMSConcept {
  title: string;
  summary: string;
}

export interface ARDMSPitfall {
  title: string;
  explanation: string;
}

export const criticalConcepts: ARDMSConcept[] = [
  {
    title: "Acoustic Impedance (Z)",
    summary: "The resistance to sound travel in a medium, calculated as Z = density × propagation speed. Mismatches at interfaces cause reflections."
  },
  {
    title: "Axial Resolution",
    summary: "Ability to distinguish reflectors parallel to the beam. Improved by higher frequency and shorter spatial pulse length (SPL)."
  },
  {
    title: "Lateral Resolution",
    summary: "Ability to distinguish reflectors perpendicular to the beam. Determined by beam width; best at the focal point."
  },
  {
    title: "Doppler Equation",
    summary: "Relates Doppler shift to velocity, frequency, and the cosine of the angle. Critical for accurate blood flow measurement."
  },
  {
    title: "Attenuation",
    summary: "The reduction in intensity and amplitude as sound travels. Caused by absorption (primary), reflection, and scattering."
  },
  {
    title: "ALARA Principle",
    summary: "As Low As Reasonably Achievable. Minimizing output power and exposure time to reduce potential bioeffects."
  },
  {
    title: "Nyquist Limit",
    summary: "The maximum Doppler shift that can be measured without aliasing (PRF/2). Increasing PRF or using CW Doppler avoids aliasing."
  },
  {
    title: "Piezoelectric Effect",
    summary: "The conversion of electrical energy to mechanical energy (and vice-versa) by certain crystals (e.g., PZT) in the transducer."
  },
  {
    title: "Dynamic Range",
    summary: "The range of signal amplitudes that a system can process and display. Compression reduces this range for display compatibility."
  },
  {
    title: "Temporal Resolution",
    summary: "The ability to accurately locate moving structures in time. Determined by frame rate; improved by reducing depth and sector width."
  },
  {
    title: "Reflection (Specular vs. Diffuse)",
    summary: "Specular reflection occurs at large, smooth interfaces (e.g., diaphragm). Diffuse reflection (scattering) occurs at small, rough interfaces."
  },
  {
    title: "Refraction",
    summary: "The bending of a sound beam as it crosses an interface at an oblique angle with different propagation speeds. Follows Snell's Law."
  },
  {
    title: "Duty Factor",
    summary: "The percentage of time the system is transmitting. PW systems have low duty factors (<1%), while CW is 100%."
  },
  {
    title: "Mechanical Index (MI)",
    summary: "An indicator of the likelihood of non-thermal bioeffects (cavitation). Related to peak rarefactional pressure and frequency."
  },
  {
    title: "Thermal Index (TI)",
    summary: "An indicator of the potential for tissue heating. TIS (soft tissue), TIB (bone), and TIC (cranial bone) are specific types."
  }
];

export const commonPitfalls: ARDMSPitfall[] = [
  {
    title: "Confusing Axial and Lateral Resolution",
    explanation: "Candidates often mix up the factors affecting each. Remember: Axial is parallel (SPL), Lateral is perpendicular (Beam Width)."
  },
  {
    title: "Incorrect Doppler Angle Correction",
    explanation: "Failing to align the angle cursor with the direction of flow leads to significant errors in velocity calculations. 0-60 degrees is ideal."
  },
  {
    title: "Misinterpreting Aliasing as Reversed Flow",
    explanation: "Aliasing occurs when the Doppler shift is too high. It looks like flow is wrapping around the baseline, not necessarily reversing direction."
  },
  {
    title: "Over-reliance on Auto-Optimization",
    explanation: "Relying solely on 'Auto' buttons without understanding manual TGC, Gain, and Dynamic Range adjustments can lead to sub-optimal imaging."
  },
  {
    title: "Ignoring Artifacts (or Misidentifying Them)",
    explanation: "Artifacts like reverberation, shadowing, and enhancement can provide diagnostic clues or hide pathology if not correctly identified."
  },
  {
    title: "Misunderstanding the Relationship between PRF and Depth",
    explanation: "Increasing depth automatically decreases PRF, which can lead to aliasing in Doppler. This inverse relationship is a frequent exam topic."
  },
  {
    title: "Neglecting Bioeffects and Safety Indices",
    explanation: "While rare in clinical practice, understanding MI and TI and the ALARA principle is heavily tested for patient safety assurance."
  }
];

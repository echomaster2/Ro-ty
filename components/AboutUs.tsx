import React from 'react';
import { 
  Book, Activity, ShieldCheck, GraduationCap, Monitor, 
  HeartHandshake, Briefcase, Microscope, Scale, 
  ClipboardCheck, Compass, Globe, Sparkles 
} from 'lucide-react';

const AboutUs: React.FC = () => {
  const components = [
    {
      icon: <Book className="w-6 h-6 text-gold-main" />,
      title: "1. Curriculum",
      details: [
        "Core Courses: Fundamental courses covering anatomy, physiology, medical terminology, and pathology.",
        "Specialized Courses: In-depth courses on abdominal, obstetric, gynecologic, vascular, and cardiac sonography.",
        "Physics and Instrumentation: Mastering sound waves and ultrasound equipment operation."
      ]
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-gold-main" />,
      title: "2. Student Support",
      details: [
        "Academic Advising: Guidance on course selection and career path planning.",
        "Mentoring: Peer and faculty support to ensure academic success.",
        "Counseling: Access to mental health and wellness resources."
      ]
    },
    {
      icon: <Briefcase className="w-6 h-6 text-gold-main" />,
      title: "3. Prof. Development",
      details: [
        "Workshops: Regular seminars on resume writing and interview strategies.",
        "Professional Orgs: Integration with the Society of Diagnostic Medical Sonography (SDMS)."
      ]
    },
    {
      icon: <Microscope className="w-6 h-6 text-gold-main" />,
      title: "4. Research Opportunities",
      details: [
        "Research Projects: Opportunities to conduct original ultrasound technology research.",
        "Publications: Support for presenting and publishing clinical findings."
      ]
    },
    {
      icon: <Scale className="w-6 h-6 text-gold-main" />,
      title: "5. Ethics & Professionalism",
      details: [
        "Ethics Training: Deep dives into patient confidentiality and medical ethics.",
        "Behavioral Standards: Developing professional demeanor and communication skills."
      ]
    },
    {
      icon: <ClipboardCheck className="w-6 h-6 text-gold-main" />,
      title: "6. Assessment",
      details: [
        "Regular Evaluations: Quizzes, exams, and practical skill assessments.",
        "Feedback Loops: Continuous input from supervisors to drive clinical improvement."
      ]
    },
    {
      icon: <Compass className="w-6 h-6 text-gold-main" />,
      title: "7. Career Services",
      details: [
        "Job Placement: Assistance with finding internships, externships, and careers.",
        "Alumni Network: Access to a global community of working sonographers."
      ]
    },
    {
      icon: <Globe className="w-6 h-6 text-gold-main" />,
      title: "8. Community Engagement",
      details: [
        "Outreach: Participating in community health fairs and screenings.",
        "Volunteerism: Encouragement to gain experience in various healthcare settings."
      ]
    }
  ];

  return (
    <section id="about-us" className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10 text-left">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-16 md:mb-24 space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-gold-main/10 border border-gold-main/20 text-[11px] md:text-[12px] font-black text-gold-main uppercase tracking-[0.3em] md:tracking-[0.4em]">
             <Sparkles size={14} /> Our Educational Ecosystem
          </div>
          <h2 className="text-3xl md:text-6xl font-serif font-bold text-white tracking-tight leading-tight uppercase italic">
            The Pillars of <br className="hidden md:block" /> <span className="text-gold-main italic font-normal not-italic">Sonography Mastery</span>
          </h2>
          <p className="text-base md:text-xl text-slate-300 font-light leading-relaxed font-sans border-l-2 border-gold-main/20 pl-6 italic">
            Our comprehensive ultrasound physics review program is meticulously designed for sonography students who are preparing to take their ARDMS® SPI board exam.
          </p>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {components.map((item, index) => (
            <div key={index} className="glass-panel group p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 hover:border-gold-main/30 transition-all duration-700 bg-white/[0.02]">
              <div className="flex flex-col h-full gap-5 md:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-gold-main/10 transition-all duration-500">
                  {item.icon}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-white group-hover:text-gold-main transition-colors uppercase italic">
                    {item.title}
                  </h3>
                  <ul className="space-y-3">
                    {item.details.map((detail, dIdx) => (
                      <li key={dIdx} className="text-xs md:text-sm text-slate-400 font-sans leading-relaxed flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-main/30 mt-1.5 shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Conclusion Banner */}
        <div className="mt-16 md:mt-24 p-8 md:p-12 bg-gold-main/5 border border-gold-main/20 rounded-[2rem] md:rounded-[3rem] text-center backdrop-blur-xl">
           <p className="text-lg md:text-2xl text-slate-200 font-serif font-light leading-relaxed italic max-w-4xl mx-auto">
             "By incorporating these key components, our ultrasound physics review program provides a well-rounded education that prepares <span className="text-gold-main font-bold">sonography students</span> for successful ARDMS® SPI certification and beyond."
           </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
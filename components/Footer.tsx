
import React from 'react';
import { Heart, Bot } from 'lucide-react';

interface FooterProps {
  onOpenLegal?: (type: 'terms' | 'privacy') => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLegalClick = (e: React.MouseEvent, type: 'terms' | 'privacy') => {
    e.preventDefault();
    onOpenLegal?.(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white/5 backdrop-blur-3xl text-slate-400 py-16 md:py-24 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center md:text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-20">
            <div className="col-span-1 md:col-span-1 space-y-6 flex flex-col items-center md:items-start">
                <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-slate-900 backdrop-blur-sm rounded-xl border border-white/10 flex items-center justify-center text-gold-main shadow-sm">
                        <Bot size={20} />
                     </div>
                     <h3 className="text-white font-serif font-semibold text-xl tracking-tight">EchoMasters</h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-400 font-sans max-w-xs mx-auto md:mx-0">Elevating sonography education since 2002. A legacy of precision, clarity, and thoughtful mentorship.</p>
                <div className="flex items-center gap-2 text-gold-main/60">
                  <Heart className="w-3 h-3 fill-current" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">For Sonographers</span>
                </div>
            </div>
            <div>
                <h4 className="text-white font-serif font-semibold mb-6 md:mb-8 uppercase text-[10px] tracking-[0.3em]">Instructional Lab</h4>
                <ul className="space-y-4 text-[13px] font-sans">
                    <li><a href="#study-guides" onClick={(e) => scrollToSection(e, 'study-guides')} className="hover:text-gold-main transition-colors">SPI Physics Mastery</a></li>
                    <li><a href="#" className="hover:text-gold-main transition-colors">Abdominal Anatomy</a></li>
                    <li><a href="#" className="hover:text-gold-main transition-colors">Vascular Principles</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-serif font-semibold mb-6 md:mb-8 uppercase text-[10px] tracking-[0.3em]">The Studio</h4>
                <ul className="space-y-4 text-[13px] font-sans">
                    <li><a href="#" className="hover:text-gold-main transition-colors">Academic Board</a></li>
                    <li><a href="#" className="hover:text-gold-main transition-colors">Curriculum FAQ</a></li>
                    <li><a href="#" className="hover:text-gold-main transition-colors">Academic Support</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-serif font-semibold mb-6 md:mb-8 uppercase text-[10px] tracking-[0.3em]">Protocols</h4>
                <ul className="space-y-4 text-[13px] font-sans">
                    <li><a href="#" onClick={(e) => handleLegalClick(e, 'privacy')} className="hover:text-gold-main transition-colors">Privacy Protocol</a></li>
                    <li><a href="#" onClick={(e) => handleLegalClick(e, 'terms')} className="hover:text-gold-main transition-colors">Terms of Traversing</a></li>
                </ul>
            </div>
        </div>
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center text-[9px] md:text-[11px] text-slate-500 font-sans font-medium uppercase tracking-widest gap-6">
            <p>&copy; {new Date().getFullYear()} EchoMasters Academic Media. All Rights Reserved.</p>
            <div className="flex items-center gap-4 md:gap-6">
                <span>Designed with Grace</span>
                <span className="w-1 h-1 bg-gold-main/20 rounded-full"></span>
                <span>Optimized for Clarity</span>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

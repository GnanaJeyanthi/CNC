import { Send, Heart, Play, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-4 lg:col-span-5">
            <div className="flex items-center gap-2 font-bold text-2xl text-textMain tracking-tight mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              CastNCart
            </div>
            <p className="text-textMuted max-w-sm mb-8 leading-relaxed">
              Where makers broadcast their craft in real time and you shop the moment it's finished.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-textMuted hover:bg-gray-50 hover:text-primary transition-colors"><Send className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-textMuted hover:bg-gray-50 hover:text-primary transition-colors"><Heart className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-textMuted hover:bg-gray-50 hover:text-primary transition-colors"><Play className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-textMuted hover:bg-gray-50 hover:text-primary transition-colors"><Globe className="w-4 h-4" /></a>
            </div>
          </div>
          
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-textMain mb-6">Company</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-sm text-textMuted hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-sm text-textMuted hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="/about" className="text-sm text-textMuted hover:text-primary transition-colors">Press</Link></li>
                <li><Link to="/about" className="text-sm text-textMuted hover:text-primary transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-textMain mb-6">Resources</h4>
              <ul className="space-y-4">
                <li><Link to="/live" className="text-sm text-textMuted hover:text-primary transition-colors">Live Now</Link></li>
                <li><Link to="/categories" className="text-sm text-textMuted hover:text-primary transition-colors">Categories</Link></li>
                <li><Link to="/sell" className="text-sm text-textMuted hover:text-primary transition-colors">Sell on CastNCart</Link></li>
                <li><Link to="/about" className="text-sm text-textMuted hover:text-primary transition-colors">Creator Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-textMain mb-6">Support</h4>
              <ul className="space-y-4">
                <li><Link to="/contact" className="text-sm text-textMuted hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="text-sm text-textMuted hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link to="/about" className="text-sm text-textMuted hover:text-primary transition-colors">Shipping</Link></li>
                <li><Link to="/about" className="text-sm text-textMuted hover:text-primary transition-colors">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-textMain mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-sm text-textMuted hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/about" className="text-sm text-textMuted hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/about" className="text-sm text-textMuted hover:text-primary transition-colors">Cookie Policy</Link></li>
                <li><Link to="/about" className="text-sm text-textMuted hover:text-primary transition-colors">Guidelines</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-textMuted">
            &copy; {new Date().getFullYear()} CastNCart Inc. All rights reserved.
          </p>
          <div className="flex gap-4 items-center bg-gray-50 px-3 py-1.5 rounded-full border border-border">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="text-xs text-textMain font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

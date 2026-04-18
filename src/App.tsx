/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pencil, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Facebook, 
  Video, 
  Type, 
  Image as ImageIcon, 
  Save, 
  Lock,
  Upload,
  ChevronDown,
  Layout,
  Instagram,
  Twitter,
  Github,
  MoveVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Columns,
  Square,
  Settings2,
  ImagePlus
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from './lib/utils';
import { 
  DEFAULT_BLOG_DATA, 
  DEFAULT_THEME, 
  DEFAULT_SOCIALS,
  BlogItem, 
  BlogTheme, 
  SectionType, 
  SocialLink,
  Alignment,
  LayoutMode 
} from './types';

// --- Types Fix ---
const PLATFORM_ICONS = {
  facebook: Facebook,
  tiktok: ({ size }: { size: number }) => <TiktokIcon size={size} />,
  instagram: Instagram,
  twitter: Twitter,
  github: Github
};

// --- Sortable Item Component ---

// --- Scroll Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

function SortableItem({ id, children }: { id: string, children: React.ReactNode, key?: React.Key }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/sort">
      {children}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing opacity-0 group-hover/sort:opacity-100 transition-opacity hidden lg:flex"
      >
        <MoveVertical size={16} className="text-slate-400" />
      </div>
    </div>
  );
}

// --- Components ---

const TypewriterText = ({ messages, color }: { messages: string[], color?: string }) => {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const handleTyping = () => {
      const currentFullText = messages[index % messages.length] || '';
      
      if (!isDeleting) {
        if (displayText.length < currentFullText.length) {
          setDisplayText(currentFullText.slice(0, displayText.length + 1));
          setTypingSpeed(100 + Math.random() * 80);
        } else {
          // Pause at end
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentFullText.slice(0, displayText.length - 1));
          setTypingSpeed(50);
        } else {
          // Pause at start before next word
          setIsDeleting(false);
          setIndex((prev) => prev + 1);
          setTypingSpeed(500); // Wait bit before next message
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, messages, typingSpeed]);

  return (
    <div className="min-h-[1.5em] font-sans text-lg md:text-xl font-semibold" style={{ color: color || 'inherit' }}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-0.5 h-6 ml-1 align-middle"
        style={{ backgroundColor: color || 'currentColor' }}
      />
    </div>
  );
};

// --- Main App ---

export default function App() {
  // State
  const [blogData, setBlogData] = useState<BlogItem[]>([]);
  const [theme, setTheme] = useState<BlogTheme>(DEFAULT_THEME);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load Data
  useEffect(() => {
    const savedData = localStorage.getItem('zandel_blog_v3_data');
    const savedTheme = localStorage.getItem('zandel_blog_v3_theme');
    const savedSocials = localStorage.getItem('zandel_blog_v3_socials');
    
    if (savedData) setBlogData(JSON.parse(savedData));
    else setBlogData(DEFAULT_BLOG_DATA);

    if (savedTheme) {
      const parsedTheme = JSON.parse(savedTheme);
      setTheme({ ...DEFAULT_THEME, ...parsedTheme });
    }
    if (savedSocials) setSocials(JSON.parse(savedSocials));
    else setSocials(DEFAULT_SOCIALS);
  }, []);

  // Save Data
  const saveData = () => {
    try {
      localStorage.setItem('zandel_blog_v3_data', JSON.stringify(blogData));
      localStorage.setItem('zandel_blog_v3_theme', JSON.stringify(theme));
      localStorage.setItem('zandel_blog_v3_socials', JSON.stringify(socials));
      alert('All changes saved successfully!');
      setShowAdminModal(false);
      setIsAdmin(false);
    } catch (e) {
      console.error('Storage error:', e);
      alert('Error: Could not save all changes. You might have uploaded files that are too large for the browser memory.');
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (blogData.length === 0) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('zandel_blog_v3_data', JSON.stringify(blogData));
        localStorage.setItem('zandel_blog_v3_theme', JSON.stringify(theme));
        localStorage.setItem('zandel_blog_v3_socials', JSON.stringify(socials));
      } catch (e) {
        console.error('Auto-save storage error:', e);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [blogData, theme, socials]);

  // Admin Actions
  const handleAdminToggle = () => {
    setShowAdminModal(true);
  };

  const handleLogin = () => {
    if (passwordInput === '123') {
      setIsAdmin(true);
      setShowAdminModal(true); // Keep modal open for editing
      setPasswordInput('');
    } else {
      alert('Incorrect password');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlogData((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addSection = (type: SectionType) => {
    const newSection: BlogItem = {
      id: Date.now().toString(),
      type,
      title: 'New ' + type,
      content: type === 'text' ? 'New text content...' : 
               type === 'image' ? 'https://picsum.photos/seed/new/800/600' :
               'https://www.w3schools.com/html/mov_bbb.mp4',
      size: 100,
      fontSize: 50,
      alignment: 'center',
      layout: 'standard',
    };
    setBlogData([...blogData, newSection]);
    setEditingItemId(newSection.id);
  };

  const toggleHide = (id: string) => {
    setBlogData(blogData.map(s => s.id === id ? { ...s, isHidden: !s.isHidden } : s));
  };

  const updateSection = (id: string, updates: Partial<BlogItem>) => {
    setBlogData(blogData.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSection = (id: string) => {
    if (confirm('Delete this section?')) {
      setBlogData(blogData.filter(s => s.id !== id));
      if (editingItemId === id) setEditingItemId(null);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onprogress = (ev) => {
        if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
      };
      reader.onloadend = () => {
        setTheme({ ...theme, backgroundImage: reader.result as string, backgroundColor: 'transparent' });
        setUploadProgress(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSocial = () => {
    setSocials([...socials, { id: Date.now().toString(), platform: 'facebook', url: '' }]);
  };

  const updateSocial = (id: string, updates: Partial<SocialLink>) => {
    setSocials(socials.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSocial = (id: string) => {
    setSocials(socials.filter(s => s.id !== id));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileUploadRef = useRef<HTMLInputElement>(null);

  const activeItem = blogData.find(i => i.id === editingItemId);

  return (
    <div 
      className={cn(
        "min-h-screen transition-all duration-500 ease-in-out flex flex-col",
        theme.fontFamily,
      )}
      style={{ 
        backgroundColor: theme.backgroundColor,
        filter: theme.hue ? `hue-rotate(${theme.hue}deg)` : 'none',
        backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* Top Bar */}
      <header className="px-10 py-5 flex justify-between items-center bg-transparent z-[60]">
        <div className="font-extrabold text-2xl tracking-tighter">
          {theme.logoText || 'Z.R'}
        </div>
        <button 
          onClick={handleAdminToggle}
          className={cn(
            "p-3 rounded-full transition-all shadow-vibrant hover:scale-110 active:scale-95 relative",
            isAdmin ? "bg-accent text-white" : "bg-accent text-white"
          )}
        >
          {isAdmin ? <Settings2 size={20} /> : <Pencil size={20} />}
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 px-10 pb-10">
        {/* Sidebar Landing Card */}
        <aside className={cn(
          "landing-side flex flex-col items-center text-center bg-white rounded-[24px] shadow-vibrant transition-all overflow-hidden",
          "lg:sticky lg:top-5 h-fit",
          "max-lg:relative max-lg:w-full max-lg:mb-4"
        )}>
           {/* Cover Image */}
           <div className="w-full h-32 relative group/cover">
              <img 
                src={theme.profileCoverImage || 'https://picsum.photos/seed/cover/800/200'}
                alt="Cover"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
           </div>

           <div className="px-8 pb-8 -mt-16 relative z-10 w-full flex flex-col items-center">
              <div className="relative group mb-5">
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-secondary to-accent p-1 shadow-vibrant overflow-hidden border-4 border-white flex items-center justify-center">
                  <img 
                    src={theme.profileImage} 
                    alt="Zandel Ragay" 
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <h1 className="text-2xl font-extrabold mb-1">{theme.profileName}</h1>
              <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">{theme.profileDesignation}</div>
              
              <div className="flex gap-4 mb-6">
                 {socials.map(s => {
                   const Icon = PLATFORM_ICONS[s.platform];
                   return (
                     <a 
                       key={s.id}
                       href={s.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
                     >
                       <Icon size={16} />
                     </a>
                   );
                 })}
              </div>

              <div className="w-full">
                 <div className="bg-[#fdf6e3] p-5 rounded-2xl text-left text-sm leading-relaxed border border-[#ece0c8]">
                    <strong className="block mb-1 text-accent uppercase text-[10px] tracking-widest">Bio</strong>
                    <p className="text-slate-600 whitespace-pre-wrap">{theme.profileBio}</p>
                 </div>
              </div>
           </div>
        </aside>

        {/* Content Side */}
        <div className="flex flex-col gap-8">
          {/* Typewriter Banner */}
          <div 
             className="h-16 rounded-2xl flex items-center px-8 text-white font-bold text-lg shadow-vibrant"
             style={{ backgroundColor: theme.bannerBgColor || '#40E0D0' }}
          >
            <TypewriterText 
              messages={theme.bannerMessages || DEFAULT_THEME.bannerMessages} 
              color={theme.typewriterColor}
            />
          </div>

          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={blogData.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-12 pb-24">
                {blogData.map((section) => (
                  <SortableItem key={section.id} id={section.id}>
                    <motion.div
                      variants={sectionVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-50px" }}
                      className={cn(
                        "relative bg-white rounded-[24px] p-8 shadow-vibrant transition-all overflow-hidden border border-transparent hover:border-accent/10",
                        section.isHidden && !isAdmin ? "hidden" : "",
                        section.isHidden && isAdmin ? "opacity-30" : ""
                      )}
                    >
                      <div 
                        className={cn(
                          "flex flex-col gap-6",
                          section.layout === 'side-by-side' ? "md:flex-row md:items-start" : ""
                        )}
                        style={{ textAlign: section.alignment as any }}
                      >
                         {/* Side by side primary element (Text or Image) */}
                        <div 
                          className={cn(
                            "mx-auto flex flex-col gap-4",
                            section.layout === 'side-by-side' ? "md:w-1/2" : "w-full"
                          )}
                          style={{ maxWidth: `${section.size}%` }}
                        >
                          {section.type === 'text' && (
                            <div className="space-y-4">
                              <h2 className="text-2xl font-extrabold text-accent">{section.title}</h2>
                              <p 
                                className="leading-relaxed text-ink opacity-80"
                                style={{ fontSize: `${10 + (section.fontSize || 50) * 0.4}px` }}
                              >
                                {section.content}
                              </p>
                            </div>
                          )}

                          {section.type === 'image' && (
                            <div className="space-y-4 group/image">
                              {section.title && <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>}
                              <div className="relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 p-2 shadow-inner">
                                <img 
                                  src={section.content} 
                                  alt={section.title} 
                                  className="w-full h-auto rounded-xl object-cover transition-transform duration-700 group-hover/image:scale-105" 
                                  style={{ maxHeight: '600px' }}
                                />
                                {(section.subheading || section.description) && (
                                  <div className="mt-4 p-4 bg-slate-50/80 rounded-xl text-left border border-slate-100">
                                    {section.subheading && <h3 className="font-bold text-accent text-sm mb-1 uppercase tracking-wider">{section.subheading}</h3>}
                                    {section.description && <p className="text-sm text-ink/70 leading-relaxed font-medium">{section.description}</p>}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {section.type === 'video' && (
                            <div className="space-y-4 group/video">
                              {section.title && <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>}
                              <div className="relative overflow-hidden rounded-2xl bg-black border-4 border-accent shadow-vibrant p-1 group-hover/video:scale-[1.01] transition-transform duration-500">
                                <div className="aspect-video w-full rounded-xl overflow-hidden">
                                  {section.content.includes('youtube.com') || section.content.includes('youtu.be') ? (
                                    <iframe
                                      src={section.content.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                      className="w-full h-full"
                                      allowFullScreen
                                      title={section.title}
                                    />
                                  ) : (
                                    <video 
                                      src={section.content} 
                                      controls 
                                      className="w-full h-full object-cover" 
                                      onError={(e) => {
                                        console.error("Video load error", e);
                                        // Provide a visual fallback
                                      }}
                                    />
                                  )}
                                </div>
                                {(section.subheading || section.description) && (
                                  <div className="mt-2 p-4 bg-white/10 backdrop-blur-sm rounded-xl text-left border border-white/10 text-white">
                                    {section.subheading && <h3 className="font-bold text-secondary text-sm mb-1 uppercase tracking-wider">{section.subheading}</h3>}
                                    {section.description && <p className="text-sm opacity-80 leading-relaxed">{section.description}</p>}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Secondary Content for Side-by-Side */}
                        {section.layout === 'side-by-side' && (
                          <div className="md:w-1/2 flex flex-col gap-4 text-left">
                            <p className="leading-relaxed text-ink opacity-70 italic whitespace-pre-wrap">
                              {section.secondaryContent || "Secondary description text goes here..."}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer flex justify-center items-center px-10 py-8 bg-white border-t border-slate-100">
        <div className="font-semibold text-sm text-slate-500">{theme.footerText}</div>
      </footer>

      {/* Admin Panel Modal (Complex Edition) */}
      <AnimatePresence>
        {isAdmin && showAdminModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md overflow-auto p-4 md:p-10 flex flex-col items-center"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl overflow-hidden relative"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    <Settings2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-ink">Blog Management Center</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Customize everything about your site</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={saveData}
                    className="px-8 py-3 bg-secondary text-white rounded-2xl font-bold shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Save size={18} /> Save All Changes
                  </button>
                  <button 
                    onClick={() => {
                      setShowAdminModal(false);
                      setIsAdmin(false);
                    }}
                    className="p-3 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] h-[75vh]">
                {/* Left Side: Content List & Item Editing */}
                <div className="border-r border-slate-100 overflow-auto p-8 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-lg text-ink">Website Sections</h3>
                    <div className="flex gap-2">
                       <button onClick={() => addSection('text')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-accent transition-colors"><Type size={18} /></button>
                       <button onClick={() => addSection('image')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-accent transition-colors"><ImageIcon size={18} /></button>
                       <button onClick={() => addSection('video')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-accent transition-colors"><Video size={18} /></button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {blogData.length === 0 && <p className="text-slate-400 text-center py-10 italic">No sections yet. Add your first one!</p>}
                    {blogData.map((item) => (
                      <div 
                        key={item.id}
                        className={cn(
                          "p-4 rounded-2xl border transition-all flex flex-col gap-4",
                          editingItemId === item.id 
                            ? "bg-white border-accent shadow-lg shadow-accent/5 ring-1 ring-accent" 
                            : "bg-white border-slate-100 hover:border-slate-200"
                        )}
                        onClick={() => setEditingItemId(item.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                              {item.type === 'text' ? <Type size={18} /> : item.type === 'image' ? <ImageIcon size={18} /> : <Video size={18} />}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-ink">{item.title || 'Untitled Section'}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-extrabold">{item.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleHide(item.id); }}
                              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-500"
                            >
                              {item.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteSection(item.id); }}
                              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Editor for Selected Item */}
                        {editingItemId === item.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6"
                          >
                            <div className="space-y-4">
                               <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Section Heading (Subtitle)</label>
                                 <input 
                                   className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-accent text-sm"
                                   placeholder="e.g. About Me, My Workspace..."
                                   value={item.title || ''}
                                   onChange={e => updateSection(item.id, { title: e.target.value })}
                                 />
                               </div>
                               {(item.type === 'image' || item.type === 'video') && (
                                 <div className="grid grid-cols-1 gap-4">
                                   <div>
                                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Subheading</label>
                                     <input 
                                       className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 outline-none focus:border-accent text-xs"
                                       placeholder="Brief highlight..."
                                       value={item.subheading || ''}
                                       onChange={e => updateSection(item.id, { subheading: e.target.value })}
                                     />
                                   </div>
                                   <div>
                                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                                     <textarea 
                                       className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 outline-none focus:border-accent text-xs min-h-[60px]"
                                       placeholder="Detailed caption..."
                                       value={item.description || ''}
                                       onChange={e => updateSection(item.id, { description: e.target.value })}
                                     />
                                   </div>
                                 </div>
                               )}
                               <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                   {item.type === 'text' ? 'Text Content' : 'URL Source'}
                                 </label>
                                 <div className="flex flex-col gap-2">
                                     {item.type === 'text' ? (
                                      <textarea 
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-accent text-sm min-h-[100px]"
                                        value={item.content || ''}
                                        onChange={e => updateSection(item.id, { content: e.target.value })}
                                      />
                                    ) : (
                                      <div className="flex gap-2">
                                        <input 
                                          className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-accent text-sm"
                                          value={item.content || ''}
                                          onChange={e => updateSection(item.id, { content: e.target.value })}
                                        />
                                        <label className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors relative h-12 w-12 flex items-center justify-center overflow-hidden">
                                           {uploadProgress !== null && editingItemId === item.id && (
                                              <div className="absolute inset-0 bg-secondary/90 flex items-center justify-center text-[10px] text-white font-black z-20">
                                                {uploadProgress}%
                                              </div>
                                           )}
                                           <Upload size={18} className="text-slate-400" />
                                           <input 
                                             type="file" 
                                             className="hidden" 
                                             accept={item.type === 'image' ? "image/*" : "video/*"}
                                             onChange={(e) => {
                                               const file = e.target.files?.[0];
                                               if (file) {
                                                 const reader = new FileReader();
                                                 reader.onprogress = (ev) => { if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100)); };
                                                 reader.onload = (re) => {
                                                   updateSection(item.id, { content: re.target?.result as string });
                                                   setUploadProgress(null);
                                                 };
                                                 reader.readAsDataURL(file);
                                               }
                                             }}
                                           />
                                         </label>
                                      </div>
                                    )}
                                 </div>
                               </div>
                               {item.layout === 'side-by-side' && (
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Secondary Description</label>
                                    <textarea 
                                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-accent text-sm min-h-[80px]"
                                      value={item.secondaryContent || ''}
                                      onChange={e => updateSection(item.id, { secondaryContent: e.target.value })}
                                      placeholder="Explain the content on the right side..."
                                    />
                                  </div>
                               )}
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Size ({item.size})</label>
                                  <input 
                                    type="range" min="0" max="100" 
                                    value={item.size}
                                    onChange={e => updateSection(item.id, { size: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-accent"
                                  />
                                </div>
                                {item.type === 'text' && (
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Text Size ({item.fontSize})</label>
                                    <input 
                                      type="range" min="0" max="100" 
                                      value={item.fontSize || 50}
                                      onChange={e => updateSection(item.id, { fontSize: parseInt(e.target.value) })}
                                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-secondary"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <button 
                                  onClick={() => updateSection(item.id, { alignment: 'left' })}
                                  className={cn("p-2 rounded-lg flex-1 flex flex-col items-center gap-1 text-[8px] font-bold", item.alignment === 'left' ? "bg-accent text-white" : "bg-slate-50")}
                                >
                                  <AlignLeft size={16} /> LEFT
                                </button>
                                <button 
                                  onClick={() => updateSection(item.id, { alignment: 'center' })}
                                  className={cn("p-2 rounded-lg flex-1 flex flex-col items-center gap-1 text-[8px] font-bold", item.alignment === 'center' ? "bg-accent text-white" : "bg-slate-50")}
                                >
                                  <AlignCenter size={16} /> CENTER
                                </button>
                                <button 
                                  onClick={() => updateSection(item.id, { alignment: 'right' })}
                                  className={cn("p-2 rounded-lg flex-1 flex flex-col items-center gap-1 text-[8px] font-bold", item.alignment === 'right' ? "bg-accent text-white" : "bg-slate-100")}
                                >
                                  <AlignRight size={16} /> RIGHT
                                </button>
                              </div>

                              <div className="flex gap-2">
                                 <button 
                                  onClick={() => updateSection(item.id, { layout: 'standard' })}
                                  className={cn("p-2 rounded-lg flex-1 flex flex-col items-center gap-1 text-[8px] font-bold", item.layout === 'standard' ? "bg-secondary text-white" : "bg-slate-50")}
                                >
                                  <Square size={16} /> STANDARD
                                </button>
                                <button 
                                  onClick={() => updateSection(item.id, { layout: 'side-by-side' })}
                                  className={cn("p-2 rounded-lg flex-1 flex flex-col items-center gap-1 text-[8px] font-bold", item.layout === 'side-by-side' ? "bg-secondary text-white" : "bg-slate-50")}
                                >
                                  <Columns size={16} /> SIDE BY SIDE
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Additional Settings */}
                  <div className="mt-10 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] text-slate-400 italic font-medium">Tip: Use web URLs for large videos instead of uploading directly to ensure optimal performance.</p>
                  </div>
                </div>

                {/* Right Side: Theme & Socials */}
                <div className="overflow-auto p-8 space-y-10">
                   <div>
                      <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mb-6">Profile Information</h3>
                      <div className="space-y-4 mb-8">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Display Name</label>
                          <input 
                            className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 outline-none focus:border-accent text-xs"
                            value={theme.profileName || ''}
                            onChange={e => setTheme({...theme, profileName: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Logotype (e.g. Z.R)</label>
                          <input 
                            className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 outline-none focus:border-accent text-xs"
                            value={theme.logoText || ''}
                            onChange={e => setTheme({...theme, logoText: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Designation</label>
                          <input 
                            className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 outline-none focus:border-accent text-xs"
                            value={theme.profileDesignation || ''}
                            onChange={e => setTheme({...theme, profileDesignation: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Bio Description</label>
                          <textarea 
                            className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 outline-none focus:border-accent text-xs min-h-[80px]"
                            value={theme.profileBio || ''}
                            onChange={e => setTheme({...theme, profileBio: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Footer Text</label>
                          <input 
                            className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 outline-none focus:border-accent text-xs"
                            value={theme.footerText || ''}
                            onChange={e => setTheme({...theme, footerText: e.target.value})}
                          />
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mb-6">Website Theme</h3>
                      <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                           <span className="text-sm font-bold text-ink">Background Color</span>
                           <div className="flex items-center gap-2 flex-wrap">
                              {['#FFFDF0', '#FFCDD2', '#C8E6C9', '#BBDEFB', '#F3E5F5', '#FFF9C4', '#FFE0B2'].map(c => (
                                <button 
                                  key={c}
                                  onClick={() => setTheme({...theme, backgroundColor: c, backgroundImage: undefined})}
                                  className={cn("w-7 h-7 rounded-full border border-slate-200 transition-transform hover:scale-110", theme.backgroundColor === c && "ring-2 ring-accent ring-offset-2")}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                              <input 
                                type="color" value={theme.backgroundColor || '#ffffff'}
                                onChange={e => setTheme({...theme, backgroundColor: e.target.value, backgroundImage: undefined})}
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer overflow-hidden p-0"
                              />
                           </div>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-sm font-bold text-ink">Typing Color</span>
                           <input 
                             type="color" value={theme.typewriterColor || '#ffffff'}
                             onChange={e => setTheme({...theme, typewriterColor: e.target.value})}
                             className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer overflow-hidden p-0"
                           />
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-sm font-bold text-ink">Banner Color</span>
                           <input 
                             type="color" value={theme.bannerBgColor || '#40E0D0'}
                             onChange={e => setTheme({...theme, bannerBgColor: e.target.value})}
                             className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer overflow-hidden p-0"
                           />
                         </div>
                         <div className="space-y-3">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Banner Messages</span>
                           {theme.bannerMessages.map((msg, i) => (
                             <input 
                               key={i}
                               className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 outline-none focus:border-accent text-xs"
                               value={msg || ''}
                               onChange={e => {
                                 const newMsgs = [...theme.bannerMessages];
                                 newMsgs[i] = e.target.value;
                                 setTheme({...theme, bannerMessages: newMsgs});
                               }}
                             />
                           ))}
                         </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-bold">
                            <span>Vibrant Hue</span>
                            <span>{theme.hue || 0}°</span>
                          </div>
                          <input 
                            type="range" min="0" max="360" value={theme.hue || 0}
                            onChange={e => setTheme({...theme, hue: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                        </div>
                        <div className="space-y-2">
                           <span className="text-sm font-bold">Typography</span>
                           <div className="grid grid-cols-2 gap-2">
                              {['font-sans', 'font-serif', 'font-mono', 'font-display'].map(f => (
                                <button 
                                  key={f}
                                  onClick={() => setTheme({...theme, fontFamily: f})}
                                  className={cn(
                                    "p-2 text-[10px] font-bold rounded-xl border transition-all",
                                    theme.fontFamily === f ? "border-accent bg-accent/5 text-accent" : "border-slate-100 hover:border-slate-200"
                                  )}
                                >
                                  {f.split('-')[1].toUpperCase()}
                                </button>
                              ))}
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors relative overflow-hidden"
                           >
                              {uploadProgress !== null && <div className="absolute inset-0 bg-secondary/80 flex items-center justify-center text-white text-xs font-black z-20">{uploadProgress}%</div>}
                             <ImagePlus size={20} className="text-slate-400" />
                             <span className="text-[8px] font-bold text-slate-400">UPLOAD BG</span>
                             <input 
                               type="file" ref={fileInputRef} className="hidden" 
                               accept="image/*" onChange={handleFileUpload} 
                             />
                           </button>
                           <button 
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onprogress = (ev) => { if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100)); };
                                    reader.onload = () => {
                                      setTheme({ ...theme, profileCoverImage: reader.result as string });
                                      setUploadProgress(null);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                };
                                input.click();
                              }}
                              className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors relative overflow-hidden"
                            >
                              <Layout size={20} className="text-slate-400" />
                              <span className="text-[8px] font-bold text-slate-400">COVER IMAGE</span>
                            </button>
                           <button 
                             onClick={() => profileUploadRef.current?.click()}
                             className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors relative overflow-hidden"
                           >
                             <Upload size={20} className="text-slate-400" />
                             <span className="text-[8px] font-bold text-slate-400">UPDATE PROFILE</span>
                             <input 
                               type="file" ref={profileUploadRef} className="hidden" 
                               accept="image/*" 
                               onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                   const reader = new FileReader();
                                   reader.onprogress = (ev) => { if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100)); };
                                   reader.onload = (re) => {
                                     setTheme({...theme, profileImage: re.target?.result as string});
                                     setUploadProgress(null);
                                   };
                                   reader.readAsDataURL(file);
                                 }
                               }} 
                             />
                           </button>
                        </div>
                      </div>
                   </div>

                   <div className="pt-10 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Social Accounts</h3>
                        <button onClick={addSocial} className="p-2 bg-secondary text-white rounded-lg shadow-sm hover:scale-105 transition-transform"><Plus size={14} /></button>
                      </div>
                      <div className="space-y-3">
                         {socials.map(s => (
                           <div key={s.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl">
                              <select 
                                value={s.platform}
                                onChange={e => updateSocial(s.id, { platform: e.target.value as any })}
                                className="bg-white p-2 rounded-lg text-xs font-bold border border-slate-100 outline-none"
                              >
                                {Object.keys(PLATFORM_ICONS).map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                              </select>
                              <input 
                                className="flex-1 p-2 bg-white rounded-lg text-xs border border-slate-100 outline-none"
                                placeholder="https://..."
                                value={s.url || ''}
                                onChange={e => updateSocial(s.id, { url: e.target.value })}
                              />
                              <button onClick={() => deleteSocial(s.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {!isAdmin && showAdminModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-10 rounded-[40px] shadow-2xl max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6"><Lock /></div>
              <h2 className="text-2xl font-extrabold mb-4 text-ink">Admin Access</h2>
              <p className="text-sm text-slate-400 mb-8">Enter the security code to access full site controls.</p>
              <input 
                type="password" placeholder="••••" 
                value={passwordInput || ''} 
                onChange={e => setPasswordInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleLogin()} 
                className="w-full text-center p-5 bg-slate-50 rounded-2xl outline-none mb-6 text-3xl font-mono tracking-widest border border-transparent focus:border-accent transition-all" 
                autoFocus 
              />
              <div className="flex gap-4">
                <button onClick={() => setShowAdminModal(false)} className="flex-1 py-4 font-bold rounded-2xl bg-slate-100 border border-slate-200">Cancel</button>
                <button onClick={handleLogin} className="flex-1 py-4 font-bold rounded-2xl bg-secondary text-white shadow-lg shadow-secondary/20">Enter</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Helper Components ---

function ItemCard({ type, src, content, title, onAdd }: { type: SectionType, src?: string, content?: string, title: string, onAdd: () => void }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-vibrant border border-white flex flex-col gap-4 group/card hover:scale-[1.02] transition-transform">
      <div className="flex items-center justify-between">
        <span className="bg-slate-50 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest text-slate-400 border border-slate-100">
          {type}
        </span>
        <button 
          onClick={onAdd}
          className="p-1.5 bg-accent text-white rounded-full shadow-lg shadow-accent/20 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>
      
      {type === 'image' && src && (
        <img src={src} alt={title} className="w-full aspect-video object-cover rounded-2xl shadow-sm" />
      )}
      
      {type === 'video' && src && (
        <div className="aspect-video bg-black rounded-2xl flex items-center justify-center overflow-hidden relative">
          <video src={src} className="w-full h-full object-cover opacity-50" />
          <div className="absolute w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Video size={18} className="text-slate-800" />
          </div>
        </div>
      )}
      
      <div className="space-y-1">
        <h4 className="font-bold text-ink leading-tight">{title}</h4>
        {content && <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-medium uppercase tracking-wider">{content}</p>}
      </div>
    </div>
  );
}

function TiktokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      fill="currentColor"
    >
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1.01V15a6.5 6.5 0 1 1-6.5-6.5c1.45 0 2.82.52 3.93 1.48V4.1c-.01-1.36-.01-2.73-.01-4.1z" />
    </svg>
  );
}

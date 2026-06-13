import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Tag, ChevronRight, MessageCircle, Sparkles,
  Compass, Calendar, Map, Hotel, Gift, FileText, Globe, Heart,
  Users, GraduationCap, Activity, Building2, Ship, Train, Phone,
  ShieldCheck, Award, CheckCircle2, Layers, Plane, Bus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';

const LandingPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const navigate = useNavigate();

  // Quote Form State
  const [quoteForm, setQuoteForm] = useState({
    destination: '',
    travelDate: '',
    passengers: '2',
    budget: '',
    preference: 'Family Tour',
    name: '',
    phone: '',
  });
  const [showQuoteSuccess, setShowQuoteSuccess] = useState(false);

  const HERO_SLIDES = [
    { bg: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1600&q=80' },
    { bg: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=80' },
    { bg: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80' },
  ];

  useEffect(() => {
    // Fetch packages from the backend to ensure data-driven content works
    fetch('/api/packages')
      .then(r => r.json())
      .then(data => {
        setPackages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const timer = setInterval(() => setHeroIndex(i => (i + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(timer);
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm(prev => ({ ...prev, [name]: value }));
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.phone) {
      alert("Please enter both your name and phone number to request a quote.");
      return;
    }
    try {
      const payload = {
        enquiryType: "Tour Package Enquiry",
        customerName: quoteForm.name,
        mobileNumber: quoteForm.phone,
        travelDate: quoteForm.travelDate ? new Date(quoteForm.travelDate) : null,
        toLocation: quoteForm.destination || "Not decided",
        numberOfPassengers: Number(quoteForm.passengers) || 2,
        budget: quoteForm.budget ? Number(quoteForm.budget) : null,
        preferredCategory: quoteForm.preference,
        remarks: "Lead captured via B2C home page Quick Travel Planner."
      };

      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Error saving lead enquiry to database:", err);
    }
    setShowQuoteSuccess(true);
  };

  const triggerWhatsAppQuote = () => {
    const text = `Hi SreePayanam! I would like to get a travel quote:\n\n` +
      `📍 *Destination:* ${quoteForm.destination || 'Not decided'}\n` +
      `📅 *Date:* ${quoteForm.travelDate || 'Flexible'}\n` +
      `👥 *Passengers:* ${quoteForm.passengers}\n` +
      `💰 *Budget:* ₹${quoteForm.budget || 'Flexible'}\n` +
      `✨ *Preference:* ${quoteForm.preference}\n` +
      `👤 *Name:* ${quoteForm.name || 'Interested Traveler'}\n` +
      `📞 *Phone:* ${quoteForm.phone || 'N/A'}\n\n` +
      `Please help me plan this trip!`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/919443217654?text=${encoded}`, '_blank');
  };

  const currentHero = HERO_SLIDES[heroIndex];

  return (
    <div style={{ paddingTop: 70, overflowX: 'hidden' }}>

      {/* 1. HERO SECTION */}
      <section style={styles.heroSection}>
        <AnimatePresence mode="wait">
          <motion.img
            key={heroIndex}
            src={currentHero.bg}
            alt="Beautiful travel background"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={styles.heroBgImage}
          />
        </AnimatePresence>
        <div style={styles.heroOverlay} />
        
        <div className="container" style={styles.heroContainer}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            style={styles.heroContent}
          >
            <div style={styles.heroBadge}>
              <Sparkles size={16} color="var(--primary)" />
              <span>AI-Assisted Quick Travel Planning Live</span>
            </div>
            
            <h1 style={styles.heroTitle}>Welcome to SreePayanam Tours &amp; Travels</h1>
            <h2 style={styles.heroSubtitle}>Your Trusted Travel Partner for Memorable Journeys</h2>
            
            {/* Detailed welcome paragraphs in premium card */}
            <div style={styles.heroGlassCard}>
              <p style={styles.heroParagraph}>
                Plan your travel with confidence through <strong>SreePayanam Tours &amp; Travels</strong>. We provide complete travel solutions for families, individuals, students, corporates, pilgrims, medical travelers, and groups.
              </p>
              <p style={styles.heroParagraph}>
                From domestic holidays to international tours, visa assistance to ticket booking, and hotel reservations to transport arrangements, we take care of every travel requirement with professionalism, care, and personal attention.
              </p>
              <p style={styles.heroParagraph}>
                Now with AI-assisted quick travel planning, we help you get faster travel ideas, suitable destinations, estimated itineraries, and customized package suggestions based on your budget, travel dates, and preferences.
              </p>
              <div style={styles.heroSloganContainer}>
                <span style={styles.heroSloganText}>Plan Smart. Travel Better. Create Memories.</span>
              </div>
            </div>

            <div style={styles.heroButtonContainer}>
              <Link to="/packages" className="btn btn-primary" style={styles.heroBtnPrimary}>
                Explore Packages
              </Link>
              <Link to="/ai-assistant" className="btn" style={styles.heroBtnAi}>
                <Sparkles size={18} />
                <span>Plan My Trip</span>
              </Link>
              <Link to="/contact" className="btn" style={styles.heroBtnGhost}>
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FLOATING WHATSAPP BUTTON */}
      <a href="https://wa.me/919443217654" target="_blank" rel="noreferrer" style={styles.whatsappFloat}>
        <MessageCircle size={28} />
        <span style={styles.whatsappTooltip}>WhatsApp Us</span>
      </a>

      {/* 2. ABOUT SREEPAYANAM */}
      <section style={styles.lightSection}>
        <div className="container">
          <div style={styles.aboutGrid}>
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={styles.aboutImageCol}
            >
              <img 
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80" 
                alt="Exploring destinations around the world" 
                style={styles.aboutImg}
              />
              <div style={styles.aboutStatsCard}>
                <Award size={36} color="var(--primary)" />
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)' }}>100%</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Safe &amp; Trusted Journeys</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={styles.aboutTextCol}
            >
              <span style={styles.sectionSubtitleLabel}>WHO WE ARE</span>
              <h2 style={styles.sectionTitle}>About SreePayanam</h2>
              <div style={styles.divider} />
              
              <p style={styles.aboutBodyText}>
                At <strong>SreePayanam Tours &amp; Travels</strong>, we believe that every journey should be comfortable, enjoyable, affordable, and memorable. With years of experience in the travel and tourism industry, we offer customized travel services for both national and international destinations.
              </p>
              <p style={styles.aboutBodyText}>
                Whether you are planning a family vacation, honeymoon trip, pilgrimage tour, educational tour, corporate travel, medical travel, or group tour, our team is here to guide you from enquiry to return journey.
              </p>
              <p style={styles.aboutBodyText}>
                We combine personal service with modern travel planning methods, including AI assistance, to provide quick, smart, and suitable travel options for our customers.
              </p>

              <div style={styles.aboutHighlightsGrid}>
                <div style={styles.aboutHighlightItem}>
                  <CheckCircle2 size={18} color="var(--secondary)" />
                  <span>Personal Attention &amp; Care</span>
                </div>
                <div style={styles.aboutHighlightItem}>
                  <CheckCircle2 size={18} color="var(--secondary)" />
                  <span>AI-Enabled Fast Itineraries</span>
                </div>
                <div style={styles.aboutHighlightItem}>
                  <CheckCircle2 size={18} color="var(--secondary)" />
                  <span>Affordable Custom Packages</span>
                </div>
                <div style={styles.aboutHighlightItem}>
                  <CheckCircle2 size={18} color="var(--secondary)" />
                  <span>End-to-End Coordination</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. AI ASSISTANCE FOR QUICK TRAVEL PLANNING */}
      <section style={styles.aiSection}>
        <div style={styles.aiGlowBall1} />
        <div style={styles.aiGlowBall2} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span style={styles.aiSubtitleLabel}>FUTURE OF TRAVEL PLANNING</span>
            <h2 style={styles.aiSectionTitle}>AI Assistance for Quick Travel Planning</h2>
            <div style={styles.aiDivider} />
            <p style={styles.aiIntroText}>
              Planning a trip can sometimes be confusing — choosing the destination, hotel, transport, sightseeing, visa process, and budget may take time. To make this easier, SreePayanam offers AI-assisted travel planning support.
            </p>
          </div>

          <div style={styles.aiGrid}>
            {[
              { icon: Compass, title: 'Destination Suggestions', desc: 'Get suitable destination recommendations based on budget and travel dates.' },
              { icon: Calendar, title: 'Day-Wise Itinerary Planning', desc: 'Instantly view a complete sample daily sightseeing and activity plan.' },
              { icon: Sparkles, title: 'Curated Trip Ideas', desc: 'Tailored options for family holidays, honeymoons, pilgrimage, education, and corporate trips.' },
              { icon: Map, title: 'Estimated Route Planning', desc: 'Optimize your travel routing between cities and main sightseeing spots.' },
              { icon: Hotel, title: 'Hotel & Transport Preferences', desc: 'Personalized recommendations based on your comfort level and budgets.' },
              { icon: Layers, title: 'Quick Travel Comparisons', desc: 'Easily compare pricing, travel duration, and convenience parameters.' },
              { icon: Gift, title: 'Customized Package Preparation', desc: 'Cohesive plans designed around number of passengers, dates, and special requests.' }
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                style={styles.aiCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ y: -5, borderColor: 'rgba(59, 130, 246, 0.45)' }}
              >
                <div style={styles.aiCardHeader}>
                  <div style={styles.aiIconWrapper}>
                    <item.icon size={22} color="#60a5fa" />
                  </div>
                  <span style={styles.aiCardNumber}>0{idx + 1}</span>
                </div>
                <h4 style={styles.aiCardTitle}>{item.title}</h4>
                <p style={styles.aiCardDesc}>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div style={styles.aiOutroCard}>
            <Sparkles size={26} color="#fbbf24" style={{ flexShrink: 0 }} />
            <p style={styles.aiOutroTextMain}>
              Our AI assistance helps speed up the planning process, while our experienced travel team reviews, customizes, and finalizes the best travel solution for you.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PACKAGES FROM DB */}
      <section style={styles.lightSection}>
        <div className="container">
          <div style={styles.sectionHeaderFlex}>
            <div>
              <span style={styles.sectionSubtitleLabel}>HOT DEALS</span>
              <h2 style={{ ...styles.sectionTitle, textAlign: 'left', marginBottom: 8 }}>Featured Packages</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Handpicked tours with the best reviews and premium experiences</p>
            </div>
            <Link to="/packages" style={styles.viewAllBtn}>
              <span>View All Packages</span>
              <ChevronRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div style={styles.packagesGrid}>
              {[1, 2, 3].map(i => (
                <div key={i} style={styles.skeletonCard}>
                  <div style={styles.skeletonImage} />
                  <div style={{ padding: 20 }}>
                    <div style={styles.skeletonLineShort} />
                    <div style={styles.skeletonLineLong} />
                    <div style={styles.skeletonLineShort} />
                  </div>
                </div>
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div style={styles.emptyStateCard}>
              <span style={{ fontSize: '3.5rem', marginBottom: 12, display: 'block' }}>🌍</span>
              <h3 style={{ marginBottom: 8, color: 'var(--dark)' }}>No active tour packages</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Our catalog is being updated by our travel agents. Reach out directly for custom bookings!</p>
              <Link to="/contact" className="btn btn-primary">Enquire Now</Link>
            </div>
          ) : (
            <div style={styles.packagesGrid}>
              {packages.slice(0, 3).map((pkg, i) => (
                <PackageCard key={pkg._id} pkg={pkg} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. TOUR PACKAGES CATEGORIES */}
      <section style={styles.whiteSection}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={styles.sectionSubtitleLabel}>OUR PORTFOLIO</span>
            <h2 style={styles.sectionTitle}>Our Tour Packages</h2>
            <div style={styles.divider} />
            <p style={styles.sectionIntroText}>
              SreePayanam offers a wide range of tour packages designed for different types of travelers. Each package can be customized based on your destination, number of passengers, travel date, budget, hotel preference, transport mode, and sightseeing requirements.
            </p>
          </div>

          <div style={styles.packagesGrid}>
            {[
              { 
                icon: MapPin, 
                title: 'National Tours', 
                desc: 'Explore the beauty of India through well-planned domestic tour packages. We arrange tours to hill stations, temples, beaches, heritage cities, wildlife destinations, cultural places, and family holiday spots across India.',
                tag: 'Domestic'
              },
              { 
                icon: Globe, 
                title: 'International Tours', 
                desc: 'Travel to your dream destinations across Asia, Europe, Middle East, Africa, and other global locations. We assist with itinerary planning, flight booking, hotel booking, visa support, sightseeing, transfers, and travel insurance.',
                tag: 'Worldwide'
              },
              { 
                icon: Compass, 
                title: 'Pilgrimage Tours', 
                desc: 'We organize peaceful and comfortable pilgrimage tours to major spiritual destinations in India and abroad. Our services include route planning, accommodation, transport, temple visit coordination, and group travel arrangements.',
                tag: 'Spiritual'
              },
              { 
                icon: Heart, 
                title: 'Honeymoon Packages', 
                desc: 'Celebrate your special journey with romantic and memorable honeymoon packages. We help you choose beautiful destinations, comfortable hotels, private transfers, sightseeing, and special arrangements based on your preferences.',
                tag: 'Romance'
              },
              { 
                icon: Users, 
                title: 'Family Tours', 
                desc: 'Enjoy stress-free holidays with your family. We plan family-friendly destinations, suitable hotels, safe transport, sightseeing, and flexible itineraries to make your trip relaxed and enjoyable.',
                tag: 'Leisure'
              },
              { 
                icon: GraduationCap, 
                title: 'Educational Tours', 
                desc: 'We arrange educational tours, student trips, industrial visits, institutional tours, and knowledge-based travel programs for schools, colleges, and educational groups.',
                tag: 'Student Groups'
              },
              { 
                icon: Activity, 
                title: 'Medical Tours', 
                desc: 'We support travel planning for medical treatment, hospital visits, patient travel, attendant stay, transport, and accommodation requirements.',
                tag: 'Healthcare'
              },
              { 
                icon: Building2, 
                title: 'MICE & Corporate Tours', 
                desc: 'We provide travel support for Meetings, Incentives, Conferences, Exhibitions, business trips, employee tours, dealer meets, corporate events, and group movements.',
                tag: 'Business'
              },
              { 
                icon: Ship, 
                title: 'Cruise & Rail Tours', 
                desc: 'We assist customers with cruise packages and IRCTC rail tour options for comfortable and unique travel experiences.',
                tag: 'Luxury Transit'
              },
              { 
                icon: FileText, 
                title: 'Visa, Ticketing, Hotel & Transport Services', 
                desc: 'Get fast-track visa processing, lowest flight/train/bus tickets, worldwide hotel reservations, and reliable premium transport rentals all in one place.',
                tag: 'Essential Services'
              }
            ].map((cat, idx) => (
              <motion.div 
                key={idx} 
                style={styles.categoryCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(15,23,42,0.08)' }}
                onClick={() => {
                  if (cat.title.includes('Visa') || cat.title.includes('Services')) {
                    navigate('/bookings');
                  } else {
                    navigate(`/packages?type=${encodeURIComponent(cat.title)}`);
                  }
                }}
              >
                <div style={styles.categoryBadge}>{cat.tag}</div>
                <div style={styles.categoryIconCircle}>
                  <cat.icon size={26} color="var(--primary)" />
                </div>
                <h4 style={styles.categoryCardTitle}>{cat.title}</h4>
                <p style={styles.categoryCardDesc}>{cat.desc}</p>
                <div style={styles.categoryCardFooter}>
                  <span>Explore Category</span>
                  <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SERVICE ACTIVITIES */}
      <section style={styles.lightSection}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={styles.sectionSubtitleLabel}>WHAT WE DO</span>
            <h2 style={styles.sectionTitle}>Our Service Activities</h2>
            <div style={styles.divider} />
            <p style={styles.sectionIntroText}>
              SreePayanam provides complete travel-related services under one roof, making it easier for customers to manage all travel needs through a single trusted partner.
            </p>
          </div>

          <div style={styles.servicesGrid}>
            {/* 1. Ticket Booking */}
            <motion.div style={styles.serviceCard} whileHover={{ y: -5 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={styles.serviceHeader}>
                <Plane size={24} color="var(--primary)" />
                <h3 style={styles.serviceTitle}>Ticket Booking Services</h3>
              </div>
              <ul style={styles.serviceList}>
                <li>Flight booking</li>
                <li>Train booking</li>
                <li>Bus booking</li>
                <li>IRCTC rail tour support</li>
              </ul>
            </motion.div>

            {/* 2. Hotel & Stay */}
            <motion.div style={styles.serviceCard} whileHover={{ y: -5 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={styles.serviceHeader}>
                <Hotel size={24} color="var(--primary)" />
                <h3 style={styles.serviceTitle}>Hotel &amp; Stay Arrangements</h3>
              </div>
              <p style={styles.serviceParagraphText}>
                We help customers book suitable accommodation based on destination, budget, family requirements, corporate needs, and comfort preferences.
              </p>
            </motion.div>

            {/* 3. Visa & Documentation */}
            <motion.div style={styles.serviceCard} whileHover={{ y: -5 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={styles.serviceHeader}>
                <FileText size={24} color="var(--primary)" />
                <h3 style={styles.serviceTitle}>Visa &amp; Documentation Support</h3>
              </div>
              <ul style={styles.serviceList}>
                <li>Tourist visa services</li>
                <li>Education visa guidance</li>
                <li>Passport assistance</li>
                <li>Certificate attestation support</li>
                <li>Travel documentation guidance</li>
              </ul>
            </motion.div>

            {/* 4. Transport & Rental */}
            <motion.div style={styles.serviceCard} whileHover={{ y: -5 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={styles.serviceHeader}>
                <Bus size={24} color="var(--primary)" />
                <h3 style={styles.serviceTitle}>Transport &amp; Rental Services</h3>
              </div>
              <ul style={styles.serviceList}>
                <li>Car, van, and bus rentals</li>
                <li>Convenient airport transfers</li>
                <li>Local sightseeing transport</li>
                <li>Spacious group travel vehicles</li>
              </ul>
            </motion.div>

            {/* 5. Travel Protection */}
            <motion.div style={styles.serviceCard} whileHover={{ y: -5 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={styles.serviceHeader}>
                <ShieldCheck size={24} color="var(--primary)" />
                <h3 style={styles.serviceTitle}>Travel Protection &amp; Support</h3>
              </div>
              <ul style={styles.serviceList}>
                <li>Travel insurance plans</li>
                <li>Basic travel guidance</li>
                <li>Itinerary support &amp; planning</li>
                <li>Emergency coordination &amp; 24/7 help</li>
              </ul>
            </motion.div>

            {/* 6. Customized Travel Planning */}
            <motion.div style={styles.serviceCard} whileHover={{ y: -5 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={styles.serviceHeader}>
                <Sparkles size={24} color="var(--primary)" />
                <h3 style={styles.serviceTitle}>Customized Travel Planning</h3>
              </div>
              <p style={styles.serviceParagraphText}>
                Every customer’s travel requirement is different. We prepare customized travel plans based on:
              </p>
              <div style={styles.customNeedsGrid}>
                {['Destination', 'Budget', 'Travel dates', 'Passengers count', 'Hotel category', 'Food preference', 'Sightseeing interest', 'Transport mode'].map(item => (
                  <span key={item} style={styles.customBadge}>{item}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE US & OUR PROMISE */}
      <section style={styles.whiteSection}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={styles.sectionSubtitleLabel}>THE SREEPAYANAM ADVANTAGE</span>
            <h2 style={styles.sectionTitle}>Why Choose SreePayanam?</h2>
            <div style={styles.divider} />
          </div>

          <div style={styles.servicesGrid}>
            {[
              { icon: Sparkles, title: 'AI-Assisted Quick Planning', desc: 'Get faster travel ideas and customized package suggestions with our AI-assisted travel planning support.' },
              { icon: Layers, title: 'Complete Travel Services', desc: 'From tickets and hotels to visa, transport, insurance, and packages, we handle all major travel needs.' },
              { icon: Gift, title: 'Customized Packages', desc: 'We design travel plans based on your budget, destination, travel dates, and personal preferences.' },
              { icon: Globe, title: 'Domestic & International Expertise', desc: 'We support both India tours and worldwide travel requirements with proper planning and coordination.' },
              { icon: Users, title: 'Customer-Centric Approach', desc: 'We focus on comfort, safety, transparency, affordability, and customer satisfaction.' },
              { icon: Phone, title: 'Reliable Support', desc: 'From your first enquiry to your return journey, our team supports you at every stage.' }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                style={styles.whyCard}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div style={styles.whyIconBg}>
                  <f.icon size={22} color="var(--primary)" />
                </div>
                <h4 style={styles.whyCardTitle}>{f.title}</h4>
                <p style={styles.whyCardDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* OUR PROMISE BANNER */}
          <motion.div 
            style={styles.promiseBanner}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div style={styles.promiseSeal}>
              <Award size={36} color="#b45309" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: 1 }}>Our Promise</span>
            </div>
            <div style={styles.promiseTextContainer}>
              <p style={styles.promiseBodyText}>
                At <strong>SreePayanam Tours &amp; Travels</strong>, we are committed to delivering reliable travel services with clear communication, honest guidance, and personalized support.
              </p>
              <p style={styles.promiseBodyText}>
                Our aim is to make every journey comfortable, safe, affordable, and memorable.
              </p>
              <p style={styles.promiseBodyTextFinal}>
                Whether it is a small family trip, a large group tour, a corporate movement, a pilgrimage journey, or an international holiday, SreePayanam is ready to plan and support your travel needs.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. CALL TO ACTION SECTION */}
      <section style={styles.ctaSection} id="quick-enquiry">
        <div style={styles.ctaGlow} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={styles.ctaGrid}>
            <div style={styles.ctaTextCol}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 2 }}>START YOUR JOURNEY</span>
              <h2 style={styles.ctaTitle}>Ready to Plan Your Next Trip?</h2>
              <p style={styles.ctaParagraph}>
                Share your destination, travel date, number of passengers, budget, and travel preference. Our team, supported by AI-assisted quick planning, will help you prepare the most suitable travel plan.
              </p>
              <p style={styles.ctaParagraph}>
                Start your journey with <strong>SreePayanam Tours &amp; Travels</strong> today.
              </p>

              <div style={styles.ctaDirectLinksContainer}>
                <a href="tel:+919443217654" style={styles.ctaDirectLink}>
                  <Phone size={18} />
                  <span>Call: +91 94432 17654</span>
                </a>
                <a href="https://wa.me/919443217654" target="_blank" rel="noreferrer" style={{ ...styles.ctaDirectLink, background: '#25D366', color: 'white' }}>
                  <MessageCircle size={18} />
                  <span>WhatsApp Travel Advisor</span>
                </a>
              </div>
            </div>

            <div style={styles.ctaFormCol}>
              <div style={styles.ctaFormCard}>
                <h3 style={styles.ctaFormTitle}>Quick Travel Planner</h3>
                
                {showQuoteSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    style={{ textAlign: 'center', padding: '30px 10px' }}
                  >
                    <div style={styles.successIconCircle}>
                      <CheckCircle2 size={32} color="#10b981" />
                    </div>
                    <h4 style={{ color: 'var(--dark)', fontWeight: 800, marginBottom: 12 }}>Details Captured!</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>
                      Your travel enquiry details are stored. Let's send them to our WhatsApp desk now to get your AI-assisted quote instantly!
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button onClick={triggerWhatsAppQuote} className="btn btn-primary" style={{ width: '100%', gap: 8, background: '#25D366', borderColor: '#25D366' }}>
                        <MessageCircle size={18} /> Send to WhatsApp
                      </button>
                      <button onClick={() => setShowQuoteSuccess(false)} style={styles.formResetBtn}>
                        Start Over
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleQuoteSubmit}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Where do you want to go?</label>
                      <input 
                        type="text" 
                        name="destination" 
                        value={quoteForm.destination}
                        onChange={handleFormChange}
                        placeholder="e.g., Kerala, Dubai, Singapore"
                        style={styles.formInput}
                        required
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Travel Date</label>
                        <input 
                          type="date" 
                          name="travelDate" 
                          value={quoteForm.travelDate}
                          onChange={handleFormChange}
                          style={styles.formInput}
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Passengers</label>
                        <select 
                          name="passengers" 
                          value={quoteForm.passengers}
                          onChange={handleFormChange}
                          style={styles.formInput}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '10+'].map(n => (
                            <option key={n} value={n}>{n} Pax</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Budget per Person</label>
                        <input 
                          type="text" 
                          name="budget" 
                          value={quoteForm.budget}
                          onChange={handleFormChange}
                          placeholder="e.g. 15,000"
                          style={styles.formInput}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Trip Category</label>
                        <select 
                          name="preference" 
                          value={quoteForm.preference}
                          onChange={handleFormChange}
                          style={styles.formInput}
                        >
                          <option value="Family Tour">Family Tour</option>
                          <option value="Honeymoon Package">Honeymoon</option>
                          <option value="Pilgrimage Tour">Pilgrimage</option>
                          <option value="National Tour">National</option>
                          <option value="International Tour">International</option>
                          <option value="Educational Tour">Educational</option>
                          <option value="Medical Tour">Medical</option>
                          <option value="MICE &amp; Corporate">MICE / Corporate</option>
                        </select>
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Your Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={quoteForm.name}
                        onChange={handleFormChange}
                        placeholder="Enter full name"
                        style={styles.formInput}
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Mobile Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={quoteForm.phone}
                        onChange={handleFormChange}
                        placeholder="Mobile number"
                        style={styles.formInput}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.95rem' }}>
                        Get a Quote
                      </button>
                      <Link to="/ai-assistant" className="btn" style={styles.quoteAiBtn}>
                        <Sparkles size={16} /> Plan with AI
                      </Link>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div className="container">
          <div style={styles.footerGrid}>
            <div>
              <h3 style={styles.footerLogo}>SreePayanam</h3>
              <p style={styles.footerText}>
                Your trusted partner for memorable national and international travel experiences. We combine customized planning with state-of-the-art AI insights to deliver absolute comfort.
              </p>
            </div>
            <div>
              <h4 style={styles.footerHeader}>Quick Links</h4>
              {['Home', 'About Us', 'Packages', 'AI Planner', 'Contact'].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <Link 
                    to={`/${l === 'Home' ? '' : l === 'AI Planner' ? 'ai-assistant' : l.toLowerCase().replace(' ', '-')}`} 
                    style={styles.footerLink}
                  >
                    {l}
                  </Link>
                </div>
              ))}
            </div>
            <div>
              <h4 style={styles.footerHeader}>Services</h4>
              {['Tour Packages', 'Visa Services', 'Hotel Booking', 'Car Rental', 'MICE Tours', 'Education Tours'].map(s => (
                <div key={s} style={{ marginBottom: 10, fontSize: '0.9rem', color: '#94a3b8' }}>{s}</div>
              ))}
            </div>
            <div>
              <h4 style={styles.footerHeader}>Contact Info</h4>
              <div style={styles.footerContact}>
                <div>📍 SreePayanam Tours &amp; Travels</div>
                <div>📞 +91 94432 17654</div>
                <div>✉️ info@sreepayanam.com</div>
              </div>
            </div>
          </div>
          <div style={styles.footerBottom}>
            © 2026 SreePayanam Tours &amp; Travels. All rights reserved. |{' '}
            <span style={{ cursor: 'pointer', hover: { color: 'white' } }}>Privacy Policy</span> |{' '}
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// PACKAGE CARD COMPONENT
const PackageCard = ({ pkg, index }) => {
  const navigate = useNavigate();
  const price = pkg.offerPrice || pkg.originalPrice || pkg.price || 0;
  const discount = pkg.offerPrice && pkg.originalPrice ? Math.round((1 - pkg.offerPrice / pkg.originalPrice) * 100) : 0;

  return (
    <motion.div
      className="glass-card"
      style={styles.pkgCard}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
      viewport={{ once: true }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(15,23,42,0.12)' }}
      onClick={() => navigate(`/package/${pkg._id}`)}
    >
      <div style={styles.pkgImgContainer}>
        <img
          src={pkg.imageUrl || FALLBACK_IMG}
          alt={pkg.title}
          onError={e => { e.target.src = FALLBACK_IMG; }}
          style={styles.pkgImg}
        />
        <div style={styles.pkgBadgesContainer}>
          <span style={styles.pkgCategoryTag}>{pkg.packageCategory || 'National'}</span>
          {discount > 0 && <span style={styles.pkgDiscountTag}>{discount}% OFF</span>}
        </div>
        <div style={styles.pkgDurationContainer}>
          <span style={styles.pkgDurationBadge}>
            <Clock size={12} /> {pkg.durationDays}D/{pkg.durationNights || (pkg.durationDays - 1)}N
          </span>
        </div>
      </div>

      <div style={styles.pkgBody}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Tag size={12} color="var(--primary)" />
          <span style={styles.pkgTourType}>{pkg.tourType || 'Tour'}</span>
        </div>
        <h3 style={styles.pkgTitleText}>{pkg.title}</h3>
        <div style={styles.pkgLocationFlex}>
          <MapPin size={14} color="var(--primary)" />
          <span>{pkg.destination}</span>
        </div>

        <div style={styles.pkgFooter}>
          <div>
            <div style={styles.pkgPriceFlex}>
              <span style={styles.pkgPriceVal}>₹{price.toLocaleString()}</span>
            </div>
            {pkg.offerPrice && pkg.originalPrice && (
              <span style={styles.pkgOriginalPrice}>₹{pkg.originalPrice.toLocaleString()}</span>
            )}
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>per person</div>
          </div>
          <button 
            className="btn btn-primary" 
            style={styles.pkgBtn} 
            onClick={e => { e.stopPropagation(); navigate(`/package/${pkg._id}`); }}
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// INLINE STYLES DEFINITION FOR ABSOLUTE PREMIUM DESIGN
const styles = {
  heroSection: {
    position: 'relative',
    minHeight: '94vh',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    background: '#090d16',
  },
  heroBgImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transformOrigin: 'center center',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.65) 100%)',
    zIndex: 1,
  },
  heroContainer: {
    position: 'relative',
    zIndex: 2,
    paddingTop: '60px',
    paddingBottom: '60px',
  },
  heroContent: {
    maxWidth: '920px',
    margin: '0 auto',
    textAlign: 'center',
    color: 'white',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(8px)',
    color: '#93c5fd',
    padding: '6px 16px',
    borderRadius: '40px',
    fontSize: '0.85rem',
    fontWeight: 700,
    marginBottom: '24px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  heroTitle: {
    fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: '10px',
    textShadow: '0 4px 20px rgba(0,0,0,0.5)',
    background: 'linear-gradient(to right, #ffffff, #93c5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)',
    fontWeight: 600,
    color: '#60a5fa',
    marginBottom: '32px',
    textShadow: '0 2px 10px rgba(0,0,0,0.4)',
  },
  heroGlassCard: {
    background: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '30px 24px',
    marginBottom: '40px',
    textAlign: 'left',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
  },
  heroParagraph: {
    fontSize: '1.05rem',
    color: '#e2e8f0',
    marginBottom: '16px',
    lineHeight: 1.7,
  },
  heroSloganContainer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    paddingTop: '16px',
    marginTop: '20px',
    textAlign: 'center',
  },
  heroSloganText: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#fbbf24',
    textShadow: '0 0 10px rgba(251,191,36,0.3)',
    letterSpacing: '0.5px',
  },
  heroButtonContainer: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  heroBtnPrimary: {
    fontSize: '1.05rem',
    padding: '14px 34px',
    borderRadius: '10px',
  },
  heroBtnAi: {
    background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
    color: 'white',
    fontSize: '1.05rem',
    padding: '14px 34px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 700,
    boxShadow: '0 10px 25px rgba(168,85,247,0.3)',
    border: 'none',
  },
  heroBtnGhost: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(8px)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    fontSize: '1.05rem',
    padding: '14px 34px',
    borderRadius: '10px',
  },
  whatsappFloat: {
    position: 'fixed',
    bottom: 28,
    right: 28,
    zIndex: 9999,
    background: '#25d366',
    color: 'white',
    borderRadius: '50%',
    width: 60,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 24px rgba(37,211,102,0.45)',
    textDecoration: 'none',
  },
  whatsappTooltip: {
    position: 'absolute',
    right: 74,
    background: '#1e293b',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  lightSection: {
    padding: '80px 20px',
    background: '#f8fafc',
  },
  whiteSection: {
    padding: '80px 20px',
    background: 'white',
  },
  aboutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: 48,
    alignItems: 'center',
  },
  aboutImageCol: {
    position: 'relative',
    borderRadius: '24px',
    overflow: 'visible',
  },
  aboutImg: {
    width: '100%',
    borderRadius: '24px',
    boxShadow: '0 20px 45px rgba(15,23,42,0.12)',
    objectFit: 'cover',
    height: '420px',
  },
  aboutStatsCard: {
    position: 'absolute',
    bottom: '-20px',
    right: '20px',
    background: 'white',
    padding: '16px 28px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    border: '1px solid #f1f5f9',
  },
  aboutTextCol: {
    paddingLeft: '10px',
  },
  sectionSubtitleLabel: {
    fontSize: '0.82rem',
    fontWeight: 800,
    color: 'var(--primary)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '8px',
    display: 'block',
  },
  sectionTitle: {
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
    color: 'var(--dark)',
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: '12px',
  },
  divider: {
    width: '60px',
    height: '4px',
    background: 'var(--primary)',
    borderRadius: '2px',
    margin: '0 auto 24px',
  },
  aboutBodyText: {
    fontSize: '1.02rem',
    color: 'var(--text-main)',
    marginBottom: '16px',
    lineHeight: 1.7,
  },
  aboutHighlightsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
    marginTop: '28px',
  },
  aboutHighlightItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.92rem',
    fontWeight: 700,
    color: 'var(--dark)',
  },
  aiSection: {
    padding: '80px 20px',
    background: 'linear-gradient(135deg, #090e1a 0%, #1e3a8a 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  aiGlowBall1: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
    top: '-10%',
    left: '-5%',
  },
  aiGlowBall2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
    bottom: '-15%',
    right: '-5%',
  },
  aiSubtitleLabel: {
    fontSize: '0.82rem',
    fontWeight: 800,
    color: '#93c5fd',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    marginBottom: '10px',
    display: 'block',
  },
  aiSectionTitle: {
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
    color: 'white',
    fontWeight: 900,
    marginBottom: '12px',
  },
  aiDivider: {
    width: '70px',
    height: '4px',
    background: '#60a5fa',
    borderRadius: '2px',
    margin: '0 auto 24px',
  },
  aiIntroText: {
    color: '#cbd5e1',
    fontSize: '1.08rem',
    maxWidth: '820px',
    margin: '0 auto',
    lineHeight: 1.7,
  },
  aiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
    gap: 20,
    marginTop: '40px',
  },
  aiCard: {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '28px',
    transition: 'all 0.3s ease',
  },
  aiCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  aiIconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'rgba(59, 130, 246, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(59, 130, 246, 0.25)',
  },
  aiCardNumber: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: 'rgba(255, 255, 255, 0.1)',
  },
  aiCardTitle: {
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 800,
    marginBottom: '10px',
  },
  aiCardDesc: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
  aiOutroCard: {
    marginTop: '44px',
    background: 'rgba(251, 191, 36, 0.08)',
    border: '1px solid rgba(251, 191, 36, 0.2)',
    borderRadius: '16px',
    padding: '24px 30px',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  aiOutroTextMain: {
    color: '#fef3c7',
    fontSize: '1.02rem',
    fontWeight: 600,
    lineHeight: 1.6,
    margin: 0,
  },
  sectionHeaderFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '36px',
    flexWrap: 'wrap',
    gap: 16,
  },
  viewAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--primary)',
    fontWeight: 700,
    textDecoration: 'none',
    fontSize: '0.98rem',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1.5px solid rgba(59, 130, 246, 0.2)',
    transition: 'all 0.2s',
  },
  packagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 28,
  },
  skeletonCard: {
    background: 'white',
    borderRadius: '18px',
    overflow: 'hidden',
    height: '420px',
    boxShadow: 'var(--shadow-sm)',
  },
  skeletonImage: {
    height: '240px',
    background: '#e2e8f0',
    animation: 'pulse 1.5s infinite',
  },
  skeletonLineShort: {
    height: '18px',
    background: '#e2e8f0',
    borderRadius: '4px',
    width: '45%',
    marginBottom: '12px',
  },
  skeletonLineLong: {
    height: '18px',
    background: '#f1f5f9',
    borderRadius: '4px',
    width: '90%',
    marginBottom: '12px',
  },
  emptyStateCard: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--text-muted)',
    background: 'white',
    borderRadius: '18px',
    boxShadow: 'var(--shadow-sm)',
    maxWidth: '560px',
    margin: '0 auto',
  },
  sectionIntroText: {
    maxWidth: '800px',
    margin: '0 auto',
    color: 'var(--text-muted)',
    fontSize: '1.05rem',
    lineHeight: 1.7,
  },
  categoryCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '18px',
    padding: '30px 24px',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    background: 'rgba(59, 130, 246, 0.08)',
    color: 'var(--primary)',
    fontSize: '0.72rem',
    fontWeight: 800,
    padding: '3px 10px',
    borderRadius: '20px',
  },
  categoryIconCircle: {
    width: '54px',
    height: '54px',
    borderRadius: '14px',
    background: 'white',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
  },
  categoryCardTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: 'var(--dark)',
    marginBottom: '10px',
  },
  categoryCardDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: '20px',
    flexGrow: 1,
  },
  categoryCardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--primary)',
    marginTop: 'auto',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 24,
    marginTop: '16px',
  },
  serviceCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(15,23,42,0.02)',
    transition: 'all 0.3s ease',
  },
  serviceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: '20px',
  },
  serviceTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--dark)',
  },
  serviceList: {
    paddingLeft: '20px',
    listStyleType: 'disc',
    color: 'var(--text-main)',
    fontSize: '0.94rem',
  },
  serviceParagraphText: {
    fontSize: '0.96rem',
    color: 'var(--text-main)',
    lineHeight: 1.6,
  },
  customNeedsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: '14px',
  },
  customBadge: {
    background: '#f1f5f9',
    color: 'var(--text-main)',
    fontSize: '0.76rem',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: '6px',
  },
  whyCard: {
    background: '#f8fafc',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  whyIconBg: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'rgba(59, 130, 246, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  whyCardTitle: {
    fontSize: '1.05rem',
    fontWeight: 800,
    color: 'var(--dark)',
    marginBottom: '6px',
  },
  whyCardDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    lineHeight: 1.65,
  },
  promiseBanner: {
    background: '#fef3c7',
    border: '1.5px dashed #d97706',
    borderRadius: '24px',
    padding: '36px 40px',
    marginTop: '48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    textAlign: 'center',
  },
  promiseSeal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  promiseTextContainer: {
    maxWidth: '820px',
  },
  promiseBodyText: {
    fontSize: '1.02rem',
    color: '#78350f',
    marginBottom: '10px',
    lineHeight: 1.6,
  },
  promiseBodyTextFinal: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#92400e',
    marginTop: '14px',
    lineHeight: 1.6,
  },
  ctaSection: {
    padding: '80px 0',
    background: 'linear-gradient(135deg, #090e1b 0%, #0f172a 100%)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaGlow: {
    position: 'absolute',
    width: '450px',
    height: '450px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 75%)',
    bottom: '-15%',
    left: '25%',
  },
  ctaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: 40,
    alignItems: 'center',
  },
  ctaTextCol: {
    paddingRight: '12px',
  },
  ctaTitle: {
    fontSize: 'clamp(2rem, 4vw, 2.6rem)',
    fontWeight: 800,
    marginBottom: '20px',
    lineHeight: 1.2,
  },
  ctaParagraph: {
    fontSize: '1.05rem',
    color: '#cbd5e1',
    lineHeight: 1.7,
    marginBottom: '16px',
  },
  ctaDirectLinksContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: '32px',
  },
  ctaDirectLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 24px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: 'white',
    fontWeight: 700,
    fontSize: '0.95rem',
    width: 'fit-content',
    transition: 'all 0.2s',
  },
  ctaFormCol: {
    display: 'flex',
    justifyContent: 'center',
  },
  ctaFormCard: {
    background: 'white',
    borderRadius: '24px',
    padding: '36px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
  },
  ctaFormTitle: {
    color: 'var(--dark)',
    fontSize: '1.4rem',
    fontWeight: 800,
    marginBottom: '24px',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  formInput: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.92rem',
    background: '#f8fafc',
    color: 'var(--dark)',
    outline: 'none',
  },
  quoteAiBtn: {
    background: 'rgba(168,85,247,0.08)',
    border: '1px solid rgba(168,85,247,0.25)',
    color: '#a855f7',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    fontSize: '0.9rem',
    width: '100%',
  },
  successIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#d1fae5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  formResetBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: 600,
    textDecoration: 'underline',
  },
  footer: {
    background: '#070a13',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    color: '#94a3b8',
    padding: '70px 20px 30px',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 40,
    marginBottom: '40px',
  },
  footerLogo: {
    color: 'white',
    fontWeight: 900,
    fontSize: '1.6rem',
    marginBottom: '16px',
  },
  footerText: {
    fontSize: '0.9rem',
    lineHeight: 1.65,
  },
  footerHeader: {
    color: 'white',
    fontWeight: 800,
    fontSize: '1.05rem',
    marginBottom: '20px',
  },
  footerLink: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    transition: 'color 0.2s',
    textDecoration: 'none',
  },
  footerContact: {
    fontSize: '0.9rem',
    lineHeight: '1.9',
  },
  footerBottom: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '24px',
    textAlign: 'center',
    fontSize: '0.82rem',
  },
  
  // PACKAGE CARD SPECIFIC
  pkgCard: {
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '18px',
  },
  pkgImgContainer: {
    position: 'relative',
    height: '230px',
    overflow: 'hidden',
  },
  pkgImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s',
  },
  pkgBadgesContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    display: 'flex',
    gap: 6,
  },
  pkgCategoryTag: {
    background: 'rgba(59,130,246,0.9)',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontWeight: 700,
    backdropFilter: 'blur(4px)',
  },
  pkgDiscountTag: {
    background: 'rgba(239,68,68,0.95)',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontWeight: 700,
  },
  pkgDurationContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  pkgDurationBadge: {
    background: 'rgba(15,23,42,0.65)',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.72rem',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontWeight: 700,
  },
  pkgBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  pkgTourType: {
    fontSize: '0.75rem',
    color: 'var(--primary)',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  pkgTitleText: {
    fontWeight: 800,
    color: 'var(--dark)',
    marginBottom: '8px',
    fontSize: '1.1rem',
    lineHeight: 1.4,
  },
  pkgLocationFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginBottom: '16px',
    color: 'var(--text-muted)',
    fontSize: '0.86rem',
  },
  pkgFooter: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  pkgPriceFlex: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
  },
  pkgPriceVal: {
    fontWeight: 800,
    fontSize: '1.35rem',
    color: 'var(--secondary)',
  },
  pkgOriginalPrice: {
    textDecoration: 'line-through',
    color: '#cbd5e1',
    fontSize: '0.82rem',
    display: 'block',
  },
  pkgBtn: {
    padding: '8px 16px',
    fontSize: '0.88rem',
    borderRadius: '8px',
  }
};

export default LandingPage;

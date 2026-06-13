import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Sparkles, 
  Compass, 
  FileText, 
  Users, 
  Phone, 
  Target, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  MapPin,
  Calendar,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  // Animation presets
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  };

  const whyChooseUsData = [
    {
      icon: Globe,
      title: 'Domestic & International Packages',
      desc: 'Explore India and dream global destinations with our thoroughly curated tour itineraries designed for ultimate comfort and cost-effectiveness.',
      color: '#3b82f6'
    },
    {
      icon: Sparkles,
      title: 'AI-Assisted Quick Planning',
      desc: 'Get fast, personalized travel itineraries, destination options, and package estimates tailored to your budget in seconds.',
      color: '#8b5cf6'
    },
    {
      icon: Compass,
      title: 'Customized Itinerary Support',
      desc: 'No two travelers are identical. We fine-tune every schedule, routing, and transit mode according to your exact group dynamics and desires.',
      color: '#10b981'
    },
    {
      icon: FileText,
      title: 'Visa, Ticketing & Transport',
      desc: 'End-to-end hassle-free operations covering flight, train, and bus bookings, passport assistance, visa processing, and certificate attestation.',
      color: '#f59e0b'
    },
    {
      icon: Users,
      title: 'Specialty Group Tours',
      desc: 'Perfectly organized family trips, holy pilgrimages, student study tours, medical travel, and seamless corporate MICE events.',
      color: '#ec4899'
    },
    {
      icon: Phone,
      title: 'Reliable Customer Support',
      desc: 'Enjoy peace of mind with SreePayanam. Our professional experts provide dedicated assistance from your initial enquiry until you return home.',
      color: '#06b6d4'
    }
  ];

  return (
    <div style={styles.pageWrapper}>
      {/* 1. HERO SECTION WITH IMAGE BACKGROUND */}
      <section style={styles.heroSection}>
        <div style={styles.heroImageOverlay} />
        <div style={styles.heroContainer} className="container">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={styles.heroTag}
          >
            <Sparkles size={14} style={{ marginRight: 6, color: '#fbbf24' }} />
            <span>PLAN SMART. TRAVEL BETTER. CREATE MEMORIES.</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={styles.heroTitle}
          >
            About SreePayanam
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={styles.heroSubtitle}
          >
            Your trusted travel and tourism service provider offering complete, customized, and AI-enabled travel solutions across the globe.
          </motion.p>
        </div>
      </section>

      {/* 2. THE STORY / MAIN ABOUT SECTION */}
      <section style={styles.storySection}>
        <div className="container">
          <div style={styles.storyGrid}>
            {/* Left side: Images Collage */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={styles.collageContainer}
            >
              <img 
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80" 
                alt="Traveler enjoying beautiful view" 
                style={{ ...styles.collageImage, ...styles.imageMain }}
              />
              <img 
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&q=80" 
                alt="Passport and maps" 
                style={{ ...styles.collageImage, ...styles.imageSub }}
              />
              <div style={styles.statsFloatCard}>
                <Award size={32} color="#3b82f6" />
                <div>
                  <h4 style={styles.statsNumber}>100%</h4>
                  <p style={styles.statsLabel}>Hassle-Free Travel</p>
                </div>
              </div>
            </motion.div>

            {/* Right side: Story Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={styles.storyContent}
            >
              <div style={styles.accentBadge}>OUR JOURNEY</div>
              <h2 style={styles.sectionHeading}>Who We Are</h2>
              <p style={styles.paragraphHighlight}>
                SreePayanam Tours & Travels is a trusted travel and tourism service provider offering complete travel solutions for individuals, families, students, corporates, pilgrims, and groups.
              </p>
              <p style={styles.paragraphText}>
                With years of experience in the travel industry, we help our customers plan comfortable, affordable, and memorable journeys across India and international destinations. Our services include tour packages, flight booking, hotel booking, train and bus booking, visa assistance, passport support, certificate attestation, travel insurance, and transport arrangements.
              </p>
              <p style={styles.paragraphText}>
                At SreePayanam, we understand that every traveler has different needs. That is why we provide customized travel planning based on destination, budget, travel dates, group size, and personal preferences. We also use AI-assisted quick travel planning to provide faster destination ideas, sample itineraries, and suitable package suggestions.
              </p>
              <p style={styles.paragraphHighlight}>
                Our ultimate goal is to make travel simple, safe, and enjoyable by offering reliable support from the first enquiry until the completion of the journey.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. VISION & MISSION */}
      <section style={styles.visionMissionSection}>
        <div className="container">
          <div style={styles.visionMissionGrid}>
            {/* Vision Card */}
            <motion.div
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ ...styles.pillarCard, borderTop: '4px solid #3b82f6' }}
            >
              <div style={{ ...styles.iconContainer, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <Eye size={28} color="#3b82f6" />
              </div>
              <h3 style={styles.pillarTitle}>Our Vision</h3>
              <p style={styles.pillarText}>
                To become a reliable and customer-friendly travel partner for domestic and international travel services.
              </p>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.15)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ ...styles.pillarCard, borderTop: '4px solid #10b981' }}
            >
              <div style={{ ...styles.iconContainer, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <Target size={28} color="#10b981" />
              </div>
              <h3 style={styles.pillarTitle}>Our Mission</h3>
              <p style={styles.pillarText}>
                To provide affordable, customized, and hassle-free travel solutions with professional service, transparent communication, and customer satisfaction.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section style={styles.whySection}>
        <div className="container">
          <div style={styles.centerHeading}>
            <div style={styles.accentBadgeCenter}>OUR ADVANTAGES</div>
            <h2 style={styles.sectionHeadingCenter}>Why Choose SreePayanam?</h2>
            <div style={styles.headingDivider} />
            <p style={styles.headingDescription}>
              We combine years of destination expertise with modern AI planning technology to give you absolute peace of mind.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={styles.whyGrid}
          >
            {whyChooseUsData.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                style={styles.whyCard}
              >
                <div style={{ ...styles.whyIconWrapper, backgroundColor: `${item.color}15`, color: item.color }}>
                  <item.icon size={24} />
                </div>
                <h4 style={styles.whyCardTitle}>{item.title}</h4>
                <p style={styles.whyCardDesc}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. BRAND CTA & TAGLINE BANNER */}
      <section style={styles.ctaSection}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={styles.ctaCard}
          >
            <div style={styles.ctaOverlay} />
            <div style={styles.ctaContent}>
              <h2 style={styles.ctaTagline}>SreePayanam Tours & Travels</h2>
              <h3 style={styles.ctaSubtagline}>Plan Smart. Travel Better. Create Memories.</h3>
              <p style={styles.ctaText}>
                Ready to plan your next remarkable adventure? Let our combination of custom itineraries and AI-assisted planning unlock the best experiences for you.
              </p>
              <div style={styles.ctaButtonRow}>
                <Link to="/packages" className="btn btn-primary" style={styles.ctaBtnPrimary}>
                  Explore Our Packages <ArrowRight size={18} style={{ marginLeft: 8 }} />
                </Link>
                <Link to="/contact" className="btn" style={styles.ctaBtnSecondary}>
                  Contact Travel Desk
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Premium Stylesheet using standard CSS properties and elegant typography variables
const styles = {
  pageWrapper: {
    backgroundColor: '#f8fafc',
    color: '#334155',
    overflowX: 'hidden',
    paddingBottom: '80px',
  },
  heroSection: {
    position: 'relative',
    height: '420px',
    backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#ffffff',
  },
  heroImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    zIndex: 1,
  },
  heroContainer: {
    position: 'relative',
    zIndex: 2,
    padding: '0 20px',
  },
  heroTag: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '6px 16px',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '1.5px',
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    margin: '0 0 16px',
    textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    letterSpacing: '-0.5px',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    maxWidth: '750px',
    margin: '0 auto',
    opacity: '0.95',
    lineHeight: '1.6',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  storySection: {
    padding: '100px 0 60px',
  },
  storyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '60px',
    alignItems: 'center',
  },
  collageContainer: {
    position: 'relative',
    height: '480px',
  },
  collageImage: {
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
    position: 'absolute',
  },
  imageMain: {
    width: '78%',
    height: '82%',
    objectFit: 'cover',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  imageSub: {
    width: '55%',
    height: '58%',
    objectFit: 'cover',
    bottom: 0,
    right: 0,
    zIndex: 2,
    border: '8px solid #ffffff',
  },
  statsFloatCard: {
    position: 'absolute',
    bottom: '24px',
    left: '24px',
    zIndex: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 12px 24px rgba(15,23,42,0.15)',
    borderRadius: '16px',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statsNumber: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    lineHeight: 1,
  },
  statsLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0,
    fontWeight: '600',
  },
  storyContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  accentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#2563eb',
    fontWeight: '700',
    fontSize: '0.8rem',
    padding: '6px 14px',
    borderRadius: '100px',
    letterSpacing: '1px',
  },
  accentBadgeCenter: {
    display: 'inline-block',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#2563eb',
    fontWeight: '700',
    fontSize: '0.8rem',
    padding: '6px 14px',
    borderRadius: '100px',
    letterSpacing: '1px',
    marginBottom: '16px',
  },
  sectionHeading: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  sectionHeadingCenter: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  paragraphHighlight: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.6',
    borderLeft: '4px solid #3b82f6',
    paddingLeft: '16px',
  },
  paragraphText: {
    fontSize: '1.05rem',
    color: '#475569',
    lineHeight: '1.7',
    margin: 0,
  },
  visionMissionSection: {
    padding: '40px 0 80px',
  },
  visionMissionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
  },
  pillarCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
    border: '1px solid rgba(241, 245, 249, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    transition: 'all 0.3s ease',
  },
  pillarTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  pillarText: {
    fontSize: '1.1rem',
    color: '#475569',
    lineHeight: '1.6',
    margin: 0,
  },
  iconContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whySection: {
    padding: '80px 0',
    backgroundColor: '#ffffff',
  },
  centerHeading: {
    textAlign: 'center',
    maxWidth: '700px',
    margin: '0 auto 60px',
  },
  headingDivider: {
    width: '60px',
    height: '4px',
    backgroundColor: '#3b82f6',
    margin: '20px auto',
    borderRadius: '2px',
  },
  headingDescription: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: 0,
  },
  whyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  },
  whyCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #f1f5f9',
    borderRadius: '20px',
    padding: '30px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  whyIconWrapper: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyCardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  whyCardDesc: {
    fontSize: '0.98rem',
    color: '#475569',
    lineHeight: '1.6',
    margin: 0,
  },
  ctaSection: {
    padding: '60px 0 20px',
  },
  ctaCard: {
    position: 'relative',
    borderRadius: '32px',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '80px 40px',
    boxShadow: '0 20px 40px rgba(15,23,42,0.3)',
  },
  ctaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.12,
    zIndex: 1,
  },
  ctaContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  ctaTagline: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#3b82f6',
    margin: 0,
    letterSpacing: '0.5px',
  },
  ctaSubtagline: {
    fontSize: '2.4rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    lineHeight: '1.2',
  },
  ctaText: {
    fontSize: '1.15rem',
    color: '#cbd5e1',
    lineHeight: '1.6',
    margin: 0,
  },
  ctaButtonRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '12px',
  },
  ctaBtnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 32px',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    transition: 'all 0.3s ease',
  },
  ctaBtnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 32px',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    transition: 'all 0.3s ease',
    hover: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    }
  }
};

export default AboutUs;

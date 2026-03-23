import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Send, Utensils } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('footer.email_required', "Veuillez entrer votre adresse email"));
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('footer.email_invalid', "Veuillez entrer une adresse email valide"));
      return;
    }

    setSubscribing(true);
    
    // Simulate subscription (replace with actual API call if needed)
    setTimeout(() => {
      toast.success(t('footer.subscribe_success', "Merci pour votre inscription !"));
      setEmail("");
      setSubscribing(false);
    }, 1000);
  };
  return (
    <footer style={{ background: "#020617", color: "#cbd5f5" }}>
      <style>{`
        .social-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #cbd5f5;
          text-decoration: none;
        }
        .social-btn:hover {
          background: var(--primary);
          transform: translateY(-3px);
        }
        .footer-link {
          color: #cbd5f5;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: var(--primary);
        }
      `}</style>
      
      <div style={{
        maxWidth: "1300px",
        margin: "auto",
        padding: "60px 20px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
        gap: "40px"
      }}>

        {/* BRAND */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"15px"}}>
            <Utensils size={28} style={{ color: 'var(--primary)' }} />
            <h2 style={{color:"#fff"}}>{t('footer.brand', 'Food Finder')}</h2>
          </div>

          <p style={{lineHeight:"1.6", marginBottom:"20px"}}>
            {t('footer.brand_desc', "Discover the best restaurants around you based on your tastes, budget, and dietary needs.")}
          </p>

          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>

            <div style={{display:"flex",gap:"8px"}}>
              <MapPin size={18}/>
              {t('footer.location', 'Morocco, Larache')}
            </div>

            <div style={{display:"flex",gap:"8px"}}>
              <Phone size={18}/>
              {t('footer.phone', '+212 639 23 84 90')}
            </div>

            <div style={{display:"flex",gap:"8px"}}>
              <Mail size={18}/>
              {t('footer.email', 'foodfinder@gmail.com')}
            </div>

          </div>
        </div>


        {/* QUICK LINKS */}
        <div>
          <h3 style={{color:"#fff",marginBottom:"18px"}}>{t('footer.quick_links', 'QUICK LINKS')}</h3>

          <ul style={{listStyle:"none",padding:0,lineHeight:"2"}}>
            <li><a href="/about" className="footer-link">{t('footer.about', 'About')}</a></li>
            <li><a href="/contact" className="footer-link">{t('footer.contact', 'Contact')}</a></li>
            <li><a href="/help" className="footer-link">{t('footer.help', 'Help')}</a></li>
            <li><a href="/privacy" className="footer-link">{t('footer.privacy', 'Privacy Policy')}</a></li>
            <li><a href="/terms" className="footer-link">{t('footer.terms', 'Terms of Service')}</a></li>
            <li><a href="/admin/login" className="footer-link" style={{color: "var(--primary)"}}>{t('footer.admin', 'Admin Access')}</a></li>
          </ul>
        </div>


        {/* SOCIAL */}
        <div>
          <h3 style={{color:"#fff",marginBottom:"18px"}}>{t('footer.follow_us', 'FOLLOW US')}</h3>

          <div style={{display:"flex",gap:"15px",marginBottom:"15px"}}>

            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn">
              <Facebook size={18}/>
            </a>

            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn">
              <Instagram size={18}/>
            </a>

            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-btn">
              <Youtube size={18}/>
            </a>

          </div>

          <p style={{fontSize:"14px"}}>
            {t('footer.follow_desc', "Stay connected and follow our latest updates.")}
          </p>
        </div>


        {/* NEWSLETTER */}
        <div>
          <h3 style={{color:"#fff",marginBottom:"18px"}}>{t('footer.newsletter', 'NEWSLETTER')}</h3>

          <p style={{marginBottom:"15px"}}>
            {t('footer.newsletter_desc', "Subscribe to get the latest restaurant picks and exclusive offers.")}
          </p>

          <form onSubmit={handleSubscribe} style={{display: 'flex', gap: '0.5rem'}}>

            <input
              type="email"
              placeholder={t('footer.email_placeholder', 'Enter your email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribing}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "1px solid var(--border-color)",
                background: "var(--card-bg)",
                color: "var(--text-main)",
                borderRadius: "8px 0 0 8px",
                fontSize: "0.9rem",
                outline: "none",
                transition: "all 0.2s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary)";
                e.target.style.boxShadow = "0 0 0 3px rgba(240, 90, 40, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-color)";
                e.target.style.boxShadow = "none";
              }}
            />

            <button 
              type="submit"
              disabled={subscribing}
              style={{
                padding: "12px 18px",
                border: "none",
                background: "var(--primary)",
                color: "#fff",
                borderRadius: "0 8px 8px 0",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--primary-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--primary)";
              }}
            >
              <Send size={18}/>
            </button>

          </form>

          <p style={{fontSize:"12px",marginTop:"10px"}}>
            {t('footer.no_spam', 'No spam, unsubscribe anytime.')}
          </p>

        </div>

      </div>


      {/* BOTTOM BAR */}
      <div style={{
        borderTop:"1px solid #1e293b",
        padding:"15px 20px",
        display:"flex",
        justifyContent:"space-between",
        flexWrap:"wrap",
        maxWidth:"1300px",
        margin:"auto"
      }}>

        <p>© 2026 Food Finder. All rights reserved.</p>

        <div style={{display:"flex",gap:"20px"}}>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
          <a href="/terms" className="footer-link">Terms of Service</a>
          <a href="/cookies" className="footer-link">Cookies</a>
        </div>

      </div>

    </footer>
  );
}

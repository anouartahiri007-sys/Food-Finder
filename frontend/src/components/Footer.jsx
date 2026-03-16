import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubscribing(true);
    
    // Simulate subscription (replace with actual API call if needed)
    setTimeout(() => {
      toast.success("Thank you for subscribing!");
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
            <div style={{
              width:"42px",
              height:"42px",
              borderRadius:"10px",
              background:"var(--primary)",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              color:"#fff",
              fontWeight:"bold"
            }}>
              🍽
            </div>

            <h2 style={{color:"#fff"}}>Food Finder</h2>
          </div>

          <p style={{lineHeight:"1.6", marginBottom:"20px"}}>
            Discover the best restaurants around you based on your tastes,
            budget, and dietary needs.
          </p>

          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>

            <div style={{display:"flex",gap:"8px"}}>
              <MapPin size={18}/>
              maroc, larache
            </div>

            <div style={{display:"flex",gap:"8px"}}>
              <Phone size={18}/>
              +212 639 23 84 90
            </div>

            <div style={{display:"flex",gap:"8px"}}>
              <Mail size={18}/>
              foodfinder@gmail.com
            </div>

          </div>
        </div>


        {/* QUICK LINKS */}
        <div>
          <h3 style={{color:"#fff",marginBottom:"18px"}}>QUICK LINKS</h3>

          <ul style={{listStyle:"none",padding:0,lineHeight:"2"}}>
            <li><a href="/about" className="footer-link">About</a></li>
            <li><a href="/contact" className="footer-link">Contact</a></li>
            <li><a href="/help" className="footer-link">Help</a></li>
            <li><a href="/privacy" className="footer-link">Privacy Policy</a></li>
            <li><a href="/terms" className="footer-link">Terms of Service</a></li>
            <li><a href="/admin/login" className="footer-link" style={{color: "var(--primary)"}}>Admin Access</a></li>
          </ul>
        </div>


        {/* SOCIAL */}
        <div>
          <h3 style={{color:"#fff",marginBottom:"18px"}}>FOLLOW US</h3>

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
            Stay connected and follow our latest updates.
          </p>
        </div>


        {/* NEWSLETTER */}
        <div>
          <h3 style={{color:"#fff",marginBottom:"18px"}}>NEWSLETTER</h3>

          <p style={{marginBottom:"15px"}}>
            Subscribe to get the latest restaurant picks and exclusive offers.
          </p>

          <form onSubmit={handleSubscribe} style={{display:"flex"}}>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribing}
              style={{
                flex:1,
                padding:"12px",
                border:"none",
                background:"#1e293b",
                color:"#fff",
                borderRadius:"8px 0 0 8px"
              }}
            />

            <button 
              type="submit"
              disabled={subscribing}
              style={{
                padding:"12px 18px",
                border:"none",
                background:"var(--primary)",
                color:"#fff",
                borderRadius:"0 8px 8px 0",
                cursor:"pointer"
              }}
            >
              <Send size={18}/>
            </button>

          </form>

          <p style={{fontSize:"12px",marginTop:"10px"}}>
            No spam, unsubscribe anytime.
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

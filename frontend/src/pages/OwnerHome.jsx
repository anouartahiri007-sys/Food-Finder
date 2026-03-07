import { Store, BarChart3, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OwnerHome = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '0 2rem 4rem' }}>
            {/* Hero Section */}
            <div style={{
                textAlign: 'center',
                padding: '5rem 2rem',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                borderRadius: 'var(--radius-lg)',
                color: 'white',
                marginTop: '1rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                        Propulsez votre <span style={{ color: '#fbbf24' }}>Restaurant</span> <br />vers de nouveaux sommets
                    </h1>
                    <p style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 2.5rem', opacity: '0.9' }}>
                        Gérez vos réservations, analysez vos performances et attirez plus de clients avec nos outils SaaS puissants et intuitifs.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <button className="btn btn-primary" style={{ backgroundColor: '#fbbf24', color: '#000', borderColor: '#fbbf24', padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => navigate('/dashboard')}>
                            Accéder au Tableau de bord
                        </button>
                        <button className="btn btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'transparent', padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => navigate('/add-restaurant')}>
                            Ajouter un établissement
                        </button>
                    </div>
                </div>
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', filter: 'blur(50px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '250px', height: '250px', borderRadius: '50%', backgroundColor: 'rgba(251,191,36,0.15)', filter: 'blur(50px)' }}></div>
            </div>

            {/* Quick Actions / Stats Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '-3rem', zIndex: 2, position: 'relative', padding: '0 2rem' }}>
                <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '4px solid #4f46e5' }}>
                    <div style={{ backgroundColor: 'rgba(79,70,229,0.1)', color: '#4f46e5', padding: '1rem', borderRadius: '15px' }}>
                        <Store size={28} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Multi-établissements</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gérez tous vos points de vente depuis un compte unique.</p>
                    </div>
                </div>
                <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '4px solid #10b981' }}>
                    <div style={{ backgroundColor: 'rgba(16,185,201,0.1)', color: '#10b981', padding: '1rem', borderRadius: '15px' }}>
                        <BarChart3 size={28} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Analyses en temps réel</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Suivez vos taux d'occupation et vos revenus quotidiens.</p>
                    </div>
                </div>
                <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '4px solid #f59e0b' }}>
                    <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '1rem', borderRadius: '15px' }}>
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Croissance garantie</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Optimisez votre visibilité sur notre réseau de gourmets.</p>
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div style={{ marginTop: '5rem', display: 'flex', alignItems: 'center', gap: '4rem', padding: '0 2rem' }}>
                <div style={{ flex: 1 }}>
                    <span style={{ color: '#4f46e5', fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pourquoi nous choisir ?</span>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '1rem', marginBottom: '1.5rem' }}>Une solution tout-en-un pour les restaurateurs modernes.</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Food Finder n'est pas seulement un annuaire. C'est votre partenaire de croissance.
                        Notre interface SaaS vous permet de gérer vos réservations en un clic et de garder
                        le contact avec votre clientèle fidèle.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontWeight: '600' }}>
                            <div style={{ backgroundColor: '#4f46e5', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>✓</div>
                            Confirmation de réservation instantanée
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontWeight: '600' }}>
                            <div style={{ backgroundColor: '#4f46e5', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>✓</div>
                            Tableau de bord CEO personnalisé
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontWeight: '600' }}>
                            <div style={{ backgroundColor: '#4f46e5', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>✓</div>
                            Support prioritaire 24/7
                        </li>
                    </ul>
                    <button className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        En savoir plus <ArrowRight size={18} />
                    </button>
                </div>
                <div style={{ flex: 1, backgroundColor: 'var(--card-bg)', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Aperçu Dashboard</h4>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ height: '80px', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '10px' }}></div>
                        <div style={{ height: '80px', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '10px' }}></div>
                        <div style={{ height: '150px', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '10px', gridColumn: 'span 2' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerHome;

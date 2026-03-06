import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const StaticPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname.substring(1);

    const pageContent = {
        'about': {
            title: 'À propos de Food Finder',
            content: "Food Finder est la plateforme leader pour découvrir des restaurants adaptés à vos besoins alimentaires. Notre mission est de rendre la gastronomie accessible à tous, quelles que soient les restrictions ou préférences."
        },
        'contact': {
            title: 'Contactez-nous',
            content: "Vous avez des questions ? Notre équipe est là pour vous aider. Contactez-nous à support@foodfinder.com ou via nos réseaux sociaux."
        },
        'help': {
            title: 'Centre d\'aide',
            content: "Comment réserver ? Comment ajouter mon restaurant ? Trouvez toutes les réponses à vos questions dans notre FAQ complète."
        },
        'terms': {
            title: 'Conditions d\'utilisation',
            content: "En utilisant Food Finder, vous acceptez nos conditions générales d'utilisation. Nous nous efforçons de fournir des informations précises, mais déclinons toute responsabilité en cas d'erreur de la part des restaurateurs."
        },
        'privacy': {
            title: 'Confidentialité',
            content: "Votre vie privée est notre priorité. Nous utilisons vos données uniquement pour améliorer votre expérience de recherche et de réservation."
        },
        'rgpd': {
            title: 'RGPD',
            content: "Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles."
        }
    };

    const page = pageContent[path.toLowerCase()] || { title: 'Page Non Trouvée', content: 'Désolé, cette page n\'existe pas.' };

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem' }}>
                <ArrowLeft size={18} /> Retour
            </button>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>{page.title}</h1>
            <div className="card" style={{ padding: '2rem', lineHeight: '1.6', fontSize: '1.1rem' }}>
                {page.content}
            </div>
        </div>
    );
};

export default StaticPage;

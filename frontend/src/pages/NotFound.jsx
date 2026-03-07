import { Link } from 'react-router-dom';
import { ChefHat, Home } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh',
                textAlign: 'center',
                padding: '2rem'
            }}
        >
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <ChefHat size={120} color="var(--primary)" style={{ opacity: 0.2 }} />
                <h1 style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '4rem',
                    fontWeight: '900',
                    color: 'var(--danger)',
                    margin: 0
                }}>
                    404
                </h1>
            </div>

            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Plat Introuvable !</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Il semblerait que la page que vous cherchez n'est pas au menu. Elle a peut-être été dévorée ou déplacée.
            </p>

            <Link to="/" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', fontSize: '1.1rem' }}>
                <Home size={20} /> Retourner à l'Accueil
            </Link>
        </motion.div>
    );
};

export default NotFound;

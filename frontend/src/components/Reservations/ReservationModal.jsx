import { useState } from 'react';
import api from '../../api/axios';

const ReservationModal = ({ restaurant, onClose, onReserved }) => {
    const [formData, setFormData] = useState({
        reservation_date: '',
        reservation_time: '',
        guests_count: 2
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post(`/restaurants/${restaurant.id}/reservations`, formData);
            onReserved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la réservation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content card">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h3>Réserver une table chez {restaurant.name}</h3>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group full-width">
                        <label>Date</label>
                        <input
                            type="date"
                            className="input-base"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.reservation_date}
                            onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Heure</label>
                        <input
                            type="time"
                            className="input-base"
                            required
                            value={formData.reservation_time}
                            onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Nombre de personnes</label>
                        <input
                            type="number"
                            className="input-base"
                            required
                            min="1"
                            max="20"
                            value={formData.guests_count}
                            onChange={(e) => setFormData({ ...formData, guests_count: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                        {loading ? 'Réservation...' : 'Confirmer la réservation'}
                    </button>
                    <button type="button" className="btn btn-secondary full-width" onClick={onClose}>
                        Annuler
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReservationModal;

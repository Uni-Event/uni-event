import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout'; 
import EventCard from '../components/EventCard';
import api from '../services/api';

function OrganizerHomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/api/events/'); 
        setEvents(response.data);
      } catch (err) {
        console.error("Eroare:", err);
        setError("Nu am putut încărca evenimentele.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Layout>
      <div style={{ padding: '0rem' }}>
        
        <h1 style={{ 
            fontSize: '2rem', 
            color: '#2d3748', 
            marginBottom: '2rem' 
        }}>
          Panou Organizator
        </h1>
        
        {loading && <p>Se încarcă evenimentele...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
              {events.length > 0 ? (
                events.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    showFavorite={false}  
                  />
                ))
              ) : (
                <p>Nu există evenimente active.</p>
              )}
            </div>
        )}
      </div>
    </Layout>
  )
}

export default OrganizerHomePage;
import React from 'react';
import Layout from '../components/Layout';
import EventCard from '../components/EventCard';

function HomePage() {
  return (
    <Layout>
      <div style={{ padding: '0rem' }}>

        {/* Header pagină */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#2d3748', marginBottom: '0.5rem' }}>
            Evenimente USV
          </h1>
          <p style={{ color: '#718096' }}>
            Descoperă ce se întâmplă în campus săptămâna aceasta.
          </p>
        </div>

        {/* Grid evenimente */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}
        >
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
        </div>

      </div>
    </Layout>
  );
}

export default HomePage;




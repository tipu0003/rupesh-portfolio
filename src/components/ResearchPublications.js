// src/components/ResearchPublications.js
import React, { useEffect } from 'react';
import './ResearchPublications.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { PUBLICATIONS as publications } from '../data/publications';

function ResearchPublications() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const publicationData = {
    labels: ['Journal Articles', 'Conference Proceedings', 'Book Chapters', 'Patents'],
    datasets: [
      {
        label: 'Number of Publications',
        data: [26, 6, 0, 6],
        backgroundColor: '#003366',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#333', font: { size: 14 } } },
      title: { display: true, text: 'Research Publications Overview', color: '#333', font: { size: 18 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#333', font: { size: 12 } } },
      x: { ticks: { color: '#333', font: { size: 12 } } },
    },
  };

  return (
    <section id="publications" className="research-publications" data-aos="fade-up">
      <div className="container">
        <h2>Research Publications</h2>

        <div className="chart">
          <Bar data={publicationData} options={options} />
        </div>

        <div className="publications-list">
          <h3>Detailed Research Publications</h3>

          {/* Journal Articles */}
          <div className="publication-category">
            <h4>Journal Articles</h4>
            <ol>
              {publications['Journal Articles'].map((pub, index) => (
                <li key={`ja-${index}`}>
                  {pub.authors}, {pub.year}. <strong>{pub.title}</strong>. <em>{pub.journal}</em>, {pub.date}.
                  {pub.doi && (
                    <> <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">DOI:{pub.doi}</a></>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Conference Proceedings */}
          <div className="publication-category">
            <h4>Conference Proceedings</h4>
            <ol>
              {publications['Conference Proceedings'].map((pub, index) => (
                <li key={`cp-${index}`}>
                  {pub.authors}. <strong>{pub.title}</strong> - <em>{pub.conference}</em>
                  {pub.publisher && `, ${pub.publisher}`}
                  {pub.volume && `, Vol. ${pub.volume}`}
                  {pub.number && `, No. ${pub.number}`}
                  {pub.article && `, Article ${pub.article}`}
                  {pub.date && `, ${pub.date}`}
                  {pub.year && `, ${pub.year}`}.
                  {pub.doi && (
                    <> <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">DOI:{pub.doi}</a></>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Patents */}
          <div className="publication-category">
            <h4>Patents</h4>
            <ol>
              {publications['Patents'].map((pub, index) => (
                <li key={`patent-${index}`}>
                  {pub.authors}, {pub.year}. <strong>{pub.title}</strong>. Patent, {pub.country}, Patent No. {pub.patentNumber}, {pub.date}. {pub.status}.
                  {pub.doi && (
                    <> <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">DOI:{pub.doi}</a></>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResearchPublications;

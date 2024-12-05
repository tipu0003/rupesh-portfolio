import React, { useEffect } from 'react';
import './ResearchPublications.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

function ResearchPublications() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const publicationData = {
        labels: ['Research Papers', 'Book Chapters', 'Conferences', 'Books', 'Patents'],
        datasets: [
            {
                label: 'Number of Publications',
                data: [22, 3, 7, 1, 6],
                backgroundColor: '#003366',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Research Publications Overview',
            },
        },
    };

    return (
        <section id="publications" className="research-publications" data-aos="fade-up">
            <div className="container">
                <h2>Research Publications</h2>
                <div className="chart">
                    <Bar data={publicationData} options={options} />
                </div>
                {/* Detailed Publications List */}
                <div className="publications-list">
                    <h3>Detailed Research Publications</h3>
                    <div className="publication-category">
                        <h4>Journal Articles</h4>
                        <ol>
                            <li>
                                Hong, X., Mostafa, M.A.M., Almoghayer, W.J.K., Isleem, H.F., Tipu, R.K., and Tejani, G., 2024. <strong>Structural integrity of circular concrete-filled steel tubes with diverse inner reinforcements steel: An FE and ML approach</strong>. <em>Mechanics of Advanced Materials and Structures</em>, December 2024.
                            </li>
                            <li>
                                Mohamed, H.S., Qiong, T., Isleem, H.F., Tipu, R.K., Shahin, R.I., Yehia, S.A., Jangir, P., Arpita and Khishe, M., 2024. <strong>Compressive behavior of elliptical concrete-filled steel tubular short columns using numerical investigation and machine learning techniques</strong>. <em>Scientific Reports</em>, Springer Nature, 14(1), p.27007. <a href="https://doi.org/10.1038/s41598-024-77396-5" target="_blank" rel="noopener noreferrer">DOI:10.1038/s41598-024-77396-5</a>
                            </li>
                            {/* Add other journal articles similarly */}
                            {/* ... */}
                        </ol>
                    </div>
                    <div className="publication-category">
                        <h4>Conference Proceedings</h4>
                        <ol>
                            <li>
                                Tipu, Rupesh Kumar; Panchal, VR; Pandya, KS. <strong>Prediction of concrete properties using machine learning algorithm</strong> - <em>Journal of Physics: Conference Series</em>, IOP Publishing, Vol. 2273, No. 1, Article 012016, 2022. <a href="https://doi.org/10.1088/1742-6596/2273/1/012016" target="_blank" rel="noopener noreferrer">DOI:10.1088/1742-6596/2273/1/012016</a>
                            </li>
                            {/* Add other conference proceedings similarly */}
                            {/* ... */}
                        </ol>
                    </div>
                    {/* Add other publication categories like Book Chapters, Patents as needed */}
                </div>
            </div>
        </section>
    );
}

export default ResearchPublications;

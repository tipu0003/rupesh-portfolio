// src/components/ResearchPublications.js

import React, { useEffect } from 'react';
import './ResearchPublications.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import PublicationsCarousel from "./PublicationsCarousel";


function ResearchPublications() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const publicationData = {
        labels: ['Journal Articles', 'Conference Proceedings', 'Book Chapters', 'Patents'],
        datasets: [
            {
                label: 'Number of Publications',
                data: [26, 6, 0, 6], // Journal Articles: 26, Conference Proceedings: 6, Book Chapters: 0, Patents: 6
                backgroundColor: '#003366',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#333',
                    font: {
                        size: 14,
                    },
                },
            },
            title: {
                display: true,
                text: 'Research Publications Overview',
                color: '#333',
                font: {
                    size: 18,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#333',
                    font: {
                        size: 12,
                    },
                },
            },
            x: {
                ticks: {
                    color: '#333',
                    font: {
                        size: 12,
                    },
                },
            },
        },
    };

    const publications = {
        'Journal Articles': [
            {
                authors: 'Hong, X., Mostafa, M.A.M., Almoghayer, W.J.K., Isleem, H.F., Tipu, R.K., and Tejani, G.',
                year: 2024,
                title: 'Structural integrity of circular concrete-filled steel tubes with diverse inner reinforcements steel: An FE and ML approach',
                journal: 'Mechanics of Advanced Materials and Structures',
                date: 'December 2024',
                doi: '',
            },
            {
                authors: 'Mohamed, H.S., Qiong, T., Isleem, H.F., Tipu, R.K., Shahin, R.I., Yehia, S.A., Jangir, P., Arpita and Khishe, M.',
                year: 2024,
                title: 'Compressive behavior of elliptical concrete-filled steel tubular short columns using numerical investigation and machine learning techniques',
                journal: 'Scientific Reports',
                date: 'Springer Nature, 14(1), p.27007',
                doi: '10.1038/s41598-024-77396-5',
            },
            {
                authors: 'Chi Xu, Ying Zhang, Haytham F. Isleem, Dianle Qiu, Yun Zhang, Mostafa Medhat Alsaadawi, Rupesh Kumar Tipu, Waleed E. El-Demerdash, Asmaa Y. Hamed',
                year: 2024,
                title: 'Numerical and machine learning models for concentrically and eccentrically loaded CFST columns confined with FRP wraps',
                journal: 'Structural Concrete',
                date: 'Wiley, 2024',
                doi: '10.1002/suco.202400541',
            },
            {
                authors: 'Lamba, Pooja; Kaur, Dilraj Preet; Raj, Seema; Tipu, Rupesh Kumar; Sorout, Jyoti; Malik, Abdul; Khan, Azmat Ali',
                year: 2024,
                title: 'Repurposing plastic waste: Experimental study and predictive analysis using machine learning in bricks',
                journal: 'Journal of Molecular Structure',
                date: 'Elsevier, Vol. 1317, pp. 139158',
                doi: '10.1016/j.molstruc.2024.139158',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Batra, Vandna; Pandya, KS; Panchal, VR',
                year: 2024,
                title: 'Predicting compressive strength of concrete with iron waste: A BPNN approach',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, pp. 1--9',
                doi: '10.1007/s42107-024-01130-9',
            },
            {
                authors: 'Singh, R., Tipu, R. K., Mir, A. A., & Patel, M.',
                year: 2024,
                title: 'Predictive Modelling of Flexural Strength in Recycled Aggregate-Based Concrete: A Comprehensive Approach with Machine Learning and Global Sensitivity Analysis',
                journal: 'Iranian Journal of Science and Technology, Transactions of Civil Engineering',
                date: '1-26',
                doi: '10.1007/s40996-024-01502-w',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Suman; Batra, Vandna',
                year: 2024,
                title: 'Development of a hybrid stacked machine learning model for predicting compressive strength of high-performance concrete',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, Vol. 25, No. 3, pp. 2483--2497',
                doi: '10.1007/s42107-023-00689-z',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Suman; Batra, Vandna',
                year: 2024,
                title: 'Enhancing prediction accuracy of workability and compressive strength of high-performance concrete through extended dataset and improved machine learning models',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, Vol. 25, No. 1, pp. 197--218',
                doi: '10.1007/s42107-023-00768-1',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Panchal, VR; Pandya, KS',
                year: 2024,
                title: 'Enhancing chloride concentration prediction in marine concrete using conjugate gradient-optimized backpropagation neural network',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, Vol. 25, No. 1, pp. 637--656',
                doi: '10.1007/s42107-023-00801-3',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Batra, Vandna; Suman; Panchal, VR; Pandya, KS',
                year: 2024,
                title: 'Predictive modelling of shear strength in fiber-reinforced cementitious matrix-strengthened RC beams using machine learning',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, pp. 1--11',
                doi: '10.1007/s42107-024-00838-4',
            },
            {
                authors: 'Kumar, Rahul; Rathore, Ayush; Singh, Rajwinder; Mir, Ajaz Ahmad; Tipu, Rupesh Kumar; Patel, Mahesh',
                year: 2024,
                title: 'Prognosis of flow of fly ash and blast furnace slag-based concrete: leveraging advanced machine learning algorithms',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, Vol. 25, No. 3, pp. 2483--2497',
                doi: '10.1007/s42107-023-00922-9',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Arora, Rishabh; Kumar, Kaushal',
                year: 2024,
                title: 'Machine learning-based prediction of concrete strength properties with coconut shell as partial aggregate replacement: A sustainable approach in construction engineering',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, Vol. 25, No. 3, pp. 2979--2992',
                doi: '10.1007/s42107-024-00835-7',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Panchal, VR; Pandya, KS',
                year: 2024,
                title: 'Machine learning-based prediction of concrete strengths with coconut shell as partial coarse aggregate replacement: a comprehensive analysis and sensitivity study',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, pp. 1--18',
                doi: '10.1007/s42107-024-00836-6',
            },
            {
                authors: 'Kumar, Kaushal; Arora, Rishabh; Tipu, Rupesh Kumar; Dixit, Saurav; Vatin, Nikolai; Arya, Sandeep',
                year: 2024,
                title: 'Influence of machine learning approaches for partial replacement of cement content through waste in construction sector',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, pp. 1--13',
                doi: '10.1007/s42107-024-00837-5',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Batra, Vandna; Suman.',
                year: 2024,
                title: 'Predictive modeling of shear strength in fiber-reinforced cementitious matrix-strengthened RC beams using machine learning',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, pp. 1--11, 2024',
                doi: '10.1007/s42107-024-00838-4',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Batra, Vandna; Suman; Panchal, VR; Pandya, KS; Patel, Gaurang A.',
                year: 2024,
                title: 'Optimizing compressive strength in sustainable concrete: a machine learning approach with iron waste integration',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, pp. 1--26, 2024',
                doi: '10.1007/s42107-024-00839-3',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Suman; Batra, Vandna.',
                year: 2023,
                title: 'Development of a hybrid stacked machine learning model for predicting compressive strength of high-performance concrete',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, Vol. 24, No. 8, pp. 2985--3000, 2023',
                doi: '10.1007/s42107-023-00689-z',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Panchal, VR; Pandya, KS.',
                year: 2023,
                title: 'Multi-objective optimized high-strength concrete mix design using a hybrid machine learning and metaheuristic algorithm',
                journal: 'Asian Journal of Civil Engineering',
                date: 'Springer, Vol. 24, No. 3, pp. 849--867, 2023',
                doi: '10.1007/s42107-022-00535-8',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Batra, Vandna; Pandya, KS; Panchal, VR.',
                year: 2023,
                title: 'Shear capacity prediction for FRCM-strengthened RC beams using Hybrid ReLU-Activated BPNN model',
                journal: 'Structures',
                date: 'Elsevier, Vol. 58, pp. 105432, 2023',
                doi: '10.1016/j.istruc.2023.105432',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Batra, Vandna; Pandya, KS; Panchal, VR.',
                year: 2023,
                title: 'Efficient compressive strength prediction of concrete incorporating recycled coarse aggregate using Newton’s boosted backpropagation neural network (NB-BPNN)',
                journal: 'Structures',
                date: 'Elsevier, Vol. 58, pp. 105559, 2023',
                doi: '10.1016/j.istruc.2023.105559',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Batra, Vandna; Pandya, KS; Panchal, VR.',
                year: 2023,
                title: 'Enhancing load capacity prediction of column using eReLU-activated BPNN model',
                journal: 'Structures',
                date: 'Elsevier, Vol. 58, pp. 105600, 2023',
                doi: '10.1016/j.istruc.2023.105600',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Panchal, VR; Pandya, KS.',
                year: 2022,
                title: 'An ensemble approach to improve BPNN model precision for predicting compressive strength of high-performance concrete',
                journal: 'Structures',
                date: 'Elsevier, Vol. 45, pp. 500--508, 2022',
                doi: '10.1016/j.istruc.2022.09.046',
            },
        ],
        'Conference Proceedings': [
            {
                authors: 'Tipu, Rupesh Kumar; Panchal, VR; Pandya, KS; Tipu, R.K.',
                year: 2022,
                title: 'Prediction of concrete properties using machine learning algorithm',
                conference: 'Journal of Physics: Conference Series',
                publisher: 'IOP Publishing',
                volume: 2273,
                number: 1,
                article: '012016',
                doi: '10.1088/1742-6596/2273/1/012016',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Panchal, VR; Pandya, KS.',
                year: 2023,
                title: 'Multi-objective optimization of the concrete mixture blended with mineral admixture using machine learning and NSGA-II algorithms',
                conference: 'Advanced Engineering Optimization Through Intelligent Techniques: Select Proceedings of AEOTIT 2022',
                publisher: 'Springer',
                volume: '',
                number: '',
                article: 'pp. 165--174',
                doi: '10.1007/978-981-19-9285-8_16',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Suman; Batra, Vandna.',
                year: 2023,
                title: 'ANN-Based Scalable Video Encoding Method for Crime Surveillance-Intelligence of Things Applications',
                conference: '2023 International Conference on Data Science and Network Security (ICDSNS)',
                publisher: 'IEEE',
                volume: '',
                number: '',
                article: '',
                doi: '',
            },
            {
                authors: 'Arora, Rishabh; Kumar, Kaushal; Dixit, Saurav; Tipu, Rupesh Kumar; Kaul, Padmini; Chauhan, Swati; Raju, Y Kamala; Nijhawan, Ginni; Haindavi, P.',
                year: 2023,
                title: 'Parametric investigation of coconut shells as partial replacement of coarse aggregates in sustainable concrete',
                conference: 'E3S Web of Conferences',
                publisher: 'EDP Sciences',
                volume: 430,
                number: '',
                article: '01180',
                doi: '10.1051/e3sconf/202343001180',
            },
            {
                authors: 'R. K. Tipu, O. A. Shah, S. Vats and S. Purohit.',
                year: 2024,
                title: 'Enhancing Concrete Properties Through the Integration of Recycled Coarse Aggregate: A Machine Learning Approach for Sustainable Construction',
                conference: '2024 4th International Conference on Innovative Practices in Technology and Management (ICIPTM)',
                publisher: '',
                volume: '',
                number: '',
                article: '',
                doi: '',
            },
            {
                authors: 'Tipu, Rupesh Kumar; Shah, Owais Ahmad; Vats, Satvik; Arora, Sujata.',
                year: 2024,
                title: 'Deep Learning Projections for High-Performance Concrete Strength Forecasting',
                conference: '2024 4th International Conference on Innovative Practices in Technology and Management (ICIPTM)',
                publisher: 'IEEE',
                volume: '',
                number: '',
                article: '',
                doi: '',
            },
        ],
        'Patents': [
            {
                authors: 'Rupesh Kumar Tipu',
                year: 2024,
                title: 'SMARTPREDICT: CONCRETE STRENGTH ESTIMATION VIA MACHINE LEARNING',
                country: 'India',
                patentNumber: '202411014830',
                date: '08-03-2024',
                status: 'Published',
                doi: '',
            },
            {
                authors: 'Rupesh Kumar Tipu',
                year: 2024,
                title: 'MACHINE LEARNING-BASED GUI FOR ESTIMATING THE STRENGTH OF RECYCLED AGGREGATE CONCRETE',
                country: 'India',
                patentNumber: '202411011153',
                date: '23-02-2024',
                status: 'Published',
                doi: '',
            },
            {
                authors: 'Rupesh Kumar Tipu',
                year: 2024,
                title: 'INNOVATIVE GUI-BASED APPROACH FOR PREDICTING FLOW AND COMPRESSIVE STRENGTH IN HIGH-PERFORMANCE CONCRETE',
                country: 'India',
                patentNumber: '202411007500',
                date: '16-02-2024',
                status: 'Published',
                doi: '',
            },
            {
                authors: 'Rupesh Kumar Tipu',
                year: 2024,
                title: 'INTELLIGENT PREDICTIVE SYSTEM AND USER INTERFACE FOR HIGH-PERFORMANCE CONCRETE COMPRESSIVE STRENGTH ASSESSMENT',
                country: 'India',
                patentNumber: '202411007359',
                date: '02-02-2024',
                status: 'Published',
                doi: '',
            },
            {
                authors: 'Rupesh Kumar Tipu',
                year: 2024,
                title: 'Machine Learning Enhanced Graphical Interface for Optimized Concrete Mix Design',
                country: 'India',
                patentNumber: '202411019684',
                date: '16-03-2024',
                status: 'Published',
                doi: '',
            },
            {
                authors: 'Rupesh Kumar Tipu',
                year: 2024,
                title: 'Real-Time Interactive Water Quality Prediction System Utilizing Ensemble Machine Learning and GUI Visualization',
                country: 'India',
                patentNumber: '202411057196',
                date: '28-07-2024',
                status: 'Published',
                doi: '',
            },
        ],
        // Add other categories like Book Chapters if applicable
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

                    {/* Journal Articles */}
                    <div className="publication-category">
                        <h4>Journal Articles</h4>
                        <ol>
                            {publications['Journal Articles'].map((pub, index) => (
                                <li key={`ja-${index}`}>
                                    {pub.authors}, {pub.year}. <strong>{pub.title}</strong>. <em>{pub.journal}</em>, {pub.date}.
                                    {pub.doi && (
                                        <>
                                            {' '}
                                            <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                                                DOI:{pub.doi}
                                            </a>
                                        </>
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
                                        <>
                                            {' '}
                                            <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                                                DOI:{pub.doi}
                                            </a>
                                        </>
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
                                        <>
                                            {' '}
                                            <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                                                DOI:{pub.doi}
                                            </a>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Add other publication categories like Book Chapters here */}
                </div>
            </div>
        </section>
    );
}

export default ResearchPublications;

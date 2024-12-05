import React, { useState, useEffect } from 'react';
import './FeedbackForm.css';
import AOS from 'aos';

function FeedbackForm() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Save feedback to local storage
        const existingFeedback = JSON.parse(localStorage.getItem('feedback')) || [];
        existingFeedback.push(feedback);
        localStorage.setItem('feedback', JSON.stringify(existingFeedback));
        setFeedback('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <section className="feedback-form" data-aos="fade-up">
            <div className="container">
                <h2>User Feedback</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
            <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                placeholder="Your feedback..."
            ></textarea>
                    </div>
                    <button type="submit">Submit Feedback</button>
                </form>
                {submitted && <p className="success-message">Thank you for your feedback!</p>}
            </div>
        </section>
    );
}

export default FeedbackForm;

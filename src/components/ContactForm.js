import React from 'react';
import './ContactForm.css';
import AOS from 'aos';

function ContactForm() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    return (
        <section id="contact" className="contact-form" data-aos="fade-up">
            <div className="container">
                <h2>Contact Me</h2>
                <form action="mailto:tipu0003@gmail.com" method="post" enctype="text/plain">
                    <div className="form-group">
                        <label>Name:</label>
                        <input type="text" name="name" required placeholder="Your Name" />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" name="email" required placeholder="your.email@example.com" />
                    </div>
                    <div className="form-group">
                        <label>Message:</label>
                        <textarea name="message" required placeholder="Your Message"></textarea>
                    </div>
                    <button type="submit">Send</button>
                </form>
            </div>
        </section>
    );
}

export default ContactForm;

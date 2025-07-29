import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">

      {/* Banner */}
      <div
        className="contact-banner"
        style={{ backgroundImage: `url('/images/banner.jpg')` }}
      >
        <div className="overlay">
          <h1>Contact Us</h1>
          <p>We’re here to help and answer any questions you might have.</p>
        </div>
      </div>

      {/* Contact Info */}
      <section className="contact-info">
        <h2>Contact Info    </h2>
        <p><strong>Address:</strong> 437 Karim Block, Allama Iqbal Town, Lahore</p>
        <p><strong>Phone:</strong> +92 300 4296150</p>
        <p><strong>Email:</strong> msameedch437@gmail.com</p>
      </section>

      {/* Contact Form */}
      <section className="contact-form">
        <h2>Leave Us a Message</h2>
        <form>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="5" required></textarea>
          <button type="submit">Send</button>
        </form>
      </section>

      {/* Google Map */}
      <section className="map-embed">
        <iframe
          title="Azhar Foundation Location"
          src="https://www.google.com/maps?q=437+Karim+Block,+Allama+Iqbal+Town,+Lahore&output=embed"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>

    </div>
  );
};

export default Contact;

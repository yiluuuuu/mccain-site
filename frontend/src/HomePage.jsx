import React from 'react';
import { Link } from 'react-router-dom';

const featuredSections = [
  {
    title: 'Our Business',
    subtitle: 'Famous for French fries and more!',
    description: 'Learn about our business & brand and how we create great food that brings people together around the world.',
    href: 'https://www.mccain.com/about-us/our-business-brands/',
  },
  {
    title: 'Careers',
    subtitle: 'Unlocking your potential',
    description: 'Discover exciting new career opportunities across foodservice, retail, and support functions.',
    href: 'https://www.mccain.com/careers/',
  },
  {
    title: 'Sustainability',
    subtitle: 'For the generations to come',
    description: 'See our progress and commitments as we build a more sustainable food future together.',
    href: 'https://www.mccain.com/sustainability/',
  },
  {
    title: 'Our Food',
    subtitle: 'Delicious that delivers',
    description: 'Explore our passion for food and the range of products we create for customers worldwide.',
    href: 'https://www.mccain.com/about-us/our-passion-for-food/',
  },
];

const newsItems = [
  {
    date: '12 June 2024',
    title: 'Cultivating Resilience: McCain Foods Expands Network of Innovation Hub Farms',
  },
  {
    date: '06 May 2024',
    title: 'McCain Foods Releases Farm of the Future Canada Year 3 Report',
  },
  {
    date: '28 April 2024',
    title: 'UNB’s McKenna Institute Announces Investment in Digital Agriculture',
  },
];

function HomePage() {
  return (
    <div className="mccain-shell">
      <header className="mccain-header">
        <div className="mccain-brand">
          <span className="mccain-logo">McCain</span>
          <span className="mccain-brand-name">McCain Foods</span>
        </div>

        <nav className="mccain-nav">
          <a href="#business">Our Business</a>
          <a href="#careers">Careers</a>
          <a href="#sustainability">Sustainability</a>
          <a href="#news">News</a>
          <a className="mccain-privacy" href="https://www.mccain.com/privacy/" target="_blank" rel="noreferrer">Privacy</a>
        </nav>
      </header>

      <main>
        <section className="mccain-hero" id="business">
          <div className="mccain-hero-copy">
            <span className="eyebrow">Our Business.</span>
            <h1>Famous for French fries and more!</h1>
            <p className="lead">Learn about our business & brand and how we create great food that brings people together around the world.</p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="https://www.mccain.com/about-us/our-business-brands/">Learn More</a>
              <a className="btn btn-secondary" href="https://www.mccain.com/careers/">Careers</a>
            </div>

            <div className="mccain-mini-cards">
              <article>
                <h3>Careers.</h3>
                <p>Unlocking your potential with meaningful roles across the business.</p>
              </article>
              <article>
                <h3>Hot Potato.</h3>
                <p>Check out our sustainability podcast for stories and inspiration.</p>
              </article>
            </div>
          </div>

          <div className="mccain-hero-media">
            <img src="https://picsum.photos/seed/mccain-hero/900/900" alt="McCain foods" />
          </div>
        </section>

        <section className="mccain-feature-grid" id="careers">
          {featuredSections.map((item) => (
            <article className="mccain-feature-card" key={item.title}>
              <span>{item.title}</span>
              <h2>{item.subtitle}</h2>
              <p>{item.description}</p>
              <a className="link-action" href={item.href} target="_blank" rel="noreferrer">Read more</a>
            </article>
          ))}
        </section>

        <section className="mccain-story" id="sustainability">
          <div>
            <h2>Celebrating real connections through delicious planet-friendly food.</h2>
            <p>We supply delicious frozen French fries, potato specialties, and appetizers while investing in the people and places that grow our business.</p>
            <a className="btn btn-primary" href="https://www.mccain.com/sustainability/">Learn More</a>
          </div>
          <img src="https://picsum.photos/seed/farm/900/540" alt="Farm produce" />
        </section>

        <section className="mccain-news" id="news">
          <div className="section-head">
            <span className="eyebrow">Information Centre</span>
            <h2>Latest News</h2>
          </div>

          <div className="news-grid">
            {newsItems.map((item) => (
              <article className="news-card" key={item.title}>
                <p className="news-date">{item.date}</p>
                <h3>{item.title}</h3>
                <a className="link-action" href="#">Read more</a>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="mccain-footer">
        <div className="mccain-footer-links">
          <a href="https://www.mccain.com/about-us/our-business-brands/" target="_blank" rel="noreferrer">For customers</a>
          <a href="https://www.mccain.com/careers/" target="_blank" rel="noreferrer">For candidates</a>
          <a href="https://www.mccain.com/information-centre/" target="_blank" rel="noreferrer">For journalists</a>
          <a href="https://www.mccain.com/about-us/farmers/" target="_blank" rel="noreferrer">For farmers</a>
          <a href="https://www.mccain.com/sustainability/" target="_blank" rel="noreferrer">For sustainability</a>
        </div>
        <div className="footer-copy">© McCain Foods Limited</div>
      </footer>
    </div>
  );
}

export default HomePage;

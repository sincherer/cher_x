import React from 'react';
import './profile.css';

const certifications = [
  {
    title: 'AI in UI/UX Design',
    issuer: 'UXcel',
    date: '11/1/2023',
    verifyUrl: 'https://app.uxcel.com/certificates/DE6BXL81SLBL'
  },
  {
    title: 'Service Design',
    issuer: 'Uxcel',
    date: '10/1/2023',
    verifyUrl: 'https://app.uxcel.com/certificates/9X6YRG5QKIWW'
  },
  {
    title: 'CSS for Designers',
    issuer: 'UXcel',
    date: '10/1/2023',
    verifyUrl: 'https://app.uxcel.com/certificates/JBV4Y1HS3GGU'
  },
  {
    title: 'Design Accessibility',
    issuer: 'UXcel',
    date: '9/1/2023',
    verifyUrl: 'https://app.uxcel.com/certificates/J2H1APW6OAWQ'
  },
  {
    title: 'Design Mentorship Mastery',
    issuer: 'UXcel',
    date: '9/1/2023',
    verifyUrl: 'https://app.uxcel.com/certificates/BRRRMSFZ9CRW'
  },
  {
    title: 'UX Writing',
    issuer: 'UXcel',
    date: '9/1/2023',
    verifyUrl: 'https://app.uxcel.com/certificates/H6KN2MVEECY4'
  },
  {
    title: 'Color Psychology',
    issuer: 'UXcel',
    date: '9/1/2023',
    verifyUrl: 'https://app.uxcel.com/certificates/CSL2Q6MDDTHI'
  },
  {
    title: 'UX Design Patterns',
    issuer: 'UXcel',
    date: '9/1/2023',
    verifyUrl: 'https://app.uxcel.com/certificates/Z3H0KAFWK2VO'
  },
  {
    title: 'UI Components I',
    issuer: 'UXcel',
    date: '9/1/2023',
    verifyUrl: 'https://app.uxcel.com/certificates/96C7CV04Z8EY'
  },
  {
    title: 'Full Stack Web Development with Angular',
    issuer: 'Cousera',
    date: '7/8/2022',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/specialization/certificate/U4L3QUL2PD7N'
  },
  {
    title: 'Google UX Design Specialization',
    issuer: 'Google',
    date: '7/1/2022',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/specialization/certificate/CJJRPFVZZT7N'
  }
];

const Certifications = () => {
  return (
    <div className="certifications-grid">
      {certifications.map((cert, index) => (
        <div key={index} className="certification-card">
          <div className="certification-title">{cert.title}</div>
          <div className="certification-issuer">{cert.issuer}</div>
          <div className="certification-date">{cert.date}</div>
          <a
            href={cert.verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="certification-link"
          >
            Verify Certificate
          </a>
        </div>
      ))}
    </div>
  );
};

export default Certifications;
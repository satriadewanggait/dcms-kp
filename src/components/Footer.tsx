import * as React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-white py-4" style={{ backgroundColor: '#28458B' }}>
      <div className="container mx-auto text-center">
        <p>Document Control Management System</p>
        <p>&copy; {new Date().getFullYear()} PT Pelayaran Nasional Indonesia.. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

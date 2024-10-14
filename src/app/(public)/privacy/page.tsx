import React from "react";

const PrivacyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p>Last updated: [Date]</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to [Your Company/App Name]&apos;s Privacy Policy. This policy
          describes how we collect, use, and protect your personal information.
        </p>

        <h2>2. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you
          create an account, use our services, or contact us for support.
        </p>

        <h2>3. How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve
          our services, as well as to communicate with you.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal information against unauthorized or unlawful
          processing, accidental loss, destruction, or damage.
        </p>

        <h2>5. Your Rights</h2>
        <p>
          Depending on your location, you may have certain rights regarding your
          personal information, such as the right to access, correct, or delete
          your data.
        </p>

        <h2>6. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify
          you of any changes by posting the new policy on this page.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy, please contact us
          at [your contact information].
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
